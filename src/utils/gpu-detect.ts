// WebGPU availability detection utilities

/**
 * Check if WebGPU is available in the current environment.
 * Returns true if navigator.gpu exists and an adapter can be obtained.
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
 * Does NOT verify adapter availability — use isWebGPUAvailable() for that.
 */
export function hasWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}
