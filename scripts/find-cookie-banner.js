const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Look for any cookie-related content
const cookieTerms = ['cookie', 'Cookie', 'COOKIE', 'banner', 'accept', 'reject'];
let found = false;

for (const term of cookieTerms) {
    const idx = indexContent.indexOf(term);
    if (idx !== -1) {
        console.log(`Found "${term}" at position ${idx}`);
        // Show context
        const start = Math.max(0, idx - 50);
        const end = Math.min(indexContent.length, idx + 150);
        console.log('Context:', indexContent.substring(start, end).replace(/\n/g, ' '));
        console.log('');
        found = true;
    }
}

if (!found) {
    console.log('No cookie-related content found in index.html');
}

// Also check main.js for cookie banner creation
const mainJsPath = path.join(__dirname, '../js/main.js');
if (fs.existsSync(mainJsPath)) {
    const mainJs = fs.readFileSync(mainJsPath, 'utf8');
    if (mainJs.includes('cookie-banner')) {
        console.log('Cookie banner is created dynamically in main.js');
        
        // Find the creation code
        const createIdx = mainJs.indexOf('cookie-banner');
        const start = Math.max(0, createIdx - 100);
        const end = Math.min(mainJs.length, createIdx + 200);
        console.log('main.js context:', mainJs.substring(start, end).replace(/\n/g, ' '));
    }
}
