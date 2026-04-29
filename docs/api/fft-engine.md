# FFTEngine API

The main GPU-accelerated FFT engine for 1D and 2D transforms, including real-input RFFT helpers built on top of the complex FFT core.

## `createFFTEngine()`

Creates a new GPU-accelerated FFT engine instance.

### Signature

```ts
function createFFTEngine(config?: FFTEngineConfig): Promise<FFTEngine>;
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `config` | `FFTEngineConfig` | `{}` | Optional engine configuration |

### Returns

`Promise<FFTEngine>` — Resolves when GPU resources are initialized.

### Example

```ts
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();
```

## `FFTEngine` Class

### Methods

#### `fft()`

Performs a 1D forward FFT on the input data.

```ts
fft(data: Float32Array): Promise<Float32Array>;
```

**Parameters:**
- `data` — Interleaved complex data `[Re, Im, Re, Im, ...]`. Length must be power of 2 (2-65536).

**Returns:** `Promise<Float32Array>` — Frequency domain data.

```ts
const spectrum = await engine.fft(signal);
```

#### `ifft()`

Performs a 1D inverse FFT on the input data.

```ts
ifft(data: Float32Array): Promise<Float32Array>;
```

```ts
const recovered = await engine.ifft(spectrum);
```

#### `rfft()`

Performs a 1D FFT for a real-valued input signal and returns a compressed half-spectrum.

```ts
rfft(data: Float32Array): Promise<Float32Array>;
```

**Parameters:**
- `data` — Real-valued samples. Length must be a power of 2.

**Returns:** `Promise<Float32Array>` — Interleaved complex half-spectrum with `N / 2 + 1` bins.

#### `irfft()`

Performs the inverse of `rfft()` and restores a real-valued signal.

```ts
irfft(data: Float32Array): Promise<Float32Array>;
```

#### `fft2d()`

Performs a 2D FFT on image data.

```ts
fft2d(
  data: Float32Array,
  width: number,
  height: number
): Promise<Float32Array>;
```

**Parameters:**
- `data` — Interleaved complex data of size `width * height * 2`
- `width` — Image width (power of 2, max 2048)
- `height` — Image height (power of 2, max 2048)

**Returns:** `Promise<Float32Array>` — 2D frequency domain data.

```ts
const freqData = await engine.fft2d(imageData, 256, 256);
```

#### `ifft2d()`

Performs a 2D inverse FFT on image data.

```ts
ifft2d(
  data: Float32Array,
  width: number,
  height: number
): Promise<Float32Array>;
```

#### `rfft2d()`

Performs a 2D FFT for real-valued input data and returns a compressed row-major spectrum.

```ts
rfft2d(
  data: Float32Array,
  width: number,
  height: number
): Promise<Float32Array>;
```

**Returns:** `Promise<Float32Array>` — Row-major interleaved complex data with `height × (width / 2 + 1)` bins.

#### `irfft2d()`

Performs the inverse of `rfft2d()` and restores a real-valued image.

```ts
irfft2d(
  data: Float32Array,
  width: number,
  height: number
): Promise<Float32Array>;
```

#### `dispose()`

Releases all GPU resources.

```ts
dispose(): void;
```

```ts
engine.dispose();
```

## `FFTEngineConfig` Type

```ts
interface FFTEngineConfig {
  enableBankConflictOptimization: boolean;
  workgroupSize: number;
}
```

`workgroupSize` is currently fixed at `256`. Other values are rejected during initialization.

The engine also keeps a small bounded cache of reusable plans for multiple transform sizes, which helps alternating 1D and 2D workloads avoid rebuilding GPU buffers every time.

## Related

- [CPU FFT](./cpu-fft) — CPU fallback implementation
- [GPU Engine Architecture](/architecture/gpu-engine) — Internal design
