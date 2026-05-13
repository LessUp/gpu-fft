# Reference Implementations

A comparative overview of FFT libraries across platforms, languages, and hardware accelerators.

## Production FFT Libraries

### CPU Reference Implementations

<div class="reference-grid">
<div class="reference-card">
<div class="reference-card-title">[FFTW3](https://www.fftw.org/)</div>
<div class="reference-card-desc">
The de facto standard FFT library for C/C++. Features adaptive algorithm selection ("planning") that optimizes for the specific hardware and transform size. MIT License.
</div>
<div class="reference-card-link">C · GPL/MIT · Multi-platform</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[Kiss FFT](https://github.com/mborgerding/kissfft)</div>
<div class="reference-card-desc">
Minimalist FFT designed for embedded systems. Simple codebase (~500 lines) makes it easy to understand and port. Our CPU fallback shares similar design philosophy.
</div>
<div class="reference-card-link">C · BSD-3-Clause · Embedded-friendly</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[pocketfft](https://gitlab.mpcdf.mpg.de/mtr/pocketfft)</div>
<div class="reference-card-desc">
Header-only C++ FFT library derived from FFTW. Used in NumPy's FFT implementation. Lightweight and easy to integrate.
</div>
<div class="reference-card-link">C++ · BSD-3-Clause · Header-only</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[Intel MKL FFT](https://www.intel.com/content/www/us/en/developer/tools/oneapi/onemkl.html)</div>
<div class="reference-card-desc">
Intel's Math Kernel Library includes highly optimized FFT routines for x86 processors. Leverages AVX-512 and other SIMD extensions.
</div>
<div class="reference-card-link">C/Fortran · Proprietary · x86 optimized</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[Apple Accelerate FFT](https://developer.apple.com/documentation/accelerate/fast_fourier_transforms)</div>
<div class="reference-card-desc">
Apple's framework provides hardware-optimized FFT on macOS and iOS. Integrates with vDSP for SIMD acceleration.
</div>
<div class="reference-card-link">C/Swift · Proprietary · Apple platforms</div>
</div>
</div>

### GPU Implementations

<div class="reference-grid">
<div class="reference-card">
<div class="reference-card-title">[cuFFT](https://docs.nvidia.com/cuda/cufft/)</div>
<div class="reference-card-desc">
NVIDIA's GPU FFT library. Supports 1D, 2D, 3D transforms up to 2³¹ elements. Optimized for CUDA architectures with automatic algorithm selection.
</div>
<div class="reference-card-link">CUDA · Proprietary · NVIDIA GPUs</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[vkFFT](https://github.com/DTolm/VkFFT)</div>
<div class="reference-card-desc">
Cross-platform GPU FFT supporting Vulkan, CUDA, OpenCL, Metal, and WebGPU. Demonstrates advanced optimization techniques. Similar algorithmic approach to this library.
</div>
<div class="reference-card-link">C++ · MIT · Cross-GPU</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[clFFT](https://github.com/ROCmSoftwarePlatform/clFFT)</div>
<div class="reference-card-desc">
OpenCL FFT library supporting AMD, NVIDIA, and Intel GPUs. Now part of AMD's ROCm stack.
</div>
<div class="reference-card-link">OpenCL · Apache 2.0 · AMD/NVIDIA/Intel</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[rocFFT](https://github.com/ROCmSoftwarePlatform/rocFFT)</div>
<div class="reference-card-desc">
AMD's GPU FFT library for ROCm platform. Features optimized kernels for AMD GPU architectures.
</div>
<div class="reference-card-link">HIP · MIT · AMD GPUs</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[oneMKL FFT](https://github.com/oneapi-src/oneMKL)</div>
<div class="reference-card-desc">
Intel's oneAPI Math Kernel Library with FFT routines supporting both CPU (via Intel MKL) and GPU (via DPC++/SYCL).
</div>
<div class="reference-card-link">DPC++ · Apache 2.0 · Intel GPUs/CPU</div>
</div>
</div>

### JavaScript / Web

<div class="reference-grid">
<div class="reference-card">
<div class="reference-card-title">[TensorFlow.js FFT](https://js.tensorflow.org/)</div>
<div class="reference-card-desc">
Provides `tf.spectral.fft()` via WebGL compute shaders. Part of the TensorFlow.js ecosystem. Our WebGPU implementation targets lower overhead for pure FFT workloads.
</div>
<div class="reference-card-link">TypeScript · Apache 2.0 · WebGL</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[gpu.js](https://gpu.rocks/)</div>
<div class="reference-card-desc">
General-purpose GPU computation via WebGL. Includes FFT examples. Less specialized than our WGSL compute shader implementation.
</div>
<div class="reference-card-link">JavaScript · MIT · WebGL</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[dsp.js](https://github.com/corbanbrook/dsp.js/)</div>
<div class="reference-card-desc">
JavaScript DSP library with FFT implementation. Pure JavaScript, runs on any environment. Useful reference for algorithm structure.
</div>
<div class="reference-card-link">JavaScript · MIT · Pure JS</div>
</div>

<div class="reference-card">
<div class="reference-card-title">[ml-fft](https://github.com/image-js/ml-fft)</div>
<div class="reference-card-desc">
FFT library for machine learning applications in JavaScript. Part of the ImageJS ecosystem.
</div>
<div class="reference-card-link">JavaScript · MIT · Pure JS</div>
</div>
</div>

## Implementation Comparison

| Library | Platform | Algorithm | Arbitrary Size | Multi-dimensional |
|---------|----------|-----------|----------------|-------------------|
| **webgpu-fft** (this) | WebGPU/WASM | Radix-2 DIT | No (power-of-2 only) | Up to 2D |
| FFTW3 | CPU | Adaptive | Yes | Yes (any dimension) |
| cuFFT | NVIDIA GPU | Multiple | Yes | Yes (up to 3D) |
| vkFFT | Cross-GPU | Multiple | Yes | Yes (up to 4D) |
| Kiss FFT | CPU | Radix-2, -4 | Limited | Up to 3D |
| TensorFlow.js | WebGL | Radix-2 | No | Up to 3D |

## Algorithmic Approaches

### Radix-2 Decimation-in-Time (This Library)

```
1. Bit-reversal permutation
2. Log₂(n) butterfly stages
3. Twiddle factor multiplication
```

**Pros**: Simple implementation, GPU-friendly, predictable memory access
**Cons**: Requires power-of-2 sizes

### Mixed-Radix (FFTW, cuFFT, vkFFT)

```
1. Factorize n = p₁ × p₂ × ... × pₖ
2. Apply radix-pᵢ kernels for each factor
3. Support for n with factors 2, 3, 5, 7, 11, etc.
```

**Pros**: Supports arbitrary sizes, better cache utilization
**Cons**: More complex code, more kernel variants

### Bluestein / Chirp Z-Transform

```
1. Convert DFT to convolution
2. Zero-pad to power-of-2
3. Use standard FFT
```

**Pros**: Supports any size
**Cons**: ~2x more operations, more memory

## Performance Characteristics

### GPU vs CPU

| Factor | GPU Advantage | CPU Advantage |
|--------|---------------|---------------|
| **Setup overhead** | Higher (pipeline creation) | Lower |
| **Per-element cost** | Lower (massive parallelism) | Higher |
| **Small transforms** | Slower | Faster |
| **Large transforms** | Significantly faster | Slower |
| **Latency-sensitive** | May be slower | More predictable |

### Crossover Point

The GPU vs CPU crossover point varies by hardware. Typical ranges:
- **Mobile GPUs**: >4096 elements
- **Integrated GPUs**: >2048 elements  
- **Discrete GPUs**: >1024 elements

Run `npm run benchmark` on your target hardware to measure actual performance.

---

## Related Resources

- [Academic Papers](/reference/papers) - Foundational FFT research
- [Learning Resources](/reference/learning) - Tutorials and guides
- [Benchmarks](/showcase/benchmarks) - Performance measurements
