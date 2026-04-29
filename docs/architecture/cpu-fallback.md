# CPU Fallback Implementation

How the library behaves when WebGPU is unavailable.

## Overview

The library ships a complete CPU FFT path for environments where WebGPU cannot be initialized. This fallback covers:

- 1D and 2D complex FFT / IFFT
- 1D and 2D real-input RFFT / IRFFT
- CPU-only utilities such as spectrum analysis and image filtering

## Detection

```ts
import { createFFTEngine, cpuFFT, isWebGPUAvailable } from 'webgpu-fft';

if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();
  // Use GPU FFT
} else {
  const spectrum = cpuFFT(signal);
  // Use CPU FFT
}
```

## CPU APIs

```ts
import { cpuFFT, cpuIFFT, cpuRFFT, cpuIRFFT } from 'webgpu-fft';

const spectrum = cpuFFT(complexSignal);
const restoredComplex = cpuIFFT(spectrum);

const halfSpectrum = cpuRFFT(realSignal);
const restoredReal = cpuIRFFT(halfSpectrum);
```

## Implementation Notes

- The CPU path uses radix-2 Cooley-Tukey FFT logic.
- Real-input APIs are implemented as contract-first wrappers around the complex FFT path.
- `createSpectrumAnalyzer()` and `createImageFilter()` are CPU-only utilities and remain outside the GPU FFT execution path.

## Performance Notes

Run `npm run benchmark` to collect measured CPU results in the current environment. WebGPU results are reported only when WebGPU is actually available during that run.

## Limitations

- CPU execution is slower for large transforms than the GPU path on supported hardware.
- Real-input CPU APIs are correctness-first wrappers, not dedicated optimized kernels.

## Related

- [FFTEngine](../api/fft-engine) — GPU FFT engine
- [Architecture Overview](./overview) — High-level architecture
