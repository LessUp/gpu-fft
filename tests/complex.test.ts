// Feature: webgpu-fft-library, Property 5-8: Complex Number Operations
// Validates: Requirements 1.2, 1.3, 1.4, 1.5
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  complexAdd,
  complexMul,
  complexMagnitude,
  twiddleFactor,
  complexApproxEqual,
} from '../src/utils/complex';
import type { Complex } from '../src/types';

// Arbitrary for complex numbers
const complexArb = fc.record({
  real: fc.float({ min: -1000, max: 1000, noNaN: true }),
  imag: fc.float({ min: -1000, max: 1000, noNaN: true }),
});

describe('Complex Number Operations', () => {
  // Property 5: Complex Addition
  // For any two complex numbers (a, b) and (c, d), complex_add should return (a+c, b+d)
  describe('Property 5: Complex Addition', () => {
    it('should correctly add two complex numbers', () => {
      fc.assert(
        fc.property(complexArb, complexArb, (a: Complex, b: Complex) => {
          const result = complexAdd(a, b);
          const expected: Complex = {
            real: a.real + b.real,
            imag: a.imag + b.imag,
          };
          return complexApproxEqual(result, expected, 1e-6);
        }),
        { numRuns: 100 }
      );
    });

    it('should be commutative: a + b = b + a', () => {
      fc.assert(
        fc.property(complexArb, complexArb, (a: Complex, b: Complex) => {
          const ab = complexAdd(a, b);
          const ba = complexAdd(b, a);
          return complexApproxEqual(ab, ba, 1e-6);
        }),
        { numRuns: 100 }
      );
    });

    it('should have identity element (0, 0)', () => {
      fc.assert(
        fc.property(complexArb, (a: Complex) => {
          const zero: Complex = { real: 0, imag: 0 };
          const result = complexAdd(a, zero);
          return complexApproxEqual(result, a, 1e-6);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Property 6: Complex Multiplication
  // For any two complex numbers (a, b) and (c, d), complex_mul should return (ac-bd, ad+bc)
  describe('Property 6: Complex Multiplication', () => {
    it('should correctly multiply two complex numbers', () => {
      fc.assert(
        fc.property(complexArb, complexArb, (a: Complex, b: Complex) => {
          const result = complexMul(a, b);
          const expected: Complex = {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real,
          };
          return complexApproxEqual(result, expected, 1e-4);
        }),
        { numRuns: 100 }
      );
    });

    it('should be commutative: a * b = b * a', () => {
      fc.assert(
        fc.property(complexArb, complexArb, (a: Complex, b: Complex) => {
          const ab = complexMul(a, b);
          const ba = complexMul(b, a);
          return complexApproxEqual(ab, ba, 1e-4);
        }),
        { numRuns: 100 }
      );
    });

    it('should have identity element (1, 0)', () => {
      fc.assert(
        fc.property(complexArb, (a: Complex) => {
          const one: Complex = { real: 1, imag: 0 };
          const result = complexMul(a, one);
          return complexApproxEqual(result, a, 1e-6);
        }),
        { numRuns: 100 }
      );
    });
  });

  // Property 7: Complex Magnitude
  // For any complex number (a, b), magnitude should return sqrt(a² + b²)
  describe('Property 7: Complex Magnitude', () => {
    it('should correctly compute magnitude', () => {
      fc.assert(
        fc.property(complexArb, (c: Complex) => {
          const result = complexMagnitude(c);
          const expected = Math.sqrt(c.real * c.real + c.imag * c.imag);
          return Math.abs(result - expected) < 1e-6;
        }),
        { numRuns: 100 }
      );
    });

    it('should always be non-negative', () => {
      fc.assert(
        fc.property(complexArb, (c: Complex) => {
          return complexMagnitude(c) >= 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should be zero only for zero complex number', () => {
      const zero: Complex = { real: 0, imag: 0 };
      expect(complexMagnitude(zero)).toBe(0);
    });
  });

  // Property 8: Twiddle Factor Correctness
  // For any valid k and N, twiddle_factor(k, N) should equal (cos(-2πk/N), sin(-2πk/N))
  describe('Property 8: Twiddle Factor Correctness', () => {
    // Generate (N, k) pairs where N is power of 2 and 0 <= k < N
    const twiddleArgsArb = fc.integer({ min: 1, max: 10 }).chain((exp) => {
      const N = Math.pow(2, exp);
      return fc.integer({ min: 0, max: N - 1 }).map((k) => ({ N, k }));
    });

    it('should correctly compute twiddle factor', () => {
      fc.assert(
        fc.property(twiddleArgsArb, ({ N, k }) => {
          const result = twiddleFactor(k, N);
          const angle = (-2 * Math.PI * k) / N;
          const expected: Complex = {
            real: Math.cos(angle),
            imag: Math.sin(angle),
          };
          return complexApproxEqual(result, expected, 1e-6);
        }),
        { numRuns: 100 }
      );
    });

    it('should have unit magnitude', () => {
      fc.assert(
        fc.property(twiddleArgsArb, ({ N, k }) => {
          const twiddle = twiddleFactor(k, N);
          const mag = complexMagnitude(twiddle);
          return Math.abs(mag - 1) < 1e-6;
        }),
        { numRuns: 100 }
      );
    });

    it('twiddle(0, N) should be (1, 0)', () => {
      const powerOf2Arb = fc.integer({ min: 1, max: 10 }).map((n) => Math.pow(2, n));
      fc.assert(
        fc.property(powerOf2Arb, (N: number) => {
          const result = twiddleFactor(0, N);
          return complexApproxEqual(result, { real: 1, imag: 0 }, 1e-6);
        }),
        { numRuns: 100 }
      );
    });
  });
});
