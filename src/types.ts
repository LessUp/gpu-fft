/**
 * Type definitions for WebGPU FFT Library
 * @module types
 */

/**
 * Represents a complex number with real and imaginary parts.
 *
 * @example
 * ```typescript
 * const c: Complex = { real: 3, imag: 4 };
 * // Magnitude: sqrt(3² + 4²) = 5
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
 * ```
 */
export interface FFTEngineConfig {
  /**
   * Enable bank conflict optimization for GPU shared memory.
   * When enabled, adds padding to eliminate memory bank conflicts.
   * @default true
   */
  enableBankConflictOptimization: boolean;

  /**
   * The workgroup size for GPU compute shaders.
   * Must be a power of 2, typically 64, 128, or 256.
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
 * ```
 */
export interface SpectrumAnalyzerConfig {
  /**
   * The FFT size for spectrum analysis.
   * Must be one of: 256, 512, 1024, 2048, or 4096.
   */
  fftSize: 256 | 512 | 1024 | 2048 | 4096;

  /**
   * The sample rate of the audio data in Hz.
   * Common values: 44100, 48000, 96000
   */
  sampleRate: number;
}

/**
 * Type of frequency domain filter.
 * - `'lowpass'`: Attenuates frequencies above the cutoff
 * - `'highpass'`: Attenuates frequencies below the cutoff
 */
export type FilterType = 'lowpass' | 'highpass';

/**
 * Shape of the filter response.
 * - `'ideal'`: Sharp cutoff (brick-wall filter)
 * - `'gaussian'`: Smooth Gaussian rolloff
 */
export type FilterShape = 'ideal' | 'gaussian';

/**
 * Configuration options for the image filter.
 *
 * @example
 * ```typescript
 * const config: ImageFilterConfig = {
 *   type: 'lowpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.3
 * };
 * ```
 */
export interface ImageFilterConfig {
  /**
   * The type of filter to apply.
   */
  type: FilterType;

  /**
   * The shape of the filter response.
   */
  shape: FilterShape;

  /**
   * The cutoff frequency as a fraction of the maximum frequency.
   * Range: 0.0 to 1.0, where 1.0 represents the Nyquist frequency.
   */
  cutoffFrequency: number;
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
