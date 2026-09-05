/**
 * WebNovis — Source hreflang sync (source-tree step).
 *
 * Applies ONLY the build-time ensureSelfHreflang transform from
 * config/seo-html-transforms.js to the source tree, so source files and
 * build output carry the same single it-IT hreflang tag and the
 * html-structure-regressions inventory check (which reads source) stays
 * green. Idempotent: the transform strips any existing hreflang first.
 *
 * Run: node scripts/sync-source-hreflang.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const { ensureSelfHreflang } = require('../config/seo-html-transforms');
const { collectExpectedPublicHtml } = require('./public-artifact');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

let updated = 0;
for (const relativePath of collectExpectedPublicHtml(ROOT)) {
  const candidates = [path.join(ROOT, relativePath)];
  const srcMirror = path.join(ROOT, 'src', 'html', relativePath);
  if (srcMirror !== candidates[0] && fs.existsSync(srcMirror)) candidates.push(srcMirror);
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const original = fs.readFileSync(filePath, 'utf8');
    // src mirrors use the OUTPUT-relative path for URL/noindex decisions.
    const fixed = ensureSelfHreflang(original, relativePath);
    if (fixed !== original) {
      updated++;
      if (!DRY_RUN) fs.writeFileSync(filePath, fixed, 'utf8');
    }
  }
}

console.log(`✅ hreflang synced: ${updated} files${DRY_RUN ? ' (dry run)' : ''}`);
