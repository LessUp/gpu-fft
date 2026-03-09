# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)
[![Docs](https://img.shields.io/badge/Docs-GitHub%20Pages-blue?logo=github)](https://lessup.github.io/gpu-fft/)

中文 | [English](README.en.md)

高性能的快速傅里叶变换库，利用 WebGPU 计算着色器在 GPU 上实现 FFT 算法。

## ✨ 特性

- **1D FFT/IFFT** - 支持 2 到 65536 个元素的快速傅里叶变换
- **2D FFT/IFFT** - 图像处理的二维傅里叶变换（最大 2048×2048）
- **Bank Conflict 优化** - 消除 GPU Shared Memory 访问冲突
- **位反转置换** - 高效的并行位反转实现
- **频域滤波** - 低通/高通/带通滤波器（Ideal 和 Gaussian）
- **音频频谱分析** - 实时音频频谱分析
- **窗函数** - Hann、Hamming、Blackman、Flat-top、矩形窗
- **CPU 回退** - 完整的 CPU FFT 实现，无需 GPU 也可使用
- **GPU 检测** - `isWebGPUAvailable()` 自动检测 GPU 支持
- **TypeScript** - 完整的类型定义
- **属性测试** - 使用 fast-check 进行全面的正确性验证

## 🚀 快速开始

### 安装

```bash
npm install webgpu-fft
```

### GPU 路径

```typescript
import { createFFTEngine, isWebGPUAvailable } from 'webgpu-fft';

// 检测 GPU 支持
if (await isWebGPUAvailable()) {
  const engine = await createFFTEngine();

  // 准备输入数据（交错格式：[real, imag, real, imag, ...]）
  const input = new Float32Array(16); // 8 个复数
  for (let i = 0; i < 8; i++) {
    input[i * 2] = Math.sin(i);     // 实部
    input[i * 2 + 1] = 0;           // 虚部
  }

  const fftResult = await engine.fft(input);
  const ifftResult = await engine.ifft(fftResult);

  engine.dispose();
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

### FFT 引擎（GPU）

```typescript
// 使用默认配置创建
const engine = await createFFTEngine();

// 使用自定义配置创建
const engine = await createFFTEngine({
  enableBankConflictOptimization: true,
  workgroupSize: 256
});

// 1D FFT
const result = await engine.fft(input);
const inverse = await engine.ifft(result);

// 2D FFT
const result2d = await engine.fft2d(input, width, height);
const inverse2d = await engine.ifft2d(result2d, width, height);

// 释放资源
engine.dispose();
```

### CPU FFT

```typescript
import { cpuFFT, cpuIFFT, cpuFFT2D, cpuIFFT2D } from 'webgpu-fft';

// 1D
const spectrum = cpuFFT(input);
const signal = cpuIFFT(spectrum);

// 2D
const freq2d = cpuFFT2D(input, width, height);
const spatial2d = cpuIFFT2D(freq2d, width, height);
```

### 频谱分析器

```typescript
import { createSpectrumAnalyzer } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,    // 任意 2 的幂
  sampleRate: 44100
});

// 分析音频数据（返回 dB 值）
const spectrum = await analyzer.analyze(audioData);

// 获取频率信息
const frequencies = analyzer.getFrequencies();

analyzer.dispose();
```

### 图像滤波器

```typescript
import { createImageFilter } from 'webgpu-fft';

const filter = await createImageFilter({
  type: 'lowpass',      // 'lowpass' | 'highpass' | 'bandpass'
  shape: 'gaussian',    // 'ideal' | 'gaussian'
  cutoffFrequency: 0.3, // 0.0 到 1.0
  bandwidth: 0.1,       // 仅 bandpass 模式
});

const filtered = await filter.apply(imageData, width, height);

filter.dispose();
```

### 窗函数

```typescript
import {
  hannWindow,
  hammingWindow,
  blackmanWindow,
  flatTopWindow,
  rectangularWindow,
  applyWindow,
  applyWindowComplex,
} from 'webgpu-fft';

const window = hannWindow(1024);
const windowed = applyWindow(signal, window);
```

### GPU 检测

```typescript
import { isWebGPUAvailable, hasWebGPUSupport } from 'webgpu-fft';

// 异步完整检测（验证 adapter 可用性）
if (await isWebGPUAvailable()) { /* GPU 可用 */ }

// 同步 API 检测（仅检查 navigator.gpu 存在性）
if (hasWebGPUSupport()) { /* API 存在 */ }
```

### 复数运算

```typescript
import {
  complexAdd, complexSub, complexMul,
  complexMagnitude, complexConj, complexScale,
  interleavedToComplex, complexToInterleaved,
} from 'webgpu-fft';
```

## 🌐 浏览器兼容性

需要 WebGPU 支持。以下浏览器已支持：

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 113+ | ✅ 稳定支持 |
| Edge | 113+ | ✅ 稳定支持 |
| Firefox | Nightly | ⚠️ 需要开启 flag |
| Safari | 17+ | ⚠️ 预览版 |

> **注意**: 不支持 WebGPU 的环境可以使用 `cpuFFT` / `cpuIFFT` 等 CPU 实现作为回退方案。

## 🔧 算法实现

### Cooley-Tukey Radix-2 DIT

本库实现了经典的 Cooley-Tukey Radix-2 Decimation-In-Time (DIT) 算法：

1. **位反转置换** - 重排输入数据
2. **蝴蝶操作** - log₂(N) 个阶段的并行蝴蝶运算
3. **旋转因子** - 使用预计算的复数指数

### Bank Conflict 优化

GPU Shared Memory 通常有 32 个 bank。当多个线程同时访问同一 bank 时会发生冲突。本库通过添加 padding 来消除冲突：

```
标准布局（有冲突）:
Index:  0   1   2  ... 31  32  33 ...
Bank:   0   1   2  ... 31   0   1 ...  ← 冲突！

Padded 布局（无冲突）:
Index:  0   1   2  ... 31  PAD  32  33 ...
Bank:   0   1   2  ... 31   X    1   2 ...  ← 无冲突
```

## 🧪 测试

运行所有测试（包括属性测试）：

```bash
npm test
```

测试覆盖：
- ✅ 复数运算正确性（Property 5-8）
- ✅ 位反转 Round-Trip（Property 3-4）
- ✅ FFT 匹配 DFT 定义（Property 2）
- ✅ FFT/IFFT Round-Trip（Property 1, 9）
- ✅ 输出格式验证（Property 16）
- ✅ 错误处理（Property 17）
- ✅ 滤波器衰减特性（Property 10-11）
- ✅ 频谱分析器（Property 12-15）
- ✅ 窗函数正确性

## 📊 性能

- **批量命令提交** - 所有 GPU 计算阶段合并为单次命令提交
- **Buffer 复用** - 相同大小的 FFT 调用复用 GPU Buffer，避免重复分配/销毁
- **Pipeline 缓存** - 着色器编译结果缓存，消除重复编译开销
- **Bank Conflict 优化** - Shared Memory padding 消除访问冲突
- **并行执行** - 充分利用 GPU 并行计算能力

## 📁 项目结构

```
src/
├── core/              # 核心 FFT 引擎
│   ├── fft-engine.ts
│   ├── gpu-resource-manager.ts
│   └── errors.ts
├── shaders/           # WebGPU 着色器
│   ├── sources.ts     # 着色器源码集中管理
│   ├── complex.wgsl   # 参考文件
│   ├── bit-reversal.wgsl
│   ├── butterfly.wgsl
│   └── filter.wgsl
├── utils/             # 工具函数
│   ├── complex.ts
│   ├── bit-reversal.ts
│   ├── cpu-fft.ts
│   ├── gpu-detect.ts
│   └── window-functions.ts
├── apps/              # 应用层
│   ├── spectrum-analyzer.ts
│   └── image-filter.ts
├── types.ts           # 类型定义
└── index.ts           # 公共 API 导出

tests/                 # 测试文件
├── complex.test.ts
├── bit-reversal.test.ts
├── fft.test.ts
├── fft-roundtrip.test.ts
├── filter.test.ts
├── spectrum-analyzer.test.ts
└── window-functions.test.ts
```

## 🔍 故障排除

### WebGPU 不可用

**问题**: `FFTError: WebGPU is not available`

**解决方案**:
1. 使用 `isWebGPUAvailable()` 检测并回退到 CPU 实现
2. 更新浏览器到最新版本
3. 在浏览器设置中启用 WebGPU（Firefox/Safari）
4. 检查 GPU 是否支持 WebGPU

### 输入大小无效

**问题**: `FFTError: Input size must be a power of 2`

**解决方案**: 确保输入数组长度是 2 的幂（2, 4, 8, 16, ..., 65536）。

### 性能问题

**优化建议**:
1. 启用 Bank Conflict 优化（默认开启）
2. 复用 FFT 引擎实例，避免重复创建（`SizeCache` 自动复用同尺寸 Buffer）
3. 使用完毕后调用 `dispose()` 释放 GPU 资源
4. 对于不需要 GPU 的场景，直接使用 `cpuFFT` 避免 GPU 开销

## ✅ 正确性保证

本库通过以下方式确保正确性：

1. **属性测试** - 使用 fast-check 生成随机输入，验证数学性质
2. **Round-Trip 测试** - FFT → IFFT 应返回原始输入
3. **DFT 对比** - 小规模输入与朴素 DFT 实现对比
4. **已知值测试** - 验证特殊输入（常数、脉冲、正弦波）的输出

## � 在线文档

项目文档已通过 GitHub Pages 发布：

> **https://lessup.github.io/gpu-fft/**

包含：
- [API 参考文档](https://lessup.github.io/gpu-fft/api) — TypeDoc 生成的完整 API 文档
- [在线 Demo](https://lessup.github.io/gpu-fft/demo) — 音频频谱分析器、图像频域滤波器

## �📚 参考资料

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
