# RFC 0003: 2D FFT Transpose Strategy

## Status

📋 **ACCEPTED** (Deferred Optimization)

## Context

GPU-FFT 项目的 `fft2d` 实现在 CPU 端执行矩阵转置操作：

```typescript
// src/core/fft-engine.ts
function transposeComplexMatrix(input: Float32Array, width: number, height: number): Float32Array {
  const result = new Float32Array(input.length);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcIdx = (row * width + col) * 2;
      const dstIdx = (col * height + row) * 2;
      result[dstIdx] = input[srcIdx];
      result[dstIdx + 1] = input[srcIdx + 1];
    }
  }
  return result;
}
```

每次 2D FFT 调用涉及：
1. **2 次 CPU 转置**（在 GPU 调用之间）
2. **width + height 次 GPU 调用**（逐行/逐列 FFT）

## Decision

**推迟 GPU 转置优化至未来工作。**

当前 CPU 转置实现保持不变，原因如下：

1. **项目阶段约束**：项目处于收尾/规范化阶段，优先级为规范统一 > 性能优化
2. **当前性能足够**：对大多数用例（小到中等尺寸）性能已满足需求
3. **实现稳定性**：CPU 转置逻辑正确、稳定、易理解
4. **维护成本**：新增 GPU 转置 shader 增加维护负担

## Rationale

### 性能影响分析

| 尺寸 | GPU FFT 时间 | CPU 转置估计 (2次) | 转置占比 |
|------|-------------|-------------------|----------|
| 256×256 | ~1.56 ms | ~1 ms | ~40% |
| 512×512 | ~3.45 ms | ~4-10 ms | ~50-75% |
| 1024×1024 | ~8.23 ms | ~20-40 ms | **~70-80%** |

**结论**：大尺寸 2D FFT 的 CPU 转置确实会成为性能瓶颈。

### 为什么推迟？

1. **优先级**：项目明确"不主动扩张产品范围"
2. **复杂度**：GPU 转置需要新增 shader、管理额外缓冲区、处理边界条件
3. **测试成本**：需要增加 GPU 端测试覆盖
4. **当前收益有限**：大多数用户场景不会达到 1024×1024 以上

### 未来优化路径

当性能成为优先级时，可实施：

```wgsl
// 简单 GPU 转置 shader
@compute @workgroup_size(16, 16)
fn transpose(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let src_row = global_id.y;
    let src_col = global_id.x;
    
    if (src_row >= params.height || src_col >= params.width) { return; }
    
    let src_idx = src_row * params.width + src_col;
    let dst_idx = src_col * params.height + src_row;
    
    output[dst_idx] = input[src_idx];
}
```

**预估工作量**：2-4 小时
**预期加速**：2-4x（大尺寸 2D FFT）

## Consequences

### 正向

- 保持代码库简洁，符合收尾阶段目标
- 不增加维护负担
- 当前实现正确且稳定

### 负向

- 大尺寸 2D FFT 性能未达最优
- 用户需要自行优化或等待未来版本

### 中性

- 架构文档应说明此设计决策
- 未来优化时需创建新的 OpenSpec change

## Related

- [`src/core/fft-engine.ts`](../../src/core/fft-engine.ts) - 2D FFT 实现
- [`AGENTS.md`](../../AGENTS.md) - 项目收尾约束

## History

- 2026-05-08: 初始提案，接受推迟优化决策
