---
layout: home

hero:
  name: "WebGPU FFT"
  text: "Browser-native FFT core"
  tagline: GPU-accelerated 1D/2D FFT and real-input RFFT APIs for JavaScript and TypeScript. High-throughput transforms run on WebGPU; spectrum analysis and image filtering remain CPU-based utilities.
  image:
    src: /hero.svg
    alt: WebGPU FFT
  actions:
    - theme: brand
      text: Quick Start
      link: /setup/quick-start
    - theme: alt
      text: Evaluate the API
      link: /api/index
    - theme: alt
      text: View on GitHub
      link: https://github.com/LessUp/gpu-fft

features:
  - icon: ⚡
    title: GPU FFT core
    details: WebGPU compute shaders accelerate the FFT engine itself. The repository includes a benchmark script that reports measured CPU and WebGPU results for the current environment.
  - icon: 📊
    title: Honest capability boundaries
    details: Complex FFT and real-input RFFT APIs are available on both CPU and GPU surfaces. Spectrum analysis and image filtering are built-in helpers, but they currently use CPU FFT internally.
  - icon: 🎵
    title: TypeScript-first package
    details: ESM + CJS exports, no runtime dependencies, and a clean typed API surface for browser or Node-based workflows.
  - icon: 🔍
    title: Fast evaluation path
    details: Start with Quick Start, verify supported APIs in the reference, then inspect the architecture pages if you need implementation details.
---

## What this site is for

This site helps you answer four questions quickly:

1. **Is the FFT core actually GPU-accelerated?** Yes — the `FFTEngine` and 2D FFT pipeline are the GPU-centered parts.
2. **What is CPU-only today?** `createSpectrumAnalyzer()` and `createImageFilter()` are convenience utilities built on the CPU FFT path.
3. **Can I benchmark it honestly?** Yes — `npm run benchmark` reports measured CPU results and measured WebGPU results only when WebGPU is actually available.
4. **Where should I start?** Use Quick Start for usage, API Reference for contracts, and Architecture for internals.

## Good fit / Not a fit

### Good fit

- Browser-native FFT workloads where WebGPU is available
- Large 1D or 2D transforms that justify GPU setup overhead
- Real-valued signal or image workloads that benefit from compressed half-spectrum APIs
- Projects that want a typed FFT core without runtime dependency sprawl

### Not a fit

- Workloads that require GPU-native spectrum analysis or GPU-native image filtering today
- Arbitrary non-power-of-two FFT sizes without preprocessing
- A broad DSP framework with many unrelated signal-processing features

## Evaluate quickly

- **Start here:** [Quick Start](/setup/quick-start)
- **Check contracts:** [API Reference](/api/index)
- **Inspect design:** [Architecture Overview](/architecture/overview)
- **Contribute or audit:** [Contributing](/contributing)

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #4f46e5 30%, #a78bfa);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #4f46e5 50%, #a78bfa 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}

.VPFeature {
  border: 1px solid var(--vp-c-divider);
  transition: all 0.3s ease;
}

.VPFeature:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.15);
}
</style>
