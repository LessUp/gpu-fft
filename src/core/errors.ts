/**
 * FFT Error handling
 * @module webgpu-fft/errors
 */

/**
 * Error codes for FFT operations.
 *
 * Used by {@link FFTError} to categorize different failure modes.
 *
 * ## 错误码选择指南
 *
 * | 错误码 | 触发条件 | 抛出位置 |
 * |--------|----------|----------|
 * | `WEBGPU_NOT_AVAILABLE` | 浏览器不支持 WebGPU 或无法获取 adapter/device | `GPUResourceManager` |
 * | `DEVICE_LOST` | WebGPU 设备丢失（GPU 崩溃、标签页后台化等） | `GPUResourceManager` |
 * | `BUFFER_ALLOCATION_FAILED` | GPU 缓冲区分配失败 | `GPUResourceManager` |
 * | `SHADER_COMPILATION_FAILED` | WGSL 着色器编译失败 | `GPUResourceManager` |
 * | `INVALID_INPUT_SIZE` | 输入尺寸非 2 的幂、< 2、为 null/undefined、包含非有限值 | `validation.ts` |
 * | `INPUT_TOO_LARGE` | 输入尺寸超过 GPU 上限（默认 65536） | `validation.ts` |
 * | `DIMENSION_MISMATCH` | 输入长度与声明的维度不匹配 | `validation.ts`, `SpectrumAnalyzer` |
 * | `INVALID_PARAMETER` | 配置参数无效（如截止频率超出范围） | `validation.ts` |
 * | `ENGINE_DISPOSED` | FFTEngine 已被 dispose 或 GPU 资源已释放 | `FFTEngine`, `GPUResourceManager` |
 * | `TRANSFORM_FAILED` | FFT 变换操作失败（如引擎未初始化） | `FFTEngine` |
 *
 * ## 错误处理策略
 *
 * 1. **输入验证错误** (`INVALID_INPUT_SIZE`, `INPUT_TOO_LARGE`, `DIMENSION_MISMATCH`, `INVALID_PARAMETER`)
 *    - 在实际计算前抛出，避免无效 GPU 操作
 *    - 调用者应在调用前验证输入，或捕获后提示用户修正
 *
 * 2. **环境错误** (`WEBGPU_NOT_AVAILABLE`, `DEVICE_LOST`)
 *    - 表示运行环境不可用
 *    - 调用者可 fallback 到 CPU 实现 (`cpuFFT`)
 *
 * 3. **资源错误** (`BUFFER_ALLOCATION_FAILED`, `SHADER_COMPILATION_FAILED`)
 *    - 表示 GPU 资源不足或着色器代码错误
 *    - 通常不可恢复，需要简化输入或报告错误
 *
 * 4. **状态错误** (`ENGINE_DISPOSED`, `TRANSFORM_FAILED`)
 *    - 表示对象状态不正确
 *    - 调用者应检查生命周期，避免在 dispose 后使用
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
