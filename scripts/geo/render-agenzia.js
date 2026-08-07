/**
 * Agenzia geo page generator (Nunjucks + hand-crafted Rho path support).
 */
const fs = require('fs');
const path = require('path');
const {
    ROOT,
    SITE,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    resolvePageTier,
    buildRobotsContent,
    isIndexableGeoPath
} = require('./config');
const {
    cities,
    contentBlocks,
    tableServices,
    cityMap,
    getProvinceDisplay,
    getRelevantBlogLinks,
    njkEnv
} = require('./data');
const { getNearestCities, toCity } = require('./html-utils');
const { getBasePage } = require('./paths');
const { resolvePageFaqs } = require('./faq');
const { getGeoEditorialRecord, applyEditorialSeoOverrides } = require('./editorial');
const { getAgenziaSeoCopy } = require('./copy');
const { generateSchemas } = require('./schema');
const { updateDerivedHeadMeta } = require('./head-meta');
const { buildLocalContextHtml } = require('./link-graph');
const { readApprovedContentBlock } = require('../../config/content-claim-governance');

function generateAgenziaPage(city) {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) {
        console.error('❌ Base page agenzia-web-rho.html not found');
        return null;
    }

    const canonical = `${SITE}/agenzia-web-${city.slug}.html`;
    const editorial = getGeoEditorialRecord(`/agenzia-web-${city.slug}.html`);
    const agenziaSeo = applyEditorialSeoOverrides(getAgenziaSeoCopy(city), editorial);

    // Compute data for template
    const approvedAgencyCities = cities.filter((candidate) =>
        isIndexableGeoPath(`/agenzia-web-${candidate.slug}.html`)
    );
    const nearest = getNearestCities(city, approvedAgencyCities, 5);
    const nearCitiesData = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        return nc ? { name: nc.name, wiki: nc.wikipedia } : { name: ncSlug };
    });

    const relatedPages = nearest.map(nc => ({
        url: `/agenzia-web-${nc.slug}.html`,
        label: `Agenzia Web ${nc.name}`,
        distance: nc.distanzaSede,
        population: nc.population ? nc.population.toLocaleString('it-IT') : null
    }));

    const blogLinks = getRelevantBlogLinks(city);

    // Tier classification for the agenzia-web-<city> page
    const pagePathAgenzia = `/agenzia-web-${city.slug}.html`;
    const agenziaTier = resolvePageTier(pagePathAgenzia);
    const agenziaIsIndexable = agenziaTier > 0;

    // Load Tier 1 editorial override when available (hand-crafted per-city content).
    // File naming: data/content-blocks/tier1-<city>-agenzia-web.json
    let agenziaTier1Content = null;
    if (agenziaTier === 1) {
        const tier1Path = path.join(ROOT, 'data', 'content-blocks', `tier1-${city.slug}-agenzia-web.json`);
        if (fs.existsSync(tier1Path)) {
            agenziaTier1Content = readApprovedContentBlock(tier1Path);
        }
    }

    // Build template data for agenzia
    const ctx = city.localContext || {};
    const aiBlock = contentBlocks.get(city.slug); // AI-generated content (if available)

    // AI content enrichment: merge AI-generated blocks with defaults
    const section3Text = aiBlock?.localMarketAnalysis
        ? `<p>${aiBlock.localMarketAnalysis}</p>` + (aiBlock.competitiveContext ? `<p>${aiBlock.competitiveContext}</p>` : '')
        : buildLocalContextHtml(city);
    const resolvedFaqs = (editorial && editorial.faqs && editorial.faqs.length)
        ? editorial.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
        : resolvePageFaqs(city, 'agenzia', aiBlock);
    const section1Intro = aiBlock?.competitiveContext
        ? (ctx.tessutoEconomico || '') + ' ' + aiBlock.competitiveContext
        : ctx.tessutoEconomico || `${city.name} è un comune dell'hinterland milanese con un tessuto imprenditoriale attivo.`;

    const templateData = {
        city: {
            ...city,
            provinceDisplay: getProvinceDisplay(city),
            breadcrumbLabel: `Agenzia Web ${city.name}`,
            h1: city.isSede
                ? `Agenzia Web ${toCity(city.name)}: Siti Custom, Grafica e Social per l'Hinterland Milanese`
                : `Agenzia Web ${toCity(city.name)}: Siti Professionali per Imprese e Professionisti`,
            heroCapsule: city.isSede
                ? `<strong>WebNovis</strong> è l'agenzia web con sede a Rho per PMI e professionisti dell'hinterland milanese. Codice 100% custom — zero WordPress, zero template. Richiesta di preventivo gratuita.`
                : `<strong>WebNovis</strong> è l'agenzia web di riferimento per PMI e professionisti di ${city.name}. Sede a Rho (${city.distanzaSede} in auto), incontri presso i clienti o in videochiamata. Codice 100% custom — zero WordPress, zero template. Richiesta di preventivo gratuita.`,
            section1Title: ctx.highlights
                ? `Perché un'agenzia web vicina è un vantaggio per le imprese di ${city.name}?`
                : `Perché scegliere un'agenzia web locale ${toCity(city.name)}?`,
            section1Intro: section1Intro,
            cards1: [
                {
                    h3: city.isSede ? 'Sede operativa qui' : `${city.distanzaSede} dalla nostra sede`,
                    p: city.isSede
                        ? `WebNovis ha sede a Rho, in Via S. Giorgio 2. Incontri rapidi in azienda, comunicazione diretta.`
                        : `WebNovis ha sede a Rho, a ${city.distanzaSede} in auto da ${city.name}. Incontri rapidi in azienda, senza traffico milanese.`
                },
                {
                    h3: 'Conoscenza del territorio',
                    p: ctx.highlights
                        ? `Conosciamo il tessuto imprenditoriale di ${city.name}: ${ctx.highlights.slice(0, 2).join(', ')}. Sappiamo comunicare l'offerta delle PMI locali.`
                        : `Conosciamo il tessuto imprenditoriale di ${city.name} e i bisogni digitali delle PMI locali.`
                },
                {
                    h3: 'Comunicazione e responsabilità chiare',
                    p: 'Referenti, canali di confronto e tempi di risposta vengono definiti nella proposta, in base al perimetro e alle priorità del progetto.'
                }
            ],
            section3Title: `${city.name} e il contesto imprenditoriale: perché investire nel digitale`,
            section3Text: section3Text,
            ctaTitle: `Pronto a portare online la tua attività di ${city.name}?`,
            hasAiContent: !!aiBlock
        },
        services: tableServices,
        faqs: resolvedFaqs,
        nearCitiesData: nearCitiesData,
        relatedPages: relatedPages,
        blogLinks: blogLinks,
        tier: agenziaTier,
        isIndexable: agenziaIsIndexable,
        tier1Content: agenziaTier1Content,
        editorial: editorial || null,
        today: PAGE_DATE_ISO_TOKEN,
        todayFormatted: PAGE_DATE_HUMAN_TOKEN,
        site: SITE
    };

    // Render content via Nunjucks
    const contentHtml = njkEnv.render('agenzia-web-content.njk', templateData);

    // Extract head from Rho base, replace meta
    const rhoHeadEnd = rhoPage.indexOf('</head>');

    let headBlock = updateDerivedHeadMeta(rhoPage.substring(0, rhoHeadEnd), {
        title: agenziaSeo.title,
        description: agenziaSeo.description,
        keywords: agenziaSeo.keywords,
        canonical,
        robots: buildRobotsContent(`/agenzia-web-${city.slug}.html`),
        ogTitle: agenziaSeo.ogTitle,
        ogDescription: agenziaSeo.ogDescription
    });
    // Extract nav from Rho body
    const bodyStart = rhoPage.indexOf('<body>');
    const mainStart = rhoPage.indexOf('<main');
    const navHtml = rhoPage.substring(bodyStart, mainStart);

    // Extract footer
    const footerStart = rhoPage.indexOf('<footer');
    const footerEnd = rhoPage.indexOf('</footer>') + '</footer>'.length;
    let footerHtml = rhoPage.substring(footerStart, footerEnd);

    // Inject geo links into footer Località section
    // Footer links managed by the Rho base template (Località section)

    // Get tail (CSS + scripts after footer)
    const afterFooter = rhoPage.substring(footerEnd);
    const searchCssIdx = afterFooter.indexOf('<link href="css/search');
    const tailBlock = searchCssIdx >= 0 ? afterFooter.substring(searchCssIdx) : afterFooter;

    // Generate JSON-LD schemas
    const schemas = generateSchemas(city, 'agenzia', resolvedFaqs);
    const schemasHtml = schemas.map(s =>
        `<script type="application/ld+json">${JSON.stringify(s)}</script>`
    ).join('\n');

    // Assemble full page
    const fullPage = headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;

    return fullPage;
}

module.exports = {
    generateAgenziaPage
};
