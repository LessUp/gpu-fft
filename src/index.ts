// webgpu-fft - WebGPU-accelerated FFT library
//
// Usage:
//   import { createFFTEngine, cpuFFT, cpuIFFT } from 'webgpu-fft';
//
//   // GPU path (requires WebGPU)
//   const engine = await createFFTEngine();
//   const spectrum = await engine.fft(signal);
//
//   // CPU path (works everywhere)
//   const result = cpuFFT(signal);

// Core GPU engine
export { FFTEngine, createFFTEngine } from './core/fft-engine';
export { GPUResourceManager } from './core/gpu-resource-manager';

// CPU FFT implementations
export {
  cpuFFT,
  cpuIFFT,
  cpuFFT2D,
  cpuIFFT2D,
  validateFFTInput,
  validateFFT2DInput,
} from './utils/cpu-fft';

// Application-level APIs
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
  FFTEngineConfig,
  SpectrumAnalyzerConfig,
  FilterType,
  FilterShape,
  ImageFilterConfig,
} from './types';
