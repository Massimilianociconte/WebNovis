const fs = require('fs');
const path = require('path');

// Extract checkbox CSS from contatti.html or style.css to see if it's there
const content = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
const cIdx = content.indexOf('.form-checkbox');

if (cIdx !== -1) {
    console.log('form-checkbox CSS exists globally in style.css');
} else {
    console.log('form-checkbox CSS NOT FOUND globally in style.css! Needs to be added.');
}
