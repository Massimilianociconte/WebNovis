const fs = require('fs');
const c = fs.readFileSync('preventivo.html', 'utf8');

// Trova la sezione del form
const idx = c.indexOf('id="contactForm"');
if (idx === -1) {
    console.log('Form non trovato');
    process.exit(1);
}

// Estrai 2000 caratteri dopo l'inizio del form
const section = c.substring(idx, idx + 3000);
console.log(section);
