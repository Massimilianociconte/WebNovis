const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { TIER1_INDEXABLE_GEO_PATHS } = require('../config/pseo-governance.js');
const { findUnsupportedPublishedClaims } = require('../config/content-claim-governance.js');

const CORE_PAGES = [
  'index.html',
  'chi-siamo.html',
  'come-lavoriamo.html',
  'portfolio.html',
  'preventivo.html',
  'contatti.html'
];

function expectedPagePaths(root = ROOT) {
  const servicePages = fs.readdirSync(path.join(root, 'servizi'))
    .filter((entry) => entry.endsWith('.html'))
    .sort()
    .map((entry) => path.posix.join('servizi', entry));
  const tier1Pages = [...TIER1_INDEXABLE_GEO_PATHS]
    .map((entry) => entry.replace(/^\//, ''))
    .sort();
  return [...CORE_PAGES, ...servicePages, ...tier1Pages];
}

function copyFixture(fixtureRoot, pagePaths) {
  for (const directory of ['config', 'data']) {
    fs.cpSync(path.join(ROOT, directory), path.join(fixtureRoot, directory), { recursive: true });
  }
  fs.mkdirSync(path.join(fixtureRoot, 'scripts'), { recursive: true });
  fs.copyFileSync(
    path.join(ROOT, 'scripts', 'generate-llms-full.js'),
    path.join(fixtureRoot, 'scripts', 'generate-llms-full.js')
  );
  fs.copyFileSync(path.join(ROOT, 'llms.txt'), path.join(fixtureRoot, 'llms.txt'));
  for (const relativePath of pagePaths) {
    const targetPath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(path.join(ROOT, relativePath), targetPath);
  }
}

function runGenerator(fixtureRoot) {
  return spawnSync(
    process.execPath,
    [path.join(fixtureRoot, 'scripts', 'generate-llms-full.js')],
    { cwd: fixtureRoot, encoding: 'utf8', timeout: 30_000 }
  );
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function combinedOutput(result) {
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function expectedUrls(pagePaths) {
  return pagePaths.map((relativePath) =>
    relativePath === 'index.html'
      ? 'https://www.webnovis.com/'
      : `https://www.webnovis.com/${relativePath}`
  );
}

function exportedUrls(value) {
  return [...value.matchAll(/^URL: (.+)$/gm)].map((match) => match[1]);
}

function main() {
  const pagePaths = expectedPagePaths();
  assert.equal(new Set(pagePaths).size, pagePaths.length, 'llms-full source-page list must not contain duplicates');

  const publicExports = ['llms.txt', 'llms-full.txt', 'ai.txt', 'webnovis-ai-data.json'];
  const exportFindings = publicExports.flatMap((relativePath) =>
    findUnsupportedPublishedClaims(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
      .map((finding) => ({ relativePath, ...finding }))
  );
  assert.deepEqual(exportFindings, [], `public editorial exports must be claim-safe: ${JSON.stringify(exportFindings)}`);

  const llmsFull = fs.readFileSync(path.join(ROOT, 'llms-full.txt'), 'utf8');
  assert.equal(
    (llmsFull.match(/^----------------------------------------$/gm) || []).length,
    pagePaths.length,
    'llms-full must contain exactly one section for every configured source page'
  );
  assert.deepEqual(
    exportedUrls(llmsFull),
    expectedUrls(pagePaths),
    'llms-full must contain each configured canonical URL exactly once and in deterministic order'
  );
  assert.match(
    llmsFull,
    /^# Generato automaticamente da scripts\/generate-llms-full\.js$/m,
    'llms-full must use a stable generator marker instead of a runtime timestamp'
  );

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-llms-fail-closed-'));
  try {
    copyFixture(fixtureRoot, pagePaths);

    const first = runGenerator(fixtureRoot);
    assert.equal(first.status, 0, `clean llms-full generation must pass:\n${combinedOutput(first)}`);
    assert.match(first.stdout, new RegExp(`${pagePaths.length} pagine`));
    const firstOutput = fs.readFileSync(path.join(fixtureRoot, 'llms-full.txt'), 'utf8');
    assert.equal(
      (firstOutput.match(/^----------------------------------------$/gm) || []).length,
      pagePaths.length,
      'isolated clean generation must retain the exact configured section count'
    );
    assert.deepEqual(exportedUrls(firstOutput), expectedUrls(pagePaths));

    const second = runGenerator(fixtureRoot);
    assert.equal(second.status, 0, `second clean llms-full generation must pass:\n${combinedOutput(second)}`);
    const secondOutput = fs.readFileSync(path.join(fixtureRoot, 'llms-full.txt'), 'utf8');
    assert.equal(sha256(secondOutput), sha256(firstOutput), 'llms-full generation must be byte-deterministic');

    const injectedPage = path.join(fixtureRoot, 'index.html');
    const originalHtml = fs.readFileSync(injectedPage, 'utf8');
    const injectedHtml = originalHtml.replace(
      /(<main\b[^>]*>)/i,
      '$1<p data-test-unsupported-claim>Preventivo gratuito entro 24 ore.</p>'
    );
    assert.notEqual(injectedHtml, originalHtml, 'the unsupported test claim must be injected inside <main>');
    fs.writeFileSync(injectedPage, injectedHtml, 'utf8');

    const injected = runGenerator(fixtureRoot);
    assert.notEqual(
      injected.status,
      0,
      `an unsupported source claim must make llms-full generation fail:\n${combinedOutput(injected)}`
    );
    assert.match(combinedOutput(injected), /index\.html[\s\S]*fixed-24-hour-commercial-sla/i);
    assert.equal(
      sha256(fs.readFileSync(path.join(fixtureRoot, 'llms-full.txt'), 'utf8')),
      sha256(secondOutput),
      'a blocked generation must not overwrite the last valid llms-full export'
    );

    console.log(`LLM export regression checks passed: ${pagePaths.length} deterministic sections.`);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

main();
