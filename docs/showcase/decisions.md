# Architecture Decisions

This page documents the key design decisions behind the WebGPU FFT Library. Each entry follows the ADR format: **Problem → Options → Decision → Consequences**.

## Why WebGPU for FFT?

### Problem
Browser-based FFT libraries have traditionally relied on CPU (JavaScript) or WASM. GPU compute via WebGL was limited and awkward for general-purpose compute.

### Options

| Approach | Pros | Cons |
|----------|------|------|
| CPU-only (JS) | Simple, universal | Slow for large transforms |
| WebGL compute | GPU access | Awkward GPGPU, limited features |
| WebGPU compute | Modern compute API, WGSL | Browser support still maturing |
| WASM + SIMD | Near-native CPU speed | No GPU acceleration |

### Decision
Adopt **WebGPU compute shaders** as the primary acceleration path, with a CPU fallback for universal compatibility.

### Consequences
- Users with modern browsers get significant speedups on large transforms
- A CPU fallback ensures the library works everywhere
- The API surface must abstract GPU resource management

## Why Radix-2 Cooley-Tukey?

### Problem
Multiple FFT algorithms exist. Which one balances implementation complexity, GPU parallelism, and browser compatibility?

### Options

| Algorithm | Complexity | GPU Fit | Size Constraint |
|-----------|-----------|---------|-----------------|
| Cooley-Tukey Radix-2 | O(N log N) | Excellent | Power-of-2 only |
| Bluestein | O(N log N) | Moderate | Any size |
| Split-Radix | O(N log N) | Complex | Power-of-2 only |
| Prime-factor | O(N log N) | Poor | Composite sizes |

### Decision
Implement **Cooley-Tukey Radix-2 DIT** with optional bank-conflict padding. This provides the most straightforward mapping to GPU workgroups while keeping the code maintainable.

### Consequences
- Input size must be a power of 2 (validated at runtime)
- Regular memory access patterns map cleanly to GPU shared memory
- ~3% memory overhead when bank-conflict padding is enabled

## 2D FFT Transpose Strategy

See [RFC 0003: 2D FFT Transpose Strategy](/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md) for the full technical discussion.

### Decision
Use **row-column decomposition with an explicit transpose step** rather than tiling or direct 2D butterfly. This reuses the 1D FFT kernels and keeps the shader code simple.

## Quality Gates

See [RFC 0002: Project Quality Enhancement](/openspec/specs/rfc/0002-project-quality-enhancement-architecture.md) for the CI/CD design.

### Decision
Every commit must pass:
1. ESLint
2. Prettier format check
3. TypeScript type check
4. Vitest unit tests
5. Vite build
6. Package smoke test
