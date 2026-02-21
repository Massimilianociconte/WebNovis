const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');

// Find inline style block
const styleStart = c.indexOf('<style>');
const styleEnd = c.indexOf('</style>');
if (styleStart > -1 && styleEnd > -1) {
    fs.writeFileSync('contatti-style.txt', c.substring(styleStart, styleEnd + 8), 'utf8');
    console.log('Saved inline style to contatti-style.txt');
} else {
    console.log('No inline style found');
}
