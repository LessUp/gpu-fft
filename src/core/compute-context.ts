/**
 * FFT 计算上下文抽象
 * @module webgpu-fft/compute-context
 *
 * 定义 GPU 计算操作的抽象接口，允许测试注入 mock 实现。
 * 这是 FFTEngine 与 GPUResourceManager 之间的解耦层。
 */

/**
 * Buffer 集合（用于特定尺寸的 FFT）
 */
export interface BufferSet {
  /** 复数元素数量 */
  n: number;
  /** Buffer 大小（字节） */
  bufferSize: number;
  /** 输入 buffer */
  inputBuffer: GPUBuffer;
  /** 输出 buffer */
  outputBuffer: GPUBuffer;
  /** 临时 buffer */
  tempBuffer: GPUBuffer;
  /** Bit-reversal 参数 buffer */
  bitReversalParamsBuffer: GPUBuffer;
  /** 每个 stage 的参数 buffer */
  stageParamBuffers: GPUBuffer[];
  /** 缩放参数 buffer */
  scaleParamsBuffer: GPUBuffer;
}

/**
 * FFT 计算上下文接口
 *
 * 封装 GPU 资源管理和计算操作，使得 FFTEngine 可以专注于算法编排。
 */
export interface FFTComputeContext {
  /**
   * 获取指定尺寸的 buffer 集合
   *
   * @param n - 复数元素数量（必须为 2 的幂）
   * @returns Buffer 集合
   */
  getBuffers(n: number): BufferSet;

  /**
   * 上传数据到 buffer
   *
   * @param buffer - 目标 buffer
   * @param data - 要上传的数据
   */
  uploadData(buffer: GPUBuffer, data: Float32Array | Uint32Array | Uint8Array): void;

  /**
   * 从 buffer 下载数据
   *
   * @param buffer - 源 buffer
   * @param size - 数据大小（字节）
   * @returns 下载的数据
   */
  downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array>;

  /**
   * 执行 bit-reversal 操作
   *
   * @param input - 输入 buffer
   * @param output - 输出 buffer
   * @param params - 参数 buffer
   * @param workgroups - workgroup 数量
   */
  executeBitReversal(
    input: GPUBuffer,
    output: GPUBuffer,
    params: GPUBuffer,
    workgroups: number
  ): void;

  /**
   * 执行 butterfly stage
   *
   * @param input - 输入 buffer
   * @param output - 输出 buffer
   * @param params - 参数 buffer
   * @param workgroups - workgroup 数量
   */
  executeButterfly(
    input: GPUBuffer,
    output: GPUBuffer,
    params: GPUBuffer,
    workgroups: number
  ): void;

  /**
   * 执行缩放操作（用于 IFFT）
   *
   * @param buffer - 要缩放的 buffer
   * @param params - 参数 buffer
   * @param workgroups - workgroup 数量
   */
  executeScale(buffer: GPUBuffer, params: GPUBuffer, workgroups: number): void;

  /**
   * 提交所有待执行的命令
   */
  submit(): void;

  /**
   * 释放指定尺寸的 buffer 集合
   *
   * @param bufferSet - 要释放的 buffer 集合
   */
  releaseBuffers(bufferSet: BufferSet): void;

  /**
   * 释放所有资源
   */
  dispose(): void;
}
