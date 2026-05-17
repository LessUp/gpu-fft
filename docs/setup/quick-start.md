# Quick Start

> This page is the shortest hands-on route into the library. It keeps the public contract explicit: the FFT core can use WebGPU, while spectrum analysis and image filtering remain CPU-only utilities.

<div class="guide-summary">
  <strong>Start here if:</strong> you want to install the package, choose the right execution path, and see the minimum code shape before reading deeper architecture or benchmark material.
</div>

## Capability boundary before code

- **GPU path:** `createFFTEngine()` and the FFT / IFFT / RFFT surfaces
- **CPU path:** `cpuFFT()`, `cpuIFFT()`, `cpuRFFT()`, `cpuIRFFT()`, and their 2D companions
- **CPU-only utilities:** `createSpectrumAnalyzer()` and `createImageFilter()`

## Installation

```bash
npm install webgpu-fft
```

## Basic GPU path

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

async function runFFT() {
  if (!(await isWebGPUAvailable())) {
    throw new Error('WebGPU not available, use the CPU fallback instead');
  }

  const engine = await createFFTEngine();
  const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);

  const spectrum = await engine.fft(input);
  const recovered = await engine.ifft(spectrum);

  engine.dispose();
  return recovered;
}
```

## CPU fallback

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
const spectrum = cpuFFT(input);
const recovered = cpuIFFT(spectrum);
```

## Real-input path

For real-valued signals, use the dedicated real-input API instead of packing complex pairs by hand:

```typescript
import { createFFTEngine, cpuIRFFT, cpuRFFT } from 'webgpu-fft';

const input = new Float32Array([0, 1, 0, -1, 0, 1, 0, -1]);

const cpuSpectrum = cpuRFFT(input);
const cpuRecovered = cpuIRFFT(cpuSpectrum);

const engine = await createFFTEngine();
const gpuSpectrum = await engine.rfft(input);
const gpuRecovered = await engine.irfft(gpuSpectrum);
engine.dispose();
```

## 2D FFT path

```typescript
import { createFFTEngine } from 'webgpu-fft';

async function processImage(imageData: Float32Array, width: number, height: number) {
  const engine = await createFFTEngine();
  const spectrum = await engine.fft2d(imageData, width, height);
  const recovered = await engine.ifft2d(spectrum, width, height);
  engine.dispose();
  return recovered;
}
```

## Error handling

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft';

try {
  const engine = await createFFTEngine();
  await engine.fft(invalidInput);
} catch (error) {
  if (error instanceof FFTError) {
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        console.error('WebGPU not supported');
        break;
      case FFTErrorCode.INVALID_INPUT_SIZE:
        console.error('Input size must be a power of 2');
        break;
      default:
        console.error(`FFT Error: ${error.message}`);
    }
  }
}
```

## Where to go next

| If you want | Next page |
| --- | --- |
| The shortest evaluation path | [Guided Start](/en/guides/getting-started) |
| Browser readiness and fallback strategy | [Browser Support](/setup/browser-support) |
| The execution model | [Architecture Overview](/architecture/overview) |
| Empirical context | [Benchmarks](/showcase/benchmarks) |
