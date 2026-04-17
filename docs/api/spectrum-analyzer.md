# Spectrum Analyzer API

Real-time audio frequency analysis with windowing and dB conversion.

## `createSpectrumAnalyzer()`

Creates a spectrum analyzer instance.

### Signature

```ts
function createSpectrumAnalyzer(
  config?: Partial<SpectrumAnalyzerConfig>
): SpectrumAnalyzer;
```

### Example

```ts
import { createSpectrumAnalyzer, WindowType } from 'webgpu-fft';

const analyzer = createSpectrumAnalyzer({
  fftSize: 2048,
  windowType: WindowType.Hann,
  sampleRate: 44100,
});
```

## `SpectrumAnalyzer` Class

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `fftSize` | `number` | FFT size (power of 2) |
| `sampleRate` | `number` | Audio sample rate in Hz |
| `windowType` | `WindowType` | Current window function |

### Methods

#### `analyze()`

Analyzes an audio buffer and returns dB values.

```ts
analyze(buffer: Float32Array): Float32Array;
```

**Parameters:**
- `buffer` — Audio samples (real-valued)

**Returns:** `Float32Array` — Magnitude in dB per frequency bin.

```ts
const audioBuffer = new Float32Array(2048);
// ... fill with audio samples from Web Audio API ...

const spectrum = analyzer.analyze(audioBuffer);
// spectrum[i] is the dB value for bin i
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

## `WindowType` Enum

```ts
enum WindowType {
  Rectangular = 'rectangular',
  Hann = 'hann',
  Hamming = 'hamming',
  Blackman = 'blackman',
  FlatTop = 'flattop',
}
```

## Related

- [Spectrum Analysis Tutorial](/tutorials/spectrum-analysis) — Usage guide
- [Window Functions](./window-functions) — Window function details
