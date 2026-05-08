import type { FFTBackend, RealFFTBackend } from './backend';
import {
  packRealInput,
  extractRealSignal,
  compressHermitianSpectrum,
  expandHermitianSpectrum,
  compressHermitianSpectrum2D,
  expandHermitianSpectrum2D,
} from './real-fft-transform';
import {
  validateRealFFTInput,
  validateRealIFFTInput,
  validateRealFFT2DInput,
  validateRealIFFT2DInput,
} from './validation';

function mapResult<T, R>(value: T | Promise<T>, mapper: (resolved: T) => R): R | Promise<R> {
  if (value instanceof Promise) {
    return value.then(mapper);
  }

  return mapper(value);
}

export function createRealFFTBackend(backend: FFTBackend): RealFFTBackend {
  const realFFTBackend: RealFFTBackend = {
    fft: backend.fft.bind(backend),
    ifft: backend.ifft.bind(backend),
    fft2d: backend.fft2d.bind(backend),
    ifft2d: backend.ifft2d.bind(backend),
    rfft(input) {
      validateRealFFTInput(input);
      return mapResult(backend.fft(packRealInput(input)), compressHermitianSpectrum);
    },
    irfft(input) {
      validateRealIFFTInput(input);
      return mapResult(backend.ifft(expandHermitianSpectrum(input)), extractRealSignal);
    },
    rfft2d(input, width, height) {
      validateRealFFT2DInput(input, width, height);
      return mapResult(backend.fft2d(packRealInput(input), width, height), (spectrum) =>
        compressHermitianSpectrum2D(spectrum, width, height)
      );
    },
    irfft2d(input, width, height) {
      validateRealIFFT2DInput(input, width, height);
      return mapResult(
        backend.ifft2d(expandHermitianSpectrum2D(input, width, height), width, height),
        extractRealSignal
      );
    },
  };

  if (backend.dispose) {
    realFFTBackend.dispose = backend.dispose.bind(backend);
  }

  return realFFTBackend;
}
