/**
 * Expand FAQ sections on existing Rho and Milano geo pages to 12+ FAQs
 * Also updates the FAQPage schema in JSON-LD
 * Run: node scripts/expand-faqs.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// New FAQs to add to Rho page (currently has 7, need 12+)
const rhoNewFaqs = [
    { q: 'Offrite piani di manutenzione per i siti web?', a: 'Sì. Ogni progetto include 30 giorni di supporto gratuito. Successivamente offriamo piani di manutenzione da €59/mese con aggiornamenti, backup automatici, monitoraggio performance e interventi prioritari.' },
    { q: 'Il sito sarà ottimizzato per Google e i motori di ricerca?', a: 'Ogni sito WebNovis include SEO tecnica integrata: struttura HTML semantica, meta tag ottimizzati, Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1), sitemap XML, robots.txt e dati strutturati JSON-LD.' },
    { q: 'Potete realizzare un e-commerce per un negozio di Rho?', a: 'Sì. Realizziamo e-commerce custom senza commissioni sulle vendite, catalogo illimitato, pagamenti sicuri (Stripe, PayPal), gestione autonoma e spedizioni integrate. Ideale per il commercio rhodense.' },
    { q: 'Il sito sarà conforme al GDPR e all\'European Accessibility Act?', a: 'Sì. Ogni sito include cookie banner GDPR-compliant con Consent Mode v2, privacy policy e gestione consensi. Per l\'accessibilità EAA offriamo audit WCAG 2.1 AA dedicato da €890.' },
    { q: 'Posso gestire il sito in autonomia dopo il lancio?', a: 'Sì. Forniamo un pannello di gestione contenuti semplice e formazione inclusa nel progetto. Per i siti e-commerce, la gestione prodotti, ordini e inventario è completamente autonoma.' },
    { q: 'Realizzate anche logo e brand identity per aziende di Rho?', a: 'Sì. Offriamo logo design (da €400), brand identity completa (da €1.500) e coordinato aziendale per imprese rhodensi. Il branding viene integrato nel design del sito per massima coerenza.' }
];

// New FAQs to add to Milano page (need to check current count first)
const milanoNewFaqs = [
    { q: 'Offrite piani di manutenzione e aggiornamento?', a: '30 giorni di supporto gratuito inclusi. Piani di manutenzione da €59/mese con backup, aggiornamenti, monitoraggio Core Web Vitals e interventi prioritari entro 2 ore lavorative.' },
    { q: 'Il sito includerà SEO tecnica ottimizzata?', a: 'Ogni sito WebNovis include SEO tecnica nativa: struttura semantica, meta tag, Core Web Vitals ottimizzati, sitemap XML, dati strutturati JSON-LD e compatibilità con Google AI Overviews.' },
    { q: 'Realizzate e-commerce per negozi e brand milanesi?', a: 'Sì. E-commerce custom senza commissioni, catalogo illimitato, checkout ottimizzato, pagamenti sicuri (Stripe, PayPal) e gestione ordini autonoma. Da €3.500.' },
    { q: 'Il sito sarà conforme al GDPR e all\'EAA?', a: 'Ogni sito include cookie banner GDPR-compliant con Consent Mode v2. Per la conformità European Accessibility Act (EAA) offriamo audit WCAG 2.1 AA da €890 e adeguamento completo.' },
    { q: 'Posso aggiornare i contenuti del sito autonomamente?', a: 'Sì. Forniamo sistema di gestione contenuti intuitivo e sessione di formazione inclusa. Per e-commerce: gestione prodotti, ordini e inventario completamente autonoma.' }
];

function addFaqsToPage(filePath, newFaqs, pageName) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if these FAQs are already present
    if (content.includes(newFaqs[0].q)) {
        console.log(`⏭️ FAQs already expanded: ${pageName}`);
        return;
    }
    
    // 1. Add HTML FAQ items before the closing </div></section> of the FAQ section
    // Find the last </details> in the FAQ section
    const lastDetailsIndex = content.lastIndexOf('</details> </div>');
    if (lastDetailsIndex === -1) {
        // Try alternate pattern
        const altIndex = content.lastIndexOf('</details></div>');
        if (altIndex === -1) {
            console.log(`⚠️ Could not find FAQ section end in: ${pageName}`);
            return;
        }
    }
    
    const faqHtmlItems = newFaqs.map(f => 
        `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`
    ).join(' ');
    
    // Insert after the last </details> before the FAQ section's closing div
    // Find the position: last occurrence of "</details>" that's before "</div>\n</section>"
    // In minified HTML, it's "</details> </div>"
    const insertPoint = content.lastIndexOf('</details> </div>');
    if (insertPoint > -1) {
        content = content.substring(0, insertPoint + '</details>'.length) + ' ' + faqHtmlItems + content.substring(insertPoint + '</details>'.length);
    } else {
        const altPoint = content.lastIndexOf('</details></div>');
        if (altPoint > -1) {
            content = content.substring(0, altPoint + '</details>'.length) + ' ' + faqHtmlItems + content.substring(altPoint + '</details>'.length);
        }
    }
    
    // 2. Add to FAQPage JSON-LD schema
    const faqSchemaItems = newFaqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]*>/g, '') }
    }));
    
    // Find the end of the FAQPage mainEntity array
    // Pattern: the last ] before "}" that closes FAQPage
    const faqPageIndex = content.indexOf('"@type": "FAQPage"');
    if (faqPageIndex === -1) {
        const faqPageIndex2 = content.indexOf('"@type":"FAQPage"');
        if (faqPageIndex2 === -1) {
            console.log(`⚠️ Could not find FAQPage schema in: ${pageName}`);
        }
    }
    
    // Find the closing of mainEntity array - search for the pattern ]} </script> after FAQPage
    // This is tricky in minified HTML. Let's find the FAQPage script block and modify it.
    const faqScriptStart = content.lastIndexOf('"FAQPage"');
    if (faqScriptStart > -1) {
        // Find the closing ]} of mainEntity
        const searchFrom = faqScriptStart;
        const closingBracket = content.indexOf(']\n}', searchFrom);
        const closingBracketMinified = content.indexOf(']}', searchFrom);
        
        let insertSchemaAt = -1;
        if (closingBracket > -1 && closingBracket < searchFrom + 5000) {
            insertSchemaAt = closingBracket;
        } else if (closingBracketMinified > -1 && closingBracketMinified < searchFrom + 10000) {
            insertSchemaAt = closingBracketMinified;
        }
        
        if (insertSchemaAt > -1) {
            const newSchemaJson = faqSchemaItems.map(item => ',\n        ' + JSON.stringify(item)).join('');
            content = content.substring(0, insertSchemaAt) + newSchemaJson + content.substring(insertSchemaAt);
        }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Expanded FAQs: ${pageName} (+${newFaqs.length} FAQs)`);
}

// Process Rho page
addFaqsToPage(path.join(ROOT, 'agenzia-web-rho.html'), rhoNewFaqs, 'agenzia-web-rho.html');

// Process Milano page
addFaqsToPage(path.join(ROOT, 'agenzia-web-milano.html'), milanoNewFaqs, 'agenzia-web-milano.html');

console.log('\n✅ FAQ expansion complete');
