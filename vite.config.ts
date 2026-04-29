import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WebGPUFFT',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    emptyOutDir: false,
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    target: 'es2022',
    sourcemap: true,
  },
});
