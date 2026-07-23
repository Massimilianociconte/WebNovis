/**
 * generate-sitemap.js — Dynamic sitemap generator for WebNovis
 * Usage: node generate-sitemap.js
 * Reads all HTML files, uses fs.statSync mtime for accurate lastmod.
 * No changefreq or priority (ignored by Google since 2023).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ROOT_DIR, getPublishDir } = require('./config/publish-targets');
const { shouldIncludeInSitemapPath } = require('./config/pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const ROOT = getPublishDir();
const OUTPUT = path.join(ROOT, 'sitemap.xml');

// Pages to EXCLUDE from sitemap
const EXCLUDE_PATTERNS = [
    /^docs\//,
    /^dist\//,
    /^templates\//,
    /^node_modules\//,
    /^\./,
    /^src\//,       // source HTML dir (src/html/*) — not published artefacts
    /^config\//,    // node-side config files, should never leak into sitemap
    /^tests\//,     // test fixtures
    /^scripts\//,   // build scripts
    /^blog\/auto-writer/,
    /^blog\/build-articles/,
    /agenzie-web-rho\.html$/,
    /^consulenza-digitale-[a-z0-9-]+\.html$/, // deprecated cluster (redirected 301 → /consulenze-*)
    /^portfolio\/(Aether-Digital|Ember-Oak|Lumina-Creative|Muse-Editorial|PopBlock-Studio|Structure-Arch)\.html$/i,
    /404\.html$/,
    /grazie\.html$/,
    /newsletter-template/,
];

// Static image entries paired to their pages (for image sitemap)
const PAGE_IMAGES = {
    '/': [{ loc: '/Img/webnovis-logo-bianco.png', title: 'Web Novis — Agenzia Web Milano Rho', caption: 'Logo Web Novis, agenzia web a Milano e Rho' }],
    '/portfolio/case-study/aether-digital.html': [{ loc: '/Img/portfolio/aether-digital-mockup-800.webp', title: 'Aether Digital — sito web custom by Web Novis', caption: 'Mockup sito web Aether Digital realizzato da Web Novis' }],
    '/portfolio/case-study/arconti31.html': [{ loc: '/Img/portfolio/arconti31-mockup-800.webp', title: 'Arconti31 — portfolio fotografico by Web Novis', caption: 'Mockup sito web Arconti31 realizzato da Web Novis' }],
    '/portfolio/case-study/ember-oak.html': [{ loc: '/Img/portfolio/ember-&-oak-mockup-800.webp', title: 'Ember & Oak — e-commerce by Web Novis', caption: 'Mockup sito e-commerce Ember & Oak realizzato da Web Novis' }],
    '/portfolio/case-study/fbtotalsecurity.html': [{ loc: '/Img/portfolio/fbtotalsecurity-mockup-800.webp', title: 'FB Total Security — sito web by Web Novis', caption: 'Mockup sito web FB Total Security realizzato da Web Novis' }],
    '/portfolio/case-study/lumina-creative.html': [{ loc: '/Img/portfolio/lumina-creative-mockup-800.webp', title: 'Lumina Creative — sito web by Web Novis', caption: 'Mockup sito web Lumina Creative realizzato da Web Novis' }],
    '/portfolio/case-study/mikuna.html': [{ loc: '/Img/portfolio/mikuna-mockup-800.webp', title: 'Mikuna Italia — sito web by Web Novis', caption: 'Mockup sito web Mikuna Italia realizzato da Web Novis' }],
    '/portfolio/case-study/mimmo-fratelli.html': [{ loc: '/Img/portfolio/mimmo-fratelli-mockup-800.webp', title: 'Mimmo Fratelli — sito web by Web Novis', caption: 'Mockup sito web Mimmo Fratelli realizzato da Web Novis' }],
    '/portfolio/case-study/muse-editorial.html': [{ loc: '/Img/portfolio/muse-editorial-mockup-800.webp', title: 'Muse Editorial — sito web by Web Novis', caption: 'Mockup sito web Muse Editorial realizzato da Web Novis' }],
    '/portfolio/case-study/popblock-studio.html': [{ loc: '/Img/portfolio/pop-block-mockup-800.webp', title: 'Popblock Studio — sito web by Web Novis', caption: 'Mockup sito web Popblock Studio realizzato da Web Novis' }],
    '/portfolio/case-study/quickseo.html': [{ loc: '/Img/portfolio/quick-seo-mockup-800.webp', title: 'QuickSEO — sito web by Web Novis', caption: 'Mockup sito web QuickSEO realizzato da Web Novis' }],
    '/portfolio/case-study/structure-arch.html': [{ loc: '/Img/portfolio/structure-architecture-mockup-800.webp', title: 'Structure Architecture — sito web by Web Novis', caption: 'Mockup sito web Structure Architecture realizzato da Web Novis' }],
};

// Collect all HTML files recursively
function collectHtmlFiles(dir, relBase = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
        const relPath = relBase ? `${relBase}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            if (!EXCLUDE_PATTERNS.some(p => p.test(relPath + '/'))) {
                results.push(...collectHtmlFiles(path.join(dir, entry.name), relPath));
            }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            if (!EXCLUDE_PATTERNS.some(p => p.test(relPath))) {
                results.push({ relPath, absPath: path.join(dir, entry.name) });
            }
        }
    }
    return results;
}

function toUrlPath(relPath) {
    const normalized = relPath.replace(/\\/g, '/');
    if (normalized === 'index.html') return '/';
    if (normalized.endsWith('/index.html')) {
        return '/' + normalized.replace(/index\.html$/, '');
    }
    return '/' + normalized;
}

function formatDate(mtime) {
    return mtime.toISOString().split('T')[0];
}

// Try to get the last git commit date for a file (more accurate than mtime)
function getGitDate(relPath) {
    const normalized = relPath.replace(/\\/g, '/');
    const candidates = [
        normalized,
        `src/html/${normalized}`
    ];
    for (const candidate of candidates) {
        try {
            const result = execFileSync(
                'git',
                ['log', '-1', '--format=%aI', '--', candidate],
                { cwd: ROOT_DIR, encoding: 'utf-8', timeout: 5000 }
            ).trim();
            if (result) return result.split('T')[0];
        } catch (e) { /* git not available or file not tracked */ }
    }
    return null;
}

function getDeterministicFallbackDate() {
    if (process.env.SOURCE_DATE_EPOCH && /^\d+$/.test(process.env.SOURCE_DATE_EPOCH)) {
        return new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString().slice(0, 10);
    }
    if (process.env.BUILD_DATE && /^\d{4}-\d{2}-\d{2}$/.test(process.env.BUILD_DATE)) {
        return process.env.BUILD_DATE;
    }
    try {
        const commitDate = execFileSync('git', ['log', '-1', '--format=%aI'], {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            timeout: 5000
        }).trim();
        if (commitDate) return commitDate.split('T')[0];
    } catch (_) { /* use stable fallback below */ }
    return '2026-02-27';
}

function xmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Read only the <head> robots directive — ignore body copy that mentions "noindex". */
function headHasNoindex(absPath) {
    try {
        const html = fs.readFileSync(absPath, 'utf8');
        const headEnd = html.search(/<\/head>/i);
        const head = headEnd >= 0 ? html.slice(0, headEnd) : html.slice(0, 8000);
        const robotsMatch =
            head.match(/name=["']robots["'][^>]*content=["']([^"']+)["']/i) ||
            head.match(/content=["']([^"']+)["'][^>]*name=["']robots["']/i);
        return robotsMatch ? /noindex/i.test(robotsMatch[1]) : false;
    } catch (_) {
        return false;
    }
}

const files = collectHtmlFiles(ROOT);
const entries = files.map(({ relPath, absPath }) => {
    const urlPath = toUrlPath(relPath);
    const loc = urlPath === '/' ? BASE_URL + '/' : BASE_URL + urlPath;
    const lastmod = getGitDate(relPath) || getDeterministicFallbackDate();
    const images = PAGE_IMAGES[urlPath] || [];
    return { urlPath, loc, lastmod, images, absPath };
}).filter((entry) => shouldIncludeInSitemapPath(entry.urlPath))
    .filter((entry) => !headHasNoindex(entry.absPath))
    .sort((a, b) => a.loc.localeCompare(b.loc));

// Build XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n`;

for (const entry of entries) {
    xml += `    <url>\n`;
    xml += `        <loc>${xmlEscape(entry.loc)}</loc>\n`;
    xml += `        <lastmod>${entry.lastmod}</lastmod>\n`;
    for (const img of entry.images) {
        xml += `        <image:image>\n`;
        xml += `            <image:loc>${xmlEscape(BASE_URL + img.loc)}</image:loc>\n`;
        xml += `            <image:title>${xmlEscape(img.title)}</image:title>\n`;
        xml += `            <image:caption>${xmlEscape(img.caption)}</image:caption>\n`;
        xml += `        </image:image>\n`;
    }
    xml += `    </url>\n`;
}

xml += `\n</urlset>\n`;

fs.writeFileSync(OUTPUT, xml, 'utf8');
console.log(`✅ sitemap.xml generated with ${entries.length} URLs → ${path.relative(ROOT_DIR, OUTPUT).replace(/\\/g, '/')}`);
entries.forEach(e => console.log(`   ${e.lastmod}  ${e.loc}`));
