# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Chinese language portal with documentation overview

### Changed

- Enhanced README with improved layout
- Updated documentation standards

## [1.1.0] - 2026-04-16

### Added

#### Documentation
- **Documentation site with VitePress**:
  - English documentation (18 pages)
  - Chinese language portal
  - Modern dark theme with code syntax highlighting

### Changed

- Changelogs now follow [Keep a Changelog](https://keepachangelog.com/) format
- Improved documentation structure and accessibility

## [1.0.1] - 2026-04-16

### Changed

#### Dependencies
- **Major version upgrades** to resolve security vulnerabilities:
  - Vite: 5.0.0 → 8.0.8
  - Vitest: 1.2.0 → 4.1.4
  - ESLint: 8.56.0 → 9.32.0
  - TypeScript-ESLint: 6.0.0 → 8.38.0 (now using `typescript-eslint` package)
  - TypeScript: 5.3.0 → 5.9.3
  - Husky: 8.0.0 → 9.1.7
  - lint-staged: 15.0.0 → 16.4.0
  - fast-check: 3.15.0 → 4.6.0
  - TypeDoc: 0.25.0 → 0.28.19
  - @webgpu/types: 0.1.40 → 0.1.69
  - @vitest/coverage-v8: 1.2.0 → 4.1.4
  - Added @eslint/js: ^9.32.0

### Fixed

#### Security
- Resolved 16 npm audit vulnerabilities (7 moderate, 9 high)

#### TypeScript
- Fixed type compatibility with newer `@webgpu/types` in `gpu-resource-manager.ts`

### Removed

- `.eslintrc.json` - Replaced with ESLint 9 flat config

## [1.0.0] - 2024-01-07

### Added

#### Core Features
- **1D FFT/IFFT** - Cooley-Tukey Radix-2 DIT algorithm (2 to 65,536 elements)
- **2D FFT/IFFT** - Image processing support (up to 2048×2048 pixels)
- **GPU Acceleration** - WebGPU compute shaders
- **CPU Fallback** - Full CPU implementation without WebGPU

#### Applications
- **Frequency Domain Filtering** - Low-pass, high-pass, band-pass (Ideal & Gaussian)
- **Audio Spectrum Analyzer** - Real-time frequency analysis with windowing
- **Window Functions** - Hann, Hamming, Blackman, Flat-top, Rectangular

#### Utilities
- Complex number operations
- Bit-reversal utilities
- GPU detection (`isWebGPUAvailable`, `hasWebGPUSupport`)
- Custom error handling with `FFTError`

#### Developer Experience
- Full TypeScript support with strict mode
- Zero runtime dependencies
- ESM and CJS exports
- Comprehensive test suite (106 tests)
- Property-based testing with fast-check

### Technical Details

- **Algorithm:** Cooley-Tukey Radix-2 Decimation-In-Time
- **Shader Language:** WGSL (WebGPU Shading Language)
- **Workgroup Size:** 256 (fixed for current implementation)
- **Memory Layout:** Interleaved complex numbers

### Known Limitations

- GPU shader only supports `workgroupSize: 256`
- Spectrum analyzer uses CPU FFT internally
- Maximum 1D size: 65,536 elements
- Maximum 2D size: 2048×2048

---

[Unreleased]: https://github.com/LessUp/gpu-fft/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/LessUp/gpu-fft/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/LessUp/gpu-fft/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/LessUp/gpu-fft/releases/tag/v1.0.0
