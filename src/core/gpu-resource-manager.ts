// GPU Resource Manager - handles WebGPU device, buffers, and pipelines
import { FFTError, FFTErrorCode } from './errors';

export class GPUResourceManager {
  device!: GPUDevice;
  private adapter!: GPUAdapter;
  private bufferPool: Map<number, GPUBuffer[]> = new Map();
  private pipelineCache: Map<string, GPUComputePipeline> = new Map();

  private constructor() {}

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
      throw new FFTError(
        'Failed to get WebGPU adapter',
        FFTErrorCode.WEBGPU_NOT_AVAILABLE
      );
    }
    this.adapter = adapter;

    const device = await adapter.requestDevice();
    if (!device) {
      throw new FFTError(
        'Failed to get WebGPU device',
        FFTErrorCode.WEBGPU_NOT_AVAILABLE
      );
    }
    this.device = device;

    // Handle device lost
    device.lost.then((info) => {
      console.error('WebGPU device lost:', info.message);
    });
  }

  createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
    // Try to reuse from pool
    const poolKey = size;
    const pool = this.bufferPool.get(poolKey);
    if (pool && pool.length > 0) {
      const buffer = pool.pop()!;
      return buffer;
    }

    // Create new buffer
    try {
      return this.device.createBuffer({ size, usage });
    } catch (e) {
      throw new FFTError(
        `Failed to allocate GPU buffer of size ${size}`,
        FFTErrorCode.BUFFER_ALLOCATION_FAILED
      );
    }
  }

  uploadData(buffer: GPUBuffer, data: Float32Array): void {
    this.device.queue.writeBuffer(buffer, 0, data);
  }

  async downloadData(buffer: GPUBuffer, size: number): Promise<Float32Array> {
    // Create staging buffer for readback
    const stagingBuffer = this.device.createBuffer({
      size,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
    });

    // Copy from source to staging
    const commandEncoder = this.device.createCommandEncoder();
    commandEncoder.copyBufferToBuffer(buffer, 0, stagingBuffer, 0, size);
    this.device.queue.submit([commandEncoder.finish()]);

    // Map and read
    await stagingBuffer.mapAsync(GPUMapMode.READ);
    const arrayBuffer = stagingBuffer.getMappedRange();
    const result = new Float32Array(arrayBuffer.slice(0));
    stagingBuffer.unmap();
    stagingBuffer.destroy();

    return result;
  }

  createComputePipeline(shader: string, entryPoint: string): GPUComputePipeline {
    const cacheKey = `${shader}:${entryPoint}`;
    const cached = this.pipelineCache.get(cacheKey);
    if (cached) return cached;

    let shaderModule: GPUShaderModule;
    try {
      shaderModule = this.device.createShaderModule({ code: shader });
    } catch (e) {
      throw new FFTError(
        `Failed to compile shader: ${e}`,
        FFTErrorCode.SHADER_COMPILATION_FAILED
      );
    }

    const pipeline = this.device.createComputePipeline({
      layout: 'auto',
      compute: { module: shaderModule, entryPoint }
    });

    this.pipelineCache.set(cacheKey, pipeline);
    return pipeline;
  }

  releaseBuffer(buffer: GPUBuffer): void {
    const size = buffer.size;
    let pool = this.bufferPool.get(size);
    if (!pool) {
      pool = [];
      this.bufferPool.set(size, pool);
    }
    // Limit pool size to prevent memory bloat
    if (pool.length < 4) {
      pool.push(buffer);
    } else {
      buffer.destroy();
    }
  }

  dispose(): void {
    // Destroy all pooled buffers
    for (const pool of this.bufferPool.values()) {
      for (const buffer of pool) {
        buffer.destroy();
      }
    }
    this.bufferPool.clear();
    this.pipelineCache.clear();
  }
}
