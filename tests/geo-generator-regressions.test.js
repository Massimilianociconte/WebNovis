const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { removeUnsupportedReviewMarkup } = require('../scripts/seo-aggregate-rating.js');

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
  const agenziaBase = readText('templates/base-pages/agenzia-web-source.html');
  const realizzazioneBase = readText('templates/base-pages/realizzazione-siti-web-source.html');
  const ratingCleanup = readText('scripts/seo-aggregate-rating.js');
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
    generator.includes('resolveRomeCalendarDate') &&
      generator.includes('const { iso: TODAY, formatted: TODAY_FORMATTED } = resolveRomeCalendarDate()') &&
      !generator.includes("new Date().toISOString().split('T')[0]"),
    'Geo generator must derive schema and visible dates from one Europe/Rome calendar value'
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
  assert.ok(
    agenziaTemplate.includes('{% for faq in faqs %}') && !agenziaTemplate.includes('{% for faq in city.faqs %}'),
    'Agenzia visible FAQs must consume the same resolved FAQ array used by JSON-LD'
  );
  assert.ok(
    generator.includes('generateSchemas(city, \'agenzia\', resolvedFaqs)') &&
      generator.includes('generateSchemas(city, \'realizzazione\', resolvedFaqs)'),
    'Agency and realization schema generation must receive the page-resolved FAQ array'
  );
  assert.match(
    generator,
    /function normalizeHandCraftedAgenziaPage\(html,\s*resolvedFaqs\)/,
    'The handcrafted Rho normalizer must receive the one resolved FAQ array explicitly'
  );
  assert.ok(
    generator.includes('const resolvedFaqs = resolveHandCraftedFaqs(rhoSource') &&
      generator.includes('normalizeHandCraftedAgenziaPage(rhoSource, resolvedFaqs)'),
    'Rho generation must resolve visible FAQs once and pass that array to the normalizer'
  );
  assert.ok(
    generator.includes("schema['@type'] === 'FAQPage'") &&
      generator.includes('buildFaqPageSchema(resolvedFaqs)') &&
      generator.includes('rebuildVisibleFaqItems(normalized, resolvedFaqs)'),
    'Rho normalization must rebuild both visible FAQ items and FAQPage JSON-LD from the same array'
  );
  assert.ok(
    generator.includes('services.filter((service) => service.hasPage === true)'),
    'OfferCatalog schema entries must be restricted to services with real dedicated pages'
  );

  for (const [file, source] of [
    ['templates/base-pages/agenzia-web-source.html', agenziaBase],
    ['templates/base-pages/realizzazione-siti-web-source.html', realizzazioneBase]
  ]) {
    assert.ok(!source.includes('AggregateRating'), `${file} must not seed self-serving AggregateRating markup`);
    assert.ok(!source.includes('SpeakableSpecification'), `${file} must not seed commercial-page speakable markup`);
    assert.ok(
      !source.includes('"@type":["LocalBusiness","ProfessionalService"]'),
      `${file} must not seed a page-specific LocalBusiness branch`
    );
  }

  assert.ok(
    agenziaBase.includes('"provider": { "@id": "https://www.webnovis.com/#localbusiness" }'),
    'Agenzia base Service schema must reference the canonical singleton WebNovis entity'
  );

  assert.ok(
    ratingCleanup.includes('delete schema.aggregateRating') && ratingCleanup.includes('delete schema.review'),
    'Legacy aggregate-rating utility must idempotently remove unsupported rating and review properties'
  );
  assert.ok(
    !ratingCleanup.includes('obj.aggregateRating ='),
    'Legacy aggregate-rating utility must never re-inject self-serving AggregateRating markup'
  );

  const ratingFixture = [
    '<script type="application/ld+json">',
    '{"@context":"https://schema.org","@type":"Organization",',
    '"aggregateRating":{"@type":"AggregateRating","ratingValue":"5"},',
    '"review":{"@type":"Review","reviewBody":"Unsupported"}}',
    '</script>',
    '<a class="review-badge" href="https://example.com/reviews">Recensioni visibili</a>'
  ].join('');
  const firstCleanup = removeUnsupportedReviewMarkup(ratingFixture);
  const secondCleanup = removeUnsupportedReviewMarkup(firstCleanup.html);
  assert.equal(firstCleanup.removed, 2, 'Rating cleanup must remove both unsupported schema properties');
  assert.equal(secondCleanup.removed, 0, 'Rating cleanup must be idempotent on already-clean markup');
  assert.equal(secondCleanup.html, firstCleanup.html, 'A second rating cleanup pass must not change HTML');
  assert.ok(
    firstCleanup.html.includes('review-badge') && firstCleanup.html.includes('Recensioni visibili'),
    'Rating cleanup must preserve legitimate visible review content'
  );
}

try {
  main();
  console.log('Geo generator regression checks passed.');
} catch (error) {
  console.error('Geo generator regression checks failed:', error.message);
  process.exit(1);
}
