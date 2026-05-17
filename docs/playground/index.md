# FFT Playground

::: warning Browser requirements
This explorer is a teaching surface, not the production WebGPU engine. It runs a compact CPU FFT implementation in the browser so that the visualization remains available even when WebGPU is not.
:::

<FFTPlayground />

## What the explorer teaches

- **Time-domain intuition**: how a raw input signal looks before transformation
- **Spectrum intuition**: where energy appears once the signal is transformed
- **Preset comparison**: why sine, square, impulse, and noise signals produce very different spectral signatures

## What it does not claim

- It is not a benchmark of the GPU execution core
- It does not represent shader compilation, pipeline reuse, or GPU memory behavior
- It is not a hidden implementation of `createSpectrumAnalyzer()`

## Recommended reading after this page

| If you want | Next page |
| --- | --- |
| The real library surface | [Quick Start](/setup/quick-start) |
| The GPU versus CPU boundary | [Architecture Overview](/architecture/overview) |
| A more tutorial-style explanation | [Introduction](/tutorials/introduction) |
