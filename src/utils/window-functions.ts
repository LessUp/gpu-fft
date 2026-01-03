// Window functions for signal processing

// Hann window: w[n] = 0.5 - 0.5 * cos(2πn/(N-1))
export function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

// Apply window to real signal
export function applyWindow(signal: Float32Array, window: Float32Array): Float32Array {
  const result = new Float32Array(signal.length);
  for (let i = 0; i < signal.length; i++) {
    result[i] = signal[i] * window[i];
  }
  return result;
}

// Apply window to complex signal (interleaved format)
export function applyWindowComplex(signal: Float32Array, window: Float32Array): Float32Array {
  const result = new Float32Array(signal.length);
  const n = window.length;
  for (let i = 0; i < n; i++) {
    result[i * 2] = signal[i * 2] * window[i];
    result[i * 2 + 1] = signal[i * 2 + 1] * window[i];
  }
  return result;
}
