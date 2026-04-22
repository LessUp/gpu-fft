# API Specification: WebGPU FFT Library

## Overview

This document defines the public API for the WebGPU FFT Library. All public APIs must be documented with JSDoc comments and exported from `src/index.ts`.

## Core FFT Engine

### `createFFTEngine()`

Creates a new GPU-accelerated FFT engine instance.

```typescript
async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine>;
```

**Parameters:**
- `config` (optional) - Configuration options

**Returns:** Promise resolving to an initialized FFT engine

**Throws:** `FFTError` with code `WEBGPU_NOT_AVAILABLE` if WebGPU is not supported

### `FFTEngine` Interface

```typescript
interface FFTEngine {
  fft(input: Float32Array): Promise<Float32Array>;
  ifft(input: Float32Array): Promise<Float32Array>;
  fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  dispose(): void;
}
```

## CPU FFT Functions

```typescript
function cpuFFT(input: Float32Array): Float32Array;
function cpuIFFT(input: Float32Array): Float32Array;
function cpuFFT2D(input: Float32Array, width: number, height: number): Float32Array;
function cpuIFFT2D(input: Float32Array, width: number, height: number): Float32Array;
```

## Spectrum Analyzer

```typescript
interface SpectrumAnalyzer {
  analyze(audioData: Float32Array): Promise<Float32Array>;
  getFrequencies(): Float32Array;
  getFrequency(binIndex: number): number;
  dispose(): void;
}
```

## Image Filter

```typescript
interface ImageFilter {
  apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array>;
  dispose(): void;
}
```

## Window Functions

```typescript
function hannWindow(size: number): Float32Array;
function hammingWindow(size: number): Float32Array;
function blackmanWindow(size: number): Float32Array;
function flatTopWindow(size: number): Float32Array;
function rectangularWindow(size: number): Float32Array;
function applyWindow(signal: Float32Array, window: Float32Array): Float32Array;
function applyWindowComplex(signal: Float32Array, window: Float32Array): Float32Array;
```

## GPU Detection

```typescript
async function isWebGPUAvailable(): Promise<boolean>;
function hasWebGPUSupport(): boolean;
```

## Complex Number Utilities

```typescript
function complexAdd(a: Complex, b: Complex): Complex;
function complexSub(a: Complex, b: Complex): Complex;
function complexMul(a: Complex, b: Complex): Complex;
function complexMagnitude(c: Complex): number;
function complexConj(c: Complex): Complex;
function complexScale(c: Complex, s: number): Complex;
function twiddleFactor(k: number, N: number): Complex;
function twiddleFactorInverse(k: number, N: number): Complex;
function interleavedToComplex(data: Float32Array): Complex[];
function complexToInterleaved(data: Complex[]): Float32Array;
function complexApproxEqual(a: Complex, b: Complex, tolerance?: number): boolean;
function naiveDFT(input: Float32Array): Float32Array;
function naiveIDFT(input: Float32Array): Float32Array;
```

## Bit-Reversal Utilities

```typescript
function bitReverse(x: number, bits: number): number;
function log2(x: number): number;
function isPowerOf2(x: number): boolean;
function bitReversalPermutation(data: Float32Array, bits: number): Float32Array;
function bitReversalPermutationInPlace(data: Float32Array, bits: number): void;
```

## Error Handling

```typescript
enum FFTErrorCode {
  WEBGPU_NOT_AVAILABLE = 'WEBGPU_NOT_AVAILABLE',
  INVALID_INPUT_SIZE = 'INVALID_INPUT_SIZE',
  INPUT_TOO_LARGE = 'INPUT_TOO_LARGE',
  BUFFER_ALLOCATION_FAILED = 'BUFFER_ALLOCATION_FAILED',
  SHADER_COMPILATION_FAILED = 'SHADER_COMPILATION_FAILED',
  DEVICE_LOST = 'DEVICE_LOST',
}

class FFTError extends Error {
  constructor(message: string, code: FFTErrorCode);
  readonly code: FFTErrorCode;
}
```

## Type Definitions

```typescript
interface Complex { real: number; imag: number; }
interface FFTEngineConfig { enableBankConflictOptimization: boolean; workgroupSize: number; }
type FilterType = 'lowpass' | 'highpass' | 'bandpass';
type FilterShape = 'ideal' | 'gaussian';
```
