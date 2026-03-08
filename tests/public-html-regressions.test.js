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
  const offenders = [];
  for (const filePath of walk(ROOT)) {
    const html = fs.readFileSync(filePath, 'utf8');
    if (html.includes('height="auto"')) {
      offenders.push(path.relative(ROOT, filePath));
    }
  }

  assert.deepEqual(offenders, [], `Public HTML must not contain height="auto". Found: ${offenders.slice(0, 20).join(', ')}`);
}

try {
  main();
  console.log('Public HTML regression checks passed.');
} catch (error) {
  console.error('Public HTML regression checks failed:', error.message);
  process.exit(1);
}
