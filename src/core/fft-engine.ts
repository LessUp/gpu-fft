/**
 * FFT Engine - Core implementation using WebGPU compute shaders
 * @module webgpu-fft/fft-engine
 *
 * FFTEngine 专注于 FFT 算法编排，GPU 资源管理委托给 FFTComputeContext。
 * 这种分离使得测试可以注入 mock context，无需真实 GPU 环境。
 */

import type { FFTEngineConfig } from '../types';
import type { RealFFTBackend } from './backend';
import type { FFTComputeContext } from './compute-context';
import { FFTError, FFTErrorCode } from './errors';
import { log2 } from '../utils/math';
import { createRealFFTBackend } from './real-fft-backend';
import { validateGPUFFT, validateGPUFFT2D } from './validation';
import { GPUFFTBackend } from './gpu-fft-backend';
import { GPUComputeContext } from './gpu-compute-context';
import { GPUResourceManager } from './gpu-resource-manager';

const SUPPORTED_WORKGROUP_SIZE = 256;

const DEFAULT_CONFIG: FFTEngineConfig = {
  enableBankConflictOptimization: false,
  workgroupSize: SUPPORTED_WORKGROUP_SIZE,
};

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

function createButterflyParams(
  n: number,
  stage: number,
  inverse: boolean,
  enablePadding: boolean
): Uint32Array {
  return new Uint32Array([n, stage, inverse ? 1 : 0, enablePadding ? 1 : 0]);
}

function createScaleParams(n: number): Uint8Array {
  const scaleParams = new ArrayBuffer(8);
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

/**
 * FFT Engine
 *
 * 使用 FFTComputeContext 执行 GPU 计算。
 * 可通过构造函数注入自定义 context（用于测试）。
 */
export class FFTEngine {
  private context: FFTComputeContext;
  private config: FFTEngineConfig;
  private initialized = false;
  private disposed = false;
  private readonly ownsContext: boolean;

  private constructor(context: FFTComputeContext, config: FFTEngineConfig, ownsContext: boolean) {
    this.context = context;
    this.config = config;
    this.ownsContext = ownsContext;
  }

  /**
   * 从已有的 FFTComputeContext 创建 FFTEngine
   *
   * @param context - 计算上下文
   * @param config - 配置
   * @param ownsContext - 是否在 dispose 时释放 context
   */
  static fromContext(
    context: FFTComputeContext,
    config: FFTEngineConfig,
    ownsContext = false
  ): FFTEngine {
    const engine = new FFTEngine(context, config, ownsContext);
    engine.initialized = true;
    return engine;
  }

  /**
   * 从 GPUResourceManager 创建 FFTEngine（向后兼容）
   *
   * @deprecated 使用 `createStandaloneFFTEngine()` 或 `FFTEngine.fromContext()` 代替
   * @param resourceManager - GPU 资源管理器
   * @param config - 配置
   * @param ownsResourceManager - 是否在 dispose 时释放 manager
   */
  static async create(
    resourceManager: GPUResourceManager,
    config: FFTEngineConfig,
    ownsResourceManager = false
  ): Promise<FFTEngine> {
    validateGPUWorkgroupSize(config.workgroupSize);
    const context = await GPUComputeContext.create(resourceManager);
    return FFTEngine.fromContext(context, config, ownsResourceManager);
  }

  private assertUsable(): void {
    if (this.disposed) {
      throw new FFTError('FFT engine has been disposed', FFTErrorCode.ENGINE_DISPOSED);
    }

    if (!this.initialized) {
      throw new FFTError('FFT engine has not been initialized', FFTErrorCode.TRANSFORM_FAILED);
    }
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

    const n = validateGPUFFT(input);
    const numStages = log2(n);
    const cache = this.context.getBuffers(n);
    const workgroups = Math.ceil(n / this.config.workgroupSize);

    // 上传输入数据
    this.context.uploadData(cache.inputBuffer, input);
    this.context.uploadData(cache.bitReversalParamsBuffer, createBitReversalParams(n, numStages));

    // Bit-reversal
    this.context.executeBitReversal(
      cache.inputBuffer,
      cache.tempBuffer,
      cache.bitReversalParamsBuffer,
      workgroups
    );

    let currentInput = cache.tempBuffer;
    let currentOutput = cache.outputBuffer;

    // Butterfly stages
    for (let stage = 0; stage < numStages; stage++) {
      this.context.uploadData(
        cache.stageParamBuffers[stage],
        createButterflyParams(n, stage, inverse, this.config.enableBankConflictOptimization)
      );

      this.context.executeButterfly(
        currentInput,
        currentOutput,
        cache.stageParamBuffers[stage],
        workgroups
      );

      [currentInput, currentOutput] = [currentOutput, currentInput];
    }

    const resultBuffer = currentInput;

    // IFFT scaling
    if (inverse) {
      this.context.uploadData(cache.scaleParamsBuffer, createScaleParams(n));
      this.context.executeScale(resultBuffer, cache.scaleParamsBuffer, workgroups);
    }

    // 提交并读取结果
    this.context.submit();
    return this.context.downloadData(resultBuffer, cache.bufferSize);
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
    validateGPUFFT2D(input, width, height);

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

    if (this.ownsContext) {
      this.context.dispose();
    }

    this.initialized = false;
    this.disposed = true;
  }
}

/**
 * 创建独立的 FFT 引擎（管理自己的 GPU 资源）
 *
 * @param config - 配置
 * @returns FFTEngine 实例
 */
export async function createStandaloneFFTEngine(config: FFTEngineConfig): Promise<FFTEngine> {
  validateGPUWorkgroupSize(config.workgroupSize);
  const resourceManager = await GPUResourceManager.create();
  return FFTEngine.create(resourceManager, config, true);
}

/**
 * 创建 FFT 引擎
 *
 * 返回 RealFFTBackend，提供完整的 FFT 功能（包括实输入 FFT）。
 *
 * @param config - 可选配置
 * @returns RealFFTBackend 实例
 */
export async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<RealFFTBackend> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const engine = await createStandaloneFFTEngine(fullConfig);
  const gpuBackend = GPUFFTBackend.fromEngine(engine, true);
  return createRealFFTBackend(gpuBackend);
}
