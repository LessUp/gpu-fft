/**
 * WebGPU availability detection utilities
 * @module webgpu-fft/gpu-detect
 */

/**
 * Check if WebGPU is available in the current environment.
 *
 * Performs a full async check that verifies:
 * 1. `navigator.gpu` exists
 * 2. A WebGPU adapter can be obtained
 *
 * @returns Promise resolving to `true` if WebGPU is fully available
 *
 * @example
 * ```typescript
 * import { isWebGPUAvailable } from 'webgpu-fft';
 *
 * if (await isWebGPUAvailable()) {
 *   const engine = await createFFTEngine();
 *   // Use GPU-accelerated FFT
 * } else {
 *   // Fall back to cpuFFT
 *   const result = cpuFFT(input);
 * }
 * ```
 */
export async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    return false;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

/**
 * Synchronous check for basic WebGPU API presence.
 *
 * Only checks if `navigator.gpu` exists. Does NOT verify that an adapter
 * can be obtained. For a complete check, use {@link isWebGPUAvailable}.
 *
 * @returns `true` if the WebGPU API is present in the navigator
 *
 * @example
 * ```typescript
 * import { hasWebGPUSupport } from 'webgpu-fft';
 *
 * if (hasWebGPUSupport()) {
 *   console.log('WebGPU API detected');
 *   // Still need to call isWebGPUAvailable() for full check
 * }
 * ```
 */
export function hasWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}
