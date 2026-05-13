<template>
  <ClientOnly>
    <div class="fft-playground">
      <div class="pg-header">
        <h3>FFT Explorer</h3>
        <p class="pg-desc">
          Select a signal preset or enter custom values, then run FFT to see the frequency spectrum.
        </p>
      </div>

      <div class="pg-controls">
        <div class="pg-row">
          <label>Signal:</label>
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
          <label>Size (power of 2):</label>
          <select v-model.number="signalSize">
            <option :value="64">64</option>
            <option :value="128">128</option>
            <option :value="256">256</option>
            <option :value="512">512</option>
          </select>
        </div>

        <div v-if="signalType === 'custom'" class="pg-row pg-fullwidth">
          <label>Values (comma-separated):</label>
          <input v-model="customValues" type="text" placeholder="0, 1, 0, -1, 0, 1..." />
        </div>

        <div class="pg-actions">
          <button class="pg-btn pg-btn-primary" @click="runFFT">Run FFT</button>
          <button class="pg-btn pg-btn-secondary" @click="runIFFT">Run Inverse FFT</button>
        </div>
      </div>

      <div class="pg-canvases">
        <div class="pg-canvas-block">
          <h4>Time Domain</h4>
          <canvas ref="timeCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
        <div class="pg-canvas-block">
          <h4>Magnitude Spectrum</h4>
          <canvas ref="freqCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
        </div>
      </div>

      <div class="pg-stats" v-if="stats">
        <span class="pg-stat">Samples: {{ stats.samples }}</span>
        <span class="pg-stat">Peak Bin: {{ stats.peakBin }}</span>
        <span class="pg-stat">Peak Mag: {{ stats.peakMag }}</span>
        <span class="pg-stat">DC: {{ stats.dc }}</span>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';

const signalType = ref('sine');
const signalSize = ref(256);
const customValues = ref('');
const canvasWidth = 600;
const canvasHeight = 220;
const timeCanvas = ref<HTMLCanvasElement | null>(null);
const freqCanvas = ref<HTMLCanvasElement | null>(null);
const stats = ref<{ samples: number; peakBin: number; peakMag: string; dc: string } | null>(null);

let currentSignal = new Float32Array(0);
let currentSpectrum = new Float32Array(0);

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
        const vals = customValues.value
          .split(',')
          .map((s) => parseFloat(s.trim()))
          .filter((x) => !isNaN(x));
        v = i < vals.length ? vals[i] : 0;
        break;
      }
    }
    data[i * 2] = v;
    data[i * 2 + 1] = 0;
  }
  return data;
}

// Inline simplified Cooley-Tukey Radix-2 DIT FFT
function fft(input: Float32Array): Float32Array {
  const n2 = input.length;
  const n = n2 / 2;
  if ((n & (n - 1)) !== 0) throw new Error('Size must be power of 2');

  const out = new Float32Array(n2);
  // Bit-reverse copy
  const bits = Math.log2(n);
  for (let i = 0; i < n; i++) {
    let j = 0;
    for (let b = 0; b < bits; b++) {
      j = (j << 1) | ((i >> b) & 1);
    }
    out[j * 2] = input[i * 2];
    out[j * 2 + 1] = input[i * 2 + 1];
  }

  // Butterfly stages
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
  const conj = new Float32Array(n2);
  for (let i = 0; i < n2; i += 2) {
    conj[i] = input[i];
    conj[i + 1] = -input[i + 1];
  }
  const transformed = fft(conj);
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
    const r = spectrum[i * 2];
    const im = spectrum[i * 2 + 1];
    mag[i] = Math.sqrt(r * r + im * im);
  }
  return mag;
}

function drawSignal(canvas: HTMLCanvasElement, data: Float32Array) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const padding = 20;
  const plotH = h - padding * 2;
  const plotW = w - padding * 2;
  const n = data.length / 2;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding + (plotH / 4) * i;
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
  }
  ctx.stroke();

  // Zero line
  ctx.strokeStyle = '#484f58';
  ctx.beginPath();
  ctx.moveTo(padding, padding + plotH / 2);
  ctx.lineTo(w - padding, padding + plotH / 2);
  ctx.stroke();

  // Find range
  let maxVal = 0;
  for (let i = 0; i < n; i++) {
    maxVal = Math.max(maxVal, Math.abs(data[i * 2]));
  }
  maxVal = Math.max(maxVal, 0.01);

  // Signal line
  ctx.strokeStyle = '#76b900';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = padding + (i / (n - 1)) * plotW;
    const y = padding + plotH / 2 - (data[i * 2] / maxVal) * (plotH / 2.2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Glow effect
  ctx.strokeStyle = 'rgba(118, 185, 0, 0.3)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = padding + (i / (n - 1)) * plotW;
    const y = padding + plotH / 2 - (data[i * 2] / maxVal) * (plotH / 2.2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillText(`n = ${n}`, padding, h - 4);
  ctx.fillText(`max = ${maxVal.toFixed(3)}`, w - padding - 80, h - 4);
}

function drawSpectrum(canvas: HTMLCanvasElement, mag: Float32Array) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const padding = 20;
  const plotH = h - padding * 2;
  const plotW = w - padding * 2;
  const n = mag.length;

  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#161b22';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = '#21262d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padding + (plotH / 4) * i;
    ctx.moveTo(padding, y);
    ctx.lineTo(w - padding, y);
  }
  ctx.stroke();

  // Find max
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

  // Bars
  const barW = plotW / halfN;
  for (let i = 0; i < halfN; i++) {
    const barH = (mag[i] / maxMag) * plotH;
    const x = padding + i * barW;
    const y = padding + plotH - barH;

    const intensity = mag[i] / maxMag;
    const r = Math.floor(118 * intensity + 48 * (1 - intensity));
    const g = Math.floor(185 * intensity + 72 * (1 - intensity));
    const b = Math.floor(0 * intensity + 120 * (1 - intensity));

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
    ctx.fillRect(x + 0.5, y, Math.max(barW - 1, 1), barH);
  }

  // Labels
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.fillText(`bins = 0..${halfN - 1}`, padding, h - 4);
  ctx.fillText(`peak = ${maxMag.toFixed(2)} @ bin ${peakBin}`, w - padding - 140, h - 4);

  // Update stats
  stats.value = {
    samples: n,
    peakBin,
    peakMag: maxMag.toFixed(4),
    dc: mag[0].toFixed(4),
  };
}

function runFFT() {
  currentSignal = generateSignal();
  currentSpectrum = fft(currentSignal);
  const mag = magnitudeSpectrum(currentSpectrum);
  nextTick(() => {
    if (timeCanvas.value) drawSignal(timeCanvas.value, currentSignal);
    if (freqCanvas.value) drawSpectrum(freqCanvas.value, mag);
  });
}

function runIFFT() {
  if (currentSpectrum.length === 0) {
    currentSignal = generateSignal();
    currentSpectrum = fft(currentSignal);
  }
  currentSignal = ifft(currentSpectrum);
  nextTick(() => {
    if (timeCanvas.value) drawSignal(timeCanvas.value, currentSignal);
  });
}

function onPresetChange() {
  if (signalType.value !== 'custom') {
    runFFT();
  }
}

onMounted(() => {
  runFFT();
});

watch(signalSize, () => {
  runFFT();
});
</script>

<style scoped>
.fft-playground {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.pg-header h3 {
  margin: 0 0 0.5rem;
  color: #c9d1d9;
  font-size: 1.25rem;
}

.pg-desc {
  color: #8b949e;
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.pg-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #21262d;
}

.pg-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pg-row label {
  color: #8b949e;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.pg-row select,
.pg-row input {
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 6px;
  color: #c9d1d9;
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  font-family: 'JetBrains Mono', monospace;
}

.pg-row input {
  min-width: 280px;
}

.pg-row select:focus,
.pg-row input:focus {
  outline: none;
  border-color: #76b900;
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
  border: none;
  border-radius: 6px;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pg-btn-primary {
  background: linear-gradient(135deg, #76b900, #5a8c00);
  color: #0d1117;
}

.pg-btn-primary:hover {
  box-shadow: 0 4px 12px rgba(118, 185, 0, 0.3);
  transform: translateY(-1px);
}

.pg-btn-secondary {
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.pg-btn-secondary:hover {
  border-color: #76b900;
  color: #76b900;
}

.pg-canvases {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.pg-canvas-block h4 {
  margin: 0 0 0.5rem;
  color: #8b949e;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pg-canvas-block canvas {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #30363d;
}

.pg-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #21262d;
}

.pg-stat {
  background: #21262d;
  color: #8b949e;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid #30363d;
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
