# Reference Hub

A curated collection of academic papers, technical specifications, reference implementations, and learning resources that inform the design and implementation of this library.

## Quick Navigation

<div class="reference-grid">
<div class="reference-card">
<div class="reference-card-title">📚 [Academic Papers](/reference/papers)</div>
<div class="reference-card-desc">
Foundational FFT research, GPU computing papers, and DSP textbooks. From Cooley-Tukey (1965) to modern GPU FFT surveys.
</div>
</div>

<div class="reference-card">
<div class="reference-card-title">⚡ [Reference Implementations](/reference/implementations)</div>
<div class="reference-card-desc">
FFT libraries across platforms: FFTW3, cuFFT, vkFFT, Kiss FFT, TensorFlow.js, and more. Comparative analysis of algorithms and performance.
</div>
</div>

<div class="reference-card">
<div class="reference-card-title">🎓 [Learning Resources](/reference/learning)</div>
<div class="reference-card-desc">
Interactive visualizations, video courses, WebGPU tutorials, and DSP textbooks for deeper understanding.
</div>
</div>
</div>

## Technical Specifications

| Spec | Link | Relevance |
|------|------|-----------|
| **WebGPU W3C Spec** | [w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/) | The GPU API this library targets |
| **WGSL Spec** | [w3.org/TR/WGSL](https://www.w3.org/TR/WGSL/) | Shading language for compute kernels |
| **IEEE 754-2019** | [ieee.org](https://standards.ieee.org/standard/754-2019.html) | Floating-point behavior in shaders |
| **WebGPU Extensions** | [webgpu.dev](https://webgpu.dev/) | Extension registry and compatibility |

## WebGPU Ecosystem

| Resource | Link | Purpose |
|----------|------|---------|
| **WebGPU Report** | [webgpureport.org](https://webgpureport.org/) | Check browser feature support |
| **WebGPU Samples** | [webgpu.github.io](https://webgpu.github.io/webgpu-samples/) | Official code examples |
| **Dawn** | [dawn.googlesource.com](https://dawn.googlesource.com/dawn) | Chrome's WebGPU implementation |
| **wgpu-native** | [wgpu.rs](https://wgpu.rs/) | Rust WebGPU implementation |

## Why These References Matter

This library is built on decades of research and engineering:

1. **Algorithmic Foundation**: The Cooley-Tukey radix-2 algorithm (1965) remains the basis for our GPU implementation
2. **GPU Optimization**: Techniques from vkFFT, cuFFT, and GPU Gems inform our shader design
3. **Numerical Stability**: IEEE 754 considerations guide our floating-point handling
4. **Window Functions**: Harris's 1978 paper is the definitive reference for our window implementations

---

## Contributing References

Found a relevant paper or resource? Contributions are welcome! Please ensure:

1. The resource is publicly accessible (open access or official documentation)
2. Include a brief description of its relevance to FFT or GPU computing
3. Follow the citation format used in [Academic Papers](/reference/papers)
