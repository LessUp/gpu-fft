# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Project quality enhancement documentation
- LICENSE file with MIT license
- CONTRIBUTING.md with contribution guidelines
- CODE_OF_CONDUCT.md with community standards
- SECURITY.md with security policy
- ESLint and Prettier configuration
- GitHub Actions CI/CD workflows
- API documentation generation with TypeDoc
- Interactive demo applications
- Performance benchmarks
- Example code collection

### Changed
- Enhanced README with badges, quick start, and troubleshooting sections
- Improved package.json with complete metadata

## [1.0.0] - 2024-01-07

### Added
- Initial release of WebGPU FFT Library
- 1D FFT/IFFT implementation using Cooley-Tukey Radix-2 algorithm
- 2D FFT/IFFT for image processing
- Bank conflict optimization for GPU shared memory
- Efficient bit-reversal permutation
- Frequency domain filtering (low-pass, high-pass)
  - Ideal (sharp cutoff) filter
  - Gaussian filter
- Real-time audio spectrum analyzer
  - Hann window function
  - dB conversion
  - Configurable FFT sizes (256, 512, 1024, 2048, 4096)
- WebGPU resource management
  - Automatic adapter/device initialization
  - Buffer management
  - Pipeline caching
- TypeScript type definitions
- Comprehensive test suite
  - Unit tests with Vitest
  - Property-based tests with fast-check
- Complete specification documents
  - Requirements document
  - Design document
  - Implementation tasks

### Technical Details
- Supports FFT sizes from 2 to 65536 elements
- Supports 2D FFT up to 2048×2048 pixels
- Uses WGSL compute shaders for GPU acceleration
- Implements bank conflict padding for optimal memory access

[Unreleased]: https://github.com/user/webgpu-fft/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/webgpu-fft/releases/tag/v1.0.0
