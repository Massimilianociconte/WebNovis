const fs = require('fs');
const path = require('path');
const { getBlogFooterHtml, normalizeFooterAssetMarkup, normalizePhoneCtaMarkup } = require('../config/site-footer');
const { normalizeImageLoadingInHtml } = require('../config/image-policy');
const { applySeoHtmlTransforms } = require('../config/seo-html-transforms');
const { ROOT_DIR, getPublishDir } = require('../config/publish-targets');

const ROOT = getPublishDir();
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_ARGS = process.argv.filter((arg) => arg.startsWith('--only='));
const ONLY_PATHS = new Set(
  ONLY_ARGS.flatMap((arg) =>
    arg
      .slice('--only='.length)
      .split(',')
      .map((value) => value.trim().replace(/\\/g, '/').replace(/^\.\//, ''))
      .filter(Boolean)
  )
);
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs', 'scripts', 'css', 'js', 'Img', 'fonts', 'data', 'config', 'tests']);
const BLOG_FOOTER_PATTERN = /<footer class="footer">\s*<div class="container">\s*<div class="footer-content">[\s\S]*?<\/footer>/;
const DESIGNRUSH_SCRIPT_PATTERN = /<script\b[^>]*src="https:\/\/www\.designrush\.com\/topbest\/js\/widgets\/agency-reviews\.js"[^>]*><\/script>/gi;
const DESIGNRUSH_LOADER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/designrush-loader\.js"[^>]*><\/script>/gi;
const FOOTER_WIDGET_LOADER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/footer-widgets-loader(?:\.min)?\.js"[^>]*><\/script>/i;
const FOOTER_WIDGET_LOADER_GLOBAL_PATTERN = /<script\b[^>]*src="([^"]*?)js\/footer-widgets-loader(?:\.min)?\.js"[^>]*><\/script>/gi;
const NONCRITICAL_LOADER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/noncritical-loader(?:\.min)?\.js"[^>]*><\/script>/i;
const WEB_VITALS_REPORTER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/web-vitals-reporter(?:\.min)?\.js"[^>]*><\/script>/gi;
const MAIN_MIN_SCRIPT_PATTERN = /<script\b[^>]*src="([^"]*?)js\/main\.min\.js"[^>]*><\/script>/i;
const NONCRITICAL_SCRIPT_PATTERNS = [
  /<script\b[^>]*src="([^"]*?)js\/chat(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/cursor(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/text-effects(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/globe(?:\.min)?\.js"[^>]*><\/script>\s*/gi
];
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
  const loaderPath = `${getRootPrefix(relativePath)}js/footer-widgets-loader.min.js`;
  let updated = html.replace(DESIGNRUSH_SCRIPT_PATTERN, `<script defer src="${loaderPath}"></script>`);
  updated = updated.replace(DESIGNRUSH_LOADER_PATTERN, `<script defer src="${loaderPath}"></script>`);
  return updated;
}

function normalizeFooterWidgetLoaderRefs(html, relativePath) {
  const loaderPath = `${getRootPrefix(relativePath)}js/footer-widgets-loader.min.js`;
  return html.replace(FOOTER_WIDGET_LOADER_GLOBAL_PATTERN, `<script defer src="${loaderPath}"></script>`);
}

function ensureFooterWidgetLoader(html, relativePath) {
  const hasWidgets = /trustpilot-widget|data-designrush-widget/i.test(html);
  if (!hasWidgets || FOOTER_WIDGET_LOADER_PATTERN.test(html)) return html;

  const loaderPath = `${getRootPrefix(relativePath)}js/footer-widgets-loader.min.js`;
  const loaderTag = `<script defer src="${loaderPath}"></script>`;

  if (/<script\b[^>]*src="([^"]*?)js\/main\.min\.js"[^>]*><\/script>/i.test(html)) {
    return html.replace(/<script\b[^>]*src="([^"]*?)js\/main\.min\.js"[^>]*><\/script>/i, `${loaderTag} <script defer src="$1js/main.min.js"></script>`);
  }

  return html.replace(/<\/body>/i, `${loaderTag} </body>`);
}

function normalizeNonCriticalLoader(html, relativePath) {
  const loaderPath = `${getRootPrefix(relativePath)}js/noncritical-loader.min.js`;
  const loaderTag = `<script defer src="${loaderPath}"></script>`;
  let updated = html;

  for (const pattern of NONCRITICAL_SCRIPT_PATTERNS) {
    updated = updated.replace(pattern, '');
  }

  updated = updated.replace(NONCRITICAL_LOADER_PATTERN, '');

  if (MAIN_MIN_SCRIPT_PATTERN.test(updated)) {
    return updated.replace(MAIN_MIN_SCRIPT_PATTERN, (match) => `${match} ${loaderTag}`);
  }

  return updated.replace(/<\/body>/i, `${loaderTag} </body>`);
}

function normalizeWebVitalsReporterRefs(html, relativePath) {
  const reporterPath = `${getRootPrefix(relativePath)}js/web-vitals-reporter.min.js`;
  return html.replace(WEB_VITALS_REPORTER_PATTERN, `<script defer src="${reporterPath}"></script>`);
}

function normalizeFooterLogoLoading(html) {
  return html.replace(/<footer class="footer">[\s\S]*?<\/footer>/gi, (footerHtml) =>
    footerHtml.replace(/<img\b([^>]*class="logo-image"[^>]*)>/i, (fullMatch, attributes) => {
      let updatedAttributes = attributes;
      if (!/\bloading=/i.test(updatedAttributes)) updatedAttributes += ' loading="lazy"';
      if (!/\bfetchpriority=/i.test(updatedAttributes)) updatedAttributes += ' fetchpriority="low"';
      if (!/\bdecoding=/i.test(updatedAttributes)) updatedAttributes += ' decoding="async"';
      return `<img${updatedAttributes}>`;
    })
  );
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
  const normalizedRelativePath = relativePath.replace(/\\/g, '/');
  if (ONLY_PATHS.size > 0 && !ONLY_PATHS.has(normalizedRelativePath)) {
    continue;
  }
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = normalizeBlogFooter(original, relativePath);
  updated = normalizeFooterAssetMarkup(updated);
  updated = normalizePhoneCtaMarkup(updated);
  updated = normalizeImageLoadingInHtml(updated);
  updated = normalizeDesignRushLoader(updated, relativePath);
  updated = normalizeFooterWidgetLoaderRefs(updated, relativePath);
  updated = ensureFooterWidgetLoader(updated, relativePath);
  updated = normalizeNonCriticalLoader(updated, relativePath);
  updated = normalizeWebVitalsReporterRefs(updated, relativePath);
  updated = normalizeFooterLogoLoading(updated);
  updated = normalizeBlogIndexLinks(updated);
  updated = normalizeLegacyLinks(updated);
  updated = applySeoHtmlTransforms(updated, relativePath);
  if (updated !== original) {
    changed++;
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, updated, 'utf8');
    }
    console.log(`${DRY_RUN ? '[dry]' : '[ok]'} ${relativePath}`);
  }
}

console.log(`Normalized ${changed} HTML files in ${path.relative(ROOT_DIR, ROOT).replace(/\\/g, '/') || '.'}${DRY_RUN ? ' (dry run)' : ''}.`);
