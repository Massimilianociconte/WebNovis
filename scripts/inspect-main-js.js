const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

// Find where contactForm is handled to see the newsletter logic
const cIdx = content.indexOf('contactForm.addEventListener');
if (cIdx !== -1) {
    const start = Math.max(0, cIdx - 200);
    const end = Math.min(content.length, cIdx + 800);
    console.log('=== Contact form logic in main.js ===');
    console.log(content.substring(start, end));
}

// Find preventivoForm logic (if it exists)
const pIdx = content.indexOf('preventivoForm');
if (pIdx !== -1) {
    console.log('\n=== preventivoForm logic found ===');
    const start = Math.max(0, pIdx - 100);
    const end = Math.min(content.length, pIdx + 300);
    console.log(content.substring(start, end));
} else {
    console.log('\n=== preventivoForm logic NOT found ===');
}
