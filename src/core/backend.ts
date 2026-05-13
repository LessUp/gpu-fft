/**
 * FFT Backend 接口定义
 * @module webgpu-fft/backend
 *
 * 定义 FFT 后端的统一接口，支持 CPU 和 GPU 实现的可替换性。
 */

/**
 * FFT 后端接口
 *
 * 定义了一维和二维 FFT 变换的统一接口，使得调用者可以
 * 在 CPU 和 GPU 实现之间切换，或在测试中注入 mock 实现。
 *
 * @example
 * ```typescript
 * // 使用 CPU 后端
 * const backend: FFTBackend = new CPUFFTBackend();
 *
 * // 使用 GPU 后端
 * const backend: FFTBackend = await createGPUFFTBackend();
 *
 * // 在测试中注入 mock
 * const mockBackend: FFTBackend = {
 *   fft: vi.fn().mockReturnValue(expectedResult),
 *   // ...
 * };
 * ```
 */
export interface FFTBackend {
  /**
   * 计算一维 FFT
   *
   * @param input - 交错复数数据 [real, imag, real, imag, ...]
   * @returns FFT 结果（相同格式）
   */
  fft(input: Float32Array): Promise<Float32Array>;

  /**
   * 计算一维逆 FFT
   *
   * @param input - 交错复数 FFT 数据
   * @returns 时域信号
   */
  ifft(input: Float32Array): Promise<Float32Array>;

  /**
   * 计算二维 FFT
   *
   * @param input - 交错复数二维数据（行优先）
   * @param width - 列数（必须为 2 的幂）
   * @param height - 行数（必须为 2 的幂）
   * @returns 二维 FFT 结果
   */
  fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;

  /**
   * 计算二维逆 FFT
   *
   * @param input - 交错复数二维 FFT 数据
   * @param width - 列数
   * @param height - 行数
   * @returns 时域二维信号
   */
  ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;

  /**
   * 释放后端资源（可选）
   *
   * CPU 后端通常无需释放，GPU 后端需要释放 GPU 资源。
   */
  dispose?(): void;
}

/**
 * 实输入 FFT 后端接口
 *
 * 扩展 FFTBackend，增加实输入 FFT 的优化方法。
 * 实输入 FFT 利用 Hermitian 对称性，输出更紧凑的频谱。
 */
export interface RealFFTBackend extends FFTBackend {
  /**
   * 计算实输入 FFT（RFFT）
   *
   * 输入为实数数组，输出为压缩的半频谱（N/2+1 个复数）。
   *
   * @param input - 实数值数组
   * @returns 半频谱交错复数数据
   */
  rfft(input: Float32Array): Promise<Float32Array>;

  /**
   * 计算实输入逆 FFT（IRFFT）
   *
   * @param input - 半频谱交错复数数据
   * @returns 实数值数组
   */
  irfft(input: Float32Array): Promise<Float32Array>;

  /**
   * 计算二维实输入 FFT
   *
   * @param input - 实数值二维数组（行优先）
   * @param width - 列数
   * @param height - 行数
   * @returns 压缩半频谱
   */
  rfft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;

  /**
   * 计算二维实输入逆 FFT
   *
   * @param input - 压缩半频谱
   * @param width - 原始实信号宽度
   * @param height - 原始实信号高度
   * @returns 实数值二维数组
   */
  irfft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
}
