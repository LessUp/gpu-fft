import { describe, expect, it, vi } from 'vitest';
import { FFTError, FFTErrorCode } from '../src/core/errors';
import { FFTEngine } from '../src/core/fft-engine';
import * as api from '../src/index';

type RealApiModule = typeof api & {
  cpuRFFT?: (input: Float32Array) => Float32Array;
  cpuIRFFT?: (input: Float32Array) => Float32Array;
  cpuRFFT2D?: (input: Float32Array, width: number, height: number) => Float32Array;
  cpuIRFFT2D?: (input: Float32Array, width: number, height: number) => Float32Array;
};

function createSignal(length: number): Float32Array {
  const signal = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    signal[i] = Math.sin((2 * Math.PI * i) / length) + i * 0.1;
  }
  return signal;
}

describe('real-input FFT APIs', () => {
  it('cpuRFFT returns a half-spectrum for a 1D real signal', () => {
    const { cpuRFFT } = api as RealApiModule;
    const signal = createSignal(8);

    expect(typeof cpuRFFT).toBe('function');

    const spectrum = cpuRFFT!(signal);

    expect(spectrum).toBeInstanceOf(Float32Array);
    expect(spectrum.length).toBe((signal.length / 2 + 1) * 2);
  });

  it('cpuIRFFT round-trips a 1D real signal', () => {
    const { cpuRFFT, cpuIRFFT } = api as RealApiModule;
    const signal = createSignal(16);

    expect(typeof cpuRFFT).toBe('function');
    expect(typeof cpuIRFFT).toBe('function');

    const recovered = cpuIRFFT!(cpuRFFT!(signal));

    expect(recovered.length).toBe(signal.length);
    for (let i = 0; i < signal.length; i++) {
      expect(Math.abs(recovered[i] - signal[i])).toBeLessThan(1e-4);
    }
  });

  it('cpuRFFT2D and cpuIRFFT2D round-trip a rectangular real image', () => {
    const { cpuRFFT2D, cpuIRFFT2D } = api as RealApiModule;
    const width = 8;
    const height = 4;
    const image = new Float32Array(width * height);
    for (let i = 0; i < image.length; i++) {
      image[i] = Math.cos(i / 3) + (i % width) * 0.05;
    }

    expect(typeof cpuRFFT2D).toBe('function');
    expect(typeof cpuIRFFT2D).toBe('function');

    const recovered = cpuIRFFT2D!(cpuRFFT2D!(image, width, height), width, height);

    expect(recovered.length).toBe(image.length);
    for (let i = 0; i < image.length; i++) {
      expect(Math.abs(recovered[i] - image[i])).toBeLessThan(1e-3);
    }
  });

  it('cpuIRFFT2D rejects compressed spectrum shape mismatches', () => {
    const { cpuIRFFT2D } = api as RealApiModule;

    expect(typeof cpuIRFFT2D).toBe('function');

    try {
      cpuIRFFT2D!(new Float32Array(10), 8, 4);
      expect.fail('Expected cpuIRFFT2D to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(FFTError);
      expect((error as FFTError).code).toBe(FFTErrorCode.DIMENSION_MISMATCH);
    }
  });
});

describe('FFTEngine real-input wrappers', () => {
  it('rfft packs real input into complex pairs and returns a half-spectrum', async () => {
    const fft = vi.fn(async () => new Float32Array([10, 0, 2, -3, 4, 5, 2, 3]));
    const engine = Object.assign(Object.create(FFTEngine.prototype), {
      initialized: true,
      disposed: false,
      fft,
    }) as FFTEngine & {
      rfft?: (input: Float32Array) => Promise<Float32Array>;
      fft: typeof fft;
    };

    expect(typeof engine.rfft).toBe('function');

    const signal = new Float32Array([1, 2, 3, 4]);
    const spectrum = await engine.rfft!(signal);

    expect(fft).toHaveBeenCalledWith(new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]));
    expect(spectrum).toEqual(new Float32Array([10, 0, 2, -3, 4, 5]));
  });

  it('irfft reconstructs the mirrored spectrum and returns real samples only', async () => {
    const ifft = vi.fn(async () => new Float32Array([1, 0, 2, 1e-7, 3, -1e-7, 4, 0]));
    const engine = Object.assign(Object.create(FFTEngine.prototype), {
      initialized: true,
      disposed: false,
      ifft,
    }) as FFTEngine & {
      irfft?: (input: Float32Array) => Promise<Float32Array>;
      ifft: typeof ifft;
    };

    expect(typeof engine.irfft).toBe('function');

    const spectrum = new Float32Array([10, 0, 2, -3, 4, 0]);
    const signal = await engine.irfft!(spectrum);

    expect(ifft).toHaveBeenCalledWith(new Float32Array([10, 0, 2, -3, 4, 0, 2, 3]));
    expect(signal).toEqual(new Float32Array([1, 2, 3, 4]));
  });
});
