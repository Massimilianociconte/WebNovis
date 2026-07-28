const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');
const idx = c.indexOf('custom-select-wrapper');
if (idx > -1) {
    fs.writeFileSync('contatti-select.txt', c.substring(idx - 100, idx + 800), 'utf8');
    console.log('Saved to contatti-select.txt');
} else {
    console.log('Not found');
}
