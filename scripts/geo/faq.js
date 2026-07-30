/**
 * FAQ resolution, rendering, and FAQPage schema helpers.
 */
const { stripHtml } = require('./html-utils');

function resolvePageFaqs(city, pageType, aiBlock) {
    const aiFaqs = pageType === 'agenzia'
        ? aiBlock?.faqsAgenzia
        : aiBlock?.faqsRealizzazione;
    const minimumAiFaqs = pageType === 'agenzia' ? 3 : 1;

    if (Array.isArray(aiFaqs) && aiFaqs.length >= minimumAiFaqs) {
        return aiFaqs;
    }

    return (city.faqs && city.faqs[pageType]) || [];
}

function extractVisibleFaqs(html) {
    const faqs = [];
    const itemPattern = /<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi;

    for (const match of html.matchAll(itemPattern)) {
        const question = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
        const answer = match[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
        if (question == null || answer == null) continue;
        faqs.push({ q: stripHtml(question), a: answer.trim() });
    }

    return faqs;
}

function resolveHandCraftedFaqs(html, fallbackFaqs = []) {
    const visibleFaqs = extractVisibleFaqs(html);
    return visibleFaqs.length > 0 ? visibleFaqs : fallbackFaqs;
}

function renderFaqItems(faqs) {
    return faqs.map((faq) =>
        `<details class="faq-item"><summary>${faq.q}</summary><p>${faq.a}</p></details>`
    ).join('');
}

function renderFaqSection(title, faqs) {
    if (!Array.isArray(faqs) || faqs.length === 0) return '';

    return `<section class="service-detail"><div class="container"><h2>${title}</h2>${renderFaqItems(faqs)}</div></section>`;
}

function rebuildVisibleFaqItems(html, resolvedFaqs) {
    const itemPattern = /<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>[\s\S]*?<\/details>/gi;
    const matches = [...html.matchAll(itemPattern)];
    if (matches.length === 0 || resolvedFaqs.length === 0) return html;

    const first = matches[0];
    const last = matches[matches.length - 1];
    const start = first.index;
    const end = last.index + last[0].length;
    return html.slice(0, start) + renderFaqItems(resolvedFaqs) + html.slice(end);
}

function buildFaqPageSchema(resolvedFaqs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: resolvedFaqs.map((faq) => ({
            '@type': 'Question',
            name: stripHtml(faq.q),
            acceptedAnswer: {
                '@type': 'Answer',
                text: stripHtml(faq.a)
            }
        }))
    };
}

module.exports = {
    resolvePageFaqs,
    extractVisibleFaqs,
    resolveHandCraftedFaqs,
    renderFaqItems,
    renderFaqSection,
    rebuildVisibleFaqItems,
    buildFaqPageSchema
};
