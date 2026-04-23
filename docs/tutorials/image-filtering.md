# Frequency Domain Image Filtering

Learn how to apply filters to images using 2D FFT.

## Overview

Frequency domain filtering converts an image to frequency space, applies a filter mask, and converts back. This enables operations that are difficult or impossible in spatial domain.

## Using the Image Filter API

```ts
import { createFFTEngine, createImageFilter } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',
  shape: 'ideal',
  cutoffFrequency: 0.3,
});

// Apply low-pass filter (blur)
const blurred = await filter.apply(imageData, 512, 512);

// Apply high-pass filter (edge detection)
const edgeFilter = await createImageFilter({
  type: 'highpass',
  shape: 'gaussian',
  cutoffFrequency: 0.1,
});
const edges = await edgeFilter.apply(imageData, 512, 512);
```

## Filter Types

| Filter | Effect | Use Case |
|--------|--------|----------|
| Low-pass | Blurs image | Noise reduction, smoothing |
| High-pass | Enhances edges | Edge detection, sharpening |
| Band-pass | Keeps mid frequencies | Texture analysis |

## Manual Filtering

```ts
const engine = await createFFTEngine();

// 1. FFT to frequency domain
const freqData = await engine.fft2d(imageData, width, height);

// 2. Create filter mask
const mask = createGaussianMask(width, height, 0.2);

// 3. Apply mask
for (let i = 0; i < width * height; i++) {
  freqData[2 * i] *= mask[i];
  freqData[2 * i + 1] *= mask[i];
}

// 4. Inverse FFT back to spatial domain
const filtered = await engine.ifft2d(freqData, width, height);
```

## Creating Filter Masks

```ts
function createGaussianMask(
  width: number,
  height: number,
  cutoff: number
): Float32Array {
  const mask = new Float32Array(width * height);
  const center = cutoff * Math.min(width, height) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mask[y * width + x] = Math.exp(-(dist * dist) / (2 * center * center));
    }
  }

  return mask;
}
```

## Next Steps

- [1D FFT](./1d-fft) - Learn about 1D transforms
- [2D FFT](./2d-fft) - Learn about 2D transforms
- [Introduction](./introduction) - Back to tutorials overview
