# Changelog

All notable changes to this project are documented here.

::: tip Quick Links
- [Full Changelog on GitHub](https://github.com/LessUp/gpu-fft/blob/main/CHANGELOG.md)
- [CHANGELOG.md](/CHANGELOG.md) - Complete version history
:::

## [1.1.0] - 2026-04-16

### 🎉 New Features

- **Complete Documentation Overhaul**: New VitePress documentation site
- **Bilingual Support**: English and Chinese documentation
- **Modern Design**: Responsive layout with dark/light mode
- **Local Search**: Full-text search across all documentation

## [1.0.1] - 2026-04-16

### 🔒 Security

- Resolved 16 npm audit vulnerabilities
- Updated all dependencies to latest stable versions

### Changed

- Vite: 5.0.0 → 8.0.8
- Vitest: 1.2.0 → 4.1.4
- TypeScript: 5.3.0 → 5.9.3
- ESLint: 8.56.0 → 9.32.0 (migrated to flat config)

## [1.0.0] - 2024-01-07

### ✨ Initial Release

- **1D FFT/IFFT**: Support for 2-65,536 elements
- **2D FFT/IFFT**: Up to 2048×2048 pixels
- **GPU Acceleration**: WebGPU compute shaders
- **CPU Fallback**: Full implementation without WebGPU
- **Spectrum Analyzer**: Audio frequency analysis
- **Image Filter**: Frequency domain filtering
- **Window Functions**: Hann, Hamming, Blackman, Flat-top

---

For detailed changelogs of each version, see the [CHANGELOG.md](/CHANGELOG.md).
