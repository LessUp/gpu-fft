/**
 * WebGPU-accelerated FFT Library
 *
 * A high-performance Fast Fourier Transform library providing:
 * - GPU-accelerated 1D/2D FFT via WebGPU compute shaders
 * - CPU fallback for non-WebGPU environments
 * - Signal processing utilities (spectrum analysis, filtering)
 * - Image processing utilities (frequency domain filtering)
 *
 * @packageDocumentation
 *
 * @example Basic GPU FFT
 * ```typescript
 * import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';
 *
 * if (await isWebGPUAvailable()) {
 *   const engine = await createFFTEngine();
 *   const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 *   const spectrum = await engine.fft(input);
 *   const recovered = await engine.ifft(spectrum);
 *   engine.dispose();
 * }
 * ```
 *
 * @example CPU Fallback
 * ```typescript
 * import { cpuFFT, cpuIFFT } from 'webgpu-fft';
 *
 * const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const spectrum = cpuFFT(input);
 * const signal = cpuIFFT(spectrum);
 * ```
 *
 * @see {@link https://lessup.github.io/gpu-fft/} Documentation
 * @see {@link https://github.com/LessUp/gpu-fft} GitHub Repository
 */

// Core GPU engine
export { FFTEngine, createFFTEngine } from './core/fft-engine';
export { GPUResourceManager } from './core/gpu-resource-manager';

// FFT Backend 接口和实现
export type { FFTBackend, RealFFTBackend } from './core/backend';
export { CPUFFTBackend } from './core/cpu-backend';
export { createRealFFTBackend } from './core/real-fft-backend';

// Validation utilities
export {
  validateFFT,
  validateFFT2D,
  validateGPUFFT,
  validateGPUFFT2D,
  validateRealFFTInput,
  validateRealIFFTInput,
  validateRealFFT2DInput,
  validateRealIFFT2DInput,
  validateSpectrumAnalyzerConfig,
  validateImageFilterConfig,
  type ValidationOptions,
} from './core/validation';

// CPU FFT implementations (fallback for non-WebGPU environments)
export {
  cpuFFT,
  cpuIFFT,
  cpuFFT2D,
  cpuIFFT2D,
  cpuRFFT,
  cpuIRFFT,
  cpuRFFT2D,
  cpuIRFFT2D,
} from './utils/cpu-fft';

// Application-level APIs (CPU-only implementations)
// ⚠️ These APIs use CPU-based FFT only. For GPU acceleration, use FFTEngine.
export { SpectrumAnalyzer, createSpectrumAnalyzer } from './apps/spectrum-analyzer';
export { ImageFilter, createImageFilter } from './apps/image-filter';

// Error handling
export { FFTError, FFTErrorCode } from './core/errors';

// GPU detection
export { isWebGPUAvailable, hasWebGPUSupport } from './utils/gpu-detect';

// Complex number utilities
export {
  complexAdd,
  complexSub,
  complexMul,
  complexMagnitude,
  complexConj,
  complexScale,
  twiddleFactor,
  twiddleFactorInverse,
  interleavedToComplex,
  complexToInterleaved,
  complexApproxEqual,
  naiveDFT,
  naiveIDFT,
} from './utils/complex';

// Bit-reversal utilities
export {
  bitReverse,
  log2,
  isPowerOf2,
  bitReversalPermutation,
  bitReversalPermutationInPlace,
} from './utils/bit-reversal';

// Window functions
export {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
  applyWindow,
  applyWindowComplex,
} from './utils/window-functions';

// Types
export type {
  Complex,
  InterleavedComplex,
  RealSignal,
  HalfSpectrum,
  FFTEngineConfig,
  SpectrumAnalyzerConfig,
  FilterType,
  FilterShape,
  ImageFilterConfig,
  WindowType,
} from './types';

export {
  isInterleavedComplex,
  isRealSignal,
  isHalfSpectrum,
  asInterleavedComplex,
  asRealSignal,
  asHalfSpectrum,
} from './types';
