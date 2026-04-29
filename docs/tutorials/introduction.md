# Introduction

WebGPU FFT Library provides GPU-accelerated 1D/2D complex FFT plus real-input RFFT APIs for JavaScript and TypeScript, with a complete CPU fallback path.

## What is FFT?

The Fast Fourier Transform (FFT) converts signals between the time or spatial domain and the frequency domain. Common uses include:

- **Digital Signal Processing**: filtering and spectral analysis
- **Audio Processing**: spectrum analyzers and tone detection
- **Image Processing**: frequency-domain filtering and inspection
- **Scientific Computing**: repeated transform workloads on numeric grids

## Library Surfaces

| Feature | Description | GPU | CPU |
|---------|-------------|-----|-----|
| 1D FFT / IFFT | Complex FFT for 1D arrays | ✅ | ✅ |
| 2D FFT / IFFT | Complex FFT for 2D data | ✅ | ✅ |
| Real-input FFT | RFFT / IRFFT for 1D and 2D real-valued data | ✅ | ✅ |
| Spectrum Analysis | Audio frequency analysis utility | ❌ | ✅ |
| Image Filtering | Frequency-domain image filter utility | ❌ | ✅ |

## Why WebGPU FFT?

- **GPU acceleration** for large transform workloads where setup cost is justified
- **Contract-first real-input APIs** so callers do not have to manually pack complex buffers
- **CPU fallback** for environments without WebGPU
- **Zero runtime dependencies**
- **TypeScript-first exports**

## Supported Sizes

- **1D complex FFT:** 2 to 65,536 complex samples
- **1D real-input FFT:** 2 to 65,536 real samples
- **2D FFT / RFFT:** up to 2048×2048 with power-of-2 dimensions

## Performance Evaluation

Use `npm run benchmark` to collect measured CPU results in any environment and measured WebGPU results only when WebGPU is available. The benchmark intentionally avoids static or speculative “expected performance” claims.

## Next Steps

- [API Reference](/api/index)
- [Quick Start](/setup/quick-start)
- [Architecture Overview](/architecture/overview)
