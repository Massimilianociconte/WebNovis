const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'geo-editorial');
const LOADER_PATH = path.join(ROOT, 'config', 'geo-editorial.js');

const EXPECTED_FILES = [
  'agency.json',
  'ecommerce.json',
  'manifest.json',
  'other-services.json',
  'realizzazione.json',
  'seo-locale.json'
];

const EXPECTED_CLUSTER_COUNTS = new Map([
  ['agency.json', 20],
  ['realizzazione.json', 17],
  ['ecommerce.json', 13],
  ['seo-locale.json', 12],
  ['other-services.json', 18]
]);

const EXPECTED_SOURCE_ARTIFACTS = new Map([
  ['agency.json', {
    file: 'WebNovis-Publishable-Copy-Agency-20-2026-07-23.json',
    sha256: 'a83adf3d849f381aa82fb2ab178471226e5b493b9530dca4f2659ee22aa307fc'
  }],
  ['realizzazione.json', {
    file: 'WebNovis-Publishable-Copy-Realizzazione-17-2026-07-23.json',
    sha256: 'f658bd48c2e4c0408796a60286110c4278b2a6ccafcdb317160c1bf4791e943a'
  }],
  ['ecommerce.json', {
    file: 'WebNovis-Publishable-Copy-Ecommerce-13-2026-07-23.json',
    sha256: 'cb49feb42cad40cf0ae4938b491ffccedd932bedd354850a175ef704fdd70a5a'
  }],
  ['seo-locale.json', {
    file: 'WebNovis-Publishable-Copy-SEO-Locale-12-2026-07-23.json',
    sha256: '7068ec5aae4a6b1e9befe7331490b1ea9a38065a4f738da9a754e92467e3b797'
  }],
  ['other-services.json', {
    file: 'WebNovis-Publishable-Copy-Other-Services-18-2026-07-23.json',
    sha256: 'd0b43890ae18a5aa78976ff0a525034da658e350ca2b8a90ceca3b2c844efe0e'
  }]
]);

const SOURCE_RECORD_KEYS = [
  'answer_capsule',
  'city',
  'cta',
  'description',
  'faqs',
  'h1',
  'intro',
  'path',
  'sections',
  'service',
  'title'
].sort();

const DERIVED_RECORD_KEYS = [
  ...SOURCE_RECORD_KEYS,
  'location_status',
  'record_id',
  'tier'
].sort();

const BANNED_SOURCE_TOKENS = [
  'proof_needed',
  'sources_used',
  'metadata',
  'validation',
  'primary_query',
  'secondary_queries',
  'query_ownership_gate',
  'record_id',
  'location_status',
  '"tier"'
];

const QA_CORRECTIONS = {
  '/ecommerce-bresso.html': {
    title: 'E-commerce a Bresso: verificare domanda e azioni | WebNovis',
    h1: 'E-commerce a Bresso: verificare query, offerta e azioni'
  },
  '/realizzazione-siti-web-magenta.html': {
    description: 'Progetta il sito a Magenta partendo da domande di vendita e assistenza da verificare, con percorsi e responsabilità chiare.',
    h1: 'Realizzazione siti web a Magenta partendo dai task del cliente'
  },
  '/agenzia-web-castellanza.html': {
    h1: 'Agenzia web per Castellanza senza affiliazioni implicite'
  },
  '/realizzazione-siti-web-caronno-pertusella.html': {
    title: 'Siti web a Caronno Pertusella: perimetro | WebNovis'
  },
  '/ecommerce-cinisello-balsamo.html': {
    title: 'E-commerce a Cinisello Balsamo: canali e ruoli | WebNovis'
  },
  '/agenzia-web-monza.html': {
    h1: 'Agenzia web per Monza: collaborazione remota o in presenza'
  },
  '/agenzia-web-milano-ovest.html': {
    title: 'Agenzia web Milano Ovest: domanda e copertura | WebNovis'
  },
  '/social-media-sesto-san-giovanni.html': {
    title: 'Consulenza social media Sesto San Giovanni | WebNovis'
  }
};

const CONDITIONAL_REWRITES = [
  {
    path: '/seo-locale-sesto-san-giovanni.html',
    oldText: 'WebNovis documenta ogni cambiamento con una fonte e una data',
    newText: 'Nel perimetro concordato, WebNovis può documentare ogni cambiamento con una fonte e una data'
  },
  {
    path: '/seo-locale-senago.html',
    oldText: 'WebNovis amplia il progetto solo quando dati e perimetro mostrano un bisogno ulteriore',
    newText: 'La proposta può essere ampliata solo quando dati e perimetro mostrano un bisogno ulteriore'
  },
  {
    path: '/seo-locale-garbagnate.html',
    oldText: 'WebNovis pubblica soltanto informazioni verificabili',
    newText: 'Il perimetro prevede di pubblicare soltanto informazioni verificabili'
  }
];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sortedKeys(value) {
  return Object.keys(value).sort();
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function flattenRecordText(record) {
  return [
    record.title,
    record.description,
    record.h1,
    record.answer_capsule,
    record.intro,
    ...record.sections.flatMap((section) => [section.heading, section.body]),
    ...record.faqs.flatMap((faq) => [faq.question, faq.answer]),
    record.cta
  ].join(' ');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function main() {
  assert.ok(fs.existsSync(LOADER_PATH), 'config/geo-editorial.js must provide the fail-closed editorial loader');
  assert.ok(fs.existsSync(DATA_DIR), 'data/geo-editorial must contain the sanitized versioned corpus');

  const actualFiles = fs.readdirSync(DATA_DIR).filter((entry) => entry.endsWith('.json')).sort();
  assert.deepEqual(actualFiles, EXPECTED_FILES, 'the editorial source directory must contain only five clusters and one manifest');

  const manifest = readJson('data/geo-editorial/manifest.json');
  assert.deepEqual(
    sortedKeys(manifest),
    ['editorialDate', 'editorialVersion', 'files', 'recordIndex', 'schemaVersion', 'totalRecords'].sort(),
    'manifest schema must be closed'
  );
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.editorialVersion, '2026-07-23-v1');
  assert.equal(manifest.editorialDate, '2026-07-23');
  assert.equal(manifest.totalRecords, 80);
  assert.equal(manifest.files.length, 5);
  assert.equal(manifest.recordIndex.length, 80);
  assert.equal(
    sha256(JSON.stringify(manifest.recordIndex)),
    '618649dffd52c5cface11dae1698de117b99b3acc69b0d9e0257ca2f8ef35b72',
    'the versioned path-to-record_id/tier join must remain identical to the approved editorial plan'
  );

  const rawRecords = [];
  for (const fileEntry of manifest.files) {
    assert.deepEqual(
      sortedKeys(fileEntry),
      ['cluster', 'contentSha256', 'file', 'recordCount', 'sourceArtifact', 'sourceSha256'].sort(),
      `${fileEntry.file || 'manifest file entry'} must use the closed file schema`
    );
    assert.equal(fileEntry.recordCount, EXPECTED_CLUSTER_COUNTS.get(fileEntry.file));
    assert.equal(fileEntry.sourceArtifact, EXPECTED_SOURCE_ARTIFACTS.get(fileEntry.file).file);
    assert.equal(fileEntry.sourceSha256, EXPECTED_SOURCE_ARTIFACTS.get(fileEntry.file).sha256);
    assert.match(fileEntry.sourceSha256, /^[a-f0-9]{64}$/);
    assert.match(fileEntry.contentSha256, /^[a-f0-9]{64}$/);

    const raw = fs.readFileSync(path.join(DATA_DIR, fileEntry.file), 'utf8');
    assert.equal(sha256(raw), fileEntry.contentSha256, `${fileEntry.file} must match its versioned content hash`);
    const records = JSON.parse(raw);
    assert.ok(Array.isArray(records), `${fileEntry.file} must be a JSON array`);
    assert.equal(records.length, fileEntry.recordCount);

    for (const record of records) {
      assert.deepEqual(sortedKeys(record), SOURCE_RECORD_KEYS, `${record.path || fileEntry.file} source keys must be allowlisted`);
      assert.deepEqual(sortedKeys(record.sections[0]), ['body', 'heading']);
      assert.deepEqual(sortedKeys(record.faqs[0]), ['answer', 'question']);
    }
    rawRecords.push(...records);

    const lowerRaw = raw.toLowerCase();
    for (const token of BANNED_SOURCE_TOKENS) {
      assert.ok(!lowerRaw.includes(token.toLowerCase()), `${fileEntry.file} must not leak internal field ${token}`);
    }
    assert.ok(!/\/Users\/|[A-Z]:\\|file:\/\//i.test(raw), `${fileEntry.file} must not contain a local absolute path`);
  }

  assert.equal(rawRecords.length, 80);
  assert.equal(new Set(rawRecords.map((record) => record.path)).size, 80);

  const {
    EDITORIAL_VERSION,
    LOCATION_STATUS,
    SOURCE_RECORD_FIELDS,
    getGeoEditorialRecord,
    getGeoEditorialRecords,
    hasGeoEditorialRecord,
    loadGeoEditorialCorpus,
    validateGeoEditorialCorpus
  } = require(LOADER_PATH);
  const governance = require('../config/pseo-governance.js');
  const { findUnsupportedPublishedClaims } = require('../config/content-claim-governance.js');

  assert.equal(EDITORIAL_VERSION, manifest.editorialVersion);
  assert.deepEqual([...SOURCE_RECORD_FIELDS].sort(), SOURCE_RECORD_KEYS);
  assert.deepEqual(
    LOCATION_STATUS,
    {
      AREA_SERVED: 'Area servita; non sede WebNovis',
      HEADQUARTERS: 'Sede WebNovis dichiarata'
    }
  );

  const firstLoad = loadGeoEditorialCorpus({ fresh: true });
  const secondLoad = loadGeoEditorialCorpus({ fresh: true });
  assert.notStrictEqual(firstLoad, secondLoad, 'fresh reads must not reuse the same array instance');
  assert.deepEqual(firstLoad, secondLoad, 'two fresh reads must be value-identical');
  assert.equal(sha256(JSON.stringify(firstLoad)), sha256(JSON.stringify(secondLoad)), 'two reads must have the same corpus hash');
  assert.ok(Object.isFrozen(firstLoad));
  assert.ok(firstLoad.every((record) => Object.isFrozen(record)));

  const governancePaths = governance.getIndexableGeoPaths();
  assert.equal(firstLoad.length, 80);
  assert.deepEqual(
    firstLoad.map((record) => record.path).sort(),
    governancePaths,
    'editorial paths must exactly match the indexable GEO governance'
  );
  assert.deepEqual(
    firstLoad.map((record) => record.record_id),
    Array.from({ length: 80 }, (_, index) => `GEO-${String(index + 1).padStart(3, '0')}`),
    'records must be returned in stable versioned record_id order'
  );
  assert.deepEqual(
    firstLoad.reduce((counts, record) => {
      counts[record.tier] = (counts[record.tier] || 0) + 1;
      return counts;
    }, {}),
    { 'Tier 1': 24, 'Tier 2': 22, 'Data-validated': 34 }
  );
  assert.equal(firstLoad.filter((record) => record.location_status === LOCATION_STATUS.HEADQUARTERS).length, 6);
  assert.ok(
    firstLoad.filter((record) => record.location_status === LOCATION_STATUS.HEADQUARTERS)
      .every((record) => record.city === 'Rho'),
    'only Rho records may derive headquarters status'
  );
  assert.ok(
    firstLoad.filter((record) => record.city !== 'Rho')
      .every((record) => record.location_status === LOCATION_STATUS.AREA_SERVED),
    'every non-Rho record must derive area-served status'
  );

  assert.deepEqual(getGeoEditorialRecords(), firstLoad);
  for (const record of firstLoad) {
    assert.deepEqual(sortedKeys(record), DERIVED_RECORD_KEYS);
    assert.equal(hasGeoEditorialRecord(record.path), true);
    assert.strictEqual(getGeoEditorialRecord(record.path), getGeoEditorialRecord(record.path));
    assert.deepEqual(getGeoEditorialRecord(record.path), record);

    assert.match(record.path, /^\/[a-z0-9-]+\.html$/);
    for (const field of ['city', 'service', 'title', 'description', 'h1', 'answer_capsule', 'intro', 'cta']) {
      assert.equal(typeof record[field], 'string', `${record.path}.${field} must be a string`);
      assert.equal(record[field], record[field].trim(), `${record.path}.${field} must be trimmed`);
      assert.ok(record[field].length > 0, `${record.path}.${field} must not be empty`);
    }
    assert.ok(record.title.length <= 60, `${record.path} title must be <= 60 characters`);
    assert.ok(record.description.length <= 160, `${record.path} description must be <= 160 characters`);
    assert.ok(record.sections.length >= 1 && record.sections.length <= 3, `${record.path} must have 1-3 sections`);
    assert.ok(record.faqs.length >= 2 && record.faqs.length <= 4, `${record.path} must have 2-4 FAQs`);

    const visibleText = flattenRecordText(record);
    assert.ok(!/[<>]/.test(visibleText), `${record.path} must contain plain text only`);
    assert.ok(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(visibleText), `${record.path} must not contain controls`);
    assert.deepEqual(findUnsupportedPublishedClaims(visibleText), [], `${record.path} must pass published-claim governance`);
    assert.ok(!/(?:€\s*\d|\d[\d.,]*\s*€|\bLCP\b|\bINP\b|\bCLS\b|PageSpeed|Lighthouse\s*\d|\b\d(?:[.,]\d)?\s*\/\s*5\b)/i.test(visibleText));

    if (record.city !== 'Rho') {
      assert.match(
        visibleText,
        /area servita|non (?:è |e |una )?sede|sede dichiarata (?:di WebNovis )?(?:è |e )?a Rho/i,
        `${record.path} must visibly qualify the target as an area served or identify Rho as headquarters`
      );
    }
  }
  assert.equal(hasGeoEditorialRecord('/agenzia-web-abbiategrasso.html'), false);
  assert.equal(getGeoEditorialRecord('/agenzia-web-abbiategrasso.html'), null);

  for (const [pathname, expected] of Object.entries(QA_CORRECTIONS)) {
    const record = getGeoEditorialRecord(pathname);
    for (const [field, expectedValue] of Object.entries(expected)) {
      assert.equal(record[field], expectedValue, `${pathname}.${field} must include the exact QA correction`);
    }
  }
  for (const rewrite of CONDITIONAL_REWRITES) {
    const visibleText = flattenRecordText(getGeoEditorialRecord(rewrite.path));
    assert.ok(visibleText.includes(rewrite.newText), `${rewrite.path} must contain the conditional QA wording`);
    assert.ok(!visibleText.includes(rewrite.oldText), `${rewrite.path} must not retain the unconditional commitment`);
  }

  for (const field of ['title', 'description', 'h1', 'answer_capsule']) {
    const values = firstLoad.map((record) => record[field].toLocaleLowerCase('it-IT'));
    assert.equal(new Set(values).size, values.length, `${field} values must be unique`);
  }

  const shuffled = [...rawRecords].reverse();
  const reordered = validateGeoEditorialCorpus(shuffled, { manifest });
  assert.deepEqual(
    reordered,
    firstLoad,
    'record_id, tier and output order must derive from the versioned path join, not input or Set order'
  );

  const unknownKey = clone(rawRecords);
  unknownKey[0].proof_needed = [];
  assert.throws(() => validateGeoEditorialCorpus(unknownKey, { manifest }), /unknown|keys|proof_needed/i);

  const duplicatePath = clone(rawRecords);
  duplicatePath[1].path = duplicatePath[0].path;
  assert.throws(() => validateGeoEditorialCorpus(duplicatePath, { manifest }), /duplicate|path/i);

  const missingRecord = clone(rawRecords).slice(1);
  assert.throws(() => validateGeoEditorialCorpus(missingRecord, { manifest }), /80|missing|governance|path/i);

  const extraRecord = clone(rawRecords);
  extraRecord.push({ ...clone(extraRecord[0]), path: '/agenzia-web-abbiategrasso.html' });
  assert.throws(() => validateGeoEditorialCorpus(extraRecord, { manifest }), /extra|governance|indexable|path/i);

  const wrongCity = clone(rawRecords);
  wrongCity[0].city = 'Milano';
  assert.throws(() => validateGeoEditorialCorpus(wrongCity, { manifest }), /city|Rho/i);

  const leakedMarkup = clone(rawRecords);
  leakedMarkup[0].intro += ' <strong>claim</strong>';
  assert.throws(() => validateGeoEditorialCorpus(leakedMarkup, { manifest }), /markup|plain|</i);

  const changedManifest = clone(manifest);
  changedManifest.recordIndex[0].record_id = 'GEO-999';
  assert.throws(() => validateGeoEditorialCorpus(rawRecords, { manifest: changedManifest }), /record_id|sequence|index/i);

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-geo-editorial-'));
  try {
    fs.cpSync(DATA_DIR, fixtureRoot, { recursive: true });
    fs.appendFileSync(path.join(fixtureRoot, 'agency.json'), ' ', 'utf8');
    assert.throws(
      () => loadGeoEditorialCorpus({ fresh: true, dataDir: fixtureRoot }),
      /hash|sha/i,
      'the loader must fail closed before parsing a source whose bytes differ from the versioned hash'
    );
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }

  console.log(`Geo editorial loader checks passed: ${firstLoad.length} versioned records.`);
}

main();
