# CPU FFT API

CPU-based FFT fallback for environments without WebGPU.

## `cpuFFT()`

Performs a 1D forward FFT on the CPU.

### Signature

```ts
function cpuFFT(data: Float32Array): Float32Array;
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Float32Array` | Interleaved complex data `[Re, Im, ...]`. Must be power of 2. |

### Returns

`Float32Array` — Frequency domain data.

### Example

```ts
import { cpuFFT } from 'webgpu-fft';

const signal = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
const spectrum = cpuFFT(signal);
```

## `cpuIFFT()`

Performs a 1D inverse FFT.

### Signature

```ts
function cpuIFFT(data: Float32Array): Float32Array;
```

### Example

```ts
import { cpuIFFT } from 'webgpu-fft';

const reconstructed = cpuIFFT(spectrum);
```

## `cpuFFT2D()`

Performs a 2D FFT on image data.

### Signature

```ts
function cpuFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

### Example

```ts
import { cpuFFT2D } from 'webgpu-fft';

const freqData = cpuFFT2D(imageData, 256, 256);
```

## `cpuIFFT2D()`

Performs a 2D inverse FFT.

### Signature

```ts
function cpuIFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

## `validateFFTInput()`

Validates input data for 1D FFT.

### Signature

```ts
function validateFFTInput(data: Float32Array): void;
```

Throws `FFTError` if input is invalid.

## `validateFFT2DInput()`

Validates input data for 2D FFT.

### Signature

```ts
function validateFFT2DInput(
  data: Float32Array,
  width: number,
  height: number
): void;
```

Throws `FFTError` if input is invalid.

## Performance Notes

- CPU FFT is significantly slower than GPU for large sizes
- Best used for testing or small transforms (< 256 elements)
- See [CPU Fallback Architecture](/architecture/cpu-fallback) for implementation details

## Related

- [FFTEngine](./fft-engine) — GPU-accelerated FFT
- [CPU Fallback](/architecture/cpu-fallback) — Architecture deep dive
