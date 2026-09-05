/**
 * WebNovis — Canonical site header/navigation (single source of truth).
 *
 * Mirrors config/site-footer.js: the nav menu is duplicated inline in every
 * static HTML page, so this module generates the canonical <ul class="nav-menu">
 * block with the correct relative prefix for the page depth, and the
 * standardize-header.js / normalize-public-html.js scripts propagate it.
 *
 * Canonical items (desktop + mobile, every page):
 *   Servizi · Portfolio · Chi Siamo · Come Lavoriamo · Blog · Contatti · [Preventivo CTA]
 */

function normalizeRelativePrefix(prefix) {
  if (!prefix || prefix === '.') return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
}

function getNavMenuHtml(prefix = '') {
  const base = normalizeRelativePrefix(prefix);
  return `<ul class="nav-menu" id="navMenu"> <li><a href="${base}servizi/" title="Scopri i servizi Web Novis" class="nav-link">Servizi</a></li> <li><a href="${base}portfolio.html" title="Portfolio progetti realizzati" class="nav-link">Portfolio</a></li> <li><a href="${base}chi-siamo.html" title="Chi siamo — Il team Web Novis" class="nav-link">Chi Siamo</a></li> <li><a href="${base}come-lavoriamo.html" title="Come lavoriamo — Processo in 5 fasi" class="nav-link">Come Lavoriamo</a></li> <li><a href="${base}blog/" title="Blog Web Novis — Guide e risorse" class="nav-link">Blog</a></li> <li><a href="${base}contatti.html" title="Contattaci per un preventivo" class="nav-link">Contatti</a></li> <li><a href="${base}preventivo.html" title="Richiedi preventivo gratuito" class="nav-link nav-cta">Richiedi Preventivo</a></li> </ul>`;
}

const NAV_MENU_PATTERN = /<ul class="nav-menu" id="navMenu">[\s\S]*?<\/ul>/;

function normalizeNavMenuMarkup(html, prefix = '') {
  if (!NAV_MENU_PATTERN.test(html)) return html;
  return html.replace(NAV_MENU_PATTERN, getNavMenuHtml(prefix));
}

module.exports = {
  NAV_MENU_PATTERN,
  getNavMenuHtml,
  normalizeNavMenuMarkup
};
