/**
 * add-skip-to-content.js — Injects a skip-to-content link for accessibility (F2-10)
 * 
 * Adds <a href="#main" class="skip-link">Vai al contenuto</a> as first child of <body>
 * and the corresponding CSS (visually hidden until focused).
 * 
 * Usage: node scripts/add-skip-to-content.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('path');

const ROOT = path.resolve(__dirname, '..');

// Skip-link HTML + inline CSS (injected once per page)
const SKIP_LINK = '<a href="#main" class="skip-link" style="position:absolute;top:-100%;left:0;z-index:100000;padding:.8rem 1.5rem;background:#7B8CC9;color:#fff;font-size:.9rem;text-decoration:none;border-radius:0 0 8px 0;transition:top .2s">Vai al contenuto</a><style>.skip-link:focus{top:0}</style>';

// Find all HTML files (excluding node_modules, blog auto-generated)
function getHtmlFiles(dir) {
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', '.git', 'docs', 'test-SEO'].includes(entry.name)) continue;
            results.push(...getHtmlFiles(fullPath));
        } else if (entry.name.endsWith('.html') && !entry.name.startsWith('_')) {
            results.push(fullPath);
        }
    }
    return results;
}

const files = getHtmlFiles(ROOT);
let modified = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Skip if already has skip-link
    if (content.includes('skip-link')) continue;
    
    // Insert after <body> or <body ...>
    const bodyMatch = content.match(/<body[^>]*>/i);
    if (!bodyMatch) continue;
    
    const insertPos = content.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    content = content.slice(0, insertPos) + ' ' + SKIP_LINK + ' ' + content.slice(insertPos);
    
    fs.writeFileSync(file, content, 'utf-8');
    modified++;
}

console.log(`Added skip-to-content link to ${modified} HTML files`);
