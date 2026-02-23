/**
 * CSS Stability Fix Script
 * Fixes: Google Fonts render-blocking, missing <noscript> fallbacks,
 * CSS version mismatches, missing preconnect hints.
 * 
 * Usage: node scripts/fix-css-stability.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Target CSS versions (latest across the site)
const CSS_VERSIONS = {
    'style.min.css': '1.7',
    'revolution.min.css': '1.5',
    'search.min.css': '2.1',
    'leviathan-inspired.min.css': '1.3',
    'social-feed-modern.min.css': '1.4',
    'weby-mobile-fix.min.css': '1.3',
    'nicole-inspired.min.css': '1.3',
    'portfolio-premium.min.css': '1.3',
    'come-lavoriamo.min.css': '1.0',
};

// Collect all HTML files
function getAllHtmlFiles(dir, prefix = '') {
    const results = [];
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const rel = prefix ? prefix + '/' + entry : entry;
        if (fs.statSync(full).isDirectory() && !entry.startsWith('.') && entry !== 'node_modules' && entry !== 'docs' && entry !== 'portfolio' && entry !== 'test-SEO') {
            results.push(...getAllHtmlFiles(full, rel));
        } else if (entry.endsWith('.html') && entry !== 'newsletter-template.html') {
            results.push(rel);
        }
    }
    return results;
}

let totalFixed = 0;
let totalFiles = 0;

const files = getAllHtmlFiles(ROOT);
console.log(`\n[CSS Stability Fix] Processing ${files.length} HTML files${DRY_RUN ? ' (DRY RUN)' : ''}...\n`);

for (const relPath of files) {
    const filePath = path.join(ROOT, relPath);
    let html = fs.readFileSync(filePath, 'utf8');
    const original = html;
    const changes = [];

    // ── FIX 1: Normalize CSS version numbers ──
    for (const [cssFile, targetVersion] of Object.entries(CSS_VERSIONS)) {
        // Match both css/ and ../css/ paths, with any version
        const versionPattern = new RegExp(
            `((?:\\.\\.\/)?(?:\\/)?css\\/${cssFile.replace('.', '\\.')}\\?v=)[\\d.]+`,
            'g'
        );
        const newHtml = html.replace(versionPattern, `$1${targetVersion}`);
        if (newHtml !== html) {
            changes.push(`  ✓ Normalized ${cssFile} → v${targetVersion}`);
            html = newHtml;
        }
    }

    // ── FIX 2: Make Google Fonts async (media="print" onload pattern) ──
    // Protect <noscript> blocks from modification (they SHOULD have blocking links)
    const noscriptBlocks = [];
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (match) => {
        noscriptBlocks.push(match);
        return `<!--NOSCRIPT_PLACEHOLDER_${noscriptBlocks.length - 1}-->`;
    });

    // Pattern for href first, rel second (without media="print")
    let fontsFixed = false;
    html = html.replace(
        /<link\s+href=["'](https:\/\/fonts\.googleapis\.com\/css2\?[^"']+)["']\s+rel=["']stylesheet["']\s*>/gi,
        (match, url) => {
            if (/media=["']print["']/i.test(match)) return match;
            fontsFixed = true;
            return `<link href="${url}" rel="stylesheet" media="print" onload='this.media="all"'>`;
        }
    );
    // Pattern for rel first, href second
    html = html.replace(
        /<link\s+rel=["']stylesheet["']\s+href=["'](https:\/\/fonts\.googleapis\.com\/css2\?[^"']+)["']\s*>/gi,
        (match, url) => {
            if (/media=["']print["']/i.test(match)) return match;
            fontsFixed = true;
            return `<link rel="stylesheet" href="${url}" media="print" onload='this.media="all"'>`;
        }
    );

    // Restore <noscript> blocks
    noscriptBlocks.forEach((block, i) => {
        html = html.replace(`<!--NOSCRIPT_PLACEHOLDER_${i}-->`, block);
    });

    if (fontsFixed) {
        changes.push('  ✓ Google Fonts → async (media="print" onload)');
    }

    // ── FIX 3: Add <noscript> fallback for async CSS ──
    // Only add if not already present
    if (!/<noscript>\s*<link[^>]*rel=["']stylesheet["']/i.test(html)) {
        // Collect all async CSS hrefs (media="print" onload pattern)
        const asyncLinks = [];
        const asyncPattern = /<link\s+[^>]*href=["']([^"']+)["'][^>]*media=["']print["'][^>]*onload[^>]*>/gi;
        let m;
        while ((m = asyncPattern.exec(html)) !== null) {
            asyncLinks.push(m[1]);
        }
        // Also check reversed attribute order
        const asyncPattern2 = /<link\s+[^>]*media=["']print["'][^>]*href=["']([^"']+)["'][^>]*onload[^>]*>/gi;
        while ((m = asyncPattern2.exec(html)) !== null) {
            if (!asyncLinks.includes(m[1])) asyncLinks.push(m[1]);
        }

        if (asyncLinks.length > 0) {
            const noscriptBlock = '\n<noscript>' +
                asyncLinks.map(href => `<link rel="stylesheet" href="${href.replace(/\?v=[^"'&]+/, '')}">`).join('') +
                '</noscript>';

            // Insert right before </head>
            if (html.includes('</head>')) {
                html = html.replace('</head>', noscriptBlock + '\n</head>');
                changes.push(`  ✓ Added <noscript> fallback (${asyncLinks.length} async CSS files)`);
            }
        }
    }

    // ── FIX 4: Ensure preconnect for Google Fonts exists ──
    if (/fonts\.googleapis\.com\/css2/i.test(html)) {
        // Check for preconnect to fonts.googleapis.com
        if (!/rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.googleapis\.com["']/i.test(html) &&
            !/href=["']https:\/\/fonts\.googleapis\.com["'][^>]*rel=["']preconnect["']/i.test(html)) {
            // Add preconnect before the first stylesheet link
            const preconnectBlock = '<link href="https://fonts.googleapis.com" rel="preconnect">\n<link href="https://fonts.gstatic.com" rel="preconnect" crossorigin>\n';
            // Insert before first <link...stylesheet
            const firstStylesheet = html.indexOf('rel="stylesheet"');
            const firstLink = html.lastIndexOf('<link', firstStylesheet);
            if (firstLink > -1) {
                html = html.slice(0, firstLink) + preconnectBlock + html.slice(firstLink);
                changes.push('  ✓ Added preconnect for Google Fonts');
            }
        }
    }

    // ── FIX 5: Ensure preload hint for style.min.css exists on city/agency pages ──
    // (not needed if style.min.css is already render-blocking, which it is)

    // Write changes
    if (html !== original) {
        if (!DRY_RUN) {
            fs.writeFileSync(filePath, html, 'utf8');
        }
        console.log(`${DRY_RUN ? '[DRY] ' : ''}${relPath}:`);
        changes.forEach(c => console.log(c));
        totalFixed++;
    }
    totalFiles++;
}

console.log(`\n[DONE] ${totalFixed}/${totalFiles} files ${DRY_RUN ? 'would be ' : ''}updated.\n`);
