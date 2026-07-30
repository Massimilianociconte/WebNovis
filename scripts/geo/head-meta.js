/**
 * Head meta rewriting and hand-crafted Rho page normalization.
 */
const path = require('path');
const { removeSchemaReviewProperties } = require('../seo-aggregate-rating');
const {
    readApprovedContentBlock,
    stripUnapprovedTier1EditorialBlocks
} = require('../../config/content-claim-governance');
const {
    ROOT,
    SINGLETON_LOCAL_BUSINESS_ID,
    buildRobotsContent
} = require('./config');
const { escapeRegex, escapeHtmlAttr } = require('./html-utils');
const { buildFaqPageSchema, rebuildVisibleFaqItems } = require('./faq');

function stripJsonLdFromHead(headHtml) {
    return headHtml
        .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
        .replace(/\n{3,}/g, '\n\n');
}

function normalizeHandCraftedTailWhitespace(html) {
    return html.replace(
        /(<script defer src="[^"]*js\/noncritical-loader\.min\.js(?:\?[^"]*)?"><\/script>)\s*(?=<script type="speculationrules">)/i,
        '$1'
    );
}

function normalizeHandCraftedAgenziaPage(html, resolvedFaqs) {
    let faqSchemaWritten = false;
    // Older generator runs could leave a Tier 1 override embedded in this
    // hand-crafted page. Carry it forward only when its source JSON passes the
    // same provenance gate used by all generated GEO pages.
    const tier1Path = path.join(ROOT, 'data', 'content-blocks', 'tier1-rho-agenzia-web.json');
    const approvedBlockKeys = readApprovedContentBlock(tier1Path) ? ['rho-agenzia-web'] : [];
    let normalized = stripUnapprovedTier1EditorialBlocks(html, { approvedBlockKeys }).replace(
        /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/gi,
        (fullMatch, json) => {
            try {
                const schema = JSON.parse(json);
                const types = Array.isArray(schema['@type']) ? schema['@type'] : [schema['@type']];

                if (types.includes('LocalBusiness') || types.includes('Review')) return '';

                if (schema['@type'] === 'FAQPage' || types.includes('FAQPage')) {
                    if (faqSchemaWritten || resolvedFaqs.length === 0) return '';
                    faqSchemaWritten = true;
                    return `<script type="application/ld+json">${JSON.stringify(buildFaqPageSchema(resolvedFaqs))}</script>`;
                }

                removeSchemaReviewProperties(schema);
                if (schema['@type'] === 'WebPage') {
                    delete schema.speakable;
                    schema.about = { '@id': SINGLETON_LOCAL_BUSINESS_ID };
                }
                if (schema['@type'] === 'Service') {
                    schema.provider = { '@id': SINGLETON_LOCAL_BUSINESS_ID };
                }

                return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
            } catch {
                return fullMatch;
            }
        }
    );

    if (resolvedFaqs.length > 0 && !faqSchemaWritten) {
        const faqSchema = `<script type="application/ld+json">${JSON.stringify(buildFaqPageSchema(resolvedFaqs))}</script>`;
        normalized = normalized.replace(/<\/head>/i, `${faqSchema}</head>`);
    }

    return normalizeHandCraftedTailWhitespace(rebuildVisibleFaqItems(normalized, resolvedFaqs));
}

function replaceMetaTagContent(html, attrName, attrValue, content) {
    const escapedAttrValue = escapeRegex(attrValue);
    const escapedContent = escapeHtmlAttr(content);
    let updated = html.replace(
        new RegExp(`(<meta\\b[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*\\bcontent=")[^"]*("[^>]*>)`, 'i'),
        `$1${escapedContent}$2`
    );

    if (updated !== html) return updated;

    updated = html.replace(
        new RegExp(`(<meta\\b[^>]*\\bcontent=")[^"]*("[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*>)`, 'i'),
        `$1${escapedContent}$2`
    );

    return updated;
}

function replaceLinkHref(html, attrName, attrValue, href) {
    const escapedAttrValue = escapeRegex(attrValue);
    let updated = html.replace(
        new RegExp(`(<link\\b[^>]*\\b${attrName}=(["'])${escapedAttrValue}\\2[^>]*\\bhref=(["']))[^"']*(\\3[^>]*>)`, 'i'),
        `$1${href}$4`
    );

    if (updated !== html) return updated;

    updated = html.replace(
        new RegExp(`(<link\\b[^>]*\\bhref=(["']))[^"']*(\\2[^>]*\\b${attrName}=(["'])${escapedAttrValue}\\4[^>]*>)`, 'i'),
        `$1${href}$3`
    );

    return updated;
}

function ensureSelfHreflang(headHtml, canonical) {
    const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${canonical}">`;
    const withoutExisting = headHtml.replace(/\s*<link\b[^>]*\bhreflang=["']it-IT["'][^>]*>/gi, '');

    if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(withoutExisting)) {
        return withoutExisting.replace(/(<link\b[^>]*rel=["']canonical["'][^>]*>)/i, `$1 ${hreflangTag}`);
    }

    return withoutExisting.replace(/<\/head>/i, `${hreflangTag}</head>`);
}

function updateDerivedHeadMeta(headHtml, meta, options = {}) {
    const { stripJsonLd = true } = options;
    let updated = (stripJsonLd ? stripJsonLdFromHead(headHtml) : headHtml)
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);

    updated = replaceMetaTagContent(updated, 'name', 'description', meta.description);
    updated = replaceMetaTagContent(updated, 'property', 'og:url', meta.canonical);
    updated = replaceMetaTagContent(updated, 'property', 'og:title', meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'property', 'og:description', meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'name', 'twitter:title', meta.twitterTitle || meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'property', 'twitter:title', meta.twitterTitle || meta.ogTitle || meta.title);
    updated = replaceMetaTagContent(updated, 'name', 'twitter:description', meta.twitterDescription || meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'property', 'twitter:description', meta.twitterDescription || meta.ogDescription || meta.description);
    updated = replaceMetaTagContent(updated, 'name', 'robots', meta.robots || buildRobotsContent(new URL(meta.canonical).pathname));
    updated = replaceLinkHref(updated, 'rel', 'canonical', meta.canonical);
    updated = ensureSelfHreflang(updated, meta.canonical);

    if (meta.keywords) {
        updated = replaceMetaTagContent(updated, 'name', 'keywords', meta.keywords);
    }

    return updated;
}

module.exports = {
    stripJsonLdFromHead,
    normalizeHandCraftedTailWhitespace,
    normalizeHandCraftedAgenziaPage,
    replaceMetaTagContent,
    replaceLinkHref,
    ensureSelfHreflang,
    updateDerivedHeadMeta
};
