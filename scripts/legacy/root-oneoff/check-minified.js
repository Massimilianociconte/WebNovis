const fs = require('fs');

// Check if contatti.html has the custom select in the MINIFIED version
// The build.js minifies HTML files - let's check if there's a dist or if it serves the source
const c = fs.readFileSync('contatti.html', 'utf8');

// Check if it's minified (single line or multi-line)
const lines = c.split('\n');
console.log('Total lines in contatti.html:', lines.length);
console.log('First 200 chars:', c.substring(0, 200));
console.log('\nHas custom-select-wrapper:', c.includes('custom-select-wrapper'));
console.log('Has style.min.css?v=1.6:', c.includes('style.min.css?v=1.6'));
