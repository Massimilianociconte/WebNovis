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
  const nonCriticalLoaderPath = path.join(ROOT, 'js', 'noncritical-loader.js');
  assert.ok(
    fs.existsSync(nonCriticalLoaderPath),
    'js/noncritical-loader.js must exist as the central progressive loader for non-critical UI scripts'
  );

  const nonCriticalLoaderSource = fs.readFileSync(nonCriticalLoaderPath, 'utf8');
  assert.match(
    nonCriticalLoaderSource,
    /requestIdleCallback|setTimeout/i,
    'js/noncritical-loader.js must schedule low-priority work outside the critical path'
  );
  assert.match(
    nonCriticalLoaderSource,
    /pointerdown|mousemove|keydown|IntersectionObserver/i,
    'js/noncritical-loader.js must progressively activate enhancements based on intent or viewport visibility'
  );
  assert.match(
    nonCriticalLoaderSource,
    /chat\.min\.js|cursor\.min\.js|text-effects\.min\.js|globe\.min\.js/i,
    'js/noncritical-loader.js must own deferred loading for the heaviest decorative scripts'
  );

  const offenders = [];
  const legacyBlogFooterOffenders = [];
  const eagerNonCriticalScriptOffenders = [];
  const missingLoaderOffenders = [];
  for (const filePath of walk(ROOT)) {
    const html = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(ROOT, filePath);
    if (html.includes('height="auto"')) {
      offenders.push(relativePath);
    }

    if (relativePath.startsWith(`blog${path.sep}`) && html.includes('class="footer-content"')) {
      legacyBlogFooterOffenders.push(relativePath);
    }

    if (/js\/(?:chat|cursor|text-effects|globe)(?:\.min)?\.js/i.test(html)) {
      eagerNonCriticalScriptOffenders.push(relativePath);
    }

    if (!/js\/noncritical-loader\.min\.js/i.test(html)) {
      missingLoaderOffenders.push(relativePath);
    }
  }

  assert.deepEqual(offenders, [], `Public HTML must not contain height="auto". Found: ${offenders.slice(0, 20).join(', ')}`);
  assert.deepEqual(
    legacyBlogFooterOffenders,
    [],
    `Blog article pages must not contain the legacy footer-content markup. Found: ${legacyBlogFooterOffenders.slice(0, 20).join(', ')}`
  );
  assert.deepEqual(
    eagerNonCriticalScriptOffenders,
    [],
    `Public HTML must not eagerly load non-critical UI scripts. Found: ${eagerNonCriticalScriptOffenders.slice(0, 20).join(', ')}`
  );
  assert.deepEqual(
    missingLoaderOffenders,
    [],
    `Public HTML must reference the progressive non-critical loader. Found: ${missingLoaderOffenders.slice(0, 20).join(', ')}`
  );
}

try {
  main();
  console.log('Public HTML regression checks passed.');
} catch (error) {
  console.error('Public HTML regression checks failed:', error.message);
  process.exit(1);
}
