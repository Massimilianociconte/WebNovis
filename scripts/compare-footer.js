const fs = require('fs');
const path = require('path');

const indexFooter = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const preventivoFooter = fs.readFileSync(path.join(__dirname, '../preventivo.html'), 'utf8');

// Extract footers
function extractFooter(content) {
    const start = content.indexOf('<footer class="footer">');
    const end = content.indexOf('</footer>', start) + 9;
    return content.substring(start, end);
}

const indexF = extractFooter(indexFooter);
const preventivoF = extractFooter(preventivoFooter);

console.log('=== DIFFERENCES ===');
console.log('Index footer length:', indexF.length);
console.log('Preventivo footer length:', preventivoF.length);

// Find first difference
const minLength = Math.min(indexF.length, preventivoF.length);
let firstDiff = -1;
for (let i = 0; i < minLength; i++) {
    if (indexF[i] !== preventivoF[i]) {
        firstDiff = i;
        break;
    }
}

if (firstDiff !== -1) {
    console.log('\nFirst difference at position', firstDiff);
    console.log('Index:', JSON.stringify(indexF.substring(firstDiff, firstDiff + 100)));
    console.log('Prev:', JSON.stringify(preventivoF.substring(firstDiff, firstDiff + 100)));
} else if (indexF.length !== preventivoF.length) {
    console.log('Footers are identical up to min length, but lengths differ');
} else {
    console.log('Footers are identical');
}
