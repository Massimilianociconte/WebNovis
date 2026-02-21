const fs = require('fs');
const path = require('path');

function walkDir(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (['node_modules', '.git', 'scripts'].includes(e.name)) continue;
            walkDir(full, files);
        } else if (e.isFile() && e.name.endsWith('.html') && e.name !== 'newsletter-template.html') {
            files.push(full);
        }
    }
    return files;
}

const root = 'C:/Users/Massi/Documents/Webnovis_kiro - backup';
const allFiles = walkDir(root);
let updated = 0;

for (const f of allFiles) {
    let c = fs.readFileSync(f, 'utf8');
    const newC = c
        .replace(/style\.min\.css\?v=1\.5/g, 'style.min.css?v=1.6')
        .replace(/style\.min\.css\?v=1\.4/g, 'style.min.css?v=1.6')
        .replace(/style\.min\.css\?v=1\.3/g, 'style.min.css?v=1.6');
    if (newC !== c) {
        fs.writeFileSync(f, newC, 'utf8');
        updated++;
        console.log('Updated:', f.replace(root + '/', ''));
    }
}
console.log(`\nTotal files updated: ${updated}`);
