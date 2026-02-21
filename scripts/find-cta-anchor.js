const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Find the exact string just before cta-section to use as edit anchor
const ctaIdx = content.indexOf('class="cta-section"');
const start = Math.max(0, ctaIdx - 200);
console.log('=== BEFORE cta-section ===');
console.log(JSON.stringify(content.substring(start, ctaIdx + 50)));

// Also find newsletter section start
const nlIdx = content.indexOf('class="reveal newsletter-section"');
const nlStart = Math.max(0, nlIdx - 100);
console.log('\n=== BEFORE newsletter-section ===');
console.log(JSON.stringify(content.substring(nlStart, nlIdx + 60)));

// Find the closing tag just before cta-section
const sectionClose = content.lastIndexOf('</section>', ctaIdx);
console.log('\n=== Last </section> before cta ===');
console.log(JSON.stringify(content.substring(sectionClose, sectionClose + 20)));
console.log('Position:', sectionClose);
