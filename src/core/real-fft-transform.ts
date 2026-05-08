/**
 * 实输入 FFT 变换辅助模块
 *
 * 封装实信号与复频谱之间的转换逻辑（基于 Hermitian 对称性）。
 *
 * ## 背景
 *
 * 实信号的 FFT 结果具有 **Hermitian 对称性**：
 * - 频谱的后半部分是前半部分的共轭镜像
 * - 只需存储前 N/2+1 个频率分量即可完整描述实信号的频谱
 *
 * ## 模块职责
 *
 * 1. **packRealInput**: 将实信号转换为复数格式（虚部为 0）
 * 2. **extractRealSignal**: 从复数信号提取实部
 * 3. **compressHermitianSpectrum**: 利用 Hermitian 对称性压缩频谱
 * 4. **expandHermitianSpectrum**: 从压缩频谱恢复完整频谱
 *
 * @module webgpu-fft/real-fft-transform
 */

import {
  validateFFTInput,
  validateRealIFFTInput,
  validateFFT2D as validateFFT2DCore,
  validateRealIFFT2DInput,
} from './validation';

// ============================================================================
// 1D 实输入 FFT 变换
// ============================================================================

/**
 * 将实信号打包为复数格式
 *
 * 将实数数组转换为交错复数格式，虚部初始化为 0。
 *
 * @param input - 实数值数组
 * @returns 交错复数数组 [real0, 0, real1, 0, ...]
 *
 * @example
 * ```typescript
 * const real = new Float32Array([1, 2, 3, 4]);
 * const complex = packRealInput(real);
 * // complex = [1, 0, 2, 0, 3, 0, 4, 0]
 * ```
 */
export function packRealInput(input: Float32Array): Float32Array {
  const complex = new Float32Array(input.length * 2);
  for (let i = 0; i < input.length; i++) {
    complex[i * 2] = input[i];
  }
  return complex;
}

/**
 * 从复数信号提取实部
 *
 * 假设输入是纯实信号（虚部应为 0 或接近 0），提取实部。
 *
 * @param input - 交错复数数组
 * @returns 实数数组
 *
 * @example
 * ```typescript
 * const complex = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const real = extractRealSignal(complex);
 * // real = [1, 2, 3, 4]
 * ```
 */
export function extractRealSignal(input: Float32Array): Float32Array {
  const signal = new Float32Array(input.length / 2);
  for (let i = 0; i < signal.length; i++) {
    signal[i] = input[i * 2];
  }
  return signal;
}

/**
 * 压缩 Hermitian 对称频谱
 *
 * 实信号 FFT 的频谱具有 Hermitian 对称性：X[k] = X[N-k]*。
 * 此函数只保留前 N/2+1 个频率分量。
 *
 * @param input - 完整 FFT 频谱（交错复数）
 * @returns 压缩的半频谱（N/2+1 个分量）
 *
 * @example
 * ```typescript
 * const fullSpectrum = new Float32Array(8); // 4 点 FFT 结果
 * const halfSpectrum = compressHermitianSpectrum(fullSpectrum);
 * // halfSpectrum.length = 6 (3 个复数分量: DC, bin1, Nyquist)
 * ```
 */
export function compressHermitianSpectrum(input: Float32Array): Float32Array {
  const n = validateFFTInput(input);
  return input.slice(0, (n / 2 + 1) * 2);
}

/**
 * 展开压缩的 Hermitian 对称频谱
 *
 * 从半频谱恢复完整频谱，利用 Hermitian 对称性生成后半部分。
 *
 * @param input - 压缩的半频谱（N/2+1 个分量）
 * @returns 完整 FFT 频谱
 *
 * @example
 * ```typescript
 * const halfSpectrum = new Float32Array(6); // 压缩的 4 点 FFT 结果
 * const fullSpectrum = expandHermitianSpectrum(halfSpectrum);
 * // fullSpectrum.length = 8 (完整 4 点频谱)
 * ```
 */
export function expandHermitianSpectrum(input: Float32Array): Float32Array {
  const n = validateRealIFFTInput(input);
  const full = new Float32Array(n * 2);
  const halfBins = n / 2 + 1;

  // 复制前半部分
  full.set(input);

  // 利用 Hermitian 对称性生成后半部分
  // X[N-k] = X[k]*（共轭）
  for (let k = 1; k < halfBins - 1; k++) {
    const srcIdx = k * 2;
    const dstIdx = (n - k) * 2;
    full[dstIdx] = input[srcIdx]; // 实部相同
    full[dstIdx + 1] = -input[srcIdx + 1]; // 虚部取反
  }

  return full;
}

// ============================================================================
// 2D 实输入 FFT 变换
// ============================================================================

/**
 * 压缩 2D Hermitian 对称频谱
 *
 * 2D 实信号 FFT 的频谱在两个维度上都具有对称性。
 * 此函数压缩每行的前 width/2+1 个分量。
 *
 * @param input - 完整 2D FFT 频谱（交错复数，行优先）
 * @param width - 频谱宽度
 * @param height - 频谱高度
 * @returns 压缩的 2D 半频谱
 *
 * @example
 * ```typescript
 * const full2D = new Float32Array(16 * 16 * 2); // 16x16 FFT 结果
 * const half2D = compressHermitianSpectrum2D(full2D, 16, 16);
 * // half2D.length = 16 * 9 * 2 (每行 9 个复数分量)
 * ```
 */
export function compressHermitianSpectrum2D(
  input: Float32Array,
  width: number,
  height: number
): Float32Array {
  validateFFT2DCore(input, width, height);

  const halfWidth = width / 2 + 1;
  const compressed = new Float32Array(height * halfWidth * 2);

  for (let row = 0; row < height; row++) {
    const srcStart = row * width * 2;
    const dstStart = row * halfWidth * 2;
    compressed.set(input.subarray(srcStart, srcStart + halfWidth * 2), dstStart);
  }

  return compressed;
}

/**
 * 展开压缩的 2D Hermitian 对称频谱
 *
 * 从半频谱恢复完整 2D 频谱，利用 2D Hermitian 对称性。
 *
 * @param input - 压缩的 2D 半频谱
 * @param width - 原始频谱宽度
 * @param height - 原始频谱高度
 * @returns 完整 2D FFT 频谱
 *
 * @example
 * ```typescript
 * const half2D = new Float32Array(16 * 9 * 2); // 压缩的 16x16 FFT 结果
 * const full2D = expandHermitianSpectrum2D(half2D, 16, 16);
 * // full2D.length = 16 * 16 * 2
 * ```
 */
export function expandHermitianSpectrum2D(
  input: Float32Array,
  width: number,
  height: number
): Float32Array {
  validateRealIFFT2DInput(input, width, height);

  const halfWidth = width / 2 + 1;
  const full = new Float32Array(width * height * 2);

  // 复制每行的前半部分
  for (let row = 0; row < height; row++) {
    const srcStart = row * halfWidth * 2;
    const dstStart = row * width * 2;
    full.set(input.subarray(srcStart, srcStart + halfWidth * 2), dstStart);
  }

  // 利用 2D Hermitian 对称性生成后半部分
  // 2D 情况: X[N-m, N-n] = X[m, n]*
  for (let row = 0; row < height; row++) {
    for (let col = halfWidth; col < width; col++) {
      const mirrorRow = (height - row) % height;
      const mirrorCol = width - col;
      const srcIdx = (mirrorRow * halfWidth + mirrorCol) * 2;
      const dstIdx = (row * width + col) * 2;
      full[dstIdx] = input[srcIdx];
      full[dstIdx + 1] = -input[srcIdx + 1];
    }
  }

  return full;
}
