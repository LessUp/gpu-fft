# Product Spec: WebGPU FFT Library

## Introduction

The WebGPU FFT Library is a high-performance Fast Fourier Transform library that leverages WebGPU compute shaders for GPU-accelerated FFT algorithms. It supports 1D and 2D FFT with deep optimization for GPU architecture, including Bank Conflict elimination and efficient bit-reversal permutation. Primary use cases include real-time audio spectrum analysis and image frequency-domain filtering.

**Status**: ✅ COMPLETED - All requirements implemented and verified. 106 tests passing.

## Glossary

| Term | Definition |
|------|------------|
| **FFT** | Fast Fourier Transform - efficient algorithm for computing Discrete Fourier Transform |
| **IFFT** | Inverse Fast Fourier Transform - transforms frequency-domain data back to time domain |
| **Radix-2** | Base-2 FFT algorithm that decomposes into two sub-problems per iteration |
| **Cooley-Tukey** | Most common FFT algorithm using divide-and-conquer strategy |
| **Butterfly Operation** | Basic FFT computation unit involving complex addition/subtraction and twiddle factor multiplication |
| **Twiddle Factor** | Complex exponential e^(-2πi·k/N) used in FFT |
| **Bit Reversal** | Index permutation required for FFT input/output reordering |
| **Bank Conflict** | Performance degradation when multiple threads access same Shared Memory bank |
| **Shared Memory** | Fast on-chip memory shared within a GPU workgroup |
| **Workgroup** | Group of threads executing cooperatively on GPU |

## Requirements

### Requirement 1: Complex Number Support ✅

**User Story**: As a developer, I want to perform complex number arithmetic on GPU, so that I can implement FFT algorithms efficiently.

#### Acceptance Criteria

1. THE Complex_Module SHALL represent complex numbers as vec2<f32> with x as real part and y as imaginary part ✅
2. WHEN two complex numbers are added, THE Complex_Module SHALL return a complex number with summed real and imaginary parts ✅
3. WHEN two complex numbers are multiplied, THE Complex_Module SHALL return the correct complex product using (a+bi)(c+di) = (ac-bd) + (ad+bc)i ✅
4. WHEN a complex number's magnitude is requested, THE Complex_Module SHALL return sqrt(real² + imag²) ✅
5. WHEN a twiddle factor is requested for index k and size N, THE Complex_Module SHALL return e^(-2πik/N) = cos(-2πk/N) + i·sin(-2πk/N) ✅

### Requirement 2: Bit-Reversal Permutation ✅

**User Story**: As a developer, I want efficient bit-reversal permutation on GPU, so that I can reorder FFT input/output correctly.

#### Acceptance Criteria

1. WHEN given an index and bit width, THE Bit_Reversal_Module SHALL compute the bit-reversed index correctly ✅
2. WHEN performing bit-reversal permutation on an array, THE Bit_Reversal_Module SHALL swap elements at index i and bit_reverse(i) only once ✅
3. THE Bit_Reversal_Module SHALL execute bit-reversal in parallel across GPU threads ✅
4. WHEN the array size is N = 2^n, THE Bit_Reversal_Module SHALL use n bits for reversal computation ✅

### Requirement 3: 1D FFT Core Algorithm ✅

**User Story**: As a developer, I want to compute 1D FFT on GPU, so that I can transform time-domain signals to frequency domain.

#### Acceptance Criteria

1. WHEN given an input array of size N (power of 2), THE FFT_Engine SHALL compute the Discrete Fourier Transform correctly ✅
2. THE FFT_Engine SHALL implement the Cooley-Tukey Radix-2 decimation-in-time algorithm ✅
3. WHEN performing butterfly operations, THE FFT_Engine SHALL use Shared_Memory for intermediate results within a workgroup ✅
4. THE FFT_Engine SHALL process log₂(N) stages of butterfly operations ✅
5. WHEN the FFT computation completes, THE FFT_Engine SHALL produce output where X[k] = Σ(x[n] · e^(-2πink/N)) for n=0 to N-1 ✅
6. THE FFT_Engine SHALL support input sizes from 2 to at least 2^16 (65536) elements ✅

### Requirement 4: Inverse FFT (IFFT) ✅

**User Story**: As a developer, I want to compute inverse FFT, so that I can transform frequency-domain data back to time domain.

#### Acceptance Criteria

1. WHEN given frequency-domain data, THE IFFT_Module SHALL compute the inverse transform correctly ✅
2. THE IFFT_Module SHALL use conjugate twiddle factors (e^(+2πik/N) instead of e^(-2πik/N)) ✅
3. WHEN IFFT completes, THE IFFT_Module SHALL divide all results by N for proper normalization ✅
4. WHEN FFT followed by IFFT is applied to input x, THE result SHALL equal x within floating-point tolerance ✅

### Requirement 5: Bank Conflict Optimization ✅

**User Story**: As a developer, I want to eliminate Shared Memory bank conflicts, so that FFT achieves maximum GPU performance.

#### Acceptance Criteria

1. WHEN accessing Shared_Memory, THE FFT_Engine SHALL use padding to avoid bank conflicts ✅
2. THE FFT_Engine SHALL add padding of at least 1 element per 32 elements (or per bank width) to Shared_Memory arrays ✅
3. WHEN butterfly operations access Shared_Memory, THE FFT_Engine SHALL ensure stride patterns avoid same-bank access by multiple threads ✅
4. THE FFT_Engine SHALL provide a configuration option to enable/disable bank conflict optimization for benchmarking ✅

### Requirement 6: 2D FFT ✅

**User Story**: As a developer, I want to compute 2D FFT for image processing, so that I can perform frequency-domain operations on images.

#### Acceptance Criteria

1. WHEN given a 2D array of size M×N (both powers of 2), THE FFT_2D_Module SHALL compute the 2D Discrete Fourier Transform ✅
2. THE FFT_2D_Module SHALL implement 2D FFT as row-wise 1D FFT followed by column-wise 1D FFT ✅
3. WHEN processing rows, THE FFT_2D_Module SHALL execute all row FFTs in parallel ✅
4. WHEN processing columns, THE FFT_2D_Module SHALL execute all column FFTs in parallel ✅
5. THE FFT_2D_Module SHALL support image sizes up to at least 2048×2048 pixels ✅

### Requirement 7: Frequency-Domain Filtering ✅

**User Story**: As a user, I want to apply frequency-domain filters to images, so that I can perform low-pass and high-pass filtering.

#### Acceptance Criteria

1. WHEN a low-pass filter is applied, THE Filter_Module SHALL attenuate frequencies above the cutoff frequency ✅
2. WHEN a high-pass filter is applied, THE Filter_Module SHALL attenuate frequencies below the cutoff frequency ✅
3. THE Filter_Module SHALL support configurable cutoff frequency as a percentage of the maximum frequency ✅
4. WHEN filtering is applied, THE Filter_Module SHALL perform: FFT → multiply by filter mask → IFFT ✅
5. THE Filter_Module SHALL provide Gaussian and ideal (sharp cutoff) filter types ✅

### Requirement 8: Real-Time Audio Spectrum Analysis ✅

**User Story**: As a user, I want to visualize audio frequency spectrum in real-time, so that I can analyze audio signals.

#### Acceptance Criteria

1. WHEN audio data is provided, THE Spectrum_Analyzer SHALL compute FFT and extract magnitude spectrum ✅
2. THE Spectrum_Analyzer SHALL support common audio buffer sizes (256, 512, 1024, 2048, 4096 samples) ✅
3. WHEN computing spectrum, THE Spectrum_Analyzer SHALL apply a window function (Hann window) to reduce spectral leakage ✅
4. THE Spectrum_Analyzer SHALL convert magnitude to decibels using 20·log₁₀(magnitude) ✅
5. WHEN spectrum is computed, THE Spectrum_Analyzer SHALL return frequency bins from 0 Hz to Nyquist frequency ✅

### Requirement 9: WebGPU Resource Management ✅

**User Story**: As a developer, I want proper GPU resource management, so that the library works reliably across different WebGPU implementations.

#### Acceptance Criteria

1. WHEN the library initializes, THE Resource_Manager SHALL request a WebGPU adapter and device ✅
2. IF WebGPU is not available, THEN THE Resource_Manager SHALL throw a descriptive error ✅
3. THE Resource_Manager SHALL create and manage GPU buffers for input, output, and intermediate data ✅
4. WHEN FFT computation is requested, THE Resource_Manager SHALL handle buffer uploads and downloads efficiently ✅
5. THE Resource_Manager SHALL provide methods to release GPU resources when no longer needed ✅
6. THE Resource_Manager SHALL reuse buffers when possible to minimize allocation overhead ✅

### Requirement 10: API Usability ✅

**User Story**: As a developer, I want a simple and intuitive API, so that I can integrate FFT functionality easily.

#### Acceptance Criteria

1. THE Library SHALL provide an async initialization function that returns a ready-to-use FFT instance ✅
2. THE Library SHALL accept standard JavaScript typed arrays (Float32Array) as input ✅
3. WHEN FFT is computed, THE Library SHALL return results as Float32Array with interleaved real/imaginary values ✅
4. THE Library SHALL provide separate functions for forward FFT, inverse FFT, and 2D variants ✅
5. THE Library SHALL include TypeScript type definitions for all public APIs ✅
6. IF invalid input size (not power of 2) is provided, THEN THE Library SHALL throw a descriptive error ✅

## CPU Fallback Support

**Status**: ✅ COMPLETED - Full CPU implementation available for non-WebGPU environments.

### Additional Requirements

1. THE Library SHALL provide CPU-based FFT implementations as fallback ✅
2. THE CPU FFT SHALL match GPU FFT output within floating-point tolerance ✅
3. THE Library SHALL automatically detect WebGPU availability ✅
4. THE Library SHALL support 2D FFT on CPU ✅
5. THE Library SHALL provide window functions (Hann, Hamming, Blackman, Flat Top, Rectangular) ✅
6. THE Library SHALL support band-pass filtering in addition to low-pass and high-pass ✅
