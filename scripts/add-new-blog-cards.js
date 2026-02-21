const fs = require('fs');
const path = require('path');

// The 30 new articles to add to blog/index.html
const newArticles = [
  { slug: 'quanto-costa-un-logo', title: 'Quanto Costa un Logo Professionale nel 2026?', tag: 'Pricing', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Prezzi reali per la creazione di un logo: dal freelance all\'agenzia. Cosa influenza il costo e come scegliere.' },
  { slug: 'quanto-costa-una-landing-page', title: 'Quanto Costa una Landing Page nel 2026?', tag: 'Pricing', date: '20 Febbraio 2026', readTime: '7 min', desc: 'Costi reali per una landing page professionale: template vs custom, cosa include il prezzo e ROI atteso.' },
  { slug: 'quanto-costa-gestione-social-media', title: 'Quanto Costa la Gestione Social Media nel 2026?', tag: 'Pricing', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Prezzi reali per la gestione social: pacchetti, cosa include, ROI atteso per PMI e attività locali.' },
  { slug: 'quanto-costa-campagna-facebook-ads', title: 'Quanto Costa una Campagna Facebook Ads nel 2026?', tag: 'Advertising', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Budget, costi e ROI delle campagne Meta Ads. Guida ai prezzi per PMI che vogliono investire in Facebook e Instagram Ads.' },
  { slug: 'quanto-costa-brand-identity', title: 'Quanto Costa una Brand Identity Completa nel 2026?', tag: 'Branding', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Costi reali per logo, colori, tipografia, guidelines. Cosa include una brand identity professionale e quanto investire.' },
  { slug: 'web-agency-vs-freelance', title: 'Web Agency vs Freelance: Pro, Contro e Quando Scegliere', tag: 'Strategia', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Confronto onesto su costi, qualità, tempistiche, affidabilità e scalabilità tra agenzia web e freelance.' },
  { slug: 'sito-web-fai-da-te-vs-professionale', title: 'Sito Web Fai Da Te vs Professionale: Il Confronto Onesto', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Wix, Squarespace o sito professionale? Confronto su costi, qualità, SEO, performance e risultati.' },
  { slug: 'serve-ancora-un-sito-web', title: 'Serve Ancora un Sito Web nel 2026? La Risposta Definitiva', tag: 'Strategia', date: '20 Febbraio 2026', readTime: '7 min', desc: 'Social media, marketplace, AI: serve ancora investire in un sito web? Dati e ragioni concrete.' },
  { slug: 'shopify-vs-sito-ecommerce-custom', title: 'Shopify vs E-commerce Custom: Quale Conviene?', tag: 'E-Commerce', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Confronto completo Shopify vs e-commerce su misura: costi, performance, SEO, scalabilità.' },
  { slug: 'meta-ads-vs-google-ads', title: 'Meta Ads vs Google Ads: Quale Scegliere per il Tuo Business?', tag: 'Advertising', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Confronto completo Facebook/Instagram Ads vs Google Ads: costi, targeting, formati, ROI per settore.' },
  { slug: 'sito-web-per-ristoranti', title: 'Sito Web per Ristoranti: Guida Completa con Costi', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Cosa deve avere il sito di un ristorante: menù, prenotazioni, SEO locale, Google Maps. Costi e best practice.' },
  { slug: 'sito-web-per-avvocati', title: 'Sito Web per Avvocati: Cosa Deve Avere e Quanto Costa', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Guida al sito web per studi legali: elementi essenziali, deontologia, SEO locale e costi.' },
  { slug: 'sito-web-per-dentisti', title: 'Sito Web per Dentisti: Guida per Studi Odontoiatrici', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Cosa deve avere il sito di uno studio dentistico: prenotazioni, servizi, SEO locale, costi.' },
  { slug: 'sito-web-per-startup', title: 'Sito Web per Startup: Da Zero al Lancio nel 2026', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Come creare il sito di una startup: MVP, design, pitch online, SEO e lead generation.' },
  { slug: 'manutenzione-sito-web', title: 'Manutenzione Sito Web: Cosa Include e Quanto Costa', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Guida alla manutenzione del sito: aggiornamenti, backup, sicurezza, performance, contenuti.' },
  { slug: 'european-accessibility-act-siti-web', title: 'European Accessibility Act: Cosa Cambia per il Tuo Sito', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '9 min', desc: 'L\'EAA impone requisiti di accessibilità. Chi deve adeguarsi, scadenze, WCAG 2.2 e come conformarsi.' },
  { slug: 'seo-per-ai-overviews', title: 'Come Ottimizzare il Sito per AI Overviews e ChatGPT', tag: 'SEO', date: '20 Febbraio 2026', readTime: '9 min', desc: 'GEO: come fare in modo che il tuo sito venga citato da ChatGPT, Gemini, Perplexity e AI Overviews.' },
  { slug: 'chatbot-sito-web-guida', title: 'Chatbot per il Sito Web: Quando Serve e Come Implementarlo', tag: 'Tecnologia', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Guida ai chatbot per siti aziendali: tipologie, costi, benefici e implementazione.' },
  { slug: 'gdpr-sito-web-guida', title: 'GDPR e Sito Web: Guida alla Conformità per Aziende Italiane', tag: 'Tecnologia', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Privacy policy, cookie banner, Consent Mode v2, form e gestione dati. Checklist completa.' },
  { slug: 'ottimizzazione-tasso-conversione', title: 'CRO: Come Ottimizzare il Tasso di Conversione del Sito', tag: 'Conversioni', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Guida pratica alla CRO: A/B testing, UX, copy e CTA per trasformare più visitatori in clienti.' },
  { slug: 'strategia-digitale-pmi', title: 'Strategia Digitale per PMI: Da Dove Iniziare nel 2026', tag: 'Strategia', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Come costruire una strategia digitale efficace: priorità, canali, budget e roadmap per i primi 6 mesi.' },
  { slug: 'ux-design-best-practice', title: 'UX Design: 10 Best Practice per un Sito che Converte', tag: 'Best Practice', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Le regole fondamentali di UX design: navigazione, velocità, form, mobile, accessibilità.' },
  { slug: 'portare-attivita-online', title: 'Come Portare la Tua Attività Online: Guida Step-by-Step', tag: 'Strategia', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Da negozio fisico a presenza digitale: sito web, Google Business, social media, e-commerce.' },
  { slug: 'marketing-digitale-attivita-locali-milano', title: 'Marketing Digitale per Attività Locali a Milano e Hinterland', tag: 'Strategia', date: '20 Febbraio 2026', readTime: '9 min', desc: 'SEO locale, Google Business, social media, ads geolocalizzate e recensioni per attività locali.' },
  { slug: 'sito-web-professionale-checklist', title: 'Sito Web Professionale: Checklist Completa 2026', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '8 min', desc: 'I 15 requisiti essenziali di un sito professionale: design, performance, SEO, sicurezza.' },
  { slug: 'schema-markup-guida', title: 'Schema Markup: Guida ai Dati Strutturati per la SEO', tag: 'SEO Tecnica', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Cosa sono i dati strutturati, come implementarli e quali tipi usare per Google e AI.' },
  { slug: 'creare-sito-con-intelligenza-artificiale', title: 'Creare un Sito con l\'AI: Verità e Limiti nel 2026', tag: 'Tecnologia', date: '20 Febbraio 2026', readTime: '8 min', desc: 'Wix AI, Framer AI, v0: confronto onesto tra siti generati da AI e siti professionali.' },
  { slug: 'dati-obbligatori-sito-web-aziendale', title: 'Dati Obbligatori sul Sito Web Aziendale: Guida Legale', tag: 'Web Development', date: '20 Febbraio 2026', readTime: '7 min', desc: 'Partita IVA, ragione sociale, PEC, privacy policy: tutti i dati obbligatori per legge. Checklist e sanzioni.' },
  { slug: 'funnel-vendita-online', title: 'Funnel di Vendita Online: Come Costruirlo Step by Step', tag: 'Conversioni', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Awareness, considerazione, conversione, fidelizzazione. Come costruire un percorso che converte.' },
  { slug: 'seo-locale-google-maps', title: 'SEO Locale e Google Maps: Come Essere Primo nella Tua Zona', tag: 'SEO', date: '20 Febbraio 2026', readTime: '9 min', desc: 'Google Business Profile, Local Pack, recensioni, NAP, citazioni per ricerche locali.' }
];

// Generate card HTML for each article - matching existing card structure
function generateCard(article) {
  return `<article class="blog-card" data-category="${article.tag}"> <div class="blog-card-body"> <span class="blog-card-tag">${article.tag}</span> <h2 class="blog-card-title"><a href="${article.slug}.html">${article.title}</a></h2> <p class="blog-card-excerpt">${article.desc}</p> <div class="blog-card-meta"> <span>${article.date} · ${article.readTime}</span> <a href="${article.slug}.html" class="blog-card-read">Leggi →</a> </div> </div> </article>`;
}

// Read current blog/index.html
const indexPath = path.join(__dirname, '..', 'blog', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Check which articles are already present as actual cards (not just schema references)
// We look for the slug inside a blog-card-title context, not just anywhere in the file
const missing = newArticles.filter(a => !html.includes('blog-card-title"><a href="' + a.slug + '.html"'));
console.log(`Found ${missing.length} missing articles to add`);

if (missing.length === 0) {
  console.log('All articles already in blog index!');
  process.exit(0);
}

// Find the last blog-card closing tag and insert new cards after it
// We look for the pattern of cards ending before the pagination or closing grid
const cardsHtml = missing.map(generateCard).join('');

// Find the last </article> in the blog grid area
const lastArticleIdx = html.lastIndexOf('</article>');
if (lastArticleIdx === -1) {
  console.error('Could not find </article> in blog index');
  process.exit(1);
}

// Insert after the last </article>
const insertPos = lastArticleIdx + '</article>'.length;
html = html.slice(0, insertPos) + cardsHtml + html.slice(insertPos);

// Update the ItemList numberOfItems in schema
html = html.replace(/"numberOfItems":\s*\d+/, `"numberOfItems": ${20 + missing.length}`);

// Add new items to the schema ItemList
const schemaItems = missing.map((a, i) => {
  return `{"@type":"ListItem","position":${21 + i},"url":"https://www.webnovis.com/blog/${a.slug}.html","name":"${a.title.replace(/"/g, '\\"')}"}`;
});

// Find the end of the existing itemListElement array
const itemListEnd = html.indexOf(']', html.indexOf('"itemListElement"'));
if (itemListEnd !== -1) {
  // Insert before the closing bracket, after the last item
  html = html.slice(0, itemListEnd) + ',' + schemaItems.join(',') + html.slice(itemListEnd);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log(`✅ Added ${missing.length} new article cards to blog/index.html`);
console.log(`✅ Updated schema numberOfItems to ${20 + missing.length}`);
