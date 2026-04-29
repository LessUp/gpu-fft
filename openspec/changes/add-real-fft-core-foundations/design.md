## Context

`gpu-fft` 当前的复数 FFT 主路径已经稳定，但真实使用场景仍有三个基础性摩擦点。第一，用户处理音频或图像时往往从实值输入开始，当前 API 需要他们手动构造 interleaved complex 数组，门槛高且容易出错。第二，`FFTEngine` 只保留一个按尺寸缓存的 `sizeCache`，矩形 2D 或交替尺寸 workload 会反复释放与重建 GPU 资源。第三，仓库里的 benchmark 脚本并没有以当前实现产出可复现的 WebGPU 实测结果，却仍保留了“预期性能”叙述，这与仓库对公开声明准确性的要求不一致。

这次设计要做的是一个“第一阶段基础增强”切片：补齐面向真实输入的 API、把核心资源缓存从单尺寸提升到多尺寸复用、同时把 benchmark 体系收敛为只陈述仓库内可测得的事实。范围会刻意压缩，避免在 closeout 阶段一次引入 GPU-native 2D transpose、3D FFT 或 WASM fallback 这类更大规模的新表面。

## Goals / Non-Goals

**Goals:**

- 为 1D 与 2D 实值输入提供清晰、可测试的 RFFT / IRFFT 公共 API
- 让 CPU 与 GPU 路径共享相同的 real-input 数据契约，避免“只有某一后端可用”的表面差异
- 把 `FFTEngine` 的 GPU 资源缓存扩展为多尺寸 execution-plan cache，改善多尺寸复用
- 让 benchmark 工具只输出基于当前环境和当前实现得到的实测结果，不再发布静态“预期性能”
- 同步更新 README、文档和 canonical OpenSpec，使 API、实现和性能声明保持一致

**Non-Goals:**

- 不在本 change 中实现 GPU-native 2D transpose kernel 或 GPU-native image filter
- 不在本 change 中引入 3D FFT、Bluestein、split-radix 或 WASM fallback
- 不承诺本次 real-input API 一定比复数 FFT 更快；本次目标首先是正确性、可用性和后续优化地基

## Decisions

### 1. 新增独立的 real-input API，而不是重载现有 `fft()` / `ifft()`

**Decision:** 新增 `rfft()` / `irfft()` 与 `rfft2d()` / `irfft2d()`，不改变现有复数 API 的输入输出契约。

**Rationale:** 当前库的核心约定是“复数变换统一使用 interleaved complex”。如果把实值输入隐式塞进 `fft()` / `ifft()`，会让同一个 API 同时承担两套输入输出协议，增加类型歧义，也会迫使 README、文档和测试重新解释旧契约。独立 API 可以把 real-input 语义做清楚，同时保留现有复数用户的稳定性。

**Alternatives considered:**

- 重载 `fft()` / `ifft()` 让其接受实值数组：调用面更短，但会模糊输出形态和类型约束
- 只提供 helper 函数不挂到 `FFTEngine`：会让 CPU / GPU 公共表面不对齐

### 2. 1D real-input 输出使用 half-spectrum 压缩布局

**Decision:** `rfft(real: Float32Array)` 输出 `Float32Array`，内容仍是 interleaved complex，但只包含 `N / 2 + 1` 个频率 bin；`irfft(spectrum)` 从该 half-spectrum 还原长度为 `N` 的实值数组。

**Rationale:** 这与实值 FFT 的标准 Hermitian 对称性一致，也最能体现 real-input API 的价值；如果仍返回完整复数频谱，只是把 imag 置零输入后转发给复数 FFT，那么新 API 的收益会很弱。

**Alternatives considered:**

- 返回完整复数频谱：实现最简单，但没有利用实值对称性，也不能为后续优化建立稳定契约
- 返回自定义对象结构：更直观，但与当前库统一使用 typed array 的设计不一致

### 3. 2D real-input 输出按“每行保留前半频谱列”压缩

**Decision:** `rfft2d(real, width, height)` 的输出布局为 `height × (width / 2 + 1)` 个复数 bin，仍用 row-major interleaved complex 存储；`irfft2d(spectrum, width, height)` 使用原始实值尺寸恢复完整实值图像。

**Rationale:** 2D 实值频谱的标准压缩方式就是沿最后一个维度保留半谱列。这样既能保持数组线性布局，又能为后续 GPU-native 2D real path 留出兼容空间。

**Alternatives considered:**

- 暂时不做 2D real-input API：会让 change 与 proposal 不一致，也会让图像场景继续缺席
- 2D real-input 仍返回完整复数矩阵：不利于后续 API 稳定和优化

### 4. 先用“正确性优先”的包装实现 real-input 路径

**Decision:** CPU 与 GPU 的 real-input API 第一版都通过现有复数 FFT 内核包装实现：实值输入先扩成复数输入，前向变换后压缩 half-spectrum；逆变换时从 half-spectrum 重建 Hermitian 对称的完整复数频谱，再调用现有 IFFT，并丢弃残余虚部。

**Rationale:** 这能在不引入新 shader 内核和不改动核心数学路径的前提下快速得到一致且可测的行为。对 closeout 阶段来说，这种“先建立稳定契约，再迭代优化”比直接上专用 WGSL kernel 更稳妥。

**Alternatives considered:**

- 直接编写专用 RFFT WGSL shader：性能潜力更高，但实现面太大，不适合作为第一阶段切片
- 只在 CPU 侧实现：会造成公共 API 与后端能力割裂

### 5. 将单尺寸 `sizeCache` 提升为有上限的多尺寸 plan cache

**Decision:** `FFTEngine` 使用 `Map<number, SizeCache>` 保存多个尺寸的 plan/cache 条目，并采用小容量上限加 LRU 风格的最近使用策略来控制 GPU 资源占用。

**Rationale:** 现有 2D 路径会交替用到 `width` 和 `height` 两种 1D 计划，矩形 workload 很容易触发缓存抖动。多尺寸缓存能直接改善这一点，且不需要改变公开 API。保留容量上限则可防止长期运行的应用无限堆积 GPU buffer。

**Alternatives considered:**

- 无上限 map：实现简单，但会放大长生命周期应用的显存占用风险
- 继续只保留一个 `sizeCache`：实现最省事，但无法解决本次 change 的核心问题之一

### 6. benchmark 工具只报告实测，不再生成静态“Expected WebGPU Performance”

**Decision:** benchmark 脚本改为直接调用仓库实现，输出 CPU 实测结果，并在 WebGPU 环境可用时附加 GPU 实测结果；如果当前环境没有 WebGPU，则明确说明 GPU 结果未采集，但不再输出任何推测值。

**Rationale:** 这与仓库现有的 public-api-alignment / quality-gates 精神一致：公开表述必须可追溯、可复现。benchmark 工具的目标是产出事实，不是营销文案。

**Alternatives considered:**

- 保留“expected performance”段落：易读，但不符合证据链要求
- 删除 benchmark 工具：会让 README 与文档更难获得仓库内支撑

## Risks / Trade-offs

- **[2D Hermitian 重建容易出错]** → 用 CPU round-trip、矩形尺寸、纯实输出断言和 GPU/CPU 对齐测试覆盖边界情况
- **[多尺寸 plan cache 可能增加显存常驻]** → 使用固定小上限并在 `dispose()` 时统一释放全部缓存
- **[real-input API 第一版不是最优性能实现]** → 在规格和文档中明确当前目标是 contract-first，不把性能承诺写进 requirement
- **[benchmark 在 Node 环境下常常拿不到 WebGPU]** → 允许 CPU-only 结果，但严禁输出无实测依据的 GPU 数字

## Migration Plan

1. 先落地 OpenSpec proposal / design / specs / tasks，明确 real-input contract、plan cache 行为和 benchmark 约束
2. 实现 CPU real-input API 与测试，建立正确性基线
3. 实现 GPU `FFTEngine` real-input API 与多尺寸 plan cache，并补充资源复用测试
4. 重写 benchmark 脚本，使其以仓库实现生成实测报告
5. 同步 README、docs 与 canonical OpenSpec API / Product / Testing 文档
6. 运行完整验证链，确保新增表面与既有行为不冲突

## Open Questions

- 第一版 plan cache 的上限是 4 还是 8 更合适；实现时可根据测试与代码简单性选择较小值
- 是否在本次 change 内公开导出 real-input 校验 helper；默认倾向于不导出，保持 API 表面简洁
