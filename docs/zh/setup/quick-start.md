# 快速开始

## 安装

```bash
npm install webgpu-fft
```

## 基础 1D FFT（GPU 路径）

```typescript
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();

// 输入：交错复数 [实部, 虚部, 实部, 虚部, ...]
const signal = new Float32Array(8 * 2);
for (let i = 0; i < 8; i++) {
  signal[i * 2] = Math.sin(i);   // 实部
  signal[i * 2 + 1] = 0;         // 虚部
}

const spectrum = await engine.fft(signal);
const recovered = await engine.ifft(spectrum);

engine.dispose(); // 释放 GPU 资源
```

## CPU 回退（无需 GPU）

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const spectrum = cpuFFT(signal);
const recovered = cpuIFFT(spectrum);
```

## 实值 FFT（RFFT / IRFFT）

```typescript
import { createFFTEngine, createRealFFTBackend, CPUFFTBackend } from 'webgpu-fft';

const realSignal = new Float32Array([0, 1, 0, -1, 0, 1, 0, -1]);

// CPU 路径
const cpuRealFFT = createRealFFTBackend(new CPUFFTBackend());
const cpuSpectrum = cpuRealFFT.rfft(realSignal); // N / 2 + 1 个复数频点
const cpuRecovered = cpuRealFFT.irfft(cpuSpectrum);

// GPU 路径
const engine = await createFFTEngine();
const gpuSpectrum = await engine.rfft(realSignal);
const gpuRecovered = await engine.irfft(gpuSpectrum);
engine.dispose();
```

## 下一步

- [1D FFT 教程](/tutorials/1d-fft) — 理解输出格式与频点含义
- [浏览器支持](/setup/browser-support) — 检查 WebGPU 可用性与回退策略
- [API 参考](/api/index) — 完整的类型化接口文档
