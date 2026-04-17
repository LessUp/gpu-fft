---
layout: home

hero:
  name: "WebGPU FFT"
  text: "GPU-Accelerated FFT"
  tagline: High-performance Fast Fourier Transform library with WebGPU compute shaders. Supports 1D/2D FFT, frequency domain filtering, and real-time spectrum analysis.
  image:
    src: /hero.svg
    alt: WebGPU FFT
  actions:
    - theme: brand
      text: Get Started
      link: /setup/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/LessUp/gpu-fft
    - theme: alt
      text: API Reference
      link: /api/index

features:
  - icon: ⚡
    title: GPU Acceleration
    details: WebGPU compute shaders deliver maximum performance for FFT calculations. Falls back to CPU when WebGPU is unavailable.
  - icon: 📊
    title: 1D & 2D FFT
    details: Support for 1D transforms (2-65,536 elements) and 2D transforms (up to 2048×2048 pixels) for image processing.
  - icon: 🎵
    title: Audio Spectrum Analysis
    details: Real-time frequency analysis with configurable FFT sizes and window functions.
  - icon: 🔍
    title: Frequency Domain Filtering
    details: Low-pass, high-pass, and band-pass filters with ideal or Gaussian shapes.
  - icon: 🔷
    title: TypeScript First
    details: Full type definitions with strict mode support. Zero runtime dependencies.
  - icon: 🚀
    title: Zero Dependencies
    details: No runtime dependencies for minimal bundle size. Works in browsers and Node.js.
---

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
