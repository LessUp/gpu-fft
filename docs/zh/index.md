---
layout: home
---

<div class="whitepaper-home">
  <section class="paper-cover">
    <p class="cover-kicker">浏览器 FFT 技术白皮书</p>
    <h1 class="cover-title">把 WebGPU FFT 核心项目，像架构 dossier 一样讲清楚。</h1>
    <p class="cover-lead">
      这里不是 README 的放大版，而是 <code>gpu-fft</code> 的公开导读前台：它说明项目真正提供什么、边界停在哪里、WebGPU 与 CPU 各自负责什么，以及如何用架构页、证据页和参考页去核对这些说法。
    </p>
    <div class="cover-actions">
      <a class="action-pill action-pill--brand" href="./guides/getting-started">开始导读</a>
      <a class="action-pill" href="/zh/architecture/overview">查看系统结构</a>
      <a class="action-pill" href="/zh/showcase/benchmarks">查看证据页</a>
    </div>
    <p class="cover-note">
      GPU FFT 核心、CPU-only 分析工具、显式 real-input 契约、零运行时依赖，这些边界会在整站持续保持一致。
    </p>
  </section>

  <section class="paper-grid paper-grid--hero">
    <article class="paper-panel">
      <p class="panel-kicker">当前产品切片</p>
      <h2>今天这个库真正交付什么</h2>
      <ul class="signal-points">
        <li>1D / 2D 复数 FFT 与 IFFT，覆盖 WebGPU 主路径与 CPU 回退</li>
        <li>1D / 2D 实值 FFT API，明确采用 half-spectrum 契约</li>
        <li>CPU-only 的频谱分析与频域图像滤波工具</li>
        <li>TypeScript 优先的导出表面和轻量包体</li>
      </ul>
    </article>
    <CapabilityMatrix locale="zh" />
  </section>
</div>

## 按层阅读项目

<div class="chapter-grid">
  <article class="chapter-card">
    <p class="chapter-index">指南</p>
    <h3>先看适配边界，再决定要不要继续。</h3>
    <p>这条路径最适合面试官、评估者和第一次接触仓库的读者。</p>
    <a class="chapter-link" href="./guides/getting-started">打开指南</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">导读</p>
    <h3>把页面当作课程大纲来读。</h3>
    <p>为评估、学习和贡献分别准备不同的阅读顺序。</p>
    <a class="chapter-link" href="./academy/reading-map">打开阅读地图</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">架构</p>
    <h3>看公开 API 如何落到 GPU pass。</h3>
    <p>重点理解 execution planner、WGSL pass 和 CPU-only utility 的边界。</p>
    <a class="chapter-link" href="/zh/architecture/overview">打开架构页</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">证据</p>
    <h3>把 benchmark 和 ADR 当证据而不是宣传。</h3>
    <p>所有性能与设计说法都应该能回到实测或决策记录。</p>
    <a class="chapter-link" href="/zh/showcase/benchmarks">打开证据页</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">参考</p>
    <h3>把项目放回 FFT 研究和工程生态里看。</h3>
    <p>论文、相关实现和学习资源会告诉你这个项目刻意做窄在哪里。</p>
    <a class="chapter-link" href="/reference/index">打开参考中心</a>
  </article>
</div>

## 系统读图

<ArchitectureAtlas locale="zh" />

## 为什么首页要这么“较真”

<div class="paper-grid paper-grid--hero">
  <article class="paper-panel">
    <p class="panel-kicker">这页真正优化什么</p>
    <h2>理解速度、表述可信度、以及后续维护成本。</h2>
    <p>
      这个站点的目的不是把项目包装得更大，而是让技术读者在最短时间内理解真实切片，随后能把注意力花在“为什么这样设计”而不是“到底支持什么”上。
    </p>
  </article>
  <article class="paper-panel">
    <p class="panel-kicker">不要误读的地方</p>
    <h2>这不是一个“大而全”的 DSP 工具箱。</h2>
    <ul class="signal-points">
      <li>它不会把 CPU-only 的分析工具包装成 GPU-native 功能。</li>
      <li>它不会对任意大小 FFT 给出未实现的承诺。</li>
      <li>它不会在没有 benchmark 证据时发布夸张性能口径。</li>
    </ul>
  </article>
</div>

## 继续阅读的正确入口

| 如果你要解决的是 | 从这里开始 |
| --- | --- |
| 快速技术评估 | [起步导读](./guides/getting-started) |
| 面试 / 代码审查阅读顺序 | [阅读地图](./academy/reading-map) |
| 看执行模型和能力边界 | [架构总览](/zh/architecture/overview) |
| 看实测和证据 | [性能基准](/zh/showcase/benchmarks) |
| 看论文和生态脉络 | [参考中心](/reference/index) |
