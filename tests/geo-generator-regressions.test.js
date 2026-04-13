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
  const agenziaTemplate = readText('templates/agenzia-web-content.njk');
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
  assert.ok(
    generator.includes("page = page.replace(/studio del mercato di Rho/g, `studio del mercato di ${city.name}`);"),
    'Realizzazione generator must replace the Rho market placeholder with the current city'
  );
  assert.ok(
    generator.includes("page = page.replace(/mercato di Rho/g, `mercato di ${city.name}`);"),
    'Realizzazione generator must not leak \"mercato di Rho\" into non-Rho geo pages'
  );
  assert.ok(
    generator.includes('preserveCustomBlocks(targetPath, html)'),
    'Geo generator should preserve marked custom content blocks during regeneration'
  );
  assert.ok(
    agenziaTemplate.includes('CUSTOM:geo-proof:START'),
    'Agenzia template should expose preserved custom content markers for manual rewrites'
  );
}

try {
  main();
  console.log('Geo generator regression checks passed.');
} catch (error) {
  console.error('Geo generator regression checks failed:', error.message);
  process.exit(1);
}
