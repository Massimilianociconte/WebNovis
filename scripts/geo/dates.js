/**
 * Editorial date tokens, fingerprint store, and page date resolution.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
    PAGE_DATES_FILE,
    PAGE_DATE_ISO_TOKEN,
    PAGE_DATE_HUMAN_TOKEN,
    TODAY,
    TODAY_FORMATTED,
    DRY_RUN,
    VALIDATE_ONLY
} = require('./config');

function loadPageDates() {
    try {
        const raw = JSON.parse(fs.readFileSync(PAGE_DATES_FILE, 'utf8'));
        return (raw && typeof raw.pages === 'object' && raw.pages) ? raw : { version: 1, pages: {} };
    } catch (_) {
        return { version: 1, pages: {} };
    }
}

const pageDates = loadPageDates();
let pageDatesDirty = false;

function formatItalianDate(iso) {
    const parsed = new Date(`${iso}T12:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return TODAY_FORMATTED;
    return new Intl.DateTimeFormat('it-IT', {
        timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric'
    }).format(parsed);
}

/**
 * Restituisce la data di ultima modifica *editoriale* della pagina.
 * L'impronta è calcolata sull'HTML con i segnaposto ancora dentro, quindi è
 * indipendente dalla data per costruzione: due build identiche a distanza di
 * mesi producono la stessa impronta e quindi la stessa data.
 */
function resolveEditorialDate(publicPath, htmlWithTokens) {
    const fingerprint = crypto.createHash('sha256').update(htmlWithTokens).digest('hex').slice(0, 32);
    const previous = pageDates.pages[publicPath];
    if (previous && previous.fingerprint === fingerprint && previous.dateModified) {
        return previous.dateModified;
    }
    pageDates.pages[publicPath] = { fingerprint, dateModified: TODAY };
    pageDatesDirty = true;
    return TODAY;
}

function savePageDates() {
    if (!pageDatesDirty || DRY_RUN || VALIDATE_ONLY) return;
    const sorted = Object.keys(pageDates.pages).sort().reduce((acc, key) => {
        acc[key] = pageDates.pages[key];
        return acc;
    }, {});
    fs.mkdirSync(path.dirname(PAGE_DATES_FILE), { recursive: true });
    fs.writeFileSync(
        PAGE_DATES_FILE,
        `${JSON.stringify({ version: 1, pages: sorted }, null, 2)}\n`,
        'utf8'
    );
}

/** Sostituisce i segnaposto data con la data editoriale risolta per quella pagina. */
function applyEditorialDate(publicPath, html) {
    const source = String(html || '');
    if (!source.includes(PAGE_DATE_ISO_TOKEN) && !source.includes(PAGE_DATE_HUMAN_TOKEN)) {
        return source;
    }
    const iso = resolveEditorialDate(publicPath, source);
    return source
        .split(PAGE_DATE_ISO_TOKEN).join(iso)
        .split(PAGE_DATE_HUMAN_TOKEN).join(formatItalianDate(iso));
}

function isPageDatesDirty() {
    return pageDatesDirty;
}

function getPageDates() {
    return pageDates;
}

module.exports = {
    pageDates,
    loadPageDates,
    formatItalianDate,
    resolveEditorialDate,
    savePageDates,
    applyEditorialDate,
    isPageDatesDirty,
    getPageDates
};
