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
  const env = {
    ...process.env,
    PORT: String(PORT),
    NODE_ENV: 'test',
    GEMINI_API_KEY_SEARCH: '',
    GEMINI_API_KEY_CHAT: '',
    GEMINI_API_KEY_WRITER: '',
    GROQ_API_KEY: 'gsk_your-api-key-here',
    BREVO_API_KEY: 'xkeysib-your-api-key-here',
    NEWSLETTER_ADMIN_SECRET: 'test-secret-1234567890-test-secret-1234567890'
  };

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

async function run() {
  const server = startServer();

  try {
    await waitForServerReady();

    const invalidQueryRes = await postJson(`${BASE_URL}/api/search-ai`, { query: 'ab' });
    assert.equal(invalidQueryRes.status, 400, 'Expected 400 for invalid short search query');

    const noKeyRes = await postJson(`${BASE_URL}/api/search-ai`, { query: 'sviluppo siti web a milano' });
    assert.equal(noKeyRes.status, 503, 'Expected 503 when GEMINI_API_KEY_SEARCH is not configured');

    const missingTokenRes = await httpFetch(`${BASE_URL}/api/newsletter/unsubscribe?email=test@example.com`);
    assert.equal(missingTokenRes.status, 403, 'Expected 403 for unsubscribe without token');

    const invalidEmailRes = await httpFetch(`${BASE_URL}/api/newsletter/unsubscribe?email=invalid&token=abc`);
    assert.equal(invalidEmailRes.status, 400, 'Expected 400 for invalid unsubscribe email');

    console.log('API endpoint smoke tests passed.');
  } finally {
    await stopServer(server);
  }
}

run().catch(error => {
  console.error('API endpoint smoke tests failed:', error.message);
  process.exit(1);
});
