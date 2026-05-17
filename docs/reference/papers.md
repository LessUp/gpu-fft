# Academic Papers

> This bibliography is meant to answer “what is this project standing on?” rather than “what APIs does it expose?”. Use it to place `gpu-fft` inside the longer arc of FFT theory, GPU implementation practice, and DSP tooling.

## How to read this canon

1. Start with the foundational FFT papers if you want the algorithmic lineage.
2. Move to the GPU section if you care about memory access, work distribution, and modern accelerator practice.
3. Use the DSP and numerical sections to understand why seemingly simple API decisions still have mathematical consequences.

## FFT Theory & Algorithms

### Foundational Papers

<div class="citation">
<div class="citation-title">[An Algorithm for the Machine Calculation of Complex Fourier Series](https://www.ams.org/journals/mcom/1965-19-090/S0025-5718-1965-0178586-1/)</div>
<div class="citation-authors">James W. Cooley, John W. Tukey</div>
<div class="citation-venue">Mathematics of Computation, Vol. 19, No. 90 <span class="citation-year">1965</span></div>

The seminal paper introducing the radix-2 Cooley-Tukey FFT algorithm. This O(n log n) algorithm revolutionized signal processing and remains the foundation of most modern FFT implementations, including this library.

</div>

<div class="citation">
<div class="citation-title">[An Algorithm for the Machine Calculation of Complex Fourier Series (Original Gauss Manuscript)](https://link.springer.com/article/10.1007/BF02167669)</div>
<div class="citation-authors">Carl Friedrich Gauss</div>
<div class="citation-venue">Nachlass, published posthumously <span class="citation-year">1866</span></div>

Historical note: Gauss discovered the FFT algorithm decades before Cooley and Tukey, though his work remained obscure until modern times.

</div>

### Algorithm Variants

<div class="citation">
<div class="citation-title">[The Fast Fourier Transform](https://ieeexplore.ieee.org/document/1162037/)</div>
<div class="citation-authors">W. M. Gentleman, G. Sande</div>
<div class="citation-venue">Proceedings of ACM National Conference <span class="citation-year">1966</span></div>

Introduced the "Gentleman-Sande" FFT variant (decimation-in-frequency), complementing Cooley-Tukey's decimation-in-time approach.

</div>

<div class="citation">
<div class="citation-title">[Split-Radix Fast Fourier Transform](https://ieeexplore.ieee.org/document/1163255/)</div>
<div class="citation-authors">P. Duhamel, H. Hollmann</div>
<div class="citation-venue">Electronics Letters, Vol. 20, No. 1 <span class="citation-year">1984</span></div>

The split-radix algorithm achieves the lowest known arithmetic complexity for power-of-two sizes: ~4n log₂(n) operations.

</div>

<div class="citation">
<div class="citation-title">[Discrete Fourier Transforms when the Number of Data Samples is Prime](https://ieeexplore.ieee.org/document/1161967/)</div>
<div class="citation-authors">Charles M. Rader</div>
<div class="citation-venue">Proceedings of the IEEE, Vol. 56, No. 6 <span class="citation-year">1968</span></div>

Rader's algorithm enables FFT for prime-sized inputs by converting DFT into convolution, achievable via power-of-two FFTs.

</div>

<div class="citation">
<div class="citation-title">[A Linear Filtering Approach to the Computation of Discrete Fourier Transform](https://ieeexplore.ieee.org/document/1161872/)</div>
<div class="citation-authors">Leo I. Bluestein</div>
<div class="citation-venue">Northeast Electronics Research and Engineering Meeting Record <span class="citation-year">1968</span></div>

Bluestein's chirp z-transform algorithm supports arbitrary-size FFTs through convolution, enabling non-power-of-two transforms.

</div>

<div class="citation">
<div class="citation-title">[Prime Factor FFT Algorithms](https://ieeexplore.ieee.org/document/1162050/)</div>
<div class="citation-authors">D. P. Kolba, T. W. Parks</div>
<div class="citation-venue">IEEE Transactions on Acoustics, Speech, and Signal Processing <span class="citation-year">1977</span></div>

The prime factor algorithm (PFA) avoids twiddle factors for coprime-sized dimensions, reducing computational overhead.

</div>

## GPU & Parallel Computing

<div class="citation">
<div class="citation-title">[FFT on GPU: An Overview](https://dl.acm.org/doi/10.1145/3388566)</div>
<div class="citation-authors">Multiple Authors</div>
<div class="citation-venue">ACM Computing Surveys <span class="citation-year">2021</span></div>

Comprehensive survey of FFT implementations on GPUs, covering algorithmic adaptations, memory access patterns, and performance optimization strategies.

</div>

<div class="citation">
<div class="citation-title">[cuFFT: GPU-Accelerated FFT](https://docs.nvidia.com/cuda/cufft/index.html)</div>
<div class="citation-authors">NVIDIA Corporation</div>
<div class="citation-venue">NVIDIA Developer Documentation <span class="citation-year">Ongoing</span></div>

Industry-standard GPU FFT library. Documentation includes algorithm choices, performance characteristics, and optimization guidelines.

</div>

<div class="citation">
<div class="citation-title">[vkFFT: Vulkan Fast Fourier Transform Library](https://github.com/DTolm/VkFFT)</div>
<div class="citation-authors">Dmitry Tolmachev</div>
<div class="citation-venue">GitHub Repository <span class="citation-year">2020-2024</span></div>

Cross-platform GPU FFT library supporting Vulkan, CUDA, OpenCL, and Metal. Demonstrates advanced optimization techniques for modern GPU architectures.

</div>

<div class="citation">
<div class="citation-title">[FFT Implementation on Graphics Processors](https://users.ece.cmu.edu/~franzf/papers/gpgpu10-fft.pdf)</div>
<div class="citation-authors">N. K. Govindaraju, et al.</div>
<div class="citation-venue">ACM Transactions on Graphics <span class="citation-year">2008</span></div>

Foundational work on FFT memory access patterns and optimization for GPU architectures.

</div>

## Digital Signal Processing

<div class="citation">
<div class="citation-title">[On the Use of Windows for Harmonic Analysis with the Discrete Fourier Transform](https://ieeexplore.ieee.org/document/1455106/)</div>
<div class="citation-authors">Fredric J. Harris</div>
<div class="citation-venue">Proceedings of the IEEE, Vol. 66, No. 1 <span class="citation-year">1978</span></div>

The definitive reference on window functions for spectral analysis. Covers 20+ window types with detailed performance comparisons. This library implements Hann, Hamming, Blackman, and FlatTop windows based on this work.

</div>

<div class="citation">
<div class="citation-title">*Discrete-Time Signal Processing*</div>
<div class="citation-authors">Alan V. Oppenheim, Ronald W. Schafer</div>
<div class="citation-venue">Pearson, 3rd Edition <span class="citation-year">2009</span></div>

Standard textbook for DSP. Chapters 8-9 provide comprehensive coverage of DFT theory, FFT algorithms, and spectral analysis.

</div>

<div class="citation">
<div class="citation-title">*Digital Signal Processing: Principles, Algorithms, and Applications*</div>
<div class="citation-authors">John G. Proakis, Dimitris G. Manolakis</div>
<div class="citation-venue">Pearson, 4th Edition <span class="citation-year">2006</span></div>

Another authoritative DSP textbook with detailed coverage of FFT algorithms and their applications.

</div>

<div class="citation">
<div class="citation-title">*Theory and Application of Digital Signal Processing*</div>
<div class="citation-authors">Lawrence R. Rabiner, Bernard Gold</div>
<div class="citation-venue">Prentice-Hall <span class="citation-year">1975</span></div>

Classic text with practical insights into FFT implementation and real-world DSP applications.

</div>

## Numerical Computing

<div class="citation">
<div class="citation-title">*Accuracy and Stability of Numerical Algorithms*</div>
<div class="citation-authors">Nicholas J. Higham</div>
<div class="citation-venue">SIAM, 2nd Edition <span class="citation-year">2002</span></div>

Chapter 5 covers numerical stability of FFT algorithms. Essential reading for understanding floating-point behavior in FFT implementations.

</div>

<div class="citation">
<div class="citation-title">[IEEE Standard for Floating-Point Arithmetic (IEEE 754-2019)](https://standards.ieee.org/standard/754-2019.html)</div>
<div class="citation-authors">IEEE Computer Society</div>
<div class="citation-venue">IEEE Standard <span class="citation-year">2019</span></div>

The floating-point standard that governs arithmetic behavior in WebGPU shaders and JavaScript. Understanding IEEE 754 is essential for reasoning about FFT numerical accuracy.

</div>

<div class="citation">
<div class="citation-title">[FFTW: The Fastest Fourier Transform in the West](https://www.fftw.org/fftw-paper.pdf)</div>
<div class="citation-authors">Matteo Frigo, Steven G. Johnson</div>
<div class="citation-venue">Proceedings of ICASSP <span class="citation-year">1998</span></div>

The FFTW paper describes adaptive algorithm selection and code generation techniques that made FFTW the gold standard for CPU FFT performance.

</div>

---

## Related Resources

- [Reference Implementations](/reference/implementations) - FFT libraries across platforms
- [Learning Resources](/reference/learning) - Tutorials and interactive guides
