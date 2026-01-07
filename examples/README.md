# WebGPU FFT Library Examples

This directory contains example code demonstrating various use cases of the WebGPU FFT Library.

## Examples

### 1. Basic FFT (`basic-fft.ts`)

Demonstrates basic 1D FFT operations including:
- Creating an FFT engine
- Computing forward FFT
- Computing inverse FFT
- Verifying round-trip accuracy

### 2. 2D FFT (`2d-fft.ts`)

Demonstrates 2D FFT for image processing:
- Creating 2D complex data
- Computing 2D FFT
- Computing 2D IFFT
- Verifying round-trip accuracy

### 3. Spectrum Analyzer (`spectrum-analyzer.ts`)

Demonstrates audio spectrum analysis:
- Creating a spectrum analyzer
- Generating test audio signals
- Analyzing frequency content
- Converting to dB scale

### 4. Image Filtering (`image-filtering.ts`)

Demonstrates frequency domain filtering:
- Creating image filters
- Applying low-pass filters
- Applying high-pass filters
- Comparing filter shapes (ideal vs Gaussian)

### 5. Feature Detection (`feature-detection.ts`)

Demonstrates WebGPU feature detection:
- Checking WebGPU availability
- Getting adapter information
- Handling unsupported browsers

## Running Examples

These examples are TypeScript files that can be run with `tsx` or compiled with `tsc`.

```bash
# Install tsx if not already installed
npm install -g tsx

# Run an example
npx tsx examples/basic-fft.ts
```

## Note

These examples require a WebGPU-capable environment. In Node.js, you may need to use a WebGPU polyfill or run in a browser environment.
