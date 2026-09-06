#!/usr/bin/env node
/**
 * generate-llms-full.js — Genera llms-full.txt da single source.
 *
 * llms.txt è l'indice sintetico; llms-full.txt è un export editoriale
 * sperimentale delle pagine chiave in testo semplice. Non è uno standard
 * ufficiale dei motori e non implica benefici di crawling, ranking o citazione.
 *
 * Fonti (nessuna duplicazione manuale dei fatti):
 *   - llms.txt           → header/abstract del brand
 *   - pagine core        → testo estratto dal <main> dell'HTML pubblicato
 *   - servizi/*.html     → tutte le pagine servizio
 *   - pagine geo Tier 1  → da config/pseo-governance.js (single source)
 *   - blog/*.html        → digest deterministico degli ultimi 10 articoli
 *                          (titolo+URL+descrizione; le voci con claim non
 *                          governati vengono scaltate con warning, mai
 *                          pubblicate: l'export resta fail-closed)
 *
 * Uso:   node scripts/generate-llms-full.js
 * npm:   npm run build:llms-full
 */

const fs = require('fs');
const path = require('path');
const { TIER1_INDEXABLE_GEO_PATHS } = require('../config/pseo-governance');
const { findUnsupportedPublishedClaims } = require('../config/content-claim-governance');
const { getPublishDir } = require('../config/publish-targets');

const PUBLISH_ROOT = getPublishDir();
const SITE_URL = 'https://www.webnovis.com';
const MAX_CHARS_PER_PAGE = 6000;

const CORE_PAGES = [
  'index.html',
  'chi-siamo.html',
  'come-lavoriamo.html',
  'portfolio.html',
  'preventivo.html',
  'contatti.html'
];

const BLOG_DIGEST_ITEMS = 10;
const BLOG_DIGEST_DESC_CHARS = 160;

/** Digest deterministico degli ultimi articoli (titolo+URL+descrizione).
 *  Separatore `===` dedicato: non interferisce con il conteggio sezioni
 *  `---` del test (una sezione per pagina configurata). Niente righe `URL: `
 *  per non alterare l'elenco canonico verificato. */
function buildBlogDigest() {
  const blogDir = path.join(PUBLISH_ROOT, 'blog');
  if (!fs.existsSync(blogDir)) return '';
  const files = fs.readdirSync(blogDir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .sort();
  const items = [];
  for (const file of files) {
    const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const rawTitle = extractTitle(html);
    if (!rawTitle) continue;
    // Il suffisso " — WebNovis" è identico ovunque: solo rumore nel digest.
    const title = rawTitle.replace(/\s+[—–|-]\s+WebNovis\s*$/i, '');
    const slug = file.replace(/\.html$/, '');
    const dateMatch = html.match(/<meta\s+[^>]*property="article:published_time"[^>]*content="([^"]*)"/i)
      || html.match(/<meta\s+[^>]*property="article:modified_time"[^>]*content="([^"]*)"/i);
    const date = dateMatch ? dateMatch[1].slice(0, 10) : '';
    const desc = extractDescription(html).replace(/\s+/g, ' ').trim().slice(0, BLOG_DIGEST_DESC_CHARS);
    items.push({ slug, title, date, desc });
  }
  items.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.slug.localeCompare(b.slug));
  const lines = [];
  let skipped = 0;
  for (const item of items.slice(0, BLOG_DIGEST_ITEMS)) {
    const line = `- [${item.title}](${SITE_URL}/blog/${item.slug}.html)` +
      (item.desc ? ` — ${item.desc}` : '');
    if (findUnsupportedPublishedClaims(line).length > 0) {
      skipped += 1;
      continue;
    }
    lines.push(line);
  }
  if (skipped > 0) {
    console.warn(`⚠️ blog digest: saltate ${skipped} voci con claim non governati`);
  }
  if (lines.length === 0) return '';
  return [
    '========================================',
    '## Dal blog (ultimi articoli)',
    '',
    ...lines,
    ''
  ].join('\n');
}

function listServicePages() {
  return fs.readdirSync(path.join(PUBLISH_ROOT, 'servizi'))
    .filter((f) => f.endsWith('.html'))
    .sort()
    .map((f) => path.posix.join('servizi', f));
}

function tier1Pages() {
  return [...TIER1_INDEXABLE_GEO_PATHS].map((p) => p.replace(/^\//, '')).sort();
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&egrave;/gi, 'è')
    .replace(/&eacute;/gi, 'é')
    .replace(/&agrave;/gi, 'à')
    .replace(/&ograve;/gi, 'ò')
    .replace(/&ugrave;/gi, 'ù')
    .replace(/&igrave;/gi, 'ì')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : '';
}

function extractDescription(html) {
  const m = html.match(/<meta\s+content="([^"]*)"\s+name="description"/i)
    || html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? decodeEntities(m[1].trim()) : '';
}

/** Estrae il testo leggibile dal <main> (fallback: <body>), preservando i heading. */
function extractText(html) {
  let scope = html;
  const mainMatch = html.match(/<main[\s>][\s\S]*?<\/main>/i);
  if (mainMatch) scope = mainMatch[0];
  else {
    const bodyMatch = html.match(/<body[\s>][\s\S]*?<\/body>/i);
    if (bodyMatch) scope = bodyMatch[0];
  }

  let s = scope
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    // markup nascosto/di servizio
    .replace(/<[^>]*class="[^"]*sr-only[^"]*"[^>]*>[\s\S]*?<\/[a-z0-9]+>/gi, ' ');

  // heading → prefisso markdown per mantenere la struttura
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${t}\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${t}\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${t}\n`);
  s = s.replace(/<li[^>]*>/gi, '\n- ');
  s = s.replace(/<\/(p|div|section|article|ul|ol|tr)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');

  s = decodeEntities(s)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (s.length > MAX_CHARS_PER_PAGE) {
    s = s.slice(0, MAX_CHARS_PER_PAGE);
    s = s.slice(0, Math.max(s.lastIndexOf('\n'), s.lastIndexOf('. ') + 1)) + '\n[…contenuto completo sulla pagina…]';
  }
  return s;
}

function assertClaimSafe(value, sourceLabel) {
  const findings = findUnsupportedPublishedClaims(value);
  if (findings.length === 0) return;

  const details = findings
    .map((finding) => `${finding.id}: ${finding.excerpt.replace(/\s+/g, ' ').slice(0, 180)}`)
    .join(' | ');
  throw new Error(`⛔ Unsupported published claim in ${sourceLabel} — ${details}`);
}

function buildSection(relPath) {
  const fsPath = path.join(PUBLISH_ROOT, relPath);
  if (!fs.existsSync(fsPath)) {
    throw new Error(`⛔ Missing configured llms-full source page: ${relPath}`);
  }
  const html = fs.readFileSync(fsPath, 'utf8');
  const url = relPath === 'index.html' ? `${SITE_URL}/` : `${SITE_URL}/${relPath}`;
  const title = extractTitle(html);
  const description = extractDescription(html);
  const text = extractText(html);
  const section = [
    '----------------------------------------',
    `URL: ${url}`,
    title ? `TITOLO: ${title}` : '',
    description ? `DESCRIZIONE: ${description}` : '',
    '',
    text,
    ''
  ].filter((l) => l !== null).join('\n');
  assertClaimSafe(section, relPath);
  return section;
}

function main() {
  const llmsIndex = fs.readFileSync(path.join(PUBLISH_ROOT, 'llms.txt'), 'utf8');
  const headerAbstract = llmsIndex.split('\n').slice(0, 4).join('\n').trim();
  assertClaimSafe(headerAbstract, 'llms.txt header');

  const pages = [...CORE_PAGES, ...listServicePages(), ...tier1Pages()];
  if (new Set(pages).size !== pages.length) {
    throw new Error('⛔ Duplicate configured source page in llms-full export');
  }
  const sections = pages.map(buildSection);
  if (sections.length !== pages.length) {
    throw new Error(`⛔ llms-full section mismatch: expected ${pages.length}, built ${sections.length}`);
  }
  const blogDigest = buildBlogDigest();

  const out = [
    '# WebNovis — llms-full.txt',
    '# Export editoriale in testo semplice delle pagine principali di www.webnovis.com.',
    '# Formato sperimentale: non garantisce crawling, indicizzazione, ranking o citazioni.',
    '# Le pagine HTML canoniche restano la fonte da consultare e verificare.',
    `# Indice sintetico: ${SITE_URL}/llms.txt — Dati strutturati: ${SITE_URL}/webnovis-ai-data.json`,
    '# Generato automaticamente da scripts/generate-llms-full.js',
    '',
    headerAbstract,
    '',
    ...sections,
    ...(blogDigest ? ['', blogDigest] : [])
  ].join('\n');

  assertClaimSafe(out, 'llms-full.txt final export');
  fs.writeFileSync(path.join(PUBLISH_ROOT, 'llms-full.txt'), out, 'utf8');
  console.log(`✅ llms-full.txt generato: ${sections.length} pagine${blogDigest ? ' + digest blog' : ''}, ${(out.length / 1024).toFixed(0)} KB`);
}

main();
