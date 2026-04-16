# WebGPU FFT Library Examples

This directory contains example code demonstrating various use cases of the WebGPU FFT Library.

## Examples

### 1. Basic FFT (`basic-fft.ts`)

Demonstrates basic 1D FFT operations including:
- Creating an FFT engine
- Computing forward FFT
- Computing inverse FFT
- Verifying round-trip accuracy

**Run:**
```bash
npx tsx examples/basic-fft.ts
```

**Expected Output:**
```
=== WebGPU FFT Library - Basic Example ===

Creating FFT engine...
FFT engine created successfully!

Creating sinusoidal signal: size=64, frequency=4
Input signal created (128 floats = 64 complex numbers)

Computing FFT...
FFT computed successfully!
Peak frequency bin: 4 (expected: 4)
Peak magnitude: 32.00

Computing IFFT...
IFFT computed successfully!

Verifying round-trip accuracy...
Maximum round-trip error: 1.23e-14
✅ Round-trip test PASSED!

Cleaning up resources...
Done!
```

### 2. 2D FFT (`2d-fft.ts`)

Demonstrates 2D FFT for image processing:
- Creating 2D complex data
- Computing 2D FFT
- Computing 2D IFFT
- Verifying round-trip accuracy

**Run:**
```bash
npx tsx examples/2d-fft.ts
```

### 3. Spectrum Analyzer (`spectrum-analyzer.ts`)

Demonstrates audio spectrum analysis:
- Creating a spectrum analyzer
- Generating test audio signals (sine waves, chords)
- Analyzing frequency content
- Converting to dB scale
- Peak detection

**Run:**
```bash
npx tsx examples/spectrum-analyzer.ts
```

**Expected Output:**
```
=== WebGPU FFT Library - Spectrum Analyzer Example ===

Creating spectrum analyzer (FFT size: 1024, sample rate: 44100 Hz)...
Spectrum analyzer created successfully!

Frequency resolution: 42.97 Hz
Frequency range: 0 - 22050 Hz

--- Test 1: Single Frequency (440 Hz - A4 note) ---
Analyzing signal...
Detected peaks:
  1. 430.7 Hz (-6.2 dB)
  2. 861.3 Hz (-42.1 dB)
Expected: 440 Hz, Detected: 430.7 Hz, Error: 9.3 Hz
✅ Test PASSED!

--- Test 2: Multiple Frequencies (C Major Chord) ---
...
```

### 4. Image Filtering (`image-filtering.ts`)

Demonstrates frequency domain filtering:
- Creating image filters (low-pass, high-pass)
- Comparing filter shapes (ideal vs Gaussian)
- Applying filters to test images
- Visualizing filter effects

**Run:**
```bash
npx tsx examples/image-filtering.ts
```

### 5. Feature Detection (`feature-detection.ts`)

Demonstrates WebGPU feature detection:
- Checking WebGPU availability
- Getting adapter information
- Handling unsupported browsers
- Providing fallback strategies

**Run:**
```bash
npx tsx examples/feature-detection.ts
```

**Expected Output:**
```
=== WebGPU FFT Library - Feature Detection Example ===

Checking WebGPU support...

WebGPU Status: ✅ Available

Adapter Info:
  - Vendor: NVIDIA
  - Architecture: Ampere
  - Device: NVIDIA GeForce RTX 3080

Features:
  - shader-f16: ✅
  - depth-clip-control: ✅
  - texture-compression-bc: ✅

Limits:
  - maxBufferSize: 268435456
  - maxComputeWorkgroupSizeX: 1024
  - maxComputeInvocationsPerWorkgroup: 1024
```

## Running Examples

These examples are TypeScript files that can be run with `tsx`:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run an example
npx tsx examples/basic-fft.ts
```

## Environment Notes

- **Node.js**: The examples can run in Node.js, but WebGPU support varies. For GPU examples, a browser environment or WebGPU polyfill may be needed.
- **Browser**: For full WebGPU support, run in a browser with WebGPU enabled (Chrome 113+, Edge 113+, Firefox 128+).
- **CPU Fallback**: Examples using `cpuFFT` work in any Node.js environment.

## Integration with Your Project

```typescript
// ESM import
import { createFFTEngine, cpuFFT } from 'webgpu-fft';

// CommonJS require
const { createFFTEngine, cpuFFT } = require('webgpu-fft');
```
