# AGENTS.md — AI Agent Guide for WebGPU FFT Library

## /init Command

When a user runs `/init` or asks to initialize the project, follow these steps:

### Step 1: Verify Project Setup

1. Check that `package.json` exists and is valid
2. Run `npm install` to install dependencies
3. Run `npm run build` to verify build succeeds
4. Run `npm test` to verify all tests pass

### Step 2: Display Project Context

Show the user:
- Project name and description (from `package.json`)
- Available npm scripts
- Current specs in `/specs` directory
- Current test count and coverage (if available)

### Step 3: Setup Verification Checklist

- [ ] Dependencies installed (`node_modules/` exists)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type check passes (`npm run typecheck`)

---

# Project Philosophy: Spec-Driven Development (SDD)

This project strictly follows the **Spec-Driven Development (SDD)** paradigm. All code implementations must use the `/specs` directory as the single source of truth.

## Directory Context (Specs)

| Directory | Purpose |
|-----------|---------|
| `/specs/product/` | Product feature definitions and acceptance criteria |
| `/specs/rfc/` | Technical design documents (architecture decisions) |
| `/specs/api/` | API interface specifications |
| `/specs/db/` | Database model definitions (N/A for this library) |
| `/specs/testing/` | Testing specifications and property definitions |

## AI Agent Workflow Instructions

When you (AI) are asked to develop a new feature, modify existing functionality, or fix a bug, **you MUST strictly follow this workflow without skipping any steps**:

### Step 1: Review Specs (审查与分析)

- First, read the relevant documents in `/specs` (product specs, RFCs, API definitions)
- If the user's request conflicts with existing specs, **stop immediately** and point out the conflict. Ask the user whether to update the specs first

### Step 2: Spec-First Update (规范优先)

- For new features or changes to interfaces/database structures, **you MUST propose modifying or creating spec documents first** (e.g., `/specs/product/*.md`, `/specs/rfc/*.md`)
- Wait for user confirmation of spec changes before proceeding to code implementation

### Step 3: Implementation (代码实现)

- When writing code, **100% comply** with spec definitions (including variable names, API paths, data types, status codes, etc.)
- **Do not add features not defined in specs** (No Gold-Plating)

### Step 4: Test Against Specs (测试验证)

- Write unit and integration tests based on acceptance criteria in `/specs`
- Ensure test cases cover all boundary conditions described in specs

## Decision Tree

```
User Request
    │
    ├── Modify existing feature?
    │   └── Read /specs/product/ and /specs/rfc/
    │       └── Conflict with spec? → Ask user to update spec first
    │       └── No conflict → Implement per spec → Test against spec
    │
    ├── New feature?
    │   └── Create spec document → Get approval → Implement → Test
    │
    └── Fix bug?
        └── Check if bug is in spec or implementation error
            └── Spec error → Update spec first
            └── Implementation error → Fix code to match spec
```

## Quick Reference

| Task | Spec Location |
|------|---------------|
| What features to build | `/specs/product/*.md` |
| Architecture decisions | `/specs/rfc/*.md` |
| API definitions | `/specs/api/*.md` |
| Testing requirements | `/specs/testing/*.md` |

## Code Generation Rules

- Any externally exposed API changes MUST be reflected in `/specs/api/public-api.md`
- For uncertain technical details, consult `/specs/rfc/` for architectural conventions — do not invent design patterns
- Reference the relevant spec documents in commit messages when implementing features

---

# Project Reference

## Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build (types + vite) |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run with coverage report |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier formatting |
| `npm run format:check` | Prettier check |
| `npm run typecheck` | TypeScript type check |
| `npm run smoke:package` | Validate ESM/CJS exports |

## Code Style

- **Prettier**: single quotes, semicolons, trailing comma es5, 100 char width, LF line endings
- **ESLint**: `eqeqeq` (strict equality), `curly` (all braces required), `prefer-const`, no `var`
- **TypeScript**: Strict mode enabled

## Commit Message Format

Use Conventional Commits:

```
type(scope): description
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (formatting) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(fft): add 3D FFT support
fix(spectrum): correct dB calculation for zero magnitude
docs(readme): add browser compatibility section
test(complex): add property tests for complex multiplication
```

## Architecture Notes

### Shader Source of Truth

WGSL shader strings live in `src/shaders/sources.ts` — this is the **source of truth**. The `.wgsl` files in `src/shaders/` are reference copies only. Always edit `sources.ts`.

### Known Limitations

- `dist/` is not cleaned between builds — delete manually for clean build
- `createSpectrumAnalyzer()` and `createImageFilter()` are CPU-only, not GPU-accelerated
- `enableBankConflictOptimization` is reserved for future use
- `workgroupSize` is fixed at 256 for compute kernels

---

# Available Specifications

## Product Requirements

- **[WebGPU FFT Library](/specs/product/webgpu-fft-library.md)** — Core product features and acceptance criteria

## RFCs (Technical Design)

- **[RFC 0001: WebGPU FFT Library Architecture](/specs/rfc/0001-webgpu-fft-library-architecture.md)** — Core architecture and design decisions
- **[RFC 0002: Project Quality Enhancement](/specs/rfc/0002-project-quality-enhancement-architecture.md)** — Open-source best practices

## API Specifications

- **[Public API](/specs/api/public-api.md)** — Complete API reference with types and examples

## Testing

- **[Testing Strategy](/specs/testing/testing-strategy.md)** — Test conventions, property-based testing, and coverage requirements
