# API Reference Overview

Complete reference for the public APIs exported by `webgpu-fft`.

> These API pages are maintained source documentation inside `docs/`. Built site output under `docs/.vitepress/dist` is generated and is not the documentation source of truth.

## Package Exports

The library provides three entry points:

| Entry | Description |
|-------|-------------|
| `webgpu-fft` | Core FFT APIs (engines, CPU fallback, types, errors) |
| `webgpu-fft/utils` | Utility functions (complex, bit-reversal, windows) |
| `webgpu-fft/validation` | Validation helpers |

## Core APIs (`webgpu-fft`)

| API | Description |
|-----|-------------|
| [`FFTEngine`](./fft-engine) | Main GPU-accelerated FFT engine with complex and real-input APIs |
| [`cpuFFT`](./cpu-fft) | CPU complex FFT fallback plus real-input helpers |
| `SpectrumAnalyzer` | CPU-based real-time audio frequency analysis |
| `ImageFilter` | CPU-based frequency-domain image filtering |

### GPU Detection

```ts
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft';

// Async full check (verifies adapter can be obtained)
if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();
}

// Sync basic check (only checks navigator.gpu existence)
if (hasWebGPUSupport()) {
  console.log('WebGPU API detected');
}
```

## Utilities (`webgpu-fft/utils`)

```ts
import {
  // Complex operations
  complexAdd, complexMul, complexMagnitude, complexConj,
  // Bit-reversal
  bitReverse, log2, isPowerOf2, bitReversalPermutation,
  // Window functions
  hannWindow, hammingWindow, blackmanWindow, applyWindow
} from 'webgpu-fft/utils';
```

| API | Description |
|-----|-------------|
| [`Window Functions`](./window-functions) | Hann, Hamming, Blackman, Flat Top, and Rectangular windows |
| [`Complex Numbers`](./complex) | Complex arithmetic helpers |
| [`Bit Reversal`](./bit-reversal) | Bit-reversal permutation utilities |

## Validation (`webgpu-fft/validation`)

```ts
import {
  validateFFT, validateFFT2D,
  validateRealFFTInput, validateRealIFFTInput
} from 'webgpu-fft/validation';
```

## Types

All TypeScript types are exported from the main entry:

```ts
import type {
  FFTEngineConfig,
  SpectrumAnalyzerConfig,
  FilterType,
  FilterShape,
  ImageFilterConfig,
  Complex,
} from 'webgpu-fft';
```

## Error Handling

The library uses custom error classes for clear error messages:

```ts
import { FFTError, FFTErrorCode } from 'webgpu-fft';

try {
  await engine.fft(invalidData);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`FFT Error [${error.code}]: ${error.message}`);
    if (error.code === FFTErrorCode.INVALID_INPUT_SIZE) {
      console.error('Input size must be a power of 2');
    }
  }
}
```

## Next Steps

- Explore specific API pages from the sidebar
- See the [Quick Start Guide](/setup/quick-start) for getting started
- Read the [Architecture Overview](/architecture/overview) for internal design
