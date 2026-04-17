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

Base-2 logarithm.

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

Returns a permutation array for bit-reversal reordering.

```ts
function bitReversalPermutation(size: number): number[];
```

### Example

```ts
import { bitReversalPermutation } from 'webgpu-fft';

const perm = bitReversalPermutation(8);
// [0, 4, 2, 6, 1, 5, 3, 7]
```

## `bitReversalPermutationInPlace()`

Reorders an array in-place using bit-reversal.

```ts
function bitReversalPermutationInPlace<T>(array: T[]): void;
```

### Example

```ts
import { bitReversalPermutationInPlace } from 'webgpu-fft';

const data = [0, 1, 2, 3, 4, 5, 6, 7];
bitReversalPermutationInPlace(data);
// data is now [0, 4, 2, 6, 1, 5, 3, 7]
```

## Related

- [1D FFT Tutorial](/tutorials/1d-fft) — FFT basics
- [CPU FFT API](./cpu-fft) — CPU implementation uses these utilities
