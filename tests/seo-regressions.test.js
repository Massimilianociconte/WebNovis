const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getBlogFooterHtml } = require(path.join(process.cwd(), 'config', 'site-footer.js'));

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractTitle(html, file) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  assert.ok(match, `${file} must expose a <title> tag`);
  return match[1];
}

function parseJsonLd(html, file) {
  return [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/gi)].map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      assert.fail(`${file} contains invalid JSON-LD: ${error.message}`);
    }
  });
}

function visibleFaqQuestions(html) {
  return [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/gi)].map((match) =>
    match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
}

function schemaFaqQuestions(schemas, file) {
  const faqPage = schemas.find((schema) => schema['@type'] === 'FAQPage');
  assert.ok(faqPage, `${file} must expose FAQPage JSON-LD`);
  return faqPage.mainEntity.map((entity) => entity.name);
}

function main() {
  const sitemap = readText('sitemap.xml');
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/agenzie-web-rho.html'),
    'sitemap.xml must not list the noindex/non-canonical agenzie-web-rho.html URL'
  );

  // Defense-in-depth: no sitemap URL whose published HTML head says noindex
  const noindexInSitemap = [];
  for (const match of sitemap.matchAll(/<loc>https:\/\/www\.webnovis\.com([^<]*)<\/loc>/g)) {
    let file = match[1] === '/' || match[1] === '' ? 'index.html' : match[1].replace(/^\//, '');
    if (file.endsWith('/')) file += 'index.html';
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    const head = fs.readFileSync(path.join(ROOT, file), 'utf8').slice(0, 8000);
    const robots =
      (head.match(/name=["']robots["'][^>]*content=["']([^"']+)/i) ||
        head.match(/content=["']([^"']+)["'][^>]*name=["']robots["']/i) ||
        [])[1] || '';
    if (/noindex/i.test(robots)) noindexInSitemap.push(match[1] || '/');
  }
  assert.equal(
    noindexInSitemap.length,
    0,
    `sitemap must not include noindex URLs: ${noindexInSitemap.slice(0, 10).join(', ')}`
  );

  const agenzie = readText('agenzie-web-rho.html');
  assert.match(
    agenzie,
    /noindex/i,
    'agenzie-web-rho.html must expose noindex while the 301 is not yet live on GitHub Pages'
  );
  assert.ok(
    agenzie.includes('https://www.webnovis.com/agenzia-web-rho.html'),
    'agenzie-web-rho.html must canonical to the correct singular URL'
  );

  const llms = readText('llms.txt');
  assert.ok(
    !llms.includes('agenzia-web-nerviano.html'),
    'llms.txt must not promote noindex local pages (nerviano)'
  );
  assert.ok(
    !llms.includes('48+ URL'),
    'llms.txt must not keep the outdated "48+ URL" sitemap claim'
  );
  assert.ok(
    llms.includes('agenzia-web-rho.html'),
    'llms.txt must keep the primary Rho hub'
  );

  const brokenGeoSamples = [
    ['accessibilita-arese.html', 'accessibilita-rho.html'],
    ['social-media-cornaredo.html', 'social-media-rho.html'],
    ['web-app-arese.html', 'web-app-rho.html']
  ];

  for (const [file, brokenHref] of brokenGeoSamples) {
    assert.ok(!readText(file).includes(brokenHref), `${file} still links to missing page ${brokenHref}`);
  }

  const indexHtml = readText('index.html');
  assert.match(
    indexHtml,
    /<h1 class="hero-title">[\s\S]*WebNovis[\s\S]*agenzia web a Rho e Milano/i,
    'Homepage hero H1 must make the brand and the primary geo intent explicit'
  );
  assert.ok(
    indexHtml.includes('Percorsi principali'),
    'Homepage hero must expose a body-level cluster of primary section links'
  );
  assert.match(
    indexHtml,
    /<input[^>]+name="email"[^>]+aria-label="Iscriviti alla newsletter"[^>]*>/,
    'Homepage newsletter email input must expose an accessible label'
  );
  assert.match(
    indexHtml,
    /<input[^>]+id="chatInput"[^>]+aria-label="Scrivi un messaggio a Weby"[^>]*>/,
    'Homepage chat input must expose an accessible label'
  );
  assert.ok(
    !indexHtml.includes('/agenzia-web-rho.html') &&
      !indexHtml.includes('/agenzia-web-milano.html'),
    'Homepage must not keep direct city footer links after the geo de-amplification pass'
  );
  assert.ok(
    indexHtml.includes('/zone-servite/') &&
      indexHtml.includes('/agenzia-web/') &&
      indexHtml.includes('/realizzazione-siti-web/'),
    'Homepage footer must surface hub links that consolidate local intent'
  );

  const blogFooterHtml = getBlogFooterHtml('..');
  assert.ok(
    blogFooterHtml.includes('/zone-servite/') &&
      blogFooterHtml.includes('/agenzia-web/') &&
      blogFooterHtml.includes('/realizzazione-siti-web/'),
    'Shared footer must keep the local hub links that consolidate geo intent'
  );
  assert.ok(
    !blogFooterHtml.includes('/agenzia-web-rho.html') &&
      !blogFooterHtml.includes('/agenzia-web-milano.html'),
    'Shared footer must not promote direct city landing pages sitewide'
  );

  const caseStudyFiles = [
    'portfolio/case-study/aether-digital.html',
    'portfolio/case-study/arconti31.html',
    'portfolio/case-study/ember-oak.html',
    'portfolio/case-study/fbtotalsecurity.html',
    'portfolio/case-study/lumina-creative.html',
    'portfolio/case-study/mikuna.html',
    'portfolio/case-study/mimmo-fratelli.html',
    'portfolio/case-study/muse-editorial.html',
    'portfolio/case-study/popblock-studio.html',
    'portfolio/case-study/quickseo.html',
    'portfolio/case-study/structure-arch.html'
  ];

  for (const file of caseStudyFiles) {
    const html = readText(file);
    assert.ok(!html.includes('../../blog/index.html"index.html"'), `${file} still contains malformed footer blog link`);
    assert.ok(!html.includes('../../blog/index.html'), `${file} still points to ../../blog/index.html instead of ../../blog/`);
  }

  const brokenBlogLinks = [
    ['blog/contenuti-personal-brand.html', 'href="/personal-branding-online"'],
    ['blog/contenuti-personal-brand.html', 'href="/sito-personale-freelancer"'],
    ['blog/ecommerce-b2b-guida.html', 'href="/ecommerce-che-vende"'],
    ['blog/ecommerce-b2b-guida.html', 'href="/shopify-vs-sito-ecommerce-custom"'],
    ['blog/internal-linking-strategia.html', 'href="seo-tecnica.html"'],
    ['blog/javascript-performance-ottimizzare.html', 'href="/sito-web-mobile-first"'],
    ['blog/javascript-performance-ottimizzare.html', 'href="/velocita-sito-web-guida"'],
    ['blog/social-media-analytics-metriche.html', 'href="analytics-instagram-facebook-linkedin.html"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/chiedere-recensioni-clienti"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/funnel-vendita-online"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/ottimizzazione-tasso-conversione"']
  ];

  for (const [file, brokenHref] of brokenBlogLinks) {
    assert.ok(!readText(file).includes(brokenHref), `${file} still contains broken internal link ${brokenHref}`);
  }

  const serviceCityHtml = readText('automazione-business-milano.html');
  assert.ok(
    !serviceCityHtml.includes('content="Agenzia Web a Rho — WebNovis" name="twitter:title"'),
    'automazione-business-milano.html still inherits the stale Rho twitter:title from the geo base template'
  );
  assert.ok(
    !serviceCityHtml.includes('https://www.webnovis.com/agenzia-web-rho.html#localbusiness-rho'),
    'automazione-business-milano.html still inherits the stale Rho LocalBusiness schema from the geo base template'
  );
  assert.ok(
    !serviceCityHtml.includes('"name": "Agenzia Web a Rho (Milano) — WebNovis"'),
    'automazione-business-milano.html still inherits the stale Rho WebPage schema from the geo base template'
  );

  for (const file of [
    'agenzia-web-rho.html',
    'agenzia-web-arese.html',
    'realizzazione-siti-web-arese.html',
    'ecommerce-milano.html'
  ]) {
    const html = readText(file);
    const schemas = parseJsonLd(html, file);
    assert.deepEqual(
      schemaFaqQuestions(schemas, file),
      visibleFaqQuestions(html),
      `${file} FAQPage questions must exactly match the visible FAQ questions`
    );
    assert.ok(
      !JSON.stringify(schemas).includes('SpeakableSpecification'),
      `${file} must not use commercial-page speakable markup`
    );
    assert.ok(
      !JSON.stringify(schemas).includes('AggregateRating') && !JSON.stringify(schemas).includes('"@type":"Review"'),
      `${file} must not publish self-serving rating or review schema`
    );
  }

  const communityArticle = readText('blog/community-management-guida.html');
  assert.ok(
    !communityArticle.includes('href="community-online.html"') &&
      !communityArticle.includes('href="engagement-community.html"') &&
      !communityArticle.includes('href="gestire-community-social.html"'),
    'community-management-guida.html still contains self-referential broken links'
  );

  const logAnalysis = readText('blog/log-analysis-seo.html');
  assert.ok(
    !logAnalysis.includes('href="server-log-seo.html"') &&
      !logAnalysis.includes('href="log-file-analysis.html"') &&
      !logAnalysis.includes('href="googlebot-log.html"'),
    'log-analysis-seo.html still contains broken log-analysis links'
  );

  const autoWriterLog = JSON.parse(readText('blog/articles-log.json'));
  const socialTrendsEntry = autoWriterLog.find((entry) => entry.slug === 'tendenze-social-media-2026');
  assert.ok(socialTrendsEntry, 'articles-log.json must track tendenze-social-media-2026 as an auto-writer article');

  const socialTrendsHtml = readText('blog/tendenze-social-media-2026.html');
  assert.ok(
    socialTrendsHtml.includes(`<title>${socialTrendsEntry.title} — WebNovis</title>`),
    'tendenze-social-media-2026.html title must stay aligned with articles-log.json'
  );
  assert.ok(
    socialTrendsHtml.includes(`name="description">`) && socialTrendsHtml.includes(socialTrendsEntry.description),
    'tendenze-social-media-2026.html description must stay aligned with articles-log.json'
  );

  const blogIndex = readText('blog/index.html');
  assert.ok(
    blogIndex.includes(`href="tendenze-social-media-2026.html">${socialTrendsEntry.title}</a>`),
    'blog/index.html must expose the current tendenze-social-media-2026 title from articles-log.json'
  );
  assert.ok(
    !blogIndex.includes('Tendenze Social Media 2026: Cosa Aspettarsi e Come Prepararsi'),
    'blog/index.html must not retain stale tendenze-social-media-2026 metadata after rebuilds'
  );

  const ownershipManifest = JSON.parse(readText('blog/articles-manifest.json'));
  assert.equal(
    ownershipManifest.priorityArticles['quanto-costa-un-sito-web']?.owner,
    'built-in-generator',
    'quanto-costa-un-sito-web must have an explicit non-legacy owner in blog/articles-manifest.json'
  );

  const wave2TitleFiles = [
    'blog/quanto-costa-un-sito-web.html',
    'blog/partita-iva-ecommerce.html',
    'blog/tendenze-social-media-2026.html',
    'blog/importanza-sito-web-attivita.html',
    'blog/shopify-vs-sito-ecommerce-custom.html',
    'blog/quanto-costa-una-landing-page.html'
  ];

  for (const file of wave2TitleFiles) {
    const title = extractTitle(readText(file), file);
    assert.ok(title.length <= 65, `${file} title must stay within the 65-character Wave 2 guardrail`);
  }

  console.log('SEO regression checks passed.');
}

try {
  main();
} catch (error) {
  console.error('SEO regression checks failed:', error.message);
  process.exit(1);
}
