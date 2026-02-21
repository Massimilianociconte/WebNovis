const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Find the footer section
const footerStart = content.indexOf('<footer class="footer">');
const footerEnd = content.indexOf('</footer>', footerStart) + 9;

if (footerStart === -1 || footerEnd === -1) {
    console.error('Footer not found in index.html');
    process.exit(1);
}

const footerMarkup = content.substring(footerStart, footerEnd);
console.log('=== FOOTER MARKUP FROM index.html ===');
console.log(footerMarkup);
console.log('\nLength:', footerMarkup.length, 'characters');
