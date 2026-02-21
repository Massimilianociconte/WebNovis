const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');

// Find ALL style blocks and check for conflicts
let pos = 0;
let allCss = '';
while ((pos = c.indexOf('<style', pos)) !== -1) {
    const end = c.indexOf('</style>', pos);
    allCss += c.substring(pos, end + 8);
    pos++;
}

// Check for problematic rules
const checks = [
    'overflow',
    'display:block',
    'display: block',
    'visibility',
    'opacity',
    'custom-option',
    'custom-select',
];

console.log('=== CSS conflict check ===');
checks.forEach(k => {
    if (allCss.includes(k)) {
        console.log('FOUND:', k);
        const idx = allCss.indexOf(k);
        console.log('  Context:', allCss.substring(Math.max(0, idx-30), idx+80));
    }
});

// Also check what version of style.min.css is loaded
const cssLink = c.match(/style\.min\.css\?v=[^"]+/);
console.log('\nCSS version loaded:', cssLink ? cssLink[0] : 'not found');

// Check if main.min.js is loaded
const mainJs = c.match(/main\.min\.js[^"']*/);
console.log('main.min.js loaded:', mainJs ? mainJs[0] : 'not found');
