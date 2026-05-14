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
export { FFTEngine, createFFTEngine, createStandaloneFFTEngine } from './core/fft-engine';
export { GPUFFTBackend } from './core/gpu-fft-backend';

// Compute context (for testing/mocking)
export type { FFTComputeContext, BufferSet } from './core/compute-context';
export { GPUComputeContext } from './core/gpu-compute-context';

// FFT Backend interfaces
export type { FFTBackend, RealFFTBackend } from './core/backend';
export { createRealFFTBackend } from './core/real-fft-backend';

// CPU FFT implementations
export {
  cpuFFT,
  cpuIFFT,
  cpuFFT2D,
  cpuIFFT2D,
  cpuRFFT,
  cpuIRFFT,
  cpuRFFT2D,
  cpuIRFFT2D,
  CPUFFTBackend,
} from './utils/cpu-fft';

// Application APIs (CPU-only)
export { SpectrumAnalyzer, createSpectrumAnalyzer } from './apps/spectrum-analyzer';
export { ImageFilter, createImageFilter } from './apps/image-filter';

// Error handling
export { FFTError, FFTErrorCode } from './core/errors';

// GPU detection
export async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return false;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

export function hasWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

// Core types
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
