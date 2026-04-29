# Quick Start

Get started with WebGPU FFT Library in minutes.

## Installation

```bash
npm install webgpu-fft
```

## Basic GPU Usage

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft'

async function runFFT() {
  if (!(await isWebGPUAvailable())) {
    console.log('WebGPU not available, use CPU fallback')
    return
  }

  const engine = await createFFTEngine()
  const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])

  const spectrum = await engine.fft(input)
  const recovered = await engine.ifft(spectrum)

  engine.dispose()
  return recovered
}
```

## CPU Fallback

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft'

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])
const spectrum = cpuFFT(input)
const recovered = cpuIFFT(spectrum)
```

## Real-Valued Signal Shortcut

For real-valued signals, use the dedicated real-input APIs instead of manually packing complex pairs:

```typescript
import { createFFTEngine, cpuIRFFT, cpuRFFT } from 'webgpu-fft'

const input = new Float32Array([0, 1, 0, -1, 0, 1, 0, -1])

const cpuSpectrum = cpuRFFT(input)
const cpuRecovered = cpuIRFFT(cpuSpectrum)

const engine = await createFFTEngine()
const gpuSpectrum = await engine.rfft(input)
const gpuRecovered = await engine.irfft(gpuSpectrum)
engine.dispose()
```

## 2D FFT for Images

```typescript
import { createFFTEngine } from 'webgpu-fft'

async function processImage(imageData: Float32Array, width: number, height: number) {
  const engine = await createFFTEngine()
  const spectrum = await engine.fft2d(imageData, width, height)
  const processed = await engine.ifft2d(spectrum, width, height)
  engine.dispose()
  return processed
}
```

## Error Handling

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft'

try {
  const engine = await createFFTEngine()
  await engine.fft(invalidInput)
} catch (error) {
  if (error instanceof FFTError) {
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        console.error('WebGPU not supported')
        break
      case FFTErrorCode.INVALID_INPUT_SIZE:
        console.error('Input size must be a power of 2')
        break
      default:
        console.error(`FFT Error: ${error.message}`)
    }
  }
}
```

## Next Steps

- Explore the [API Reference](/api/index)
- Read the [Architecture Overview](/architecture/overview)
- Try the [Tutorials](/tutorials/introduction)
