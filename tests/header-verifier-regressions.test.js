const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { buildTargets, verifyTarget } = require('../scripts/verify-prod-headers');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function makeResponse(status, headers = {}) {
  const normalized = new Map(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
  );
  return {
    status,
    headers: {
      get(name) {
        return normalized.get(String(name).toLowerCase()) || null;
      }
    }
  };
}

async function main() {
  const verifierSource = readText('scripts/verify-prod-headers.js');
  const matrixPath = path.join(ROOT, 'docs', 'deploy-header-matrix.md');

  assert.ok(
    fs.existsSync(matrixPath),
    'docs/deploy-header-matrix.md must document header ownership across app, static host, and edge'
  );
  assert.match(verifierSource, /severity/i, 'verifier must classify mismatches by severity');
  assert.match(verifierSource, /edgeManaged/i, 'verifier must model edge-managed exceptions');
  assert.match(verifierSource, /redirect:\s*'manual'/, 'verifier must inspect redirects without following them');

  const withoutApi = buildTargets({});
  assert.equal(withoutApi.apiTargets.length, 0, 'API checks must be N/A when API_BASE_URL is absent');
  const withApi = buildTargets({ API_BASE_URL: 'https://api.example.test' });
  assert.equal(withApi.apiTargets.length, 1, 'API checks must be opt-in through API_BASE_URL');

  let observedOptions = null;
  const redirectResult = await verifyTarget(
    {
      path: '/agenzie-web-rho.html',
      expectedStatuses: [301],
      expectedLocation: '/agenzia-web-rho.html'
    },
    {
      baseUrl: 'https://www.webnovis.com',
      fetchImpl: async (_url, options) => {
        observedOptions = options;
        return makeResponse(301, { location: '/agenzia-web-rho.html' });
      }
    }
  );
  assert.equal(observedOptions.redirect, 'manual');
  assert.equal(redirectResult.statusMatches, true);
  assert.equal(redirectResult.locationMatches, true);

  const forbiddenSourceResult = await verifyTarget(
    { path: '/package.json', expectedStatuses: [404] },
    {
      baseUrl: 'https://www.webnovis.com',
      fetchImpl: async () => makeResponse(404)
    }
  );
  assert.equal(forbiddenSourceResult.statusMatches, true);

  console.log('Header verifier regression checks passed.');
}

main().catch((error) => {
  console.error('Header verifier regression checks failed:', error.message);
  process.exit(1);
});
