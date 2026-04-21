---
layout: home

hero:
  name: "WebGPU FFT"
  text: "GPU 加速 FFT"
  tagline: 基于 WebGPU 计算着色器的高性能快速傅里叶变换库。支持 1D/2D FFT、频域滤波和实时频谱分析。
  image:
    src: /hero.svg
    alt: WebGPU FFT
  actions:
    - theme: brand
      text: 快速开始
      link: /setup/quick-start
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/LessUp/gpu-fft
    - theme: alt
      text: API 参考
      link: /api/index

features:
  - icon: ⚡
    title: GPU 加速
    details: WebGPU 计算着色器比 CPU 快 92 倍。WebGPU 不可用时自动回退到 CPU 实现。
  - icon: 📊
    title: 1D & 2D FFT
    details: 支持 1D 变换（2-65,536 元素）和 2D 变换（最大 2048×2048 像素）用于图像处理。
  - icon: 🎵
    title: 音频频谱分析
    details: 可配置 FFT 大小和多种窗函数（Hann、Hamming、Blackman 等）的实时频率分析。
  - icon: 🔍
    title: 频域滤波
    details: 支持理想和高斯形状的低通、高通、带通滤波器，用于图像和信号处理。
  - icon: 🔷
    title: TypeScript 优先
    details: 完整类型定义，启用严格模式。完整的 IDE 自动补全和类型安全。
  - icon: 🚀
    title: 零依赖
    details: 无运行时依赖。ESM 包约 27 kB。支持浏览器和 Node.js 18+。
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
