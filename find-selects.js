const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Find all select tags and their positions
let pos = 0;
let count = 0;
while ((pos = c.indexOf('<select', pos)) !== -1) {
    count++;
    const endPos = c.indexOf('</select>', pos);
    if (endPos !== -1) {
        const snippet = c.substring(pos, endPos + 9);
        console.log(`\n--- SELECT #${count} at position ${pos} ---`);
        console.log(snippet.substring(0, 300));
        console.log('...');
    }
    pos++;
}

console.log(`\nTotal <select> tags found: ${count}`);

// Also find custom-select-wrapper
const customPos = c.indexOf('custom-select-wrapper');
console.log(`\ncustom-select-wrapper at position: ${customPos}`);

if (customPos !== -1) {
    console.log('\n--- CUSTOM SELECT snippet ---');
    console.log(c.substring(customPos, customPos + 300));
}
