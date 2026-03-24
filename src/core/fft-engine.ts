// FFT Engine - Core implementation using WebGPU compute shaders
import type { FFTEngineConfig } from '../types';
import { GPUResourceManager } from './gpu-resource-manager';
import { FFTError, FFTErrorCode } from './errors';
import { log2 } from '../utils/bit-reversal';
import { validateFFT2DInput, validateFFTInput } from '../utils/cpu-fft';
import { BUTTERFLY_SHADER, BIT_REVERSAL_SHADER, SCALE_SHADER } from '../shaders/sources';

const SUPPORTED_WORKGROUP_SIZE = 256;
const MAX_GPU_FFT_SIZE = 65536;
const BUTTERFLY_ENABLE_PADDING = 0;
const BIT_REVERSAL_PARAM_BUFFER_SIZE = 8;
const BUTTERFLY_PARAM_BUFFER_SIZE = 16;
const SCALE_PARAM_BUFFER_SIZE = 8;

const DEFAULT_CONFIG: FFTEngineConfig = {
  enableBankConflictOptimization: true,
  workgroupSize: SUPPORTED_WORKGROUP_SIZE,
};

interface SizeCache {
  n: number;
  bufferSize: number;
  inputBuffer: GPUBuffer;
  outputBuffer: GPUBuffer;
  tempBuffer: GPUBuffer;
  bitReversalParamsBuffer: GPUBuffer;
  stageParamBuffers: GPUBuffer[];
  scaleParamsBuffer: GPUBuffer;
}

function validateGPUFFTInput(input: Float32Array): number {
  const n = validateFFTInput(input);
  if (n > MAX_GPU_FFT_SIZE) {
    throw new FFTError(
      `Input size exceeds maximum of ${MAX_GPU_FFT_SIZE}, got ${n}`,
      FFTErrorCode.INPUT_TOO_LARGE
    );
  }
  return n;
}

function validateGPUWorkgroupSize(workgroupSize: number): void {
  if (workgroupSize !== SUPPORTED_WORKGROUP_SIZE) {
    throw new FFTError(
      `Only workgroupSize=${SUPPORTED_WORKGROUP_SIZE} is currently supported, got ${workgroupSize}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
}

function createBitReversalParams(n: number, numStages: number): Uint32Array {
  return new Uint32Array([n, numStages]);
}

function createButterflyParams(n: number, stage: number, inverse: boolean): Uint32Array {
  return new Uint32Array([n, stage, inverse ? 1 : 0, BUTTERFLY_ENABLE_PADDING]);
}

function createScaleParams(n: number): Uint8Array {
  const scaleParams = new ArrayBuffer(SCALE_PARAM_BUFFER_SIZE);
  new Uint32Array(scaleParams, 0, 1)[0] = n;
  new Float32Array(scaleParams, 4, 1)[0] = 1 / n;
  return new Uint8Array(scaleParams);
}

function transposeComplexMatrix(input: Float32Array, width: number, height: number): Float32Array {
  const result = new Float32Array(input.length);

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcIdx = (row * width + col) * 2;
      const dstIdx = (col * height + row) * 2;
      result[dstIdx] = input[srcIdx];
      result[dstIdx + 1] = input[srcIdx + 1];
    }
  }

  return result;
}

export class FFTEngine {
  private resourceManager: GPUResourceManager;
  private config: FFTEngineConfig;
  private butterflyPipeline!: GPUComputePipeline;
  private bitReversalPipeline!: GPUComputePipeline;
  private scalePipeline!: GPUComputePipeline;
  private initialized = false;
  private disposed = false;
  private readonly ownsResourceManager: boolean;
  private sizeCache: SizeCache | null = null;

  private constructor(
    resourceManager: GPUResourceManager,
    config: FFTEngineConfig,
    ownsResourceManager: boolean
  ) {
    this.resourceManager = resourceManager;
    this.config = config;
    this.ownsResourceManager = ownsResourceManager;
  }

  static async create(
    resourceManager: GPUResourceManager,
    config: FFTEngineConfig,
    ownsResourceManager = false
  ): Promise<FFTEngine> {
    const engine = new FFTEngine(resourceManager, config, ownsResourceManager);
    await engine.initialize();
    return engine;
  }

  private validateConfig(): void {
    validateGPUWorkgroupSize(this.config.workgroupSize);
  }

  private assertUsable(): void {
    if (this.disposed) {
      throw new FFTError('FFT engine has been disposed', FFTErrorCode.ENGINE_DISPOSED);
    }

    if (!this.initialized) {
      throw new FFTError('FFT engine has not been initialized', FFTErrorCode.TRANSFORM_FAILED);
    }
  }

  private async initialize(): Promise<void> {
    this.validateConfig();

    this.butterflyPipeline = this.resourceManager.createComputePipeline(
      BUTTERFLY_SHADER,
      'butterfly_stage'
    );
    this.bitReversalPipeline = this.resourceManager.createComputePipeline(
      BIT_REVERSAL_SHADER,
      'bit_reversal_permutation'
    );
    this.scalePipeline = this.resourceManager.createComputePipeline(SCALE_SHADER, 'scale');
    this.initialized = true;
  }

  private getBuffersForSize(n: number): SizeCache {
    const bufferSize = n * 2 * 4;

    if (this.sizeCache && this.sizeCache.n === n) {
      return this.sizeCache;
    }

    this.releaseSizeCache();

    const storageFlags = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    const numStages = log2(n);

    this.sizeCache = {
      n,
      bufferSize,
      inputBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      outputBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      tempBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      bitReversalParamsBuffer: this.resourceManager.createBuffer(
        BIT_REVERSAL_PARAM_BUFFER_SIZE,
        GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      ),
      stageParamBuffers: Array.from({ length: numStages }, () =>
        this.resourceManager.createBuffer(
          BUTTERFLY_PARAM_BUFFER_SIZE,
          GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        )
      ),
      scaleParamsBuffer: this.resourceManager.createBuffer(
        SCALE_PARAM_BUFFER_SIZE,
        GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      ),
    };

    return this.sizeCache;
  }

  private releaseSizeCache(): void {
    if (!this.sizeCache) {
      return;
    }

    this.resourceManager.releaseBuffer(this.sizeCache.inputBuffer);
    this.resourceManager.releaseBuffer(this.sizeCache.outputBuffer);
    this.resourceManager.releaseBuffer(this.sizeCache.tempBuffer);
    this.resourceManager.releaseBuffer(this.sizeCache.bitReversalParamsBuffer);
    for (const buffer of this.sizeCache.stageParamBuffers) {
      this.resourceManager.releaseBuffer(buffer);
    }
    this.resourceManager.releaseBuffer(this.sizeCache.scaleParamsBuffer);
    this.sizeCache = null;
  }

  async fft(input: Float32Array): Promise<Float32Array> {
    this.assertUsable();
    return this.transform(input, false);
  }

  async ifft(input: Float32Array): Promise<Float32Array> {
    this.assertUsable();
    return this.transform(input, true);
  }

  private async transform(input: Float32Array, inverse: boolean): Promise<Float32Array> {
    this.assertUsable();

    const n = validateGPUFFTInput(input);
    const numStages = log2(n);
    const device = this.resourceManager.device;
    const cache = this.getBuffersForSize(n);
    const workgroups = Math.ceil(n / this.config.workgroupSize);

    this.resourceManager.uploadData(cache.inputBuffer, input);
    this.resourceManager.uploadData(
      cache.bitReversalParamsBuffer,
      createBitReversalParams(n, numStages)
    );

    const commandEncoder = device.createCommandEncoder();

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

    let currentInput = cache.tempBuffer;
    let currentOutput = cache.outputBuffer;

    for (let stage = 0; stage < numStages; stage++) {
      this.resourceManager.uploadData(
        cache.stageParamBuffers[stage],
        createButterflyParams(n, stage, inverse)
      );

      const bindGroup = device.createBindGroup({
        layout: this.butterflyPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: cache.stageParamBuffers[stage] } },
          { binding: 1, resource: { buffer: currentInput } },
          { binding: 2, resource: { buffer: currentOutput } },
        ],
      });

      pass = commandEncoder.beginComputePass();
      pass.setPipeline(this.butterflyPipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroups);
      pass.end();

      [currentInput, currentOutput] = [currentOutput, currentInput];
    }

    const resultBuffer = currentInput;

    if (inverse) {
      this.resourceManager.uploadData(cache.scaleParamsBuffer, createScaleParams(n));

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

    device.queue.submit([commandEncoder.finish()]);

    return this.resourceManager.downloadData(resultBuffer, cache.bufferSize);
  }

  async fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    this.assertUsable();
    return this.transform2d(input, width, height, false);
  }

  async ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    this.assertUsable();
    return this.transform2d(input, width, height, true);
  }

  private async transform2d(
    input: Float32Array,
    width: number,
    height: number,
    inverse: boolean
  ): Promise<Float32Array> {
    this.assertUsable();
    validateFFT2DInput(input, width, height);

    const data = new Float32Array(input);
    for (let row = 0; row < height; row++) {
      const rowStart = row * width * 2;
      const rowData = data.slice(rowStart, rowStart + width * 2);
      const rowResult = inverse ? await this.ifft(rowData) : await this.fft(rowData);
      data.set(rowResult, rowStart);
    }

    const transposed = transposeComplexMatrix(data, width, height);
    for (let col = 0; col < width; col++) {
      const colStart = col * height * 2;
      const colData = transposed.slice(colStart, colStart + height * 2);
      const colResult = inverse ? await this.ifft(colData) : await this.fft(colData);
      transposed.set(colResult, colStart);
    }

    return transposeComplexMatrix(transposed, height, width);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.releaseSizeCache();

    if (this.ownsResourceManager) {
      this.resourceManager.dispose();
    }

    this.initialized = false;
    this.disposed = true;
  }
}

export async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const resourceManager = await GPUResourceManager.create();
  return FFTEngine.create(resourceManager, fullConfig, true);
}
