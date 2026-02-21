const fs = require('fs');
const path = require('path');

// Extract cookie banner from index.html
const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const bannerStart = indexContent.indexOf('<div class="cookie-banner"');
const bannerEnd = indexContent.indexOf('</div>', bannerStart) + 6;

if (bannerStart === -1 || bannerEnd === -1) {
    console.error('Cookie banner not found in index.html');
    process.exit(1);
}

const cookieBanner = indexContent.substring(bannerStart, bannerEnd);
console.log('Extracted cookie banner, length:', cookieBanner.length);

// Add to the 3 new pages
const pages = ['preventivo.html', 'come-lavoriamo.html', 'grazie.html'];

for (const page of pages) {
    const filePath = path.join(__dirname, '..', page);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Insert right before </body> (before back-to-top button)
    const bodyEnd = content.lastIndexOf('</body>');
    const backToTop = content.lastIndexOf('<button class="back-to-top"');
    
    if (backToTop !== -1) {
        // Insert before back-to-top button
        content = content.substring(0, backToTop) + '\n' + cookieBanner + '\n' + content.substring(backToTop);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added cookie banner to:', page, '(before back-to-top)');
    } else if (bodyEnd !== -1) {
        // Fallback: insert before </body>
        content = content.substring(0, bodyEnd) + '\n' + cookieBanner + '\n' + content.substring(bodyEnd);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added cookie banner to:', page, '(before </body>)');
    } else {
        console.log('Could not find insertion point in:', page);
    }
}
