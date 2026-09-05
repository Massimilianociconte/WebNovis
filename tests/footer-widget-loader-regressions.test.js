const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const loaderPath = path.join(ROOT, 'js', 'footer-widgets-loader.js');
  assert.ok(
    fs.existsSync(loaderPath),
    'js/footer-widgets-loader.js must exist as the central lazy loader for footer review widgets'
  );

  const loaderSource = fs.readFileSync(loaderPath, 'utf8');
  assert.match(
    loaderSource,
    /designrush/i,
    'js/footer-widgets-loader.js must own DesignRush lazy loading'
  );
  assert.doesNotMatch(
    loaderSource,
    /widget\.trustpilot\.com/i,
    'Trustpilot bootstrap must NOT be loaded externally: the badge is static (config/site-footer.js) because the external widget kept failing (HAR 2026-09-05: 8x status 0)'
  );

  const siteFooterSource = fs.readFileSync(
    path.join(ROOT, 'config', 'site-footer.js'),
    'utf8'
  );
  assert.match(
    siteFooterSource,
    /trustpilot-badge/i,
    'config/site-footer.js must build the static Trustpilot badge (stars + wordmark, zero JS)'
  );

  const htmlFiles = walk(ROOT);
  const offenders = [];

  for (const filePath of htmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8');
    const hasReviewWidgets = /data-designrush-widget/i.test(html);
    if (!hasReviewWidgets) continue;

    if (!/footer-widgets-loader(?:\.min)?\.js/i.test(html)) {
      offenders.push(path.relative(ROOT, filePath));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `HTML pages with footer review widgets must reference the central footer widget loader. Found: ${offenders.slice(0, 20).join(', ')}`
  );
}

try {
  main();
  console.log('Footer widget loader regression checks passed.');
} catch (error) {
  console.error('Footer widget loader regression checks failed:', error.message);
  process.exit(1);
}
