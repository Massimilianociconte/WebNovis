/**
 * Loaded cities/services data, content blocks, blog index, nunjucks env.
 */
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const { loadApprovedContentBlocks } = require('../../config/content-claim-governance');
const { isIndexableGeoPath } = require('../../config/pseo-governance');
const {
    ROOT,
    PUBLISH_DIR,
    CITY_AVATAR_PUBLIC_DIR
} = require('./config');
const { resolvePublishPath } = require('./paths-core');
const { toCity, toCityCap } = require('./html-utils');

const citiesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const servicesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
const cities = citiesData.cities;
const services = servicesData.services;
const coreServices = services.filter(s => s.tier === 'core');
const offerCatalogServices = services.filter((service) => service.hasPage === true);
const serviceBySlug = new Map(services.map((service) => [service.slug, service]));

function buildCatalogOffer(slug) {
    const service = serviceBySlug.get(slug);
    if (!service) throw new Error(`Missing canonical service price source for ${slug}`);
    return {
        "@type": "Offer",
        "name": service.name,
        "price": String(service.priceFrom),
        "priceCurrency": service.priceCurrency
    };
}

function formatServicePrice(service) {
    if (!service || !Number.isFinite(Number(service.priceFrom))) {
        throw new Error(`Missing canonical service price source for ${service?.slug || 'unknown service'}`);
    }
    return `€${Number(service.priceFrom).toLocaleString('it-IT')}${service.priceUnit || ''}`;
}

function formatCatalogPrice(slug) {
    const service = serviceBySlug.get(slug);
    if (!service) throw new Error(`Missing canonical service price source for ${slug}`);
    return formatServicePrice(service);
}

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

const tableServices = services
    .filter(s => s.tier === 'core' || shouldGenerateGeoForService(s))
    .map((service) => ({ ...service, priceDisplay: formatServicePrice(service) }));
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
const contentBlocks = loadApprovedContentBlocks(CONTENT_BLOCKS_DIR, { includeTier1: false });
if (contentBlocks.size > 0) {
    console.log(`  Approved content blocks loaded: ${contentBlocks.size} cities`);
} else if (fs.existsSync(CONTENT_BLOCKS_DIR)) {
    console.log('  Approved content blocks loaded: 0 (draft/unverified blocks suppressed)');
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
njkEnv.addFilter('toCity', (name) => toCity(name));
njkEnv.addFilter('toCityCap', (name) => toCityCap(name));

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

function formatPrice(service) {
    return `€${service.priceFrom}${service.priceUnit || ''}`;
}

// Servizi senza pagina propria E senza sezione nell'hub zone-servite:
// fallback alla pagina servizio esistente piu vicina (stesso mapping
// dei 301 wildcard in _redirects). Evita anchor /zone-servite/#slug
// che non esistono e farebbero atterrare l'utente in cima alla pagina.
const SERVICE_PRIMARY_FALLBACK_URLS = {
    'manutenzione-sito': '/servizi/sviluppo-web.html',
    'copywriting': '/servizi/consulenze.html',
    'sviluppo-app-mobile': '/servizi/sviluppo-web.html',
    'fotografia-aziendale': '/servizi/graphic-design.html',
    'automazione-business': '/servizi/consulenze.html',
    'web-app': '/servizi/sviluppo-web.html',
    'restyling-sito-web': '/servizi/sviluppo-web.html',
    'consulenza-digitale': '/servizi/consulenze.html'
};

function serviceHasHubSection(service) {
    if (!shouldGenerateGeoForService(service)) return false;
    return cities.some((city) => isIndexableGeoPath(`/${service.slug}-${city.slug}.html`));
}

const HUB_SECTION_SERVICE_SLUGS = new Set(
    services.filter(serviceHasHubSection).map((service) => service.slug)
);

function getServicePrimaryUrl(service) {
    if (service.hasPage) return service.url;
    if (HUB_SECTION_SERVICE_SLUGS.has(service.slug)) return `/zone-servite/#${service.slug}`;
    return SERVICE_PRIMARY_FALLBACK_URLS[service.slug] || '/servizi/consulenze.html';
}

function getServicePrimaryLabel(service) {
    if (service.hasPage) return `la pagina servizio ${service.shortName}`;
    if (HUB_SECTION_SERVICE_SLUGS.has(service.slug)) {
        return `il riepilogo ${service.shortName} nelle zone servite`;
    }
    const fallbackUrl = SERVICE_PRIMARY_FALLBACK_URLS[service.slug];
    const target = services.find((candidate) => candidate.url === fallbackUrl);
    if (target) return `la pagina servizio ${target.shortName}`;
    const fallbackLabels = { '/servizi/sviluppo-web.html': 'Sviluppo Web' };
    return fallbackLabels[fallbackUrl] ? `la pagina servizio ${fallbackLabels[fallbackUrl]}` : 'la pagina servizi';
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

module.exports = {
    citiesData,
    servicesData,
    cities,
    services,
    coreServices,
    offerCatalogServices,
    serviceBySlug,
    buildCatalogOffer,
    formatServicePrice,
    formatCatalogPrice,
    shouldGenerateGeoForService,
    tableServices,
    sede,
    serviceCoverageCitySlugs,
    cityMap,
    PROVINCE_DISPLAY_NAMES,
    GEO_SEARCH_MODIFIERS,
    getProvinceDisplay,
    getGeoSearchModifier,
    CONTENT_BLOCKS_DIR,
    contentBlocks,
    blogIndex,
    njkEnv,
    getRelevantBlogLinks,
    formatPrice,
    getServicePrimaryUrl,
    getServicePrimaryLabel,
    serviceHasHubSection,
    HUB_SECTION_SERVICE_SLUGS,
    getCityAvatarPublicPath,
    withCityUiMeta
};
