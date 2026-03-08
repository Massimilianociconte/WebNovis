const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

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
