const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const governance = require(path.join(ROOT, 'config', 'pseo-governance.js'));

  assert.equal(
    governance.getIndexationDirectivesForPath('/google-ads-milano.html'),
    'noindex, follow',
    'google-ads-milano.html should be de-amplified via noindex, follow'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/sviluppo-app-mobile-milano.html'),
    'noindex, follow',
    'sviluppo-app-mobile-milano.html should be de-amplified via noindex, follow'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/agenzia-web-rho.html'),
    'index, follow',
    'agenzia-web-rho.html must remain indexable as a core geo page'
  );

  const sitemap = readText('sitemap.xml');
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/google-ads-milano.html'),
    'sitemap.xml must exclude phase-1 de-amplified page google-ads-milano.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/sviluppo-app-mobile-milano.html'),
    'sitemap.xml must exclude phase-1 de-amplified page sviluppo-app-mobile-milano.html'
  );

  const homepage = readText('index.html');
  assert.ok(
    homepage.includes('hreflang="it-IT"'),
    'index.html must expose a self-referential hreflang="it-IT" tag'
  );
}

try {
  main();
  console.log('pSEO governance regression checks passed.');
} catch (error) {
  console.error('pSEO governance regression checks failed:', error.message);
  process.exit(1);
}
