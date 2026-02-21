/**
 * Audit footers across all HTML pages
 * Extracts footer HTML from each file and compares them
 * Run: node scripts/audit-footers.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function findHtmlFiles(dir, relPrefix) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
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
    ...findHtmlFiles(path.join(ROOT, 'blog'), 'blog/'),
];

const results = [];

for (const file of files) {
    const content = fs.readFileSync(file.path, 'utf8');
    const footerStart = content.indexOf('<footer');
    const footerEnd = content.indexOf('</footer>');
    
    if (footerStart === -1 || footerEnd === -1) {
        results.push({ rel: file.rel, hasFooter: false, footerLen: 0 });
        continue;
    }
    
    const footer = content.substring(footerStart, footerEnd + '</footer>'.length);
    
    // Check for key elements
    const hasSocial = footer.includes('instagram') || footer.includes('Instagram');
    const hasGeo = footer.includes('agenzia-web-lainate') || footer.includes('Web Agency Lainate');
    const hasAccessibilita = footer.includes('accessibilita') || footer.includes('Accessibilità');
    const hasTrustpilot = footer.includes('trustpilot');
    const hasDesignRush = footer.includes('designrush') || footer.includes('DesignRush');
    const hasGoogleReview = footer.includes('g.page/r/');
    const hasCome = footer.includes('come-lavoriamo');
    const hasPreventivo = footer.includes('preventivo');
    
    results.push({
        rel: file.rel,
        hasFooter: true,
        footerLen: footer.length,
        hasSocial,
        hasGeo,
        hasAccessibilita,
        hasTrustpilot,
        hasDesignRush,
        hasGoogleReview,
        hasCome,
        hasPreventivo
    });
}

// Print summary
console.log('\n=== FOOTER AUDIT ===\n');
console.log('File'.padEnd(55) + 'Len'.padEnd(7) + 'Geo'.padEnd(5) + 'Acc'.padEnd(5) + 'TP'.padEnd(5) + 'DR'.padEnd(5) + 'GR'.padEnd(5) + 'CL'.padEnd(5) + 'PV');
console.log('-'.repeat(100));

for (const r of results) {
    if (!r.hasFooter) {
        console.log(r.rel.padEnd(55) + 'NO FOOTER');
        continue;
    }
    const flag = (v) => v ? '✅' : '❌';
    console.log(
        r.rel.padEnd(55) +
        String(r.footerLen).padEnd(7) +
        flag(r.hasGeo).padEnd(5) +
        flag(r.hasAccessibilita).padEnd(5) +
        flag(r.hasTrustpilot).padEnd(5) +
        flag(r.hasDesignRush).padEnd(5) +
        flag(r.hasGoogleReview).padEnd(5) +
        flag(r.hasCome).padEnd(5) +
        flag(r.hasPreventivo)
    );
}

// Find the longest footer (most complete) as canonical reference
const withFooter = results.filter(r => r.hasFooter);
const canonical = withFooter.sort((a, b) => b.footerLen - a.footerLen)[0];
console.log('\n📌 Longest footer (likely canonical):', canonical.rel, '(' + canonical.footerLen + ' chars)');
