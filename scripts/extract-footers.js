/**
 * Extract footer HTML from key reference files for comparison
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function extractFooter(relPath) {
    const full = path.join(ROOT, relPath);
    const content = fs.readFileSync(full, 'utf8');
    const start = content.indexOf('<footer');
    const end = content.indexOf('</footer>') + '</footer>'.length;
    return content.substring(start, end);
}

// Extract from key reference files
const refs = [
    'come-lavoriamo.html',
    'index.html',
    'agenzia-web-rho.html',
    'blog/seo-per-piccole-imprese.html',
    'servizi/accessibilita.html',
    'agenzia-web-lainate.html',
    'blog/sito-web-che-non-converte.html',
];

for (const ref of refs) {
    const footer = extractFooter(ref);
    fs.writeFileSync(path.join(ROOT, '__footer_' + ref.replace(/\//g, '_') + '.txt'), footer, 'utf8');
    console.log(ref + ': ' + footer.length + ' chars');
}
