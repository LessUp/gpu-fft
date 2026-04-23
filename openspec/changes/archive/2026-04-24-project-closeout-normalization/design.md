## Context

`gpu-fft` 的核心 TypeScript/WebGPU 实现当前处于可用且稳定的状态，基线质量门禁也已经通过；真正的问题集中在仓库治理层。当前仓库同时存在 `openspec/specs/` 与旧 `specs/`、多套 AI 指令文档、偏宣传化的质量/完成度叙事、过重的 docs/ 信息架构，以及与当前依赖和发布策略不完全一致的工程化配置。

这次变更属于跨模块、跨文档、跨工程配置的收尾治理，因此需要先定义一套能稳定落地的治理设计，再进入批量实施。由于现有 `openspec/specs/` 仍包含旧式文档结构，本次 change 不直接对旧文档做 requirement-level delta，而是先引入新的 closeout-oriented capability specs，作为治理执行的正式契约。

## Goals / Non-Goals

**Goals:**

- 建立以 `openspec/` 为唯一真源的规范体系，并清理旧规范入口
- 为项目收尾阶段建立一套轻量、明确、可持续的治理文档与开发流程
- 让 docs/、Pages、README、GitHub About 各自承担明确职责，减少重复搬运
- 精简 workflow、hook、release 配置，只保留对收尾阶段有价值的自动化
- 为后续 autopilot/yolo 式收尾开发提供稳定、低歧义的任务入口

**Non-Goals:**

- 不在本 change 中新增 FFT 算法特性或扩张产品范围
- 不为了“看起来完整”而引入额外平台、服务或重型 MCP 依赖
- 不把用户机器的实际配置状态写入版本库；仓库内只保留指引与取舍原则

## Decisions

### 1. 以新治理 capability 作为本次收尾工作的契约层

**Decision:** 本次 change 通过 `project-governance`、`documentation-platform`、`developer-workflow`、`public-api-alignment`、`quality-gates` 五个新 capability 来定义目标状态，而不是直接对当前旧式 spec 文档做细粒度 requirement 修改。

**Rationale:** 现有 `openspec/specs/` 仍保留较强的迁移痕迹，直接对旧文档做 delta 容易把新治理工作再次绑回旧结构。先建立新的治理 capability，可以让实施拥有清晰 contract，再逐步回收历史文档。

**Alternatives considered:**

- 直接修改现有 product/api/testing 文档：短期更省事，但会继续放大旧结构与新流程的不匹配
- 完全重建整个 OpenSpec 树：过于激进，风险高，且不利于在一次收尾波次内完成

### 2. 治理文档只保留最少的 canonical 入口

**Decision:** 保留并重写正式 `AGENTS.md`、`CLAUDE.md`、Copilot 项目指令文件；对 `AGENTS.md.legacy`、`QWEN.md`、`CLAUDE.local.md` 做删减、归档或降级处理，避免多源并存。

**Rationale:** 当前问题不是缺文档，而是文档太多且互相抢真源。收尾阶段必须优先降低歧义。

**Alternatives considered:**

- 为每个工具继续维持一份完整独立文档：维护成本高，且最容易继续漂移
- 删除所有工具文档：会损失自动化代理的项目上下文

### 3. 文档站采用“少而强”的 IA

**Decision:** docs 只保留能帮助用户理解、试用、判断是否采用项目的高价值页面；GitHub Pages 首页改为项目定位页，不再是 README 的视觉转存。

**Rationale:** 当前 docs 信息量不少，但价值密度不稳定。收尾阶段更重要的是可信、清楚、低维护。

**Alternatives considered:**

- 维持现有 pages 数量并仅修文案：无法解决结构膨胀问题
- 彻底移除 docs 站点，仅保留 README：会损失项目展示面与 API 入口

### 4. 工程化按“最低有效自动化”重建

**Decision:** CI、Pages、Release、hooks 只保留能直接支撑收尾质量的最小集合；陈旧的 `release.config.js` 和失配策略优先移除或收敛。

**Rationale:** 当前核心代码已稳定，过重自动化的收益下降，维护成本反而上升。

**Alternatives considered:**

- 继续维持所有现有 workflow：会持续消耗维护精力
- 只保留本地验证、完全移除 CI：对公开仓库和归档前稳定性不利

### 5. GitHub/本机配置分层管理

**Decision:** 通过 `gh` 直接调整 GitHub repo metadata；对 Copilot 中文回复、LSP、MCP、plugin 等本机/账号级配置，仅在仓库中提供项目推荐指引和取舍依据。

**Rationale:** 仓库内可以版本化“推荐配置”，但不能版本化用户环境的真实状态。

**Alternatives considered:**

- 把本机配置脚本化并强绑定到仓库：不适合共享环境，也容易过度设计
- 完全不记录本机配置建议：不利于后续稳定复用

## Risks / Trade-offs

- **[激进清理会打断旧链接与旧习惯]** → 通过 README/docs/legacy note 和集中式 canonical 文档降低迁移成本
- **[一次性治理范围过大]** → 严格按 capability 和 tasks 分波次推进，先真源、后文档、再工程化
- **[GitHub 仓库侧改动与代码改动耦合]** → 把 GitHub metadata 调整放到 docs/Pages 定位稳定之后
- **[本机工具建议过度复杂]** → 默认优先 skill、review、subagent 和已有 CLI 能力，谨慎引入 MCP

## Migration Plan

1. 创建并完成本 change 的 proposal/specs/design/tasks
2. 先统一 OpenSpec 真源与 canonical 治理文档
3. 再重构 docs/、README、Pages 与 GitHub 展示
4. 最后收敛 workflow、hook、release 与剩余实现漂移
5. 完成后执行一次全仓质量验证，并准备 archive 前的最终审查

## Open Questions

- `docs/api/` 最终保留为版本库内容，还是改为构建产物后不再跟踪
- GitHub Pages 是否继续保留 Lighthouse 审查，还是改成更轻量的 smoke 校验
- 是否需要为用户级 Copilot/LSP/MCP 建立单独的 `docs/setup/ai-tooling.md` 指南页
