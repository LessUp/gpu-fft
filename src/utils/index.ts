/**
 * Utility functions for FFT operations
 * @module webgpu-fft/utils
 *
 * 包含复数运算、位反转、窗函数等工具函数。
 */

export {
  complexAdd,
  complexSub,
  complexMul,
  complexMagnitude,
  complexConj,
  complexScale,
  twiddleFactor,
  twiddleFactorInverse,
  interleavedToComplex,
  complexToInterleaved,
  complexApproxEqual,
  naiveDFT,
  naiveIDFT,
} from './complex';

export {
  bitReverse,
  log2,
  isPowerOf2,
  bitReversalPermutation,
  bitReversalPermutationInPlace,
} from './bit-reversal';

export {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
  applyWindow,
  applyWindowComplex,
} from './window-functions';
