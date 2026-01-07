/**
 * WebGPU FFT Library
 *
 * High-performance Fast Fourier Transform library using WebGPU compute shaders
 * for GPU-accelerated signal and image processing.
 *
 * @packageDocumentation
 * @module webgpu-fft
 *
 * @example
 * Basic FFT usage:
 * ```typescript
 * import { createFFTEngine } from 'webgpu-fft';
 *
 * const engine = await createFFTEngine();
 * const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]); // 4 complex numbers
 * const result = await engine.fft(input);
 * engine.dispose();
 * ```
 *
 * @example
 * Spectrum analysis:
 * ```typescript
 * import { createSpectrumAnalyzer } from 'webgpu-fft';
 *
 * const analyzer = await createSpectrumAnalyzer({ fftSize: 1024, sampleRate: 44100 });
 * const spectrum = await analyzer.analyze(audioData);
 * analyzer.dispose();
 * ```
 */

// Core FFT Engine
export { createFFTEngine, FFTEngine } from './core/fft-engine';

// GPU Resource Management
export { GPUResourceManager } from './core/gpu-resource-manager';

// Application APIs
export { createSpectrumAnalyzer, SpectrumAnalyzer } from './apps/spectrum-analyzer';
export { createImageFilter, ImageFilter } from './apps/image-filter';

// Error Handling
export { FFTError, FFTErrorCode } from './core/errors';

// Type Definitions
export type {
  FFTEngineConfig,
  SpectrumAnalyzerConfig,
  ImageFilterConfig,
  FilterType,
  FilterShape,
  Complex,
} from './types';
