# Architecture Decisions

> This page is the decision ledger behind the project. Each choice here is intentionally narrower than the theoretical FFT design space because the repository optimizes for a credible, low-maintenance product slice.

## Decision 01: WebGPU is the primary acceleration path

**Problem:** Browser FFT libraries historically live on CPU JavaScript, WASM, or awkward WebGL compute tricks.  
**Decision:** Use WebGPU compute shaders as the primary accelerated backend and keep CPU fallbacks for universal availability.  
**Why this beats the alternatives:** WebGPU exposes compute-oriented semantics that fit FFT much better than WebGL, while avoiding a second, more complex deployment story.  
**Consequence:** Public docs must always distinguish the GPU core from CPU-only utilities.

## Decision 02: Radix-2 Cooley-Tukey stays the algorithmic center

**Problem:** Mixed-radix, Bluestein, and split-radix each widen the supported input space, but they also enlarge the implementation and testing surface.  
**Decision:** Keep radix-2 DIT as the current implementation center.  
**Why this beats the alternatives:** It maps cleanly onto GPU workgroups, stays maintainable, and keeps correctness reasoning simpler in a closeout-phase repository.  
**Consequence:** Input sizes remain power-of-two constrained unless callers preprocess data.

## Decision 03: 2D FFT reuses 1D kernels through row-column decomposition

**Problem:** 2D FFT can be implemented with bespoke kernels or by composing stable 1D machinery.  
**Decision:** Reuse the 1D path and compose 2D transforms through row-column decomposition and explicit transpose strategy.  
**Why this beats the alternatives:** It minimizes new kernel surface area and keeps the architecture legible.  
**Consequence:** The 2D mental model includes transpose-oriented planning rather than a separate black-box 2D engine.

## Decision 04: Honest scope beats inflated product claims

**Problem:** It is tempting to describe the whole library as “GPU-accelerated signal processing,” but that blurs the actual product slice.  
**Decision:** Keep spectrum analysis and image filtering documented as CPU-only utilities until their backend reality changes.  
**Why this beats the alternatives:** It keeps README, Pages, and OpenSpec in alignment and prevents the site from becoming less credible than the code.  
**Consequence:** The public narrative is narrower, but far more defensible.

## Decision 05: Closeout-stage stability outranks speculative optimization

**Problem:** There are always more hardware-specific FFT optimizations available.  
**Decision:** Keep `workgroupSize` fixed at 256 and leave bank-conflict optimization off by default unless hardware evidence justifies a change.  
**Why this beats the alternatives:** It preserves a stable baseline and avoids turning the docs into a promise surface for tuning work that is not broadly validated yet.  
**Consequence:** The library may leave some peak performance on the table, but gains predictability and lower maintenance cost.

## Where to read deeper

- [Architecture Overview](/architecture/overview)
- [Benchmarks](/showcase/benchmarks)
- [RFC 0001](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0001-webgpu-fft-library-architecture.md)
- [RFC 0003](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md)
