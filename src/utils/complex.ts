/**
 * CPU-side complex number operations for testing and validation
 * @module webgpu-fft/complex
 */

import type { Complex } from '../types';

const PI = Math.PI;

/**
 * Complex addition: (a + bi) + (c + di) = (a+c) + (b+d)i
 *
 * @param a - First complex number
 * @param b - Second complex number
 * @returns Sum of a and b
 *
 * @example
 * ```typescript
 * const a = { real: 3, imag: 4 };
 * const b = { real: 1, imag: 2 };
 * const sum = complexAdd(a, b); // { real: 4, imag: 6 }
 * ```
 */
export function complexAdd(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

/**
 * Complex subtraction: (a + bi) - (c + di) = (a-c) + (b-d)i
 *
 * @param a - First complex number
 * @param b - Second complex number
 * @returns Difference a - b
 *
 * @example
 * ```typescript
 * const a = { real: 3, imag: 4 };
 * const b = { real: 1, imag: 2 };
 * const diff = complexSub(a, b); // { real: 2, imag: 2 }
 * ```
 */
export function complexSub(a: Complex, b: Complex): Complex {
  return { real: a.real - b.real, imag: a.imag - b.imag };
}

/**
 * Complex multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 *
 * @param a - First complex number
 * @param b - Second complex number
 * @returns Product a × b
 *
 * @example
 * ```typescript
 * const a = { real: 3, imag: 4 };  // |a| = 5
 * const b = { real: 0, imag: 1 };  // i
 * const product = complexMul(a, b); // { real: -4, imag: 3 }
 * ```
 */
export function complexMul(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

/**
 * Complex magnitude: |a + bi| = sqrt(a² + b²)
 *
 * @param c - Complex number
 * @returns Magnitude (absolute value)
 *
 * @example
 * ```typescript
 * const c = { real: 3, imag: 4 };
 * const mag = complexMagnitude(c); // 5
 * ```
 */
export function complexMagnitude(c: Complex): number {
  return Math.sqrt(c.real * c.real + c.imag * c.imag);
}

/**
 * Complex conjugate: conj(a + bi) = a - bi
 *
 * Used in IFFT to reverse the sign of imaginary parts.
 *
 * @param c - Complex number
 * @returns Complex conjugate
 *
 * @example
 * ```typescript
 * const c = { real: 3, imag: 4 };
 * const conj = complexConj(c); // { real: 3, imag: -4 }
 * ```
 */
export function complexConj(c: Complex): Complex {
  return { real: c.real, imag: -c.imag };
}

/**
 * Twiddle factor for FFT: e^(-2πik/N) = cos(-2πk/N) + i·sin(-2πk/N)
 *
 * Also known as the "root of unity" for the DFT.
 *
 * @param k - Index (0 to N-1)
 * @param N - FFT size
 * @returns Complex twiddle factor
 *
 * @example
 * ```typescript
 * // For N=8, twiddle factors are 8th roots of unity
 * const w = twiddleFactor(1, 8);
 * // w = e^(-2πi/8) = cos(π/4) - i·sin(π/4) ≈ 0.707 - 0.707i
 * ```
 */
export function twiddleFactor(k: number, N: number): Complex {
  const angle = (-2 * PI * k) / N;
  return { real: Math.cos(angle), imag: Math.sin(angle) };
}

/**
 * Twiddle factor for IFFT: e^(+2πik/N) = cos(2πk/N) + i·sin(2πk/N)
 *
 * Conjugate of the FFT twiddle factor.
 *
 * @param k - Index (0 to N-1)
 * @param N - FFT size
 * @returns Complex twiddle factor for inverse transform
 *
 * @example
 * ```typescript
 * const w = twiddleFactorInverse(1, 8);
 * // w = e^(+2πi/8) ≈ 0.707 + 0.707i
 * ```
 */
export function twiddleFactorInverse(k: number, N: number): Complex {
  const angle = (2 * PI * k) / N;
  return { real: Math.cos(angle), imag: Math.sin(angle) };
}

/**
 * Scale complex number by real scalar.
 *
 * @param c - Complex number to scale
 * @param s - Real scalar
 * @returns Scaled complex number
 *
 * @example
 * ```typescript
 * const c = { real: 3, imag: 4 };
 * const scaled = complexScale(c, 2); // { real: 6, imag: 8 }
 * ```
 */
export function complexScale(c: Complex, s: number): Complex {
  return { real: c.real * s, imag: c.imag * s };
}

/**
 * Convert interleaved Float32Array to Complex array.
 *
 * Input: [real0, imag0, real1, imag1, ...]
 * Output: [{ real: real0, imag: imag0 }, { real: real1, imag: imag1 }, ...]
 *
 * @param data - Interleaved complex data
 * @returns Array of Complex objects
 *
 * @example
 * ```typescript
 * const interleaved = new Float32Array([1, 2, 3, 4]);
 * const complex = interleavedToComplex(interleaved);
 * // [{ real: 1, imag: 2 }, { real: 3, imag: 4 }]
 * ```
 */
export function interleavedToComplex(data: Float32Array): Complex[] {
  const result: Complex[] = [];
  for (let i = 0; i < data.length; i += 2) {
    result.push({ real: data[i], imag: data[i + 1] });
  }
  return result;
}

/**
 * Convert Complex array to interleaved Float32Array.
 *
 * Input: [{ real: real0, imag: imag0 }, ...]
 * Output: [real0, imag0, real1, imag1, ...]
 *
 * @param data - Array of Complex objects
 * @returns Interleaved Float32Array
 *
 * @example
 * ```typescript
 * const complex = [{ real: 1, imag: 2 }, { real: 3, imag: 4 }];
 * const interleaved = complexToInterleaved(complex);
 * // Float32Array [1, 2, 3, 4]
 * ```
 */
export function complexToInterleaved(data: Complex[]): Float32Array {
  const result = new Float32Array(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    result[i * 2] = data[i].real;
    result[i * 2 + 1] = data[i].imag;
  }
  return result;
}

/**
 * Check if two complex numbers are approximately equal.
 *
 * @param a - First complex number
 * @param b - Second complex number
 * @param tolerance - Maximum allowed difference (default: 1e-5)
 * @returns `true` if both real and imaginary parts are within tolerance
 *
 * @example
 * ```typescript
 * const a = { real: 1.00001, imag: 2.00001 };
 * const b = { real: 1, imag: 2 };
 * complexApproxEqual(a, b, 1e-4); // true
 * ```
 */
export function complexApproxEqual(a: Complex, b: Complex, tolerance = 1e-5): boolean {
  return Math.abs(a.real - b.real) < tolerance && Math.abs(a.imag - b.imag) < tolerance;
}

/**
 * Naive DFT for testing (O(N²) complexity).
 *
 * Direct implementation of the DFT formula:
 * X[k] = Σ(n=0 to N-1) x[n] · e^(-2πikn/N)
 *
 * Not suitable for large inputs. Use for verification and testing only.
 *
 * @param input - Array of N complex samples
 * @returns Array of N complex frequency bins
 *
 * @example
 * ```typescript
 * const signal = [{ real: 1, imag: 0 }, { real: 0, imag: 0 }, ...];
 * const spectrum = naiveDFT(signal);
 * ```
 */
export function naiveDFT(input: Complex[]): Complex[] {
  const N = input.length;
  const output: Complex[] = [];

  for (let k = 0; k < N; k++) {
    let sum: Complex = { real: 0, imag: 0 };
    for (let n = 0; n < N; n++) {
      const twiddle = twiddleFactor(k * n, N);
      sum = complexAdd(sum, complexMul(input[n], twiddle));
    }
    output.push(sum);
  }

  return output;
}

/**
 * Naive IDFT for testing (O(N²) complexity).
 *
 * Direct implementation of the inverse DFT formula:
 * x[n] = (1/N) · Σ(k=0 to N-1) X[k] · e^(+2πikn/N)
 *
 * Not suitable for large inputs. Use for verification and testing only.
 *
 * @param input - Array of N complex frequency bins
 * @returns Array of N complex time-domain samples
 *
 * @example
 * ```typescript
 * const spectrum = naiveDFT(signal);
 * const recovered = naiveIDFT(spectrum);
 * // recovered should equal signal (within floating-point tolerance)
 * ```
 */
export function naiveIDFT(input: Complex[]): Complex[] {
  const N = input.length;
  const output: Complex[] = [];

  for (let n = 0; n < N; n++) {
    let sum: Complex = { real: 0, imag: 0 };
    for (let k = 0; k < N; k++) {
      const twiddle = twiddleFactorInverse(k * n, N);
      sum = complexAdd(sum, complexMul(input[k], twiddle));
    }
    output.push(complexScale(sum, 1 / N));
  }

  return output;
}
