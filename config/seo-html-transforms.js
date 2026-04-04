const prioritySnippets = require('./priority-snippets');
const { getClusterStrategicLinks } = require('./blog-cluster-links');
const { getIndexationDirectivesForPath } = require('./pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const NOINDEX_ROBOTS = 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const HOMEPAGE_HERO_OLD = '<h1 class="hero-title"> <span class="glitch gradient-text" data-text="Agenzia Digitale">Agenzia Digitale</span> che <span class="highlight-gold">Accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> La tua agenzia digitale a Milano per sviluppo web,<br> grafica e crescita della tua visibilità online </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div>';
const HOMEPAGE_CORE_LINKS_PATTERN = /<(?:p|nav) class="hero-core-links"[^>]*>[\s\S]*?<\/(?:p|nav)>/i;
const HOMEPAGE_CORE_LINKS_HTML = '<nav class="hero-core-links" aria-label="Percorsi principali" style="display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem"> <a href="/servizi/sviluppo-web.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Sviluppo Web</a> <a href="/servizi/graphic-design.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Graphic Design</a> <a href="/servizi/social-media.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Social Media</a> </nav>';
const HOMEPAGE_HERO_NEW = `<h1 class="hero-title"> <span class="glitch gradient-text" data-text="WebNovis">WebNovis</span><br> agenzia web a Rho e Milano che <span class="highlight-gold">accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> Siti web custom, e-commerce, branding e SEO locale<br> per PMI e professionisti tra Rho, Milano e hinterland </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div> ${HOMEPAGE_CORE_LINKS_HTML}`;
const STRATEGIC_LINKS_STYLE_BLOCK = '<style data-webnovis-cluster-links>.article-strategic-links{padding:2.4rem 0;border-top:1px solid rgba(255,255,255,.06)}.article-strategic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.35rem}.article-strategic-card{display:block;padding:1.3rem;border-radius:14px;border:1px solid rgba(96,165,250,.18);background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(91,106,174,.08) 100%);text-decoration:none!important;transition:transform .2s ease,border-color .2s ease,background .2s ease}.article-strategic-card:hover{transform:translateY(-2px);border-color:rgba(96,165,250,.35);background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(91,106,174,.13) 100%)}.article-strategic-label{display:inline-flex;margin-bottom:.7rem;padding:.3rem .65rem;border-radius:999px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.18);font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--primary-light)}.article-strategic-card h3{margin:0 0 .5rem;font-size:1rem;color:var(--white)}.article-strategic-card p{margin:0;font-size:.9rem;line-height:1.6;color:var(--text-muted)}</style>';

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
  return html.replace(pattern, (...args) => {
    const captures = args.slice(1, -2);
    const before = captures[0];
    const after = captures[captures.length - 1] || '';
    return `${before}${escapeHtmlAttr(content)}${after}`;
  });
}

function replaceMetaTagContent(html, attrName, attrValue, content) {
  const escapedAttrValue = escapeRegex(attrValue);
  let updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*\\bcontent=")[^"]*("[^>]*>)`, 'i'),
    content
  );

  if (updated !== html) return updated;

  updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\bcontent=")[^"]*("[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*>)`, 'i'),
    content
  );

  return updated;
}

function buildStrategicLinksHtml(strategicLinks) {
  if (!strategicLinks || !Array.isArray(strategicLinks.cards) || !strategicLinks.cards.length) {
    return '';
  }

  return `<section class="article-strategic-links" aria-labelledby="strategic-links-title"> <h2 id="strategic-links-title">${strategicLinks.title || 'Percorsi consigliati'}</h2> <div class="article-strategic-grid"> ${strategicLinks.cards.map((card) => `<a href="${card.href}" class="article-strategic-card"><span class="article-strategic-label">${card.label}</span><h3>${card.title}</h3><p>${card.desc}</p></a>`).join('')} </div> </section>`;
}

function replaceTitleTag(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function ensureSelfHreflang(html, relativePath) {
  const href = toAbsolutePublicUrl(relativePath);
  const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${href}">`;
  const withoutExisting = html.replace(/\s*<link\b[^>]*\bhreflang=["']it-IT["'][^>]*>/gi, '');

  if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(withoutExisting)) {
    return withoutExisting.replace(/(<link\b[^>]*rel=["']canonical["'][^>]*>)/i, `$1 ${hreflangTag}`);
  }

  return withoutExisting.replace(/<\/head>/i, `${hreflangTag}</head>`);
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
  updated = updated.replace(HOMEPAGE_CORE_LINKS_PATTERN, '');
  updated = updated.replace(HOMEPAGE_HERO_OLD, HOMEPAGE_HERO_NEW);
  if (!updated.includes('Percorsi principali')) {
    updated = updated.replace(
      /(<div class="hero-cta">[\s\S]*?<\/div>)(\s*<\/div>\s*<\/div>\s*<\/section>)/i,
      `$1 ${HOMEPAGE_CORE_LINKS_HTML}$2`
    );
  }
  updated = updated.replace(
    '<p class="ai-summary-text"><strong>Web Novis</strong>',
    '<p class="ai-summary-text"><strong>WebNovis</strong>'
  );
  updated = updated.replace(/\s*<link href="https:\/\/www\.designrush\.com" rel="preconnect">\s*/i, ' ');
  return updated;
}

function alignPriorityContentTransforms(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);

  if (normalizedPath === 'blog/quanto-costa-un-ecommerce.html') {
    return html
      .replace(
        /<p><a href="\.\.\/servizi\/sviluppo-web\.html">I nostri pacchetti e-commerce partono da €3\.500 →<\/a><\/p>/,
        '<p><a href="../servizi/ecommerce.html">I nostri pacchetti e-commerce partono da €3.500 →</a></p>'
      )
      .replace(
        /\.\.\/servizi\/sviluppo-web\.html\?utm_source=blog&utm_medium=inline_cta&utm_campaign=quanto-costa-ecommerce/g,
        '../servizi/ecommerce.html?utm_source=blog&utm_medium=inline_cta&utm_campaign=quanto-costa-ecommerce'
      );
  }

  if (normalizedPath === 'blog/instagram-algoritmo-2026.html') {
    return html.replace(
      /<p>WebNovis ha aiutato aziende nel settore industriale[\s\S]*?<\/p>/,
      '<p>WebNovis aiuta PMI e professionisti a trasformare Instagram in un canale più misurabile, con contenuti, rubriche e campagne coerenti con gli obiettivi di lead generation.</p> <section class="article-inline-cta" aria-label="Servizio correlato"> <h3>Vuoi una strategia Instagram più chiara e sostenibile?</h3> <p>Possiamo aiutarti a definire format, calendario editoriale e campagne Meta in base al tuo obiettivo di visibilità o acquisizione contatti.</p> <a href="../servizi/social-media.html?utm_source=blog&utm_medium=inline_cta&utm_campaign=instagram-algoritmo-2026" class="article-inline-link">Scopri il servizio Social Media →</a> </section>'
    );
  }

  return html;
}

function ensureStrategicLinksStyles(html) {
  if (/data-webnovis-cluster-links/i.test(html) || /\.article-strategic-links\{/.test(html)) {
    return html;
  }

  return html.replace(/<\/head>/i, `${STRATEGIC_LINKS_STYLE_BLOCK}</head>`);
}

function alignClusterStrategicLinks(html, relativePath) {
  const strategicLinks = getClusterStrategicLinks(relativePath);
  if (!strategicLinks) return html;

  const strategicLinksHtml = buildStrategicLinksHtml(strategicLinks);
  let updated = ensureStrategicLinksStyles(html);

  if (/<section class="article-strategic-links"[\s\S]*?<\/section>/i.test(updated)) {
    return updated.replace(/<section class="article-strategic-links"[\s\S]*?<\/section>/i, strategicLinksHtml);
  }

  if (/<section class="article-upgrade"/i.test(updated)) {
    return updated.replace(/<section class="article-upgrade"/i, `${strategicLinksHtml} <section class="article-upgrade"`);
  }

  if (/<div class="article-cta"/i.test(updated)) {
    return updated.replace(/<div class="article-cta"/i, `${strategicLinksHtml} <div class="article-cta"`);
  }

  return updated.replace(/<\/article>/i, `${strategicLinksHtml} </article>`);
}

function applySeoHtmlTransforms(html, relativePath) {
  let updated = html;
  updated = alignPrioritySnippet(updated, relativePath);
  updated = alignPriorityContentTransforms(updated, relativePath);
  updated = alignClusterStrategicLinks(updated, relativePath);
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
  alignPriorityContentTransforms,
  alignClusterStrategicLinks,
  alignRobotsDirectives,
  alignHomepageBrandExperience,
  applySeoHtmlTransforms
};
