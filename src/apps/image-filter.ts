// Image Filter - Apply frequency-domain filters to images
import type { ImageFilterConfig } from '../types';
import type { FFTBackend } from '../core/backend';
import { CPUFFTBackend } from '../core/cpu-backend';
import { validateFFT2D } from '../core/validation';
import { validateImageFilterConfig } from '../core/validation';

const DEFAULT_BANDWIDTH = 0.1;
const MIN_GAUSSIAN_SIGMA = 0.01;

/**
 * Apply frequency-domain filters to images (lowpass, highpass, bandpass).
 *
 * @remarks
 * 默认使用 CPU 后端。可通过构造函数注入自定义 FFTBackend，
 * 例如 GPU 后端或测试用 mock。
 *
 * @example
 * ```typescript
 * // 使用默认 CPU 后端
 * const filter = await createImageFilter({
 *   type: 'lowpass',
 *   shape: 'gaussian',
 *   cutoffFrequency: 0.3
 * });
 *
 * // 注入自定义后端
 * const gpuBackend = await createGPUFFTBackend();
 * const filter = new ImageFilter(config, gpuBackend);
 * ```
 */
export class ImageFilter {
  private config: ImageFilterConfig;
  private backend: FFTBackend;

  constructor(config: ImageFilterConfig, backend?: FFTBackend) {
    validateImageFilterConfig(config);
    this.config = {
      ...config,
      bandwidth: config.bandwidth ?? DEFAULT_BANDWIDTH,
    };
    this.backend = backend ?? new CPUFFTBackend();
  }

  async apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array> {
    validateFFT2D(imageData, width, height);

    // Step 1: FFT
    const freqData = await this.backend.fft2d(imageData, width, height);

    // Step 2: Apply filter mask in-place using wrapped frequency distance
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

    // Step 3: IFFT
    return this.backend.ifft2d(freqData, width, height);
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
    this.backend.dispose?.();
  }
}

export async function createImageFilter(config: ImageFilterConfig): Promise<ImageFilter> {
  return new ImageFilter(config);
}
