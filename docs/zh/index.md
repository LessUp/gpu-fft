---
layout: home

hero:
  name: "WebGPU FFT"
  text: "GPU 加速傅里叶变换"
  tagline: 高性能 1D/2D FFT 与实值 RFFT API，面向 JavaScript 与 TypeScript。计算着色器释放浏览器并行能力；CPU 工具函数保证全平台兼容。
  image:
    src: /hero.svg
    alt: WebGPU FFT 蝶形运算可视化
  actions:
    - theme: brand
      text: 快速开始
      link: /setup/quick-start
    - theme: alt
      text: API 参考
      link: /api/index
    - theme: alt
      text: 性能基准
      link: /showcase/benchmarks

features:
  - icon: 🚀
    title: WebGPU 计算内核
    details: FFT 引擎基于 WGSL 计算着色器，支持可配置 workgroup 大小与可选的 bank-conflict padding。首次运行着色器编译开销可在复用中摊平。
  - icon: 🔄
    title: GPU / CPU 双路径
    details: 每种变换均提供 WebGPU 快速路径与 CPU 回退路径。代码在所有浏览器中可用，WebGPU 可用时自动加速。
  - icon: 📐
    title: 实值与复数 API
    details: RFFT / IRFFT 针对实值信号压缩半频谱。复数 FFT 与 2D 变体在 GPU 和 CPU 表面均可用。
  - icon: 🧪
    title: 诚实的基准测试
    details: 不做虚假的"预期加速比"宣传。运行 npm run benchmark 即可在你的硬件上采集实测 CPU 与 WebGPU 结果。
  - icon: 📦
    title: 零运行时依赖
    details: ESM + CJS + TypeScript 声明。无依赖膨胀，无需获取 WASM 二进制，无需额外构建插件。
  - icon: 🔧
    title: TypeScript 优先
    details: 严格模式类型、清晰的 API 表面、显式错误码。设计目标是 AI agent 与 IDE 友好。
---

## 这个库适合你吗？

### 适合

- 浏览器侧的大尺寸 1D/2D FFT 任务，且 WebGPU 可用
- 实值信号或图像处理，能从压缩半频谱 API 中受益
- 希望引入类型化 FFT 内核，同时拒绝运行时依赖膨胀

### 不适合（当前阶段）

- 需要 GPU 原生频谱分析或 GPU 原生图像滤波的场景
- 不经过预处理就直接处理任意非 2 的幂大小输入
- 需要"大而全"DSP 工具箱的项目

## 开始探索

| 路径 | 你能获得什么 |
|------|-------------|
| [快速开始](/setup/quick-start) | 安装、首个 FFT、CPU 回退、错误处理，5 分钟上手 |
| [教程](/tutorials/introduction) | 逐步深入：1D FFT、2D FFT、频谱分析、图像滤波 |
| [架构](/architecture/overview) | 为什么选择 Radix-2、为什么选择 WebGPU、引擎结构 |
| [API 参考](/api/index) | 完整类型化接口：FFTEngine、CPU FFT、工具函数、窗函数 |
| [性能基准](/showcase/benchmarks) | 实测性能数据与复现方法 |
| [游乐场](/playground/index) | 浏览器内交互式 FFT 探索器 |

> **注意**：本站点的详细文档目前仅提供英文版本。以上部分链接将跳转至英文文档页面。

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
