// Spectrum Analyzer - Real-time audio frequency spectrum analysis
import type { SpectrumAnalyzerConfig } from '../types';
import { cpuFFT } from '../utils/cpu-fft';
import { hannWindow, applyWindowComplex } from '../utils/window-functions';
import { isPowerOf2 } from '../utils/bit-reversal';
import { FFTError, FFTErrorCode } from '../core/errors';

export class SpectrumAnalyzer {
  private config: SpectrumAnalyzerConfig;
  private window: Float32Array;

  constructor(config: SpectrumAnalyzerConfig) {
    if (!isPowerOf2(config.fftSize) || config.fftSize < 2) {
      throw new FFTError(
        `fftSize must be a power of 2 and at least 2, got ${config.fftSize}`,
        FFTErrorCode.INVALID_INPUT_SIZE
      );
    }
    this.config = config;
    this.window = hannWindow(config.fftSize);
  }

  async analyze(audioData: Float32Array): Promise<Float32Array> {
    const fftSize = this.config.fftSize;

    // Validate input size
    if (audioData.length !== fftSize) {
      throw new FFTError(
        `Audio data length ${audioData.length} does not match FFT size ${fftSize}`,
        FFTErrorCode.DIMENSION_MISMATCH
      );
    }

    // Convert real audio data to complex format (interleaved)
    const complexInput = new Float32Array(fftSize * 2);
    for (let i = 0; i < fftSize; i++) {
      complexInput[i * 2] = audioData[i];
      complexInput[i * 2 + 1] = 0;
    }

    // Apply Hann window
    const windowed = applyWindowComplex(complexInput, this.window);

    // Compute FFT
    const fftResult = cpuFFT(windowed);

    // Extract magnitude spectrum and convert to dB
    // Return only positive frequencies (0 to Nyquist)
    const numBins = Math.floor(fftSize / 2) + 1;
    const spectrum = new Float32Array(numBins);

    for (let i = 0; i < numBins; i++) {
      const real = fftResult[i * 2];
      const imag = fftResult[i * 2 + 1];
      const magnitude = Math.sqrt(real * real + imag * imag);

      // Convert to dB with floor at -100 dB
      if (magnitude > 1e-10) {
        spectrum[i] = 20 * Math.log10(magnitude);
      } else {
        spectrum[i] = -100;
      }
    }

    return spectrum;
  }

  // Get frequency for a given bin index
  getFrequency(binIndex: number): number {
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
