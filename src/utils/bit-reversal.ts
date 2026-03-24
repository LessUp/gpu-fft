// CPU-side bit-reversal operations for testing and validation

// Compute bit-reversed index
export function bitReverse(x: number, bits: number): number {
  let result = 0;
  let val = x;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (val & 1);
    val = val >> 1;
  }
  return result;
}

// Compute log2 of a power of 2
export function log2(n: number): number {
  let bits = 0;
  let val = n;
  while (val > 1) {
    val >>= 1;
    bits++;
  }
  return bits;
}

// Check if n is a power of 2
export function isPowerOf2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Perform bit-reversal permutation on a complex array (interleaved format)
// Returns a new array with elements reordered
export function bitReversalPermutation(data: Float32Array): Float32Array {
  const n = data.length / 2; // Number of complex elements
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

// In-place bit-reversal permutation
export function bitReversalPermutationInPlace(data: Float32Array): void {
  const n = data.length / 2;
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
