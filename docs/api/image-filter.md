# Image Filter API

Frequency-domain image filtering using the CPU 2D FFT path.

> `createImageFilter()` is currently CPU-only. It uses the CPU 2D FFT implementation internally and does not allocate GPU resources.

## `createImageFilter()`

Creates an image filter instance.

### Signature

```ts
function createImageFilter(
  config: ImageFilterConfig
): Promise<ImageFilter>;
```

### Example

```ts
import { createImageFilter, FilterType } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',
  shape: 'gaussian',
  cutoffFrequency: 0.3,
});
```

## `ImageFilter` Class

### Methods

#### `apply()`

Applies the configured filter to image data.

```ts
apply(
  imageData: Float32Array,
  width: number,
  height: number
): Promise<Float32Array>;
```

**Parameters:**
- `imageData` — Interleaved complex image data
- `width` — Image width
- `height` — Image height

**Returns:** `Float32Array` — Filtered image data.

```ts
// Low-pass filter (blur)
const blurred = await filter.apply(imageData, 512, 512);

const edgeFilter = await createImageFilter({
  type: 'highpass',
  shape: 'gaussian',
  cutoffFrequency: 0.1,
});
const edges = await edgeFilter.apply(imageData, 512, 512);
```

#### `dispose()`

Releases resources. For the current CPU-only implementation this is a no-op.

```ts
dispose(): void;
```

## `ImageFilterConfig` Type

```ts
interface ImageFilterConfig {
  type: FilterType;
  shape: FilterShape;
  cutoffFrequency: number;
  bandwidth?: number;
}
```

## `FilterType` Type

```ts
type FilterType = 'lowpass' | 'highpass' | 'bandpass';
```

## `FilterShape` Type

```ts
type FilterShape = 'ideal' | 'gaussian';
```

| Shape | Description |
|-------|-------------|
| `ideal` | Hard cutoff, may cause ringing artifacts |
| `gaussian` | Smooth rolloff, fewer artifacts |

## Related

- [Image Filtering Tutorial](/tutorials/image-filtering) — Usage guide
- [2D FFT Tutorial](/tutorials/2d-fft) — 2D transform basics
