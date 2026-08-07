/**
 * Realizzazione siti web geo page generator (regex-based base template).
 */
const fs = require('fs');
const path = require('path');
const {
    ROOT,
    SITE,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    resolvePageTier,
    buildRobotsContent
} = require('./config');
const {
    contentBlocks,
    cityMap,
    getProvinceDisplay
} = require('./data');
const { escapeHtmlAttr, toCity } = require('./html-utils');
const { getBasePage } = require('./paths');
const { resolvePageFaqs, renderFaqSection } = require('./faq');
const {
    getGeoEditorialRecord,
    applyEditorialSeoOverrides,
    applyEditorialBody
} = require('./editorial');
const { getRealizzazioneSeoCopy } = require('./copy');
const { generateSchemas } = require('./schema');
const { updateDerivedHeadMeta } = require('./head-meta');
const { buildGeoLinksSection } = require('./link-graph');
const { readApprovedContentBlock } = require('../../config/content-claim-governance');

function generateRealizzazionePage(city) {
    const basePage = getBasePage('realizzazione-siti-web-source.html');
    if (!basePage) {
        console.error('❌ Base page realizzazione-siti-web-rho.html not found');
        return null;
    }
    let page = basePage;

    const canonical = `${SITE}/realizzazione-siti-web-${city.slug}.html`;
    const editorial = getGeoEditorialRecord(`/realizzazione-siti-web-${city.slug}.html`);
    const realizzazioneSeo = applyEditorialSeoOverrides(getRealizzazioneSeoCopy(city), editorial);
    const aiBlock = contentBlocks.get(city.slug);
    // Hand-written per-city questions replace the shared set when available:
    // they are the part of the page a visitor from that comune actually needs.
    const resolvedFaqs = (editorial && editorial.faqs && editorial.faqs.length)
        ? editorial.faqs.map((faq) => ({ q: faq.question, a: faq.answer }))
        : resolvePageFaqs(city, 'realizzazione', aiBlock);
    const headEnd = page.indexOf('</head>');

    if (headEnd > 0) {
        const updatedHead = updateDerivedHeadMeta(page.substring(0, headEnd), {
            title: realizzazioneSeo.title,
            description: realizzazioneSeo.description,
            keywords: `realizzazione siti web ${city.slug.replace(/-/g, ' ')}, siti web ${city.name.toLowerCase()}, landing page ${city.name.toLowerCase()}, e-commerce ${city.name.toLowerCase()}, web agency ${city.name.toLowerCase()}, sviluppo siti web ${city.name.toLowerCase()}`,
            canonical,
            robots: buildRobotsContent(`/realizzazione-siti-web-${city.slug}.html`),
            ogTitle: realizzazioneSeo.ogTitle,
            ogDescription: realizzazioneSeo.ogDescription,
            twitterTitle: realizzazioneSeo.ogTitle,
            twitterDescription: realizzazioneSeo.ogDescription
        });
        page = updatedHead + page.substring(headEnd);
    }

    page = page.replace(/realizzazione siti web a Rho/gi, `realizzazione siti web ${toCity(city.name)}`);
    page = page.replace(/creazione di siti web a Rho/gi, `creazione di siti web ${toCity(city.name)}`);
    page = page.replace(/realizzazione-siti-web-rho\.html/g, `realizzazione-siti-web-${city.slug}.html`);

    // Breadcrumb
    page = page.replace(/Realizzazione Siti Web a Rho<\/span>/g, `Realizzazione Siti Web ${toCity(city.name)}</span>`);
    page = page.replace(/"name": "Realizzazione Siti Web a Rho"/g, `"name": "Realizzazione Siti Web ${toCity(city.name)}"`);

    // Hero
    page = page.replace(/<span class="section-tag">[\s\S]*?<\/span>/, `<span class="section-tag">${realizzazioneSeo.heroTag}</span>`);
    page = page.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${realizzazioneSeo.heroH1}</h1>`);
    page = page.replace(/<p class="answer-capsule">[\s\S]*?<\/p>/, `<p class="answer-capsule">${realizzazioneSeo.heroCapsule}</p>`);
    page = page.replace(
        /<time\b[^>]*datetime=["']\d{4}-\d{2}-\d{2}["'][^>]*>[\s\S]*?<\/time>/i,
        `<time datetime="${PAGE_DATE_ISO_TOKEN}">${PAGE_DATE_HUMAN_TOKEN}</time>`
    );
    page = page.replace(/Rho, Milano \(MI\) 20017/, `${city.name}, ${getProvinceDisplay(city)} ${city.cap}`);

    page = applyEditorialBody(page, editorial);

    // Schema LocalBusiness
    page = page.replace(/"WebNovis — Web Agency Rho"/g, `"WebNovis — Web Agency ${city.name}"`);
    page = page.replace(/"Web Novis Rho"/g, `"Web Novis ${city.name}"`);
    page = page.replace(/Web agency a Rho specializzata/g, `Web agency ${toCity(city.name)} specializzata`);
    page = page.replace(/"postalCode": "20017"/g, `"postalCode": "${city.cap}"`);
    page = page.replace(/"latitude": "45\.5299"/g, `"latitude": "${city.lat}"`);
    page = page.replace(/"longitude": "9\.0393"/g, `"longitude": "${city.lng}"`);
    page = page.replace(/Via\+S\.\+Giorgio\+2%2C\+20017\+Rho\+MI/g,
        `Via+S.+Giorgio+2%2C+${city.cap}+${city.name.replace(/ /g, '+')}+${city.province || 'MI'}`);
    page = page.replace(/"Servizi Realizzazione Siti Web Rho"/, `"Servizi Realizzazione Siti Web ${city.name}"`);
    page = page.replace(/Sito Web Vetrina a Rho/g, `Sito Web Vetrina ${toCity(city.name)}`);
    page = page.replace(/E-Commerce a Rho/g, `E-Commerce ${toCity(city.name)}`);
    page = page.replace(/Landing Page a Rho/g, `Landing Page ${toCity(city.name)}`);
    page = page.replace(/Graphic Design Rho/g, `Graphic Design ${city.name}`);
    page = page.replace(/Social Media Marketing Rho/g, `Social Media Marketing ${city.name}`);

    // Content sections
    page = page.replace(/Perché la tua azienda a Rho/g, `Perché la tua azienda ${toCity(city.name)}`);
    page = page.replace(/per aziende di Rho/g, `per aziende di ${city.name}`);
    page = page.replace(/I nostri servizi di creazione siti web a Rho/g, `I nostri servizi di creazione siti web ${toCity(city.name)}`);
    page = page.replace(/della tua azienda a Rho/g, `della tua azienda ${toCity(city.name)}`);
    page = page.replace(/Perché scegliere WebNovis come web agency a Rho/g, `Perché scegliere WebNovis come web agency ${toCity(city.name)}`);
    page = page.replace(/studio del mercato di Rho/g, `studio del mercato di ${city.name}`);
    page = page.replace(/mercato di Rho/g, `mercato di ${city.name}`);
    page = page.replace(/Realizziamo siti web per aziende di Rho e dell'hinterland/g, `Realizziamo siti web per aziende di ${city.name} e dell'hinterland`);
    page = page.replace(/Quanto costa realizzare un sito web a Rho/g, `Quanto costa realizzare un sito web ${toCity(city.name)}`);
    page = page.replace(/Domande Frequenti — Realizzazione Siti Web a Rho/g, `Domande Frequenti — Realizzazione Siti Web ${toCity(city.name)}`);
    page = page.replace(/il sito web che la tua azienda a Rho merita/g, `il sito web che la tua azienda ${toCity(city.name)} merita`);
    page = page.replace(/la tua azienda a Rho o in videochiamata/g, `la tua azienda ${toCity(city.name)} o in videochiamata`);
    page = page.replace(/ricerche locali di Rho/g, `ricerche locali di ${city.name}`);
    page = page.replace(/del territorio rhodense/g, `del territorio di ${city.name}`);
    page = page.replace(/Ogni progetto di realizzazione siti web a Rho/g, `Ogni progetto di realizzazione siti web ${toCity(city.name)}`);
    page = page.replace(/per un'azienda di Rho"/g, `per un'azienda di ${city.name}"`);

    // Images
    if (city.images) {
        page = page.replace(
            /Img\/rho-fiera-milano-sm\.webp 320w, Img\/rho-fiera-milano\.webp 600w/,
            `Img/${city.images.img1.file}-sm.webp 320w, Img/${city.images.img1.file}.webp 600w`);
        page = page.replace(/src="Img\/rho-fiera-milano\.png"/, `src="Img/${city.images.img1.file}.png"`);
        page = page.replace(/alt="Vista panoramica di Rho e del polo fieristico di Fiera Milano"/, `alt="${escapeHtmlAttr(city.images.img1.alt)}"`);
        page = page.replace(
            /Img\/rho-digital-ecosystem-sm\.webp 320w, Img\/rho-digital-ecosystem\.webp 600w/,
            `Img/${city.images.img2.file}-sm.webp 320w, Img/${city.images.img2.file}.webp 600w`);
        page = page.replace(/src="Img\/rho-digital-ecosystem\.png"/, `src="Img/${city.images.img2.file}.png"`);
        page = page.replace(/alt="Ecosistema digitale integrato: sito web, SEO, social media e analytics per aziende di Rho"/, `alt="${escapeHtmlAttr(city.images.img2.alt)}"`);
    }

    // Market intro — inject unique local context (AI-enriched when available)
    const ctx = city.localContext || {};
    const marketIntro = aiBlock?.localMarketAnalysis
        ? `${aiBlock.localMarketAnalysis}</p>\n                <p>${aiBlock.competitiveContext || ctx.opportunitaDigitale || ''}`
        : `${ctx.tessutoEconomico || ''}</p>\n                <p>${ctx.opportunitaDigitale || ''}`;

    // Landmark locali: stesso pattern reso da agenzia-web e servizio×città,
    // così anche la famiglia realizzazione espone i punti di riferimento del comune.
    const highlightsSentence = (ctx.highlights && ctx.highlights.length > 0)
        ? `\n                <p>Punti di riferimento del territorio: ${ctx.highlights.map(hl => `<strong>${hl}</strong>`).join(', ')}.</p>`
        : '';

    if (ctx.tessutoEconomico || aiBlock?.localMarketAnalysis) {
        page = page.replace(
            /Rho non è un comune qualsiasi dell'hinterland milanese[\s\S]*?ROI più misurabile che puoi fare\.\s*<\/p>/,
            `${marketIntro}</p>${highlightsSentence}
                <p>La differenza tra un sito che "c'è" e un sito che <strong>lavora per te 24/7</strong> sta nella qualità dell'agenzia che lo realizza: strategia, codice, design e SEO devono essere eccellenti, non "sufficienti".</p>`
        );
    }
    page = page.replace(
        /(<p>La differenza tra un sito che "c'è" e un sito che <strong>lavora per te 24\/7<\/strong> sta nella qualità dell'agenzia che lo realizza: strategia, codice, design e SEO devono essere eccellenti, non "sufficienti"\.<\/p>)\s*\1/,
        '$1'
    );

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

    // Visible FAQs and FAQPage JSON-LD consume the same resolved array.
    page = page.replace(
        /<section class="service-detail">\s*<div class="container">\s*<h2>Domande Frequenti — Realizzazione Siti Web ad? [^<]+<\/h2>[\s\S]*?<\/div>\s*<\/section>/i,
        renderFaqSection(`Domande Frequenti — Realizzazione Siti Web ${toCity(city.name)}`, resolvedFaqs)
    );

    // Inject geo internal links + AI FAQ before </main>
    const geoLinksHtml = buildGeoLinksSection(city, 'realizzazione');

    // Tier 1 editorial block (hand-crafted) — only when page is in Tier 1 allowlist
    // and the corresponding JSON override exists.
    const realizzazioneTier = resolvePageTier(`/realizzazione-siti-web-${city.slug}.html`);
    let tier1Html = '';
    if (realizzazioneTier === 1) {
        const tier1Path = path.join(ROOT, 'data', 'content-blocks', `tier1-${city.slug}-realizzazione-siti-web.json`);
        if (fs.existsSync(tier1Path)) {
            const tier1 = readApprovedContentBlock(tier1Path);
            if (tier1) tier1Html = buildTier1SectionHtml(tier1);
        }
    }

    page = page.replace('</main>', tier1Html + geoLinksHtml + '</main>');

    const schemasHtml = generateSchemas(city, 'realizzazione', resolvedFaqs)
        .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n');
    page = page.replace(/<\/footer>/i, `</footer>\n${schemasHtml}`);

    return page;
}

// Shared helper: render a Tier 1 editorial JSON block as an HTML <section>.
// Used by generateRealizzazionePage (regex-based template) to avoid divergence
// with the Nunjucks-rendered layout of the agenzia and servizio×città pages.
function buildTier1SectionHtml(block) {
    if (!block) return '';
    let html = '\n<section class="service-detail tier1-editorial" data-tier="1" style="background:rgba(255,255,255,.01)"><div class="container">';
    if (block.headline) {
        html += `<h2>${block.headline}</h2>`;
    }
    if (Array.isArray(block.body)) {
        for (const paragraph of block.body) {
            html += `<p>${paragraph}</p>`;
        }
    }
    if (Array.isArray(block.bullets) && block.bullets.length > 0) {
        html += '<ul style="margin:1rem 0 1.5rem 1.25rem;padding:0;color:var(--gray-light);line-height:1.7">';
        for (const item of block.bullets) {
            html += `<li style="margin-bottom:.5rem">${item}</li>`;
        }
        html += '</ul>';
    }
    if (block.callout) {
        html += '<aside style="margin-top:1.5rem;padding:1.1rem 1.25rem;border-radius:14px;border:1px solid rgba(91,106,174,.35);background:rgba(91,106,174,.08)">';
        if (block.callout.title) {
            html += `<strong style="display:block;color:var(--white);margin-bottom:.35rem">${block.callout.title}</strong>`;
        }
        if (block.callout.text) {
            html += `<p style="margin:0;color:var(--gray-light);font-size:.95rem">${block.callout.text}</p>`;
        }
        html += '</aside>';
    }
    html += '</div></section>\n';
    return html;
}

module.exports = {
    generateRealizzazionePage,
    buildTier1SectionHtml
};
