# RFC 0001: WebGPU FFT Library Architecture

## Status

- **Status**: ✅ IMPLEMENTED
- **Created**: 2024
- **Last Updated**: 2026-04-16
- **Authors**: WebGPU FFT Library Contributors

## Context

This RFC describes the technical architecture of the WebGPU FFT Library, a high-performance FFT implementation using WebGPU compute shaders. The library implements the Cooley-Tukey Radix-2 algorithm with GPU-specific optimizations including Bank Conflict elimination.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Public API Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  FFT1D API  │  │  FFT2D API  │  │  Application APIs       │  │
│  │  fft()      │  │  fft2d()    │  │  spectrum(), filter()   │  │
│  │  ifft()     │  │  ifft2d()   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Core FFT Engine                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  FFTEngine Class                         │    │
│  │  - Manages compute pipelines                             │    │
│  │  - Orchestrates FFT stages                               │    │
│  │  - Handles 1D and 2D transforms                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GPU Compute Layer                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │ Bit-Reversal  │  │  Butterfly    │  │  Twiddle Factor   │    │
│  │   Shader      │  │   Shader      │  │    Computation    │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Shared Memory with Bank Conflict Padding      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Resource Management Layer                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 GPUResourceManager                       │    │
│  │  - Buffer allocation and reuse                           │    │
│  │  - Pipeline caching                                      │    │
│  │  - Device/Adapter management                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Design Decisions

### Decision 1: Cooley-Tukey Radix-2 DIT Algorithm

**Rationale**: The Cooley-Tukey Radix-2 Decimation-In-Time algorithm is chosen for its:
- O(N log N) complexity vs O(N²) for naive DFT
- Regular memory access patterns suitable for GPU parallelization
- Well-understood mathematical properties enabling formal verification

**Trade-offs**:
- Requires input size to be power of 2
- Less flexible than Bluestein's algorithm (which handles arbitrary sizes)
- Simpler to implement than split-radix variants

### Decision 2: WGSL Shader Language

**Rationale**: WebGPU Shading Language (WGSL) is the native shader language for WebGPU, providing:
- First-class support in WebGPU API
- Type safety with vec2<f32> for complex numbers
- Cross-browser compatibility (no compilation step)

### Decision 3: Interleaved Complex Number Format

**Rationale**: Using interleaved `[real, imag, real, imag, ...]` format in Float32Array:
- Matches industry standard (FFTW, cuFFT use similar layouts)
- Simplifies memory management (single buffer)
- Enables efficient vec2<f32> loading in WGSL

### Decision 4: Shared Memory with Bank Conflict Padding

**Rationale**: Adding padding to shared memory eliminates bank conflicts during butterfly operations.

Padding: 1 element per 32 elements (BANK_WIDTH)

**Trade-offs**:
- Slightly larger memory footprint (~3% overhead for 32 banks)
- Requires index transformation in shader code
- Performance benefit varies by GPU architecture

### Decision 5: Dual GPU/CPU Implementation

**Rationale**: Providing CPU fallback ensures:
- Library works in environments without WebGPU (Firefox preview, Safari)
- Developers can test without GPU
- Enables server-side usage (Node.js)

## Component Details

### 1. Complex Number Module

```typescript
interface Complex {
  real: number;
  imag: number;
}

// WGSL operations (embedded in shaders)
// fn complex_add(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
// fn complex_mul(a: vec2<f32>, b: vec2<f32>) -> vec2<f32>
// fn complex_magnitude(c: vec2<f32>) -> f32
// fn twiddle_factor(k: u32, N: u32) -> vec2<f32>
```

### 2. FFT Engine Interface

```typescript
interface FFTEngineConfig {
  enableBankConflictOptimization: boolean;
  workgroupSize: number;  // Default: 256
}

interface FFTEngine {
  // 1D transforms
  fft(input: Float32Array): Promise<Float32Array>;
  ifft(input: Float32Array): Promise<Float32Array>;

  // 2D transforms
  fft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;
  ifft2d(input: Float32Array, width: number, height: number): Promise<Float32Array>;

  // Resource management
  dispose(): void;
}
```

### 3. GPU Resource Manager Interface

```typescript
interface GPUResourceManager {
  device: GPUDevice;
  createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer;
  uploadData(buffer: GPUBuffer, data: Float32Array): void;
  downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array>;
  createComputePipeline(shader: string, entryPoint: string): GPUComputePipeline;
  releaseBuffer(buffer: GPUBuffer): void;
  dispose(): void;
}
```

## Data Models

### Buffer Layout

```
Input/Output Buffer (Float32Array):
┌────────────────────────────────────────────────────────┐
│ [real₀, imag₀, real₁, imag₁, ..., realₙ₋₁, imagₙ₋₁]  │
└────────────────────────────────────────────────────────┘
Total size: 2 * N * sizeof(f32) bytes
```

### FFT Stage Configuration

```typescript
interface FFTStageConfig {
  stage: number;           // 0 to log2(N) - 1
  butterflySpan: number;   // 2^stage
  numButterflies: number;  // N / 2
  twiddleBase: number;     // Base index for twiddle factors
}
```

## Algorithm Details

### Cooley-Tukey Radix-2 DIT Algorithm

```
Input: x[0..N-1] (complex array, N = 2^n)
Output: X[0..N-1] (DFT of x)

1. Bit-reversal permutation:
   for i = 0 to N-1:
     j = bit_reverse(i, n)
     if i < j: swap(x[i], x[j])

2. Butterfly stages:
   for stage = 0 to n-1:
     span = 2^stage
     for k = 0 to N-1 step 2*span:
       for j = 0 to span-1:
         W = twiddle_factor(j, 2*span)  // e^(-2πij/(2*span))
         t = W * x[k + j + span]
         x[k + j + span] = x[k + j] - t
         x[k + j] = x[k + j] + t
```

## Error Handling

### Error Types

```typescript
enum FFTErrorCode {
  WEBGPU_NOT_AVAILABLE = 'WEBGPU_NOT_AVAILABLE',
  INVALID_INPUT_SIZE = 'INVALID_INPUT_SIZE',
  INPUT_TOO_LARGE = 'INPUT_TOO_LARGE',
  BUFFER_ALLOCATION_FAILED = 'BUFFER_ALLOCATION_FAILED',
  SHADER_COMPILATION_FAILED = 'SHADER_COMPILATION_FAILED',
  DEVICE_LOST = 'DEVICE_LOST',
}

class FFTError extends Error {
  constructor(message: string, code: FFTErrorCode);
}
```

## Correctness Properties

The following properties are verified through property-based testing (fast-check):

| Property | Description | Validates |
|----------|-------------|-----------|
| 1 | FFT/IFFT Round-Trip: IFFT(FFT(x)) ≈ x | Req 3.1, 4.1, 4.4 |
| 2 | FFT Matches DFT Definition | Req 3.5 |
| 3 | Bit-Reversal Round-Trip | Req 2.1 |
| 4 | Bit-Reversal Permutation Correctness | Req 2.2 |
| 5 | Complex Addition | Req 1.2 |
| 6 | Complex Multiplication | Req 1.3 |
| 7 | Complex Magnitude | Req 1.4 |
| 8 | Twiddle Factor | Req 1.5 |
| 9 | 2D FFT/IFFT Round-Trip | Req 6.1 |
| 10-17 | Filter, Spectrum, Format properties | Req 7-10 |

## Known Limitations

1. `workgroupSize` is fixed at 256 for compute kernels
2. `enableBankConflictOptimization` is currently unused (reserved for future fast path)
3. `SpectrumAnalyzer` and `ImageFilter` use CPU FFT internally
4. Maximum 1D size: 65,536 elements
5. Maximum 2D size: 2048×2048 pixels

## References

- [Cooley-Tukey FFT Algorithm](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WGSL Specification](https://www.w3.org/TR/WGSL/)
