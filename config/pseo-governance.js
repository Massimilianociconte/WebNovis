/**
 * pSEO governance — allowlist-based indexation control.
 *
 * Strategy (post-audit 2026-04):
 *   - ~920 GEO pages are generated but only TIER 1 + TIER 2 + data-validated
 *     paths are indexable.
 *     Everything else is `noindex, follow` and excluded from sitemap.
 *   - Rationale: reduce doorway footprint and concentrate authority on ~60
 *     geographically/commercially strategic pages plus a small set of pages
 *     that earned Search Console/Bing signals after the first de-amplification.
 *   - Non-GEO pages (/, /servizi/*, /portfolio/*, /blog/*, /chi-siamo.html, ...)
 *     are NEVER de-amplified by this module.
 *   - `REMOVED_PATHS` are paths we intend to physically remove (404/301).
 *     They are excluded from sitemap and always return `noindex, follow`
 *     as a defensive fallback while residual files linger.
 */

const servicesData = require('../data/services.json');
const citiesData = require('../data/cities.json');

// ─────────────────────────────────────────────────────────────────────────────
// Legacy explicit list kept so historical regression tests keep passing.
// Anything here is explicitly de-amplified regardless of tier membership.
// ─────────────────────────────────────────────────────────────────────────────
const EXPLICIT_DEAMPLIFIED_PATHS = [
  '/google-ads-milano.html',
  '/sviluppo-app-mobile-milano.html',
  '/sviluppo-app-mobile-milano-ovest.html',
  '/sviluppo-app-mobile-milano-nord.html',
  '/email-marketing-milano-nord.html',
  '/google-ads-milano-nord.html',
  '/social-media-bresso.html',
  // Legacy typo / soft-redirect URL: must never rank next to /agenzia-web-rho.html
  '/agenzie-web-rho.html'
];

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — 24 pagine GEO con contenuto unique-by-hand.
// Questi URL ricevono il contenuto locale arricchito dai content-blocks.
// Obiettivo SEO: rank top-3 su "[servizio] [città]" entro 6 mesi.
// ─────────────────────────────────────────────────────────────────────────────
const TIER1_INDEXABLE_GEO_PATHS = new Set([
  '/agenzia-web-rho.html',
  '/realizzazione-siti-web-rho.html',
  '/seo-locale-rho.html',
  '/agenzia-web-arese.html',
  '/seo-locale-arese.html',
  '/sito-vetrina-arese.html',
  '/agenzia-web-lainate.html',
  '/seo-locale-lainate.html',
  '/agenzia-web-bollate.html',
  '/realizzazione-siti-web-bollate.html',
  '/agenzia-web-garbagnate.html',
  '/seo-locale-garbagnate.html',
  '/agenzia-web-parabiago.html',
  '/seo-locale-parabiago.html',
  '/agenzia-web-legnano.html',
  '/realizzazione-siti-web-legnano.html',
  '/agenzia-web-milano-ovest.html',
  '/realizzazione-siti-web-milano-ovest.html',
  '/agenzia-web-milano-nord.html',
  '/agenzia-web-saronno.html',
  '/agenzia-web-monza.html',
  '/agenzia-web-cinisello-balsamo.html',
  '/seo-locale-cinisello-balsamo.html',
  '/agenzia-web-sesto-san-giovanni.html'
]);

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — pagine indicizzabili come supporto commerciale.
// Nessun boost contenutistico, template standard, usate per long-tail e
// cross-linking; alcune sono richieste dai regression test pre-audit.
// ─────────────────────────────────────────────────────────────────────────────
const TIER2_INDEXABLE_GEO_PATHS = new Set([
  // Ecommerce cluster (Milano già era "strategic", estendo al raggio diretto)
  '/ecommerce-milano.html',
  '/ecommerce-rho.html',
  '/ecommerce-arese.html',
  '/ecommerce-monza.html',
  '/ecommerce-legnano.html',
  '/ecommerce-bollate.html',
  '/ecommerce-lainate.html',
  // Landing page cluster
  '/landing-page-rho.html',
  '/landing-page-arese.html',
  '/landing-page-milano-ovest.html',
  '/landing-page-bollate.html', // richiesto da regression test storico (core geo)
  // Sito vetrina cluster
  '/sito-vetrina-rho.html',
  '/sito-vetrina-lainate.html',
  '/sito-vetrina-bollate.html',
  '/sito-vetrina-legnano.html',
  // Realizzazione cluster: Arese (integra i 3 Tier 1 di Arese con long-tail transazionale)
  '/realizzazione-siti-web-arese.html',
  // SEO locale cluster (Milano + strategic remaining)
  '/seo-locale-milano.html',
  '/seo-locale-sesto-san-giovanni.html',
  // Agenzia-web cluster: Milano downgraded da primary a supporter + comuni confinanti sede
  '/agenzia-web-milano.html',
  '/agenzia-web-pero.html',
  '/agenzia-web-cornaredo.html',
  '/agenzia-web-novate-milanese.html'
]);

// ─────────────────────────────────────────────────────────────────────────────
// TIER 3 — pagine riaperte perché validate dai dati reali.
// Criterio: impression/posizione/citazioni AI già osservate nei report GSC/Bing
// di aprile 2026, più contenuto locale sufficiente da sostenere l'indicizzazione.
// Questo set va ampliato solo con evidenza, non come ritorno alla pSEO massiva.
// ─────────────────────────────────────────────────────────────────────────────
const DATA_VALIDATED_INDEXABLE_GEO_PATHS = new Set([
  '/seo-locale-cormano.html',
  '/seo-locale-rozzano.html',
  '/seo-locale-bresso.html',
  '/seo-locale-senago.html',
  '/realizzazione-siti-web-garbagnate.html',
  '/realizzazione-siti-web-limbiate.html',
  '/realizzazione-siti-web-cormano.html',
  '/realizzazione-siti-web-parabiago.html',
  '/realizzazione-siti-web-senago.html',
  '/realizzazione-siti-web-castellanza.html',
  '/realizzazione-siti-web-solaro.html',
  '/realizzazione-siti-web-buccinasco.html',
  '/realizzazione-siti-web-arluno.html',
  '/realizzazione-siti-web-origgio.html',
  '/realizzazione-siti-web-caronno-pertusella.html',
  '/realizzazione-siti-web-magenta.html',
  '/google-ads-monza.html',
  '/landing-page-milano.html',
  '/ecommerce-senago.html',
  '/ecommerce-bresso.html',
  '/ecommerce-garbagnate.html',
  '/ecommerce-cinisello-balsamo.html',
  '/ecommerce-limbiate.html',
  '/ecommerce-cormano.html',
  '/email-marketing-milano.html',
  '/email-marketing-monza.html',
  '/graphic-design-milano.html',
  '/social-media-milano.html',
  '/social-media-parabiago.html',
  '/social-media-sesto-san-giovanni.html',
  '/social-media-legnano.html',
  '/agenzia-web-baranzate.html',
  '/agenzia-web-castellanza.html',
  '/agenzia-web-settimo-milanese.html'
]);

// Unione delle allowlist: path GEO ammessi all'indicizzazione.
const ALL_INDEXABLE_GEO_PATHS = new Set([
  ...TIER1_INDEXABLE_GEO_PATHS,
  ...TIER2_INDEXABLE_GEO_PATHS,
  ...DATA_VALIDATED_INDEXABLE_GEO_PATHS
]);

// Retro-compat: alcuni script leggono `STRATEGIC_INDEXABLE_GEO_PATHS`.
const STRATEGIC_INDEXABLE_GEO_PATHS = ALL_INDEXABLE_GEO_PATHS;

// Set di city slug per cui storicamente esiste un'enfasi SEO particolare.
// Conservato per compatibilità con tool esistenti (report, monitor).
const STRATEGIC_SEO_CITY_SLUGS = [
  'rho',
  'sesto-san-giovanni',
  'cinisello-balsamo',
  'parabiago',
  'arese',
  'lainate',
  'garbagnate',
  'milano'
];

// ─────────────────────────────────────────────────────────────────────────────
// REMOVED_PATHS — path destinati alla rimozione fisica (301/404).
// Il cluster `consulenza-digitale-*` duplica `consulenze-*` (diff ~6 righe su
// ~1000 parole): viene deprecato del tutto. Fino alla rimozione fisica dei
// file restano deamplificati e fuori sitemap.
// ─────────────────────────────────────────────────────────────────────────────
const REMOVED_PATHS = new Set(
  (citiesData.cities || [])
    .map((city) => city && city.slug)
    .filter(Boolean)
    .map((slug) => `/consulenza-digitale-${slug}.html`)
);

// ─────────────────────────────────────────────────────────────────────────────
// Rilevamento "è un path GEO generato?" — euristica su slug di servizio.
// `agenzia-web` e `realizzazione-siti-web` non sono veri service slug in
// data/services.json, ma sono cluster pSEO a tutti gli effetti (vedi
// scripts/generate-all-geo.js: generateAgenziaPage / generateRealizzazionePage).
// ─────────────────────────────────────────────────────────────────────────────
const SERVICE_SLUGS = (servicesData.services || [])
  .map((service) => service && service.slug)
  .filter(Boolean);

const GEO_CLUSTER_SLUGS = [
  ...SERVICE_SLUGS,
  'agenzia-web',
  'realizzazione-siti-web'
];

// Pattern esplicito per evitare falsi positivi su path come `/servizi/sviluppo-web.html`.
const GEO_PATH_PATTERNS = GEO_CLUSTER_SLUGS.map(
  (slug) => new RegExp(`^/${slug}-[a-z0-9-]+\\.html$`)
);

function isGeoPath(pathname) {
  return GEO_PATH_PATTERNS.some((re) => re.test(pathname));
}

// ─────────────────────────────────────────────────────────────────────────────
// Calcolo set de-amplificato: ogni path GEO non in allowlist + expliciti +
// path rimossi.
// ─────────────────────────────────────────────────────────────────────────────
const CITY_SLUGS = (citiesData.cities || [])
  .map((city) => city && city.slug)
  .filter(Boolean);

const AUTO_DEAMPLIFIED_GEO_PATHS = GEO_CLUSTER_SLUGS.flatMap((serviceSlug) =>
  CITY_SLUGS.map((citySlug) => `/${serviceSlug}-${citySlug}.html`)
).filter((pathname) => !ALL_INDEXABLE_GEO_PATHS.has(pathname));

const PHASE1_DEAMPLIFIED_PATHS = [
  ...new Set([
    ...EXPLICIT_DEAMPLIFIED_PATHS,
    ...AUTO_DEAMPLIFIED_GEO_PATHS,
    ...REMOVED_PATHS
  ])
];
const DEAMPLIFIED_SET = new Set(PHASE1_DEAMPLIFIED_PATHS);

function normalizePathname(pathname = '/') {
  const raw = String(pathname || '/').split('#')[0].split('?')[0].trim();
  if (!raw) return '/';

  if (/^https?:\/\//i.test(raw)) {
    try {
      return normalizePathname(new URL(raw).pathname);
    } catch (_) {
      return '/';
    }
  }

  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')) {
    return withLeadingSlash.slice(0, -1);
  }

  return withLeadingSlash;
}

function isDeAmplifiedPath(pathname) {
  const normalized = normalizePathname(pathname);
  if (DEAMPLIFIED_SET.has(normalized)) return true;
  if (REMOVED_PATHS.has(normalized)) return true;
  // Fallback: ogni path GEO non in allowlist è de-amplificato.
  if (isGeoPath(normalized) && !ALL_INDEXABLE_GEO_PATHS.has(normalized)) return true;
  return false;
}

function isRemovedPath(pathname) {
  return REMOVED_PATHS.has(normalizePathname(pathname));
}

function isTier1Path(pathname) {
  return TIER1_INDEXABLE_GEO_PATHS.has(normalizePathname(pathname));
}

function isTier2Path(pathname) {
  return TIER2_INDEXABLE_GEO_PATHS.has(normalizePathname(pathname));
}

function getIndexableGeoPaths() {
  return [...ALL_INDEXABLE_GEO_PATHS].sort();
}

function isIndexableGeoPath(pathname) {
  return ALL_INDEXABLE_GEO_PATHS.has(normalizePathname(pathname));
}

function getIndexationDirectivesForPath(pathname) {
  return isDeAmplifiedPath(pathname) ? 'noindex, follow' : 'index, follow';
}

function shouldIncludeInSitemapPath(pathname) {
  const normalized = normalizePathname(pathname);
  if (REMOVED_PATHS.has(normalized)) return false;
  return !isDeAmplifiedPath(normalized);
}

module.exports = {
  EXPLICIT_DEAMPLIFIED_PATHS,
  STRATEGIC_INDEXABLE_GEO_PATHS,
  STRATEGIC_SEO_CITY_SLUGS,
  TIER1_INDEXABLE_GEO_PATHS,
  TIER2_INDEXABLE_GEO_PATHS,
  DATA_VALIDATED_INDEXABLE_GEO_PATHS,
  ALL_INDEXABLE_GEO_PATHS,
  AUTO_DEAMPLIFIED_GEO_PATHS,
  PHASE1_DEAMPLIFIED_PATHS,
  REMOVED_PATHS,
  normalizePathname,
  isDeAmplifiedPath,
  isRemovedPath,
  isTier1Path,
  isTier2Path,
  getIndexableGeoPaths,
  isIndexableGeoPath,
  isGeoPath,
  getIndexationDirectivesForPath,
  shouldIncludeInSitemapPath
};
