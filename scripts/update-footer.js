/**
 * WebNovis — Footer Updater (build step)
 * 
 * Idempotent script that replaces the "Località" footer column with
 * "Zone Servite" links pointing to the hub pages.
 * 
 * Must run AFTER generate-all-geo.js (needs hub pages to exist).
 * Recursively scans ALL .html files in the project (root, blog, servizi,
 * portfolio, hub dirs, etc.).
 * 
 * Usage: node scripts/update-footer.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Configuration ────────────────────────────────────────────────────────────

// New footer column content — uses DIRECT <a> tags (NO <ul>/<li>)
// to match the existing footer-column structure used in all other columns.
// This preserves the CSS grid layout.
const NEW_FOOTER_COLUMN = `<div class="footer-column"> <strong class="footer-heading" role="heading" aria-level="3">Zone Servite</strong> <a href="/zone-servite/" title="Zone Servite WebNovis">Tutte le Zone</a> <a href="/agenzia-web/" title="Web Agency — Comuni Milano">Agenzia Web — Comuni</a> <a href="/realizzazione-siti-web/" title="Siti Web — Comuni Milano">Realizzazione Siti Web</a> <a href="/agenzia-web-rho.html" title="Web Agency Rho">Web Agency Rho</a> <a href="/agenzia-web-milano.html" title="Web Agency Milano">Web Agency Milano</a> </div>`;

// ─── Footer Column Detection ──────────────────────────────────────────────────

// Robust pattern that matches BOTH formats:
// 1. Original "Località" column: <div class="footer-column"> <strong...>Località</strong> <a>...</a> ... </div>
// 2. Previously updated "Zone Servite" with <ul>/<li>: <div class="footer-column"> <strong...>Zone Servite</strong> <ul>... </ul> </div>
// 3. Previously updated "Zone Servite" with direct <a> tags
//
// Strategy: look for the <div class="footer-column"> that contains
// "Località" or "Zone Servite" as heading, and capture everything up to
// the closing </div> for that column.
function findAndReplaceFooterColumn(html) {
    // This regex matches a footer-column div containing "Località" or "Zone Servite"
    // It captures: <div class="footer-column"> ... heading ... all links ... </div>
    // The key insight: the column ends at the NEXT </div> that is followed by either
    // another <div class="footer-column"> or a </div> (closing footer-grid)
    const pattern = /<div class="footer-column">\s*<strong class="footer-heading"[^>]*>(?:Località|Zone Servite)<\/strong>[\s\S]*?<\/div>(?=\s*<div class="footer-column">|\s*<\/div>\s*<div class="footer-badges|<\/div>\s*<\/div>)/;

    const match = html.match(pattern);
    if (!match) return null;

    // Check if already identical (idempotent)
    const matchedContent = match[0];
    if (matchedContent === NEW_FOOTER_COLUMN) return html; // Already up to date

    return html.replace(matchedContent, NEW_FOOTER_COLUMN);
}

// ─── File Discovery ───────────────────────────────────────────────────────────

function findAllHtmlFiles(rootDir) {
    const files = [];

    // Directories to EXCLUDE (node_modules, .git, deployment artifacts, etc.)
    const excludeDirs = new Set([
        'node_modules', '.git', '.github', '.gemini', '.agent',
        'scripts', 'css', 'js', 'Img', 'fonts'
    ]);

    function walk(dir) {
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (err) {
            return; // Skip unreadable directories
        }

        for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (!excludeDirs.has(entry.name)) {
                    walk(fullPath);
                }
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }

    walk(rootDir);
    return files;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — Footer Updater (Hub Pages Integration)');
    console.log('══════════════════════════════════════════════════════\n');

    const htmlFiles = findAllHtmlFiles(ROOT);
    console.log(`  Found ${htmlFiles.length} HTML files\n`);

    let updated = 0;
    let skipped = 0;
    let noMatch = 0;

    for (const filePath of htmlFiles) {
        const html = fs.readFileSync(filePath, 'utf8');
        const result = findAndReplaceFooterColumn(html);

        if (result === null) {
            // No footer column found — skip
            noMatch++;
            continue;
        }

        if (result === html) {
            // Already up to date (idempotent)
            skipped++;
            continue;
        }

        if (!DRY_RUN) {
            fs.writeFileSync(filePath, result, 'utf8');
        }
        const relPath = path.relative(ROOT, filePath);
        console.log(`  ✅ ${relPath}`);
        updated++;
    }

    console.log('\n══════════════════════════════════════════════════════');
    console.log(`  Updated: ${updated} | Already current: ${skipped} | No footer column: ${noMatch}`);
    if (DRY_RUN) console.log('  🔍 DRY RUN — no files written');
    console.log('══════════════════════════════════════════════════════');
}

main();
