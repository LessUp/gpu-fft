export type ChartMode = 'light' | 'dark';

type ChartPalette = {
  background: string;
  border: string;
  grid: string;
  label: string;
  surface: string;
  bar: string;
  barSoft: string;
  accent: string;
};

export function normalizeBase(rawBase?: string): string {
  if (!rawBase) {
    return '/';
  }

  const withLeadingSlash = rawBase.startsWith('/') ? rawBase : `/${rawBase}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function buildAssetLink(base: string, assetPath: string): string {
  const normalizedBase = normalizeBase(base);
  const normalizedAsset = assetPath.replace(/^\/+/, '');
  return normalizedBase === '/' ? `/${normalizedAsset}` : `${normalizedBase}${normalizedAsset}`;
}

export function resolvePreferredLocalePath(
  currentPath: string,
  browserLanguage: string,
  base: string,
  storedLocale?: string | null
): string | null {
  if (storedLocale || !browserLanguage.toLowerCase().startsWith('zh')) {
    return null;
  }

  const normalizedBase = normalizeBase(base);
  if (currentPath.startsWith(`${normalizedBase}zh/`)) {
    return null;
  }

  return `${normalizedBase}zh/`;
}

export function getChartPalette(mode: ChartMode): ChartPalette {
  if (mode === 'dark') {
    return {
      background: 'oklch(0.18 0.01 250)',
      border: 'oklch(0.34 0.01 250)',
      grid: 'oklch(0.3 0.01 250 / 0.55)',
      label: 'oklch(0.78 0.01 250)',
      surface: 'oklch(0.23 0.015 255)',
      bar: 'oklch(0.72 0.16 145)',
      barSoft: 'oklch(0.62 0.08 215)',
      accent: 'oklch(0.78 0.13 230)',
    };
  }

  return {
    background: 'oklch(0.985 0.005 250)',
    border: 'oklch(0.88 0.008 250)',
    grid: 'oklch(0.84 0.008 250 / 0.75)',
    label: 'oklch(0.46 0.02 250)',
    surface: 'oklch(0.98 0.005 255)',
    bar: 'oklch(0.58 0.17 145)',
    barSoft: 'oklch(0.7 0.08 220)',
    accent: 'oklch(0.54 0.14 230)',
  };
}
