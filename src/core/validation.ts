/**
 * 统一的输入验证模块
 * @module webgpu-fft/validation
 *
 * 集中管理所有 FFT 相关的输入验证逻辑，确保验证规则的一致性和可维护性。
 */

import type { SpectrumAnalyzerConfig, ImageFilterConfig } from '../types';
import { FFTError, FFTErrorCode } from './errors';

// ============================================================================
// 基础工具函数（内联以避免循环依赖）
// ============================================================================

/**
 * 检查数字是否为 2 的幂
 *
 * @param n - 要检查的数字
 * @returns 如果 n 是正的 2 的幂则返回 true
 */
function isPowerOf2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// ============================================================================
// 基础验证函数（内部使用）
// ============================================================================

function validateNotNull<T>(value: T | null | undefined, label: string): void {
  if (value === null || value === undefined) {
    throw new FFTError(`${label} cannot be null or undefined`, FFTErrorCode.INVALID_INPUT_SIZE);
  }
}

function validateFiniteValues(input: Float32Array, label: string): void {
  for (let i = 0; i < input.length; i++) {
    if (!Number.isFinite(input[i])) {
      throw new FFTError(
        `${label} contains non-finite value (NaN or Infinity) at index ${i}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
  }
}

function validatePowerOf2(n: number, label: string): void {
  if (!isPowerOf2(n)) {
    throw new FFTError(`${label} must be a power of 2, got ${n}`, FFTErrorCode.INVALID_INPUT_SIZE);
  }
}

// ============================================================================
// 核心验证函数（统一入口）
// ============================================================================

/**
 * 验证选项
 */
export interface ValidationOptions {
  /**
   * 执行目标：'cpu' 或 'gpu'
   * - 'cpu': 无尺寸上限
   * - 'gpu': 增加 65536 上限检查
   */
  target?: 'cpu' | 'gpu';

  /**
   * 自定义最大尺寸限制
   */
  maxSize?: number;
}

const MAX_GPU_FFT_SIZE = 65536;

/**
 * 验证 1D FFT 输入数据
 *
 * @param input - 交错复数数据 [real, imag, real, imag, ...]
 * @param options - 验证选项
 * @returns 复数元素数量 (input.length / 2)
 * @throws FFTError 如果输入无效
 *
 * @example
 * ```typescript
 * const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const n = validateFFT(input); // n = 4
 *
 * // GPU 验证（带尺寸上限）
 * const n2 = validateFFT(input, { target: 'gpu' });
 * ```
 */
export function validateFFT(input: Float32Array, options?: ValidationOptions): number {
  validateNotNull(input, 'Input');

  if (input.length % 2 !== 0) {
    throw new FFTError(
      `Input must contain interleaved complex pairs, got length ${input.length}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  const n = input.length / 2;
  validatePowerOf2(n, 'Input size');

  if (n < 2) {
    throw new FFTError(`Input size must be at least 2, got ${n}`, FFTErrorCode.INVALID_INPUT_SIZE);
  }

  validateFiniteValues(input, 'Input');

  // GPU 特有检查
  if (options?.target === 'gpu' || options?.maxSize) {
    const maxSize = options?.maxSize ?? MAX_GPU_FFT_SIZE;
    if (n > maxSize) {
      throw new FFTError(
        `Input size exceeds maximum of ${maxSize}, got ${n}`,
        FFTErrorCode.INPUT_TOO_LARGE
      );
    }
  }

  return n;
}

/**
 * 验证 2D FFT 输入数据
 *
 * @param input - 交错复数数据
 * @param width - 宽度维度（必须为 2 的幂）
 * @param height - 高度维度（必须为 2 的幂）
 * @param options - 验证选项
 * @throws FFTError 如果维度无效
 *
 * @example
 * ```typescript
 * const input = new Float32Array(16 * 16 * 2); // 16x16 复数矩阵
 * validateFFT2D(input, 16, 16); // OK
 * ```
 */
export function validateFFT2D(
  input: Float32Array,
  width: number,
  height: number,
  _options?: ValidationOptions
): void {
  validateNotNull(input, 'Input');

  if (width <= 0 || height <= 0) {
    throw new FFTError(
      `2D FFT dimensions must be positive, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  validatePowerOf2(width, 'Width');
  validatePowerOf2(height, 'Height');

  const expectedLength = width * height * 2;
  if (input.length !== expectedLength) {
    throw new FFTError(
      `Input length ${input.length} does not match expected ${expectedLength} for ${width}x${height}`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }

  validateFiniteValues(input, 'Input');
}

// ============================================================================
// GPU 便捷函数
// ============================================================================

/**
 * 验证 GPU 1D FFT 输入（带尺寸上限）
 *
 * @param input - 交错复数数据
 * @returns 复数元素数量
 * @throws FFTError 如果输入无效或超过 GPU 尺寸上限
 */
export function validateGPUFFT(input: Float32Array): number {
  return validateFFT(input, { target: 'gpu' });
}

/**
 * 验证 GPU 2D FFT 输入（带尺寸上限）
 *
 * @param input - 交错复数数据
 * @param width - 宽度维度
 * @param height - 高度维度
 * @throws FFTError 如果维度无效
 */
export function validateGPUFFT2D(input: Float32Array, width: number, height: number): void {
  validateFFT2D(input, width, height, { target: 'gpu' });
}

// ============================================================================
// 实输入 FFT 验证
// ============================================================================

/**
 * 验证实输入 FFT（RFFT）输入数据
 *
 * @param input - 实数值数组
 * @returns 数组长度
 * @throws FFTError 如果输入无效
 */
export function validateRealFFTInput(input: Float32Array): number {
  validateNotNull(input, 'Input');
  validateFiniteValues(input, 'Input');

  const n = input.length;
  validatePowerOf2(n, 'Input size');

  if (n < 2) {
    throw new FFTError(`Input size must be at least 2, got ${n}`, FFTErrorCode.INVALID_INPUT_SIZE);
  }

  return n;
}

/**
 * 验证实输入逆 FFT（IRFFT）输入数据
 *
 * @param input - 半频谱交错复数数据
 * @returns 原始实信号长度
 * @throws FFTError 如果输入无效
 */
export function validateRealIFFTInput(input: Float32Array): number {
  validateNotNull(input, 'Input');
  validateFiniteValues(input, 'Input');

  if (input.length % 2 !== 0) {
    throw new FFTError(
      `Input must contain interleaved complex pairs, got length ${input.length}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  const n = input.length - 2;
  if (!isPowerOf2(n) || n < 2) {
    throw new FFTError(
      `Input half-spectrum does not map to a supported real signal length, got length ${input.length}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  return n;
}

/**
 * 验证 2D 实输入 FFT（RFFT2D）输入数据
 *
 * @param input - 实数值 2D 数组
 * @param width - 宽度维度
 * @param height - 高度维度
 * @throws FFTError 如果维度无效
 */
export function validateRealFFT2DInput(input: Float32Array, width: number, height: number): void {
  validateNotNull(input, 'Input');
  validateFiniteValues(input, 'Input');

  if (width <= 0 || height <= 0) {
    throw new FFTError(
      `2D FFT dimensions must be positive, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  validatePowerOf2(width, 'Width');
  validatePowerOf2(height, 'Height');

  const expectedLength = width * height;
  if (input.length !== expectedLength) {
    throw new FFTError(
      `Input length ${input.length} does not match expected ${expectedLength} for ${width}x${height}`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }
}

/**
 * 验证 2D 实输入逆 FFT（IRFFT2D）输入数据
 *
 * @param input - 压缩半频谱交错复数数据
 * @param width - 原始实信号宽度
 * @param height - 原始实信号高度
 * @throws FFTError 如果维度无效
 */
export function validateRealIFFT2DInput(input: Float32Array, width: number, height: number): void {
  validateNotNull(input, 'Input');
  validateFiniteValues(input, 'Input');

  if (width <= 0 || height <= 0) {
    throw new FFTError(
      `2D FFT dimensions must be positive, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  validatePowerOf2(width, 'Width');
  validatePowerOf2(height, 'Height');

  const expectedLength = height * (width / 2 + 1) * 2;
  if (input.length !== expectedLength) {
    throw new FFTError(
      `Input length ${input.length} does not match expected ${expectedLength} for compressed ${width}x${height} spectrum`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }
}

// ============================================================================
// 配置验证
// ============================================================================

/**
 * 验证频谱分析器配置
 *
 * @param config - 配置对象
 * @throws FFTError 如果配置无效
 */
export function validateSpectrumAnalyzerConfig(config: SpectrumAnalyzerConfig): void {
  validateNotNull(config, 'Config');

  if (!isPowerOf2(config.fftSize) || config.fftSize < 2) {
    throw new FFTError(
      `fftSize must be a power of 2 and at least 2, got ${config.fftSize}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  if (!Number.isFinite(config.sampleRate) || config.sampleRate <= 0) {
    throw new FFTError(
      `sampleRate must be a finite number greater than 0, got ${config.sampleRate}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
}

/**
 * 验证图像滤波器配置
 *
 * @param config - 配置对象
 * @throws FFTError 如果配置无效
 */
export function validateImageFilterConfig(config: ImageFilterConfig): void {
  validateNotNull(config, 'Config');

  if (
    !Number.isFinite(config.cutoffFrequency) ||
    config.cutoffFrequency < 0 ||
    config.cutoffFrequency > 1
  ) {
    throw new FFTError(
      `cutoffFrequency must be a finite number in [0, 1], got ${config.cutoffFrequency}`,
      FFTErrorCode.INVALID_PARAMETER
    );
  }

  if (config.bandwidth !== undefined) {
    if (!Number.isFinite(config.bandwidth) || config.bandwidth <= 0 || config.bandwidth > 1) {
      throw new FFTError(
        `bandwidth must be a finite number in (0, 1], got ${config.bandwidth}`,
        FFTErrorCode.INVALID_PARAMETER
      );
    }
  }
}

// ============================================================================
// 向后兼容别名
// ============================================================================

/**
 * 验证 1D FFT 输入（向后兼容别名）
 * @deprecated 使用 validateFFT() 代替
 */
export const validateFFTInput = validateFFT;

/**
 * 验证 2D FFT 输入（向后兼容别名）
 * @deprecated 使用 validateFFT2D() 代替
 */
export const validateFFT2DInputAlias = validateFFT2D;

// ============================================================================
// 工具模块验证（统一入口）
// ============================================================================

/**
 * 验证交错复数数据为 2 的幂
 *
 * 用于 bit-reversal 操作验证
 *
 * @param data - 交错复数数据
 * @returns 复数元素数量
 * @throws FFTError 如果数据无效
 */
export function validateInterleavedPowerOf2(data: Float32Array): number {
  validateNotNull(data, 'Input');

  if (data.length % 2 !== 0) {
    throw new FFTError(
      'Input must use interleaved real/imaginary pairs',
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  const n = data.length / 2;
  validatePowerOf2(n, 'Number of complex samples');

  return n;
}

/**
 * 验证窗函数尺寸
 *
 * @param size - 窗尺寸
 * @throws FFTError 如果尺寸无效
 */
export function validateWindowSize(size: number): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new FFTError(
      `Window size must be a positive integer, got ${size}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
}

/**
 * 验证信号和窗长度匹配
 *
 * @param signalLength - 信号长度
 * @param windowLength - 窗长度
 * @throws FFTError 如果不匹配
 */
export function validateWindowMatch(signalLength: number, windowLength: number): void {
  if (signalLength !== windowLength) {
    throw new FFTError(
      `Signal length (${signalLength}) must match window length (${windowLength})`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }
}

/**
 * 验证复数信号和窗长度匹配
 *
 * @param signalLength - 交错复数信号长度
 * @param windowLength - 窗长度
 * @throws FFTError 如果不匹配
 */
export function validateWindowMatchComplex(signalLength: number, windowLength: number): void {
  if (signalLength % 2 !== 0) {
    throw new FFTError(
      'Complex signal must use interleaved real/imaginary pairs',
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  if (signalLength / 2 !== windowLength) {
    throw new FFTError(
      `Window length (${windowLength}) must match number of complex samples (${signalLength / 2})`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }
}
