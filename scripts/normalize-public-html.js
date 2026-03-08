const fs = require('fs');
const path = require('path');
const { getBlogFooterHtml, normalizeFooterAssetMarkup } = require('../config/site-footer');
const { ROOT_DIR, getPublishDir } = require('../config/publish-targets');

const ROOT = getPublishDir();
const DRY_RUN = process.argv.includes('--dry-run');
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs', 'scripts', 'css', 'js', 'Img', 'fonts', 'data', 'config', 'tests']);
const BLOG_FOOTER_PATTERN = /<footer class="footer">\s*<div class="container">\s*<div class="footer-content">[\s\S]*?<\/footer>/;
const DESIGNRUSH_SCRIPT_PATTERN = /<script\b[^>]*src="https:\/\/www\.designrush\.com\/topbest\/js\/widgets\/agency-reviews\.js"[^>]*><\/script>/gi;
const LEGACY_LINK_REPLACEMENTS = new Map([
  ['href="/personal-branding-online"', 'href="personal-branding-online.html"'],
  ['href="/sito-personale-freelancer"', 'href="sito-personale-freelancer.html"'],
  ['href="/ecommerce-che-vende"', 'href="ecommerce-che-vende.html"'],
  ['href="/shopify-vs-sito-ecommerce-custom"', 'href="shopify-vs-sito-ecommerce-custom.html"'],
  ['href="seo-tecnica.html"', 'href="crawl-budget-ottimizzazione.html"'],
  ['href="/sito-web-mobile-first"', 'href="sito-web-mobile-first.html"'],
  ['href="/velocita-sito-web-guida"', 'href="velocita-sito-web-guida.html"'],
  ['href="analytics-instagram-facebook-linkedin.html"', 'href="instagram-insights-guida.html"'],
  ['href="/chiedere-recensioni-clienti"', 'href="chiedere-recensioni-clienti.html"'],
  ['href="/funnel-vendita-online"', 'href="funnel-vendita-online.html"'],
  ['href="/ottimizzazione-tasso-conversione"', 'href="ottimizzazione-tasso-conversione.html"'],
  ['href="community-online.html"', 'href="social-media-strategy-2026.html"'],
  ['href="engagement-community.html"', 'href="user-generated-content.html"'],
  ['href="gestire-community-social.html"', 'href="social-media-strategy-2026.html"'],
  ['href="server-log-seo.html"', 'href="log-analysis-seo.html"'],
  ['href="log-file-analysis.html"', 'href="log-analysis-seo.html"'],
  ['href="googlebot-log.html"', 'href="crawl-budget-ottimizzazione.html"']
]);

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

function getBlogPrefix(relativePath) {
  const depth = relativePath.split(path.sep).length - 1;
  return depth <= 0 ? '.' : Array(depth).fill('..').join('/');
}

function getRootPrefix(relativePath) {
  const depth = relativePath.split(path.sep).length - 1;
  return depth <= 0 ? '' : `${Array(depth).fill('..').join('/')}/`;
}

function normalizeBlogFooter(html, relativePath) {
  if (!relativePath.startsWith(`blog${path.sep}`)) return html;
  if (!BLOG_FOOTER_PATTERN.test(html)) return html;
  return html.replace(BLOG_FOOTER_PATTERN, getBlogFooterHtml(getBlogPrefix(relativePath)));
}

function normalizeDesignRushLoader(html, relativePath) {
  if (!DESIGNRUSH_SCRIPT_PATTERN.test(html)) return html;
  const loaderPath = `${getRootPrefix(relativePath)}js/designrush-loader.js`;
  return html.replace(DESIGNRUSH_SCRIPT_PATTERN, `<script defer src="${loaderPath}"></script>`);
}

function normalizeBlogIndexLinks(html) {
  return html
    .replace(/href="(\.{1,2}\/)+blog\/index\.html"index\.html"/g, (match) => {
      const prefix = match.match(/href="((?:\.{1,2}\/)+)blog/)[1];
      return `href="${prefix}blog/"`;
    })
    .replace(/href="((?:\.{1,2}\/)+blog)\/index\.html"/g, 'href="$1/"')
    .replace(/href="\/blog\/index\.html"/g, 'href="/blog/"');
}

function normalizeLegacyLinks(html) {
  let updated = html;
  for (const [from, to] of LEGACY_LINK_REPLACEMENTS.entries()) {
    updated = updated.split(from).join(to);
  }
  return updated;
}

let changed = 0;
for (const filePath of walk(ROOT)) {
  const relativePath = path.relative(ROOT, filePath);
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = normalizeBlogFooter(original, relativePath);
  updated = normalizeFooterAssetMarkup(updated);
  updated = normalizeDesignRushLoader(updated, relativePath);
  updated = normalizeBlogIndexLinks(updated);
  updated = normalizeLegacyLinks(updated);
  if (updated !== original) {
    changed++;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
    console.log(`${DRY_RUN ? '[dry]' : '[ok]'} ${relativePath}`);
  }
}

console.log(`Normalized ${changed} HTML files in ${path.relative(ROOT_DIR, ROOT).replace(/\\/g, '/') || '.'}${DRY_RUN ? ' (dry run)' : ''}.`);
