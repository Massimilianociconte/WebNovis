const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

const results = [];

// Find custom-select-wrapper ALL occurrences and their context
let pos = 0;
let occ = 0;
while ((pos = c.indexOf('custom-select-wrapper', pos)) !== -1) {
    occ++;
    results.push(`\n=== Occurrence #${occ} at pos ${pos} ===`);
    results.push(c.substring(Math.max(0, pos - 50), pos + 300));
    pos++;
}
results.push(`\nTotal occurrences of custom-select-wrapper: ${occ}`);

// Find custom-select-trigger occurrences
let pos2 = 0;
let occ2 = 0;
while ((pos2 = c.indexOf('custom-select-trigger', pos2)) !== -1) {
    occ2++;
    pos2++;
}
results.push(`Total occurrences of custom-select-trigger: ${occ2}`);

// Find custom-option occurrences
const customOptionCount = (c.match(/custom-option/g) || []).length;
results.push(`Total occurrences of custom-option: ${customOptionCount}`);

// Check JS logic presence
results.push(`\nHas DOMContentLoaded custom select listener: ${c.includes('customSelects')}`);
results.push(`Has custom-select-wrapper in body (after <body tag): ${c.indexOf('class="custom-select-wrapper"') > c.indexOf('<body')}`);

// Find the form field section
const serviceFieldLabel = c.indexOf('Servizio di interesse');
results.push(`\n"Servizio di interesse" at pos: ${serviceFieldLabel}`);
if (serviceFieldLabel > -1) {
    results.push(c.substring(serviceFieldLabel, serviceFieldLabel + 400));
}

fs.writeFileSync('diag.txt', results.join('\n'), 'utf8');
console.log('Saved to diag.txt');
