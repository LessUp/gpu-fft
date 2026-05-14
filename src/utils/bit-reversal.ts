/**
 * CPU-side bit-reversal operations for testing and validation
 * @module webgpu-fft/bit-reversal
 */

import { validateInterleavedPowerOf2 } from '../core/validation';
import { log2 } from './math';

export { isPowerOf2, log2 } from './math';

/**
 * Compute the bit-reversed index of a number.
 *
 * Used in the first stage of Cooley-Tukey FFT to reorder input data.
 *
 * @param x - The index to reverse (0 to 2^bits - 1)
 * @param bits - Number of bits to reverse (log2 of FFT size)
 * @returns The bit-reversed index
 *
 * @example
 * ```typescript
 * bitReverse(0, 3);  // 0  (000 → 000)
 * bitReverse(1, 3);  // 4  (001 → 100)
 * bitReverse(2, 3);  // 2  (010 → 010)
 * bitReverse(3, 3);  // 6  (011 → 110)
 * bitReverse(4, 3);  // 1  (100 → 001)
 * bitReverse(5, 3);  // 5  (101 → 101)
 * bitReverse(6, 3);  // 3  (110 → 011)
 * bitReverse(7, 3);  // 7  (111 → 111)
 * ```
 */
export function bitReverse(x: number, bits: number): number {
  let result = 0;
  let val = x;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (val & 1);
    val = val >> 1;
  }
  return result;
}

/**
 * Perform bit-reversal permutation on a complex array.
 *
 * Creates a new array with elements reordered according to bit-reversal.
 * Input format: interleaved complex [real0, imag0, real1, imag1, ...]
 *
 * @param data - Interleaved complex array (length must be 2 * power of 2)
 * @returns New array with bit-reversed order
 *
 * @example
 * ```typescript
 * // Input: 4 complex numbers [r0,i0, r1,i1, r2,i2, r3,i3]
 * const input = new Float32Array([0,0, 1,0, 2,0, 3,0]);
 * const reversed = bitReversalPermutation(input);
 * // Output: [r0,i0, r2,i2, r1,i1, r3,i3] (indices 0,2,1,3)
 * ```
 */
export function bitReversalPermutation(data: Float32Array): Float32Array {
  const n = validateInterleavedPowerOf2(data);
  const bits = log2(n);
  const result = new Float32Array(data.length);

  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    // Copy complex number (2 floats) from position i to position j
    result[j * 2] = data[i * 2];
    result[j * 2 + 1] = data[i * 2 + 1];
  }

  return result;
}

/**
 * Perform in-place bit-reversal permutation.
 *
 * Modifies the input array directly, swapping elements to achieve
 * bit-reversed order. More memory efficient than {@link bitReversalPermutation}.
 *
 * @param data - Interleaved complex array to permute in-place
 *
 * @example
 * ```typescript
 * const data = new Float32Array([0,0, 1,0, 2,0, 3,0]);
 * bitReversalPermutationInPlace(data);
 * // data is now bit-reversed
 * ```
 */
export function bitReversalPermutationInPlace(data: Float32Array): void {
  const n = validateInterleavedPowerOf2(data);
  const bits = log2(n);

  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    if (i < j) {
      // Swap complex numbers at positions i and j
      const tempReal = data[i * 2];
      const tempImag = data[i * 2 + 1];
      data[i * 2] = data[j * 2];
      data[i * 2 + 1] = data[j * 2 + 1];
      data[j * 2] = tempReal;
      data[j * 2 + 1] = tempImag;
    }
  }
}
