const PHASE1_DEAMPLIFIED_PATHS = [
  '/google-ads-milano.html',
  '/sviluppo-app-mobile-milano.html',
  '/sviluppo-app-mobile-milano-ovest.html',
  '/sviluppo-app-mobile-milano-nord.html',
  '/email-marketing-milano.html',
  '/email-marketing-milano-nord.html',
  '/ecommerce-milano.html',
  '/google-ads-milano-nord.html',
  '/social-media-bresso.html'
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
  return DEAMPLIFIED_SET.has(normalizePathname(pathname));
}

function getIndexationDirectivesForPath(pathname) {
  return isDeAmplifiedPath(pathname) ? 'noindex, follow' : 'index, follow';
}

function shouldIncludeInSitemapPath(pathname) {
  return !isDeAmplifiedPath(pathname);
}

module.exports = {
  PHASE1_DEAMPLIFIED_PATHS,
  normalizePathname,
  isDeAmplifiedPath,
  getIndexationDirectivesForPath,
  shouldIncludeInSitemapPath
};
