const fs = require('fs');
const path = require('path');

const pContent = fs.readFileSync(path.join(__dirname, '../preventivo.html'), 'utf8');

const fIdx = pContent.indexOf('<form ');
const start = Math.max(0, fIdx - 50);
const end = Math.min(pContent.length, fIdx + 200);
console.log(pContent.substring(start, end));

// Also check checkbox area
const cIdx = pContent.indexOf('id="termsCheckbox"');
const cStart = Math.max(0, cIdx - 100);
const cEnd = Math.min(pContent.length, cIdx + 400);
console.log('\n', pContent.substring(cStart, cEnd));
