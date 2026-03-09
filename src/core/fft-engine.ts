// FFT Engine - Core implementation using WebGPU compute shaders
import type { FFTEngineConfig } from '../types';
import { GPUResourceManager } from './gpu-resource-manager';
import { FFTError, FFTErrorCode } from './errors';
import { isPowerOf2, log2 } from '../utils/bit-reversal';
import {
  BUTTERFLY_SHADER,
  BIT_REVERSAL_SHADER,
  SCALE_SHADER,
} from '../shaders/sources';

const DEFAULT_CONFIG: FFTEngineConfig = {
  enableBankConflictOptimization: true,
  workgroupSize: 256,
};

/**
 * Cached GPU resources for a specific FFT size, enabling buffer reuse
 * across repeated transforms of the same size.
 */
interface SizeCache {
  n: number;
  bufferSize: number;
  inputBuffer: GPUBuffer;
  outputBuffer: GPUBuffer;
  tempBuffer: GPUBuffer;
  bitReversalParamsBuffer: GPUBuffer;
  butterflyParamsBuffer: GPUBuffer;
  scaleParamsBuffer: GPUBuffer;
}

export class FFTEngine {
  private resourceManager: GPUResourceManager;
  private config: FFTEngineConfig;
  private butterflyPipeline!: GPUComputePipeline;
  private bitReversalPipeline!: GPUComputePipeline;
  private scalePipeline!: GPUComputePipeline;
  private initialized = false;
  private sizeCache: SizeCache | null = null;

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
    // Use GPUResourceManager's pipeline cache instead of creating directly
    this.butterflyPipeline = this.resourceManager.createComputePipeline(
      BUTTERFLY_SHADER, 'butterfly_stage'
    );
    this.bitReversalPipeline = this.resourceManager.createComputePipeline(
      BIT_REVERSAL_SHADER, 'bit_reversal_permutation'
    );
    this.scalePipeline = this.resourceManager.createComputePipeline(
      SCALE_SHADER, 'scale'
    );
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

  /**
   * Get or create cached GPU buffers for a given FFT size.
   * Reuses buffers across repeated same-size transforms.
   */
  private getBuffersForSize(n: number): SizeCache {
    const bufferSize = n * 2 * 4; // n complex numbers × 2 floats × 4 bytes

    if (this.sizeCache && this.sizeCache.n === n) {
      return this.sizeCache;
    }

    // Release previous cache
    this.releaseSizeCache();

    const device = this.resourceManager.device;
    const storageFlags = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;

    this.sizeCache = {
      n,
      bufferSize,
      inputBuffer: device.createBuffer({ size: bufferSize, usage: storageFlags }),
      outputBuffer: device.createBuffer({ size: bufferSize, usage: storageFlags }),
      tempBuffer: device.createBuffer({ size: bufferSize, usage: storageFlags }),
      bitReversalParamsBuffer: device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      butterflyParamsBuffer: device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
      scaleParamsBuffer: device.createBuffer({
        size: 8,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
    };

    return this.sizeCache;
  }

  private releaseSizeCache(): void {
    if (!this.sizeCache) return;
    this.sizeCache.inputBuffer.destroy();
    this.sizeCache.outputBuffer.destroy();
    this.sizeCache.tempBuffer.destroy();
    this.sizeCache.bitReversalParamsBuffer.destroy();
    this.sizeCache.butterflyParamsBuffer.destroy();
    this.sizeCache.scaleParamsBuffer.destroy();
    this.sizeCache = null;
  }

  async fft(input: Float32Array): Promise<Float32Array> {
    return this.transform(input, false);
  }

  async ifft(input: Float32Array): Promise<Float32Array> {
    return this.transform(input, true);
  }

  private async transform(input: Float32Array, inverse: boolean): Promise<Float32Array> {
    const n = this.validateInput(input);
    const numStages = log2(n);
    const device = this.resourceManager.device;
    const cache = this.getBuffersForSize(n);
    const workgroups = Math.ceil(n / this.config.workgroupSize);

    // Upload input data
    device.queue.writeBuffer(cache.inputBuffer, 0, input as unknown as ArrayBuffer);

    // --- Batch all GPU work into a single command encoder ---
    const commandEncoder = device.createCommandEncoder();

    // Step 1: Bit-reversal permutation
    const bitReversalParams = new Uint32Array([n, numStages]);
    device.queue.writeBuffer(cache.bitReversalParamsBuffer, 0, bitReversalParams as unknown as ArrayBuffer);

    const bitReversalBindGroup = device.createBindGroup({
      layout: this.bitReversalPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: cache.bitReversalParamsBuffer } },
        { binding: 1, resource: { buffer: cache.inputBuffer } },
        { binding: 2, resource: { buffer: cache.tempBuffer } },
      ],
    });

    let pass = commandEncoder.beginComputePass();
    pass.setPipeline(this.bitReversalPipeline);
    pass.setBindGroup(0, bitReversalBindGroup);
    pass.dispatchWorkgroups(workgroups);
    pass.end();

    // Step 2: Butterfly stages — all stages in one command encoder
    // We need separate uniform buffers per stage since they're all in one submission.
    const stageParamBuffers: GPUBuffer[] = [];
    let currentInput = cache.tempBuffer;
    let currentOutput = cache.outputBuffer;

    for (let stage = 0; stage < numStages; stage++) {
      const stageParamBuffer = device.createBuffer({
        size: 16,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const butterflyParams = new Uint32Array([
        n,
        stage,
        inverse ? 1 : 0,
        this.config.enableBankConflictOptimization ? 1 : 0,
      ]);
      device.queue.writeBuffer(stageParamBuffer, 0, butterflyParams as unknown as ArrayBuffer);
      stageParamBuffers.push(stageParamBuffer);

      const bindGroup = device.createBindGroup({
        layout: this.butterflyPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: stageParamBuffer } },
          { binding: 1, resource: { buffer: currentInput } },
          { binding: 2, resource: { buffer: currentOutput } },
        ],
      });

      pass = commandEncoder.beginComputePass();
      pass.setPipeline(this.butterflyPipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroups);
      pass.end();

      // Swap buffers for next stage
      [currentInput, currentOutput] = [currentOutput, currentInput];
    }

    // The result is now in currentInput (after the last swap)
    const resultBuffer = currentInput;

    // Step 3: Scale by 1/N for IFFT
    if (inverse) {
      const scaleParams = new ArrayBuffer(8);
      new Uint32Array(scaleParams, 0, 1)[0] = n;
      new Float32Array(scaleParams, 4, 1)[0] = 1 / n;
      device.queue.writeBuffer(cache.scaleParamsBuffer, 0, new Uint8Array(scaleParams) as unknown as ArrayBuffer);

      const scaleBindGroup = device.createBindGroup({
        layout: this.scalePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: cache.scaleParamsBuffer } },
          { binding: 1, resource: { buffer: resultBuffer } },
        ],
      });

      pass = commandEncoder.beginComputePass();
      pass.setPipeline(this.scalePipeline);
      pass.setBindGroup(0, scaleBindGroup);
      pass.dispatchWorkgroups(workgroups);
      pass.end();
    }

    // Submit all GPU work at once
    device.queue.submit([commandEncoder.finish()]);

    // Read back result
    const result = await this.resourceManager.downloadData(resultBuffer, cache.bufferSize);

    // Cleanup per-stage param buffers (cached buffers are retained)
    for (const buf of stageParamBuffers) {
      buf.destroy();
    }

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
    this.releaseSizeCache();
    this.initialized = false;
  }
}

export async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const resourceManager = await GPUResourceManager.create();
  return FFTEngine.create(resourceManager, fullConfig);
}
