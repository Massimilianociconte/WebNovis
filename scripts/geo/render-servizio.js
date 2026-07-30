/**
 * Servizio×città page generator (Nunjucks).
 */
const fs = require('fs');
const path = require('path');
const {
    ROOT,
    SITE,
    SINGLETON_LOCAL_BUSINESS_ID,
    FIRST_DEPLOY_DATE,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    resolvePageTier,
    buildRobotsContent,
    isIndexableGeoPath
} = require('./config');
const {
    cities,
    services,
    contentBlocks,
    tableServices,
    cityMap,
    serviceBySlug,
    serviceCoverageCitySlugs,
    shouldGenerateGeoForService,
    njkEnv
} = require('./data');
const { getNearestCities, stripHtml } = require('./html-utils');
const { getBasePage } = require('./paths');
const { getGeoEditorialRecord, applyEditorialSeoOverrides } = require('./editorial');
const { getServiceLocalSeoCopy } = require('./copy');
const { getAreaServedEntity } = require('./schema');
const { updateDerivedHeadMeta } = require('./head-meta');
const { readApprovedContentBlock } = require('../../config/content-claim-governance');

function generateServizioCittaPage(service, city) {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) return null;

    const slug = `${service.slug}-${city.slug}`;
    const pagePath = `/${slug}.html`;
    const tier = resolvePageTier(pagePath);
    const isIndexable = tier > 0;
    const canonical = `${SITE}/${slug}.html`;
    const editorial = getGeoEditorialRecord(pagePath);
    const seo = applyEditorialSeoOverrides(getServiceLocalSeoCopy(service, city), editorial);
    // Nearest cities whose same-service landing is approved for indexation.
    const approvedServiceCities = cities.filter((candidate) =>
        !candidate.isSede
        && serviceCoverageCitySlugs.has(candidate.slug)
        && isIndexableGeoPath(`/${service.slug}-${candidate.slug}.html`)
    );
    const relatedCityPages = getNearestCities(city, approvedServiceCities, 5)
        .slice(0, 3)
        .map(nc => ({
            url: `/${service.slug}-${nc.slug}.html`,
            label: `${service.shortName} a ${nc.name}`,
            distance: nc.distanzaSede
        }));

    // Other services in the same city, restricted to approved indexable landings.
    const geoServices = services.filter((candidate) =>
        shouldGenerateGeoForService(candidate)
        && candidate.slug !== service.slug
        && isIndexableGeoPath(`/${candidate.slug}-${city.slug}.html`)
    );

    // AI content for this city — vary by service cluster to avoid intra-municipal duplication
    const aiBlock = contentBlocks.get(city.slug);

    // Service cluster categorization for content variation
    const webBuildSlugs = new Set(['sito-vetrina', 'ecommerce', 'landing-page', 'web-app', 'restyling-sito-web', 'realizzazione-siti-web']);
    const marketingSlugs = new Set(['social-media', 'email-marketing', 'google-ads', 'seo-locale', 'copywriting']);
    const strategySlugs = new Set(['consulenze', 'consulenza-digitale', 'automazione-business', 'manutenzione-sito']);

    // Pick different content angle based on service cluster (eliminates intra-municipal duplication)
    let aiContent = null;
    if (aiBlock) {
        if (webBuildSlugs.has(service.slug) && aiBlock.localMarketAnalysis) {
            aiContent = `<p>${aiBlock.localMarketAnalysis}</p>`;
        } else if (marketingSlugs.has(service.slug) && aiBlock.competitiveContext) {
            aiContent = `<p>${aiBlock.competitiveContext}</p>`;
        } else if (strategySlugs.has(service.slug) && aiBlock.competitiveContext && aiBlock.localMarketAnalysis) {
            aiContent = `<p>${aiBlock.competitiveContext}</p>\n<p>${aiBlock.localMarketAnalysis.split('. ').slice(-2).join('. ')}</p>`;
        } else if (aiBlock.localMarketAnalysis) {
            aiContent = `<p>${aiBlock.localMarketAnalysis}</p>`;
        }
    }

    // Competitive insight for the city (unique content, previously unused)
    const competitiveInsight = aiBlock?.competitiveContext || null;

    // Data points for data-driven unique content (previously unused)
    const dataPoints = aiBlock?.uniqueDataPoints || null;

    // ─── Service-specific FAQ pools (5-7 FAQs per cluster type) ──────────
    const webDevFaqPool = [
        { q: `Usate WordPress per ${service.name.toLowerCase()}?`, a: `No. WebNovis propone sviluppo custom con HTML, CSS e JavaScript, senza dipendere da temi o plugin WordPress. Architettura, requisiti di sicurezza e verifiche SEO vengono definiti per il singolo progetto.` },
        { q: `Come affrontate la velocità del sito a ${city.name}?`, a: `Progettiamo pagine leggere e verifichiamo i Core Web Vitals su layout e dispositivi rappresentativi. Obiettivi, misure e interventi dipendono dai contenuti e dalle integrazioni concordate: non pubblichiamo un punteggio universale garantito.` },
        { q: `Il sito sarà ottimizzato per le ricerche locali a ${city.name}?`, a: `Sì. Integriamo SEO tecnica, dati strutturati Schema.org (LocalBusiness, Service), meta tag geo-specifici e contenuti ottimizzati per intercettare ricerche come "${service.shortName.toLowerCase()} ${city.name}" e varianti correlate.` },
        { q: `Posso gestire il sito in autonomia dopo il lancio?`, a: `Sì. Forniamo formazione e, dove serve, un pannello di gestione contenuti semplice. Per chi preferisce affidarsi a noi, offriamo piani di manutenzione continuativa da €59/mese.` },
        { q: `Cosa include il supporto post-lancio?`, a: `Perimetro, durata e canali del supporto vengono indicati nella proposta. Se serve continuità operativa, il catalogo prevede anche un servizio di manutenzione da €${serviceBySlug.get('manutenzione-sito').priceFrom}/mese, da confermare nel preventivo.` }
    ];
    const marketingFaqPool = [
        { q: `Come misurate i risultati di ${service.name.toLowerCase()} a ${city.name}?`, a: `Definiamo KPI specifici prima di partire (lead, conversioni, traffico qualificato) e forniamo report periodici con dati reali. Ogni decisione operativa è guidata dai numeri, non da intuizioni.` },
        { q: `Quanto tempo serve per valutare ${service.shortName.toLowerCase()}?`, a: `La finestra di valutazione dipende da canale, storico, budget, domanda e qualità del tracciamento. Prima di partire definiamo baseline e KPI; tempi e risultati non vengono garantiti in anticipo.` },
        { q: `Lavorate solo con aziende grandi o anche con piccole attività di ${city.name}?`, a: `Lavoriamo con PMI, professionisti e attività locali di ${city.name}. Il nostro approccio è scalabile: partiamo da budget contenuti e cresciamo con i risultati. Investimento da €${service.priceFrom}${service.priceUnit || ''}.` },
        { q: `Come vengono definiti durata e recesso del servizio?`, a: `Durata, rinnovi ed eventuale recesso dipendono dalla proposta accettata. Chiedi che questi elementi, insieme a deliverable e report, siano indicati per iscritto prima dell'avvio.` },
        { q: `Come posso confrontare WebNovis con altre agenzie per ${service.shortName.toLowerCase()}?`, a: `Confronta perimetro, deliverable, responsabilità, accesso ai dati e metodo di misurazione. WebNovis lavora da Rho e chiarisce questi elementi nella proposta, senza promettere risultati non misurabili in anticipo.` }
    ];
    const strategyFaqPool = [
        { q: `Come funziona il servizio di ${service.name.toLowerCase()} con WebNovis?`, a: `Partiamo da un brief iniziale per capire obiettivi, contesto competitivo e priorità. Poi definiamo un piano operativo con tempi (${service.timeEstimate}), investimento (da €${service.priceFrom}${service.priceUnit || ''}) e un unico referente dedicato.` },
        { q: `La consulenza può essere fatta in videochiamata o serve un incontro di persona?`, a: `Entrambe le opzioni. Per le aziende di ${city.name} possiamo incontrarci in sede vostra o nella nostra sede a Rho (${city.distanzaSede}). Per chi preferisce, lavoriamo efficacemente anche in videochiamata.` },
        { q: `Cosa ricevo concretamente alla fine del percorso?`, a: `Deliverable chiari e azionabili: documento con priorità, raccomandazioni operative, metriche di riferimento e prossimi passi. Non teoria astratta, ma indicazioni eseguibili dal tuo team o con il nostro supporto.` },
        { q: `Posso poi affidarvi anche la realizzazione di quanto emerso dalla consulenza?`, a: `Sì. Se dalla consulenza emergono interventi che vuoi affidare a WebNovis (sito, SEO, automazioni), possiamo gestirli con continuità senza perdere il contesto già acquisito.` },
        { q: `Vale la pena investire in ${service.shortName.toLowerCase()} per una piccola attività di ${city.name}?`, a: `Dipende da obiettivo, margini, capacità operativa e alternative disponibili. Il prezzo di catalogo parte da €${service.priceFrom}${service.priceUnit || ''}, ma utilità e perimetro vanno valutati sul caso concreto prima di procedere.` }
    ];

    // Select the right FAQ pool based on service cluster
    let faqPool;
    if (webBuildSlugs.has(service.slug)) faqPool = webDevFaqPool;
    else if (marketingSlugs.has(service.slug)) faqPool = marketingFaqPool;
    else faqPool = strategyFaqPool;

    // Build final FAQ list: 2 universal + 5 cluster-specific
    const faqs = (editorial && editorial.faqs && editorial.faqs.length)
        ? editorial.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
        : [
        { q: `Quanto costa ${service.name.toLowerCase()} a ${city.name}?`, a: `${service.name} a ${city.name}: prezzo di catalogo da <strong>€${service.priceFrom}${service.priceUnit || ''}</strong>. La stima ${service.timeEstimate.toLowerCase()} è indicativa; il preventivo conferma perimetro, prezzo e tempi del caso specifico.` },
        { q: `WebNovis è vicina a ${city.name}?`, a: `La nostra sede è a Rho, Via S. Giorgio 2 — ${city.distanzaSede} in auto da ${city.name}. Incontriamo i clienti in azienda o in videochiamata.` },
        ...faqPool
    ];


    // Related services: show 6 instead of 3 for better internal linking
    const relatedServicePagesExpanded = geoServices
        .slice(0, 6)
        .map(svc => ({
            url: `/${svc.slug}-${city.slug}.html`,
            label: `${svc.shortName} a ${city.name}`
        }));

    // Tier classification — drives structural differentiation in the template.
    // tier === 1: Tier 1 indexable pages (unique content emphasized, full feature set)
    // tier === 2: Tier 2 indexable pages (standard template, full internal linking)
    // tier === 0: de-amplified pages (noindex,follow) — slim structure to reduce doorway footprint
    // Load per-city Tier 1 content overrides when present (hand-crafted editorial).
    // See data/content-blocks/tier1-<city>-<service>.json for structure.
    let tier1Content = null;
    if (tier === 1) {
        const tier1Path = path.join(ROOT, 'data', 'content-blocks', `tier1-${city.slug}-${service.slug}.json`);
        if (fs.existsSync(tier1Path)) {
            tier1Content = readApprovedContentBlock(tier1Path);
        }
    }

    const templateData = {
        city: city,
        // CAP mostrato nel copy visibile: solo per comuni reali, non per le aree
        // sintetiche Milano Nord/Ovest che non hanno un CAP univoco.
        cityCap: (city.slug === 'milano-nord' || city.slug === 'milano-ovest') ? null : city.cap,
        service: service,
        seo: seo,
        nearCitiesData: (city.nearCities || []).slice(0, 5).map(ncSlug => {
            const nc = cityMap.get(ncSlug);
            return nc ? { name: nc.name } : { name: ncSlug };
        }),
        relatedCityPages: relatedCityPages,
        relatedServicePages: relatedServicePagesExpanded,
        allCoreServices: tableServices.map((candidate) => ({
            ...candidate,
            geoUrl: isIndexableGeoPath(`/${candidate.slug}-${city.slug}.html`)
                ? `/${candidate.slug}-${city.slug}.html`
                : null
        })),
        agencyCityPageUrl: isIndexableGeoPath(`/agenzia-web-${city.slug}.html`)
            ? `/agenzia-web-${city.slug}.html`
            : null,
        faqs: faqs,
        aiContent: aiContent,
        competitiveInsight: competitiveInsight,
        dataPoints: dataPoints,
        tier: tier,
        isIndexable: isIndexable,
        tier1Content: tier1Content,
        editorial: editorial || null,
        today: PAGE_DATE_ISO_TOKEN,
        todayFormatted: PAGE_DATE_HUMAN_TOKEN,
        site: SITE
    };

    const contentHtml = njkEnv.render('servizio-citta-content.njk', templateData);

    // Extract head, nav, footer from Rho base (same as agenzia pages)
    const rhoHeadEnd = rhoPage.indexOf('</head>');

    let headBlock = updateDerivedHeadMeta(rhoPage.substring(0, rhoHeadEnd), {
        title: seo.title,
        description: seo.description,
        keywords: `${service.targetKeyword} ${city.name}, ${service.slug.replace(/-/g, ' ')} ${city.name}, WebNovis ${city.name}`,
        canonical,
        robots: buildRobotsContent(`/${slug}.html`),
        ogTitle: seo.title,
        ogDescription: seo.ogDescription
    });
    const bodyStart = rhoPage.indexOf('<body>');
    const mainStart = rhoPage.indexOf('<main');
    const navHtml = rhoPage.substring(bodyStart, mainStart);

    const footerStart = rhoPage.indexOf('<footer');
    const footerEnd = rhoPage.indexOf('</footer>') + '</footer>'.length;
    const footerHtml = rhoPage.substring(footerStart, footerEnd);

    const afterFooter = rhoPage.substring(footerEnd);
    const searchCssIdx = afterFooter.indexOf('<link href="css/search');
    const tailBlock = searchCssIdx >= 0 ? afterFooter.substring(searchCssIdx) : afterFooter;

    // Schemas for service×city
    const schemas = [
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": service.shortName, "item": SITE + "/zone-servite/#" + service.slug },
                { "@type": "ListItem", "position": 3, "name": `${service.shortName} a ${city.name}`, "item": canonical }
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": canonical,
            "name": seo.heroH1,
            "description": seo.description,
            "url": canonical,
            "inLanguage": "it",
            "isPartOf": { "@id": SITE + "/#website" },
            "about": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "datePublished": FIRST_DEPLOY_DATE,
            "dateModified": PAGE_DATE_ISO_TOKEN
        },
        {
            "@context": "https://schema.org", "@type": "Service",
            "@id": canonical + "#service",
            "serviceType": service.name,
            "name": `${service.shortName} a ${city.name}`,
            "description": seo.schemaDescription,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": getAreaServedEntity(city),
            "url": canonical,
            ...(service.hasPage ? {
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": `${service.shortName} per ${city.name}`,
                    "itemListElement": [{
                        "@type": "Offer",
                        "itemOffered": {
                            "@type": "Service",
                            "name": `${service.shortName} a ${city.name}`,
                            "url": SITE + service.url
                        }
                    }]
                }
            } : {}),
            "offers": {
                "@type": "Offer",
                "url": canonical,
                "price": String(service.priceFrom),
                "priceCurrency": "EUR"
            }
        }
    ];
    if (faqs.length > 0) {
        schemas.push({
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": stripHtml(f.a) }
            }))
        });
    }
    const schemasHtml = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');

    return headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;
}

module.exports = {
    generateServizioCittaPage
};
