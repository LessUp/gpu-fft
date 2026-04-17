/**
 * FFT Error handling
 * @module webgpu-fft/errors
 */

/**
 * Error codes for FFT operations.
 *
 * Used by {@link FFTError} to categorize different failure modes.
 */
export enum FFTErrorCode {
  /** WebGPU API is not available in this environment */
  WEBGPU_NOT_AVAILABLE = 'WEBGPU_NOT_AVAILABLE',
  /** Input size is not a power of 2 or is too small */
  INVALID_INPUT_SIZE = 'INVALID_INPUT_SIZE',
  /** Input size exceeds the maximum allowed value (65536 for GPU, unlimited for CPU) */
  INPUT_TOO_LARGE = 'INPUT_TOO_LARGE',
  /** Input dimensions do not match expected values */
  DIMENSION_MISMATCH = 'DIMENSION_MISMATCH',
  /** Invalid configuration parameter (e.g., cutoff frequency out of range) */
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  /** Failed to allocate GPU buffer */
  BUFFER_ALLOCATION_FAILED = 'BUFFER_ALLOCATION_FAILED',
  /** Failed to compile WGSL shader */
  SHADER_COMPILATION_FAILED = 'SHADER_COMPILATION_FAILED',
  /** WebGPU device was lost (GPU crash, tab backgrounded, etc.) */
  DEVICE_LOST = 'DEVICE_LOST',
  /** FFT transform operation failed */
  TRANSFORM_FAILED = 'TRANSFORM_FAILED',
  /** FFT engine has been disposed and cannot be used */
  ENGINE_DISPOSED = 'ENGINE_DISPOSED',
}

/**
 * Custom error class for FFT operations.
 *
 * Provides structured error information with error codes for programmatic handling.
 *
 * @example
 * ```typescript
 * import { FFTError, FFTErrorCode } from 'webgpu-fft';
 *
 * try {
 *   await engine.fft(invalidInput);
 * } catch (error) {
 *   if (error instanceof FFTError) {
 *     console.error(`[${error.code}] ${error.message}`);
 *
 *     if (error.code === FFTErrorCode.WEBGPU_NOT_AVAILABLE) {
 *       // Fallback to CPU implementation
 *       const result = cpuFFT(invalidInput);
 *     }
 *   }
 * }
 * ```
 */
export class FFTError extends Error {
  /**
   * Creates a new FFTError.
   *
   * @param message - Human-readable error description
   * @param code - Error code for programmatic handling
   */
  constructor(
    message: string,
    public code: FFTErrorCode
  ) {
    super(message);
    this.name = 'FFTError';
  }
}
