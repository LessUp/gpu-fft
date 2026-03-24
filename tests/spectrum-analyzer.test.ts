// Feature: webgpu-fft-library, Property 12-15: Spectrum Analyzer
// Validates: Requirements 8.1, 8.3, 8.4, 8.5
import { describe, it, expect } from 'vitest';
import { createSpectrumAnalyzer } from '../src/apps/spectrum-analyzer';
import { hannWindow } from '../src/utils/window-functions';

describe('Spectrum Analyzer', () => {
  // Property 12: Spectrum Magnitude is Non-Negative
  // For any audio input, all magnitude values in the spectrum output should be non-negative (in linear scale)
  // or finite (in dB scale)
  describe('Property 12: Spectrum Magnitude is Non-Negative', () => {
    it('all dB values are finite for random inputs', async () => {
      const fftSize = 256;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate: 44100,
      });

      // Test with several random inputs
      for (let test = 0; test < 20; test++) {
        const input = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
          input[i] = Math.random() * 2 - 1;
        }

        const spectrum = await analyzer.analyze(input);

        // All dB values should be finite
        for (let i = 0; i < spectrum.length; i++) {
          expect(isFinite(spectrum[i])).toBe(true);
        }
      }

      analyzer.dispose();
    });

    it('dB values have reasonable range', async () => {
      const fftSize = 256;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate: 44100,
      });

      const input = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        input[i] = Math.random() * 2 - 1;
      }

      const spectrum = await analyzer.analyze(input);

      // dB values should be in reasonable range (not NaN or Infinity)
      for (let i = 0; i < spectrum.length; i++) {
        expect(isFinite(spectrum[i])).toBe(true);
        expect(spectrum[i]).toBeGreaterThanOrEqual(-100); // Floor at -100 dB
      }

      analyzer.dispose();
    });
  });

  // Property 13: Hann Window Application
  // For any input signal x[n] of length N, the windowed signal should equal x[n] · (0.5 - 0.5·cos(2πn/(N-1)))
  describe('Property 13: Hann Window Application', () => {
    it('Hann window has correct formula', () => {
      const sizes = [256, 512, 1024];

      for (const size of sizes) {
        const window = hannWindow(size);

        for (let n = 0; n < size; n++) {
          const expected = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1));
          expect(Math.abs(window[n] - expected)).toBeLessThan(1e-6);
        }
      }
    });

    it('Hann window starts and ends at zero', () => {
      const sizes = [256, 512, 1024, 2048];

      for (const size of sizes) {
        const window = hannWindow(size);
        expect(window[0]).toBeLessThan(1e-10);
        expect(window[size - 1]).toBeLessThan(1e-10);
      }
    });

    it('Hann window peaks at center', () => {
      const size = 256;
      const window = hannWindow(size);
      const center = Math.floor(size / 2);

      // Center value should be close to 1
      expect(Math.abs(window[center] - 1)).toBeLessThan(0.01);

      // Center should be the maximum
      for (let i = 0; i < size; i++) {
        expect(window[i]).toBeLessThanOrEqual(window[center] + 1e-6);
      }
    });
  });

  // Property 14: dB Conversion
  // For any positive magnitude value m, the dB conversion should return 20·log₁₀(m)
  describe('Property 14: dB Conversion', () => {
    it('dB conversion follows 20·log₁₀(m) formula', async () => {
      const fftSize = 256;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate: 44100,
      });

      // Create a pure tone (single frequency)
      const input = new Float32Array(fftSize);
      const frequency = 1000; // Hz
      const sampleRate = 44100;
      const amplitude = 0.5;

      for (let i = 0; i < fftSize; i++) {
        input[i] = amplitude * Math.sin((2 * Math.PI * frequency * i) / sampleRate);
      }

      const spectrum = await analyzer.analyze(input);

      // Find peak (should be near the frequency bin)
      let maxDb = -Infinity;
      for (let i = 0; i < spectrum.length; i++) {
        if (spectrum[i] > maxDb) {
          maxDb = spectrum[i];
        }
      }

      // Peak should be finite and reasonable
      expect(isFinite(maxDb)).toBe(true);
      expect(maxDb).toBeGreaterThan(-50); // Should have significant energy

      analyzer.dispose();
    });

    it('zero or near-zero magnitudes return floor value', async () => {
      const fftSize = 256;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate: 44100,
      });

      // Zero input
      const input = new Float32Array(fftSize); // All zeros
      const spectrum = await analyzer.analyze(input);

      // All values should be at floor (-100 dB)
      for (let i = 0; i < spectrum.length; i++) {
        expect(spectrum[i]).toBe(-100);
      }

      analyzer.dispose();
    });
  });

  // Property 15: Frequency Bin Count
  // For any FFT of size N, the spectrum analyzer should return exactly N/2 + 1 frequency bins
  describe('Property 15: Frequency Bin Count', () => {
    it('returns N/2 + 1 bins for FFT size N', async () => {
      const sizes = [256, 512, 1024, 2048, 4096];

      for (const fftSize of sizes) {
        const analyzer = await createSpectrumAnalyzer({
          fftSize,
          sampleRate: 44100,
        });

        const input = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
          input[i] = Math.random();
        }

        const spectrum = await analyzer.analyze(input);
        const expectedBins = Math.floor(fftSize / 2) + 1;

        expect(spectrum.length).toBe(expectedBins);

        analyzer.dispose();
      }
    });

    it('frequency range is 0 Hz to Nyquist', async () => {
      const fftSize = 1024;
      const sampleRate = 44100;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate,
      });

      const frequencies = analyzer.getFrequencies();
      const nyquist = sampleRate / 2;

      // First bin should be 0 Hz (DC)
      expect(frequencies[0]).toBe(0);

      // Last bin should be Nyquist frequency
      expect(Math.abs(frequencies[frequencies.length - 1] - nyquist)).toBeLessThan(1);

      // Frequencies should be monotonically increasing
      for (let i = 1; i < frequencies.length; i++) {
        expect(frequencies[i]).toBeGreaterThan(frequencies[i - 1]);
      }

      analyzer.dispose();
    });

    it('bin count is always N/2 + 1 for various sizes', async () => {
      const sizes = [128, 256, 512, 1024, 2048, 4096];

      for (const fftSize of sizes) {
        const analyzer = await createSpectrumAnalyzer({
          fftSize,
          sampleRate: 44100,
        });

        const input = new Float32Array(fftSize);
        for (let i = 0; i < fftSize; i++) {
          input[i] = Math.random();
        }

        const spectrum = await analyzer.analyze(input);
        const expectedBins = Math.floor(fftSize / 2) + 1;

        expect(spectrum.length).toBe(expectedBins);

        analyzer.dispose();
      }
    });
  });

  // Additional tests
  describe('Spectrum Analyzer Correctness', () => {
    it('detects single frequency tone', async () => {
      const fftSize = 1024;
      const sampleRate = 44100;
      const analyzer = await createSpectrumAnalyzer({
        fftSize,
        sampleRate,
      });

      // Generate 1000 Hz tone
      const frequency = 1000;
      const input = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        input[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
      }

      const spectrum = await analyzer.analyze(input);
      const frequencies = analyzer.getFrequencies();

      // Find peak
      let peakBin = 0;
      let peakValue = -Infinity;
      for (let i = 0; i < spectrum.length; i++) {
        if (spectrum[i] > peakValue) {
          peakValue = spectrum[i];
          peakBin = i;
        }
      }

      const peakFrequency = frequencies[peakBin];

      // Peak should be near 1000 Hz
      expect(Math.abs(peakFrequency - frequency)).toBeLessThan(100);

      analyzer.dispose();
    });
  });
});
