const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  assert.ok(
    fs.existsSync(path.join(ROOT, 'templates', 'base-pages', 'agenzia-web-source.html')),
    'A dedicated agenzia geo source template must exist under templates/base-pages'
  );
  assert.ok(
    fs.existsSync(path.join(ROOT, 'templates', 'base-pages', 'realizzazione-siti-web-source.html')),
    'A dedicated realizzazione geo source template must exist under templates/base-pages'
  );

  const generator = readText('scripts/generate-all-geo.js');
  assert.ok(
    !generator.includes("getBasePage('agenzia-web-rho.html')"),
    'Geo generator must not read agenzia-web-rho.html as its source template'
  );
  assert.ok(
    !generator.includes("getBasePage('realizzazione-siti-web-rho.html')"),
    'Geo generator must not read realizzazione-siti-web-rho.html as its source template'
  );
  assert.ok(
    generator.includes('PUBLISH_DIR'),
    'Geo generator should support an explicit publish directory configuration'
  );
}

try {
  main();
  console.log('Geo generator regression checks passed.');
} catch (error) {
  console.error('Geo generator regression checks failed:', error.message);
  process.exit(1);
}
