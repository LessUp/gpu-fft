# Architecture Overview

The WebGPU FFT Library implements a focused FFT architecture: the core transform engine targets WebGPU, while application utilities such as spectrum analysis and image filtering remain CPU-based.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Public API Layer                          │
│  createFFTEngine() | cpuFFT() / cpuRFFT()                   │
│  createSpectrumAnalyzer() | createImageFilter()             │
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
│  Bit-Reversal Shader | Butterfly Shader | Scale Shader      │
└─────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Cooley-Tukey Radix-2 DIT Algorithm

- O(N log N) complexity vs O(N²) for naive DFT
- Regular memory access patterns suitable for GPU parallelization
- Requires input size to be power of 2

### 2. Dual GPU/CPU FFT Implementation

- GPU path for maximum performance (WebGPU required)
- CPU fallback for environments without WebGPU support
- Application utilities can call the CPU path without implying GPU-native processing

### 3. Shared Memory with Bank Conflict Padding

- Optional padding can reduce bank conflicts during butterfly operations
- ~3% memory overhead for 32 banks
- Performance benefit varies by GPU architecture

## Detailed RFCs

For complete technical design, see:

- [RFC 0001: WebGPU FFT Library Architecture](https://github.com/LessUp/gpu-fft/blob/main/openspec/specs/rfc/0001-webgpu-fft-library-architecture.md)
- [RFC 0002: Project Quality Enhancement](https://github.com/LessUp/gpu-fft/blob/main/openspec/specs/rfc/0002-project-quality-enhancement-architecture.md)

## Project Structure

```
gpu-fft/
├── openspec/
│   ├── specs/              # Canonical repository specifications
│   │   ├── product/        # Product requirements
│   │   ├── rfc/            # Technical design documents
│   │   ├── api/            # API specifications
│   │   └── testing/        # Testing specifications
│   └── changes/            # Proposal / design / task artifacts
├── docs/                   # Documentation site source (VitePress)
│   ├── setup/              # Setup and tooling guides
│   ├── tutorials/          # User tutorials
│   ├── architecture/       # Architecture documentation
│   └── api/                # Curated API reference source pages
├── src/                    # Source code
│   ├── core/               # Core GPU engine
│   ├── shaders/            # Canonical WGSL source strings
│   ├── utils/              # CPU utilities
│   ├── apps/               # Application-level APIs
│   └── types.ts            # Type definitions
├── tests/                  # Test suite
├── examples/               # Code examples
│   ├── node/               # TypeScript examples
│   └── web/                # HTML/JS demos
└── benchmarks/             # Performance benchmarks
```

## Specifications as Source of Truth

All repository-level requirements are defined in `openspec/specs/`:

| Spec Type | Location | Purpose |
|-----------|----------|---------|
| Product | `openspec/specs/product/` | What to build (requirements, user stories) |
| RFC | `openspec/specs/rfc/` | How to build it (architecture, design decisions) |
| API | `openspec/specs/api/` | Interface contracts (types, methods) |
| Testing | `openspec/specs/testing/` | Verification strategy (properties, coverage) |
