/**
 * Basic FFT Example
 *
 * This example demonstrates basic 1D FFT operations using the WebGPU FFT Library.
 *
 * Features demonstrated:
 * - Creating an FFT engine
 * - Computing forward FFT
 * - Computing inverse FFT
 * - Verifying round-trip accuracy
 */

import { createFFTEngine, FFTError } from '../src/index';

/**
 * Helper function to create a simple sinusoidal signal
 */
function createSinusoidalSignal(size: number, frequency: number): Float32Array {
  const data = new Float32Array(size * 2); // Complex: [real, imag, real, imag, ...]

  for (let i = 0; i < size; i++) {
    const t = i / size;
    data[i * 2] = Math.sin(2 * Math.PI * frequency * t); // Real part
    data[i * 2 + 1] = 0; // Imaginary part (zero for real signal)
  }

  return data;
}

/**
 * Helper function to compute the magnitude of complex numbers
 */
function computeMagnitudes(data: Float32Array): Float32Array {
  const size = data.length / 2;
  const magnitudes = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    const real = data[i * 2];
    const imag = data[i * 2 + 1];
    magnitudes[i] = Math.sqrt(real * real + imag * imag);
  }

  return magnitudes;
}

/**
 * Helper function to find the peak frequency bin
 */
function findPeakBin(magnitudes: Float32Array): number {
  let maxMag = 0;
  let peakBin = 0;

  // Only look at first half (positive frequencies)
  const halfSize = magnitudes.length / 2;
  for (let i = 1; i < halfSize; i++) {
    if (magnitudes[i] > maxMag) {
      maxMag = magnitudes[i];
      peakBin = i;
    }
  }

  return peakBin;
}

/**
 * Main example function
 */
async function main(): Promise<void> {
  console.log('=== WebGPU FFT Library - Basic Example ===\n');

  try {
    // Step 1: Create FFT engine
    console.log('Creating FFT engine...');
    const engine = await createFFTEngine({
      enableBankConflictOptimization: true,
      workgroupSize: 256,
    });
    console.log('FFT engine created successfully!\n');

    // Step 2: Create a test signal (sinusoid at frequency 4)
    const size = 64;
    const signalFrequency = 4; // 4 cycles in the signal
    console.log(`Creating sinusoidal signal: size=${size}, frequency=${signalFrequency}`);
    const input = createSinusoidalSignal(size, signalFrequency);
    console.log(`Input signal created (${input.length} floats = ${size} complex numbers)\n`);

    // Step 3: Compute FFT
    console.log('Computing FFT...');
    const fftResult = await engine.fft(input);
    console.log('FFT computed successfully!');

    // Analyze the FFT result
    const magnitudes = computeMagnitudes(fftResult);
    const peakBin = findPeakBin(magnitudes);
    console.log(`Peak frequency bin: ${peakBin} (expected: ${signalFrequency})`);
    console.log(`Peak magnitude: ${magnitudes[peakBin].toFixed(2)}\n`);

    // Step 4: Compute IFFT
    console.log('Computing IFFT...');
    const ifftResult = await engine.ifft(fftResult);
    console.log('IFFT computed successfully!\n');

    // Step 5: Verify round-trip accuracy
    console.log('Verifying round-trip accuracy...');
    let maxError = 0;
    for (let i = 0; i < input.length; i++) {
      const error = Math.abs(input[i] - ifftResult[i]);
      maxError = Math.max(maxError, error);
    }
    console.log(`Maximum round-trip error: ${maxError.toExponential(2)}`);

    if (maxError < 1e-5) {
      console.log('✅ Round-trip test PASSED!\n');
    } else {
      console.log('⚠️ Round-trip error is higher than expected\n');
    }

    // Step 6: Clean up
    console.log('Cleaning up resources...');
    engine.dispose();
    console.log('Done!\n');

    // Print summary
    console.log('=== Summary ===');
    console.log(`- FFT size: ${size}`);
    console.log(`- Input frequency: ${signalFrequency} cycles`);
    console.log(`- Detected peak bin: ${peakBin}`);
    console.log(`- Round-trip error: ${maxError.toExponential(2)}`);
  } catch (error) {
    if (error instanceof FFTError) {
      console.error(`FFT Error [${error.code}]: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Run the example
main();
