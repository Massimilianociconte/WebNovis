const fs = require('fs');
const path = require('path');
const { buildStaticHeadersFile } = require('../config/security-headers');

const targetPath = path.join(__dirname, '..', '_headers');
const nextContent = buildStaticHeadersFile();
const previousContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';

if (previousContent === nextContent) {
  console.log('_headers already in sync');
  process.exit(0);
}

fs.writeFileSync(targetPath, nextContent, 'utf8');
console.log('_headers synced from config/security-headers.js');
