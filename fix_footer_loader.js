const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'docs']);

function walk(dir, files = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (EXCLUDED_DIRS.has(e.name)) continue;
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) walk(fp, files);
        else if (e.isFile() && e.name.endsWith('.html')) files.push(fp);
    }
    return files;
}

const htmlFiles = walk(ROOT);
let fixed = 0;

for (const filePath of htmlFiles) {
    let html = fs.readFileSync(filePath, 'utf8');
    const hasReviewWidgets = /trustpilot-widget|data-designrush-widget/i.test(html);
    if (!hasReviewWidgets) continue;
    if (/footer-widgets-loader\.js/i.test(html)) continue;

    // Determine relative path depth to pick right path
    const rel = path.relative(ROOT, filePath);
    const depth = rel.split(path.sep).length - 1;
    const prefix = depth === 1 ? '../' : './';
    const loaderTag = `<script src="${prefix}js/footer-widgets-loader.js" defer></script>`;

    if (!html.includes('</body>')) {
        console.log('NO </body> in', rel);
        continue;
    }

    html = html.replace('</body>', loaderTag + '</body>');
    fs.writeFileSync(filePath, html, 'utf8');
    fixed++;
    console.log('Fixed:', rel);
}

console.log('Total fixed:', fixed);
