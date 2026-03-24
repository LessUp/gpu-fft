// CPU-side complex number operations for testing and validation
import type { Complex } from '../types';

const PI = Math.PI;

// Complex addition: (a + bi) + (c + di) = (a+c) + (b+d)i
export function complexAdd(a: Complex, b: Complex): Complex {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}

// Complex subtraction: (a + bi) - (c + di) = (a-c) + (b-d)i
export function complexSub(a: Complex, b: Complex): Complex {
  return { real: a.real - b.real, imag: a.imag - b.imag };
}

// Complex multiplication: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
export function complexMul(a: Complex, b: Complex): Complex {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}

// Complex magnitude: |a + bi| = sqrt(a² + b²)
export function complexMagnitude(c: Complex): number {
  return Math.sqrt(c.real * c.real + c.imag * c.imag);
}

// Complex conjugate: conj(a + bi) = a - bi
export function complexConj(c: Complex): Complex {
  return { real: c.real, imag: -c.imag };
}

// Twiddle factor for FFT: e^(-2πik/N) = cos(-2πk/N) + i·sin(-2πk/N)
export function twiddleFactor(k: number, N: number): Complex {
  const angle = (-2 * PI * k) / N;
  return { real: Math.cos(angle), imag: Math.sin(angle) };
}

// Twiddle factor for IFFT: e^(+2πik/N) = cos(2πk/N) + i·sin(2πk/N)
export function twiddleFactorInverse(k: number, N: number): Complex {
  const angle = (2 * PI * k) / N;
  return { real: Math.cos(angle), imag: Math.sin(angle) };
}

// Scale complex number by real scalar
export function complexScale(c: Complex, s: number): Complex {
  return { real: c.real * s, imag: c.imag * s };
}

// Convert interleaved Float32Array to Complex array
export function interleavedToComplex(data: Float32Array): Complex[] {
  const result: Complex[] = [];
  for (let i = 0; i < data.length; i += 2) {
    result.push({ real: data[i], imag: data[i + 1] });
  }
  return result;
}

// Convert Complex array to interleaved Float32Array
export function complexToInterleaved(data: Complex[]): Float32Array {
  const result = new Float32Array(data.length * 2);
  for (let i = 0; i < data.length; i++) {
    result[i * 2] = data[i].real;
    result[i * 2 + 1] = data[i].imag;
  }
  return result;
}

// Check if two complex numbers are approximately equal
export function complexApproxEqual(a: Complex, b: Complex, tolerance = 1e-5): boolean {
  return Math.abs(a.real - b.real) < tolerance && Math.abs(a.imag - b.imag) < tolerance;
}

// Naive DFT for testing (O(N²) complexity)
export function naiveDFT(input: Complex[]): Complex[] {
  const N = input.length;
  const output: Complex[] = [];

  for (let k = 0; k < N; k++) {
    let sum: Complex = { real: 0, imag: 0 };
    for (let n = 0; n < N; n++) {
      const twiddle = twiddleFactor(k * n, N);
      sum = complexAdd(sum, complexMul(input[n], twiddle));
    }
    output.push(sum);
  }

  return output;
}

// Naive IDFT for testing (O(N²) complexity)
export function naiveIDFT(input: Complex[]): Complex[] {
  const N = input.length;
  const output: Complex[] = [];

  for (let n = 0; n < N; n++) {
    let sum: Complex = { real: 0, imag: 0 };
    for (let k = 0; k < N; k++) {
      const twiddle = twiddleFactorInverse(k * n, N);
      sum = complexAdd(sum, complexMul(input[k], twiddle));
    }
    output.push(complexScale(sum, 1 / N));
  }

  return output;
}
