const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { isWhitelistedNoLoadingImage } = require('../config/image-policy');

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(fullPath);
  }
  return files;
}

function extractAttribute(attributes, name) {
  const match = attributes.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function main() {
  const offenders = [];

  for (const filePath of walk(ROOT)) {
    const relativePath = path.relative(ROOT, filePath);
    const html = fs.readFileSync(filePath, 'utf8');
    for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
      const attributes = match[1];
      if (/\bloading=/i.test(attributes)) continue;
      const image = {
        filePath: relativePath,
        src: extractAttribute(attributes, 'src'),
        className: extractAttribute(attributes, 'class'),
        alt: extractAttribute(attributes, 'alt')
      };
      if (!isWhitelistedNoLoadingImage(image)) {
        offenders.push(`${relativePath} :: ${image.className || '(no-class)'} :: ${image.src || '(no-src)'}`);
      }
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Non-critical images must declare loading. Found: ${offenders.slice(0, 20).join(', ')}`
  );
}

try {
  main();
  console.log('Image loading policy checks passed.');
} catch (error) {
  console.error('Image loading policy checks failed:', error.message);
  process.exit(1);
}
