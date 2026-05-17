## Context

当前站点的技术栈已经是 VitePress，但它与本地 `kimi-cli` Git Pages 的实现基线仍有三个明显差异。第一，入口结构仍以根路径英文页面为主，中文是补充路径，而 `kimi-cli` 采用根路径重定向到 `/en/` 或 `/zh/` 的 locale gateway，这让语言入口和导航模型更稳定。第二，当前页面组织偏“传统文档目录”，虽然内容齐全，但缺乏面向评估者的导读链路，难以快速建立“这是一个成熟、边界清晰、工程和研究都经得起追问的项目”这一印象。第三，当前主题实现过于依赖固定深色视觉和硬编码颜色，直接导致浅色模式中的 SVG、ECharts、canvas 组件适配不足。

这次设计不是简单换皮，而是一次“站点角色重定义”：Pages 不再只是 README 的扩展，而是仓库的公开白皮书和架构展示前台。与此同时，项目仍处于 closeout / low-maintenance 阶段，所以这次重构必须优先提升一致性、真实性和可维护性，而不是引入大而杂的新前端基础设施。

## Goals / Non-Goals

**Goals:**

- 对齐 `kimi-cli` 的 Git Pages 基线：VitePress locale gateway、内容驱动首页、简化 theme wiring、保留插件式能力
- 建立 academy-style 信息架构，让访客沿着“是什么 → 如何评估 → 为什么这样设计 → 证据与参考”顺序理解项目
- 建立双主题 token 和可视化规范，确保 SVG、图表、canvas 与结构图在 light / dark 下都可读
- 用更强的页面叙事突出项目边界：WebGPU FFT core 是 GPU 路径，spectrum analyzer 与 image filter 仍然是 CPU-only
- 保持实现轻量，优先用 Markdown + CSS + 少量 Vue 组件解决问题，而不是迁移到更重的站点框架

**Non-Goals:**

- 不在本次变更中引入新的站点框架、SSR 层或独立 React/Next 文档前台
- 不将整站每一个旧页面全部重写；优先改造决定项目观感和理解效率的高价值页面
- 不在 Pages 中新增超出当前产品能力边界的功能承诺
- 不为了视觉效果引入复杂动画、玻璃拟态或营销化语言

## Decisions

### 1. 采用 `kimi-cli` 式 locale gateway，而不是继续维护 root-as-English 结构

**Decision:** 根路径只承担语言选择与自动重定向职责，站点首页改为 `docs/en/index.md` 和 `docs/zh/index.md`，VitePress locale 导航与侧边栏围绕这两个入口组织。

**Rationale:** 这是本次“与 `kimi-cli` 对齐”的最核心底层选择。它把语言入口、导航结构和首页职责统一下来，也能避免英文根路径与中文子路径长期不对称。

**Alternatives considered:**

- 保留现有 root English + `/zh/`：改动更小，但无法真正对齐基线，也延续了结构不对称
- 全量复制所有旧页面到 `/en/` 与 `/zh/`：理论上最纯粹，但维护成本过高，不适合 closeout 阶段

### 2. 首页改为内容驱动白皮书，不再依赖注入式 Hero 组件

**Decision:** 移除 `home-hero-before` 这类注入式首页结构，首页直接在 Markdown 中使用定制 section 组成长卷式内容，保留 Vue 组件只用于图示、矩阵和交互式演示。

**Rationale:** `kimi-cli` 的首页实现本质上是“内容即结构”，更利于把品牌、导读、功能矩阵与链接组织成一个稳定页面。当前 `HomeHero.vue` 把视觉复杂度锁死在单一 Hero 上，也让后续页面风格难以统一。

**Alternatives considered:**

- 继续迭代 `HomeHero.vue`：实现快，但仍会把站点气质绑定在一个组件模板上
- 自研完整 layout 组件系统：灵活但超出当前维护收益

### 3. 主题系统从“固定深色 NVIDIA 风格”改为“双主题技术白皮书系统”

**Decision:** 保留 GPU / signal-processing 的技术身份，但通过 OKLCH-tinted neutrals、统一语义 token、组件级对比度规则，让深色模式像“实验台监视器”，浅色模式像“技术论文册页”。

**Rationale:** 当前站点的深色身份是有效的，但它在浅色模式下缺乏同等完整度，导致图标、SVG 和图表表现失衡。双主题都必须是“一等公民”，而不是深色主站、浅色降级版。

**Alternatives considered:**

- 只强化深色并弱化浅色：无法满足用户明确提出的 light/dark bug 修复目标
- 彻底改成浅色学术风格：会削弱项目已有的 GPU compute 技术身份

### 4. 用“共享内容页 + 精选 locale hub”替代“所有深页全量双语复制”

**Decision:** 新增 `/en/` 与 `/zh/` 的高价值导读页面和 hub 页面；深层技术页优先改造共享英文原页，并为中文提供入口页与精选镜像，避免一次性复制全部 leaf 文档。

**Rationale:** 这在 closeout 阶段是最稳的投入方式。访客最需要的是高质量入口与高价值说明，而不是所有深页机械双份同步。

**Alternatives considered:**

- 全量双语镜像：一致性最高，但维护开销大
- 只保留英文：与现有双语承诺不符，也损失中文入口体验

### 5. 图示能力升级以“theme-aware 组件”为主，而不是继续依赖静态 SVG

**Decision:** 对首页架构图、能力矩阵、执行流水线等核心视觉改为 Vue 组件或原生 HTML/SVG 组件，颜色由 CSS token 驱动；静态 public SVG 只保留 logo / favicon / 社交图所需最少集合。

**Rationale:** 目前 public SVG 无法天然感知主题，导致 light/dark 适配脆弱。把关键图示做成主题感知组件，能一并解决对比度、布局和复用问题。

**Alternatives considered:**

- 保持全部静态 SVG 并手工修色：短期可行，但难以稳定复用
- 改用图片化导出：会损失清晰度和语义性

## Risks / Trade-offs

- **[局部双语、深页共享可能造成语义跳转]** → 在 locale hub 页面明确标注哪些深页为共享英文原文，保证用户预期
- **[重写 config / nav / sidebar 可能引入死链]** → 先围绕高价值页重构，再通过 VitePress build 和链路检查收敛
- **[主题 token 重写可能影响 playground / 图表]** → 将 canvas、ECharts 和 SVG 的配色全部改为运行时读取 token，而不是硬编码色值
- **[站点过度“设计化”会背离 closeout 目标]** → 把视觉复杂度限制在叙事和可读性增强，不引入炫技式动效与模板化营销 copy

## Migration Plan

1. 先补齐 OpenSpec change、设计 spec 与实施计划，锁定结构和边界
2. 重写 `docs/.vitepress/config.ts`、`theme/index.ts` 与 `custom.css`，建立新的 locale / nav / token 骨架
3. 新增 `en/` 与 `zh/` 首页及导读 hub 页面，并让根路径执行语言重定向
4. 改造核心内容页和共享图示组件，替换固定深色资产与硬编码画布颜色
5. 运行 docs build 与仓库验证链，修复死链、样式回归与类型问题

## Open Questions

- 中文深层技术页是否需要在后续 change 中继续扩充完整镜像；本次先以高价值 hub 与入口页为主
