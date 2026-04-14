const servicesData = require('../data/services.json');
const citiesData = require('../data/cities.json');

const EXPLICIT_DEAMPLIFIED_PATHS = [
  '/google-ads-milano.html',
  '/sviluppo-app-mobile-milano.html',
  '/sviluppo-app-mobile-milano-ovest.html',
  '/sviluppo-app-mobile-milano-nord.html',
  '/email-marketing-milano.html',
  '/email-marketing-milano-nord.html',
  '/google-ads-milano-nord.html',
  '/social-media-bresso.html'
];

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

const STRATEGIC_INDEXABLE_GEO_PATHS = new Set([
  ...STRATEGIC_SEO_CITY_SLUGS.map((citySlug) => `/seo-locale-${citySlug}.html`),
  '/ecommerce-milano.html'
]);

const EXTENDED_GEO_SERVICE_SLUGS = (servicesData.services || [])
  .filter((service) => service && service.hasPage === false && service.slug)
  .map((service) => service.slug);

const CITY_SLUGS = (citiesData.cities || [])
  .map((city) => city && city.slug)
  .filter(Boolean);

const AUTO_DEAMPLIFIED_GEO_PATHS = EXTENDED_GEO_SERVICE_SLUGS.flatMap((serviceSlug) =>
  CITY_SLUGS.map((citySlug) => `/${serviceSlug}-${citySlug}.html`)
).filter((pathname) => !STRATEGIC_INDEXABLE_GEO_PATHS.has(pathname));

const PHASE1_DEAMPLIFIED_PATHS = [...new Set([...EXPLICIT_DEAMPLIFIED_PATHS, ...AUTO_DEAMPLIFIED_GEO_PATHS])];
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
  return DEAMPLIFIED_SET.has(normalizePathname(pathname));
}

function getIndexationDirectivesForPath(pathname) {
  return isDeAmplifiedPath(pathname) ? 'noindex, follow' : 'index, follow';
}

function shouldIncludeInSitemapPath(pathname) {
  return !isDeAmplifiedPath(pathname);
}

module.exports = {
  EXPLICIT_DEAMPLIFIED_PATHS,
  STRATEGIC_INDEXABLE_GEO_PATHS,
  AUTO_DEAMPLIFIED_GEO_PATHS,
  PHASE1_DEAMPLIFIED_PATHS,
  normalizePathname,
  isDeAmplifiedPath,
  getIndexationDirectivesForPath,
  shouldIncludeInSitemapPath
};
