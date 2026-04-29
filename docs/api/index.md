# API Reference Overview

Complete reference for the public APIs exported by `webgpu-fft`.

> These API pages are maintained source documentation inside `docs/`. Built site output under `docs/.vitepress/dist` is generated and is not the documentation source of truth.

## Core APIs

| API | Description |
|-----|-------------|
| [`FFTEngine`](./fft-engine) | Main GPU-accelerated FFT engine with complex and real-input APIs |
| [`cpuFFT`](./cpu-fft) | CPU complex FFT fallback plus real-input helpers |

## Application APIs

| API | Description |
|-----|-------------|
| [`SpectrumAnalyzer`](./spectrum-analyzer) | CPU-based real-time audio frequency analysis |
| [`ImageFilter`](./image-filter) | CPU-based frequency-domain image filtering |

## Utilities

| API | Description |
|-----|-------------|
| [`Window Functions`](./window-functions) | Hann, Hamming, Blackman, Flat Top, and Rectangular windows |
| [`Complex Numbers`](./complex) | Complex arithmetic helpers |
| [`GPU Detection`](./gpu-detect) | WebGPU availability checks |
| [`Bit Reversal`](./bit-reversal) | Bit-reversal permutation utilities |

## Types

All TypeScript types are exported for use in your applications:

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
