// GPU Resource Manager - handles WebGPU device, buffers, and pipelines
import { FFTError, FFTErrorCode } from './errors';

type ResourceManagerState = 'active' | 'lost' | 'disposed';

export class GPUResourceManager {
  private _device!: GPUDevice;
  private adapter!: GPUAdapter;
  private bufferPool: Map<string, GPUBuffer[]> = new Map();
  private pipelineCache: Map<string, GPUComputePipeline> = new Map();
  private state: ResourceManagerState = 'active';
  private lossMessage = 'WebGPU device was lost';

  private constructor() {}

  get device(): GPUDevice {
    this.assertOperational();
    return this._device;
  }

  static async create(): Promise<GPUResourceManager> {
    const manager = new GPUResourceManager();
    await manager.initialize();
    return manager;
  }

  private async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new FFTError(
        'WebGPU is not supported in this browser',
        FFTErrorCode.WEBGPU_NOT_AVAILABLE
      );
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw new FFTError('Failed to get WebGPU adapter', FFTErrorCode.WEBGPU_NOT_AVAILABLE);
    }
    this.adapter = adapter;

    const device = await adapter.requestDevice();
    if (!device) {
      throw new FFTError('Failed to get WebGPU device', FFTErrorCode.WEBGPU_NOT_AVAILABLE);
    }
    this._device = device;

    device.lost.then((info) => {
      if (this.state === 'disposed') {
        return;
      }

      this.state = 'lost';
      this.lossMessage = info.message
        ? `WebGPU device lost: ${info.message}`
        : 'WebGPU device lost';
      this.destroyPooledBuffers();
      this.pipelineCache.clear();
    });
  }

  private assertOperational(): void {
    if (this.state === 'lost') {
      throw new FFTError(this.lossMessage, FFTErrorCode.DEVICE_LOST);
    }

    if (this.state === 'disposed') {
      throw new FFTError('GPU resources have been disposed', FFTErrorCode.ENGINE_DISPOSED);
    }
  }

  private getPoolKey(size: number, usage: GPUBufferUsageFlags): string {
    return `${size}:${usage}`;
  }

  private destroyPooledBuffers(): void {
    for (const pool of this.bufferPool.values()) {
      for (const buffer of pool) {
        buffer.destroy();
      }
    }
    this.bufferPool.clear();
  }

  createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
    this.assertOperational();

    const poolKey = this.getPoolKey(size, usage);
    const pool = this.bufferPool.get(poolKey);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }

    try {
      return this._device.createBuffer({ size, usage });
    } catch {
      throw new FFTError(
        `Failed to allocate GPU buffer of size ${size}`,
        FFTErrorCode.BUFFER_ALLOCATION_FAILED
      );
    }
  }

  uploadData(buffer: GPUBuffer, data: Float32Array | Uint32Array | Uint8Array): void {
    this.assertOperational();
    this._device.queue.writeBuffer(buffer, 0, data as BufferSource);
  }

  async downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array> {
    this.assertOperational();

    const stagingBuffer = this._device.createBuffer({
      size,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    try {
      const commandEncoder = this._device.createCommandEncoder();
      commandEncoder.copyBufferToBuffer(buffer, 0, stagingBuffer, 0, size);
      this._device.queue.submit([commandEncoder.finish()]);

      await stagingBuffer.mapAsync(GPUMapMode.READ);
      const arrayBuffer = stagingBuffer.getMappedRange();
      const result = new Float32Array(arrayBuffer.slice(0));
      stagingBuffer.unmap();
      return result;
    } catch (error) {
      if (this.state === 'lost') {
        throw new FFTError(this.lossMessage, FFTErrorCode.DEVICE_LOST);
      }
      throw error;
    } finally {
      stagingBuffer.destroy();
    }
  }

  createComputePipeline(shader: string, entryPoint: string): GPUComputePipeline {
    this.assertOperational();

    const cacheKey = `${shader}:${entryPoint}`;
    const cached = this.pipelineCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let shaderModule: GPUShaderModule;
    try {
      shaderModule = this._device.createShaderModule({ code: shader });
    } catch (e) {
      throw new FFTError(`Failed to compile shader: ${e}`, FFTErrorCode.SHADER_COMPILATION_FAILED);
    }

    const pipeline = this._device.createComputePipeline({
      layout: 'auto',
      compute: { module: shaderModule, entryPoint },
    });

    this.pipelineCache.set(cacheKey, pipeline);
    return pipeline;
  }

  releaseBuffer(buffer: GPUBuffer): void {
    if (this.state !== 'active') {
      buffer.destroy();
      return;
    }

    const poolKey = this.getPoolKey(buffer.size, buffer.usage);
    let pool = this.bufferPool.get(poolKey);
    if (!pool) {
      pool = [];
      this.bufferPool.set(poolKey, pool);
    }

    if (pool.length < 4) {
      pool.push(buffer);
    } else {
      buffer.destroy();
    }
  }

  dispose(): void {
    if (this.state === 'disposed') {
      return;
    }

    this.destroyPooledBuffers();
    this.pipelineCache.clear();
    this.state = 'disposed';
  }
}
