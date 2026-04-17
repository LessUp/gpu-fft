// Image Filter - Apply frequency-domain filters to images
import type { ImageFilterConfig } from '../types';
import { FFTError, FFTErrorCode } from '../core/errors';
import { cpuFFT2D, cpuIFFT2D, validateFFT2DInput } from '../utils/cpu-fft';

const DEFAULT_BANDWIDTH = 0.1;
const MIN_GAUSSIAN_SIGMA = 0.01;

/**
 * Apply frequency-domain filters to images (lowpass, highpass, bandpass).
 *
 * @remarks
 * This is a CPU-only implementation and does not use GPU acceleration.
 * For GPU-accelerated FFT, use {@link FFTEngine} directly.
 *
 * @example
 * ```typescript
 * const filter = await createImageFilter({
 *   type: 'lowpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.3
 * });
 * const filtered = await filter.apply(imageData, 256, 256);
 * ```
 */
export class ImageFilter {
  private config: ImageFilterConfig;

  constructor(config: ImageFilterConfig) {
    this.validateConfig(config);
    this.config = {
      ...config,
      bandwidth: config.bandwidth ?? DEFAULT_BANDWIDTH,
    };
  }

  async apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array> {
    validateFFT2DInput(imageData, width, height);

    // Step 1: FFT
    const freqData = cpuFFT2D(imageData, width, height);

    // Step 2: Apply filter mask in-place using wrapped frequency distance
    this.applyFilterMask(freqData, width, height);

    // Step 3: IFFT
    return cpuIFFT2D(freqData, width, height);
  }

  private validateConfig(config: ImageFilterConfig): void {
    if (
      !Number.isFinite(config.cutoffFrequency) ||
      config.cutoffFrequency < 0 ||
      config.cutoffFrequency > 1
    ) {
      throw new FFTError(
        `cutoffFrequency must be a finite number in [0, 1], got ${config.cutoffFrequency}`,
        FFTErrorCode.INVALID_PARAMETER
      );
    }

    if (config.bandwidth !== undefined) {
      if (!Number.isFinite(config.bandwidth) || config.bandwidth <= 0 || config.bandwidth > 1) {
        throw new FFTError(
          `bandwidth must be a finite number in (0, 1], got ${config.bandwidth}`,
          FFTErrorCode.INVALID_PARAMETER
        );
      }
    }
  }

  private applyFilterMask(freqData: Float32Array, width: number, height: number): void {
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 2;
        const dist = this.getWrappedFrequencyDistance(x, y, width, height, maxDist);

        let mask: number;
        if (this.config.shape === 'ideal') {
          mask = this.idealFilter(dist);
        } else {
          mask = this.gaussianFilter(dist);
        }

        freqData[idx] *= mask;
        freqData[idx + 1] *= mask;
      }
    }
  }

  private getWrappedFrequencyDistance(
    x: number,
    y: number,
    width: number,
    height: number,
    maxDist: number
  ): number {
    const dx = x < width / 2 ? x : x - width;
    const dy = y < height / 2 ? y : y - height;
    return Math.sqrt(dx * dx + dy * dy) / maxDist;
  }

  private idealFilter(dist: number): number {
    const cutoff = this.config.cutoffFrequency;
    if (this.config.type === 'lowpass') {
      return dist <= cutoff ? 1 : 0;
    }
    if (this.config.type === 'highpass') {
      return dist <= cutoff ? 0 : 1;
    }

    const bw = this.config.bandwidth!;
    const low = Math.max(0, cutoff - bw / 2);
    const high = Math.min(1, cutoff + bw / 2);
    return dist >= low && dist <= high ? 1 : 0;
  }

  private gaussianFilter(dist: number): number {
    const cutoff = this.config.cutoffFrequency;
    const sigma = Math.max(cutoff / 2, MIN_GAUSSIAN_SIGMA);

    if (this.config.type === 'lowpass') {
      return Math.exp(-(dist * dist) / (2 * sigma * sigma));
    }
    if (this.config.type === 'highpass') {
      return 1 - Math.exp(-(dist * dist) / (2 * sigma * sigma));
    }

    const bw = this.config.bandwidth!;
    const low = Math.max(0, cutoff - bw / 2);
    const high = Math.min(1, cutoff + bw / 2);
    const sigmaLow = Math.max(low / 2, MIN_GAUSSIAN_SIGMA);
    const sigmaHigh = Math.max(high / 2, MIN_GAUSSIAN_SIGMA);
    const hp = 1 - Math.exp(-(dist * dist) / (2 * sigmaLow * sigmaLow));
    const lp = Math.exp(-(dist * dist) / (2 * sigmaHigh * sigmaHigh));
    return hp * lp;
  }

  dispose(): void {
    // No resources to clean up in CPU version
  }
}

export async function createImageFilter(config: ImageFilterConfig): Promise<ImageFilter> {
  return new ImageFilter(config);
}
