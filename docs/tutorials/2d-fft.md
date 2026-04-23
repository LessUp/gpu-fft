# 2D FFT Transform

Learn how to perform 2D Fast Fourier Transform for image processing.

## Overview

2D FFT transforms spatial domain data (images) into frequency domain, enabling frequency-based image operations like filtering, compression, and analysis.

## Basic Usage

```ts
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();

// Image data as interleaved complex values (RGBA → [R, 0, G, 0, B, 0, A, 0, ...])
const width = 256;
const height = 256;
const imageData = new Float32Array(width * height * 2);

// Fill with image data (simplified example)
// In practice, load from canvas or image file

// Perform 2D FFT
const frequencyDomain = await engine.fft2d(imageData, width, height);
```

## Shifting the Zero Frequency

```ts
function fftShift(magnitudes: Float32Array, width: number, height: number): Float32Array {
  const shifted = new Float32Array(magnitudes.length);
  const halfW = width / 2;
  const halfH = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = (x + halfW) % width;
      const srcY = (y + halfH) % height;
      const dstIdx = y * width + x;
      const srcIdx = srcY * width + srcX;
      shifted[dstIdx] = magnitudes[srcIdx];
    }
  }
  return shifted;
}
```

## Visualizing the Spectrum

```ts
// Compute magnitude spectrum
function computeMagnitudeSpectrum(
  data: Float32Array,
  width: number,
  height: number
): Float32Array {
  const magnitudes = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const re = data[2 * i];
    const im = data[2 * i + 1];
    magnitudes[i] = Math.log(1 + Math.sqrt(re * re + im * im));
  }

  // Normalize to 0-255
  let max = 0;
  for (let i = 0; i < magnitudes.length; i++) {
    if (magnitudes[i] > max) max = magnitudes[i];
  }
  for (let i = 0; i < magnitudes.length; i++) {
    magnitudes[i] = (magnitudes[i] / max) * 255;
  }

  return magnitudes;
}
```

## Next Steps

- [Spectrum Analysis](./spectrum-analysis) - Real-time frequency analysis
- [Image Filtering](./image-filtering) - Apply filters in frequency domain
