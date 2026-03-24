// Feature: webgpu-fft-library, Property 10-11: Filter Operations
// Validates: Requirements 7.1, 7.2
import { describe, it, expect } from 'vitest';
import { createImageFilter } from '../src/apps/image-filter';
import { cpuFFT2D } from '../src/utils/cpu-fft';

describe('Filter Operations', () => {
  // Property 10: Low-Pass Filter Attenuates High Frequencies
  // For any input signal and cutoff frequency c, after applying low-pass filter,
  // the magnitude of frequency components above c should be significantly attenuated
  describe('Property 10: Low-Pass Filter Attenuates High Frequencies', () => {
    it('ideal low-pass filter attenuates high frequencies by at least 90%', async () => {
      const width = 8;
      const height = 8;
      const cutoff = 0.3;

      // Create test image with high-frequency content
      const input = new Float32Array(width * height * 2);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 2;
          // Checkerboard pattern (high frequency)
          input[idx] = ((x + y) % 2) * 10;
          input[idx + 1] = 0;
        }
      }

      // Apply low-pass filter
      const filter = await createImageFilter({
        type: 'lowpass',
        shape: 'ideal',
        cutoffFrequency: cutoff,
      });

      const filtered = await filter.apply(input, width, height);

      // Compute FFT of filtered result
      const freqFiltered = cpuFFT2D(filtered, width, height);
      const freqOriginal = cpuFFT2D(input, width, height);

      // Check that high frequencies are attenuated
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      let highFreqAttenuated = 0;
      let highFreqTotal = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x < cx ? x : x - width;
          const dy = y < cy ? y : y - height;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

          if (dist > cutoff) {
            const idx = (y * width + x) * 2;
            const magOriginal = Math.sqrt(freqOriginal[idx] ** 2 + freqOriginal[idx + 1] ** 2);
            const magFiltered = Math.sqrt(freqFiltered[idx] ** 2 + freqFiltered[idx + 1] ** 2);

            if (magOriginal > 1e-6) {
              const attenuation = 1 - magFiltered / magOriginal;
              if (attenuation >= 0.9) {
                highFreqAttenuated++;
              }
              highFreqTotal++;
            }
          }
        }
      }

      // Most high frequencies should be attenuated
      const attenuationRatio = highFreqTotal > 0 ? highFreqAttenuated / highFreqTotal : 1;
      expect(attenuationRatio).toBeGreaterThan(0.8);

      filter.dispose();
    });

    it('gaussian low-pass filter smoothly attenuates high frequencies', async () => {
      const width = 8;
      const height = 8;
      const cutoff = 0.4;

      const input = new Float32Array(width * height * 2);
      for (let i = 0; i < input.length; i += 2) {
        input[i] = Math.random() * 10;
        input[i + 1] = 0;
      }

      const filter = await createImageFilter({
        type: 'lowpass',
        shape: 'gaussian',
        cutoffFrequency: cutoff,
      });

      const filtered = await filter.apply(input, width, height);

      // Filtered result should have lower high-frequency content
      const freqFiltered = cpuFFT2D(filtered, width, height);
      const freqOriginal = cpuFFT2D(input, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x < cx ? x : x - width;
          const dy = y < cy ? y : y - height;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

          if (dist > cutoff * 1.5) {
            const idx = (y * width + x) * 2;
            const magOriginal = Math.sqrt(freqOriginal[idx] ** 2 + freqOriginal[idx + 1] ** 2);
            const magFiltered = Math.sqrt(freqFiltered[idx] ** 2 + freqFiltered[idx + 1] ** 2);

            // High frequencies should be attenuated
            expect(magFiltered).toBeLessThanOrEqual(magOriginal + 1e-5);
          }
        }
      }

      filter.dispose();
    });
  });

  // Property 11: High-Pass Filter Attenuates Low Frequencies
  // For any input signal and cutoff frequency c, after applying high-pass filter,
  // the magnitude of frequency components below c should be significantly attenuated
  describe('Property 11: High-Pass Filter Attenuates Low Frequencies', () => {
    it('ideal high-pass filter attenuates low frequencies', async () => {
      const width = 8;
      const height = 8;
      const cutoff = 0.3;

      // Create test image with low-frequency content
      const input = new Float32Array(width * height * 2);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 2;
          // Smooth gradient (low frequency)
          input[idx] = x + y;
          input[idx + 1] = 0;
        }
      }

      // Apply high-pass filter
      const filter = await createImageFilter({
        type: 'highpass',
        shape: 'ideal',
        cutoffFrequency: cutoff,
      });

      const filtered = await filter.apply(input, width, height);

      // Compute FFT of filtered result
      const freqFiltered = cpuFFT2D(filtered, width, height);
      const freqOriginal = cpuFFT2D(input, width, height);

      // Check that low frequencies are attenuated
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      let lowFreqAttenuated = 0;
      let lowFreqTotal = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x < cx ? x : x - width;
          const dy = y < cy ? y : y - height;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

          if (dist < cutoff) {
            const idx = (y * width + x) * 2;
            const magOriginal = Math.sqrt(freqOriginal[idx] ** 2 + freqOriginal[idx + 1] ** 2);
            const magFiltered = Math.sqrt(freqFiltered[idx] ** 2 + freqFiltered[idx + 1] ** 2);

            if (magOriginal > 1e-6) {
              const attenuation = 1 - magFiltered / magOriginal;
              if (attenuation >= 0.9) {
                lowFreqAttenuated++;
              }
              lowFreqTotal++;
            }
          }
        }
      }

      // Most low frequencies should be attenuated
      const attenuationRatio = lowFreqTotal > 0 ? lowFreqAttenuated / lowFreqTotal : 1;
      expect(attenuationRatio).toBeGreaterThan(0.8);

      filter.dispose();
    });

    it('gaussian high-pass filter smoothly attenuates low frequencies', async () => {
      const width = 8;
      const height = 8;
      const cutoff = 0.4;

      const input = new Float32Array(width * height * 2);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 2;
          input[idx] = Math.sin(x * 0.5) + Math.cos(y * 0.5);
          input[idx + 1] = 0;
        }
      }

      const filter = await createImageFilter({
        type: 'highpass',
        shape: 'gaussian',
        cutoffFrequency: cutoff,
      });

      const filtered = await filter.apply(input, width, height);

      // DC component should be significantly reduced
      const freqFiltered = cpuFFT2D(filtered, width, height);
      const dcMag = Math.sqrt(freqFiltered[0] ** 2 + freqFiltered[1] ** 2);

      const freqOriginal = cpuFFT2D(input, width, height);
      const dcMagOriginal = Math.sqrt(freqOriginal[0] ** 2 + freqOriginal[1] ** 2);

      // DC should be attenuated
      expect(dcMag).toBeLessThan(dcMagOriginal * 0.5);

      filter.dispose();
    });
  });

  // Additional filter tests
  describe('Filter Correctness', () => {
    it('filter preserves image dimensions', async () => {
      const width = 8;
      const height = 8;
      const input = new Float32Array(width * height * 2);

      const filter = await createImageFilter({
        type: 'lowpass',
        shape: 'ideal',
        cutoffFrequency: 0.5,
      });

      const result = await filter.apply(input, width, height);
      expect(result.length).toBe(input.length);

      filter.dispose();
    });

    it('cutoff frequency of 1.0 passes all frequencies (lowpass)', async () => {
      const width = 4;
      const height = 4;
      const input = new Float32Array(width * height * 2);
      for (let i = 0; i < input.length; i++) {
        input[i] = Math.random() * 10;
      }

      const filter = await createImageFilter({
        type: 'lowpass',
        shape: 'ideal',
        cutoffFrequency: 1.0,
      });

      const result = await filter.apply(input, width, height);

      // Result should be very close to input (all frequencies passed)
      for (let i = 0; i < input.length; i++) {
        expect(Math.abs(result[i] - input[i])).toBeLessThan(1e-3);
      }

      filter.dispose();
    });

    it('very small cutoff reduces high frequency content', async () => {
      const width = 4;
      const height = 4;

      // Create high-frequency checkerboard pattern
      const input = new Float32Array(width * height * 2);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 2;
          input[idx] = ((x + y) % 2) * 10; // Checkerboard
          input[idx + 1] = 0;
        }
      }

      const filter = await createImageFilter({
        type: 'lowpass',
        shape: 'ideal',
        cutoffFrequency: 0.1, // Very small cutoff
      });

      const result = await filter.apply(input, width, height);

      // Result should be smoother (less variation)
      let inputVariation = 0;
      let outputVariation = 0;
      const inputMean = input.reduce((a, b) => a + b, 0) / input.length;
      const outputMean = result.reduce((a, b) => a + b, 0) / result.length;

      for (let i = 0; i < input.length; i += 2) {
        inputVariation += Math.abs(input[i] - inputMean);
        outputVariation += Math.abs(result[i] - outputMean);
      }

      // Output should have less variation (smoother)
      expect(outputVariation).toBeLessThan(inputVariation);

      filter.dispose();
    });
  });
});
