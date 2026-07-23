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
    'node scripts/prepare-public-artifact.js --out-dir=dist',
    'package.json must expose one staging-first public build transaction'
  );

  assert.equal(
    scripts['build:llms'],
    'node scripts/generate-llms-index.js',
    'package.json must expose build:llms for GEO index generation'
  );

  assert.equal(
    scripts['build:llms-full'],
    'node scripts/generate-llms-full.js',
    'package.json must expose build:llms-full for full LLM corpus generation'
  );

  assert.equal(
    scripts['build:search-index:dist'],
    'node build-search-index.js --out-dir=dist --public-only',
    'the public search build must exclude the private AI retrieval corpus'
  );

  assert.equal(
    scripts['verify:artifact'],
    'node scripts/verify-public-artifact.js --out-dir=dist',
    'package.json must expose an explicit public artifact verifier'
  );

  assert.match(
    scripts['test:regressions'] || '',
    /tests\/lcp-hero-regressions\.test\.js/,
    'test:regressions must include LCP hero safety checks'
  );

  assert.equal(
    scripts['ci:quality:dist'],
    'npm run build:site:dist && npm run verify:artifact && npm run test:regressions && npm run test:seo-smoke && npm run test:api',
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
    /tests\/public-artifact-regressions\.test\.js/,
    'test:regressions must include public artifact safety checks'
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
  assert.match(
    workflow,
    /git diff --exit-code/,
    'quality-gate workflow must fail if a dist build mutates tracked source files'
  );
  assert.doesNotMatch(
    workflow,
    /verify:prod-headers[\s\S]*if:\s*(?!github\.event_name == 'workflow_dispatch')/,
    'live production headers must not be treated as an implicit local build proof'
  );
}

try {
  main();
  console.log('Build pipeline regression checks passed.');
} catch (error) {
  console.error('Build pipeline regression checks failed:', error.message);
  process.exit(1);
}
