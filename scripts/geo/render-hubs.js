/**
 * Hub pages generator (agenzia-web, realizzazione-siti-web, zone-servite).
 */
const {
    SITE,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    getIndexableGeoPaths
} = require('./config');
const {
    cities,
    services,
    coreServices,
    shouldGenerateGeoForService,
    withCityUiMeta,
    njkEnv
} = require('./data');
const { getBasePage } = require('./paths');
const { updateDerivedHeadMeta } = require('./head-meta');
const { buildCoverageScopes } = require('./schema');

const HUB_CSS = `
<style>
.hub-intro-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin-top:2rem}
.hub-scope-card{padding:1.35rem;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(91,106,174,.06));backdrop-filter:blur(12px)}
.hub-scope-card strong{display:block;margin-bottom:.45rem;color:var(--white);font-family:Syne,sans-serif;font-size:1rem}
.hub-scope-count{display:inline-flex;align-items:center;gap:.45rem;margin-bottom:.7rem;padding:.38rem .72rem;border-radius:999px;background:rgba(91,106,174,.12);border:1px solid rgba(123,140,201,.24);font-size:.82rem;color:var(--primary-light);font-weight:700}
.hub-scope-card p{margin:0;color:var(--gray-light);font-size:.95rem;line-height:1.65}
.hub-city-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1.5rem}
.hub-city-grid--compact{grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.8rem}
.hub-city-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1rem;text-decoration:none;display:flex;align-items:center;gap:.85rem;transition:all .25s ease;min-height:88px}
.hub-city-card:hover{border-color:rgba(91,106,174,.4);transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.22)}
.hub-city-card--sm{padding:.82rem .9rem;border-radius:12px;min-height:auto}
.hub-city-card--sm .hub-city-avatar{width:40px;height:40px}
.hub-city-avatar{width:52px;height:52px;border-radius:50%;overflow:hidden;flex-shrink:0;border:1px solid rgba(255,255,255,.14);background:radial-gradient(circle at 30% 30%,rgba(123,140,201,.4),rgba(13,16,28,.92));box-shadow:inset 0 1px 0 rgba(255,255,255,.14)}
.hub-city-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.hub-city-avatar--fallback::before{content:attr(data-initials);display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:Syne,sans-serif;font-size:1rem;font-weight:700;color:var(--white)}
.hub-city-content{display:flex;flex-direction:column;gap:.18rem;min-width:0}
.hub-city-name{font-family:Syne,sans-serif;font-weight:700;color:var(--white);font-size:1rem}
.hub-city-card--sm .hub-city-name{font-size:.92rem}
.hub-city-meta{font-size:.8rem;color:var(--gray-light);opacity:.78}
.hub-city-pop{font-size:.75rem;color:var(--primary-light);opacity:.84}
.hub-atlas{padding-top:1rem}
.hub-atlas-header{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1rem}
.hub-atlas-header p{max-width:740px;margin:0;color:var(--gray-light)}
.service-scope-note{margin-top:.9rem;font-size:.88rem;color:var(--gray-light);opacity:.82}
@media(max-width:900px){.hub-intro-grid{grid-template-columns:1fr}.hub-atlas-header{align-items:flex-start}}
@media(max-width:640px){.hub-city-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}.hub-city-card{padding:.85rem;gap:.7rem}.hub-city-avatar{width:46px;height:46px}}
</style>`;

function generateHubPages() {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) {
        console.error('❌ Base page agenzia-web-rho.html not found — hub pages skipped');
        return [];
    }

    const results = [];
    const indexableGeoPaths = new Set(getIndexableGeoPaths());
    const isApprovedHubTarget = (serviceSlug, citySlug) =>
        indexableGeoPaths.has(`/${serviceSlug}-${citySlug}.html`);

    // ── Shared page assembly helpers ──
    function buildHubPage(hubSlug, title, description, keywords, contentHtml, schemaObjects) {
        const canonical = `${SITE}/${hubSlug}/`;

        // Extract head
        const rhoHeadEnd = rhoPage.indexOf('</head>');

        let headBlock = updateDerivedHeadMeta(rhoPage.substring(0, rhoHeadEnd), {
            title,
            description,
            keywords,
            canonical,
            ogTitle: title,
            ogDescription: description
        });
        // Inject hub CSS before </head>
        headBlock += HUB_CSS;

        // Extract nav, footer, tail
        const bodyStart = rhoPage.indexOf('<body>');
        const mainStart = rhoPage.indexOf('<main');
        const navHtml = rhoPage.substring(bodyStart, mainStart);

        const footerStart = rhoPage.indexOf('<footer');
        const footerEnd = rhoPage.indexOf('</footer>') + '</footer>'.length;
        const footerHtml = rhoPage.substring(footerStart, footerEnd);

        const afterFooter = rhoPage.substring(footerEnd);
        const searchCssIdx = afterFooter.indexOf('<link href="css/search');
        const tailBlock = searchCssIdx >= 0 ? afterFooter.substring(searchCssIdx) : afterFooter;

        // Schemas
        const schemasHtml = schemaObjects.map(s =>
            `<script type="application/ld+json">${JSON.stringify(s)}</script>`
        ).join('\n');

        let fullHtml = headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;

        // ── Convert relative paths to absolute for subdirectory serving ──
        // Hub pages live in /agenzia-web/index.html, /zone-servite/index.html, etc.
        // The base page (agenzia-web-rho.html) uses relative paths that break in subdirs.
        fullHtml = fullHtml
            .replace(/href="css\//g, 'href="/css/')
            .replace(/src="js\//g, 'src="/js/')
            .replace(/src="(?:\.\.\/)+js\//g, 'src="/js/')
            .replace(/src="Img\//g, 'src="/Img/')
            .replace(/srcset="Img\//g, 'srcset="/Img/')
            .replace(/, Img\//g, ', /Img/')
            .replace(/,Img\//g, ',/Img/')
            .replace(/href="Img\//g, 'href="/Img/')
            .replace(/href="fonts\//g, 'href="/fonts/')
            .replace(/src="fonts\//g, 'src="/fonts/')
            .replace(/href="index\.html"/g, 'href="/"')
            .replace(/href="favicon\.ico/g, 'href="/favicon.ico')
            .replace(/href="manifest\.json"/g, 'href="/manifest.json"')
            .replace(/href="([a-z-]+)\.html"/g, 'href="/$1.html"')
            .replace(/href="servizi\//g, 'href="/servizi/')
            .replace(/href="blog\//g, 'href="/blog/')
            .replace(/href="portfolio\./g, 'href="/portfolio.')
            .replace(/src="search-index\.json"/g, 'src="/search-index.json"');

        return fullHtml;
    }

    // ── 1. Agenzia Web Hub ──
    const networkCities = cities.filter(c => c.generate.agenzia);
    const agenziaCities = networkCities.filter(c => isApprovedHubTarget('agenzia-web', c.slug));
    const agenziaCitiesUi = withCityUiMeta(agenziaCities);
    const agenziaData = {
        cities: agenziaCitiesUi,
        coreServices: coreServices,
        networkCoverageCount: networkCities.length,
        totalCities: agenziaCities.length,
        today: PAGE_DATE_ISO_TOKEN,
        todayFormatted: PAGE_DATE_HUMAN_TOKEN,
        site: SITE
    };
    const agenziaContent = njkEnv.render('hub-agenzia-web.njk', agenziaData);
    const agenziaSchemas = [
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": "Agenzia Web — Comuni Milano", "item": SITE + "/agenzia-web/" }
            ]
        },
        {
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": "Agenzia Web nei Comuni della Provincia di Milano",
            "description": `I ${agenziaCities.length} comuni con una pagina agenzia web dedicata, all'interno dei ${networkCities.length} territori dell'hinterland milanese serviti da WebNovis, con sede a Rho.`,
            "url": SITE + "/agenzia-web/",
            "inLanguage": "it",
            "dateModified": PAGE_DATE_ISO_TOKEN,
            "isPartOf": { "@type": "WebSite", "url": SITE + "/" },
            "numberOfItems": agenziaCities.length,
            "hasPart": agenziaCities.map(c => ({
                "@type": "WebPage",
                "name": `Agenzia Web ${c.name}`,
                "url": `${SITE}/agenzia-web-${c.slug}.html`
            }))
        }
    ];
    const agenziaHtml = buildHubPage(
        'agenzia-web',
        'Agenzia Web nei Comuni di Milano — WebNovis | Web Agency Hinterland',
        `Agenzia web per PMI e professionisti in ${networkCities.length} comuni dell'hinterland milanese: siti custom senza WordPress, grafica, e-commerce e presenza locale. Sede a Rho.`,
        'agenzia web Milano, web agency hinterland milanese, agenzia web comuni Milano, WebNovis',
        agenziaContent,
        agenziaSchemas
    );
    results.push({ dir: 'agenzia-web', html: agenziaHtml });

    // ── 2. Realizzazione Siti Web Hub ──
    const realizzazioneCities = cities.filter(c =>
        c.generate.realizzazione && isApprovedHubTarget('realizzazione-siti-web', c.slug)
    );
    const realizzazioneCitiesUi = withCityUiMeta(realizzazioneCities);
    const realizzazioneData = {
        cities: realizzazioneCitiesUi,
        networkCoverageCount: networkCities.length,
        totalCities: realizzazioneCities.length,
        today: PAGE_DATE_ISO_TOKEN,
        todayFormatted: PAGE_DATE_HUMAN_TOKEN,
        site: SITE
    };
    const realizzazioneContent = njkEnv.render('hub-realizzazione-siti-web.njk', realizzazioneData);
    const realizzazioneSchemas = [
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": "Realizzazione Siti Web — Comuni Milano", "item": SITE + "/realizzazione-siti-web/" }
            ]
        },
        {
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": "Realizzazione Siti Web a Milano e in Lombardia",
            "description": `Realizzazione siti web a Milano e in Lombardia: i ${realizzazioneCities.length} comuni con una pagina dedicata, nei ${networkCities.length} territori serviti da WebNovis con sede a Rho.`,
            "url": SITE + "/realizzazione-siti-web/",
            "inLanguage": "it",
            "dateModified": PAGE_DATE_ISO_TOKEN,
            "isPartOf": { "@type": "WebSite", "url": SITE + "/" },
            "numberOfItems": realizzazioneCities.length,
            "hasPart": realizzazioneCities.map(c => ({
                "@type": "WebPage",
                "name": `Realizzazione Siti Web ${c.name}`,
                "url": `${SITE}/realizzazione-siti-web-${c.slug}.html`
            }))
        }
    ];
    const realizzazioneHtml = buildHubPage(
        'realizzazione-siti-web',
        // GSC: query "realizzazione/creazione siti web lombardia" (370+ impr a pos 76-84)
        // → l'hub ora copre esplicitamente Milano e Lombardia
        'Realizzazione Siti Web a Milano e in Lombardia — WebNovis',
        `Realizzazione siti web a Milano e in Lombardia per PMI e professionisti: codice custom senza WordPress, SEO integrata e design su misura. Sede a Rho, ${networkCities.length} comuni serviti.`,
        'realizzazione siti web Milano, realizzazione siti web Lombardia, creazione siti web Lombardia, siti web hinterland milanese, WebNovis',
        realizzazioneContent,
        realizzazioneSchemas
    );
    results.push({ dir: 'realizzazione-siti-web', html: realizzazioneHtml });

    // ── 3. Zone Servite Hub (trasversale) ──
    const serviceCities = {};
    const serviceCityCounts = {};
    const geoEligibleServices = services.filter(shouldGenerateGeoForService).filter((service) => {
        const approvedCities = networkCities.filter((city) => isApprovedHubTarget(service.slug, city.slug));
        serviceCities[service.slug] = withCityUiMeta(approvedCities);
        serviceCityCounts[service.slug] = approvedCities.length;
        return approvedCities.length > 0;
    });
    const serviceCoverageCities = [...new Map(
        Object.values(serviceCities).flat().map((city) => [city.slug, city])
    ).values()];
    const coverageScopes = buildCoverageScopes(agenziaCities, realizzazioneCities, serviceCoverageCities);
    const featuredCities = withCityUiMeta(agenziaCities.filter((city) => city.slug !== 'rho'));
    const totalItems = agenziaCities.length + realizzazioneCities.length + Object.values(serviceCityCounts).reduce((sum, count) => sum + count, 0);

    const zoneData = {
        agenziaCities: withCityUiMeta(agenziaCities),
        agenziaCount: agenziaCities.length,
        networkCoverageCount: networkCities.length,
        realizzazioneCities: withCityUiMeta(realizzazioneCities),
        realizzazioneCount: realizzazioneCities.length,
        geoServices: geoEligibleServices,
        serviceCities: serviceCities,
        serviceCityCounts: serviceCityCounts,
        coverageScopes: coverageScopes,
        featuredCities: featuredCities,
        totalIndexablePages: totalItems,
        today: PAGE_DATE_ISO_TOKEN,
        todayFormatted: PAGE_DATE_HUMAN_TOKEN,
        site: SITE
    };
    const zoneContent = njkEnv.render('hub-zone-servite.njk', zoneData);

    const zoneSchemas = [
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": "Zone Servite", "item": SITE + "/zone-servite/" }
            ]
        },
        {
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": "Zone servite da WebNovis: comuni e servizi",
            "description": `I comuni dell'hinterland milanese in cui WebNovis segue PMI e professionisti, con le pagine dedicate per agenzia web, realizzazione siti, e-commerce, SEO locale e altri servizi.`,
            "url": SITE + "/zone-servite/",
            "inLanguage": "it",
            "dateModified": PAGE_DATE_ISO_TOKEN,
            "isPartOf": { "@type": "WebSite", "url": SITE + "/" },
            "numberOfItems": totalItems,
            "hasPart": [
                { "@type": "CollectionPage", "name": `Agenzia web: ${agenziaCities.length} comuni con pagina dedicata`, "url": SITE + "/agenzia-web/" },
                { "@type": "CollectionPage", "name": `Realizzazione siti web: ${realizzazioneCities.length} comuni con pagina dedicata`, "url": SITE + "/realizzazione-siti-web/" }
            ]
        }
    ];
    const zoneHtml = buildHubPage(
        'zone-servite',
        'Zone servite: agenzia web nell’hinterland milanese | WebNovis',
        `WebNovis è l’agenzia web con sede a Rho che segue PMI e professionisti in ${networkCities.length} comuni dell’hinterland milanese: siti custom, e-commerce, SEO locale, grafica e social.`,
        'zone servite WebNovis, agenzia web hinterland milanese, web agency comuni Milano, siti web provincia Milano',
        zoneContent,
        zoneSchemas
    );
    results.push({ dir: 'zone-servite', html: zoneHtml });

    return results;
}

module.exports = {
    generateHubPages,
    HUB_CSS
};
