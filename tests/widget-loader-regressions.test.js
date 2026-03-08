const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs']);
const DESIGNRUSH_URL = 'https://www.designrush.com/topbest/js/widgets/agency-reviews.js';

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
  const offenders = [];
  for (const filePath of walk(ROOT)) {
    const html = fs.readFileSync(filePath, 'utf8');
    if (html.includes(DESIGNRUSH_URL)) {
      offenders.push(path.relative(ROOT, filePath));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Public HTML must not hardcode the DesignRush widget script. Found: ${offenders.slice(0, 20).join(', ')}`
  );

  const loaderPath = path.join(ROOT, 'js', 'designrush-loader.js');
  assert.ok(
    fs.existsSync(loaderPath),
    'js/designrush-loader.js must exist as the central lazy loader'
  );

  const loaderSource = fs.readFileSync(loaderPath, 'utf8');
  assert.ok(
    loaderSource.includes(DESIGNRUSH_URL),
    'js/designrush-loader.js must lazy-load the DesignRush widget centrally'
  );
}

try {
  main();
  console.log('Widget loader regression checks passed.');
} catch (error) {
  console.error('Widget loader regression checks failed:', error.message);
  process.exit(1);
}
