const { SECURITY_HEADERS } = require('../config/security-headers');

const BASE_URL = process.env.PRODUCTION_SITE_URL || 'https://www.webnovis.com';
const targets = [
  { path: '/', expectedHeaders: SECURITY_HEADERS },
  { path: '/blog/', expectedHeaders: SECURITY_HEADERS },
  { path: '/portfolio.html', expectedHeaders: SECURITY_HEADERS },
  {
    path: '/api/health',
    expectedHeaders: {
      ...SECURITY_HEADERS,
      'X-Robots-Tag': 'noindex, nofollow'
    }
  }
];

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

async function verifyTarget(target) {
  const url = new URL(target.path, BASE_URL).toString();
  const response = await fetch(url, {
    headers: { 'user-agent': 'WebNovisHeaderVerifier/1.0' }
  });

  const mismatches = [];
  for (const [headerName, expectedValue] of Object.entries(target.expectedHeaders)) {
    const actualValue = response.headers.get(headerName);
    if (normalizeHeaderValue(actualValue) !== normalizeHeaderValue(expectedValue)) {
      mismatches.push(buildMismatch(headerName, expectedValue, actualValue));
    }
  }

  return {
    url,
    status: response.status,
    mismatches
  };
}

async function main() {
  const failures = [];
  const warnings = [];

  for (const target of targets) {
    const result = await verifyTarget(target);
    const hardFailures = result.mismatches.filter((mismatch) => mismatch.severity === 'error');
    const softWarnings = result.mismatches.filter((mismatch) => mismatch.severity !== 'error');

    if (result.status >= 400 || hardFailures.length > 0) {
      failures.push(result);
      continue;
    }
    if (softWarnings.length > 0) {
      warnings.push(result);
    }
    console.log(`OK ${result.url}`);
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
      console.error(`FAIL ${failure.url} (status ${failure.status})`);
      for (const mismatch of failure.mismatches.filter((entry) => entry.severity === 'error')) {
        console.error(`  ${mismatch.headerName}`);
        console.error(`    expected: ${mismatch.expectedValue}`);
        console.error(`    actual:   ${mismatch.actualValue}`);
      }
    }
    process.exit(1);
  }

  console.log(`Production header verification passed${warnings.length > 0 ? ' with warnings' : ''}.`);
}

main().catch((error) => {
  console.error('Production header verification failed:', error.message);
  process.exit(1);
});