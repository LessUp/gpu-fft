// Feature: webgpu-fft-library, Property 3-4: Bit-Reversal Operations
// Validates: Requirements 2.1, 2.2
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  bitReverse,
  log2,
  isPowerOf2,
  bitReversalPermutation
} from '../src/utils/bit-reversal';

describe('Bit-Reversal Operations', () => {
  // Property 3: Bit-Reversal Round-Trip
  // For any index i in range [0, 2^n - 1], applying bit-reversal twice should return the original index
  describe('Property 3: Bit-Reversal Round-Trip', () => {
    const bitWidthArb = fc.integer({ min: 1, max: 16 });
    
    it('bit_reverse(bit_reverse(i, n), n) = i', () => {
      // Generate (bits, index) pairs where index is valid for the bit width
      const bitIndexArb = fc.integer({ min: 1, max: 16 }).chain(bits => {
        const maxIndex = Math.pow(2, bits) - 1;
        return fc.integer({ min: 0, max: maxIndex }).map(i => ({ bits, i }));
      });
      
      fc.assert(
        fc.property(bitIndexArb, ({ bits, i }) => {
          const reversed = bitReverse(i, bits);
          const doubleReversed = bitReverse(reversed, bits);
          return doubleReversed === i;
        }),
        { numRuns: 100 }
      );
    });

    it('should work for specific known values', () => {
      // 4 bits: 0b0001 -> 0b1000 -> 0b0001
      expect(bitReverse(1, 4)).toBe(8);
      expect(bitReverse(8, 4)).toBe(1);
      
      // 4 bits: 0b0011 -> 0b1100 -> 0b0011
      expect(bitReverse(3, 4)).toBe(12);
      expect(bitReverse(12, 4)).toBe(3);
      
      // 3 bits: 0b001 -> 0b100 -> 0b001
      expect(bitReverse(1, 3)).toBe(4);
      expect(bitReverse(4, 3)).toBe(1);
    });

    it('bit_reverse(0, n) = 0 for any n', () => {
      fc.assert(
        fc.property(bitWidthArb, (bits: number) => {
          return bitReverse(0, bits) === 0;
        }),
        { numRuns: 100 }
      );
    });

    it('bit_reverse(2^n - 1, n) = 2^n - 1 (all ones stays all ones)', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 16 }), (bits: number) => {
          const allOnes = Math.pow(2, bits) - 1;
          return bitReverse(allOnes, bits) === allOnes;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Property 4: Bit-Reversal Permutation Correctness
  // For any array of size N = 2^n, after bit-reversal permutation, 
  // the element at position i should be the original element at position bit_reverse(i, n)
  describe('Property 4: Bit-Reversal Permutation Correctness', () => {
    // Generate power of 2 sizes (small for testing)
    const powerOf2SizeArb = fc.integer({ min: 1, max: 8 }).map(n => Math.pow(2, n));
    
    it('output[i] = input[bit_reverse(i)]', () => {
      fc.assert(
        fc.property(powerOf2SizeArb, (size: number) => {
          // Create input array with unique values
          const input = new Float32Array(size * 2);
          for (let i = 0; i < size; i++) {
            input[i * 2] = i;       // real part = index
            input[i * 2 + 1] = i + 0.5; // imag part = index + 0.5
          }
          
          const output = bitReversalPermutation(input);
          const bits = log2(size);
          
          // Verify each position
          for (let i = 0; i < size; i++) {
            const j = bitReverse(i, bits);
            // output[i] should equal input[j]
            if (output[i * 2] !== input[j * 2] || 
                output[i * 2 + 1] !== input[j * 2 + 1]) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('permutation is self-inverse (applying twice returns original)', () => {
      fc.assert(
        fc.property(powerOf2SizeArb, (size: number) => {
          // Create random input
          const input = new Float32Array(size * 2);
          for (let i = 0; i < input.length; i++) {
            input[i] = Math.random() * 100;
          }
          
          const firstPass = bitReversalPermutation(input);
          const secondPass = bitReversalPermutation(firstPass);
          
          // Should equal original
          for (let i = 0; i < input.length; i++) {
            if (Math.abs(secondPass[i] - input[i]) > 1e-10) {
              return false;
            }
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('preserves all elements (no data loss)', () => {
      fc.assert(
        fc.property(powerOf2SizeArb, (size: number) => {
          const input = new Float32Array(size * 2);
          for (let i = 0; i < size; i++) {
            input[i * 2] = i;
            input[i * 2 + 1] = i + 1000;
          }
          
          const output = bitReversalPermutation(input);
          
          // Check that all original values exist in output
          const inputSet = new Set<number>();
          const outputSet = new Set<number>();
          
          for (let i = 0; i < input.length; i++) {
            inputSet.add(input[i]);
            outputSet.add(output[i]);
          }
          
          if (inputSet.size !== outputSet.size) return false;
          for (const val of inputSet) {
            if (!outputSet.has(val)) return false;
          }
          return true;
        }),
        { numRuns: 100 }
      );
    });
  });

  // Helper function tests
  describe('Helper Functions', () => {
    it('log2 should compute correct values', () => {
      expect(log2(1)).toBe(0);
      expect(log2(2)).toBe(1);
      expect(log2(4)).toBe(2);
      expect(log2(8)).toBe(3);
      expect(log2(16)).toBe(4);
      expect(log2(1024)).toBe(10);
    });

    it('isPowerOf2 should correctly identify powers of 2', () => {
      expect(isPowerOf2(1)).toBe(true);
      expect(isPowerOf2(2)).toBe(true);
      expect(isPowerOf2(4)).toBe(true);
      expect(isPowerOf2(1024)).toBe(true);
      expect(isPowerOf2(0)).toBe(false);
      expect(isPowerOf2(3)).toBe(false);
      expect(isPowerOf2(5)).toBe(false);
      expect(isPowerOf2(100)).toBe(false);
    });
  });
});
