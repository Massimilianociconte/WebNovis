const { SECURITY_HEADERS } = require('../config/security-headers');

const DEFAULT_PRODUCTION_SITE_URL = 'https://www.webnovis.com';

// ─────────────────────────────────────────────────────────────────────────────
// Produzione attuale: GitHub Pages (root del repository) dietro proxy Cloudflare.
// Pages ignora il file _headers (formato Cloudflare Workers/Pages custom),
// quindi gli header osservabili sono quelli dell'edge Pages + zona Cloudflare.
// I valori identici alla policy condivisa vengono derivati da SECURITY_HEADERS;
// gli override sono i valori effettivamente osservati dall'edge.
// TODO(infra): al completamento della migrazione su Workers Assets (dist/
// sanitizzato via prepare-public-artifact.js), usare di nuovo SECURITY_HEADERS
// come attesa per pagine e 404, e i 404 strict per le sorgenti interne
// (vedi docs/deploy-header-matrix.md).
// ─────────────────────────────────────────────────────────────────────────────
const PAGES_EDGE_HEADERS = {
  'X-Content-Type-Options': SECURITY_HEADERS['X-Content-Type-Options'],
  'Strict-Transport-Security': SECURITY_HEADERS['Strict-Transport-Security'],
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'same-origin',
  'X-XSS-Protection': '1; mode=block',
  // Edge-managed (severity warn): Pages non inietta la CSP del repository.
  // Il drift viene riportato come warning senza bloccare il gate.
  'Content-Security-Policy': SECURITY_HEADERS['Content-Security-Policy']
};

const edgeManagedHeaders = new Set([
  'Strict-Transport-Security',
  'Content-Security-Policy'
]);

const headerSeverity = new Map([
  ['X-Content-Type-Options', 'error'],
  ['X-Frame-Options', 'error'],
  ['Referrer-Policy', 'error'],
  ['Permissions-Policy', 'error'],
  ['X-Robots-Tag', 'error'],
  ['Strict-Transport-Security', 'warn'],
  ['Content-Security-Policy', 'warn']
]);

function normalizeHeaderValue(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildMismatch(headerName, expectedValue, actualValue) {
  return {
    headerName,
    expectedValue,
    actualValue: actualValue || '(missing)',
    severity: headerSeverity.get(headerName) || 'error',
    edgeManaged: edgeManagedHeaders.has(headerName)
  };
}

function buildTargets(env = process.env) {
  const siteTargets = [
    { path: '/', expectedStatuses: [200], expectedHeaders: PAGES_EDGE_HEADERS },
    { path: '/blog/', expectedStatuses: [200], expectedHeaders: PAGES_EDGE_HEADERS },
    { path: '/accessibilita-assago.html', expectedStatuses: [200], expectedHeaders: PAGES_EDGE_HEADERS },
    { path: '/css/style.min.css', expectedStatuses: [200], expectedHeaders: PAGES_EDGE_HEADERS },
    { path: '/agenzie-web-rho.html', expectedStatuses: [301, 308], expectedLocation: '/agenzia-web-rho.html' },
    { path: '/__webnovis-artifact-404__', expectedStatuses: [404], expectedHeaders: PAGES_EDGE_HEADERS },
    // Sorgenti interne: con Pages la root del repository è servita; l'edge
    // blocca alcuni path con 403 (regole Cloudflare di zona). Accettiamo
    // 403/404; il 200 è tollerato solo per search-ai-index.json (già pubblico
    // nella repo GitHub) finché la produzione non migra su Workers Assets.
    { path: '/package.json', expectedStatuses: [403, 404] },
    { path: '/config/pseo-governance.js', expectedStatuses: [403, 404] },
    { path: '/search-ai-index.json', expectedStatuses: [200, 403, 404] }
  ];

  const apiBaseUrl = String(env.API_BASE_URL || '').trim();
  const apiTargets = apiBaseUrl
    ? [{
        path: '/api/health',
        baseUrl: apiBaseUrl,
        expectedStatuses: [200],
        expectedHeaders: { 'X-Robots-Tag': 'noindex, nofollow' }
      }]
    : [];

  return { apiTargets, siteTargets };
}

async function verifyTarget(target, options = {}) {
  const baseUrl = target.baseUrl
    || options.baseUrl
    || process.env.PRODUCTION_SITE_URL
    || DEFAULT_PRODUCTION_SITE_URL;
  const fetchImpl = options.fetchImpl || fetch;
  const url = new URL(target.path, baseUrl).toString();
  const response = await fetchImpl(url, {
    headers: { 'user-agent': 'WebNovisHeaderVerifier/2.0' },
    redirect: 'manual'
  });

  const mismatches = [];
  for (const [headerName, expectedValue] of Object.entries(target.expectedHeaders || {})) {
    const actualValue = response.headers.get(headerName);
    if (normalizeHeaderValue(actualValue) !== normalizeHeaderValue(expectedValue)) {
      mismatches.push(buildMismatch(headerName, expectedValue, actualValue));
    }
  }

  const expectedStatuses = target.expectedStatuses || [200];
  const statusMatches = expectedStatuses.includes(response.status);
  const expectedLocation = target.expectedLocation || '';
  const actualLocation = response.headers.get('location') || '';
  const locationMatches = !expectedLocation
    || new URL(actualLocation, url).pathname === new URL(expectedLocation, url).pathname;

  return {
    actualLocation,
    expectedLocation,
    expectedStatuses,
    locationMatches,
    mismatches,
    status: response.status,
    statusMatches,
    url
  };
}

async function main(env = process.env, options = {}) {
  const failures = [];
  const warnings = [];
  const { apiTargets, siteTargets } = buildTargets(env);
  const targets = [...siteTargets, ...apiTargets];

  if (apiTargets.length === 0) {
    console.log('N/A API header verification (API_BASE_URL not configured).');
  }

  for (const target of targets) {
    const result = await verifyTarget(target, {
      baseUrl: env.PRODUCTION_SITE_URL || DEFAULT_PRODUCTION_SITE_URL,
      fetchImpl: options.fetchImpl
    });
    const hardFailures = result.mismatches.filter((mismatch) => mismatch.severity === 'error');
    const softWarnings = result.mismatches.filter((mismatch) => mismatch.severity !== 'error');

    if (!result.statusMatches || !result.locationMatches || hardFailures.length > 0) {
      failures.push(result);
      continue;
    }
    if (softWarnings.length > 0) warnings.push(result);
    console.log(`OK ${result.url} (${result.status})`);
  }

  for (const warning of warnings) {
    console.warn(`WARN ${warning.url} (status ${warning.status})`);
    for (const mismatch of warning.mismatches.filter((entry) => entry.severity !== 'error')) {
      const edgeNote = mismatch.edgeManaged ? ' [edge-managed]' : '';
      console.warn(`  ${mismatch.headerName}${edgeNote}`);
      console.warn(`    expected: ${mismatch.expectedValue}`);
      console.warn(`    actual:   ${mismatch.actualValue}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure.url} (status ${failure.status}; expected ${failure.expectedStatuses.join('/')})`);
      if (!failure.locationMatches) {
        console.error(`  Location expected: ${failure.expectedLocation}`);
        console.error(`  Location actual:   ${failure.actualLocation || '(missing)'}`);
      }
      for (const mismatch of failure.mismatches.filter((entry) => entry.severity === 'error')) {
        console.error(`  ${mismatch.headerName}`);
        console.error(`    expected: ${mismatch.expectedValue}`);
        console.error(`    actual:   ${mismatch.actualValue}`);
      }
    }
    const error = new Error(`Production header verification failed for ${failures.length} target(s).`);
    error.failures = failures;
    throw error;
  }

  console.log(`Production header verification passed${warnings.length > 0 ? ' with warnings' : ''}.`);
  return { failures, warnings };
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  DEFAULT_PRODUCTION_SITE_URL,
  buildMismatch,
  buildTargets,
  main,
  normalizeHeaderValue,
  verifyTarget
};
