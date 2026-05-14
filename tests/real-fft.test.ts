import { describe, expect, it, vi } from 'vitest';
import { FFTError, FFTErrorCode } from '../src/core/errors';
import * as api from '../src/index';

type RealApiModule = typeof api & {
  createRealFFTBackend?: (backend: {
    fft: (input: Float32Array) => Promise<Float32Array>;
    ifft: (input: Float32Array) => Promise<Float32Array>;
    fft2d: (input: Float32Array, width: number, height: number) => Promise<Float32Array>;
    ifft2d: (input: Float32Array, width: number, height: number) => Promise<Float32Array>;
  }) => {
    rfft: (input: Float32Array) => Promise<Float32Array>;
    irfft: (input: Float32Array) => Promise<Float32Array>;
    rfft2d: (input: Float32Array, width: number, height: number) => Promise<Float32Array>;
    irfft2d: (input: Float32Array, width: number, height: number) => Promise<Float32Array>;
  };
  cpuRFFT?: (input: Float32Array) => Float32Array;
  cpuIRFFT?: (input: Float32Array) => Float32Array;
  cpuRFFT2D?: (input: Float32Array, width: number, height: number) => Float32Array;
  cpuIRFFT2D?: (input: Float32Array, width: number, height: number) => Float32Array;
  packRealInput?: unknown;
  compressHermitianSpectrum?: unknown;
  expandHermitianSpectrum?: unknown;
  compressHermitianSpectrum2D?: unknown;
  expandHermitianSpectrum2D?: unknown;
};

function createSignal(length: number): Float32Array {
  const signal = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    signal[i] = Math.sin((2 * Math.PI * i) / length) + i * 0.1;
  }
  return signal;
}

describe('real-input FFT APIs', () => {
  it('exposes a real FFT backend factory and hides Hermitian helpers from the root API', () => {
    const realApi = api as RealApiModule;

    expect(typeof realApi.createRealFFTBackend).toBe('function');
    expect(realApi.packRealInput).toBeUndefined();
    expect(realApi.compressHermitianSpectrum).toBeUndefined();
    expect(realApi.expandHermitianSpectrum).toBeUndefined();
    expect(realApi.compressHermitianSpectrum2D).toBeUndefined();
    expect(realApi.expandHermitianSpectrum2D).toBeUndefined();
  });

  it('createRealFFTBackend upgrades a complex backend into a real-input seam', async () => {
    const realApi = api as RealApiModule;
    const fft = vi.fn(async () => new Float32Array([10, 0, 2, -3, 4, 5, 2, 3]));
    const ifft = vi.fn(async () => new Float32Array([1, 0, 2, 1e-7, 3, -1e-7, 4, 0]));
    const backend = {
      fft,
      ifft,
      fft2d: vi.fn(async () => new Float32Array(0)),
      ifft2d: vi.fn(async () => new Float32Array(0)),
    };

    expect(typeof realApi.createRealFFTBackend).toBe('function');

    const realBackend = realApi.createRealFFTBackend!(backend);
    const spectrum = await realBackend.rfft(new Float32Array([1, 2, 3, 4]));
    const recovered = await realBackend.irfft(new Float32Array([10, 0, 2, -3, 4, 0]));

    expect(spectrum).toEqual(new Float32Array([10, 0, 2, -3, 4, 5]));
    expect(recovered).toEqual(new Float32Array([1, 2, 3, 4]));
  });

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
  it('createFFTEngine returns RealFFTBackend with rfft method', async () => {
    // createFFTEngine 现在返回 RealFFTBackend，具有 rfft 方法
    const mockBackend = {
      fft: vi.fn(async (input: Float32Array) => input),
      ifft: vi.fn(async (input: Float32Array) => input),
      fft2d: vi.fn(async (input: Float32Array) => input),
      ifft2d: vi.fn(async (input: Float32Array) => input),
    };

    const realFFTBackend = api.createRealFFTBackend!(mockBackend);
    expect(typeof realFFTBackend.rfft).toBe('function');
    expect(typeof realFFTBackend.irfft).toBe('function');
    expect(typeof realFFTBackend.rfft2d).toBe('function');
    expect(typeof realFFTBackend.irfft2d).toBe('function');
  });

  it('RealFFTBackend rfft delegates to underlying backend', async () => {
    // rfft([1,2,3,4]) -> fft([1,0,2,0,3,0,4,0]) -> 8 elements (4 complex)
    // compressHermitianSpectrum: n=4, slice to (4/2+1)*2 = 6
    const mockBackend = {
      fft: vi.fn(async () => new Float32Array([10, 0, 2, 0, 4, 0, 2, 0])),
      ifft: vi.fn(async () => new Float32Array([1, 2, 3, 4])),
      fft2d: vi.fn(async () => new Float32Array(0)),
      ifft2d: vi.fn(async () => new Float32Array(0)),
    };

    const realFFTBackend = api.createRealFFTBackend!(mockBackend);
    const signal = new Float32Array([1, 2, 3, 4]);
    const spectrum = await realFFTBackend.rfft(signal);

    // rfft 应该调用底层 backend.fft（经过 packRealInput）
    expect(mockBackend.fft).toHaveBeenCalled();
    expect(spectrum.length).toBe(6); // (4/2 + 1) * 2 = 6
  });

  it('RealFFTBackend irfft delegates to underlying backend', async () => {
    const mockBackend = {
      fft: vi.fn(async () => new Float32Array([10, 0, 2, 0, 4, 0, 2, 0, 10, 0])),
      ifft: vi.fn(async () => new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])),
      fft2d: vi.fn(async () => new Float32Array(0)),
      ifft2d: vi.fn(async () => new Float32Array(0)),
    };

    const realFFTBackend = api.createRealFFTBackend!(mockBackend);
    const spectrum = new Float32Array([10, 0, 2, -3, 4, 0]);
    const signal = await realFFTBackend.irfft(spectrum);

    // irfft 应该调用底层 backend.ifft（经过 expandHermitianSpectrum）
    expect(mockBackend.ifft).toHaveBeenCalled();
    expect(signal.length).toBe(4);
  });
});
