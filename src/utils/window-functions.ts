/**
 * Window functions for signal processing
 * @module webgpu-fft/window-functions
 *
 * Window functions are used to reduce spectral leakage in FFT analysis.
 * Each window has different characteristics in terms of:
 * - Main lobe width (frequency resolution)
 * - Side lobe attenuation (dynamic range)
 * - Amplitude accuracy
 */

/**
 * Hann window: w[n] = 0.5 - 0.5 * cos(2πn/(N-1))
 *
 * Good general-purpose window with moderate side lobe attenuation.
 * Often used for audio spectrum analysis.
 *
 * @param size - Number of samples in the window
 * @returns Window coefficients
 *
 * @example
 * ```typescript
 * const window = hannWindow(1024);
 * const windowed = applyWindow(signal, window);
 * ```
 */
export function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

/**
 * Hamming window: w[n] = 0.54 - 0.46 * cos(2πn/(N-1))
 *
 * Similar to Hann but with slightly better side lobe suppression.
 * Named after Richard Hamming.
 *
 * @param size - Number of samples in the window
 * @returns Window coefficients
 *
 * @example
 * ```typescript
 * const window = hammingWindow(512);
 * ```
 */
export function hammingWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

/**
 * Blackman window: w[n] = 0.42 - 0.5*cos(2πn/(N-1)) + 0.08*cos(4πn/(N-1))
 *
 * Excellent side lobe attenuation at the cost of wider main lobe.
 * Good for detecting weak signals near strong ones.
 *
 * @param size - Number of samples in the window
 * @returns Window coefficients
 *
 * @example
 * ```typescript
 * const window = blackmanWindow(1024);
 * ```
 */
export function blackmanWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    const ratio = (2 * Math.PI * n) / (size - 1);
    window[n] = 0.42 - 0.5 * Math.cos(ratio) + 0.08 * Math.cos(2 * ratio);
  }
  return window;
}

/**
 * Flat-top window: Minimizes amplitude error in spectral analysis.
 *
 * Provides the most accurate amplitude measurements but with the
 * widest main lobe. Ideal for amplitude-critical applications.
 *
 * @param size - Number of samples in the window
 * @returns Window coefficients
 *
 * @example
 * ```typescript
 * const window = flatTopWindow(2048);
 * ```
 */
export function flatTopWindow(size: number): Float32Array {
  const a0 = 0.21557895;
  const a1 = 0.41663158;
  const a2 = 0.277263158;
  const a3 = 0.083578947;
  const a4 = 0.006947368;
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    const ratio = (2 * Math.PI * n) / (size - 1);
    window[n] =
      a0 -
      a1 * Math.cos(ratio) +
      a2 * Math.cos(2 * ratio) -
      a3 * Math.cos(3 * ratio) +
      a4 * Math.cos(4 * ratio);
  }
  return window;
}

/**
 * Rectangular window (no windowing, all ones).
 *
 * Equivalent to not applying any window. Best frequency resolution
 * but worst side lobe suppression (-13 dB first side lobe).
 *
 * @param size - Number of samples in the window
 * @returns Array of all ones
 *
 * @example
 * ```typescript
 * const window = rectangularWindow(1024);
 * // Equivalent to no windowing
 * ```
 */
export function rectangularWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  window.fill(1);
  return window;
}

/**
 * Apply a window function to a real-valued signal.
 *
 * Element-wise multiplication of signal and window.
 *
 * @param signal - Real-valued signal samples
 * @param window - Window coefficients (must match signal length)
 * @returns Windowed signal
 *
 * @example
 * ```typescript
 * const signal = new Float32Array(1024);
 * const window = hannWindow(1024);
 * const windowed = applyWindow(signal, window);
 * ```
 */
export function applyWindow(signal: Float32Array, window: Float32Array): Float32Array {
  const result = new Float32Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    result[i] = signal[i] * window[i];
  }
  return result;
}

/**
 * Apply a window function to a complex signal (interleaved format).
 *
 * Applies the window to both real and imaginary parts independently.
 *
 * @param signal - Interleaved complex signal [real, imag, real, imag, ...]
 * @param window - Window coefficients (length should be signal.length / 2)
 * @returns Windowed complex signal
 *
 * @example
 * ```typescript
 * const complexSignal = new Float32Array(2048); // 1024 complex numbers
 * const window = hannWindow(1024);
 * const windowed = applyWindowComplex(complexSignal, window);
 * ```
 */
export function applyWindowComplex(signal: Float32Array, window: Float32Array): Float32Array {
  const result = new Float32Array(signal.length);
  const n = window.length;
  for (let i = 0; i < n; i++) {
    result[i * 2] = signal[i * 2] * window[i];
    result[i * 2 + 1] = signal[i * 2 + 1] * window[i];
  }
  return result;
}
