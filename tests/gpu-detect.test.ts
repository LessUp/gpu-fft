import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasWebGPUSupport, isWebGPUAvailable } from '../src/utils/gpu-detect';

const originalNavigator = globalThis.navigator;

function setNavigator(value: Navigator | undefined): void {
  Object.defineProperty(globalThis, 'navigator', {
    value,
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  if (originalNavigator === undefined) {
    // @ts-expect-error test cleanup for environments without navigator
    delete globalThis.navigator;
    return;
  }

  setNavigator(originalNavigator);
  vi.restoreAllMocks();
});

describe('gpu-detect', () => {
  it('returns false when navigator is unavailable', async () => {
    // @ts-expect-error test setup for non-browser environment branch
    delete globalThis.navigator;

    expect(hasWebGPUSupport()).toBe(false);
    await expect(isWebGPUAvailable()).resolves.toBe(false);
  });

  it('returns false when navigator.gpu is missing', async () => {
    setNavigator({} as Navigator);

    expect(hasWebGPUSupport()).toBe(false);
    await expect(isWebGPUAvailable()).resolves.toBe(false);
  });

  it('returns true when gpu exists and requestAdapter resolves to an adapter', async () => {
    const requestAdapter = vi.fn().mockResolvedValue({} as GPUAdapter);
    setNavigator({ gpu: { requestAdapter } } as Navigator);

    expect(hasWebGPUSupport()).toBe(true);
    await expect(isWebGPUAvailable()).resolves.toBe(true);
    expect(requestAdapter).toHaveBeenCalledTimes(1);
  });

  it('returns false when requestAdapter resolves to null', async () => {
    const requestAdapter = vi.fn().mockResolvedValue(null);
    setNavigator({ gpu: { requestAdapter } } as Navigator);

    await expect(isWebGPUAvailable()).resolves.toBe(false);
    expect(requestAdapter).toHaveBeenCalledTimes(1);
  });

  it('returns false when requestAdapter throws', async () => {
    const requestAdapter = vi.fn().mockRejectedValue(new Error('adapter failure'));
    setNavigator({ gpu: { requestAdapter } } as Navigator);

    await expect(isWebGPUAvailable()).resolves.toBe(false);
    expect(requestAdapter).toHaveBeenCalledTimes(1);
  });
});
