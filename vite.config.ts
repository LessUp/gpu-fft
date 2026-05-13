import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        utils: 'src/utils/index.ts',
        validation: 'src/validation.ts',
      },
      name: 'WebGPUFFT',
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
