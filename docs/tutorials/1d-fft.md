# 1D FFT Transform

Learn how to perform 1D Fast Fourier Transform using the WebGPU FFT Library.

## Overview

1D FFT transforms a time-domain signal into its frequency-domain representation. The library supports power-of-2 lengths from 2 to 65,536 elements.

## Basic Usage

```ts
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();

// Create a simple signal: sine wave in interleaved complex form
const size = 1024;
const signal = new Float32Array(size * 2);
for (let i = 0; i < size; i++) {
  signal[i * 2] = Math.sin((2 * Math.PI * 50 * i) / size);
  signal[i * 2 + 1] = 0;
}

// Perform forward FFT
const spectrum = await engine.fft(signal);

// spectrum contains complex interleaved data [Re, Im, Re, Im, ...]
```

## Analyzing the Output

```ts
// Extract magnitude spectrum
const magnitudes = new Float32Array(size / 2);
for (let i = 0; i < size / 2; i++) {
  const re = spectrum[2 * i];
  const im = spectrum[2 * i + 1];
  magnitudes[i] = Math.sqrt(re * re + im * im);
}

// Find dominant frequency
let maxIdx = 0;
let maxVal = 0;
for (let i = 0; i < magnitudes.length; i++) {
  if (magnitudes[i] > maxVal) {
    maxVal = magnitudes[i];
    maxIdx = i;
  }
}

const sampleRate = 1000;
const dominantFreq = (maxIdx * sampleRate) / size;
console.log(`Dominant frequency: ${dominantFreq} Hz`);
```

## Next Steps

- [2D FFT Tutorial](./2d-fft) - Learn about 2D transforms for image processing
- [Spectrum Analysis](./spectrum-analysis) - Real-time frequency analysis
