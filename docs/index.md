---
layout: home

hero:
  name: "WebGPU FFT"
  text: "GPU-Accelerated Fourier Transforms"
  tagline: High-performance 1D/2D FFT and real-input RFFT APIs for JavaScript and TypeScript. Compute shaders unlock parallelism in the browser; CPU utilities guarantee universal compatibility.
  image:
    src: /hero.svg
    alt: WebGPU FFT butterfly computation visualization
  actions:
    - theme: brand
      text: Quick Start
      link: /setup/quick-start
    - theme: alt
      text: View API Reference
      link: /api/index
    - theme: alt
      text: Benchmarks
      link: /showcase/benchmarks

features:
  - icon: 🚀
    title: WebGPU Compute Core
    details: The FFT engine runs on WGSL compute shaders with configurable workgroup size and optional bank-conflict padding. First-run shader compilation is amortized across reuse.
  - icon: 🔄
    title: Dual GPU / CPU Paths
    details: Every transform has both a WebGPU fast path and a CPU fallback. Your code works in every browser, and accelerates when WebGPU is available.
  - icon: 📐
    title: Real-Input & Complex APIs
    details: RFFT / IRFFT compress the half-spectrum for real-valued signals. Complex FFT and 2D variants are available on both GPU and CPU surfaces.
  - icon: 🧪
    title: Honest Benchmarking
    details: No synthetic "expected speedup" claims. Run npm run benchmark to collect measured CPU and WebGPU results for your exact hardware.
  - icon: 📦
    title: Zero Runtime Dependencies
    details: ESM + CJS + TypeScript declarations. No dependency sprawl, no WASM binaries to fetch, no bundler plugins required.
  - icon: 🔧
    title: TypeScript-First
    details: Strict-mode types, clean API surface, and explicit error codes. The library is designed to be AI-agent and IDE friendly.
---

## Is this library for you?

### Good fit

- Browser-native FFT workloads where WebGPU is available
- Large 1D or 2D transforms that justify GPU setup overhead
- Real-valued signal or image workloads that benefit from compressed half-spectrum APIs
- Projects that want a typed FFT core without runtime dependency sprawl

### Not a fit (today)

- Workloads that require GPU-native spectrum analysis or GPU-native image filtering
- Arbitrary non-power-of-2 FFT sizes without preprocessing
- A broad DSP framework with many unrelated signal-processing features

## Start exploring

| Path | What you get |
|------|-------------|
| [Quick Start](/setup/quick-start) | Install, first FFT, CPU fallback, and error handling in 5 minutes |
| [Tutorials](/tutorials/introduction) | Step-by-step: 1D FFT, 2D FFT, spectrum analysis, image filtering |
| [Architecture](/architecture/overview) | Why Radix-2, why WebGPU, and how the engine is structured |
| [API Reference](/api/index) | Complete typed surface: FFTEngine, CPU FFT, utilities, window functions |
| [Benchmarks](/showcase/benchmarks) | Measured performance data and how to reproduce it |
| [Playground](/playground/index) | Interactive FFT explorer in the browser |

<style>
.VPFeature {
  border: 1px solid var(--nv-border);
  transition: all 0.3s ease;
}

.VPFeature:hover {
  border-color: var(--nv-green);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(118, 185, 0, 0.15);
}
</style>
