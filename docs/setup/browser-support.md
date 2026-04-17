# Browser Support

WebGPU FFT Library supports all modern browsers with WebGPU capability.

## Compatibility Matrix

| Browser | Minimum Version | WebGPU Status | Notes |
|---------|----------------|---------------|-------|
| Chrome | 113+ | ✅ Stable | Full Windows, macOS, Linux support |
| Edge | 113+ | ✅ Stable | Same as Chrome (Chromium) |
| Firefox | 128+ | ✅ Stable | Enabled by default since v128 |
| Safari | 17+ | ⚠️ Preview | Technology Preview only |
| Opera | 99+ | ✅ Stable | Chromium-based |
| Mobile Chrome | 121+ | ✅ Stable | Android only |
| Mobile Safari | - | ❌ N/A | Not supported yet |

## Feature Detection

Always check for WebGPU support before creating an engine:

```typescript
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft'

// Full check (includes adapter creation)
if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine()
}

// Quick check (API presence only)
if (hasWebGPUSupport()) {
  console.log('WebGPU API available')
}
```

## Fallback Strategy

The library provides automatic CPU fallback:

```typescript
import { createFFTEngine, cpuFFT, isWebGPUAvailable } from 'webgpu-fft'

async function computeFFT(input: Float32Array) {
  if (await isWebGPUAvailable()) {
    const engine = await createFFTEngine()
    const result = await engine.fft(input)
    engine.dispose()
    return result
  } else {
    return cpuFFT(input)
  }
}
```

## Enabling WebGPU

### Chrome / Edge

WebGPU is enabled by default in Chrome 113+. No configuration needed.

### Firefox

WebGPU is enabled by default in Firefox 128+. For older versions:

1. Navigate to `about:config`
2. Set `dom.webgpu.enabled` to `true`
3. Restart browser

### Safari

WebGPU requires Safari Technology Preview:

1. Download from [developer.apple.com](https://developer.apple.com/safari/technology-preview/)
2. Enable in Settings → Features → WebGPU

## Mobile Support

### Android

Chrome 121+ supports WebGPU on Android devices with compatible GPUs.

### iOS

No WebGPU support yet. Use CPU fallback.

## Limitations by Browser

### Chrome

- Maximum workgroup size: 256
- Maximum buffer size: Platform dependent

### Firefox

- Same as Chrome
- Some shader validation differences

### Safari

- Preview implementation only
- May have different performance characteristics

## Testing Your Browser

Test your browser's WebGPU support:

```typescript
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft'

async function testSupport() {
  const api = hasWebGPUSupport()
  const adapter = await isWebGPUAvailable()
  
  console.log('WebGPU API:', api ? '✅' : '❌')
  console.log('WebGPU Adapter:', adapter ? '✅' : '❌')
}

testSupport()
```
