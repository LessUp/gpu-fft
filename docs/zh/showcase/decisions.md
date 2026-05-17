# 架构决策

> 这页是项目的决策账本。这里每一个选择都比理论上的 FFT 设计空间更收敛，因为仓库当前优先的是“可信、可维护、低维护成本”的产品切片。

## 决策 01：WebGPU 是主要加速路径

**问题：** 浏览器 FFT 传统上落在 CPU JavaScript、WASM 或勉强的 WebGL compute 技术上。  
**决策：** 采用 WebGPU compute shader 作为主要加速后端，同时保留 CPU fallback。  
**为什么优于替代方案：** WebGPU 的计算语义更适合 FFT，也避免引入第二套更复杂的部署故事。  
**后果：** 所有公开文案都必须把 GPU 核心和 CPU-only utility 分开写。

## 决策 02：Radix-2 Cooley-Tukey 保持算法中心

**问题：** mixed-radix、Bluestein 和 split-radix 都能拓宽输入空间，但也会放大实现和测试表面。  
**决策：** 当前实现继续以 radix-2 DIT 为中心。  
**为什么优于替代方案：** 它能更直接映射到 GPU workgroup，也更适合 closeout 阶段的可维护性要求。  
**后果：** 输入尺寸继续要求是 2 的幂，除非调用方自行预处理。

## 决策 03：2D FFT 通过行列分解复用 1D kernel

**问题：** 2D FFT 可以做成专用 kernel，也可以由稳定的 1D 机制组合出来。  
**决策：** 通过行列分解与显式转置策略复用 1D 路径。  
**为什么优于替代方案：** 新增 kernel 面更小，整体架构也更容易解释。  
**后果：** 2D 的心智模型天然带有 transpose-oriented planning，而不是一个单独的黑盒 2D 引擎。

## 决策 04：诚实范围优先于膨胀式产品叙事

**问题：** 把整个库都描述成“GPU 加速信号处理”很诱人，但这会模糊真实能力边界。  
**决策：** 在后端现实改变之前，坚持把 spectrum analysis 和 image filtering 写成 CPU-only utility。  
**为什么优于替代方案：** 这样能保证 README、Pages 和 OpenSpec 始终一致，不会让站点比代码更浮夸。  
**后果：** 公开叙事看上去更窄，但也更经得起追问。

## 决策 05：收尾阶段的稳定性优先于投机式优化

**问题：** FFT 永远还有更多硬件特定优化空间。  
**决策：** 继续保持 `workgroupSize = 256`，并且让 bank-conflict optimization 默认关闭，只有在硬件证据充分时再调整。  
**为什么优于替代方案：** 这能维持稳定基线，避免把文档变成未被广泛验证的调优承诺面。  
**后果：** 峰值性能可能不是每块 GPU 的极限，但换来了更低的维护成本和更强的可预测性。

## 继续往下读

- [架构总览](/zh/architecture/overview)
- [性能基准](/zh/showcase/benchmarks)
- [RFC 0001](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0001-webgpu-fft-library-architecture.md)
- [RFC 0003](https://github.com/LessUp/gpu-fft/blob/master/openspec/specs/rfc/0003-2d-fft-transpose-strategy.md)
