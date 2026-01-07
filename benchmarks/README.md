# WebGPU FFT Library - Benchmarks

This directory contains performance benchmarks for the WebGPU FFT Library.

## Running Benchmarks

```bash
npm run benchmark
```

## Benchmark Results

See [results.md](results.md) for the latest benchmark results.

## What's Measured

1. **FFT Performance by Size**: Measures FFT computation time for various input sizes (256 to 65536 elements)

2. **Bank Conflict Optimization**: Compares performance with and without bank conflict optimization

3. **2D FFT Performance**: Measures 2D FFT computation time for various image sizes

4. **Round-Trip Performance**: Measures FFT + IFFT combined performance

## Methodology

- Each benchmark runs multiple iterations (default: 100)
- Results include mean, median, min, max, and standard deviation
- Warm-up runs are performed before measurement
- GPU synchronization is ensured between measurements
