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
    governance.getIndexationDirectivesForPath('/sviluppo-app-mobile-milano-ovest.html'),
    'noindex, follow',
    'sviluppo-app-mobile-milano-ovest.html should be de-amplified via noindex, follow'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/sviluppo-app-mobile-milano-nord.html'),
    'noindex, follow',
    'sviluppo-app-mobile-milano-nord.html should be de-amplified via noindex, follow'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/email-marketing-milano.html'),
    'index, follow',
    'email-marketing-milano.html should be re-opened because May 2026 GSC data shows commercial demand'
  );

  [
    '/realizzazione-siti-web-cormano.html',
    '/realizzazione-siti-web-parabiago.html',
    '/realizzazione-siti-web-senago.html',
    '/realizzazione-siti-web-solaro.html',
    '/social-media-sesto-san-giovanni.html',
    '/ecommerce-bresso.html'
  ].forEach((pathname) => {
    assert.equal(
      governance.getIndexationDirectivesForPath(pathname),
      'index, follow',
      `${pathname} should be indexable because May 2026 GSC data validated demand`
    );
  });

  assert.equal(
    governance.getIndexationDirectivesForPath('/ecommerce-milano.html'),
    'index, follow',
    'ecommerce-milano.html should remain indexable as a strategic ecommerce geo page'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/seo-locale-rho.html'),
    'index, follow',
    'seo-locale-rho.html should be indexable as a strategic local SEO page'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/google-ads-milano-nord.html'),
    'noindex, follow',
    'google-ads-milano-nord.html should be de-amplified via noindex, follow'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/copywriting-arese.html'),
    'noindex, follow',
    'copywriting-arese.html should be de-amplified because extended geo-service pages dilute index quality'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/web-app-corsico.html'),
    'noindex, follow',
    'web-app-corsico.html should be de-amplified because extended geo-service pages dilute index quality'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/seo-locale-rozzano.html'),
    'index, follow',
    'seo-locale-rozzano.html should be indexable because it is in the data-validated opportunity set'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/seo-locale-cormano.html'),
    'index, follow',
    'seo-locale-cormano.html should be indexable because it earned strong local SEO signals'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/realizzazione-siti-web-limbiate.html'),
    'index, follow',
    'realizzazione-siti-web-limbiate.html should be indexable because it earned data-validated demand'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/google-ads-monza.html'),
    'index, follow',
    'google-ads-monza.html should be indexable because it earned data-validated demand'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/automazione-business-monza.html'),
    'noindex, follow',
    'automazione-business-monza.html should be de-amplified because extended geo-service pages dilute index quality'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/agenzia-web-rho.html'),
    'index, follow',
    'agenzia-web-rho.html must remain indexable as a core geo page'
  );

  assert.equal(
    governance.getIndexationDirectivesForPath('/landing-page-bollate.html'),
    'index, follow',
    'landing-page-bollate.html must remain indexable as a core geo page'
  );

  const sitemap = readText('sitemap.xml');
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/dist/'),
    'sitemap.xml must never expose build-artifact URLs under /dist/'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/templates/'),
    'sitemap.xml must not expose source templates under /templates/'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/google-ads-milano.html'),
    'sitemap.xml must exclude phase-1 de-amplified page google-ads-milano.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/sviluppo-app-mobile-milano.html'),
    'sitemap.xml must exclude phase-1 de-amplified page sviluppo-app-mobile-milano.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/sviluppo-app-mobile-milano-ovest.html'),
    'sitemap.xml must exclude de-amplified page sviluppo-app-mobile-milano-ovest.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/sviluppo-app-mobile-milano-nord.html'),
    'sitemap.xml must exclude de-amplified page sviluppo-app-mobile-milano-nord.html'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/email-marketing-milano.html'),
    'sitemap.xml must include email-marketing-milano.html because it is data-validated'
  );
  [
    'realizzazione-siti-web-cormano.html',
    'realizzazione-siti-web-parabiago.html',
    'realizzazione-siti-web-senago.html',
    'realizzazione-siti-web-solaro.html',
    'social-media-sesto-san-giovanni.html',
    'ecommerce-bresso.html'
  ].forEach((slug) => {
    assert.ok(
      sitemap.includes(`https://www.webnovis.com/${slug}`),
      `sitemap.xml must include ${slug} because it is data-validated`
    );
  });
  assert.ok(
    sitemap.includes('https://www.webnovis.com/ecommerce-milano.html'),
    'sitemap.xml must include ecommerce-milano.html because it is now a strategic geo page'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/google-ads-milano-nord.html'),
    'sitemap.xml must exclude de-amplified page google-ads-milano-nord.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/copywriting-arese.html'),
    'sitemap.xml must exclude de-amplified page copywriting-arese.html'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/web-app-corsico.html'),
    'sitemap.xml must exclude de-amplified page web-app-corsico.html'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/seo-locale-rho.html'),
    'sitemap.xml must include seo-locale-rho.html because it is now a strategic geo page'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/seo-locale-rozzano.html'),
    'sitemap.xml must include seo-locale-rozzano.html because it is data-validated'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/seo-locale-cormano.html'),
    'sitemap.xml must include seo-locale-cormano.html because it is data-validated'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/realizzazione-siti-web-limbiate.html'),
    'sitemap.xml must include realizzazione-siti-web-limbiate.html because it is data-validated'
  );
  assert.ok(
    sitemap.includes('https://www.webnovis.com/google-ads-monza.html'),
    'sitemap.xml must include google-ads-monza.html because it is data-validated'
  );
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/automazione-business-monza.html'),
    'sitemap.xml must exclude de-amplified page automazione-business-monza.html'
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
