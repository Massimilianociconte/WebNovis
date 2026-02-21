/**
 * Build Search Index — WebNovis
 * Scans all HTML pages and generates a search-index.json for client-side Fuse.js search.
 * Run: node build-search-index.js
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = __dirname;
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'search-index.json');

const STATIC_PAGES = [
  { file: 'index.html', type: 'page', url: '/' },
  { file: 'chi-siamo.html', type: 'page', url: '/chi-siamo.html' },
  { file: 'contatti.html', type: 'page', url: '/contatti.html' },
  { file: 'portfolio.html', type: 'page', url: '/portfolio.html' },
  { file: 'servizi/sviluppo-web.html', type: 'servizio', url: '/servizi/sviluppo-web.html' },
  { file: 'servizi/graphic-design.html', type: 'servizio', url: '/servizi/graphic-design.html' },
  { file: 'servizi/social-media.html', type: 'servizio', url: '/servizi/social-media.html' },
];

function stripHTML(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function extractFromHTML(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s*[—|–]\s*WebNovis.*$/i, '').trim() : '';

  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
    || html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
  const description = descMatch ? descMatch[1] : '';

  const kwMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']+)["']/i);
  const keywords = kwMatch ? kwMatch[1] : '';

  // Extract headings
  const headings = [];
  const hMatches = html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi);
  for (const m of hMatches) headings.push(stripHTML(m[1]).substring(0, 120));

  // Extract clean body text for content snippet
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');
  const contentSnippet = stripHTML(body).substring(0, 600);

  return { title, description, keywords, headings: headings.slice(0, 12), contentSnippet };
}

function buildIndex() {
  const index = [];

  // Static pages
  for (const page of STATIC_PAGES) {
    const filePath = path.join(PROJECT_ROOT, page.file);
    if (!fs.existsSync(filePath)) { console.warn(`  ⚠ Skipping ${page.file} (not found)`); continue; }
    const html = fs.readFileSync(filePath, 'utf-8');
    const ex = extractFromHTML(html);
    index.push({ id: page.url, type: page.type, url: page.url, title: ex.title, description: ex.description, keywords: ex.keywords, headings: ex.headings, content: ex.contentSnippet });
  }

  // Blog articles
  const blogDir = path.join(PROJECT_ROOT, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    for (const file of blogFiles) {
      const filePath = path.join(blogDir, file);
      const html = fs.readFileSync(filePath, 'utf-8');
      const ex = extractFromHTML(html);
      const tagMatch = html.match(/<span[^>]*class="[^"]*tag[^"]*"[^>]*>([^<]+)<\/span>/i);
      const tag = tagMatch ? tagMatch[1].trim() : '';
      index.push({ id: `/blog/${file}`, type: 'articolo', url: `/blog/${file}`, title: ex.title, description: ex.description, keywords: ex.keywords, headings: ex.headings, content: ex.contentSnippet, tag });
    }
  }

  // Portfolio
  const portfolioDir = path.join(PROJECT_ROOT, 'portfolio');
  if (fs.existsSync(portfolioDir)) {
    const portfolioFiles = fs.readdirSync(portfolioDir).filter(f => f.endsWith('.html'));
    for (const file of portfolioFiles) {
      const filePath = path.join(portfolioDir, file);
      const html = fs.readFileSync(filePath, 'utf-8');
      const ex = extractFromHTML(html);
      index.push({ id: `/portfolio/${file}`, type: 'portfolio', url: `/portfolio/${file}`, title: ex.title, description: ex.description, keywords: ex.keywords, headings: ex.headings, content: ex.contentSnippet });
    }
  }

  return index;
}

const index = buildIndex();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf-8');
console.log(`✅ Search index built: ${index.length} pages indexed → search-index.json`);
