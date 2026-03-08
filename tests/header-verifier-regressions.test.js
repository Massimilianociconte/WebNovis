const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const verifierSource = readText('scripts/verify-prod-headers.js');
  const matrixPath = path.join(ROOT, 'docs', 'deploy-header-matrix.md');

  assert.ok(
    fs.existsSync(matrixPath),
    'docs/deploy-header-matrix.md must document header ownership across app, static host, and edge'
  );

  assert.match(
    verifierSource,
    /severity/i,
    'scripts/verify-prod-headers.js must classify mismatches by severity'
  );

  assert.match(
    verifierSource,
    /edgeManaged|edge_managed|managedByEdge/i,
    'scripts/verify-prod-headers.js must model edge-managed header exceptions explicitly'
  );

  assert.match(
    verifierSource,
    /warn/i,
    'scripts/verify-prod-headers.js must support non-fatal warning output'
  );
}

try {
  main();
  console.log('Header verifier regression checks passed.');
} catch (error) {
  console.error('Header verifier regression checks failed:', error.message);
  process.exit(1);
}