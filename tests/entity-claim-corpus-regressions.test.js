const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { cities } = require(path.join(ROOT, 'data', 'cities.json'));
const { services } = require(path.join(ROOT, 'data', 'services.json'));
const {
  findUnsupportedPublishedClaims,
  readApprovedContentBlock
} = require(path.join(ROOT, 'config', 'content-claim-governance.js'));

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
  const publicDirectories = [
    'blog',
    'portfolio',
    'servizi',
    'agenzia-web',
    'realizzazione-siti-web',
    'zone-servite'
  ];
  return [...new Set([
    ...rootFiles,
    ...publicDirectories.flatMap(walkHtml)
  ])].sort();
}

function listGeoOutputs() {
  const agencyCities = cities.filter((city) => city.generate?.agenzia);
  const paths = agencyCities.map((city) => `agenzia-web-${city.slug}.html`);
  paths.push(...cities
    .filter((city) => city.generate?.realizzazione)
    .map((city) => `realizzazione-siti-web-${city.slug}.html`));
  for (const service of services.filter((entry) =>
    entry.skipGeoGeneration !== true && entry.generateGeoPages !== false
  )) {
    paths.push(...agencyCities.map((city) => `${service.slug}-${city.slug}.html`));
  }
  paths.push('agenzia-web/index.html', 'realizzazione-siti-web/index.html', 'zone-servite/index.html');
  return [...new Set(paths)].sort();
}

function stripNonVisibleHtml(html) {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  const syntheticRisky = [
    'Performance Lighthouse 95-100 per ogni progetto.',
    'Risposta garantita entro 2 ore lavorative.',
    'Il fondatore segue ogni progetto personalmente.',
    'Zero vulnerabilità da plugin.',
    'Ogni progetto include 30 giorni di supporto gratuito.',
    'Preventivo gratuito entro 24 ore.',
    'Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.',
    'Landing Page: 5-7 giorni. Sito Vetrina: 2-3 settimane.',
    'Tempi certi per ogni progetto.'
  ].join(' ');
  assert.ok(
    findUnsupportedPublishedClaims(syntheticRisky).length >= 9,
    'the final-HTML denylist must reject each reviewed unsupported commercial claim class'
  );
  assert.equal(
    findUnsupportedPublishedClaims('Prezzi e tempistiche sono indicativi; la proposta conferma perimetro, prezzo e data di consegna.').length,
    0,
    'qualified estimates confirmed in the proposal must remain publishable'
  );

  const geoOutputs = listGeoOutputs();
  assert.equal(geoOutputs.length, 872, 'claim scan must cover all 872 GEO outputs, including noindex pages and hubs');
  const missingGeo = geoOutputs.filter((relativePath) => !fs.existsSync(path.join(ROOT, relativePath)));
  assert.deepEqual(missingGeo, [], 'all expected GEO outputs must exist before corpus claim validation');

  const claimHits = [];
  const wrongGraphicDesignPrices = [];
  for (const relativePath of geoOutputs) {
    const html = read(relativePath);
    for (const finding of findUnsupportedPublishedClaims(html)) {
      claimHits.push({ relativePath, ...finding });
    }
    if (
      /Graphic\s+Design(?:\s+e\s+(?:Branding|Brand\s+Identity))?<\/h3>\s*<p>[\s\S]{0,360}?€\s*400\b/i.test(html)
      || /logo\s+design\s*\(\s*da\s*€\s*400\b/i.test(html)
      || /"name"\s*:\s*"Graphic\s+Design[^\"]*"[\s\S]{0,500}?"price"\s*:\s*"?400"?/i.test(html)
    ) {
      wrongGraphicDesignPrices.push(relativePath);
    }
  }
  assert.deepEqual(claimHits, [], `all GEO output must pass fail-closed claim governance: ${JSON.stringify(claimHits.slice(0, 10))}`);
  assert.deepEqual(
    wrongGraphicDesignPrices,
    [],
    `Graphic Design must use the €250 catalog source, never €400: ${wrongGraphicDesignPrices.slice(0, 10).join(', ')}`
  );

  const graphicDesign = services.find((service) => service.slug === 'graphic-design');
  assert.equal(graphicDesign?.priceFrom, 250, 'Graphic Design canonical catalog price must remain €250');
  const seoLocale = services.find((service) => service.slug === 'seo-locale');
  assert.equal(seoLocale?.priceFrom, 400, 'SEO Locale canonical catalog price must remain €400');
  assert.equal(seoLocale?.priceUnit, '/mese', 'SEO Locale €400/month is legitimate and must not be removed by Graphic Design checks');
  assert.match(
    read('seo-locale-rho.html'),
    /€\s*400\s*\/\s*mese/i,
    'rendered SEO Locale pages must retain the legitimate €400/month offer'
  );

  const generator = read('scripts/generate-all-geo.js');
  assert.ok(
    generator.includes('findUnsupportedPublishedClaims'),
    'the GEO generator must apply the published-claim denylist before writing final HTML'
  );
  assert.match(
    generator,
    /const\s+validation\s*=\s*validatePage\(html,\s*relativePath\)/,
    'hub HTML must pass the same fail-closed validator before being written'
  );
  const geoGeneratorSources = [
    'templates/base-pages/realizzazione-siti-web-source.html',
    'templates/base-pages/agenzia-web-source.html',
    'templates/agenzia-web-content.njk',
    'templates/servizio-citta-content.njk',
    'templates/hub-agenzia-web.njk',
    'templates/hub-realizzazione-siti-web.njk',
    'templates/hub-zone-servite.njk',
    'agenzia-web-rho.html',
    'data/cities.json',
    'config/seo-html-transforms.js',
    'config/priority-snippets.js',
    'scripts/expand-cities.js',
    'scripts/expand-faqs.js',
    'scripts/add-come-lavoriamo-card.js',
    'scripts/legacy/gen-geo-pages.js'
  ];
  for (const sourcePath of geoGeneratorSources) {
    assert.deepEqual(
      findUnsupportedPublishedClaims(read(sourcePath)),
      [],
      `${sourcePath} must be clean so regeneration cannot reintroduce unsupported claims`
    );
  }

  const dormantContentBlocks = fs.readdirSync(path.join(ROOT, 'data', 'content-blocks'))
    .filter((entry) => entry.endsWith('.json'))
    .sort();
  const temporaryBlockDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-claim-blocks-'));
  try {
    for (const entry of dormantContentBlocks) {
      const relativePath = path.join('data', 'content-blocks', entry);
      const block = JSON.parse(read(relativePath));
      const findings = findUnsupportedPublishedClaims(JSON.stringify(block));
      if (findings.length === 0) continue;
      block._meta = {
        publicationStatus: 'approved',
        source: ['https://www.webnovis.com/provenance-test'],
        verifiedAt: '2026-07-23',
        approvedBy: 'regression-test'
      };
      const syntheticApprovedPath = path.join(temporaryBlockDirectory, entry);
      fs.writeFileSync(syntheticApprovedPath, JSON.stringify(block));
      assert.equal(
        readApprovedContentBlock(syntheticApprovedPath),
        null,
        `${relativePath} contains legacy claims and must remain fail-closed even if provenance metadata is later changed`
      );
    }
  } finally {
    fs.rmSync(temporaryBlockDirectory, { recursive: true, force: true });
  }

  const publicHtml = listPublicHtml();
  const editorialClaimAllowlist = new Set([
    'blog/seo-on-page-checklist.html|universal-core-web-vitals-threshold',
    'blog/velocita-sito-web-guida.html|universal-core-web-vitals-threshold'
  ]);
  const unexpectedPublicClaims = [];
  for (const relativePath of publicHtml) {
    for (const finding of findUnsupportedPublishedClaims(read(relativePath))) {
      if (editorialClaimAllowlist.has(`${relativePath}|${finding.id}`)) continue;
      unexpectedPublicClaims.push({ relativePath, ...finding });
    }
  }
  assert.deepEqual(
    unexpectedPublicClaims,
    [],
    `public HTML must not publish unsupported commercial claims: ${JSON.stringify(unexpectedPublicClaims.slice(0, 10))}`
  );

  const sourceHtmlClaimHits = [...walkHtml('src/html')].flatMap((relativePath) =>
    findUnsupportedPublishedClaims(read(relativePath)).map((finding) => ({ relativePath, ...finding }))
  );
  assert.deepEqual(sourceHtmlClaimHits, [], 'source HTML must not regenerate unsupported commercial claims');

  const blogGeneratorCommercialClaims = findUnsupportedPublishedClaims(read('blog/build-articles.js'))
    .filter((finding) => !['fixed-free-support-period', 'universal-core-web-vitals-threshold'].includes(finding.id));
  assert.deepEqual(
    blogGeneratorCommercialClaims,
    [],
    'the blog generator must not regenerate fixed commercial response claims; editorial benchmarks remain allowed'
  );

  const twitterSiteHits = publicHtml.filter((relativePath) =>
    /<meta\b(?=[^>]*(?:name|property)=["']twitter:site["'])[^>]*>/i.test(read(relativePath))
  );
  assert.deepEqual(
    twitterSiteHits,
    [],
    `unverified twitter:site metadata must be absent from every public HTML file: ${twitterSiteHits.slice(0, 10).join(', ')}`
  );
  const sourceTwitterHits = [
    ...walkHtml('src/html'),
    ...walkHtml('templates'),
    'blog/build-articles.js',
    'scripts/seo-bulk-fix.js'
  ].filter((relativePath) =>
    /twitter:site/i.test(read(relativePath))
  );
  assert.deepEqual(sourceTwitterHits, [], 'source and generator files must not regenerate unverified twitter:site metadata');
  assert.match(read('index.html'), /(?:name|property)=["']twitter:card["']/i, 'generic Twitter Card metadata must remain');

  for (const contactPath of ['src/html/contatti.html', 'contatti.html']) {
    const html = read(contactPath);
    const visibleText = stripNonVisibleHtml(html);
    assert.doesNotMatch(visibleText, /(?:Aperto\s+)?24\s+ore\s+su\s+24|7\s+giorni\s+su\s+7|entro\s+24\s+ore/i, `${contactPath} must not publish unverified hours or a response SLA`);
    assert.match(visibleText, /canali indicati/i, `${contactPath} must retain useful neutral contact guidance`);
    assert.doesNotMatch(html, /"openingHours(?:Specification)?"\s*:/i, `${contactPath} JSON-LD must not publish unverified hours`);
  }

  console.log(`Entity/claim corpus checks passed: ${geoOutputs.length} GEO outputs, ${publicHtml.length} public HTML files.`);
}

try {
  main();
} catch (error) {
  console.error('Entity/claim corpus checks failed:', error.message);
  process.exit(1);
}
