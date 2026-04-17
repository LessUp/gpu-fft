# CPU Fallback Implementation

How the library handles environments without WebGPU support.

## Overview

When WebGPU is unavailable (older browsers, non-WebGPU environments), the library provides a CPU-based FFT implementation as a fallback.

## Detection

```ts
import { isWebGPUSupported } from 'webgpu-fft';

if (await isWebGPUSupported()) {
  // Use GPU engine
  const engine = await createFFTEngine();
} else {
  // Fall back to CPU
  const result = cpuFFT(signal);
}
```

## CPU FFT API

```ts
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

// Forward FFT
const spectrum = cpuFFT(signal);

// Inverse FFT
const reconstructed = cpuIFFT(spectrum);
```

## Implementation Details

The CPU implementation uses the Cooley-Tukey radix-2 decimation-in-time algorithm:

```ts
// Pseudocode of the algorithm
function recursiveFFT(complexArray, inverse) {
  const N = complexArray.length;
  if (N <= 1) return complexArray;

  // Divide
  const even = recursiveFFT(complexArray.filter((_, i) => i % 2 === 0), inverse);
  const odd = recursiveFFT(complexArray.filter((_, i) => i % 2 !== 0), inverse);

  // Conquer
  const result = new Array(N);
  for (let k = 0; k < N / 2; k++) {
    const twiddle = exp(-2πi * k / N) * (inverse ? -1 : 1);
    const t = twiddle * odd[k];
    result[k] = even[k] + t;
    result[k + N / 2] = even[k] - t;
  }
  return result;
}
```

## Performance Comparison

| Size | GPU (ms) | CPU (ms) | Speedup |
|------|----------|----------|---------|
| 256 | 0.5 | 2 | 4x |
| 1024 | 1 | 10 | 10x |
| 4096 | 3 | 50 | 17x |
| 16384 | 8 | 250 | 31x |

*Measured on M1 Mac, Chrome 120*

## When to Use CPU FFT

The CPU fallback is useful for:
- **Testing**: Running tests in Node.js without WebGPU
- **Compatibility**: Supporting older browsers
- **Small sizes**: For very small FFTs (< 256), CPU can be competitive

## Limitations

- No 2D FFT support in CPU mode
- Slower for large FFT sizes
- No GPU-accelerated windowing functions

## Related

- [Architecture Overview](./overview) - High-level architecture
- [GPU Engine](./gpu-engine) - GPU-accelerated implementation
