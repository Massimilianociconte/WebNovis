const fs = require('fs');
const path = require('path');
const {
  getBlogFooterHtml,
  normalizeFooterAssetMarkup,
  normalizePhoneCtaMarkup,
  normalizeReviewActionMarkup,
  normalizeSocialLinksMarkup,
  normalizeTrustpilotBadgeMarkup
} = require('../config/site-footer');
const { normalizeNavMenuMarkup } = require('../config/site-header');
const { normalizeEntityJsonLd } = require('../config/entity-facts');
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
const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.claude', 'docs', 'scripts', 'css', 'js', 'Img', 'fonts', 'data', 'config', 'tests', 'src']);
const BLOG_FOOTER_PATTERN = /<footer class="footer">\s*<div class="container">\s*<div class="footer-content">[\s\S]*?<\/footer>/;
const DESIGNRUSH_SCRIPT_PATTERN = /<script\b[^>]*src="https:\/\/www\.designrush\.com\/topbest\/js\/widgets\/agency-reviews\.js"[^>]*><\/script>/gi;
// Il bootstrap Trustpilot e caricato in lazy da footer-widgets-loader.js:
// qualsiasi <script> diretto nell'head e un duplicato da rimuovere.
const TRUSTPILOT_BOOTSTRAP_PATTERN = /\s*<script\b[^>]*src="https:\/\/widget\.trustpilot\.com\/bootstrap\/v5\/tp\.widget\.bootstrap\.min\.js"[^>]*><\/script>/gi;
const DESIGNRUSH_LOADER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/designrush-loader\.js"[^>]*><\/script>/gi;
const FOOTER_WIDGET_LOADER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/footer-widgets-loader(?:\.min)?\.js(\?[^"]*)?"[^>]*><\/script>/i;
const FOOTER_WIDGET_LOADER_GLOBAL_PATTERN = /\s*<script\b[^>]*src="(?:[^"]*?)js\/footer-widgets-loader(?:\.min)?\.js(?:\?[^"]*)?"[^>]*><\/script>\s*/gi;
// Il pattern deve tollerare il cache-busting `?v=...`: senza `[^"]*` prima
// della virgoletta la variante versionata non veniva riconosciuta, quindi
// normalizeNonCriticalLoader ne rimuoveva una e ne aggiungeva un'altra,
// lasciando DUE <script> del loader sulla stessa pagina.
const NONCRITICAL_LOADER_PATTERN = /\s*<script\b[^>]*src="([^"]*?)js\/noncritical-loader(?:\.min)?\.js(\?[^"]*)?"[^>]*><\/script>\s*/i;
const NONCRITICAL_LOADER_GLOBAL_PATTERN = /\s*<script\b[^>]*src="(?:[^"]*?)js\/noncritical-loader(?:\.min)?\.js(?:\?[^"]*)?"[^>]*><\/script>\s*/gi;
const WEB_VITALS_REPORTER_PATTERN = /<script\b[^>]*src="([^"]*?)js\/web-vitals-reporter(?:\.min)?\.js(\?[^"]*)?"[^>]*><\/script>/gi;
const MAIN_MIN_SCRIPT_PATTERN = /<script\b[^>]*src="([^"]*?)js\/main\.min\.js(\?[^"]*)?"[^>]*><\/script>/i;
const NONCRITICAL_SCRIPT_PATTERNS = [
  /<script\b[^>]*src="([^"]*?)js\/chat(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/cursor(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/text-effects(?:\.min)?\.js"[^>]*><\/script>\s*/gi,
  /<script\b[^>]*src="([^"]*?)js\/globe(?:\.min)?\.js"[^>]*><\/script>\s*/gi
];
const LEGACY_LINK_REPLACEMENTS = new Map([
  ['href="https://www.webnovis.com/ecommerce-b2b-guida"', 'href="/blog/ecommerce-b2b-guida.html"'],
  ['href="parametri-url-search-console.html"', 'href="canonical-tag-guida.html"'],
  ['href="url-indicizzate-strane.html"', 'href="indicizzazione-google-problemi.html"'],
  ['href="gsc-coverage-anomalie.html"', 'href="google-search-console-avanzato.html"'],
  ['href="pulizia-indice-google.html"', 'href="crawl-budget-ottimizzazione.html"'],
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

// Build-time guarantee: EVERY page footer becomes the canonical footer
// (single source of truth in config/site-footer.js), regardless of which
// generator or legacy variant produced it. Runs after normalizeBlogFooter.
const CANONICAL_FOOTER_PATTERN = /<footer class="footer">[\s\S]*?<\/footer>/;

function normalizeFooterCanonical(html, relativePath) {
  if (!CANONICAL_FOOTER_PATTERN.test(html)) return html;
  return html.replace(CANONICAL_FOOTER_PATTERN, getBlogFooterHtml(getBlogPrefix(relativePath)));
}

function normalizeNavMenu(html, relativePath) {
  return normalizeNavMenuMarkup(html, getRootPrefix(relativePath));
}

function getFooterWidgetLoaderVersion(html) {
  const versionedMatch = /src="[^"]*js\/footer-widgets-loader(?:\.min)?\.js(\?[^"]*)"/i.exec(html);
  return versionedMatch ? versionedMatch[1] : '';
}

function getFooterWidgetLoaderTag(html, relativePath) {
  const loaderPath = `${getRootPrefix(relativePath)}js/footer-widgets-loader.min.js${getFooterWidgetLoaderVersion(html)}`;
  return `<script defer src="${loaderPath}"></script>`;
}

function normalizeDesignRushLoader(html, relativePath) {
  const loaderTag = getFooterWidgetLoaderTag(html, relativePath);
  let updated = html.replace(DESIGNRUSH_SCRIPT_PATTERN, loaderTag);
  updated = updated.replace(DESIGNRUSH_LOADER_PATTERN, loaderTag);
  updated = updated.replace(TRUSTPILOT_BOOTSTRAP_PATTERN, ' ');
  return updated;
}

function normalizeFooterWidgetLoaderRefs(html, relativePath) {
  if (!FOOTER_WIDGET_LOADER_GLOBAL_PATTERN.test(html)) return html;
  FOOTER_WIDGET_LOADER_GLOBAL_PATTERN.lastIndex = 0;
  const loaderTag = getFooterWidgetLoaderTag(html, relativePath);
  let updated = html.replace(FOOTER_WIDGET_LOADER_GLOBAL_PATTERN, ' ');

  if (MAIN_MIN_SCRIPT_PATTERN.test(updated)) {
    return updated.replace(MAIN_MIN_SCRIPT_PATTERN, (match) => `${match} ${loaderTag} `);
  }

  return updated.replace(/<\/body>/i, `${loaderTag} </body>`);
}

function ensureFooterWidgetLoader(html, relativePath) {
  const hasWidgets = /trustpilot-widget|data-designrush-widget/i.test(html);
  if (!hasWidgets || FOOTER_WIDGET_LOADER_PATTERN.test(html)) return html;

  const loaderTag = getFooterWidgetLoaderTag(html, relativePath);

  if (MAIN_MIN_SCRIPT_PATTERN.test(html)) {
    return html.replace(MAIN_MIN_SCRIPT_PATTERN, (match) => `${loaderTag} ${match}`);
  }

  return html.replace(/<\/body>/i, `${loaderTag} </body>`);
}

/** Inject public site-config (Turnstile sitekey, form mode) before main.min.js once. */
function ensureSiteConfigScript(html, relativePath) {
  const prefix = getRootPrefix(relativePath);
  if (new RegExp(`src="${prefix}js/site-config\\.js"`, 'i').test(html)) return html;
  // Ripara prefissi di profondita errati ereditati da vecchie generazioni (es. ../../js/ in pagine root).
  html = html.replace(
    /src="(?:\.\.\/)+js\/site-config\.js(\?[^"]*)?"/gi,
    `src="${prefix}js/site-config.js$1"`
  );
  if (/js\/site-config\.js/i.test(html)) return html;
  if (!/<script\b[^>]*src="[^"]*js\/main\.min\.js/i.test(html)) return html;
  const tag = `<script src="${prefix}js/site-config.js"></script>`;
  return html.replace(
    /<script\b([^>]*src="[^"]*js\/main\.min\.js[^"]*"[^>]*)><\/script>/i,
    `${tag} <script$1></script>`
  );
}

function normalizeNonCriticalLoader(html, relativePath) {
  // Preserva l'eventuale cache-busting già presente sulla pagina: il loader
  // è versionato insieme a chat/search, riscriverlo senza `?v=` farebbe
  // servire il file vecchio dalla cache dopo un deploy.
  // Una pagina può contenere sia la variante versionata sia quella nuda
  // (generatore geo + cache-bust successivo): vince sempre quella versionata.
  const versionedMatch = /src="[^"]*js\/noncritical-loader(?:\.min)?\.js(\?[^"]*)"/i.exec(html);
  const existingVersion = versionedMatch ? versionedMatch[1] : '';
  const loaderPath = `${getRootPrefix(relativePath)}js/noncritical-loader.min.js${existingVersion}`;
  const loaderTag = `<script defer src="${loaderPath}"></script>`;
  let updated = html;

  for (const pattern of NONCRITICAL_SCRIPT_PATTERNS) {
    updated = updated.replace(pattern, '');
  }

  // Rimuove TUTTE le occorrenze (versionate e non) prima di reinserirne una sola.
  updated = updated.replace(NONCRITICAL_LOADER_GLOBAL_PATTERN, ' ');

  if (MAIN_MIN_SCRIPT_PATTERN.test(updated)) {
    return updated.replace(MAIN_MIN_SCRIPT_PATTERN, (match) => `${match} ${loaderTag} `);
  }

  return updated.replace(/<\/body>/i, `${loaderTag} </body>`);
}

function normalizeWebVitalsReporterRefs(html, relativePath) {
  return html.replace(WEB_VITALS_REPORTER_PATTERN, (match, prefix, version) => `<script defer src="${prefix}js/web-vitals-reporter.min.js${version || ''}"></script>`);
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
  updated = normalizeFooterCanonical(updated, relativePath);
  updated = normalizeNavMenu(updated, relativePath);
  updated = normalizeSocialLinksMarkup(updated);
  updated = normalizeFooterAssetMarkup(updated);
  updated = normalizePhoneCtaMarkup(updated);
  updated = normalizeReviewActionMarkup(updated);
  updated = normalizeTrustpilotBadgeMarkup(updated);
  updated = normalizeEntityJsonLd(updated);
  updated = normalizeImageLoadingInHtml(updated);
  updated = normalizeDesignRushLoader(updated, relativePath);
  updated = normalizeFooterWidgetLoaderRefs(updated, relativePath);
  updated = ensureFooterWidgetLoader(updated, relativePath);
  updated = ensureSiteConfigScript(updated, relativePath);
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
