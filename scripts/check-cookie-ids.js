const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../come-lavoriamo.html'), 'utf8');

// Find cookie banner section
const bannerStart = content.indexOf('<div class="cookie-banner"');
const bannerEnd = content.indexOf('</div>', bannerStart) + 6;

if (bannerStart !== -1 && bannerEnd !== -1) {
    const banner = content.substring(bannerStart, bannerEnd);
    console.log('=== Cookie banner markup ===');
    console.log(banner);
    
    // Check for specific IDs and classes
    const checks = [
        'id="cookieAccept"',
        'id="cookieReject"',
        'class="cookie-btn-accept"',
        'class="cookie-btn-reject"',
        'cookie-accept',
        'cookie-reject'
    ];
    
    console.log('\n=== ID/Class checks ===');
    for (const check of checks) {
        const found = banner.includes(check);
        console.log(`${check}: ${found ? '✓' : '✗'}`);
    }
} else {
    console.log('Cookie banner not found');
}
