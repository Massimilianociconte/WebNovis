/**
 * Comprehensive site standardization script:
 * 1. Standardize ALL footers to canonical version (depth-aware paths)
 * 2. Fix wrong FAQ answers on geo pages (GDPR/CMS)
 * 3. Lower accessibility audit prices
 * 4. Add cursor.min.js to pages missing it
 * 
 * Run: node scripts/standardize-all.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ─── CANONICAL FOOTER BUILDER ────────────────────────────────────────
// p = path prefix relative to root (e.g. '' for root, '../' for blog/)
function buildCanonicalFooter(p) {
    const logoSrc = p + 'Img/webnovis-logo-bianco.png';
    const logoHref = p + 'index.html';

    // Servizi links
    const sServizi = p + 'servizi/sviluppo-web.html';
    const sGraphic = p + 'servizi/graphic-design.html';
    const sSocial  = p + 'servizi/social-media.html';
    const sAccess  = p + 'servizi/accessibilita.html';

    // Azienda links
    const aChi      = p + 'chi-siamo.html';
    const aContatti = p + 'contatti.html';
    const aPortfolio= p + 'portfolio.html';
    const aBlog     = p + 'blog/index.html';
    const aCome     = p + 'come-lavoriamo.html';
    const aPreventivo = p + 'preventivo.html';
    const aRho      = p + 'agenzia-web-rho.html';
    const aMilano   = p + 'agenzia-web-milano.html';
    const aLainate  = p + 'agenzia-web-lainate.html';
    const aArese    = p + 'agenzia-web-arese.html';
    const aGarb     = p + 'agenzia-web-garbagnate.html';

    // Legale links
    const lPrivacy  = p + 'privacy-policy.html';
    const lCookie   = p + 'cookie-policy.html';
    const lTermini  = p + 'termini-condizioni.html';

    // DesignRush badge image
    const drImg = p + 'Img/designrush-badge.png';

    return `<footer class="footer"> <div class="container"> <div class="footer-content"> <div class="footer-brand"> <a href="${logoHref}" class="logo"> <img alt="Web Novis Logo" src="${logoSrc}" height="40" width="150" class="logo-image"> </a> <p>Creiamo esperienze digitali memorabili</p> <div class="footer-reviews-badges"><a href="https://g.page/r/CRblKdK0GGO_EBM/review" class="review-badge" aria-label="Recensioni Google di Web Novis" rel="noopener" target="_blank"><svg viewBox="0 0 48 48" height="18" width="18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/><path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"/><path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"/><path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/><path d="M0 0h48v48H0z" fill="none"/></svg><span class="review-badge-text"><span class="review-badge-label">Recensioni</span><span class="review-badge-name">Google</span><span class="review-badge-stars">★★★★★</span></span></a><div class="trustpilot-widget" data-businessunit-id="6994f84c14ed867d2322d2d8" data-locale="it-IT" data-style-height="52px" data-style-width="100%" data-template-id="56278e9abfbbba0bdcd568bc" data-token="ae6e8799-e395-4ec7-88fa-4d532286cc7d"><a href="https://it.trustpilot.com/review/webnovis.com" target="_blank" rel="noopener">Trustpilot</a></div><div class="review-badge" style="padding:0;background:0 0;border:none"><div aria-label="DesignRush agency reviews section" data-agency-id="110524" data-designrush-widget data-style="light"></div><noscript><a href="https://www.designrush.com/agency/profile/web-novis#reviews" target="_blank" aria-label="Visit Web Novis reviews on DesignRush">REVIEW US ON DESIGNRUSH</a></noscript></div><a href="https://www.designrush.com/agency/profile/web-novis" target="_blank" rel="noopener noreferrer" aria-label="Top Web Design Agency on DesignRush" style="display:inline-flex;align-items:center"><img alt="DesignRush" height="auto" src="${drImg}" width="80" loading="lazy" style="display:block"></a></div> </div> <div class="footer-links"> <div class="footer-column"> <h3>Servizi</h3> <a href="${sServizi}">Web Development</a> <a href="${sGraphic}">Graphic Design</a> <a href="${sSocial}">Social Media</a> <a href="${sAccess}">Accessibilità EAA</a> </div> <div class="footer-column"> <h3>Azienda</h3> <a href="${aChi}">Chi Siamo</a> <a href="${aContatti}">Contatti</a> <a href="${aPortfolio}">Portfolio</a> <a href="${aBlog}">Blog</a> <a href="${aCome}">Come Lavoriamo</a> <a href="${aPreventivo}">Preventivo</a> <a href="${aRho}">Web Agency Rho</a> <a href="${aMilano}">Web Agency Milano</a> <a href="${aLainate}">Web Agency Lainate</a> <a href="${aArese}">Web Agency Arese</a> <a href="${aGarb}">Web Agency Garbagnate</a> </div> <div class="footer-column"> <h3>Legale</h3> <a href="${lPrivacy}">Privacy Policy</a> <a href="${lCookie}">Cookie Policy</a> <a href="${lTermini}">Termini e Condizioni</a> </div> <div class="footer-column"> <h3>Social</h3> <a href="https://www.instagram.com/web.novis" class="footer-social-link" aria-label="Seguici su Instagram" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span>Instagram</span></a> <a href="https://www.facebook.com/share/1C7hNnkqEU/" class="footer-social-link" aria-label="Seguici su Facebook" rel="noopener noreferrer" target="_blank"><svg viewBox="0 0 24 24" fill="currentColor" height="18" width="18" aria-hidden="true" style="flex-shrink:0;display:block"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg><span>Facebook</span></a> </div> </div> </div> <div class="footer-bottom"> <p>&copy; <span id="copyrightYear">2026</span> WebNovis. Tutti i diritti riservati.</p> <script>document.getElementById("copyrightYear").textContent=(new Date).getFullYear()</script> </div> </div> </footer>`;
}

// ─── FILE DISCOVERY ──────────────────────────────────────────────────
function findHtmlFiles(dir, prefix) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isFile() && item.endsWith('.html')) {
            results.push({ path: full, rel: prefix + item, prefix });
        }
    }
    return results;
}

// Depth → path prefix mapping
const fileGroups = [
    { files: findHtmlFiles(ROOT, ''),                                               prefix: '' },
    { files: findHtmlFiles(path.join(ROOT, 'servizi'), 'servizi/'),                 prefix: '../' },
    { files: findHtmlFiles(path.join(ROOT, 'portfolio'), 'portfolio/'),             prefix: '../' },
    { files: findHtmlFiles(path.join(ROOT, 'portfolio', 'case-study'), 'portfolio/case-study/'), prefix: '../../' },
    { files: findHtmlFiles(path.join(ROOT, 'blog'), 'blog/'),                       prefix: '../' },
];

// ─── WRONG FAQ CORRECTIONS ───────────────────────────────────────────
// Files that have the wrong GDPR/CMS FAQ answers (geo pages)
const FAQ_FIXES = [
    {
        // Wrong GDPR/EAA FAQ
        oldQ: 'Il sito sarà conforme al GDPR e all\'European Accessibility Act?',
        oldA_patterns: [
            // Various forms this answer appears in
            'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2, privacy policy e gestione consensi. Per l\'accessibilità EAA offriamo audit WCAG 2.1 AA dedicato da €890.',
            'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2, privacy policy e gestione consensi. Per l\'accessibilità EAA offriamo audit WCAG 2.1 AA dedicato da \u20ac890.',
        ],
        newA: 'Ogni sito include la struttura base per ospitare la documentazione legale (pagina privacy policy, cookie policy, termini e condizioni) e un cookie banner tecnico con Consent Mode v2. Per documentazione legalmente valida e conforme al GDPR ti consigliamo di rivolgerti a uno studio legale specializzato. Per la conformità EAA offriamo un servizio di audit accessibilità WCAG 2.1 AA dedicato da €290.',
    },
    {
        // Wrong CMS FAQ
        oldQ: 'Posso gestire il sito in autonomia dopo il lancio?',
        oldA_patterns: [
            'Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario è completamente autonoma.',
            'S\u00ec. Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario \u00e8 completamente autonoma.',
        ],
        newA: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS (pannello di gestione contenuti) non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. In alternativa, le modifiche ai contenuti possono essere gestite dal nostro team con un piano di manutenzione.',
    },
    {
        // Same GDPR FAQ but with slightly different wording from expand-faqs.js
        oldQ: 'Il sito sarà conforme al GDPR e all\'EAA?',
        oldA_patterns: [
            'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2. Per la conformità European Accessibility Act (EAA) offriamo audit WCAG 2.1 AA da €890 e adeguamento completo.',
        ],
        newA: 'Ogni sito include la struttura base per ospitare la documentazione legale e un cookie banner tecnico con Consent Mode v2. Per documentazione GDPR legalmente valida rivolgiti a uno studio legale. Per la conformità EAA offriamo audit WCAG 2.1 AA da €290 e adeguamento completo.',
    },
    {
        // Same CMS FAQ but with slightly different wording from expand-faqs.js
        oldQ: 'Posso aggiornare i contenuti del sito autonomamente?',
        oldA_patterns: [
            'Sì. Forniamo sistema di gestione contenuti intuitivo e sessione di formazione inclusa. Per e-commerce: gestione prodotti, ordini e inventario completamente autonoma.',
        ],
        newA: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. Le modifiche ai contenuti possono anche essere gestite dal nostro team con un piano di manutenzione.',
    },
];

// ─── ACCESSIBILITY PRICE FIXES ───────────────────────────────────────
const PRICE_FIXES = [
    // In HTML content and FAQ answers
    { old: '€890', new: '€290', context: 'audit' },
    { old: '\u20ac890', new: '\u20ac290', context: 'audit' },
    // Adeguamento price
    { old: 'da €1.500', new: 'da €890', context: 'adeguamento' },
    { old: 'da \u20ac1.500', new: 'da \u20ac890', context: 'adeguamento' },
];

// ─── CURSOR CHECK ────────────────────────────────────────────────────
// Pages that should have cursor.min.js but might not
const NEW_PAGES = [
    'servizi/accessibilita.html',
    'agenzia-web-lainate.html',
    'agenzia-web-arese.html',
    'agenzia-web-garbagnate.html',
    'blog/sito-web-che-non-converte.html',
    'blog/sanzioni-sito-non-accessibile-2026.html',
];

// ─── PROCESS FILES ───────────────────────────────────────────────────
let footerUpdated = 0;
let faqFixed = 0;
let cursorAdded = 0;

for (const group of fileGroups) {
    const canonicalFooter = buildCanonicalFooter(group.prefix);

    for (const file of group.files) {
        let content = fs.readFileSync(file.path, 'utf8');
        let changed = false;

        // 1. Replace footer
        const footerStart = content.indexOf('<footer');
        const footerEnd = content.indexOf('</footer>');
        if (footerStart !== -1 && footerEnd !== -1) {
            const existingFooter = content.substring(footerStart, footerEnd + '</footer>'.length);
            if (existingFooter !== canonicalFooter) {
                content = content.substring(0, footerStart) + canonicalFooter + content.substring(footerEnd + '</footer>'.length);
                changed = true;
                footerUpdated++;
            }
        }

        // 2. Fix wrong FAQ answers (only on geo pages and service pages)
        for (const fix of FAQ_FIXES) {
            for (const oldA of fix.oldA_patterns) {
                // Match in <details> FAQ items - look for the answer text
                if (content.includes(oldA)) {
                    content = content.split(oldA).join(fix.newA);
                    changed = true;
                    faqFixed++;
                }
            }
        }

        // 3. Fix accessibility prices - ONLY in accessibilita.html and geo pages
        // Don't touch prices in blog articles (they have their own content)
        const isAccessPage = file.rel === 'servizi/accessibilita.html';
        const isGeoPage = ['agenzia-web-rho.html', 'agenzia-web-milano.html', 'agenzia-web-lainate.html', 'agenzia-web-arese.html', 'agenzia-web-garbagnate.html'].includes(file.rel);
        const isBlogSanzioni = file.rel === 'blog/sanzioni-sito-non-accessibile-2026.html';
        
        if (isAccessPage || isGeoPage || isBlogSanzioni) {
            // Fix audit price €890 → €290 (but NOT adeguamento €1.500 → €890 on geo pages, only on accessibilita)
            if (content.includes('audit WCAG 2.1 AA dedicato da €890') || content.includes('audit WCAG 2.1 AA da €890')) {
                content = content.replace(/audit WCAG 2\.1 AA dedicato da €890/g, 'audit WCAG 2.1 AA dedicato da €290');
                content = content.replace(/audit WCAG 2\.1 AA da €890/g, 'audit WCAG 2.1 AA da €290');
                changed = true;
            }
            if (isAccessPage || isBlogSanzioni) {
                // Full price table replacement on accessibilita page and blog article
                content = content.replace(/Audit iniziale €890/g, 'Audit iniziale €290');
                content = content.replace(/Audit iniziale<\/td><td[^>]*>€890/g, 'Audit iniziale</td><td style="padding:.75rem">€290');
                content = content.replace(/audit_iniziale.*?€890/g, 'audit_iniziale": "€290');
                content = content.replace(/"audit_iniziale": "€890"/g, '"audit_iniziale": "€290"');
                content = content.replace(/Audit WCAG 2\.1 AA completo<\/td><td[^>]*>Da €890/g, 'Audit WCAG 2.1 AA completo</td><td style="padding:.75rem">Da €290');
                content = content.replace(/Da €890/g, 'Da €290');
                content = content.replace(/da €890/g, 'da €290');
                // Adeguamento: €1.500 → €890
                content = content.replace(/da €1\.500/g, 'da €890');
                content = content.replace(/€1\.500-3\.000/g, '€890-2.500');
                content = content.replace(/€3\.000-8\.000/g, '€2.000-6.000');
                content = content.replace(/Adeguamento completo da €1\.500/g, 'Adeguamento completo da €890');
                content = content.replace(/"adeguamento_completo": "da €1\.500"/g, '"adeguamento_completo": "da €890"');
                changed = true;
            }
        }

        // 4. Add cursor.min.js if missing (for new pages)
        if (NEW_PAGES.includes(file.rel) && !content.includes('cursor.min.js')) {
            // Add before </body>
            const prefix = group.prefix;
            content = content.replace('</body>', `<script src="${prefix}js/cursor.min.js" defer></script></body>`);
            changed = true;
            cursorAdded++;
        }

        if (changed) {
            fs.writeFileSync(file.path, content, 'utf8');
        }
    }
}

console.log(`✅ Footers standardized: ${footerUpdated} files`);
console.log(`✅ FAQ answers fixed: ${faqFixed} instances`);
console.log(`✅ Cursor.min.js added: ${cursorAdded} files`);
console.log('\n✅ Standardization complete!');
