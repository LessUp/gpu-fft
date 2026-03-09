# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)

English | [简体中文](README.zh-CN.md)

High-performance Fast Fourier Transform library using WebGPU compute shaders for GPU-accelerated signal and image processing.

## ✨ Features

- **1D FFT/IFFT** - Support for 2 to 65,536 elements
- **2D FFT/IFFT** - Image processing with 2D transforms up to 2048×2048
- **Bank Conflict Optimization** - Eliminates GPU shared memory access conflicts
- **Bit-Reversal Permutation** - Efficient parallel bit-reversal implementation
- **Frequency Domain Filtering** - Low-pass/high-pass filters (Ideal and Gaussian)
- **Audio Spectrum Analysis** - Real-time spectrum analysis with Hann window
- **TypeScript** - Full type definitions included
- **Property-Based Testing** - Comprehensive correctness verification with fast-check

## 🚀 Quick Start

### Installation

```bash
npm install webgpu-fft
```

### Basic Usage

```typescript
import { createFFTEngine } from 'webgpu-fft';

// Create FFT engine
const engine = await createFFTEngine();

// Prepare input data (interleaved format: [real, imag, real, imag, ...])
const input = new Float32Array(16); // 8 complex numbers
for (let i = 0; i < 8; i++) {
  input[i * 2] = Math.sin(i);     // Real part
  input[i * 2 + 1] = 0;           // Imaginary part
}

// Compute FFT
const fftResult = await engine.fft(input);

// Compute IFFT
const ifftResult = await engine.ifft(fftResult);

// Clean up resources
engine.dispose();
```

## 📖 API Reference

### FFT Engine

```typescript
// Create with default options
const engine = await createFFTEngine();

// Create with custom options
const engine = await createFFTEngine({
  enableBankConflictOptimization: true,
  workgroupSize: 256
});

// 1D FFT
const result = await engine.fft(input);
const inverse = await engine.ifft(result);

// 2D FFT
const result2d = await engine.fft2d(input, width, height);
const inverse2d = await engine.ifft2d(result2d, width, height);

// Clean up
engine.dispose();
```

### Spectrum Analyzer

```typescript
import { createSpectrumAnalyzer } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,
  sampleRate: 44100
});

// Analyze audio data (returns dB values)
const spectrum = await analyzer.analyze(audioData);

// Get frequency bins
const frequencies = analyzer.getFrequencies();

analyzer.dispose();
```

### Image Filter

```typescript
import { createImageFilter } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',      // 'lowpass' or 'highpass'
  shape: 'gaussian',    // 'ideal' or 'gaussian'
  cutoffFrequency: 0.3  // 0.0 to 1.0
});

// Apply filter to image
const filtered = await filter.apply(imageData, width, height);

filter.dispose();
```

## 🌐 Browser Compatibility

WebGPU is required. The following browsers are supported:

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 113+ | ✅ Stable |
| Edge | 113+ | ✅ Stable |
| Firefox | Nightly | ⚠️ Behind flag |
| Safari | 17+ | ⚠️ Preview |

### Checking WebGPU Support

```typescript
if (!navigator.gpu) {
  console.error('WebGPU is not supported in this browser');
  // Provide fallback or show error message
}
```

## 🔧 Algorithm Implementation

### Cooley-Tukey Radix-2 DIT

This library implements the classic Cooley-Tukey Radix-2 Decimation-In-Time algorithm:

1. **Bit-Reversal Permutation** - Reorder input data
2. **Butterfly Operations** - log₂(N) stages of parallel butterfly computations
3. **Twiddle Factors** - Pre-computed complex exponentials

### Bank Conflict Optimization

GPU shared memory typically has 32 banks. When multiple threads access the same bank simultaneously, conflicts occur. This library eliminates conflicts through padding:

```
Standard Layout (with conflicts):
Index:  0   1   2  ... 31  32  33 ...
Bank:   0   1   2  ... 31   0   1 ...  ← Conflict!

Padded Layout (no conflicts):
Index:  0   1   2  ... 31  PAD  32  33 ...
Bank:   0   1   2  ... 31   X    1   2 ...  ← No conflict!
```

## 🧪 Testing

Run all tests (including property-based tests):

```bash
npm test
```

Test coverage includes:
- ✅ Complex arithmetic correctness (Property 5-8)
- ✅ Bit-reversal round-trip (Property 3-4)
- ✅ FFT matches DFT definition (Property 2)
- ✅ FFT/IFFT round-trip (Property 1, 9)
- ✅ Output format validation (Property 16)
- ✅ Error handling (Property 17)
- ✅ Filter attenuation characteristics (Property 10-11)
- ✅ Spectrum analyzer (Property 12-15)

## 🔍 Troubleshooting

### WebGPU Not Available

**Problem**: `FFTError: WebGPU is not available`

**Solutions**:
1. Update your browser to the latest version
2. Enable WebGPU flags in browser settings (for Firefox/Safari)
3. Check if your GPU supports WebGPU
4. Try a different browser

### Invalid Input Size

**Problem**: `FFTError: Input size must be a power of 2`

**Solution**: Ensure your input array length is a power of 2 (2, 4, 8, 16, ..., 65536).

### Performance Issues

**Tips**:
1. Enable bank conflict optimization (default)
2. Use appropriate FFT sizes for your use case
3. Reuse the FFT engine instance instead of creating new ones
4. Call `dispose()` when done to free GPU resources

## 📊 Performance

- **Bank Conflict Optimization**: Eliminates shared memory conflicts through padding
- **Parallel Execution**: Fully utilizes GPU parallel computing capabilities
- **Pipeline Caching**: Reuses compute pipelines to reduce overhead
- **Buffer Pooling**: Minimizes GPU memory allocation

## 🗺️ Roadmap

### Planned Features

- [ ] 3D FFT support
- [ ] Real-valued FFT optimization (RFFT)
- [ ] Convolution operations
- [ ] Windowing functions (Hamming, Blackman, etc.)
- [ ] WebGPU fallback to WebGL
- [ ] WASM fallback for unsupported browsers

### Known Limitations

- Maximum FFT size: 65,536 elements
- Maximum 2D size: 2048×2048 pixels
- Requires WebGPU-capable browser and GPU

## 📚 References

- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WGSL Specification](https://www.w3.org/TR/WGSL/)
- [Bank Conflicts in GPU Shared Memory](https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting a pull request.

## 📄 License

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 Acknowledgments

- The WebGPU Working Group for the excellent API design
- The fast-check team for the property-based testing library
- All contributors who have helped improve this library
