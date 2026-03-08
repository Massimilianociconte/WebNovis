const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
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

  console.log('SEO regression checks passed.');
}

try {
  main();
} catch (error) {
  console.error('SEO regression checks failed:', error.message);
  process.exit(1);
}
