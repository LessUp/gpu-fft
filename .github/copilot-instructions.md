# GitHub Copilot project instructions for `gpu-fft`

## 工作语言

- 默认使用**中文**回答和解释
- 修改对外文档时，根据页面用途选择英文或中英双语

## 项目阶段

当前仓库处于**收尾 / 规范化 / 低维护准备**阶段。

优先做：

1. OpenSpec 真源统一
2. 文档去冗余、去漂移、去夸张叙事
3. Workflow / hooks / release / Pages 简化
4. README、docs、OpenSpec、GitHub About 的一致性修复

避免默认做：

- 无明确价值的新功能扩张
- 额外引入重型工具链或上下文成本很高的 MCP
- 复制粘贴式通用工程文档

## 规范来源

- Canonical specs: `openspec/specs/`
- Active changes: `openspec/changes/`
- Project-wide agent guidance: `AGENTS.md`
- Claude-specific guidance: `CLAUDE.md`

顶层 `/specs` 已退役，不再是 source of truth。

## 工作流

对非平凡改动，优先遵循：

`/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/review`

如果改动影响以下内容，必须同步更新相关表面：

- 公开 API
- README / docs / Pages
- OpenSpec 规范
- GitHub workflow / hooks / release 配置

## 关键项目事实

- `src/shaders/sources.ts` 是 WGSL shader 真源
- `createSpectrumAnalyzer()` 和 `createImageFilter()` 是 CPU-only
- `dist/` 构建前不会自动清空

## 质量门禁

Canonical validation chain:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```
