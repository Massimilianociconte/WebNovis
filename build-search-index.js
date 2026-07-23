/**
 * Build Search Index — WebNovis
 * Generates:
 * - search-index.json     -> lightweight public index for client-side Fuse.js
 * - search-ai-index.json  -> richer private corpus for server-side AI retrieval
 *
 * Run: node build-search-index.js
 */

const fs = require('fs');
const path = require('path');
const { ROOT_DIR, getPublishDir } = require('./config/publish-targets');
const { getIndexationDirectivesForPath } = require('./config/pseo-governance');

const PROJECT_ROOT = getPublishDir();
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'search-index.json');
const AI_OUTPUT_FILE = path.join(PROJECT_ROOT, 'search-ai-index.json');
const PUBLIC_ONLY = process.argv.includes('--public-only');

const ROOT_HTML_EXCLUDES = new Set([
  '404.html',
  'grazie.html',
  'newsletter-template.html',
  'agenzie-web-rho.html'
]);
const PUBLIC_SUBDIRS = [
  'blog',
  'servizi',
  path.join('portfolio', 'case-study'),
  'agenzia-web',
  'realizzazione-siti-web',
  'zone-servite'
];

const STOP_WORDS = new Set([
  'a', 'ad', 'ai', 'al', 'alla', 'allo', 'all', 'anche', 'che', 'chi', 'ci', 'con',
  'da', 'dal', 'dalla', 'dello', 'dei', 'del', 'della', 'delle', 'di', 'e', 'ed',
  'gli', 'ha', 'i', 'il', 'in', 'la', 'le', 'lo', 'ma', 'nel', 'nella', 'nelle',
  'non', 'o', 'per', 'piu', 'piu', 'puo', 'se', 'si', 'su', 'sul', 'sulla', 'tra',
  'un', 'una', 'uno', 'webnovis', 'web', 'www'
]);

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHTML(html) {
  return normalizeWhitespace(
    decodeEntities(
      String(html || '')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
    )
  );
}

function normalizeText(value) {
  return normalizeWhitespace(
    String(value || '')
      .toLowerCase()
      .replace(/\be[\s-]?commerce\b/g, 'ecommerce')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-/.]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
  );
}

function truncateAtBoundary(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (!maxLength || text.length <= maxLength) return text;

  const slice = text.slice(0, maxLength);
  const boundary = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? '),
    slice.lastIndexOf(', '),
    slice.lastIndexOf(' ')
  );

  if (boundary > Math.floor(maxLength * 0.65)) {
    return slice.slice(0, boundary).trim();
  }

  return slice.trim();
}

function extractParagraphs(html) {
  return [...String(html || '').matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHTML(match[1]))
    .filter((paragraph) => paragraph.length >= 45);
}

function extractHeadings(html) {
  const headings = [];
  const matches = html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi);
  for (const match of matches) {
    const clean = truncateAtBoundary(stripHTML(match[1]), 120);
    if (clean) headings.push(clean);
  }
  return headings.slice(0, 12);
}

function inferDescription(description, paragraphs, bodyText) {
  if (description) return truncateAtBoundary(description, 220);
  const paragraphLead = truncateAtBoundary(paragraphs.slice(0, 2).join(' '), 220);
  return paragraphLead || truncateAtBoundary(bodyText, 220);
}

function buildKeywordString(parts) {
  const seen = new Set();
  const keywords = [];

  parts.forEach((part) => {
    normalizeText(part)
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
      .forEach((token) => {
        if (seen.has(token)) return;
        seen.add(token);
        keywords.push(token);
      });
  });

  return keywords.slice(0, 28).join(', ');
}

function cleanTitle(rawTitle) {
  return normalizeWhitespace(
    String(rawTitle || '')
      .replace(/\s*[|]\s*Web\s*Novis.*$/i, '')
      .replace(/\s*[—-]\s*Web\s*Novis.*$/i, '')
  );
}

function extractFromHTML(html, url) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = cleanTitle(titleMatch ? stripHTML(titleMatch[1]) : '');

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const description = descMatch ? normalizeWhitespace(decodeEntities(descMatch[1])) : '';

  const keywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']keywords["']/i);
  const metaKeywords = keywordsMatch ? normalizeWhitespace(decodeEntities(keywordsMatch[1])) : '';

  const headings = extractHeadings(html);
  const paragraphs = extractParagraphs(html);

  const body = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ');

  const bodyText = stripHTML(body);
  const shortDescription = inferDescription(description, paragraphs, bodyText);
  const clientSnippet = truncateAtBoundary(paragraphs.slice(0, 2).join(' ') || bodyText, 260);
  const aiSnippet = truncateAtBoundary(paragraphs.slice(0, 4).join(' ') || bodyText, 900);

  const pathKeywords = url.replace(/[/.]+/g, ' ');
  const keywords = buildKeywordString([
    metaKeywords,
    title,
    shortDescription,
    headings.join(' '),
    pathKeywords
  ]);

  return {
    title,
    description: shortDescription,
    keywords,
    headings,
    clientSnippet,
    aiSnippet
  };
}

function hasMetaRobotsNoindex(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(String(html || ''));
}

function walkHtmlFiles(dirPath, baseDir = PROJECT_ROOT) {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkHtmlFiles(fullPath, baseDir));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    files.push(path.relative(baseDir, fullPath));
  }

  return files;
}

function collectSourceFiles() {
  const collected = new Set();

  fs.readdirSync(PROJECT_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html') && !ROOT_HTML_EXCLUDES.has(entry.name))
    .forEach((entry) => collected.add(entry.name));

  PUBLIC_SUBDIRS.forEach((relativeDir) => {
    walkHtmlFiles(path.join(PROJECT_ROOT, relativeDir)).forEach((file) => collected.add(file));
  });

  return [...collected].sort((a, b) => a.localeCompare(b));
}

function toUrl(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  if (normalizedPath === 'index.html') return '/';
  if (normalizedPath.endsWith('/index.html')) {
    return `/${normalizedPath.slice(0, -'index.html'.length)}`;
  }
  return `/${normalizedPath}`;
}

function classifyType(url) {
  if (url.startsWith('/blog/')) {
    return url === '/blog/' ? 'hub' : 'articolo';
  }
  if (url.startsWith('/portfolio/case-study/')) return 'portfolio';
  if (url.startsWith('/servizi/')) return url === '/servizi/' ? 'hub' : 'servizio';
  if (
    url.startsWith('/agenzia-web') ||
    url.startsWith('/realizzazione-siti-web') ||
    url.startsWith('/zone-servite')
  ) {
    return 'locale';
  }
  if (/^\/[a-z0-9-]+-[a-z0-9-]+\.html$/i.test(url)) {
    return 'locale';
  }
  if (
    url === '/privacy-policy.html' ||
    url === '/cookie-policy.html' ||
    url === '/termini-condizioni.html'
  ) {
    return 'legale';
  }
  return 'page';
}

function buildEntry(relativePath) {
  const filePath = path.join(PROJECT_ROOT, relativePath);
  const html = fs.readFileSync(filePath, 'utf8');
  const url = toUrl(relativePath);
  const extracted = extractFromHTML(html, url);
  const indexable = !hasMetaRobotsNoindex(html) && getIndexationDirectivesForPath(url) !== 'noindex, follow';
  const title = extracted.title || path.basename(relativePath, '.html').replace(/[-_]+/g, ' ');

  return {
    id: url,
    url,
    type: classifyType(url),
    title,
    description: extracted.description,
    keywords: extracted.keywords,
    headings: extracted.headings,
    content: extracted.clientSnippet,
    aiContent: extracted.aiSnippet,
    indexable
  };
}

function buildIndexes() {
  const allEntries = collectSourceFiles()
    .map(buildEntry)
    .sort((a, b) => a.url.localeCompare(b.url));

  const publicIndex = allEntries
    .filter((entry) => entry.indexable !== false)
    .map(({ aiContent, ...entry }) => entry);

  const aiIndex = allEntries.map(({ aiContent, ...entry }) => ({
    ...entry,
    content: aiContent || entry.content
  }));

  return { publicIndex, aiIndex };
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

const { publicIndex, aiIndex } = buildIndexes();
writeJson(OUTPUT_FILE, publicIndex);

console.log(`✅ Search index built: ${publicIndex.length} public pages indexed -> ${path.relative(ROOT_DIR, OUTPUT_FILE).replace(/\\/g, '/')}`);
if (PUBLIC_ONLY) {
  if (fs.existsSync(AI_OUTPUT_FILE)) fs.rmSync(AI_OUTPUT_FILE);
  console.log('ℹ️  Private AI corpus excluded from the public artifact.');
} else {
  writeJson(AI_OUTPUT_FILE, aiIndex);
  console.log(`✅ Search AI corpus built: ${aiIndex.length} pages indexed -> ${path.relative(ROOT_DIR, AI_OUTPUT_FILE).replace(/\\/g, '/')}`);
}
