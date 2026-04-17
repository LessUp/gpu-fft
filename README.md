# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![Docs](https://img.shields.io/badge/Docs-Bilingual-blue?logo=github)](https://lessup.github.io/gpu-fft/)
[![CI](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml)

English | [简体中文](README.zh-CN.md)

High-performance Fast Fourier Transform library with a WebGPU-accelerated core engine plus CPU-based signal and image processing utilities.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **1D FFT/IFFT** | Support for 2 to 65,536 elements |
| **2D FFT/IFFT** | Image processing with 2D transforms up to 2048×2048 |
| **GPU Acceleration** | WebGPU compute shaders for high performance |
| **CPU Fallback** | Full CPU implementation for non-WebGPU environments |
| **Frequency Filtering** | Low-pass, high-pass, band-pass (Ideal & Gaussian) |
| **Spectrum Analysis** | Real-time audio frequency analysis with windowing |
| **TypeScript** | Full type definitions with strict mode support |
| **Zero Dependencies** | No runtime dependencies |

## 🚀 Quick Start

### Installation

```bash
npm install webgpu-fft
```

### GPU Path (Recommended)

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

// Check WebGPU support
if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();

  // Prepare input (interleaved: [real, imag, real, imag, ...])
  const input = new Float32Array(16); // 8 complex numbers
  for (let i = 0; i < 8; i++) {
    input[i * 2] = Math.sin(i);     // Real part
    input[i * 2 + 1] = 0;           // Imaginary part
  }

  const fftResult = await engine.fft(input);
  const ifftResult = await engine.ifft(fftResult);

  engine.dispose(); // Clean up GPU resources
}
```

### CPU Path (No GPU Required)

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
const spectrum = cpuFFT(input);
const recovered = cpuIFFT(spectrum);
```

## 📖 API Reference

### Core FFT Engine

```typescript
import { createFFTEngine, type FFTEngineConfig } from 'webgpu-fft';

// Create with default options
const engine = await createFFTEngine();

// 1D transforms
const spectrum = await engine.fft(input);
const signal = await engine.ifft(spectrum);

// 2D transforms
const freq2d = await engine.fft2d(input, width, height);
const spatial2d = await engine.ifft2d(freq2d, width, height);

// Clean up
engine.dispose();
```

> ⚠️ **Note**: The current GPU shader only supports `workgroupSize: 256`. The `enableBankConflictOptimization` option is reserved for future use.

### CPU FFT Functions

```typescript
import {
  cpuFFT, cpuIFFT,
  cpuFFT2D, cpuIFFT2D,
  validateFFTInput, validateFFT2DInput
} from 'webgpu-fft';

// 1D transforms
const spectrum = cpuFFT(input);
const signal = cpuIFFT(spectrum);

// 2D transforms
const freq2d = cpuFFT2D(input, width, height);
const spatial2d = cpuIFFT2D(freq2d, width, height);

// Validation
validateFFTInput(input); // Throws on invalid input
```

### Spectrum Analyzer

```typescript
import { createSpectrumAnalyzer } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,     // Must be power of 2
  sampleRate: 44100  // Hz
});

// Analyze audio data (returns dB values)
const spectrum = await analyzer.analyze(audioData);

// Get frequency bin centers
const frequencies = analyzer.getFrequencies();

// Get frequency for specific bin
const freq = analyzer.getFrequency(10); // 10th bin frequency

analyzer.dispose();
```

### Image Filter

```typescript
import { createImageFilter, type FilterType, type FilterShape } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',           // 'lowpass' | 'highpass' | 'bandpass'
  shape: 'gaussian',         // 'ideal' | 'gaussian'
  cutoffFrequency: 0.3,      // 0.0 to 1.0
  bandwidth: 0.1             // For bandpass only
});

// Apply filter (imageData is interleaved complex: [r,i,r,i,...])
const filtered = await filter.apply(imageData, width, height);

filter.dispose();
```

### Window Functions

```typescript
import {
  hannWindow, hammingWindow, blackmanWindow,
  flatTopWindow, rectangularWindow,
  applyWindow, applyWindowComplex
} from 'webgpu-fft';

// Generate window
const window = hannWindow(1024);

// Apply to signal
const windowedReal = applyWindow(signal, window);
const windowedComplex = applyWindowComplex(complexSignal, window);
```

### GPU Detection

```typescript
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft';

// Async full check (verifies adapter availability)
if (await isWebGPUAvailable()) {
  // WebGPU is fully supported
}

// Sync check (only checks API presence)
if (hasWebGPUSupport()) {
  // navigator.gpu exists
}
```

### Complex Number Utilities

```typescript
import {
  complexAdd, complexSub, complexMul,
  complexMagnitude, complexConj, complexScale,
  twiddleFactor, twiddleFactorInverse,
  interleavedToComplex, complexToInterleaved,
  complexApproxEqual,
  naiveDFT, naiveIDFT
} from 'webgpu-fft';
```

### Bit-Reversal Utilities

```typescript
import {
  bitReverse, log2, isPowerOf2,
  bitReversalPermutation, bitReversalPermutationInPlace
} from 'webgpu-fft';
```

### Error Handling

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft';

try {
  await engine.fft(invalidInput);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`[${error.code}] ${error.message}`);
    // Handle specific error codes
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        // Fallback to CPU
        break;
      case FFTErrorCode.INVALID_INPUT_SIZE:
        // Fix input size
        break;
      // ...
    }
  }
}
```

## 🌐 Browser Compatibility

WebGPU is required for GPU acceleration. The following browsers are supported:

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 113+ | ✅ Stable |
| Edge | 113+ | ✅ Stable |
| Firefox | 128+ | ✅ Stable |
| Safari | 17+ | ⚠️ Preview |

> **Note**: Use `isWebGPUAvailable()` to detect support and `cpuFFT`/`cpuIFFT` as fallback.

## 🔧 Algorithm

### Cooley-Tukey Radix-2 DIT

This library implements the classic Cooley-Tukey Radix-2 Decimation-In-Time algorithm:

1. **Bit-Reversal Permutation** - Reorder input data
2. **Butterfly Operations** - log₂(N) stages of parallel butterfly computations
3. **Twiddle Factors** - Pre-computed complex exponentials

### GPU Execution Notes

- Current shader only supports `workgroupSize: 256`
- `enableBankConflictOptimization` enables padding in GPU shared memory to reduce bank conflicts. Performance impact varies by GPU - test on your target hardware.
- **Note:** `SpectrumAnalyzer` and `ImageFilter` use CPU FFT internally. For GPU-accelerated processing, use `FFTEngine` directly.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Coverage

| Module | Coverage |
|--------|----------|
| Shaders | 100% |
| CPU Utilities | 91.55% |
| Apps | 91.62% |
| Complex | 78.5% |
| Core Errors | 100% |

## 🔍 Troubleshooting

### WebGPU Not Available

```
FFTError: WebGPU is not available
```

**Solutions:**
1. Use `isWebGPUAvailable()` to detect and fallback to CPU
2. Update browser to latest version
3. Enable WebGPU flags (Firefox/Safari)
4. Check GPU compatibility

### Invalid Input Size

```
FFTError: Input size must be a power of 2
```

**Solution:** Ensure input length is a power of 2 (2, 4, 8, ..., 65536).

### Input Too Large

```
FFTError: Input size exceeds maximum of 65536
```

**Solution:** Split data into smaller chunks or use CPU implementation.

### Performance Optimization

1. Reuse `FFTEngine` instances (buffer caching)
2. Call `dispose()` when done
3. Use CPU path for small transforms (< 1024 elements)

## 📊 Performance

| Feature | Description |
|---------|-------------|
| **Batched Commands** | Single command buffer per transform |
| **Buffer Reuse** | Same-size transforms reuse GPU buffers |
| **Pipeline Caching** | Compiled shaders are cached |
| **Parallel Execution** | GPU compute shaders |

## 🗺️ Roadmap

### Planned Features

- [ ] 3D FFT support
- [ ] Real-valued FFT optimization (RFFT)
- [ ] GPU-native image filtering
- [ ] Convolution operations
- [ ] WASM fallback

### Known Limitations

- GPU shader only supports `workgroupSize: 256`
- Spectrum analyzer uses CPU FFT internally
- Maximum 1D size: 65,536 elements
- Maximum 2D size: 2048×2048

## 📁 Project Structure

```
src/
├── core/                    # Core GPU engine
│   ├── fft-engine.ts        # Main FFT implementation
│   ├── gpu-resource-manager.ts
│   └── errors.ts            # Custom error types
├── shaders/                 # WGSL shader sources
│   └── sources.ts           # Canonical shader code
├── utils/                   # CPU utilities
│   ├── complex.ts           # Complex number ops
│   ├── bit-reversal.ts      # Bit-reversal utilities
│   ├── cpu-fft.ts           # CPU FFT implementation
│   ├── gpu-detect.ts        # WebGPU detection
│   └── window-functions.ts  # Signal windows
├── apps/                    # Application-level APIs
│   ├── spectrum-analyzer.ts
│   └── image-filter.ts
├── types.ts                 # Type definitions
└── index.ts                 # Public API exports
```

## 📚 References

- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WGSL Specification](https://www.w3.org/TR/WGSL/)
- [GPU Memory Bank Conflicts](https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## 📄 License

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 Acknowledgments

- The WebGPU Working Group for the excellent API design
- The fast-check team for the property-based testing library
- All contributors who have helped improve this library
