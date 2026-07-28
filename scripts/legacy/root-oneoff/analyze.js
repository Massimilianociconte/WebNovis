const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Check for patterns
const hasServiceSelect = c.includes('name="service"');
const hasTimelineSelect = c.includes('name="timeline"');
const hasCustom = c.includes('custom-select-wrapper');

// Log to file
let log = [];
log.push('Analysis of preventivo.html:');
log.push(`Has name="service": ${hasServiceSelect}`);
log.push(`Has name="timeline": ${hasTimelineSelect}`);
log.push(`Has custom-select-wrapper: ${hasCustom}`);

// Try to find exact positions
const idx1 = c.indexOf('<select');
const idx2 = c.indexOf('custom-select-wrapper');
log.push(`First <select at: ${idx1}`);
log.push(`custom-select-wrapper at: ${idx2}`);

// Extract snippets
if (idx1 > -1) {
    log.push('\n--- <select snippet ---');
    log.push(c.substring(idx1, idx1 + 200));
}

if (idx2 > -1) {
    log.push('\n--- custom-select snippet ---');
    log.push(c.substring(idx2, idx2 + 200));
}

fs.writeFileSync('analysis.txt', log.join('\n'), 'utf8');
console.log('Analysis saved to analysis.txt');
