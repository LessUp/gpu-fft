# AI Tooling & LSP Setup

This project is in a **closeout / stabilization** phase, so the recommended tooling setup optimizes for consistency and low context overhead instead of maximum experimentation.

## Goals

- Keep `openspec/` as the single process source of truth
- Prefer fast local feedback over heavyweight integrations
- Make Chinese-first Copilot/agent collaboration easy
- Avoid adding MCP or plugin layers that cost context without solving a real bottleneck

## Recommended workflow by tool

| Tool | Best role in this repository |
|------|------------------------------|
| OpenSpec | Change planning, proposal/design/tasks, archive workflow |
| Copilot | Inline coding help, quick edits, repo-aware chat, review assistance |
| Claude / Codex style agents | Multi-file refactors, docs/governance cleanup, cross-cutting reasoning |
| `/review` | Required checkpoint for architecture, docs IA, workflow, and API-contract changes |
| `gh` | GitHub metadata, workflow inspection, release/repo operations |

## Copilot guidance

- Project instructions live in `.github/copilot-instructions.md`
- Repository-wide agent guidance lives in `AGENTS.md`
- Claude-specific execution guidance lives in `CLAUDE.md`
- Default working language for this repo should be **Chinese**

### User-level Chinese response preference

The repository can express the preference through `.github/copilot-instructions.md`, but your **global** Copilot language preference still belongs in your local/client settings rather than in version control.

## Recommended LSP baseline

For this repository, the most important LSP is the **TypeScript language service** from the workspace version of TypeScript.

### Why this is the right default

- The codebase is primarily TypeScript
- Vite/Vitest/ESLint/Prettier all align naturally with the TypeScript toolchain
- Many editors and coding agents either use the TypeScript server directly or benefit from the same workspace metadata

### Important caveat

The underlying TypeScript LSP/tooling can be shared across editors, but **not every AI tool talks to LSP in the same way**. The practical recommendation is:

1. Use the workspace TypeScript SDK as the canonical language service
2. Let editor/agent integrations consume it when supported
3. Do not assume Copilot, Claude, Codex, and every CLI agent all expose LSP features identically

## MCP guidance

Default recommendation for this repository: **do not add extra MCP servers unless a concrete workflow is blocked without them**.

### Good default stack

- Built-in repository tools
- `gh` for GitHub operations
- OpenSpec skills / commands
- TypeScript + ESLint + Prettier + tests

### When MCP is *not* worth it here

- You only need file edits, repo search, docs cleanup, or GitHub repo metadata updates
- The MCP would mostly duplicate `gh`, local search, or built-in skills
- The MCP adds large context payloads for little practical gain

### When MCP might be justified

- You need a capability that the local toolchain genuinely cannot provide
- The server has a narrow, high-value role and low context overhead
- The benefit is repeatable across the remainder of the closeout work

## Plugin / extension recommendations

Keep the plugin list short and directly tied to this stack:

- GitHub Copilot
- GitHub Copilot Chat
- ESLint
- Prettier
- YAML support

Vue/VitePress-specific tooling is optional unless you are actively editing theme or advanced docs-site internals.

## Remote / research style features

If your Copilot client exposes remote or research-oriented modes, treat them as **optional exploration helpers**, not as the source of truth. Final decisions and implementation should still flow back through OpenSpec artifacts and repository-local review.

## Practical default

If you want the safest setup for this repository, use:

1. Workspace TypeScript
2. ESLint + Prettier
3. Copilot with Chinese repo instructions
4. OpenSpec for non-trivial changes
5. `/review` before merging cross-cutting work

That combination is enough for almost all remaining closeout work on `gpu-fft`.
