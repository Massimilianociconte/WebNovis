/**
 * Fix FAQPage JSON-LD schemas on geo pages to match corrected HTML FAQ answers
 * Also fix any remaining €890 audit prices in FAQ schema text
 * Run: node scripts/fix-faq-schemas.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const PAGES = [
    'agenzia-web-rho.html',
    'agenzia-web-milano.html',
];

// The corrected FAQ answers (must match what's in the HTML <details> elements)
const CORRECTED_ANSWERS = {
    'Il sito sarà conforme al GDPR e all\'European Accessibility Act?':
        'Ogni sito include la struttura base per ospitare la documentazione legale (pagina privacy policy, cookie policy, termini e condizioni) e un cookie banner tecnico con Consent Mode v2. Per documentazione legalmente valida e conforme al GDPR ti consigliamo di rivolgerti a uno studio legale specializzato. Per la conformità EAA offriamo un servizio di audit accessibilità WCAG 2.1 AA dedicato da €290.',
    'Posso gestire il sito in autonomia dopo il lancio?':
        'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS (pannello di gestione contenuti) non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. In alternativa, le modifiche ai contenuti possono essere gestite dal nostro team con un piano di manutenzione.',
    'Il sito sarà conforme al GDPR e all\'EAA?':
        'Ogni sito include la struttura base per ospitare la documentazione legale e un cookie banner tecnico con Consent Mode v2. Per documentazione GDPR legalmente valida rivolgiti a uno studio legale. Per la conformità EAA offriamo audit WCAG 2.1 AA da €290 e adeguamento completo.',
    'Posso aggiornare i contenuti del sito autonomamente?':
        'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. Le modifiche ai contenuti possono anche essere gestite dal nostro team con un piano di manutenzione.',
};

// Old answers to replace in JSON-LD
const OLD_ANSWERS_IN_SCHEMA = [
    {
        old: 'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2, privacy policy e gestione consensi. Per l\'accessibilità EAA offriamo audit WCAG 2.1 AA dedicato da €890.',
        new: 'Ogni sito include la struttura base per ospitare la documentazione legale (pagina privacy policy, cookie policy, termini e condizioni) e un cookie banner tecnico con Consent Mode v2. Per documentazione legalmente valida e conforme al GDPR ti consigliamo di rivolgerti a uno studio legale specializzato. Per la conformità EAA offriamo un servizio di audit accessibilità WCAG 2.1 AA dedicato da €290.',
    },
    {
        old: 'Sì. Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario è completamente autonoma.',
        new: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS (pannello di gestione contenuti) non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. In alternativa, le modifiche ai contenuti possono essere gestite dal nostro team con un piano di manutenzione.',
    },
    {
        old: 'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2. Per la conformità European Accessibility Act (EAA) offriamo audit WCAG 2.1 AA da €890 e adeguamento completo.',
        new: 'Ogni sito include la struttura base per ospitare la documentazione legale e un cookie banner tecnico con Consent Mode v2. Per documentazione GDPR legalmente valida rivolgiti a uno studio legale. Per la conformità EAA offriamo audit WCAG 2.1 AA da €290 e adeguamento completo.',
    },
    {
        old: 'Sì. Forniamo sistema di gestione contenuti intuitivo e sessione di formazione inclusa. Per e-commerce: gestione prodotti, ordini e inventario completamente autonoma.',
        new: 'Per i siti e-commerce la gestione di prodotti, ordini e inventario è completamente autonoma e inclusa. Per siti vetrina e landing page, un CMS non è incluso di default ma è integrabile come plugin aggiuntivo a partire da €400. Le modifiche ai contenuti possono anche essere gestite dal nostro team con un piano di manutenzione.',
    },
    // Also catch any remaining €890 audit references in schema text
    {
        old: 'audit WCAG 2.1 AA dedicato da €890',
        new: 'audit WCAG 2.1 AA dedicato da €290',
    },
    {
        old: 'audit WCAG 2.1 AA da €890',
        new: 'audit WCAG 2.1 AA da €290',
    },
];

let totalFixed = 0;

for (const rel of PAGES) {
    const filePath = path.join(ROOT, rel);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    for (const fix of OLD_ANSWERS_IN_SCHEMA) {
        if (content.includes(fix.old)) {
            content = content.split(fix.old).join(fix.new);
            changed = true;
            totalFixed++;
            console.log(`  Fixed in ${rel}: "${fix.old.substring(0, 60)}..."`);
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${rel}`);
    } else {
        console.log(`⏭️  No schema changes needed: ${rel}`);
    }
}

console.log(`\n✅ Schema fixes complete: ${totalFixed} replacements`);
