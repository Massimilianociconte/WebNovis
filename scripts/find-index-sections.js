const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Find key section markers and their character positions
const markers = [
    'section-services',
    'services-section',
    'ecosistema',
    'portfolio',
    'testimonial',
    'cta-section',
    'chi-siamo',
    'stats-section',
    'marquee',
    'newsletter',
    'faq',
    'class="section"',
    '<section',
    'come-lavoriamo'
];

for (const m of markers) {
    const idx = content.indexOf(m);
    if (idx !== -1) {
        // Print surrounding context
        const start = Math.max(0, idx - 20);
        const end = Math.min(content.length, idx + 120);
        console.log('--- FOUND: "' + m + '" at ' + idx + ' ---');
        console.log(content.substring(start, end).replace(/\n/g, ' '));
        console.log('');
    } else {
        console.log('--- NOT FOUND: "' + m + '" ---');
    }
}
