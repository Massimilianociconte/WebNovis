const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function main() {
  const artifactModulePath = path.join(ROOT, 'scripts', 'public-artifact.js');
  const prepareScriptPath = path.join(ROOT, 'scripts', 'prepare-public-artifact.js');
  const verifyScriptPath = path.join(ROOT, 'scripts', 'verify-public-artifact.js');

  assert.ok(fs.existsSync(artifactModulePath), 'public artifact policy module must exist');
  assert.ok(fs.existsSync(prepareScriptPath), 'staging-first public artifact builder must exist');
  assert.ok(fs.existsSync(verifyScriptPath), 'public artifact verifier must exist');

  const {
    DYNAMIC_RUNTIME_DEPENDENCIES,
    FORBIDDEN_PUBLIC_BASENAMES,
    FORBIDDEN_PUBLIC_PREFIXES,
    assertSafePublishTarget,
    normalizePath
  } = require(artifactModulePath);
  const {
    collectJsRuntimeReferences,
    scanSecretLikeContent,
    verifyManifestRuntimeClosure
  } = require(verifyScriptPath);

  assert.ok(FORBIDDEN_PUBLIC_PREFIXES.includes('config/'), 'config/ must be forbidden in public artifacts');
  assert.ok(FORBIDDEN_PUBLIC_PREFIXES.includes('tests/'), 'tests/ must be forbidden in public artifacts');
  assert.ok(FORBIDDEN_PUBLIC_BASENAMES.has('package.json'), 'package.json must be forbidden in public artifacts');
  assert.ok(FORBIDDEN_PUBLIC_BASENAMES.has('search-ai-index.json'), 'private AI corpus must be forbidden in public artifacts');
  assert.ok(FORBIDDEN_PUBLIC_BASENAMES.has('newsletter-template.html'), 'email source templates must not be public');
  assert.deepEqual(
    DYNAMIC_RUNTIME_DEPENDENCIES['js/noncritical-loader.min.js'],
    ['js/chat.min.js', 'js/cursor.min.js', 'js/globe.min.js', 'js/text-effects.min.js'],
    'the progressive loader dependency closure must be explicit'
  );
  assert.deepEqual(
    DYNAMIC_RUNTIME_DEPENDENCIES['js/web-vitals-reporter.min.js'],
    ['js/web-vitals.iife.js'],
    'the field-metric reporter dependency must be explicit'
  );

  assert.throws(
    () => assertSafePublishTarget(ROOT),
    /refusing|dedicated|source root/i,
    'builder must refuse the repository root'
  );
  assert.throws(
    () => assertSafePublishTarget(path.parse(ROOT).root),
    /refusing|dedicated|filesystem root/i,
    'builder must refuse the filesystem root'
  );
  assert.throws(
    () => assertSafePublishTarget(os.homedir()),
    /refusing|dedicated|home/i,
    'builder must refuse the user home'
  );
  assert.throws(
    () => assertSafePublishTarget(path.join(ROOT, 'not-a-public-artifact')),
    /refusing|dedicated/i,
    'builder must refuse a non-dedicated output directory'
  );

  const symlinkReal = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-public-artifact-real-'));
  const symlinkPath = path.join(
    os.tmpdir(),
    `webnovis-public-artifact-${process.pid}-${Date.now()}`
  );
  try {
    fs.symlinkSync(symlinkReal, symlinkPath);
    assert.throws(
      () => assertSafePublishTarget(symlinkPath, { allowTemporary: true }),
      /symlink/i,
      'builder must refuse a symlink-backed output directory'
    );
  } finally {
    if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
    fs.rmSync(symlinkReal, { recursive: true, force: true });
  }

  assert.deepEqual(
    collectJsRuntimeReferences(
      'fetch("/search-index.json"); import("./module.js"); new Worker("/js/worker.js");',
      'js/example.js'
    ).map(normalizePath).sort(),
    ['js/module.js', 'js/worker.js', 'search-index.json'],
    'static JS fetch/import/worker dependencies must be discoverable'
  );

  const manifestRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-manifest-test-'));
  try {
    fs.writeFileSync(
      path.join(manifestRoot, 'manifest.json'),
      JSON.stringify({
        start_url: '/',
        icons: [{ src: '/Img/missing-icon.png' }]
      })
    );
    assert.deepEqual(
      verifyManifestRuntimeClosure(manifestRoot, new Set(['index.html', 'manifest.json'])),
      ['manifest.json icon requires missing Img/missing-icon.png'],
      'manifest icons must resolve to physical artifact files'
    );
  } finally {
    fs.rmSync(manifestRoot, { recursive: true, force: true });
  }

  const secretScanRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'webnovis-secret-scan-'));
  try {
    const googleKey = `AIza${'A'.repeat(35)}`;
    const githubFineGrained = `github_pat_${'B'.repeat(30)}`;
    fs.writeFileSync(path.join(secretScanRoot, 'safe.js'), 'const label = "GOOGLE_API_KEY";');
    fs.writeFileSync(path.join(secretScanRoot, 'unsafe.js'), `const key = "${googleKey}";`);
    fs.writeFileSync(path.join(secretScanRoot, 'unsafe.svg'), `<svg><desc>${githubFineGrained}</desc></svg>`);
    assert.deepEqual(
      scanSecretLikeContent(secretScanRoot, ['safe.js', 'unsafe.js', 'unsafe.svg']).sort(),
      [
        'unsafe.js: google-api-key',
        'unsafe.svg: github-fine-grained-token'
      ],
      'secret scan must inspect JS and SVG without flagging environment-variable labels'
    );
  } finally {
    fs.rmSync(secretScanRoot, { recursive: true, force: true });
  }

  const pkg = readJson('package.json');
  assert.equal(
    pkg.scripts['build:site:dist'],
    'node scripts/prepare-public-artifact.js --out-dir=dist',
    'the canonical dist build must be one staging-first transaction'
  );
  assert.equal(
    pkg.scripts['verify:artifact'],
    'node scripts/verify-public-artifact.js --out-dir=dist',
    'package.json must expose the artifact verifier'
  );

  const assetsIgnore = fs.readFileSync(path.join(ROOT, '.assetsignore'), 'utf8');
  for (const sensitivePattern of [
    '/*.js',
    '/*.md',
    '*.csv',
    '*.xlsx',
    '*.pdf',
    '*.jsonl',
    '.superpowers/',
    'blog/*.js',
    'blog/*.json',
    'leads-log.json',
    'leads-log.jsonl',
    'newsletter-log.json',
    'newsletter-log.jsonl'
  ]) {
    assert.ok(
      assetsIgnore.split(/\r?\n/).includes(sensitivePattern),
      `.assetsignore must exclude ${sensitivePattern} while production still points at the root`
    );
  }

  const sourceChat = fs.readFileSync(path.join(ROOT, 'js', 'chat.js'), 'utf8');
  const minifiedChat = fs.readFileSync(path.join(ROOT, 'js', 'chat.min.js'), 'utf8');
  for (const [label, content] of [['source', sourceChat], ['minified', minifiedChat]]) {
    assert.match(content, /\/Img\/robot\.webp/, `${label} chat must use a root-relative Weby source`);
    assert.match(content, /\/Img\/robot-112\.webp/, `${label} chat must use a root-relative Weby fallback`);
    assert.doesNotMatch(
      content,
      /(?:src|srcset)=\\?["']Img\/robot/,
      `${label} chat must not retain page-relative Weby image paths`
    );
  }
}

try {
  main();
  console.log('Public artifact regression checks passed.');
} catch (error) {
  console.error('Public artifact regression checks failed:', error.message);
  process.exit(1);
}
