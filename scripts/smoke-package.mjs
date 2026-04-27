/**
 * Smoke test for package artifacts
 * Verifies that all package exports are present and functional
 */

import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const normalize = (value) => value.replace(/^\.\//, '');

const artifacts = [
  pkg.main,
  pkg.module,
  pkg.types,
  pkg.exports['.'].types,
  pkg.exports['.'].import,
  pkg.exports['.'].require,
].map(normalize);

// Check all artifacts exist
for (const artifact of artifacts) {
  if (!existsSync(artifact)) {
    throw new Error('Missing package artifact: ' + artifact);
  }
}

// Test ESM exports
const esm = await import(pathToFileURL(normalize(pkg.exports['.'].import)).href);
if (typeof esm.createFFTEngine !== 'function') {
  throw new Error('Missing ESM export createFFTEngine');
}

// Test CJS exports
const cjs = await import('../' + normalize(pkg.exports['.'].require));
if (typeof cjs.createFFTEngine !== 'function') {
  throw new Error('Missing CJS export createFFTEngine');
}

console.log('✓ All package artifacts verified');
console.log('✓ ESM exports functional');
console.log('✓ CJS exports functional');
