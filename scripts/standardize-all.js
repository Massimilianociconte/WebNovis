/**
 * Apply the shared footer and a small set of idempotent legacy corrections.
 *
 * Run: node scripts/standardize-all.js
 */
const fs = require('fs');
const path = require('path');
const { getBlogFooterHtml } = require('../config/site-footer');

const ROOT = path.join(__dirname, '..');

function findHtmlFiles(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((item) => item.endsWith('.html') && fs.statSync(path.join(dir, item)).isFile())
    .map((item) => ({ path: path.join(dir, item), rel: `${prefix}${item}` }));
}

const fileGroups = [
  { files: findHtmlFiles(ROOT, ''), prefix: '' },
  { files: findHtmlFiles(path.join(ROOT, 'servizi'), 'servizi/'), prefix: '../' },
  { files: findHtmlFiles(path.join(ROOT, 'portfolio'), 'portfolio/'), prefix: '../' },
  { files: findHtmlFiles(path.join(ROOT, 'portfolio', 'case-study'), 'portfolio/case-study/'), prefix: '../../' },
  { files: findHtmlFiles(path.join(ROOT, 'blog'), 'blog/'), prefix: '../' }
];

const FAQ_FIXES = [
  {
    oldAnswers: [
      "Ogni sito include cookie banner GDPR-compliant con Consent Mode v2, privacy policy e gestione consensi. Per l'accessibilità EAA offriamo audit WCAG 2.1 AA dedicato da €890."
    ],
    newAnswer: "Ogni sito include la struttura base per ospitare la documentazione legale (pagina privacy policy, cookie policy, termini e condizioni) e un cookie banner tecnico con Consent Mode v2. Per documentazione legalmente valida e conforme al GDPR ti consigliamo di rivolgerti a uno studio legale specializzato. Per la conformità EAA offriamo un servizio di audit accessibilità WCAG 2.1 AA dedicato da €290."
  },
  {
    oldAnswers: [
      'Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario è completamente autonoma.',
      'Sì. Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario è completamente autonoma.'
    ],
    newAnswer: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS (pannello di gestione contenuti) non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. In alternativa, le modifiche ai contenuti possono essere gestite dal nostro team con un piano di manutenzione.'
  },
  {
    oldAnswers: [
      'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2. Per la conformità European Accessibility Act (EAA) offriamo audit WCAG 2.1 AA da €890 e adeguamento completo.'
    ],
    newAnswer: 'Ogni sito include la struttura base per ospitare la documentazione legale e un cookie banner tecnico con Consent Mode v2. Per documentazione GDPR legalmente valida rivolgiti a uno studio legale. Per la conformità EAA offriamo audit WCAG 2.1 AA da €290 e adeguamento completo.'
  },
  {
    oldAnswers: [
      'Sì. Forniamo sistema di gestione contenuti intuitivo e sessione di formazione inclusa. Per e-commerce: gestione prodotti, ordini e inventario completamente autonoma.'
    ],
    newAnswer: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. Le modifiche ai contenuti possono anche essere gestite dal nostro team con un piano di manutenzione.'
  }
];

const NEW_PAGES = new Set([
  'servizi/accessibilita.html',
  'agenzia-web-lainate.html',
  'agenzia-web-arese.html',
  'agenzia-web-garbagnate.html',
  'blog/sito-web-che-non-converte.html',
  'blog/sanzioni-sito-non-accessibile-2026.html'
]);

let footerUpdated = 0;
let faqFixed = 0;
let cursorAdded = 0;

for (const group of fileGroups) {
  const canonicalFooter = getBlogFooterHtml(group.prefix);

  for (const file of group.files) {
    let content = fs.readFileSync(file.path, 'utf8');
    let changed = false;

    const footerStart = content.indexOf('<footer');
    const footerEnd = content.indexOf('</footer>');
    if (footerStart !== -1 && footerEnd !== -1) {
      const footerClose = footerEnd + '</footer>'.length;
      const existingFooter = content.slice(footerStart, footerClose);
      if (existingFooter !== canonicalFooter) {
        content = `${content.slice(0, footerStart)}${canonicalFooter}${content.slice(footerClose)}`;
        changed = true;
        footerUpdated += 1;
      }
    }

    for (const fix of FAQ_FIXES) {
      for (const oldAnswer of fix.oldAnswers) {
        if (!content.includes(oldAnswer)) continue;
        content = content.split(oldAnswer).join(fix.newAnswer);
        changed = true;
        faqFixed += 1;
      }
    }

    const isAccessPage = file.rel === 'servizi/accessibilita.html';
    const isPriorityGeo = [
      'agenzia-web-rho.html',
      'agenzia-web-milano.html',
      'agenzia-web-lainate.html',
      'agenzia-web-arese.html',
      'agenzia-web-garbagnate.html'
    ].includes(file.rel);
    const isAccessibilityArticle = file.rel === 'blog/sanzioni-sito-non-accessibile-2026.html';

    if (isAccessPage || isPriorityGeo || isAccessibilityArticle) {
      const beforePrices = content;
      content = content
        .replace(/audit WCAG 2\.1 AA dedicato da €890/g, 'audit WCAG 2.1 AA dedicato da €290')
        .replace(/audit WCAG 2\.1 AA da €890/g, 'audit WCAG 2.1 AA da €290');

      if (isAccessPage || isAccessibilityArticle) {
        content = content
          .replace(/Audit iniziale €890/g, 'Audit iniziale €290')
          .replace(/Audit iniziale<\/td><td[^>]*>€890/g, 'Audit iniziale</td><td style="padding:.75rem">€290')
          .replace(/"audit_iniziale": "€890"/g, '"audit_iniziale": "€290"')
          .replace(/Audit WCAG 2\.1 AA completo<\/td><td[^>]*>Da €890/g, 'Audit WCAG 2.1 AA completo</td><td style="padding:.75rem">Da €290')
          .replace(/Adeguamento completo da €1\.500/g, 'Adeguamento completo da €890')
          .replace(/"adeguamento_completo": "da €1\.500"/g, '"adeguamento_completo": "da €890"');
      }
      if (content !== beforePrices) changed = true;
    }

    if (NEW_PAGES.has(file.rel) && !content.includes('cursor.min.js')) {
      content = content.replace('</body>', `<script src="${group.prefix}js/cursor.min.js" defer></script></body>`);
      changed = true;
      cursorAdded += 1;
    }

    if (changed) fs.writeFileSync(file.path, content, 'utf8');
  }
}

console.log(`✅ Footers standardized: ${footerUpdated} files`);
console.log(`✅ FAQ answers fixed: ${faqFixed} instances`);
console.log(`✅ Cursor.min.js added: ${cursorAdded} files`);
console.log('\n✅ Standardization complete!');
