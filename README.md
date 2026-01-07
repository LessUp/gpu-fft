# WebGPU FFT Library

[![npm version](https://img.shields.io/npm/v/webgpu-fft.svg)](https://www.npmjs.com/package/webgpu-fft)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green.svg)](https://www.w3.org/TR/webgpu/)

中文 | [English](README.en.md)

高性能的快速傅里叶变换库，利用 WebGPU 计算着色器在 GPU 上实现 FFT 算法。

## ✨ 特性

- **1D FFT/IFFT** - 支持 2 到 65536 个元素的快速傅里叶变换
- **2D FFT/IFFT** - 图像处理的二维傅里叶变换（最大 2048×2048）
- **Bank Conflict 优化** - 消除 GPU Shared Memory 访问冲突
- **位反转置换** - 高效的并行位反转实现
- **频域滤波** - 低通/高通滤波器（Ideal 和 Gaussian）
- **音频频谱分析** - 实时音频频谱分析（支持 Hann 窗函数）
- **TypeScript** - 完整的类型定义
- **属性测试** - 使用 fast-check 进行全面的正确性验证

## 🚀 快速开始

### 安装

```bash
npm install webgpu-fft
```

### 基本使用

```typescript
import { createFFTEngine } from 'webgpu-fft';

// 创建 FFT 引擎
const engine = await createFFTEngine();

// 准备输入数据（交错格式：[real, imag, real, imag, ...]）
const input = new Float32Array(16); // 8 个复数
for (let i = 0; i < 8; i++) {
  input[i * 2] = Math.sin(i);     // 实部
  input[i * 2 + 1] = 0;           // 虚部
}

// 计算 FFT
const fftResult = await engine.fft(input);

// 计算 IFFT
const ifftResult = await engine.ifft(fftResult);

// 释放资源
engine.dispose();
```

## 📖 API 参考

### FFT 引擎

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

### 频谱分析器

```typescript
import { createSpectrumAnalyzer } from 'webgpu-fft';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,
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
  type: 'lowpass',      // 'lowpass' 或 'highpass'
  shape: 'gaussian',    // 'ideal' 或 'gaussian'
  cutoffFrequency: 0.3  // 0.0 到 1.0
});

// 应用滤波器
const filtered = await filter.apply(imageData, width, height);

filter.dispose();
```

## 🌐 浏览器兼容性

需要 WebGPU 支持。以下浏览器已支持：

| 浏览器 | 最低版本 | 状态 |
|--------|---------|------|
| Chrome | 113+ | ✅ 稳定支持 |
| Edge | 113+ | ✅ 稳定支持 |
| Firefox | Nightly | ⚠️ 需要开启 flag |
| Safari | 17+ | ⚠️ 预览版 |

### 检测 WebGPU 支持

```typescript
if (!navigator.gpu) {
  console.error('当前浏览器不支持 WebGPU');
  // 提供降级方案或显示错误信息
}
```

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

## 🔍 故障排除

### WebGPU 不可用

**问题**: `FFTError: WebGPU is not available`

**解决方案**:
1. 更新浏览器到最新版本
2. 在浏览器设置中启用 WebGPU（Firefox/Safari）
3. 检查 GPU 是否支持 WebGPU
4. 尝试使用其他浏览器

### 输入大小无效

**问题**: `FFTError: Input size must be a power of 2`

**解决方案**: 确保输入数组长度是 2 的幂（2, 4, 8, 16, ..., 65536）。

### 性能问题

**优化建议**:
1. 启用 Bank Conflict 优化（默认开启）
2. 根据使用场景选择合适的 FFT 大小
3. 复用 FFT 引擎实例，避免重复创建
4. 使用完毕后调用 `dispose()` 释放 GPU 资源

## 📊 性能

- **Bank Conflict 优化**: 通过 padding 消除 Shared Memory 冲突
- **并行执行**: 充分利用 GPU 并行计算能力
- **Pipeline 缓存**: 复用计算 pipeline 减少开销
- **Buffer 池化**: 减少 GPU 内存分配次数

## 🗺️ 路线图

### 计划中的功能

- [ ] 3D FFT 支持
- [ ] 实数 FFT 优化（RFFT）
- [ ] 卷积运算
- [ ] 更多窗函数（Hamming, Blackman 等）
- [ ] WebGL 降级方案
- [ ] WASM 降级方案

### 已知限制

- 最大 FFT 大小：65,536 个元素
- 最大 2D 大小：2048×2048 像素
- 需要支持 WebGPU 的浏览器和 GPU

## 📁 项目结构

```
src/
├── core/              # 核心 FFT 引擎
│   ├── fft-engine.ts
│   ├── gpu-resource-manager.ts
│   └── errors.ts
├── shaders/           # WebGPU 着色器
│   ├── complex.wgsl
│   ├── bit-reversal.wgsl
│   ├── butterfly.wgsl
│   └── filter.wgsl
├── utils/             # 工具函数
│   ├── complex.ts
│   ├── bit-reversal.ts
│   ├── cpu-fft.ts
│   └── window-functions.ts
├── apps/              # 应用层
│   ├── spectrum-analyzer.ts
│   └── image-filter.ts
└── types.ts           # 类型定义

tests/                 # 测试文件
├── complex.test.ts
├── bit-reversal.test.ts
├── fft.test.ts
├── fft-roundtrip.test.ts
├── filter.test.ts
└── spectrum-analyzer.test.ts

examples/              # 示例代码
├── basic-fft.ts
├── 2d-fft.ts
├── spectrum-analyzer.ts
└── image-filtering.ts
```

## ✅ 正确性保证

本库通过以下方式确保正确性：

1. **属性测试** - 使用 fast-check 生成随机输入，验证数学性质
2. **Round-Trip 测试** - FFT → IFFT 应返回原始输入
3. **DFT 对比** - 小规模输入与朴素 DFT 实现对比
4. **已知值测试** - 验证特殊输入（常数、脉冲、正弦波）的输出

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
