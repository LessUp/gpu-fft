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

---

# Project Philosophy: Spec-Driven Development (SDD)

This project strictly follows the **Spec-Driven Development (SDD)** paradigm. All code implementations must use the `/specs` directory as the single source of truth.

## Directory Context (Specs)

- `/specs/product/` — Product feature definitions and acceptance criteria
- `/specs/rfc/` — Technical design documents (architecture decisions)
- `/specs/api/` — API interface specifications
- `/specs/db/` — Database model definitions (N/A for this library)
- `/specs/testing/` — Testing specifications and property definitions

## AI Agent Workflow Instructions

When you (AI) are asked to develop a new feature, modify existing functionality, or fix a bug, **you MUST strictly follow this workflow without skipping any steps**:

### Step 1: Review Specs

- First, read the relevant documents in `/specs` (product specs, RFCs, API definitions)
- If the user's request conflicts with existing specs, **stop immediately** and point out the conflict. Ask the user whether to update the specs first

### Step 2: Spec-First Update

- For new features or changes to interfaces/database structures, **you MUST propose modifying or creating spec documents first** (e.g., `/specs/product/*.md`, `/specs/rfc/*.md`)
- Wait for user confirmation of spec changes before proceeding to code implementation

### Step 3: Implementation

- When writing code, **100% comply** with spec definitions (including variable names, API paths, data types, status codes, etc.)
- **Do not add features not defined in specs** (No Gold-Plating)

### Step 4: Test Against Specs

- Write unit and integration tests based on acceptance criteria in `/specs`
- Ensure test cases cover all boundary conditions described in specs

## Code Generation Rules

- Any externally exposed API changes MUST be reflected in `/specs/api/public-api.md`
- For uncertain technical details, consult `/specs/rfc/` for architectural conventions — do not invent design patterns
- Reference the relevant spec documents in commit messages when implementing features
