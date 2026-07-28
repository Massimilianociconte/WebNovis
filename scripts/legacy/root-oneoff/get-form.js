const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');

// Find the form section and extract it
const formStart = c.indexOf('<form');
const formEnd = c.indexOf('</form>') + 7;
if (formStart > -1) {
    fs.writeFileSync('contatti-form.txt', c.substring(formStart, formEnd), 'utf8');
    console.log('Form extracted, length:', formEnd - formStart);
} else {
    console.log('No form found');
}
