const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SITE_ORIGIN = 'https://www.webnovis.com';
const OUTPUT_JSON_PATH = path.join(ROOT, 'docs', 'seo-strategy', 'governance-report.json');
const OUTPUT_MD_PATH = path.join(ROOT, 'docs', 'seo-strategy', 'governance-report.md');
const DEFAULT_GSC_DIR = path.join(ROOT, 'data', 'gsc');
const HISTORICAL_PRIORITY_CSV = path.join(ROOT, 'docs', 'archive', 'raw', 'URL-classificati.csv');
const SEARCH_INDEX_PATH = path.join(ROOT, 'search-index.json');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const LINK_GRAPH_PATH = path.join(ROOT, 'data', 'link-graph.json');
const HIERARCHY_PATH = path.join(ROOT, 'docs', 'seo-strategy', 'seo_webnovis_hierarchy.json');
const servicesData = require(path.join(ROOT, 'data', 'services.json'));
const citiesData = require(path.join(ROOT, 'data', 'cities.json'));
const {
  normalizePathname,
  isDeAmplifiedPath,
  DATA_VALIDATED_INDEXABLE_GEO_PATHS,
  PHASE1_DEAMPLIFIED_PATHS
} = require(path.join(ROOT, 'config', 'pseo-governance.js'));
const {
  CLUSTERS,
  normalizeBlogIdentifier
} = require(path.join(ROOT, 'config', 'blog-cluster-links.js'));

const args = process.argv.slice(2);
const JSON_ONLY = args.includes('--json');
const NO_WRITE = args.includes('--no-write');
const GSC_ARG = args.find((arg) => arg.startsWith('--gsc='));

const STOPWORDS = new Set([
  'a', 'ad', 'al', 'alla', 'alle', 'allo', 'anche', 'che', 'chi', 'come', 'con',
  'cosa', 'da', 'dal', 'dei', 'del', 'della', 'delle', 'dello', 'di', 'e', 'ed',
  'gli', 'ha', 'i', 'il', 'in', 'la', 'le', 'lo', 'ma', 'nel', 'nella', 'nelle',
  'nello', 'o', 'per', 'piu', 'puo', 'se', 'serve', 'su', 'tra', 'un', 'una', 'uno',
  'vs', 'webnovis'
]);

const WEAK_TOPIC_TOKENS = new Set([
  'azienda', 'aziendale', 'aziende', 'blog', 'consulenza', 'costo', 'costi',
  'guida', 'milano', 'pagina', 'pagine', 'prezzi', 'quanto', 'realizzazione',
  'servizio', 'servizi', 'sito', 'siti', 'web'
]);

const EXPLICIT_CONSOLIDATION_TARGETS = {
  '/index.html': '/',
  '/blog/dati-obbligatori-sito-web.html': '/blog/dati-obbligatori-sito-web-aziendale.html'
};

const LEGAL_PATHS = new Set([
  '/cookie-policy.html',
  '/privacy-policy.html',
  '/termini-condizioni.html'
]);

const CORE_ALWAYS_KEEP = new Set([
  '/',
  '/preventivo.html',
  '/contatti.html',
  '/chi-siamo.html',
  '/come-lavoriamo.html',
  '/portfolio.html',
  '/blog/',
  '/servizi/',
  '/agenzia-web/',
  '/realizzazione-siti-web/',
  '/zone-servite/'
]);

const serviceList = Array.isArray(servicesData.services) ? servicesData.services : [];
const cityList = Array.isArray(citiesData.cities) ? citiesData.cities : [];
const serviceMap = new Map(serviceList.map((service) => [service.slug, service]));
const cityMap = new Map(cityList.map((city) => [city.slug, city]));
const serviceSlugsDesc = serviceList.map((service) => service.slug).sort((a, b) => b.length - a.length);

function parseArgsPaths() {
  if (!GSC_ARG) return [];
  return GSC_ARG
    .replace(/^--gsc=/, '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => path.resolve(ROOT, value));
}

function pathExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch (_) {
    return false;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toDiskPath(pathname) {
  if (!pathname || pathname === '/') return path.join(ROOT, 'index.html');
  if (pathname.endsWith('/')) {
    return path.join(ROOT, pathname.replace(/^\/+/, ''), 'index.html');
  }
  return path.join(ROOT, pathname.replace(/^\/+/, ''));
}

function normalizeUrlLike(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) {
    try {
      return normalizePathname(new URL(raw).pathname);
    } catch (_) {
      return normalizePathname(raw);
    }
  }
  return normalizePathname(raw);
}

function safeNumber(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).replace(/\u00a0/g, ' ').trim();
  if (!raw) return null;
  const normalized = raw
    .replace(/%/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function countUnquotedDelimiter(line, delimiter) {
  let inQuotes = false;
  let count = 0;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      count += 1;
    }
  }

  return count;
}

function detectCsvDelimiter(text) {
  const firstLine = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .find((line) => line.trim());

  if (!firstLine) return ',';

  const commas = countUnquotedDelimiter(firstLine, ',');
  const semicolons = countUnquotedDelimiter(firstLine, ';');
  return semicolons > commas ? ';' : ',';
}

function parseCsv(text) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  const source = String(text || '').replace(/^\uFEFF/, '');
  const delimiter = detectCsvDelimiter(source);

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      field = '';
      if (row.some((entry) => String(entry).trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((entry) => String(entry).trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((cell) => String(cell || '').trim());
  return rows.slice(1).map((row) => {
    const item = {};
    header.forEach((key, index) => {
      item[key] = row[index] === undefined ? '' : String(row[index]).trim();
    });
    return item;
  });
}

function normalizeMetricHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getHeaderValue(row, aliases) {
  const entries = Object.entries(row || {});
  for (const [key, value] of entries) {
    const normalized = normalizeMetricHeader(key);
    if (aliases.includes(normalized)) {
      return value;
    }
  }
  return '';
}

function detectGscFiles() {
  const explicitFiles = parseArgsPaths().filter(pathExists);
  if (explicitFiles.length) return explicitFiles;
  if (!pathExists(DEFAULT_GSC_DIR)) return [];

  return fs.readdirSync(DEFAULT_GSC_DIR)
    .filter((filename) => filename.toLowerCase().endsWith('.csv'))
    .map((filename) => path.join(DEFAULT_GSC_DIR, filename))
    .filter(pathExists);
}

function loadHistoricalPriorities() {
  if (!pathExists(HISTORICAL_PRIORITY_CSV)) return new Map();
  const rows = rowsToObjects(parseCsv(fs.readFileSync(HISTORICAL_PRIORITY_CSV, 'utf8')));
  const map = new Map();

  for (const row of rows) {
    const pathname = normalizeUrlLike(row.URL);
    if (!pathname) continue;
    map.set(pathname, {
      priority: safeNumber(row['Priorita (1-5)']) || safeNumber(row['Priorità (1-5)']),
      level: row.Livello || '',
      category: row.Categoria || '',
      action: row['Azione consigliata'] || '',
      gscStatus: row['Stato GSC stimato'] || ''
    });
  }

  return map;
}

function loadSearchIndex() {
  if (!pathExists(SEARCH_INDEX_PATH)) return new Map();
  const raw = JSON.parse(fs.readFileSync(SEARCH_INDEX_PATH, 'utf8'));
  const entries = Array.isArray(raw) ? raw : [];
  const map = new Map();

  for (const entry of entries) {
    const pathname = normalizeUrlLike(entry.url || entry.id || '');
    if (!pathname) continue;
    map.set(pathname, entry);
  }

  return map;
}

function loadSitemap() {
  if (!pathExists(SITEMAP_PATH)) {
    return { entries: new Map(), urls: [] };
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const lastmods = [...xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((match) => match[1]);
  const map = new Map();
  const urls = [];

  locs.forEach((url, index) => {
    const pathname = normalizeUrlLike(url);
    if (!pathname) return;
    const entry = { pathname, url, lastmod: lastmods[index] || null };
    map.set(pathname, entry);
    urls.push(entry);
  });

  return { entries: map, urls };
}

function loadLinkGraph() {
  if (!pathExists(LINK_GRAPH_PATH)) {
    return { available: false, map: new Map(), pages: [] };
  }

  const graph = JSON.parse(fs.readFileSync(LINK_GRAPH_PATH, 'utf8'));
  const pages = Array.isArray(graph.pages) ? graph.pages : [];
  const inbound = new Map();
  const map = new Map();

  for (const page of pages) {
    const source = normalizeUrlLike(page.url);
    if (!source) continue;
    map.set(source, {
      outbound: Array.isArray(page.linksTo) ? page.linksTo.length : 0,
      inbound: 0,
      rawType: page.type || '',
      rawCity: page.city || ''
    });
  }

  for (const page of pages) {
    const links = Array.isArray(page.linksTo) ? page.linksTo : [];
    for (const target of links) {
      const pathname = normalizeUrlLike(target);
      if (!pathname) continue;
      inbound.set(pathname, (inbound.get(pathname) || 0) + 1);
    }
  }

  for (const [pathname, count] of inbound.entries()) {
    if (!map.has(pathname)) {
      map.set(pathname, { outbound: 0, inbound: count, rawType: '', rawCity: '' });
      continue;
    }
    map.get(pathname).inbound = count;
  }

  return { available: true, map, pages };
}

function loadHierarchyKeywords() {
  if (!pathExists(HIERARCHY_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(HIERARCHY_PATH, 'utf8'));
  const items = [];

  for (const cluster of raw.clusters || []) {
    for (const sub of cluster.sotto_clusters || []) {
      for (const category of sub.categorie_tipologia || []) {
        for (const keyword of category.keywords || []) {
          const term = String(keyword.termine || '').trim();
          if (!term) continue;
          const stars = (String(keyword.priorita_roi || '').match(/⭐/g) || []).length;
          items.push({
            cluster: cluster.nome_cluster || '',
            subCluster: sub.nome_sotto_cluster || '',
            type: category.tipo || '',
            term,
            roiStars: stars || 1,
            tokens: tokenize(term)
          });
        }
      }
    }
  }

  return items;
}

function tokenize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !STOPWORDS.has(token));
}

function loadGscMetrics() {
  const files = detectGscFiles();
  const metricsByPath = new Map();
  const importedFiles = [];

  for (const filePath of files) {
    const rows = rowsToObjects(parseCsv(fs.readFileSync(filePath, 'utf8')));
    if (!rows.length) continue;

    const urlValue = getHeaderValue(rows[0], [
      'page', 'pagina', 'pagine', 'top pages', 'url', 'urls'
    ]);
    const impressionsValue = getHeaderValue(rows[0], ['impressions', 'impressioni']);
    const clicksValue = getHeaderValue(rows[0], ['clicks', 'clic', 'clics']);
    if (!urlValue && !impressionsValue && !clicksValue) {
      continue;
    }

    let importedRows = 0;

    for (const row of rows) {
      const pathname = normalizeUrlLike(
        getHeaderValue(row, ['page', 'pagina', 'pagine', 'top pages', 'url', 'urls'])
      );
      if (!pathname) continue;

      const clicks = safeNumber(getHeaderValue(row, ['clicks', 'clic', 'clics']));
      const impressions = safeNumber(getHeaderValue(row, ['impressions', 'impressioni']));
      const ctrRaw = safeNumber(getHeaderValue(row, ['ctr']));
      const position = safeNumber(getHeaderValue(row, ['position', 'posizione']));

      if (clicks === null && impressions === null && ctrRaw === null && position === null) {
        continue;
      }

      const entry = metricsByPath.get(pathname) || {
        clicks: 0,
        impressions: 0,
        weightedCtr: 0,
        weightedPosition: 0,
        rows: 0
      };

      const rowImpressions = impressions || 0;
      const rowClicks = clicks || 0;
      const rowCtr = ctrRaw === null ? (rowImpressions > 0 ? (rowClicks / rowImpressions) * 100 : null) : ctrRaw;

      entry.clicks += rowClicks;
      entry.impressions += rowImpressions;
      if (rowCtr !== null) {
        entry.weightedCtr += rowCtr * Math.max(1, rowImpressions);
      }
      if (position !== null) {
        entry.weightedPosition += position * Math.max(1, rowImpressions);
      }
      entry.rows += 1;
      metricsByPath.set(pathname, entry);
      importedRows += 1;
    }

    if (importedRows > 0) {
      importedFiles.push(path.relative(ROOT, filePath));
    }
  }

  const normalizedMetrics = new Map();
  for (const [pathname, entry] of metricsByPath.entries()) {
    const denominator = Math.max(1, entry.impressions);
    normalizedMetrics.set(pathname, {
      clicks: entry.clicks,
      impressions: entry.impressions,
      ctr: entry.impressions > 0 ? Number(((entry.clicks / entry.impressions) * 100).toFixed(2)) : (
        entry.weightedCtr > 0 ? Number((entry.weightedCtr / denominator).toFixed(2)) : null
      ),
      position: entry.weightedPosition > 0 ? Number((entry.weightedPosition / denominator).toFixed(2)) : null,
      rows: entry.rows
    });
  }

  return {
    available: normalizedMetrics.size > 0,
    files: importedFiles,
    metricsByPath: normalizedMetrics
  };
}

function detectPageType(pathname) {
  if (pathname === '/' || pathname === '/index.html') return 'homepage';
  if (pathname === '/blog/') return 'blog_index';
  if (pathname.startsWith('/blog/') && pathname.endsWith('.html')) return 'blog_article';
  if (pathname === '/servizi/' || pathname === '/servizi') return 'services_index';
  if (pathname.startsWith('/servizi/') && pathname.endsWith('.html')) return 'service_page';
  if (pathname === '/portfolio.html') return 'portfolio_index';
  if (pathname.startsWith('/portfolio/case-study/')) return 'case_study';
  if (pathname === '/preventivo.html') return 'lead';
  if (pathname === '/chi-siamo.html' || pathname === '/come-lavoriamo.html' || pathname === '/contatti.html') {
    return 'institutional';
  }
  if (pathname === '/agenzia-web/' || pathname === '/realizzazione-siti-web/' || pathname === '/zone-servite/') {
    return 'geo_hub';
  }
  if (LEGAL_PATHS.has(pathname)) return 'legal';

  const geo = detectGeoContext(pathname);
  return geo ? geo.pageType : 'page';
}

function detectGeoContext(pathname) {
  const slug = String(pathname || '').replace(/^\/+/, '').replace(/\.html$/, '');
  if (!slug) return null;

  if (slug.startsWith('agenzia-web-')) {
    const citySlug = slug.slice('agenzia-web-'.length);
    const city = cityMap.get(citySlug);
    return city ? { pageType: 'geo_agenzia', citySlug, city } : null;
  }

  if (slug.startsWith('realizzazione-siti-web-')) {
    const citySlug = slug.slice('realizzazione-siti-web-'.length);
    const city = cityMap.get(citySlug);
    return city ? { pageType: 'geo_realizzazione', citySlug, city } : null;
  }

  for (const serviceSlug of serviceSlugsDesc) {
    if (!slug.startsWith(`${serviceSlug}-`)) continue;
    const citySlug = slug.slice(serviceSlug.length + 1);
    const city = cityMap.get(citySlug);
    if (!city) continue;
    const service = serviceMap.get(serviceSlug);
    return {
      pageType: 'geo_service',
      citySlug,
      city,
      serviceSlug,
      service
    };
  }

  return null;
}

function buildClusterMap() {
  const map = new Map();
  for (const cluster of CLUSTERS) {
    for (const page of cluster.pages || []) {
      const pathname = normalizeUrlLike(`/${normalizeBlogIdentifier(page)}`);
      if (!pathname) continue;
      map.set(pathname, {
        id: cluster.id,
        title: cluster.title,
        pillar: normalizeUrlLike(`/${normalizeBlogIdentifier(cluster.pillar)}`),
        size: (cluster.pages || []).length,
        isPillar: normalizeBlogIdentifier(page) === normalizeBlogIdentifier(cluster.pillar)
      });
    }
  }
  return map;
}

function collectCandidatePathnames(sitemapMap, searchIndexMap, historicalMap, linkGraphMap) {
  const set = new Set();

  for (const pathname of sitemapMap.keys()) set.add(pathname);
  for (const pathname of searchIndexMap.keys()) set.add(pathname);
  for (const pathname of historicalMap.keys()) set.add(pathname);
  for (const pathname of PHASE1_DEAMPLIFIED_PATHS.map((entry) => normalizePathname(entry))) set.add(pathname);
  for (const pathname of linkGraphMap.keys()) set.add(pathname);

  return [...set].filter(Boolean).sort();
}

function cityPriorityScore(city) {
  if (!city) return 0;
  let score = 0;
  if (city.isSede) score += 10;
  if (city.population >= 100000) score += 10;
  else if (city.population >= 50000) score += 8;
  else if (city.population >= 30000) score += 6;
  else if (city.population >= 20000) score += 4;
  else score += 2;

  if (city.distanzaSedeKm <= 5) score += 5;
  else if (city.distanzaSedeKm <= 12) score += 4;
  else if (city.distanzaSedeKm <= 20) score += 2;

  return Math.min(25, score);
}

function scoreBusinessValue(context) {
  const { pathname, pageType, historical, clusterInfo, hierarchyMatch, geo, searchEntry } = context;
  if (isDeAmplifiedPath(pathname)) return 4;
  if (LEGAL_PATHS.has(pathname)) return 2;
  if (CORE_ALWAYS_KEEP.has(pathname)) return 25;
  if (pageType === 'service_page') {
    const slug = pathname.split('/').pop().replace(/\.html$/, '');
    const service = serviceMap.get(slug);
    return service && service.tier === 'core' ? 24 : 18;
  }
  if (pageType === 'lead') return 25;
  if (pageType === 'homepage') return 25;
  if (pageType === 'geo_agenzia' || pageType === 'geo_realizzazione') {
    return Math.min(25, 14 + cityPriorityScore(geo && geo.city));
  }
  if (pageType === 'geo_service') {
    const service = geo && geo.service;
    if (!service) return 10;
    const base = service.tier === 'core' ? 13 : 4;
    return Math.min(25, base + cityPriorityScore(geo.city));
  }
  if (pageType === 'blog_article') {
    let score = clusterInfo ? (clusterInfo.isPillar ? 20 : 16) : 11;
    if (hierarchyMatch && hierarchyMatch.score >= 0.7) score += 4;
    if (historical && historical.priority && historical.priority <= 3) score += 3;
    if (searchEntry && searchEntry.tag) score += 1;
    return Math.min(25, score);
  }
  if (pageType === 'institutional' || pageType === 'portfolio_index' || pageType === 'case_study') {
    return historical && historical.priority && historical.priority <= 2 ? 18 : 14;
  }
  return historical && historical.priority ? Math.max(5, 22 - (historical.priority * 3)) : 10;
}

function scoreSupportStrength(context) {
  const { fileExists, searchEntry, sitemapEntry, linkSignals, historical } = context;
  let score = 0;

  if (fileExists) score += 6;
  if (searchEntry) score += 4;
  if (searchEntry && searchEntry.title) score += 4;
  if (searchEntry && Array.isArray(searchEntry.headings) && searchEntry.headings.length >= 3) score += 4;
  if (sitemapEntry && sitemapEntry.lastmod) {
    const days = daysSince(sitemapEntry.lastmod);
    if (days <= 90) score += 5;
    else if (days <= 180) score += 3;
  }
  if (linkSignals && linkSignals.inbound > 0) {
    score += Math.min(6, linkSignals.inbound * 2);
  }
  if (historical && historical.priority && historical.priority <= 2) score += 2;

  return Math.min(25, score);
}

function scoreSeoSignals(context) {
  const { gscMetrics, sitemapEntry, historical, clusterInfo, hierarchyMatch } = context;

  if (gscMetrics) {
    let score = 0;
    if (gscMetrics.position !== null) {
      if (gscMetrics.position <= 3) score += 8;
      else if (gscMetrics.position <= 10) score += 6;
      else if (gscMetrics.position <= 20) score += 4;
      else score += 1;
    }
    if (gscMetrics.impressions >= 200) score += 6;
    else if (gscMetrics.impressions >= 80) score += 4;
    else if (gscMetrics.impressions >= 20) score += 2;

    if (gscMetrics.ctr !== null) {
      if (gscMetrics.ctr >= 2) score += 5;
      else if (gscMetrics.ctr >= 1) score += 4;
      else if (gscMetrics.ctr > 0) score += 2;
    }

    if (gscMetrics.clicks >= 10) score += 6;
    else if (gscMetrics.clicks >= 3) score += 4;
    else if (gscMetrics.clicks >= 1) score += 2;

    return Math.min(25, score);
  }

  let fallback = sitemapEntry ? 10 : 4;
  if (historical && historical.priority && historical.priority <= 2) fallback += 4;
  if (clusterInfo) fallback += clusterInfo.isPillar ? 4 : 2;
  if (hierarchyMatch && hierarchyMatch.roiStars >= 3) fallback += 3;
  return Math.min(25, fallback);
}

function scoreRiskAdjustment(context) {
  const { pathname, pageType, geo, linkSignals, sitemapEntry, historical, clusterInfo, hierarchyMatch } = context;
  let score = 25;
  const inboundCount = linkSignals ? (linkSignals.inbound || 0) : 0;

  if (LEGAL_PATHS.has(pathname)) score -= 16;
  if (pageType === 'geo_service' && geo && geo.service && geo.service.tier !== 'core') score -= 18;
  if ((pageType.startsWith('geo_') || pageType === 'page') && inboundCount === 0) score -= 8;
  if (sitemapEntry && sitemapEntry.lastmod) {
    const days = daysSince(sitemapEntry.lastmod);
    if (days > 180) score -= 6;
    else if (days > 90) score -= 3;
  }
  if (pageType === 'geo_service' && geo && geo.city) {
    if (geo.city.population < 20000) score -= 5;
    if (geo.city.distanzaSedeKm > 18) score -= 3;
    if (!historical || !historical.priority) score -= 3;
  }
  if ((pageType === 'geo_agenzia' || pageType === 'geo_realizzazione') && geo && geo.city) {
    if (cityPriorityScore(geo.city) <= 10) score -= 5;
    if (!historical || !historical.priority) score -= 2;
  }
  if (clusterInfo && !clusterInfo.isPillar && EXPLICIT_CONSOLIDATION_TARGETS[pathname]) score -= 10;
  if (historical && historical.priority && historical.priority >= 5) score -= 6;
  if (!hierarchyMatch && pageType === 'blog_article' && !clusterInfo) score -= 5;

  return Math.max(0, score);
}

function daysSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function scoreHierarchyMatch(pathname, title, hierarchyKeywords) {
  const tokens = new Set(tokenize(`${pathname} ${title || ''}`));
  if (!tokens.size) return null;

  let best = null;
  for (const keyword of hierarchyKeywords) {
    if (!keyword.tokens.length) continue;
    let matches = 0;
    let distinctiveMatches = 0;
    for (const token of keyword.tokens) {
      if (!tokens.has(token)) continue;
      matches += 1;
      if (!WEAK_TOPIC_TOKENS.has(token)) {
        distinctiveMatches += 1;
      }
    }
    if (matches === 0 || distinctiveMatches === 0) continue;
    const weightedScore = ((distinctiveMatches * 2) + matches) / (keyword.tokens.length * 3);
    if (!best || (weightedScore * keyword.roiStars) > (best.score * best.roiStars)) {
      best = {
        term: keyword.term,
        cluster: keyword.cluster,
        subCluster: keyword.subCluster,
        roiStars: keyword.roiStars,
        score: Number(weightedScore.toFixed(2))
      };
    }
  }

  return best;
}

function buildReasonCodes(context) {
  const reasons = [];
  const { pathname, pageType, historical, gscMetrics, clusterInfo, geo, linkSignals, hierarchyMatch } = context;
  const inboundCount = linkSignals ? (linkSignals.inbound || 0) : 0;

  if (CORE_ALWAYS_KEEP.has(pathname)) reasons.push('core_path');
  if (historical && historical.priority) reasons.push(`priority_${historical.priority}`);
  if (DATA_VALIDATED_INDEXABLE_GEO_PATHS.has(pathname)) reasons.push('data_validated_search_demand');
  if (clusterInfo) reasons.push(clusterInfo.isPillar ? 'cluster_pillar' : 'cluster_support');
  if (hierarchyMatch && hierarchyMatch.roiStars >= 3) reasons.push('high_roi_theme');
  if (pageType === 'geo_service' && geo && geo.service && geo.service.tier === 'core') reasons.push('core_geo_service');
  if (pageType === 'geo_service' && geo && geo.service && geo.service.tier !== 'core') reasons.push('extended_geo_service');
  if ((pageType === 'geo_agenzia' || pageType === 'geo_realizzazione') && geo && geo.city && geo.city.isSede) reasons.push('sede_city');
  if ((pageType.startsWith('geo_') || pageType === 'page') && inboundCount === 0) reasons.push('low_internal_support');
  if (linkSignals && linkSignals.inbound === 0) reasons.push('zero_inbound_links');
  if (LEGAL_PATHS.has(pathname)) reasons.push('legal_low_value');
  if (EXPLICIT_CONSOLIDATION_TARGETS[pathname]) reasons.push('explicit_consolidation_candidate');
  if (gscMetrics && gscMetrics.impressions >= 80 && gscMetrics.position !== null && gscMetrics.position <= 10 && gscMetrics.ctr !== null && gscMetrics.ctr < 1) {
    reasons.push('low_ctr_opportunity');
  }

  return reasons;
}

function assignBucket(context) {
  const { pathname, pageType, gscMetrics, governanceScore, clusterInfo, geo } = context;
  const inboundCount = context.linkSignals ? (context.linkSignals.inbound || 0) : 0;
  const cityScore = geo && geo.city ? cityPriorityScore(geo.city) : 0;
  const hasHistoricalPriority = Boolean(context.historical && context.historical.priority);

  if (isDeAmplifiedPath(pathname)) {
    return 'deamplified_existing';
  }

  if (LEGAL_PATHS.has(pathname)) {
    return 'review_for_deamplify';
  }

  if (EXPLICIT_CONSOLIDATION_TARGETS[pathname]) {
    return 'merge_or_consolidate';
  }

  if (
    gscMetrics &&
    gscMetrics.impressions >= 80 &&
    gscMetrics.position !== null &&
    gscMetrics.position >= 3 &&
    gscMetrics.position <= 10 &&
    gscMetrics.ctr !== null &&
    gscMetrics.ctr < 1
  ) {
    return 'improve_ctr';
  }

  if (DATA_VALIDATED_INDEXABLE_GEO_PATHS.has(pathname)) {
    return 'keep_push';
  }

  if (pageType === 'geo_service' && geo && geo.service && geo.service.tier !== 'core') {
    return 'review_for_deamplify';
  }

  if (
    pageType === 'geo_service' &&
    geo &&
    geo.service &&
    geo.service.tier === 'core' &&
    !gscMetrics &&
    !hasHistoricalPriority &&
    inboundCount === 0 &&
    cityScore <= 10
  ) {
    return 'review_for_deamplify';
  }

  if (
    (pageType === 'geo_agenzia' || pageType === 'geo_realizzazione') &&
    !gscMetrics &&
    !hasHistoricalPriority &&
    inboundCount === 0 &&
    cityScore <= 9
  ) {
    return 'review_for_deamplify';
  }

  if (pageType === 'blog_article' && clusterInfo && !clusterInfo.isPillar && governanceScore < 58) {
    return 'merge_or_consolidate';
  }

  if (pageType.startsWith('geo_') && governanceScore < 48) {
    return 'review_for_deamplify';
  }

  if (pageType === 'blog_article' && governanceScore < 45) {
    return 'review_for_deamplify';
  }

  return 'keep_push';
}

function buildNextStep(context, bucket) {
  const { pathname, clusterInfo, geo } = context;

  if (bucket === 'deamplified_existing') {
    return 'Mantieni noindex, follow e usa la pagina come supporto interno, non come asset da spingere in sitemap.';
  }
  if (bucket === 'improve_ctr') {
    return 'Rivedi title, meta description, H1 e intro; rafforza la promessa in SERP e porta link interni commerciali sulla pagina.';
  }
  if (bucket === 'merge_or_consolidate') {
    const target = EXPLICIT_CONSOLIDATION_TARGETS[pathname] || (clusterInfo ? clusterInfo.pillar : '');
    return target
      ? `Valuta merge o rifocalizzazione verso ${target}; decidi redirect 301 solo dopo 90 giorni di dati GSC puliti.`
      : 'Consolida il contenuto nel nodo principale del cluster e lascia questa pagina solo se difende un intento davvero distinto.';
  }
  if (bucket === 'review_for_deamplify') {
    if (LEGAL_PATHS.has(pathname)) {
      return 'Valuta noindex e rimozione dalla strategia organica primaria: la pagina ha utilita legale ma poco valore SEO diretto.';
    }
    if (geo && geo.city) {
      return `Raccogli 90 giorni GSC su ${geo.city.name}; se resta senza domanda reale o segnali interni, valuta de-amplificazione o merge nel nodo locale piu forte.`;
    }
    return 'Non tagliare subito: verifica 90 giorni GSC, duplicazione semantica e inbound link prima di applicare noindex o pruning.';
  }
  return 'Mantieni la pagina indicizzabile, rafforza internal linking e usala come nodo da spingere nel prossimo ciclo SEO.';
}

function computeConfidence(context, gscAvailable) {
  let score = 0.4;
  if (context.historical) score += 0.2;
  if (context.searchEntry) score += 0.15;
  if (context.sitemapEntry) score += 0.15;
  if (context.linkSignals) score += 0.05;
  if (gscAvailable && context.gscMetrics) score += 0.25;
  return Number(Math.min(0.98, score).toFixed(2));
}

function buildRecords() {
  const historicalMap = loadHistoricalPriorities();
  const searchIndexMap = loadSearchIndex();
  const sitemap = loadSitemap();
  const linkGraph = loadLinkGraph();
  const hierarchyKeywords = loadHierarchyKeywords();
  const gsc = loadGscMetrics();
  const clusterMap = buildClusterMap();
  const pathnames = collectCandidatePathnames(
    sitemap.entries,
    searchIndexMap,
    historicalMap,
    linkGraph.map
  );

  const records = [];

  for (const pathname of pathnames) {
    const filePath = toDiskPath(pathname);
    const fileExists = pathExists(filePath);
    const pageType = detectPageType(pathname);
    const geo = detectGeoContext(pathname);
    const historical = historicalMap.get(pathname) || null;
    const searchEntry = searchIndexMap.get(pathname) || null;
    const sitemapEntry = sitemap.entries.get(pathname) || null;
    const linkSignals = linkGraph.map.get(pathname) || null;
    const gscMetrics = gsc.metricsByPath.get(pathname) || null;
    const clusterInfo = clusterMap.get(pathname) || null;
    const hierarchyMatch = scoreHierarchyMatch(
      pathname,
      (searchEntry && searchEntry.title) || '',
      hierarchyKeywords
    );

    if (!fileExists && !sitemapEntry && !searchEntry && !isDeAmplifiedPath(pathname)) {
      continue;
    }

    const context = {
      pathname,
      pageType,
      geo,
      fileExists,
      filePath,
      historical,
      searchEntry,
      sitemapEntry,
      linkSignals,
      gscMetrics,
      clusterInfo,
      hierarchyMatch
    };

    const businessValue = scoreBusinessValue(context);
    const supportStrength = scoreSupportStrength(context);
    const seoSignals = scoreSeoSignals(context);
    const riskAdjustment = scoreRiskAdjustment(context);
    const governanceScore = businessValue + supportStrength + seoSignals + riskAdjustment;
    const bucket = assignBucket({ ...context, governanceScore });
    const reasonCodes = buildReasonCodes(context);
    const nextStep = buildNextStep(context, bucket);
    const confidence = computeConfidence(context, gsc.available);

    records.push({
      pathname,
      pageType,
      bucket,
      governanceScore,
      confidence,
      title: searchEntry ? (searchEntry.title || '') : '',
      tag: searchEntry ? (searchEntry.tag || '') : '',
      existsOnDisk: fileExists,
      filePath: path.relative(ROOT, filePath),
      historicalPriority: historical ? historical.priority : null,
      historicalLevel: historical ? historical.level : '',
      historicalCategory: historical ? historical.category : '',
      clusterId: clusterInfo ? clusterInfo.id : '',
      isClusterPillar: Boolean(clusterInfo && clusterInfo.isPillar),
      hierarchyMatch,
      gsc: gscMetrics,
      linkSignals: linkSignals ? {
        inbound: linkSignals.inbound || 0,
        outbound: linkSignals.outbound || 0
      } : null,
      freshnessDays: sitemapEntry && sitemapEntry.lastmod ? daysSince(sitemapEntry.lastmod) : null,
      geo: geo ? {
        citySlug: geo.citySlug || '',
        cityName: geo.city ? geo.city.name : '',
        cityPopulation: geo.city ? geo.city.population : null,
        cityDistanceKm: geo.city ? geo.city.distanzaSedeKm : null,
        serviceSlug: geo.serviceSlug || '',
        serviceTier: geo.service ? geo.service.tier : '',
        cityPriorityScore: geo.city ? cityPriorityScore(geo.city) : 0
      } : null,
      scores: {
        businessValue,
        supportStrength,
        seoSignals,
        riskAdjustment
      },
      reasonCodes,
      nextStep
    });
  }

  return {
    records,
    gsc,
    historicalMap,
    searchIndexMap,
    sitemap,
    linkGraph
  };
}

function summarizeByBucket(records) {
  const buckets = {
    keep_push: [],
    improve_ctr: [],
    merge_or_consolidate: [],
    review_for_deamplify: [],
    deamplified_existing: []
  };

  for (const record of records) {
    buckets[record.bucket].push(record);
  }

  buckets.keep_push.sort((a, b) => b.governanceScore - a.governanceScore);
  buckets.improve_ctr.sort((a, b) => (b.gsc?.impressions || 0) - (a.gsc?.impressions || 0));
  buckets.merge_or_consolidate.sort((a, b) => a.governanceScore - b.governanceScore);
  buckets.review_for_deamplify.sort((a, b) => a.governanceScore - b.governanceScore);
  buckets.deamplified_existing.sort((a, b) => a.pathname.localeCompare(b.pathname, 'it'));

  return buckets;
}

function summarizeByType(records) {
  const summary = {};
  for (const record of records) {
    summary[record.pageType] = (summary[record.pageType] || 0) + 1;
  }
  return summary;
}

function topItems(records, limit, sortFn) {
  return [...records].sort(sortFn).slice(0, limit);
}

function formatMetric(value, suffix = '') {
  if (value === null || value === undefined || value === '') return '-';
  return `${value}${suffix}`;
}

function toMarkdown(report) {
  const lines = [];
  const { summary, dataAvailability, buckets } = report;

  lines.push('# Governance Report SEO');
  lines.push('');
  lines.push(`Generato il ${summary.generatedAtLocal}.`);
  lines.push('');
  lines.push('## Stato dati');
  lines.push('');
  lines.push(`- URL analizzati: ${summary.totalUrls}`);
  lines.push(`- Da sitemap: ${summary.sitemapUrls}`);
  lines.push(`- Da search-index: ${summary.searchIndexUrls}`);
  lines.push(`- Da classificazione storica: ${summary.historicalPriorityUrls}`);
  lines.push(`- Da de-amplificazione esistente: ${summary.deamplifiedKnownUrls}`);
  lines.push(`- GSC page-level disponibile: ${dataAvailability.gsc.available ? 'si' : 'no'}`);
  if (dataAvailability.gsc.files.length) {
    lines.push(`- CSV GSC importati: ${dataAvailability.gsc.files.join(', ')}`);
  } else {
    lines.push('- CSV GSC importati: nessuno');
  }
  lines.push('');
  lines.push('## Bucket operativi');
  lines.push('');
  lines.push(`- keep_push: ${buckets.keep_push.length}`);
  lines.push(`- improve_ctr: ${buckets.improve_ctr.length}`);
  lines.push(`- merge_or_consolidate: ${buckets.merge_or_consolidate.length}`);
  lines.push(`- review_for_deamplify: ${buckets.review_for_deamplify.length}`);
  lines.push(`- deamplified_existing: ${buckets.deamplified_existing.length}`);
  lines.push('');

  lines.push('## Keep / Push');
  lines.push('');
  lines.push('| URL | Tipo | Score | Motivi | Prossima azione |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const record of buckets.keep_push.slice(0, 15)) {
    lines.push(`| ${record.pathname} | ${record.pageType} | ${record.governanceScore} | ${record.reasonCodes.join(', ') || '-'} | ${record.nextStep} |`);
  }
  lines.push('');

  lines.push('## Improve CTR');
  lines.push('');
  if (!buckets.improve_ctr.length) {
    lines.push('_Nessuna pagina in bucket CTR: aggiungi i CSV page-level GSC in `data/gsc/` per sbloccare questa sezione._');
  } else {
    lines.push('| URL | Impression | CTR | Posizione | Prossima azione |');
    lines.push('| --- | ---: | ---: | ---: | --- |');
    for (const record of buckets.improve_ctr.slice(0, 15)) {
      lines.push(`| ${record.pathname} | ${formatMetric(record.gsc?.impressions)} | ${formatMetric(record.gsc?.ctr, '%')} | ${formatMetric(record.gsc?.position)} | ${record.nextStep} |`);
    }
  }
  lines.push('');

  lines.push('## Merge / Consolidate');
  lines.push('');
  lines.push('| URL | Tipo | Score | Motivi | Prossima azione |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const record of buckets.merge_or_consolidate.slice(0, 15)) {
    lines.push(`| ${record.pathname} | ${record.pageType} | ${record.governanceScore} | ${record.reasonCodes.join(', ') || '-'} | ${record.nextStep} |`);
  }
  lines.push('');

  lines.push('## Review for De-amplify');
  lines.push('');
  lines.push('| URL | Tipo | Score | Motivi | Prossima azione |');
  lines.push('| --- | --- | ---: | --- | --- |');
  for (const record of buckets.review_for_deamplify.slice(0, 20)) {
    lines.push(`| ${record.pathname} | ${record.pageType} | ${record.governanceScore} | ${record.reasonCodes.join(', ') || '-'} | ${record.nextStep} |`);
  }
  lines.push('');

  lines.push('## De-amplified gia attive');
  lines.push('');
  lines.push('| URL | Tipo | Score | Motivi |');
  lines.push('| --- | --- | ---: | --- |');
  for (const record of buckets.deamplified_existing.slice(0, 20)) {
    lines.push(`| ${record.pathname} | ${record.pageType} | ${record.governanceScore} | ${record.reasonCodes.join(', ') || '-'} |`);
  }
  lines.push('');

  lines.push('## Note operative');
  lines.push('');
  lines.push('- Il report non applica nuovi noindex in automatico: produce candidati motivati.');
  lines.push('- Per decidere prune, merge o CTR work sugli URL gia visibili servono export GSC page-level completi a 90 giorni.');
  lines.push('- Quando aggiungi i CSV in `data/gsc/`, riesegui `npm run governance:seo` per aggiornare i bucket con impression, clic, CTR e posizione.');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function buildReport() {
  const { records, gsc, historicalMap, searchIndexMap, sitemap, linkGraph } = buildRecords();
  const buckets = summarizeByBucket(records);
  const report = {
    generatedAt: new Date().toISOString(),
    generatedAtLocal: new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }),
    summary: {
      totalUrls: records.length,
      sitemapUrls: sitemap.entries.size,
      searchIndexUrls: searchIndexMap.size,
      historicalPriorityUrls: historicalMap.size,
      deamplifiedKnownUrls: PHASE1_DEAMPLIFIED_PATHS.length,
      linkGraphUrls: linkGraph.map.size,
      byType: summarizeByType(records),
      generatedAtLocal: new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })
    },
    dataAvailability: {
      gsc: {
        available: gsc.available,
        files: gsc.files
      },
      sitemap: {
        available: sitemap.entries.size > 0,
        urls: sitemap.entries.size
      },
      searchIndex: {
        available: searchIndexMap.size > 0,
        urls: searchIndexMap.size
      },
      historicalPriorities: {
        available: historicalMap.size > 0,
        urls: historicalMap.size
      },
      linkGraph: {
        available: linkGraph.available,
        urls: linkGraph.map.size
      }
    },
    buckets,
    topActionable: {
      keep_push: topItems(buckets.keep_push, 12, (a, b) => b.governanceScore - a.governanceScore),
      improve_ctr: topItems(buckets.improve_ctr, 12, (a, b) => (b.gsc?.impressions || 0) - (a.gsc?.impressions || 0)),
      merge_or_consolidate: topItems(buckets.merge_or_consolidate, 12, (a, b) => a.governanceScore - b.governanceScore),
      review_for_deamplify: topItems(buckets.review_for_deamplify, 12, (a, b) => a.governanceScore - b.governanceScore)
    },
    records
  };

  return report;
}

function writeOutputs(report) {
  ensureDir(path.dirname(OUTPUT_JSON_PATH));
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(OUTPUT_MD_PATH, toMarkdown(report));
}

function main() {
  const report = buildReport();

  if (!JSON_ONLY && !NO_WRITE) {
    writeOutputs(report);
  }

  if (JSON_ONLY) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const lines = [
    'SEO governance report generated.',
    `URLs analyzed: ${report.summary.totalUrls}`,
    `keep_push: ${report.buckets.keep_push.length}`,
    `improve_ctr: ${report.buckets.improve_ctr.length}`,
    `merge_or_consolidate: ${report.buckets.merge_or_consolidate.length}`,
    `review_for_deamplify: ${report.buckets.review_for_deamplify.length}`,
    `deamplified_existing: ${report.buckets.deamplified_existing.length}`
  ];
  if (report.dataAvailability.gsc.available) {
    lines.push(`GSC files loaded: ${report.dataAvailability.gsc.files.join(', ')}`);
  } else {
    lines.push('GSC files loaded: none');
  }
  lines.push(`JSON: ${path.relative(ROOT, OUTPUT_JSON_PATH)}`);
  lines.push(`Markdown: ${path.relative(ROOT, OUTPUT_MD_PATH)}`);

  console.log(lines.join('\n'));
}

main();
