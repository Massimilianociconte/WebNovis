const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const sitemap = readText('sitemap.xml');
  assert.ok(sitemap.includes('<urlset'), 'sitemap.xml seems invalid: <urlset> missing');
  assert.ok(!sitemap.includes('<changefreq>'), 'sitemap.xml must not contain <changefreq> entries');
  assert.ok(!sitemap.includes('<priority>'), 'sitemap.xml must not contain <priority> entries');

  const legacyPortfolioUrls = [
    'https://www.webnovis.com/portfolio/Aether-Digital.html',
    'https://www.webnovis.com/portfolio/Ember-Oak.html',
    'https://www.webnovis.com/portfolio/Lumina-Creative.html',
    'https://www.webnovis.com/portfolio/Muse-Editorial.html',
    'https://www.webnovis.com/portfolio/PopBlock-Studio.html',
    'https://www.webnovis.com/portfolio/Structure-Arch.html'
  ];

  for (const legacyUrl of legacyPortfolioUrls) {
    assert.ok(!sitemap.includes(legacyUrl), `sitemap.xml still contains legacy portfolio URL: ${legacyUrl}`);
  }

  const searchIndex = JSON.parse(readText('search-index.json'));
  const portfolioEntries = searchIndex.filter(entry => entry.type === 'portfolio');
  assert.ok(portfolioEntries.length > 0, 'search-index.json has no portfolio entries');

  for (const entry of portfolioEntries) {
    assert.ok(
      String(entry.url || '').startsWith('/portfolio/case-study/'),
      `Non-canonical portfolio URL in search index: ${entry.url}`
    );
  }

  const searchJs = readText(path.join('js', 'search.js'));
  assert.ok(
    searchJs.includes("fetch('/search-index.json')"),
    "js/search.js must fetch '/search-index.json' with absolute path"
  );

  const mojibakeTokens = [
    '\u00e2\u20ac\u201d', // â€”
    '\u00e2\u2020\u2019', // â†’
    '\u00e2\u02dc\u2026' // â˜…
  ];

  const encodingSmokeFiles = [
    'portfolio.html',
    'contatti.html',
    path.join('portfolio', 'Aether-Digital.html'),
    path.join('portfolio', 'Ember-Oak.html'),
    path.join('portfolio', 'Lumina-Creative.html'),
    path.join('portfolio', 'Muse-Editorial.html'),
    path.join('portfolio', 'PopBlock-Studio.html')
  ];

  for (const file of encodingSmokeFiles) {
    const content = readText(file);
    for (const token of mojibakeTokens) {
      assert.ok(!content.includes(token), `Possible mojibake token '${token}' found in ${file}`);
    }
  }

  console.log('SEO smoke checks passed.');
}

try {
  main();
} catch (error) {
  console.error('SEO smoke checks failed:', error.message);
  process.exit(1);
}
