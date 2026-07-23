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
const { removeSchemaReviewProperties } = require('./seo-aggregate-rating');
const { applySeoHtmlTransforms } = require('../config/seo-html-transforms');
const {
    getIndexationDirectivesForPath,
    getIndexableGeoPaths,
    isTier1Path,
    isTier2Path,
    isDeAmplifiedPath
} = require('../config/pseo-governance');

// Classifica una pagina generata in base al suo path pubblico.
// Restituisce 1 / 2 / 0 (de-amplificata). Usato dai template per differenziazione.
function resolvePageTier(pathname) {
    if (isTier1Path(pathname)) return 1;
    if (isTier2Path(pathname)) return 2;
    return 0;
}

// ─── Configuration ────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const BASE_PAGE_DIR = path.join(ROOT, 'templates', 'base-pages');
const SITE = 'https://www.webnovis.com';
const SINGLETON_LOCAL_BUSINESS_ID = SITE + '/#localbusiness';
const SEDE_LAT = '45.5299';
const SEDE_LNG = '9.0393';
const FIRST_DEPLOY_DATE = '2026-02-27';
const CITY_AVATAR_PUBLIC_DIR = '/Img/cities';

function resolveRomeCalendarDate(now = new Date()) {
    const dateParts = Object.fromEntries(
        new Intl.DateTimeFormat('en', {
            timeZone: 'Europe/Rome',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
            .formatToParts(now)
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    );

    return {
        iso: `${dateParts.year}-${dateParts.month}-${dateParts.day}`,
        formatted: new Intl.DateTimeFormat('it-IT', {
            timeZone: 'Europe/Rome',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(now)
    };
}

const { iso: TODAY, formatted: TODAY_FORMATTED } = resolveRomeCalendarDate();

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
const cityArg = args.find(a => a.startsWith('--city='));
const serviceArg = args.find(a => a.startsWith('--service='));
const PUBLISH_DIR = path.resolve(ROOT, outDirArg ? outDirArg.split('=')[1] : (process.env.PUBLISH_DIR || '.'));
const TARGET_CITY_SLUGS = new Set(
    (cityArg ? cityArg.split('=')[1] : '')
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(Boolean)
);
const TARGET_SERVICE_SLUGS = new Set(
    (serviceArg ? serviceArg.split('=')[1] : '')
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(Boolean)
);

function resolvePublishPath(...segments) {
    return path.join(PUBLISH_DIR, ...segments);
}

function getGeneratedRootPrefix(relativePath) {
    const depth = String(relativePath).replace(/\\/g, '/').split('/').length - 1;
    return depth <= 0 ? '' : `${Array(depth).fill('..').join('/')}/`;
}

function normalizeGeneratedRuntimeScripts(html, relativePath) {
    const prefix = getGeneratedRootPrefix(relativePath);
    const runtimePath = (filename) => `${prefix}js/${filename}`;
    let updated = html
        .replace(
            /<script\b[^>]*src="[^"]*?js\/web-vitals-reporter(?:\.min)?\.js"[^>]*><\/script>/gi,
            `<script defer src="${runtimePath('web-vitals-reporter.min.js')}"></script>`
        )
        .replace(
            /<script\b[^>]*src="[^"]*?js\/footer-widgets-loader(?:\.min)?\.js"[^>]*><\/script>/gi,
            `<script defer src="${runtimePath('footer-widgets-loader.min.js')}"></script>`
        );

    const nonCriticalPattern = /<script\b[^>]*src="[^"]*?js\/noncritical-loader(?:\.min)?\.js"[^>]*><\/script>/i;
    const mainPattern = /<script\b[^>]*src="[^"]*?js\/main\.min\.js"[^>]*><\/script>/i;
    const nonCriticalTag = `<script defer src="${runtimePath('noncritical-loader.min.js')}"></script>`;
    updated = updated.replace(nonCriticalPattern, '');
    if (mainPattern.test(updated)) {
        updated = updated.replace(mainPattern, (match) => `${match} ${nonCriticalTag}`);
    } else {
        updated = updated.replace(/<\/body>/i, `${nonCriticalTag} </body>`);
    }
    return updated;
}

function finalizePublishedHtml(relativePath, html) {
    const targetPath = resolvePublishPath(relativePath);
    const preserved = preserveCustomBlocks(targetPath, html).replace(/^\uFEFF/, '');
    const normalizedPath = String(relativePath).replace(/\\/g, '/');
    return normalizeGeneratedRuntimeScripts(applySeoHtmlTransforms(preserved, normalizedPath), normalizedPath);
}

function writePublishedFile(relativePath, html) {
    const targetPath = resolvePublishPath(relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, html, 'utf8');
}

function getCityAvatarPublicPath(city) {
    const filename = `${city.slug}.webp`;
    const publishPath = resolvePublishPath('Img', 'cities', filename);
    const rootPath = path.join(ROOT, 'Img', 'cities', filename);
    if (!fs.existsSync(publishPath) && !fs.existsSync(rootPath)) return '';
    return `${CITY_AVATAR_PUBLIC_DIR}/${filename}`;
}

function withCityUiMeta(cityList) {
    return cityList.map((city) => ({
        ...city,
        avatarSrc: getCityAvatarPublicPath(city),
        avatarAlt: `Avatar territoriale di ${city.name}`
    }));
}

function matchesTargetCity(city) {
    return TARGET_CITY_SLUGS.size === 0 || TARGET_CITY_SLUGS.has(city.slug);
}

function matchesTargetService(service) {
    return TARGET_SERVICE_SLUGS.size === 0 || TARGET_SERVICE_SLUGS.has(service.slug);
}

// ─── Load Data ────────────────────────────────────────────────────────────────
const citiesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const servicesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
const cities = citiesData.cities;
const services = servicesData.services;
const coreServices = services.filter(s => s.tier === 'core');
const offerCatalogServices = services.filter((service) => service.hasPage === true);

// Centralized predicate: does this service participate in geo generation?
// - `skipGeoGeneration: true` (new) explicitly opts out (used for deprecated clusters like consulenza-digitale)
// - `generateGeoPages: false` (legacy) is still honored
// All other services are eligible.
function shouldGenerateGeoForService(service) {
    if (!service) return false;
    if (service.skipGeoGeneration === true) return false;
    if (service.generateGeoPages === false) return false;
    return true;
}

const tableServices = services.filter(s => s.tier === 'core' || shouldGenerateGeoForService(s));
const sede = citiesData._meta.sede;
const serviceCoverageCitySlugs = new Set(
    cities.filter((city) => city.generate?.agenzia).map((city) => city.slug)
);

// Build city lookup map
const cityMap = new Map();
cities.forEach(c => cityMap.set(c.slug, c));

const PROVINCE_DISPLAY_NAMES = {
    MI: 'Milano',
    MB: 'Monza e Brianza',
    VA: 'Varese'
};

const GEO_SEARCH_MODIFIERS = {
    MI: 'Milano',
    MB: 'Monza Brianza',
    VA: 'Varese'
};

function getProvinceDisplay(city) {
    const province = city.province || 'MI';
    return `${PROVINCE_DISPLAY_NAMES[province] || province} (${province})`;
}

function getGeoSearchModifier(city) {
    return GEO_SEARCH_MODIFIERS[city.province || 'MI'] || city.province || 'Lombardia';
}

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

function resolvePageFaqs(city, pageType, aiBlock) {
    const aiFaqs = pageType === 'agenzia'
        ? aiBlock?.faqsAgenzia
        : aiBlock?.faqsRealizzazione;
    const minimumAiFaqs = pageType === 'agenzia' ? 3 : 1;

    if (Array.isArray(aiFaqs) && aiFaqs.length >= minimumAiFaqs) {
        return aiFaqs;
    }

    return (city.faqs && city.faqs[pageType]) || [];
}

function extractVisibleFaqs(html) {
    const faqs = [];
    const itemPattern = /<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi;

    for (const match of html.matchAll(itemPattern)) {
        const question = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
        const answer = match[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
        if (question == null || answer == null) continue;
        faqs.push({ q: stripHtml(question), a: answer.trim() });
    }

    return faqs;
}

function resolveHandCraftedFaqs(html, fallbackFaqs = []) {
    const visibleFaqs = extractVisibleFaqs(html);
    return visibleFaqs.length > 0 ? visibleFaqs : fallbackFaqs;
}

function renderFaqItems(faqs) {
    return faqs.map((faq) =>
        `<details class="faq-item"><summary>${faq.q}</summary><p>${faq.a}</p></details>`
    ).join('');
}

function renderFaqSection(title, faqs) {
    if (!Array.isArray(faqs) || faqs.length === 0) return '';

    return `<section class="service-detail"><div class="container"><h2>${title}</h2>${renderFaqItems(faqs)}</div></section>`;
}

function rebuildVisibleFaqItems(html, resolvedFaqs) {
    const itemPattern = /<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>[\s\S]*?<\/details>/gi;
    const matches = [...html.matchAll(itemPattern)];
    if (matches.length === 0 || resolvedFaqs.length === 0) return html;

    const first = matches[0];
    const last = matches[matches.length - 1];
    const start = first.index;
    const end = last.index + last[0].length;
    return html.slice(0, start) + renderFaqItems(resolvedFaqs) + html.slice(end);
}

function buildFaqPageSchema(resolvedFaqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: resolvedFaqs.map((faq) => ({
            '@type': 'Question',
            name: stripHtml(faq.q),
            acceptedAnswer: {
                '@type': 'Answer',
                text: stripHtml(faq.a)
            }
        }))
    };
}

const CUSTOM_BLOCK_REGEX = /<!-- CUSTOM:([a-z0-9-]+):START -->([\s\S]*?)<!-- CUSTOM:\1:END -->/gi;

function extractCustomBlocks(html = '') {
    const blocks = new Map();
    for (const match of html.matchAll(CUSTOM_BLOCK_REGEX)) {
        blocks.set(match[1].toLowerCase(), match[2]);
    }
    return blocks;
}

function preserveCustomBlocks(targetPath, nextHtml) {
    if (!nextHtml || !fs.existsSync(targetPath)) return nextHtml;

    const existingBlocks = extractCustomBlocks(fs.readFileSync(targetPath, 'utf8'));
    if (existingBlocks.size === 0) return nextHtml;

    return nextHtml.replace(CUSTOM_BLOCK_REGEX, (fullMatch, blockName) => {
        const preservedContent = existingBlocks.get(String(blockName).toLowerCase());
        if (preservedContent == null) return fullMatch;
        return `<!-- CUSTOM:${blockName}:START -->${preservedContent}<!-- CUSTOM:${blockName}:END -->`;
    });
}

function countWords(text) {
    return stripHtml(text).split(/\s+/).filter(w => w.length > 1).length;
}

function xmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildRobotsContent(pathname) {
    return `${getIndexationDirectivesForPath(pathname)}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
}

function formatPrice(service) {
    return `€${service.priceFrom}${service.priceUnit || ''}`;
}

function truncateText(value, maxLength = 70) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength - 1).trimEnd() + '…';
}

function formatSectorList(sectors = []) {
    const cleaned = sectors.map((sector) => String(sector || '').trim()).filter(Boolean);
    if (cleaned.length === 0) return '';
    if (cleaned.length === 1) return cleaned[0];
    if (cleaned.length === 2) return `${cleaned[0]} e ${cleaned[1]}`;
    return `${cleaned[0]}, ${cleaned[1]} e ${cleaned[2]}`;
}

function getServicePrimaryUrl(service) {
    return service.hasPage ? service.url : `/zone-servite/#${service.slug}`;
}

function getServicePrimaryLabel(service) {
    return service.hasPage
        ? `la pagina servizio ${service.shortName}`
        : `il riepilogo ${service.shortName} nelle zone servite`;
}

function getAreaServedEntity(city) {
    const normalizedName = String(city.name || '').toLowerCase();
    const isSyntheticArea = normalizedName === 'milano nord' || normalizedName === 'milano ovest';
    const entity = {
        "@type": isSyntheticArea ? "AdministrativeArea" : "City",
        "name": city.name
    };

    if (!isSyntheticArea && city.wikipedia) {
        entity.sameAs = city.wikipedia;
    }

    return entity;
}

function buildCoverageScopes(agenziaCities, realizzazioneCities, serviceCoverageCities) {
    return [
        {
            key: 'agenzia',
            label: 'Copertura completa',
            count: agenziaCities.length,
            helper: 'comuni serviti da WebNovis',
            description: 'Comuni in cui presidiamo la presenza come agenzia web completa: sito, design, social e consulenza.',
            href: '/agenzia-web/'
        },
        {
            key: 'realizzazione',
            label: 'Landing core attive',
            count: realizzazioneCities.length,
            helper: 'landing siti già pubblicate',
            description: 'Comuni in cui il cluster “realizzazione siti web” ha una landing dedicata e navigabile.',
            href: '/realizzazione-siti-web/'
        },
        {
            key: 'extended',
            label: 'Servizi locali attivi',
            count: serviceCoverageCities.length,
            helper: 'comuni con landing servizio attive',
            description: 'Ogni servizio elencato in questa pagina ha una landing locale navigabile in tutti i territori del network WebNovis.',
            href: '/zone-servite/'
        }
    ];
}

function isContinuousService(service) {
    return new Set([
        'seo-locale',
        'social-media',
        'email-marketing',
        'google-ads',
        'manutenzione-sito',
        'consulenza-digitale'
    ]).has(service.slug);
}

function getServiceLocalSeoCopy(service, city) {
    const price = formatPrice(service);
    const primaryUrl = getServicePrimaryUrl(service);
    const primaryLabel = getServicePrimaryLabel(service);

    const fallback = {
        title: `${service.shortName} a ${city.name}: da ${price} | WebNovis`,
        description: `${service.shortDesc} A ${city.name}, da ${price}. Gestione diretta da Rho (${city.distanzaSede}) e preventivo gratuito entro 24 ore.`,
        ogDescription: `${service.shortDesc} A ${city.name}, da ${price}.`,
        heroTag: `${service.shortName} per ${city.name} · ${price}`,
        heroH1: `${service.shortName} a ${city.name} per aziende e professionisti`,
        heroCapsule: `<strong>WebNovis</strong> offre ${service.shortName.toLowerCase()} a ${city.name} con un approccio su misura, tempi chiari e gestione diretta da Rho (${city.distanzaSede}). Investimento da <strong>${price}</strong> e preventivo gratuito entro 24 ore.`,
        heroHighlights: [
            { label: 'Investimento', value: `Da ${price}` },
            { label: 'Tempi', value: service.timeEstimate },
            { label: 'Focus', value: service.idealFor }
        ],
        sectionTitle: `${service.shortName} a ${city.name}: cosa serve per ottenere risultati`,
        sectionIntro: `${service.description} Lavoriamo con obiettivi chiari, deliverable definiti e una priorità costante: trasformare il servizio in richieste, appuntamenti o vendite.`,
        whyTitle: `Perché scegliere WebNovis per ${service.shortName.toLowerCase()} a ${city.name}?`,
        whyCards: isContinuousService(service)
            ? [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho, a ${city.distanzaSede} da ${city.name}. Confronto veloce, risposte rapide e nessun passaggio dispersivo.`
                },
                {
                    title: 'Piano operativo su misura',
                    text: `Ogni attività parte da audit, obiettivi e priorità reali: niente pacchetti standard uguali per tutti.`
                },
                {
                    title: 'Ottimizzazione continua',
                    text: `Monitoriamo risultati, correggiamo le leve che non funzionano e ti lasciamo sempre report leggibili.`
                }
            ]
            : [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho, a ${city.distanzaSede} da ${city.name}. Possiamo sentirci in video o incontrarci rapidamente sul territorio.`
                },
                {
                    title: 'Progetto costruito su misura',
                    text: `Struttura, copy e deliverable vengono adattati al tuo obiettivo e al contesto competitivo locale.`
                },
                {
                    title: 'Conversioni e chiarezza',
                    text: `Ogni pagina o asset nasce per rendere più chiara l'offerta e facilitare il contatto o la vendita.`
                }
            ],
        processTitle: `Come lavoriamo su ${service.shortName.toLowerCase()} a ${city.name}`,
        processIntro: isContinuousService(service)
            ? `Partiamo da audit e priorità, poi impostiamo il piano operativo e monitoriamo i risultati mese dopo mese.`
            : `Partiamo da obiettivo, contesto competitivo e materiali disponibili, poi progettiamo e rilasciamo una soluzione pronta a lavorare.`,
        processSteps: isContinuousService(service)
            ? [
                {
                    title: '1. Audit e priorità',
                    text: `Analizziamo obiettivi, punto di partenza e competitor di ${city.name} per capire dove intervenire prima.`
                },
                {
                    title: '2. Piano operativo',
                    text: `Definiamo attività, tempistiche, KPI e budget con un preventivo chiaro entro 24 ore.`
                },
                {
                    title: '3. Monitoraggio e ottimizzazione',
                    text: `Attiviamo il lavoro, leggiamo i dati e correggiamo progressivamente ciò che non sta performando.`
                }
            ]
            : [
                {
                    title: '1. Analisi e brief',
                    text: `Raccogliamo obiettivi, offerta, competitor e priorità commerciali per il tuo progetto a ${city.name}.`
                },
                {
                    title: '2. Struttura e proposta',
                    text: `Ricevi una proposta chiara con deliverable, tempistiche (${service.timeEstimate}) e investimento da ${price}.`
                },
                {
                    title: '3. Produzione e rilascio',
                    text: `Realizziamo, testiamo e consegniamo con supporto iniziale incluso e un unico referente dedicato.`
                }
            ],
        decisionFrameworkTitle: '',
        decisionFrameworkIntro: '',
        decisionFrameworkCards: [],
        deliverablesTitle: '',
        deliverablesIntro: '',
        deliverablesCards: [],
        intentQueriesTitle: '',
        intentQueriesIntro: '',
        intentQueries: [],
        ctaTitle: `${service.shortName} per la tua attività a ${city.name}?`,
        ctaCopy: `Scrivici obiettivo, settore e tempistiche: ti rispondiamo con un preventivo gratuito entro 24 ore.`,
        primaryPageUrl: primaryUrl,
        primaryPageLabel: primaryLabel,
        schemaDescription: `${service.shortDesc} Per aziende e professionisti di ${city.name}, con gestione diretta da Rho (${city.distanzaSede}).`
    };

    const overrides = {
        'landing-page': {
            title: `Landing Page a ${city.name}: lead generation da ${price} | WebNovis`,
            description: `Landing page a ${city.name} per Google Ads, Meta Ads ed eventi: copy, design e tracking orientati ai lead. Da ${price}. Preventivo in 24 ore.`,
            ogDescription: `Landing page a ${city.name} pensate per aumentare richieste e conversioni. Da ${price}.`,
            heroTag: `Landing Page · ${city.name} · ${price}`,
            heroH1: `Landing Page a ${city.name} per campagne che portano contatti`,
            heroCapsule: `<strong>WebNovis</strong> crea landing page a ${city.name} con copy, design e tracking pensati per aumentare richieste e conversioni. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Lead generation' }
            ],
            sectionTitle: `Landing page a ${city.name} per non sprecare budget ads`,
            sectionIntro: `Se investi in Google Ads, Meta Ads o campagne locali, la pagina conta quanto l'annuncio. Progettiamo strutture snelle, messaggi chiari e CTA pensate per trasformare clic in contatti.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Siamo a Rho, quindi possiamo coordinare rapidamente il lancio anche con team commerciali o agenzie media di ${city.name}.`
                },
                {
                    title: 'Copy, design e tracking',
                    text: `Non consegniamo solo una pagina: impostiamo messaggio, struttura, form, eventi e monitoraggio conversioni.`
                },
                {
                    title: 'Conversioni prima dei fronzoli',
                    text: `Ogni blocco della landing nasce per ridurre dispersione e aumentare richieste, demo o appuntamenti.`
                }
            ],
            processIntro: `Partiamo da offerta, pubblico e canale di traffico. Poi costruiamo una landing che renda la conversione più semplice e misurabile.`,
            ctaTitle: `Vuoi una landing page che trasformi clic in contatti a ${city.name}?`,
            ctaCopy: `Mandaci obiettivo, canale e offerta: ti rispondiamo con struttura consigliata e preventivo entro 24 ore.`,
            schemaDescription: `Landing page a ${city.name} per campagne Google Ads, Meta Ads ed eventi, con copy, design e tracking orientati ai lead.`
        },
        'sito-vetrina': {
            title: `Sito Vetrina a ${city.name}: sito professionale da ${price} | WebNovis`,
            description: `Sito vetrina a ${city.name} con design custom, SEO integrata e struttura orientata ai contatti. Da ${price}. Preventivo gratuito entro 24 ore.`,
            ogDescription: `Sito vetrina a ${city.name} con design custom e SEO integrata. Da ${price}.`,
            heroTag: `Sito Vetrina · ${city.name} · ${price}`,
            heroH1: `Sito Vetrina a ${city.name} per aziende che vogliono più richieste`,
            heroCapsule: `<strong>WebNovis</strong> realizza siti vetrina a ${city.name} con design su misura, SEO tecnica integrata e struttura pensata per facilitare il contatto. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Contatti qualificati' }
            ],
            sectionTitle: `Siti vetrina a ${city.name} per presentare bene l'offerta e farsi scegliere`,
            sectionIntro: `Un sito vetrina funziona quando rende chiari posizionamento, servizi e differenze rispetto ai competitor. Strutturiamo pagine, contenuti e CTA per aiutare le aziende di ${city.name} a generare richieste più qualificate.`,
            ctaTitle: `Vuoi un sito vetrina che faccia percepire meglio il tuo valore a ${city.name}?`,
            ctaCopy: `Possiamo aiutarti con struttura, copy e UX orientati ai contatti: preventivo gratuito entro 24 ore.`,
            schemaDescription: `Sito vetrina a ${city.name} con design personalizzato, SEO integrata e architettura orientata ai contatti.`
        },
        ecommerce: {
            title: `E-Commerce a ${city.name}: shop online da ${price} | WebNovis`,
            description: `E-commerce custom a ${city.name}: catalogo, pagamenti, checkout e SEO tecnica per vendere online senza commissioni piattaforma. Da ${price}.`,
            ogDescription: `E-commerce custom a ${city.name} per vendere online con catalogo, checkout e SEO tecnica. Da ${price}.`,
            heroTag: `E-Commerce · ${city.name} · ${price}`,
            heroH1: `E-Commerce a ${city.name} per vendere online senza vincoli`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa e-commerce a ${city.name} con catalogo, checkout, pagamenti e SEO tecnica pensati per la vendita online. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Vendite online' }
            ],
            sectionTitle: `E-commerce a ${city.name} per trasformare catalogo e traffico in ordini`,
            sectionIntro: `Un negozio online deve essere facile da gestire, veloce da usare e solido lato SEO e checkout. Progettiamo e-commerce pensati per margini, conversione e crescita nel tempo.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Coordiniamo il progetto da Rho con confronto diretto e rapido anche per negozi, brand e PMI di ${city.name} che devono partire senza dispersione.`
                },
                {
                    title: 'Stack e-commerce senza lock-in inutile',
                    text: `Valutiamo caso per caso Shopify, WooCommerce o sviluppo custom in base a catalogo, margini, complessità operativa e autonomia richiesta dopo il lancio.`
                },
                {
                    title: 'SEO, UX e vendite nella stessa direzione',
                    text: `Non costruiamo uno shop solo “bello”: lavoriamo su categorie, schede prodotto, checkout e misurazione per rendere più facile vendere e ottimizzare.`
                }
            ],
            processIntro: `Un e-commerce regge nel tempo quando architettura, schede prodotto, pagamenti, logistica e misurazione vengono progettati insieme fin dall'inizio.`,
            processSteps: [
                {
                    title: '1. Catalogo, stack e requisiti',
                    text: `Analizziamo prodotti, varianti, modalità di vendita, pagamenti, spedizioni e strumenti già in uso per definire la soluzione più sensata.`
                },
                {
                    title: '2. UX di acquisto e struttura SEO',
                    text: `Costruiamo categorie, schede prodotto, filtri, contenuti e checkout in modo che il sito sia chiaro per utenti, motori di ricerca e team interno.`
                },
                {
                    title: '3. Setup operativo e rilascio',
                    text: `Configuriamo pagamenti, spedizioni, tracking, email essenziali e handoff operativo per arrivare online con una base già usabile e misurabile.`
                }
            ],
            decisionFrameworkTitle: `Cosa deve avere un e-commerce a ${city.name} per vendere davvero`,
            decisionFrameworkIntro: `Nelle SERP locali molti competitor presidiano la query “realizzazione e-commerce” con landing molto verticali. Per reggere davvero il confronto non basta pubblicare uno shop: servono fondamenta commerciali e operative chiare.`,
            decisionFrameworkCards: [
                {
                    title: 'Catalogo, categorie e filtri',
                    text: `La struttura deve aiutare persone e motori di ricerca a capire subito prodotti, collezioni e differenze, senza creare tassonomie confuse che disperdono traffico e conversione.`
                },
                {
                    title: 'Schede prodotto che chiariscono e convincono',
                    text: `Testi, immagini, varianti, policy e CTA devono ridurre dubbi prima del checkout, altrimenti il traffico arriva ma l'ordine non si chiude.`
                },
                {
                    title: 'Checkout, pagamenti e logistica',
                    text: `Uno shop funziona quando pagamenti, spedizioni, disponibilità e conferme ordine sono solidi quanto il design. Qui spesso si decide il vero tasso di conversione.`
                },
                {
                    title: 'Tracking, automazioni e riacquisto',
                    text: `Misurare funnel, ordini, carrelli abbandonati e performance per categoria permette di migliorare margini e processi, non solo il numero di visite.`
                }
            ],
            deliverablesTitle: `Cosa include un progetto e-commerce WebNovis a ${city.name}`,
            deliverablesIntro: `Il perimetro viene adattato al progetto, ma ci concentriamo sui blocchi che spostano davvero conversione, gestione e scalabilità.`,
            deliverablesCards: [
                {
                    title: 'Architettura shop e tassonomia',
                    text: `Mappatura categorie, menu, schede prodotto, filtri e gerarchia delle pagine per rendere il catalogo leggibile e sostenibile.`
                },
                {
                    title: 'Checkout e integrazioni essenziali',
                    text: `Setup di pagamenti, spedizioni, email transazionali, moduli e strumenti operativi necessari a non spezzare il flusso di vendita.`
                },
                {
                    title: 'SEO tecnica e contenuti chiave',
                    text: `Interveniamo su categorie, metadati, struttura URL, copy utile e performance percepita per evitare uno shop invisibile o dispersivo.`
                },
                {
                    title: 'Formazione e handoff operativo',
                    text: `Ti lasciamo una base che il team può gestire nel quotidiano: prodotti, ordini, promozioni e controlli ricorrenti senza dipendere sempre da noi.`
                }
            ],
            intentQueriesTitle: `Ricerche e-commerce che presidiamo a ${city.name}`,
            intentQueriesIntro: `Lavoriamo per intercettare query locali con intento commerciale reale, non solo keyword generiche senza probabilità di acquisto.`,
            intentQueries: [
                `realizzazione ecommerce ${city.name}`,
                `e-commerce ${city.name}`,
                `negozio online ${city.name}`,
                `sito ecommerce ${city.name}`,
                `creazione shop online ${city.name}`
            ],
            ctaTitle: `Vuoi un e-commerce più credibile e più facile da far crescere a ${city.name}?`,
            ctaCopy: `Scrivici catalogo, obiettivi e complessità operativa: ti rispondiamo con un perimetro chiaro e un preventivo entro 24 ore.`,
            schemaDescription: `E-commerce custom a ${city.name} con catalogo, checkout, pagamenti e SEO tecnica per aziende che vogliono vendere online.`
        },
        'social-media': {
            title: `Social Media a ${city.name}: gestione da ${price} | WebNovis`,
            description: `Gestione social a ${city.name}: piano editoriale, contenuti e campagne Meta per aumentare visibilità, lead e richieste. Da ${price}.`,
            ogDescription: `Gestione social a ${city.name} con piano editoriale, creatività e campagne Meta. Da ${price}.`,
            heroTag: `Social Media · ${city.name} · ${price}`,
            heroH1: `Social Media a ${city.name} per visibilità, contenuti e lead`,
            heroCapsule: `<strong>WebNovis</strong> segue la gestione social a ${city.name} con piano editoriale, creatività e campagne Meta orientate a risultati misurabili. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Contenuti + ads' },
                { label: 'Metodo', value: 'Report mensili' }
            ],
            sectionTitle: `Social media a ${city.name} per smettere di pubblicare senza obiettivo`,
            sectionIntro: `Costruiamo un piano che collega rubriche, creatività, advertising e KPI commerciali, così i social smettono di essere solo presenza e iniziano a diventare un canale utile.`,
            ctaTitle: `Vuoi una gestione social più misurabile a ${city.name}?`,
            ctaCopy: `Possiamo aiutarti a definire format, KPI e frequenza di pubblicazione con un piano operativo chiaro.`,
            schemaDescription: `Gestione social media a ${city.name} con contenuti, creatività e campagne Meta orientate a visibilità e lead.`
        },
        accessibilita: {
            title: `Accessibilità Web a ${city.name}: audit EAA da ${price} | WebNovis`,
            description: `Accessibilità web a ${city.name}: audit WCAG, adeguamento EAA e supporto operativo per siti aziendali. Da ${price}. Preventivo in 24 ore.`,
            ogDescription: `Audit accessibilità e adeguamento EAA/WCAG a ${city.name}. Da ${price}.`,
            heroTag: `Accessibilità Web · ${city.name} · ${price}`,
            heroH1: `Accessibilità Web a ${city.name}: audit WCAG e adeguamento EAA`,
            heroCapsule: `<strong>WebNovis</strong> aiuta aziende e professionisti di ${city.name} con audit accessibilità, remediation tecnica e supporto sull'adeguamento EAA. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'WCAG + EAA' }
            ],
            sectionTitle: `Accessibilità web a ${city.name} per ridurre rischi e blocchi operativi`,
            sectionIntro: `Lavoriamo su audit, priorità tecniche e adeguamenti concreti. L'obiettivo non è solo la checklist: è rendere il sito più usabile, più chiaro e più allineato alle richieste normative.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Siamo a Rho, quindi possiamo lavorare rapidamente con team interni, referenti IT o fornitori già coinvolti.`
                },
                {
                    title: 'Audit + remediation',
                    text: `Individuiamo criticità reali e ti aiutiamo a tradurle in interventi tecnici e contenutistici prioritizzati.`
                },
                {
                    title: 'Supporto operativo',
                    text: `Ti accompagniamo tra verifiche, adeguamento e monitoraggio, senza lasciarti con un report non eseguibile.`
                }
            ],
            ctaTitle: `Hai bisogno di capire se il tuo sito è davvero conforme a ${city.name}?`,
            ctaCopy: `Mandaci URL e contesto: ti aiutiamo a definire priorità tecniche e perimetro di adeguamento.`,
            schemaDescription: `Audit accessibilità e adeguamento EAA/WCAG a ${city.name} per siti aziendali e professionali.`
        },
        'seo-locale': {
            title: `SEO Locale a ${city.name}: Google Maps da ${price} | WebNovis`,
            description: `SEO locale a ${city.name}: Google Business Profile, pagine locali e ottimizzazione on-page per farti trovare su Maps e ricerche ad alta intenzione. Da ${price}.`,
            ogDescription: `SEO locale a ${city.name} per Google Maps e ricerche ad alta intenzione. Da ${price}.`,
            heroTag: `SEO Locale · ${city.name} · ${price}`,
            heroH1: `SEO Locale a ${city.name} per farti trovare su Google Maps`,
            heroCapsule: `<strong>WebNovis</strong> aiuta attività e professionisti di ${city.name} a comparire meglio su Google Maps e nelle ricerche locali che portano chiamate, richieste e visite in sede. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Leve', value: 'Maps + on-page' },
                { label: 'Metodo', value: 'Report mensili' }
            ],
            sectionTitle: `SEO locale a ${city.name} per intercettare ricerche con intento di contatto`,
            sectionIntro: `Lavoriamo su Google Business Profile, struttura locale delle pagine e ottimizzazione on-page per aumentare la visibilità sulle ricerche che contano davvero per chi opera sul territorio.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo progetti locali da Rho e possiamo coordinare rapidamente priorità, materiali e verifiche anche con attività di ${city.name} che hanno poco tempo da perdere.`
                },
                {
                    title: 'Maps, sito e recensioni letti insieme',
                    text: `La SEO locale non si risolve con un solo intervento: lavoriamo su profilo Google, pagine locali, segnali di fiducia e struttura del sito come un unico sistema.`
                },
                {
                    title: 'Misurazione su query e contatti',
                    text: `Impostiamo il lavoro per leggere ricerche, chiamate, richieste e progressi sulle pagine locali, non solo posizioni astratte scollegate dal business.`
                }
            ],
            processIntro: `La SEO locale funziona quando priorità tecniche, profilo Google Business Profile e contenuti locali vengono ordinati in una sequenza concreta e misurabile.`,
            processSteps: [
                {
                    title: '1. Audit locale e baseline',
                    text: `Analizziamo profilo Google, pagine locali, competitor, NAP, query e asset già esistenti per capire dove si sta perdendo visibilità.`
                },
                {
                    title: '2. Interventi on-page e profilo GBP',
                    text: `Lavoriamo su title, H1, contenuti, schema, linking interno, categorie, servizi e materiali del profilo per chiarire meglio rilevanza locale e offerta.`
                },
                {
                    title: '3. Monitoraggio, review e ottimizzazione',
                    text: `Controlliamo segnali, richieste, andamento delle query e punti deboli ancora aperti per consolidare nel tempo Maps e organico locale.`
                }
            ],
            decisionFrameworkTitle: `Le leve che fanno muovere la SEO locale a ${city.name}`,
            decisionFrameworkIntro: `I competitor che presidiano meglio le query locali non vincono sempre con il contenuto più lungo: spesso vincono perché rendono chiarissimi i segnali locali fondamentali e li collegano bene tra profilo, sito e reputazione.`,
            decisionFrameworkCards: [
                {
                    title: 'Google Business Profile ordinato',
                    text: `Categorie, servizi, immagini, descrizioni e aggiornamenti devono raccontare chiaramente cosa fai e dove operi, senza informazioni contraddittorie.`
                },
                {
                    title: 'Pagine locali coerenti e indexabili',
                    text: `Le landing locali devono avere intent chiaro, title/H1 coerenti, contenuti utili e linking interno sufficiente per non restare invisibili.`
                },
                {
                    title: 'Recensioni e segnali di fiducia',
                    text: `Le review non sostituiscono il sito, ma aiutano Maps e il click-through quando sono raccolte e presidiate con continuità.`
                },
                {
                    title: 'NAP, citazioni e misurazione',
                    text: `Coerenza di contatti, dati di sede, richieste e query presidiate serve per capire cosa sta migliorando davvero e cosa no.`
                }
            ],
            deliverablesTitle: `Cosa include un lavoro SEO locale serio a ${city.name}`,
            deliverablesIntro: `Il lavoro cambia in base al punto di partenza, ma le aree che muoviamo più spesso sono queste.`,
            deliverablesCards: [
                {
                    title: 'Audit locale e priorità',
                    text: `Snapshot iniziale di pagina, profilo Google, query, segnali locali e criticità tecniche per decidere la sequenza giusta degli interventi.`
                },
                {
                    title: 'On-page, schema e pagine locali',
                    text: `Ottimizziamo i segnali on-page che aiutano Google a leggere meglio servizio, città, area servita e rilevanza locale.`
                },
                {
                    title: 'Profilo Google e review process',
                    text: `Supportiamo organizzazione del profilo, materiali essenziali e un processo più ordinato per richiesta e gestione delle recensioni.`
                },
                {
                    title: 'Report e lettura dei risultati',
                    text: `Ti lasciamo dati leggibili su query locali, richieste e attività eseguite per capire se il lavoro sta davvero portando visibilità utile.`
                }
            ],
            intentQueriesTitle: `Ricerche locali che presidiamo a ${city.name}`,
            intentQueriesIntro: `L'obiettivo è comparire meglio dove l'intento è vicino al contatto o alla visita, non inseguire keyword lontane dal bisogno reale.`,
            intentQueries: [
                `seo locale ${city.name}`,
                `agenzia seo ${city.name}`,
                `google maps ${city.name}`,
                `posizionamento locale ${city.name}`,
                `google business profile ${city.name}`
            ],
            ctaTitle: `Vuoi più richieste da Google Maps a ${city.name}?`,
            ctaCopy: `Possiamo partire con un audit locale e un piano operativo chiaro per query, pagine e profilo aziendale.`,
            schemaDescription: `SEO locale a ${city.name} con ottimizzazione Google Business Profile, pagine locali e attività on-page per ricerche ad alta intenzione.`
        },
        'email-marketing': {
            title: `Email Marketing a ${city.name}: automazioni da ${price} | WebNovis`,
            description: `Email marketing a ${city.name} per newsletter, automazioni e recupero clienti. Strategia, copy e setup operativo da ${price}.`,
            ogDescription: `Email marketing a ${city.name} con newsletter e automazioni per fidelizzazione e vendita. Da ${price}.`,
            heroTag: `Email Marketing · ${city.name} · ${price}`,
            heroH1: `Email Marketing a ${city.name} per newsletter e automazioni che vendono`,
            heroCapsule: `<strong>WebNovis</strong> imposta email marketing a ${city.name} con newsletter, automazioni e flussi di recupero pensati per aumentare riacquisti e richieste. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Leve', value: 'Newsletter + flow' },
                { label: 'Focus', value: 'Fidelizzazione' }
            ],
            sectionTitle: `Email marketing a ${city.name} per non lasciare clienti e lead inattivi`,
            sectionIntro: `Newsletter e automazioni funzionano quando segmentazione, offerta e frequenza sono coerenti. Ti aiutiamo a trasformare liste dormienti in un canale che riattiva clienti e opportunità.`,
            ctaTitle: `Vuoi usare newsletter e automazioni in modo più strategico a ${city.name}?`,
            ctaCopy: `Raccontaci database, obiettivi e stack attuale: ti proponiamo il setup più utile da cui partire.`,
            schemaDescription: `Email marketing a ${city.name} con newsletter, automazioni e flussi di recupero per fidelizzazione e vendita.`
        },
        'restyling-sito-web': {
            title: `Restyling Sito Web a ${city.name}: redesign con migrazione SEO da ${price} | WebNovis`,
            description: `Restyling sito web a ${city.name}: redesign, revisione contenuti, performance UX e migrazione SEO senza perdere visibilità. Da ${price}.`,
            ogDescription: `Restyling sito web a ${city.name} con redesign, UX e migrazione SEO. Da ${price}.`,
            heroTag: `Restyling Sito Web · ${city.name} · ${price}`,
            heroH1: `Restyling sito web a ${city.name} per aggiornare immagine e risultati`,
            heroCapsule: `<strong>WebNovis</strong> gestisce restyling siti web a ${city.name} quando serve migliorare percezione, usabilità e performance senza disperdere il lavoro SEO già fatto. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Redesign + migrazione SEO' }
            ],
            sectionTitle: `Restyling siti web a ${city.name} per uscire da layout vecchi e poco credibili`,
            sectionIntro: `Quando il sito appare datato o dispersivo, spesso il problema non è solo estetico: cala la fiducia, peggiora la navigazione e diventa più difficile convertire. Ridisegniamo struttura, contenuti e UI mantenendo sotto controllo redirect, SEO e continuità operativa.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Lavoriamo da Rho e possiamo coordinare rapidamente redesign, raccolta materiali e rilascio del nuovo sito anche con team interni di ${city.name}.`
                },
                {
                    title: 'Restyling senza perdere asset utili',
                    text: `Analizziamo cosa va conservato, cosa va riposizionato e cosa va eliminato per non buttare via contenuti, ranking e pagine già utili.`
                },
                {
                    title: 'Immagine più attuale, sito più efficace',
                    text: `Il redesign non si ferma ai colori: lavoriamo su gerarchia, messaggi, CTA e performance percepita per migliorare contatti e autorevolezza.`
                }
            ],
            processIntro: `Partiamo dal sito attuale, leggiamo limiti di design, UX e SEO, poi progettiamo un restyling che migliori immagine, chiarezza e continuità tecnica.`,
            processSteps: [
                {
                    title: '1. Audit del sito esistente',
                    text: `Rivediamo pagine, contenuti, performance e criticità SEO del progetto attuale per capire cosa proteggere e cosa cambiare.`
                },
                {
                    title: '2. Nuova struttura e nuovo design',
                    text: `Ridisegniamo architettura, blocchi pagina, tono visivo e CTA in base agli obiettivi commerciali e al posizionamento desiderato.`
                },
                {
                    title: '3. Migrazione e rilascio ordinato',
                    text: `Gestiamo redirect, QA, messa online e supporto iniziale per ridurre rischi, errori e perdite di visibilità dopo il lancio.`
                }
            ],
            ctaTitle: `Hai un sito da aggiornare seriamente a ${city.name}?`,
            ctaCopy: `Mandaci URL, obiettivo e urgenze: ti diciamo come impostare un restyling utile e non solo cosmetico.`,
            schemaDescription: `Restyling sito web a ${city.name} con redesign, revisione UX e migrazione SEO per siti obsoleti o poco efficaci.`
        },
        'web-app': {
            title: `Web App a ${city.name}: portali e gestionali custom da ${price} | WebNovis`,
            description: `Web app a ${city.name} per portali B2B, dashboard e gestionali su misura con integrazioni API e aree riservate. Da ${price}.`,
            ogDescription: `Web app custom a ${city.name} per portali, dashboard e workflow aziendali. Da ${price}.`,
            heroTag: `Web App · ${city.name} · ${price}`,
            heroH1: `Web app a ${city.name} per processi, portali e strumenti interni`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa web app a ${city.name} per dashboard operative, aree riservate, portali clienti e workflow custom. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, sviluppo diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Portali e workflow' }
            ],
            sectionTitle: `Web app a ${city.name} quando il gestionale standard non basta`,
            sectionIntro: `Realizziamo applicazioni web su misura quando fogli condivisi, strumenti generici o flussi manuali non reggono più. L'obiettivo è costruire un ambiente operativo più ordinato, con permessi, dati e automazioni modellati sul tuo processo reale.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho seguiamo discovery, avanzamenti e review tecniche con tempi rapidi anche per aziende e team B2B di ${city.name}.`
                },
                {
                    title: 'Logica di business davvero custom',
                    text: `Non adattiamo a forza un template: mappiamo ruoli, permessi, flussi approvativi e integrazioni in base al tuo modo di lavorare.`
                },
                {
                    title: 'Scalabilità e manutenzione',
                    text: `Costruiamo una base leggibile e documentata, pensata per crescere con moduli, API e nuove esigenze senza diventare fragile.`
                }
            ],
            processIntro: `La web app parte sempre da processi, ruoli e dati. Solo dopo definiamo interfacce, logica applicativa, priorità del primo rilascio e roadmap.`,
            processSteps: [
                {
                    title: '1. Discovery funzionale',
                    text: `Analizziamo attori, casi d'uso, dati necessari e punti di attrito operativi per definire il perimetro più utile del progetto.`
                },
                {
                    title: '2. UX, architettura e backlog',
                    text: `Disegniamo schermate, flussi, integrazioni e priorità MVP con una proposta chiara su tempi, moduli e complessità tecnica.`
                },
                {
                    title: '3. Sviluppo iterativo e rilascio',
                    text: `Procediamo per milestone, QA e confronto continuo fino alla consegna dell'applicazione pronta all'uso e manutenibile.`
                }
            ],
            ctaTitle: `Vuoi capire se una web app custom ha senso per la tua azienda a ${city.name}?`,
            ctaCopy: `Descrivici processo, utenti e strumenti attuali: ti aiutiamo a stimare perimetro, priorità e investimento.`,
            schemaDescription: `Web app custom a ${city.name} per portali, dashboard, aree riservate e gestionali con integrazioni API.`
        },
        'fotografia-aziendale': {
            title: `Fotografia Aziendale a ${city.name}: shooting per brand e siti da ${price} | WebNovis`,
            description: `Fotografia aziendale a ${city.name} per team, prodotti, spazi e contenuti web/social. Shooting, selezione e post-produzione da ${price}.`,
            ogDescription: `Fotografia aziendale a ${city.name} per sito, social e materiali di brand. Da ${price}.`,
            heroTag: `Fotografia Aziendale · ${city.name} · ${price}`,
            heroH1: `Fotografia aziendale a ${city.name} per siti, social e materiali credibili`,
            heroCapsule: `<strong>WebNovis</strong> organizza shooting di fotografia aziendale a ${city.name} per ritratti team, ambienti, prodotti e contenuti digitali coerenti con il brand. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, coordinamento diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Sito + social + brand' }
            ],
            sectionTitle: `Fotografia aziendale a ${city.name} per non appoggiarsi a immagini deboli o anonime`,
            sectionIntro: `Molti siti e profili aziendali perdono fiducia perché mostrano foto generiche, stock incoerenti o scatti improvvisati. Costruiamo shooting utili davvero: materiali che migliorano sito, social, brochure e presentazioni con una direzione visiva coerente.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Partiamo da Rho ma possiamo coordinare rapidamente sopralluoghi, scaletta e produzione per aziende, showroom e studi di ${city.name}.`
                },
                {
                    title: 'Scatti pensati per gli usi reali',                    text: `Ogni sessione viene progettata in base ai punti di contatto in cui userai le immagini: homepage, team page, social, campagne o cataloghi.`
                },
                {
                    title: 'Brand consistency',
                    text: `Lavoriamo su inquadrature, tono, styling e selezione finale per evitare gallerie disomogenee che indeboliscono la percezione del marchio.`
                }
            ],
            processIntro: `La fotografia aziendale funziona quando pre-produzione, shooting e selezione vengono pensati sui canali dove le immagini dovranno vivere.`,
            processSteps: [
                {
                    title: '1. Brief e lista scatti',
                    text: `Definiamo uso delle immagini, persone da coinvolgere, ambienti, oggetti e mood complessivo per evitare produzione casuale.`
                },
                {
                    title: '2. Shooting in sede o location',
                    text: `Organizziamo sessione, tempi e inquadrature in modo efficiente per ottenere materiali spendibili da subito sul digitale.`
                },
                {
                    title: '3. Selezione e post-produzione',
                    text: `Consegniamo scatti ottimizzati, coerenti tra loro e pronti per sito, social, campagne o documenti commerciali.`
                }
            ],
            ctaTitle: `Ti servono foto aziendali davvero utili a ${city.name}?`,
            ctaCopy: `Scrivici che tipo di immagini ti mancano e dove le userai: impostiamo una produzione mirata, non uno shooting generico.`,
            schemaDescription: `Fotografia aziendale a ${city.name} per team, prodotti, spazi e contenuti digitali destinati a sito, social e materiali di brand.`
        },
        copywriting: {
            title: `Copywriting a ${city.name}: testi per siti e campagne da ${price} | WebNovis`,
            description: `Copywriting a ${city.name} per siti web, landing page e campagne: messaggi chiari, tono coerente e testi orientati alla conversione. Da ${price}.`,
            ogDescription: `Copywriting a ${city.name} per siti, landing e campagne con tono di voce e conversione. Da ${price}.`,
            heroTag: `Copywriting · ${city.name} · ${price}`,
            heroH1: `Copywriting a ${city.name} per farti capire e farti scegliere`,
            heroCapsule: `<strong>WebNovis</strong> scrive copy per aziende e professionisti di ${city.name} quando serve chiarire posizionamento, migliorare pagine e trasformare visite in richieste. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Messaggio + conversione' }
            ],
            sectionTitle: `Copywriting a ${city.name} per smettere di dire tutto e non dire nulla`,
            sectionIntro: `I testi sono spesso il collo di bottiglia: prodotti complessi spiegati male, servizi indistinti, CTA deboli e tono di voce incoerente. Lavoriamo per rendere più chiaro il valore dell'offerta e guidare il visitatore verso la scelta giusta.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo i progetti da Rho con interviste, review e revisioni rapide anche con team commerciali o founder di ${city.name}.`
                },
                {
                    title: 'Copy che parte dalla strategia',
                    text: `Prima definiamo pubblico, obiettivo e messaggio principale. Solo dopo scriviamo headline, sezioni e CTA in modo coerente.`
                },
                {
                    title: 'SEO e leggibilità insieme',
                    text: `Ottimizziamo struttura e parole chiave senza trasformare i testi in pagine rigide o artificiali da leggere.`
                }
            ],
            processIntro: `Il copy migliore nasce da un buon brief, da priorità chiare e da una struttura pensata per chi legge, non per riempire spazi.`,
            processSteps: [
                {
                    title: '1. Analisi di tono e posizionamento',
                    text: `Raccogliamo contesto, obiettivi, competitor e obiezioni frequenti per capire come deve parlare davvero il brand.`
                },
                {
                    title: '2. Architettura dei messaggi',
                    text: `Definiamo priorità narrative, titoli, prove, CTA e flusso dei contenuti prima della stesura finale.`
                },
                {
                    title: '3. Scrittura e rifinitura',
                    text: `Consegniamo testi pronti per sito o campagna, con revisioni mirate e attenzione a chiarezza, ritmo e conversione.`
                }
            ],
            ctaTitle: `Hai pagine che non spiegano bene il tuo valore a ${city.name}?`,
            ctaCopy: `Mandaci URL o bozza: ti aiutiamo a capire cosa riscrivere, con quale tono e con quale priorità.`,
            schemaDescription: `Copywriting a ${city.name} per siti web, landing page e campagne con attenzione a tono di voce, chiarezza e conversione.`
        },
        'google-ads': {
            title: `Google Ads a ${city.name}: campagne search e lead da ${price} | WebNovis`,
            description: `Google Ads a ${city.name} per lead generation, e-commerce e servizi locali: struttura campagne, tracking e ottimizzazione continua. Da ${price}.`,
            ogDescription: `Google Ads a ${city.name} con campagne Search, tracking e ottimizzazione lead. Da ${price}.`,
            heroTag: `Google Ads · ${city.name} · ${price}`,
            heroH1: `Google Ads a ${city.name} per intercettare ricerche con intento reale`,
            heroCapsule: `<strong>WebNovis</strong> segue campagne Google Ads a ${city.name} per aziende, professionisti ed e-commerce che vogliono generare richieste o vendite da query già attive. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Search + tracking' },
                { label: 'Metodo', value: 'Ottimizzazione continua' }
            ],
            sectionTitle: `Google Ads a ${city.name} per trasformare domanda esistente in lead o ordini`,
            sectionIntro: `Google Ads funziona bene quando struttura campagne, query, annunci e pagina di arrivo lavorano insieme. Gestiamo setup, misurazione e ottimizzazione per ridurre dispersione e concentrarci sulle ricerche che hanno più probabilità di convertire.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho e possiamo coordinare rapidamente campagne locali o B2B per attività e team commerciali di ${city.name}.`
                },
                {
                    title: 'Tracking prima della spesa',
                    text: `Non attiviamo campagne alla cieca: definiamo conversioni, eventi e pagine di atterraggio per leggere davvero il risultato.`
                },
                {
                    title: 'Ottimizzazione sulle query che contano',
                    text: `Lavoriamo su intenzione di ricerca, esclusioni, annunci e landing per concentrare budget sulle opportunità più utili.`
                }
            ],
            processIntro: `Le campagne Google Ads partono dal modo in cui le persone cercano, non da una lista casuale di keyword o da creatività improvvisate.`,
            processSteps: [
                {
                    title: '1. Audit, tracking e struttura',
                    text: `Definiamo obiettivi, conversioni, gruppi di annunci e pagine di destinazione su cui costruire il lavoro.`
                },
                {
                    title: '2. Attivazione e lettura dei primi dati',
                    text: `Lanciamo le campagne, leggiamo termini di ricerca, CTR, conversioni e costi per identificare subito gli aggiustamenti necessari.`
                },
                {
                    title: '3. Ottimizzazione continua',
                    text: `Aggiorniamo keyword, esclusioni, annunci, offerte e landing per migliorare qualità dei lead e sostenibilità del budget.`
                }
            ],
            ctaTitle: `Vuoi capire se Google Ads può funzionare meglio a ${city.name}?`,
            ctaCopy: `Scrivici settore, obiettivo e budget indicativo: ti aiutiamo a capire se hai margine per migliorare setup e rendimento.`,
            schemaDescription: `Google Ads a ${city.name} per lead generation, servizi locali ed e-commerce con tracking e ottimizzazione continua.`
        },
        'consulenza-digitale': {
            title: `Consulenza Digitale a ${city.name}: audit e roadmap da ${price} | WebNovis`,
            description: `Consulenza digitale a ${city.name} per audit della presenza online, priorità operative e roadmap di crescita. Da ${price}.`,
            ogDescription: `Consulenza digitale a ${city.name} con audit e piano d'azione operativo. Da ${price}.`,
            heroTag: `Consulenza Digitale · ${city.name} · ${price}`,
            heroH1: `Consulenza digitale a ${city.name} per capire cosa fare prima`,
            heroCapsule: `<strong>WebNovis</strong> offre consulenza digitale a ${city.name} quando servono audit, priorità e una roadmap realistica tra sito, contenuti, acquisizione e strumenti. Investimento da <strong>${price}</strong>, sessioni e supporto diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: service.timeEstimate },
                { label: 'Focus', value: 'Audit + roadmap' }
            ],
            sectionTitle: `Consulenza digitale a ${city.name} per uscire da decisioni confuse o scollegate`,
            sectionIntro: `Se il problema non è solo eseguire ma capire priorità, canali e sequenza giusta, lavoriamo su audit e direzione. L'obiettivo è arrivare a una vista più chiara su cosa migliorare, in che ordine e con quali metriche.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho organizziamo confronti agili con imprenditori, marketing manager e team operativi di ${city.name}.`
                },
                {
                    title: 'Visione trasversale',
                    text: `Mettiamo insieme sito, contenuti, advertising, SEO, automazioni e brand per evitare decisioni isolate che si pestano i piedi.`
                },
                {
                    title: 'Output utile, non teoria',
                    text: `La consulenza si traduce in priorità, check, opportunità e prossime mosse concrete, non in una lista astratta di idee.`
                }
            ],
            processIntro: `La consulenza digitale serve quando prima di investire devi capire bene dove stai perdendo valore e cosa conviene sistemare per primo.`,
            processSteps: [
                {
                    title: '1. Audit del contesto digitale',
                    text: `Raccogliamo dati, stack, canali attivi, criticità del sito e obiettivi commerciali per leggere il quadro reale.`
                },
                {
                    title: '2. Priorità e scenari',
                    text: `Mettiamo ordine tra urgenze, opportunità e costi di intervento per costruire una roadmap sostenibile e sensata.`
                },
                {
                    title: '3. Piano operativo o affiancamento',
                    text: `Chiudiamo con linee guida, azioni consigliate e, se serve, un percorso di supporto sull'esecuzione successiva.`
                }
            ],
            ctaTitle: `Ti serve più chiarezza strategica sul digitale a ${city.name}?`,
            ctaCopy: `Raccontaci dove sei bloccato: possiamo aiutarti a ordinare decisioni, budget e priorità con un audit mirato.`,
            schemaDescription: `Consulenza digitale a ${city.name} con audit della presenza online, definizione priorità e roadmap operativa.`
        },
        'manutenzione-sito': {
            title: `Manutenzione Sito a ${city.name}: supporto tecnico continuativo da ${price} | WebNovis`,
            description: `Manutenzione sito a ${city.name} con backup, aggiornamenti, monitoraggio e interventi prioritari per siti aziendali ed e-commerce. Da ${price}.`,
            ogDescription: `Manutenzione sito a ${city.name} con backup, update e monitoraggio. Da ${price}.`,
            heroTag: `Manutenzione Sito · ${city.name} · ${price}`,
            heroH1: `Manutenzione sito a ${city.name} per lavorare con più tranquillità`,
            heroCapsule: `<strong>WebNovis</strong> segue la manutenzione siti web a ${city.name} con controlli tecnici, backup, aggiornamenti e interventi prioritari quando qualcosa si rompe o rallenta. Investimento da <strong>${price}</strong>, gestione diretta da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: 'Continuativo' },
                { label: 'Focus', value: 'Stabilità e supporto' }
            ],
            sectionTitle: `Manutenzione siti a ${city.name} per evitare problemi silenziosi che diventano costosi`,
            sectionIntro: `Aggiornamenti trascurati, errori nascosti, rallentamenti e backup mancanti spesso emergono solo quando c'è già un danno. La manutenzione serve a presidiare stabilità, sicurezza e continuità del sito con un referente unico e tempi chiari.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Seguiamo il supporto da Rho con interventi rapidi e coordinamento semplice anche per attività e PMI di ${city.name}.`
                },
                {
                    title: 'Controlli regolari',
                    text: `Monitoriamo aggiornamenti, backup, errori evidenti e stato generale del sito per ridurre sorprese e disservizi.`
                },
                {
                    title: 'Supporto pratico',
                    text: `Quando serve un intervento, non devi ricostruire il contesto ogni volta: abbiamo storico, accessi e priorità già allineati.`
                }
            ],
            processIntro: `La manutenzione utile non è solo un aggiornamento sporadico: è un presidio tecnico leggero ma continuo su ciò che tiene in piedi il sito.`,
            processSteps: [
                {
                    title: '1. Presa in carico tecnica',
                    text: `Raccogliamo accessi, stack, backup e stato generale del progetto per capire rischi e priorità operative.`
                },
                {
                    title: '2. Monitoraggio e interventi programmati',
                    text: `Gestiamo update, controlli ricorrenti e piccoli fix per mantenere il sito affidabile nel tempo.`
                },
                {
                    title: '3. Assistenza su problemi urgenti',
                    text: `In caso di errori, rallentamenti o anomalie interveniamo con una lettura tecnica più rapida grazie al presidio continuativo.`
                }
            ],
            ctaTitle: `Hai un sito da tenere sotto controllo a ${city.name}?`,
            ctaCopy: `Se vuoi evitare emergenze e perdite di tempo, possiamo aiutarti a impostare una manutenzione più ordinata e affidabile.`,
            schemaDescription: `Manutenzione sito a ${city.name} con backup, aggiornamenti, monitoraggio e supporto tecnico continuativo.`
        },
        'sviluppo-app-mobile': {
            title: `App Mobile a ${city.name}: sviluppo iOS e Android da ${price} | WebNovis`,
            description: `Sviluppo app mobile a ${city.name} per iOS e Android: progettazione prodotto, UX mobile e sviluppo custom da ${price}.`,
            ogDescription: `Sviluppo app mobile a ${city.name} per iOS e Android con UX e logica prodotto. Da ${price}.`,
            heroTag: `App Mobile · ${city.name} · ${price}`,
            heroH1: `Sviluppo app mobile a ${city.name} per prodotti davvero usabili`,
            heroCapsule: `<strong>WebNovis</strong> sviluppa app mobile a ${city.name} per progetti che richiedono un'esperienza pensata per smartphone, flussi chiari e una base tecnica sostenibile. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, coordinamento diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'UX mobile + prodotto' }
            ],
            sectionTitle: `App mobile a ${city.name} per loyalty, booking e servizi digitali`,
            sectionIntro: `Un app ha senso quando semplifica un flusso ricorrente e offre un vantaggio reale rispetto al sito mobile. Lavoriamo su concept, UX, logica prodotto e roadmap per costruire un'esperienza utile e non un duplicato superfluo del web.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Possiamo seguire discovery, UX e sviluppo da Rho con review costanti insieme a founder o team di ${city.name}.`
                },
                {
                    title: 'Prima il prodotto, poi la tecnologia',
                    text: `Definiamo casi d'uso, frequenza d'utilizzo e priorità prima di parlare di feature, così il progetto resta sostenibile.`
                },
                {
                    title: 'Percorso chiaro verso il rilascio',
                    text: `Impostiamo un MVP concreto, testabile e pronto a crescere per fasi, evitando backlog infiniti e funzioni premature.`
                }
            ],
            processIntro: `Lo sviluppo mobile parte da frequenza d'uso, bisogni reali e livello di complessità del prodotto, non dal desiderio generico di avere un app.`,
            processSteps: [
                {
                    title: '1. Discovery e perimetro MVP',
                    text: `Definiamo pubblico, scenario d'uso, feature essenziali e metriche con cui giudicare il primo rilascio dell'app.`
                },
                {
                    title: '2. UX mobile e architettura',
                    text: `Disegniamo flussi, schermate e logica dati in modo coerente con iOS, Android e con l'esperienza che vuoi offrire.`
                },
                {
                    title: '3. Sviluppo, QA e rilascio',
                    text: `Procediamo per milestone, test e affinamenti fino a una consegna pronta per raccolta feedback e crescita successiva.`
                }
            ],
            ctaTitle: `Stai valutando un app mobile per il tuo business a ${city.name}?`,
            ctaCopy: `Raccontaci uso previsto, utenti e obiettivo: possiamo aiutarti a capire se conviene davvero e da dove partire.`,
            schemaDescription: `Sviluppo app mobile a ${city.name} per iOS e Android con attenzione a UX, MVP e logica prodotto.`
        },
        'automazione-business': {
            title: `Automazione Business a ${city.name}: workflow e integrazioni da ${price} | WebNovis`,
            description: `Automazione business a ${city.name} per CRM, email, processi interni e passaggi ripetitivi con workflow e integrazioni su misura. Da ${price}.`,
            ogDescription: `Automazione business a ${city.name} per workflow, CRM ed email. Da ${price}.`,
            heroTag: `Automazione Business · ${city.name} · ${price}`,
            heroH1: `Automazione business a ${city.name} per eliminare lavoro ripetitivo e colli di bottiglia`,
            heroCapsule: `<strong>WebNovis</strong> progetta automazioni business a ${city.name} quando CRM, email, richieste e passaggi interni generano perdita di tempo o errori evitabili. Investimento da <strong>${price}</strong>, tempi <strong>${service.timeEstimate}</strong>, setup diretto da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Tempi', value: service.timeEstimate },
                { label: 'Focus', value: 'Workflow e integrazioni' }
            ],
            sectionTitle: `Automazione business a ${city.name} per far scorrere meglio il lavoro operativo`,
            sectionIntro: `Automatizziamo i punti in cui il processo si inceppa: passaggi manuali, doppie compilazioni, notifiche assenti, lead senza follow-up o dati che non circolano tra strumenti. L'obiettivo è liberare tempo utile e ridurre errori ripetitivi.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Operiamo da Rho e possiamo allinearci rapidamente con chi gestisce commerciale, operations o amministrazione a ${city.name}.`
                },
                {
                    title: 'Automazioni costruite sul processo reale',
                    text: `Prima mappiamo chi fa cosa, con quali strumenti e dove si blocca il flusso. Solo dopo scegliamo tool, regole e integrazioni.`
                },
                {
                    title: 'Risultato visibile sul lavoro quotidiano',
                    text: `Le automazioni hanno senso se riducono tempi, errori e passaggi inutili già dalla prima settimana di utilizzo.`
                }
            ],
            processIntro: `L'automazione funziona quando capiamo bene flusso, eccezioni e responsabilità. Non basta collegare due strumenti: serve progettare il percorso.`,
            processSteps: [
                {
                    title: '1. Mappatura del processo',
                    text: `Identifichiamo attori, strumenti, colli di bottiglia e passaggi ripetitivi su cui ha senso intervenire subito.`
                },
                {
                    title: '2. Setup di workflow e integrazioni',
                    text: `Costruiamo regole, trigger, notifiche e scambi dati tra piattaforme per alleggerire il lavoro manuale.`
                },
                {
                    title: '3. Test, correzioni e handoff',
                    text: `Verifichiamo casi reali, sistemiamo eccezioni e ti lasciamo un flusso più robusto, leggibile e facile da usare.`
                }
            ],
            ctaTitle: `Hai processi manuali che ti fanno perdere tempo a ${city.name}?`,
            ctaCopy: `Descrivici dove si inceppa il lavoro: valutiamo insieme quali automazioni possono creare impatto subito.`,
            schemaDescription: `Automazione business a ${city.name} per workflow, CRM, email e processi interni con integrazioni su misura.`
        },
        consulenze: {
            title: `Consulenze a ${city.name}: sessioni mirate su web, SEO e brand da ${price} | WebNovis`,
            description: `Consulenze a ${city.name} per siti web, SEO/GEO, branding e scelte digitali da chiarire con una seconda opinione operativa. Da ${price}.`,
            ogDescription: `Consulenze a ${city.name} per web, SEO, brand e decisioni digitali. Da ${price}.`,
            heroTag: `Consulenze · ${city.name} · ${price}`,
            heroH1: `Consulenze a ${city.name} per sbloccare una decisione digitale precisa`,
            heroCapsule: `<strong>WebNovis</strong> offre consulenze a ${city.name} quando hai bisogno di un confronto mirato su un sito, una pagina, una scelta SEO/GEO, un preventivo o un dubbio di posizionamento. Investimento da <strong>${price}</strong>, sessioni rapide da Rho (${city.distanzaSede}).`,
            heroHighlights: [
                { label: 'Investimento', value: `Da ${price}` },
                { label: 'Formato', value: service.timeEstimate },
                { label: 'Focus', value: 'Second opinion operativa' }
            ],
            sectionTitle: `Consulenze a ${city.name} quando non ti serve un progetto intero ma una risposta buona adesso`,
            sectionIntro: `Ci sono momenti in cui non serve attivare subito un servizio completo: serve capire se un preventivo è sensato, se una pagina sta sbagliando direzione, se un rebrand ha senso o se una scelta SEO vale il budget. Qui lavoriamo come seconda opinione, molto concreta.`,
            whyCards: [
                {
                    title: `${city.distanzaSede} dalla tua sede`,
                    text: `Da Rho possiamo organizzare confronti rapidi con professionisti, PMI e founder di ${city.name} che hanno bisogno di chiarezza subito.`
                },
                {
                    title: 'Confronto focalizzato',
                    text: `La sessione è costruita su una domanda precisa, non su un audit generico: così il tempo produce una risposta più utile.`
                },
                {
                    title: 'Indicazioni azionabili',
                    text: `Chiudiamo con decisioni, priorità e cose da fare o da evitare, non con una conversazione vaga che lascia tutto aperto.`
                }
            ],
            processIntro: `Le consulenze più utili nascono da una domanda chiara e da un perimetro ben definito: problema, materiali da vedere e decisione da prendere.`,
            processSteps: [
                {
                    title: '1. Raccolta del contesto',
                    text: `Prima della call capiamo obiettivo, materiali da analizzare e punto preciso su cui vuoi un confronto.`
                },
                {
                    title: '2. Sessione orientata alla decisione',
                    text: `Durante la consulenza entriamo nel merito di pagine, preventivi, posizionamento o opzioni strategiche con taglio pratico.`
                },
                {
                    title: '3. Sintesi delle prossime mosse',
                    text: `Ti lasciamo un riepilogo con priorità, rischi da evitare e passi successivi consigliati in base al tema affrontato.`
                }
            ],
            ctaTitle: `Hai una scelta digitale da chiarire a ${city.name}?`,
            ctaCopy: `Mandaci la domanda specifica e i materiali utili: impostiamo una consulenza breve ma davvero orientata alla decisione.`,
            schemaDescription: `Consulenze a ${city.name} su siti web, SEO/GEO, brand e decisioni digitali che richiedono una seconda opinione operativa.`
        }
    };

    return { ...fallback, ...(overrides[service.slug] || {}) };
}

function getRealizzazioneSeoCopy(city) {
    return {
        title: `Siti Web a ${city.name}: da €1.200, SEO integrata | WebNovis`,
        description: `Realizzazione siti web a ${city.name} per PMI e professionisti: landing da €500, siti vetrina da €1.200, e-commerce da €3.500. Preventivo gratuito entro 24 ore.`,
        ogTitle: `Realizzazione Siti Web a ${city.name}: preventivo in 24 ore | WebNovis`,
        ogDescription: `Siti web custom a ${city.name} con SEO tecnica integrata, design orientato ai contatti e gestione diretta da Rho (${city.distanzaSede}).`,
        heroTag: `Siti Web ${city.name} · preventivo in 24 ore`,
        heroH1: `Realizzazione Siti Web a ${city.name} per PMI e professionisti`,
        heroCapsule: `Cerchi una <strong>web agency a ${city.name}</strong> per creare un sito che trasmetta valore e porti richieste concrete? WebNovis realizza landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con <strong>codice 100% custom</strong>, SEO tecnica integrata e gestione diretta da Rho (${city.distanzaSede}).`
    };
}

function getAgenziaSeoCopy(city) {
    const searchModifier = getGeoSearchModifier(city);
    const sectorPhrase = formatSectorList((city.localContext?.settoriChiave || []).slice(0, 2));
    const firstHighlight = city.localContext?.highlights?.[0]
        ? truncateText(
            String(city.localContext.highlights[0])
                .split('—')[0]
                .split('(')[0]
                .replace(/\s+/g, ' ')
                .trim(),
            44
        )
        : '';
    const differentiator = sectorPhrase || firstHighlight || `${Number(city.population || 0).toLocaleString('it-IT')} abitanti`;

    if (city.isSede) {
        return {
            title: `Agenzia Web a ${city.name} (Milano) — WebNovis | Siti Web Custom, Grafica e Social`,
            description: `WebNovis è l'agenzia web con sede a Rho: siti custom per PMI tra Fiera Milano, servizi B2B e hinterland. Preventivo gratuito entro 24 ore.`,
            ogTitle: `Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing`,
            ogDescription: `WebNovis è l'agenzia web con sede a Rho per PMI, professionisti e attività dell'hinterland. Siti custom, grafica e social con gestione diretta.`,
            keywords: `agenzia web ${city.name}, web agency ${city.name} ${searchModifier}, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}`
        };
    }

    return {
        title: `Agenzia Web a ${city.name} (${city.province || 'MI'}) — WebNovis | Siti Web Custom, Grafica e Social`,
        description: `Agenzia web per ${city.name}: siti custom per ${differentiator}. Sede a Rho, ${city.distanzaSede}. Preventivo gratuito entro 24 ore.`,
        ogTitle: `Agenzia Web a ${city.name} — WebNovis | Siti Web Custom e Digital Marketing`,
        ogDescription: `WebNovis è l'agenzia web per ${city.name}: siti custom, grafica e social per realtà locali legate a ${differentiator}. Sede a Rho, ${city.distanzaSede}.`,
        keywords: `agenzia web ${city.name}, web agency ${city.name} ${searchModifier}, sviluppo siti web ${city.name}, web designer ${city.name}, agenzia digitale ${city.name}, WebNovis ${city.name}`
    };
}

// ─── Schema Generation ───────────────────────────────────────────────────────

function generateSchemas(city, pageType, resolvedFaqs) {
    const slug = pageType === 'agenzia'
        ? `agenzia-web-${city.slug}.html`
        : `realizzazione-siti-web-${city.slug}.html`;
    const canonical = `${SITE}/${slug}`;
    const isAgenziaPage = pageType === 'agenzia';
    const breadcrumbLabel = isAgenziaPage
        ? `Agenzia Web ${city.name}`
        : `Realizzazione Siti Web a ${city.name}`;
    const hubCrumb = isAgenziaPage
        ? { name: 'Agenzia Web', item: `${SITE}/agenzia-web/` }
        : { name: 'Siti Web per Comuni', item: `${SITE}/realizzazione-siti-web/` };
    const webPageDescription = isAgenziaPage
        ? `WebNovis è l'agenzia web per ${city.name} e hinterland milanese. Siti 100% custom, graphic design, social media. Sede a Rho, ${city.distanzaSede} da ${city.name}.`
        : `Realizzazione siti web a ${city.name} per PMI e professionisti: landing page, siti vetrina ed e-commerce custom con SEO tecnica integrata e gestione diretta da Rho (${city.distanzaSede}).`;
    const offerCatalogName = isAgenziaPage
        ? `Servizi Web a ${city.name}`
        : `Servizi di Realizzazione Siti Web a ${city.name}`;
    const serviceName = isAgenziaPage
        ? `Sviluppo Siti Web a ${city.name}`
        : `Realizzazione Siti Web a ${city.name}`;
    const serviceDescription = isAgenziaPage
        ? `Realizzazione siti web 100% custom per aziende di ${city.name} e comuni limitrofi.`
        : `Realizzazione siti web 100% custom per aziende e professionisti di ${city.name}, con landing page, siti vetrina ed e-commerce orientati ai contatti.`;

    // Build areaServed from focal city + nearCities
    const primaryAreaServed = getAreaServedEntity(city);
    const nearCityObjects = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        if (!nc) return { "@type": "City", "name": ncSlug };
        const obj = { "@type": "City", "name": nc.name };
        if (nc.wikipedia) obj.sameAs = nc.wikipedia;
        return obj;
    });
    const areaServedObjects = [
        primaryAreaServed,
        ...nearCityObjects,
        { "@type": "AdministrativeArea", "name": "Hinterland milanese" },
        { "@type": "AdministrativeArea", "name": "Città Metropolitana di Milano" }
    ];

    const schemas = [
        // BreadcrumbList (3 levels: Home → Hub → City)
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": hubCrumb.name, "item": hubCrumb.item },
                { "@type": "ListItem", "position": 3, "name": breadcrumbLabel, "item": canonical }
            ]
        },
        // Commercial landing WebPage
        {
            "@context": "https://schema.org", "@type": "WebPage",
            "@id": canonical,
            "name": breadcrumbLabel + " — WebNovis",
            "description": webPageDescription,
            "url": canonical,
            "inLanguage": "it",
            "isPartOf": { "@id": SITE + "/#website" },
            "about": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "datePublished": FIRST_DEPLOY_DATE,
            "dateModified": TODAY
        },
        // Service
        {
            "@context": "https://schema.org", "@type": "Service",
            "@id": canonical + "#service",
            "serviceType": "Web Development",
            "name": serviceName,
            "description": serviceDescription,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": areaServedObjects.slice(0, 7),
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": offerCatalogName,
                "itemListElement": offerCatalogServices.map((service) => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": service.shortName + " a " + city.name,
                        "url": SITE + service.url
                    }
                }))
            },
            "offers": [
                { "@type": "Offer", "name": "Landing Page", "price": "500", "priceCurrency": "EUR" },
                { "@type": "Offer", "name": "Sito Vetrina", "price": "1200", "priceCurrency": "EUR" },
                { "@type": "Offer", "name": "E-Commerce Custom", "price": "3500", "priceCurrency": "EUR" }
            ]
        },
        ...coreServices.map((service) => ({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": canonical + `#service-${service.slug}`,
            "serviceType": service.name,
            "name": `${service.shortName} a ${city.name}`,
            "description": `${service.shortDesc} Per aziende e professionisti di ${city.name}, con gestione diretta da Rho (${city.distanzaSede}).`,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": primaryAreaServed,
            "url": SITE + service.url,
            "offers": {
                "@type": "Offer",
                "price": String(service.priceFrom),
                "priceCurrency": "EUR",
                "url": SITE + service.url
            }
        }))
    ];

    // FAQPage schema (only if FAQs exist)
    if (resolvedFaqs.length > 0) {
        schemas.push({
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": resolvedFaqs.map(f => ({
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

function normalizeHandCraftedTailWhitespace(html) {
    return html.replace(
        /(<script defer src="[^"]*js\/noncritical-loader\.min\.js"><\/script>)\s*(?=<script type="speculationrules">)/i,
        '$1'
    );
}

function normalizeHandCraftedAgenziaPage(html, resolvedFaqs) {
    let faqSchemaWritten = false;
    let normalized = html.replace(
        /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/gi,
        (fullMatch, json) => {
            try {
                const schema = JSON.parse(json);
                const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];

                if (types.includes('LocalBusiness') || types.includes('Review')) return '';

                if (schema['@type'] === 'FAQPage' || types.includes('FAQPage')) {
                    if (faqSchemaWritten || resolvedFaqs.length === 0) return '';
                    faqSchemaWritten = true;
                    return `<script type="application/ld+json">${JSON.stringify(buildFaqPageSchema(resolvedFaqs))}</script>`;
                }

                removeSchemaReviewProperties(schema);
                if (schema['@type'] === 'WebPage') {
                    delete schema.speakable;
                    schema.about = { '@id': SINGLETON_LOCAL_BUSINESS_ID };
                }
                if (schema['@type'] === 'Service') {
                    schema.provider = { '@id': SINGLETON_LOCAL_BUSINESS_ID };
                }

                return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            } catch {
                return fullMatch;
            }
        }
    );

    if (resolvedFaqs.length > 0 && !faqSchemaWritten) {
        const faqSchema = `<script type="application/ld+json">${JSON.stringify(buildFaqPageSchema(resolvedFaqs))}</script>`;
        normalized = normalized.replace(/<\/head>/i, `${faqSchema}</head>`);
    }

    return normalizeHandCraftedTailWhitespace(rebuildVisibleFaqItems(normalized, resolvedFaqs));
}

function replaceMetaTagContent(html, attrName, attrValue, content) {
    const escapedAttrValue = escapeRegex(attrValue);
    const escapedContent = escapeHtmlAttr(content);
    let updated = html.replace(
        new RegExp(`(<meta\\b[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*\\bcontent=")[^"]*("[^>]*>)`, 'i'),
        `$1${escapedContent}$2`
    );

    if (updated !== html) return updated;

    updated = html.replace(
        new RegExp(`(<meta\\b[^>]*\\bcontent=")[^"]*("[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*>)`, 'i'),
        `$1${escapedContent}$2`
    );

    return updated;
}

function replaceLinkHref(html, attrName, attrValue, href) {
    const escapedAttrValue = escapeRegex(attrValue);
    let updated = html.replace(
        new RegExp(`(<link\\b[^>]*\\b${attrName}=(["'])${escapedAttrValue}\\2[^>]*\\bhref=(["']))[^"']*(\\3[^>]*>)`, 'i'),
        `$1${href}$4`
    );

    if (updated !== html) return updated;

    updated = html.replace(
        new RegExp(`(<link\\b[^>]*\\bhref=(["']))[^"']*(\\2[^>]*\\b${attrName}=(["'])${escapedAttrValue}\\4[^>]*>)`, 'i'),
        `$1${href}$3`
    );

    return updated;
}

function ensureSelfHreflang(headHtml, canonical) {
    const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${canonical}">`;
    const withoutExisting = headHtml.replace(/\s*<link\b[^>]*\bhreflang=["']it-IT["'][^>]*>/gi, '');

    if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(withoutExisting)) {
        return withoutExisting.replace(/(<link\b[^>]*rel=["']canonical["'][^>]*>)/i, `$1 ${hreflangTag}`);
    }

    return withoutExisting.replace(/<\/head>/i, `${hreflangTag}</head>`);
}

function updateDerivedHeadMeta(headHtml, meta, options = {}) {
    const { stripJsonLd = true } = options;
    let updated = (stripJsonLd ? stripJsonLdFromHead(headHtml) : headHtml)
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);

    updated = replaceMetaTagContent(updated, 'name', 'description', meta.description);
    updated = replaceMetaTagContent(updated, 'property', 'og:url', meta.canonical);
    updated = replaceMetaTagContent(updated, 'property', 'og:title', meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'property', 'og:description', meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'name', 'twitter:title', meta.twitterTitle || meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'property', 'twitter:title', meta.twitterTitle || meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'name', 'twitter:description', meta.twitterDescription || meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'property', 'twitter:description', meta.twitterDescription || meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'name', 'robots', meta.robots || buildRobotsContent(new URL(meta.canonical).pathname));
    updated = replaceLinkHref(updated, 'rel', 'canonical', meta.canonical);
    updated = ensureSelfHreflang(updated, meta.canonical);

    if (meta.keywords) {
        updated = replaceMetaTagContent(updated, 'name', 'keywords', meta.keywords);
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
    const agenziaSeo = getAgenziaSeoCopy(city);

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
            try {
                agenziaTier1Content = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
            } catch (e) { /* malformed tier1 override, fall back to standard content */ }
        }
    }

    // Build template data for agenzia
    const ctx = city.localContext || {};
    const aiBlock = contentBlocks.get(city.slug); // AI-generated content (if available)

    // AI content enrichment: merge AI-generated blocks with defaults
    const section3Text = aiBlock?.localMarketAnalysis
        ? `<p>${aiBlock.localMarketAnalysis}</p>` + (aiBlock.competitiveContext ? `<p>${aiBlock.competitiveContext}</p>` : '')
        : buildLocalContextHtml(city);
    const resolvedFaqs = resolvePageFaqs(city, 'agenzia', aiBlock);
    const section1Intro = aiBlock?.competitiveContext
        ? (ctx.tessutoEconomico || '') + ' ' + aiBlock.competitiveContext
        : ctx.tessutoEconomico || `${city.name} è un comune dell'hinterland milanese con un tessuto imprenditoriale attivo.`;

    const templateData = {
        city: {
            ...city,
            provinceDisplay: getProvinceDisplay(city),
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
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
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

// ─── Realizzazione Page Generator (regex-based on Rho template) ───────────────

function generateRealizzazionePage(city) {
    const basePage = getBasePage('realizzazione-siti-web-source.html');
    if (!basePage) {
        console.error('❌ Base page realizzazione-siti-web-rho.html not found');
        return null;
    }
    let page = basePage;

    const canonical = `${SITE}/realizzazione-siti-web-${city.slug}.html`;
    const realizzazioneSeo = getRealizzazioneSeoCopy(city);
    const aiBlock = contentBlocks.get(city.slug);
    const resolvedFaqs = resolvePageFaqs(city, 'realizzazione', aiBlock);
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

    page = page.replace(/realizzazione siti web a Rho/gi, `realizzazione siti web a ${city.name}`);
    page = page.replace(/creazione di siti web a Rho/gi, `creazione di siti web a ${city.name}`);
    page = page.replace(/realizzazione-siti-web-rho\.html/g, `realizzazione-siti-web-${city.slug}.html`);

    // Breadcrumb
    page = page.replace(/Realizzazione Siti Web a Rho<\/span>/g, `Realizzazione Siti Web a ${city.name}</span>`);
    page = page.replace(/"name": "Realizzazione Siti Web a Rho"/g, `"name": "Realizzazione Siti Web a ${city.name}"`);

    // Hero
    page = page.replace(/<span class="section-tag">[\s\S]*?<\/span>/, `<span class="section-tag">${realizzazioneSeo.heroTag}</span>`);
    page = page.replace(/<h1>[\s\S]*?<\/h1>/, `<h1>${realizzazioneSeo.heroH1}</h1>`);
    page = page.replace(/<p class="answer-capsule">[\s\S]*?<\/p>/, `<p class="answer-capsule">${realizzazioneSeo.heroCapsule}</p>`);
    page = page.replace(
        /<time\b[^>]*datetime=["']\d{4}-\d{2}-\d{2}["'][^>]*>[\s\S]*?<\/time>/i,
        `<time datetime="${TODAY}">${TODAY_FORMATTED}</time>`
    );
    page = page.replace(/Rho, Milano \(MI\) 20017/, `${city.name}, ${getProvinceDisplay(city)} ${city.cap}`);

    // Schema LocalBusiness
    page = page.replace(/"WebNovis — Web Agency Rho"/g, `"WebNovis — Web Agency ${city.name}"`);
    page = page.replace(/"Web Novis Rho"/g, `"Web Novis ${city.name}"`);
    page = page.replace(/Web agency a Rho specializzata/g, `Web agency a ${city.name} specializzata`);
    page = page.replace(/"postalCode": "20017"/g, `"postalCode": "${city.cap}"`);
    page = page.replace(/"latitude": "45\.5299"/g, `"latitude": "${city.lat}"`);
    page = page.replace(/"longitude": "9\.0393"/g, `"longitude": "${city.lng}"`);
    page = page.replace(/Via\+S\.\+Giorgio\+2%2C\+20017\+Rho\+MI/g,
        `Via+S.+Giorgio+2%2C+${city.cap}+${city.name.replace(/ /g, '+')}+${city.province || 'MI'}`);
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
    page = page.replace(/studio del mercato di Rho/g, `studio del mercato di ${city.name}`);
    page = page.replace(/mercato di Rho/g, `mercato di ${city.name}`);
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

    if (ctx.tessutoEconomico || aiBlock?.localMarketAnalysis) {
        page = page.replace(
            /Rho non è un comune qualsiasi dell'hinterland milanese[\s\S]*?ROI più misurabile che puoi fare\.\s*<\/p>/,
            `${marketIntro}</p>
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
        /<section class="service-detail">\s*<div class="container">\s*<h2>Domande Frequenti — Realizzazione Siti Web a [^<]+<\/h2>[\s\S]*?<\/div>\s*<\/section>/i,
        renderFaqSection(`Domande Frequenti — Realizzazione Siti Web a ${city.name}`, resolvedFaqs)
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
            try {
                const tier1 = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
                tier1Html = buildTier1SectionHtml(tier1);
            } catch (e) { /* fall back to standard content */ }
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

// ─── Servizio×Città Page Generator (Nunjucks-based, third page type) ──────────

function generateServizioCittaPage(service, city) {
    const rhoPage = getBasePage('agenzia-web-source.html');
    if (!rhoPage) return null;

    const slug = `${service.slug}-${city.slug}`;
    const canonical = `${SITE}/${slug}.html`;
    const seo = getServiceLocalSeoCopy(service, city);
    // Nearest cities that also have this service×city page
    const nearest = getNearestCities(city, cities, 5);
    const relatedCityPages = nearest
        .filter(nc => !nc.isSede && serviceCoverageCitySlugs.has(nc.slug))
        .slice(0, 3)
        .map(nc => ({
            url: `${service.slug}-${nc.slug}.html`,
            label: `${service.shortName} a ${nc.name}`,
            distance: nc.distanzaSede
        }));

    // Other services in the same city (only link to services that have geo pages)
    const geoServices = services.filter(s => shouldGenerateGeoForService(s) && s.slug !== service.slug);
    const relatedServicePages = geoServices
        .slice(0, 3)
        .map(svc => ({
            url: `${svc.slug}-${city.slug}.html`,
            label: `${svc.shortName} a ${city.name}`
        }));

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
        { q: `Usate WordPress per ${service.name.toLowerCase()}?`, a: `No. Ogni progetto WebNovis è sviluppato con codice 100% custom (HTML5, CSS3, JavaScript). Questo garantisce performance superiori, sicurezza nativa e SEO ottimizzato senza dipendere da plugin o template preconfezionati.` },
        { q: `Come garantite la velocità del sito a ${city.name}?`, a: `Ogni sito è sviluppato con codice leggero e ottimizzato per i Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1. Testiamo su connessioni 3G e 4G per garantire caricamenti rapidi anche da mobile nella zona di ${city.name}.` },
        { q: `Il sito sarà ottimizzato per le ricerche locali a ${city.name}?`, a: `Sì. Integriamo SEO tecnica, dati strutturati Schema.org (LocalBusiness, Service), meta tag geo-specifici e contenuti ottimizzati per intercettare ricerche come "${service.shortName.toLowerCase()} ${city.name}" e varianti correlate.` },
        { q: `Posso gestire il sito in autonomia dopo il lancio?`, a: `Sì. Forniamo formazione e, dove serve, un pannello di gestione contenuti semplice. Per chi preferisce affidarsi a noi, offriamo piani di manutenzione continuativa da €59/mese.` },
        { q: `Cosa include il supporto post-lancio?`, a: `30 giorni di supporto gratuito inclusi. Successivamente, piani di manutenzione da €59/mese con aggiornamenti, backup automatici, monitoraggio uptime e interventi prioritari.` }
    ];
    const marketingFaqPool = [
        { q: `Come misurate i risultati di ${service.name.toLowerCase()} a ${city.name}?`, a: `Definiamo KPI specifici prima di partire (lead, conversioni, traffico qualificato) e forniamo report periodici con dati reali. Ogni decisione operativa è guidata dai numeri, non da intuizioni.` },
        { q: `Quanto tempo serve per vedere risultati con ${service.shortName.toLowerCase()}?`, a: `I primi segnali misurabili arrivano in 4-8 settimane per attività paid (Google Ads, social ads). Per attività organiche (SEO, content), i risultati consolidati richiedono 3-6 mesi di lavoro costante.` },
        { q: `Lavorate solo con aziende grandi o anche con piccole attività di ${city.name}?`, a: `Lavoriamo con PMI, professionisti e attività locali di ${city.name}. Il nostro approccio è scalabile: partiamo da budget contenuti e cresciamo con i risultati. Investimento da €${service.priceFrom}${service.priceUnit || ''}.` },
        { q: `Posso interrompere il servizio se non funziona?`, a: `Sì. Non vincoliamo con contratti annuali obbligatori. Lavoriamo mese per mese con report trasparenti, così puoi valutare i risultati e decidere in autonomia.` },
        { q: `Come vi differenziate dalle altre agenzie per ${service.shortName.toLowerCase()}?`, a: `Tre differenze concrete: codice e strategie 100% custom (zero template), reportistica trasparente con KPI reali, e gestione diretta da Rho (${city.distanzaSede} da ${city.name}) senza intermediari.` }
    ];
    const strategyFaqPool = [
        { q: `Come funziona il servizio di ${service.name.toLowerCase()} con WebNovis?`, a: `Partiamo da un brief iniziale per capire obiettivi, contesto competitivo e priorità. Poi definiamo un piano operativo con tempi (${service.timeEstimate}), investimento (da €${service.priceFrom}${service.priceUnit || ''}) e un unico referente dedicato.` },
        { q: `La consulenza può essere fatta in videochiamata o serve un incontro di persona?`, a: `Entrambe le opzioni. Per le aziende di ${city.name} possiamo incontrarci in sede vostra o nella nostra sede a Rho (${city.distanzaSede}). Per chi preferisce, lavoriamo efficacemente anche in videochiamata.` },
        { q: `Cosa ricevo concretamente alla fine del percorso?`, a: `Deliverable chiari e azionabili: documento con priorità, raccomandazioni operative, metriche di riferimento e prossimi passi. Non teoria astratta, ma indicazioni eseguibili dal tuo team o con il nostro supporto.` },
        { q: `Posso poi affidarvi anche la realizzazione di quanto emerso dalla consulenza?`, a: `Sì. Se dalla consulenza emergono interventi che vuoi affidare a WebNovis (sito, SEO, automazioni), possiamo gestirli con continuità senza perdere il contesto già acquisito.` },
        { q: `Vale la pena investire in ${service.shortName.toLowerCase()} per una piccola attività di ${city.name}?`, a: `Spesso è proprio la piccola attività locale a trarre il vantaggio maggiore: meno burocrazia interna, decisioni rapide, e un impatto visibile già dalle prime settimane. Investimento da €${service.priceFrom}${service.priceUnit || ''}.` }
    ];

    // Select the right FAQ pool based on service cluster
    let faqPool;
    if (webBuildSlugs.has(service.slug)) faqPool = webDevFaqPool;
    else if (marketingSlugs.has(service.slug)) faqPool = marketingFaqPool;
    else faqPool = strategyFaqPool;

    // Build final FAQ list: 2 universal + 5 cluster-specific
    const faqs = [
        { q: `Quanto costa ${service.name.toLowerCase()} a ${city.name}?`, a: `${service.name} a ${city.name}: da <strong>€${service.priceFrom}${service.priceUnit || ''}</strong>. Tempi: ${service.timeEstimate}. Preventivo gratuito personalizzato entro 24 ore.` },
        { q: `WebNovis è vicina a ${city.name}?`, a: `La nostra sede è a Rho, Via S. Giorgio 2 — ${city.distanzaSede} in auto da ${city.name}. Incontriamo i clienti in azienda o in videochiamata.` },
        ...faqPool
    ];

    // Related services: show 6 instead of 3 for better internal linking
    const relatedServicePagesExpanded = geoServices
        .slice(0, 6)
        .map(svc => ({
            url: `${svc.slug}-${city.slug}.html`,
            label: `${svc.shortName} a ${city.name}`
        }));

    // Tier classification — drives structural differentiation in the template.
    // tier === 1: Tier 1 indexable pages (unique content emphasized, full feature set)
    // tier === 2: Tier 2 indexable pages (standard template, full internal linking)
    // tier === 0: de-amplified pages (noindex,follow) — slim structure to reduce doorway footprint
    const pagePath = `/${slug}.html`;
    const tier = resolvePageTier(pagePath);
    const isIndexable = tier > 0;

    // Load per-city Tier 1 content overrides when present (hand-crafted editorial).
    // See data/content-blocks/tier1-<city>-<service>.json for structure.
    let tier1Content = null;
    if (tier === 1) {
        const tier1Path = path.join(ROOT, 'data', 'content-blocks', `tier1-${city.slug}-${service.slug}.json`);
        if (fs.existsSync(tier1Path)) {
            try {
                tier1Content = JSON.parse(fs.readFileSync(tier1Path, 'utf8'));
            } catch (e) { /* malformed tier1 override, fall back to standard content */ }
        }
    }

    const templateData = {
        city: city,
        service: service,
        seo: seo,
        nearCitiesData: (city.nearCities || []).slice(0, 5).map(ncSlug => {
            const nc = cityMap.get(ncSlug);
            return nc ? { name: nc.name } : { name: ncSlug };
        }),
        relatedCityPages: relatedCityPages,
        relatedServicePages: relatedServicePagesExpanded,
        allCoreServices: tableServices,
        faqs: faqs,
        aiContent: aiContent,
        competitiveInsight: competitiveInsight,
        dataPoints: dataPoints,
        tier: tier,
        isIndexable: isIndexable,
        tier1Content: tier1Content,
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
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
            "dateModified": TODAY
        },
        {
            "@context": "https://schema.org", "@type": "Service",
            "@id": canonical + "#service",
            "serviceType": service.name,
            "name": `${service.shortName} a ${city.name}`,
            "description": seo.schemaDescription,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": { "@type": "City", "name": city.name, "sameAs": city.wikipedia },
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

// ─── Hub Pages Generator (Internal Linking Bridge) ────────────────────────────

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
            "description": `Pagine locali indicizzabili WebNovis per ${agenziaCities.length} comuni, nella rete di ${networkCities.length} territori serviti dall'agenzia con sede a Rho.`,
            "url": SITE + "/agenzia-web/",
            "inLanguage": "it",
            "dateModified": TODAY,
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
        `${agenziaCities.length} pagine locali indicizzabili nella rete di ${networkCities.length} territori serviti da WebNovis. Siti custom, grafica e social. Sede a Rho.`,
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
            "name": "Realizzazione Siti Web a Milano e in Lombardia",
            "description": `Realizzazione siti web a Milano e in Lombardia: ${realizzazioneCities.length} landing locali indicizzabili nella rete WebNovis di ${networkCities.length} territori serviti.`,
            "url": SITE + "/realizzazione-siti-web/",
            "inLanguage": "it",
            "dateModified": TODAY,
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
        `Realizzazione siti web a Milano e in Lombardia: ${realizzazioneCities.length} landing locali indicizzabili nella rete WebNovis di ${networkCities.length} territori serviti. Codice custom e SEO integrata.`,
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
        today: TODAY,
        todayFormatted: TODAY_FORMATTED,
        site: SITE
    };
    const zoneContent = njkEnv.render('hub-zone-servite.njk', zoneData);

    // Total items across all categories
    const totalItems = agenziaCities.length + realizzazioneCities.length + Object.values(serviceCityCounts).reduce((sum, count) => sum + count, 0);
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
        `Pagine locali indicizzabili WebNovis per agenzia web, realizzazione siti, SEO locale e altri servizi nella rete di ${networkCities.length} territori serviti.`,
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
    const indexableGeoPaths = new Set(getIndexableGeoPaths());
    const approvedCitiesFor = (serviceSlug) => cities.filter((city) =>
        indexableGeoPaths.has(`/${serviceSlug}-${city.slug}.html`)
    );
    const agencyCities = approvedCitiesFor('agenzia-web');
    const websiteCities = approvedCitiesFor('realizzazione-siti-web');

    for (const city of cities) {
        const agencyPath = `/agenzia-web-${city.slug}.html`;
        if (indexableGeoPaths.has(agencyPath)) {
            graph.pages.push({
                url: agencyPath,
                type: 'agenzia',
                city: city.name,
                linksTo: getNearestCities(city, agencyCities, 5)
                    .map(nc => `/agenzia-web-${nc.slug}.html`)
            });
        }
        const websitePath = `/realizzazione-siti-web-${city.slug}.html`;
        if (indexableGeoPaths.has(websitePath)) {
            graph.pages.push({
                url: websitePath,
                type: 'realizzazione',
                city: city.name,
                linksTo: getNearestCities(city, websiteCities, 5)
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
    console.log(`  Date: ${TODAY}`);
    if (TARGET_CITY_SLUGS.size > 0) {
        console.log(`  City filter: ${Array.from(TARGET_CITY_SLUGS).join(', ')}`);
    }
    if (TARGET_SERVICE_SLUGS.size > 0) {
        console.log(`  Service filter: ${Array.from(TARGET_SERVICE_SLUGS).join(', ')}`);
    }
    console.log('');

    const results = { agenzia: [], realizzazione: [], servizio: [], hubs: [], validations: [] };
    let generated = 0;
    let skipped = 0;

    // Generate agenzia pages
    if (GEN_TYPE === 'all' || GEN_TYPE === 'agenzia') {
        console.log('─── Generating agenzia-web pages ───');
        for (const city of cities) {
            if (!city.generate.agenzia) { skipped++; continue; }
            if (!matchesTargetCity(city)) { skipped++; continue; }

            const filename = `agenzia-web-${city.slug}.html`;
            let html;
            if (city.slug === 'rho') {
                const rhoSource = fs.readFileSync(path.join(ROOT, 'agenzia-web-rho.html'), 'utf8');
                const fallbackFaqs = resolvePageFaqs(city, 'agenzia', contentBlocks.get(city.slug));
                const resolvedFaqs = resolveHandCraftedFaqs(rhoSource, fallbackFaqs);
                html = normalizeHandCraftedAgenziaPage(rhoSource, resolvedFaqs);
            } else {
                html = generateAgenziaPage(city);
            }
            if (!html) { console.error(`  ❌ Failed: agenzia-web-${city.slug}.html`); continue; }

            html = finalizePublishedHtml(filename, html);
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
            if (!matchesTargetCity(city)) { skipped++; continue; }

            let html = generateRealizzazionePage(city);
            if (!html) { console.error(`  ❌ Failed: realizzazione-siti-web-${city.slug}.html`); continue; }

            const filename = `realizzazione-siti-web-${city.slug}.html`;
            html = finalizePublishedHtml(filename, html);
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
        const geoEligibleServices = services.filter(s => shouldGenerateGeoForService(s) && matchesTargetService(s));
        const eligibleCities = cities.filter(c => c.generate?.agenzia && matchesTargetCity(c));
        console.log(`\n─── Generating servizio×città pages (${geoEligibleServices.length} services × ${eligibleCities.length} cities) ───`);

        for (const service of geoEligibleServices) {
            for (const city of eligibleCities) {
                let html = generateServizioCittaPage(service, city);
                if (!html) continue;

                const filename = `${service.slug}-${city.slug}.html`;
                html = finalizePublishedHtml(filename, html);
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
    if (GEN_TYPE === 'all' || GEN_TYPE === 'hubs') {
        console.log('\n─── Generating hub pages ───');
        const hubResults = generateHubPages();
        for (const hub of hubResults) {
            const relativePath = path.join(hub.dir, 'index.html');
            const html = finalizePublishedHtml(relativePath, hub.html);
            if (!DRY_RUN && !VALIDATE_ONLY) {
                writePublishedFile(relativePath, html);
            }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
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
