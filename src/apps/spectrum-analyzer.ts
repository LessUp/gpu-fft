// Spectrum Analyzer - Real-time audio frequency spectrum analysis
import type { SpectrumAnalyzerConfig, WindowType } from '../types';
import type { FFTBackend } from '../core/backend';
import { CPUFFTBackend } from '../utils/cpu-fft';
import {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
} from '../utils/window-functions';
import { validateSpectrumAnalyzerConfig } from '../core/validation';
import { FFTError, FFTErrorCode } from '../core/errors';

const DB_FLOOR = -100;
const MIN_MAGNITUDE = 1e-10;

function getWindowFunction(type: WindowType): (size: number) => Float32Array {
  switch (type) {
    case 'hann':
      return hannWindow;
    case 'hamming':
      return hammingWindow;
    case 'blackman':
      return blackmanWindow;
    case 'flattop':
      return flatTopWindow;
    case 'rectangular':
      return rectangularWindow;
    default:
      return hannWindow;
  }
}

/**
 * Real-time audio frequency spectrum analyzer.
 *
 * @remarks
 * 默认使用 CPU 后端。可通过构造函数注入自定义 FFTBackend，
 * 例如 GPU 后端或测试用 mock。
 *
 * @example
 * ```typescript
 * // 使用默认 CPU 后端
 * const analyzer = await createSpectrumAnalyzer({
 *   fftSize: 2048,
 *   sampleRate: 44100
 * });
 *
 * // 注入自定义后端
 * const gpuBackend = await createGPUFFTBackend();
 * const analyzer = new SpectrumAnalyzer(config, gpuBackend);
 * ```
 */
export class SpectrumAnalyzer {
  private config: SpectrumAnalyzerConfig;
  private window: Float32Array;
  private complexInput: Float32Array;
  private backend: FFTBackend;

  constructor(config: SpectrumAnalyzerConfig, backend?: FFTBackend) {
    validateSpectrumAnalyzerConfig(config);
    this.config = { windowType: 'hann', ...config };
    this.backend = backend ?? new CPUFFTBackend();
    const windowFn = getWindowFunction(this.config.windowType!);
    this.window = windowFn(config.fftSize);
    this.complexInput = new Float32Array(config.fftSize * 2);
  }

  async analyze(audioData: Float32Array): Promise<Float32Array> {
    const fftSize = this.config.fftSize;

    if (audioData.length !== fftSize) {
      throw new FFTError(
        `Audio data length ${audioData.length} does not match FFT size ${fftSize}`,
        FFTErrorCode.DIMENSION_MISMATCH
      );
    }

    for (let i = 0; i < fftSize; i++) {
      this.complexInput[i * 2] = audioData[i] * this.window[i];
      this.complexInput[i * 2 + 1] = 0;
    }

    const fftResult = await this.backend.fft(this.complexInput);
    const numBins = Math.floor(fftSize / 2) + 1;
    const spectrum = new Float32Array(numBins);

    for (let i = 0; i < numBins; i++) {
      const real = fftResult[i * 2];
      const imag = fftResult[i * 2 + 1];
      const magnitude = Math.sqrt(real * real + imag * imag);
      spectrum[i] = magnitude > MIN_MAGNITUDE ? 20 * Math.log10(magnitude) : DB_FLOOR;
    }

    return spectrum;
  }

  // Get frequency for a given bin index
  getFrequency(binIndex: number): number {
    const maxBin = Math.floor(this.config.fftSize / 2);
    if (!Number.isInteger(binIndex) || binIndex < 0 || binIndex > maxBin) {
      throw new FFTError(
        `binIndex must be an integer in [0, ${maxBin}], got ${binIndex}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    return (binIndex * this.config.sampleRate) / this.config.fftSize;
  }

  // Get all frequency bin centers
  getFrequencies(): Float32Array {
    const numBins = Math.floor(this.config.fftSize / 2) + 1;
    const frequencies = new Float32Array(numBins);
    for (let i = 0; i < numBins; i++) {
      frequencies[i] = this.getFrequency(i);
    }
    return frequencies;
  }

  dispose(): void {
    this.backend.dispose?.();
  }
}

export async function createSpectrumAnalyzer(
  config: SpectrumAnalyzerConfig
): Promise<SpectrumAnalyzer> {
  return new SpectrumAnalyzer(config);
}
