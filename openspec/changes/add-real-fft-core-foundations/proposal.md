## Why

`gpu-fft` 已经有稳定的复数 FFT 核心，但它对真实高频使用场景仍有三个明显缺口：实值输入要手动扩成复数、GPU 资源缓存只覆盖单一尺寸、性能声明缺少可复现的 WebGPU benchmark 支撑。基于仓库当前“收尾 / 规范化 / 低维护准备”阶段，这三个问题比继续扩张 3D FFT 或 WASM 更值得优先处理，因为它们能同时提升可用性、性能基础设施和公开表述的可信度。

这项变更把上一次路线调研收敛成一个可完整实现的第一阶段切片：先补齐 real-input API、核心缓存基础设施和 benchmark 真值链路，再为后续 GPU-native utility 和更激进的内核优化打地基。

## What Changes

- 新增 real-input FFT capability，包括 1D `rfft` / `irfft` 与 2D `rfft2d` / `irfft2d`
- 将 real-input capability 同时落到 CPU API 与 GPU `FFTEngine` API，保持输入输出契约清晰、类型一致
- 将 `FFTEngine` 的单尺寸缓存升级为多尺寸 execution-plan cache，优化矩形 2D 与多尺寸 workload 的复用表现
- 重写 benchmark 工具，移除“预期性能”叙述，改为基于仓库实现生成可复现的 CPU / WebGPU 实测结果
- 对 README、Pages、OpenSpec API / Product / Testing 文档做同步更新，确保新 API、缓存行为和 benchmark 口径一致

## Capabilities

### New Capabilities
- `real-input-fft`: 为实值信号与图像场景提供面向用户的 RFFT / IRFFT 能力与输出契约
- `fft-plan-caching`: 为 GPU FFT 核心提供多尺寸 execution-plan cache，以减少重复分配与矩形 2D 工作负载抖动
- `performance-benchmarking`: 为公开性能声明建立仓库内可复现的 benchmark 采集与报告约束

### Modified Capabilities
- None in this change. Existing canonical product/API/testing documents will be synchronized during implementation to reflect the new capabilities and verified behavior.

## Impact

- Affected code: `src/core/fft-engine.ts`, `src/index.ts`, `src/types.ts`, `src/utils/cpu-fft.ts`, `benchmarks/fft-benchmark.ts`
- Affected tests: `tests/fft*.ts`, `tests/fft-engine.test.ts`, plus new coverage for real-input APIs and cache reuse behavior
- Affected documentation: `README.md`, `README.zh-CN.md`, `docs/api/**`, `docs/architecture/**`, `docs/index.md`
- Affected specs: OpenSpec change artifacts plus canonical `openspec/specs/api/public-api.md`, `openspec/specs/product/webgpu-fft-library.md`, and `openspec/specs/testing/testing-strategy.md`
