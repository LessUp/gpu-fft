/**
 * 2D FFT Example
 *
 * This example demonstrates 2D FFT operations for image processing.
 *
 * Features demonstrated:
 * - Creating 2D complex data
 * - Computing 2D FFT
 * - Computing 2D IFFT
 * - Verifying round-trip accuracy
 */

import { createFFTEngine, FFTError } from '../src/index';

/**
 * Create a simple 2D pattern (checkerboard)
 */
function createCheckerboardPattern(width: number, height: number): Float32Array {
    const data = new Float32Array(width * height * 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 2;
            // Checkerboard pattern: alternating 0 and 1
            const value = ((x + y) % 2 === 0) ? 1.0 : 0.0;
            data[idx] = value;     // Real part
            data[idx + 1] = 0;     // Imaginary part
        }
    }

    return data;
}

/**
 * Create a 2D Gaussian blob
 */
function createGaussianBlob(
    width: number,
    height: number,
    sigma: number = 5
): Float32Array {
    const data = new Float32Array(width * height * 2);
    const centerX = width / 2;
    const centerY = height / 2;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            data[idx] = value;     // Real part
            data[idx + 1] = 0;     // Imaginary part
        }
    }

    return data;
}

/**
 * Compute the total energy of a 2D complex array
 */
function computeTotalEnergy(data: Float32Array): number {
    let energy = 0;
    for (let i = 0; i < data.length; i += 2) {
        const real = data[i];
        const imag = data[i + 1];
        energy += real * real + imag * imag;
    }
    return energy;
}

/**
 * Compute maximum absolute error between two arrays
 */
function computeMaxError(a: Float32Array, b: Float32Array): number {
    let maxError = 0;
    for (let i = 0; i < a.length; i++) {
        maxError = Math.max(maxError, Math.abs(a[i] - b[i]));
    }
    return maxError;
}

/**
 * Main example function
 */
async function main(): Promise<void> {
    console.log('=== WebGPU FFT Library - 2D FFT Example ===\n');

    try {
        // Create FFT engine
        console.log('Creating FFT engine...');
        const engine = await createFFTEngine();
        console.log('FFT engine created successfully!\n');

        // Test 1: Checkerboard pattern
        console.log('--- Test 1: Checkerboard Pattern ---');
        const width = 32;
        const height = 32;

        console.log(`Creating ${width}x${height} checkerboard pattern...`);
        const checkerboard = createCheckerboardPattern(width, height);
        const checkerboardEnergy = computeTotalEnergy(checkerboard);
        console.log(`Input energy: ${checkerboardEnergy.toFixed(2)}`);

        console.log('Computing 2D FFT...');
        const fftResult = await engine.fft2d(checkerboard, width, height);
        const fftEnergy = computeTotalEnergy(fftResult);
        console.log(`FFT energy: ${fftEnergy.toFixed(2)}`);

        console.log('Computing 2D IFFT...');
        const ifftResult = await engine.ifft2d(fftResult, width, height);

        const error1 = computeMaxError(checkerboard, ifftResult);
        console.log(`Round-trip max error: ${error1.toExponential(2)}`);
        console.log(error1 < 1e-5 ? '✅ Test PASSED!\n' : '⚠️ Test FAILED!\n');

        // Test 2: Gaussian blob
        console.log('--- Test 2: Gaussian Blob ---');
        const size = 64;
        const sigma = 8;

        console.log(`Creating ${size}x${size} Gaussian blob (sigma=${sigma})...`);
        const gaussian = createGaussianBlob(size, size, sigma);
        const gaussianEnergy = computeTotalEnergy(gaussian);
        console.log(`Input energy: ${gaussianEnergy.toFixed(2)}`);

        console.log('Computing 2D FFT...');
        const gaussianFFT = await engine.fft2d(gaussian, size, size);
        const gaussianFFTEnergy = computeTotalEnergy(gaussianFFT);
        console.log(`FFT energy: ${gaussianFFTEnergy.toFixed(2)}`);

        console.log('Computing 2D IFFT...');
        const gaussianIFFT = await engine.ifft2d(gaussianFFT, size, size);

        const error2 = computeMaxError(gaussian, gaussianIFFT);
        console.log(`Round-trip max error: ${error2.toExponential(2)}`);
        console.log(error2 < 1e-5 ? '✅ Test PASSED!\n' : '⚠️ Test FAILED!\n');

        // Parseval's theorem check
        console.log('--- Parseval\'s Theorem Check ---');
        console.log('(Energy should be preserved between spatial and frequency domains)');
        const energyRatio = gaussianFFTEnergy / (gaussianEnergy * size * size);
        console.log(`Energy ratio (should be ~1.0): ${energyRatio.toFixed(4)}`);
        console.log(Math.abs(energyRatio - 1.0) < 0.01 ? '✅ Parseval\'s theorem verified!\n' : '⚠️ Energy not preserved!\n');

        // Clean up
        console.log('Cleaning up resources...');
        engine.dispose();
        console.log('Done!');

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
