/**
 * WebNovis — Unified Geo Page Generator v3 (pSEO Infrastructure)
 *
 * Generates BOTH page types from centralized data + Nunjucks templates:
 *   1. agenzia-web-{city}.html  — "Agenzia Web a {City}" pages
 *   2. realizzazione-siti-web-{city}.html — "Realizzazione Siti Web a {City}" pages
 *
 * Data sources:  data/cities.json, data/services.json
 * Templates:     templates/agenzia-web-content.njk (Nunjucks)
 *                templates/base-pages/realizzazione-siti-web-source.html (regex base)
 * Base page:     templates/base-pages/agenzia-web-source.html (head/nav/footer extraction)
 *
 * Features:
 *   - Centralized data layer (JSON)
 *   - Nunjucks template engine for agenzia pages
 *   - Automatic internal linking between all geo pages
 *   - Automatic JSON-LD schema generation (BreadcrumbList, WebPage, LocalBusiness, Service, FAQPage)
 *   - GEO optimization: answer capsule, comparison table, statistics density
 *   - Blog cross-linking from search-index.json / dist/search-index.json
 *   - Validation: word count, link count, schema presence
 *   - Generates data/link-graph.json for cross-referencing
 *
 * Usage: node scripts/generate-all-geo.js [--dry-run] [--validate-only] [--type=agenzia|realizzazione|all] [--out-dir=dist]
 */

const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

// ─── Configuration ────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const BASE_PAGE_DIR = path.join(ROOT, 'templates', 'base-pages');
const SITE = 'https://www.webnovis.com';
const SEDE_LAT = '45.5299';
const SEDE_LNG = '9.0393';
const FIRST_DEPLOY_DATE = '2026-02-27';
const TODAY = new Date().toISOString().split('T')[0];
const TODAY_FORMATTED = new Date().toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
});

// Cache for base HTML pages (read once, reuse for all cities)
const _basePageCache = {};
function getBasePage(filename) {
    if (!_basePageCache[filename]) {
        const p = path.join(BASE_PAGE_DIR, filename);
        if (!fs.existsSync(p)) return null;
        _basePageCache[filename] = fs.readFileSync(p, 'utf8');
    }
    return _basePageCache[filename];
}

// CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VALIDATE_ONLY = args.includes('--validate-only');
const typeArg = args.find(a => a.startsWith('--type='));
const GEN_TYPE = typeArg ? typeArg.split('=')[1] : 'all';
const outDirArg = args.find(a => a.startsWith('--out-dir='));
const PUBLISH_DIR = path.resolve(ROOT, outDirArg ? outDirArg.split('=')[1] : (process.env.PUBLISH_DIR || '.'));

function resolvePublishPath(...segments) {
    return path.join(PUBLISH_DIR, ...segments);
}

function writePublishedFile(relativePath, html) {
    const targetPath = resolvePublishPath(relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, html, 'utf8');
}

// ─── Load Data ────────────────────────────────────────────────────────────────
const citiesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const servicesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
const cities = citiesData.cities;
const services = servicesData.services;
const coreServices = services.filter(s => s.tier === 'core');
const sede = citiesData._meta.sede;

// Build city lookup map
const cityMap = new Map();
cities.forEach(c => cityMap.set(c.slug, c));

// Load AI-generated content blocks (from generate-ai-content.js)
const CONTENT_BLOCKS_DIR = path.join(ROOT, 'data', 'content-blocks');
const contentBlocks = new Map();
if (fs.existsSync(CONTENT_BLOCKS_DIR)) {
    for (const file of fs.readdirSync(CONTENT_BLOCKS_DIR).filter(f => f.endsWith('.json'))) {
        try {
            const slug = file.replace('.json', '');
            contentBlocks.set(slug, JSON.parse(fs.readFileSync(path.join(CONTENT_BLOCKS_DIR, file), 'utf8')));
        } catch (e) { /* skip malformed content blocks */ }
    }
}
if (contentBlocks.size > 0) {
    console.log(`  AI content blocks loaded: ${contentBlocks.size} cities`);
}

// Load blog search index for cross-linking (optional)
let blogIndex = [];
const searchIndexPath = [
    path.join(PUBLISH_DIR, 'search-index.json'),
    path.join(ROOT, 'search-index.json')
].find((candidate) => fs.existsSync(candidate));
if (searchIndexPath) {
    try {
        const allIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
        blogIndex = allIndex.filter(i => i.type === 'articolo' && i.url);
    } catch (e) { /* search index not available */ }
}

// ─── Configure Nunjucks ───────────────────────────────────────────────────────
const njkEnv = nunjucks.configure(path.join(ROOT, 'templates'), {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true
});
njkEnv.addFilter('localeNumber', (num) => num ? Number(num).toLocaleString('it-IT') : '');

// ─── Utility Functions ────────────────────────────────────────────────────────

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestCities(city, allCities, limit = 5) {
    return allCities
        .filter(c => c.slug !== city.slug)
        .map(c => ({
            ...c,
            distance: haversineKm(city.lat, city.lng, c.lat, c.lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
}

function getRelevantBlogLinks(city, limit = 3) {
    const relevantKeywords = ['seo', 'sito web', 'ecommerce', 'web agency', 'preventivo', 'quanto costa'];
    return blogIndex
        .filter(b => relevantKeywords.some(kw =>
            (b.title || '').toLowerCase().includes(kw) ||
            (b.keywords || '').toLowerCase().includes(kw)
        ))
        .slice(0, limit)
        .map(b => ({
            url: b.url,
            title: b.title || '',
            description: (b.description || '').slice(0, 120)
        }));
}

function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text) {
    return stripHtml(text).split(/\s+/).filter(w => w.length > 1).length;
}

function xmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Schema Generation ───────────────────────────────────────────────────────

function generateSchemas(city, pageType) {
    const slug = pageType === 'agenzia'
        ? `agenzia-web-${city.slug}.html`
        : `realizzazione-siti-web-${city.slug}.html`;
    const canonical = `${SITE}/${slug}`;
    const breadcrumbLabel = pageType === 'agenzia'
        ? `Agenzia Web ${city.name}`
        : `Realizzazione Siti Web a ${city.name}`;

    // Build areaServed from nearCities
    const nearCityObjects = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        if (!nc) return { "@type": "City", "name": ncSlug };
        const obj = { "@type": "City", "name": nc.name };
        if (nc.wikipedia) obj.sameAs = nc.wikipedia;
        return obj;
    });
    nearCityObjects.push(
        { "@type": "AdministrativeArea", "name": "Hinterland milanese" },
        { "@type": "AdministrativeArea", "name": "Città Metropolitana di Milano" }
    );

    const faqs = (city.faqs && city.faqs[pageType]) || [];

    const schemas = [
        // BreadcrumbList (3 levels: Home → Hub → City)
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": "Agenzia Web", "item": SITE + "/agenzia-web/" },
                { "@type": "ListItem", "position": 3, "name": breadcrumbLabel, "item": canonical }
            ]
        },
        // WebPage with SpeakableSpecification
        {
            "@context": "https://schema.org", "@type": "WebPage",
            "@id": canonical,
            "name": breadcrumbLabel + " — WebNovis",
            "description": `WebNovis è l'agenzia web per ${city.name} e hinterland milanese. Siti 100% custom, graphic design, social media. Sede a Rho, ${city.distanzaSede} da ${city.name}.`,
            "url": canonical,
            "inLanguage": "it",
            "isPartOf": { "@id": SITE + "/#website" },
            "about": { "@id": SITE + "/#organization" },
            "datePublished": FIRST_DEPLOY_DATE,
            "dateModified": TODAY,
            "speakable": {
                "@type": "SpeakableSpecification",
                "cssSelector": [".answer-capsule", "h1"]
            }
        },
        // LocalBusiness
        {
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "@id": canonical + "#localbusiness-" + city.slug,
            "name": "WebNovis — Agenzia Web " + city.name,
            "alternateName": "Web Novis " + city.name,
            "url": canonical,
            "parentOrganization": { "@id": SITE + "/#organization" },
            "description": `Agenzia web per ${city.name} e hinterland milanese specializzata in siti web 100% custom, graphic design e social media marketing. Sede a Rho (MI), ${city.distanzaSede} da ${city.name}.`,
            "telephone": "+393802647367",
            "email": "hello@webnovis.com",
            "priceRange": "€€",
            "currenciesAccepted": "EUR",
            "address": {
                "@type": "PostalAddress", "@id": SITE + "/#address",
                "streetAddress": "Via S. Giorgio, 2",
                "addressLocality": "Rho", "addressRegion": "MI",
                "postalCode": "20017", "addressCountry": "IT"
            },
            "geo": { "@type": "GeoCoordinates", "latitude": SEDE_LAT, "longitude": SEDE_LNG },
            "hasMap": "https://maps.google.com/?q=Via+S.+Giorgio+2%2C+20017+Rho+MI",
            "areaServed": nearCityObjects,
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": { "@type": "GeoCoordinates", "latitude": SEDE_LAT, "longitude": SEDE_LNG },
                "geoRadius": "20000"
            },
            "openingHoursSpecification": [{
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00", "closes": "23:59"
            }],
            "sameAs": [SITE + "/#organization"],
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Servizi Web a " + city.name,
                "itemListElement": services.map(svc => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": svc.shortName + " a " + city.name,
                        "url": SITE + svc.url
                    }
                }))
            }
        },
        // Service
        {
            "@context": "https://schema.org", "@type": "Service",
            "@id": canonical + "#service",
            "serviceType": "Web Development",
            "name": "Sviluppo Siti Web a " + city.name,
            "description": `Realizzazione siti web 100% custom per aziende di ${city.name} e comuni limitrofi.`,
            "provider": { "@id": SITE + "/#organization" },
            "areaServed": nearCityObjects.slice(0, 6),
            "offers": [
                { "@type": "Offer", "name": "Landing Page", "price": "500", "priceCurrency": "EUR" },
                { "@type": "Offer", "name": "Sito Vetrina", "price": "1200", "priceCurrency": "EUR" },
                { "@type": "Offer", "name": "E-Commerce Custom", "price": "3500", "priceCurrency": "EUR" }
            ]
        }
    ];

    // FAQPage schema (only if FAQs exist)
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

    return schemas;
}

function stripJsonLdFromHead(headHtml) {
    return headHtml
        .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
        .replace(/\n{3,}/g, '\n\n');
}

function updateDerivedHeadMeta(headHtml, meta) {
    let updated = stripJsonLdFromHead(headHtml)
        .replace(/<title>[^<]+<\/title>/, `<title>${meta.title}</title>`)
        .replace(/content="[^"]*" name="description"/, `content="${meta.description}" name="description"`)
        .replace(/href="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `href="${meta.canonical}"`)
        .replace(/content="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `content="${meta.canonical}"`)
        .replace(/content="[^"]*" property="og:title"/, `content="${meta.ogTitle || meta.title}" property="og:title"`)
        .replace(/content="[^"]*" property="og:description"/, `content="${meta.ogDescription || meta.description}" property="og:description"`)
        .replace(/content="[^"]*" name="twitter:title"/, `content="${meta.twitterTitle || meta.ogTitle || meta.title}" name="twitter:title"`)
        .replace(/content="[^"]*" property="twitter:title"/, `content="${meta.twitterTitle || meta.ogTitle || meta.title}" property="twitter:title"`)
        .replace(/content="[^"]*" name="twitter:description"/, `content="${meta.twitterDescription || meta.ogDescription || meta.description}" name="twitter:description"`)
        .replace(/content="[^"]*" property="twitter:description"/, `content="${meta.twitterDescription || meta.ogDescription || meta.description}" property="twitter:description"`);

    if (meta.keywords) {
        updated = updated.replace(/content="[^"]*" name="keywords"/, `content="${meta.keywords}" name="keywords"`);
    }

    return updated;
}

// ─── Agenzia Page Generator (Nunjucks-based) ─────────────────────────────────

function generateAgenziaPage(city) {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) {
        console.error('❌ Base page agenzia-web-rho.html not found');
        return null;
    }

    const canonical = `${SITE}/agenzia-web-${city.slug}.html`;

    // Compute data for template
    const nearest = getNearestCities(city, cities, 5);
    const nearCitiesData = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        return nc ? { name: nc.name, wiki: nc.wikipedia } : { name: ncSlug };
    });

    const relatedPages = nearest.map(nc => ({
        url: `agenzia-web-${nc.slug}.html`,
        label: `Agenzia Web ${nc.name}`,
        distance: nc.distanzaSede,
        population: nc.population ? nc.population.toLocaleString('it-IT') : null
    }));

    const blogLinks = getRelevantBlogLinks(city);

    // Build template data for agenzia
    const ctx = city.localContext || {};
    const aiBlock = contentBlocks.get(city.slug); // AI-generated content (if available)

    // AI content enrichment: merge AI-generated blocks with defaults
    const section3Text = aiBlock?.localMarketAnalysis
        ? `<p>${aiBlock.localMarketAnalysis}</p>` + (aiBlock.competitiveContext ? `<p>${aiBlock.competitiveContext}</p>` : '')
        : buildLocalContextHtml(city);
    const agenziaFaqs = (aiBlock?.faqsAgenzia && aiBlock.faqsAgenzia.length >= 3)
        ? aiBlock.faqsAgenzia
        : (city.faqs && city.faqs.agenzia) || [];
    const section1Intro = aiBlock?.competitiveContext
        ? (ctx.tessutoEconomico || '') + ' ' + aiBlock.competitiveContext
        : ctx.tessutoEconomico || `${city.name} è un comune dell'hinterland milanese con un tessuto imprenditoriale attivo.`;

    const templateData = {
        city: {
            ...city,
            breadcrumbLabel: `Agenzia Web ${city.name}`,
            h1: city.isSede
                ? `Agenzia Web a ${city.name}: Siti Custom, Grafica e Social per l'Hinterland Milanese`
                : `Agenzia Web a ${city.name}: Siti Professionali per Imprese e Professionisti`,
            heroCapsule: city.isSede
                ? `<strong>WebNovis</strong> è l'agenzia web con sede a Rho per PMI e professionisti dell'hinterland milanese. Codice 100% custom — zero WordPress, zero template. Preventivo gratuito entro 24 ore.`
                : `<strong>WebNovis</strong> è l'agenzia web di riferimento per PMI e professionisti di ${city.name}. Sede a Rho (${city.distanzaSede} in auto), incontri presso i clienti o in videochiamata. Codice 100% custom — zero WordPress, zero template. Preventivo gratuito entro 24 ore.`,
            section1Title: ctx.highlights
                ? `Perché un'agenzia web vicina è un vantaggio per le imprese di ${city.name}?`
                : `Perché scegliere un'agenzia web locale a ${city.name}?`,
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
                    h3: 'Risposta in 2 ore lavorative',
                    p: 'Il fondatore segue ogni progetto. Nessun call center, nessun account manager. Comunicazione diretta e tempi di risposta garantiti.'
                }
            ],
            section3Title: `${city.name} e il contesto imprenditoriale: perché investire nel digitale`,
            section3Text: section3Text,
            faqs: agenziaFaqs,
            ctaTitle: `Pronto a portare online la tua attività di ${city.name}?`,
            hasAiContent: !!aiBlock
        },
        services: coreServices,
        nearCitiesData: nearCitiesData,
        relatedPages: relatedPages,
        blogLinks: blogLinks,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
        site: SITE
    };

    // Render content via Nunjucks
    const contentHtml = njkEnv.render('agenzia-web-content.njk', templateData);

    // Extract head from Rho base, replace meta
    const rhoHeadEnd = rhoPage.indexOf('</head>');

    let headBlock = updateDerivedHeadMeta(rhoPage.substring(0, rhoHeadEnd), {
        title: `Agenzia Web a ${city.name} (Milano) — WebNovis | Siti Web Custom, Grafica e Social`,
        description: `Agenzia web per ${city.name}: siti 100% custom, grafica e social. Sede a Rho, ${city.distanzaSede}. Preventivo gratuito 24h.`,
        keywords: `agenzia web ${city.name}, web agency ${city.name} Milano, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}`,
        canonical,
        ogTitle: `Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing`,
        ogDescription: `WebNovis è l'agenzia web per ${city.name} e hinterland milanese. Siti 100% custom, grafica e social. Sede a Rho, ${city.distanzaSede}. Preventivo gratuito.`
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
    const schemas = generateSchemas(city, 'agenzia');
    const schemasHtml = schemas.map(s =>
        `<script type="application/ld+json">${JSON.stringify(s)}</script>`
    ).join('\n');

    // Assemble full page
    const fullPage = headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;

    return fullPage;
}

// ─── Realizzazione Page Generator (regex-based on Rho template) ───────────────

function generateRealizzazionePage(city) {
    const basePage = getBasePage('realizzazione-siti-web-source.html');
    if (!basePage) {
        console.error('❌ Base page realizzazione-siti-web-rho.html not found');
        return null;
    }
    let page = basePage;

    const canonical = `${SITE}/realizzazione-siti-web-${city.slug}.html`;

    // Title and meta
    page = page.replace(/Creazione Siti Web a Rho \| Web Agency Locale — WebNovis/g,
        `Creazione Siti Web a ${city.name} | Web Agency Locale — WebNovis`);
    page = page.replace(/realizzazione siti web a Rho/gi, `realizzazione siti web a ${city.name}`);
    page = page.replace(/creazione di siti web a Rho/gi, `creazione di siti web a ${city.name}`);
    page = page.replace(/realizzazione-siti-web-rho\.html/g, `realizzazione-siti-web-${city.slug}.html`);

    // Meta description
    page = page.replace(/Cerchi un partner per la creazione di siti web a Rho\?[^"]+/,
        `Cerchi un partner per la creazione di siti web a ${city.name}? WebNovis realizza siti professionali, veloci e ottimizzati SEO per aziende e professionisti di ${city.name} e hinterland milanese. Preventivo gratuito in 24h →`);

    // Keywords
    page = page.replace(/realizzazione siti web rho, creazione siti web rho, siti web rho, web agency rho, siti internet rho, agenzia web rho, sviluppo siti web rho, siti web professionali rho Milano/,
        `realizzazione siti web ${city.slug.replace(/-/g, ' ')}, creazione siti web ${city.name.toLowerCase()}, siti web ${city.name.toLowerCase()}, web agency ${city.name.toLowerCase()}, siti internet ${city.name.toLowerCase()}, agenzia web ${city.name.toLowerCase()}, sviluppo siti web ${city.name.toLowerCase()}, siti web professionali ${city.name.toLowerCase()} Milano`);

    // OG tags
    page = page.replace(/Creazione Siti Web a Rho — Web Agency Locale per PMI e Professionisti/g,
        `Creazione Siti Web a ${city.name} — Web Agency Locale per PMI e Professionisti`);
    page = page.replace(/WebNovis realizza siti web professionali a Rho: codice 100% custom, SEO integrata, design premium\. Il partner digitale dell'hinterland milanese\./g,
        `WebNovis realizza siti web professionali a ${city.name}: codice 100% custom, SEO integrata, design premium. Il partner digitale dell'hinterland milanese.`);
    page = page.replace(/WebNovis realizza siti web professionali a Rho: codice 100% custom, SEO integrata, design premium\. Partner digitale dell'hinterland milanese\./g,
        `WebNovis realizza siti web professionali a ${city.name}: codice 100% custom, SEO integrata, design premium. Partner digitale dell'hinterland milanese.`);
    page = page.replace(/Siti professionali, veloci e ottimizzati SEO per aziende di Rho e hinterland milanese/,
        `Siti professionali, veloci e ottimizzati SEO per aziende di ${city.name} e hinterland milanese`);

    // Breadcrumb
    page = page.replace(/Realizzazione Siti Web a Rho<\/span>/g, `Realizzazione Siti Web a ${city.name}</span>`);
    page = page.replace(/"name": "Realizzazione Siti Web a Rho"/g, `"name": "Realizzazione Siti Web a ${city.name}"`);

    // Hero
    page = page.replace(/Web Agency Rho — Aggiornato 2026/, `Web Agency ${city.name} — Aggiornato 2026`);
    page = page.replace(/Realizzazione Siti Web a Rho — Il Tuo Partner Digitale Locale/,
        `Realizzazione Siti Web a ${city.name} — Il Tuo Partner Digitale Locale`);
    page = page.replace(/Cerchi una <strong>web agency a Rho<\/strong> per creare un sito web professionale[^<]+/,
        `Cerchi una <strong>web agency a ${city.name}</strong> per creare un sito web professionale che porti risultati concreti? WebNovis è il partner digitale dell'hinterland milanese: sviluppiamo siti su misura con <strong>codice 100% custom</strong>, design premium e SEO locale integrata. Dal brief alla messa online, un unico interlocutore dedicato.`);
    page = page.replace(/Rho, Milano \(MI\) 20017/, `${city.name}, Milano (MI) ${city.cap}`);

    // Schema LocalBusiness
    page = page.replace(/"WebNovis — Web Agency Rho"/g, `"WebNovis — Web Agency ${city.name}"`);
    page = page.replace(/"Web Novis Rho"/g, `"Web Novis ${city.name}"`);
    page = page.replace(/Web agency a Rho specializzata/g, `Web agency a ${city.name} specializzata`);
    page = page.replace(/"postalCode": "20017"/g, `"postalCode": "${city.cap}"`);
    page = page.replace(/"latitude": "45\.5299"/g, `"latitude": "${city.lat}"`);
    page = page.replace(/"longitude": "9\.0393"/g, `"longitude": "${city.lng}"`);
    page = page.replace(/Via\+S\.\+Giorgio\+2%2C\+20017\+Rho\+MI/g,
        `Via+S.+Giorgio+2%2C+${city.cap}+${city.name.replace(/ /g, '+')}+MI`);
    page = page.replace(/"Servizi Realizzazione Siti Web Rho"/, `"Servizi Realizzazione Siti Web ${city.name}"`);
    page = page.replace(/Sito Web Vetrina a Rho/g, `Sito Web Vetrina a ${city.name}`);
    page = page.replace(/E-Commerce a Rho/g, `E-Commerce a ${city.name}`);
    page = page.replace(/Landing Page a Rho/g, `Landing Page a ${city.name}`);
    page = page.replace(/Graphic Design Rho/g, `Graphic Design ${city.name}`);
    page = page.replace(/Social Media Marketing Rho/g, `Social Media Marketing ${city.name}`);

    // Content sections
    page = page.replace(/Perché la tua azienda a Rho/g, `Perché la tua azienda a ${city.name}`);
    page = page.replace(/per aziende di Rho/g, `per aziende di ${city.name}`);
    page = page.replace(/I nostri servizi di creazione siti web a Rho/g, `I nostri servizi di creazione siti web a ${city.name}`);
    page = page.replace(/della tua azienda a Rho/g, `della tua azienda a ${city.name}`);
    page = page.replace(/Perché scegliere WebNovis come web agency a Rho/g, `Perché scegliere WebNovis come web agency a ${city.name}`);
    page = page.replace(/Realizziamo siti web per aziende di Rho e dell'hinterland/g, `Realizziamo siti web per aziende di ${city.name} e dell'hinterland`);
    page = page.replace(/Quanto costa realizzare un sito web a Rho/g, `Quanto costa realizzare un sito web a ${city.name}`);
    page = page.replace(/Domande Frequenti — Realizzazione Siti Web a Rho/g, `Domande Frequenti — Realizzazione Siti Web a ${city.name}`);
    page = page.replace(/il sito web che la tua azienda a Rho merita/g, `il sito web che la tua azienda a ${city.name} merita`);
    page = page.replace(/la tua azienda a Rho o in videochiamata/g, `la tua azienda a ${city.name} o in videochiamata`);
    page = page.replace(/ricerche locali di Rho/g, `ricerche locali di ${city.name}`);
    page = page.replace(/del territorio rhodense/g, `del territorio di ${city.name}`);
    page = page.replace(/Ogni progetto di realizzazione siti web a Rho/g, `Ogni progetto di realizzazione siti web a ${city.name}`);
    page = page.replace(/per un'azienda di Rho"/g, `per un'azienda di ${city.name}"`);

    // Images
    if (city.images) {
        page = page.replace(
            /Img\/rho-fiera-milano-sm\.webp 320w, Img\/rho-fiera-milano\.webp 600w/,
            `Img/${city.images.img1.file}-sm.webp 320w, Img/${city.images.img1.file}.webp 600w`);
        page = page.replace(
            /src="Img\/rho-fiera-milano\.png" alt="[^"]+"/,
            `src="Img/${city.images.img1.file}.png" alt="${city.images.img1.alt}"`);
        page = page.replace(
            /Img\/rho-digital-ecosystem-sm\.webp 320w, Img\/rho-digital-ecosystem\.webp 600w/,
            `Img/${city.images.img2.file}-sm.webp 320w, Img/${city.images.img2.file}.webp 600w`);
        page = page.replace(
            /src="Img\/rho-digital-ecosystem\.png" alt="[^"]+"/,
            `src="Img/${city.images.img2.file}.png" alt="${city.images.img2.alt}"`);
    }

    // Market intro — inject unique local context (AI-enriched when available)
    const ctx = city.localContext || {};
    const aiBlock = contentBlocks.get(city.slug);

    const marketIntro = aiBlock?.localMarketAnalysis
        ? `${aiBlock.localMarketAnalysis}</p>\n                <p>${aiBlock.competitiveContext || ctx.opportunitaDigitale || ''}`
        : `${ctx.tessutoEconomico || ''}</p>\n                <p>${ctx.opportunitaDigitale || ''}`;

    if (ctx.tessutoEconomico || aiBlock?.localMarketAnalysis) {
        page = page.replace(
            /Rho non è un comune qualsiasi dell'hinterland milanese[\s\S]*?ROI più misurabile che puoi fare\.\s*<\/p>/,
            `${marketIntro}</p>
                <p>La differenza tra un sito che "c'è" e un sito che <strong>lavora per te 24/7</strong> sta nella qualità dell'agenzia che lo realizza: strategia, codice, design e SEO devono essere eccellenti, non "sufficienti".</p>`
        );
    }

    // Areas served
    const nearNames = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        return nc ? nc.name : ncSlug;
    });
    if (nearNames.length > 0) {
        page = page.replace(
            /I comuni che serviamo includono:[\s\S]*?<strong>Città Metropolitana di Milano<\/strong>\./,
            `I comuni che serviamo includono: ${nearNames.map(n => `<strong>${n}</strong>`).join(', ')} e tutta la <strong>Città Metropolitana di Milano</strong>.`
        );
    }

    // Inject AI-generated FAQ section for realizzazione (unique per city)
    let aiExtraHtml = '';
    if (aiBlock?.faqsRealizzazione && aiBlock.faqsRealizzazione.length > 0) {
        aiExtraHtml += `\n<section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container">`;
        aiExtraHtml += `<h2>Domande specifiche sulla realizzazione siti web a ${city.name}</h2>`;
        for (const faq of aiBlock.faqsRealizzazione) {
            aiExtraHtml += `<details class="faq-item"><summary>${faq.q}</summary><p>${faq.a}</p></details>`;
        }
        aiExtraHtml += `</div></section>\n`;
    }

    // Inject geo internal links + AI FAQ before </main>
    const geoLinksHtml = buildGeoLinksSection(city, 'realizzazione');
    page = page.replace('</main>', aiExtraHtml + geoLinksHtml + '</main>');

    return page;
}

// ─── Servizio×Città Page Generator (Nunjucks-based, third page type) ──────────

function generateServizioCittaPage(service, city) {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) return null;

    const slug = `${service.slug}-${city.slug}`;
    const canonical = `${SITE}/${slug}.html`;

    // Nearest cities that also have this service×city page
    const nearest = getNearestCities(city, cities, 5);
    const relatedCityPages = nearest
        .filter(nc => !nc.isSede && nc.population >= 15000)
        .slice(0, 3)
        .map(nc => ({
            url: `${service.slug}-${nc.slug}.html`,
            label: `${service.shortName} a ${nc.name}`,
            distance: nc.distanzaSede
        }));

    // Other services in the same city (only link to services that have geo pages)
    const geoServices = services.filter(s => s.generateGeoPages !== false && s.slug !== service.slug);
    const relatedServicePages = geoServices
        .filter(svc => city.population >= 15000 || svc.tier === 'core')
        .slice(0, 3)
        .map(svc => ({
            url: `${svc.slug}-${city.slug}.html`,
            label: `${svc.shortName} a ${city.name}`
        }));

    // AI content for this city
    const aiBlock = contentBlocks.get(city.slug);
    const aiContent = aiBlock?.localMarketAnalysis
        ? `<p>${aiBlock.localMarketAnalysis}</p>`
        : null;

    // Default FAQs for service×city
    const faqs = [
        { q: `Quanto costa ${service.name.toLowerCase()} a ${city.name}?`, a: `${service.name} a ${city.name}: da <strong>€${service.priceFrom}${service.priceUnit || ''}</strong>. Tempi: ${service.timeEstimate}. Preventivo gratuito personalizzato entro 24 ore.` },
        { q: `WebNovis è vicina a ${city.name}?`, a: `La nostra sede è a Rho, Via S. Giorgio 2 — ${city.distanzaSede} in auto da ${city.name}. Incontriamo i clienti in azienda o in videochiamata.` },
        { q: `Usate WordPress per ${service.name.toLowerCase()}?`, a: `No. Ogni progetto WebNovis è sviluppato con codice 100% custom. Performance superiori, sicurezza nativa, SEO ottimizzato — nessun template.` }
    ];

    const templateData = {
        city: city,
        service: service,
        nearCitiesData: (city.nearCities || []).slice(0, 5).map(ncSlug => {
            const nc = cityMap.get(ncSlug);
            return nc ? { name: nc.name } : { name: ncSlug };
        }),
        relatedCityPages: relatedCityPages,
        relatedServicePages: relatedServicePages,
        allCoreServices: coreServices,
        faqs: faqs,
        aiContent: aiContent,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
        site: SITE
    };

    const contentHtml = njkEnv.render('servizio-citta-content.njk', templateData);

    // Extract head, nav, footer from Rho base (same as agenzia pages)
    const rhoHeadEnd = rhoPage.indexOf('</head>');

    let headBlock = updateDerivedHeadMeta(rhoPage.substring(0, rhoHeadEnd), {
        title: `${service.name} a ${city.name} — WebNovis | ${service.idealFor}`,
        description: `${service.shortDesc} A ${city.name}, da €${service.priceFrom}${service.priceUnit || ''}. Sede a Rho, ${city.distanzaSede}.`,
        keywords: `${service.targetKeyword} ${city.name}, ${service.slug.replace(/-/g, ' ')} ${city.name}, WebNovis ${city.name}`,
        canonical,
        ogTitle: `${service.name} a ${city.name} — WebNovis`,
        ogDescription: `${service.shortDesc} Da €${service.priceFrom}${service.priceUnit || ''}. Sede a Rho, ${city.distanzaSede}.`
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
            "@context": "https://schema.org", "@type": "Service",
            "serviceType": service.name, "name": `${service.name} a ${city.name}`,
            "description": `${service.shortDesc} Per aziende di ${city.name} e hinterland milanese.`,
            "provider": { "@id": SITE + "/#organization" },
            "areaServed": { "@type": "City", "name": city.name, "sameAs": city.wikipedia },
            "offers": { "@type": "Offer", "price": String(service.priceFrom), "priceCurrency": "EUR" }
        },
        {
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question", "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]*>/g, '') }
            }))
        }
    ];
    const schemasHtml = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');

    return headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;
}

// ─── Hub Pages Generator (Internal Linking Bridge) ────────────────────────────

const HUB_CSS = `
<style>
.hub-city-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;margin-top:1.5rem}
.hub-city-grid--compact{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.75rem}
.hub-city-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:1.25rem 1rem;text-decoration:none;display:flex;flex-direction:column;gap:.25rem;transition:all .25s ease}
.hub-city-card:hover{border-color:rgba(91,106,174,.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.2)}
.hub-city-card--sm{padding:.75rem;border-radius:8px}
.hub-city-name{font-family:Syne,sans-serif;font-weight:700;color:var(--white);font-size:1rem}
.hub-city-card--sm .hub-city-name{font-size:.9rem}
.hub-city-meta{font-size:.8rem;color:var(--gray-light);opacity:.7}
.hub-city-pop{font-size:.75rem;color:var(--primary-light);opacity:.8}
@media(max-width:640px){.hub-city-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}
</style>`;

function generateHubPages() {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) {
        console.error('❌ Base page agenzia-web-rho.html not found — hub pages skipped');
        return [];
    }

    const results = [];

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
    const agenziaCities = cities.filter(c => c.generate.agenzia);
    const agenziaData = {
        cities: agenziaCities,
        coreServices: coreServices,
        totalCities: agenziaCities.length,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
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
            "description": `WebNovis è l'agenzia web con sede a Rho che opera in ${agenziaCities.length} comuni dell'hinterland milanese.`,
            "url": SITE + "/agenzia-web/",
            "inLanguage": "it",
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
        `Agenzia web per ${agenziaCities.length} comuni dell'hinterland milanese. Siti 100% custom, grafica e social. Sede a Rho. Preventivo gratuito.`,
        'agenzia web Milano, web agency hinterland milanese, agenzia web comuni Milano, WebNovis',
        agenziaContent,
        agenziaSchemas
    );
    results.push({ dir: 'agenzia-web', html: agenziaHtml });

    // ── 2. Realizzazione Siti Web Hub ──
    const realizzazioneCities = cities.filter(c => c.generate.realizzazione);
    const realizzazioneData = {
        cities: realizzazioneCities,
        totalCities: realizzazioneCities.length,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
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
            "name": "Realizzazione Siti Web nei Comuni della Provincia di Milano",
            "description": `Realizzazione siti web professionali per ${realizzazioneCities.length} comuni dell'hinterland milanese.`,
            "url": SITE + "/realizzazione-siti-web/",
            "inLanguage": "it",
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
        'Realizzazione Siti Web nei Comuni di Milano — WebNovis | Siti Custom',
        `Siti web professionali per ${realizzazioneCities.length} comuni dell'hinterland milanese. Codice custom, SEO integrata. Sede a Rho.`,
        'realizzazione siti web Milano, siti web hinterland milanese, creazione siti web comuni Milano, WebNovis',
        realizzazioneContent,
        realizzazioneSchemas
    );
    results.push({ dir: 'realizzazione-siti-web', html: realizzazioneHtml });

    // ── 3. Zone Servite Hub (trasversale) ──
    const geoEligibleServices = services.filter(s => s.generateGeoPages !== false);
    const eligibleCities = cities.filter(c => c.population >= 15000 && c.slug !== 'rho');
    const serviceCities = {};
    const serviceCityCounts = {};
    for (const svc of geoEligibleServices) {
        serviceCities[svc.slug] = eligibleCities;
        serviceCityCounts[svc.slug] = eligibleCities.length;
    }

    const zoneData = {
        agenziaCities: agenziaCities,
        agenziaCount: agenziaCities.length,
        realizzazioneCities: realizzazioneCities,
        realizzazioneCount: realizzazioneCities.length,
        geoServices: geoEligibleServices,
        serviceCities: serviceCities,
        serviceCityCounts: serviceCityCounts,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
        site: SITE
    };
    const zoneContent = njkEnv.render('hub-zone-servite.njk', zoneData);

    // Total items across all categories
    const totalItems = agenziaCities.length + realizzazioneCities.length + (geoEligibleServices.length * eligibleCities.length);
    const zoneSchemas = [
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": "Zone Servite", "item": SITE + "/zone-servite/" }
            ]
        },
        {
            "@context": "https://schema.org", "@type": "CollectionPage",
            "name": "Zone Servite da WebNovis — Servizi Web nell'Hinterland Milanese",
            "description": "Mappa completa di tutti i servizi WebNovis per comune: sviluppo web, e-commerce, SEO locale, branding.",
            "url": SITE + "/zone-servite/",
            "inLanguage": "it",
            "isPartOf": { "@type": "WebSite", "url": SITE + "/" },
            "numberOfItems": totalItems,
            "hasPart": [
                { "@type": "CollectionPage", "name": "Agenzia Web — Tutti i Comuni", "url": SITE + "/agenzia-web/" },
                { "@type": "CollectionPage", "name": "Realizzazione Siti Web — Tutti i Comuni", "url": SITE + "/realizzazione-siti-web/" }
            ]
        }
    ];
    const zoneHtml = buildHubPage(
        'zone-servite',
        'Zone Servite da WebNovis — Tutti i Servizi Web per Comune | Hinterland Milano',
        `Tutti i servizi WebNovis per comune: agenzia web, realizzazione siti, SEO locale e più in ${agenziaCities.length}+ comuni dell'hinterland milanese.`,
        'zone servite WebNovis, servizi web comuni Milano, agenzia web hinterland, web agency zone Milano',
        zoneContent,
        zoneSchemas
    );
    results.push({ dir: 'zone-servite', html: zoneHtml });

    return results;
}

// ─── Internal Linking Helpers ─────────────────────────────────────────────────

function buildGeoLinksSection(city, pageType) {
    const nearest = getNearestCities(city, cities, 3);
    if (nearest.length === 0) return '';

    const prefix = pageType === 'agenzia' ? 'agenzia-web-' : 'realizzazione-siti-web-';
    const label = pageType === 'agenzia' ? 'Agenzia Web' : 'Realizzazione Siti Web';
    const genKey = pageType === 'agenzia' ? 'agenzia' : 'realizzazione';

    const validNearest = nearest.filter(nc => nc.generate[genKey]).slice(0, 3);
    if (validNearest.length === 0) return '';

    let html = `\n<section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container">`;
    html += `<h2>Serviamo anche i comuni vicini a ${city.name}</h2>`;
    html += `<p>Scopri i nostri servizi nelle città vicine: `;
    const links = validNearest.map(nc =>
        `<a href="${prefix}${nc.slug}.html" style="color:var(--primary-light)">${label} a ${nc.name}</a> (${nc.distanzaSede})`
    );
    html += links.join(', ') + '.</p>';
    html += `</div></section>\n`;
    return html;
}

function buildLocalContextHtml(city) {
    const ctx = city.localContext || {};
    let html = '';
    if (ctx.tessutoEconomico) {
        html += `<p>Con ${city.population ? '<strong>' + city.population.toLocaleString('it-IT') + ' abitanti</strong> e ' : ''}`;
        html += `una posizione strategica nell'hinterland milanese, ${city.name} offre un mercato interessante per le PMI. `;
        html += ctx.tessutoEconomico + '</p>';
    }
    if (ctx.opportunitaDigitale) {
        html += `<p>${ctx.opportunitaDigitale}</p>`;
    }
    if (ctx.settoriChiave && ctx.settoriChiave.length > 0) {
        html += `<p>I settori chiave del territorio includono: <strong>${ctx.settoriChiave.join('</strong>, <strong>')}</strong>.</p>`;
    }
    return html;
}

// Footer injection removed — was dead code (bug #7). Footer links are managed by the
// Rho base template which already contains geo links in the Località section.

// ─── Validation ───────────────────────────────────────────────────────────────

function validatePage(html, filename) {
    const issues = [];
    const wordCount = countWords(html);

    // Word count check (target: ≥500 unique words)
    if (wordCount < 300) {
        issues.push(`⛔ CRITICAL: Only ${wordCount} words (minimum 300, target ≥500)`);
    } else if (wordCount < 500) {
        issues.push(`⚠ WARNING: ${wordCount} words (target ≥500)`);
    }

    // Internal links check (target: ≥5)
    const internalLinks = (html.match(/href="[^"]*\.html"/g) || []).length;
    if (internalLinks < 5) {
        issues.push(`⚠ WARNING: Only ${internalLinks} internal links (target ≥5)`);
    }

    // Schema check
    const schemaCount = (html.match(/application\/ld\+json/g) || []).length;
    if (schemaCount < 3) {
        issues.push(`⚠ WARNING: Only ${schemaCount} JSON-LD schemas (target ≥3)`);
    }

    // Canonical check
    if (!html.includes('rel="canonical"')) {
        issues.push('⛔ CRITICAL: Missing canonical tag');
    }

    // H1 check
    if (!/<h1[^>]*>/.test(html)) {
        issues.push('⛔ CRITICAL: Missing <h1> tag');
    }

    // Answer capsule check
    if (!html.includes('answer-capsule')) {
        issues.push('⚠ WARNING: Missing answer-capsule class (GEO optimization)');
    }

    return { filename, wordCount, internalLinks, schemaCount, issues };
}

// ─── Link Graph Generation ────────────────────────────────────────────────────

function generateLinkGraph() {
    const graph = { generated: TODAY, pages: [] };

    for (const city of cities) {
        const nearest = getNearestCities(city, cities, 5);

        if (city.generate.agenzia) {
            graph.pages.push({
                url: `/agenzia-web-${city.slug}.html`,
                type: 'agenzia',
                city: city.name,
                linksTo: nearest
                    .filter(nc => nc.generate.agenzia)
                    .map(nc => `/agenzia-web-${nc.slug}.html`)
            });
        }
        if (city.generate.realizzazione) {
            graph.pages.push({
                url: `/realizzazione-siti-web-${city.slug}.html`,
                type: 'realizzazione',
                city: city.name,
                linksTo: nearest
                    .filter(nc => nc.generate.realizzazione)
                    .map(nc => `/realizzazione-siti-web-${nc.slug}.html`)
            });
        }
    }

    return graph;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — Unified Geo Page Generator v3 (pSEO)');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Cities: ${cities.length} | Services: ${services.length}`);
    console.log(`  Type: ${GEN_TYPE} | Dry run: ${DRY_RUN} | Validate only: ${VALIDATE_ONLY}`);
    console.log(`  Date: ${TODAY}\n`);

    const results = { agenzia: [], realizzazione: [], servizio: [], hubs: [], validations: [] };
    let generated = 0;
    let skipped = 0;

    // Generate agenzia pages
    if (GEN_TYPE === 'all' || GEN_TYPE === 'agenzia') {
        console.log('─── Generating agenzia-web pages ───');
        for (const city of cities) {
            if (!city.generate.agenzia) { skipped++; continue; }
            if (city.slug === 'rho') { skipped++; continue; } // Rho is the hand-crafted base

            const html = generateAgenziaPage(city);
            if (!html) { console.error(`  ❌ Failed: agenzia-web-${city.slug}.html`); continue; }

            const filename = `agenzia-web-${city.slug}.html`;
            const validation = validatePage(html, filename);
            results.validations.push(validation);

            if (validation.issues.some(i => i.startsWith('⛔'))) {
                console.error(`  ❌ ${filename} — BLOCKED by validation:`);
                validation.issues.forEach(i => console.error(`     ${i}`));
                continue;
            }

            if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
            const issueStr = validation.issues.length > 0 ? ` [${validation.issues.length} warnings]` : '';
            console.log(`  ✅ ${filename} (${sizeKb}KB, ${validation.wordCount} words, ${validation.internalLinks} links)${issueStr}`);
            results.agenzia.push(filename);
            generated++;
        }
    }

    // Generate realizzazione pages
    if (GEN_TYPE === 'all' || GEN_TYPE === 'realizzazione') {
        console.log('\n─── Generating realizzazione-siti-web pages ───');
        for (const city of cities) {
            if (!city.generate.realizzazione) { skipped++; continue; }
            if (city.slug === 'rho') { skipped++; continue; } // Rho is the hand-crafted base

            const html = generateRealizzazionePage(city);
            if (!html) { console.error(`  ❌ Failed: realizzazione-siti-web-${city.slug}.html`); continue; }

            const filename = `realizzazione-siti-web-${city.slug}.html`;
            const validation = validatePage(html, filename);
            results.validations.push(validation);

            if (validation.issues.some(i => i.startsWith('⛔'))) {
                console.error(`  ❌ ${filename} — BLOCKED by validation:`);
                validation.issues.forEach(i => console.error(`     ${i}`));
                continue;
            }

            if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
            const issueStr = validation.issues.length > 0 ? ` [${validation.issues.length} warnings]` : '';
            console.log(`  ✅ ${filename} (${sizeKb}KB, ${validation.wordCount} words, ${validation.internalLinks} links)${issueStr}`);
            results.realizzazione.push(filename);
            generated++;
        }
    }

    // Generate servizio×città pages (third page type — the combinatorial matrix)
    if (GEN_TYPE === 'all' || GEN_TYPE === 'servizio') {
        const geoEligibleServices = services.filter(s => s.generateGeoPages !== false);
        const eligibleCities = cities.filter(c => c.population >= 15000 && c.slug !== 'rho');
        console.log(`\n─── Generating servizio×città pages (${geoEligibleServices.length} services × ${eligibleCities.length} cities) ───`);

        for (const service of geoEligibleServices) {
            for (const city of eligibleCities) {
                const html = generateServizioCittaPage(service, city);
                if (!html) continue;

                const filename = `${service.slug}-${city.slug}.html`;
                const validation = validatePage(html, filename);
                results.validations.push(validation);

                if (validation.issues.some(i => i.startsWith('⛔'))) {
                    continue; // Silently skip critically invalid pages
                }

                if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
                results.servizio.push(filename);
                generated++;
            }
            // Log per-service summary
            const svcCount = eligibleCities.length;
            console.log(`  ✅ ${service.slug}-*.html — ${svcCount} cities`);
        }
    }

    // Generate hub pages (internal linking bridge)
    if (GEN_TYPE === 'all') {
        console.log('\n─── Generating hub pages ───');
        const hubResults = generateHubPages();
        for (const hub of hubResults) {
            if (!DRY_RUN && !VALIDATE_ONLY) {
                writePublishedFile(path.join(hub.dir, 'index.html'), hub.html);
            }
            const sizeKb = Math.round(Buffer.byteLength(hub.html) / 1024);
            console.log(`  ✅ ${hub.dir}/index.html (${sizeKb}KB)`);
            generated++;
        }
        results.hubs = hubResults.map(h => `${h.dir}/index.html`);
    }

    // Generate link graph
    if (!DRY_RUN && !VALIDATE_ONLY) {
        const linkGraph = generateLinkGraph();
        fs.writeFileSync(
            path.join(ROOT, 'data', 'link-graph.json'),
            JSON.stringify(linkGraph, null, 2), 'utf8'
        );
        console.log(`\n  📊 Link graph: data/link-graph.json (${linkGraph.pages.length} pages)`);
    }

    // Summary
    console.log('\n══════════════════════════════════════════════════════');
    console.log(`  Generated: ${generated} | Skipped: ${skipped}`);
    console.log(`  Agenzia: ${results.agenzia.length} | Realizzazione: ${results.realizzazione.length} | Servizio×Città: ${results.servizio.length} | Hub: ${results.hubs.length}`);

    const warnings = results.validations.reduce((sum, v) => sum + v.issues.length, 0);
    if (warnings > 0) {
        console.log(`  ⚠ Total validation warnings: ${warnings}`);
    }

    if (DRY_RUN) console.log('  🔍 DRY RUN — no files written');
    if (VALIDATE_ONLY) console.log('  🔍 VALIDATE ONLY — no files written');

    console.log('══════════════════════════════════════════════════════');
}

main();
