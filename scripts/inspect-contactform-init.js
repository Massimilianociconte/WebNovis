const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
const cIdx = content.indexOf('const contactForm = document.getElementById(\'contactForm\');');
if (cIdx !== -1) {
    const start = Math.max(0, cIdx - 100);
    const end = Math.min(content.length, cIdx + 500);
    console.log(content.substring(start, end));
} else {
    console.log('contactForm init not found exactly');
}
