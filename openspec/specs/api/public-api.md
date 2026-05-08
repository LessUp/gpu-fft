# API Specification: WebGPU FFT Library

## Overview

This document defines the public API exported from `src/index.ts`. Public signatures and behavior must remain aligned across implementation, documentation, and examples.

## Core FFT Engine

### `createFFTEngine()`

```typescript
async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine>;
```

- Creates and initializes a GPU FFT engine
- Throws `FFTError` with `WEBGPU_NOT_AVAILABLE` when WebGPU cannot be initialized

### `FFTEngine`

```typescript
interface FFTEngine {
  fft(input: Float32Array): Promise<Float32Array>;
  ifft(input: Float32Array): Promise<Float32Array>;
  rfft(input: Float32Array): Promise<Float32Array>;
  irfft(input: Float32Array): Promise<Float32Array>;
  fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  rfft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  irfft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  dispose(): void;
}
```

### Real-input contracts

- `rfft()` accepts a real-valued signal of length `N` and returns an interleaved complex half-spectrum with `N / 2 + 1` bins
- `irfft()` accepts a valid half-spectrum and returns a real-valued signal of length `N`
- `rfft2d()` accepts a real-valued `width × height` input and returns `height × (width / 2 + 1)` interleaved complex bins
- `irfft2d()` accepts that compressed 2D spectrum plus the original `width` and `height`, then returns a real-valued `width × height` output

## CPU FFT Functions

```typescript
function cpuFFT(input: Float32Array): Float32Array;
function cpuIFFT(input: Float32Array): Float32Array;
function cpuFFT2D(input: Float32Array, width: number, height: number): Float32Array;
function cpuIFFT2D(input: Float32Array, width: number, height: number): Float32Array;
function cpuRFFT(input: Float32Array): Float32Array;
function cpuIRFFT(input: Float32Array): Float32Array;
function cpuRFFT2D(input: Float32Array, width: number, height: number): Float32Array;
function cpuIRFFT2D(input: Float32Array, width: number, height: number): Float32Array;
```

## Real-input backend seam

```typescript
function createRealFFTBackend(backend: FFTBackend): RealFFTBackend;
```

- Promotes a complex FFT backend to the `RealFFTBackend` seam
- Encapsulates Hermitian packing and expansion as implementation details
- Preserves the backend's synchronous or asynchronous execution model

## Validation Helpers

```typescript
function validateFFTInput(input: Float32Array): number;
function validateFFT2DInput(input: Float32Array, width: number, height: number): void;
```

## Application Utilities

```typescript
async function createSpectrumAnalyzer(config: SpectrumAnalyzerConfig): Promise<SpectrumAnalyzer>;
async function createImageFilter(config: ImageFilterConfig): Promise<ImageFilter>;
```

```typescript
class SpectrumAnalyzer {
  analyze(audioData: Float32Array): Promise<Float32Array>;
  getFrequencies(): Float32Array;
  getFrequency(binIndex: number): number;
  dispose(): void;
}
```

```typescript
class ImageFilter {
  apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array>;
  dispose(): void;
}
```

`createSpectrumAnalyzer()` and `createImageFilter()` are CPU-only utilities and must not be documented as GPU-accelerated FFT execution surfaces.

## GPU Detection

```typescript
async function isWebGPUAvailable(): Promise<boolean>;
function hasWebGPUSupport(): boolean;
```

## Utility Exports

The public API also exports:

- complex-number helpers
- bit-reversal helpers:
  - `bitReverse(value: number, bitWidth: number): number`
  - `log2(n: number): number`
  - `isPowerOf2(n: number): boolean`
  - `bitReversalPermutation(data: Float32Array): Float32Array`
  - `bitReversalPermutationInPlace(data: Float32Array): void`
- window functions:
  - `hannWindow(size: number): Float32Array`
  - `hammingWindow(size: number): Float32Array`
  - `blackmanWindow(size: number): Float32Array`
  - `flatTopWindow(size: number): Float32Array`
  - `rectangularWindow(size: number): Float32Array`
  - `applyWindow(signal: Float32Array, window: Float32Array): Float32Array`
  - `applyWindowComplex(signal: Float32Array, window: Float32Array): Float32Array`
- public TypeScript types
- `FFTError` and `FFTErrorCode`

Utility functions must reject invalid shapes instead of returning silently
corrupted output. Window sizes must be positive integers; one-sample windows
return `[1]`. Bit-reversal permutation inputs must be interleaved complex arrays
with a power-of-two number of complex samples.
