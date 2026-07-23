const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const citiesData = require('../data/cities.json');
const {
  DATA_VALIDATED_INDEXABLE_GEO_PATHS,
  TIER1_INDEXABLE_GEO_PATHS,
  TIER2_INDEXABLE_GEO_PATHS,
  getIndexableGeoPaths,
  normalizePathname
} = require('./pseo-governance');
const { findUnsupportedPublishedClaims } = require('./content-claim-governance');

const DATA_DIR = path.join(__dirname, '..', 'data', 'geo-editorial');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');
const EDITORIAL_VERSION = '2026-07-23-v1';
const SOURCE_RECORD_FIELDS = Object.freeze([
  'path',
  'city',
  'service',
  'title',
  'description',
  'h1',
  'answer_capsule',
  'intro',
  'sections',
  'faqs',
  'cta'
]);
const SOURCE_RECORD_FIELD_SET = new Set(SOURCE_RECORD_FIELDS);
const LOCATION_STATUS = Object.freeze({
  AREA_SERVED: 'Area servita; non sede WebNovis',
  HEADQUARTERS: 'Sede WebNovis dichiarata'
});

const MANIFEST_FIELDS = Object.freeze([
  'schemaVersion',
  'editorialVersion',
  'editorialDate',
  'totalRecords',
  'files',
  'recordIndex'
]);
const MANIFEST_FILE_FIELDS = Object.freeze([
  'cluster',
  'file',
  'recordCount',
  'sourceArtifact',
  'sourceSha256',
  'contentSha256'
]);
const RECORD_INDEX_FIELDS = Object.freeze(['record_id', 'path', 'tier']);
const SECTION_FIELDS = Object.freeze(['heading', 'body']);
const FAQ_FIELDS = Object.freeze(['question', 'answer']);
const EXPECTED_FILES = new Map([
  ['agency', { file: 'agency.json', recordCount: 20 }],
  ['realizzazione', { file: 'realizzazione.json', recordCount: 17 }],
  ['ecommerce', { file: 'ecommerce.json', recordCount: 13 }],
  ['seo-locale', { file: 'seo-locale.json', recordCount: 12 }],
  ['other-services', { file: 'other-services.json', recordCount: 18 }]
]);
const SERVICE_LABELS = new Map([
  ['agenzia-web', 'Agenzia web'],
  ['realizzazione-siti-web', 'Realizzazione siti web'],
  ['ecommerce', 'E-commerce'],
  ['seo-locale', 'SEO locale'],
  ['sito-vetrina', 'Sito vetrina'],
  ['landing-page', 'Landing page'],
  ['social-media', 'Social media'],
  ['email-marketing', 'Email marketing'],
  ['google-ads', 'Google Ads'],
  ['graphic-design', 'Graphic design']
]);
const SORTED_CITIES = Object.freeze(
  [...(citiesData.cities || [])]
    .filter((city) => city && city.slug && city.name)
    .sort((left, right) => right.slug.length - left.slug.length || left.slug.localeCompare(right.slug))
);
const EXPECTED_GOVERNANCE_PATHS = Object.freeze(getIndexableGeoPaths());
const EXPECTED_GOVERNANCE_PATH_SET = new Set(EXPECTED_GOVERNANCE_PATHS);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const RECORD_ID_PATTERN = /^GEO-(\d{3})$/;
const PATH_PATTERN = /^\/[a-z0-9-]+\.html$/;
const LOCAL_PATH_PATTERN = /(?:\/Users\/|file:\/\/|[A-Z]:\\)/i;
const MARKUP_PATTERN = /[<>]/;
const CONTROL_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const UNSUPPORTED_EDITORIAL_PATTERN = /(?:€\s*\d|\d[\d.,]*\s*€|\bLCP\b|\bINP\b|\bCLS\b|PageSpeed|Lighthouse\s*\d|\b\d(?:[.,]\d)?\s*\/\s*5\b)/i;

let cachedCorpus = null;
let cachedRecordMap = null;
let cachedManifest = null;

function fail(message) {
  throw new Error(`Invalid GEO editorial corpus: ${message}`);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be an object`);
}

function assertExactKeys(value, expectedKeys, label) {
  assertPlainObject(value, label);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    const unknown = actual.filter((key) => !expected.includes(key));
    const missing = expected.filter((key) => !actual.includes(key));
    fail(`${label} keys mismatch; unknown=[${unknown.join(', ')}], missing=[${missing.join(', ')}]`);
  }
}

function assertInteger(value, expected, label) {
  if (!Number.isInteger(value) || (expected != null && value !== expected)) {
    fail(`${label} must be integer ${expected == null ? '' : expected}`.trim());
  }
}

function assertString(value, label, { min = 1, max = Number.POSITIVE_INFINITY } = {}) {
  if (typeof value !== 'string') fail(`${label} must be a string`);
  if (value !== value.trim()) fail(`${label} must be trimmed`);
  if (value.length < min || value.length > max) {
    fail(`${label} length must be between ${min} and ${max}; got ${value.length}`);
  }
  if (MARKUP_PATTERN.test(value)) fail(`${label} must be plain text without markup`);
  if (CONTROL_PATTERN.test(value)) fail(`${label} must not contain control characters`);
  if (LOCAL_PATH_PATTERN.test(value)) fail(`${label} must not contain a local absolute path`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function readJson(filePath, label) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    fail(`${label} cannot be read: ${error.message}`);
  }

  try {
    return { raw, value: JSON.parse(raw) };
  } catch (error) {
    fail(`${label} is not valid JSON: ${error.message}`);
  }
}

function deriveTier(pathname) {
  if (TIER1_INDEXABLE_GEO_PATHS.has(pathname)) return 'Tier 1';
  if (TIER2_INDEXABLE_GEO_PATHS.has(pathname)) return 'Tier 2';
  if (DATA_VALIDATED_INDEXABLE_GEO_PATHS.has(pathname)) return 'Data-validated';
  fail(`${pathname} is not present in an indexable governance tier`);
}

function derivePathDescriptor(pathname) {
  if (typeof pathname !== 'string' || !PATH_PATTERN.test(pathname)) {
    fail(`${String(pathname)} is not a root-level GEO .html path`);
  }
  if (normalizePathname(pathname) !== pathname) fail(`${pathname} is not canonical`);

  const city = SORTED_CITIES.find((candidate) => pathname.endsWith(`-${candidate.slug}.html`));
  if (!city) fail(`${pathname} does not resolve to a known city`);

  const suffix = `-${city.slug}.html`;
  const serviceSlug = pathname.slice(1, -suffix.length);
  const service = SERVICE_LABELS.get(serviceSlug);
  if (!service) fail(`${pathname} resolves to unsupported service cluster ${serviceSlug}`);

  return {
    city,
    service,
    serviceSlug,
    tier: deriveTier(pathname),
    location_status: city.isSede === true
      ? LOCATION_STATUS.HEADQUARTERS
      : LOCATION_STATUS.AREA_SERVED
  };
}

function validateManifest(manifest) {
  assertExactKeys(manifest, MANIFEST_FIELDS, 'manifest');
  const headquarters = SORTED_CITIES.filter((city) => city.isSede === true);
  if (headquarters.length !== 1 || headquarters[0].slug !== 'rho') {
    fail('cities governance must identify Rho as the only headquarters');
  }
  assertInteger(manifest.schemaVersion, 1, 'manifest.schemaVersion');
  if (manifest.editorialVersion !== EDITORIAL_VERSION) {
    fail(`manifest.editorialVersion must be ${EDITORIAL_VERSION}`);
  }
  if (!ISO_DATE_PATTERN.test(String(manifest.editorialDate || ''))) {
    fail('manifest.editorialDate must be an ISO calendar date');
  }
  assertInteger(manifest.totalRecords, 80, 'manifest.totalRecords');
  if (!Array.isArray(manifest.files) || manifest.files.length !== EXPECTED_FILES.size) {
    fail(`manifest.files must contain exactly ${EXPECTED_FILES.size} entries`);
  }
  if (!Array.isArray(manifest.recordIndex) || manifest.recordIndex.length !== manifest.totalRecords) {
    fail('manifest.recordIndex must contain exactly 80 entries');
  }

  const seenClusters = new Set();
  const seenFiles = new Set();
  let declaredRecordCount = 0;
  for (const [index, fileEntry] of manifest.files.entries()) {
    assertExactKeys(fileEntry, MANIFEST_FILE_FIELDS, `manifest.files[${index}]`);
    assertString(fileEntry.cluster, `manifest.files[${index}].cluster`, { max: 40 });
    assertString(fileEntry.file, `manifest.files[${index}].file`, { max: 80 });
    assertString(fileEntry.sourceArtifact, `manifest.files[${index}].sourceArtifact`, { max: 160 });
    if (path.basename(fileEntry.file) !== fileEntry.file || !/^[a-z-]+\.json$/.test(fileEntry.file)) {
      fail(`manifest.files[${index}].file must be a safe basename`);
    }
    if (path.basename(fileEntry.sourceArtifact) !== fileEntry.sourceArtifact) {
      fail(`manifest.files[${index}].sourceArtifact must not contain a path`);
    }
    if (!SHA256_PATTERN.test(String(fileEntry.sourceSha256 || ''))) {
      fail(`manifest.files[${index}].sourceSha256 must be SHA-256`);
    }
    if (!SHA256_PATTERN.test(String(fileEntry.contentSha256 || ''))) {
      fail(`manifest.files[${index}].contentSha256 must be SHA-256`);
    }

    const expected = EXPECTED_FILES.get(fileEntry.cluster);
    if (!expected) fail(`manifest contains unknown cluster ${fileEntry.cluster}`);
    if (fileEntry.file !== expected.file || fileEntry.recordCount !== expected.recordCount) {
      fail(`manifest cluster ${fileEntry.cluster} must declare ${expected.file}/${expected.recordCount}`);
    }
    if (seenClusters.has(fileEntry.cluster)) fail(`duplicate manifest cluster ${fileEntry.cluster}`);
    if (seenFiles.has(fileEntry.file)) fail(`duplicate manifest file ${fileEntry.file}`);
    seenClusters.add(fileEntry.cluster);
    seenFiles.add(fileEntry.file);
    assertInteger(fileEntry.recordCount, expected.recordCount, `${fileEntry.cluster}.recordCount`);
    declaredRecordCount += fileEntry.recordCount;
  }
  if (declaredRecordCount !== manifest.totalRecords) {
    fail(`manifest file counts total ${declaredRecordCount}, expected ${manifest.totalRecords}`);
  }
  if (seenClusters.size !== EXPECTED_FILES.size) fail('manifest is missing an expected cluster');

  const indexByPath = new Map();
  const seenRecordIds = new Set();
  for (const [index, entry] of manifest.recordIndex.entries()) {
    assertExactKeys(entry, RECORD_INDEX_FIELDS, `manifest.recordIndex[${index}]`);
    assertString(entry.record_id, `manifest.recordIndex[${index}].record_id`, { min: 7, max: 7 });
    assertString(entry.path, `manifest.recordIndex[${index}].path`, { max: 180 });
    assertString(entry.tier, `manifest.recordIndex[${index}].tier`, { max: 20 });
    if (!RECORD_ID_PATTERN.test(entry.record_id)) fail(`${entry.record_id} is not a valid record_id`);
    if (seenRecordIds.has(entry.record_id)) fail(`duplicate record_id ${entry.record_id}`);
    if (indexByPath.has(entry.path)) fail(`duplicate record index path ${entry.path}`);
    if (!EXPECTED_GOVERNANCE_PATH_SET.has(entry.path)) {
      fail(`record index path ${entry.path} is not indexable in governance`);
    }
    const governanceTier = deriveTier(entry.path);
    if (entry.tier !== governanceTier) {
      fail(`${entry.path} tier mismatch: manifest=${entry.tier}, governance=${governanceTier}`);
    }
    seenRecordIds.add(entry.record_id);
    indexByPath.set(entry.path, entry);
  }

  const expectedIds = Array.from(
    { length: manifest.totalRecords },
    (_, index) => `GEO-${String(index + 1).padStart(3, '0')}`
  );
  const actualIds = [...seenRecordIds].sort();
  if (actualIds.some((recordId, index) => recordId !== expectedIds[index])) {
    fail('manifest record_id sequence must contain GEO-001 through GEO-080 exactly once');
  }
  const indexedPaths = [...indexByPath.keys()].sort();
  if (
    indexedPaths.length !== EXPECTED_GOVERNANCE_PATHS.length
    || indexedPaths.some((pathname, index) => pathname !== EXPECTED_GOVERNANCE_PATHS[index])
  ) {
    fail('manifest record index path set must exactly match GEO governance');
  }

  return { indexByPath };
}

function validateSection(section, label) {
  assertExactKeys(section, SECTION_FIELDS, label);
  assertString(section.heading, `${label}.heading`, { min: 8, max: 140 });
  assertString(section.body, `${label}.body`, { min: 120, max: 4000 });
}

function validateFaq(faq, label) {
  assertExactKeys(faq, FAQ_FIELDS, label);
  assertString(faq.question, `${label}.question`, { min: 8, max: 240 });
  assertString(faq.answer, `${label}.answer`, { min: 30, max: 1600 });
}

function collectVisibleText(record) {
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

function validateRecord(record, label) {
  assertExactKeys(record, SOURCE_RECORD_FIELD_SET, label);
  assertString(record.path, `${label}.path`, { min: 7, max: 180 });
  assertString(record.city, `${label}.city`, { min: 2, max: 80 });
  assertString(record.service, `${label}.service`, { min: 2, max: 80 });
  assertString(record.title, `${label}.title`, { min: 20, max: 60 });
  assertString(record.description, `${label}.description`, { min: 100, max: 160 });
  assertString(record.h1, `${label}.h1`, { min: 20, max: 120 });
  assertString(record.answer_capsule, `${label}.answer_capsule`, { min: 140, max: 800 });
  assertString(record.intro, `${label}.intro`, { min: 300, max: 1600 });
  assertString(record.cta, `${label}.cta`, { min: 20, max: 600 });

  if (!Array.isArray(record.sections) || record.sections.length < 1 || record.sections.length > 3) {
    fail(`${label}.sections must contain between 1 and 3 sections`);
  }
  record.sections.forEach((section, index) => validateSection(section, `${label}.sections[${index}]`));
  if (!Array.isArray(record.faqs) || record.faqs.length < 2 || record.faqs.length > 4) {
    fail(`${label}.faqs must contain between 2 and 4 FAQs`);
  }
  record.faqs.forEach((faq, index) => validateFaq(faq, `${label}.faqs[${index}]`));

  const descriptor = derivePathDescriptor(record.path);
  if (!EXPECTED_GOVERNANCE_PATH_SET.has(record.path)) {
    fail(`${record.path} is extra or not indexable in GEO governance`);
  }
  if (record.city !== descriptor.city.name) {
    fail(`${record.path} city mismatch: record=${record.city}, path=${descriptor.city.name}`);
  }
  if (record.service !== descriptor.service) {
    fail(`${record.path} service mismatch: record=${record.service}, path=${descriptor.service}`);
  }

  const visibleText = collectVisibleText(record);
  const claimFindings = findUnsupportedPublishedClaims(visibleText);
  if (claimFindings.length > 0) {
    fail(`${record.path} contains unsupported published claim ${claimFindings[0].id}`);
  }
  if (UNSUPPORTED_EDITORIAL_PATTERN.test(visibleText)) {
    fail(`${record.path} contains an unsupported price, rating or numeric performance claim`);
  }

  if (descriptor.city.isSede === true) {
    if (descriptor.city.name !== 'Rho') fail(`${record.path} attempts to derive a non-Rho headquarters`);
    if (!/\bsede\b[^.!?]{0,100}\bRho\b|\bRho\b[^.!?]{0,100}\bsede\b/i.test(visibleText)) {
      fail(`${record.path} must visibly qualify Rho as the declared headquarters`);
    }
  } else if (
    !/area servita|non (?:è |e |una )?sede|sede dichiarata (?:di WebNovis )?(?:è |e )?a Rho/i.test(visibleText)
  ) {
    fail(`${record.path} must visibly qualify ${record.city} as area served or identify Rho as headquarters`);
  }

  return descriptor;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function validateGeoEditorialCorpus(records, { manifest } = {}) {
  if (!Array.isArray(records)) fail('records must be an array');
  const effectiveManifest = manifest || readJson(MANIFEST_PATH, 'manifest').value;
  const { indexByPath } = validateManifest(effectiveManifest);
  if (records.length !== effectiveManifest.totalRecords) {
    fail(`records/path count must be ${effectiveManifest.totalRecords}; got ${records.length}`);
  }

  const seenPaths = new Set();
  const uniqueFields = new Map(
    ['title', 'description', 'h1', 'answer_capsule'].map((field) => [field, new Set()])
  );
  const enriched = [];

  for (const [index, sourceRecord] of records.entries()) {
    const label = `records[${index}]`;
    const descriptor = validateRecord(sourceRecord, label);
    if (seenPaths.has(sourceRecord.path)) fail(`duplicate path ${sourceRecord.path}`);
    seenPaths.add(sourceRecord.path);

    const indexEntry = indexByPath.get(sourceRecord.path);
    if (!indexEntry) fail(`${sourceRecord.path} is missing from manifest record index`);
    if (indexEntry.tier !== descriptor.tier) {
      fail(`${sourceRecord.path} tier does not agree with governance`);
    }

    for (const [field, seenValues] of uniqueFields) {
      const normalized = sourceRecord[field].toLocaleLowerCase('it-IT');
      if (seenValues.has(normalized)) fail(`duplicate ${field} value at ${sourceRecord.path}`);
      seenValues.add(normalized);
    }

    enriched.push({
      ...sourceRecord,
      record_id: indexEntry.record_id,
      tier: descriptor.tier,
      location_status: descriptor.location_status
    });
  }

  const actualPaths = [...seenPaths].sort();
  if (
    actualPaths.length !== EXPECTED_GOVERNANCE_PATHS.length
    || actualPaths.some((pathname, index) => pathname !== EXPECTED_GOVERNANCE_PATHS[index])
  ) {
    const missing = EXPECTED_GOVERNANCE_PATHS.filter((pathname) => !seenPaths.has(pathname));
    const extra = actualPaths.filter((pathname) => !EXPECTED_GOVERNANCE_PATH_SET.has(pathname));
    fail(`path set diverges from governance; missing=[${missing.join(', ')}], extra=[${extra.join(', ')}]`);
  }

  enriched.sort((left, right) => left.record_id.localeCompare(right.record_id));
  return deepFreeze(enriched);
}

function loadGeoEditorialCorpus({ fresh = false, dataDir = DATA_DIR } = {}) {
  if (typeof dataDir !== 'string' || !dataDir.trim()) fail('dataDir must be a non-empty path');
  const resolvedDataDir = path.resolve(dataDir);
  const usesDefaultDataDir = resolvedDataDir === DATA_DIR;
  if (!fresh && usesDefaultDataDir && cachedCorpus) return cachedCorpus;

  const manifestResult = readJson(path.join(resolvedDataDir, 'manifest.json'), 'manifest');
  const manifest = manifestResult.value;
  validateManifest(manifest);
  const records = [];

  for (const fileEntry of manifest.files) {
    const filePath = path.join(resolvedDataDir, fileEntry.file);
    const result = readJson(filePath, fileEntry.file);
    if (sha256(result.raw) !== fileEntry.contentSha256) {
      fail(`${fileEntry.file} content hash does not match manifest`);
    }
    if (!Array.isArray(result.value) || result.value.length !== fileEntry.recordCount) {
      fail(`${fileEntry.file} must contain exactly ${fileEntry.recordCount} records`);
    }
    records.push(...result.value);
  }

  const corpus = validateGeoEditorialCorpus(records, { manifest });
  if (!fresh && usesDefaultDataDir) {
    cachedCorpus = corpus;
    cachedRecordMap = new Map(corpus.map((record) => [record.path, record]));
    cachedManifest = deepFreeze(manifest);
  }
  return corpus;
}

function ensureCache() {
  if (!cachedCorpus) loadGeoEditorialCorpus();
}

function getGeoEditorialRecords() {
  ensureCache();
  return cachedCorpus;
}

function getGeoEditorialRecord(pathname) {
  ensureCache();
  return cachedRecordMap.get(normalizePathname(pathname)) || null;
}

function hasGeoEditorialRecord(pathname) {
  return getGeoEditorialRecord(pathname) !== null;
}

function getGeoEditorialManifest() {
  ensureCache();
  return cachedManifest;
}

module.exports = {
  EDITORIAL_VERSION,
  LOCATION_STATUS,
  SOURCE_RECORD_FIELDS,
  getGeoEditorialManifest,
  getGeoEditorialRecord,
  getGeoEditorialRecords,
  hasGeoEditorialRecord,
  loadGeoEditorialCorpus,
  validateGeoEditorialCorpus
};
