# API Reference Overview

Complete reference for all public APIs exported by the WebGPU FFT Library.

## Core APIs

| API | Description |
|-----|-------------|
| [`FFTEngine`](./fft-engine) | Main GPU-accelerated FFT engine |
| [`cpuFFT`](./cpu-fft) | CPU-based FFT fallback |

## Application APIs

| API | Description |
|-----|-------------|
| [`SpectrumAnalyzer`](./spectrum-analyzer) | Real-time audio frequency analysis |
| [`ImageFilter`](./image-filter) | Frequency domain image filtering |

## Utilities

| API | Description |
|-----|-------------|
| [`Window Functions`](./window-functions) | Hann, Hamming, Blackman windows |
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
  await engine.fft1D(invalidData, FFTDirection.Forward);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`FFT Error [${error.code}]: ${error.message}`);
  }
}
```

## Next Steps

- Explore specific API pages from the sidebar
- See the [Quick Start Guide](/setup/quick-start) for getting started
- Read the [Architecture Overview](/architecture/overview) for internal design
