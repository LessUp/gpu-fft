// Feature: webgpu-fft-library, Property 2, 16, 17: FFT Correctness
// Validates: Requirements 3.5, 10.3, 10.6
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { cpuFFT } from '../src/utils/cpu-fft';
import { naiveDFT, interleavedToComplex, complexToInterleaved } from '../src/utils/complex';
import { FFTError, FFTErrorCode } from '../src/core/errors';

describe('FFT Correctness', () => {
  // Property 2: FFT Matches DFT Definition
  // For any complex array x of size N (where N ≤ 64 for practical testing),
  // the FFT output X[k] should equal the naive DFT computation
  describe('Property 2: FFT Matches DFT Definition', () => {
    // Generate power of 2 sizes (small for DFT comparison)
    const smallSizeArb = fc.integer({ min: 1, max: 6 }).map((n) => Math.pow(2, n)); // 2 to 64

    it('FFT output matches naive DFT', () => {
      fc.assert(
        fc.property(smallSizeArb, (size: number) => {
          // Generate random complex input
          const input = new Float32Array(size * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random() * 10 - 5; // Random values in [-5, 5]
          }

          // Compute FFT
          const fftResult = cpuFFT(input);

          // Compute naive DFT
          const complexInput = interleavedToComplex(input);
          const dftResult = naiveDFT(complexInput);
          const dftInterleaved = complexToInterleaved(dftResult);

          // Compare results
          for (let i = 0; i < fftResult.length; i++) {
            if (Math.abs(fftResult[i] - dftInterleaved[i]) > 1e-4) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('FFT of constant signal has only DC component', () => {
      const sizes = [2, 4, 8, 16, 32];
      for (const size of sizes) {
        const input = new Float32Array(size * 2);
        const constant = 5.0;
        for (let i = 0; i < size; i++) {
          input[i * 2] = constant;
          input[i * 2 + 1] = 0;
        }

        const result = cpuFFT(input);

        // DC component should be N * constant
        expect(Math.abs(result[0] - size * constant)).toBeLessThan(1e-5);
        expect(Math.abs(result[1])).toBeLessThan(1e-5);

        // All other components should be near zero
        for (let i = 1; i < size; i++) {
          expect(Math.abs(result[i * 2])).toBeLessThan(1e-5);
          expect(Math.abs(result[i * 2 + 1])).toBeLessThan(1e-5);
        }
      }
    });

    it('FFT of impulse has flat spectrum', () => {
      const size = 16;
      const input = new Float32Array(size * 2);
      input[0] = 1; // Impulse at position 0

      const result = cpuFFT(input);

      // All frequency bins should have magnitude 1
      for (let i = 0; i < size; i++) {
        const mag = Math.sqrt(result[i * 2] ** 2 + result[i * 2 + 1] ** 2);
        expect(Math.abs(mag - 1)).toBeLessThan(1e-5);
      }
    });
  });

  // Property 16: Output Format Interleaved
  // For any FFT computation on input of size N, the output should be a Float32Array
  // of size 2N with interleaved [real, imag, real, imag, ...] format
  describe('Property 16: Output Format Interleaved', () => {
    const sizeArb = fc.integer({ min: 1, max: 10 }).map((n) => Math.pow(2, n));

    it('output length is 2N for input of N complex numbers', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          const input = new Float32Array(size * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random();
          }

          const result = cpuFFT(input);
          return result.length === size * 2;
        }),
        { numRuns: 100 }
      );
    });

    it('output is Float32Array', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          const input = new Float32Array(size * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random();
          }

          const result = cpuFFT(input);
          return result instanceof Float32Array;
        }),
        { numRuns: 100 }
      );
    });

    it('output has interleaved format (even indices are real, odd are imaginary)', () => {
      const size = 8;
      const input = new Float32Array(size * 2);
      for (let i = 0; i < size; i++) {
        input[i * 2] = i; // Real part
        input[i * 2 + 1] = i + 0.5; // Imaginary part
      }

      const result = cpuFFT(input);

      // Verify structure (all values should be finite numbers)
      for (let i = 0; i < size; i++) {
        expect(isFinite(result[i * 2])).toBe(true); // Real part
        expect(isFinite(result[i * 2 + 1])).toBe(true); // Imaginary part
      }
    });
  });

  // Property 17: Invalid Size Rejection
  // For any input size that is not a power of 2, the FFT function should throw an error
  describe('Property 17: Invalid Size Rejection', () => {
    it('rejects non-power-of-2 sizes', () => {
      const nonPowerOf2 = [3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 100];

      for (const size of nonPowerOf2) {
        const input = new Float32Array(size * 2);
        expect(() => cpuFFT(input)).toThrow(FFTError);
        expect(() => cpuFFT(input)).toThrow(/power of 2/);
      }
    });

    it('accepts power-of-2 sizes', () => {
      const powerOf2 = [2, 4, 8, 16, 32, 64, 128, 256];

      for (const size of powerOf2) {
        const input = new Float32Array(size * 2);
        expect(() => cpuFFT(input)).not.toThrow();
      }
    });

    it('rejects size less than 2', () => {
      const input = new Float32Array(2); // Size 1
      expect(() => cpuFFT(input)).toThrow(FFTError);
      expect(() => cpuFFT(input)).toThrow(/at least 2/);
    });

    it('throws FFTError with INVALID_INPUT_SIZE code', () => {
      const input = new Float32Array(6); // Size 3 (not power of 2)
      try {
        cpuFFT(input);
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(FFTError);
        expect((e as FFTError).code).toBe(FFTErrorCode.INVALID_INPUT_SIZE);
      }
    });

    it('property: any non-power-of-2 size throws error', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 1000 }), (n: number) => {
          // Check if n is NOT a power of 2
          const isPowerOf2 = n > 0 && (n & (n - 1)) === 0;
          if (isPowerOf2) {
            return true;
          } // Skip powers of 2

          const input = new Float32Array(n * 2);
          try {
            cpuFFT(input);
            return false; // Should have thrown
          } catch (e) {
            return e instanceof FFTError;
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // Additional correctness tests
  describe('FFT Correctness - Additional Tests', () => {
    it("FFT preserves Parseval's theorem (energy conservation)", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }).map((n) => Math.pow(2, n)),
          (size: number) => {
            const input = new Float32Array(size * 2);
            for (let i = 0; i < input.length; i++) {
              input[i] = Math.random() * 10 - 5;
            }

            // Compute energy in time domain
            let timeEnergy = 0;
            for (let i = 0; i < size; i++) {
              timeEnergy += input[i * 2] ** 2 + input[i * 2 + 1] ** 2;
            }

            // Compute FFT
            const result = cpuFFT(input);

            // Compute energy in frequency domain
            let freqEnergy = 0;
            for (let i = 0; i < size; i++) {
              freqEnergy += result[i * 2] ** 2 + result[i * 2 + 1] ** 2;
            }
            freqEnergy /= size; // Normalize

            // Energies should be approximately equal
            return Math.abs(timeEnergy - freqEnergy) < 1e-3;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('FFT is linear: FFT(a*x + b*y) = a*FFT(x) + b*FFT(y)', () => {
      const size = 8;
      const x = new Float32Array(size * 2);
      const y = new Float32Array(size * 2);
      const a = 2.5;
      const b = 3.7;

      for (let i = 0; i < x.length; i++) {
        x[i] = Math.random();
        y[i] = Math.random();
      }

      // Compute a*x + b*y
      const combined = new Float32Array(size * 2);
      for (let i = 0; i < combined.length; i++) {
        combined[i] = a * x[i] + b * y[i];
      }

      // FFT(a*x + b*y)
      const fftCombined = cpuFFT(combined);

      // a*FFT(x) + b*FFT(y)
      const fftX = cpuFFT(x);
      const fftY = cpuFFT(y);
      const expected = new Float32Array(size * 2);
      for (let i = 0; i < expected.length; i++) {
        expected[i] = a * fftX[i] + b * fftY[i];
      }

      // Compare
      for (let i = 0; i < fftCombined.length; i++) {
        expect(Math.abs(fftCombined[i] - expected[i])).toBeLessThan(1e-4);
      }
    });
  });
});
