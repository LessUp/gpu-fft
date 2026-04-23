---
name: benchmark
description: Run performance benchmarks for the FFT library. Use when checking performance characteristics or comparing implementations.
---

Run FFT performance benchmarks:

```bash
npm run benchmark
```

This executes `benchmarks/fft-benchmark.ts` which tests FFT performance across various sizes and compares GPU vs CPU implementations.

## What to look for

- **GPU vs CPU speedup ratio** — should be significant for larger FFT sizes
- **Memory usage** — watch for leaks or excessive allocation
- **Initialization time** — WebGPU device setup cost

## Notes

- Requires a WebGPU-capable browser or Node.js with WebGPU support
- First run includes WebGPU initialization overhead
- Benchmark results vary by GPU hardware
