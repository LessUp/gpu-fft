## 1. OpenSpec and governance normalization

- [x] 1.1 Remove or retire the legacy `/specs` path as an active source of truth and update repository references to canonicalize `openspec/`
- [x] 1.2 Rewrite the core OpenSpec index/governance content so the repository's closeout phase, single-source-of-truth rule, and capability map are explicit

## 2. Canonical AI instruction documents

- [x] 2.1 Create a canonical `AGENTS.md` and rewrite `CLAUDE.md` around project facts, OpenSpec workflow, review checkpoints, and closeout constraints
- [x] 2.2 Add a GitHub Copilot project instruction file and reduce or retire redundant legacy AI instruction files such as `AGENTS.md.legacy` and `QWEN.md`

## 3. Documentation platform and Pages

- [x] 3.1 Restructure `docs/` to a smaller, higher-value information architecture and redesign the Pages landing page around project positioning instead of README mirroring
- [x] 3.2 Remove or rewrite low-value, outdated, or duplicate docs content and define the repository policy for generated documentation such as `docs/api`
- [x] 3.3 Align `README.md` and `README.zh-CN.md` with the new documentation split and with accurate GPU/CPU capability claims

## 4. Engineering workflows and quality gates

- [x] 4.1 Simplify GitHub Actions, hooks, and release configuration by removing stale or misaligned automation such as the current semantic-release residue
- [x] 4.2 Align contribution/governance docs and CI around one canonical closeout validation chain

## 5. GitHub metadata and local tooling guidance

- [x] 5.1 Update GitHub repository About/homepage/topics with `gh` after the new Pages positioning is in place
- [x] 5.2 Add concise project-specific guidance for Chinese Copilot responses, recommended LSP setup, and MCP/plugin trade-offs without over-prescribing user environment state

## 6. Final consistency sweep

- [x] 6.1 Reconcile remaining spec-doc-config-code mismatches introduced by the governance cleanup
- [x] 6.2 Run the full repository validation chain and finish the closeout-oriented cleanup needed before archive-stage maintenance
