# Image Filter API

Frequency domain image filtering using 2D FFT.

## `createImageFilter()`

Creates an image filter instance.

### Signature

```ts
function createImageFilter(
  config: ImageFilterConfig
): ImageFilter;
```

### Example

```ts
import { createImageFilter, FilterType } from 'webgpu-fft';

const filter = await createImageFilter({
  width: 512,
  height: 512,
});
```

## `ImageFilter` Class

### Methods

#### `applyFilter()`

Applies a filter to image data.

```ts
applyFilter(
  imageData: Float32Array,
  options: {
    type: FilterType;
    cutoff: number;
    shape?: 'ideal' | 'gaussian';
  }
): Float32Array;
```

**Parameters:**
- `imageData` — Interleaved complex image data
- `options.type` — Filter type (LowPass, HighPass, BandPass, BandStop)
- `options.cutoff` — Cutoff frequency (0-1, normalized)
- `options.shape` — Filter shape ('ideal' or 'gaussian', default 'ideal')

**Returns:** `Float32Array` — Filtered image data.

```ts
// Low-pass filter (blur)
const blurred = await filter.applyFilter(imageData, {
  type: FilterType.LowPass,
  cutoff: 0.3,
});

// High-pass filter (edge detection)
const edges = await filter.applyFilter(imageData, {
  type: FilterType.HighPass,
  cutoff: 0.1,
  shape: 'gaussian',
});
```

#### `dispose()`

Releases GPU resources.

```ts
dispose(): void;
```

## `ImageFilterConfig` Type

```ts
interface ImageFilterConfig {
  /** Image width (power of 2) */
  width: number;
  /** Image height (power of 2) */
  height: number;
}
```

## `FilterType` Enum

```ts
enum FilterType {
  LowPass = 'lowpass',
  HighPass = 'highpass',
  BandPass = 'bandpass',
  BandStop = 'bandstop',
}
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
