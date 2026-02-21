const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function getAllHtmlFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // skip node_modules, .git
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            getAllHtmlFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'newsletter-template.html') {
            files.push(fullPath);
        }
    }
    return files;
}

const htmlFiles = getAllHtmlFiles(ROOT);
let updated = 0;

for (const filePath of htmlFiles) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine relative prefix based on depth
    const rel = path.relative(ROOT, filePath);
    const depth = rel.split(path.sep).length - 1;
    const prefix = depth === 0 ? '' : '../'.repeat(depth);

    // Replace nav-cta href pointing to contatti.html with preventivo.html
    // Handles both relative paths: "contatti.html" and "../contatti.html" etc.
    const before = content;

    // Pattern: href="[../]contatti.html" class="nav-link nav-cta"
    content = content.replace(
        /href="(?:\.\.\/)*contatti\.html"(\s+class="nav-link nav-cta")/g,
        'href="' + prefix + 'preventivo.html"$1'
    );
    // Also handle reversed attribute order: class="nav-link nav-cta" href="contatti.html"
    content = content.replace(
        /(class="nav-link nav-cta"\s+)href="(?:\.\.\/)*contatti\.html"/g,
        '$1href="' + prefix + 'preventivo.html"'
    );

    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + rel);
        updated++;
    }
}

console.log('\nDone. Updated ' + updated + ' files.');
