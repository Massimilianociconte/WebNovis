const fs = require('fs');
const c = fs.readFileSync('contatti-style.txt', 'utf8');
const idx = c.indexOf('contatti-form-wrapper');
if (idx > -1) {
    fs.writeFileSync('wrapper-css.txt', c.substring(idx, idx + 300), 'utf8');
    console.log('Found');
} else {
    console.log('Not found');
}
