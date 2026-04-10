# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

WebGPU-accelerated FFT library (TypeScript, ESM + CJS). No runtime dependencies — only devDependencies.

## Commands

- `npm run build` — two-step: `tsc --emitDeclarationOnly` then `vite build` (does NOT clean `dist/`; delete manually if needed)
- `npm test` — vitest single run
- `npm run test:coverage` — vitest with V8 coverage
- `npm run lint` / `npm run lint:fix` — eslint on `src tests benchmarks`
- `npm run format` / `npm run format:check` — prettier (TS, JSON, MD, YAML)
- `npm run typecheck` — `tsc --noEmit`
- `npm run smoke:package` — validates ESM/CJS entry points export `createFFTEngine`
- Full validation: `npm run lint && npm run format:check && npm run typecheck && npm run test`

## Code Style

- Prettier: single quotes, semicolons, trailing comma es5, 100 char width, LF line endings
- ESLint: `eqeqeq` (strict equality), `curly` (all braces required), `prefer-const`, no `var`
- Unused args prefixed with `_` are allowed; `no-console` warns (but allows `console.warn`/`console.error`)

## Shader Architecture

WGSL shader strings live in `src/shaders/sources.ts` — this is the **source of truth**. The `.wgsl` files in `src/shaders/` are reference copies only. Always edit `sources.ts`.

## Commit Style

Conventional Commits: `type(scope): description` (feat, fix, docs, style, refactor, perf, test, chore).

## Gotchas

- `dist/` is not cleaned between builds (`emptyOutDir: false` in vite config). Delete manually for a clean build.
- `createSpectrumAnalyzer()` and `createImageFilter()` are CPU-only, not GPU-accelerated.
- `enableBankConflictOptimization` config option is reserved for a future fast path — currently unused.
- `workgroupSize` is fixed at 256 for compute kernels (16x16 for filter shader).
