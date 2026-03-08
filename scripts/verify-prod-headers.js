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

function normalizeHeaderValue(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
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
      mismatches.push({
        headerName,
        expectedValue,
        actualValue: actualValue || '(missing)'
      });
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

  for (const target of targets) {
    const result = await verifyTarget(target);
    if (result.status >= 400 || result.mismatches.length > 0) {
      failures.push(result);
      continue;
    }
    console.log(`OK ${result.url}`);
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL ${failure.url} (status ${failure.status})`);
      for (const mismatch of failure.mismatches) {
        console.error(`  ${mismatch.headerName}`);
        console.error(`    expected: ${mismatch.expectedValue}`);
        console.error(`    actual:   ${mismatch.actualValue}`);
      }
    }
    process.exit(1);
  }

  console.log('Production header verification passed.');
}

main().catch((error) => {
  console.error('Production header verification failed:', error.message);
  process.exit(1);
});