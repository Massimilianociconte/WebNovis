/**
 * Nav canonical regressions.
 *
 * Ogni pagina pubblica con un blocco <ul class="nav-menu"> deve riportare
 * ESATTAMENTE il menu canonico di config/site-header.js (stesse voci, stesso
 * ordine, prefisso relativo corretto per la profondità). Garantisce che
 * voci come "Come Lavoriamo" non spariscano di nuovo da sottogruppi di
 * pagine (cfr. privacy/cookie/termini rimaste a 6 voci).
 *
 * Esclusioni allineate a scripts/standardize-header.js: template newsletter,
 * stub 301 e showcase portfolio (demo iframe senza navigazione).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { getNavMenuHtml, NAV_MENU_PATTERN } = require('../config/site-header');

const ROOT = path.resolve(process.cwd());
const EXCLUDED_DIRS = new Set([
  'node_modules', '.git', '.github', '.claude', '.wrangler', '.well-known',
  'docs', 'scripts', 'css', 'js', 'Img', 'fonts', 'data', 'config', 'tests',
  'dist', 'templates', 'build', 'src'
]);
const EXCLUDED_FILES = new Set([
  'newsletter-template.html',
  'agenzie-web-rho.html',
  'Aether-Digital.html',
  'Ember-Oak.html',
  'Lumina-Creative.html',
  'Muse-Editorial.html',
  'PopBlock-Studio.html',
  'Structure-Arch.html'
]);

function collectHtmlPaths(dir, depth, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const target = path.resolve(dir, entry.name);
    if (target !== ROOT && !target.startsWith(ROOT + path.sep)) continue;
    if (entry.isDirectory()) {
      collectHtmlPaths(target, depth + 1, out);
    } else if (entry.isFile() && entry.name.endsWith('.html') && !EXCLUDED_FILES.has(entry.name)) {
      out.push({ target, depth });
    }
  }
  return out;
}

function main() {
  assert.match(
    getNavMenuHtml(''),
    /Come Lavoriamo/,
    'the canonical nav must include "Come Lavoriamo"'
  );

  const candidates = collectHtmlPaths(ROOT, 0);
  assert.ok(
    candidates.length > 1000,
    `expected a full-site scan (1000+ html files), got ${candidates.length}`
  );

  const offenders = [];
  let withNav = 0;
  for (const { target, depth } of candidates) {
    if (target !== ROOT && !target.startsWith(ROOT + path.sep)) continue;
    const html = fs.readFileSync(target, 'utf8');
    const match = html.match(NAV_MENU_PATTERN);
    if (!match) continue;
    withNav++;
    const prefix = depth <= 0 ? '' : `${Array(depth).fill('..').join('/')}/`;
    const canonical = getNavMenuHtml(prefix);
    if (match[0] !== canonical) offenders.push(path.relative(ROOT, target));
  }

  assert.ok(
    withNav > 1100,
    `expected the nav on 1100+ pages, found only ${withNav} — scan may be broken`
  );
  assert.equal(
    offenders.length,
    0,
    `non-canonical nav-menu in:\n${offenders.join('\n')}`
  );

  console.log(
    `Nav canonical regressions passed: ${withNav}/${candidates.length} pages match the canonical menu`
  );
}

main();
