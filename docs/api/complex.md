# Complex Number Utilities

Helper functions for complex number arithmetic.

## Complex Type

```ts
type Complex = [number, number]; // [real, imaginary]
```

## Arithmetic Operations

### `complexAdd()`

```ts
function complexAdd(a: Complex, b: Complex): Complex;
```

### `complexSub()`

```ts
function complexSub(a: Complex, b: Complex): Complex;
```

### `complexMul()`

```ts
function complexMul(a: Complex, b: Complex): Complex;
```

### `complexScale()`

```ts
function complexScale(a: Complex, scale: number): Complex;
```

### `complexConj()`

```ts
function complexConj(a: Complex): Complex;
```

Returns the complex conjugate.

### `complexMagnitude()`

```ts
function complexMagnitude(a: Complex): number;
```

Returns the magnitude (absolute value).

## Twiddle Factors

### `twiddleFactor()`

```ts
function twiddleFactor(k: number, n: number): Complex;
```

Computes e^(-2πi·k/n).

### `twiddleFactorInverse()`

```ts
function twiddleFactorInverse(k: number, n: number): Complex;
```

Computes e^(2πi·k/n).

## Data Conversion

### `interleavedToComplex()`

```ts
function interleavedToComplex(data: Float32Array): Complex[];
```

Converts `[Re, Im, Re, Im, ...]` to `[[Re, Im], ...]`.

### `complexToInterleaved()`

```ts
function complexToInterleaved(data: Complex[]): Float32Array;
```

Converts `[[Re, Im], ...]` to `[Re, Im, Re, Im, ...]`.

## Utilities

### `complexApproxEqual()`

```ts
function complexApproxEqual(
  a: Complex,
  b: Complex,
  tolerance?: number
): boolean;
```

Compares two complex numbers with tolerance.

### `naiveDFT()`

```ts
function naiveDFT(data: Float32Array): Float32Array;
```

Computes DFT using the naive O(N²) algorithm. Useful for verification.

### `naiveIDFT()`

```ts
function naiveIDFT(data: Float32Array): Float32Array;
```

Computes inverse DFT using the naive algorithm.

## Example

```ts
import {
  complexMul,
  complexMagnitude,
  twiddleFactor,
} from 'webgpu-fft';

const a: Complex = [3, 4];
const b: Complex = [1, 2];

const product = complexMul(a, b);  // [-5, 10]
const mag = complexMagnitude(a);    // 5

const twiddle = twiddleFactor(1, 8); // [0.707, -0.707]
```
