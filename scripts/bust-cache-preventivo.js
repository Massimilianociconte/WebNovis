const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../preventivo.html');
let content = fs.readFileSync(filePath, 'utf8');

// Aggiungiamo un query parameter al css per forzare l'aggiornamento
content = content.replace(/css\/style\.min\.css\?v=1\.5/g, 'css/style.min.css?v=1.6');
content = content.replace(/css\/revolution\.min\.css\?v=1\.3/g, 'css/revolution.min.css?v=1.4');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cache busters updated in preventivo.html');
