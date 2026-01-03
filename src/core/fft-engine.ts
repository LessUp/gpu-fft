// FFT Engine - Core implementation using WebGPU compute shaders
import type { FFTEngineConfig } from '../types';
import { GPUResourceManager } from './gpu-resource-manager';
import { FFTError, FFTErrorCode } from './errors';
import { bitReversalPermutation } from '../utils/bit-reversal';
import { isPowerOf2, log2 } from '../utils/bit-reversal';

// Shader source code (embedded)
const BUTTERFLY_SHADER = `
const PI: f32 = 3.14159265358979323846;
const BANK_WIDTH: u32 = 32u;

fn complex_add(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x + b.x, a.y + b.y);
}

fn complex_sub(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(a.x - b.x, a.y - b.y);
}

fn complex_mul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
    return vec2<f32>(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

fn twiddle_factor(k: u32, N: u32, inverse: bool) -> vec2<f32> {
    var angle: f32;
    if (inverse) {
        angle = 2.0 * PI * f32(k) / f32(N);
    } else {
        angle = -2.0 * PI * f32(k) / f32(N);
    }
    return vec2<f32>(cos(angle), sin(angle));
}

struct ButterflyParams {
    n: u32,
    stage: u32,
    inverse: u32,
    enable_padding: u32,
}

@group(0) @binding(0) var<uniform> params: ButterflyParams;
@group(0) @binding(1) var<storage, read> input: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> output: array<vec2<f32>>;

@compute @workgroup_size(256)
fn butterfly_stage(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let tid = global_id.x;
    
    if (tid >= params.n) {
        return;
    }
    
    let stage = params.stage;
    let inverse = params.inverse != 0u;
    
    let span = 1u << stage;
    let butterfly_size = span << 1u;
    
    let pos_in_butterfly = tid % butterfly_size;
    let is_top = pos_in_butterfly < span;
    
    var partner_idx: u32;
    if (is_top) {
        partner_idx = tid + span;
    } else {
        partner_idx = tid - span;
    }
    
    let my_val = input[tid];
    let partner_val = input[partner_idx];
    
    let twiddle_idx = pos_in_butterfly % span;
    let twiddle = twiddle_factor(twiddle_idx, butterfly_size, inverse);
    
    var result: vec2<f32>;
    if (is_top) {
        let wb = complex_mul(twiddle, partner_val);
        result = complex_add(my_val, wb);
    } else {
        let wb = complex_mul(twiddle, my_val);
        result = complex_sub(partner_val, wb);
    }
    
    output[tid] = result;
}
`;

const BIT_REVERSAL_SHADER = `
fn bit_reverse(x: u32, bits: u32) -> u32 {
    var result: u32 = 0u;
    var val: u32 = x;
    for (var i: u32 = 0u; i < bits; i = i + 1u) {
        result = (result << 1u) | (val & 1u);
        val = val >> 1u;
    }
    return result;
}

struct BitReversalParams {
    n: u32,
    bits: u32,
}

@group(0) @binding(0) var<uniform> params: BitReversalParams;
@group(0) @binding(1) var<storage, read> input: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> output: array<vec2<f32>>;

@compute @workgroup_size(256)
fn bit_reversal_permutation(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let i = global_id.x;
    if (i >= params.n) {
        return;
    }
    let j = bit_reverse(i, params.bits);
    output[j] = input[i];
}
`;

const SCALE_SHADER = `
struct ScaleParams {
    n: u32,
    scale: f32,
}

@group(0) @binding(0) var<uniform> params: ScaleParams;
@group(0) @binding(1) var<storage, read_write> data: array<vec2<f32>>;

@compute @workgroup_size(256)
fn scale(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let i = global_id.x;
    if (i >= params.n) {
        return;
    }
    data[i] = data[i] * params.scale;
}
`;

const DEFAULT_CONFIG: FFTEngineConfig = {
  enableBankConflictOptimization: true,
  workgroupSize: 256
};

export class FFTEngine {
  private resourceManager: GPUResourceManager;
  private config: FFTEngineConfig;
  private butterflyPipeline!: GPUComputePipeline;
  private bitReversalPipeline!: GPUComputePipeline;
  private scalePipeline!: GPUComputePipeline;
  private initialized = false;

  private constructor(resourceManager: GPUResourceManager, config: FFTEngineConfig) {
    this.resourceManager = resourceManager;
    this.config = config;
  }

  static async create(resourceManager: GPUResourceManager, config: FFTEngineConfig): Promise<FFTEngine> {
    const engine = new FFTEngine(resourceManager, config);
    await engine.initialize();
    return engine;
  }

  private async initialize(): Promise<void> {
    const device = this.resourceManager.device;

    // Create butterfly pipeline
    const butterflyModule = device.createShaderModule({ code: BUTTERFLY_SHADER });
    this.butterflyPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: butterflyModule, entryPoint: 'butterfly_stage' }
    });

    // Create bit-reversal pipeline
    const bitReversalModule = device.createShaderModule({ code: BIT_REVERSAL_SHADER });
    this.bitReversalPipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: bitReversalModule, entryPoint: 'bit_reversal_permutation' }
    });

    // Create scale pipeline
    const scaleModule = device.createShaderModule({ code: SCALE_SHADER });
    this.scalePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: scaleModule, entryPoint: 'scale' }
    });

    this.initialized = true;
  }

  private validateInput(input: Float32Array): number {
    const n = input.length / 2;
    if (!isPowerOf2(n)) {
      throw new FFTError(
        `Input size must be a power of 2, got ${n}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    if (n < 2) {
      throw new FFTError(
        `Input size must be at least 2, got ${n}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    if (n > 65536) {
      throw new FFTError(
        `Input size exceeds maximum of 65536, got ${n}`,
        FFTErrorCode.INPUT_TOO_LARGE
      );
    }
    return n;
  }

  async fft(input: Float32Array): Promise<Float32Array> {
    return this.transform(input, false);
  }

  async ifft(input: Float32Array): Promise<Float32Array> {
    return this.transform(input, true);
  }

  private async transform(input: Float32Array, inverse: boolean): Promise<Float32Array> {
    const n = this.validateInput(input);
    const device = this.resourceManager.device;
    const bufferSize = input.byteLength;
    const numStages = log2(n);

    // Create buffers
    const inputBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });
    const outputBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
    });
    const tempBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
    });

    // Upload input data
    device.queue.writeBuffer(inputBuffer, 0, input);

    // Step 1: Bit-reversal permutation
    const bitReversalParams = new Uint32Array([n, numStages]);
    const bitReversalParamsBuffer = device.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    device.queue.writeBuffer(bitReversalParamsBuffer, 0, bitReversalParams);

    const bitReversalBindGroup = device.createBindGroup({
      layout: this.bitReversalPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: bitReversalParamsBuffer } },
        { binding: 1, resource: { buffer: inputBuffer } },
        { binding: 2, resource: { buffer: tempBuffer } }
      ]
    });

    let commandEncoder = device.createCommandEncoder();
    let passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(this.bitReversalPipeline);
    passEncoder.setBindGroup(0, bitReversalBindGroup);
    passEncoder.dispatchWorkgroups(Math.ceil(n / this.config.workgroupSize));
    passEncoder.end();
    device.queue.submit([commandEncoder.finish()]);

    // Step 2: Butterfly stages
    const butterflyParamsBuffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    let currentInput = tempBuffer;
    let currentOutput = outputBuffer;

    for (let stage = 0; stage < numStages; stage++) {
      const butterflyParams = new Uint32Array([
        n,
        stage,
        inverse ? 1 : 0,
        this.config.enableBankConflictOptimization ? 1 : 0
      ]);
      device.queue.writeBuffer(butterflyParamsBuffer, 0, butterflyParams);

      const bindGroup = device.createBindGroup({
        layout: this.butterflyPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: butterflyParamsBuffer } },
          { binding: 1, resource: { buffer: currentInput } },
          { binding: 2, resource: { buffer: currentOutput } }
        ]
      });

      commandEncoder = device.createCommandEncoder();
      passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(this.butterflyPipeline);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.dispatchWorkgroups(Math.ceil(n / this.config.workgroupSize));
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);

      // Swap buffers for next stage
      [currentInput, currentOutput] = [currentOutput, currentInput];
    }

    // The result is now in currentInput (after the last swap)
    const resultBuffer = currentInput;

    // Step 3: Scale by 1/N for IFFT
    if (inverse) {
      const scaleParamsBuffer = device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
      const scaleParams = new ArrayBuffer(8);
      new Uint32Array(scaleParams, 0, 1)[0] = n;
      new Float32Array(scaleParams, 4, 1)[0] = 1 / n;
      device.queue.writeBuffer(scaleParamsBuffer, 0, new Uint8Array(scaleParams));

      const scaleBindGroup = device.createBindGroup({
        layout: this.scalePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: scaleParamsBuffer } },
          { binding: 1, resource: { buffer: resultBuffer } }
        ]
      });

      commandEncoder = device.createCommandEncoder();
      passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(this.scalePipeline);
      passEncoder.setBindGroup(0, scaleBindGroup);
      passEncoder.dispatchWorkgroups(Math.ceil(n / this.config.workgroupSize));
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);

      scaleParamsBuffer.destroy();
    }

    // Read back result
    const result = await this.resourceManager.downloadData(resultBuffer, bufferSize);

    // Cleanup
    inputBuffer.destroy();
    outputBuffer.destroy();
    tempBuffer.destroy();
    bitReversalParamsBuffer.destroy();
    butterflyParamsBuffer.destroy();

    return result;
  }

  async fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    return this.transform2d(input, width, height, false);
  }

  async ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    return this.transform2d(input, width, height, true);
  }

  private async transform2d(input: Float32Array, width: number, height: number, inverse: boolean): Promise<Float32Array> {
    if (!isPowerOf2(width) || !isPowerOf2(height)) {
      throw new FFTError(
        `2D FFT dimensions must be powers of 2, got ${width}x${height}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }

    const expectedLength = width * height * 2;
    if (input.length !== expectedLength) {
      throw new FFTError(
        `Input length ${input.length} does not match expected ${expectedLength} for ${width}x${height}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }

    // Step 1: FFT on rows
    let data = new Float32Array(input);
    for (let row = 0; row < height; row++) {
      const rowStart = row * width * 2;
      const rowData = data.slice(rowStart, rowStart + width * 2);
      const rowResult = inverse ? await this.ifft(rowData) : await this.fft(rowData);
      data.set(rowResult, rowStart);
    }

    // Step 2: Transpose
    const transposed = new Float32Array(data.length);
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const srcIdx = (row * width + col) * 2;
        const dstIdx = (col * height + row) * 2;
        transposed[dstIdx] = data[srcIdx];
        transposed[dstIdx + 1] = data[srcIdx + 1];
      }
    }

    // Step 3: FFT on columns (now rows after transpose)
    for (let col = 0; col < width; col++) {
      const colStart = col * height * 2;
      const colData = transposed.slice(colStart, colStart + height * 2);
      const colResult = inverse ? await this.ifft(colData) : await this.fft(colData);
      transposed.set(colResult, colStart);
    }

    // Step 4: Transpose back
    const result = new Float32Array(data.length);
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const srcIdx = (col * height + row) * 2;
        const dstIdx = (row * width + col) * 2;
        result[dstIdx] = transposed[srcIdx];
        result[dstIdx + 1] = transposed[srcIdx + 1];
      }
    }

    return result;
  }

  dispose(): void {
    // Pipelines are managed by the device
    this.initialized = false;
  }
}

export async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const resourceManager = await GPUResourceManager.create();
  return FFTEngine.create(resourceManager, fullConfig);
}
