/**
 * GPU FFT Backend 适配器
 * @module webgpu-fft/gpu-fft-backend
 *
 * 将 FFTEngine 包装为 FFTBackend 接口，
 * 用于与 RealFFTBackend 组合。
 */

import type { FFTBackend } from './backend';
import { FFTEngine } from './fft-engine';

/**
 * GPU FFT Backend
 *
 * 包装 FFTEngine，提供标准 FFTBackend 接口。
 * 这是 GPU 计算能力与 FFT 抽象之间的适配层。
 *
 * @example
 * ```typescript
 * // 通过 createFFTEngine 间接创建
 * const backend = await createFFTEngine();
 * const spectrum = await backend.fft(input);
 * backend.dispose?.();
 *
 * // 或手动包装已创建的 FFTEngine
 * const engine = await createStandaloneFFTEngine(config);
 * const gpuBackend = GPUFFTBackend.fromEngine(engine, true);
 * ```
 */
export class GPUFFTBackend implements FFTBackend {
  private engine: FFTEngine;
  private ownsEngine: boolean;

  private constructor(engine: FFTEngine, ownsEngine: boolean) {
    this.engine = engine;
    this.ownsEngine = ownsEngine;
  }

  /**
   * 创建 GPUFFTBackend 实例
   *
   * @param engine - 已初始化的 FFTEngine
   * @param ownsEngine - 是否在 dispose 时释放 engine（默认 false）
   */
  static fromEngine(engine: FFTEngine, ownsEngine = false): GPUFFTBackend {
    return new GPUFFTBackend(engine, ownsEngine);
  }

  fft(input: Float32Array): Promise<Float32Array> {
    return this.engine.fft(input);
  }

  ifft(input: Float32Array): Promise<Float32Array> {
    return this.engine.ifft(input);
  }

  fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    return this.engine.fft2d(input, width, height);
  }

  ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array> {
    return this.engine.ifft2d(input, width, height);
  }

  /**
   * 释放 GPU 资源
   *
   * 如果 ownsEngine 为 true，会同时释放底层 FFTEngine。
   */
  dispose(): void {
    if (this.ownsEngine) {
      this.engine.dispose();
    }
  }

  /**
   * 获取底层 FFTEngine（用于高级用例）
   */
  getEngine(): FFTEngine {
    return this.engine;
  }
}
