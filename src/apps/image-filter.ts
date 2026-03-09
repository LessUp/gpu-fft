// Image Filter - Apply frequency-domain filters to images
import type { ImageFilterConfig } from '../types';
import { cpuFFT2D, cpuIFFT2D } from '../utils/cpu-fft';

export class ImageFilter {
  private config: ImageFilterConfig;

  constructor(config: ImageFilterConfig) {
    this.config = config;
  }

  async apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array> {
    // Step 1: FFT
    const freqData = cpuFFT2D(imageData, width, height);
    
    // Step 2: Apply filter mask
    const filtered = this.applyFilterMask(freqData, width, height);
    
    // Step 3: IFFT
    const result = cpuIFFT2D(filtered, width, height);
    
    return result;
  }

  private applyFilterMask(freqData: Float32Array, width: number, height: number): Float32Array {
    const result = new Float32Array(freqData.length);
    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 2;
        
        // Compute distance from center (normalized)
        const dx = x < cx ? x : x - width;
        const dy = y < cy ? y : y - height;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
        
        // Compute filter mask
        let mask: number;
        if (this.config.shape === 'ideal') {
          mask = this.idealFilter(dist);
        } else {
          mask = this.gaussianFilter(dist);
        }
        
        // Apply mask
        result[idx] = freqData[idx] * mask;
        result[idx + 1] = freqData[idx + 1] * mask;
      }
    }
    
    return result;
  }

  private idealFilter(dist: number): number {
    const cutoff = this.config.cutoffFrequency;
    if (this.config.type === 'lowpass') {
      return dist <= cutoff ? 1 : 0;
    } else if (this.config.type === 'highpass') {
      return dist <= cutoff ? 0 : 1;
    } else {
      // bandpass
      const bw = this.config.bandwidth ?? 0.1;
      const low = cutoff - bw / 2;
      const high = cutoff + bw / 2;
      return dist >= low && dist <= high ? 1 : 0;
    }
  }

  private gaussianFilter(dist: number): number {
    const cutoff = this.config.cutoffFrequency;
    const sigma = cutoff / 2;

    if (this.config.type === 'lowpass') {
      return Math.exp(-(dist * dist) / (2 * sigma * sigma));
    } else if (this.config.type === 'highpass') {
      return 1 - Math.exp(-(dist * dist) / (2 * sigma * sigma));
    } else {
      // bandpass: product of lowpass at upper edge and highpass at lower edge
      const bw = this.config.bandwidth ?? 0.1;
      const low = cutoff - bw / 2;
      const high = cutoff + bw / 2;
      const sigmaLow = low / 2 || 0.01;
      const sigmaHigh = high / 2 || 0.01;
      const hp = 1 - Math.exp(-(dist * dist) / (2 * sigmaLow * sigmaLow));
      const lp = Math.exp(-(dist * dist) / (2 * sigmaHigh * sigmaHigh));
      return hp * lp;
    }
  }

  dispose(): void {
    // No resources to clean up in CPU version
  }
}

export async function createImageFilter(config: ImageFilterConfig): Promise<ImageFilter> {
  return new ImageFilter(config);
}
