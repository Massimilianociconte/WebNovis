const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../contatti.html'), 'utf8');

// Find the checkboxes in contatti.html
const checkboxMatches = content.match(/<label class="[^"]*checkbox[^"]*">[\s\S]*?<\/label>/g) || [];
console.log('=== CHECKBOXES IN contatti.html ===');
checkboxMatches.forEach((m, i) => console.log(`\nMatch ${i + 1}:\n${m}`));

// Find the select fields in contatti.html (if any)
const selectMatches = content.match(/<select[\s\S]*?<\/select>/g) || [];
console.log('\n=== SELECTS IN contatti.html ===');
selectMatches.forEach((m, i) => console.log(`\nMatch ${i + 1}:\n${m}`));
