<template>
  <ClientOnly>
    <div class="fft-playground">
      <div class="pg-header">
        <h3>FFT Explorer</h3>
        <p class="pg-desc">
          Inspect the same signal in the time domain and the frequency domain. This teaching widget
          runs entirely on the CPU so the behavior is easy to inspect in any browser.
        </p>
      </div>

      <div class="pg-controls">
        <div class="pg-row">
          <label>Signal</label>
          <select v-model="signalType" @change="onPresetChange">
            <option value="sine">Sine Wave (1 cycle)</option>
            <option value="sine4">Sine Wave (4 cycles)</option>
            <option value="square">Square Wave</option>
            <option value="impulse">Impulse</option>
            <option value="noise">Random Noise</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div class="pg-row">
          <label>Size</label>
          <select v-model.number="signalSize">
            <option :value="64">64</option>
            <option :value="128">128</option>
            <option :value="256">256</option>
            <option :value="512">512</option>
          </select>
        </div>

        <div v-if="signalType === 'custom'" class="pg-row pg-fullwidth">
          <label>Values</label>
          <input v-model="customValues" type="text" placeholder="0, 1, 0, -1, 0, 1..." />
        </div>

        <div class="pg-actions">
          <button class="pg-btn pg-btn-primary" @click="runFFT">Run FFT</button>
          <button class="pg-btn pg-btn-secondary" @click="runIFFT">Run inverse</button>
        </div>
      </div>

      <div class="pg-canvases">
        <div class="pg-canvas-block">
          <h4>Time domain</h4>
          <canvas ref="timeCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
        <div class="pg-canvas-block">
          <h4>Magnitude spectrum</h4>
          <canvas ref="freqCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
      </div>

      <div v-if="stats" class="pg-stats">
        <span class="pg-stat">samples {{ stats.samples }}</span>
        <span class="pg-stat">peak bin {{ stats.peakBin }}</span>
        <span class="pg-stat">peak {{ stats.peakMag }}</span>
        <span class="pg-stat">dc {{ stats.dc }}</span>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

type Stats = {
  samples: number;
  peakBin: number;
  peakMag: string;
  dc: string;
};

type Palette = {
  canvasBg: string;
  grid: string;
  axis: string;
  text: string;
  line: string;
  accent: string;
  border: string;
  surface: string;
};

const signalType = ref('sine');
const signalSize = ref(256);
const customValues = ref('');
const canvasWidth = 600;
const canvasHeight = 220;
const timeCanvas = ref<HTMLCanvasElement | null>(null);
const freqCanvas = ref<HTMLCanvasElement | null>(null);
const stats = ref<Stats | null>(null);

let currentSignal = new Float32Array(0);
let currentSpectrum = new Float32Array(0);
let themeObserver: MutationObserver | null = null;

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readPalette(): Palette {
  return {
    canvasBg: cssVar('--fft-canvas-bg-raster'),
    grid: cssVar('--fft-grid-raster'),
    axis: cssVar('--fft-muted-raster'),
    text: cssVar('--fft-text-raster'),
    line: cssVar('--fft-accent-raster'),
    accent: cssVar('--fft-cyan-raster'),
    border: cssVar('--fft-border-raster'),
    surface: cssVar('--fft-surface-raster'),
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return hex;
  }
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateSignal(): Float32Array {
  const n = signalSize.value;
  const data = new Float32Array(n * 2);

  for (let i = 0; i < n; i++) {
    const t = i / n;
    let v = 0;

    switch (signalType.value) {
      case 'sine':
        v = Math.sin(2 * Math.PI * t);
        break;
      case 'sine4':
        v = Math.sin(2 * Math.PI * 4 * t);
        break;
      case 'square':
        v = t < 0.5 ? 1 : -1;
        break;
      case 'impulse':
        v = i === 0 ? n : 0;
        break;
      case 'noise':
        v = Math.random() * 2 - 1;
        break;
      case 'custom': {
        const values = customValues.value
          .split(',')
          .map((item) => Number.parseFloat(item.trim()))
          .filter((item) => !Number.isNaN(item));
        v = i < values.length ? values[i] : 0;
        break;
      }
    }

    data[i * 2] = v;
    data[i * 2 + 1] = 0;
  }

  return data;
}

function fft(input: Float32Array): Float32Array {
  const n2 = input.length;
  const n = n2 / 2;

  if ((n & (n - 1)) !== 0) {
    throw new Error('Size must be power of 2');
  }

  const out = new Float32Array(n2);
  const bits = Math.log2(n);

  for (let i = 0; i < n; i++) {
    let j = 0;
    for (let b = 0; b < bits; b++) {
      j = (j << 1) | ((i >> b) & 1);
    }
    out[j * 2] = input[i * 2];
    out[j * 2 + 1] = input[i * 2 + 1];
  }

  for (let stage = 1; stage < n; stage <<= 1) {
    const wmReal = Math.cos(-Math.PI / stage);
    const wmImag = Math.sin(-Math.PI / stage);

    for (let group = 0; group < n; group += stage << 1) {
      let wReal = 1;
      let wImag = 0;

      for (let k = 0; k < stage; k++) {
        const i1 = (group + k) * 2;
        const i2 = (group + k + stage) * 2;
        const tReal = wReal * out[i2] - wImag * out[i2 + 1];
        const tImag = wReal * out[i2 + 1] + wImag * out[i2];

        out[i2] = out[i1] - tReal;
        out[i2 + 1] = out[i1 + 1] - tImag;
        out[i1] += tReal;
        out[i1 + 1] += tImag;

        const nextWReal = wmReal * wReal - wmImag * wImag;
        wImag = wmReal * wImag + wmImag * wReal;
        wReal = nextWReal;
      }
    }
  }

  return out;
}

function ifft(input: Float32Array): Float32Array {
  const n2 = input.length;
  const conjugated = new Float32Array(n2);

  for (let i = 0; i < n2; i += 2) {
    conjugated[i] = input[i];
    conjugated[i + 1] = -input[i + 1];
  }

  const transformed = fft(conjugated);
  const n = n2 / 2;

  for (let i = 0; i < n2; i++) {
    transformed[i] /= n;
  }

  return transformed;
}

function magnitudeSpectrum(spectrum: Float32Array): Float32Array {
  const n = spectrum.length / 2;
  const mag = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    const real = spectrum[i * 2];
    const imag = spectrum[i * 2 + 1];
    mag[i] = Math.sqrt(real * real + imag * imag);
  }

  return mag;
}

function drawSignal(canvas: HTMLCanvasElement, data: Float32Array) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const colors = readPalette();
  const w = canvas.width;
  const h = canvas.height;
  const padding = 20;
  const plotH = h - padding * 2;
  const plotW = w - padding * 2;
  const n = data.length / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colors.canvasBg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding + (plotH / 4) * i;
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
  }
  ctx.stroke();

  ctx.strokeStyle = colors.axis;
  ctx.beginPath();
  ctx.moveTo(padding, padding + plotH / 2);
  ctx.lineTo(w - padding, padding + plotH / 2);
  ctx.stroke();

  let maxVal = 0;
  for (let i = 0; i < n; i++) {
    maxVal = Math.max(maxVal, Math.abs(data[i * 2]));
  }
  maxVal = Math.max(maxVal, 0.01);

  ctx.strokeStyle = hexToRgba(colors.line, 0.26);
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = padding + (i / (n - 1)) * plotW;
    const y = padding + plotH / 2 - (data[i * 2] / maxVal) * (plotH / 2.2);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = padding + (i / (n - 1)) * plotW;
    const y = padding + plotH / 2 - (data[i * 2] / maxVal) * (plotH / 2.2);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.fillStyle = colors.axis;
  ctx.font = '11px Iosevka, JetBrains Mono, monospace';
  ctx.fillText(`n = ${n}`, padding, h - 4);
  ctx.fillText(`max = ${maxVal.toFixed(3)}`, w - padding - 88, h - 4);
}

function drawSpectrum(canvas: HTMLCanvasElement, mag: Float32Array) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  const colors = readPalette();
  const w = canvas.width;
  const h = canvas.height;
  const padding = 20;
  const plotH = h - padding * 2;
  const plotW = w - padding * 2;
  const n = mag.length;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = colors.canvasBg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding + (plotH / 4) * i;
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
  }
  ctx.stroke();

  const halfN = Math.floor(n / 2);
  let maxMag = 0;
  let peakBin = 0;
  for (let i = 0; i < halfN; i++) {
    if (mag[i] > maxMag) {
      maxMag = mag[i];
      peakBin = i;
    }
  }
  maxMag = Math.max(maxMag, 0.01);

  const barW = plotW / halfN;
  for (let i = 0; i < halfN; i++) {
    const intensity = mag[i] / maxMag;
    const barH = intensity * plotH;
    const x = padding + i * barW;
    const y = padding + plotH - barH;

    ctx.fillStyle = intensity > 0.72 ? colors.line : colors.accent;
    ctx.globalAlpha = 0.38 + intensity * 0.52;
    ctx.fillRect(x + 0.6, y, Math.max(barW - 1.3, 1), barH);
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.axis;
  ctx.font = '11px Iosevka, JetBrains Mono, monospace';
  ctx.fillText(`bins = 0..${halfN - 1}`, padding, h - 4);
  ctx.fillText(`peak = ${maxMag.toFixed(2)} @ ${peakBin}`, w - padding - 132, h - 4);

  stats.value = {
    samples: n,
    peakBin,
    peakMag: maxMag.toFixed(4),
    dc: mag[0].toFixed(4),
  };
}

function redraw() {
  if (!currentSignal.length) {
    return;
  }

  const mag = currentSpectrum.length ? magnitudeSpectrum(currentSpectrum) : new Float32Array(0);
  nextTick(() => {
    if (timeCanvas.value) {
      drawSignal(timeCanvas.value, currentSignal);
    }
    if (freqCanvas.value && mag.length) {
      drawSpectrum(freqCanvas.value, mag);
    }
  });
}

function runFFT() {
  currentSignal = generateSignal();
  currentSpectrum = fft(currentSignal);
  redraw();
}

function runIFFT() {
  if (!currentSpectrum.length) {
    currentSignal = generateSignal();
    currentSpectrum = fft(currentSignal);
  }
  currentSignal = ifft(currentSpectrum);
  nextTick(() => {
    if (timeCanvas.value) {
      drawSignal(timeCanvas.value, currentSignal);
    }
  });
}

function onPresetChange() {
  if (signalType.value !== 'custom') {
    runFFT();
  }
}

onMounted(() => {
  runFFT();
  themeObserver = new MutationObserver(() => {
    redraw();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
});

watch(signalSize, () => {
  runFFT();
});
</script>

<style scoped>
.fft-playground {
  margin: 1.5rem 0;
  padding: 1.2rem;
  border: 1px solid var(--fft-border);
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--fft-surface) 96%, transparent);
  box-shadow: var(--fft-shadow-soft);
}

.pg-header h3 {
  margin: 0 0 0.45rem;
  color: var(--fft-text-1);
  letter-spacing: -0.03em;
}

.pg-desc {
  margin: 0 0 1rem;
  color: var(--fft-text-2);
  line-height: 1.65;
}

.pg-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--fft-border);
}

.pg-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pg-row label {
  color: var(--fft-text-2);
  font-size: 0.84rem;
  font-weight: 600;
}

.pg-row select,
.pg-row input {
  border: 1px solid var(--fft-border-strong);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--fft-bg-soft) 82%, transparent);
  color: var(--fft-text-1);
  padding: 0.48rem 0.7rem;
  font-size: 0.84rem;
  font-family: 'Iosevka', 'JetBrains Mono', monospace;
}

.pg-row input {
  min-width: 280px;
}

.pg-row select:focus,
.pg-row input:focus {
  outline: none;
  border-color: var(--fft-accent);
}

.pg-fullwidth {
  width: 100%;
}

.pg-fullwidth input {
  flex: 1;
}

.pg-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.pg-btn {
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.pg-btn:hover {
  transform: translateY(-1px);
}

.pg-btn-primary {
  border: 1px solid color-mix(in srgb, var(--fft-accent) 50%, var(--fft-border-strong));
  background: color-mix(in srgb, var(--fft-accent) 14%, transparent);
  color: var(--fft-text-1);
}

.pg-btn-secondary {
  border: 1px solid var(--fft-border-strong);
  background: color-mix(in srgb, var(--fft-bg-soft) 78%, transparent);
  color: var(--fft-text-1);
}

.pg-canvases {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.pg-canvas-block h4 {
  margin: 0 0 0.45rem;
  color: var(--fft-text-3);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pg-canvas-block canvas {
  width: 100%;
  height: auto;
  border-radius: 0.9rem;
  border: 1px solid var(--fft-border);
}

.pg-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}

.pg-stat {
  border: 1px solid var(--fft-border);
  border-radius: 999px;
  padding: 0.42rem 0.72rem;
  background: color-mix(in srgb, var(--fft-bg-soft) 82%, transparent);
  color: var(--fft-text-2);
  font-size: 0.78rem;
  font-family: 'Iosevka', 'JetBrains Mono', monospace;
}

@media (max-width: 768px) {
  .pg-canvases {
    grid-template-columns: 1fr;
  }

  .pg-actions {
    width: 100%;
    margin-left: 0;
  }
}
</style>
