# 起步导读

> 当你只想快速判断这个项目值不值得继续读时，从这里开始。它优先回答“适不适合、边界在哪、接下来该看什么”。

<div class="guide-summary">
  <strong>十分钟路线：</strong>先看本页，再看架构总览，最后看性能基准。对大多数评估型读者来说，这已经足够建立一个可靠的一阶判断。
</div>

## 你正在评估什么

- 一个以 WebGPU 计算着色器为核心的浏览器 FFT 引擎
- 在没有 WebGPU 时仍可工作的 CPU 回退路径
- 明确公开 half-spectrum 契约的 real-input API
- 保持 CPU-only 边界的频谱分析与图像滤波工具

## 十分钟阅读顺序

1. 先看[首页](/zh/)，确认项目定位和当前产品切片。
2. 跳到[快速开始](/zh/setup/quick-start)，理解 API 形状和最短接入路径。
3. 打开[架构总览](/zh/architecture/overview)，看公开能力如何落到执行层。
4. 阅读[性能基准](/zh/showcase/benchmarks)，区分实测结果和未被承诺的部分。
5. 如果你还想看研究脉络，再去[参考中心](/reference/index)。

## 能力边界

<CapabilityMatrix locale="zh" />

## 适合，不适合

<div class="fit-grid">
  <article class="guide-callout">
    <p class="panel-kicker">适合</p>
    <ul class="fit-list">
      <li>你需要浏览器侧 FFT，并且希望 WebGPU 是真实主路径。</li>
      <li>你希望 API 契约清晰、包体轻量、依赖少。</li>
      <li>你在意 GPU 能力与 CPU-only 工具之间的公开边界。</li>
    </ul>
  </article>
  <article class="guide-callout fit-negative">
    <p class="panel-kicker">不适合</p>
    <ul class="fit-list">
      <li>你需要 GPU-native 的频谱分析或 GPU-native 的图像滤波。</li>
      <li>你需要不经预处理就支持任意长度 FFT。</li>
      <li>你要的是“大而全”的 DSP 框架，而不是 FFT 核心能力。</li>
    </ul>
  </article>
</div>

## 下一步看什么

| 如果你最关心的是 | 下一页 |
| --- | --- |
| API 形状与安装路径 | [快速开始](/zh/setup/quick-start) |
| 浏览器就绪度 | [Browser Support](/setup/browser-support) |
| 架构可信度 | [架构总览](/zh/architecture/overview) |
| 性能口径是否诚实 | [性能基准](/zh/showcase/benchmarks) |
| 研究和生态背景 | [Academic Papers](/reference/papers) |
