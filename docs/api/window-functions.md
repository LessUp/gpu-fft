# Window Functions API

Signal window functions for spectral analysis.

## Overview

Window functions reduce spectral leakage when performing FFT on finite-length signals.

## Window Function Generators

All window functions accept a `size` parameter and return a `Float32Array`.

### `hannWindow()`

```ts
function hannWindow(size: number): Float32Array;
```

The Hann window provides good frequency resolution with moderate sidelobe suppression.

### `hammingWindow()`

```ts
function hammingWindow(size: number): Float32Array;
```

The Hamming window offers better sidelobe suppression than Hann at the cost of wider mainlobe.

### `blackmanWindow()`

```ts
function blackmanWindow(size: number): Float32Array;
```

The Blackman window provides excellent sidelobe suppression for high-dynamic-range applications.

### `flatTopWindow()`

```ts
function flatTopWindow(size: number): Float32Array;
```

The Flat Top window minimizes amplitude error for precise amplitude measurements.

### `rectangularWindow()`

```ts
function rectangularWindow(size: number): Float32Array;
```

No windowing (equivalent to no window). Best for transient signals.

## `applyWindow()`

Applies a window function to real-valued data.

```ts
function applyWindow(
  data: Float32Array,
  window: Float32Array
): Float32Array;
```

### Example

```ts
import { hannWindow, applyWindow } from 'webgpu-fft';

const signal = new Float32Array(1024);
// ... fill signal ...

const window = hannWindow(1024);
const windowed = applyWindow(signal, window);
```

## `applyWindowComplex()`

Applies a window function to interleaved complex data.

```ts
function applyWindowComplex(
  data: Float32Array,
  window: Float32Array
): Float32Array;
```

## Comparison

| Window | Mainlobe Width | Sidelobe Level | Best For |
|--------|---------------|----------------|----------|
| Rectangular | Narrowest | -13 dB | Transients |
| Hann | 2 bins | -31 dB | General purpose |
| Hamming | 2 bins | -41 dB | Narrowband signals |
| Blackman | 3 bins | -58 dB | High dynamic range |
| Flat Top | 4 bins | -90 dB | Amplitude accuracy |

## Related

- [Spectrum Analyzer](./spectrum-analyzer) — Uses window functions internally
- [Spectrum Analysis Tutorial](/tutorials/spectrum-analysis) — Practical usage
