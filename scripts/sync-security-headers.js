const fs = require('fs');
const path = require('path');
const { buildStaticHeadersFile } = require('../config/security-headers');
const { getPublishDir } = require('../config/publish-targets');

const targetPath = path.join(getPublishDir(), '_headers');
const nextContent = buildStaticHeadersFile();
const previousContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';

if (previousContent === nextContent) {
  console.log('_headers already in sync');
  process.exit(0);
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, nextContent, 'utf8');
console.log(`_headers synced from config/security-headers.js -> ${path.relative(path.join(__dirname, '..'), targetPath).replace(/\\/g, '/')}`);
