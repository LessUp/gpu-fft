# 性能基准

> 所有测量都在你的本地环境采集。运行 `npm run benchmark` 即可复现。

::: info 诚实的基准测试
本库不包含推测性的"预期加速比"宣传。下方图表展示的是当前 CI 环境（WSL2、Node.js 22、无独立 GPU）的**实测 CPU 结果**。如果你在有 WebGPU 能力的浏览器中运行 `npm run benchmark`，还会看到实测 WebGPU 结果。
:::

## 1D FFT 性能

<div id="benchmark-1d-chart" style="width:100%;height:400px;margin:1.5rem 0;"></div>

### 原始数据

| 尺寸 | 均值 (ms) | 中位数 (ms) | 最小值 (ms) | 最大值 (ms) | 标准差 |
|------|-----------|-------------|------------|------------|--------|
| 256 | 0.13 | 0.05 | 0.04 | 2.66 | 0.31 |
| 512 | 0.16 | 0.13 | 0.11 | 0.58 | 0.07 |
| 1024 | 0.36 | 0.28 | 0.24 | 3.96 | 0.39 |
| 2048 | 0.80 | 0.64 | 0.42 | 7.34 | 0.80 |
| 4096 | 1.45 | 1.41 | 0.91 | 3.29 | 0.28 |
| 8192 | 3.48 | 3.07 | 2.36 | 11.15 | 1.24 |
| 16384 | 6.95 | 6.71 | 4.84 | 15.86 | 1.45 |

*环境：WSL2，Node.js v22.22.0，纯 CPU（未检测到 WebGPU adapter）。*

### 含义解读

- CPU FFT 性能大致随 $N \log N$ 线性增长——尺寸翻倍，运行时间略超 2 倍。
- 小尺寸（256–512）的波动主要由 JavaScript 引擎开销主导，而非算法本身。
- WebGPU 测量在当前 CI 环境不可用。在典型独立 GPU 上，WebGPU FFT 在大尺寸（4096+）时预期有显著加速，但具体比例取决于 GPU 型号、驱动和浏览器。

## 本地复现

```bash
npm run benchmark
```

结果包含：
- 每个测试尺寸的 CPU FFT 耗时
- WebGPU FFT 耗时（仅在 WebGPU adapter 可用时输出）
- 系统信息以保证透明度

<script setup>
import { onMounted } from 'vue';

const cpuData = [
  { size: 256, mean: 0.13 },
  { size: 512, mean: 0.16 },
  { size: 1024, mean: 0.36 },
  { size: 2048, mean: 0.80 },
  { size: 4096, mean: 1.45 },
  { size: 8192, mean: 3.48 },
  { size: 16384, mean: 6.95 },
];

onMounted(async () => {
  const echarts = await import('echarts');
  const chartDom = document.getElementById('benchmark-1d-chart');
  if (!chartDom) return;

  const chart = echarts.init(chartDom, 'dark', { renderer: 'canvas' });

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#161b22',
      borderColor: '#30363d',
      textStyle: { color: '#c9d1d9', fontFamily: 'JetBrains Mono, monospace' },
      formatter: (params) => {
        const p = params[0];
        return `<span style="color:#76b900;font-weight:700">尺寸 ${p.name}</span><br/>
                均值: <b>${p.value} ms</b>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      name: 'FFT 尺寸',
      nameTextStyle: { color: '#8b949e', fontFamily: 'Inter, sans-serif' },
      data: cpuData.map(d => d.size.toString()),
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono, monospace' },
    },
    yAxis: {
      type: 'value',
      name: '均值耗时 (ms)',
      nameTextStyle: { color: '#8b949e', fontFamily: 'Inter, sans-serif' },
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontFamily: 'JetBrains Mono, monospace' },
      splitLine: { lineStyle: { color: '#21262d' } },
    },
    series: [{
      name: 'CPU FFT',
      type: 'bar',
      data: cpuData.map(d => d.mean),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#8ecf00' },
          { offset: 1, color: 'rgba(118, 185, 0, 0.3)' }
        ]),
        borderRadius: [6, 6, 0, 0],
      },
      barWidth: '45%',
      emphasis: {
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#a8e000' },
            { offset: 1, color: 'rgba(140, 200, 0, 0.4)' }
          ]),
        }
      }
    }]
  };

  chart.setOption(option);

  const resizeObserver = new ResizeObserver(() => chart.resize());
  resizeObserver.observe(chartDom);
});
</script>

<style scoped>
#benchmark-1d-chart {
  border: 1px solid #30363d;
  border-radius: 10px;
  background: #161b22;
}
</style>
