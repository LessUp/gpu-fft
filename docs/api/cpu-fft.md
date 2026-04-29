# CPU FFT API

CPU-based FFT fallback for environments without WebGPU, including real-input RFFT helpers.

## Complex FFT APIs

### `cpuFFT()`

Performs a 1D forward FFT on interleaved complex input.

```ts
function cpuFFT(data: Float32Array): Float32Array;
```

- **Input:** interleaved complex data `[Re, Im, Re, Im, ...]`
- **Return:** interleaved complex frequency-domain data

### `cpuIFFT()`

Performs a 1D inverse FFT on interleaved complex input.

```ts
function cpuIFFT(data: Float32Array): Float32Array;
```

### `cpuFFT2D()`

Performs a 2D forward FFT on interleaved complex input.

```ts
function cpuFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

### `cpuIFFT2D()`

Performs a 2D inverse FFT on interleaved complex input.

```ts
function cpuIFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

## Real-Input FFT APIs

### `cpuRFFT()`

Performs a 1D FFT for real-valued samples and returns a compressed half-spectrum.

```ts
function cpuRFFT(data: Float32Array): Float32Array;
```

- **Input:** real-valued samples of length `N`
- **Return:** interleaved complex half-spectrum containing `N / 2 + 1` bins

### `cpuIRFFT()`

Restores a real-valued signal from a compressed half-spectrum.

```ts
function cpuIRFFT(data: Float32Array): Float32Array;
```

### `cpuRFFT2D()`

Performs a 2D FFT for real-valued input data and returns `height × (width / 2 + 1)` compressed complex bins.

```ts
function cpuRFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

### `cpuIRFFT2D()`

Restores a real-valued 2D signal from the compressed real-input spectrum.

```ts
function cpuIRFFT2D(
  data: Float32Array,
  width: number,
  height: number
): Float32Array;
```

## Validation Helpers

### `validateFFTInput()`

Validates 1D complex FFT input and returns the transform size.

```ts
function validateFFTInput(data: Float32Array): number;
```

### `validateFFT2DInput()`

Validates 2D complex FFT input dimensions.

```ts
function validateFFT2DInput(
  data: Float32Array,
  width: number,
  height: number
): void;
```

## Notes

- CPU real-input APIs currently wrap the complex FFT implementation; they establish the public contract first rather than introducing a separate optimized kernel.
- Use these APIs as the fallback path in environments where `createFFTEngine()` is unavailable.

## Related

- [FFTEngine](./fft-engine) — GPU-accelerated FFT engine
- [CPU Fallback](/architecture/cpu-fallback) — Architecture details
