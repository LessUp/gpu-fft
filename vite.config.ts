import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'WebGPUFFT',
      fileName: 'webgpu-fft',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    target: 'es2022',
    sourcemap: true,
  },
  assetsInclude: ['**/*.wgsl'],
});
