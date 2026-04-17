# Architecture Overview

The WebGPU FFT Library implements a multi-layer architecture for GPU-accelerated FFT computation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Public API Layer                          │
│  createFFTEngine() | createSpectrumAnalyzer()               │
│  cpuFFT() | cpuIFFT() | createImageFilter()                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core FFT Engine                           │
│  FFTEngine | GPUResourceManager | Compute Pipelines        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  GPU Compute Layer (WGSL)                    │
│  Bit-Reversal Shader | Butterfly Shader | Filter Shader     │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Cooley-Tukey Radix-2 DIT Algorithm

- O(N log N) complexity vs O(N²) for naive DFT
- Regular memory access patterns suitable for GPU parallelization
- Requires input size to be power of 2

### 2. Dual GPU/CPU Implementation

- GPU path for maximum performance (WebGPU required)
- CPU fallback for environments without WebGPU support
- CPU implementation is significantly slower for large FFT sizes

### 3. Shared Memory with Bank Conflict Padding

- Padding eliminates bank conflicts during butterfly operations
- ~3% memory overhead for 32 banks
- Performance benefit varies by GPU architecture

## Detailed RFCs

For complete technical design, see:

- [RFC 0001: WebGPU FFT Library Architecture](/specs/rfc/0001-webgpu-fft-library-architecture)
- [RFC 0002: Project Quality Enhancement](/specs/rfc/0002-project-quality-enhancement-architecture)

## Project Structure

```
gpu-fft/
├── specs/                  # Specification documents (SSOT)
│   ├── product/            # Product requirements
│   ├── rfc/                # Technical design documents
│   ├── api/                # API specifications
│   ├── db/                 # Database schemas (N/A)
│   └── testing/            # Testing specifications
├── docs/                   # Documentation site (VitePress)
│   ├── setup/              # Environment setup guides
│   ├── tutorials/          # User tutorials
│   ├── architecture/       # Architecture documentation
│   ├── assets/             # Static assets
│   ├── api/                # Generated API documentation
│   └── examples/           # Usage examples
├── src/                    # Source code
│   ├── core/               # Core GPU engine
│   ├── shaders/            # WGSL shader sources
│   ├── utils/              # CPU utilities
│   ├── apps/               # Application-level APIs
│   └── types.ts            # Type definitions
├── tests/                  # Test suite
├── examples/             # Code examples
│   ├── node/             # TypeScript examples
│   └── web/              # HTML/JS demos
└── benchmarks/             # Performance benchmarks
```

## Specifications as Source of Truth

All implementation details are defined in `/specs/`:

| Spec Type | Location | Purpose |
|-----------|----------|---------|
| Product | `/specs/product/` | What to build (requirements, user stories) |
| RFC | `/specs/rfc/` | How to build it (architecture, design decisions) |
| API | `/specs/api/` | Interface contracts (types, methods) |
| Testing | `/specs/testing/` | Verification strategy (properties, coverage) |
