#!/usr/bin/env node
/**
 * Add ?v= cache-busting params to all CSS/JS references (including
 * `../`-prefixed ones from subdirectory pages).
 *
 * Uses a content hash of the actual file for the version parameter,
 * so browsers/CDN re-download only when the file actually changes.
 * Re-stamps existing ?v= params to the current content hash (stable
 * when the file is unchanged), which also heals stale versions.
 *
 * Skips external URLs (https://). Resolves relative refs against the
 * HTML file's own directory, rooted at the publish dir.
 *
 * Run: node scripts/fix-cache-busting.js [--dry-run] [--out-dir=dist]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROOT_DIR, getPublishDir } = require('../config/publish-targets');

const ROOT = getPublishDir();
const DRY_RUN = process.argv.includes('--dry-run');
const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.github', '.claude', '.wrangler', '.well-known',
  'docs', 'scripts', 'data', 'config', 'tests', 'dist', 'templates',
  '.kiro', '.qoder', '.superpowers', '.vscode', 'workers'
]);

function getAllHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.well-known') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
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
    const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
    hashCache[filePath] = hash;
    return hash;
  } catch (e) {
    return null;
  }
}

function resolveAsset(htmlFile, refPath) {
  if (/^(?:[a-z]+:)?\/\//i.test(refPath)) return null;
  const resolved = refPath.startsWith('/')
    ? path.resolve(ROOT, refPath.replace(/^\//, ''))
    : path.resolve(path.dirname(htmlFile), refPath);
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
    return null;
  }
  return resolved;
}

const files = getAllHtmlFiles(ROOT);
let totalFixed = 0;
let totalRefsUpdated = 0;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updated = content;
  let refsInFile = 0;

  const stamp = (match, refPath) => {
    const absPath = resolveAsset(filePath, refPath);
    const hash = absPath ? getFileHash(absPath) : null;
    if (!hash) return match; // file not found or external, skip
    refsInFile++;
    const attr = match.startsWith('href=') ? 'href' : 'src';
    return `${attr}="${refPath}?v=${hash}"`;
  };

  // CSS refs (plain and already-versioned), any relative depth.
  updated = updated.replace(/href="((?:\.\.\/)*css\/[^"?]+\.css)"/g, stamp);
  updated = updated.replace(/href="((?:\.\.\/)*css\/[^"?]+\.css)\?v=[^"]+"/g, stamp);
  // JS refs (plain and already-versioned), any relative depth.
  updated = updated.replace(/src="((?:\.\.\/)*js\/[^"?]+\.js)"/g, stamp);
  updated = updated.replace(/src="((?:\.\.\/)*js\/[^"?]+\.js)\?v=[^"]+"/g, stamp);

  if (updated !== content) {
    totalFixed++;
    totalRefsUpdated += refsInFile;
    if (!DRY_RUN) fs.writeFileSync(filePath, updated, 'utf8');
  }
}

console.log(`📊 Cache-busting: ${totalFixed} files, ${totalRefsUpdated} CSS/JS refs stamped in ${path.relative(ROOT_DIR, ROOT) || '.'}${DRY_RUN ? ' (dry run)' : ''}`);
