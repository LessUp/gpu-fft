<template>
  <div class="atlas">
    <div class="atlas-header">
      <p class="atlas-kicker">{{ copy.kicker }}</p>
      <h3>{{ copy.title }}</h3>
      <p>{{ copy.summary }}</p>
    </div>

    <div class="atlas-track">
      <article v-for="layer in copy.layers" :key="layer.title" class="atlas-layer">
        <p class="atlas-tag">{{ layer.tag }}</p>
        <h4>{{ layer.title }}</h4>
        <p>{{ layer.body }}</p>
      </article>
    </div>

    <div class="atlas-footer">
      <div v-for="note in copy.notes" :key="note.label" class="atlas-note">
        <strong>{{ note.label }}</strong>
        <span>{{ note.body }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ locale?: 'en' | 'zh' }>(), {
  locale: 'en',
});

const copy = computed(() =>
  props.locale === 'zh'
    ? {
        kicker: '系统地图',
        title: '从公开 API 到 GPU pass 的阅读顺序',
        summary:
          '这个项目的核心是一条很窄但很清楚的执行链：公开 API 暴露 FFT 契约，执行层负责 plan 与资源，GPU pass 负责核心蝶形变换，应用级工具仍停留在 CPU。',
        layers: [
          {
            tag: 'Layer 01',
            title: 'Public surface',
            body: 'createFFTEngine()、real-input FFT API、CPU shortcuts 和 utilities 构成公开入口。',
          },
          {
            tag: 'Layer 02',
            title: 'Execution planner',
            body: 'FFTEngine 负责尺寸校验、execution plan cache、buffer 生命周期与 dispatch 顺序。',
          },
          {
            tag: 'Layer 03',
            title: 'GPU compute passes',
            body: 'bit reversal、butterfly、scale 等 WGSL compute pass 组成 GPU FFT 主路径。',
          },
          {
            tag: 'Layer 04',
            title: 'CPU-only utilities',
            body: '频谱分析和图像滤波建立在 CPU FFT 与窗口函数之上，不冒充 GPU-native 功能。',
          },
        ],
        notes: [
          {
            label: 'Boundary',
            body: 'GPU core 与 CPU utility 必须在所有公开文案中明确区分。',
          },
          {
            label: 'Reading tip',
            body: '先读 capability boundary，再读 pipeline，会更容易理解 2D 与 real-input API 的位置。',
          },
        ],
      }
    : {
        kicker: 'System map',
        title: 'Read the stack from public API down to GPU passes',
        summary:
          'The project is intentionally narrow. Public APIs define the FFT contract, the execution layer owns planning and resources, GPU passes handle the transform core, and application utilities stay on CPU.',
        layers: [
          {
            tag: 'Layer 01',
            title: 'Public surface',
            body: 'createFFTEngine(), real-input FFT APIs, CPU shortcuts, and utilities define the supported contract.',
          },
          {
            tag: 'Layer 02',
            title: 'Execution planner',
            body: 'FFTEngine owns validation, execution-plan caching, buffer lifetime, and dispatch sequencing.',
          },
          {
            tag: 'Layer 03',
            title: 'GPU compute passes',
            body: 'Bit reversal, butterfly stages, and scaling passes form the WebGPU FFT path.',
          },
          {
            tag: 'Layer 04',
            title: 'CPU-only utilities',
            body: 'Spectrum analysis and image filtering stay on the CPU path and should never be described as GPU-native.',
          },
        ],
        notes: [
          {
            label: 'Boundary',
            body: 'GPU core and CPU-only utilities must stay explicit across docs, README, and specs.',
          },
          {
            label: 'Reading tip',
            body: 'Understand the capability boundary first, then the pipeline, and the rest of the architecture reads cleanly.',
          },
        ],
      },
);
</script>

<style scoped>
.atlas {
  display: grid;
  gap: 1rem;
  margin: 1.4rem 0;
  padding: 1.2rem;
  border: 1px solid var(--fft-border);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--fft-surface) 96%, transparent);
  box-shadow: var(--fft-shadow-soft);
}

.atlas-header h3,
.atlas-layer h4 {
  margin: 0;
  letter-spacing: -0.03em;
}

.atlas-header p:last-child {
  margin-bottom: 0;
  color: var(--fft-text-2);
}

.atlas-kicker,
.atlas-tag {
  margin: 0 0 0.4rem;
  color: var(--fft-text-3);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.atlas-track {
  display: grid;
  gap: 0.9rem;
}

.atlas-layer {
  position: relative;
  padding: 1rem 1rem 1rem 1.1rem;
  border: 1px solid var(--fft-border);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--fft-bg-soft) 84%, transparent);
}

.atlas-layer::before {
  content: '';
  position: absolute;
  top: -0.8rem;
  left: 1.6rem;
  width: 1px;
  height: 0.8rem;
  background: color-mix(in srgb, var(--fft-cyan) 48%, var(--fft-border));
}

.atlas-layer:first-child::before {
  display: none;
}

.atlas-layer p:last-child {
  margin-bottom: 0;
  color: var(--fft-text-2);
}

.atlas-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.atlas-note {
  display: grid;
  gap: 0.3rem;
  padding: 0.85rem 0.95rem;
  border-radius: 0.95rem;
  background: color-mix(in srgb, var(--fft-accent) 6%, var(--fft-surface));
  border: 1px solid color-mix(in srgb, var(--fft-accent) 28%, var(--fft-border));
}

.atlas-note strong {
  color: var(--fft-text-1);
}

.atlas-note span {
  color: var(--fft-text-2);
}
</style>
