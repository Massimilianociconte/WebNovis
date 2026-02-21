const fs = require('fs');
const path = require('path');

const indexContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

const tpIdx = indexContent.indexOf('trustpilot-widget');
if (tpIdx !== -1) {
    const start = Math.max(0, tpIdx - 100);
    const end = Math.min(indexContent.length, tpIdx + 300);
    console.log(indexContent.substring(start, end));
} else {
    console.log('trustpilot-widget not found');
}

// Is there a script tag somewhere else? Like trustpilot.com/widget?
const tpScript = indexContent.match(/<script[^>]*widget\.trustpilot\.com[^>]*>.*?<\/script>/i);
if (tpScript) {
    console.log('Found Trustpilot script:', tpScript[0]);
} else {
    console.log('No widget.trustpilot.com script found');
}
