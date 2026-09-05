const path = require('path');

const PHONE_NUMBER_DISPLAY = '+39 380 264 7367';
const PHONE_NUMBER_TEL = '+393802647367';
const PHONE_TEXT_PATTERN = /(?:\+39(?:\s|&nbsp;)*380(?:\s|&nbsp;)*264(?:\s|&nbsp;)*7367|\+393802647367)/gi;
const PROTECTED_BLOCK_PATTERN = /<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi;
const CODE_BLOCK_PATTERN = /<pre\b[\s\S]*?<\/pre>|<code\b[\s\S]*?<\/code>/gi;
const PHONE_CTA_INNER_PATTERN = /<a\b[^>]*class="phone-cta"[^>]*>[\s\S]*?<\/a>/gi;
const BROKEN_PHONE_CTA_SR_ONLY_PATTERN = /<span class="sr-only">\s*al numero\s*<a\b[^>]*class="phone-cta"[\s\S]*?<\/a>\s*<\/span>/gi;
const LEGACY_PHONE_SR_ONLY_PATTERN = /<span class="sr-only">\s*al numero\s*(?:\+39(?:\s|&nbsp;)*380(?:\s|&nbsp;)*264(?:\s|&nbsp;)*7367|\+393802647367)\s*<\/span>/gi;

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function normalizeRelativePrefix(prefix) {
  if (!prefix || prefix === '.') return '';
  return prefix.endsWith('/') ? prefix : `${prefix}/`;
}

function buildImageTag({ alt, src, width, height, style = '', extraAttributes = '' }) {
  const trimmedStyle = style.trim();
  const styleAttribute = trimmedStyle ? ` style="${escapeAttribute(trimmedStyle)}"` : '';
  const extra = extraAttributes ? ` ${extraAttributes.trim()}` : '';
  return `<img alt="${escapeAttribute(alt)}" decoding="async" height="${height}" src="${escapeAttribute(src)}" width="${width}" fetchpriority="low" loading="lazy"${extra}${styleAttribute}>`;
}

function buildPhoneCtaHtml({ label = 'Chiama WebNovis', title = 'Chiama Web Novis' } = {}) {
  const safeLabel = escapeAttribute(label);
  const safeTitle = escapeAttribute(title);
  const safePhone = escapeAttribute(PHONE_NUMBER_DISPLAY);
  return `<a href="tel:${PHONE_NUMBER_TEL}" title="${safeTitle}" class="phone-cta" aria-label="${safeLabel} al numero ${safePhone}" data-contact-phone="${PHONE_NUMBER_TEL}"><span class="phone-cta-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="phone-cta-label">${safeLabel}</span></a>`;
}

function withProtectedBlocks(html, transform) {
  const protectedBlocks = [];
  const tokenized = html.replace(PROTECTED_BLOCK_PATTERN, (match) => {
    const token = `__WEBNOVIS_BLOCK_${protectedBlocks.length}__`;
    protectedBlocks.push(match);
    return token;
  });

  const transformed = transform(tokenized);
  return transformed.replace(/__WEBNOVIS_BLOCK_(\d+)__/g, (_, index) => protectedBlocks[Number(index)] || '');
}

function replaceVisiblePhoneText(html) {
  return html.replace(/>([^<>]*?(?:\+39(?:\s|&nbsp;)*380(?:\s|&nbsp;)*264(?:\s|&nbsp;)*7367|\+393802647367)[^<>]*?)</gi, (match, textNode) => {
    const updatedTextNode = textNode.replace(PHONE_TEXT_PATTERN, buildPhoneCtaHtml());
    return `>${updatedTextNode}<`;
  });
}

function restorePhoneTextInCodeBlocks(html) {
  return html.replace(CODE_BLOCK_PATTERN, (block) =>
    block
      .replace(PHONE_CTA_INNER_PATTERN, PHONE_NUMBER_DISPLAY)
      .replace(/(?:\+39(?:\s|&nbsp;)*380(?:\s|&nbsp;)*264(?:\s|&nbsp;)*7367|\+393802647367)<\/span><\/a>/gi, PHONE_NUMBER_DISPLAY)
  );
}

function sanitizeBrokenPhoneCtaMarkup(html) {
  return html
    .replace(BROKEN_PHONE_CTA_SR_ONLY_PATTERN, '')
    .replace(LEGACY_PHONE_SR_ONLY_PATTERN, '');
}

function buildThirdPartyReviewBadgesHtml(prefix = '..') {
  const base = normalizeRelativePrefix(prefix);
  const designRushBadge = buildImageTag({
    alt: 'DesignRush',
    src: `${base}Img/designrush-badge.png`,
    width: 80,
    height: 90,
    style: 'display:block'
  });
  const goodFirmsBadge = buildImageTag({
    alt: 'GoodFirms',
    src: `${base}Img/goodfirms-logo.jpeg`,
    width: 80,
    height: 80,
    style: 'display:block;border-radius:4px'
  });
  const maidensailBadge = buildImageTag({
    alt: 'Featured on Maidensail',
    src: 'https://maidensail.com/badge/webnovis.svg?theme=dark',
    width: 190,
    height: 44,
    style: 'display:block'
  });

  // Badge Trustpilot statico: zero JS, zero richieste esterne. Il widget
  // ufficiale falliva spesso al load (HAR 2026-09-05: 8x status 0) lasciando
  // solo il link testuale. Nessun punteggio inventato: solo brand + stelle.
  return `${buildTrustpilotBadgeHtml()}<div class="review-badge" style="padding:0;background:0 0;border:none"><div aria-label="DesignRush agency reviews section" data-agency-id="110524" data-designrush-widget data-style="light"></div><noscript><a href="https://www.designrush.com/agency/profile/web-novis#reviews" target="_blank" aria-label="Visit Web Novis reviews on DesignRush">REVIEW US ON DESIGNRUSH</a></noscript></div><span style="display:inline-flex;align-items:center">${designRushBadge}</span><a href="https://www.goodfirms.co/company/web-novis" target="_blank" rel="noopener noreferrer" aria-label="Web Novis su GoodFirms" style="display:inline-flex;align-items:center"><picture><source srcset="${base}Img/goodfirms-logo.webp" type="image/webp">${goodFirmsBadge}</picture></a> <a href="https://maidensail.com/startup/webnovis" target="_blank" rel="dofollow" title="Featured on Maidensail" aria-label="Featured on Maidensail" class="maidensail-badge" style="display:inline-flex;align-items:center">${maidensailBadge}</a>`;
}

const TRUSTPILOT_WIDGET_PATTERN = /<div class="trustpilot-widget"[\s\S]*?<\/div>/g;

function buildTrustpilotBadgeHtml() {
  const star = (x) => `<g transform="translate(${x} 0)"><rect width="20" height="20" fill="#00b67a"/><path d="M10 3.6l2 4.3 4.7.4-3.6 3.1 1.1 4.6-4.2-2.5-4.2 2.5 1.1-4.6L3.3 8.3l4.7-.4z" fill="#fff"/></g>`;
  return `<a class="trustpilot-badge" href="https://it.trustpilot.com/review/webnovis.com" target="_blank" rel="noopener" aria-label="Recensioni verificate su Trustpilot — Web Novis"><svg viewBox="0 0 108 20" width="108" height="20" aria-hidden="true" focusable="false">${star(0)}${star(22)}${star(44)}${star(66)}${star(88)}</svg><span class="tp-wordmark">Trustpilot</span></a>`;
}

function normalizeTrustpilotBadgeMarkup(html) {
  return String(html).replace(TRUSTPILOT_WIDGET_PATTERN, buildTrustpilotBadgeHtml());
}

const GOOGLE_REVIEW_ACTION_PATTERN = /<a\b(?=[^>]*href=["']https:\/\/g\.page\/r\/CRblKdK0GGO_EBM\/review["'])[^>]*>[\s\S]*?<\/a>/gi;

function buildGoogleReviewActionHtml() {
  return `<a href="https://g.page/r/CRblKdK0GGO_EBM/review" title="Lascia una recensione Google a WebNovis" class="review-badge" aria-label="Lascia una recensione Google a WebNovis" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 48 48" height="18" width="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/><path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"/><path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"/><path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/><path d="M0 0h48v48H0z" fill="none"/></svg><span class="review-badge-text"><span class="review-badge-label">Google</span><span class="review-badge-action">Lascia una recensione</span></span></a>`;
}

function normalizeReviewActionMarkup(html) {
  return String(html).replace(GOOGLE_REVIEW_ACTION_PATTERN, buildGoogleReviewActionHtml());
}

function buildReviewBadgesInnerHtml(prefix = '..') {
  return `${buildGoogleReviewActionHtml()}${buildThirdPartyReviewBadgesHtml(prefix)}`;
}

function buildReviewBadgesHtml(prefix = '..', wrapperClass = 'footer-reviews-badges') {
  return `<div class="${escapeAttribute(wrapperClass)}">${buildReviewBadgesInnerHtml(prefix)}</div>`;
}

const YOUTUBE_FOOTER_LINK = `<a href="https://www.youtube.com/@WebNovis" title="Seguici su YouTube" class="footer-social-link" aria-label="Seguici su YouTube" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg><span>YouTube</span></a>`;

const LINKEDIN_FOOTER_LINK = `<a href="https://www.linkedin.com/company/web-novis/" title="Seguici su LinkedIn" class="footer-social-link" aria-label="Seguici su LinkedIn" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg><span>LinkedIn</span></a>`;

const X_FOOTER_LINK = `<a href="https://x.com/Webnovis" title="Seguici su X (Twitter)" class="footer-social-link" aria-label="Seguici su X (Twitter)" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>X</span></a>`;

function buildPreferredSourceHtml() {
  return `<div class="wn-preferred-source" data-preferred-source><p class="wn-ps-label">Per vedere pi\u00f9 spesso WebNovis nei tuoi risultati di ricerca, aggiungici alle fonti preferite su Google.</p><a class="wn-ps-link" href="https://www.google.com/preferences/source?q=www.webnovis.com" target="_blank" rel="noopener noreferrer">Aggiungi WebNovis alle fonti preferite</a></div>`;
}

// Variante compatta (singola CTA, zero JS) per la parte alta degli
// articoli e per la pagina Blog: stesso link, nessun duplicato.
function buildPreferredSourceArticleHtml() {
  return `<aside class="wn-preferred-source wn-ps-article" data-preferred-source><p class="wn-ps-label">Per vedere pi\u00f9 spesso WebNovis nei tuoi risultati di ricerca.</p><a class="wn-ps-link" href="https://www.google.com/preferences/source?q=www.webnovis.com" target="_blank" rel="noopener noreferrer">Aggiungi WebNovis alle fonti preferite su Google</a></aside>`;
}

function getBlogFooterHtml(prefix = '..') {
  const base = normalizeRelativePrefix(prefix);
  return `<footer class="footer"> <div class="container"> <div class="footer-grid"> <div class="footer-brand"> <a href="${base}index.html" title="Web Novis — Homepage" class="logo"> <picture><source srcset="${base}Img/webnovis-logo-bianco-150.webp 150w, ${base}Img/webnovis-logo-bianco.webp 300w" type="image/webp" sizes="150px"><img alt="Web Novis Logo" decoding="async" height="40" src="${base}Img/webnovis-logo-bianco-300.png" width="150" class="logo-image" loading="lazy" fetchpriority="low"></picture> </a> <p class="footer-tagline">Creiamo esperienze digitali memorabili</p> <address class="footer-nap">Milano e hinterland — operiamo da remoto e sul territorio<br>${buildPhoneCtaHtml()}<br><a href="mailto:hello@webnovis.com" title="Scrivi a Web Novis">hello@webnovis.com</a></address> ${buildPreferredSourceHtml()} <div class="footer-social-icons"> <a href="https://www.instagram.com/web.novis" title="Seguici su Instagram" rel="noopener noreferrer" target="_blank" aria-label="Seguici su Instagram" class="footer-social-link"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span>Instagram</span></a> <a href="https://www.facebook.com/share/1C7hNnkqEU/\" title="Seguici su Facebook" rel="noopener noreferrer" target="_blank" aria-label="Seguici su Facebook" class="footer-social-link"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg><span>Facebook</span></a> ${YOUTUBE_FOOTER_LINK} ${LINKEDIN_FOOTER_LINK} ${X_FOOTER_LINK} </div> </div> <div class="footer-column"> <strong aria-level="3" class="footer-heading" role="heading">Servizi</strong> <a href="${base}servizi/sviluppo-web.html" title="Sviluppo Web — Siti e e-commerce">Web Development</a> <a href="${base}servizi/graphic-design.html" title="Graphic Design e Brand Identity">Graphic Design</a> <a href="${base}servizi/social-media.html" title="Social Media Marketing e Advertising">Social Media</a> <a href="${base}servizi/accessibilita.html" title="Accessibilità Web — Conformità WCAG">Accessibilità EAA</a> </div> <div class="footer-column"> <strong aria-level="3" class="footer-heading" role="heading">Azienda</strong> <a href="${base}chi-siamo.html" title="Chi siamo — Il team Web Novis">Chi Siamo</a> <a href="${base}contatti.html" title="Contatti Web Novis">Contatti</a> <a href="${base}portfolio.html" title="Portfolio progetti Web Novis">Portfolio</a> <a href="${base}blog/" title="Blog Web Novis — Guide e risorse">Blog</a> <a href="${base}come-lavoriamo.html" title="Come lavoriamo — Processo in 5 fasi">Come Lavoriamo</a> <a href="${base}preventivo.html" title="Richiedi preventivo gratuito">Preventivo</a> </div> <div class="footer-column"> <strong aria-level="3" class="footer-heading" role="heading">Zone Servite</strong> <a href="/zone-servite/" title="Zone Servite WebNovis">Tutte le Zone</a> <a href="/agenzia-web/" title="Hub Agenzia Web per Comuni">Agenzia Web per Comuni</a> <a href="/realizzazione-siti-web/" title="Hub Siti Web per Comuni">Siti Web per Comuni</a> </div> <div class="footer-column"> <strong aria-level="3" class="footer-heading" role="heading">Legale</strong> <a href="${base}privacy-policy.html" title="Privacy Policy Web Novis">Privacy Policy</a> <a href="${base}cookie-policy.html" title="Cookie Policy Web Novis">Cookie Policy</a> <a href="${base}termini-condizioni.html" title="Termini e Condizioni Web Novis">Termini e Condizioni</a> </div> </div> <div class="footer-badges"> ${buildReviewBadgesInnerHtml(prefix)} </div> <div class="footer-bottom"> <p>&copy; <time datetime="2026" id="copyrightYear">2026</time> WebNovis. Tutti i diritti riservati.</p> <script>document.getElementById("copyrightYear").textContent=(new Date).getFullYear()</script> </div> </div> </footer>`;
}

function normalizeSocialLinksMarkup(html) {
  let updated = html;
  const ensureLink = (marker, linkHtml) => {
    if (updated.includes(marker)) return;
    updated = updated.replace(
      /(<div\b[^>]*class="footer-social-icons"[^>]*>[\s\S]*?)(<\/div>)/i,
      (match, p1, p2) => `${p1} ${linkHtml} ${p2}`
    );
  };
  ensureLink('youtube.com/@WebNovis', YOUTUBE_FOOTER_LINK);
  ensureLink('linkedin.com/company/web-novis/', LINKEDIN_FOOTER_LINK);
  ensureLink('x.com/Webnovis', X_FOOTER_LINK);
  return updated;
}

function normalizeFooterAssetMarkup(html) {
  let updated = html
    .replace(
      /srcset="((?:\.\.\/)+)Img\/webnovis-logo-bianco-150\.webp 150w,\s*(?:(?:\.\.\/)+)?Img\/webnovis-logo-bianco\.webp 300w"/gi,
      (_, prefix) => `srcset="${prefix}Img/webnovis-logo-bianco-150.webp 150w, ${prefix}Img/webnovis-logo-bianco.webp 300w"`
    )
    .replace(/<img\b[^>]*alt="DesignRush"[^>]*src="([^"]*designrush-badge\.png)"[^>]*>/gi, (_, src) => {
      return buildImageTag({ alt: 'DesignRush', src, width: 80, height: 90, style: 'display:block' });
    })
    .replace(/<img\b[^>]*alt="GoodFirms"[^>]*src="([^"]*goodfirms-logo\.jpeg)"[^>]*>/gi, (_, src) => {
      return buildImageTag({ alt: 'GoodFirms', src, width: 80, height: 80, style: 'display:block;border-radius:4px' });
    });

  const maidensailBadge = buildImageTag({
    alt: 'Featured on Maidensail',
    src: 'https://maidensail.com/badge/webnovis.svg?theme=dark',
    width: 190,
    height: 44,
    style: 'display:block'
  });
  const maidensailLink = `<a href="https://maidensail.com/startup/webnovis" target="_blank" rel="dofollow" title="Featured on Maidensail" aria-label="Featured on Maidensail" class="maidensail-badge" style="display:inline-flex;align-items:center">${maidensailBadge}</a>`;

  const footerBadgesMatch = updated.match(/(<div\b[^>]*class="footer-badges"[^>]*>)([\s\S]*?)(<\/div>\s*(?:<div class="footer-bottom"|<\/div>\s*<\/footer>))/i);
  if (footerBadgesMatch) {
    let inner = footerBadgesMatch[2];
    inner = inner.replace(/<a\b(?=[^>]*href=["']https:\/\/maidensail\.com\/startup\/webnovis["'])[^>]*>[\s\S]*?<\/a>/gi, '').trim();
    inner = `${inner} ${maidensailLink}`;
    updated = updated.replace(footerBadgesMatch[0], `${footerBadgesMatch[1]} ${inner} ${footerBadgesMatch[3]}`);
  }

  // CTA statica fonti-preferite: visibile anche senza JS, una sola istanza
  // per pagina (il loader JS deduplica eventuali residui a runtime).
  if (!updated.includes('wn-preferred-source') && updated.includes('footer-brand')) {
    updated = updated.replace(
      /(<div\b[^>]*class="footer-brand"[^>]*>[\s\S]*?<\/address>)/i,
      (_, brandHead) => `${brandHead} ${buildPreferredSourceHtml()}`
    );
  }

  return updated;
}

function normalizePhoneCtaMarkup(html) {
  return restorePhoneTextInCodeBlocks(
    withProtectedBlocks(html, (safeHtml) =>
      replaceVisiblePhoneText(
        sanitizeBrokenPhoneCtaMarkup(safeHtml)
          .replace(
            /<a\b(?=[^>]*class="phone-cta")(?=[^>]*href="tel:\+393802647367")[^>]*>[\s\S]*?<\/a>/gi,
            buildPhoneCtaHtml()
          )
          .replace(
            /<a\b[^>]*href="tel:\+393802647367"[^>]*>\s*(?:\+39(?:\s|&nbsp;)*380(?:\s|&nbsp;)*264(?:\s|&nbsp;)*7367|\+393802647367)\s*<\/a>/gi,
            buildPhoneCtaHtml()
          )
      )
    )
  );
}

module.exports = {
  buildPreferredSourceArticleHtml,
  buildPreferredSourceHtml,
  buildReviewBadgesHtml,
  getBlogFooterHtml,
  normalizeFooterAssetMarkup,
  normalizePhoneCtaMarkup,
  normalizeReviewActionMarkup,
  normalizeSocialLinksMarkup,
  normalizeTrustpilotBadgeMarkup
};
