/* eslint-disable no-console */
/**
 * FFT Performance Benchmark
 *
 * Measures repository CPU FFT performance and, when available in the current
 * environment, repository WebGPU FFT performance.
 */

import { pathToFileURL } from 'node:url';
import { cpuFFT, createFFTEngine, isWebGPUAvailable } from '../src/index';

export interface BenchmarkResult {
  size: number;
  iterations: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
}

interface BenchmarkReportInput {
  cpuResults: BenchmarkResult[];
  gpuResults?: BenchmarkResult[];
  generatedAt?: Date;
  platform?: string;
  nodeVersion?: string;
}

function createComplexInput(size: number): Float32Array {
  const input = new Float32Array(size * 2);
  for (let i = 0; i < size; i++) {
    input[i * 2] = Math.random();
    input[i * 2 + 1] = 0;
  }
  return input;
}

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

function formatNumber(n: number, decimals: number = 2): string {
  if (n < 0.01) {
    return n.toExponential(decimals);
  }
  return n.toFixed(decimals);
}

function formatResultsTable(results: BenchmarkResult[]): string {
  let table = `| Size | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | Std Dev |
|------|-----------|-------------|----------|----------|---------|
`;

  for (const result of results) {
    table += `| ${result.size} | ${formatNumber(result.mean)} | ${formatNumber(result.median)} | ${formatNumber(result.min)} | ${formatNumber(result.max)} | ${formatNumber(result.stdDev)} |\n`;
  }

  return table;
}

export function generateBenchmarkReport({
  cpuResults,
  gpuResults = [],
  generatedAt = new Date(),
  platform = typeof process !== 'undefined' ? process.platform : 'browser',
  nodeVersion = typeof process !== 'undefined' ? process.version : 'N/A',
}: BenchmarkReportInput): string {
  let report = `# FFT Benchmark Results

Generated: ${generatedAt.toISOString()}

## System Information

- Platform: ${platform}
- Node.js: ${nodeVersion}

## CPU FFT Performance

${formatResultsTable(cpuResults)}
`;

  if (gpuResults.length > 0) {
    report += `
## WebGPU FFT Performance

${formatResultsTable(gpuResults)}
`;
  } else {
    report += `
## WebGPU FFT Performance

WebGPU measurements were not collected in this run.
`;
  }

  report += `
## Notes

- All times are in milliseconds.
- CPU and WebGPU measurements are produced from the repository implementation.
- WebGPU measurements, when present, include the current engine's upload, execution, and readback path.

## Methodology

1. Warm-up runs are performed before measurement.
2. Random real-valued signals are packed into the repository's interleaved complex format.
3. Statistics are calculated from measured iterations only.
4. No speculative or static expected-performance statements are included.
`;

  return report;
}

function benchmarkCPU(size: number, iterations: number): BenchmarkResult {
  const measurements: number[] = [];

  for (let i = 0; i < 5; i++) {
    cpuFFT(createComplexInput(size));
  }

  for (let i = 0; i < iterations; i++) {
    const input = createComplexInput(size);
    const start = performance.now();
    cpuFFT(input);
    const end = performance.now();
    measurements.push(end - start);
  }

  return {
    size,
    iterations,
    ...calculateStats(measurements),
  };
}

async function benchmarkGPU(size: number, iterations: number): Promise<BenchmarkResult> {
  const engine = await createFFTEngine();
  const measurements: number[] = [];

  try {
    for (let i = 0; i < 3; i++) {
      await engine.fft(createComplexInput(size));
    }

    for (let i = 0; i < iterations; i++) {
      const input = createComplexInput(size);
      const start = performance.now();
      await engine.fft(input);
      const end = performance.now();
      measurements.push(end - start);
    }
  } finally {
    engine.dispose();
  }

  return {
    size,
    iterations,
    ...calculateStats(measurements),
  };
}

async function collectGPUResults(
  sizes: number[],
  iterations: number
): Promise<BenchmarkResult[] | undefined> {
  if (!(await isWebGPUAvailable())) {
    return undefined;
  }

  const results: BenchmarkResult[] = [];
  for (const size of sizes) {
    console.log(`  Benchmarking WebGPU size ${size}...`);
    results.push(await benchmarkGPU(size, iterations));
  }
  return results;
}

export async function main(): Promise<void> {
  console.log('=== WebGPU FFT Library - Performance Benchmark ===\n');

  const sizes = [256, 512, 1024, 2048, 4096, 8192, 16384];
  const iterations = 100;

  console.log(`Running CPU benchmarks (${iterations} iterations each)...\n`);
  const cpuResults = sizes.map((size) => {
    console.log(`  Benchmarking CPU size ${size}...`);
    const result = benchmarkCPU(size, iterations);
    console.log(
      `    Mean: ${formatNumber(result.mean)} ms, Median: ${formatNumber(result.median)} ms`
    );
    return result;
  });

  console.log('\nChecking whether WebGPU measurements can be collected...\n');
  const gpuResults = await collectGPUResults(sizes, iterations);
  if (!gpuResults) {
    console.log('WebGPU measurements were not collected in this run.\n');
  }

  const report = generateBenchmarkReport({ cpuResults, gpuResults });

  console.log('--- Benchmark Report ---\n');
  console.log(report);
  console.log('\nBenchmark complete!');
}

if (
  typeof process !== 'undefined' &&
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
