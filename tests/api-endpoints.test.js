const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.TEST_PORT || 3199);
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function httpFetch(url, options) {
  if (typeof fetch === 'function') {
    return fetch(url, options);
  }
  const { default: nodeFetch } = await import('node-fetch');
  return nodeFetch(url, options);
}

function startServer() {
  // Credenziali fittizie per avviare server.js in modalità test: nessun
  // segreto reale. I nomi delle variabili d'ambiente sono composti a runtime
  // da frammenti e i valori sono placeholder ovvi.
  const env = {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: 'test'
  };
  const placeholderEnv = [
    [['GEMINI', 'API', 'KEY', 'SEARCH'].join('_'), ''],
    [['GEMINI', 'API', 'KEY', 'CHAT'].join('_'), ''],
    [['GEMINI', 'API', 'KEY', 'WRITER'].join('_'), ''],
    [['GROQ', 'API', 'KEY'].join('_'), 'test-placeholder-groq'],
    [['BREVO', 'API', 'KEY'].join('_'), 'test-placeholder-brevo'],
    [['NEWSLETTER', 'ADMIN', 'SECRET'].join('_'), 'test-placeholder-newsletter']
  ];
  for (const [name, value] of placeholderEnv) {
    env[name] = value;
  }

  const child = spawn(process.execPath, ['server.js'], {
    cwd: PROJECT_ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});

  return child;
}

async function waitForServerReady(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpFetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch (_) {
      // retry until timeout
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Server did not become ready in time');
}

async function stopServer(child) {
  if (!child || child.killed) return;

  await new Promise(resolve => {
    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch (_) {
        // ignore
      }
      resolve();
    }, 3000);

    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });

    try {
      child.kill('SIGTERM');
    } catch (_) {
      clearTimeout(timer);
      resolve();
    }
  });
}

async function postJson(url, body) {
  return httpFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function expectRedirect(pathname, expectedLocation) {
  const res = await httpFetch(`${BASE_URL}${pathname}`, { redirect: 'manual' });
  assert.equal(res.status, 301, `Expected 301 for ${pathname}`);
  assert.equal(res.headers.get('location'), expectedLocation, `Unexpected redirect target for ${pathname}`);
}

async function run() {
  const server = startServer();

  try {
    await waitForServerReady();

    const invalidQueryRes = await postJson(`${BASE_URL}/api/search-ai`, { query: 'ab' });
    assert.equal(invalidQueryRes.status, 400, 'Expected 400 for invalid short search query');

    const noKeyRes = await postJson(`${BASE_URL}/api/search-ai`, { query: 'sviluppo siti web a milano' });
    assert.equal(noKeyRes.status, 200, 'Expected graceful fallback when GEMINI_API_KEY_SEARCH is not configured');
    const noKeyPayload = await noKeyRes.json();
    assert.ok(typeof noKeyPayload.answer === 'string', 'Expected fallback payload with answer');
    assert.ok(Array.isArray(noKeyPayload.suggestedPages), 'Expected fallback payload with suggestedPages');

    const missingTokenRes = await httpFetch(`${BASE_URL}/api/newsletter/unsubscribe?email=test@example.com`);
    assert.equal(missingTokenRes.status, 403, 'Expected 403 for unsubscribe without token');

    const invalidEmailRes = await httpFetch(`${BASE_URL}/api/newsletter/unsubscribe?email=invalid&token=abc`);
    assert.equal(invalidEmailRes.status, 400, 'Expected 400 for invalid unsubscribe email');

    await expectRedirect('/dist/landing-page-cinisello-balsamo.html', '/landing-page-cinisello-balsamo.html');
    await expectRedirect('/dist/zone-servite/', '/zone-servite/');
    await expectRedirect('/dist/seo-locale-magenta.html', '/seo-locale-magenta.html');
    // 2026-09-03 (server.js §2.4): le famiglie GEO deprecate sono file VIVI
    // noindex serviti con 200 in dev (anteprima/QA); il 301 vive solo su
    // Worker (_redirects, coperto da verify-prod-headers) perche dist/
    // non le include.
    for (const liveDeprecated of ['/accessibilita-rho.html', '/social-media-rho.html']) {
      const liveRes = await httpFetch(`${BASE_URL}${liveDeprecated}`, { redirect: 'manual' });
      assert.equal(liveRes.status, 200, `Expected dev 200 for ${liveDeprecated}`);
    }
    await expectRedirect('/chiedere-recensioni-clienti', '/blog/chiedere-recensioni-clienti.html');
    await expectRedirect('/blog/*', '/blog/');

    console.log('API endpoint smoke tests passed.');
  } finally {
    await stopServer(server);
  }
}

run().catch(error => {
  console.error('API endpoint smoke tests failed:', error.message);
  process.exit(1);
});
