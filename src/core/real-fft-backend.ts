/**
 * 实输入 FFT 后端
 * @module webgpu-fft/real-fft-backend
 *
 * 封装实信号与复频谱之间的转换逻辑（基于 Hermitian 对称性）。
 */

import type { FFTBackend, RealFFTBackend } from './backend';
import {
  packRealInput,
  extractRealSignal,
  compressHermitianSpectrum,
  expandHermitianSpectrum,
  compressHermitianSpectrum2D,
  expandHermitianSpectrum2D,
} from './hermitian';
import {
  validateRealFFTInput,
  validateRealIFFTInput,
  validateRealFFT2DInput,
  validateRealIFFT2DInput,
} from './validation';

// ============================================================================
// RealFFTBackend 工厂
// ============================================================================

export function createRealFFTBackend(backend: FFTBackend): RealFFTBackend {
  const realFFTBackend: RealFFTBackend = {
    fft: backend.fft.bind(backend),
    ifft: backend.ifft.bind(backend),
    fft2d: backend.fft2d.bind(backend),
    ifft2d: backend.ifft2d.bind(backend),
    async rfft(input) {
      validateRealFFTInput(input);
      const spectrum = await backend.fft(packRealInput(input));
      return compressHermitianSpectrum(spectrum);
    },
    async irfft(input) {
      validateRealIFFTInput(input);
      const signal = await backend.ifft(expandHermitianSpectrum(input));
      return extractRealSignal(signal);
    },
    async rfft2d(input, width, height) {
      validateRealFFT2DInput(input, width, height);
      const spectrum = await backend.fft2d(packRealInput(input), width, height);
      return compressHermitianSpectrum2D(spectrum, width, height);
    },
    async irfft2d(input, width, height) {
      validateRealIFFT2DInput(input, width, height);
      const signal = await backend.ifft2d(
        expandHermitianSpectrum2D(input, width, height),
        width,
        height
      );
      return extractRealSignal(signal);
    },
  };

  if (backend.dispose) {
    realFFTBackend.dispose = backend.dispose.bind(backend);
  }

  return realFFTBackend;
}
