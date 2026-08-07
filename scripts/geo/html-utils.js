/**
 * Small pure HTML / text helpers used across geo generators.
 */

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestCities(city, allCities, limit = 5) {
    return allCities
        .filter(c => c.slug !== city.slug)
        .map(c => ({
            ...c,
            distance: haversineKm(city.lat, city.lng, c.lat, c.lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
}

function stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(text) {
    return stripHtml(text).split(/\s+/).filter(w => w.length > 1).length;
}

function xmlEscape(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function truncateText(value, maxLength = 70) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength - 1).trimEnd() + '…';
}

function formatSectorList(sectors = []) {
    const cleaned = sectors.map((sector) => String(sector || '').trim()).filter(Boolean);
    if (cleaned.length === 0) return '';
    if (cleaned.length === 1) return cleaned[0];
    if (cleaned.length === 2) return `${cleaned[0]} e ${cleaned[1]}`;
    return `${cleaned[0]}, ${cleaned[1]} e ${cleaned[2]}`;
}

/**
 * Italian preposition "a" becomes "ad" before vowel-initial names
 * (e.g. Arese, Arluno, Origgio, Assago).
 */
function prepA(name) {
    return /^[aeiouàèéìòù]/i.test(String(name || '').trim()) ? 'ad' : 'a';
}

function toCity(name) {
    return `${prepA(name)} ${name}`;
}

function toCityCap(name) {
    return `${prepA(name) === 'ad' ? 'Ad' : 'A'} ${name}`;
}

module.exports = {
    stripHtml,
    countWords,
    xmlEscape,
    escapeRegex,
    escapeHtmlAttr,
    truncateText,
    formatSectorList,
    haversineKm,
    getNearestCities,
    prepA,
    toCity,
    toCityCap
};
