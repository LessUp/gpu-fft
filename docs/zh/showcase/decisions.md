# 架构决策

本页记录 WebGPU FFT 库的关键设计决策。每条目遵循 ADR 格式：**问题 → 选项 → 决策 → 后果**。

## 为什么选择 WebGPU 做 FFT？

### 问题
浏览器端的 FFT 库传统上依赖 CPU（JavaScript）或 WASM。通过 WebGL 做 GPU 通用计算受限且笨拙。

### 选项

| 方案 | 优点 | 缺点 |
|------|------|------|
| 纯 CPU（JS） | 简单、通用 | 大尺寸变换慢 |
| WebGL 计算 | 有 GPU 通道 | GPGPU 别扭、功能受限 |
| WebGPU 计算 | 现代计算 API、WGSL | 浏览器支持仍在成熟中 |
| WASM + SIMD | 接近原生 CPU 速度 | 无 GPU 加速 |

### 决策
采用 **WebGPU 计算着色器** 作为主要加速路径，同时提供 CPU 回退保证全平台兼容。

### 后果
- 现代浏览器用户在大型变换上可获得显著加速
- CPU 回退确保库在所有环境可用
- API 表面必须抽象 GPU 资源管理

## 为什么选择 Radix-2 Cooley-Tukey？

### 问题
存在多种 FFT 算法。如何在实现复杂度、GPU 并行度和浏览器兼容性之间取得平衡？

### 选项

| 算法 | 复杂度 | GPU 适配 | 尺寸限制 |
|------|--------|---------|---------|
| Cooley-Tukey Radix-2 | $O(N \log N)$ | 优秀 | 仅 2 的幂 |
| Bluestein | $O(N \log N)$ | 中等 | 任意尺寸 |
| Split-Radix | $O(N \log N)$ | 复杂 | 仅 2 的幂 |
| 素因子 | $O(N \log N)$ | 差 | 合数尺寸 |

### 决策
实现 **Cooley-Tukey Radix-2 DIT**，附带可选的 bank-conflict padding。这提供了最简洁的 GPU workgroup 映射，同时保持代码可维护性。

### 后果
- 输入尺寸必须是 2 的幂（运行时验证）
- 规整的内存访问模式天然适配 GPU 共享内存
- 启用 bank-conflict padding 时约 3% 的内存开销

## 2D FFT 转置策略

详见 [RFC 0003：2D FFT 转置策略](/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md)。

### 决策
采用**显式转置的行-列分解**，而非平铺或直接 2D 蝶形。这复用了 1D FFT 核函数，保持着色器代码简洁。

## 质量门禁

详见 [RFC 0002：项目质量提升](/openspec/specs/rfc/0002-project-quality-enhancement-architecture.md)。

### 决策
每次提交必须通过：
1. ESLint
2. Prettier 格式检查
3. TypeScript 类型检查
4. Vitest 单元测试
5. Vite 构建
6. 包烟测
