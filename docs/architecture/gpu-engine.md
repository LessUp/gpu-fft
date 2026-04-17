# GPU Engine Architecture

Deep dive into how the WebGPU FFT engine works under the hood.

## Overview

The `FFTEngine` class is the core of the library, leveraging WebGPU compute shaders for parallel FFT computation.

## Initialization Flow

```
createFFTEngine()
  │
  ├─ 1. Request GPU adapter
  │      └─ navigator.gpu.requestAdapter()
  │
  ├─ 2. Create GPU device
  │      └─ adapter.requestDevice()
  │
  ├─ 3. Compile shader modules
  │      └─ device.createShaderModule()
  │
  ├─ 4. Create compute pipelines
  │      ├─ bit-reversal pipeline
  │      ├─ butterfly pipeline
  │      └─ complex arithmetic pipeline
  │
  └─ 5. Ready for computation
```

## Shader Architecture

The computation uses three main compute shaders:

### 1. Bit-Reversal Permutation
- Reorders input data for in-place Cooley-Tukey algorithm
- Workgroup size: 256
- Memory: O(1) extra

### 2. Butterfly Operation
- Core FFT computation stage
- Processes pairs of elements in parallel
- Uses twiddle factors pre-computed on GPU

### 3. Complex Arithmetic
- Handles complex multiplication and addition
- Used in both forward and inverse transforms

## Memory Management

```ts
// Internal GPU buffers
interface GPUResources {
  inputBuffer: GPUBuffer;     // Input data staging
  outputBuffer: GPUBuffer;    // Output data staging
  twiddleBuffer: GPUBuffer;   // Pre-computed twiddle factors
  stagingBuffer: GPUBuffer;   // Read-back buffer for results
}
```

### Resource Lifecycle
1. **Allocation**: Buffers created on first `fft1D`/`fft2D` call
2. **Reuse**: Buffers reused for subsequent calls of same size
3. **Cleanup**: Call `engine.dispose()` to release all GPU resources

## Performance Characteristics

| Operation | Time Complexity | GPU Utilization |
|-----------|----------------|-----------------|
| `fft1D` (N elements) | O(N log N) | High |
| `fft2D` (W×H image) | O(W×H log(W×H)) | High |
| Resource setup | O(N) | Low |

## GPU Device Selection

```ts
// The engine automatically selects the first available adapter
// You can influence selection via powerPreference
const engine = await createFFTEngine({
  powerPreference: 'high-performance', // or 'low-power'
});
```

## Related

- [Architecture Overview](./overview) - High-level architecture
- [CPU Fallback](./cpu-fallback) - CPU-based FFT fallback
