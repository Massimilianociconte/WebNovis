const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

// Find script tags related to Trustpilot and DesignRush
const scriptMatches = indexContent.match(/<script[^>]*trustpilot[^>]*>.*?<\/script>/gi) || [];
console.log('Trustpilot scripts found:', scriptMatches);

const designRushMatches = indexContent.match(/<script[^>]*designrush[^>]*>.*?<\/script>/gi) || [];
console.log('DesignRush scripts found:', designRushMatches);

// Let's also check where these are placed
if (scriptMatches.length > 0) {
    const idx = indexContent.indexOf(scriptMatches[0]);
    console.log('Trustpilot script position:', idx);
    console.log('Context:', indexContent.substring(Math.max(0, idx - 50), idx + 200).replace(/\n/g, ' '));
}
