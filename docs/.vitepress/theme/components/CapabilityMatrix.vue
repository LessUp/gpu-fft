<template>
  <div class="matrix">
    <div class="matrix-header">
      <p class="matrix-kicker">{{ copy.kicker }}</p>
      <h3>{{ copy.title }}</h3>
    </div>

    <table>
      <thead>
        <tr>
          <th>{{ copy.columns.surface }}</th>
          <th>{{ copy.columns.gpu }}</th>
          <th>{{ copy.columns.cpu }}</th>
          <th>{{ copy.columns.note }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in copy.rows" :key="row.surface">
          <td>{{ row.surface }}</td>
          <td>{{ row.gpu }}</td>
          <td>{{ row.cpu }}</td>
          <td>{{ row.note }}</td>
        </tr>
      </tbody>
    </table>
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
        kicker: '能力矩阵',
        title: '把 GPU 主路径和 CPU-only utility 分开看',
        columns: {
          surface: '表面',
          gpu: 'GPU',
          cpu: 'CPU',
          note: '说明',
        },
        rows: [
          {
            surface: '1D FFT / IFFT',
            gpu: '原生',
            cpu: '回退',
            note: '复数 interleaved 输入',
          },
          {
            surface: '1D RFFT / IRFFT',
            gpu: '包装实现',
            cpu: '原生',
            note: 'half-spectrum 契约',
          },
          {
            surface: '2D FFT / IFFT',
            gpu: '原生',
            cpu: '回退',
            note: 'row-column decomposition',
          },
          {
            surface: 'Spectrum analyzer',
            gpu: '—',
            cpu: 'CPU-only',
            note: '建立在窗口函数与 CPU FFT 上',
          },
          {
            surface: 'Image filter',
            gpu: '—',
            cpu: 'CPU-only',
            note: '频域工具，不是 GPU shader pipeline',
          },
        ],
      }
    : {
        kicker: 'Capability matrix',
        title: 'Separate the GPU core from the CPU-only utilities',
        columns: {
          surface: 'Surface',
          gpu: 'GPU',
          cpu: 'CPU',
          note: 'Notes',
        },
        rows: [
          {
            surface: '1D FFT / IFFT',
            gpu: 'Native',
            cpu: 'Fallback',
            note: 'Complex interleaved input contract',
          },
          {
            surface: '1D RFFT / IRFFT',
            gpu: 'Wrapped',
            cpu: 'Native',
            note: 'Half-spectrum contract',
          },
          {
            surface: '2D FFT / IFFT',
            gpu: 'Native',
            cpu: 'Fallback',
            note: 'Row-column decomposition',
          },
          {
            surface: 'Spectrum analyzer',
            gpu: '—',
            cpu: 'CPU only',
            note: 'Built on window functions and CPU FFT',
          },
          {
            surface: 'Image filter',
            gpu: '—',
            cpu: 'CPU only',
            note: 'Frequency-domain utility, not a GPU shader pipeline',
          },
        ],
      },
);
</script>

<style scoped>
.matrix {
  padding: 1.2rem;
  border: 1px solid var(--fft-border);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--fft-surface) 96%, transparent);
  box-shadow: var(--fft-shadow-soft);
}

.matrix-header h3 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  letter-spacing: -0.03em;
}

.matrix-kicker {
  margin: 0 0 0.35rem;
  color: var(--fft-text-3);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.72rem 0.75rem;
  border-top: 1px solid var(--fft-border);
  text-align: left;
  vertical-align: top;
}

th {
  border-top: none;
  color: var(--fft-text-3);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

td {
  color: var(--fft-text-2);
  line-height: 1.55;
}

td:first-child {
  color: var(--fft-text-1);
  font-weight: 600;
}
</style>
