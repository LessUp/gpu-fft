# CLAUDE.md

Claude 在本仓库工作时，先读 `AGENTS.md`，再读相关 `openspec/` 变更文档。`AGENTS.md` 是项目级真源；本文件只补充 Claude 专属执行偏好。

## 1. 输出与沟通

- 默认使用**中文**回复
- 当你修改对外文档时，可根据页面定位使用英文或中英双语
- 结论优先、少废话、避免泛化模板文案

## 2. Claude 的默认工作方式

- 非平凡工作先走 OpenSpec：`explore → propose → apply`
- 对架构、文档体系、workflow、公开 API 变化，在提交前使用 `/review`
- 优先长会话、本地命令、skill、subagent
- 谨慎使用高成本远程模式；无必要时不要偏向 `/fleet`

## 3. 改动重点

当前最重要的不是扩张功能，而是：

1. 统一规范真源
2. 清理低价值/重复/陈旧文档
3. 简化 workflow、release、hooks、Pages
4. 保证 README / docs / OpenSpec / GitHub About 的说法一致

## 4. 实现时必须记住的项目事实

- `src/shaders/sources.ts` 是 shader 真源
- `createSpectrumAnalyzer()`、`createImageFilter()` 是 CPU-only
- `dist/` 不会自动清空
- 规范真源在 `openspec/specs/`
- 顶层 `/specs` 已退役，只是迁移 stub

## 5. 验证基线

Canonical validation chain:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

发布/打包相关改动额外关注：

```bash
npm run build
npm run smoke:package
```

## 6. 与其他文件的关系

- `AGENTS.md`：项目级共识
- `.github/copilot-instructions.md`：GitHub Copilot 项目指令
- `CLAUDE.local.md`：仅允许保留个人偏好，不应重复项目事实
- `QWEN.md`、`AGENTS.md.legacy`：仅保留退役说明，不再维护详细内容
