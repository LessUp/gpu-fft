/**
 * Hermitian 对称性辅助函数
 * @module webgpu-fft/hermitian
 *
 * 实信号 FFT 结果具有 Hermitian 对称性：X[k] = X[N-k]*
 * 这些函数用于压缩/展开频谱以利用这种对称性。
 */

import { validateFFT, validateRealIFFTInput, validateRealIFFT2DInput } from './validation';

/**
 * 将实信号打包为复数格式
 *
 * @param input - 实数值数组
 * @returns 交错复数数组 [real0, 0, real1, 0, ...]
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
 * 注意：假设输入是有效的交错复数数组（长度为偶数）。
 * 输入验证应在调用链中完成。
 *
 * @param input - 交错复数数组（长度必须为偶数）
 * @returns 实数数组
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
 * 实信号 FFT 的频谱具有 Hermitian 对称性：X[k] = X[N-k]*
 * 此函数只保留前 N/2+1 个频率分量。
 *
 * @param input - 完整 FFT 频谱（交错复数）
 * @returns 压缩的半频谱（N/2+1 个分量）
 */
export function compressHermitianSpectrum(input: Float32Array): Float32Array {
  const n = validateFFT(input);
  return input.slice(0, (n / 2 + 1) * 2);
}

/**
 * 展开压缩的 Hermitian 对称频谱
 *
 * 从半频谱恢复完整频谱，利用 Hermitian 对称性生成后半部分。
 *
 * @param input - 压缩的半频谱（N/2+1 个分量）
 * @returns 完整 FFT 频谱
 */
export function expandHermitianSpectrum(input: Float32Array): Float32Array {
  const n = validateRealIFFTInput(input);
  const full = new Float32Array(n * 2);
  const halfBins = n / 2 + 1;

  // 复制前半部分
  full.set(input);

  // 利用 Hermitian 对称性生成后半部分: X[N-k] = X[k]*
  for (let k = 1; k < halfBins - 1; k++) {
    const srcIdx = k * 2;
    const dstIdx = (n - k) * 2;
    full[dstIdx] = input[srcIdx]; // 实部相同
    full[dstIdx + 1] = -input[srcIdx + 1]; // 虚部取反
  }

  return full;
}

/**
 * 压缩 2D Hermitian 对称频谱
 *
 * 注意：此函数假设输入是有效的 2D FFT 频谱（来自可信来源）。
 * 输入验证应在调用链中完成（如 validateFFT2D 或 validateRealFFT2DInput）。
 *
 * @param input - 完整 2D FFT 频谱（交错复数，行优先）
 * @param width - 频谱宽度（必须为 2 的幂）
 * @param height - 频谱高度（必须为 2 的幂）
 * @returns 压缩的 2D 半频谱
 */
export function compressHermitianSpectrum2D(
  input: Float32Array,
  width: number,
  height: number
): Float32Array {
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
 * @param input - 压缩的 2D 半频谱
 * @param width - 原始频谱宽度
 * @param height - 原始频谱高度
 * @returns 完整 2D FFT 频谱
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
