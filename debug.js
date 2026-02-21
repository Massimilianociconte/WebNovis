const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Find the form section
const idx = c.indexOf('id="contactForm"');
console.log('contactForm position:', idx);

if (idx > -1) {
    const section = c.substring(idx, idx + 2000);
    console.log('\n--- FORM SECTION ---\n');
    console.log(section);
} else {
    console.log('contactForm not found');
}

// Check if custom select is there
const hasCustom = c.includes('custom-select-wrapper');
const hasSelect = c.includes('<select name="service"');
console.log('\nHas custom-select-wrapper:', hasCustom);
console.log('Has native select:', hasSelect);
