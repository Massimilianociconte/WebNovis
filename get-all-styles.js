const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');

// Find ALL style blocks
let pos = 0;
let count = 0;
while ((pos = c.indexOf('<style', pos)) !== -1) {
    count++;
    const end = c.indexOf('</style>', pos);
    const block = c.substring(pos, end + 8);
    fs.writeFileSync(`contatti-style-${count}.txt`, block, 'utf8');
    console.log(`Style block #${count}: ${block.length} chars`);
    pos++;
}
console.log(`Total style blocks: ${count}`);
