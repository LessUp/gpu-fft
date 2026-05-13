# Reference Hub

A curated collection of academic papers, technical specifications, and related projects that inform the design and implementation of this library.

## Academic Papers

| Paper | Year | Relevance |
|-------|------|-----------|
| Cooley & Tukey, "An Algorithm for the Machine Calculation of Complex Fourier Series" | 1965 | The foundational radix-2 FFT algorithm used in this library |
| Bluestein, "A Linear Filtering Approach to the Computation of the Discrete Fourier Transform" | 1968 | Algorithm for arbitrary-size DFT (future extension reference) |
| Rader, "Discrete Fourier Transforms when the Number of Data Samples is Prime" | 1968 | Prime-size FFT via convolution |

## Technical Specifications

| Spec | Link | Relevance |
|------|------|-----------|
| WebGPU W3C Spec | [w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/) | The GPU API this library targets |
| WGSL Spec | [w3.org/TR/WGSL](https://www.w3.org/TR/WGSL/) | Shading language for compute kernels |
| IEEE 754-2019 | [ieee.org](https://standards.ieee.org/standard/754-2019.html) | Floating-point behavior in shaders |

## Reference Implementations

| Project | Language | Notes |
|---------|----------|-------|
| [FFTW3](https://fftw.org/) | C | The de facto standard FFT library. Used as a performance baseline reference. |
| [Kiss FFT](https://github.com/mborgerding/kissfft) | C | Minimalist FFT designed for embedded systems. Our CPU fallback is conceptually similar in scope. |
| [TensorFlow.js](https://js.tensorflow.org/) | TypeScript | Provides `tf.spectral.fft` via WebGL. Our WebGPU path targets lower overhead for pure FFT workloads. |
| [gpu.js](https://gpu.rocks/) | JavaScript | General-purpose GPU computation via WebGL. Less specialized for FFT than our implementation. |
| [webgpu-utils](https://github.com/greggman/webgpu-utils) | TypeScript | Useful utilities for WebGPU development. |

## WebGPU Ecosystem

| Resource | Link | Purpose |
|----------|------|---------|
| WebGPU Report | [webgpureport.org](https://webgpureport.org/) | Check browser feature support |
| WebGPU DevTools | Chrome DevTools | Inspect GPU buffers, pipelines, and shaders |
| Three.js WebGPU Renderer | [threejs.org](https://threejs.org/) | Reference for production WebGPU usage patterns |

## Window Functions & DSP

| Resource | Relevance |
|----------|-----------|
| Harris, "On the Use of Windows for Harmonic Analysis with the Discrete Fourier Transform" (1978) | Comprehensive window function reference |
| Oppenheim & Schafer, *Discrete-Time Signal Processing* | Standard DSP textbook for algorithmic grounding |
