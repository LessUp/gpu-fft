// Feature: webgpu-fft-library, Property 1: FFT/IFFT Round-Trip
// Validates: Requirements 3.1, 4.1, 4.4
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { cpuFFT, cpuIFFT, cpuFFT2D, cpuIFFT2D } from '../src/utils/cpu-fft';

describe('FFT/IFFT Round-Trip', () => {
  // Property 1: FFT/IFFT Round-Trip
  // For any complex array x of size N (where N is a power of 2),
  // applying FFT followed by IFFT should return the original array within floating-point tolerance
  describe('Property 1: 1D FFT/IFFT Round-Trip', () => {
    const sizeArb = fc.integer({ min: 1, max: 10 }).map(n => Math.pow(2, n)); // 2 to 1024
    
    it('IFFT(FFT(x)) ≈ x for any input', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          // Generate random complex input
          const input = new Float32Array(size * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random() * 100 - 50; // Random values in [-50, 50]
          }
          
          // FFT then IFFT
          const fftResult = cpuFFT(input);
          const ifftResult = cpuIFFT(fftResult);
          
          // Compare with original
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifftResult[i] - input[i]) > 1e-4) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('IFFT(FFT(x)) = x for specific test cases', () => {
      const testCases = [
        { size: 4, values: [1, 0, 2, 0, 3, 0, 4, 0] },
        { size: 8, values: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8] },
        { size: 16, values: Array.from({ length: 32 }, (_, i) => i % 2 === 0 ? i / 2 : 0) }
      ];
      
      for (const { size, values } of testCases) {
        const input = new Float32Array(values);
        const fftResult = cpuFFT(input);
        const ifftResult = cpuIFFT(fftResult);
        
        for (let i = 0; i < input.length; i++) {
          expect(Math.abs(ifftResult[i] - input[i])).toBeLessThan(1e-5);
        }
      }
    });

    it('round-trip preserves zero array', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          const input = new Float32Array(size * 2); // All zeros
          const fftResult = cpuFFT(input);
          const ifftResult = cpuIFFT(fftResult);
          
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifftResult[i]) > 1e-10) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('round-trip preserves pure real signals', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          const input = new Float32Array(size * 2);
          for (let i = 0; i < size; i++) {
            input[i * 2] = Math.random() * 10; // Real part
            input[i * 2 + 1] = 0; // Imaginary part = 0
          }
          
          const fftResult = cpuFFT(input);
          const ifftResult = cpuIFFT(fftResult);
          
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifftResult[i] - input[i]) > 1e-4) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('round-trip preserves pure imaginary signals', () => {
      fc.assert(
        fc.property(sizeArb, (size: number) => {
          const input = new Float32Array(size * 2);
          for (let i = 0; i < size; i++) {
            input[i * 2] = 0; // Real part = 0
            input[i * 2 + 1] = Math.random() * 10; // Imaginary part
          }
          
          const fftResult = cpuFFT(input);
          const ifftResult = cpuIFFT(fftResult);
          
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifftResult[i] - input[i]) > 1e-4) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('multiple round-trips preserve signal', () => {
      const size = 16;
      const input = new Float32Array(size * 2);
      for (let i = 0; i < input.length; i++) {
        input[i] = Math.random() * 10;
      }
      
      let current = new Float32Array(input);
      
      // Perform 5 round-trips
      for (let trip = 0; trip < 5; trip++) {
        current = cpuFFT(current);
        current = cpuIFFT(current);
      }
      
      // Should still match original
      for (let i = 0; i < input.length; i++) {
        expect(Math.abs(current[i] - input[i])).toBeLessThan(1e-3);
      }
    });
  });

  // Property 9: 2D FFT/IFFT Round-Trip
  // For any 2D complex array of size M×N (where M and N are powers of 2),
  // applying FFT2D followed by IFFT2D should return the original array
  describe('Property 9: 2D FFT/IFFT Round-Trip', () => {
    // Generate (width, height) pairs where both are powers of 2
    const size2DArb = fc.record({
      width: fc.integer({ min: 1, max: 6 }).map(n => Math.pow(2, n)),
      height: fc.integer({ min: 1, max: 6 }).map(n => Math.pow(2, n))
    });
    
    it('IFFT2D(FFT2D(x)) ≈ x for any 2D input', () => {
      fc.assert(
        fc.property(size2DArb, ({ width, height }) => {
          // Generate random 2D complex input
          const input = new Float32Array(width * height * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random() * 100 - 50;
          }
          
          // FFT2D then IFFT2D
          const fft2dResult = cpuFFT2D(input, width, height);
          const ifft2dResult = cpuIFFT2D(fft2dResult, width, height);
          
          // Compare with original
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifft2dResult[i] - input[i]) > 1e-3) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 50 } // Fewer runs for 2D (more expensive)
      );
    });

    it('2D round-trip for square images', () => {
      const sizes = [2, 4, 8, 16];
      
      for (const size of sizes) {
        const input = new Float32Array(size * size * 2);
        for (let i = 0; i < input.length; i++) {
          input[i] = Math.random() * 10;
        }
        
        const fft2dResult = cpuFFT2D(input, size, size);
        const ifft2dResult = cpuIFFT2D(fft2dResult, size, size);
        
        for (let i = 0; i < input.length; i++) {
          expect(Math.abs(ifft2dResult[i] - input[i])).toBeLessThan(1e-3);
        }
      }
    });

    it('2D round-trip for rectangular images', () => {
      const testCases = [
        { width: 4, height: 8 },
        { width: 8, height: 4 },
        { width: 16, height: 8 },
        { width: 8, height: 16 }
      ];
      
      for (const { width, height } of testCases) {
        const input = new Float32Array(width * height * 2);
        for (let i = 0; i < input.length; i++) {
          input[i] = Math.random() * 10;
        }
        
        const fft2dResult = cpuFFT2D(input, width, height);
        const ifft2dResult = cpuIFFT2D(fft2dResult, width, height);
        
        for (let i = 0; i < input.length; i++) {
          expect(Math.abs(ifft2dResult[i] - input[i])).toBeLessThan(1e-3);
        }
      }
    });

    it('2D round-trip preserves zero image', () => {
      fc.assert(
        fc.property(size2DArb, ({ width, height }) => {
          const input = new Float32Array(width * height * 2); // All zeros
          const fft2dResult = cpuFFT2D(input, width, height);
          const ifft2dResult = cpuIFFT2D(fft2dResult, width, height);
          
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(ifft2dResult[i]) > 1e-8) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });

  // Additional IFFT correctness tests
  describe('IFFT Correctness', () => {
    it('IFFT uses conjugate twiddle factors', () => {
      // This is implicitly tested by round-trip, but we can verify
      // that IFFT(FFT(x)) works correctly
      const size = 8;
      const input = new Float32Array(size * 2);
      for (let i = 0; i < size; i++) {
        input[i * 2] = i;
        input[i * 2 + 1] = i + 0.5;
      }
      
      const fftResult = cpuFFT(input);
      const ifftResult = cpuIFFT(fftResult);
      
      for (let i = 0; i < input.length; i++) {
        expect(Math.abs(ifftResult[i] - input[i])).toBeLessThan(1e-5);
      }
    });

    it('IFFT normalizes by 1/N', () => {
      // FFT of [1, 0, 0, 0, ...] should give [1, 1, 1, 1, ...]
      // IFFT of [1, 1, 1, 1, ...] should give [1, 0, 0, 0, ...] (normalized)
      const size = 8;
      const input = new Float32Array(size * 2);
      input[0] = 1; // Impulse
      
      const fftResult = cpuFFT(input);
      
      // All frequency bins should be 1
      for (let i = 0; i < size; i++) {
        expect(Math.abs(fftResult[i * 2] - 1)).toBeLessThan(1e-5);
        expect(Math.abs(fftResult[i * 2 + 1])).toBeLessThan(1e-5);
      }
      
      // IFFT should recover the impulse
      const ifftResult = cpuIFFT(fftResult);
      expect(Math.abs(ifftResult[0] - 1)).toBeLessThan(1e-5);
      for (let i = 1; i < size; i++) {
        expect(Math.abs(ifftResult[i * 2])).toBeLessThan(1e-5);
        expect(Math.abs(ifftResult[i * 2 + 1])).toBeLessThan(1e-5);
      }
    });
  });
});
