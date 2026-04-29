# Testing Specification: WebGPU FFT Library

## Overview

The test suite must verify mathematical correctness, API contract validation, cache lifecycle behavior, and benchmark output alignment.

## Required Coverage Areas

### Complex FFT correctness

- 1D FFT / IFFT round-trip
- 2D FFT / IFFT round-trip
- known-signal behavior
- invalid input rejection

### Real-input FFT correctness

- `cpuRFFT()` returns a compressed half-spectrum of the expected size
- `cpuIRFFT(cpuRFFT(x))` matches the original real signal within floating-point tolerance
- `cpuIRFFT2D(cpuRFFT2D(x))` matches the original real-valued 2D input within floating-point tolerance
- GPU `rfft()` / `irfft()` and `rfft2d()` / `irfft2d()` preserve the same public contract
- invalid real-input lengths and invalid compressed-spectrum shapes throw descriptive `FFTError`s

### Plan cache behavior

- alternating supported transform sizes can reuse cached plans
- cache growth remains bounded
- `dispose()` releases all retained cached plan resources

### Benchmark output behavior

- CPU-only benchmark runs state that WebGPU measurements were not collected
- benchmark output does not contain speculative or static “expected performance” sections
- WebGPU benchmark runs report measured WebGPU results only when available

## Validation Chain

Canonical repository validation:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test
```

## Test Quality Rules

- Use descriptive behavior-based test names
- Prefer round-trip and contract assertions over implementation-detail assertions
- Keep tests deterministic
- Add regression tests for every new public API or behavior change
