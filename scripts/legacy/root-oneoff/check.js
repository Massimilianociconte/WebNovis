const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Check for custom select
const hasCustom = c.includes('custom-select-wrapper');
const hasSelect = c.includes('<select name="service"');

console.log('Has custom-select-wrapper:', hasCustom);
console.log('Has native <select>:', hasSelect);

// Find the service field section
const idx = c.indexOf('Servizio di interesse');
if (idx > -1) {
    console.log('\n--- Content around "Servizio di interesse" ---');
    console.log(c.substring(idx, idx + 800));
} else {
    console.log('"Servizio di interesse" not found');
}
