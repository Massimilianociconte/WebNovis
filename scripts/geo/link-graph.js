/**
 * Internal link graph and geo-links HTML section builders.
 */
const fs = require('fs');
const {
    TODAY,
    getIndexableGeoPaths,
    isIndexableGeoPath
} = require('./config');
const { cities } = require('./data');
const { getNearestCities } = require('./html-utils');
const { resolvePublishPath, resolveInternalPathname } = require('./paths');

function buildGeoLinksSection(city, pageType) {
    const prefix = pageType === 'agenzia' ? 'agenzia-web-' : 'realizzazione-siti-web-';
    const label = pageType === 'agenzia' ? 'Agenzia Web' : 'Realizzazione Siti Web';
    const genKey = pageType === 'agenzia' ? 'agenzia' : 'realizzazione';
    const approvedCities = cities.filter((candidate) =>
        candidate.generate[genKey]
        && isIndexableGeoPath(`/${prefix}${candidate.slug}.html`)
    );
    const validNearest = getNearestCities(city, approvedCities, 3);
    if (validNearest.length === 0) return '';

    let html = `\n<section class="service-detail" style="background:rgba(255,255,255,.01)"><div class="container">`;
    html += `<h2>Serviamo anche i comuni vicini a ${city.name}</h2>`;
    html += `<p>Scopri i nostri servizi nelle città vicine: `;
    const links = validNearest.map(nc =>
        `<a href="/${prefix}${nc.slug}.html" style="color:var(--primary-light)">${label} a ${nc.name}</a> (${nc.distanzaSede})`
    );
    html += links.join(', ') + '.</p>';
    html += `</div></section>\n`;
    return html;
}

function buildLocalContextHtml(city) {
    const ctx = city.localContext || {};
    let html = '';
    if (ctx.tessutoEconomico) {
        html += `<p>Con ${city.population ? '<strong>' + city.population.toLocaleString('it-IT') + ' abitanti</strong> e ' : ''}`;
        html += `una posizione strategica nell'hinterland milanese, ${city.name} offre un mercato interessante per le PMI. `;
        html += ctx.tessutoEconomico + '</p>';
    }
    if (ctx.opportunitaDigitale) {
        html += `<p>${ctx.opportunitaDigitale}</p>`;
    }
    if (ctx.settoriChiave && ctx.settoriChiave.length > 0) {
        html += `<p>I settori chiave del territorio includono: <strong>${ctx.settoriChiave.join('</strong>, <strong>')}</strong>.</p>`;
    }
    return html;
}

function generateLinkGraph() {
    const graph = { generated: TODAY, pages: [] };
    for (const publicPath of getIndexableGeoPaths()) {
        const filePath = resolvePublishPath(publicPath.replace(/^\//, ''));
        if (!fs.existsSync(filePath)) {
            throw new Error(`Cannot build rendered GEO link graph: missing ${filePath}`);
        }

        const html = fs.readFileSync(filePath, 'utf8');
        const linksTo = [];
        for (const match of html.matchAll(/<a\b[^>]*\bhref=(['"])(.*?)\1/gi)) {
            const targetPath = resolveInternalPathname(match[2], publicPath);
            if (!targetPath || targetPath === publicPath || !isIndexableGeoPath(targetPath)) continue;
            if (!linksTo.includes(targetPath)) linksTo.push(targetPath);
        }

        const city = cities.find((candidate) => publicPath.endsWith(`-${candidate.slug}.html`));
        const serviceSlug = city
            ? publicPath.slice(1, -(`-${city.slug}.html`.length))
            : '';
        graph.pages.push({
            url: publicPath,
            type: serviceSlug === 'agenzia-web'
                ? 'agenzia'
                : serviceSlug === 'realizzazione-siti-web'
                    ? 'realizzazione'
                    : 'servizio',
            city: city ? city.name : '',
            ...(serviceSlug && !['agenzia-web', 'realizzazione-siti-web'].includes(serviceSlug)
                ? { service: serviceSlug }
                : {}),
            linksTo
        });
    }

    return graph;
}

module.exports = {
    buildGeoLinksSection,
    buildLocalContextHtml,
    generateLinkGraph
};
