const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function copyFixture(targetRoot) {
  for (const directory of ['config', 'data', 'scripts', 'templates']) {
    fs.cpSync(path.join(ROOT, directory), path.join(targetRoot, directory), {
      recursive: true
    });
  }
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(targetRoot, 'node_modules'), 'dir');
  const searchIndex = path.join(ROOT, 'search-index.json');
  if (fs.existsSync(searchIndex)) {
    fs.copyFileSync(searchIndex, path.join(targetRoot, 'search-index.json'));
  }
}

function runGenerator(fixtureRoot) {
  return spawnSync(
    process.execPath,
    [
      path.join(fixtureRoot, 'scripts', 'generate-all-geo.js'),
      '--validate-only',
      '--type=agenzia',
      '--city=arese',
      '--out-dir=generated'
    ],
    {
      cwd: fixtureRoot,
      encoding: 'utf8',
      timeout: 30_000
    }
  );
}

function combinedOutput(result) {
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function main() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-geo-fail-closed-'));
  try {
    copyFixture(fixtureRoot);

    const baseline = runGenerator(fixtureRoot);
    assert.equal(
      baseline.status,
      0,
      `the isolated current corpus must validate successfully:\n${combinedOutput(baseline)}`
    );
    assert.match(
      combinedOutput(baseline),
      /Expected:\s*1\s*\|\s*Succeeded:\s*1\s*\|\s*Blocked\/failed:\s*0/i,
      'the generator must report the expected, successful and blocked target counts honestly'
    );

    const templatePath = path.join(fixtureRoot, 'templates', 'agenzia-web-content.njk');
    fs.appendFileSync(
      templatePath,
      '\n<p data-test-unsupported-claim>Preventivo gratuito entro 24 ore.</p>\n',
      'utf8'
    );

    const injected = runGenerator(fixtureRoot);
    assert.notEqual(
      injected.status,
      0,
      `an injected critical validation finding must make the real generator exit nonzero:\n${combinedOutput(injected)}`
    );
    assert.match(
      combinedOutput(injected),
      /Expected:\s*1\s*\|\s*Succeeded:\s*0\s*\|\s*Blocked\/failed:\s*1/i,
      'the failed run must expose the actual target counts in its final summary'
    );
    assert.match(
      combinedOutput(injected),
      /agenzia-web-arese\.html[\s\S]*BLOCKED by validation/i,
      'the failed run must identify the exact blocked output'
    );

    console.log('Geo generator fail-closed integration tests passed.');
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

main();
