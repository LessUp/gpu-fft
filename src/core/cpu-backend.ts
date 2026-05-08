/**
 * CPU FFT 后端实现
 * @module webgpu-fft/cpu-backend
 *
 * 使用 Cooley-Tukey Radix-2 DIT 算法的 CPU FFT 实现。
 * 作为 FFTBackend 接口的 CPU 适配器。
 */

import type { FFTBackend } from './backend';
import { cpuFFT, cpuIFFT, cpuFFT2D, cpuIFFT2D } from '../utils/cpu-fft';

/**
 * CPU FFT 后端
 *
 * 使用纯 CPU 实现的 FFT 后端，适用于：
 * - 无 WebGPU 支持的环境
 * - 测试和调试
 * - 小规模数据（GPU 开销不划算时）
 *
 * @example
 * ```typescript
 * const backend = new CPUFFTBackend();
 * const spectrum = backend.fft(input);
 * ```
 */
export class CPUFFTBackend implements FFTBackend {
  fft(input: Float32Array): Float32Array {
    return cpuFFT(input);
  }

  ifft(input: Float32Array): Float32Array {
    return cpuIFFT(input);
  }

  fft2d(input: Float32Array, width: number, height: number): Float32Array {
    return cpuFFT2D(input, width, height);
  }

  ifft2d(input: Float32Array, width: number, height: number): Float32Array {
    return cpuIFFT2D(input, width, height);
  }

  /**
   * CPU 后端无需释放资源
   */
  dispose(): void {
    // 无资源需要释放
  }
}
