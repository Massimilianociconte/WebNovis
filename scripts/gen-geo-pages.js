/**
 * Generate geo landing pages from agenzia-web-rho.html template
 * Run: node scripts/gen-geo-pages.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.webnovis.com';
const TODAY = '2026-02-21';

// Read the Rho page as template
const rhoPage = fs.readFileSync(path.join(ROOT, 'agenzia-web-rho.html'), 'utf8');

// ─── City Definitions ────────────────────────────────────────────────

const cities = [
    {
        slug: 'lainate',
        name: 'Lainate',
        cap: '20045',
        lat: '45.5736',
        lng: '9.0236',
        wiki: 'https://it.wikipedia.org/wiki/Lainate',
        title: 'Agenzia Web a Lainate (Milano) — WebNovis | Siti Web Custom, Grafica e Social',
        metaDesc: 'WebNovis è l\'agenzia web per Lainate e Nord-Ovest Milano. Sviluppo siti 100% custom, graphic design, social media. Sede a Rho, 8 minuti da Lainate. Preventivo gratuito.',
        keywords: 'agenzia web Lainate, web agency Lainate Milano, sviluppo siti web Lainate, realizzazione sito web Lainate, web designer Lainate, agenzia digitale Lainate, WebNovis Lainate',
        ogTitle: 'Agenzia Web a Lainate — WebNovis | Siti Web Custom e Digital Marketing',
        schemaDesc: 'Agenzia web per Lainate e Nord-Ovest Milano specializzata in siti web 100% custom, graphic design e social media marketing. Sede a Rho (MI), 8 minuti da Lainate.',
        heroTag: 'Lainate — Milano (MI) 20045',
        h1: 'Agenzia Web a Lainate: Siti Professionali per Imprese e Professionisti',
        heroCapsule: '<strong>WebNovis</strong> è l\'agenzia web di riferimento per PMI e professionisti di Lainate. Sede a Rho (8 minuti in auto via SP ex-SS33), incontri presso i clienti o in videochiamata. Codice 100% custom — zero WordPress, zero template. Preventivo gratuito entro 24 ore.',
        breadcrumb: 'Agenzia Web Lainate',
        nearCities: [
            { name: 'Lainate', wiki: 'https://it.wikipedia.org/wiki/Lainate' },
            { name: 'Rho', wiki: 'https://it.wikipedia.org/wiki/Rho' },
            { name: 'Arese', wiki: 'https://it.wikipedia.org/wiki/Arese' },
            { name: 'Garbagnate Milanese' },
            { name: 'Bollate' },
            { name: 'Nerviano' },
            { name: 'Pogliano Milanese' }
        ],
        localContext: {
            section1Title: 'Perché un\'agenzia web vicina è un vantaggio per le imprese di Lainate?',
            section1Intro: 'Lainate è un centro industriale e commerciale vivace nel Nord-Ovest milanese, con oltre 26.000 abitanti. L\'autostrada A8 (Milano–Laghi) e la tangenziale ovest collegano Lainate a tutto l\'hinterland.',
            cards1: [
                { h3: '8 minuti dalla nostra sede', p: 'WebNovis ha sede a Rho, a soli 8 minuti in auto da Lainate via SP ex-SS33. Incontri rapidi in azienda, senza traffico milanese.' },
                { h3: 'Conoscenza del territorio', p: 'Dalle aziende di Via Litta alla zona industriale di Barbaiana, conosciamo il tessuto imprenditoriale di Lainate e i bisogni digitali delle PMI locali.' },
                { h3: 'Risposta in 2 ore lavorative', p: 'Il fondatore segue ogni progetto. Nessun call center, nessun account manager. Comunicazione diretta e tempi di risposta garantiti.' }
            ],
            section3Title: 'Lainate e il contesto imprenditoriale: perché investire nel digitale',
            section3Text: '<p>Con oltre <strong>26.000 abitanti</strong> e una posizione strategica all\'incrocio tra A8 e tangenziale, Lainate attrae aziende dei settori manifatturiero, logistico e terziario. La vicinanza con <strong>Villa Litta</strong> — capolavoro barocco con il celebre Ninfeo — e l\'area commerciale garantiscono un bacino di clientela diversificato.</p><p>Le PMI di Lainate competono con aziende milanesi per la visibilità online. Un sito web professionale, veloce e ottimizzato SEO è il primo passo per catturare ricerche locali come <em>"web agency Lainate"</em>, <em>"sito web per azienda Lainate"</em> o <em>"e-commerce Lainate"</em>.</p>'
        },
        faqs: [
            { q: 'Quanto costa un sito web a Lainate?', a: 'I prezzi partono da <strong>€500</strong> per una Landing Page, da <strong>€1.200</strong> per un Sito Vetrina e da <strong>€3.500</strong> per un E-Commerce custom. Preventivo gratuito entro 24 ore.' },
            { q: 'Dove siete rispetto a Lainate?', a: 'La nostra sede è a Rho, in Via S. Giorgio 2 — a 8 minuti in auto da Lainate via SP ex-SS33. Incontriamo i clienti presso le loro aziende o in videochiamata.' },
            { q: 'Servite solo Lainate o anche comuni vicini?', a: 'Oltre a Lainate serviamo Rho, Arese, Garbagnate Milanese, Nerviano, Pogliano Milanese, Bollate e tutta la Città Metropolitana di Milano.' },
            { q: 'Usate WordPress per i siti?', a: 'No. Ogni sito WebNovis è sviluppato con codice 100% custom (HTML5, CSS3, JavaScript). Performance superiori, sicurezza nativa, SEO ottimizzato — nessun template.' },
            { q: 'Quanto tempo per un sito web?', a: 'Landing Page: 5-7 giorni lavorativi. Sito Vetrina: 2-3 settimane. E-Commerce: 4-8 settimane.' },
            { q: 'Offrite assistenza dopo il lancio?', a: '30 giorni di supporto gratuito inclusi in ogni progetto. Piani di manutenzione continuativa da €59/mese con aggiornamenti, backup e monitoraggio.' },
            { q: 'Perché scegliere WebNovis invece di una web agency milanese?', a: 'Vicinanza (8 min da Lainate), comunicazione diretta con il fondatore, prezzi senza overhead delle agenzie di Milano centro, stessa qualità tecnica e risultati misurabili.' }
        ],
        ctaTitle: 'Pronto a portare online la tua attività di Lainate?'
    },
    {
        slug: 'arese',
        name: 'Arese',
        cap: '20044',
        lat: '45.5511',
        lng: '9.0764',
        wiki: 'https://it.wikipedia.org/wiki/Arese',
        title: 'Agenzia Web ad Arese (Milano) — WebNovis | Siti Web Custom, E-Commerce e Social',
        metaDesc: 'WebNovis è l\'agenzia web per Arese e Nord-Ovest Milano. Sviluppo siti 100% custom, e-commerce, graphic design. Sede a Rho, 10 minuti da Arese. Preventivo gratuito entro 24h.',
        keywords: 'agenzia web Arese, web agency Arese Milano, sviluppo siti web Arese, sito web azienda Arese, web designer Arese, e-commerce Arese, WebNovis Arese',
        ogTitle: 'Agenzia Web ad Arese — WebNovis | Siti Web Custom e Digital Marketing',
        schemaDesc: 'Agenzia web per Arese e Nord-Ovest Milano specializzata in siti web custom, e-commerce, graphic design e social media. Sede a Rho (MI), 10 minuti da Arese.',
        heroTag: 'Arese — Milano (MI) 20044',
        h1: 'Agenzia Web ad Arese: Siti Web e Digital Marketing per il Commercio e le PMI',
        heroCapsule: '<strong>WebNovis</strong> è l\'agenzia web per PMI, commercianti e professionisti di Arese. Sede a Rho (10 minuti in auto), incontri in azienda o in videochiamata. Codice 100% custom — zero WordPress. Preventivo gratuito entro 24 ore.',
        breadcrumb: 'Agenzia Web Arese',
        nearCities: [
            { name: 'Arese', wiki: 'https://it.wikipedia.org/wiki/Arese' },
            { name: 'Rho', wiki: 'https://it.wikipedia.org/wiki/Rho' },
            { name: 'Lainate', wiki: 'https://it.wikipedia.org/wiki/Lainate' },
            { name: 'Garbagnate Milanese' },
            { name: 'Bollate' },
            { name: 'Pero' },
            { name: 'Cornaredo' }
        ],
        localContext: {
            section1Title: 'Perché le aziende di Arese scelgono un\'agenzia web locale?',
            section1Intro: 'Arese è conosciuta per <strong>Il Centro</strong>, uno dei centri commerciali più grandi d\'Europa, e per lo storico stabilimento Alfa Romeo (oggi sede del <strong>Museo Storico Alfa Romeo — La macchina del tempo</strong>). L\'ecosistema commerciale e imprenditoriale di Arese ha bisogno di visibilità digitale competitiva.',
            cards1: [
                { h3: '10 minuti dalla nostra sede', p: 'WebNovis ha sede a Rho, a 10 minuti da Arese. Incontri veloci, nessun traffico milanese, comunicazione diretta con il team.' },
                { h3: 'Competenza nel retail e commercio', p: 'L\'ecosistema de Il Centro di Arese genera un indotto di PMI, ristorazione e servizi che necessitano di presenza online professionale e e-commerce funzionali.' },
                { h3: 'Risultati misurabili', p: 'Ogni progetto include SEO tecnica integrata, Core Web Vitals ottimizzati e analytics configurati. Non solo un sito bello — un sito che porta clienti.' }
            ],
            section3Title: 'Arese nel contesto digitale: opportunità per il commercio locale',
            section3Text: '<p>Con <strong>20.000 abitanti</strong> e un\'area commerciale che attira visitatori da tutta la Lombardia, Arese offre un mercato ricco per attività locali e e-commerce. La vicinanza all\'autostrada A8 e alla tangenziale ovest rende l\'area un hub logistico naturale per aziende di distribuzione e servizi.</p><p>Le ricerche locali come <em>"negozio online Arese"</em>, <em>"web designer Arese"</em> e <em>"sito web per attività Arese"</em> hanno competizione quasi inesistente — un\'opportunità concreta per chi investe ora nel digitale.</p>'
        },
        faqs: [
            { q: 'Quanto costa un sito web per un\'attività di Arese?', a: 'Landing Page da <strong>€500</strong>, Sito Vetrina da <strong>€1.200</strong>, E-Commerce da <strong>€3.500</strong>. Preventivo gratuito entro 24 ore.' },
            { q: 'Dove si trova WebNovis rispetto ad Arese?', a: 'La nostra sede è a Rho, Via S. Giorgio 2 — 10 minuti in auto da Arese. Incontriamo i clienti in azienda o in videochiamata.' },
            { q: 'Potete creare un e-commerce per un negozio di Arese?', a: 'Sì. Realizziamo e-commerce custom senza commissioni sulle vendite, con catalogo illimitato, pagamenti sicuri e gestione autonoma. Ideale per il retail aresino.' },
            { q: 'Servite anche i comuni vicini ad Arese?', a: 'Oltre ad Arese serviamo Rho, Lainate, Garbagnate, Bollate, Pero, Cornaredo e tutta la Città Metropolitana di Milano.' },
            { q: 'Usate WordPress?', a: 'No. Solo codice 100% custom — HTML5, CSS3, JavaScript. Performance, sicurezza e SEO nativi senza plugin di terze parti.' },
            { q: 'Quanto tempo per realizzare un sito?', a: 'Landing Page: 5-7 giorni. Sito Vetrina: 2-3 settimane. E-Commerce: 4-8 settimane.' },
            { q: 'Offrite supporto dopo il lancio del sito?', a: '30 giorni di supporto gratuito inclusi. Piani di manutenzione continuativa da €59/mese con aggiornamenti, backup e monitoraggio performance.' }
        ],
        ctaTitle: 'Pronto a far crescere la tua attività di Arese online?'
    },
    {
        slug: 'garbagnate',
        name: 'Garbagnate Milanese',
        cap: '20024',
        lat: '45.5764',
        lng: '9.0794',
        wiki: 'https://it.wikipedia.org/wiki/Garbagnate_Milanese',
        title: 'Agenzia Web Garbagnate Milanese — WebNovis | Siti Web Custom, Grafica e Social',
        metaDesc: 'WebNovis è l\'agenzia web per Garbagnate Milanese. Siti 100% custom, graphic design, social media per PMI e artigiani. Sede a Rho, 12 minuti. Preventivo gratuito.',
        keywords: 'agenzia web Garbagnate Milanese, web agency Garbagnate, sviluppo siti web Garbagnate, web designer Garbagnate, agenzia digitale Garbagnate Milanese, sito web Garbagnate, WebNovis',
        ogTitle: 'Agenzia Web Garbagnate Milanese — WebNovis | Siti Custom e Marketing',
        schemaDesc: 'Agenzia web per Garbagnate Milanese specializzata in siti web custom, graphic design e social media per PMI e artigiani. Sede a Rho (MI), 12 minuti.',
        heroTag: 'Garbagnate Milanese — MI 20024',
        h1: 'Agenzia Web a Garbagnate Milanese: Siti Web Custom per Aziende e Artigiani',
        heroCapsule: '<strong>WebNovis</strong> è l\'agenzia web per artigiani, PMI e professionisti di Garbagnate Milanese. Sede a Rho (12 minuti via SP527), incontri diretti o in videochiamata. Codice proprietario, zero WordPress. Preventivo gratuito entro 24 ore.',
        breadcrumb: 'Agenzia Web Garbagnate',
        nearCities: [
            { name: 'Garbagnate Milanese', wiki: 'https://it.wikipedia.org/wiki/Garbagnate_Milanese' },
            { name: 'Rho', wiki: 'https://it.wikipedia.org/wiki/Rho' },
            { name: 'Lainate', wiki: 'https://it.wikipedia.org/wiki/Lainate' },
            { name: 'Bollate', wiki: 'https://it.wikipedia.org/wiki/Bollate' },
            { name: 'Cesate' },
            { name: 'Senago' },
            { name: 'Arese' }
        ],
        localContext: {
            section1Title: 'Perché un\'agenzia web vicina fa la differenza per le imprese di Garbagnate?',
            section1Intro: 'Garbagnate Milanese è un comune industriale e residenziale nel cuore dell\'hinterland Nord di Milano, con circa <strong>28.000 abitanti</strong>. La linea ferroviaria <strong>S2 Passante</strong> e la vicinanza alla <strong>Saronno-Monza (SP527)</strong> ne fanno un polo per PMI, artigiani e attività di servizio.',
            cards1: [
                { h3: '12 minuti dalla nostra sede', p: 'WebNovis è a Rho, a soli 12 minuti in auto via SP527. Incontri rapidi in azienda, senza i costi e i tempi di una web agency milanese.' },
                { h3: 'Competenza manifatturiera e B2B', p: 'La zona industriale di Garbagnate ospita aziende meccaniche, elettriche e di servizi B2B. Sappiamo comunicare l\'offerta tecnica a un pubblico B2B esigente.' },
                { h3: 'Prezzi trasparenti', p: 'Nessun overhead da agenzia milanese. Preventivi chiari, tempistiche certe, comunicazione diretta con il fondatore del progetto.' }
            ],
            section3Title: 'Garbagnate Milanese nel contesto digitale: opportunità concrete',
            section3Text: '<p>Garbagnate ha un tessuto produttivo diversificato: dalla <strong>zona industriale sud</strong> con PMI meccaniche e logistiche, al <strong>centro storico</strong> con studi professionali, commercio di vicinato e artigianato. L\'<strong>Ospedale Salvini</strong> genera un indotto di servizi sanitari e studi medici che beneficiano di un sito professionale.</p><p>Le ricerche <em>"web agency Garbagnate"</em>, <em>"sito web artigiano Garbagnate"</em> e <em>"e-commerce Garbagnate Milanese"</em> hanno volume in crescita e competizione quasi nulla — chi investe ora cattura il mercato locale.</p>'
        },
        faqs: [
            { q: 'Quanto costa un sito web a Garbagnate Milanese?', a: 'I prezzi partono da <strong>€500</strong> per una Landing Page, da <strong>€1.200</strong> per un Sito Vetrina e da <strong>€3.500</strong> per un E-Commerce custom. Preventivo gratuito entro 24 ore.' },
            { q: 'Dove siete rispetto a Garbagnate?', a: 'La nostra sede è a Rho, Via S. Giorgio 2 — 12 minuti in auto via SP527. Incontriamo i clienti in azienda o in videochiamata.' },
            { q: 'Servite anche i comuni vicini?', a: 'Oltre a Garbagnate serviamo Rho, Lainate, Bollate, Cesate, Senago, Arese e tutta la Città Metropolitana di Milano.' },
            { q: 'Usate WordPress?', a: 'No. Solo codice 100% custom — HTML5, CSS3, JavaScript. Performance superiori, sicurezza nativa, personalizzazione illimitata.' },
            { q: 'Quanto tempo per un sito web?', a: 'Landing Page: 5-7 giorni lavorativi. Sito Vetrina: 2-3 settimane. E-Commerce: 4-8 settimane.' },
            { q: 'Offrite supporto post-lancio?', a: '30 giorni di supporto gratuito inclusi. Manutenzione continuativa da €59/mese con backup, aggiornamenti e monitoraggio performance.' },
            { q: 'Perché scegliere un\'agenzia locale invece di una milanese?', a: 'Vicinanza (12 min da Garbagnate), rapporto diretto con il fondatore, prezzi competitivi senza overhead da grande agenzia, conoscenza del tessuto imprenditoriale locale.' }
        ],
        ctaTitle: 'Pronto a portare online la tua azienda di Garbagnate?'
    }
];

// ─── Generate each city page from Rho template ──────────────────────

function buildServicesGrid(cityName) {
    return `<div class="service-grid"><div class="service-card-mini"><h3>Sito Web Vetrina</h3><p>Design personalizzato e SEO locale per studi e PMI di ${cityName}. <strong>Da €1.200</strong>. <a href="servizi/sito-vetrina.html">Scopri →</a></p></div><div class="service-card-mini"><h3>E-Commerce Custom</h3><p>Negozio online senza commissioni, catalogo illimitato, gestione autonoma. <strong>Da €3.500</strong>. <a href="servizi/ecommerce.html">Scopri →</a></p></div><div class="service-card-mini"><h3>Landing Page</h3><p>Pagine ad alta conversione per campagne digitali. <strong>Da €500</strong>. <a href="servizi/landing-page.html">Scopri →</a></p></div><div class="service-card-mini"><h3>Graphic Design e Branding</h3><p>Logo, identità visiva e coordinato aziendale. <strong>Da €400</strong>. <a href="servizi/graphic-design.html">Scopri →</a></p></div><div class="service-card-mini"><h3>Social Media Marketing</h3><p>Contenuti, analisi competitor e campagne Meta/LinkedIn. <strong>Da €300/mese</strong>. <a href="servizi/social-media.html">Scopri →</a></p></div><div class="service-card-mini"><h3>Accessibilità EAA</h3><p>Audit WCAG e adeguamento al nuovo obbligo europeo. <strong>Da €890</strong>. <a href="servizi/accessibilita.html">Scopri →</a></p></div></div>`;
}

function buildAreaServedList(city) {
    const names = city.nearCities.map(c => `<strong>${c.name}</strong>`).join(', ');
    return names + ' e tutta la Città Metropolitana di Milano';
}

function buildAreaServedSchema(city) {
    const areas = city.nearCities.map(c => {
        const obj = { "@type": "City", "name": c.name };
        if (c.wiki) obj.sameAs = c.wiki;
        return obj;
    });
    areas.push({ "@type": "AdministrativeArea", "name": "Hinterland milanese" });
    areas.push({ "@type": "AdministrativeArea", "name": "Città Metropolitana di Milano" });
    return areas;
}

function buildFaqHtml(faqs) {
    return faqs.map(f => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join(' ');
}

function buildFaqSchema(faqs) {
    return faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]*>/g, '') }
    }));
}

for (const city of cities) {
    const canonical = `${SITE}/agenzia-web-${city.slug}.html`;
    const areaServed = buildAreaServedSchema(city);
    const serviceArea = city.nearCities.slice(0, 4).map(c => ({ "@type": "City", "name": c.name }));
    serviceArea.push({ "@type": "AdministrativeArea", "name": "Hinterland milanese" });

    // Build body HTML
    const bodyHtml = `<body> <nav class="nav" id="nav"><div class="container nav-container"><a href="/" class="logo"><img alt="WebNovis Logo" height="40" src="Img/webnovis-logo-bianco.png" width="150" class="logo-image"></a><div class="search-wrapper" id="searchWrapper"><div class="search-bar" id="searchBar"><svg height="16" viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input aria-controls="searchResults" aria-expanded="false" aria-label="Cerca nel sito" autocomplete="off" class="search-input" id="searchInput" placeholder="Cerca nel sito..." role="combobox"><kbd class="search-shortcut">Ctrl K</kbd><button aria-label="Cancella ricerca" class="search-clear" id="searchClear"><svg height="14" viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div><div class="search-results" id="searchResults" aria-label="Risultati di ricerca" role="listbox"></div></div><button aria-label="Cerca nel sito" class="search-mobile-toggle" id="searchMobileToggle"><svg height="20" viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button><ul class="nav-menu" id="navMenu"><li><a href="servizi/index.html" class="nav-link">Servizi</a></li><li><a href="portfolio.html" class="nav-link">Portfolio</a></li><li><a href="chi-siamo.html" class="nav-link">Chi Siamo</a></li><li><a href="blog/index.html" class="nav-link">Blog</a></li><li><a href="contatti.html" class="nav-link">Contatti</a></li><li><a href="preventivo.html" class="nav-link nav-cta">Inizia Ora</a></li></ul><button aria-label="Apri menu di navigazione" class="nav-toggle" id="navToggle" aria-controls="navMenu" aria-expanded="false"><span></span><span></span><span></span></button></div></nav><div class="search-overlay" id="searchOverlay"></div>`;

    const mainHtml = ` <main> <div class="container breadcrumb"><a href="/">Home</a><span class="separator">/</span><span class="current-page">${city.breadcrumb}</span></div> <section class="service-page-hero"><div class="container"><span class="section-tag">${city.heroTag}</span><h1>${city.h1}</h1><p class="answer-capsule">${city.heroCapsule}</p><a href="contatti.html" class="btn btn-large btn-primary"><span>Richiedi Preventivo Gratuito</span> <svg height="20" viewBox="0 0 20 20" width="20" fill="none"><path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></a><p style="margin-top:1.5rem;font-size:.85rem;opacity:.5"><time datetime="${TODAY}">21 febbraio 2026</time> &nbsp;·&nbsp; Sede: Via S. Giorgio 2, 20017 Rho MI &nbsp;·&nbsp; <a href="https://maps.google.com/?q=Via+S.+Giorgio+2%2C+20017+Rho+MI" target="_blank" rel="noopener" style="color:var(--primary-light)">Google Maps</a></p></div></section>`;

    const section1 = ` <section class="service-detail"><div class="container"><h2>${city.localContext.section1Title}</h2><p>${city.localContext.section1Intro}</p><div class="service-grid">${city.localContext.cards1.map(c => `<div class="service-card-mini"><h3>${c.h3}</h3><p>${c.p}</p></div>`).join('')}</div></div></section>`;

    const section2 = ` <section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container"><h2>Servizi web per imprese e professionisti di ${city.name}</h2><p>Sviluppo web, grafica e social media in un unico studio dell'hinterland milanese.</p>${buildServicesGrid(city.name)}</div></section>`;

    const section3 = ` <section class="service-detail"><div class="container"><h2>Dove opera WebNovis nel territorio?</h2><p>Con sede a <strong>Rho</strong> (20017 MI), serviamo: ${buildAreaServedList(city)}.</p></div></section>`;

    const section4 = ` <section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container"><h2>${city.localContext.section3Title}</h2>${city.localContext.section3Text}</div></section>`;

    const faqSection = ` <section class="service-detail"><div class="container"><h2>Domande Frequenti — ${city.breadcrumb}</h2>${buildFaqHtml(city.faqs)}</div></section>`;

    const ctaSection = ` <section class="cta-inline"><div class="container"><h2>${city.ctaTitle}</h2><p>Preventivo gratuito in 24 ore. Incontri presso la tua azienda o in videochiamata.</p><a href="contatti.html" class="btn btn-large btn-primary"><span>Contattaci Ora</span> <svg height="20" viewBox="0 0 20 20" width="20" fill="none"><path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></a></div></section> </main>`;

    // Footer — extract from Rho page and update links
    const rhoFooterStart = rhoPage.indexOf('<footer');
    const rhoFooterEnd = rhoPage.indexOf('</footer>') + '</footer>'.length;
    let pageFooter = rhoPage.substring(rhoFooterStart, rhoFooterEnd);
    // Add Accessibilità EAA to footer servizi
    if (!pageFooter.includes('accessibilita.html')) {
        pageFooter = pageFooter.replace(
            '<a href="servizi/social-media.html">Social Media</a>',
            '<a href="servizi/social-media.html">Social Media</a> <a href="servizi/accessibilita.html">Accessibilità EAA</a>'
        );
    }
    // Add geo links
    if (!pageFooter.includes(`agenzia-web-${city.slug}.html`)) {
        pageFooter = pageFooter.replace(
            '<a href="agenzia-web-milano.html">Web Agency Milano</a>',
            `<a href="agenzia-web-milano.html">Web Agency Milano</a> <a href="agenzia-web-${city.slug}.html">Web Agency ${city.name.split(' ')[0]}</a>`
        );
    }

    // JSON-LD schemas
    const schemas = [
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
            { "@type": "ListItem", "position": 2, "name": city.breadcrumb, "item": canonical }
        ]},
        { "@context": "https://schema.org", "@type": "WebPage", "@id": canonical, "name": city.ogTitle, "description": city.schemaDesc, "url": canonical, "inLanguage": "it", "isPartOf": { "@id": SITE + "/#website" }, "about": { "@id": SITE + "/#organization" }, "datePublished": TODAY, "dateModified": TODAY, "speakable": { "@type": "SpeakableSpecification", "cssSelector": [".answer-capsule", "h1"] }},
        { "@context": "https://schema.org", "@type": ["LocalBusiness", "ProfessionalService"], "@id": canonical + "#localbusiness-" + city.slug, "name": "WebNovis — Agenzia Web " + city.name, "alternateName": "Web Novis " + city.name, "url": canonical, "parentOrganization": { "@id": SITE + "/#organization" }, "description": city.schemaDesc, "telephone": "+393802647367", "email": "hello@webnovis.com", "priceRange": "€€", "currenciesAccepted": "EUR", "address": { "@type": "PostalAddress", "@id": SITE + "/#address", "streetAddress": "Via S. Giorgio, 2", "addressLocality": "Rho", "addressRegion": "MI", "postalCode": "20017", "addressCountry": "IT" }, "geo": { "@type": "GeoCoordinates", "latitude": city.lat, "longitude": city.lng }, "hasMap": "https://maps.google.com/?q=Via+S.+Giorgio+2%2C+20017+Rho+MI", "areaServed": areaServed, "serviceArea": { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": city.lat, "longitude": city.lng }, "geoRadius": "15000" }, "openingHoursSpecification": [{ "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "00:00", "closes": "23:59" }], "sameAs": [SITE + "/#organization"], "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Servizi Web a " + city.name, "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Sito Web Vetrina a " + city.name, "url": SITE + "/servizi/sito-vetrina.html" }},
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "E-Commerce a " + city.name, "url": SITE + "/servizi/ecommerce.html" }},
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Landing Page a " + city.name, "url": SITE + "/servizi/landing-page.html" }},
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Graphic Design " + city.name, "url": SITE + "/servizi/graphic-design.html" }},
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Social Media Marketing " + city.name, "url": SITE + "/servizi/social-media.html" }},
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Accessibilità EAA " + city.name, "url": SITE + "/servizi/accessibilita.html" }}
        ]}},
        { "@context": "https://schema.org", "@type": "Service", "@id": canonical + "#service", "serviceType": "Web Development", "name": "Sviluppo Siti Web a " + city.name, "description": "Realizzazione siti web 100% custom per aziende di " + city.name + " e comuni limitrofi.", "provider": { "@id": SITE + "/#organization" }, "areaServed": serviceArea, "offers": [
            { "@type": "Offer", "name": "Landing Page", "price": "500", "priceCurrency": "EUR" },
            { "@type": "Offer", "name": "Sito Vetrina", "price": "1200", "priceCurrency": "EUR" },
            { "@type": "Offer", "name": "E-Commerce Custom", "price": "3500", "priceCurrency": "EUR" }
        ]},
        { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": buildFaqSchema(city.faqs) }
    ];

    const schemasHtml = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join(' ');

    // Extract head and inline styles from Rho page
    const rhoHeadEnd = rhoPage.indexOf('</head>');
    let headBlock = rhoPage.substring(0, rhoHeadEnd)
        .replace(/<title>[^<]+<\/title>/, `<title>${city.title}</title>`)
        .replace(/content="[^"]*" name="description"/, `content="${city.metaDesc}" name="description"`)
        .replace(/content="[^"]*" name="keywords"/, `content="${city.keywords}" name="keywords"`)
        .replace(/href="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `href="${canonical}"`)
        .replace(/content="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `content="${canonical}"`)
        .replace(/content="[^"]*" property="og:title"/, `content="${city.ogTitle}" property="og:title"`)
        .replace(/content="[^"]*" property="og:description"/, `content="${city.metaDesc}" property="og:description"`);

    // Get everything after </footer> in rho page (inline CSS, scripts, speculation rules)
    const rhoAfterBody = rhoPage.substring(rhoPage.indexOf('</footer>') + '</footer>'.length);
    // Remove old schemas from rhoAfterBody and keep only CSS + scripts
    const searchCssStart = rhoAfterBody.indexOf('<link href="css/search');
    const tailBlock = rhoAfterBody.substring(searchCssStart);

    // Assemble full page
    const fullPage = headBlock + '</head>' + bodyHtml + mainHtml + section1 + section2 + section3 + section4 + faqSection + ctaSection + ' ' + pageFooter + ' ' + schemasHtml + ' ' + tailBlock;

    const outPath = path.join(ROOT, `agenzia-web-${city.slug}.html`);
    fs.writeFileSync(outPath, fullPage, 'utf8');
    console.log(`✅ Created agenzia-web-${city.slug}.html (${Math.round(fullPage.length / 1024)}KB)`);
}

console.log('✅ All geo pages generated!');
