const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const pkg = readJson('package.json');
  const scripts = pkg.scripts || {};
  const workflow = readText('.github/workflows/quality-gate.yml');

  assert.equal(
    scripts['update:footer:dist'],
    'node scripts/update-footer.js --out-dir=dist',
    'package.json must expose a dist-aware footer update step'
  );

  assert.equal(
    scripts['build:site:dist'],
    'npm run build:geo:dist && npm run normalize:public-html:dist && npm run update:footer:dist && npm run build:dist && npm run build:search-index:dist && npm run build:sitemap:dist && npm run validate:pages:dist',
    'package.json must expose a canonical dist-first site build command'
  );

  assert.equal(
    scripts['ci:quality:dist'],
    'npm run build:site:dist && npm run test:regressions && npm run test:seo-smoke && npm run test:api',
    'package.json must expose a canonical dist-first CI quality command'
  );

  assert.match(
    scripts['test:regressions'] || '',
    /tests\/image-loading-policy\.test\.js/,
    'test:regressions must include the image loading policy checks'
  );

  assert.match(
    scripts['test:regressions'] || '',
    /tests\/build-pipeline-regressions\.test\.js/,
    'test:regressions must include the build pipeline regression checks'
  );

  assert.match(
    scripts['test:regressions'] || '',
    /tests\/header-verifier-regressions\.test\.js/,
    'test:regressions must include the production header verifier checks'
  );

  assert.match(
    scripts['test:regressions'] || '',
    /tests\/footer-widget-loader-regressions\.test\.js/,
    'test:regressions must include the footer widget loader checks'
  );

  assert.match(
    workflow,
    /run: npm run ci:quality:dist/,
    'quality-gate workflow must use the canonical dist-first CI command'
  );
}

try {
  main();
  console.log('Build pipeline regression checks passed.');
} catch (error) {
  console.error('Build pipeline regression checks failed:', error.message);
  process.exit(1);
}
