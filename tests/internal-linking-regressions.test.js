const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  ALL_INDEXABLE_GEO_PATHS,
  isGeoPath,
  getIndexableGeoPaths
} = require('../config/pseo-governance');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractInternalPathnames(html, sourcePath = '/') {
  const baseUrl = new URL(sourcePath, 'https://www.webnovis.com');
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)]
    .map((match) => {
      try {
        const url = new URL(match[1].replace(/&amp;/g, '&'), baseUrl);
        return url.hostname === 'www.webnovis.com' ? url.pathname : null;
      } catch (_) {
        return null;
      }
    })
    .filter(Boolean);
}

function main() {
  assert.equal(typeof getIndexableGeoPaths, 'function', 'governance must export a deterministic GEO allowlist helper');
  assert.deepEqual(
    getIndexableGeoPaths(),
    [...ALL_INDEXABLE_GEO_PATHS].sort(),
    'the deterministic GEO allowlist helper must return every approved path in stable order'
  );

  const promotionPages = [
    ['index.html', '/'],
    ['agenzia-web/index.html', '/agenzia-web/'],
    ['realizzazione-siti-web/index.html', '/realizzazione-siti-web/'],
    ['zone-servite/index.html', '/zone-servite/']
  ];
  for (const [relativePath, publicPath] of promotionPages) {
    const promotedGeoPaths = extractInternalPathnames(readText(relativePath), publicPath).filter(isGeoPath);
    const forbidden = [...new Set(promotedGeoPaths.filter((pathname) => !ALL_INDEXABLE_GEO_PATHS.has(pathname)))];
    assert.deepEqual(
      forbidden,
      [],
      `${relativePath} must not promote de-amplified GEO URLs: ${forbidden.slice(0, 20).join(', ')}`
    );
  }

  const zoneGeoPaths = new Set(
    extractInternalPathnames(readText('zone-servite/index.html'), '/zone-servite/').filter(isGeoPath)
  );
  assert.deepEqual(
    [...ALL_INDEXABLE_GEO_PATHS].filter((pathname) => !zoneGeoPaths.has(pathname)),
    [],
    'zone-servite/index.html must preserve a discoverable link to every approved GEO landing'
  );

  const linkGraph = JSON.parse(readText('data/link-graph.json'));
  const graphPaths = linkGraph.pages.flatMap((page) => [page.url, ...page.linksTo]);
  assert.deepEqual(
    [...new Set(graphPaths.filter((pathname) => !ALL_INDEXABLE_GEO_PATHS.has(pathname)))],
    [],
    'the generated GEO link graph must not reintroduce de-amplified pages or targets'
  );

  const translationGuide = readText('blog/tradurre-sito-web-guida.html');
  assert.ok(
    translationGuide.includes('href="/blog/ecommerce-b2b-guida.html"'),
    'the translation guide must link to the existing ecommerce B2B article'
  );
  assert.ok(
    !translationGuide.includes('href="https://www.webnovis.com/ecommerce-b2b-guida"'),
    'the translation guide must not retain the verified root-level 404'
  );

  const strangeUrlsGuide = readText('blog/url-strane-search-console.html');
  for (const brokenHref of [
    'parametri-url-search-console.html',
    'url-indicizzate-strane.html',
    'gsc-coverage-anomalie.html',
    'pulizia-indice-google.html'
  ]) {
    assert.ok(!strangeUrlsGuide.includes(`href="${brokenHref}"`), `verified 404 must be removed: ${brokenHref}`);
  }
  for (const existingHref of [
    'canonical-tag-guida.html',
    'indicizzazione-google-problemi.html',
    'google-search-console-avanzato.html',
    'crawl-budget-ottimizzazione.html'
  ]) {
    assert.ok(strangeUrlsGuide.includes(`href="${existingHref}"`), `replacement must target an existing relevant article: ${existingHref}`);
  }

  const editorialInlinks = [
    ['blog/marketing-digitale-attivita-locali.html', '/blog/caffe-sempione-caso-studio-locale.html'],
    ['blog/intelligenza-artificiale-pmi.html', '/blog/ia-cartelle-cliniche-previsione-malattie.html'],
    ['blog/web-design-trends-2026.html', '/blog/importanza-del-design-siti-web.html'],
    ['blog/obblighi-legge-accessibilita-siti.html', '/blog/sanzioni-sito-non-accessibile-2026.html'],
    ['blog/ottimizzazione-tasso-conversione.html', '/blog/sito-web-che-non-converte.html'],
    ['blog/portare-attivita-online.html', '/portfolio/case-study/comeleapi.html']
  ];
  for (const [source, target] of editorialInlinks) {
    assert.ok(readText(source).includes(`href="${target}"`), `${source} must provide a contextual inlink to ${target}`);
  }

  const blogDir = path.join(ROOT, 'blog');
  const utmOffenders = [];
  let attributedLinks = 0;
  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(blogDir, entry.name), 'utf8');
    if (/<a\b[^>]*\bhref=["'][^"']*\butm_(?:source|medium|campaign|content)=/i.test(html)) {
      utmOffenders.push(entry.name);
    }
    attributedLinks += (html.match(/<a\b[^>]*\bdata-analytics-source=["'][^"']+["']/gi) || []).length;
  }
  assert.deepEqual(utmOffenders, [], `internal blog links must not expose crawlable UTM variants: ${utmOffenders.slice(0, 20).join(', ')}`);
  assert.ok(attributedLinks > 0, 'internal CTA attribution must be preserved in data-* attributes');

  const articleBuilder = readText('blog/build-articles.js');
  assert.ok(
    articleBuilder.includes('buildInternalAttributionAttributes'),
    'the blog source generator must emit canonical links with data-* attribution'
  );
  assert.ok(
    !articleBuilder.includes('?utm_source=blog'),
    'future blog regeneration must not reintroduce crawlable internal UTM variants'
  );

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
