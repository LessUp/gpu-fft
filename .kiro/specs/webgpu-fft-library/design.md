# Design Document: WebGPU FFT Library

## Overview

本设计文档描述了一个基于 WebGPU 的高性能 FFT 库的架构和实现细节。该库采用 Cooley-Tukey Radix-2 算法，通过 WebGPU 计算着色器在 GPU 上并行执行 FFT 运算，并针对 GPU 架构进行了深度优化，包括 Bank Conflict 消除和高效的位反转置换。

### 设计目标

1. **正确性**: 严格遵循 DFT 数学定义，通过 round-trip 测试验证
2. **性能**: 消除 Bank Conflict，最大化 GPU 并行度
3. **易用性**: 提供简洁的 TypeScript API
4. **可扩展性**: 支持 1D/2D FFT，便于扩展到更多应用场景

## Architecture

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

## Components and Interfaces

### 1. Complex Number Module

```typescript
// Complex number represented as vec2<f32> in WGSL
// x = real part, y = imaginary part

interface Complex {
  real: number;
  imag: number;
}

// WGSL helper functions (embedded in shaders)
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

// Factory function
async function createFFTEngine(config?: Partial<FFTEngineConfig>): Promise<FFTEngine>;
```

### 3. GPU Resource Manager Interface

```typescript
interface GPUResourceManager {
  device: GPUDevice;
  
  // Buffer management
  createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer;
  uploadData(buffer: GPUBuffer, data: Float32Array): void;
  downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array>;
  
  // Pipeline management
  createComputePipeline(shader: string, entryPoint: string): GPUComputePipeline;
  
  // Cleanup
  releaseBuffer(buffer: GPUBuffer): void;
  dispose(): void;
}
```

### 4. Application APIs

```typescript
// Spectrum Analyzer
interface SpectrumAnalyzerConfig {
  fftSize: 256 | 512 | 1024 | 2048 | 4096;
  sampleRate: number;
}

interface SpectrumAnalyzer {
  analyze(audioData: Float32Array): Promise<Float32Array>;  // Returns dB values
  dispose(): void;
}

// Image Filter
type FilterType = 'lowpass' | 'highpass';
type FilterShape = 'ideal' | 'gaussian';

interface ImageFilterConfig {
  type: FilterType;
  shape: FilterShape;
  cutoffFrequency: number;  // 0.0 to 1.0 (percentage of max frequency)
}

interface ImageFilter {
  apply(imageData: Float32Array, width: number, height: number): Promise<Float32Array>;
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

2D Buffer Layout (Row-major):
┌─────────────────────────────────────────────────────────────┐
│ Row 0: [r₀₀, i₀₀, r₀₁, i₀₁, ...]                           │
│ Row 1: [r₁₀, i₁₀, r₁₁, i₁₁, ...]                           │
│ ...                                                         │
│ Row M-1: [rₘ₋₁,₀, iₘ₋₁,₀, ...]                             │
└─────────────────────────────────────────────────────────────┘
Total size: 2 * M * N * sizeof(f32) bytes
```

### Shared Memory Layout with Bank Conflict Padding

```
Standard Layout (causes bank conflicts):
┌──────────────────────────────────────────┐
│ Index:  0   1   2   3  ... 31  32  33 ...│
│ Bank:   0   1   2   3  ... 31   0   1 ...│
└──────────────────────────────────────────┘

Padded Layout (eliminates bank conflicts):
┌──────────────────────────────────────────────────┐
│ Index:  0   1   2   3  ... 31  PAD  32  33  ...  │
│ Bank:   0   1   2   3  ... 31   X    1   2  ...  │
└──────────────────────────────────────────────────┘
Padding: 1 element per 32 elements (BANK_WIDTH)

Padded index calculation:
padded_index = index + (index / BANK_WIDTH)
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
         // Butterfly operation
         W = twiddle_factor(j, 2*span)  // e^(-2πij/(2*span))
         t = W * x[k + j + span]
         x[k + j + span] = x[k + j] - t
         x[k + j] = x[k + j] + t
```

### Bit-Reversal Algorithm

```
function bit_reverse(x: u32, bits: u32) -> u32:
  result = 0
  for i = 0 to bits-1:
    result = (result << 1) | (x & 1)
    x = x >> 1
  return result

// Optimized version using lookup table for small bit widths
// or parallel bit manipulation for larger widths
```

### Bank Conflict Elimination Strategy

```
Problem: In FFT butterfly operations, threads access memory with stride patterns
that can cause multiple threads to access the same memory bank simultaneously.

Example conflict (stride = 32, 32 banks):
Thread 0 accesses index 0  -> Bank 0
Thread 1 accesses index 32 -> Bank 0  // CONFLICT!

Solution: Add padding to shift indices
Padded array size: N + N/32 (for 32 banks)

Access pattern with padding:
logical_index -> physical_index = logical_index + (logical_index / 32)

Thread 0 accesses logical 0  -> physical 0  -> Bank 0
Thread 1 accesses logical 32 -> physical 33 -> Bank 1  // No conflict!
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: FFT/IFFT Round-Trip

*For any* complex array x of size N (where N is a power of 2), applying FFT followed by IFFT should return the original array within floating-point tolerance: IFFT(FFT(x)) ≈ x

**Validates: Requirements 3.1, 4.1, 4.4**

### Property 2: FFT Matches DFT Definition

*For any* complex array x of size N (where N ≤ 64 for practical testing), the FFT output X[k] should equal the naive DFT computation: X[k] = Σ(x[n] · e^(-2πink/N)) for n=0 to N-1, within floating-point tolerance.

**Validates: Requirements 3.5**

### Property 3: Bit-Reversal Round-Trip

*For any* index i in range [0, 2^n - 1], applying bit-reversal twice should return the original index: bit_reverse(bit_reverse(i, n), n) = i

**Validates: Requirements 2.1**

### Property 4: Bit-Reversal Permutation Correctness

*For any* array of size N = 2^n, after bit-reversal permutation, the element at position i should be the original element at position bit_reverse(i, n).

**Validates: Requirements 2.2**

### Property 5: Complex Addition

*For any* two complex numbers (a, b) and (c, d), complex_add should return (a+c, b+d).

**Validates: Requirements 1.2**

### Property 6: Complex Multiplication

*For any* two complex numbers (a, b) and (c, d), complex_mul should return (ac-bd, ad+bc).

**Validates: Requirements 1.3**

### Property 7: Complex Magnitude

*For any* complex number (a, b), magnitude should return sqrt(a² + b²).

**Validates: Requirements 1.4**

### Property 8: Twiddle Factor Correctness

*For any* valid k and N (where 0 ≤ k < N and N is a power of 2), twiddle_factor(k, N) should equal (cos(-2πk/N), sin(-2πk/N)) within floating-point tolerance.

**Validates: Requirements 1.5**

### Property 9: 2D FFT/IFFT Round-Trip

*For any* 2D complex array of size M×N (where M and N are powers of 2), applying FFT2D followed by IFFT2D should return the original array within floating-point tolerance.

**Validates: Requirements 6.1**

### Property 10: Low-Pass Filter Attenuates High Frequencies

*For any* input signal and cutoff frequency c, after applying low-pass filter, the magnitude of frequency components above c should be significantly attenuated (reduced by at least 90% for ideal filter, or following Gaussian decay for Gaussian filter).

**Validates: Requirements 7.1**

### Property 11: High-Pass Filter Attenuates Low Frequencies

*For any* input signal and cutoff frequency c, after applying high-pass filter, the magnitude of frequency components below c should be significantly attenuated.

**Validates: Requirements 7.2**

### Property 12: Spectrum Magnitude is Non-Negative

*For any* audio input, all magnitude values in the spectrum output should be non-negative (in linear scale) or finite (in dB scale).

**Validates: Requirements 8.1**

### Property 13: Hann Window Application

*For any* input signal x[n] of length N, the windowed signal should equal x[n] · (0.5 - 0.5·cos(2πn/(N-1))) for each sample.

**Validates: Requirements 8.3**

### Property 14: dB Conversion

*For any* positive magnitude value m, the dB conversion should return 20·log₁₀(m). For zero or near-zero magnitudes, should return a floor value (e.g., -100 dB).

**Validates: Requirements 8.4**

### Property 15: Frequency Bin Count

*For any* FFT of size N, the spectrum analyzer should return exactly N/2 + 1 frequency bins (from DC to Nyquist).

**Validates: Requirements 8.5**

### Property 16: Output Format Interleaved

*For any* FFT computation on input of size N, the output should be a Float32Array of size 2N with interleaved [real, imag, real, imag, ...] format.

**Validates: Requirements 10.3**

### Property 17: Invalid Size Rejection

*For any* input size that is not a power of 2, the FFT function should throw an error with a descriptive message.

**Validates: Requirements 10.6**

## Error Handling

### Error Types

```typescript
class FFTError extends Error {
  constructor(message: string, public code: FFTErrorCode) {
    super(message);
    this.name = 'FFTError';
  }
}

enum FFTErrorCode {
  WEBGPU_NOT_AVAILABLE = 'WEBGPU_NOT_AVAILABLE',
  INVALID_INPUT_SIZE = 'INVALID_INPUT_SIZE',
  INPUT_TOO_LARGE = 'INPUT_TOO_LARGE',
  BUFFER_ALLOCATION_FAILED = 'BUFFER_ALLOCATION_FAILED',
  SHADER_COMPILATION_FAILED = 'SHADER_COMPILATION_FAILED',
  DEVICE_LOST = 'DEVICE_LOST',
}
```

### Error Handling Strategy

1. **Initialization Errors**
   - Check WebGPU availability before any GPU operations
   - Provide fallback suggestions (e.g., use CPU-based FFT library)
   - Validate device limits against requested FFT sizes

2. **Input Validation**
   - Validate input size is power of 2 before processing
   - Check input array length matches expected size
   - Validate 2D dimensions for image processing

3. **Runtime Errors**
   - Handle GPU device lost events with automatic recovery attempt
   - Catch shader compilation errors with detailed error messages
   - Handle buffer allocation failures gracefully

4. **Resource Cleanup**
   - Ensure GPU resources are released on error
   - Implement dispose pattern for explicit cleanup
   - Use try-finally blocks for critical sections

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Complex Arithmetic**
   - Test known complex number operations
   - Test edge cases (zero, pure real, pure imaginary)

2. **Bit Reversal**
   - Test known bit reversal values
   - Test boundary cases (0, N-1)

3. **FFT Known Values**
   - Test FFT of constant signal (should have DC component only)
   - Test FFT of single frequency sinusoid
   - Test FFT of impulse signal

4. **Error Handling**
   - Test invalid input sizes
   - Test WebGPU unavailability (mocked)

### Property-Based Tests

Property-based tests will use **fast-check** library for TypeScript to verify universal properties across many generated inputs.

Configuration:
- Minimum 100 iterations per property test
- Use arbitrary complex arrays as generators
- Test various sizes: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024

Each property test will be tagged with:
```typescript
// Feature: webgpu-fft-library, Property N: [property description]
// Validates: Requirements X.Y
```

### Integration Tests

1. **End-to-End FFT Pipeline**
   - Test complete FFT workflow from input to output
   - Verify GPU buffer management

2. **2D FFT for Images**
   - Test with actual image data
   - Verify filter application

3. **Spectrum Analyzer**
   - Test with synthetic audio signals
   - Verify frequency detection accuracy

### Performance Benchmarks

1. **Bank Conflict Comparison**
   - Compare performance with/without padding optimization
   - Measure across different FFT sizes

2. **Throughput Measurement**
   - Measure FFTs per second for various sizes
   - Compare with CPU-based implementations
