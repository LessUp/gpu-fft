# Introduction

WebGPU FFT Library is a high-performance Fast Fourier Transform (FFT) library for JavaScript and TypeScript, providing GPU acceleration through WebGPU compute shaders with a full CPU fallback implementation.

## What is FFT?

The Fast Fourier Transform (FFT) is an algorithm that computes the Discrete Fourier Transform (DFT) of a sequence, or its inverse (IFFT). Fourier analysis converts a signal from its original domain (often time or space) to a representation in the frequency domain and vice versa.

Common applications include:
- **Digital Signal Processing (DSP)**: Filtering, spectral analysis
- **Audio Processing**: Spectrum analyzers, equalizers, pitch detection
- **Image Processing**: Filtering, compression, convolution
- **Communications**: Modulation/demodulation, channel estimation
- **Scientific Computing**: Solving differential equations

## Why WebGPU FFT?

### 🚀 GPU Acceleration

WebGPU FFT leverages the power of modern GPUs through WebGPU compute shaders. This provides:

- **Parallel Processing**: Thousands of simultaneous butterfly operations
- **High Memory Bandwidth**: Optimized for large data throughput
- **Low Latency**: Minimal CPU overhead for GPU operations

### 🔄 Automatic Fallback

When WebGPU is not available, the library seamlessly falls back to a highly optimized CPU implementation:

```typescript
import { isWebGPUAvailable, createFFTEngine, cpuFFT } from 'webgpu-fft'

if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine()
  // Use GPU
} else {
  // Use CPU
  const spectrum = cpuFFT(input)
}
```

### 🔷 TypeScript First

Full TypeScript support with:
- Strict type checking compatibility
- Detailed type definitions
- IntelliSense support
- JSDoc comments

### 📦 Zero Dependencies

No runtime dependencies means:
- Smaller bundle sizes
- No dependency conflicts
- Faster installation
- Predictable behavior

## Features

| Feature | Description | GPU | CPU |
|---------|-------------|-----|-----|
| 1D FFT | Complex FFT for 1D arrays | ✅ | ✅ |
| 1D IFFT | Inverse FFT | ✅ | ✅ |
| 2D FFT | Image/2D data processing | ✅ | ✅ |
| Spectrum Analysis | Audio frequency analysis | ⚠️¹ | ✅ |
| Image Filtering | Frequency domain filters | ⚠️¹ | ✅ |
| Window Functions | Hann, Hamming, Blackman | ✅ | ✅ |

¹ Uses CPU FFT internally

## Supported Sizes

### 1D FFT
- **Range**: 2 to 65,536 elements (power of 2)
- **Optimal GPU**: 1,024 to 65,536 elements
- **Optimal CPU**: 2 to 1,024 elements

### 2D FFT
- **Maximum**: 2048×2048 pixels
- **Format**: Interleaved complex numbers
- **Algorithm**: Row-column decomposition

## Performance Comparison

Typical performance on an NVIDIA RTX 3080:

| Size | CPU (ms) | GPU (ms) | Speedup |
|------|----------|----------|---------|
| 1,024 | 0.5 | 0.3 | 1.7× |
| 4,096 | 3.0 | 0.5 | 6× |
| 16,384 | 15.0 | 1.0 | 15× |
| 65,536 | 80.0 | 3.0 | 27× |

*Results may vary based on hardware and browser implementation.*

## Next Steps

- [Quick Start Guide](./quick-start) - Get up and running in minutes
- [API Reference](/api/) - Complete API documentation
- [Examples](/examples/) - Practical code examples
