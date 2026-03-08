const path = require('path');

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

function buildReviewBadgesHtml(prefix = '..') {
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

  return `<div class="footer-reviews-badges"><a href="https://g.page/r/CRblKdK0GGO_EBM/review" class="review-badge" aria-label="Recensioni Google di Web Novis" rel="noopener" target="_blank"><svg viewBox="0 0 48 48" height="18" width="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/><path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"/><path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"/><path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/><path d="M0 0h48v48H0z" fill="none"/></svg><span class="review-badge-text"><span class="review-badge-label">Recensioni</span><span class="review-badge-name">Google</span><span class="review-badge-stars">★★★★★</span></span></a><div class="trustpilot-widget" data-businessunit-id="6994f84c14ed867d2322d2d8" data-locale="it-IT" data-style-height="52px" data-style-width="100%" data-template-id="56278e9abfbbba0bdcd568bc" data-token="ae6e8799-e395-4ec7-88fa-4d532286cc7d"><a href="https://it.trustpilot.com/review/webnovis.com" target="_blank" rel="noopener">Trustpilot</a></div><div class="review-badge" style="padding:0;background:0 0;border:none"><div aria-label="DesignRush agency reviews section" data-agency-id="110524" data-designrush-widget data-style="light"></div><noscript><a href="https://www.designrush.com/agency/profile/web-novis#reviews" target="_blank" aria-label="Visit Web Novis reviews on DesignRush">REVIEW US ON DESIGNRUSH</a></noscript></div><span style="display:inline-flex;align-items:center">${designRushBadge}</span><a href="https://www.goodfirms.co/company/web-novis" target="_blank" rel="noopener noreferrer" aria-label="Web Novis su GoodFirms" style="display:inline-flex;align-items:center"><picture><source srcset="${base}Img/goodfirms-logo.webp" type="image/webp">${goodFirmsBadge}</picture></a></div>`;
}

function getBlogFooterHtml(prefix = '..') {
  const base = normalizeRelativePrefix(prefix);
  return `<footer class="footer"> <div class="container"> <div class="footer-content"> <div class="footer-brand"> <a href="${base}index.html" class="logo"> <img alt="Web Novis Logo" src="${base}Img/webnovis-logo-bianco.png" height="40" width="150" class="logo-image"> </a> <p>Creiamo esperienze digitali memorabili</p> ${buildReviewBadgesHtml(prefix)} </div> <div class="footer-links"> <div class="footer-column"> <strong class="footer-heading" role="heading" aria-level="3">Servizi</strong> <a href="${base}servizi/sviluppo-web.html">Web Development</a> <a href="${base}servizi/graphic-design.html">Graphic Design</a> <a href="${base}servizi/social-media.html">Social Media</a> <a href="${base}servizi/accessibilita.html">Accessibilità EAA</a> </div> <div class="footer-column"> <strong class="footer-heading" role="heading" aria-level="3">Azienda</strong> <a href="${base}chi-siamo.html">Chi Siamo</a> <a href="${base}contatti.html">Contatti</a> <a href="${base}portfolio.html">Portfolio</a> <a href="index.html">Blog</a> <a href="${base}come-lavoriamo.html">Come Lavoriamo</a> <a href="${base}preventivo.html">Preventivo</a> </div> <div class="footer-column"> <strong class="footer-heading" role="heading" aria-level="3">Legale</strong> <a href="${base}privacy-policy.html">Privacy Policy</a> <a href="${base}cookie-policy.html">Cookie Policy</a> <a href="${base}termini-condizioni.html">Termini e Condizioni</a> </div> <div class="footer-column"> <strong class="footer-heading" role="heading" aria-level="3">Social</strong> <a href="https://www.instagram.com/web.novis" class="footer-social-link" aria-label="Seguici su Instagram" rel="noopener noreferrer" target="_blank"> <svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"> <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> </svg> <span>Instagram</span> </a> <a href="https://www.facebook.com/share/1C7hNnkqEU/" class="footer-social-link" aria-label="Seguici su Facebook" rel="noopener noreferrer" target="_blank"> <svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"> <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/> </svg> <span>Facebook</span> </a> </div> </div> </div> <div class="footer-bottom"> <p>&copy; <span id="copyrightYear">2026</span> WebNovis. Tutti i diritti riservati.</p> <script>document.getElementById("copyrightYear").textContent=(new Date).getFullYear()</script> </div> </div> </footer>`;
}

function normalizeFooterAssetMarkup(html) {
  return html
    .replace(/<img\b[^>]*alt="DesignRush"[^>]*src="([^"]*designrush-badge\.png)"[^>]*>/gi, (_, src) => {
      return buildImageTag({ alt: 'DesignRush', src, width: 80, height: 90, style: 'display:block' });
    })
    .replace(/<img\b[^>]*alt="GoodFirms"[^>]*src="([^"]*goodfirms-logo\.jpeg)"[^>]*>/gi, (_, src) => {
      return buildImageTag({ alt: 'GoodFirms', src, width: 80, height: 80, style: 'display:block;border-radius:4px' });
    });
}

module.exports = {
  buildReviewBadgesHtml,
  getBlogFooterHtml,
  normalizeFooterAssetMarkup
};
