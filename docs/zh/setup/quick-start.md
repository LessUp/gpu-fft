# 快速开始

> 这页提供最短的上手路径，同时明确项目边界：FFT 核心可以走 WebGPU，频谱分析和图像滤波则仍然是 CPU-only utility。

<div class="guide-summary">
  <strong>适合什么时候读：</strong>当你想先安装、先跑通、先看 API 形状，而不是立刻钻进架构或 benchmark 细节时。
</div>

## 写代码前先记住能力边界

- **GPU 路径：** `createFFTEngine()` 与 FFT / IFFT / RFFT 系列方法
- **CPU 路径：** `cpuFFT()`、`cpuIFFT()`、`cpuRFFT()`、`cpuIRFFT()` 及其 2D 版本
- **CPU-only 工具：** `createSpectrumAnalyzer()` 与 `createImageFilter()`

## 安装

```bash
npm install webgpu-fft
```

## 基础 GPU 路径

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

async function runFFT() {
  if (!(await isWebGPUAvailable())) {
    throw new Error('WebGPU 不可用，请改用 CPU fallback');
  }

  const engine = await createFFTEngine();
  const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);

  const spectrum = await engine.fft(input);
  const recovered = await engine.ifft(spectrum);

  engine.dispose();
  return recovered;
}
```

## CPU fallback

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
const spectrum = cpuFFT(input);
const recovered = cpuIFFT(spectrum);
```

## 实值输入路径

处理实值信号时，直接使用 real-input API，不要手动打包复数对：

```typescript
import { createFFTEngine, cpuIRFFT, cpuRFFT } from 'webgpu-fft';

const input = new Float32Array([0, 1, 0, -1, 0, 1, 0, -1]);

const cpuSpectrum = cpuRFFT(input);
const cpuRecovered = cpuIRFFT(cpuSpectrum);

const engine = await createFFTEngine();
const gpuSpectrum = await engine.rfft(input);
const gpuRecovered = await engine.irfft(gpuSpectrum);
engine.dispose();
```

## 2D FFT 路径

```typescript
import { createFFTEngine } from 'webgpu-fft';

async function processImage(imageData: Float32Array, width: number, height: number) {
  const engine = await createFFTEngine();
  const spectrum = await engine.fft2d(imageData, width, height);
  const recovered = await engine.ifft2d(spectrum, width, height);
  engine.dispose();
  return recovered;
}
```

## 错误处理

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft';

try {
  const engine = await createFFTEngine();
  await engine.fft(invalidInput);
} catch (error) {
  if (error instanceof FFTError) {
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        console.error('当前环境不支持 WebGPU');
        break;
      case FFTErrorCode.INVALID_INPUT_SIZE:
        console.error('输入大小必须是 2 的幂');
        break;
      default:
        console.error(`FFT Error: ${error.message}`);
    }
  }
}
```

## 下一步看什么

| 如果你想继续看 | 下一页 |
| --- | --- |
| 最短评估路线 | [起步导读](/zh/guides/getting-started) |
| 浏览器支持与 fallback 策略 | [Browser Support](/setup/browser-support) |
| 执行模型 | [架构总览](/zh/architecture/overview) |
| 实测证据 | [性能基准](/zh/showcase/benchmarks) |
