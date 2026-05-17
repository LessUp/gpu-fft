# Reading Map

> Treat the site like a compact academy: different readers need different routes through the same material.

## Four useful reading tracks

| Track | Best for | Read in this order |
| --- | --- | --- |
| Evaluator | Interviewers, maintainers, skeptical reviewers | [Homepage](/en/) → [Guided Start](/en/guides/getting-started) → [Architecture Overview](/architecture/overview) → [Benchmarks](/showcase/benchmarks) |
| API reader | Engineers deciding whether to integrate | [Quick Start](/setup/quick-start) → [API Reference](/api/index) → [Browser Support](/setup/browser-support) |
| DSP learner | Readers refreshing FFT theory | [Tutorials](/tutorials/introduction) → [Architecture Overview](/architecture/overview) → [Academic Papers](/reference/papers) |
| Contributor | People likely to modify code or docs | [Architecture Overview](/architecture/overview) → [Architecture Decisions](/showcase/decisions) → [AI Tooling & LSP](/setup/ai-tooling) → [Contributing](/contributing) |

## What each route answers

<div class="chapter-grid">
  <article class="chapter-card">
    <p class="chapter-index">Evaluator</p>
    <h3>What is real here?</h3>
    <p>Focus on supported surfaces, capability boundaries, and benchmark honesty.</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">API reader</p>
    <h3>Can I integrate it quickly?</h3>
    <p>Focus on data contracts, installation cost, browser support, and failure paths.</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">DSP learner</p>
    <h3>Why is it designed this way?</h3>
    <p>Focus on radix-2, Hermitian compression, GPU mapping, and external references.</p>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">Contributor</p>
    <h3>How do I change it safely?</h3>
    <p>Focus on OpenSpec truth, architecture decisions, and the low-maintenance repo posture.</p>
  </article>
</div>

## Shared pages worth bookmarking

- [Architecture Overview](/architecture/overview)
- [Benchmarks](/showcase/benchmarks)
- [Architecture Decisions](/showcase/decisions)
- [Reference Hub](/reference/index)

## One important reading habit

<div class="shared-language-note">
  <p>
    Do not read “GPU-accelerated” as a blanket statement for the entire library. The core FFT path is
    GPU-capable, while spectrum analysis and image filtering remain CPU-only. The strongest reading
    path is the one that keeps that distinction in view from the beginning.
  </p>
</div>
