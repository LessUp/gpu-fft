import { describe, expect, it } from 'vitest';
import {
  buildAssetLink,
  getChartPalette,
  normalizeBase,
  resolvePreferredLocalePath,
} from '../docs/.vitepress/theme/lib/site';

describe('docs site helpers', () => {
  it('normalizes GitHub Pages base paths', () => {
    expect(normalizeBase(undefined)).toBe('/');
    expect(normalizeBase('gpu-fft')).toBe('/gpu-fft/');
    expect(normalizeBase('/gpu-fft')).toBe('/gpu-fft/');
  });

  it('builds asset links against a normalized base', () => {
    expect(buildAssetLink('/gpu-fft/', 'logo.svg')).toBe('/gpu-fft/logo.svg');
    expect(buildAssetLink('/gpu-fft/', '/hero.svg')).toBe('/gpu-fft/hero.svg');
  });

  it('redirects first-time Chinese users into the zh locale', () => {
    expect(resolvePreferredLocalePath('/gpu-fft/', 'zh-CN', '/gpu-fft/', null)).toBe(
      '/gpu-fft/zh/'
    );
    expect(resolvePreferredLocalePath('/gpu-fft/zh/', 'zh-CN', '/gpu-fft/', null)).toBeNull();
    expect(resolvePreferredLocalePath('/gpu-fft/', 'zh-CN', '/gpu-fft/', 'zh')).toBeNull();
  });

  it('returns stable chart palettes for both themes', () => {
    expect(getChartPalette('dark').surface).toContain('oklch');
    expect(getChartPalette('light').bar).toContain('oklch');
    expect(getChartPalette('dark').surface).not.toBe(getChartPalette('light').surface);
  });
});
