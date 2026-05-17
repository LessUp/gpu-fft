# GitHub Pages Whitepaper Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the GitHub Pages site into a locale-gated technical whitepaper and architecture showcase aligned with the local `kimi-cli` VitePress baseline.

**Architecture:** Keep VitePress as the site engine, but replace the current root-English structure with `/en/` and `/zh/` locale homepages, a simplified theme entry, a new dual-theme token system, and content-led pages backed by a few theme-aware Vue components. Reuse existing deep technical pages where sensible, but rewrite the highest-impact entry, evidence, and architecture surfaces so the public narrative becomes curated, accurate, and visually consistent.

**Tech Stack:** VitePress 1.5, Vue 3 SFCs, TypeScript, custom CSS, vitepress-plugin-mermaid, vitepress-plugin-llms, ECharts

---

### Task 1: Governance artifacts and page map

**Files:**
- Modify: `openspec/changes/rebuild-pages-whitepaper-site/proposal.md`
- Modify: `openspec/changes/rebuild-pages-whitepaper-site/design.md`
- Create: `openspec/changes/rebuild-pages-whitepaper-site/specs/documentation-platform/spec.md`
- Modify: `openspec/changes/rebuild-pages-whitepaper-site/tasks.md`
- Create: `docs/superpowers/specs/2026-05-17-pages-whitepaper-design.md`
- Create: `docs/superpowers/plans/2026-05-17-pages-whitepaper-site.md`

- [ ] **Step 1: Write the documentation-platform delta before editing site code**

```md
## ADDED Requirements

### Requirement: GitHub Pages uses locale gateway entry points
The documentation site SHALL use a root language gateway and expose curated homepages at `/en/` and `/zh/`.
```

- [ ] **Step 2: Verify the change is apply-ready**

Run: `openspec status --change rebuild-pages-whitepaper-site`
Expected: `proposal`, `design`, `specs`, and `tasks` all shown as done or available for implementation

- [ ] **Step 3: Record the target page map in the design spec**

```text
/
├── /en/ homepage + guides + academy hubs
├── /zh/ homepage + guides + academy hubs
└── shared architecture / evidence / reference deep pages
```

- [ ] **Step 4: Record the implementation sequence in the plan**

```md
1. Rebuild docs shell
2. Add locale pages
3. Rewrite architecture / evidence / reference content
4. Fix SVG and chart theming
5. Validate
```

- [ ] **Step 5: Commit**

```bash
git add openspec/changes/rebuild-pages-whitepaper-site docs/superpowers
git commit -m "docs: define pages whitepaper overhaul plan"
```

### Task 2: Rebuild the docs shell

**Files:**
- Modify: `docs/.vitepress/config.ts`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/styles/custom.css`
- Create: `docs/en/index.md`
- Create: `docs/zh/index.md`
- Create: `docs/en/guides/getting-started.md`
- Create: `docs/zh/guides/getting-started.md`
- Create: `docs/en/academy/reading-map.md`
- Create: `docs/zh/academy/reading-map.md`
- Modify: `docs/index.md`

- [ ] **Step 1: Write the failing docs build expectation down**

```bash
npm -C docs run build
```

Expected before the rewrite is complete: broken links, missing locale pages, or stale navigation assumptions when config starts pointing to new entries.

- [ ] **Step 2: Rewrite VitePress config around locale gateway routing**

```ts
locales: {
  zh: { label: '简体中文', link: '/zh/' },
  en: { label: 'English', link: '/en/' },
},
themeConfig: {
  nav: [
    { text: 'Guides', link: '/en/guides/getting-started' },
    { text: 'Academy', link: '/en/academy/reading-map' },
    { text: 'Architecture', link: '/architecture/overview' },
    { text: 'Evidence', link: '/showcase/benchmarks' },
    { text: 'Reference', link: '/reference/papers' },
  ],
}
```

- [ ] **Step 3: Simplify theme wiring and remove injected homepage chrome**

```ts
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('FFTPlayground', FFTPlayground)
    app.component('ArchitectureAtlas', ArchitectureAtlas)
    app.component('CapabilityMatrix', CapabilityMatrix)
  },
} satisfies Theme
```

- [ ] **Step 4: Replace the token system with dual-theme whitepaper tokens**

```css
:root {
  --fft-bg: oklch(0.98 0.004 95);
  --fft-surface: oklch(0.95 0.006 95);
  --fft-text-1: oklch(0.24 0.02 250);
  --fft-accent: oklch(0.68 0.19 135);
}

.dark {
  --fft-bg: oklch(0.15 0.015 250);
  --fft-surface: oklch(0.2 0.018 250);
  --fft-text-1: oklch(0.94 0.01 250);
}
```

- [ ] **Step 5: Run the docs build and make sure the shell compiles**

Run: `npm -C docs run build`
Expected: VitePress build completes with the new locale homepages and no missing component errors

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress docs/index.md docs/en docs/zh
git commit -m "docs: rebuild pages shell for whitepaper site"
```

### Task 3: Rewrite core whitepaper content

**Files:**
- Modify: `docs/setup/quick-start.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/showcase/benchmarks.md`
- Modify: `docs/showcase/decisions.md`
- Modify: `docs/reference/papers.md`
- Modify: `docs/reference/implementations.md`
- Modify: `docs/playground/index.md`

- [ ] **Step 1: Replace generic intros with capability-boundary framing**

```md
## Capability boundary

- WebGPU FFT core: GPU-accelerated
- `createSpectrumAnalyzer()`: CPU-only
- `createImageFilter()`: CPU-only
```

- [ ] **Step 2: Rewrite architecture overview into a system-reading page**

```md
## System map

Public API → Execution planner → GPU compute passes → CPU-only utilities
```

- [ ] **Step 3: Rewrite benchmarks and decisions pages as evidence surfaces**

```md
## Reading the benchmark correctly

The chart reports measured CPU results in this environment. GPU results appear only when a WebGPU adapter is available.
```

- [ ] **Step 4: Upgrade reference pages into a research canon**

```md
## How to read this list

Use the citations below to understand algorithmic lineage, GPU implementation strategies, and where `gpu-fft` intentionally stays narrower than cuFFT or VkFFT.
```

- [ ] **Step 5: Rebuild playground copy around learning goals**

```md
## What the explorer teaches

This demo explains FFT behavior with a CPU implementation. It is a conceptual lab, not a benchmark of the GPU engine.
```

- [ ] **Step 6: Run focused docs build verification**

Run: `npm -C docs run build`
Expected: the rebuilt content renders without dead links or markdown compilation errors

- [ ] **Step 7: Commit**

```bash
git add docs/setup/quick-start.md docs/architecture/overview.md docs/showcase docs/reference docs/playground/index.md
git commit -m "docs: rewrite core whitepaper content"
```

### Task 4: Fix visual assets and theme-aware diagrams

**Files:**
- Modify: `docs/.vitepress/public/logo.svg`
- Modify: `docs/.vitepress/public/favicon.svg`
- Modify: `docs/.vitepress/public/hero.svg`
- Modify: `docs/.vitepress/theme/components/FFTPlayground.vue`
- Create: `docs/.vitepress/theme/components/ArchitectureAtlas.vue`
- Create: `docs/.vitepress/theme/components/CapabilityMatrix.vue`

- [ ] **Step 1: Write the failing visual constraint**

```text
Any SVG, chart, or canvas that assumes a dark background must be rewritten to read from theme tokens.
```

- [ ] **Step 2: Replace fixed-color SVG assumptions with dual-theme-safe geometry**

```svg
<path stroke="#5d8f00" />
<path stroke="#137ea8" />
```

Use mid-tone accent values that survive on both light and dark backgrounds.

- [ ] **Step 3: Make the playground read colors from CSS variables**

```ts
const style = getComputedStyle(document.documentElement)
const canvasBg = style.getPropertyValue('--fft-canvas-bg').trim()
const lineColor = style.getPropertyValue('--fft-accent').trim()
```

- [ ] **Step 4: Add theme-aware structural components for homepage and architecture pages**

```vue
<ArchitectureAtlas />
<CapabilityMatrix />
```

- [ ] **Step 5: Re-run the docs build**

Run: `npm -C docs run build`
Expected: component registration succeeds, no SSR/client-only errors, no asset path regressions

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/public docs/.vitepress/theme/components
git commit -m "docs: fix theme-aware visuals and diagrams"
```

### Task 5: Validate and integrate safely

**Files:**
- Modify as needed based on validation output

- [ ] **Step 1: Run the canonical validation chain**

Run: `npm run lint && npm run format:check && npm run typecheck && npm test`
Expected: all commands pass

- [ ] **Step 2: Run docs build and packaging-related checks**

Run: `npm run build && npm run smoke:package && npm -C docs run build`
Expected: package build, smoke test, and docs build all pass

- [ ] **Step 3: Inspect git diff for wording drift**

Run: `git --no-pager diff --stat && git --no-pager diff README.md docs openspec`
Expected: all public wording remains aligned on GPU vs CPU-only boundaries

- [ ] **Step 4: Create the final integration commit**

```bash
git add .
git commit -m "feat(docs): rebuild pages as whitepaper site"
```

- [ ] **Step 5: Merge only after verification**

```bash
git checkout master
git merge --ff-only pages-whitepaper-academy
git push origin master
```

Expected: only perform this step if the branch is clean, verified, and mergeable without overwriting unrelated work.
