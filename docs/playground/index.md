# FFT Playground

::: warning Browser Requirements
The GPU path requires a WebGPU-capable browser (Chrome 113+, Edge 113+, Firefox 128+). The playground below runs entirely in your browser using a lightweight CPU FFT implementation for demonstration.
:::

<FFTPlayground />

## What you are seeing

The playground uses a simplified **Cooley-Tukey Radix-2 DIT** implementation running in JavaScript (not WebGPU). This lets you explore FFT behavior without requiring GPU hardware:

- **Time Domain** (left): The input signal before transformation
- **Magnitude Spectrum** (right): The frequency-domain result — each bar represents the strength of a frequency bin

Try different signals to build intuition:
- **Sine Wave**: Should show a single sharp peak at the corresponding frequency bin
- **Square Wave**: Shows odd harmonics (fundamental + 3rd, 5th, 7th...)
- **Impulse**: Flat spectrum (all frequencies have equal energy)
- **Noise**: Broad, low-amplitude spectrum without clear peaks

## Next steps

- [Quick Start](/setup/quick-start) — integrate the real library into your project
- [1D FFT Tutorial](/tutorials/1d-fft) — understand the API and output format
- [Architecture](/architecture/overview) — learn how the GPU engine works
