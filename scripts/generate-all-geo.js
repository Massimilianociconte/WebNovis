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
 * Implementation lives under scripts/geo/*; this file remains the public entrypoint.
 *
 * Usage: node scripts/generate-all-geo.js [--dry-run] [--validate-only] [--type=agenzia|realizzazione|all] [--out-dir=dist]
 */

'use strict';

const { main } = require('./geo/main');

// Re-export key symbols so any tooling that requires this entrypoint still works.
module.exports = {
    main,
    ...require('./geo/config'),
    ...require('./geo/dates'),
    ...require('./geo/faq'),
    ...require('./geo/schema'),
    ...require('./geo/validate'),
    ...require('./geo/link-graph'),
    ...require('./geo/editorial'),
    generateAgenziaPage: require('./geo/render-agenzia').generateAgenziaPage,
    generateRealizzazionePage: require('./geo/render-realizzazione').generateRealizzazionePage,
    generateServizioCittaPage: require('./geo/render-servizio').generateServizioCittaPage,
    generateHubPages: require('./geo/render-hubs').generateHubPages,
    normalizeHandCraftedAgenziaPage: require('./geo/head-meta').normalizeHandCraftedAgenziaPage,
    preserveCustomBlocks: require('./geo/paths').preserveCustomBlocks,
    finalizePublishedHtml: require('./geo/paths').finalizePublishedHtml,
    writePublishedFile: require('./geo/paths').writePublishedFile,
    getServiceLocalSeoCopy: require('./geo/copy').getServiceLocalSeoCopy,
    getAgenziaSeoCopy: require('./geo/copy').getAgenziaSeoCopy,
    getRealizzazioneSeoCopy: require('./geo/copy').getRealizzazioneSeoCopy
};

if (require.main === module) {
    main();
}
