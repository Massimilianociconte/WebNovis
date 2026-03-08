const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { buildStaticHeadersFile } = require(path.join(ROOT, 'config', 'security-headers.js'));

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}


async function assertServerUsesSharedSecurityConfig() {
  const serverSource = readText('server.js');
  assert.ok(
    serverSource.includes("const { SECURITY_HEADERS, getAllowedCorsOrigins } = require('./config/security-headers');"),
    'server.js must import the shared security config'
  );
  assert.ok(
    serverSource.includes('const allowedCorsOrigins = getAllowedCorsOrigins(process.env);'),
    'server.js must derive allowed CORS origins from the shared helper'
  );
  assert.ok(
    serverSource.includes('res.set(SECURITY_HEADERS);'),
    'server.js must apply the shared security headers middleware'
  );
}

async function main() {
  const envExample = readText('.env.example');
  assert.match(
    envExample,
    /^CORS_ORIGINS=/m,
    '.env.example must document CORS_ORIGINS for runtime CORS configuration'
  );

  const generatedHeaders = buildStaticHeadersFile().trim();
  const committedHeaders = readText('_headers').trim();
  assert.equal(committedHeaders, generatedHeaders, '_headers must stay synced with shared security config');

  const legalPages = [
    'privacy-policy.html',
    'cookie-policy.html',
    'termini-condizioni.html'
  ];

  for (const file of legalPages) {
    const html = readText(file);
    assert.ok(
      html.includes('<main class="legal-content" id="main-content">'),
      `${file} must expose #main-content so the skip link has a valid target`
    );
    assert.match(
      html,
      /"@type":"WebPage"/,
      `${file} must include WebPage structured data`
    );
    assert.ok(
      !html.includes('height="auto" src="Img/designrush-badge.png"'),
      `${file} must not use height="auto" on the DesignRush badge`
    );
  }
  await assertServerUsesSharedSecurityConfig();


  console.log('Security/legal regression checks passed.');
}

main().catch(error => {
  console.error('Security/legal regression checks failed:', error.message);
  process.exit(1);
});
