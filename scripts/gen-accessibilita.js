/**
 * Generate servizi/accessibilita.html
 * Run: node scripts/gen-accessibilita.js
 */
const fs = require('fs');
const path = require('path');

// Read existing sviluppo-web.html to extract head pattern and footer
const sviluppo = fs.readFileSync(path.join(__dirname, '..', 'servizi', 'sviluppo-web.html'), 'utf8');

// Extract from start to </head>
const headEnd = sviluppo.indexOf('</head>');
const existingHead = sviluppo.substring(0, headEnd);

// Extract footer (from <footer to end of </footer>)
const footerStart = sviluppo.indexOf('<footer');
const footerEnd = sviluppo.indexOf('</footer>') + '</footer>'.length;
const existingFooter = sviluppo.substring(footerStart, footerEnd);

// Extract scripts block at end (after footer)
const afterFooter = sviluppo.substring(footerEnd);

// Build new head by adapting the pattern
const newHead = existingHead
    .replace(/<title>[^<]+<\/title>/, '<title>Accessibilità Web e Compliance EAA — Web Novis | Audit WCAG, Adeguamento e Monitoraggio</title>')
    .replace(/content="[^"]*" name="description"/, 'content="Rendi il tuo sito web accessibile e conforme all\'European Accessibility Act (EAA). Audit WCAG 2.1 AA da €890, adeguamento completo e monitoraggio continuo da €49/mese. Web Novis — agenzia web a Milano e Rho." name="description"')
    .replace(/content="[^"]*" name="keywords"/, 'content="accessibilità web, EAA compliance, European Accessibility Act, WCAG 2.1, audit accessibilità sito, sito accessibile, adeguamento EAA, sanzioni accessibilità, web agency accessibilità Milano" name="keywords"')
    .replace(/href="https:\/\/www\.webnovis\.com\/servizi\/sviluppo-web\.html"/g, 'href="https://www.webnovis.com/servizi/accessibilita.html"')
    .replace(/content="https:\/\/www\.webnovis\.com\/servizi\/sviluppo-web\.html"/g, 'content="https://www.webnovis.com/servizi/accessibilita.html"')
    .replace(/content="[^"]*" property="og:title"/, 'content="Accessibilità Web e Compliance EAA — Audit WCAG e Adeguamento | Web Novis" property="og:title"')
    .replace(/content="[^"]*" property="og:description"/, 'content="Audit accessibilità WCAG 2.1 AA, adeguamento EAA e monitoraggio continuo. Da €890. Agenzia web a Milano e Rho." property="og:description"');

// Update footer to include Accessibilità link
const newFooter = existingFooter.replace(
    '<a href="social-media.html">Social Media</a>',
    '<a href="social-media.html">Social Media</a><a href="accessibilita.html">Accessibilità EAA</a>'
).replace(
    // Add Come Lavoriamo + Preventivo if missing
    '<a href="../agenzia-web-rho.html">Web Agency Rho</a>',
    '<a href="../come-lavoriamo.html">Come Lavoriamo</a><a href="../preventivo.html">Preventivo</a><a href="../agenzia-web-rho.html">Web Agency Rho</a>'
);

// Body content
const body = `<body> <nav class="nav" id="nav"><div class="container nav-container"><a href="../" class="logo"><img alt="WebNovis Logo" height="40" src="../Img/webnovis-logo-bianco.png" width="150" class="logo-image"></a><div class="search-wrapper" id="searchWrapper"><div class="search-bar" id="searchBar"><svg height="16" viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input aria-controls="searchResults" aria-expanded="false" aria-label="Cerca nel sito" autocomplete="off" class="search-input" id="searchInput" placeholder="Cerca nel sito..." role="combobox"><kbd class="search-shortcut">Ctrl K</kbd><button aria-label="Cancella ricerca" class="search-clear" id="searchClear"><svg height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><div class="search-results" id="searchResults" aria-label="Risultati di ricerca" role="listbox"></div></div><button aria-label="Cerca nel sito" class="search-mobile-toggle" id="searchMobileToggle"><svg height="20" viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button><ul class="nav-menu" id="navMenu"><li><a href="index.html" class="nav-link">Servizi</a></li><li><a href="../portfolio.html" class="nav-link">Portfolio</a></li><li><a href="../chi-siamo.html" class="nav-link">Chi Siamo</a></li><li><a href="../blog/index.html" class="nav-link">Blog</a></li><li><a href="../contatti.html" class="nav-link">Contatti</a></li><li><a href="../preventivo.html" class="nav-link nav-cta">Inizia Ora</a></li></ul><button aria-label="Apri menu di navigazione" class="nav-toggle" id="navToggle" aria-controls="navMenu" aria-expanded="false"><span></span><span></span><span></span></button></div></nav><div class="search-overlay" id="searchOverlay"></div>`;

const mainContent = `<main> <div class="container breadcrumb"><a href="../">Home</a><span class="separator">/</span><a href="index.html">Servizi</a><span class="separator">/</span><span class="current-page">Accessibilità Web</span></div> <section class="service-page-hero"><div class="container"><span class="section-tag">EAA — European Accessibility Act</span><h1>Accessibilità Web e Compliance EAA: Rendi il Tuo Sito a Norma</h1><p class="answer-capsule"><strong>L'European Accessibility Act è in vigore dal giugno 2025</strong>. Tutti i siti e-commerce e servizi digitali devono rispettare lo standard WCAG 2.1 AA. Web Novis offre audit di accessibilità, adeguamento completo e monitoraggio continuo — per evitare sanzioni e migliorare l'esperienza di tutti gli utenti.</p><a href="../preventivo.html" class="btn btn-large btn-primary"><span>Richiedi Audit Accessibilità</span> <svg height="20" viewBox="0 0 20 20" width="20" fill="none"><path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></a></div></section>`;

const section1 = ` <section class="service-detail"><div class="container"><h2>Cos'è l'European Accessibility Act e perché riguarda il tuo sito web?</h2><p>L'<strong>European Accessibility Act (EAA)</strong>, recepito in Italia con il <strong>D.Lgs. 82/2022</strong>, impone che tutti i prodotti e servizi digitali — inclusi siti web, e-commerce e app — siano accessibili alle persone con disabilità. Lo standard di riferimento è il <strong>WCAG 2.1 livello AA</strong>.</p><p>L'Italia ha uno dei punteggi di compliance più bassi in Europa (<strong>3.0/10</strong> secondo WebAIM 2025). Le <strong>sanzioni</strong> per non conformità vanno da <strong>€5.000 a €40.000</strong> per violazione accertata da AgID, con possibilità di ordine di rimozione del servizio.</p><p><strong>Nota per micro-imprese</strong> (&lt;10 dipendenti e fatturato &lt;€2M): esistono esoneri parziali. Tuttavia, l'accessibilità migliora la SEO (+12% traffico organico medio, studio Deque Systems 2024) e l'usabilità per tutti gli utenti.</p></div></section>`;

const section2 = ` <section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container"><h2>I nostri servizi di accessibilità web</h2><div class="service-grid"><div class="service-card-mini"><h3>Audit Accessibilità WCAG</h3><p>Analisi completa con strumenti automatici (axe DevTools, Lighthouse, WAVE) e verifica manuale con screen reader e navigazione da tastiera. Report dettagliato con priorità e score di conformità.</p></div><div class="service-card-mini"><h3>Adeguamento Completo</h3><p>Correzione di tutte le violazioni WCAG 2.1 AA: contrasto colori, alt text, struttura semantica HTML, navigazione tastiera, label form, focus management, ARIA roles e media accessibili.</p></div><div class="service-card-mini"><h3>Monitoraggio Continuo</h3><p>Scansione automatica mensile + verifica manuale trimestrale. Report di conformità aggiornato, alert su nuove violazioni, assistenza prioritaria.</p></div></div><div class="pricing-highlight"><h3>Quanto costa rendere il sito accessibile?</h3><p style="color:var(--gray-light);margin-bottom:1rem">Prezzi trasparenti, nessun costo nascosto.</p><div class="service-grid" style="margin:0"><div class="service-card-mini" style="text-align:center"><h3>Audit Iniziale</h3><span class="price">€890</span><p>Report completo WCAG 2.1 AA con checklist interventi prioritari. Consegna 5-7 giorni.</p></div><div class="service-card-mini" style="text-align:center"><h3>Adeguamento</h3><span class="price">Da €1.500</span><p>Correzione completa di tutte le violazioni. Prezzo varia in base a pagine e complessità.</p></div><div class="service-card-mini" style="text-align:center"><h3>Monitoraggio</h3><span class="price">€49/mese</span><p>Scansione mensile + verifica trimestrale + report + assistenza prioritaria.</p></div></div></div></div></section>`;

const section3 = ` <section class="service-detail"><div class="container"><h2>Cosa controlliamo nell'audit WCAG 2.1 AA</h2><p>Il nostro audit copre tutti i 50 criteri di successo del livello AA, nei 4 principi POUR:</p><div class="service-grid"><div class="service-card-mini"><h3>Percepibile</h3><p>Testo alternativo per immagini, sottotitoli video, contrasto colori (≥4.5:1 testo normale, ≥3:1 testo grande), ridimensionamento testo fino al 200%.</p></div><div class="service-card-mini"><h3>Utilizzabile</h3><p>Navigazione completa da tastiera, nessuna trappola focus, skip link, tempo sufficiente, nessun contenuto lampeggiante, heading e label descrittivi.</p></div><div class="service-card-mini"><h3>Comprensibile</h3><p>Lingua pagina dichiarata, comportamento prevedibile, identificazione errori nei form, istruzioni chiare.</p></div><div class="service-card-mini"><h3>Robusto</h3><p>HTML valido e semantico, compatibilità con NVDA/VoiceOver/JAWS, stati e ruoli ARIA corretti, aggiornamenti comunicati.</p></div></div></div></section>`;

const section4 = ` <section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container"><h2>Perché scegliere Web Novis per l'accessibilità?</h2><div class="service-grid"><div class="service-card-mini"><h3>Codice Custom = Controllo Totale</h3><p>Siti in codice proprietario HTML5/CSS3/JS — nessun plugin WordPress che introduce violazioni. Ogni elemento è sotto controllo diretto.</p></div><div class="service-card-mini"><h3>Audit Manuale + Automatico</h3><p>Gli strumenti automatici catturano solo il 30-40% delle violazioni (GovA11y 2025). Integriamo test manuali con screen reader reali.</p></div><div class="service-card-mini"><h3>SEO Benefit Integrato</h3><p>Struttura semantica, alt text, heading gerarchici e performance sono fattori che Google premia. Un sito accessibile è meglio posizionato.</p></div></div></div></section>`;

const faqItems = [
    { q: "Cos'è l'European Accessibility Act (EAA)?", a: "L'EAA è una direttiva europea (2019/882) recepita in Italia con il D.Lgs. 82/2022, che obbliga i fornitori di prodotti e servizi digitali a garantire l'accessibilità secondo lo standard WCAG 2.1 livello AA. È in vigore dal 28 giugno 2025." },
    { q: "Il mio sito è obbligato a essere accessibile?", a: "Se vendi prodotti o servizi online (e-commerce, SaaS, servizi digitali), sì. Le micro-imprese con meno di 10 dipendenti e fatturato inferiore a €2 milioni hanno esoneri parziali, ma l'accessibilità resta una best practice SEO e UX." },
    { q: "Quali sono le sanzioni per un sito non accessibile?", a: "In Italia, AgID può comminare sanzioni da €5.000 a €40.000 per violazione accertata. Nei casi più gravi può ordinare la rimozione del servizio digitale." },
    { q: "Quanto tempo serve per rendere accessibile un sito esistente?", a: "Sito vetrina 5-10 pagine: 1-2 settimane. E-commerce con centinaia di prodotti: 4-8 settimane. Audit iniziale consegnato in 5-7 giorni." },
    { q: "L'accessibilità penalizza il design del sito?", a: "No. Accessibilità significa design che funziona per tutti: contrasto leggibile, navigazione chiara, interazioni prevedibili. Apple e Gov.uk sono tra i siti più accessibili e belli al mondo." },
    { q: "Cosa sono le WCAG 2.1 AA?", a: "Le Web Content Accessibility Guidelines sono lo standard internazionale W3C per l'accessibilità web. Il livello AA è il riferimento normativo dell'EAA con 50 criteri nei 4 principi: Percepibile, Utilizzabile, Comprensibile e Robusto." },
    { q: "Qual è la differenza tra WCAG 2.1 e WCAG 2.2?", a: "Le WCAG 2.2 (ottobre 2023) aggiungono 9 nuovi criteri per disabilità cognitive e mobile. L'EAA richiede 2.1 AA come baseline, ma Web Novis adotta già le 2.2 per future-proofing." },
    { q: "Posso verificare da solo se il mio sito è accessibile?", a: "Primo controllo con WAVE, Lighthouse o axe DevTools. Ma gli strumenti automatici catturano solo il 30-40% dei problemi — serve verifica manuale professionale." },
    { q: "L'accessibilità migliora la SEO?", a: "Sì. Google premia struttura semantica, alt text, heading gerarchici, performance e mobile-friendliness — tutti migliorano con l'accessibilità. Studio Deque Systems 2024: +12% traffico organico medio." },
    { q: "WebNovis sviluppa siti accessibili nativamente?", a: "Sì. Codice custom con WCAG 2.2: HTML semantico, navigazione tastiera, contrasto adeguato, alt text, heading, ARIA roles e compatibilità screen reader." },
    { q: "Offrite un certificato di conformità?", a: "Forniamo report audit dettagliato con score di conformità e Dichiarazione di Accessibilità conforme al modello AgID. Non esistono certificazioni ufficiali — la conformità è un processo continuo." },
    { q: "Quanto costa il servizio di accessibilità?", a: "Audit iniziale: €890. Adeguamento completo: da €1.500. Monitoraggio continuo: €49/mese. Preventivo entro 24 ore." }
];

const faqHtml = faqItems.map(f => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join(' ');

const faqSection = ` <section class="service-detail"><div class="container"><h2>Domande Frequenti — Accessibilità Web e EAA</h2>${faqHtml}</div></section>`;

const ctaSection = ` <section class="cta-inline"><div class="container"><h2>Il tuo sito è conforme all'EAA? Scoprilo in 24 ore.</h2><p>Richiedi un audit di accessibilità con report dettagliato e checklist di interventi prioritari.</p><a href="../preventivo.html" class="btn btn-large btn-primary"><span>Richiedi Audit Accessibilità</span> <svg height="20" viewBox="0 0 20 20" width="20" fill="none"><path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></a></div></section> </main> `;

// JSON-LD schemas
const breadcrumbSchema = JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.webnovis.com/"},{"@type":"ListItem","position":2,"name":"Servizi","item":"https://www.webnovis.com/servizi/"},{"@type":"ListItem","position":3,"name":"Accessibilità Web","item":"https://www.webnovis.com/servizi/accessibilita.html"}]});

const serviceSchema = JSON.stringify({"@context":"https://schema.org","@type":"Service","@id":"https://www.webnovis.com/servizi/accessibilita.html#service","serviceType":"Web Accessibility Audit & Compliance","name":"Accessibilità Web e Compliance EAA","description":"Audit accessibilità WCAG 2.1 AA, adeguamento EAA e monitoraggio continuo per siti web e e-commerce.","provider":{"@id":"https://www.webnovis.com/#organization"},"areaServed":[{"@type":"City","name":"Rho"},{"@type":"City","name":"Milano"},{"@type":"Country","name":"Italia"}],"hasOfferCatalog":{"@type":"OfferCatalog","name":"Servizi Accessibilità Web","itemListElement":[{"@type":"Offer","name":"Audit Accessibilità WCAG 2.1 AA","price":"890","priceCurrency":"EUR","description":"Analisi completa automatica e manuale con report dettagliato e checklist interventi prioritari"},{"@type":"Offer","name":"Adeguamento Completo EAA","price":"1500","priceCurrency":"EUR","description":"Correzione tutte le violazioni WCAG 2.1 AA: contrasto, alt text, semantica, tastiera, ARIA"},{"@type":"Offer","name":"Monitoraggio Accessibilità Continuo","price":"49","priceCurrency":"EUR","description":"Scansione mensile, verifica trimestrale, report conformità, alert violazioni"}]}});

const faqSchema = JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqItems.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))});

const schemasBlock = `<script type="application/ld+json">${breadcrumbSchema}</script><script type="application/ld+json">${serviceSchema}</script><script type="application/ld+json">${faqSchema}</script>`;

// Inline CSS (same as other service pages)
const inlineCSS = `.pricing-highlight{background:linear-gradient(135deg,rgba(91,106,174,.1) 0%,rgba(56,182,255,.05) 100%);border:1px solid rgba(91,106,174,.2);border-radius:16px;padding:2.5rem;margin:2rem 0}.pricing-highlight h3{color:var(--white);margin-top:0;font-size:1.3rem}.pricing-highlight .price{font-family:Syne,sans-serif;font-size:2rem;font-weight:800;color:var(--primary-light);display:block;margin:.5rem 0}`;

// Extract the existing inline style + search CSS + scripts from sviluppo-web
const searchCssLink = `<link href="../css/search.min.css?v=1.0" rel="stylesheet" media="print" onload='this.media="all"'><noscript><link href="../css/search.min.css" rel="stylesheet"></noscript>`;

// Get the service page inline CSS from sviluppo-web
const styleStart = sviluppo.indexOf('<style>');
const styleEnd = sviluppo.indexOf('</style>') + '</style>'.length;
const existingInlineStyle = sviluppo.substring(styleStart, styleEnd);

// Get scripts block
const searchMinStart = sviluppo.indexOf('<script src="../js/search.min.js"');
const endBody = sviluppo.indexOf('</body>');
const existingScriptsBlock = sviluppo.substring(searchMinStart, endBody);

// Assemble full page
const fullPage = newHead + '</head>' + body + mainContent + section1 + section2 + section3 + section4 + faqSection + ctaSection + newFooter + ' ' + schemasBlock + ' ' + searchCssLink + existingInlineStyle + `<style>${inlineCSS}</style>` + existingScriptsBlock + '</body></html>';

const outPath = path.join(__dirname, '..', 'servizi', 'accessibilita.html');
fs.writeFileSync(outPath, fullPage, 'utf8');
console.log('✅ Created servizi/accessibilita.html (' + Math.round(fullPage.length / 1024) + 'KB)');
