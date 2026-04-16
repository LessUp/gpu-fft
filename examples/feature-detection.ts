/**
 * Feature Detection Example
 *
 * This example demonstrates how to detect WebGPU support and handle
 * unsupported browsers gracefully.
 *
 * Features demonstrated:
 * - Checking WebGPU availability
 * - Getting adapter information
 * - Handling unsupported browsers
 */

/**
 * Check if WebGPU is available in the current environment
 */
async function checkWebGPUSupport(): Promise<{
  supported: boolean;
  reason?: string;
  adapterInfo?: GPUAdapterInfo;
}> {
  // Check if navigator.gpu exists
  if (typeof navigator === 'undefined') {
    return {
      supported: false,
      reason: 'Not running in a browser environment',
    };
  }

  if (!navigator.gpu) {
    return {
      supported: false,
      reason: 'WebGPU is not supported in this browser',
    };
  }

  try {
    // Try to get an adapter
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      return {
        supported: false,
        reason: 'No WebGPU adapter available (GPU may not support WebGPU)',
      };
    }

    // Get adapter info
    const adapterInfo = await adapter.requestAdapterInfo();

    // Try to get a device
    const device = await adapter.requestDevice();

    if (!device) {
      return {
        supported: false,
        reason: 'Failed to create WebGPU device',
      };
    }

    // Clean up
    device.destroy();

    return {
      supported: true,
      adapterInfo,
    };
  } catch (error) {
    return {
      supported: false,
      reason: `WebGPU initialization failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get detailed GPU information
 */
async function getGPUInfo(): Promise<{
  vendor: string;
  architecture: string;
  device: string;
  description: string;
  limits: Record<string, number>;
}> {
  if (!navigator.gpu) {
    throw new Error('WebGPU not available');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No adapter available');
  }

  const info = await adapter.requestAdapterInfo();
  const device = await adapter.requestDevice();

  const limits: Record<string, number> = {};
  const limitNames = [
    'maxTextureDimension1D',
    'maxTextureDimension2D',
    'maxTextureDimension3D',
    'maxTextureArrayLayers',
    'maxBindGroups',
    'maxBindingsPerBindGroup',
    'maxBufferSize',
    'maxStorageBufferBindingSize',
    'maxComputeWorkgroupStorageSize',
    'maxComputeInvocationsPerWorkgroup',
    'maxComputeWorkgroupSizeX',
    'maxComputeWorkgroupSizeY',
    'maxComputeWorkgroupSizeZ',
    'maxComputeWorkgroupsPerDimension',
  ];

  for (const name of limitNames) {
    const value = device.limits[name as keyof GPUSupportedLimits];
    if (typeof value === 'number') {
      limits[name] = value;
    }
  }

  device.destroy();

  return {
    vendor: info.vendor || 'Unknown',
    architecture: info.architecture || 'Unknown',
    device: info.device || 'Unknown',
    description: info.description || 'Unknown',
    limits,
  };
}

/**
 * Suggest alternatives for unsupported browsers
 */
function suggestAlternatives(): void {
  console.log('\n=== Alternatives for Unsupported Browsers ===\n');

  console.log('1. Update your browser:');
  console.log('   - Chrome 113+ (recommended)');
  console.log('   - Edge 113+');
  console.log('   - Firefox Nightly (with flags)');
  console.log('   - Safari 17+ (macOS Sonoma)');

  console.log('\n2. Enable WebGPU flags:');
  console.log('   - Chrome: chrome://flags/#enable-unsafe-webgpu');
  console.log('   - Firefox: about:config -> dom.webgpu.enabled');

  console.log('\n3. Use a CPU-based FFT library:');
  console.log('   - fft.js: https://www.npmjs.com/package/fft.js');
  console.log('   - dsp.js: https://www.npmjs.com/package/dsp.js');

  console.log('\n4. Check GPU compatibility:');
  console.log('   - WebGPU requires a modern GPU with Vulkan, Metal, or D3D12 support');
  console.log('   - Integrated GPUs may have limited support');
}

/**
 * Main example function
 */
async function main(): Promise<void> {
  console.log('=== WebGPU FFT Library - Feature Detection Example ===\n');

  // Check WebGPU support
  console.log('Checking WebGPU support...\n');
  const support = await checkWebGPUSupport();

  if (support.supported) {
    console.log('✅ WebGPU is supported!\n');

    // Get detailed GPU info
    try {
      const gpuInfo = await getGPUInfo();

      console.log('=== GPU Information ===');
      console.log(`Vendor: ${gpuInfo.vendor}`);
      console.log(`Architecture: ${gpuInfo.architecture}`);
      console.log(`Device: ${gpuInfo.device}`);
      console.log(`Description: ${gpuInfo.description}`);

      console.log('\n=== Device Limits ===');
      for (const [name, value] of Object.entries(gpuInfo.limits)) {
        console.log(`${name}: ${value.toLocaleString()}`);
      }

      // Check if limits are sufficient for FFT
      console.log('\n=== FFT Compatibility Check ===');

      const maxFFTSize = Math.min(
        gpuInfo.limits.maxStorageBufferBindingSize / 8, // 8 bytes per complex number
        65536 // Library limit
      );
      console.log(`Maximum FFT size: ${maxFFTSize.toLocaleString()} elements`);

      const maxWorkgroupSize = Math.min(
        gpuInfo.limits.maxComputeInvocationsPerWorkgroup,
        gpuInfo.limits.maxComputeWorkgroupSizeX
      );
      console.log(`Maximum workgroup size: ${maxWorkgroupSize}`);

      if (maxFFTSize >= 1024 && maxWorkgroupSize >= 64) {
        console.log('\n✅ Your GPU is fully compatible with WebGPU FFT Library!');
      } else {
        console.log('\n⚠️ Your GPU has limited capabilities. Some features may not work.');
      }
    } catch (error) {
      console.error('Failed to get GPU info:', error);
    }
  } else {
    console.log('❌ WebGPU is NOT supported');
    console.log(`Reason: ${support.reason}`);

    suggestAlternatives();
  }
}

// Run the example
main();
