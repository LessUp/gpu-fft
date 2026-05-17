# 架构总览

> 这页按“系统笔记”来写，而不是按宣传文案来写。重点是把 GPU 路径从哪里开始、CPU 路径仍然在哪些地方是权威实现、以及为什么当前设计刻意保持收敛，讲清楚。

<div class="guide-summary">
  <strong>架构主张：</strong>让 FFT 核心具备 GPU 能力，让公开契约清楚可检验，同时让应用级 helper 诚实地停留在 CPU-only 边界内。
</div>

<ArchitectureAtlas locale="zh" />

## 能力边界

| 表面 | 后端现实 | 为什么重要 |
| --- | --- | --- |
| `createFFTEngine()` | WebGPU 驱动的 FFT 执行核心 | 这是主要加速路径 |
| `cpuFFT()` / `cpuIFFT()` | CPU 参考实现 | 负责通用回退和 utility 复用 |
| `rfft()` / `irfft()` | GPU / CPU 共享的 real-input 契约 | 让实值路径边界显式化 |
| `createSpectrumAnalyzer()` | CPU-only helper | 不能被描述成 GPU-native |
| `createImageFilter()` | CPU-only helper | 内部仍基于 CPU 2D FFT |

## 执行顺序

1. **先校验契约**：尺寸、形状和 real-input 约束都在执行前检查。
2. **选择或复用 execution plan**：已见过的尺寸会复用准备好的资源，而不是每次重建。
3. **分发 GPU pass**：WebGPU 路径执行位反转、蝶形和缩放等 WGSL pass。
4. **重建输出契约**：根据复数或实值 API 把结果整理回调用者预期格式。
5. **保持工具边界诚实**：频谱分析和图像滤波继续复用 CPU FFT 构件。

## 真正决定架构形状的几个选择

| 决策 | 为什么存在 | 带来的后果 |
| --- | --- | --- |
| Radix-2 Cooley-Tukey DIT | 最适合规整 GPU 内存访问与可维护代码 | 输入尺寸必须保持为 2 的幂 |
| 2D FFT 采用行列分解 | 复用 1D kernel，而不是额外建立 2D 蝶形体系 | 心智模型里会多出显式转置步骤 |
| `workgroupSize = 256` | closeout 阶段保持 shader 表面稳定 | 更激进调优依赖具体硬件 profile |
| bank-conflict 优化默认关闭 | 给硬件特定优化留空间，但不改变默认契约 | 性能优化需要实测再开启 |
| `src/shaders/sources.ts` 是 shader 真源 | 避免实现和参考副本漂移 | WGSL 变更保持集中 |

## 代码地图

| 层级 | 文件 | 职责 |
| --- | --- | --- |
| 公开 API | `src/index.ts`, `src/types.ts` | 暴露支持的契约 |
| 核心引擎 | `src/core/fft-engine.ts`, `src/core/gpu-fft-backend.ts` | 校验、资源生命周期、plan 复用 |
| Shader 真源 | `src/shaders/sources.ts` | Canonical WGSL source strings |
| CPU 工具层 | `src/utils/**`, `src/apps/**` | 回退路径与 CPU-only helper |
| 规范真源 | `openspec/specs/**` | 产品、API、测试与治理真源 |

## 建议顺着读的 RFC

- [RFC 0001：WebGPU FFT Library Architecture](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0001-webgpu-fft-library-architecture.md)
- [RFC 0003：2D FFT Transpose Strategy](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md)
- [Public API alignment spec](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/public-api-alignment/spec.md)

## 这套架构刻意不做什么

- 不把频谱分析描述成 GPU-native。
- 不把图像滤波描述成 GPU-native。
- 不在当前产品切片里承诺任意长度 FFT。
- 不为了覆盖所有 GPU 家族而把维护表面做大。
