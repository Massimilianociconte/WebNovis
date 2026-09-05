/**
 * WebNovis — Header/nav standardizer (source-tree step).
 *
 * Replaces every page's <ul class="nav-menu"> with the canonical menu from
 * config/site-header.js (correct relative prefix per directory depth) and
 * wraps bare <nav class="nav"> blocks in <header role="banner"> for
 * semantic consistency with the homepage.
 *
 * Idempotent. Covers the source tree AND src/html/ (whose prefixes mirror
 * the build output paths, e.g. src/html/servizi/x.html -> servizi/x.html).
 *
 * Run: node scripts/standardize-header.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const { getNavMenuHtml } = require('../config/site-header');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.github', '.claude', '.wrangler', '.well-known',
  'docs', 'scripts', 'css', 'js', 'Img', 'fonts', 'data', 'config', 'tests',
  'dist', 'templates', '.kiro', '.qoder', '.superpowers', '.vscode', 'src'
]);
const EXCLUDE_FILES = new Set(['newsletter-template.html']);

const NAV_MENU_PATTERN = /<ul class="nav-menu" id="navMenu">[\s\S]*?<\/ul>/;
const BARE_NAV_OPEN = '<nav class="nav" id="nav">';

function prefixForDepth(depth) {
  return depth <= 0 ? '' : `${Array(depth).fill('..').join('/')}/`;
}

function findHtmlFiles() {
  const files = [];
  function walk(dir, depth) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1);
      } else if (entry.isFile() && entry.name.endsWith('.html') && !EXCLUDE_FILES.has(entry.name)) {
        files.push({ path: full, rel: path.relative(ROOT, full).replace(/\\/g, '/'), depth });
      }
    }
  }
  walk(ROOT, 0);
  // src/html/* mirrors the published paths: same depth as the output file.
  const srcBase = path.join(ROOT, 'src', 'html');
  if (fs.existsSync(srcBase)) {
    function walkSrc(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkSrc(full);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          const outRel = path.relative(srcBase, full).replace(/\\/g, '/');
          const depth = outRel.split('/').length - 1;
          files.push({ path: full, rel: `src/html/${outRel}`, depth, isSrc: true });
        }
      }
    }
    walkSrc(srcBase);
  }
  return files;
}

function wrapBareNav(html) {
  const openIdx = html.indexOf(BARE_NAV_OPEN);
  if (openIdx === -1) return html;
  const before = html.slice(Math.max(0, openIdx - 60), openIdx);
  if (/<header\b[^>]*>\s*$/.test(before)) return html; // already wrapped
  const closeIdx = html.indexOf('</nav>', openIdx);
  if (closeIdx === -1) return html;
  return (
    `${html.slice(0, openIdx)}<header role="banner"> ${BARE_NAV_OPEN}` +
    `${html.slice(openIdx + BARE_NAV_OPEN.length, closeIdx)}</nav> </header>` +
    `${html.slice(closeIdx + '</nav>'.length)}`
  );
}

let navUpdated = 0;
let headerWrapped = 0;
let skipped = 0;

for (const file of findHtmlFiles()) {
  const original = fs.readFileSync(file.path, 'utf8');
  if (!NAV_MENU_PATTERN.test(original)) {
    skipped++;
    continue;
  }
  const canonical = getNavMenuHtml(prefixForDepth(file.depth));
  let updated = original.replace(NAV_MENU_PATTERN, canonical);
  if (updated !== original) navUpdated++;
  const wrapped = wrapBareNav(updated);
  if (wrapped !== updated) {
    headerWrapped++;
    updated = wrapped;
  }
  if (updated !== original && !DRY_RUN) {
    fs.writeFileSync(file.path, updated, 'utf8');
  }
}

console.log(`✅ Nav menus standardized: ${navUpdated} files`);
console.log(`✅ Header wrappers added: ${headerWrapped} files`);
console.log(`⏭️  Skipped (no nav-menu): ${skipped} files`);
if (DRY_RUN) console.log('🔍 DRY RUN — no files written');
