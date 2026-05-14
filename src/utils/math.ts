/**
 * 基础数学工具函数
 * @module webgpu-fft/utils/math
 *
 * 提供无依赖的基础数学函数，避免循环依赖问题。
 */

/**
 * 检查数字是否为 2 的幂
 *
 * @param n - 要检查的数字
 * @returns 如果 n 是正的 2 的幂则返回 true
 *
 * @example
 * ```typescript
 * isPowerOf2(1);   // true  (2^0)
 * isPowerOf2(2);   // true  (2^1)
 * isPowerOf2(3);   // false
 * isPowerOf2(4);   // true  (2^2)
 * isPowerOf2(0);   // false
 * isPowerOf2(-4);  // false
 * ```
 */
export function isPowerOf2(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * 计算 2 的幂的对数
 *
 * @param n - 2 的幂（必须 > 0）
 * @returns 以 2 为底的对数。对于 n ≤ 0 返回 0（不抛出错误）
 *
 * @example
 * ```typescript
 * log2(2);   // 1
 * log2(4);   // 2
 * log2(8);   // 3
 * log2(16);  // 4
 * log2(0);   // 0 (无效输入，返回 0)
 * ```
 */
export function log2(n: number): number {
  if (n <= 0) {
    return 0;
  }
  let bits = 0;
  let val = n;
  while (val > 1) {
    val >>= 1;
    bits++;
  }
  return bits;
}
