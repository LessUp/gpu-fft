---
layout: home

features:
  - icon: 🚀
    title: WebGPU Compute Core
    details: The FFT engine runs on WGSL compute shaders with configurable workgroup size and optional bank-conflict padding. First-run shader compilation is amortized across reuse.
  - icon: 📐
    title: Real-Input FFT
    details: RFFT / IRFFT compress the half-spectrum for real-valued signals. Leverages Hermitian symmetry to reduce bandwidth and memory by ~50% compared to complex FFT.
  - icon: 🔄
    title: Dual GPU / CPU Paths
    details: Every transform has both a WebGPU fast path and a CPU fallback. Your code works in every browser, and accelerates when WebGPU is available.
  - icon: 📊
    title: 2D Transforms
    details: Full support for 2D FFT / IFFT with row-column decomposition. Process images up to 2048×2048 pixels with GPU acceleration.
  - icon: 📦
    title: Zero Runtime Dependencies
    details: ESM + CJS + TypeScript declarations. No dependency sprawl, no WASM binaries to fetch, no bundler plugins required.
  - icon: 🔧
    title: TypeScript-First
    details: Strict-mode types, clean API surface, and explicit error codes. The library is designed to be AI-agent and IDE friendly.
---

## Quick Start

<div class="quick-start-block">
<div class="command-block">
<code>npm install webgpu-fft</code>
</div>

```typescript
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine(navigator.gpu, 1024);
const input = new Float32Array(2048); // 1024 complex numbers
const output = await engine.fft(input);
console.log(output); // FFT result [real0, imag0, real1, imag1, ...]
```
</div>

## Is This Library for You?

### Good Fit

- Browser-native FFT workloads where WebGPU is available
- Large 1D or 2D transforms that justify GPU setup overhead
- Real-valued signal or image workloads that benefit from compressed half-spectrum APIs
- Projects that want a typed FFT core without runtime dependency sprawl

### Not a Fit (Today)

- Workloads that require GPU-native spectrum analysis or GPU-native image filtering (these are CPU utilities)
- Arbitrary non-power-of-2 FFT sizes without preprocessing
- A broad DSP framework with many unrelated signal-processing features

## Start Exploring

| Path | What You Get |
|------|-------------|
| [Quick Start](/setup/quick-start) | Install, first FFT, CPU fallback, and error handling in 5 minutes |
| [Tutorials](/tutorials/introduction) | Step-by-step: 1D FFT, 2D FFT, spectrum analysis, image filtering |
| [Architecture](/architecture/overview) | Why Radix-2, why WebGPU, and how the engine is structured |
| [API Reference](/api/index) | Complete typed surface: FFTEngine, CPU FFT, utilities, window functions |
| [Benchmarks](/showcase/benchmarks) | Measured performance data and how to reproduce it |
| [Reference](/reference/index) | Academic papers, technical specs, and related projects |
| [Playground](/playground/index) | Interactive FFT explorer in the browser |
