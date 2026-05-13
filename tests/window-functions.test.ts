// Tests for window functions
import { describe, it, expect } from 'vitest';
import {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
  applyWindow,
  applyWindowComplex,
} from '../src/utils/window-functions';
import { FFTError } from '../src/core/errors';

describe('Window Functions', () => {
  describe('Hann Window', () => {
    it('returns a finite unity coefficient for size 1', () => {
      const w = hannWindow(1);
      expect(w).toEqual(new Float32Array([1]));
      expect(Number.isNaN(w[0])).toBe(false);
    });

    it('starts and ends near zero', () => {
      const w = hannWindow(256);
      expect(w[0]).toBeLessThan(1e-10);
      expect(w[255]).toBeLessThan(1e-10);
    });

    it('peaks near 1 at center', () => {
      const w = hannWindow(256);
      expect(Math.abs(w[128] - 1)).toBeLessThan(0.01);
    });

    it('values are in [0, 1]', () => {
      const w = hannWindow(512);
      for (let i = 0; i < w.length; i++) {
        expect(w[i]).toBeGreaterThanOrEqual(0);
        expect(w[i]).toBeLessThanOrEqual(1 + 1e-6);
      }
    });
  });

  describe('Hamming Window', () => {
    it('returns a finite unity coefficient for size 1', () => {
      const w = hammingWindow(1);
      expect(w).toEqual(new Float32Array([1]));
      expect(Number.isNaN(w[0])).toBe(false);
    });

    it('has non-zero endpoints (~0.08)', () => {
      const w = hammingWindow(256);
      expect(w[0]).toBeGreaterThan(0.07);
      expect(w[0]).toBeLessThan(0.09);
      expect(w[255]).toBeGreaterThan(0.07);
      expect(w[255]).toBeLessThan(0.09);
    });

    it('peaks near 1 at center', () => {
      const w = hammingWindow(256);
      expect(Math.abs(w[128] - 1)).toBeLessThan(0.01);
    });

    it('correct formula: 0.54 - 0.46*cos(2πn/(N-1))', () => {
      const size = 128;
      const w = hammingWindow(size);
      for (let n = 0; n < size; n++) {
        const expected = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (size - 1));
        expect(Math.abs(w[n] - expected)).toBeLessThan(1e-6);
      }
    });
  });

  describe('Blackman Window', () => {
    it('returns a finite unity coefficient for size 1', () => {
      const w = blackmanWindow(1);
      expect(w).toEqual(new Float32Array([1]));
      expect(Number.isNaN(w[0])).toBe(false);
    });

    it('starts and ends near zero', () => {
      const w = blackmanWindow(256);
      expect(Math.abs(w[0])).toBeLessThan(1e-4);
      expect(Math.abs(w[255])).toBeLessThan(1e-4);
    });

    it('peaks near 1 at center', () => {
      const w = blackmanWindow(256);
      expect(Math.abs(w[128] - 1)).toBeLessThan(0.01);
    });

    it('correct formula', () => {
      const size = 128;
      const w = blackmanWindow(size);
      for (let n = 0; n < size; n++) {
        const ratio = (2 * Math.PI * n) / (size - 1);
        const expected = 0.42 - 0.5 * Math.cos(ratio) + 0.08 * Math.cos(2 * ratio);
        expect(Math.abs(w[n] - expected)).toBeLessThan(1e-6);
      }
    });
  });

  describe('Flat-Top Window', () => {
    it('returns a finite unity coefficient for size 1', () => {
      const w = flatTopWindow(1);
      expect(w).toEqual(new Float32Array([1]));
      expect(Number.isNaN(w[0])).toBe(false);
    });

    it('values are symmetric', () => {
      const size = 256;
      const w = flatTopWindow(size);
      for (let i = 0; i < size / 2; i++) {
        expect(Math.abs(w[i] - w[size - 1 - i])).toBeLessThan(1e-5);
      }
    });

    it('has correct length', () => {
      expect(flatTopWindow(64).length).toBe(64);
      expect(flatTopWindow(512).length).toBe(512);
    });
  });

  describe('Rectangular Window', () => {
    it('rejects invalid window sizes', () => {
      expect(() => rectangularWindow(0)).toThrow(FFTError);
      expect(() => rectangularWindow(1.5)).toThrow(FFTError);
    });

    it('all values are 1', () => {
      const w = rectangularWindow(256);
      for (let i = 0; i < w.length; i++) {
        expect(w[i]).toBe(1);
      }
    });
  });

  describe('applyWindow', () => {
    it('rejects signal and window length mismatches', () => {
      expect(() => applyWindow(new Float32Array([1, 2]), new Float32Array([1]))).toThrow(FFTError);
    });

    it('multiplies signal by window element-wise', () => {
      const signal = new Float32Array([1, 2, 3, 4]);
      const window = new Float32Array([0.5, 1, 0.5, 0]);
      const result = applyWindow(signal, window);
      expect(result[0]).toBeCloseTo(0.5);
      expect(result[1]).toBeCloseTo(2);
      expect(result[2]).toBeCloseTo(1.5);
      expect(result[3]).toBeCloseTo(0);
    });
  });

  describe('applyWindowComplex', () => {
    it('rejects non-interleaved complex data', () => {
      expect(() => applyWindowComplex(new Float32Array([1, 2, 3]), new Float32Array([1]))).toThrow(
        FFTError
      );
    });

    it('rejects complex signal and window length mismatches', () => {
      expect(() =>
        applyWindowComplex(new Float32Array([1, 2, 3, 4]), new Float32Array([1]))
      ).toThrow(FFTError);
    });

    it('applies window to interleaved complex signal', () => {
      // 2 complex numbers: (1+2i), (3+4i)
      const signal = new Float32Array([1, 2, 3, 4]);
      const window = new Float32Array([0.5, 1.0]);
      const result = applyWindowComplex(signal, window);
      expect(result[0]).toBeCloseTo(0.5); // 1 * 0.5
      expect(result[1]).toBeCloseTo(1.0); // 2 * 0.5
      expect(result[2]).toBeCloseTo(3.0); // 3 * 1.0
      expect(result[3]).toBeCloseTo(4.0); // 4 * 1.0
    });
  });
});
