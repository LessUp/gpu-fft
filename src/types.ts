// Type definitions for WebGPU FFT Library

export interface Complex {
  real: number;
  imag: number;
}

export interface FFTEngineConfig {
  enableBankConflictOptimization: boolean;
  workgroupSize: number;
}

export interface SpectrumAnalyzerConfig {
  fftSize: 256 | 512 | 1024 | 2048 | 4096;
  sampleRate: number;
}

export type FilterType = 'lowpass' | 'highpass';
export type FilterShape = 'ideal' | 'gaussian';

export interface ImageFilterConfig {
  type: FilterType;
  shape: FilterShape;
  cutoffFrequency: number; // 0.0 to 1.0
}

export interface FFTStageConfig {
  stage: number;
  butterflySpan: number;
  numButterflies: number;
  twiddleBase: number;
}
