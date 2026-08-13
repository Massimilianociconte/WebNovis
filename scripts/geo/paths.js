/**
 * Publish paths, base-page cache, HTML finalization and write helpers.
 */
const fs = require('fs');
const path = require('path');
const { applySeoHtmlTransforms } = require('../../config/seo-html-transforms');
const { normalizeEntityJsonLd } = require('../../config/entity-facts');
const { normalizeReviewActionMarkup } = require('../../config/site-footer');
const { preserveGovernedCustomBlocks } = require('../../config/content-claim-governance');
const {
    BASE_PAGE_DIR,
    SITE,
    ROOT,
    PUBLISH_DIR,
    isIndexableGeoPath,
    isGeoPath,
    isDeAmplifiedPath
} = require('./config');
const { applyEditorialDate } = require('./dates');
const {
    resolvePublishPath,
    getGeneratedRootPrefix,
    toPublicPath
} = require('./paths-core');

// Cache for base HTML pages (read once, reuse for all cities)
const _basePageCache = {};
function getBasePage(filename) {
    if (!_basePageCache[filename]) {
        const p = path.join(BASE_PAGE_DIR, filename);
        if (!fs.existsSync(p)) return null;
        _basePageCache[filename] = fs.readFileSync(p, 'utf8');
    }
    return _basePageCache[filename];
}

function preserveCustomBlocks(targetPath, nextHtml) {
    if (!nextHtml || !fs.existsSync(targetPath)) return nextHtml;
    return preserveGovernedCustomBlocks(fs.readFileSync(targetPath, 'utf8'), nextHtml);
}

function normalizeGeneratedRuntimeScripts(html, relativePath) {
    const prefix = getGeneratedRootPrefix(relativePath);
    const runtimePath = (filename) => `${prefix}js/${filename}`;
    let updated = html
        .replace(
            /<script\b[^>]*src="[^"]*?js\/web-vitals-reporter(?:\.min)?\.js"[^>]*><\/script>/gi,
            `<script defer src="${runtimePath('web-vitals-reporter.min.js')}"></script>`
        )
        .replace(
            /<script\b[^>]*src="[^"]*?js\/footer-widgets-loader(?:\.min)?\.js"[^>]*><\/script>/gi,
            `<script defer src="${runtimePath('footer-widgets-loader.min.js')}"></script>`
        );

    // I pattern devono accettare il cache-busting `?v=...`: senza, il tag
    // versionato ereditato dalla base page non veniva rimosso e finiva
    // affiancato a quello reinserito qui (due loader sulla stessa pagina).
    const nonCriticalPattern = /<script\b[^>]*src="[^"]*?js\/noncritical-loader(?:\.min)?\.js(?:\?[^"]*)?"[^>]*><\/script>/gi;
    const mainPattern = /<script\b[^>]*src="[^"]*?js\/main\.min\.js(?:\?[^"]*)?"[^>]*><\/script>/i;
    const existingVersion = (/src="[^"]*js\/noncritical-loader(?:\.min)?\.js(\?[^"]*)"/i.exec(updated) || [])[1] || '';
    const nonCriticalTag = `<script defer src="${runtimePath('noncritical-loader.min.js')}${existingVersion}"></script>`;
    updated = updated.replace(nonCriticalPattern, '');
    if (mainPattern.test(updated)) {
        updated = updated.replace(mainPattern, (match) => `${match} ${nonCriticalTag}`);
    } else {
        updated = updated.replace(/<\/body>/i, `${nonCriticalTag} </body>`);
    }
    return updated;
}

function resolveInternalPathname(rawHref, sourcePath) {
    try {
        const resolved = new URL(String(rawHref || '').replace(/&amp;/g, '&'), new URL(sourcePath, SITE));
        if (!['webnovis.com', 'www.webnovis.com'].includes(resolved.hostname)) return null;
        return resolved.pathname;
    } catch (_) {
        return null;
    }
}

function removeDeamplifiedGeoAnchors(html, relativePath) {
    const sourcePath = toPublicPath(relativePath);
    if (!isIndexableGeoPath(sourcePath)) return html;

    return String(html || '').replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (anchor) => {
        const hrefMatch = anchor.match(/\bhref=(['"])(.*?)\1/i);
        if (!hrefMatch) return anchor;
        const targetPath = resolveInternalPathname(hrefMatch[2], sourcePath);
        if (!targetPath || !isGeoPath(targetPath) || isIndexableGeoPath(targetPath)) return anchor;
        return anchor.replace(/^<a\b[^>]*>/i, '').replace(/<\/a>$/i, '');
    });
}

function finalizePublishedHtml(relativePath, html) {
    const targetPath = resolvePublishPath(relativePath);
    const preserved = preserveCustomBlocks(targetPath, html).replace(/^\uFEFF/, '');
    const normalizedPath = String(relativePath).replace(/\\/g, '/');
    const transformed = applySeoHtmlTransforms(preserved, normalizedPath);
    const entitySafe = normalizeEntityJsonLd(normalizeReviewActionMarkup(transformed));
    const crawlSafe = removeDeamplifiedGeoAnchors(entitySafe, normalizedPath);
    return normalizeGeneratedRuntimeScripts(crawlSafe, normalizedPath);
}

function writePublishedFile(relativePath, html) {
    const publicPath = toPublicPath(relativePath);
    if (isDeAmplifiedPath(publicPath) && path.resolve(PUBLISH_DIR) !== path.resolve(ROOT)) {
        return;
    }
    const targetPath = resolvePublishPath(relativePath);
    const resolved = applyEditorialDate(publicPath, html);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, resolved, 'utf8');
}

module.exports = {
    getBasePage,
    preserveCustomBlocks,
    resolvePublishPath,
    getGeneratedRootPrefix,
    toPublicPath,
    resolveInternalPathname,
    removeDeamplifiedGeoAnchors,
    normalizeGeneratedRuntimeScripts,
    finalizePublishedHtml,
    writePublishedFile
};
