// CPU-based FFT implementation for testing and fallback
// Uses Cooley-Tukey Radix-2 DIT algorithm
import { isPowerOf2, log2, bitReverse } from './bit-reversal';
import { FFTError, FFTErrorCode } from '../core/errors';

// Validate input and return size
export function validateFFTInput(input: Float32Array): number {
  const n = input.length / 2;
  if (!isPowerOf2(n)) {
    throw new FFTError(
      `Input size must be a power of 2, got ${n}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  if (n < 2) {
    throw new FFTError(
      `Input size must be at least 2, got ${n}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  return n;
}

// CPU FFT implementation
export function cpuFFT(input: Float32Array): Float32Array {
  const n = validateFFTInput(input);
  const bits = log2(n);
  
  // Copy input and perform bit-reversal permutation
  const data = new Float32Array(input.length);
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    data[j * 2] = input[i * 2];
    data[j * 2 + 1] = input[i * 2 + 1];
  }
  
  // Butterfly stages
  for (let stage = 0; stage < bits; stage++) {
    const span = 1 << stage;
    const butterflySize = span << 1;
    
    for (let k = 0; k < n; k += butterflySize) {
      for (let j = 0; j < span; j++) {
        const topIdx = k + j;
        const botIdx = k + j + span;
        
        // Twiddle factor: e^(-2πij/butterflySize)
        const angle = (-2 * Math.PI * j) / butterflySize;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);
        
        // Load values
        const topReal = data[topIdx * 2];
        const topImag = data[topIdx * 2 + 1];
        const botReal = data[botIdx * 2];
        const botImag = data[botIdx * 2 + 1];
        
        // W * bottom
        const wbReal = twiddleReal * botReal - twiddleImag * botImag;
        const wbImag = twiddleReal * botImag + twiddleImag * botReal;
        
        // Butterfly
        data[topIdx * 2] = topReal + wbReal;
        data[topIdx * 2 + 1] = topImag + wbImag;
        data[botIdx * 2] = topReal - wbReal;
        data[botIdx * 2 + 1] = topImag - wbImag;
      }
    }
  }
  
  return data;
}

// CPU IFFT implementation
export function cpuIFFT(input: Float32Array): Float32Array {
  const n = validateFFTInput(input);
  const bits = log2(n);
  
  // Copy input and perform bit-reversal permutation
  const data = new Float32Array(input.length);
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    data[j * 2] = input[i * 2];
    data[j * 2 + 1] = input[i * 2 + 1];
  }
  
  // Butterfly stages (with conjugate twiddle factors)
  for (let stage = 0; stage < bits; stage++) {
    const span = 1 << stage;
    const butterflySize = span << 1;
    
    for (let k = 0; k < n; k += butterflySize) {
      for (let j = 0; j < span; j++) {
        const topIdx = k + j;
        const botIdx = k + j + span;
        
        // Twiddle factor: e^(+2πij/butterflySize) (conjugate for IFFT)
        const angle = (2 * Math.PI * j) / butterflySize;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);
        
        const topReal = data[topIdx * 2];
        const topImag = data[topIdx * 2 + 1];
        const botReal = data[botIdx * 2];
        const botImag = data[botIdx * 2 + 1];
        
        const wbReal = twiddleReal * botReal - twiddleImag * botImag;
        const wbImag = twiddleReal * botImag + twiddleImag * botReal;
        
        data[topIdx * 2] = topReal + wbReal;
        data[topIdx * 2 + 1] = topImag + wbImag;
        data[botIdx * 2] = topReal - wbReal;
        data[botIdx * 2 + 1] = topImag - wbImag;
      }
    }
  }
  
  // Normalize by 1/N
  for (let i = 0; i < data.length; i++) {
    data[i] /= n;
  }
  
  return data;
}

// 2D FFT
export function cpuFFT2D(input: Float32Array, width: number, height: number): Float32Array {
  if (!isPowerOf2(width) || !isPowerOf2(height)) {
    throw new FFTError(
      `2D FFT dimensions must be powers of 2, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  
  // FFT on rows
  let data = new Float32Array(input);
  for (let row = 0; row < height; row++) {
    const rowStart = row * width * 2;
    const rowData = data.slice(rowStart, rowStart + width * 2);
    const rowResult = cpuFFT(rowData);
    data.set(rowResult, rowStart);
  }
  
  // FFT on columns
  for (let col = 0; col < width; col++) {
    const colData = new Float32Array(height * 2);
    for (let row = 0; row < height; row++) {
      colData[row * 2] = data[(row * width + col) * 2];
      colData[row * 2 + 1] = data[(row * width + col) * 2 + 1];
    }
    const colResult = cpuFFT(colData);
    for (let row = 0; row < height; row++) {
      data[(row * width + col) * 2] = colResult[row * 2];
      data[(row * width + col) * 2 + 1] = colResult[row * 2 + 1];
    }
  }
  
  return data;
}

// 2D IFFT
export function cpuIFFT2D(input: Float32Array, width: number, height: number): Float32Array {
  if (!isPowerOf2(width) || !isPowerOf2(height)) {
    throw new FFTError(
      `2D FFT dimensions must be powers of 2, got ${width}x${height}`,
      FFTErrorCode.INVALID_INPUT_SIZE
    );
  }
  
  // IFFT on rows
  let data = new Float32Array(input);
  for (let row = 0; row < height; row++) {
    const rowStart = row * width * 2;
    const rowData = data.slice(rowStart, rowStart + width * 2);
    const rowResult = cpuIFFT(rowData);
    data.set(rowResult, rowStart);
  }
  
  // IFFT on columns
  for (let col = 0; col < width; col++) {
    const colData = new Float32Array(height * 2);
    for (let row = 0; row < height; row++) {
      colData[row * 2] = data[(row * width + col) * 2];
      colData[row * 2 + 1] = data[(row * width + col) * 2 + 1];
    }
    const colResult = cpuIFFT(colData);
    for (let row = 0; row < height; row++) {
      data[(row * width + col) * 2] = colResult[row * 2];
      data[(row * width + col) * 2 + 1] = colResult[row * 2 + 1];
    }
  }
  
  return data;
}
