/**
 * Image Filtering Example
 *
 * This example demonstrates frequency domain filtering using the WebGPU FFT Library.
 *
 * Features demonstrated:
 * - Creating image filters
 * - Applying low-pass filters
 * - Applying high-pass filters
 * - Comparing filter shapes (ideal vs Gaussian)
 */

import { createImageFilter, FFTError } from '../src/index';

/**
 * Create a test image with sharp edges (good for demonstrating filtering)
 */
function createTestImage(width: number, height: number): Float32Array {
    const data = new Float32Array(width * height * 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 2;

            // Create a pattern with sharp edges
            let value = 0;

            // Add a rectangle in the center
            if (x >= width / 4 && x < 3 * width / 4 &&
                y >= height / 4 && y < 3 * height / 4) {
                value = 1.0;
            }

            // Add some diagonal lines
            if ((x + y) % 16 < 2) {
                value = 0.5;
            }

            data[idx] = value;     // Real part
            data[idx + 1] = 0;     // Imaginary part
        }
    }

    return data;
}

/**
 * Compute statistics of an image
 */
function computeImageStats(data: Float32Array): {
    min: number;
    max: number;
    mean: number;
    variance: number;
} {
    const size = data.length / 2;
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (let i = 0; i < size; i++) {
        const value = data[i * 2]; // Real part only
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
    }

    const mean = sum / size;

    let variance = 0;
    for (let i = 0; i < size; i++) {
        const diff = data[i * 2] - mean;
        variance += diff * diff;
    }
    variance /= size;

    return { min, max, mean, variance };
}

/**
 * Compute the difference between two images
 */
function computeDifference(a: Float32Array, b: Float32Array): {
    maxDiff: number;
    meanDiff: number;
} {
    const size = a.length / 2;
    let maxDiff = 0;
    let sumDiff = 0;

    for (let i = 0; i < size; i++) {
        const diff = Math.abs(a[i * 2] - b[i * 2]);
        maxDiff = Math.max(maxDiff, diff);
        sumDiff += diff;
    }

    return {
        maxDiff,
        meanDiff: sumDiff / size,
    };
}

/**
 * Main example function
 */
async function main(): Promise<void> {
    console.log('=== WebGPU FFT Library - Image Filtering Example ===\n');

    try {
        const width = 64;
        const height = 64;

        // Create test image
        console.log(`Creating ${width}x${height} test image...`);
        const originalImage = createTestImage(width, height);
        const originalStats = computeImageStats(originalImage);
        console.log(`Original image stats:`);
        console.log(`  Min: ${originalStats.min.toFixed(3)}, Max: ${originalStats.max.toFixed(3)}`);
        console.log(`  Mean: ${originalStats.mean.toFixed(3)}, Variance: ${originalStats.variance.toFixed(3)}\n`);

        // Test 1: Ideal Low-Pass Filter
        console.log('--- Test 1: Ideal Low-Pass Filter ---');
        const idealLowPass = await createImageFilter({
            type: 'lowpass',
            shape: 'ideal',
            cutoffFrequency: 0.2,
        });

        console.log('Applying filter (cutoff: 0.2)...');
        const idealLowPassResult = await idealLowPass.apply(originalImage, width, height);
        const idealLowPassStats = computeImageStats(idealLowPassResult);
        console.log(`Filtered image stats:`);
        console.log(`  Min: ${idealLowPassStats.min.toFixed(3)}, Max: ${idealLowPassStats.max.toFixed(3)}`);
        console.log(`  Mean: ${idealLowPassStats.mean.toFixed(3)}, Variance: ${idealLowPassStats.variance.toFixed(3)}`);

        const idealLowPassDiff = computeDifference(originalImage, idealLowPassResult);
        console.log(`Difference from original: max=${idealLowPassDiff.maxDiff.toFixed(3)}, mean=${idealLowPassDiff.meanDiff.toFixed(3)}`);
        console.log('✅ Low-pass filter reduces high-frequency content (variance should decrease)\n');

        idealLowPass.dispose();

        // Test 2: Gaussian Low-Pass Filter
        console.log('--- Test 2: Gaussian Low-Pass Filter ---');
        const gaussianLowPass = await createImageFilter({
            type: 'lowpass',
            shape: 'gaussian',
            cutoffFrequency: 0.2,
        });

        console.log('Applying filter (cutoff: 0.2)...');
        const gaussianLowPassResult = await gaussianLowPass.apply(originalImage, width, height);
        const gaussianLowPassStats = computeImageStats(gaussianLowPassResult);
        console.log(`Filtered image stats:`);
        console.log(`  Min: ${gaussianLowPassStats.min.toFixed(3)}, Max: ${gaussianLowPassStats.max.toFixed(3)}`);
        console.log(`  Mean: ${gaussianLowPassStats.mean.toFixed(3)}, Variance: ${gaussianLowPassStats.variance.toFixed(3)}`);

        const gaussianLowPassDiff = computeDifference(originalImage, gaussianLowPassResult);
        console.log(`Difference from original: max=${gaussianLowPassDiff.maxDiff.toFixed(3)}, mean=${gaussianLowPassDiff.meanDiff.toFixed(3)}`);
        console.log('✅ Gaussian filter provides smoother rolloff than ideal filter\n');

        gaussianLowPass.dispose();

        // Test 3: Ideal High-Pass Filter
        console.log('--- Test 3: Ideal High-Pass Filter ---');
        const idealHighPass = await createImageFilter({
            type: 'highpass',
            shape: 'ideal',
            cutoffFrequency: 0.1,
        });

        console.log('Applying filter (cutoff: 0.1)...');
        const idealHighPassResult = await idealHighPass.apply(originalImage, width, height);
        const idealHighPassStats = computeImageStats(idealHighPassResult);
        console.log(`Filtered image stats:`);
        console.log(`  Min: ${idealHighPassStats.min.toFixed(3)}, Max: ${idealHighPassStats.max.toFixed(3)}`);
        console.log(`  Mean: ${idealHighPassStats.mean.toFixed(3)}, Variance: ${idealHighPassStats.variance.toFixed(3)}`);

        console.log('✅ High-pass filter extracts edges (mean should be near zero)\n');

        idealHighPass.dispose();

        // Test 4: Gaussian High-Pass Filter
        console.log('--- Test 4: Gaussian High-Pass Filter ---');
        const gaussianHighPass = await createImageFilter({
            type: 'highpass',
            shape: 'gaussian',
            cutoffFrequency: 0.1,
        });

        console.log('Applying filter (cutoff: 0.1)...');
        const gaussianHighPassResult = await gaussianHighPass.apply(originalImage, width, height);
        const gaussianHighPassStats = computeImageStats(gaussianHighPassResult);
        console.log(`Filtered image stats:`);
        console.log(`  Min: ${gaussianHighPassStats.min.toFixed(3)}, Max: ${gaussianHighPassStats.max.toFixed(3)}`);
        console.log(`  Mean: ${gaussianHighPassStats.mean.toFixed(3)}, Variance: ${gaussianHighPassStats.variance.toFixed(3)}`);

        console.log('✅ Gaussian high-pass provides smoother edge detection\n');

        gaussianHighPass.dispose();

        // Summary
        console.log('=== Summary ===');
        console.log('Filter Type          | Variance Change | Effect');
        console.log('---------------------|-----------------|------------------');
        console.log(`Ideal Low-Pass       | ${(idealLowPassStats.variance / originalStats.variance * 100).toFixed(1)}%          | Blur/Smooth`);
        console.log(`Gaussian Low-Pass    | ${(gaussianLowPassStats.variance / originalStats.variance * 100).toFixed(1)}%          | Smooth Blur`);
        console.log(`Ideal High-Pass      | ${(idealHighPassStats.variance / originalStats.variance * 100).toFixed(1)}%          | Edge Detection`);
        console.log(`Gaussian High-Pass   | ${(gaussianHighPassStats.variance / originalStats.variance * 100).toFixed(1)}%          | Smooth Edges`);

        console.log('\nDone!');

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
