const prioritySnippets = require('./priority-snippets');
const { getIndexationDirectivesForPath } = require('./pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const NOINDEX_ROBOTS = 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const HOMEPAGE_HERO_OLD = '<h1 class="hero-title"> <span class="glitch gradient-text" data-text="Agenzia Digitale">Agenzia Digitale</span> che <span class="highlight-gold">Accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> La tua agenzia digitale a Milano per sviluppo web,<br> grafica e crescita della tua visibilità online </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div>';
const HOMEPAGE_CORE_LINKS_NEW = '<nav class="hero-core-links" aria-label="Percorsi principali"> <span class="hero-core-links-label">Percorsi Principali</span> <a href="servizi/" title="Servizi WebNovis" class="hero-core-link">Servizi</a> <a href="portfolio.html" title="Portfolio WebNovis" class="hero-core-link">Portfolio</a> <a href="chi-siamo.html" title="Chi siamo WebNovis" class="hero-core-link">Chi Siamo</a> <a href="blog/" title="Blog WebNovis" class="hero-core-link">Blog</a> <a href="contatti.html" title="Contatti WebNovis" class="hero-core-link">Contatti</a> </nav>';
const HOMEPAGE_CORE_LINKS_PATTERN = /<(?:p|nav) class="hero-core-links"[^>]*>[\s\S]*?<\/(?:p|nav)>/i;
const HOMEPAGE_HERO_NEW = '<h1 class="hero-title"> <span class="glitch gradient-text" data-text="WebNovis">WebNovis</span><br> agenzia web a Rho e Milano che <span class="highlight-gold">accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> Siti web custom, e-commerce, branding e SEO locale<br> per PMI e professionisti tra Rho, Milano e hinterland </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div> ' + HOMEPAGE_CORE_LINKS_NEW;

function normalizeRelativePath(relativePath = '') {
  return String(relativePath || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toPublicUrlPath(relativePath = '') {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized || normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    return `/${normalized.replace(/index\.html$/, '')}`;
  }
  return `/${normalized}`;
}

function toAbsolutePublicUrl(relativePath = '') {
  const publicPath = toPublicUrlPath(relativePath);
  return publicPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${publicPath}`;
}

function replaceTagContent(html, pattern, content) {
  return html.replace(pattern, (match, before, after = '') => `${before}${escapeHtmlAttr(content)}${after}`);
}

function replaceMetaTagContent(html, attrName, attrValue, content) {
  const escapedAttrValue = escapeRegex(attrValue);
  let updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\b${attrName}=["']${escapedAttrValue}["'][^>]*\\bcontent=["'])[^"']*(["'][^>]*>)`, 'i'),
    content
  );

  if (updated !== html) return updated;

  updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\bcontent=["'])[^"']*(["'][^>]*\\b${attrName}=["']${escapedAttrValue}["'][^>]*>)`, 'i'),
    content
  );

  return updated;
}

function replaceTitleTag(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function ensureSelfHreflang(html, relativePath) {
  if (html.includes('hreflang="it-IT"')) return html;

  const href = toAbsolutePublicUrl(relativePath);
  const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${href}">`;

  if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/(<link\b[^>]*rel=["']canonical["'][^>]*>)/i, `$1 ${hreflangTag}`);
  }

  return html.replace(/<\/head>/i, `${hreflangTag}</head>`);
}

function alignPrioritySnippet(html, relativePath) {
  const snippet = prioritySnippets[normalizeRelativePath(relativePath)];
  if (!snippet) return html;

  let updated = replaceTitleTag(html, snippet.title);
  updated = replaceMetaTagContent(updated, 'name', 'description', snippet.description);
  updated = replaceMetaTagContent(updated, 'property', 'og:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'property', 'og:description', snippet.description);
  updated = replaceMetaTagContent(updated, 'name', 'twitter:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'name', 'twitter:description', snippet.description);
  updated = replaceMetaTagContent(updated, 'property', 'twitter:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'property', 'twitter:description', snippet.description);
  return updated;
}

function alignRobotsDirectives(html, relativePath) {
  const publicPath = toPublicUrlPath(relativePath);
  if (getIndexationDirectivesForPath(publicPath) !== 'noindex, follow') return html;
  return replaceMetaTagContent(html, 'name', 'robots', NOINDEX_ROBOTS);
}

function alignHomepageBrandExperience(html, relativePath) {
  if (normalizeRelativePath(relativePath) !== 'index.html') return html;

  let updated = html;
  updated = updated.replace(HOMEPAGE_HERO_OLD, HOMEPAGE_HERO_NEW);
  updated = updated.replace(HOMEPAGE_CORE_LINKS_PATTERN, HOMEPAGE_CORE_LINKS_NEW);
  updated = updated.replace(
    '<p class="ai-summary-text"><strong>Web Novis</strong>',
    '<p class="ai-summary-text"><strong>WebNovis</strong>'
  );
  updated = updated.replace(/\s*<link href="https:\/\/www\.designrush\.com" rel="preconnect">\s*/i, ' ');
  return updated;
}

function applySeoHtmlTransforms(html, relativePath) {
  let updated = html;
  updated = alignPrioritySnippet(updated, relativePath);
  updated = ensureSelfHreflang(updated, relativePath);
  updated = alignRobotsDirectives(updated, relativePath);
  updated = alignHomepageBrandExperience(updated, relativePath);
  return updated;
}

module.exports = {
  BASE_URL,
  NOINDEX_ROBOTS,
  normalizeRelativePath,
  toPublicUrlPath,
  toAbsolutePublicUrl,
  ensureSelfHreflang,
  alignPrioritySnippet,
  alignRobotsDirectives,
  alignHomepageBrandExperience,
  applySeoHtmlTransforms
};
