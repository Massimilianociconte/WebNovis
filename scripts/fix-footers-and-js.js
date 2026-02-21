const fs = require('fs');
const path = require('path');

// Get the exact footer markup from index.html
const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const footerStart = indexContent.indexOf('<footer class="footer">');
const footerEnd = indexContent.indexOf('</footer>', footerStart) + 9;
const correctFooter = indexContent.substring(footerStart, footerEnd);

// Pages to fix
const pages = ['preventivo.html', 'come-lavoriamo.html', 'grazie.html'];

for (const page of pages) {
    const filePath = path.join(__dirname, '..', page);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace entire footer
    const currentFooterStart = content.indexOf('<footer class="footer">');
    const currentFooterEnd = content.indexOf('</footer>', currentFooterStart) + 9;
    
    if (currentFooterStart !== -1 && currentFooterEnd !== -1) {
        content = content.substring(0, currentFooterStart) + correctFooter + content.substring(currentFooterEnd);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed footer in:', page);
    } else {
        console.log('Footer not found in:', page);
    }
}

// Check for missing elements that main.min.js might be looking for
// Let's examine come-lavoriamo.html for missing elements
const comeLavoriamoContent = fs.readFileSync(path.join(__dirname, '../come-lavoriamo.html'), 'utf8');

// Common elements that main.min.js might try to attach event listeners to
const commonSelectors = [
    'nav-toggle',
    'navMenu', 
    'searchWrapper',
    'searchInput',
    'searchMobileToggle',
    'searchClear'
];

console.log('\n=== Checking for missing elements in come-lavoriamo.html ===');
for (const selector of commonSelectors) {
    const hasId = comeLavoriamoContent.includes('id="' + selector + '"');
    const hasClass = comeLavoriamoContent.includes('class="' + selector + '"');
    console.log(selector + ':', hasId ? 'id found' : (hasClass ? 'class found' : 'NOT FOUND'));
}

// Also check for nav element itself
const hasNav = comeLavoriamoContent.includes('<nav');
const hasNavToggle = comeLavoriamoContent.includes('nav-toggle');
console.log('\nnav element:', hasNav ? 'found' : 'NOT FOUND');
console.log('nav-toggle button:', hasNavToggle ? 'found' : 'NOT FOUND');
