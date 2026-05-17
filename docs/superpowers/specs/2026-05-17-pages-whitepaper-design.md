# GPU FFT Pages Whitepaper Design

## Problem statement

`gpu-fft` 的现有 GitHub Pages 已经覆盖基础使用说明，但它还没有建立一个足够强的“公开前台角色”。对于严苛面试官和高级开发者来说，站点应该在几分钟内回答五个问题：它究竟是什么、能力边界在哪里、为什么这样设计、如何验证这些说法、以及这个项目是否值得继续深入。当前站点的答案还不够连贯。

## Baseline analysis: `kimi-cli` Git Pages

本地 `/home/shane/dev/kimi-cli/docs` 提供了这次重构的底层基线：

- **技术栈**：VitePress 1.5、`vitepress-plugin-mermaid`、`vitepress-plugin-llms`
- **入口结构**：根路径 `index.md` 只做语言分发，真正首页位于 `/en/` 与 `/zh/`
- **实现方式**：内容驱动的首页，较少依赖注入式主题组件，更多依赖 Markdown + 少量 HTML 结构
- **目录理念**：围绕“指南 / 定制 / 配置 / 参考 / FAQ / 发布说明”组织，而不是把所有内容平铺

这次 `gpu-fft` 不会机械照搬它的页面样式，但会对齐其**站点骨架**：locale gateway、内容驱动首页、清晰的导航组、轻量 theme wiring。

## Design target

这次 Pages 的目标不是“更酷的文档皮肤”，而是：

1. **高级技术白皮书**：首页和关键页面要像一份可快速阅读的技术导读
2. **架构展示站**：让 WebGPU core、CPU-only utilities、数据契约和设计取舍一目了然
3. **项目学院**：建立从快速认知到深入学习的路径，而不是依赖访客自己在目录里摸索

## Experience model

### The reader journey

```text
Landing
  ↓
Understand the project in 90 seconds
  ↓
See capability boundaries and evaluation paths
  ↓
Inspect architecture and execution model
  ↓
Check benchmarks, ADRs, and scholarly references
  ↓
Decide whether to adopt, interview on, or contribute to the project
```

### Information architecture

```text
/
├── language gateway
├── /en/
│   ├── whitepaper homepage
│   ├── guides/
│   ├── academy/
│   ├── architecture/
│   └── reference/
└── /zh/
    ├── 中文首页
    ├── 指南
    ├── 导读
    ├── 架构
    └── 参考
```

共享深页继续保留，但入口层必须围绕以下五种角色组织：

- **Guide**：如何开始、如何判断是否适合
- **Academy**：核心概念、能力边界、阅读路线
- **Architecture**：系统结构、数据流、设计决策
- **Evidence**：benchmark、ADRs、可复现实验
- **Reference**：论文、竞品、相关实现、规范

## Visual direction

### Scene sentence

一位高级工程师在下午的办公室里切换明暗主题浏览项目站点。深色模式像实验台旁的高对比监视器，浅色模式像附有图示和标注的技术论文册页。两者都必须严肃、清晰、克制，没有营销化浮夸感。

### Color strategy

- **Dark**: restrained + committed accent，深色基底承载 GPU / compute identity
- **Light**: restrained technical dossier，保持相同 accent 角色，但底色转为“纸面”而不是纯白
- **Accent roles**: green 表示主计算路径，cyan 作为次级结构/频域提示，warm neutral 负责浅色模式中的层次

### Typography and rhythm

- 避免 gradient text、模板化 metrics hero、重复卡片瀑布
- 通过大标题、紧凑标签、说明文字和表格层级建立节奏
- 大段说明控制在 65–75ch 左右，像读白皮书而不是看 landing page 广告

## Structural decisions

### 1. Home pages become long-form technical covers

- 首页不再只是一块 Hero + feature grid
- 采用多个 section：定位、能力边界、阅读路径、系统图、证据入口、研究参考
- 使用共享样式类 + 少量主题感知组件实现

### 2. Theme logic is simplified

- `theme/index.ts` 不再注入 `HomeHero`
- 保留必要组件注册，例如矩阵、系统图、playground
- 语言自动跳转由 root `index.md` 完成，不把 locale 重定向逻辑塞进 theme runtime

### 3. Diagrams become first-class

- 关键结构图改为组件化 HTML/SVG，而不是固定 public SVG
- 组件使用 CSS token，而不是写死 `#0d1117` / `#76b900`
- Mermaid 继续保留给 RFC / 文档型流程图，品牌级和结构级图示用定制组件承载

### 4. Interactive visuals must read both themes

- `FFTPlayground` 的 canvas 颜色改为运行时读取 CSS 变量
- benchmark 图表在 light/dark 下切换主题参数
- 所有 SVG 资产都要避免在任一主题下“消失”

## Content blueprint

### Pages to rebuild first

1. `docs/index.md`
2. `docs/en/index.md`
3. `docs/zh/index.md`
4. `docs/en/guides/getting-started.md`
5. `docs/zh/guides/getting-started.md`
6. `docs/en/academy/reading-map.md`
7. `docs/zh/academy/reading-map.md`
8. `docs/architecture/overview.md`
9. `docs/showcase/benchmarks.md`
10. `docs/showcase/decisions.md`
11. `docs/reference/papers.md`
12. `docs/reference/implementations.md`
13. `docs/setup/quick-start.md`
14. `docs/playground/index.md`

### Narrative rules

- 每个高价值页面都要明确告诉读者：这页解决什么问题
- 所有性能 / GPU / CPU 说法都必须与 OpenSpec 和 README 对齐
- 研究引用不是装饰，而是说明项目站在什么技术语境里
- 中文页优先承担入口和导读职责，深层共享英文页可以存在，但要让跳转是显式的

## Risks and mitigations

- **局部双语 + 共享深页可能让导航混用**：在 locale hub 中显式说明共享页面角色
- **站点骨架重写容易打断原有链接**：先保证入口和高价值页完整，再对其余页做兼容链接
- **视觉重构压过内容真实性**：以 capability matrix、边界声明、引用和证据页压住“包装味”

## Acceptance bar

当访客打开首页时，应该能在一分钟内看到：

1. 这不是泛泛的 FFT 玩具，而是有明确边界的 WebGPU FFT 核心项目
2. GPU acceleration 与 CPU-only utilities 的边界是清楚而诚实的
3. 站点既能快速导读，也能下钻到架构和研究参考
4. light / dark 两个主题都像“完整版本”，而不是一个主版本加一个兼容模式
