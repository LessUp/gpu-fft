## Why

`gpu-fft` 的核心实现已经稳定，但仓库治理层出现了明显漂移：OpenSpec 与旧 `/specs` 并存，AI 指令文件重复且口径不一致，文档站与工程化配置存在过度设计和陈旧残留，导致项目难以高质量收尾并进入低维护阶段。现在需要把项目从“功能完成”收束到“规范清晰、文档精炼、流程稳定、适合归档前维护”。

这项变更要解决的不是单点 bug，而是仓库级的一致性问题。越晚治理，这些漂移越会继续放大，后续用 OpenSpec 驱动收尾开发也会继续偏航。

## What Changes

- 统一 `openspec/` 为仓库内唯一规范真源，清理旧 `/specs` 与相关残留引用
- 为项目收尾阶段补齐并重构治理文档，包括正式 `AGENTS.md`、收敛后的 `CLAUDE.md`、Copilot 项目指令文件
- 重新设计 `docs/` 与 GitHub Pages，使其从 README 搬运页转为高价值项目展示与维护入口
- 精简 GitHub Actions、hooks、release 与质量门禁，移除陈旧或失配配置
- 通过 `gh` 优化 GitHub 仓库 About、topics 与 homepage 展示
- 产出一套面向收尾阶段的 OpenSpec 驱动开发流程，明确 `/opsx:*`、`/review`、subagent、Copilot/Claude/Codex 的协同边界
- 修复治理过程中发现的 spec、文档、实现之间的不一致与紧耦合问题

## Capabilities

### New Capabilities

- `project-governance`: 规范项目在收尾阶段的单一真源、治理文档、变更控制与归档前维护边界
- `documentation-platform`: 规范 docs/ 与 GitHub Pages 的信息架构、内容边界与生成文档管理策略
- `developer-workflow`: 规范 OpenSpec 驱动下的开发流程、审查节奏、AI 工具协同与本机工具选型指引
- `public-api-alignment`: 规范公开 API 在实现、README、文档站与 OpenSpec 之间的一致性维护方式
- `quality-gates`: 规范收尾阶段的测试门禁、发布门禁、CI 范围与工程化瘦身原则

### Modified Capabilities

- None in this change. Existing legacy spec documents will be realigned by introducing new closeout-oriented governance capabilities and then reconciling downstream documents during implementation.

## Impact

- Affected specs: `openspec/specs/index.md`, `openspec/specs/product/webgpu-fft-library.md`, `openspec/specs/api/public-api.md`, `openspec/specs/testing/testing-strategy.md`, and new governance/workflow/docs capability specs
- Affected documentation: `README.md`, `README.zh-CN.md`, `docs/**`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, model instruction files
- Affected engineering config: `.github/workflows/**`, `.husky/**`, `package.json`, `release.config.js`, Copilot instruction files, Claude/OpenCode config
- Affected GitHub operations: About description, homepage, topics, Pages positioning
