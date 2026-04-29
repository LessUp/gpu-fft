# Product Spec: WebGPU FFT Library

## Positioning

`gpu-fft` is a JavaScript/TypeScript FFT library focused on:

- GPU-accelerated 1D and 2D FFT through WebGPU
- CPU fallback for environments without WebGPU
- contract-first real-input FFT APIs
- lightweight packaging and low maintenance overhead

The project is in a closeout / normalization stage. Product documentation must prefer accuracy, maintainability, and verifiable claims over ambitious roadmap language.

## Current Capabilities

### Complex FFT

The library SHALL provide 1D and 2D complex FFT / IFFT APIs on both GPU and CPU surfaces.

### Real-input FFT

The library SHALL provide 1D and 2D real-input FFT APIs on both GPU and CPU surfaces.

- 1D forward real-input transforms return compressed half-spectrum output
- 2D forward real-input transforms return row-major compressed output along the last dimension
- inverse real-input transforms restore real-valued outputs with the original logical size

### Plan Caching

The GPU engine SHALL retain a bounded multi-size execution-plan cache so repeated alternating transform sizes can reuse prepared GPU resources.

### CPU-only Utilities

The library SHALL provide:

- spectrum analysis utilities
- image frequency-domain filtering utilities

These utilities are CPU-only in the current product surface and must be described that way in README and docs.

### Benchmarking

The repository benchmark SHALL report measured CPU results in every environment and measured WebGPU results only when WebGPU is available during that run.

## Non-Goals for the Current Product Slice

The current product slice does not require:

- 3D FFT
- GPU-native image filtering
- WASM fallback
- benchmark pages containing static “expected performance” numbers

## Public Statement Rules

- Performance claims must be supportable by repository benchmark output
- Documentation must not claim that CPU-only utilities are GPU-accelerated
- README, docs, and canonical specs must stay aligned on API names and behavior
