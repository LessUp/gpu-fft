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
  pkg.exports['./utils'].types,
  pkg.exports['./utils'].import,
  pkg.exports['./utils'].require,
  pkg.exports['./validation'].types,
  pkg.exports['./validation'].import,
  pkg.exports['./validation'].require,
].map(normalize);

// Check all artifacts exist
for (const artifact of artifacts) {
  if (!existsSync(artifact)) {
    throw new Error('Missing package artifact: ' + artifact);
  }
}

// Test ESM exports (main)
const esm = await import(pathToFileURL(normalize(pkg.exports['.'].import)).href);
if (typeof esm.createFFTEngine !== 'function') {
  throw new Error('Missing ESM export createFFTEngine');
}

// Test CJS exports (main)
const cjs = await import('../' + normalize(pkg.exports['.'].require));
if (typeof cjs.createFFTEngine !== 'function') {
  throw new Error('Missing CJS export createFFTEngine');
}

// Test utils subpath
const utilsEsm = await import(pathToFileURL(normalize(pkg.exports['./utils'].import)).href);
if (typeof utilsEsm.hannWindow !== 'function') {
  throw new Error('Missing utils export hannWindow');
}

// Test validation subpath
const validationEsm = await import(
  pathToFileURL(normalize(pkg.exports['./validation'].import)).href
);
if (typeof validationEsm.validateFFT !== 'function') {
  throw new Error('Missing validation export validateFFT');
}

console.log('✓ All package artifacts verified');
console.log('✓ ESM exports functional');
console.log('✓ CJS exports functional');
console.log('✓ Subpath exports functional (utils, validation)');
