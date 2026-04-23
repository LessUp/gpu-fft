# Testing Specification: WebGPU FFT Library

## Overview

This document defines the testing strategy, conventions, and quality gates for the WebGPU FFT Library.

## Test Categories

### 1. Property-Based Tests

Using fast-check library for mathematical property verification.

**Configuration:**
- Minimum 100 iterations per property test
- Test various sizes: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024

**Properties:**

| # | Property | Description |
|---|----------|-------------|
| 1 | FFT/IFFT Round-Trip | IFFT(FFT(x)) ≈ x |
| 2 | FFT Matches DFT | FFT output equals naive DFT for small inputs |
| 3 | Bit-Reversal Round-Trip | bit_reverse(bit_reverse(i, n), n) = i |
| 4 | Bit-Reversal Permutation | Element at i comes from bit_reverse(i, n) |
| 5 | Complex Addition | (a+bi)+(c+di) = (a+c)+(b+d)i |
| 6 | Complex Multiplication | (a+bi)(c+di) = (ac-bd)+(ad+bc)i |
| 7 | Complex Magnitude | |a+bi| = √(a²+b²) |
| 8 | Twiddle Factor | W(k,N) = e^(-2πik/N) |
| 9 | 2D FFT/IFFT Round-Trip | IFFT2D(FFT2D(x)) ≈ x |
| 10 | Low-Pass Attenuation | High frequencies attenuated by ≥90% |
| 11 | High-Pass Attenuation | Low frequencies attenuated by ≥90% |
| 12 | Non-Negative Magnitude | All spectrum magnitudes ≥ 0 |
| 13 | Hann Window | w[n] = 0.5 - 0.5·cos(2πn/(N-1)) |
| 14 | dB Conversion | dB = 20·log₁₀(magnitude) |
| 15 | Frequency Bin Count | Exactly N/2 + 1 bins |
| 16 | Interleaved Output | Output format [real, imag, real, imag, ...] |
| 17 | Invalid Size Rejection | Non-power-of-2 throws error |

### 2. Unit Tests

Specific test cases for known behaviors:
- Complex arithmetic with known values
- Bit reversal boundary cases
- FFT of known signals (constant, sinusoid, impulse)
- Error handling for invalid inputs

### 3. Integration Tests

End-to-end workflow verification:
- Complete FFT pipeline (input → FFT → IFFT → output)
- GPU buffer management
- 2D FFT for images with filter application
- Spectrum analyzer with synthetic audio

### 4. Performance Benchmarks

Located in `benchmarks/` directory:
- FFT execution time by size
- Memory usage
- Bank conflict optimization comparison

## Coverage Requirements

| Threshold | Value |
|-----------|-------|
| Line Coverage | ≥ 80% |
| Branch Coverage | ≥ 75% |
| Function Coverage | ≥ 85% |

**CI Gate:** Build fails if coverage drops below thresholds.

## Test Naming Conventions

```typescript
describe('FFTEngine', () => {
  describe('fft()', () => {
    it('should compute correct FFT for valid input', () => {});
    it('should throw FFTError for invalid input size', () => {});
    it('should produce interleaved real/imag output', () => {});
  });
});
```

## Running Tests

```bash
npm test              # All tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## Test Quality Guidelines

1. **One assertion per test** when possible
2. **Descriptive test names** that explain expected behavior
3. **Arrange-Act-Assert** pattern for test structure
4. **No shared state** between tests
5. **Deterministic** - no random failures
6. **Fast** - individual tests should complete in < 100ms
