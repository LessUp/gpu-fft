<template>
  <div class="home-hero">
    <div class="hero-bg-grid"></div>
    <div class="hero-glow"></div>

    <div class="hero-content">
      <div class="hero-badge">
        <span class="badge-dot"></span>
        GPU Compute Shaders &middot; Zero Dependencies &middot; TypeScript
      </div>

      <h1 class="hero-title">
        <span class="gradient-text">WebGPU FFT</span>
      </h1>

      <p class="hero-subtitle">
        High-performance 1D/2D Fast Fourier Transforms in the browser.
        Compute shaders unlock GPU parallelism; CPU utilities guarantee universal compatibility.
      </p>

      <div class="hero-actions">
        <a href="/setup/quick-start" class="hero-btn hero-btn-primary">
          Quick Start
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
        <a href="/api/index" class="hero-btn hero-btn-secondary">View API</a>
        <a href="/showcase/benchmarks" class="hero-btn hero-btn-secondary">Benchmarks</a>
      </div>

      <div class="hero-stats">
        <div class="stat">
          <div class="stat-value">~27kB</div>
          <div class="stat-label">ESM bundle</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-value">0</div>
          <div class="stat-label">Runtime deps</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-value">65k</div>
          <div class="stat-label">Max 1D size</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <div class="stat-value">2048²</div>
          <div class="stat-label">Max 2D size</div>
        </div>
      </div>
    </div>

    <div class="hero-visual">
      <svg viewBox="0 0 400 280" class="hero-svg" aria-hidden="true">
        <defs>
          <linearGradient id="hgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#76b900" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#00c3ff" stop-opacity="0.3"/>
          </linearGradient>
          <filter id="hg" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <!-- Butterfly abstract -->
        <g opacity="0.6">
          <line x1="40" y1="60" x2="140" y2="60" stroke="#76b900" stroke-width="1.5" opacity="0.7"/>
          <line x1="40" y1="220" x2="140" y2="220" stroke="#76b900" stroke-width="1.5" opacity="0.7"/>
          <line x1="40" y1="60" x2="140" y2="220" stroke="#00c3ff" stroke-width="1" opacity="0.4"/>
          <line x1="40" y1="220" x2="140" y2="60" stroke="#00c3ff" stroke-width="1" opacity="0.4"/>
          <line x1="140" y1="60" x2="240" y2="60" stroke="#76b900" stroke-width="1.5" opacity="0.8"/>
          <line x1="140" y1="220" x2="240" y2="220" stroke="#76b900" stroke-width="1.5" opacity="0.8"/>
          <line x1="140" y1="60" x2="240" y2="140" stroke="#00c3ff" stroke-width="1" opacity="0.5"/>
          <line x1="140" y1="220" x2="240" y2="140" stroke="#00c3ff" stroke-width="1" opacity="0.5"/>
          <line x1="140" y1="140" x2="240" y2="100" stroke="#76b900" stroke-width="1.5" opacity="0.8"/>
          <line x1="140" y1="140" x2="240" y2="180" stroke="#76b900" stroke-width="1.5" opacity="0.8"/>
        </g>
        <!-- Nodes -->
        <g fill="#76b900" filter="url(#hg)">
          <circle cx="40" cy="60" r="4"/>
          <circle cx="40" cy="220" r="4"/>
          <circle cx="140" cy="60" r="4"/>
          <circle cx="140" cy="220" r="4"/>
          <circle cx="140" cy="140" r="4"/>
          <circle cx="240" cy="60" r="3"/>
          <circle cx="240" cy="140" r="5"/>
          <circle cx="240" cy="220" r="3"/>
          <circle cx="240" cy="100" r="3"/>
          <circle cx="240" cy="180" r="3"/>
        </g>
        <!-- Cyan accent -->
        <g fill="#00c3ff" opacity="0.7">
          <circle cx="240" cy="140" r="2"/>
        </g>
        <!-- Spectrum bars -->
        <g transform="translate(280, 40)">
          <rect x="0" y="160" width="10" height="40" rx="2" fill="#76b900" opacity="0.3"/>
          <rect x="14" y="120" width="10" height="80" rx="2" fill="#76b900" opacity="0.5"/>
          <rect x="28" y="60" width="10" height="140" rx="2" fill="#76b900" opacity="0.8" filter="url(#hg)"/>
          <rect x="42" y="140" width="10" height="60" rx="2" fill="#76b900" opacity="0.4"/>
          <rect x="56" y="100" width="10" height="100" rx="2" fill="#76b900" opacity="0.6"/>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
// Static hero component, no reactive logic needed
</script>

<style scoped>
.home-hero {
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
  align-items: center;
  padding: 3rem 2rem 2rem;
  min-height: 420px;
  overflow: hidden;
}

.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, #30363d 1px, transparent 0);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%);
  opacity: 0.35;
  pointer-events: none;
}

.hero-glow {
  position: absolute;
  top: -20%;
  left: -10%;
  width: 60%;
  height: 80%;
  background: radial-gradient(ellipse at center, rgba(118, 185, 0, 0.08), transparent 70%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(118, 185, 0, 0.1);
  border: 1px solid rgba(118, 185, 0, 0.2);
  color: #76b900;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  margin-bottom: 1.25rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #76b900;
  box-shadow: 0 0 6px rgba(118, 185, 0, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  margin: 0 0 1rem;
  font-size: clamp(2.5rem, 5vw, 3.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(120deg, #c9d1d9 20%, #76b900 60%, #00c3ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  color: #8b949e;
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 520px;
  margin: 0 0 1.5rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
}

.hero-btn-primary {
  background: linear-gradient(135deg, #76b900, #5a8c00);
  color: #0d1117;
  box-shadow: 0 4px 14px rgba(118, 185, 0, 0.3);
}

.hero-btn-primary:hover {
  box-shadow: 0 6px 20px rgba(118, 185, 0, 0.45);
  transform: translateY(-1px);
}

.hero-btn-secondary {
  background: #161b22;
  color: #c9d1d9;
  border: 1px solid #30363d;
}

.hero-btn-secondary:hover {
  border-color: #76b900;
  color: #76b900;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat {
  text-align: center;
}

.stat-value {
  color: #c9d1d9;
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.stat-label {
  color: #484f58;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.15rem;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: #30363d;
}

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-svg {
  width: 100%;
  max-width: 380px;
  height: auto;
  opacity: 0.85;
}

@media (max-width: 960px) {
  .home-hero {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
  }

  .hero-visual {
    display: none;
  }
}
</style>
