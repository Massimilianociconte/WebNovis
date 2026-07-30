/**
 * Fail-closed page validation for generated GEO HTML.
 */
const { findUnsupportedPublishedClaims } = require('../../config/content-claim-governance');
const { countWords } = require('./html-utils');

function validatePage(html, filename) {
    const issues = [];
    const wordCount = countWords(html);

    // Word count check (target: ≥500 unique words)
    if (wordCount < 300) {
        issues.push(`⛔ CRITICAL: Only ${wordCount} words (minimum 300, target ≥500)`);
    } else if (wordCount < 500) {
        issues.push(`⚠ WARNING: ${wordCount} words (target ≥500)`);
    }

    // Internal links check (target: ≥5)
    const internalLinks = (html.match(/href="[^"]*\.html"/g) || []).length;
    if (internalLinks < 5) {
        issues.push(`⚠ WARNING: Only ${internalLinks} internal links (target ≥5)`);
    }

    // Schema check
    const schemaCount = (html.match(/application\/ld\+json/g) || []).length;
    if (schemaCount < 3) {
        issues.push(`⚠ WARNING: Only ${schemaCount} JSON-LD schemas (target ≥3)`);
    }

    // Canonical check
    if (!html.includes('rel="canonical"')) {
        issues.push('⛔ CRITICAL: Missing canonical tag');
    }

    // H1 check
    if (!/<h1[^>]*>/.test(html)) {
        issues.push('⛔ CRITICAL: Missing <h1> tag');
    }

    // Answer capsule check
    if (!html.includes('answer-capsule')) {
        issues.push('⚠ WARNING: Missing answer-capsule class (GEO optimization)');
    }

    for (const finding of findUnsupportedPublishedClaims(html)) {
        issues.push(`⛔ UNSUPPORTED CLAIM [${finding.id}]: ${finding.excerpt.slice(0, 180)}`);
    }

    return { filename, wordCount, internalLinks, schemaCount, issues };
}

module.exports = {
    validatePage
};
