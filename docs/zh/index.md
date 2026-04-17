# WebGPU FFT 库

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](/changelog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

高性能的 WebGPU 加速快速傅里叶变换（FFT）库。

## 快速开始

### 安装

```bash
npm install webgpu-fft
```

### 基础用法

```typescript
import { createFFTEngine } from 'webgpu-fft'

const engine = await createFFTEngine()
const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0])
const spectrum = await engine.fft(input)
engine.dispose()
```

## 特性

| 特性 | 描述 |
|------|------|
| **1D FFT/IFFT** | 支持 2 到 65,536 个元素 |
| **2D FFT/IFFT** | 图像处理支持高达 2048×2048 |
| **GPU 加速** | WebGPU 计算着色器 |
| **CPU 回退** | 完整的 CPU 实现 |
| **频域滤波** | 低通、高通、带通 |
| **频谱分析** | 实时音频频率分析 |
| **TypeScript** | 完整的类型定义 |
| **零依赖** | 无运行时依赖 |

## 浏览器支持

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 113+ | ✅ 稳定 |
| Edge | 113+ | ✅ 稳定 |
| Firefox | 128+ | ✅ 稳定 |
| Safari | 17+ | ⚠️ 预览 |

## 文档导航

- [教程](/zh/tutorials/introduction) - 介绍和快速开始
- [API 参考](/api/index) - 完整的 API 文档（英文）
- [规范文档](/specs/) - 产品需求和技术设计

## 状态

> **中文文档正在完善中**。欢迎贡献翻译！

## 许可证

[MIT](https://opensource.org/licenses/MIT) © WebGPU FFT Library Contributors
