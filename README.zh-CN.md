# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/文档-双语-blue?logo=github)](https://lessup.github.io/gpu-fft/)

[English](README.md) | 简体中文

> **高性能 GPU 加速快速傅里叶变换库**，专为 JavaScript/TypeScript 设计。WebGPU 计算着色器在大尺寸变换上可实现**最高约 92 倍加速**。项目提供 GPU FFT 内核，并附带用于频谱分析和频域图像滤波的 CPU 工具，零运行时依赖。

## ⚡ 为什么选择 WebGPU FFT？

| | **webgpu-fft** | 纯 CPU 库 | Python (numpy) |
|---|---|---|---|
| **GPU 加速** | ✅ WebGPU 着色器 | ❌ 仅 CPU | ❌ 仅 CPU |
| **1D FFT (65K)** | ~3ms | ~300ms | ~50ms |
| **2D FFT (1024²)** | ~8ms | ~3s | ~100ms |
| **频域滤波** | ✅ 内置（CPU 工具） | 手动实现 | 手动实现 |
| **频谱分析** | ✅ 内置（CPU 工具） | 手动实现 | 手动实现 |
| **浏览器原生** | ✅ 无需 WASM | ✅ | ❌ 服务端 |
| **零依赖** | ✅ | ✅ | ❌ |
| **TypeScript** | ✅ 严格模式 | 因库而异 | ❌ |

**最高提速 92 倍**，完整 TypeScript 支持，零依赖。

## 🚀 快速开始

### 安装

```bash
npm install webgpu-fft
```

### 基础 1D FFT

```typescript
import { createFFTEngine } from 'webgpu-fft';

const engine = await createFFTEngine();

// 输入：交错格式 [实部, 虚部, 实部, 虚部, ...]
const signal = new Float32Array(8 * 2);
for (let i = 0; i < 8; i++) {
  signal[i * 2] = Math.sin(i);   // 实部
  signal[i * 2 + 1] = 0;         // 虚部
}

const spectrum = await engine.fft(signal);
const recovered = await engine.ifft(spectrum);

engine.dispose(); // 释放 GPU 资源
```

### CPU 回退（无需 GPU）

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const spectrum = cpuFFT(signal);
const recovered = cpuIFFT(spectrum);
```

## 📊 性能表现

### 1D FFT 速度

| 大小 | GPU | CPU | 加速比 |
|------|-----|-----|--------|
| 1,024 | 0.18ms | 2.3ms | **13x** |
| 4,096 | 0.35ms | 11.5ms | **33x** |
| 16,384 | 0.89ms | 58.2ms | **65x** |
| 65,536 | 3.24ms | 298.7ms | **92x** |

### 2D FFT 速度

| 图像大小 | GPU | CPU | 加速比 |
|----------|-----|-----|--------|
| 256×256 | 1.56ms | 156ms | **100x** |
| 1024×1024 | 8.23ms | 2.9s | **358x** |

*测试环境：RTX 3080 + i9-10900K。包含数据传输开销。*

## 🎯 应用场景

### 音频频谱分析

```typescript
import { createSpectrumAnalyzer, WindowType } from 'webgpu-fft';

const analyzer = createSpectrumAnalyzer({
  fftSize: 2048,
  windowType: WindowType.Hann,
  sampleRate: 44100,
});

const audioBuffer = new Float32Array(2048);
// ... 从 Web Audio API 填充 ...

const spectrum = analyzer.analyze(audioBuffer); // 每个 bin 的 dB 值
const frequencies = analyzer.getFrequencies();  // 每个 bin 对应的 Hz
```

> **说明：** `createSpectrumAnalyzer()` 当前是 CPU-only，不会走 GPU FFT 内核。

### 频域图像滤波

```typescript
import { createImageFilter } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',
  shape: 'gaussian',
  cutoffFrequency: 0.3,
});

// 低通滤波（模糊）
const blurred = await filter.apply(imageData, 512, 512);

// 高通滤波（边缘检测）
const edgeFilter = await createImageFilter({
  type: 'highpass',
  shape: 'gaussian',
  cutoffFrequency: 0.1,
});
const edges = await edgeFilter.apply(imageData, 512, 512);

filter.dispose();
```

> **说明：** `createImageFilter()` 当前是 CPU-only，内部使用 CPU 版 2D FFT。

## 📖 API 概览

### 核心引擎

| 方法 | 说明 | 最大尺寸 |
|------|------|----------|
| `fft(data)` | 1D 正向 FFT | 65,536 |
| `ifft(data)` | 1D 逆向 FFT | 65,536 |
| `fft2d(data, w, h)` | 2D 正向 FFT | 2048×2048 |
| `ifft2d(data, w, h)` | 2D 逆向 FFT | 2048×2048 |
| `dispose()` | 释放 GPU 资源 | - |

### 工具函数

| API | 用途 |
|-----|------|
| `cpuFFT()` / `cpuIFFT()` | CPU 回退实现 |
| `createSpectrumAnalyzer()` | 实时音频分析（CPU 工具） |
| `createImageFilter()` | 频域滤波（CPU 工具） |
| `isWebGPUAvailable` | 检测 GPU 支持 |
| 窗函数 | Hann, Hamming, Blackman, FlatTop |
| 复数工具 | 加减乘、幅度、旋转因子 |

### 输入格式

所有 FFT 函数期望**交错复数数据**：
```typescript
// [实部₀, 虚部₀, 实部₁, 虚部₁, 实部₂, 虚部₂, ...]
const data = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
// 表示：1+0i, 2+0i, 3+0i, 4+0i
```

### 错误处理

```typescript
import { FFTError } from 'webgpu-fft';

try {
  await engine.fft(invalidData);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`[${error.code}] ${error.message}`);
  }
}
```

> 📚 **完整 API 文档**：查看[文档站点](https://lessup.github.io/gpu-fft/api/index)获取详细函数签名、类型和示例。

## 🌐 浏览器兼容性

| 浏览器 | 版本 | GPU | CPU |
|--------|------|-----|-----|
| Chrome | 113+ | ✅ 稳定 | ✅ |
| Edge | 113+ | ✅ 稳定 | ✅ |
| Firefox | 128+ | ✅ 稳定 | ✅ |
| Safari | 17+ | ⚠️ 预览 | ✅ |

建议使用 `isWebGPUAvailable` 检测支持，并回退到 CPU。

## 📦 包信息

| 指标 | 数值 |
|------|------|
| **打包体积 (ESM)** | ~27 kB |
| **打包体积 (CJS)** | ~22 kB |
| **运行时依赖** | 0 |
| **Node 版本** | ≥18.0.0 |
| **导出格式** | ESM + CJS + 类型定义 |

## 🧪 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage

# 代码检查与格式化
npm run lint:fix
npm run format

# 性能基准测试
npm run benchmark

# 本地文档
npm run docs:dev

# 本地演示
npx serve examples/web
```

## 🔍 故障排除

| 问题 | 解决方案 |
|------|----------|
| `WebGPU is not available` | 更新浏览器，或使用 `cpuFFT` 回退 |
| `Input size must be power of 2` | 填充或截断到最近的 2 的幂 |
| `Input size exceeds maximum` | 拆分数据或使用 CPU 实现 |
| 首次运行较慢 | 着色器编译开销 — 复用 engine 实例 |

> 📖 **完整故障排除指南**：[文档 → 浏览器支持](https://lessup.github.io/gpu-fft/setup/browser-support)

## 🗺️ 路线图

- [ ] 3D FFT 支持
- [ ] 实值 FFT 优化 (RFFT)
- [ ] GPU 原生图像滤波
- [ ] 卷积运算
- [ ] WASM 回退

## 🤝 贡献

欢迎贡献！请阅读[贡献指南](CONTRIBUTING.md)和[行为准则](CODE_OF_CONDUCT.md)。

本项目遵循 **OpenSpec 驱动开发** — 规范真源位于 [`openspec/specs/`](openspec/specs/)，所有非平凡改动都应通过 OpenSpec 变更流程推进。

## 📄 许可证

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 致谢

- [WebGPU 工作组](https://www.w3.org/TR/webgpu/) 提供的优秀 API 设计
- [fast-check](https://github.com/dubzzz/fast-check) 提供的属性测试库
- [Cooley-Tukey FFT 算法](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
