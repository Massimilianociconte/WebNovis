const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const server = readText('server.js');
  const workerAi = readText('workers/webnovis-ai/src/index.js');
  const workerForms = readText('workers/webnovis-forms/src/index.js');
  const searchJs = readText('js/search.js');
  const mainJs = readText('js/main.js');
  const newsletterEngine = readText('newsletter-engine.js');
  const headers = readText('config/security-headers.js');
  const gitignore = readText('.gitignore');
  const envExample = readText('.env.example');
  const { FORBIDDEN_PUBLIC_BASENAMES } = require('../scripts/public-artifact');

  // 1. Admin + unsubscribe rate limiting (fail-closed, mai solo auth)
  for (const route of ['/api/config', '/api/newsletter/send', '/api/newsletter/preview', '/api/newsletter/subscribers']) {
    assert.ok(
      server.includes(`'${route}', adminLimiter`) || server.includes(`"${route}", adminLimiter`),
      `admin rate limiting must guard ${route}`
    );
  }
  assert.ok(server.includes('/api/newsletter/unsubscribe\', unsubscribeLimiter') || server.includes('/api/newsletter/unsubscribe", unsubscribeLimiter'), 'unsubscribe must be rate limited');

  // 2. Chat-lead worker ha bucket dedicato (non condivide/starva chat)
  assert.ok(workerAi.includes('chatlead:'), 'worker chat-lead must use a dedicated rate-limit bucket');

  // 3. CORS: mai substring-match, mai wildcard su POST
  assert.ok(!workerAi.includes("includes('localhost')"), 'worker AI CORS must use anchored match, never substring');
  assert.ok(!workerForms.includes("'Access-Control-Allow-Origin': '*'"), 'forms worker must not use ACAO *');
  assert.ok(!/Access-Control-Allow-Origin'\]?\s*[:=]\s*['"]\*['"]/.test(workerForms), 'forms worker must never emit wildcard ACAO in any form');
  assert.ok(server.includes('!isProd && /^http:\\/\\/(localhost|127\\.0\\.0\\.1)'), 'server localhost CORS must be dev-only');

  // 4. messageCount mai raw in log/email/KV
  assert.ok(server.includes('Number.isSafeInteger(messageCount)'), 'server chat-lead must coerce messageCount');
  assert.ok(workerAi.includes('Number.isSafeInteger(body.messageCount)'), 'worker chat-lead must coerce messageCount');
  assert.ok(!server.includes('${messageCount ||'), 'server must not interpolate raw messageCount');

  // 5. Session id fail-closed (niente path separator, niente chiavi KV)
  assert.ok(workerAi.includes('/^[A-Za-z0-9_-]+$/'), 'worker getSession must enforce token charset');
  assert.ok(server.includes('/^[A-Za-z0-9_-]+$/.test(sessionId)'), 'server getOrCreateSession must enforce token charset like the worker');

  // 5b. Rate limiting su identificatore CF-first (mai XFF spoofabile)
  assert.ok(server.includes('cf-connecting-ip'), 'server limiters must prefer CF-Connecting-IP');
  const keyFn = (server.match(/function rateLimitKey\(req\) \{[\s\S]*?\n\}/) || [''])[0];
  assert.ok(keyFn && !/x-forwarded-for/i.test(keyFn), 'limiter key must never read XFF');
  for (const name of ['chatLimiter', 'adminLimiter', 'unsubscribeLimiter', 'newsletterLimiter', 'searchAiLimiter', 'leadLimiter']) {
    assert.ok(server.includes(`${name} = rateLimit`), `${name} must exist`);
  }
  assert.equal((server.match(/keyGenerator: limiterKeyGenerator/g) || []).length, 6, 'all six limiters must share the CF-first key');

  // 5c. Unsubscribe: GET conferma senza mutare, POST esegue (scanner-safe + one-click)
  assert.ok(server.includes("app.post('/api/newsletter/unsubscribe'"), 'unsubscribe POST must exist');
  assert.ok(server.includes('Confermi la disiscrizione?'), 'unsubscribe GET must render confirmation, not mutate');
  assert.ok(server.includes("req.body['List-Unsubscribe'] === 'One-Click'"), 'unsubscribe POST must support RFC8058 one-click');
  assert.ok(server.includes('Array.isArray(email) || Array.isArray(token)'), 'unsubscribe must reject array params');

  // 6. 404 generico nel worker (no path echo)
  assert.ok(!workerAi.includes('path: url.pathname'), 'worker 404 must not echo attacker path');

  // 7. chat-config.json mai nel public artifact (+ log/har mai pubblicabili)
  assert.ok(FORBIDDEN_PUBLIC_BASENAMES.has('chat-config.json'), 'chat-config.json must stay forbidden in public artifact');
  assert.ok(newsletterEngine.includes('chatbotInstructions') === false, 'newsletter engine must not touch the private prompt');
  const { isForbiddenPublicPath } = require('../scripts/public-artifact');
  for (const p of ['leads-log.jsonl', 'newsletter-log.jsonl', 'form.har', 'www.webnovis.com.har', '.env', 'server.js', 'chat-config.json']) {
    assert.ok(isForbiddenPublicPath(p), `${p} must be forbidden in public artifact`);
  }

  // 8. Nessun secret reale nei bundle client (solo placeholder nei confronti;
  // site-config.js può nominare WEB3FORMS_ACCESS_KEY nei commenti docs, mai assegnarla)
  for (const file of ['js/main.js', 'js/chat.js', 'js/search.js', 'js/site-config.js', 'js/chat.min.js', 'js/main.min.js', 'js/search.min.js']) {
    const src = readText(file);
    assert.ok(!/xkeysib-[0-9A-Za-z-]+/.test(src), `${file} must not contain Brevo keys`);
    assert.ok(!/gsk_[0-9A-Za-z]+/.test(src), `${file} must not contain Groq keys`);
    assert.ok(!/AIza[0-9A-Za-z_-]{10,}/.test(src), `${file} must not contain Google API keys`);
    assert.ok(!/(TURNSTILE_SECRET|WEB3FORMS_ACCESS_KEY|NEWSLETTER_ADMIN_SECRET)\s*[:=]/.test(src), `${file} must not assign server secrets`);
  }

  // 9. 405/415 hardening presente
  assert.ok(server.includes("status(405).json({ error: 'Metodo non consentito.' })"), 'server must answer 405 on known API paths');
  assert.ok(server.includes("status(415).json("), 'server must answer 415 on non-JSON API posts');
  assert.ok(workerAi.includes("405, { Allow: 'POST, OPTIONS' }"), 'worker AI must answer 405 with Allow');
  assert.ok(workerAi.includes('requireJsonContent'), 'worker AI must enforce JSON content-type');
  assert.ok(workerForms.includes("method_not_allowed' }, 405"), 'forms worker must answer 405');

  // 10. Validazione send/preview (costi LLM + blast)
  assert.ok(server.includes("cleanTopic.length < 8"), 'newsletter send must validate topic length');
  assert.ok(server.includes('/[\\r\\n]/.test(topic)'), 'newsletter send must reject CRLF');

  // 11. Consenso versionato con expiry (mai infinito)
  assert.ok(mainJs.includes('CONSENT_TTL_MS') && mainJs.includes('CONSENT_POLICY_VERSION'), 'consent must carry timestamp + policy version + TTL');
  assert.ok(mainJs.includes('__webnovisRevokeConsent'), 'consent revocation entrypoint must exist');

  // 12. CSP potata: niente host non referenziati, niente wildcard workers
  assert.ok(!/widget\.trustpilot\.com/.test(headers), 'CSP must not allowlist unused trustpilot widget');
  assert.ok(!/news\.google\.com/.test(headers), 'CSP must not allowlist unused news.google.com');
  assert.ok(!/cdn\.jsdelivr\.net/.test(headers), 'CSP must not allowlist removed jsdelivr dep');
  assert.ok(!/\*\.workers\.dev/.test(headers), 'CSP must not use workers.dev wildcard');
  assert.ok(headers.includes('https://webnovis-forms.nexify-api.workers.dev'), 'CSP must list the forms worker explicitly');

  // 13. Secret separation newsletter
  assert.ok(envExample.includes('UNSUBSCRIBE_HMAC_SECRET='), '.env.example must document the dedicated HMAC secret');
  assert.ok(newsletterEngine.includes('verifyUnsubscribeToken'), 'newsletter engine must centralize HMAC verify');
  assert.ok(server.includes('verifyUnsubscribeToken'), 'server unsubscribe must use centralized verify, no inline HMAC');
  assert.ok(!/createHmac\('sha256', adminSecret\)/.test(server), 'server must not HMAC with the admin secret');

  // 14. Igiene secret: .env ignorato, placeholder allowlistati altrove
  assert.ok(/^\.env$/m.test(gitignore), '.gitignore must ignore .env');

  // 15. Search XSS: escAttr + allowlist su tutti gli href generati
  assert.ok(searchJs.includes('function escAttr('), 'search must provide attribute-context escaper');
  assert.ok(searchJs.includes('function safeAiPath('), 'search must allowlist AI link paths');
  assert.ok(!searchJs.includes("escHTML(item.url)") && !searchJs.includes("escHTML(p.url)"), 'search hrefs must not use text-context escaper');
  assert.ok(!searchJs.includes('FUSE_CDN'), 'search must not load remote CDN bundles');

  // 16. Forms worker: niente override destinatario né relay file
  for (const field of ["formData.delete('to')", "formData.delete('cc')", "formData.delete('bcc')", "formData.delete('from')", 'instanceof File']) {
    assert.ok(workerForms.includes(field), `forms worker must strip ${field}`);
  }

  // 17. Stdout senza PII grezza (metriche, non content)
  assert.ok(server.includes('function maskEmail('), 'server must provide email masking for logs');
  assert.ok(!server.includes('console.log(`✅ Newsletter: ${email}'), 'stdout must not log raw newsletter email');
  assert.ok(!server.includes('": "${cleanMessage}"'), 'stdout must not log raw chat content');
}

try {
  main();
  console.log('Security governance regression checks passed.');
} catch (error) {
  console.error('Security governance regression failures:');
  console.error(error.message);
  process.exit(1);
}
