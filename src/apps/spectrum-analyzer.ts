// Spectrum Analyzer - Real-time audio frequency spectrum analysis
import type { SpectrumAnalyzerConfig, WindowType } from '../types';
import { cpuFFT } from '../utils/cpu-fft';
import {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
} from '../utils/window-functions';
import { isPowerOf2 } from '../utils/bit-reversal';
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
 * This is a CPU-only implementation and does not use GPU acceleration.
 * For GPU-accelerated FFT, use {@link FFTEngine} directly.
 *
 * @example
 * ```typescript
 * const analyzer = await createSpectrumAnalyzer({
 *   fftSize: 2048,
 *   sampleRate: 44100
 * });
 * const spectrum = await analyzer.analyze(audioData);
 * ```
 */
export class SpectrumAnalyzer {
  private config: SpectrumAnalyzerConfig;
  private window: Float32Array;
  private complexInput: Float32Array;

  constructor(config: SpectrumAnalyzerConfig) {
    if (!isPowerOf2(config.fftSize) || config.fftSize < 2) {
      throw new FFTError(
        `fftSize must be a power of 2 and at least 2, got ${config.fftSize}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    if (!Number.isFinite(config.sampleRate) || config.sampleRate <= 0) {
      throw new FFTError(
        `sampleRate must be a finite number greater than 0, got ${config.sampleRate}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    this.config = { windowType: 'hann', ...config };
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

    const fftResult = cpuFFT(this.complexInput);
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
    // No resources to clean up in CPU version
  }
}

export async function createSpectrumAnalyzer(
  config: SpectrumAnalyzerConfig
): Promise<SpectrumAnalyzer> {
  return new SpectrumAnalyzer(config);
}
