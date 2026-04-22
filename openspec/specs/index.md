# Specifications

The `/specs` directory contains all specification documents that serve as the single source of truth for the WebGPU FFT Library.

## Directory Structure

```
specs/
├── product/           # Product requirements (PRDs)
├── rfc/               # Technical design documents (RFCs)
├── api/               # API specifications
├── db/                # Database schemas (N/A for this library)
└── testing/           # Testing specifications
```

## Available Specifications

### Product Requirements

- [WebGPU FFT Library](/specs/product/webgpu-fft-library) - Core product features and acceptance criteria

### RFCs (Technical Design)

- [RFC 0001: WebGPU FFT Library Architecture](/specs/rfc/0001-webgpu-fft-library-architecture) - Core architecture and design decisions
- [RFC 0002: Project Quality Enhancement](/specs/rfc/0002-project-quality-enhancement-architecture) - Open-source best practices

### API Specifications

- [Public API](/specs/api/public-api) - Complete API reference with types and examples

### Testing

- [Testing Strategy](/specs/testing/testing-strategy) - Test conventions, property-based testing, and coverage requirements

## How to Use Specifications

These documents follow the **Spec-Driven Development (SDD)** paradigm:

1. **Product specs** define what to build (requirements and user stories)
2. **RFCs** define how to build it (architecture and design decisions)
3. **API specs** define the interface contract
4. **Testing specs** define how to verify correctness

When contributing to this project, always reference the relevant spec document first.
