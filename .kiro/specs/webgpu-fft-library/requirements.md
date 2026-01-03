# Requirements Document

## Introduction

WebGPU FFT Library 是一个高性能的快速傅里叶变换库，利用 WebGPU 的计算着色器在 GPU 上实现 FFT 算法。该库支持 1D 和 2D FFT，针对 GPU 架构进行了深度优化，包括 Bank Conflict 消除和高效的位反转置换。主要应用场景包括实时音频频谱分析和图像频域滤波。

## Glossary

- **FFT**: Fast Fourier Transform，快速傅里叶变换，将时域信号转换为频域表示的高效算法
- **IFFT**: Inverse Fast Fourier Transform，逆快速傅里叶变换，将频域信号转换回时域
- **Radix-2**: 基-2 FFT 算法，每次将问题分解为两个子问题
- **Cooley-Tukey**: 最常用的 FFT 算法，采用分治策略
- **Butterfly_Operation**: 蝴蝶操作，FFT 的基本计算单元，包含复数加减和旋转因子乘法
- **Twiddle_Factor**: 旋转因子，FFT 中使用的复数指数 e^(-2πi·k/N)
- **Bit_Reversal**: 位反转置换，FFT 输入/输出重排序所需的索引变换
- **Bank_Conflict**: 存储体冲突，多个线程同时访问同一 Shared Memory Bank 导致的性能下降
- **Shared_Memory**: GPU 上工作组内线程共享的高速缓存
- **Workgroup**: WebGPU 中的工作组，一组协同执行的线程
- **Complex_Number**: 复数，包含实部和虚部的数值类型

## Requirements

### Requirement 1: 复数运算支持

**User Story:** As a developer, I want to perform complex number arithmetic on GPU, so that I can implement FFT algorithms efficiently.

#### Acceptance Criteria

1. THE Complex_Module SHALL represent complex numbers as vec2<f32> with x as real part and y as imaginary part
2. WHEN two complex numbers are added, THE Complex_Module SHALL return a complex number with summed real and imaginary parts
3. WHEN two complex numbers are multiplied, THE Complex_Module SHALL return the correct complex product using (a+bi)(c+di) = (ac-bd) + (ad+bc)i
4. WHEN a complex number's magnitude is requested, THE Complex_Module SHALL return sqrt(real² + imag²)
5. WHEN a twiddle factor is requested for index k and size N, THE Complex_Module SHALL return e^(-2πik/N) = cos(-2πk/N) + i·sin(-2πk/N)

### Requirement 2: 位反转置换

**User Story:** As a developer, I want efficient bit-reversal permutation on GPU, so that I can reorder FFT input/output correctly.

#### Acceptance Criteria

1. WHEN given an index and bit width, THE Bit_Reversal_Module SHALL compute the bit-reversed index correctly
2. WHEN performing bit-reversal permutation on an array, THE Bit_Reversal_Module SHALL swap elements at index i and bit_reverse(i) only once
3. THE Bit_Reversal_Module SHALL execute bit-reversal in parallel across GPU threads
4. WHEN the array size is N = 2^n, THE Bit_Reversal_Module SHALL use n bits for reversal computation

### Requirement 3: 1D FFT 核心算法

**User Story:** As a developer, I want to compute 1D FFT on GPU, so that I can transform time-domain signals to frequency domain.

#### Acceptance Criteria

1. WHEN given an input array of size N (power of 2), THE FFT_Engine SHALL compute the Discrete Fourier Transform correctly
2. THE FFT_Engine SHALL implement the Cooley-Tukey Radix-2 decimation-in-time algorithm
3. WHEN performing butterfly operations, THE FFT_Engine SHALL use Shared_Memory for intermediate results within a workgroup
4. THE FFT_Engine SHALL process log₂(N) stages of butterfly operations
5. WHEN the FFT computation completes, THE FFT_Engine SHALL produce output where X[k] = Σ(x[n] · e^(-2πink/N)) for n=0 to N-1
6. THE FFT_Engine SHALL support input sizes from 2 to at least 2^16 (65536) elements

### Requirement 4: 逆 FFT (IFFT)

**User Story:** As a developer, I want to compute inverse FFT, so that I can transform frequency-domain data back to time domain.

#### Acceptance Criteria

1. WHEN given frequency-domain data, THE IFFT_Module SHALL compute the inverse transform correctly
2. THE IFFT_Module SHALL use conjugate twiddle factors (e^(+2πik/N) instead of e^(-2πik/N))
3. WHEN IFFT completes, THE IFFT_Module SHALL divide all results by N for proper normalization
4. WHEN FFT followed by IFFT is applied to input x, THE result SHALL equal x within floating-point tolerance

### Requirement 5: Bank Conflict 优化

**User Story:** As a developer, I want to eliminate Shared Memory bank conflicts, so that FFT achieves maximum GPU performance.

#### Acceptance Criteria

1. WHEN accessing Shared_Memory, THE FFT_Engine SHALL use padding to avoid bank conflicts
2. THE FFT_Engine SHALL add padding of at least 1 element per 32 elements (or per bank width) to Shared_Memory arrays
3. WHEN butterfly operations access Shared_Memory, THE FFT_Engine SHALL ensure stride patterns avoid same-bank access by multiple threads
4. THE FFT_Engine SHALL provide a configuration option to enable/disable bank conflict optimization for benchmarking

### Requirement 6: 2D FFT

**User Story:** As a developer, I want to compute 2D FFT for image processing, so that I can perform frequency-domain operations on images.

#### Acceptance Criteria

1. WHEN given a 2D array of size M×N (both powers of 2), THE FFT_2D_Module SHALL compute the 2D Discrete Fourier Transform
2. THE FFT_2D_Module SHALL implement 2D FFT as row-wise 1D FFT followed by column-wise 1D FFT
3. WHEN processing rows, THE FFT_2D_Module SHALL execute all row FFTs in parallel
4. WHEN processing columns, THE FFT_2D_Module SHALL execute all column FFTs in parallel
5. THE FFT_2D_Module SHALL support image sizes up to at least 2048×2048 pixels

### Requirement 7: 频域滤波

**User Story:** As a user, I want to apply frequency-domain filters to images, so that I can perform low-pass and high-pass filtering.

#### Acceptance Criteria

1. WHEN a low-pass filter is applied, THE Filter_Module SHALL attenuate frequencies above the cutoff frequency
2. WHEN a high-pass filter is applied, THE Filter_Module SHALL attenuate frequencies below the cutoff frequency
3. THE Filter_Module SHALL support configurable cutoff frequency as a percentage of the maximum frequency
4. WHEN filtering is applied, THE Filter_Module SHALL perform: FFT → multiply by filter mask → IFFT
5. THE Filter_Module SHALL provide Gaussian and ideal (sharp cutoff) filter types

### Requirement 8: 实时音频频谱分析

**User Story:** As a user, I want to visualize audio frequency spectrum in real-time, so that I can analyze audio signals.

#### Acceptance Criteria

1. WHEN audio data is provided, THE Spectrum_Analyzer SHALL compute FFT and extract magnitude spectrum
2. THE Spectrum_Analyzer SHALL support common audio buffer sizes (256, 512, 1024, 2048, 4096 samples)
3. WHEN computing spectrum, THE Spectrum_Analyzer SHALL apply a window function (Hann window) to reduce spectral leakage
4. THE Spectrum_Analyzer SHALL convert magnitude to decibels using 20·log₁₀(magnitude)
5. WHEN spectrum is computed, THE Spectrum_Analyzer SHALL return frequency bins from 0 Hz to Nyquist frequency

### Requirement 9: WebGPU 资源管理

**User Story:** As a developer, I want proper GPU resource management, so that the library works reliably across different WebGPU implementations.

#### Acceptance Criteria

1. WHEN the library initializes, THE Resource_Manager SHALL request a WebGPU adapter and device
2. IF WebGPU is not available, THEN THE Resource_Manager SHALL throw a descriptive error
3. THE Resource_Manager SHALL create and manage GPU buffers for input, output, and intermediate data
4. WHEN FFT computation is requested, THE Resource_Manager SHALL handle buffer uploads and downloads efficiently
5. THE Resource_Manager SHALL provide methods to release GPU resources when no longer needed
6. THE Resource_Manager SHALL reuse buffers when possible to minimize allocation overhead

### Requirement 10: API 易用性

**User Story:** As a developer, I want a simple and intuitive API, so that I can integrate FFT functionality easily.

#### Acceptance Criteria

1. THE Library SHALL provide an async initialization function that returns a ready-to-use FFT instance
2. THE Library SHALL accept standard JavaScript typed arrays (Float32Array) as input
3. WHEN FFT is computed, THE Library SHALL return results as Float32Array with interleaved real/imaginary values
4. THE Library SHALL provide separate functions for forward FFT, inverse FFT, and 2D variants
5. THE Library SHALL include TypeScript type definitions for all public APIs
6. IF invalid input size (not power of 2) is provided, THEN THE Library SHALL throw a descriptive error
