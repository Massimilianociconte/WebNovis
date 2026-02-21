const fs = require('fs');
const path = require('path');

// Get cookie banner markup from index.html
const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const bannerStart = indexContent.indexOf('<div id="cookie-banner"');
const bannerEnd = indexContent.indexOf('</div>', bannerStart) + 6;

if (bannerStart === -1 || bannerEnd === -1) {
    console.error('Cookie banner not found in index.html');
    process.exit(1);
}

const cookieBanner = indexContent.substring(bannerStart, bannerEnd);

// Pages to fix
const pages = ['preventivo.html', 'come-lavoriamo.html', 'grazie.html'];

for (const page of pages) {
    const filePath = path.join(__dirname, '..', page);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Insert cookie banner right after <body>
    const bodyTag = content.indexOf('<body');
    const afterBody = content.indexOf('>', bodyTag) + 1;
    
    if (bodyTag !== -1 && afterBody !== -1) {
        content = content.substring(0, afterBody) + '\n' + cookieBanner + '\n' + content.substring(afterBody);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added cookie banner to:', page);
    } else {
        console.log('Could not find <body> tag in:', page);
    }
}
