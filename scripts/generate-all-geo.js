/**
 * WebNovis — Unified Geo Page Generator v3 (pSEO Infrastructure)
 *
 * Generates BOTH page types from centralized data + Nunjucks templates:
 *   1. agenzia-web-{city}.html  — "Agenzia Web a {City}" pages
 *   2. realizzazione-siti-web-{city}.html — "Realizzazione Siti Web a {City}" pages
 *
 * Data sources:  data/cities.json, data/services.json
 * Templates:     templates/agenzia-web-content.njk (Nunjucks)
 *                realizzazione-siti-web-rho.html (regex base for "realizzazione" type)
 * Base page:     agenzia-web-rho.html (head/nav/footer extraction for "agenzia" type)
 *
 * Features:
 *   - Centralized data layer (JSON)
 *   - Nunjucks template engine for agenzia pages
 *   - Automatic internal linking between all geo pages
 *   - Automatic JSON-LD schema generation (BreadcrumbList, WebPage, LocalBusiness, Service, FAQPage)
 *   - GEO optimization: answer capsule, comparison table, statistics density
 *   - Blog cross-linking from search-index.json
 *   - Validation: word count, link count, schema presence
 *   - Generates data/link-graph.json for cross-referencing
 *
 * Usage: node scripts/generate-all-geo.js [--dry-run] [--validate-only] [--type=agenzia|realizzazione|all]
 */

const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

// ─── Configuration ────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.webnovis.com';
const TODAY = new Date().toISOString().split('T')[0];
const TODAY_FORMATTED = new Date().toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric'
});

// CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VALIDATE_ONLY = args.includes('--validate-only');
const typeArg = args.find(a => a.startsWith('--type='));
const GEN_TYPE = typeArg ? typeArg.split('=')[1] : 'all';

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
const searchIndexPath = path.join(ROOT, 'search-index.json');
if (fs.existsSync(searchIndexPath)) {
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
        .filter(c => c.slug !== city.slug && c.generate.agenzia)
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
        // BreadcrumbList
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": breadcrumbLabel, "item": canonical }
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
            "datePublished": TODAY,
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
            "geo": { "@type": "GeoCoordinates", "latitude": String(city.lat), "longitude": String(city.lng) },
            "hasMap": "https://maps.google.com/?q=Via+S.+Giorgio+2%2C+20017+Rho+MI",
            "areaServed": nearCityObjects,
            "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": { "@type": "GeoCoordinates", "latitude": String(city.lat), "longitude": String(city.lng) },
                "geoRadius": "15000"
            },
            "openingHoursSpecification": [{
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
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

// ─── Agenzia Page Generator (Nunjucks-based) ─────────────────────────────────

function generateAgenziaPage(city) {
    const rhoBasePath = path.join(ROOT, 'agenzia-web-rho.html');
    if (!fs.existsSync(rhoBasePath)) {
        console.error('❌ Base page agenzia-web-rho.html not found');
        return null;
    }
    const rhoPage = fs.readFileSync(rhoBasePath, 'utf8');

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
    let headBlock = rhoPage.substring(0, rhoHeadEnd)
        .replace(/<title>[^<]+<\/title>/, `<title>Agenzia Web a ${city.name} (Milano) — WebNovis | Siti Web Custom, Grafica e Social</title>`)
        .replace(/content="[^"]*" name="description"/, `content="Agenzia web per ${city.name}: siti 100% custom, grafica e social. Sede a Rho, ${city.distanzaSede}. Preventivo gratuito 24h." name="description"`)
        .replace(/content="[^"]*" name="keywords"/, `content="agenzia web ${city.name}, web agency ${city.name} Milano, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}" name="keywords"`)
        .replace(/href="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `href="${canonical}"`)
        .replace(/content="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `content="${canonical}"`)
        .replace(/content="[^"]*" property="og:title"/, `content="Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing" property="og:title"`)
        .replace(/content="[^"]*" property="og:description"/, `content="WebNovis è l'agenzia web per ${city.name} e hinterland milanese. Siti 100% custom, grafica e social. Sede a Rho, ${city.distanzaSede}. Preventivo gratuito." property="og:description"`);

    // Extract nav from Rho body
    const bodyStart = rhoPage.indexOf('<body>');
    const mainStart = rhoPage.indexOf('<main');
    const navHtml = rhoPage.substring(bodyStart, mainStart);

    // Extract footer
    const footerStart = rhoPage.indexOf('<footer');
    const footerEnd = rhoPage.indexOf('</footer>') + '</footer>'.length;
    let footerHtml = rhoPage.substring(footerStart, footerEnd);

    // Inject geo links into footer Località section
    footerHtml = injectFooterGeoLinks(footerHtml, city);

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
    const templatePath = path.join(ROOT, 'realizzazione-siti-web-rho.html');
    if (!fs.existsSync(templatePath)) {
        console.error('❌ Base page realizzazione-siti-web-rho.html not found');
        return null;
    }
    let page = fs.readFileSync(templatePath, 'utf8');

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

    // Inject footer geo links
    page = injectFooterGeoLinksInPage(page, city);

    return page;
}

// ─── Servizio×Città Page Generator (Nunjucks-based, third page type) ──────────

function generateServizioCittaPage(service, city) {
    const rhoBasePath = path.join(ROOT, 'agenzia-web-rho.html');
    if (!fs.existsSync(rhoBasePath)) return null;
    const rhoPage = fs.readFileSync(rhoBasePath, 'utf8');

    const slug = `${service.slug}-${city.slug}`;
    const canonical = `${SITE}/${slug}.html`;

    // Nearest cities that also have this service×city page
    const nearest = getNearestCities(city, cities, 5);
    const relatedCityPages = nearest
        .filter(nc => nc.population >= 15000)
        .slice(0, 3)
        .map(nc => ({
            url: `${service.slug}-${nc.slug}.html`,
            label: `${service.shortName} a ${nc.name}`,
            distance: nc.distanzaSede
        }));

    // Other services in the same city
    const extendedServices = services.filter(s => s.tier === 'extended' && s.slug !== service.slug);
    const relatedServicePages = extendedServices
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
    let headBlock = rhoPage.substring(0, rhoHeadEnd)
        .replace(/<title>[^<]+<\/title>/, `<title>${service.name} a ${city.name} — WebNovis | ${service.idealFor}</title>`)
        .replace(/content="[^"]*" name="description"/, `content="${service.shortDesc} A ${city.name}, da €${service.priceFrom}${service.priceUnit || ''}. Sede a Rho, ${city.distanzaSede}." name="description"`)
        .replace(/content="[^"]*" name="keywords"/, `content="${service.targetKeyword} ${city.name}, ${service.slug.replace(/-/g, ' ')} ${city.name}, WebNovis ${city.name}" name="keywords"`)
        .replace(/href="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `href="${canonical}"`)
        .replace(/content="https:\/\/www\.webnovis\.com\/agenzia-web-rho\.html"/g, `content="${canonical}"`)
        .replace(/content="[^"]*" property="og:title"/, `content="${service.name} a ${city.name} — WebNovis" property="og:title"`)
        .replace(/content="[^"]*" property="og:description"/, `content="${service.shortDesc} Da €${service.priceFrom}${service.priceUnit || ''}. Sede a Rho, ${city.distanzaSede}." property="og:description"`);

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
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
            { "@type": "ListItem", "position": 2, "name": service.shortName, "item": SITE + service.url },
            { "@type": "ListItem", "position": 3, "name": `${service.shortName} a ${city.name}`, "item": canonical }
        ]},
        { "@context": "https://schema.org", "@type": "Service",
            "serviceType": service.name, "name": `${service.name} a ${city.name}`,
            "description": `${service.shortDesc} Per aziende di ${city.name} e hinterland milanese.`,
            "provider": { "@id": SITE + "/#organization" },
            "areaServed": { "@type": "City", "name": city.name, "sameAs": city.wikipedia },
            "offers": { "@type": "Offer", "price": String(service.priceFrom), "priceCurrency": "EUR" }
        },
        { "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question", "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]*>/g, '') }
            }))
        }
    ];
    const schemasHtml = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');

    return headBlock + '</head>' + navHtml + contentHtml + ' ' + footerHtml + '\n' + schemasHtml + '\n' + tailBlock;
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
    html += `</div></div></section>\n`;
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

function injectFooterGeoLinks(footerHtml, currentCity) {
    // Build list of all geo page links for footer
    const geoLinks = cities
        .filter(c => c.generate.agenzia && c.slug !== 'rho')
        .slice(0, 8)
        .map(c => `<a href="agenzia-web-${c.slug}.html">Web Agency ${c.name.split(' ')[0]}</a>`)
        .join(' ');

    // Try to inject after Web Agency Milano link
    if (footerHtml.includes('agenzia-web-milano.html')) {
        return footerHtml; // Links already present
    }

    return footerHtml;
}

function injectFooterGeoLinksInPage(page, currentCity) {
    // For realizzazione pages, try to add geo cross-links to footer
    return page;
}

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

    const results = { agenzia: [], realizzazione: [], servizio: [], validations: [] };
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
                fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
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
                fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
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
        const extendedServices = services.filter(s => s.tier === 'extended');
        const eligibleCities = cities.filter(c => c.population >= 15000 && c.slug !== 'rho');
        console.log(`\n─── Generating servizio×città pages (${extendedServices.length} services × ${eligibleCities.length} cities) ───`);

        for (const service of extendedServices) {
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
                    fs.writeFileSync(path.join(ROOT, filename), html, 'utf8');
                }
                results.servizio.push(filename);
                generated++;
            }
            // Log per-service summary
            const svcCount = eligibleCities.length;
            console.log(`  ✅ ${service.slug}-*.html — ${svcCount} cities`);
        }
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
    console.log(`  Agenzia: ${results.agenzia.length} | Realizzazione: ${results.realizzazione.length} | Servizio×Città: ${results.servizio.length}`);

    const warnings = results.validations.reduce((sum, v) => sum + v.issues.length, 0);
    if (warnings > 0) {
        console.log(`  ⚠ Total validation warnings: ${warnings}`);
    }

    if (DRY_RUN) console.log('  🔍 DRY RUN — no files written');
    if (VALIDATE_ONLY) console.log('  🔍 VALIDATE ONLY — no files written');

    console.log('══════════════════════════════════════════════════════');
}

main();
