import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FFTEngine } from '../src/core/fft-engine';
import { GPUResourceManager } from '../src/core/gpu-resource-manager';
import { FFTError, FFTErrorCode } from '../src/core/errors';
import type { FFTEngineConfig } from '../src/types';

const defaultConfig: FFTEngineConfig = {
  enableBankConflictOptimization: true,
  workgroupSize: 256,
};

const GPU_BUFFER_USAGE = {
  STORAGE: 1,
  UNIFORM: 2,
  COPY_DST: 4,
  MAP_READ: 8,
} as const;

const GPU_MAP_MODE = {
  READ: 1,
} as const;

beforeAll(() => {
  vi.stubGlobal('GPUBufferUsage', GPU_BUFFER_USAGE);
  vi.stubGlobal('GPUMapMode', GPU_MAP_MODE);
});

function createPipeline(): GPUComputePipeline {
  return {
    getBindGroupLayout: vi.fn(),
  } as unknown as GPUComputePipeline;
}

function createEngineManager(): GPUResourceManager {
  return {
    createComputePipeline: vi.fn(() => createPipeline()),
    dispose: vi.fn(),
  } as unknown as GPUResourceManager;
}

function createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
  return {
    size,
    usage,
    destroy: vi.fn(),
  } as unknown as GPUBuffer;
}

function createResourceManagerBase(device: GPUDevice): GPUResourceManager {
  const manager = Object.create(GPUResourceManager.prototype) as GPUResourceManager;
  Object.assign(manager as object, {
    _device: device,
    adapter: {},
    bufferPool: new Map(),
    pipelineCache: new Map(),
    state: 'active',
    lossMessage: 'WebGPU device was lost',
  });
  return manager;
}

function createResourceManagerForPooling(): {
  manager: GPUResourceManager;
  device: { createBuffer: ReturnType<typeof vi.fn> };
} {
  const device = {
    createBuffer: vi.fn(({ size, usage }: { size: number; usage: GPUBufferUsageFlags }) =>
      createBuffer(size, usage)
    ),
  };

  return {
    manager: createResourceManagerBase(device as unknown as GPUDevice),
    device,
  };
}

function createResourceManagerWithQueue(): {
  manager: GPUResourceManager;
  queue: { writeBuffer: ReturnType<typeof vi.fn>; submit: ReturnType<typeof vi.fn> };
} {
  const queue = {
    writeBuffer: vi.fn(),
    submit: vi.fn(),
  };

  const device = {
    queue,
    createBuffer: vi.fn(({ size, usage }: { size: number; usage: GPUBufferUsageFlags }) =>
      createBuffer(size, usage)
    ),
  };

  return {
    manager: createResourceManagerBase(device as unknown as GPUDevice),
    queue,
  };
}

function createMappedBuffer(data: Float32Array): GPUBuffer {
  return {
    size: data.byteLength,
    usage: GPU_BUFFER_USAGE.MAP_READ | GPU_BUFFER_USAGE.COPY_DST,
    destroy: vi.fn(),
    mapAsync: vi.fn().mockResolvedValue(undefined),
    getMappedRange: vi.fn(() => data.buffer),
    unmap: vi.fn(),
  } as unknown as GPUBuffer;
}

function createResourceManagerForDownload(result: Float32Array): {
  manager: GPUResourceManager;
  stagingBuffer: GPUBuffer;
  commandEncoder: {
    copyBufferToBuffer: ReturnType<typeof vi.fn>;
    finish: ReturnType<typeof vi.fn>;
  };
  queue: { submit: ReturnType<typeof vi.fn> };
} {
  const stagingBuffer = createMappedBuffer(result);
  const commandEncoder = {
    copyBufferToBuffer: vi.fn(),
    finish: vi.fn(() => ({}) as GPUCommandBuffer),
  };
  const queue = {
    submit: vi.fn(),
  };

  const device = {
    queue,
    createBuffer: vi.fn(() => stagingBuffer),
    createCommandEncoder: vi.fn(() => commandEncoder),
  };

  return {
    manager: createResourceManagerBase(device as unknown as GPUDevice),
    stagingBuffer,
    commandEncoder,
    queue,
  };
}

function createResourceManagerForPipelines(): {
  manager: GPUResourceManager;
  device: {
    createShaderModule: ReturnType<typeof vi.fn>;
    createComputePipeline: ReturnType<typeof vi.fn>;
  };
} {
  const device = {
    createShaderModule: vi.fn(({ code }: { code: string }) => ({ code }) as GPUShaderModule),
    createComputePipeline: vi.fn(() => createPipeline()),
  };

  return {
    manager: createResourceManagerBase(device as unknown as GPUDevice),
    device,
  };
}

function createResourceManagerWithFailingShader(): GPUResourceManager {
  const device = {
    createShaderModule: vi.fn(() => {
      throw new Error('bad shader');
    }),
  };

  return createResourceManagerBase(device as unknown as GPUDevice);
}

function createResourceManagerWithFailingBuffer(): GPUResourceManager {
  const device = {
    createBuffer: vi.fn(() => {
      throw new Error('alloc failed');
    }),
  };

  return createResourceManagerBase(device as unknown as GPUDevice);
}

describe('FFTEngine contract', () => {
  it('rejects unsupported workgroup sizes', async () => {
    await expect(
      FFTEngine.create(createEngineManager(), { ...defaultConfig, workgroupSize: 128 })
    ).rejects.toMatchObject({
      code: FFTErrorCode.INVALID_INPUT_SIZE,
    });
  });

  it('rejects odd-length interleaved input before touching GPU', async () => {
    const engine = await FFTEngine.create(createEngineManager(), defaultConfig);

    await expect(engine.fft(new Float32Array(3))).rejects.toMatchObject({
      code: FFTErrorCode.INVALID_INPUT_SIZE,
    });
  });

  it('rejects oversized GPU FFT input before touching GPU', async () => {
    const engine = await FFTEngine.create(createEngineManager(), defaultConfig);

    await expect(engine.fft(new Float32Array(131072 * 2))).rejects.toMatchObject({
      code: FFTErrorCode.INPUT_TOO_LARGE,
    });
  });

  it('rejects invalid 2D dimensions before touching GPU', async () => {
    const engine = await FFTEngine.create(createEngineManager(), defaultConfig);

    await expect(engine.fft2d(new Float32Array(12), 3, 2)).rejects.toMatchObject({
      code: FFTErrorCode.INVALID_INPUT_SIZE,
    });
  });

  it('rejects mismatched 2D input length before touching GPU', async () => {
    const engine = await FFTEngine.create(createEngineManager(), defaultConfig);

    await expect(engine.ifft2d(new Float32Array(10), 2, 2)).rejects.toMatchObject({
      code: FFTErrorCode.DIMENSION_MISMATCH,
    });
  });

  it('dispose is idempotent and disposes owned managers once', async () => {
    const manager = createEngineManager();
    const engine = await FFTEngine.create(manager, defaultConfig, true);

    engine.dispose();
    engine.dispose();

    expect(manager.dispose).toHaveBeenCalledTimes(1);
  });

  it('does not dispose externally owned managers', async () => {
    const manager = createEngineManager();
    const engine = await FFTEngine.create(manager, defaultConfig, false);

    engine.dispose();

    expect(manager.dispose).not.toHaveBeenCalled();
  });

  it('rejects all public operations after dispose', async () => {
    const engine = await FFTEngine.create(createEngineManager(), defaultConfig);
    engine.dispose();

    await expect(engine.fft(new Float32Array(4))).rejects.toMatchObject({
      code: FFTErrorCode.ENGINE_DISPOSED,
    });
    await expect(engine.ifft(new Float32Array(4))).rejects.toMatchObject({
      code: FFTErrorCode.ENGINE_DISPOSED,
    });
    await expect(engine.fft2d(new Float32Array(8), 2, 2)).rejects.toMatchObject({
      code: FFTErrorCode.ENGINE_DISPOSED,
    });
    await expect(engine.ifft2d(new Float32Array(8), 2, 2)).rejects.toMatchObject({
      code: FFTErrorCode.ENGINE_DISPOSED,
    });
  });
});

describe('GPUResourceManager pooling and state', () => {
  it('reuses buffers only when size and usage both match', () => {
    const { manager, device } = createResourceManagerForPooling();

    const storageBuffer = manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE);
    manager.releaseBuffer(storageBuffer);

    const reused = manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE);
    const differentUsage = manager.createBuffer(64, GPU_BUFFER_USAGE.UNIFORM);

    expect(reused).toBe(storageBuffer);
    expect(differentUsage).not.toBe(storageBuffer);
    expect(device.createBuffer).toHaveBeenCalledTimes(2);
  });

  it('writes uploads through the device queue', () => {
    const { manager, queue } = createResourceManagerWithQueue();
    const buffer = createBuffer(16, GPU_BUFFER_USAGE.STORAGE);
    const data = new Float32Array([1, 2]);

    manager.uploadData(buffer, data);

    expect(queue.writeBuffer).toHaveBeenCalledWith(buffer, 0, data);
  });

  it('downloads mapped readback data and destroys the staging buffer', async () => {
    const result = new Float32Array([1, 2, 3, 4]);
    const { manager, stagingBuffer, commandEncoder, queue } =
      createResourceManagerForDownload(result);

    const output = await manager.downloadData(createBuffer(16, GPU_BUFFER_USAGE.STORAGE), 16);

    expect(Array.from(output)).toEqual([1, 2, 3, 4]);
    expect(commandEncoder.copyBufferToBuffer).toHaveBeenCalled();
    expect(queue.submit).toHaveBeenCalledTimes(1);
    expect(
      (stagingBuffer as unknown as { destroy: ReturnType<typeof vi.fn> }).destroy
    ).toHaveBeenCalledTimes(1);
  });

  it('caches compiled compute pipelines by shader and entry point', () => {
    const { manager, device } = createResourceManagerForPipelines();

    const first = manager.createComputePipeline('@compute fn main() {}', 'main');
    const second = manager.createComputePipeline('@compute fn main() {}', 'main');

    expect(first).toBe(second);
    expect(device.createShaderModule).toHaveBeenCalledTimes(1);
    expect(device.createComputePipeline).toHaveBeenCalledTimes(1);
  });

  it('wraps shader compilation failures in FFTError', () => {
    const manager = createResourceManagerWithFailingShader();

    expect(() => manager.createComputePipeline('@compute fn main() {}', 'main')).toThrow(FFTError);

    try {
      manager.createComputePipeline('@compute fn main() {}', 'main');
      expect.fail('Expected createComputePipeline to throw');
    } catch (error) {
      expect((error as FFTError).code).toBe(FFTErrorCode.SHADER_COMPILATION_FAILED);
    }
  });

  it('wraps buffer allocation failures in FFTError', () => {
    const manager = createResourceManagerWithFailingBuffer();

    expect(() => manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE)).toThrow(FFTError);

    try {
      manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE);
      expect.fail('Expected createBuffer to throw');
    } catch (error) {
      expect((error as FFTError).code).toBe(FFTErrorCode.BUFFER_ALLOCATION_FAILED);
    }
  });

  it('throws DEVICE_LOST after the manager is marked lost', () => {
    const { manager } = createResourceManagerForPooling();
    (manager as unknown as { state: string; lossMessage: string }).state = 'lost';
    (manager as unknown as { state: string; lossMessage: string }).lossMessage =
      'device lost in test';

    expect(() => manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE)).toThrow(FFTError);
    expect(() => manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE)).toThrow(/device lost in test/);

    try {
      manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE);
      expect.fail('Expected createBuffer to throw');
    } catch (error) {
      expect((error as FFTError).code).toBe(FFTErrorCode.DEVICE_LOST);
    }
  });

  it('throws ENGINE_DISPOSED after dispose', () => {
    const { manager } = createResourceManagerForPooling();
    manager.dispose();

    expect(() => manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE)).toThrow(FFTError);

    try {
      manager.createBuffer(64, GPU_BUFFER_USAGE.STORAGE);
      expect.fail('Expected createBuffer to throw');
    } catch (error) {
      expect((error as FFTError).code).toBe(FFTErrorCode.ENGINE_DISPOSED);
    }
  });
});
