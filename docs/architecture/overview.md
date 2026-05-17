# Architecture Overview

> Read this page as a system note, not as marketing copy. It explains where the GPU path begins, where the CPU path remains authoritative, and why the current design stays deliberately narrow.

<div class="guide-summary">
  <strong>Architectural thesis:</strong> keep the FFT core GPU-capable, keep the public contract explicit, and keep application-level helpers honest about still being CPU-only.
</div>

<ArchitectureAtlas />

## Capability boundary

| Surface | Backend reality | Why it matters |
| --- | --- | --- |
| `createFFTEngine()` | WebGPU-backed FFT execution core | This is the primary acceleration path |
| `cpuFFT()` / `cpuIFFT()` | CPU reference path | Enables universal fallback and utility reuse |
| `rfft()` / `irfft()` | Shared contract across GPU and CPU paths | Makes real-input usage explicit |
| `createSpectrumAnalyzer()` | CPU-only helper | Should never be described as GPU-native |
| `createImageFilter()` | CPU-only helper | Uses CPU 2D FFT internally |

## Execution sequence

1. **Validate the contract**: size, shape, and real-input constraints are checked before work starts.
2. **Select or reuse an execution plan**: the engine reuses prepared resources for previously-seen sizes instead of rebuilding everything every call.
3. **Dispatch GPU passes**: the WebGPU path runs bit-reversal, butterfly, and scaling passes over WGSL shaders.
4. **Return or reconstruct output**: complex or real-output contracts are restored from the transform result.
5. **Keep utilities honest**: spectrum analysis and image filtering continue to compose CPU FFT building blocks.

## Design choices that carry most of the weight

| Decision | Why it exists | Consequence |
| --- | --- | --- |
| Radix-2 Cooley-Tukey DIT | Best fit for predictable GPU memory access and maintainable code | Input sizes must remain powers of two |
| Row-column decomposition for 2D FFT | Reuses 1D kernels instead of building a separate 2D butterfly system | Adds an explicit transpose-oriented mental model |
| `workgroupSize = 256` | Keeps the shader surface stable during closeout | Tuning is hardware-dependent and intentionally not over-exposed |
| Optional bank-conflict optimization | Leaves room for hardware-specific wins without changing the default contract | Default stays conservative until profiling justifies flipping it |
| Shader source of truth in `src/shaders/sources.ts` | Avoids drift between implementation and reference copies | WGSL changes stay centralized |

## Codebase map

| Layer | Files | Responsibility |
| --- | --- | --- |
| Public API | `src/index.ts`, `src/types.ts` | Exports the supported contract |
| Core engine | `src/core/fft-engine.ts`, `src/core/gpu-fft-backend.ts` | Validation, resource lifetime, plan reuse |
| Shader truth | `src/shaders/sources.ts` | Canonical WGSL source strings |
| CPU utilities | `src/utils/**`, `src/apps/**` | Fallback path plus CPU-only helpers |
| Specifications | `openspec/specs/**` | Product, API, testing, and governance truth |

## Read these RFCs next

- [RFC 0001: WebGPU FFT Library Architecture](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0001-webgpu-fft-library-architecture.md)
- [RFC 0003: 2D FFT Transpose Strategy](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md)
- [Public API alignment spec](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/public-api-alignment/spec.md)

## What this architecture intentionally does not do

- It does not claim GPU-native spectrum analysis.
- It does not claim GPU-native image filtering.
- It does not chase arbitrary-size FFT support in the current product slice.
- It does not optimize for every GPU family at the cost of a larger maintenance surface.
