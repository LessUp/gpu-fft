# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/Docs-Bilingual-blue?logo=github)](https://lessup.github.io/gpu-fft/)

English | [简体中文](README.zh-CN.md)

> **High-performance GPU-accelerated Fast Fourier Transform library** for JavaScript/TypeScript. The package combines a WebGPU FFT core, real-input RFFT/IRFFT APIs, and CPU-based utilities for spectrum analysis and frequency-domain image filtering, all with zero runtime dependencies.

## ⚡ Why WebGPU FFT?

| | **webgpu-fft** | cpu-only libs | Python (numpy) |
|---|---|---|---|
| **GPU Acceleration** | ✅ WebGPU shaders | ❌ CPU only | ❌ CPU only |
| **Real-input FFT APIs** | ✅ RFFT / IRFFT / 2D RFFT | Varies | Varies |
| **Frequency Filtering** | ✅ Built-in (CPU utility) | Manual | Manual |
| **Spectrum Analysis** | ✅ Built-in (CPU utility) | Manual | Manual |
| **Browser Native** | ✅ No WASM | ✅ | ❌ Server |
| **Zero Dependencies** | ✅ | ✅ | ❌ |
| **TypeScript** | ✅ Strict mode | Varies | ❌ |

Measured performance depends on your hardware and runtime. Use the repository benchmark to collect CPU and WebGPU results in your current environment.

## 🚀 Quick Start

### Installation

```bash
npm install webgpu-fft
```

### Basic 1D FFT

```typescript
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();

// Input: interleaved [real, imag, real, imag, ...]
const signal = new Float32Array(8 * 2);
for (let i = 0; i < 8; i++) {
  signal[i * 2] = Math.sin(i);   // Real
  signal[i * 2 + 1] = 0;         // Imag
}

const spectrum = await engine.fft(signal);
const recovered = await engine.ifft(spectrum);

engine.dispose(); // Release GPU resources
```

### CPU Fallback (No GPU Required)

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const spectrum = cpuFFT(signal);
const recovered = cpuIFFT(spectrum);
```

### Real-Valued FFT (RFFT / IRFFT)

```typescript
import { createFFTEngine, createRealFFTBackend, CPUFFTBackend } from 'webgpu-fft';

const realSignal = new Float32Array([0, 1, 0, -1, 0, 1, 0, -1]);

// CPU path
const cpuRealFFT = createRealFFTBackend(new CPUFFTBackend());
const cpuSpectrum = cpuRealFFT.rfft(realSignal); // N / 2 + 1 complex bins
const cpuRecovered = cpuRealFFT.irfft(cpuSpectrum);

// GPU path
const engine = await createFFTEngine();
const gpuSpectrum = await engine.rfft(realSignal);
const gpuRecovered = await engine.irfft(gpuSpectrum);
engine.dispose();
```

## 📊 Performance

Run the repository benchmark to collect measured results for your current runtime:

```bash
npm run benchmark
```

The benchmark reports:

- measured CPU FFT results in every environment
- measured WebGPU FFT results only when WebGPU is actually available
- no speculative or static “expected performance” section

## 🎯 Use Cases

### Audio Spectrum Analysis

```typescript
import { createSpectrumAnalyzer, WindowType } from 'webgpu-fft';

const analyzer = createSpectrumAnalyzer({
  fftSize: 2048,
  windowType: WindowType.Hann,
  sampleRate: 44100,
});

const audioBuffer = new Float32Array(2048);
// ... fill from Web Audio API ...

const spectrum = analyzer.analyze(audioBuffer); // dB values per bin
const frequencies = analyzer.getFrequencies();  // Hz per bin
```

> **Note:** `createSpectrumAnalyzer()` is currently CPU-only and does not use the GPU FFT path internally.

### Frequency-Domain Image Filtering

```typescript
import { createImageFilter } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',
  shape: 'gaussian',
  cutoffFrequency: 0.3,
});

// Low-pass filter (blur)
const blurred = await filter.apply(imageData, 512, 512);

// High-pass filter (edge detection)
const edgeFilter = await createImageFilter({
  type: 'highpass',
  shape: 'gaussian',
  cutoffFrequency: 0.1,
});
const edges = await edgeFilter.apply(imageData, 512, 512);

filter.dispose();
```

> **Note:** `createImageFilter()` is currently CPU-only and uses the CPU 2D FFT implementation internally.

## 📖 API Overview

### Core Engine

| Method | Description | Max Size |
|--------|-------------|----------|
| `fft(data)` | 1D forward FFT | 65,536 |
| `ifft(data)` | 1D inverse FFT | 65,536 |
| `rfft(data)` | 1D real-input FFT | 65,536 real samples |
| `irfft(data)` | 1D inverse real-input FFT | 65,536 real samples |
| `fft2d(data, w, h)` | 2D forward FFT | 2048×2048 |
| `ifft2d(data, w, h)` | 2D inverse FFT | 2048×2048 |
| `rfft2d(data, w, h)` | 2D real-input FFT | 2048×2048 real samples |
| `irfft2d(data, w, h)` | 2D inverse real-input FFT | 2048×2048 real samples |
| `dispose()` | Release GPU resources | - |

### Utilities

| API | Purpose |
|-----|---------|
| `cpuFFT()` / `cpuIFFT()` | CPU-based FFT fallback |
| `createRealFFTBackend()` | Upgrade any complex FFT backend to the `RealFFTBackend` seam |
| `cpuRFFT()` / `cpuIRFFT()` | CPU real-input FFT shortcuts |
| `cpuRFFT2D()` / `cpuIRFFT2D()` | CPU 2D real-input FFT shortcuts |
| `createSpectrumAnalyzer()` | Real-time audio analysis (CPU-only utility) |
| `createImageFilter()` | Frequency-domain filtering (CPU-only utility) |
| `isWebGPUAvailable` | Check GPU support |
| Window functions | Hann, Hamming, Blackman, FlatTop, Rectangular |
| Complex utilities | Add, Mul, Magnitude, Twiddle factors |

### Input Formats

Complex FFT APIs expect **interleaved complex data**:
```typescript
// [real₀, imag₀, real₁, imag₁, real₂, imag₂, ...]
const data = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
// Represents: 1+0i, 2+0i, 3+0i, 4+0i
```

Real-input FFT APIs accept plain real-valued `Float32Array` samples and return compressed half-spectrum complex data.

### Error Handling

```typescript
import { FFTError } from 'webgpu-fft';

try {
  await engine.fft(invalidData);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`[${error.code}] ${error.message}`);
  }
}
```

> 📚 **Complete API Reference**: See the [documentation site](https://lessup.github.io/gpu-fft/api/index) for detailed function signatures, types, and examples.

## 🌐 Browser Compatibility

| Browser | Version | GPU | CPU |
|---------|---------|-----|-----|
| Chrome | 113+ | ✅ Stable | ✅ |
| Edge | 113+ | ✅ Stable | ✅ |
| Firefox | 128+ | ✅ Stable | ✅ |
| Safari | 17+ | ⚠️ Preview | ✅ |

> **Tip**: Use `isWebGPUAvailable` to detect support at runtime and gracefully fallback to CPU when needed.

## 📦 Package Info

| Metric | Value |
|--------|-------|
| **Bundle Size (ESM)** | ~27 kB |
| **Bundle Size (CJS)** | ~22 kB |
| **Runtime Deps** | 0 |
| **Node Version** | ≥18.0.0 |
| **Exports** | ESM + CJS + Types |

## 🧪 Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint & format
npm run lint:fix
npm run format

# Run benchmarks
npm run benchmark

# Local docs
npm run docs:dev

# Local demo
npx serve examples/web
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| `WebGPU is not available` | Update browser, or use `cpuFFT` fallback |
| `Input size must be power of 2` | Pad or truncate to nearest power of 2 |
| `Input size exceeds maximum` | Split data or use CPU implementation |
| Slow first run | Shader compilation overhead — reuse engine |

> 📖 **Full troubleshooting guide**: [Documentation → Troubleshooting](https://lessup.github.io/gpu-fft/setup/browser-support)

## 📚 Documentation & Resources

The [documentation site](https://lessup.github.io/gpu-fft/) goes beyond the README:

- [Benchmarks](https://lessup.github.io/gpu-fft/showcase/benchmarks) — measured CPU vs WebGPU performance for your hardware
- [Architecture Decisions](https://lessup.github.io/gpu-fft/showcase/decisions) — why Radix-2, why WebGPU, and other ADRs
- [Reference Hub](https://lessup.github.io/gpu-fft/reference/index) — academic papers, specifications, and related projects
- [FFT Playground](https://lessup.github.io/gpu-fft/playground/index) — interactive FFT explorer in the browser

## 🗺️ Roadmap

These are exploratory directions, not committed deliverables:

- [ ] 3D FFT support
- [x] Real-valued FFT APIs (initial contract-first implementation)
- [ ] GPU-native image filtering (experimental)
- [ ] Convolution operations
- [ ] WASM fallback for non-WebGPU environments

## 🤝 Contributing

Contributions welcome! Read the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

This project follows **OpenSpec-driven development** — see [`openspec/specs/`](openspec/specs/) for the canonical repository specifications and change workflow.

## 📄 License

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 Acknowledgments

- [WebGPU Working Group](https://www.w3.org/TR/webgpu/) for the excellent API
- [fast-check](https://github.com/dubzzz/fast-check) for property-based testing
- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
