const prioritySnippets = require('./priority-snippets');
const { getIndexationDirectivesForPath } = require('./pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const NOINDEX_ROBOTS = 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

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

function applySeoHtmlTransforms(html, relativePath) {
  let updated = html;
  updated = alignPrioritySnippet(updated, relativePath);
  updated = ensureSelfHreflang(updated, relativePath);
  updated = alignRobotsDirectives(updated, relativePath);
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
  applySeoHtmlTransforms
};
