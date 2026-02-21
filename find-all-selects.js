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
const results = [];

for (const f of allFiles) {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('<select')) {
        // Find all occurrences
        let pos = 0;
        while ((pos = c.indexOf('<select', pos)) !== -1) {
            const snippet = c.substring(pos, pos + 80);
            const rel = f.replace(root + '/', '');
            results.push(`${rel}: ${snippet}`);
            pos++;
        }
    }
}

fs.writeFileSync('selects-found.txt', results.join('\n'), 'utf8');
console.log('Found', results.length, 'native selects. Check selects-found.txt');
