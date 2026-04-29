---
layout: home

hero:
  name: "WebGPU FFT"
  text: "浏览器原生 FFT 内核"
  tagline: 面向 JavaScript/TypeScript 的 GPU 加速 1D/2D FFT。高吞吐 FFT 走 WebGPU；频谱分析与图像滤波以 CPU 工具形式提供。
  image:
    src: /hero.svg
    alt: WebGPU FFT
  actions:
    - theme: brand
      text: 快速开始
      link: /setup/quick-start
    - theme: alt
      text: API 参考
      link: /api/index
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/LessUp/gpu-fft

features:
  - icon: ⚡
    title: GPU FFT 内核
    details: WebGPU 计算着色器用于 FFT 核心计算。仓库 benchmark 会输出当前环境中的 CPU 实测结果，并在 WebGPU 可用时输出 GPU 实测结果。
  - icon: 📊
    title: 能力边界清晰
    details: 1D/2D FFT 是 GPU 加速能力；`createSpectrumAnalyzer()` 与 `createImageFilter()` 目前仍是 CPU-only 工具。
  - icon: 🎵
    title: TypeScript 优先
    details: 提供 ESM + CJS 导出、零运行时依赖，以及清晰的类型定义，适合浏览器与 Node 工作流。
  - icon: 🔍
    title: 快速评估路径
    details: 从快速开始进入，先看 API 契约，再看架构页；避免在大量营销文案里兜圈子。
---

## 这个站点的作用

这个站点帮助你快速判断四件事：

1. **FFT 核心是否真的走 GPU？** 是，`FFTEngine` 与 2D FFT 流程是 WebGPU 核心能力。
2. **哪些能力仍是 CPU-only？** `createSpectrumAnalyzer()` 与 `createImageFilter()` 当前都基于 CPU FFT。
3. **是否适合接入？** 包体零运行时依赖，导出 ESM + CJS，类型定义完整。
4. **应该从哪里开始？** 先看快速开始，再看 API，再看架构页。

## 适合 / 不适合

### 适合

- 浏览器侧的大尺寸 1D/2D FFT 任务
- 希望用 TypeScript 调用 GPU FFT，又不想引入额外运行时依赖
- 需要明确知道 GPU 与 CPU 能力边界的项目

### 不适合

- 需要 GPU 原生频谱分析或 GPU 原生图像滤波的场景
- 不经过预处理就直接处理任意非 2 的幂大小输入
- 需要“大而全”DSP 工具箱的项目

## 建议阅读顺序

> **注意**：本站点的详细文档目前仅提供英文版本。以下链接将跳转至英文文档页面。

- **先上手：** [快速开始](/setup/quick-start)
- **查契约：** [API 参考](/api/index)
- **看实现：** [架构概览](/architecture/overview)
- **看协作：** [贡献指南](/contributing)

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
