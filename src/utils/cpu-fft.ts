/**
 * CPU-based FFT implementation for testing and fallback
 * @module webgpu-fft/cpu-fft
 *
 * Implements Cooley-Tukey Radix-2 DIT algorithm for environments
 * without WebGPU support or for testing purposes.
 */

import { isPowerOf2, log2, bitReverse } from './bit-reversal';
import { FFTError, FFTErrorCode } from '../core/errors';

/**
 * Validate input for 1D FFT and return the size.
 *
 * @param input - Interleaved complex data [real, imag, real, imag, ...]
 * @returns Number of complex elements (input.length / 2)
 * @throws FFTError if input is invalid
 *
 * @example
 * ```typescript
 * const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const n = validateFFTInput(input); // n = 4
 * ```
 */
export function validateFFTInput(input: Float32Array): number {
  if (input.length % 2 !== 0) {
    throw new FFTError(
      `Input must contain interleaved complex pairs, got length ${input.length}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  const n = input.length / 2;
  if (!isPowerOf2(n)) {
    throw new FFTError(
      `Input size must be a power of 2, got ${n}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  if (n < 2) {
    throw new FFTError(`Input size must be at least 2, got ${n}`, FFTErrorCode.INVALID_INPUT_SIZE);
  }
  return n;
}

/**
 * Validate input for 2D FFT.
 *
 * @param input - Interleaved complex data
 * @param width - Width dimension (must be power of 2)
 * @param height - Height dimension (must be power of 2)
 * @throws FFTError if dimensions are invalid
 *
 * @example
 * ```typescript
 * const input = new Float32Array(16 * 16 * 2); // 16x16 complex matrix
 * validateFFT2DInput(input, 16, 16); // OK
 * ```
 */
export function validateFFT2DInput(input: Float32Array, width: number, height: number): void {
  if (!isPowerOf2(width) || !isPowerOf2(height)) {
    throw new FFTError(
      `2D FFT dimensions must be powers of 2, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }

  const expectedLength = width * height * 2;
  if (input.length !== expectedLength) {
    throw new FFTError(
      `Input length ${input.length} does not match expected ${expectedLength} for ${width}x${height}`,
      FFTErrorCode.DIMENSION_MISMATCH
    );
  }
}

/**
 * Compute 1D FFT using Cooley-Tukey Radix-2 DIT algorithm.
 *
 * Input format: interleaved complex [real0, imag0, real1, imag1, ...]
 * Output format: same as input
 *
 * Time complexity: O(N log N)
 * Space complexity: O(N)
 *
 * @param input - Interleaved complex data (length must be 2 × power of 2)
 * @returns FFT of input (same length)
 * @throws FFTError if input is invalid
 *
 * @example
 * ```typescript
 * // FFT of a constant signal
 * const input = new Float32Array([1, 0, 1, 0, 1, 0, 1, 0]);
 * const spectrum = cpuFFT(input);
 * // spectrum[0] = DC component = 4 + 0i
 * // spectrum[1..3] ≈ 0
 * ```
 *
 * @example
 * ```typescript
 * // FFT of a sinusoid
 * const n = 64;
 * const freq = 4; // 4 cycles
 * const input = new Float32Array(n * 2);
 * for (let i = 0; i < n; i++) {
 *   input[i * 2] = Math.sin(2 * Math.PI * freq * i / n);
 *   input[i * 2 + 1] = 0;
 * }
 * const spectrum = cpuFFT(input);
 * // Peak at bin 4
 * ```
 */
export function cpuFFT(input: Float32Array): Float32Array {
  const n = validateFFTInput(input);
  const bits = log2(n);

  // Copy input and perform bit-reversal permutation
  const data = new Float32Array(input.length);
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    data[j * 2] = input[i * 2];
    data[j * 2 + 1] = input[i * 2 + 1];
  }

  // Butterfly stages
  for (let stage = 0; stage < bits; stage++) {
    const span = 1 << stage;
    const butterflySize = span << 1;

    for (let k = 0; k < n; k += butterflySize) {
      for (let j = 0; j < span; j++) {
        const topIdx = k + j;
        const botIdx = k + j + span;

        // Twiddle factor: e^(-2πij/butterflySize)
        const angle = (-2 * Math.PI * j) / butterflySize;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);

        // Load values
        const topReal = data[topIdx * 2];
        const topImag = data[topIdx * 2 + 1];
        const botReal = data[botIdx * 2];
        const botImag = data[botIdx * 2 + 1];

        // W * bottom
        const wbReal = twiddleReal * botReal - twiddleImag * botImag;
        const wbImag = twiddleReal * botImag + twiddleImag * botReal;

        // Butterfly
        data[topIdx * 2] = topReal + wbReal;
        data[topIdx * 2 + 1] = topImag + wbImag;
        data[botIdx * 2] = topReal - wbReal;
        data[botIdx * 2 + 1] = topImag - wbImag;
      }
    }
  }

  return data;
}

/**
 * Compute 1D inverse FFT.
 *
 * Uses conjugate twiddle factors and normalizes by 1/N.
 *
 * @param input - Interleaved complex FFT data
 * @returns Time-domain signal
 * @throws FFTError if input is invalid
 *
 * @example
 * ```typescript
 * const signal = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
 * const spectrum = cpuFFT(signal);
 * const recovered = cpuIFFT(spectrum);
 * // recovered ≈ signal (within floating-point tolerance)
 * ```
 */
export function cpuIFFT(input: Float32Array): Float32Array {
  const n = validateFFTInput(input);
  const bits = log2(n);

  // Copy input and perform bit-reversal permutation
  const data = new Float32Array(input.length);
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    data[j * 2] = input[i * 2];
    data[j * 2 + 1] = input[i * 2 + 1];
  }

  // Butterfly stages (with conjugate twiddle factors)
  for (let stage = 0; stage < bits; stage++) {
    const span = 1 << stage;
    const butterflySize = span << 1;

    for (let k = 0; k < n; k += butterflySize) {
      for (let j = 0; j < span; j++) {
        const topIdx = k + j;
        const botIdx = k + j + span;

        // Twiddle factor: e^(+2πij/butterflySize) (conjugate for IFFT)
        const angle = (2 * Math.PI * j) / butterflySize;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);

        const topReal = data[topIdx * 2];
        const topImag = data[topIdx * 2 + 1];
        const botReal = data[botIdx * 2];
        const botImag = data[botIdx * 2 + 1];

        const wbReal = twiddleReal * botReal - twiddleImag * botImag;
        const wbImag = twiddleReal * botImag + twiddleImag * botReal;

        data[topIdx * 2] = topReal + wbReal;
        data[topIdx * 2 + 1] = topImag + wbImag;
        data[botIdx * 2] = topReal - wbReal;
        data[botIdx * 2 + 1] = topImag - wbImag;
      }
    }
  }

  // Normalize by 1/N
  for (let i = 0; i < data.length; i++) {
    data[i] /= n;
  }

  return data;
}

/**
 * Internal function to transform 2D data.
 */
function transform2D(
  input: Float32Array,
  width: number,
  height: number,
  transform: (input: Float32Array) => Float32Array
): Float32Array {
  validateFFT2DInput(input, width, height);

  const data = new Float32Array(input);
  const rowData = new Float32Array(width * 2);
  const colData = new Float32Array(height * 2);

  // Transform rows
  for (let row = 0; row < height; row++) {
    const rowStart = row * width * 2;
    rowData.set(data.subarray(rowStart, rowStart + width * 2));
    const rowResult = transform(rowData);
    data.set(rowResult, rowStart);
  }

  // Transform columns
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      colData[row * 2] = data[(row * width + col) * 2];
      colData[row * 2 + 1] = data[(row * width + col) * 2 + 1];
    }

    const colResult = transform(colData);
    for (let row = 0; row < height; row++) {
      data[(row * width + col) * 2] = colResult[row * 2];
      data[(row * width + col) * 2 + 1] = colResult[row * 2 + 1];
    }
  }

  return data;
}

/**
 * Compute 2D FFT using row-column decomposition.
 *
 * Applies 1D FFT to each row, then each column.
 *
 * @param input - Interleaved complex 2D data (row-major order)
 * @param width - Number of columns (must be power of 2)
 * @param height - Number of rows (must be power of 2)
 * @returns 2D FFT of input
 * @throws FFTError if dimensions are invalid
 *
 * @example
 * ```typescript
 * // 4x4 complex matrix
 * const input = new Float32Array(4 * 4 * 2);
 * const spectrum = cpuFFT2D(input, 4, 4);
 * const recovered = cpuIFFT2D(spectrum, 4, 4);
 * ```
 */
export function cpuFFT2D(input: Float32Array, width: number, height: number): Float32Array {
  return transform2D(input, width, height, cpuFFT);
}

/**
 * Compute 2D inverse FFT.
 *
 * @param input - Interleaved complex 2D FFT data
 * @param width - Number of columns
 * @param height - Number of rows
 * @returns Time-domain 2D signal
 * @throws FFTError if dimensions are invalid
 */
export function cpuIFFT2D(input: Float32Array, width: number, height: number): Float32Array {
  return transform2D(input, width, height, cpuIFFT);
}
