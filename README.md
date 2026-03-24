# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)

English | [简体中文](README.zh-CN.md)

High-performance Fast Fourier Transform library with a WebGPU-accelerated core engine plus CPU-based signal and image processing utilities.

## ✨ Features

- **1D FFT/IFFT** - Support for 2 to 65,536 elements
- **2D FFT/IFFT** - Image processing with 2D transforms up to 2048×2048
- **WebGPU Core FFT Engine** - GPU-backed 1D/2D FFT primitives for WebGPU-capable browsers
- **Bit-Reversal Permutation** - Efficient parallel bit-reversal implementation
- **Frequency Domain Filtering** - CPU-based low-pass/high-pass filters (Ideal and Gaussian)
- **Audio Spectrum Analysis** - CPU-based real-time spectrum analysis with Hann window
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
// Note: the current shader implementation only supports workgroupSize = 256.
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

### Spectrum Analyzer (CPU utility)

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

### Image Filter (CPU utility)

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

### Notes on GPU execution

- The current WebGPU kernel path supports `workgroupSize: 256`.
- `enableBankConflictOptimization` is reserved for a future shader fast path and is not active in the current multi-stage kernel.
- `createSpectrumAnalyzer()` and `createImageFilter()` are currently CPU utilities built on the CPU FFT implementation.

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
1. Use `workgroupSize: 256` with the current WebGPU engine
2. Use appropriate FFT sizes for your use case
3. Reuse the FFT engine instance instead of creating new ones
4. Call `dispose()` when done to free GPU resources

## 📊 Performance

- **Parallel Execution**: Uses GPU compute pipelines for the core FFT engine
- **Pipeline Caching**: Reuses compute pipelines to reduce overhead
- **Buffer Reuse**: Reuses cached GPU buffers for repeated transforms of the same size
- **Batched Submission**: Submits each transform as a single command buffer

## 🗺️ Roadmap

### Planned Features

- [ ] 3D FFT support
- [ ] Real-valued FFT optimization (RFFT)
- [ ] Convolution operations
- [ ] GPU-native image filtering pipeline
- [ ] WebGPU fallback to WebGL
- [ ] WASM fallback for unsupported browsers

### Known Limitations

- The current WebGPU shader path only supports `workgroupSize: 256`
- The spectrum analyzer and image filter helpers currently use the CPU FFT implementation
- The demo pages are illustrative and do not fully mirror the packaged runtime
- Requires WebGPU-capable browser and GPU for the GPU engine

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
