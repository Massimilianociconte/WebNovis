const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const partitaIvaArticle = readText('blog/partita-iva-ecommerce.html');
  assert.ok(
    partitaIvaArticle.includes('https://www.agenziaentrate.gov.it/portale/schede/istanze/aa9_11-apertura-variazione-chiusura-pf/quando-utilizzare-imprese'),
    'blog/partita-iva-ecommerce.html must cite the Agenzia delle Entrate guidance for opening a partita IVA'
  );
  assert.ok(
    partitaIvaArticle.includes('https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2025.02.gestione-artigiani-e-commercianti-contributi-per-il-2025.html'),
    'blog/partita-iva-ecommerce.html must cite the INPS guidance for artigiani e commercianti contributions'
  );

  const accessibilityArticle = readText('blog/obblighi-legge-accessibilita-siti.html');
  assert.ok(
    accessibilityArticle.includes('https://www.agid.gov.it/it/design-servizi/accessibilita'),
    'blog/obblighi-legge-accessibilita-siti.html must cite the AGID accessibility guidance'
  );
  assert.ok(
    accessibilityArticle.includes('https://digital-strategy.ec.europa.eu/en/policies/web-accessibility'),
    'blog/obblighi-legge-accessibilita-siti.html must cite the European Commission accessibility policy page'
  );

  const gscGuideArticle = readText('blog/google-search-console-guida.html');
  assert.ok(
    gscGuideArticle.includes('https://developers.google.com/search/docs/monitor-debug/search-console-start'),
    'blog/google-search-console-guida.html must cite the Search Console onboarding documentation'
  );
  assert.ok(
    gscGuideArticle.includes('https://support.google.com/webmasters/answer/7042828?hl=it'),
    'blog/google-search-console-guida.html must cite the Search Console performance metrics documentation'
  );
  assert.ok(
    gscGuideArticle.includes('https://support.google.com/webmasters/answer/9012289?hl=it'),
    'blog/google-search-console-guida.html must cite the URL Inspection documentation'
  );
}

try {
  main();
  console.log('Priority content regression checks passed.');
} catch (error) {
  console.error('Priority content regression checks failed:', error.message);
  process.exit(1);
}
