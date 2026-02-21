const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../preventivo.html'), 'utf8');

const hasSelect = content.includes('<select name="service"');
const hasCustom = content.includes('custom-select-wrapper');

console.log('has native select:', hasSelect);
console.log('has custom wrapper:', hasCustom);

if (hasSelect) {
    const sIdx = content.indexOf('<select name="service"');
    console.log(content.substring(Math.max(0, sIdx - 50), sIdx + 150));
}
