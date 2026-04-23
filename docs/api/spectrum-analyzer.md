# Spectrum Analyzer API

Real-time audio frequency analysis with windowing and dB conversion.

> `createSpectrumAnalyzer()` is currently a CPU-only utility. It does not use the GPU FFT engine internally.

## `createSpectrumAnalyzer()`

Creates a spectrum analyzer instance.

### Signature

```ts
function createSpectrumAnalyzer(
  config: SpectrumAnalyzerConfig
): Promise<SpectrumAnalyzer>;
```

### Example

```ts
import { createSpectrumAnalyzer, WindowType } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 2048,
  windowType: 'hann',
  sampleRate: 44100,
});
```

## `SpectrumAnalyzer` Class

### Methods

#### `analyze()`

Analyzes an audio buffer and returns dB values.

```ts
analyze(buffer: Float32Array): Promise<Float32Array>;
```

**Parameters:**
- `buffer` — Audio samples (real-valued)

**Returns:** `Float32Array` — Magnitude in dB per frequency bin.

```ts
const audioBuffer = new Float32Array(2048);
// ... fill with audio samples from Web Audio API ...

const spectrum = await analyzer.analyze(audioBuffer);
// spectrum[i] is the dB value for bin i
```

#### `getFrequency()`

Returns the center frequency for one FFT bin.

```ts
getFrequency(binIndex: number): number;
```

```ts
console.log(analyzer.getFrequency(10));
```

#### `getFrequencies()`

Returns the frequency values for each bin.

```ts
getFrequencies(): Float32Array;
```

```ts
const frequencies = analyzer.getFrequencies();
console.log(`Bin 10 corresponds to ${frequencies[10]} Hz`);
```

#### `dispose()`

Releases resources.

```ts
dispose(): void;
```

## `SpectrumAnalyzerConfig` Type

```ts
interface SpectrumAnalyzerConfig {
  /** FFT size (power of 2, default 2048) */
  fftSize: number;
  /** Window function type */
  windowType: WindowType;
  /** Audio sample rate in Hz (default 44100) */
  sampleRate: number;
}
```

## `WindowType` Type

```ts
type WindowType = 'hann' | 'hamming' | 'blackman' | 'flattop' | 'rectangular';
```

## Related

- [Spectrum Analysis Tutorial](/tutorials/spectrum-analysis) — Usage guide
- [Window Functions](./window-functions) — Window function details
