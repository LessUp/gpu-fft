# Guided Start

> This page is the shortest serious route through the project. Read it when you want to evaluate fit, boundaries, and next steps without wandering the whole docs tree.

<div class="guide-summary">
  <strong>Fast read:</strong> if you only have ten minutes, read this page, skim the architecture overview, then open the benchmarks page. That sequence is usually enough to understand what the project is and where its limits are.
</div>

## What you are evaluating

- A browser-native FFT core built around WebGPU compute shaders
- CPU fallback paths for environments without WebGPU
- Real-input APIs that expose half-spectrum contracts explicitly
- CPU-only utilities for spectrum analysis and image filtering

## A ten-minute route

1. Read the [homepage](/en/) to understand the public story and current product slice.
2. Jump to [Quick Start](/setup/quick-start) to see the supported API shapes.
3. Open [Architecture Overview](/architecture/overview) to inspect the execution boundary.
4. Read [Benchmarks](/showcase/benchmarks) to see what is measured versus what is intentionally not claimed.
5. Use [Reference Hub](/reference/index) if you want external context before making a call.

## Capability boundary

<CapabilityMatrix />

## Good fit, not a fit

<div class="fit-grid">
  <article class="guide-callout">
    <p class="panel-kicker">Good fit</p>
    <ul class="fit-list">
      <li>You need browser-side FFT with a real WebGPU path.</li>
      <li>You want clear API contracts and low package overhead.</li>
      <li>You care about documented GPU versus CPU boundaries.</li>
    </ul>
  </article>
  <article class="guide-callout fit-negative">
    <p class="panel-kicker">Not a fit</p>
    <ul class="fit-list">
      <li>You need GPU-native spectrum analysis or GPU-native image filtering.</li>
      <li>You need arbitrary-size FFT without preprocessing.</li>
      <li>You want a broad DSP framework far outside FFT-centered workloads.</li>
    </ul>
  </article>
</div>

## Where to go next

| If you care most about | Read next |
| --- | --- |
| API shape and installation | [Quick Start](/setup/quick-start) |
| Browser readiness | [Browser Support](/setup/browser-support) |
| Architectural credibility | [Architecture Overview](/architecture/overview) |
| Performance honesty | [Benchmarks](/showcase/benchmarks) |
| Research context | [Academic Papers](/reference/papers) |
