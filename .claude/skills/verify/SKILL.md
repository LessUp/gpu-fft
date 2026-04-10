---
name: verify
description: Run the full validation chain (lint, format check, typecheck, tests) to verify code quality before commits or PRs.
---

Run the full project validation pipeline. Execute each step sequentially and report results:

1. `npm run lint` — ESLint on src, tests, benchmarks
2. `npm run format:check` — Prettier dry-run (no changes)
3. `npm run typecheck` — TypeScript type-check
4. `npm run test` — Vitest single run

If any step fails, report the failure clearly with the relevant error output. If all pass, confirm the codebase passes full validation.
