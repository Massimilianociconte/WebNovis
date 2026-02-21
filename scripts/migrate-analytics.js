/**
 * Migrate all HTML pages to GDPR-strict analytics pattern.
 * Replaces the old GA4+Clarity+MetaPixel blocks in <head> with a minimal stub.
 * Scripts now load ONLY after cookie consent via enableAnalyticsTracking() in main.js.
 * 
 * Run: node scripts/migrate-analytics.js
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

const NEW_STUB = `    <!-- Analytics — GDPR-strict: scripts load ONLY after cookie consent (see js/main.js) -->
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;window.__gaConfigured=false;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});</script>`;

// Pattern variations found across pages:
// 1. index.html style: "<!-- Google Analytics 4 — Replace G-BPMBY6RTKP ..."
// 2. Other pages: "<!-- Google Analytics 4 -->" or "<!-- Google tag (gtag.js) -->"
// All end with the Meta Pixel closing </script> followed by a try/catch block

function findAndReplaceAnalytics(html) {
    // Strategy: find the start marker (GA4 script tag) and end marker (Meta Pixel closing)
    // and replace everything between them with the new stub.
    
    // Find the start: either a comment or the direct script tag for gtag
    const startPatterns = [
        /[ \t]*<!-- (?:Google Analytics 4|Google tag \(gtag\.js\))[^\n]*\n/,
        /[ \t]*<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js/
    ];
    
    let startIdx = -1;
    for (const pat of startPatterns) {
        const m = html.match(pat);
        if (m) {
            startIdx = m.index;
            break;
        }
    }
    if (startIdx === -1) return null;
    
    // Find the end: the closing </script> after fbq('track', 'PageView')
    const endPattern = /fbq\('track',\s*'PageView'\);\s*\}\s*\}\s*catch\s*\(e\)\s*\{\}\s*<\/script>/;
    const endMatch = html.match(endPattern);
    if (!endMatch) return null;
    
    const endIdx = endMatch.index + endMatch[0].length;
    
    // Replace the entire block
    return html.substring(0, startIdx) + NEW_STUB + html.substring(endIdx);
}

function walkDir(dir, ext) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['.git', 'node_modules', 'scripts'].includes(entry.name)) continue;
            results.push(...walkDir(fullPath, ext));
        } else if (entry.name.endsWith(ext)) {
            results.push(fullPath);
        }
    }
    return results;
}

const htmlFiles = walkDir(PROJECT_ROOT, '.html');
let updated = 0;
let skipped = 0;
let alreadyDone = 0;

for (const file of htmlFiles) {
    const relPath = path.relative(PROJECT_ROOT, file);
    
    // Skip newsletter template
    if (relPath.includes('newsletter-template')) {
        console.log(`SKIP ${relPath} (template)`);
        skipped++;
        continue;
    }
    
    const html = fs.readFileSync(file, 'utf8');
    
    // Check if already migrated
    if (html.includes('GDPR-strict: scripts load ONLY after cookie consent')) {
        console.log(`OK   ${relPath} (already migrated)`);
        alreadyDone++;
        continue;
    }
    
    // Check if has old pattern
    if (!html.includes('googletagmanager.com/gtag/js')) {
        console.log(`SKIP ${relPath} (no analytics)`);
        skipped++;
        continue;
    }
    
    const result = findAndReplaceAnalytics(html);
    if (result) {
        fs.writeFileSync(file, result, 'utf8');
        console.log(`✓    ${relPath}`);
        updated++;
    } else {
        console.log(`WARN ${relPath} (pattern not matched — check manually)`);
    }
}

console.log(`\nDone: ${updated} updated, ${alreadyDone} already done, ${skipped} skipped`);
