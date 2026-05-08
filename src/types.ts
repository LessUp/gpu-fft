/**
 * Type definitions for WebGPU FFT Library
 * @module webgpu-fft/types
 */

// ============================================================================
// 格式类型安全（Branded Types）
// ============================================================================

/**
 * 交错复数数组的格式标记
 *
 * 用于在编译时区分不同格式的 Float32Array，防止误用。
 */
declare const __interleaved_complex: unique symbol;

/**
 * 实信号数组的格式标记
 */
declare const __real_signal: unique symbol;

/**
 * 半频谱数组的格式标记（用于实输入 FFT）
 */
declare const __half_spectrum: unique symbol;

/**
 * 交错复数数组类型
 *
 * 格式：[real0, imag0, real1, imag1, ...]
 * 长度：2N（N 为复数元素数量）
 *
 * 用于：
 * - `fft()` / `ifft()` 的输入和输出
 * - `fft2d()` / `ifft2d()` 的输入和输出
 *
 * @example
 * ```typescript
 * // 创建交错复数数组
 * const input: InterleavedComplex = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const spectrum = fft(input);
 * ```
 */
export type InterleavedComplex = Float32Array & { readonly [__interleaved_complex]: true };

/**
 * 实信号数组类型
 *
 * 格式：[sample0, sample1, sample2, ...]
 * 长度：N（实数样本数量）
 *
 * 用于：
 * - `rfft()` 的输入
 * - `irfft()` 的输出
 *
 * @example
 * ```typescript
 * // 创建实信号数组
 * const signal: RealSignal = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
 * const spectrum = rfft(signal);
 * ```
 */
export type RealSignal = Float32Array & { readonly [__real_signal]: true };

/**
 * 半频谱数组类型
 *
 * 格式：[real0, imag0, real1, imag1, ...]（N/2+1 个复数）
 * 长度：2 * (N/2 + 1) = N + 2
 *
 * 用于：
 * - `rfft()` 的输出
 * - `irfft()` 的输入
 *
 * 利用 Hermitian 对称性，实信号 FFT 的后半部分频谱是前半部分的共轭，
 * 因此只需存储前 N/2+1 个频率分量。
 *
 * @example
 * ```typescript
 * const signal: RealSignal = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
 * const halfSpectrum: HalfSpectrum = rfft(signal);
 * // halfSpectrum.length = 8 + 2 = 10 (5 个复数)
 * ```
 */
export type HalfSpectrum = Float32Array & { readonly [__half_spectrum]: true };

/**
 * 类型守卫：检查是否为交错复数数组
 *
 * 注意：这是运行时检查，仅在启用调试模式时验证格式。
 */
export function isInterleavedComplex(value: Float32Array): value is InterleavedComplex {
  return value.length % 2 === 0;
}

/**
 * 类型守卫：检查是否为实信号数组
 *
 * 注意：无法在运行时区分 RealSignal 和普通 Float32Array，
 * 此函数仅供类型系统使用。
 */
export function isRealSignal(_value: Float32Array): _value is RealSignal {
  return true; // 运行时无法区分
}

/**
 * 类型守卫：检查是否为半频谱数组
 *
 * 注意：无法在运行时区分 HalfSpectrum 和 InterleavedComplex，
 * 此函数仅供类型系统使用。
 */
export function isHalfSpectrum(value: Float32Array): value is HalfSpectrum {
  return value.length % 2 === 0;
}

/**
 * 类型转换辅助函数：将 Float32Array 标记为 InterleavedComplex
 *
 * 用于外部数据源（如文件、网络）创建已知格式的数组。
 *
 * @example
 * ```typescript
 * const raw = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const interleaved = asInterleavedComplex(raw);
 * const spectrum = fft(interleaved);
 * ```
 */
export function asInterleavedComplex(array: Float32Array): InterleavedComplex {
  if (array.length % 2 !== 0) {
    throw new Error('InterleavedComplex must have even length');
  }
  return array as InterleavedComplex;
}

/**
 * 类型转换辅助函数：将 Float32Array 标记为 RealSignal
 */
export function asRealSignal(array: Float32Array): RealSignal {
  return array as RealSignal;
}

/**
 * 类型转换辅助函数：将 Float32Array 标记为 HalfSpectrum
 */
export function asHalfSpectrum(array: Float32Array): HalfSpectrum {
  if (array.length % 2 !== 0) {
    throw new Error('HalfSpectrum must have even length');
  }
  return array as HalfSpectrum;
}

// ============================================================================
// 配置类型
// ============================================================================

/**
 * Represents a complex number with real and imaginary parts.
 *
 * @example
 * ```typescript
 * const c: Complex = { real: 3, imag: 4 };
 * // Magnitude: sqrt(3² + 4²) = 5
 * // Phase: atan2(4, 3) ≈ 0.927 radians
 * ```
 */
export interface Complex {
  /** The real part of the complex number */
  real: number;
  /** The imaginary part of the complex number */
  imag: number;
}

/**
 * Configuration options for the FFT engine.
 *
 * @example
 * ```typescript
 * const config: FFTEngineConfig = {
 *   enableBankConflictOptimization: true,
 *   workgroupSize: 256
 * };
 * const engine = await createFFTEngine(config);
 * ```
 */
export interface FFTEngineConfig {
  /**
   * Enable bank conflict optimization in GPU shader.
   *
   * When enabled, adds padding to shared memory access to avoid bank conflicts.
   * This can improve performance on some GPUs but may have no effect or even
   * slight overhead on others. Test with your target hardware.
   *
   * @default false
   */
  enableBankConflictOptimization: boolean;

  /**
   * The workgroup size for GPU compute shaders.
   *
   * The current shader implementation only supports 256.
   * Other values will throw an error during initialization.
   *
   * @default 256
   */
  workgroupSize: number;
}

/**
 * Configuration options for the spectrum analyzer.
 *
 * @remarks
 * ⚠️ **CPU-Only Implementation**: This API uses CPU-based FFT only.
 * For GPU-accelerated FFT, use {@link FFTEngine} directly.
 *
 * @example
 * ```typescript
 * const config: SpectrumAnalyzerConfig = {
 *   fftSize: 1024,
 *   sampleRate: 44100
 * };
 * const analyzer = await createSpectrumAnalyzer(config);
 * ```
 */
export interface SpectrumAnalyzerConfig {
  /**
   * The FFT size for spectrum analysis.
   *
   * Must be a power of 2. Common values: 256, 512, 1024, 2048, 4096.
   *
   * Higher values provide better frequency resolution but require more computation.
   * Frequency resolution = sampleRate / fftSize
   *
   * @example
   * // With sampleRate=44100 and fftSize=1024, resolution ≈ 43 Hz
   */
  fftSize: number;

  /**
   * The sample rate of the audio data in Hz.
   *
   * Common values: 44100 (CD quality), 48000 (professional audio), 96000 (high-res)
   */
  sampleRate: number;

  /**
   * The window function to apply before FFT.
   *
   * Windowing reduces spectral leakage for signals that are not perfectly
   * periodic within the analysis window.
   *
   * @default 'hann'
   */
  windowType?: WindowType;
}

/**
 * Window function type for spectrum analysis.
 *
 * - `'hann'`: Good general-purpose window with moderate side lobe attenuation
 * - `'hamming'`: Similar to Hann but with slightly better side lobe suppression
 * - `'blackman'`: Excellent side lobe attenuation at the cost of wider main lobe
 * - `'flattop'`: Most accurate amplitude measurements but widest main lobe
 * - `'rectangular'`: No windowing, best frequency resolution but worst side lobe suppression
 */
export type WindowType = 'hann' | 'hamming' | 'blackman' | 'flattop' | 'rectangular';

/**
 * Type of frequency domain filter.
 *
 * - `'lowpass'`: Attenuates frequencies above the cutoff
 * - `'highpass'`: Attenuates frequencies below the cutoff
 * - `'bandpass'`: Passes frequencies within a band around the cutoff
 */
export type FilterType = 'lowpass' | 'highpass' | 'bandpass';

/**
 * Shape of the filter response.
 *
 * - `'ideal'`: Sharp cutoff (brick-wall filter), may cause ringing artifacts
 * - `'gaussian'`: Smooth Gaussian rolloff, more natural results
 */
export type FilterShape = 'ideal' | 'gaussian';

/**
 * Configuration options for the image filter.
 *
 * @remarks
 * ⚠️ **CPU-Only Implementation**: This API uses CPU-based FFT only.
 * For GPU-accelerated FFT, use {@link FFTEngine} directly.
 *
 * @example
 * ```typescript
 * // Low-pass filter for blurring
 * const blurConfig: ImageFilterConfig = {
 *   type: 'lowpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.3
 * };
 *
 * // High-pass filter for edge enhancement
 * const edgeConfig: ImageFilterConfig = {
 *   type: 'highpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.2
 * };
 *
 * // Band-pass filter
 * const bandConfig: ImageFilterConfig = {
 *   type: 'bandpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.5,
 *   bandwidth: 0.2
 * };
 * ```
 */
export interface ImageFilterConfig {
  /**
   * The type of filter to apply.
   *
   * - `'lowpass'`: Blurs image, removes high-frequency noise
   * - `'highpass'`: Enhances edges, removes low-frequency background
   * - `'bandpass'`: Isolates specific frequency range
   */
  type: FilterType;

  /**
   * The shape of the filter response.
   *
   * - `'ideal'`: Sharp cutoff, may cause ringing artifacts
   * - `'gaussian'`: Smooth rolloff, more natural results
   */
  shape: FilterShape;

  /**
   * The cutoff frequency as a fraction of the maximum frequency.
   *
   * Range: 0.0 to 1.0, where:
   * - 0.0 = DC component only
   * - 1.0 = Nyquist frequency
   *
   * For low-pass: frequencies above this are attenuated
   * For high-pass: frequencies below this are attenuated
   * For band-pass: center of the pass band
   */
  cutoffFrequency: number;

  /**
   * Bandwidth for bandpass filter (fraction of max frequency).
   *
   * Only used when type is 'bandpass'.
   * The pass band extends from (cutoff - bandwidth/2) to (cutoff + bandwidth/2).
   *
   * @default 0.1
   */
  bandwidth?: number;
}

/**
 * Internal configuration for a single FFT butterfly stage.
 * @internal
 */
export interface FFTStageConfig {
  /** The stage number (0 to log2(N) - 1) */
  stage: number;
  /** The butterfly span (2^stage) */
  butterflySpan: number;
  /** The number of butterflies (N / 2) */
  numButterflies: number;
  /** The base index for twiddle factors */
  twiddleBase: number;
}
