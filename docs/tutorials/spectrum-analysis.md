# Real-Time Spectrum Analysis

Learn how to build a real-time audio spectrum analyzer.

## Overview

The library provides a `SpectrumAnalyzer` utility that wraps the FFT engine with windowing and dB conversion for audio analysis.

## Basic Usage

```ts
import { createSpectrumAnalyzer, WindowType } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 2048,
  windowType: WindowType.Hann,
  sampleRate: 44100,
});

// Analyze audio buffer (Float32Array from Web Audio API)
const audioBuffer = new Float32Array(2048);
// ... fill with audio samples ...

const spectrum = analyzer.analyze(audioBuffer);

// spectrum contains dB values ready for visualization
```

## Visualization

```ts
function drawSpectrum(canvas: HTMLCanvasElement, spectrum: Float32Array) {
  const ctx = canvas.getContext('2d')!;
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#4f46e5';

  const barWidth = width / spectrum.length;

  for (let i = 0; i < spectrum.length; i++) {
    const barHeight = ((spectrum[i] + 100) / 100) * height;
    ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
  }
}
```

## Frequency Bins

```ts
const frequencyResolution = analyzer.sampleRate / analyzer.fftSize;
console.log(`Each bin represents ${frequencyResolution} Hz`);

// Get frequency for a specific bin
function binToFrequency(binIndex: number): number {
  return binIndex * frequencyResolution;
}

// Get bin index for a specific frequency
function frequencyToBin(frequency: number): number {
  return Math.round(frequency / frequencyResolution);
}
```

## Next Steps

- [Image Filtering](./image-filtering) - Apply filters in frequency domain
- [Introduction](./introduction) - Back to tutorials overview
