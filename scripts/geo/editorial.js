/**
 * Hand-written per-city editorial SEO/body helpers.
 */
const { getGeoEditorialRecord } = require('../../config/geo-editorial');
const { toCity } = require('./html-utils');

function escapeEditorialHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Prefer the hand-written metadata when a city has an editorial record. */
function applyEditorialSeoOverrides(seo, editorial) {
    if (!editorial) return seo;
    return {
        ...seo,
        title: editorial.title || seo.title,
        description: editorial.description || seo.description,
        ogTitle: editorial.title || seo.ogTitle,
        ogDescription: editorial.description || seo.ogDescription,
        heroH1: editorial.h1 || seo.heroH1,
        heroCapsule: editorial.answer_capsule || seo.heroCapsule
    };
}

/**
 * Replace the first shared "why you need a website" block with the copy written
 * for that specific comune.
 *
 * The territorial pages were built by swapping the city name inside one base
 * page, which is why they overlapped by more than half. Swapping in the
 * hand-written intro and its three sections is what actually makes the page
 * about that place instead of about the template.
 */
function applyEditorialBody(page, editorial) {
    if (!editorial) return page;

    const sections = Array.isArray(editorial.sections) ? editorial.sections : [];
    const body = sections
        .map((section) => `<h3>${escapeEditorialHtml(section.heading)}</h3> <p>${escapeEditorialHtml(section.body)}</p>`)
        .join(' ');
    const closing = editorial.cta
        ? ` <p class="editorial-close"><strong>${escapeEditorialHtml(editorial.cta)}</strong></p>`
        : '';

    const block = '<section class="service-detail" id="contesto-locale">'
        + '<div class="container">'
        + `<h2>${escapeEditorialHtml(`${editorial.service} ${toCity(editorial.city)}: il contesto locale`)}</h2> `
        + `<p>${escapeEditorialHtml(editorial.intro)}</p> ${body}${closing}`
        + '</div></section>';

    const firstSection = page.match(/<section class="service-detail"[\s\S]*?<\/section>/);
    if (!firstSection) return page;
    return page.replace(firstSection[0], block);
}

module.exports = {
    getGeoEditorialRecord,
    escapeEditorialHtml,
    applyEditorialSeoOverrides,
    applyEditorialBody
};
