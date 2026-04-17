/**
 * Type definitions for WebGPU FFT Library
 * @module webgpu-fft/types
 */

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
}

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
