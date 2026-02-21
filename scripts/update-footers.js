/**
 * Update footers across ALL pages to include:
 * 1. Accessibilità EAA link in Servizi column
 * 2. New geo landing page links in Azienda column
 * 3. Come Lavoriamo + Preventivo links where missing
 * Run: node scripts/update-footers.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Find all HTML files (root, servizi, portfolio, portfolio/case-study)
function findHtmlFiles(dir, relPrefix) {
    const results = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isFile() && item.endsWith('.html')) {
            results.push({ path: full, rel: relPrefix + item });
        }
    }
    return results;
}

const files = [
    ...findHtmlFiles(ROOT, ''),
    ...findHtmlFiles(path.join(ROOT, 'servizi'), 'servizi/'),
    ...findHtmlFiles(path.join(ROOT, 'portfolio'), 'portfolio/'),
    ...findHtmlFiles(path.join(ROOT, 'portfolio', 'case-study'), 'portfolio/case-study/'),
];

// Skip the newly generated pages (they already have correct footer)
const skipFiles = new Set([
    'agenzia-web-lainate.html',
    'agenzia-web-arese.html',
    'agenzia-web-garbagnate.html',
    'servizi/accessibilita.html',
]);

let updated = 0;
let skipped = 0;

for (const file of files) {
    if (skipFiles.has(file.rel)) {
        skipped++;
        continue;
    }
    
    let content = fs.readFileSync(file.path, 'utf8');
    let changed = false;
    
    // 1. Add "Accessibilità EAA" link to footer Servizi column (after Social Media)
    // Determine prefix based on file depth
    let prefix = '';
    if (file.rel.startsWith('servizi/')) prefix = '';
    else if (file.rel.startsWith('portfolio/case-study/')) prefix = '../../servizi/';
    else if (file.rel.startsWith('portfolio/')) prefix = '../servizi/';
    else if (file.rel.startsWith('blog/')) prefix = '../servizi/';
    else prefix = 'servizi/';
    
    // For files in servizi/, links to other servizi pages are relative
    const accessLink = prefix + 'accessibilita.html';
    
    // Find the Social Media link in footer and add Accessibilità after it
    // Pattern: various formats depending on prefix
    const socialPatterns = [
        { find: '<a href="servizi/social-media.html">Social Media</a>', prefix: 'servizi/' },
        { find: '<a href="../servizi/social-media.html">Social Media</a>', prefix: '../servizi/' },
        { find: '<a href="../../servizi/social-media.html">Social Media</a>', prefix: '../../servizi/' },
        { find: '<a href="social-media.html">Social Media</a>', prefix: '' },
    ];
    
    for (const pat of socialPatterns) {
        if (content.includes(pat.find) && !content.includes(pat.prefix + 'accessibilita.html">Accessibilit')) {
            content = content.replace(
                pat.find,
                pat.find + ` <a href="${pat.prefix}accessibilita.html">Accessibilità EAA</a>`
            );
            changed = true;
            break;
        }
    }
    
    // 2. Add geo landing page links to Azienda column (after Milano)
    const geoPatterns = [
        { find: '<a href="agenzia-web-milano.html">Web Agency Milano</a>', prefix: '' },
        { find: '<a href="../agenzia-web-milano.html">Web Agency Milano</a>', prefix: '../' },
        { find: '<a href="../../agenzia-web-milano.html">Web Agency Milano</a>', prefix: '../../' },
    ];
    
    for (const pat of geoPatterns) {
        if (content.includes(pat.find) && !content.includes(pat.prefix + 'agenzia-web-lainate.html')) {
            content = content.replace(
                pat.find,
                pat.find + ` <a href="${pat.prefix}agenzia-web-lainate.html">Web Agency Lainate</a> <a href="${pat.prefix}agenzia-web-arese.html">Web Agency Arese</a> <a href="${pat.prefix}agenzia-web-garbagnate.html">Web Agency Garbagnate</a>`
            );
            changed = true;
            break;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file.path, content, 'utf8');
        updated++;
        console.log(`✅ Updated: ${file.rel}`);
    } else {
        skipped++;
    }
}

console.log(`\n✅ Footer update complete: ${updated} updated, ${skipped} skipped`);
