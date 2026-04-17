/**
 * Spectrum Analyzer Example
 *
 * This example demonstrates audio spectrum analysis using the WebGPU FFT Library.
 *
 * Features demonstrated:
 * - Creating a spectrum analyzer
 * - Generating test audio signals
 * - Analyzing frequency content
 * - Converting to dB scale
 */

import { createSpectrumAnalyzer, FFTError } from '../src/index';

/**
 * Generate a pure sine wave
 */
function generateSineWave(
  sampleRate: number,
  frequency: number,
  duration: number,
  amplitude: number = 1.0
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
  }

  return samples;
}

/**
 * Generate a signal with multiple frequencies
 */
function generateMultiFrequencySignal(
  sampleRate: number,
  frequencies: number[],
  amplitudes: number[],
  duration: number
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let value = 0;
    for (let j = 0; j < frequencies.length; j++) {
      value += amplitudes[j] * Math.sin(2 * Math.PI * frequencies[j] * t);
    }
    samples[i] = value;
  }

  return samples;
}

/**
 * Find peaks in the spectrum
 */
function findPeaks(
  spectrum: Float32Array,
  frequencies: Float32Array,
  threshold: number = -40
): Array<{ frequency: number; magnitude: number }> {
  const peaks: Array<{ frequency: number; magnitude: number }> = [];

  for (let i = 1; i < spectrum.length - 1; i++) {
    // Check if this is a local maximum above threshold
    if (spectrum[i] > threshold && spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
      peaks.push({
        frequency: frequencies[i],
        magnitude: spectrum[i],
      });
    }
  }

  // Sort by magnitude (descending)
  peaks.sort((a, b) => b.magnitude - a.magnitude);

  return peaks;
}

/**
 * Main example function
 */
async function main(): Promise<void> {
  console.log('=== WebGPU FFT Library - Spectrum Analyzer Example ===\n');

  try {
    const sampleRate = 44100;
    const fftSize = 1024;

    // Create spectrum analyzer
    console.log(
      `Creating spectrum analyzer (FFT size: ${fftSize}, sample rate: ${sampleRate} Hz)...`
    );
    const analyzer = await createSpectrumAnalyzer({
      fftSize: fftSize as 256 | 512 | 1024 | 2048 | 4096,
      sampleRate,
    });
    console.log('Spectrum analyzer created successfully!\n');

    // Get frequency bins
    const frequencies = analyzer.getFrequencies();
    console.log(`Frequency resolution: ${(sampleRate / fftSize).toFixed(2)} Hz`);
    console.log(`Frequency range: 0 - ${frequencies[frequencies.length - 1].toFixed(0)} Hz\n`);

    // Test 1: Single frequency
    console.log('--- Test 1: Single Frequency (440 Hz - A4 note) ---');
    const testFreq1 = 440;
    const signal1 = generateSineWave(sampleRate, testFreq1, fftSize / sampleRate);

    console.log('Analyzing signal...');
    const spectrum1 = await analyzer.analyze(signal1);

    const peaks1 = findPeaks(spectrum1, frequencies, -30);
    console.log(`Detected peaks:`);
    peaks1.slice(0, 3).forEach((peak, i) => {
      console.log(`  ${i + 1}. ${peak.frequency.toFixed(1)} Hz (${peak.magnitude.toFixed(1)} dB)`);
    });

    const detectedFreq1 = peaks1[0]?.frequency || 0;
    const freqError1 = Math.abs(detectedFreq1 - testFreq1);
    console.log(
      `Expected: ${testFreq1} Hz, Detected: ${detectedFreq1.toFixed(1)} Hz, Error: ${freqError1.toFixed(1)} Hz`
    );
    console.log(freqError1 < sampleRate / fftSize ? '✅ Test PASSED!\n' : '⚠️ Test FAILED!\n');

    // Test 2: Multiple frequencies (chord)
    console.log('--- Test 2: Multiple Frequencies (C Major Chord) ---');
    const chordFreqs = [261.63, 329.63, 392.0]; // C4, E4, G4
    const chordAmps = [1.0, 0.8, 0.6];
    const signal2 = generateMultiFrequencySignal(
      sampleRate,
      chordFreqs,
      chordAmps,
      fftSize / sampleRate
    );

    console.log('Analyzing signal...');
    const spectrum2 = await analyzer.analyze(signal2);

    const peaks2 = findPeaks(spectrum2, frequencies, -30);
    console.log(`Detected peaks:`);
    peaks2.slice(0, 5).forEach((peak, i) => {
      console.log(`  ${i + 1}. ${peak.frequency.toFixed(1)} Hz (${peak.magnitude.toFixed(1)} dB)`);
    });

    console.log(`Expected frequencies: ${chordFreqs.map((f) => f.toFixed(1)).join(', ')} Hz`);

    // Check if all expected frequencies are detected
    let allFound = true;
    for (const expectedFreq of chordFreqs) {
      const found = peaks2.some(
        (p) => Math.abs(p.frequency - expectedFreq) < (sampleRate / fftSize) * 2
      );
      if (!found) {
        console.log(`⚠️ Frequency ${expectedFreq} Hz not detected`);
        allFound = false;
      }
    }
    console.log(allFound ? '✅ All frequencies detected!\n' : '⚠️ Some frequencies missing!\n');

    // Test 3: Silence (noise floor)
    console.log('--- Test 3: Silence (Noise Floor) ---');
    const silence = new Float32Array(fftSize);
    const spectrum3 = await analyzer.analyze(silence);

    const maxSilence = Math.max(...spectrum3);
    console.log(`Maximum level in silence: ${maxSilence.toFixed(1)} dB`);
    console.log(maxSilence < -80 ? '✅ Noise floor is low!\n' : '⚠️ Noise floor is high!\n');

    // Clean up
    console.log('Cleaning up resources...');
    analyzer.dispose();
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
