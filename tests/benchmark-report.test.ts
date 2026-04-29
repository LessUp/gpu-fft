import { describe, expect, it } from 'vitest';
import { generateBenchmarkReport } from '../benchmarks/fft-benchmark';

const cpuResults = [
  {
    size: 256,
    iterations: 5,
    mean: 1.25,
    median: 1.2,
    min: 1.1,
    max: 1.4,
    stdDev: 0.1,
  },
];

const gpuResults = [
  {
    size: 256,
    iterations: 5,
    mean: 0.3,
    median: 0.28,
    min: 0.25,
    max: 0.35,
    stdDev: 0.03,
  },
];

describe('benchmark report generation', () => {
  it('reports measured CPU results and explicitly states when WebGPU is not measured', () => {
    const report = generateBenchmarkReport({ cpuResults });

    expect(report).toContain('## CPU FFT Performance');
    expect(report).toContain('WebGPU measurements were not collected');
    expect(report).not.toContain('Expected WebGPU Performance');
  });

  it('includes a measured WebGPU section when GPU results are available', () => {
    const report = generateBenchmarkReport({ cpuResults, gpuResults });

    expect(report).toContain('## WebGPU FFT Performance');
    expect(report).toContain('| 256 | 0.30 | 0.28 | 0.25 | 0.35 | 0.03 |');
  });
});
