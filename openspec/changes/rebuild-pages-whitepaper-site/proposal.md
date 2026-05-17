## Why

当前 GitHub Pages 已经具备基础信息，但它仍停留在“常规技术文档站”的层级：目录分散、首页叙事不够强、视觉系统过度依赖单一深色设定、浅色模式下 SVG / 图表 / 交互画布可读性不足，也没有形成面向面试官和高级开发者的“白皮书式导读路径”。这与仓库当前“收尾 / 规范化 / 低维护准备”阶段的目标不完全一致，因为 Pages 仍然是公开认知的第一入口。

这项变更要把站点收敛成一个更可信、更系统、更具学术与工程展示力的 GitHub Pages：在底层上对齐本地 `kimi-cli` 的 VitePress locale 入口模式，在内容上重构为 academy / architecture / evidence / reference 的导读链路，在视觉上修复双主题适配并强化 GPU compute / signal processing 的技术身份。

## What Changes

- 将 Pages 入口改造为与 `kimi-cli` 一致的 locale gateway 结构，用根路径进行语言重定向，并以 `/en/` 与 `/zh/` 作为双语首页入口
- 重写 VitePress 站点壳层，包括导航、侧边栏、主题 token、共享组件注册方式和首页布局，不再依赖当前的注入式 Hero 组件
- 重构信息架构，新增“导读 / 学院 / 架构 / 证据 / 参考”链路，让读者可以从项目理解、能力边界、架构机制、实验验证一路深入
- 重写高价值页面：首页、快速导读页、架构总览、性能证据页、架构决策页、参考研究页，删除或弱化低信号重复表述
- 将关键视觉资产与图示改为双主题自适应实现，解决浅色 / 深色模式下 SVG、图表、canvas 和结构图的对比度问题
- 保持 README、OpenSpec 与 Pages 对 GPU 核心 / CPU-only utility 的表述一致，避免夸大或漂移

## Capabilities

### New Capabilities
- None in this change.

### Modified Capabilities
- `documentation-platform`: GitHub Pages 的入口结构、信息架构、视觉系统和导读职责将被重构为白皮书 / 架构展示 / 学院式站点

## Impact

- Affected code: `docs/.vitepress/config.ts`, `docs/.vitepress/theme/**`, `docs/index.md`, plus new locale hub pages under `docs/en/**` and `docs/zh/**`
- Affected content: `docs/architecture/**`, `docs/showcase/**`, `docs/reference/**`, `docs/setup/quick-start.md`, `docs/playground/index.md`
- Affected assets: `docs/.vitepress/public/*.svg` and any new theme-aware diagram components
- Affected specs and positioning surfaces: OpenSpec `documentation-platform`, README-aligned capability language, and GitHub Pages public narrative
