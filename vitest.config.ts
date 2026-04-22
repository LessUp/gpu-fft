import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['benchmarks/**', 'coverage/**', 'dist/**', 'docs/**', 'examples/**', 'tests/**'],
      thresholds: {
        lines: 73,
        functions: 79,
        branches: 70,
        statements: 74,
      },
    },
  },
});
