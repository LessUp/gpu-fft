# GPU Detection API

Utilities for checking WebGPU availability.

## `isWebGPUAvailable`

Async boolean indicating if WebGPU is supported.

```ts
const isWebGPUAvailable: Promise<boolean>;
```

### Example

```ts
import { isWebGPUAvailable } from 'webgpu-fft';

if (await isWebGPUAvailable) {
  console.log('WebGPU is available!');
}
```

## `hasWebGPUSupport()`

Synchronous check for basic WebGPU API availability.

```ts
function hasWebGPUSupport(): boolean;
```

This checks if `navigator.gpu` exists but does not verify that a GPU adapter is available.

### Example

```ts
import { hasWebGPUSupport } from 'webgpu-fft';

if (!hasWebGPUSupport()) {
  console.log('WebGPU API not available in this browser.');
}
```

## Recommendation

Always use `isWebGPUAvailable` for the most accurate check:

```ts
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

if (await isWebGPUAvailable) {
  const engine = await createFFTEngine();
  // Use GPU engine
} else {
  // Fall back to cpuFFT
}
```

## Related

- [Browser Support](/setup/browser-support) — WebGPU compatibility matrix
- [FFTEngine](./fft-engine) — GPU-accelerated FFT engine
