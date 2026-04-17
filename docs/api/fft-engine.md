# FFTEngine API

The main GPU-accelerated FFT engine for 1D and 2D transforms.

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

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `device` | `GPUDevice` | The WebGPU device in use |
| `isDisposed` | `boolean` | Whether resources have been released |

### Methods

#### `fft1D()`

Performs a 1D forward FFT on the input data.

```ts
fft1D(data: Float32Array, direction: FFTDirection): Promise<Float32Array>;
```

**Parameters:**
- `data` — Interleaved complex data `[Re, Im, Re, Im, ...]`. Length must be power of 2 (2-65536).
- `direction` — `FFTDirection.Forward` or `FFTDirection.Inverse`

**Returns:** `Promise<Float32Array>` — Frequency domain data.

```ts
const spectrum = await engine.fft1D(signal, FFTDirection.Forward);
```

#### `fft2D()`

Performs a 2D FFT on image data.

```ts
fft2D(
  data: Float32Array,
  width: number,
  height: number,
  direction: FFTDirection
): Promise<Float32Array>;
```

**Parameters:**
- `data` — Interleaved complex data of size `width * height * 2`
- `width` — Image width (power of 2, max 2048)
- `height` — Image height (power of 2, max 2048)
- `direction` — Forward or Inverse

**Returns:** `Promise<Float32Array>` — 2D frequency domain data.

```ts
const freqData = await engine.fft2D(imageData, 256, 256, FFTDirection.Forward);
```

#### `dispose()`

Releases all GPU resources.

```ts
dispose(): void;
```

```ts
engine.dispose();
```

## `FFTDirection` Enum

```ts
enum FFTDirection {
  Forward = -1,
  Inverse = 1,
}
```

## `FFTEngineConfig` Type

```ts
interface FFTEngineConfig {
  /** GPU power preference */
  powerPreference?: 'high-performance' | 'low-power';
}
```

## Related

- [CPU FFT](./cpu-fft) — CPU fallback implementation
- [GPU Engine Architecture](/architecture/gpu-engine) — Internal design
