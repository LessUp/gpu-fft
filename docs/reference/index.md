# Reference Hub

> This hub answers a different question from the rest of the site: not “how do I use the library?”, but “where does this project sit in the larger FFT, DSP, and GPU-compute landscape?”

<div class="guide-summary">
  <strong>Use this section when:</strong> you want to cross-check architectural choices against papers, understand how larger libraries differ, or build an interview-ready mental map of the ecosystem.
</div>

## Quick navigation

<div class="reference-grid">
  <div class="reference-card">
    <div class="reference-card-title">[Academic Papers](/reference/papers)</div>
    <div class="reference-card-desc">
      Foundational FFT papers, GPU implementation research, and DSP references that anchor the project.
    </div>
  </div>
  <div class="reference-card">
    <div class="reference-card-title">[Reference Implementations](/reference/implementations)</div>
    <div class="reference-card-desc">
      Compare the project against FFTW, cuFFT, VkFFT, TensorFlow.js, and other practical baselines.
    </div>
  </div>
  <div class="reference-card">
    <div class="reference-card-title">[Learning Resources](/reference/learning)</div>
    <div class="reference-card-desc">
      Tutorials, videos, WebGPU learning material, and textbook-style resources for deeper study.
    </div>
  </div>
</div>

## What this hub is for

1. **Algorithm lineage:** why radix-2 remains central, and what alternatives would cost.
2. **Implementation context:** how a browser-first WebGPU FFT differs from platform-specific giants.
3. **Research credibility:** which papers and standards the docs point to when they make claims.

## Technical specifications worth keeping nearby

| Spec | Link | Why it matters here |
| --- | --- | --- |
| WebGPU spec | [w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/) | Defines the compute API this project targets |
| WGSL spec | [w3.org/TR/WGSL](https://www.w3.org/TR/WGSL/) | Governs the shader language used by the FFT core |
| IEEE 754-2019 | [ieee.org](https://standards.ieee.org/standard/754-2019.html) | Frames floating-point behavior across JavaScript and shaders |

## Read this section alongside

- [Architecture Overview](/architecture/overview)
- [Benchmarks](/showcase/benchmarks)
- [Architecture Decisions](/showcase/decisions)
