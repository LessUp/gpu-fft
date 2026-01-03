# WebGPU FFT Library

高性能的快速傅里叶变换库，利用 WebGPU 计算着色器在 GPU 上实现 FFT 算法。

## 特性

- ✅ **1D FFT/IFFT** - 支持 2 到 65536 个元素的快速傅里叶变换
- ✅ **2D FFT/IFFT** - 图像处理的二维傅里叶变换
- ✅ **Bank Conflict 优化** - 消除 GPU Shared Memory 访问冲突
- ✅ **位反转置换** - 高效的并行位反转实现
- ✅ **频域滤波** - 低通/高通滤波器（Ideal 和 Gaussian）
- ✅ **音频频谱分析** - 实时音频频谱分析（支持 Hann 窗函数）
- ✅ **TypeScript** - 完整的类型定义
- ✅ **属性测试** - 使用 fast-check 进行全面的正确性验证

## 安装

```bash
npm install
```

## 使用示例

### 1D FFT

```typescript
import { createFFTEngine } from './src/index';

// 创建 FFT 引擎
const engine = await createFFTEngine({
  enableBankConflictOptimization: true,
  workgroupSize: 256
});

// 准备输入数据（交错格式：[real, imag, real, imag, ...]）
const input = new Float32Array(16); // 8 个复数
for (let i = 0; i < 8; i++) {
  input[i * 2] = Math.sin(i); // 实部
  input[i * 2 + 1] = 0;       // 虚部
}

// 计算 FFT
const fftResult = await engine.fft(input);

// 计算 IFFT
const ifftResult = await engine.ifft(fftResult);

engine.dispose();
```

### 音频频谱分析

```typescript
import { createSpectrumAnalyzer } from './src/index';

const analyzer = await createSpectrumAnalyzer({
  fftSize: 1024,
  sampleRate: 44100
});

// 分析音频数据
const audioData = new Float32Array(1024); // 音频样本
const spectrum = await analyzer.analyze(audioData); // 返回 dB 值

// 获取频率信息
const frequencies = analyzer.getFrequencies();

analyzer.dispose();
```

### 图像滤波

```typescript
import { createImageFilter } from './src/index';

const filter = await createImageFilter({
  type: 'lowpass',
  shape: 'gaussian',
  cutoffFrequency: 0.3
});

// 应用滤波器
const imageData = new Float32Array(256 * 256 * 2); // 256x256 复数图像
const filtered = await filter.apply(imageData, 256, 256);

filter.dispose();
```

## 算法实现

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

## 测试

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

## 性能

- **Bank Conflict 优化**: 通过 padding 消除 Shared Memory 冲突
- **并行执行**: 充分利用 GPU 并行计算能力
- **Pipeline 缓存**: 复用计算 pipeline 减少开销
- **Buffer 池化**: 减少 GPU 内存分配次数

## 技术栈

- **WebGPU** - GPU 计算 API
- **TypeScript** - 类型安全
- **Vitest** - 测试框架
- **fast-check** - 属性测试库
- **Vite** - 构建工具

## 项目结构

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
```

## 正确性保证

本库通过以下方式确保正确性：

1. **属性测试** - 使用 fast-check 生成随机输入，验证数学性质
2. **Round-Trip 测试** - FFT → IFFT 应返回原始输入
3. **DFT 对比** - 小规模输入与朴素 DFT 实现对比
4. **已知值测试** - 验证特殊输入（常数、脉冲、正弦波）的输出

## License

MIT

## 作者

WebGPU FFT Library - 高性能 GPU 加速的傅里叶变换实现
