const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const partitaIvaHtml = readText('blog/partita-iva-ecommerce.html');
  assert.ok(
    partitaIvaHtml.includes('Percorsi consigliati'),
    'blog/partita-iva-ecommerce.html must expose a strategic internal-link cluster'
  );
  assert.ok(
    partitaIvaHtml.includes('href="/zone-servite/#ecommerce"'),
    'blog/partita-iva-ecommerce.html must link to the ecommerce local-intent hub section'
  );
  assert.ok(
    partitaIvaHtml.includes('href="/realizzazione-siti-web/"'),
    'blog/partita-iva-ecommerce.html must link to the realizzazione-siti-web hub to pass commercial intent downstream'
  );

  const accessibilityHtml = readText('blog/obblighi-legge-accessibilita-siti.html');
  assert.ok(
    accessibilityHtml.includes('Percorsi consigliati'),
    'blog/obblighi-legge-accessibilita-siti.html must expose a strategic internal-link cluster'
  );
  assert.ok(
    accessibilityHtml.includes('href="../servizi/accessibilita.html"'),
    'blog/obblighi-legge-accessibilita-siti.html must point to the dedicated accessibilita service page'
  );
  assert.ok(
    accessibilityHtml.includes('href="/zone-servite/#accessibilita"'),
    'blog/obblighi-legge-accessibilita-siti.html must link to the accessibilita local-intent hub section'
  );

  const gscGuideHtml = readText('blog/google-search-console-guida.html');
  assert.ok(
    gscGuideHtml.includes('Percorsi consigliati'),
    'blog/google-search-console-guida.html must expose a strategic internal-link cluster'
  );
  assert.ok(
    gscGuideHtml.includes('href="/realizzazione-siti-web/"'),
    'blog/google-search-console-guida.html must link to the realizzazione-siti-web hub for local commercial follow-through'
  );

  console.log('Internal linking regression checks passed.');
}

try {
  main();
} catch (error) {
  console.error('Internal linking regression checks failed:', error.message);
  process.exit(1);
}
