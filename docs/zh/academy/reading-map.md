# 阅读地图

> 把这个站点当作一份小型学院导读来读，不同读者应该走不同路线。

## 四条最有用的阅读路线

| 路线 | 适合谁 | 推荐顺序 |
| --- | --- | --- |
| 评估路线 | 面试官、维护者、审查者 | [首页](/zh/) → [起步导读](/zh/guides/getting-started) → [架构总览](/zh/architecture/overview) → [性能基准](/zh/showcase/benchmarks) |
| API 路线 | 想判断能否快速接入的工程师 | [快速开始](/zh/setup/quick-start) → [API 参考](/api/index) → [Browser Support](/setup/browser-support) |
| 学习路线 | 想补 FFT / WebGPU 背景的读者 | [教程入口](/tutorials/introduction) → [架构总览](/zh/architecture/overview) → [Academic Papers](/reference/papers) |
| 贡献路线 | 可能修改代码或文档的人 | [架构总览](/zh/architecture/overview) → [架构决策](/zh/showcase/decisions) → [AI Tooling & LSP](/setup/ai-tooling) → [贡献指南](/contributing) |

## 每条路线分别回答什么

<div class="chapter-grid">
  <article class="chapter-card">
    <p class="chapter-index">评估路线</p>
    <h3>这里哪些能力是真的？</h3>
    <p>优先看支持表面、能力边界以及 benchmark 口径是否诚实。</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">API 路线</p>
    <h3>我能不能快速接进去？</h3>
    <p>优先看数据契约、安装成本、浏览器支持和失败路径。</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">学习路线</p>
    <h3>为什么会这样设计？</h3>
    <p>优先看 radix-2、Hermitian 压缩、GPU 映射和外部研究参考。</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">贡献路线</p>
    <h3>怎样改才是安全的？</h3>
    <p>优先看 OpenSpec 真源、架构决策记录和仓库的低维护约束。</p>
  </article>
</div>

## 值得常驻书签的共享页面

- [架构总览](/zh/architecture/overview)
- [性能基准](/zh/showcase/benchmarks)
- [架构决策](/zh/showcase/decisions)
- [参考中心](/reference/index)

## 一个最重要的阅读习惯

<div class="shared-language-note">
  <p>
    不要把“GPU 加速”理解成整个库都在 GPU 上运行。GPU 能力属于 FFT 核心路径，而频谱分析和图像滤波仍然是 CPU-only。只要从一开始就带着这个边界去读，项目就会清楚很多。
  </p>
</div>
