# FFT Playground

::: warning Browser Requirements
The GPU path requires a WebGPU-capable browser (Chrome 113+, Edge 113+, Firefox 128+). If WebGPU is unavailable, the playground automatically falls back to the CPU implementation.
:::

The FFT Playground lets you experiment with Fast Fourier Transforms directly in the browser. Choose a preset signal or enter your own real-valued samples, then observe the frequency-domain result.

## How to Use

1. Select a **preset signal** (sine wave, square wave, or noise) or enter custom values
2. Choose the **transform path**: CPU or WebGPU
3. Click **Run FFT** to see the magnitude spectrum and phase spectrum

::: info Coming Soon
This page will embed an interactive Vue component with real-time FFT visualization. For now, explore the API in [Quick Start](/setup/quick-start) or run the [web examples](https://github.com/LessUp/gpu-fft/tree/main/examples/web).
:::
