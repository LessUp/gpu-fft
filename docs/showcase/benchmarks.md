# Performance Benchmarks

> All measurements are collected in your local environment. Run `npm run benchmark` to reproduce.

## 1D FFT Performance

::: info CPU vs WebGPU
The benchmark compares the CPU FFT implementation against the WebGPU compute shader path. WebGPU performance depends heavily on your GPU model and browser version.
:::

## 2D FFT Performance

::: info Resolution scaling
2D FFT scales with the number of pixels. The WebGPU path becomes increasingly advantageous at larger resolutions.
:::

## Reproduce Locally

```bash
npm run benchmark
```

Results are written to the console and include:
- CPU FFT timing for every tested size
- WebGPU FFT timing (only when WebGPU is available)
- Device information for transparency
