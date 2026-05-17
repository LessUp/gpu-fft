---
layout: home
---

<div class="whitepaper-home">
  <section class="paper-cover">
    <p class="cover-kicker">Browser-native FFT whitepaper</p>
    <h1 class="cover-title">A focused WebGPU FFT core, presented like an architecture dossier.</h1>
    <p class="cover-lead">
      This site is the evaluation front-end for <code>gpu-fft</code>: a JavaScript / TypeScript FFT
      library with a WebGPU execution core, explicit CPU fallback paths, and contract-first
      real-input APIs. It is written for interviewers, maintainers, and engineers who want to see
      exactly what the project does, what it does not do, and how to verify those claims.
    </p>
    <div class="cover-actions">
      <a class="action-pill action-pill--brand" href="./guides/getting-started">Start the guided tour</a>
      <a class="action-pill" href="/architecture/overview">Read the system map</a>
      <a class="action-pill" href="/showcase/benchmarks">Inspect evidence</a>
    </div>
    <p class="cover-note">
      GPU-accelerated FFT core, CPU-only analysis utilities, zero runtime dependencies, and
      documentation that keeps those boundaries explicit.
    </p>
  </section>

  <section class="paper-grid paper-grid--hero">
    <article class="paper-panel">
      <p class="panel-kicker">Current product slice</p>
      <h2>What ships today</h2>
      <ul class="signal-points">
        <li>1D and 2D complex FFT / IFFT on both WebGPU and CPU paths</li>
        <li>1D and 2D real-input FFT APIs with explicit half-spectrum contracts</li>
        <li>CPU-only spectrum analysis and frequency-domain image filtering helpers</li>
        <li>TypeScript-first exports with lightweight packaging and no runtime dependencies</li>
      </ul>
    </article>
    <CapabilityMatrix />
  </section>
</div>

## Read the project in layers

<div class="chapter-grid">
  <article class="chapter-card">
    <p class="chapter-index">Guide</p>
    <h3>Understand fit and boundaries first.</h3>
    <p>Start with the guided evaluation path before reading implementation detail.</p>
    <a class="chapter-link" href="./guides/getting-started">Open the guide</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">Academy</p>
    <h3>Use the reading map like a syllabus.</h3>
    <p>Choose the shortest route for evaluators, DSP learners, or contributors.</p>
    <a class="chapter-link" href="./academy/reading-map">Open the academy map</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">Architecture</p>
    <h3>See how the compute path is actually layered.</h3>
    <p>Follow the execution planner, GPU passes, and CPU-only utility boundary.</p>
    <a class="chapter-link" href="/architecture/overview">Open architecture</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">Evidence</p>
    <h3>Read the benchmark and ADR pages like proof, not marketing.</h3>
    <p>Measured results, explicit caveats, and decision records sit in one place.</p>
    <a class="chapter-link" href="/showcase/benchmarks">Open evidence</a>
  </article>
  <article class="chapter-card">
    <p class="chapter-index">Reference</p>
    <h3>Locate the project in the wider FFT ecosystem.</h3>
    <p>Foundational papers, related libraries, and learning resources are curated here.</p>
    <a class="chapter-link" href="/reference/index">Open references</a>
  </article>
</div>

## System readout

<ArchitectureAtlas />

## Why this front page is opinionated

<div class="paper-grid paper-grid--hero">
  <article class="paper-panel">
    <p class="panel-kicker">What this page optimizes for</p>
    <h2>Evaluation speed, architectural honesty, and long-term maintainability.</h2>
    <p>
      The goal is not to make the library look larger than it is. The goal is to let a technical
      reader understand the actual product slice quickly enough that deeper questions become more
      interesting than basic clarification.
    </p>
  </article>
  <article class="paper-panel">
    <p class="panel-kicker">What not to infer</p>
    <h2>This is not a general DSP framework.</h2>
    <ul class="signal-points">
      <li>It does not claim GPU-native spectrum analysis or GPU-native image filtering.</li>
      <li>It does not promise arbitrary-size FFT without preprocessing.</li>
      <li>It does not publish speculative speedup numbers without benchmark support.</li>
    </ul>
  </article>
</div>

## Continue with the right route

| If you need | Start here |
| --- | --- |
| A fast technical evaluation | [Guided Start](./guides/getting-started) |
| A reading sequence for interviews or code review | [Academy Reading Map](./academy/reading-map) |
| The execution model and capability boundary | [Architecture Overview](/architecture/overview) |
| Empirical performance context | [Benchmarks](/showcase/benchmarks) |
| The scholarly and ecosystem backdrop | [Reference Hub](/reference/index) |
