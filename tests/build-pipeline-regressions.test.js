const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function main() {
  const packageJson = readJson('package.json');

  for (const file of ['build-search-index.js', 'generate-sitemap.js', 'scripts/validate-pages.js']) {
    const content = readText(file);
    assert.ok(content.includes('PUBLISH_DIR'), `${file} must support an explicit publish directory`);
  }

  assert.ok(
    fs.existsSync(path.join(ROOT, 'scripts', 'build-site.js')),
    'scripts/build-site.js must exist to formalize the end-to-end build chain'
  );

  assert.ok(
    typeof packageJson.scripts['build:site'] === 'string',
    'package.json must expose a build:site script'
  );
  assert.ok(
    packageJson.scripts['ci:quality'].includes('build:site'),
    'ci:quality must reuse the unified build chain instead of duplicating the steps'
  );
}

try {
  main();
  console.log('Build pipeline regression checks passed.');
} catch (error) {
  console.error('Build pipeline regression checks failed:', error.message);
  process.exit(1);
}
