const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractTitle(html, file) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  assert.ok(match, `${file} must expose a <title> tag`);
  return match[1];
}

function main() {
  const sitemap = readText('sitemap.xml');
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/agenzie-web-rho.html'),
    'sitemap.xml must not list the noindex/non-canonical agenzie-web-rho.html URL'
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
    /<input[^>]+name="email"[^>]+aria-label="Iscriviti alla newsletter"[^>]*>/,
    'Homepage newsletter email input must expose an accessible label'
  );
  assert.match(
    indexHtml,
    /<input[^>]+id="chatInput"[^>]+aria-label="Scrivi un messaggio a Weby"[^>]*>/,
    'Homepage chat input must expose an accessible label'
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
