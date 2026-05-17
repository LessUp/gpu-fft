<template>
  <ClientOnly>
    <div class="benchmark-chart-shell">
      <div ref="chartEl" class="benchmark-chart" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'en',
});

const chartEl = ref<HTMLDivElement | null>(null);

type ChartInstance = {
  dispose(): void;
  resize(): void;
  setOption(option: object): void;
};

const cpuData = [
  { size: 256, mean: 0.13 },
  { size: 512, mean: 0.16 },
  { size: 1024, mean: 0.36 },
  { size: 2048, mean: 0.8 },
  { size: 4096, mean: 1.45 },
  { size: 8192, mean: 3.48 },
  { size: 16384, mean: 6.95 },
];

let chart: ChartInstance | null = null;
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;

function color(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

async function renderChart() {
  if (!chartEl.value) {
    return;
  }

  const echarts = await import('echarts');

  chart?.dispose();
  chart = echarts.init(chartEl.value, undefined, { renderer: 'canvas' });

  const labels =
    props.locale === 'zh'
      ? {
          xAxis: 'FFT 尺寸',
          yAxis: '均值耗时 (ms)',
          tooltip: '均值',
          series: 'CPU FFT',
          prefix: '尺寸',
        }
      : {
          xAxis: 'FFT Size',
          yAxis: 'Mean time (ms)',
          tooltip: 'Mean',
          series: 'CPU FFT',
          prefix: 'Size',
        };

  chart.setOption({
    animationDuration: 350,
    backgroundColor: 'transparent',
    textStyle: {
      color: color('--fft-text-raster'),
      fontFamily: 'Iosevka, JetBrains Mono, monospace',
    },
    grid: {
      left: '4%',
      right: '3%',
      bottom: '6%',
      top: '16%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: color('--fft-surface-raster'),
      borderColor: color('--fft-border-raster'),
      textStyle: {
        color: color('--fft-text-raster'),
        fontFamily: 'Iosevka, JetBrains Mono, monospace',
      },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0];
        return `${labels.prefix} ${item.name}<br />${labels.tooltip}: <strong>${item.value} ms</strong>`;
      },
    },
    xAxis: {
      type: 'category',
      name: labels.xAxis,
      data: cpuData.map((item) => item.size.toString()),
      nameTextStyle: { color: color('--fft-muted-raster') },
      axisLine: { lineStyle: { color: color('--fft-border-raster') } },
      axisLabel: { color: color('--fft-muted-raster') },
    },
    yAxis: {
      type: 'value',
      name: labels.yAxis,
      nameTextStyle: { color: color('--fft-muted-raster') },
      axisLine: { lineStyle: { color: color('--fft-border-raster') } },
      axisLabel: { color: color('--fft-muted-raster') },
      splitLine: {
        lineStyle: {
          color: color('--fft-grid-raster'),
        },
      },
    },
    series: [
      {
        name: labels.series,
        type: 'bar',
        barWidth: '48%',
        data: cpuData.map((item) => item.mean),
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color('--fft-accent-raster') },
            { offset: 1, color: color('--fft-cyan-raster') },
          ]),
        },
      },
    ],
  });
}

onMounted(async () => {
  await renderChart();

  if (chartEl.value) {
    resizeObserver = new ResizeObserver(() => chart?.resize());
    resizeObserver.observe(chartEl.value);
  }

  themeObserver = new MutationObserver(() => {
    void renderChart();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
  chart?.dispose();
});
</script>

<style scoped>
.benchmark-chart-shell {
  margin: 1.4rem 0;
  padding: 0.75rem;
  border: 1px solid var(--fft-border);
  border-radius: 1.2rem;
  background: color-mix(in srgb, var(--fft-surface) 96%, transparent);
  box-shadow: var(--fft-shadow-soft);
}

.benchmark-chart {
  width: 100%;
  height: 400px;
  border-radius: 0.9rem;
}
</style>
