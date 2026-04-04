const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function main() {
  const stdout = execFileSync('node', ['scripts/build-governance-report.js', '--json'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  const report = JSON.parse(stdout);

  assert.ok(report.summary.totalUrls > 500, 'governance report should analyze the published URL set');
  assert.equal(report.dataAvailability.gsc.available, false, 'GSC should be absent until CSV exports are provided');

  const mergePaths = report.buckets.merge_or_consolidate.map((entry) => entry.pathname);
  const reviewPaths = report.buckets.review_for_deamplify.map((entry) => entry.pathname);
  const deamplifiedPaths = report.buckets.deamplified_existing.map((entry) => entry.pathname);
  const keepPaths = report.buckets.keep_push.map((entry) => entry.pathname);

  assert.ok(
    mergePaths.includes('/blog/dati-obbligatori-sito-web.html'),
    'dati-obbligatori short version should remain flagged for consolidation into the pillar page'
  );
  assert.ok(
    mergePaths.includes('/index.html'),
    'index.html should remain flagged as a consolidation candidate for the canonical homepage'
  );
  assert.ok(
    reviewPaths.includes('/cookie-policy.html'),
    'cookie-policy.html should be reviewed for de-amplification'
  );
  assert.ok(
    deamplifiedPaths.includes('/email-marketing-milano.html'),
    'phase-1 de-amplified pages should remain tracked in the governance report'
  );
  assert.ok(
    keepPaths.includes('/servizi/sviluppo-web.html'),
    'core commercial service pages must remain in the keep/push bucket'
  );
}

try {
  main();
  console.log('SEO governance report checks passed.');
} catch (error) {
  console.error('SEO governance report checks failed:', error.message);
  process.exit(1);
}
