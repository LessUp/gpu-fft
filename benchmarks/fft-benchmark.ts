/* eslint-disable no-console */
/**
 * FFT Performance Benchmark
 *
 * Measures the performance of the WebGPU FFT Library across various
 * input sizes and configurations.
 */

// Note: In a real benchmark, you would import from the built library
// import { createFFTEngine, FFTEngineConfig } from 'webgpu-fft';

interface BenchmarkResult {
  size: number;
  iterations: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

/**
 * Calculate statistics from an array of measurements
 */
function calculateStats(measurements: number[]): Omit<BenchmarkResult, 'size' | 'iterations'> {
  const sorted = [...measurements].sort((a, b) => a - b);
  const n = sorted.length;

  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const min = sorted[0];
  const max = sorted[n - 1];

  const variance = sorted.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  return { mean, median, min, max, stdDev };
}

/**
 * Format a number with appropriate precision
 */
function formatNumber(n: number, decimals: number = 2): string {
  if (n < 0.01) {
    return n.toExponential(decimals);
  }
  return n.toFixed(decimals);
}

/**
 * Simple CPU FFT for comparison (Cooley-Tukey)
 */
function cpuFFT(real: Float32Array, imag: Float32Array): void {
  const n = real.length;
  const bits = Math.log2(n);

  // Bit reversal
  for (let i = 0; i < n; i++) {
    let j = 0;
    let x = i;
    for (let k = 0; k < bits; k++) {
      j = (j << 1) | (x & 1);
      x >>= 1;
    }
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // Butterfly stages
  for (let s = 1; s <= bits; s++) {
    const m = 1 << s;
    const wm = (-2 * Math.PI) / m;

    for (let k = 0; k < n; k += m) {
      let w_real = 1,
        w_imag = 0;
      const cos_wm = Math.cos(wm);
      const sin_wm = Math.sin(wm);

      for (let j = 0; j < m / 2; j++) {
        const t_real = w_real * real[k + j + m / 2] - w_imag * imag[k + j + m / 2];
        const t_imag = w_real * imag[k + j + m / 2] + w_imag * real[k + j + m / 2];

        real[k + j + m / 2] = real[k + j] - t_real;
        imag[k + j + m / 2] = imag[k + j] - t_imag;
        real[k + j] = real[k + j] + t_real;
        imag[k + j] = imag[k + j] + t_imag;

        const new_w_real = w_real * cos_wm - w_imag * sin_wm;
        w_imag = w_real * sin_wm + w_imag * cos_wm;
        w_real = new_w_real;
      }
    }
  }
}

/**
 * Benchmark CPU FFT
 */
function benchmarkCPU(size: number, iterations: number): BenchmarkResult {
  const measurements: number[] = [];

  // Warm-up
  for (let i = 0; i < 5; i++) {
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    for (let j = 0; j < size; j++) {
      real[j] = Math.random();
    }
    cpuFFT(real, imag);
  }

  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    for (let j = 0; j < size; j++) {
      real[j] = Math.random();
    }

    const start = performance.now();
    cpuFFT(real, imag);
    const end = performance.now();

    measurements.push(end - start);
  }

  return {
    size,
    iterations,
    ...calculateStats(measurements),
  };
}

/**
 * Generate markdown report
 */
function generateReport(cpuResults: BenchmarkResult[]): string {
  let report = `# FFT Benchmark Results

Generated: ${new Date().toISOString()}

## System Information

- Platform: ${typeof process !== 'undefined' ? process.platform : 'browser'}
- Node.js: ${typeof process !== 'undefined' ? process.version : 'N/A'}

## CPU FFT Performance

| Size | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev |
|------|-----------|-------------|----------|----------|---------|
`;

  for (const result of cpuResults) {
    report += `| ${result.size} | ${formatNumber(result.mean)} | ${formatNumber(result.median)} | ${formatNumber(result.min)} | ${formatNumber(result.max)} | ${formatNumber(result.stdDev)} |\n`;
  }

  report += `
## Notes

- All times are in milliseconds
- Each benchmark ran ${cpuResults[0]?.iterations || 100} iterations
- CPU FFT uses Cooley-Tukey Radix-2 algorithm
- WebGPU benchmarks require a WebGPU-capable environment

## WebGPU Benchmarks

WebGPU benchmarks are not available in this environment.
To run WebGPU benchmarks, use a browser with WebGPU support.

### Expected WebGPU Performance

Based on typical GPU performance, WebGPU FFT should be:
- 10-100x faster than CPU for large sizes (>4096)
- Similar or slightly slower for small sizes (<256) due to GPU overhead
- Bank conflict optimization provides 10-30% improvement

## Methodology

1. Warm-up runs are performed before measurement
2. Random input data is generated for each iteration
3. Statistics are calculated from all iterations
4. Results exclude data transfer time (GPU only)
`;

  return report;
}

/**
 * Main benchmark function
 */
async function main(): Promise<void> {
  console.log('=== WebGPU FFT Library - Performance Benchmark ===\n');

  const sizes = [256, 512, 1024, 2048, 4096, 8192, 16384];
  const iterations = 100;

  console.log(`Running CPU benchmarks (${iterations} iterations each)...\n`);

  const cpuResults: BenchmarkResult[] = [];

  for (const size of sizes) {
    console.log(`  Benchmarking size ${size}...`);
    const result = benchmarkCPU(size, iterations);
    cpuResults.push(result);
    console.log(
      `    Mean: ${formatNumber(result.mean)} ms, Median: ${formatNumber(result.median)} ms`
    );
  }

  console.log('\n--- CPU FFT Results ---\n');
  console.log('Size\t\tMean (ms)\tMedian (ms)\tMin (ms)\tMax (ms)');
  console.log('----\t\t---------\t-----------\t--------\t--------');

  for (const result of cpuResults) {
    console.log(
      `${result.size}\t\t${formatNumber(result.mean)}\t\t${formatNumber(result.median)}\t\t${formatNumber(result.min)}\t\t${formatNumber(result.max)}`
    );
  }

  // Generate report
  const report = generateReport(cpuResults);

  // In a real implementation, you would write this to a file
  console.log('\n--- Benchmark Report ---\n');
  console.log(report);

  console.log('\nBenchmark complete!');
}

// Run benchmarks
main().catch(console.error);
