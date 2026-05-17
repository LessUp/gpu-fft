# Performance Benchmarks

> This page is evidence, not promise. Every number below comes from measured repository output, and GPU-specific claims stop where measurements stop.

<div class="guide-summary">
  <strong>Current environment:</strong> the published sample below reflects a CPU-only CI run on WSL2 + Node.js 22. When you run the benchmark on hardware with WebGPU support, the script will add measured GPU results. It will not invent them for you.
</div>

## Sample CPU evidence

<BenchmarkEvidence />

## Raw data from the current reference run

| Size | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev |
| --- | --- | --- | --- | --- | --- |
| 256 | 0.13 | 0.05 | 0.04 | 2.66 | 0.31 |
| 512 | 0.16 | 0.13 | 0.11 | 0.58 | 0.07 |
| 1024 | 0.36 | 0.28 | 0.24 | 3.96 | 0.39 |
| 2048 | 0.80 | 0.64 | 0.42 | 7.34 | 0.80 |
| 4096 | 1.45 | 1.41 | 0.91 | 3.29 | 0.28 |
| 8192 | 3.48 | 3.07 | 2.36 | 11.15 | 1.24 |
| 16384 | 6.95 | 6.71 | 4.84 | 15.86 | 1.45 |

## How to read this page correctly

- These numbers show the **CPU path** only, because the CI environment had no WebGPU adapter.
- The benchmark is designed to report **measured CPU results everywhere** and **measured WebGPU results only when available**.
- Small-size variance is dominated by JavaScript runtime overhead, not just the FFT algorithm itself.
- You should treat GPU crossover points as hardware-specific questions, not as repository-wide marketing constants.

## Reproduce on your own hardware

```bash
npm run benchmark
```

The benchmark output will include:

1. CPU timing for every tested size
2. WebGPU timing only when a WebGPU adapter is actually available
3. Environment metadata so the results stay interpretable

## What this page refuses to do

- It does not publish a fixed “expected speedup” ratio.
- It does not extrapolate GPU numbers from a CPU-only environment.
- It does not blur the line between a measured claim and an informed guess.
