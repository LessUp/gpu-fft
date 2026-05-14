/**
 * GPU 计算上下文实现
 * @module webgpu-fft/gpu-compute-context
 *
 * 基于 GPUResourceManager 的 FFTComputeContext 实现。
 * 封装 GPU buffer 管理、pipeline 执行和命令提交。
 */

import type { FFTComputeContext, BufferSet } from './compute-context';
import { GPUResourceManager } from './gpu-resource-manager';
import { BUTTERFLY_SHADER, BIT_REVERSAL_SHADER, SCALE_SHADER } from '../shaders/sources';
import { log2 } from '../utils/math';
import { FFTError, FFTErrorCode } from './errors';

const PLAN_CACHE_CAPACITY = 4;
const BIT_REVERSAL_PARAM_BUFFER_SIZE = 8;
const BUTTERFLY_PARAM_BUFFER_SIZE = 16;
const SCALE_PARAM_BUFFER_SIZE = 8;

/**
 * GPU 计算上下文
 *
 * 封装 GPU 资源管理和计算操作。
 * FFTEngine 通过此接口与 GPU 交互，从而可以在测试中注入 mock。
 */
export class GPUComputeContext implements FFTComputeContext {
  private resourceManager: GPUResourceManager;
  private butterflyPipeline!: GPUComputePipeline;
  private bitReversalPipeline!: GPUComputePipeline;
  private scalePipeline!: GPUComputePipeline;
  private sizeCaches = new Map<number, BufferSet>();
  private commandEncoder: GPUCommandEncoder | null = null;
  private initialized = false;
  private disposed = false;

  private constructor(resourceManager: GPUResourceManager) {
    this.resourceManager = resourceManager;
  }

  static async create(resourceManager: GPUResourceManager): Promise<GPUComputeContext> {
    const ctx = new GPUComputeContext(resourceManager);
    await ctx.initialize();
    return ctx;
  }

  private async initialize(): Promise<void> {
    this.butterflyPipeline = this.resourceManager.createComputePipeline(
      BUTTERFLY_SHADER,
      'butterfly_stage'
    );
    this.bitReversalPipeline = this.resourceManager.createComputePipeline(
      BIT_REVERSAL_SHADER,
      'bit_reversal_permutation'
    );
    this.scalePipeline = this.resourceManager.createComputePipeline(SCALE_SHADER, 'scale');
    this.initialized = true;
  }

  private assertOperational(): void {
    if (this.disposed) {
      throw new FFTError('GPU compute context has been disposed', FFTErrorCode.ENGINE_DISPOSED);
    }
    if (!this.initialized) {
      throw new FFTError(
        'GPU compute context has not been initialized',
        FFTErrorCode.TRANSFORM_FAILED
      );
    }
  }

  private ensureCommandEncoder(): GPUCommandEncoder {
    if (!this.commandEncoder) {
      this.commandEncoder = this.resourceManager.device.createCommandEncoder();
    }
    return this.commandEncoder;
  }

  getBuffers(n: number): BufferSet {
    this.assertOperational();
    const bufferSize = n * 2 * 4;

    const cached = this.sizeCaches.get(n);
    if (cached) {
      this.sizeCaches.delete(n);
      this.sizeCaches.set(n, cached);
      return cached;
    }

    if (this.sizeCaches.size >= PLAN_CACHE_CAPACITY) {
      const oldestKey = this.sizeCaches.keys().next().value;
      if (oldestKey !== undefined) {
        const oldest = this.sizeCaches.get(oldestKey);
        if (oldest) {
          this.releaseBuffers(oldest);
        }
        this.sizeCaches.delete(oldestKey);
      }
    }

    const storageFlags = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
    const numStages = log2(n);

    const bufferSet: BufferSet = {
      n,
      bufferSize,
      inputBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      outputBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      tempBuffer: this.resourceManager.createBuffer(bufferSize, storageFlags),
      bitReversalParamsBuffer: this.resourceManager.createBuffer(
        BIT_REVERSAL_PARAM_BUFFER_SIZE,
        GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      ),
      stageParamBuffers: Array.from({ length: numStages }, () =>
        this.resourceManager.createBuffer(
          BUTTERFLY_PARAM_BUFFER_SIZE,
          GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        )
      ),
      scaleParamsBuffer: this.resourceManager.createBuffer(
        SCALE_PARAM_BUFFER_SIZE,
        GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      ),
    };

    this.sizeCaches.set(n, bufferSet);
    return bufferSet;
  }

  uploadData(buffer: GPUBuffer, data: Float32Array | Uint32Array | Uint8Array): void {
    this.assertOperational();
    this.resourceManager.uploadData(buffer, data);
  }

  downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array> {
    this.assertOperational();
    return this.resourceManager.downloadData(buffer, size);
  }

  executeBitReversal(
    input: GPUBuffer,
    output: GPUBuffer,
    params: GPUBuffer,
    workgroups: number
  ): void {
    this.assertOperational();
    const encoder = this.ensureCommandEncoder();
    const device = this.resourceManager.device;

    const bindGroup = device.createBindGroup({
      layout: this.bitReversalPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: input } },
        { binding: 2, resource: { buffer: output } },
      ],
    });

    const pass = encoder.beginComputePass();
    pass.setPipeline(this.bitReversalPipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(workgroups);
    pass.end();
  }

  executeButterfly(
    input: GPUBuffer,
    output: GPUBuffer,
    params: GPUBuffer,
    workgroups: number
  ): void {
    this.assertOperational();
    const encoder = this.ensureCommandEncoder();
    const device = this.resourceManager.device;

    const bindGroup = device.createBindGroup({
      layout: this.butterflyPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer: input } },
        { binding: 2, resource: { buffer: output } },
      ],
    });

    const pass = encoder.beginComputePass();
    pass.setPipeline(this.butterflyPipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(workgroups);
    pass.end();
  }

  executeScale(buffer: GPUBuffer, params: GPUBuffer, workgroups: number): void {
    this.assertOperational();
    const encoder = this.ensureCommandEncoder();
    const device = this.resourceManager.device;

    const bindGroup = device.createBindGroup({
      layout: this.scalePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: params } },
        { binding: 1, resource: { buffer } },
      ],
    });

    const pass = encoder.beginComputePass();
    pass.setPipeline(this.scalePipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(workgroups);
    pass.end();
  }

  submit(): void {
    this.assertOperational();
    if (this.commandEncoder) {
      this.resourceManager.device.queue.submit([this.commandEncoder.finish()]);
      this.commandEncoder = null;
    }
  }

  releaseBuffers(bufferSet: BufferSet): void {
    this.resourceManager.releaseBuffer(bufferSet.inputBuffer);
    this.resourceManager.releaseBuffer(bufferSet.outputBuffer);
    this.resourceManager.releaseBuffer(bufferSet.tempBuffer);
    this.resourceManager.releaseBuffer(bufferSet.bitReversalParamsBuffer);
    for (const buffer of bufferSet.stageParamBuffers) {
      this.resourceManager.releaseBuffer(buffer);
    }
    this.resourceManager.releaseBuffer(bufferSet.scaleParamsBuffer);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    for (const bufferSet of this.sizeCaches.values()) {
      this.releaseBuffers(bufferSet);
    }
    this.sizeCaches.clear();
    this.resourceManager.dispose();
    this.initialized = false;
    this.disposed = true;
  }
}
