# # WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![Version](https://img.shields.io/badge/版本-1.1.0-blue.svg)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![Docs](https://img.shields.io/badge/文档-双语-blue?logo=github)](https://lessup.github.io/gpu-fft/)
[![CI](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/gpu-fft/actions/workflows/ci.yml)

[English](README.md) | 简体中文

高性能的快速傅里叶变换库，提供 WebGPU 加速的核心 FFT 引擎，以及基于 CPU 的信号与图像处理工具。

## ✨ 特性

| 特性 | 描述 |
|------|------|
| **1D FFT/IFFT** | 支持 2 到 65,536 个元素 |
| **2D FFT/IFFT** | 图像处理，最大 2048×2048 |
| **GPU 加速** | 基于 WebGPU 计算着色器 |
| **CPU 回退** | 无需 GPU 也可使用完整 FFT |
| **频域滤波** | 低通、高通、带通（Ideal 与 Gaussian） |
| **频谱分析** | 实时音频频率分析，支持窗函数 |
| **TypeScript** | 完整类型定义，严格模式支持 |
| **零依赖** | 无运行时依赖 |

## 🚀 快速开始

### 安装

```bash
npm install webgpu-fft
```

### GPU 路径（推荐）

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

// 检测 WebGPU 支持
if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();

  // 准备输入（交错格式：[实部, 虚部, 实部, 虚部, ...]）
  const input = new Float32Array(16); // 8 个复数
  for (let i = 0; i < 8; i++) {
    input[i * 2] = Math.sin(i);     // 实部
    input[i * 2 + 1] = 0;           // 虚部
  }

  const fftResult = await engine.fft(input);
  const ifftResult = await engine.ifft(fftResult);

  engine.dispose(); // 释放 GPU 资源
}
```

### CPU 路径（无需 GPU）

```typescript
import { cpuFFT, cpuIFFT } from 'webgpu-fft';

const input = new Float32Array([1, 0, 2, 0, 3, 0, 4, 0]);
const spectrum = cpuFFT(input);
const recovered = cpuIFFT(spectrum);
```

## 📖 API 参考

### 核心 FFT 引擎

```typescript
import { createFFTEngine, type FFTEngineConfig } from 'webgpu-fft';

// 使用默认配置创建
const engine = await createFFTEngine();

// 1D 变换
const spectrum = await engine.fft(input);
const signal = await engine.ifft(spectrum);

// 2D 变换
const freq2d = await engine.fft2d(input, width, height);
const spatial2d = await engine.ifft2d(freq2d, width, height);

// 清理资源
engine.dispose();
```

> ⚠️ **注意**：当前 GPU 着色器仅支持 `workgroupSize: 256`。`enableBankConflictOptimization` 选项预留给未来使用。

### CPU FFT 函数

```typescript
import {
  cpuFFT, cpuIFFT,
  cpuFFT2D, cpuIFFT2D,
  validateFFTInput, validateFFT2DInput
} from 'webgpu-fft';

// 1D 变换
const spectrum = cpuFFT(input);
const signal = cpuIFFT(spectrum);

// 2D 变换
const freq2d = cpuFFT2D(input, width, height);
const spatial2d = cpuIFFT2D(freq2d, width, height);

// 输入验证
validateFFTInput(input); // 无效输入会抛出异常
```

### 频谱分析器

```typescript
import { createSpectrumAnalyzer } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,     // 必须为 2 的幂
  sampleRate: 44100  // 采样率 (Hz)
});

// 分析音频数据（返回 dB 值）
const spectrum = await analyzer.analyze(audioData);

// 获取频率 bin 中心频率
const frequencies = analyzer.getFrequencies();

// 获取特定 bin 的频率
const freq = analyzer.getFrequency(10); // 第 10 个 bin 的频率

analyzer.dispose();
```

### 图像滤波器

```typescript
import { createImageFilter, type FilterType, type FilterShape } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',           // 'lowpass' | 'highpass' | 'bandpass'
  shape: 'gaussian',         // 'ideal' | 'gaussian'
  cutoffFrequency: 0.3,      // 0.0 到 1.0
  bandwidth: 0.1             // 仅 bandpass 模式需要
});

// 应用滤波器（imageData 为交错复数格式：[r,i,r,i,...]）
const filtered = await filter.apply(imageData, width, height);

filter.dispose();
```

### 窗函数

```typescript
import {
  hannWindow, hammingWindow, blackmanWindow,
  flatTopWindow, rectangularWindow,
  applyWindow, applyWindowComplex
} from 'webgpu-fft';

// 生成窗函数
const window = hannWindow(1024);

// 应用到信号
const windowedReal = applyWindow(signal, window);
const windowedComplex = applyWindowComplex(complexSignal, window);
```

### GPU 检测

```typescript
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft';

// 异步完整检测（验证 adapter 可用性）
if (await isWebGPUAvailable()) {
  // WebGPU 完全支持
}

// 同步检测（仅检查 API 存在性）
if (hasWebGPUSupport()) {
  // navigator.gpu 存在
}
```

### 复数运算

```typescript
import {
  complexAdd, complexSub, complexMul,
  complexMagnitude, complexConj, complexScale,
  twiddleFactor, twiddleFactorInverse,
  interleavedToComplex, complexToInterleaved,
  complexApproxEqual,
  naiveDFT, naiveIDFT
} from 'webgpu-fft';
```

### 位反转工具

```typescript
import {
  bitReverse, log2, isPowerOf2,
  bitReversalPermutation, bitReversalPermutationInPlace
} from 'webgpu-fft';
```

### 错误处理

```typescript
import { FFTError, FFTErrorCode } from 'webgpu-fft';

try {
  await engine.fft(invalidInput);
} catch (error) {
  if (error instanceof FFTError) {
    console.error(`[${error.code}] ${error.message}`);
    // 处理特定错误码
    switch (error.code) {
      case FFTErrorCode.WEBGPU_NOT_AVAILABLE:
        // 回退到 CPU
        break;
      case FFTErrorCode.INVALID_INPUT_SIZE:
        // 修正输入大小
        break;
      // ...
    }
  }
}
```

## 🌐 浏览器兼容性

GPU 加速需要 WebGPU 支持。支持的浏览器：

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 113+ | ✅ 稳定支持 |
| Edge | 113+ | ✅ 稳定支持 |
| Firefox | 128+ | ✅ 稳定支持 |
| Safari | 17+ | ⚠️ 预览版 |

> **注意**：使用 `isWebGPUAvailable()` 检测支持情况，不支持时可使用 `cpuFFT`/`cpuIFFT` 作为回退。

## 🔧 算法实现

### Cooley-Tukey Radix-2 DIT

本库实现了经典的 Cooley-Tukey Radix-2 Decimation-In-Time 算法：

1. **位反转置换** - 重排输入数据
2. **蝴蝶操作** - log₂(N) 个阶段的并行蝴蝶运算
3. **旋转因子** - 预计算的复数指数

### GPU 执行说明

- 当前着色器仅支持 `workgroupSize: 256`
- `enableBankConflictOptimization` 预留给未来优化
- 频谱分析器和图像滤波器内部使用 CPU FFT

## 🧪 测试

```bash
# 运行所有测试
npm test

# 带覆盖率
npm run test:coverage

# 监视模式
npm run test:watch
```

### 测试覆盖率

| 模块 | 覆盖率 |
|------|--------|
| 着色器 | 100% |
| CPU 工具 | 91.55% |
| 应用层 | 91.62% |
| 复数运算 | 78.5% |
| 核心错误 | 100% |

## 🔍 故障排除

### WebGPU 不可用

```
FFTError: WebGPU is not available
```

**解决方案：**
1. 使用 `isWebGPUAvailable()` 检测并回退到 CPU
2. 更新浏览器到最新版本
3. 启用 WebGPU 标志（Firefox/Safari）
4. 检查 GPU 兼容性

### 输入大小无效

```
FFTError: Input size must be a power of 2
```

**解决方案：** 确保输入长度为 2 的幂（2, 4, 8, ..., 65536）。

### 输入过大

```
FFTError: Input size exceeds maximum of 65536
```

**解决方案：** 将数据分成小块处理，或使用 CPU 实现。

### 性能优化建议

1. 复用 `FFTEngine` 实例（Buffer 缓存）
2. 使用完毕后调用 `dispose()`
3. 小型变换（< 1024 元素）可考虑 CPU 路径

## 📊 性能特性

| 特性 | 描述 |
|------|------|
| **批量命令** | 每次变换使用单个命令缓冲区 |
| **Buffer 复用** | 相同大小的变换复用 GPU Buffer |
| **Pipeline 缓存** | 编译后的着色器被缓存 |
| **并行执行** | GPU 计算着色器 |

## 🗺️ 路线图

### 计划功能

- [ ] 3D FFT 支持
- [ ] 实值 FFT 优化 (RFFT)
- [ ] GPU 原生图像滤波
- [ ] 卷积运算
- [ ] WASM 回退

### 已知限制

- GPU 着色器仅支持 `workgroupSize: 256`
- 频谱分析器内部使用 CPU FFT
- 最大 1D 大小：65,536 元素
- 最大 2D 大小：2048×2048

## 📁 项目结构

```
src/
├── core/                    # 核心 GPU 引擎
│   ├── fft-engine.ts        # 主 FFT 实现
│   ├── gpu-resource-manager.ts
│   └── errors.ts            # 自定义错误类型
├── shaders/                 # WGSL 着色器源码
│   └── sources.ts           # 着色器代码权威来源
├── utils/                   # CPU 工具
│   ├── complex.ts           # 复数运算
│   ├── bit-reversal.ts      # 位反转工具
│   ├── cpu-fft.ts           # CPU FFT 实现
│   ├── gpu-detect.ts        # WebGPU 检测
│   └── window-functions.ts  # 信号窗函数
├── apps/                    # 应用层 API
│   ├── spectrum-analyzer.ts
│   └── image-filter.ts
├── types.ts                 # 类型定义
└── index.ts                 # 公共 API 导出
```

## 📚 参考资料

- [Cooley-Tukey FFT 算法](https://en.wikipedia.org/wiki/Cooley%E2%80%93Tukey_FFT_algorithm)
- [WebGPU 规范](https://www.w3.org/TR/webgpu/)
- [WGSL 规范](https://www.w3.org/TR/WGSL/)
- [GPU Shared Memory Bank Conflicts](https://developer.nvidia.com/blog/using-shared-memory-cuda-cc/)

## 🤝 贡献

欢迎贡献！请在提交 Pull Request 之前阅读我们的[贡献指南](CONTRIBUTING.md)和[行为准则](CODE_OF_CONDUCT.md)。

## 📄 许可证

[MIT](LICENSE) © WebGPU FFT Library Contributors

## 🙏 致谢

- WebGPU 工作组提供的优秀 API 设计
- fast-check 团队提供的属性测试库
- 所有帮助改进这个库的贡献者
