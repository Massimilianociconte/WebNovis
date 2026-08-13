const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { ENTITY_FACTS, normalizeEntityObject, normalizeEntityJsonLd } = require(path.join(ROOT, 'config/entity-facts.js'));
const {
  PRESENCE_POLICY,
  containsForbiddenStreet,
  containsForbiddenPersonName,
  formatPublicLocality
} = require(path.join(ROOT, 'config/presence-policy.js'));
const { applySeoHtmlTransforms } = require(path.join(ROOT, 'config/seo-html-transforms.js'));
const { isDeAmplifiedPath, isIndexableGeoPath } = require(path.join(ROOT, 'config/pseo-governance.js'));

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function walkHtml(relativeDirectory) {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  if (!fs.existsSync(absoluteDirectory)) return [];
  const results = [];
  for (const entry of fs.readdirSync(absoluteDirectory, { withFileTypes: true })) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(relativePath));
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(relativePath);
  }
  return results;
}

function listPublicHtml() {
  const rootFiles = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name);
  return [...new Set([
    ...rootFiles,
    ...['blog', 'portfolio', 'servizi', 'agenzia-web', 'realizzazione-siti-web', 'zone-servite']
      .flatMap(walkHtml)
  ])].sort();
}

function extractTitle(html) {
  return (String(html).match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
}

function parseJsonLd(html) {
  const blocks = [];
  for (const match of String(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch (_) {
      // ignore invalid blocks in this scan
    }
  }
  return blocks;
}

function flatten(value, acc = []) {
  if (typeof value === 'string') {
    acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => flatten(item, acc));
    return acc;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => flatten(item, acc));
  }
  return acc;
}

assert.equal(PRESENCE_POLICY.hasWalkInOffice, false);
assert.equal(PRESENCE_POLICY.hasPublicStreetAddress, false);
assert.equal(PRESENCE_POLICY.hasPublicPersonNames, false);
assert.equal(ENTITY_FACTS.address.streetAddress, undefined);
assert.equal(ENTITY_FACTS.personAuthorName, '');
assert.equal(formatPublicLocality(), 'Rho (MI), Italia');

const brokenSameAs = {
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': 'https://www.webnovis.com/#localbusiness',
  name: 'WebNovis',
  sameAs: { '@id': 'https://www.webnovis.com/#organization', name: 'WebNovis' },
  address: { '@type': 'PostalAddress', streetAddress: 'Via S. Giorgio, 2', addressLocality: 'Rho' },
  geo: { '@type': 'GeoCoordinates', latitude: 45.52, longitude: 9.03 }
};
normalizeEntityObject(brokenSameAs);
assert.ok(Array.isArray(brokenSameAs.sameAs));
assert.ok(brokenSameAs.sameAs.every((entry) => /^https?:\/\//.test(entry)));
assert.equal(brokenSameAs.address.streetAddress, undefined);
assert.equal(brokenSameAs.geo, undefined);

const publicHtml = listPublicHtml();
const titleViolations = [];
for (const relativePath of publicHtml) {
  const title = extractTitle(read(relativePath));
  if (containsForbiddenStreet(title)) titleViolations.push(`${relativePath}: ${title}`);
}
assert.deepEqual(titleViolations, [], `titles must not publish a private street: ${titleViolations.slice(0, 8).join(' | ')}`);

const homepage = normalizeEntityJsonLd(applySeoHtmlTransforms(read('index.html'), 'index.html'));
assert.ok(!containsForbiddenStreet(extractTitle(homepage)));
assert.ok(!/Risposta al preventivo/i.test(homepage), 'homepage must not publish a 24h quote SLA');
assert.ok(!/realizzazione-siti-web-(?:pero|lainate|cornaredo|settimo-milanese)\.html/.test(homepage));
assert.match(homepage, /href="(?:\/)?agenzia-web-milano\.html"/);

for (const relativePath of ['index.html', 'chi-siamo.html', 'contatti.html', 'agenzia-web-rho.html']) {
  const html = normalizeEntityJsonLd(applySeoHtmlTransforms(read(relativePath), relativePath));
  assert.ok(
    !containsForbiddenPersonName(html),
    `${relativePath} must not expose unpublished personal names`
  );
}
const homepageSchemas = parseJsonLd(homepage);
const localBusiness = homepageSchemas.find((schema) => {
  const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];
  return types.includes('LocalBusiness') || types.includes('ProfessionalService');
});
assert.ok(localBusiness, 'homepage must keep a LocalBusiness node');
assert.ok(Array.isArray(localBusiness.sameAs), 'LocalBusiness.sameAs must be an array of profile URLs');
assert.ok(localBusiness.sameAs.every((entry) => typeof entry === 'string' && /^https?:\/\//.test(entry)));
assert.ok(!flatten(localBusiness).some((value) => containsForbiddenStreet(value)));

const rho = applySeoHtmlTransforms(read('agenzia-web-rho.html'), 'agenzia-web-rho.html');
assert.ok(!containsForbiddenStreet(extractTitle(rho)));
assert.match(rho, /href="[^"]*preventivo\.html"/);
assert.match(rho, /seo-locale-rho\.html|realizzazione-siti-web-rho\.html|ecommerce-rho\.html/);
assert.doesNotMatch(rho, /presso la nostra sede|showroom|sede aperta al pubblico/i);

const contacts = applySeoHtmlTransforms(read('contatti.html'), 'contatti.html');
assert.ok(!containsForbiddenStreet(contacts));
assert.doesNotMatch(contacts, /maps\/embed|Via\s+S\.?\s*Giorgio/i);
assert.match(contacts, /href="\/agenzia-web-rho\.html"/);

const moneyPage = read('quanto-costa-un-sito-web/index.html');
const blogPricing = applySeoHtmlTransforms(
  read('blog/quanto-costa-un-sito-web.html'),
  'blog/quanto-costa-un-sito-web.html'
);
assert.notEqual(extractTitle(moneyPage), extractTitle(blogPricing));
assert.match(blogPricing, /quanto-costa-un-sito-web\//);

const seoMilano = applySeoHtmlTransforms(read('servizi/seo-milano.html'), 'servizi/seo-milano.html');
assert.match(seoMilano, /seo-locale-milano\.html/);

const sviluppo = applySeoHtmlTransforms(read('servizi/sviluppo-web.html'), 'servizi/sviluppo-web.html');
assert.match(sviluppo, /\/blog\/quanto-costa-un-sito-web\.html/);

const robots = read('robots.txt');
assert.match(robots, /Disallow:\s*\/accessibilita-/);
assert.match(robots, /Disallow:\s*\/sviluppo-app-mobile-/);
assert.match(robots, /User-agent:\s*GPTBot/i);

const redirects = read('_redirects');
assert.match(redirects, /accessibilita-\*|accessibilita-arese\.html/);
assert.equal(isDeAmplifiedPath('/accessibilita-arese.html'), true);
assert.equal(isIndexableGeoPath('/agenzia-web-rho.html'), true);

const llms = read('llms.txt');
assert.match(llms, /Fact sheet|In breve|operiamo da Rho/i);
assert.doesNotMatch(llms, /Via\s+S\.?\s*Giorgio/i);
assert.doesNotMatch(llms, /Ristorante Nikkei/i);
assert.match(llms, /quanto-costa-un-sito-web\//);

console.log(`Presence and ranking regressions passed (${publicHtml.length} public HTML scanned).`);
