// Window functions for signal processing

// Hann window: w[n] = 0.5 - 0.5 * cos(2πn/(N-1))
export function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

// Hamming window: w[n] = 0.54 - 0.46 * cos(2πn/(N-1))
export function hammingWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    window[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (size - 1));
  }
  return window;
}

// Blackman window: w[n] = 0.42 - 0.5*cos(2πn/(N-1)) + 0.08*cos(4πn/(N-1))
export function blackmanWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let n = 0; n < size; n++) {
    const ratio = (2 * Math.PI * n) / (size - 1);
    window[n] = 0.42 - 0.5 * Math.cos(ratio) + 0.08 * Math.cos(2 * ratio);
  }
  return window;
}

// Flat-top window: minimizes amplitude error in spectral analysis
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

// Rectangular window (no windowing, all ones)
export function rectangularWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  window.fill(1);
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
