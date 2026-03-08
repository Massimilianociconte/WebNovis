/**
 * WebNovis — Page Quality Validator (pSEO Anti-Thin Content Layer)
 *
 * Validates ALL HTML pages against quality thresholds:
 *   - Word count (target ≥500 unique words)
 *   - Internal links (target ≥5 per page)
 *   - JSON-LD schema presence (target ≥2 per page)
 *   - Canonical tag
 *   - H1 tag
 *   - Answer capsule (GEO optimization)
 *   - Meta description
 *   - Content differentiation between sibling pages
 *
 * Usage:
 *   node scripts/validate-pages.js                    Validate all geo pages
 *   node scripts/validate-pages.js --all              Validate ALL HTML pages
 *   node scripts/validate-pages.js --type=agenzia     Validate only agenzia pages
 *   node scripts/validate-pages.js --verbose          Show detailed output
 *   node scripts/validate-pages.js --strict           Fail on warnings too
 */

const fs = require('fs');
const path = require('path');
const { ROOT_DIR, getPublishDir } = require('../config/publish-targets');

const ROOT = getPublishDir();
const args = process.argv.slice(2);
const VALIDATE_ALL = args.includes('--all');
const VERBOSE = args.includes('--verbose');
const STRICT = args.includes('--strict');
const typeArg = args.find(a => a.startsWith('--type='));
const FILTER_TYPE = typeArg ? typeArg.split('=')[1] : null;

// ─── Quality Thresholds ───────────────────────────────────────────────────────
const THRESHOLDS = {
    minWords: 500,
    criticalMinWords: 300,
    minInternalLinks: 5,
    minSchemas: 2,
    maxSimilarity: 0.85,
    minMetaDescLength: 50,
    maxMetaDescLength: 160
};

// ─── Utility Functions ────────────────────────────────────────────────────────

function stripHtml(html) {
    return (html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function countUniqueWords(text) {
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    return new Set(words).size;
}

function countTotalWords(text) {
    return text.split(/\s+/).filter(w => w.length > 1).length;
}

function extractMetaDesc(html) {
    const match = html.match(/<meta\s+content="([^"]*?)"\s+name="description"/i)
        || html.match(/<meta\s+name="description"\s+content="([^"]*?)"/i);
    return match ? match[1] : '';
}

function extractTitle(html) {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match ? match[1].trim() : '';
}

function extractH1(html) {
    const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    return match ? stripHtml(match[1]).trim() : '';
}

function countInternalLinks(html) {
    const links = html.match(/href="[^"]*\.html"/g) || [];
    return links.length;
}

function countSchemas(html) {
    return (html.match(/application\/ld\+json/g) || []).length;
}

function hasCanonical(html) {
    return /rel="canonical"/.test(html);
}

function hasAnswerCapsule(html) {
    return html.includes('answer-capsule');
}

function hasSpeakable(html) {
    return html.includes('SpeakableSpecification');
}

// Simple text similarity using Jaccard index on word trigrams
function textSimilarity(text1, text2) {
    const trigrams = (text) => {
        const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const tris = new Set();
        for (let i = 0; i < words.length - 2; i++) {
            tris.add(words.slice(i, i + 3).join(' '));
        }
        return tris;
    };
    const a = trigrams(text1);
    const b = trigrams(text2);
    if (a.size === 0 || b.size === 0) return 0;
    let intersection = 0;
    for (const t of a) { if (b.has(t)) intersection++; }
    return intersection / (a.size + b.size - intersection);
}

// ─── File Discovery ───────────────────────────────────────────────────────────

function findGeoPages() {
    const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
    const geoPages = [];

    // Load service slugs for servizio×città detection
    let serviceSlugs = [];
    try {
        const svcData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'services.json'), 'utf8'));
        serviceSlugs = svcData.services.map(s => s.slug);
    } catch (e) { /* services.json not available */ }

    for (const f of files) {
        if (f.startsWith('agenzia-web-') && (!FILTER_TYPE || FILTER_TYPE === 'agenzia')) {
            geoPages.push({ file: f, type: 'agenzia', city: f.replace('agenzia-web-', '').replace('.html', '') });
        }
        if (f.startsWith('realizzazione-siti-web-') && (!FILTER_TYPE || FILTER_TYPE === 'realizzazione')) {
            geoPages.push({ file: f, type: 'realizzazione', city: f.replace('realizzazione-siti-web-', '').replace('.html', '') });
        }
        // Service×city pages (e.g. seo-locale-lainate.html)
        if (!FILTER_TYPE || FILTER_TYPE === 'servizio') {
            for (const slug of serviceSlugs) {
                if (f.startsWith(slug + '-') && !f.startsWith('agenzia-') && !f.startsWith('realizzazione-')) {
                    geoPages.push({ file: f, type: 'servizio', city: f.replace(slug + '-', '').replace('.html', '') });
                    break;
                }
            }
        }
    }

    return geoPages;
}

function findAllPages() {
    const results = [];
    const scanDirs = ['.', 'blog', 'servizi', 'portfolio', 'portfolio/case-study', 'agenzia-web', 'realizzazione-siti-web', 'zone-servite'];

    for (const dir of scanDirs) {
        const fullDir = path.join(ROOT, dir);
        if (!fs.existsSync(fullDir)) continue;
        const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));
        for (const f of files) {
            if (f === '404.html' || f === 'grazie.html' || f === 'newsletter-template.html') continue;
            results.push({ file: path.join(dir, f).replace(/\\/g, '/'), type: 'page', city: '' });
        }
    }

    return results;
}

// ─── Validation Engine ────────────────────────────────────────────────────────

function validatePage(filePath) {
    const html = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
    const bodyText = stripHtml(html);
    const totalWords = countTotalWords(bodyText);
    const uniqueWords = countUniqueWords(bodyText);
    const internalLinks = countInternalLinks(html);
    const schemaCount = countSchemas(html);
    const metaDesc = extractMetaDesc(html);
    const title = extractTitle(html);
    const h1 = extractH1(html);

    const issues = [];
    let criticalCount = 0;
    let warningCount = 0;

    // Word count
    if (uniqueWords < THRESHOLDS.criticalMinWords) {
        issues.push({ level: 'CRITICAL', msg: `Only ${uniqueWords} unique words (minimum ${THRESHOLDS.criticalMinWords})` });
        criticalCount++;
    } else if (uniqueWords < THRESHOLDS.minWords) {
        issues.push({ level: 'WARNING', msg: `${uniqueWords} unique words (target ≥${THRESHOLDS.minWords})` });
        warningCount++;
    }

    // Internal links
    if (internalLinks < THRESHOLDS.minInternalLinks) {
        issues.push({ level: 'WARNING', msg: `Only ${internalLinks} internal links (target ≥${THRESHOLDS.minInternalLinks})` });
        warningCount++;
    }

    // Schema
    if (schemaCount < THRESHOLDS.minSchemas) {
        issues.push({ level: 'WARNING', msg: `Only ${schemaCount} JSON-LD schemas (target ≥${THRESHOLDS.minSchemas})` });
        warningCount++;
    }

    // Canonical
    if (!hasCanonical(html)) {
        issues.push({ level: 'CRITICAL', msg: 'Missing canonical tag' });
        criticalCount++;
    }

    // H1
    if (!h1) {
        issues.push({ level: 'CRITICAL', msg: 'Missing <h1> tag' });
        criticalCount++;
    }

    // Title
    if (!title) {
        issues.push({ level: 'CRITICAL', msg: 'Missing <title> tag' });
        criticalCount++;
    }

    // Meta description
    if (!metaDesc) {
        issues.push({ level: 'WARNING', msg: 'Missing meta description' });
        warningCount++;
    } else if (metaDesc.length < THRESHOLDS.minMetaDescLength) {
        issues.push({ level: 'WARNING', msg: `Meta description too short (${metaDesc.length} chars, target ≥${THRESHOLDS.minMetaDescLength})` });
        warningCount++;
    } else if (metaDesc.length > THRESHOLDS.maxMetaDescLength) {
        issues.push({ level: 'WARNING', msg: `Meta description too long (${metaDesc.length} chars, target ≤${THRESHOLDS.maxMetaDescLength})` });
        warningCount++;
    }

    // Answer capsule (GEO)
    if (!hasAnswerCapsule(html)) {
        issues.push({ level: 'INFO', msg: 'Missing answer-capsule class (GEO optimization)' });
    }

    // Speakable
    if (!hasSpeakable(html)) {
        issues.push({ level: 'INFO', msg: 'Missing SpeakableSpecification (GEO optimization)' });
    }

    return {
        file: filePath,
        title: title.slice(0, 60),
        h1: h1.slice(0, 60),
        totalWords,
        uniqueWords,
        internalLinks,
        schemaCount,
        metaDescLength: metaDesc.length,
        hasCanonical: hasCanonical(html),
        hasAnswerCapsule: hasAnswerCapsule(html),
        hasSpeakable: hasSpeakable(html),
        issues,
        criticalCount,
        warningCount,
        bodyText // Keep for similarity checks
    };
}

// ─── Similarity Check ─────────────────────────────────────────────────────────

function checkSimilarity(results) {
    const pairs = [];
    const geoResults = results.filter(r => r.file.startsWith('agenzia-web-') || r.file.startsWith('realizzazione-siti-web-'));

    // Group by type
    const groups = {};
    for (const r of geoResults) {
        const type = r.file.startsWith('agenzia-web-') ? 'agenzia' : 'realizzazione';
        if (!groups[type]) groups[type] = [];
        groups[type].push(r);
    }

    for (const [type, pages] of Object.entries(groups)) {
        for (let i = 0; i < pages.length; i++) {
            for (let j = i + 1; j < pages.length; j++) {
                const sim = textSimilarity(pages[i].bodyText, pages[j].bodyText);
                if (sim > THRESHOLDS.maxSimilarity) {
                    pairs.push({
                        page1: pages[i].file,
                        page2: pages[j].file,
                        similarity: (sim * 100).toFixed(1) + '%',
                        level: sim > 0.95 ? 'CRITICAL' : 'WARNING'
                    });
                }
            }
        }
    }

    return pairs;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — Page Quality Validator (pSEO)');
    console.log('══════════════════════════════════════════════════════\n');
    console.log(`Publish dir: ${path.relative(ROOT_DIR, ROOT).replace(/\\/g, '/') || '.'}\n`);

    const pages = VALIDATE_ALL ? findAllPages() : findGeoPages();
    console.log(`Validating ${pages.length} pages...\n`);

    const results = [];
    let totalCritical = 0;
    let totalWarning = 0;
    let totalPass = 0;

    for (const page of pages) {
        try {
            const result = validatePage(page.file);
            results.push(result);

            const status = result.criticalCount > 0 ? '❌' :
                result.warningCount > 0 ? '⚠' : '✅';

            if (VERBOSE || result.criticalCount > 0 || result.warningCount > 0) {
                console.log(`${status} ${result.file}`);
                console.log(`   Words: ${result.uniqueWords}/${result.totalWords} unique | Links: ${result.internalLinks} | Schemas: ${result.schemaCount}`);
                for (const issue of result.issues) {
                    if (issue.level === 'INFO' && !VERBOSE) continue;
                    const icon = issue.level === 'CRITICAL' ? '⛔' : issue.level === 'WARNING' ? '⚠' : 'ℹ';
                    console.log(`   ${icon} ${issue.msg}`);
                }
                console.log('');
            } else if (!VERBOSE) {
                process.stdout.write(`${status} `);
            }

            totalCritical += result.criticalCount;
            totalWarning += result.warningCount;
            if (result.criticalCount === 0 && result.warningCount === 0) totalPass++;
        } catch (e) {
            console.error(`❌ Error validating ${page.file}: ${e.message}`);
            totalCritical++;
        }
    }

    if (!VERBOSE) console.log('\n');

    // Similarity check for geo pages
    console.log('─── Content Similarity Check ───');
    const similarPairs = checkSimilarity(results);
    if (similarPairs.length === 0) {
        console.log('✅ No excessive similarity detected between sibling pages.\n');
    } else {
        for (const pair of similarPairs) {
            const icon = pair.level === 'CRITICAL' ? '⛔' : '⚠';
            console.log(`${icon} ${pair.similarity} similar: ${pair.page1} ↔ ${pair.page2}`);
        }
        console.log('');
    }

    // Summary
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Pages validated: ${pages.length}`);
    console.log(`  ✅ Passed: ${totalPass}`);
    console.log(`  ⚠ Warnings: ${totalWarning}`);
    console.log(`  ⛔ Critical: ${totalCritical}`);
    console.log(`  Similarity issues: ${similarPairs.length}`);
    console.log('══════════════════════════════════════════════════════');

    // Stats table for geo pages
    const geoResults = results.filter(r =>
        r.file.startsWith('agenzia-web-') || r.file.startsWith('realizzazione-siti-web-'));
    if (geoResults.length > 0) {
        const avgWords = Math.round(geoResults.reduce((s, r) => s + r.uniqueWords, 0) / geoResults.length);
        const avgLinks = Math.round(geoResults.reduce((s, r) => s + r.internalLinks, 0) / geoResults.length);
        const avgSchemas = Math.round(geoResults.reduce((s, r) => s + r.schemaCount, 0) / geoResults.length);
        console.log(`\n  Geo pages stats (${geoResults.length} pages):`);
        console.log(`  Avg unique words: ${avgWords} | Avg links: ${avgLinks} | Avg schemas: ${avgSchemas}`);
    }

    // Exit code
    if (totalCritical > 0) {
        console.log('\n⛔ VALIDATION FAILED — critical issues found.');
        process.exitCode = 1;
    } else if (STRICT && totalWarning > 0) {
        console.log('\n⚠ VALIDATION FAILED (strict mode) — warnings found.');
        process.exitCode = 1;
    } else {
        console.log('\n✅ VALIDATION PASSED.');
    }
}

main();
