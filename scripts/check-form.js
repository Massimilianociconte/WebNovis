const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Find the service field section
const i = c.indexOf('Servizio di interesse');
console.log('Position of "Servizio di interesse":', i);

if (i !== -1) {
    const snippet = c.substring(Math.max(0, i - 200), i + 800);
    console.log('\n--- SNIPPET ---\n');
    console.log(snippet);
    console.log('\n--- END SNIPPET ---\n');
    
    // Check what type of element is used
    const hasSelect = snippet.includes('<select');
    const hasCustom = snippet.includes('custom-select-wrapper');
    console.log('Contains <select>:', hasSelect);
    console.log('Contains custom-select-wrapper:', hasCustom);
} else {
    console.log('String not found');
}
