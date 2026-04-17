# QWEN.md — Qwen Code Context for WebGPU FFT Library

## Project Overview

**webgpu-fft** is a high-performance Fast Fourier Transform (FFT) library for JavaScript/TypeScript with WebGPU compute shaders and CPU fallback. It achieves up to 92x speedup over CPU implementations for large FFTs.

- **Package**: `webgpu-fft` (v1.1.0)
- **Repository**: https://github.com/LessUp/gpu-fft
- **License**: MIT
- **Node**: ≥18.0.0
- **Zero runtime dependencies**

### Core Features

| Feature | Details |
|---------|---------|
| **1D FFT/IFFT** | 2 to 65,536 elements (power of 2) |
| **2D FFT/IFFT** | Up to 2048×2048 pixels |
| **GPU Acceleration** | WebGPU compute shaders (Cooley-Tukey Radix-2 DIT) |
| **CPU Fallback** | Full CPU implementation for non-WebGPU environments |
| **Frequency Filtering** | Low-pass, high-pass, band-pass (Ideal & Gaussian) |
| **Spectrum Analysis** | Real-time audio analysis with windowing |
| **TypeScript** | Strict mode, full type definitions |

### Architecture

```
src/
├── core/                    # GPU engine
│   ├── fft-engine.ts        # Main FFT implementation (WebGPU)
│   ├── gpu-resource-manager.ts  # WebGPU device/buffer management
│   └── errors.ts            # Custom FFTError class
├── shaders/                 # WGSL shader sources
│   ├── sources.ts           # SOURCE OF TRUTH for shader strings
│   ├── bit-reversal.wgsl    # Bit-reversal permutation shader
│   ├── butterfly.wgsl       # Butterfly operation shader
│   ├── complex.wgsl         # Complex arithmetic shader
│   └── filter.wgsl          # Image filtering shader
├── utils/                   # CPU utilities
│   ├── complex.ts           # Complex number operations
│   ├── bit-reversal.ts      # Bit-reversal permutation (CPU)
│   ├── cpu-fft.ts           # CPU-based FFT fallback
│   ├── gpu-detect.ts        # WebGPU feature detection
│   └── window-functions.ts  # Signal window functions (Hann, Hamming, etc.)
├── apps/                    # High-level application APIs (CPU-only)
│   ├── spectrum-analyzer.ts # Real-time audio spectrum analysis
│   └── image-filter.ts      # Frequency-domain image filtering
├── types.ts                 # Shared TypeScript types
└── index.ts                 # Public API exports
```

### Shader Source of Truth

WGSL shader strings live in `src/shaders/sources.ts` — this is the **source of truth**. The `.wgsl` files in `src/shaders/` are reference copies only. Always edit `sources.ts`.

## Key Technical Constraints

- **`workgroupSize`**: Fixed at 256 for compute kernels
- **`enableBankConflictOptimization`**: Reserved for future use
- **Input format**: Interleaved complex data `[real₀, imag₀, real₁, imag₁, ...]` as `Float32Array`
- **Input size**: Must be power of 2
- **`dist/`** is not cleaned between builds — delete manually for clean build
- **`createSpectrumAnalyzer()`** and **`createImageFilter()`** are CPU-only, not GPU-accelerated

## Building and Running

### Essential Commands

```bash
# Install dependencies
npm install

# Build (types + vite)
npm run build

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# ESLint check
npm run lint

# ESLint auto-fix
npm run lint:fix

# Prettier formatting
npm run format

# Prettier check
npm run format:check

# TypeScript type check
npm run typecheck

# Validate ESM/CJS exports
npm run smoke:package

# Full prepublish check
npm run prepublishOnly
```

### Documentation

```bash
# Local dev server
npm run docs:dev

# Build docs site
npm run docs:build

# Preview built docs
npm run docs:preview
```

### Demos and Examples

```bash
# Run benchmarks
npm run benchmark

# Serve web demos
npx serve examples/web

# Run TypeScript examples
npx tsx examples/node/basic-fft.ts
```

## Development Conventions

### Spec-Driven Development (SDD)

This project strictly follows Spec-Driven Development. All code implementations must use `/specs` as the single source of truth.

| Directory | Purpose |
|-----------|---------|
| `/specs/product/` | Product feature definitions and acceptance criteria |
| `/specs/rfc/` | Technical design documents (architecture decisions) |
| `/specs/api/` | API interface specifications |
| `/specs/db/` | Database model definitions (N/A for this library) |
| `/specs/testing/` | Testing specifications and property definitions |

**Workflow**: Read specs → Update specs first for interface changes → Implement per spec → Test against spec acceptance criteria.

### Code Style

- **Prettier**: single quotes, semicolons, trailing comma es5, 100 char width, LF line endings
- **ESLint**: `eqeqeq` (strict equality), `curly` (all braces required), `prefer-const`, no `var`
- **TypeScript**: Strict mode enabled, explicit function return types (warn), no explicit any (warn)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `fft-engine.ts` |
| Classes | PascalCase | `FFTEngine` |
| Functions/Methods | camelCase | `computeFFT` |
| Constants | UPPER_SNAKE_CASE | `MAX_FFT_SIZE` |
| Interfaces | PascalCase | `FFTEngineConfig` |

### Testing

- **Framework**: Vitest with fast-check for property-based testing
- **Test location**: `tests/` directory, `.test.ts` suffix
- **Property tests**: Use fast-check, tag with property number from testing spec
- **Coverage threshold**: 80% lines/functions (currently ~74%)

### Commit Message Format

Conventional Commits: `<type>(<scope>): <description>`

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

Examples:
```
feat(fft): add 3D FFT support
fix(spectrum): correct dB calculation for zero magnitude
docs(readme): add browser compatibility section
test(complex): add property tests for complex multiplication
```

## CI/CD

### GitHub Workflows

| Workflow | File | Triggers | Jobs |
|----------|------|----------|------|
| CI | `.github/workflows/ci.yml` | push/PR to master/main/develop | Lint, Test (coverage), Build, Security Audit |
| Pages | `.github/workflows/pages.yml` | push to master/main | Build docs, Lighthouse, Deploy |
| Release | `.github/workflows/release.yml` | push to master/main | Semantic release (auto) |

### Git Hooks

- **pre-commit**: `npx lint-staged` (runs eslint + prettier on staged files)
- Configured via `.lintstagedrc.json` — only lints `src/`, `tests/`, `benchmarks/`, `examples/`

## Project Structure (Root Level)

```
webgpu-fft/
├── specs/                 # SDD specifications (single source of truth)
│   ├── product/           # Product requirements
│   ├── rfc/               # Architecture RFCs
│   ├── api/               # API specifications
│   └── testing/           # Testing specifications
├── src/                   # Library source code
├── tests/                 # Test suite
├── examples/              # Usage examples
│   ├── node/              # TypeScript examples (run with tsx)
│   └── web/               # HTML/JavaScript demos
├── benchmarks/            # Performance benchmarks
├── docs/                  # VitePress documentation site
│   └── specs -> ../specs  # Symlink to single source
├── .github/               # GitHub CI/CD configuration
├── .husky/                # Git hooks
└── [config files]         # package.json, tsconfig.json, vite.config.ts, etc.
```

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Main entry point / public API exports |
| `src/types.ts` | Shared TypeScript type definitions |
| `src/shaders/sources.ts` | WGSL shader strings (source of truth) |
| `vite.config.ts` | Vite bundler config (ESM + CJS output) |
| `tsconfig.json` | TypeScript strict config |
| `vitest.config.ts` | Vitest test runner with coverage thresholds |
| `eslint.config.js` | ESLint flat config |
| `.prettierrc.json` | Prettier formatting rules |
| `.gitignore` | Git ignore patterns |
| `package.json` | NPM package definition |

## Browser Compatibility

| Browser | Minimum Version | WebGPU Status |
|---------|----------------|---------------|
| Chrome | 113+ | ✅ Stable |
| Edge | 113+ | ✅ Stable |
| Firefox | 128+ | ✅ Stable |
| Safari | 17+ | ⚠️ Preview |

Always use `isWebGPUAvailable` to detect support and fallback to `cpuFFT`/`cpuIFFT`.

## Known Limitations

- GPU shader only supports `workgroupSize: 256`
- `SpectrumAnalyzer` and `ImageFilter` use CPU FFT internally
- Maximum 1D size: 65,536 elements
- Maximum 2D size: 2048×2048
- No real-valued FFT (RFFT) optimization yet
- No 3D FFT support yet

## Package Exports

```json
{
  "types": "./dist/index.d.ts",
  "import": "./dist/index.js",    // ESM
  "require": "./dist/index.cjs"   // CJS
}
```

Bundle sizes: ~27 kB ESM, ~22 kB CJS.

## Documentation Site

Built with VitePress, bilingual (English + Simplified Chinese).

- **Live**: https://lessup.github.io/gpu-fft/
- **Source**: `docs/` directory with `.vitepress/` config
- **Specs symlink**: `docs/specs → ../specs` (single source of truth)
