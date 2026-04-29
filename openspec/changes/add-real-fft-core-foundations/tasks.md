## 1. Real-input API contracts

- [x] 1.1 Add shared real-input validation and packing helpers for 1D and 2D transforms
- [x] 1.2 Export CPU real-input APIs and GPU `FFTEngine` real-input methods with stable TypeScript signatures

## 2. Core implementation

- [x] 2.1 Implement CPU `rfft` / `irfft` and `rfft2d` / `irfft2d` with Hermitian compression and reconstruction
- [x] 2.2 Implement GPU `FFTEngine` real-input wrappers on top of the existing complex FFT path
- [x] 2.3 Replace the single-size `sizeCache` with a bounded multi-size execution-plan cache

## 3. Benchmarks and tests

- [x] 3.1 Add round-trip, shape validation, and cache reuse tests for the new real-input and plan-cache behavior
- [x] 3.2 Rewrite the benchmark script to report measured CPU results and measured WebGPU results only when available

## 4. Documentation and spec synchronization

- [x] 4.1 Update README, docs, and API reference pages for the new real-input APIs and cache behavior
- [x] 4.2 Update canonical OpenSpec API, product, and testing documents to match the implemented contracts

## 5. Final validation

- [x] 5.1 Run the canonical validation chain and fix any regressions introduced by the change
