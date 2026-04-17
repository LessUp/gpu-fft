# Quick Start

Get started with WebGPU FFT Library in minutes.

## Installation

```bash
npm install webgpu-fft
```

## Basic GPU Usage

Check for WebGPU support, then create an FFT engine:

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft'

async function runFFT() {
  // Check if WebGPU is available
  if (!await isWebGPUAvailable()) {
    console.log('WebGPU not available, use CPU fallback')
    return
  }
  
  // Create FFT engine
  const engine = await createFFTEngine()
  
  // Prepare input data (interleaved complex format)
  // Format: [real0, imag0, real1, imag1, ...]
  const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])
  
  // Perform FFT
  const spectrum = await engine.fft(input)
  
  // Perform inverse FFT
  const recovered = await engine.ifft(spectrum)
  
  // Clean up GPU resources
  engine.dispose()
}
```

## CPU Fallback

When WebGPU is not available, use the CPU implementation:

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft'

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])
const spectrum = cpuFFT(input)
const recovered = cpuIFFT(spectrum)
```

## Creating a Signal

Create a test signal with known frequency components:

```typescript
function createSignal(size: number, frequency: number): Float32Array {
  const signal = new Float32Array(size * 2) // Complex = 2× real values
  
  for (let i = 0; i < size; i++) {
    const t = i / size
    signal[i * 2] = Math.sin(2 * Math.PI * frequency * t) // Real part
    signal[i * 2 + 1] = 0 // Imaginary part
  }
  
  return signal
}

// Create a signal with frequency = 5
const input = createSignal(1024, 5)
```

## Analyzing Results

After FFT, analyze the frequency domain data:

```typescript
function analyzeSpectrum(
  spectrum: Float32Array, 
  sampleRate: number = 44100
) {
  const numBins = spectrum.length / 2
  const resolution = sampleRate / numBins
  
  // Find peak frequency
  let maxMag = 0
  let peakBin = 0
  
  for (let i = 0; i < numBins; i++) {
    const real = spectrum[i * 2]
    const imag = spectrum[i * 2 + 1]
    const magnitude = Math.sqrt(real * real + imag * imag)
    
    if (magnitude > maxMag) {
      maxMag = magnitude
      peakBin = i
    }
  }
  
  const peakFreq = peakBin * resolution
  console.log(`Peak frequency: ${peakFreq} Hz`)
  
  return { peakFreq, maxMag }
}
```

## 2D FFT for Images

Process images using 2D FFT:

```typescript
import { createFFTEngine } from 'webgpu-fft'

async function processImage(imageData: Float32Array, width: number, height: number) {
  const engine = await createFFTEngine()
  
  // Forward 2D FFT
  const spectrum = await engine.fft2d(imageData, width, height)
  
  // Process in frequency domain...
  // (e.g., apply filters, analyze patterns)
  
  // Inverse 2D FFT
  const processed = await engine.ifft2d(spectrum, width, height)
  
  engine.dispose()
  return processed
}
```

## Error Handling

Always handle potential errors:

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft'

try {
  const engine = await createFFTEngine()
  const result = await engine.fft(invalidSize)
} catch (error) {
  if (error instanceof FFTError) {
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        console.error('WebGPU not supported')
        break
      case FFTErrorCode.SIZE_NOT_POWER_OF_2:
        console.error('Input size must be power of 2')
        break
      default:
        console.error(`FFT Error: ${error.message}`)
    }
  }
}
```

## Next Steps

- Learn about [Data Formats](./data-formats)
- Explore [API Reference](/api/)
- See [Examples](/examples/)
