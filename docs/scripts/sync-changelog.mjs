import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const docsDir = join(__dirname, '..');

const sourcePath = join(rootDir, 'CHANGELOG.md');
let content;
try {
  content = readFileSync(sourcePath, 'utf-8');
} catch {
  console.warn('CHANGELOG.md not found, skipping sync');
  process.exit(0);
}

// Normalize version headers: ## [1.1.0] - 2025-01-15 -> ## 1.1.0 (2025-01-15)
content = content.replace(
  /^## \[(\d+\.\d+\.?\d*)\] - (\d{4}-\d{2}-\d{2})/gm,
  '## $1 ($2)'
);

// Remove HTML comments and sub-headers to keep docs clean
content = content.replace(/<!--[\s\S]*?-->\n*/g, '');

const HEADER = `---
outline: deep
---

# Changelog

> This page is auto-generated from the root [CHANGELOG.md](https://github.com/LessUp/gpu-fft/blob/main/CHANGELOG.md).

`;

const targetPath = join(docsDir, 'release-notes', 'changelog.md');
writeFileSync(targetPath, HEADER + content.trim() + '\n');
console.log('Synced CHANGELOG.md to docs/release-notes/changelog.md');
