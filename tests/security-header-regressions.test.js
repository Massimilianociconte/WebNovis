const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const { buildStaticHeadersFile } = require('../config/security-headers');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function main() {
  const verifyScriptPath = path.join(ROOT, 'scripts', 'verify-prod-headers.js');
  assert.ok(fs.existsSync(verifyScriptPath), 'scripts/verify-prod-headers.js must exist');

  const verifyScript = readText('scripts/verify-prod-headers.js');
  assert.ok(
    verifyScript.includes("require('../config/security-headers')"),
    'verify-prod-headers.js must read expectations from config/security-headers.js'
  );

  const generatedHeaders = buildStaticHeadersFile();
  assert.equal(
    readText('_headers'),
    generatedHeaders,
    '_headers must be byte-for-byte synchronized with the shared policy'
  );
  assert.match(
    generatedHeaders,
    /frame-ancestors 'none'/,
    "CSP must align X-Frame-Options DENY with frame-ancestors 'none'"
  );
  assert.doesNotMatch(
    generatedHeaders,
    /\/(?:css|js|Img|fonts)\/\*[\s\S]{0,100}\bimmutable\b/i,
    'stable asset paths must not use immutable caching'
  );
  assert.doesNotMatch(
    generatedHeaders,
    /^\*\/\s*$/m,
    'Cloudflare _headers blocks do not use a closing */ line'
  );
  for (const line of generatedHeaders.split(/\r?\n/)) {
    if (!line || /^\s/.test(line) || line.startsWith('#')) continue;
    assert.match(
      line,
      /^(?:\/|https:\/\/)/,
      `Cloudflare _headers path rules must start with / or https://: ${line}`
    );
  }
  assert.ok(
    /strict-transport-security/i.test(verifyScript) && /content-security-policy/i.test(verifyScript),
    'verify-prod-headers.js must verify the critical security headers'
  );

  const packageJson = readJson('package.json');
  assert.ok(
    typeof packageJson.scripts['verify:prod-headers'] === 'string',
    'package.json must expose a verify:prod-headers script'
  );
}

try {
  main();
  console.log('Security header regression checks passed.');
} catch (error) {
  console.error('Security header regression checks failed:', error.message);
  process.exit(1);
}
