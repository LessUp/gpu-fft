# Bit Reversal Utilities

Bit-reversal permutation utilities for FFT algorithms.

## `bitReverse()`

Reverses the bits of an integer.

```ts
function bitReverse(value: number, bitWidth: number): number;
```

### Example

```ts
import { bitReverse } from 'webgpu-fft';

// Reverse 3 bits of value 1 (001 → 100)
const result = bitReverse(1, 3); // 4
```

## `log2()`

Base-2 logarithm for positive power-of-two sizes.

```ts
function log2(n: number): number;
```

### Example

```ts
import { log2 } from 'webgpu-fft';

console.log(log2(1024)); // 10
```

## `isPowerOf2()`

Checks if a number is a power of 2.

```ts
function isPowerOf2(n: number): boolean;
```

### Example

```ts
import { isPowerOf2 } from 'webgpu-fft';

console.log(isPowerOf2(1024)); // true
console.log(isPowerOf2(1000)); // false
```

## `bitReversalPermutation()`

Returns a new interleaved complex array reordered by bit-reversal.

```ts
function bitReversalPermutation(data: Float32Array): Float32Array;
```

### Example

```ts
import { bitReversalPermutation } from 'webgpu-fft';

const input = new Float32Array([0, 0, 1, 0, 2, 0, 3, 0]);
const output = bitReversalPermutation(input);
// output is [0, 0, 2, 0, 1, 0, 3, 0]
```

`data` must be interleaved complex data and must contain a power-of-two number
of complex samples. Invalid input throws `RangeError`.

## `bitReversalPermutationInPlace()`

Reorders an interleaved complex array in-place using bit-reversal.

```ts
function bitReversalPermutationInPlace(data: Float32Array): void;
```

### Example

```ts
import { bitReversalPermutationInPlace } from 'webgpu-fft';

const data = new Float32Array([0, 0, 1, 0, 2, 0, 3, 0]);
bitReversalPermutationInPlace(data);
// data is now [0, 0, 2, 0, 1, 0, 3, 0]
```

Validation is performed before mutation. Invalid input throws `RangeError` and
leaves the array unchanged.

## Related

- [1D FFT Tutorial](/tutorials/1d-fft) — FFT basics
- [CPU FFT API](./cpu-fft) — CPU implementation uses these utilities
