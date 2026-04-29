# AGENTS.md

本文件是本仓库面向所有 AI coding agent 的**项目级真源说明**。如与其他代理文档冲突，以本文件和 `openspec/` 中的内容为准。

## 1. 项目定位

- 项目：`gpu-fft`
- 技术栈：TypeScript、WebGPU、WGSL、Vite、Vitest
- 当前阶段：**收尾 / 规范化 / 低维护准备阶段**
- 工作目标：优先修复治理漂移、文档冗余、工程配置失配、规范不一致；**不主动扩张产品范围**

## 2. 规范真源

### 必须优先阅读

1. `openspec/specs/`：仓库级规范真源
2. `openspec/changes/<change>/`：当前变更的 proposal / design / specs / tasks
3. `AGENTS.md`：项目级通用 agent 规范
4. `CLAUDE.md` / `.github/copilot-instructions.md`：工具级薄适配层

### 已退役

- 顶层 `/specs`：已移除，不再是活跃真源
- `AGENTS.md.legacy`、`QWEN.md`：已移除，不再维护项目事实

## 3. 开发流程

对**非平凡修改**必须遵循：

`/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/review` → `/opsx:archive`

执行规则：

- 开始实现前，先确认是否已有对应 OpenSpec change
- 架构、文档体系、工程化、公开 API 变更都要经过 `/review`
- 优先长会话串行推进，避免堆积大量分支与未合并上下文
- 尽量少用高成本远程模式（例如不必要的 `/fleet`）
- 优先 skill、subagent、局部 review，而不是引入更多复杂工具

## 4. 当前收尾约束

- 优先级高于新功能：规范统一、文档压缩提纯、工作流瘦身、公开表述准确、归档前稳定性
- 如果一个改动不能提升一致性、可维护性、可验证性或项目展示质量，应谨慎纳入
- 删除低价值、重复、陈旧文档是允许的；但要避免破坏 canonical 入口

## 5. 公开表述与文档规则

- README：仓库入口，简洁、可信、转化导向
- GitHub Pages：展示与说明，不要机械搬运 README
- OpenSpec：规范和变更契约，不写营销文案
- 文档默认要求：
  - 对外文档可使用英文或中英双语
  - agent/治理文档优先中文，必要时夹带英文术语
- 禁止继续保留“质量已完美完成”这类失真的宣传式陈述

## 6. 工程化与质量门禁

### Canonical validation chain

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

### 补充检查

- 打包/发布相关改动需要关注：
  - `npm run build`
  - `npm run smoke:package`

### 原则

- 保留最少但有效的自动化
- 发现陈旧或失配配置时，优先删除或收敛，而不是继续叠加

## 7. 项目关键事实

- `src/shaders/sources.ts` 是 WGSL shader 的唯一真源；不再维护独立 `.wgsl` 参考副本
- `createSpectrumAnalyzer()` 和 `createImageFilter()` 是 **CPU-only**
- `npm run build` 会先清空 `dist/`，避免陈旧包产物残留
- `enableBankConflictOptimization` 已接入 shader padding，默认关闭；是否启用应基于目标硬件 profile
- `workgroupSize` 目前固定为 256

## 8. GitHub 与本机配置边界

- GitHub About / homepage / topics / Pages 用 `gh` 管理
- 用户级 Copilot 中文回复、LSP、MCP、plugin 只在仓库中记录**推荐方案与取舍**
- 不把某个开发者机器上的私有状态直接写成仓库硬依赖

## 9. 变更时的同步要求

以下变更必须同步更新相关表面：

- 公开 API 变化：实现 + `openspec/specs/api/` + README/docs
- 工作流变化：`AGENTS.md` + `CLAUDE.md` + Copilot 指令 + 相关工程文件
- 文档定位变化：README + docs 首页 + GitHub About / homepage

## 10. 预期行为

理想 agent 行为：

- 先读规范，再改代码
- 先消歧义，再加复杂度
- 先合并真源，再删除旧入口
- 先保证表述准确，再追求“看起来完整”
