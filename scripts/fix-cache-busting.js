#!/usr/bin/env node
/**
 * Add ?v= cache-busting params to all CSS/JS references that are missing them.
 * 
 * Uses a content hash of the actual file for the version parameter,
 * so Googlebot will only re-download when the file actually changes.
 * 
 * Skips external URLs (https://) and already-versioned refs.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');

function getAllHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Compute short content hash for a file
const hashCache = {};
function getFileHash(filePath) {
  if (hashCache[filePath]) return hashCache[filePath];
  try {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    hashCache[filePath] = hash;
    return hash;
  } catch (e) {
    return null;
  }
}

const files = getAllHtmlFiles(ROOT);
let totalFixed = 0;
let totalRefsUpdated = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let refsInFile = 0;

  // Fix CSS refs: href="css/xxx.min.css" → href="css/xxx.min.css?v=HASH"
  content = content.replace(/href="(css\/[^"?]+\.css)"/g, (match, cssPath) => {
    const absPath = path.join(ROOT, cssPath);
    const hash = getFileHash(absPath);
    if (!hash) return match; // file not found, skip
    refsInFile++;
    return `href="${cssPath}?v=${hash}"`;
  });

  // Fix JS refs: src="js/xxx.min.js" → src="js/xxx.min.js?v=HASH"
  // Skip external scripts (https://)
  content = content.replace(/src="(js\/[^"?]+\.js)"/g, (match, jsPath) => {
    const absPath = path.join(ROOT, jsPath);
    const hash = getFileHash(absPath);
    if (!hash) return match; // file not found, skip
    refsInFile++;
    return `src="${jsPath}?v=${hash}"`;
  });

  // Also update existing ?v= params to use content hash
  content = content.replace(/href="(css\/[^"?]+\.css)\?v=[^"]+"/g, (match, cssPath) => {
    const absPath = path.join(ROOT, cssPath);
    const hash = getFileHash(absPath);
    if (!hash) return match;
    refsInFile++;
    return `href="${cssPath}?v=${hash}"`;
  });

  content = content.replace(/src="(js\/[^"?]+\.js)\?v=[^"]+"/g, (match, jsPath) => {
    const absPath = path.join(ROOT, jsPath);
    const hash = getFileHash(absPath);
    if (!hash) return match;
    refsInFile++;
    return `src="${jsPath}?v=${hash}"`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    totalRefsUpdated += refsInFile;
    console.log(`✅ ${path.relative(ROOT, filePath)} (${refsInFile} refs updated)`);
  }
}

console.log(`\n📊 Summary: ${totalFixed} files updated, ${totalRefsUpdated} CSS/JS refs now use content-hash versioning`);
