# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/Docs-Bilingual-blue?logo=github)](https://lessup.github.io/gpu-fft/)

English | [简体中文](README.zh-CN.md)

> **High-performance Fast Fourier Transform library** with WebGPU compute shaders and CPU fallback. Supports 1D/2D FFT, frequency-domain filtering, and real-time spectrum analysis.

## ⚡ Why WebGPU FFT?

| | **webgpu-fft** | cpu-only libs | Python (numpy) |
|---|---|---|---|
| **GPU Acceleration** | ✅ WebGPU shaders | ❌ CPU only | ❌ CPU only |
| **1D FFT (65K)** | ~3ms | ~300ms | ~50ms |
| **2D FFT (1024²)** | ~8ms | ~3s | ~100ms |
| **Frequency Filtering** | ✅ Built-in | Manual | Manual |
| **Spectrum Analysis** | ✅ Built-in | Manual | Manual |
| **Browser Native** | ✅ No WASM | ✅ | ❌ Server |
| **Zero Dependencies** | ✅ | ✅ | ❌ |
| **TypeScript** | ✅ Strict mode | Varies | ❌ |

**Up to 92x faster** than CPU for large FFTs, with full TypeScript support and zero dependencies.

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

const spectrum = await engine.fft1D(signal);
const recovered = await engine.ifft1D(spectrum);

engine.dispose(); // Release GPU resources
```

### CPU Fallback (No GPU Required)

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const spectrum = cpuFFT(signal);
const recovered = cpuIFFT(spectrum);
```

## 📊 Performance

### 1D FFT Speed

| Size | GPU | CPU | Speedup |
|------|-----|-----|---------|
| 1,024 | 0.18ms | 2.3ms | **13x** |
| 4,096 | 0.35ms | 11.5ms | **33x** |
| 16,384 | 0.89ms | 58.2ms | **65x** |
| 65,536 | 3.24ms | 298.7ms | **92x** |

### 2D FFT Speed

| Image Size | GPU | CPU | Speedup |
|------------|-----|-----|---------|
| 256×256 | 1.56ms | 156ms | **100x** |
| 1024×1024 | 8.23ms | 2.9s | **358x** |

*Benchmarked on RTX 3080 + i9-10900K. Includes data transfer overhead.*

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

### Frequency-Domain Image Filtering

```typescript
import { createImageFilter, FilterType } from 'webgpu-fft';

const filter = await createImageFilter({ width: 512, height: 512 });

// Low-pass filter (blur)
const blurred = await filter.applyFilter(imageData, {
  type: FilterType.LowPass,
  cutoff: 0.3,
});

// High-pass filter (edge detection)
const edges = await filter.applyFilter(imageData, {
  type: FilterType.HighPass,
  cutoff: 0.1,
  shape: 'gaussian',
});

filter.dispose();
```

## 📖 API Overview

### Core Engine

| Method | Description | Max Size |
|--------|-------------|----------|
| `fft1D(data)` | 1D forward FFT | 65,536 |
| `ifft1D(data)` | 1D inverse FFT | 65,536 |
| `fft2D(data, w, h)` | 2D forward FFT | 2048×2048 |
| `ifft2D(data, w, h)` | 2D inverse FFT | 2048×2048 |
| `dispose()` | Release GPU resources | - |

### Utilities

| API | Purpose |
|-----|---------|
| `cpuFFT()` / `cpuIFFT()` | CPU-based FFT fallback |
| `createSpectrumAnalyzer()` | Real-time audio analysis |
| `createImageFilter()` | Frequency-domain filtering |
| `isWebGPUAvailable` | Check GPU support |
| Window functions | Hann, Hamming, Blackman, FlatTop |
| Complex utilities | Add, Mul, Magnitude, Twiddle factors |

### Input Format

All FFT functions expect **interleaved complex data**:
```typescript
// [real₀, imag₀, real₁, imag₁, real₂, imag₂, ...]
const data = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
// Represents: 1+0i, 2+0i, 3+0i, 4+0i
```

### Error Handling

```typescript
import { FFTError } from 'webgpu-fft';

try {
  await engine.fft1D(invalidData);
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

Always use `isWebGPUAvailable` to detect support and fallback to CPU.

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

## 🗺️ Roadmap

- [ ] 3D FFT support
- [ ] Real-valued FFT optimization (RFFT)
- [ ] GPU-native image filtering
- [ ] Convolution operations
- [ ] WASM fallback

## 🤝 Contributing

Contributions welcome! Read the [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

This project follows **Spec-Driven Development** — see `/specs/` for product requirements and architecture RFCs.

## 📄 License

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 Acknowledgments

- [WebGPU Working Group](https://www.w3.org/TR/webgpu/) for the excellent API
- [fast-check](https://github.com/dubzzz/fast-check) for property-based testing
- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
