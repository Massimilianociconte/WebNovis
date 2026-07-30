/**
 * Shared configuration, CLI flags, and site constants for the geo generator.
 */
const path = require('path');
const { resolveBuildInstant, resolveRomeCalendarDate } = require('../../config/build-date');
const {
    getIndexationDirectivesForPath,
    getIndexableGeoPaths,
    isIndexableGeoPath,
    isGeoPath,
    isTier1Path,
    isTier2Path,
    isDeAmplifiedPath
} = require('../../config/pseo-governance');

// scripts/geo → repo root
const ROOT = path.join(__dirname, '..', '..');
const BASE_PAGE_DIR = path.join(ROOT, 'templates', 'base-pages');
const SITE = 'https://www.webnovis.com';
const SINGLETON_LOCAL_BUSINESS_ID = SITE + '/#localbusiness';
const SEDE_LAT = '45.5299';
const SEDE_LNG = '9.0393';
const FIRST_DEPLOY_DATE = '2026-02-27';
const CITY_AVATAR_PUBLIC_DIR = '/Img/cities';

const { iso: TODAY, formatted: TODAY_FORMATTED } = resolveRomeCalendarDate(resolveBuildInstant());

const PAGE_DATE_ISO_TOKEN = '@@GEO_DATE_ISO@@';
const PAGE_DATE_HUMAN_TOKEN = '@@GEO_DATE_HUMAN@@';
const PAGE_DATES_FILE = path.join(ROOT, 'data', 'geo-page-dates.json');

// CLI args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VALIDATE_ONLY = args.includes('--validate-only');
const typeArg = args.find(a => a.startsWith('--type='));
const GEN_TYPE = typeArg ? typeArg.split('=')[1] : 'all';
const outDirArg = args.find(a => a.startsWith('--out-dir='));
const reportDirArg = args.find(a => a.startsWith('--report-dir='));
const cityArg = args.find(a => a.startsWith('--city='));
const serviceArg = args.find(a => a.startsWith('--service='));
const PUBLISH_DIR = path.resolve(ROOT, outDirArg ? outDirArg.split('=')[1] : (process.env.PUBLISH_DIR || '.'));
const REPORT_DIR = path.resolve(
    ROOT,
    reportDirArg
        ? reportDirArg.split('=')[1]
        : (process.env.REPORT_DIR || (PUBLISH_DIR === ROOT ? 'data' : 'build/public-artifact'))
);
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

function resolvePageTier(pathname) {
    if (isTier1Path(pathname)) return 1;
    if (isTier2Path(pathname)) return 2;
    return 0;
}

function matchesTargetCity(city) {
    return TARGET_CITY_SLUGS.size === 0 || TARGET_CITY_SLUGS.has(city.slug);
}

function matchesTargetService(service) {
    return TARGET_SERVICE_SLUGS.size === 0 || TARGET_SERVICE_SLUGS.has(service.slug);
}

function buildRobotsContent(pathname) {
    return `${getIndexationDirectivesForPath(pathname)}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`;
}

module.exports = {
    ROOT,
    BASE_PAGE_DIR,
    SITE,
    SINGLETON_LOCAL_BUSINESS_ID,
    SEDE_LAT,
    SEDE_LNG,
    FIRST_DEPLOY_DATE,
    CITY_AVATAR_PUBLIC_DIR,
    TODAY,
    TODAY_FORMATTED,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    PAGE_DATES_FILE,
    DRY_RUN,
    VALIDATE_ONLY,
    GEN_TYPE,
    PUBLISH_DIR,
    REPORT_DIR,
    TARGET_CITY_SLUGS,
    TARGET_SERVICE_SLUGS,
    resolvePageTier,
    matchesTargetCity,
    matchesTargetService,
    buildRobotsContent,
    // re-export governance helpers used widely
    getIndexationDirectivesForPath,
    getIndexableGeoPaths,
    isIndexableGeoPath,
    isGeoPath,
    isTier1Path,
    isTier2Path,
    isDeAmplifiedPath
};
