/**
 * WebNovis — Preferred-source CTA injector (blog).
 *
 * Inserts the lightweight, zero-JS "fonti preferite su Google" banner:
 *  - top of every blog article, right after <p class="article-meta">
 *  - top of the Blog index, right before the article grid
 * The footer keeps its own variant; each banner is a single CTA link,
 * no duplicated hypertext.
 *
 * Idempotent. Run: node scripts/inject-preferred-source.js [--out-dir=dist]
 */
const fs = require('fs');
const path = require('path');
const { buildPreferredSourceArticleHtml } = require('../config/site-footer');
const { getPublishDir } = require('../config/publish-targets');

const ROOT = getPublishDir();
const DRY_RUN = process.argv.includes('--dry-run');
const CTA = buildPreferredSourceArticleHtml();

const ARTICLE_META_PATTERN = /<p class="article-meta">[\s\S]*?<\/p>/;
const BLOG_GRID_PATTERN = /<div class="blog-grid" id="blogGrid">/;

let injected = 0;
let skipped = 0;
let noAnchor = 0;

function processFile(filePath, mode) {
  const original = fs.readFileSync(filePath, 'utf8');
  if (original.includes('wn-ps-article')) {
    skipped++;
    return;
  }
  let updated = null;
  if (mode === 'article' && ARTICLE_META_PATTERN.test(original)) {
    updated = original.replace(ARTICLE_META_PATTERN, (match) => `${match} ${CTA}`);
  } else if (mode === 'index' && BLOG_GRID_PATTERN.test(original)) {
    updated = original.replace(BLOG_GRID_PATTERN, (match) => `${CTA} ${match}`);
  }
  if (updated === null) {
    noAnchor++;
    console.log(`  ⚠️  no anchor: ${path.relative(ROOT, filePath)}`);
    return;
  }
  injected++;
  if (!DRY_RUN) fs.writeFileSync(filePath, updated, 'utf8');
}

const blogDir = path.join(ROOT, 'blog');
for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  processFile(path.join(blogDir, entry.name), entry.name === 'index.html' ? 'index' : 'article');
}

console.log(`✅ Preferred-source CTA injected: ${injected} files`);
console.log(`⏭️  Already present: ${skipped} files`);
console.log(`⚠️  No anchor found: ${noAnchor} files`);
if (DRY_RUN) console.log('🔍 DRY RUN — no files written');
