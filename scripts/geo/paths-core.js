/**
 * Publish path resolution (split from paths.js to avoid circular requires with data.js).
 */
const path = require('path');
const { PUBLISH_DIR } = require('./config');

function resolvePublishPath(...segments) {
    return path.join(PUBLISH_DIR, ...segments);
}

function getGeneratedRootPrefix(relativePath) {
    const depth = String(relativePath).replace(/\\/g, '/').split('/').length - 1;
    return depth <= 0 ? '' : `${Array(depth).fill('..').join('/')}/`;
}

function toPublicPath(relativePath) {
    const normalized = String(relativePath || '').replace(/\\/g, '/').replace(/^\.?\//, '');
    return `/${normalized}`.replace(/\/index\.html$/, '/');
}

module.exports = {
    resolvePublishPath,
    getGeneratedRootPrefix,
    toPublicPath
};
