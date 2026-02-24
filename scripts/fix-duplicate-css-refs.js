#!/usr/bin/env node
/**
 * Fix duplicate CSS references in HTML files.
 * 
 * Problem: Some pages reference the same CSS file twice —
 * once with ?v= cache-busting param and once without.
 * Googlebot treats these as different resources and downloads both.
 *
 * Solution: For each CSS file referenced multiple times, keep the
 * versioned reference (with ?v=) and remove the unversioned one.
 */

const fs = require('fs');
const path = require('path');

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

const files = getAllHtmlFiles(ROOT);
let totalFixed = 0;
let totalDupsRemoved = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Find all CSS link references: <link ... href="css/xxx.min.css..." ...>
  // We need to track which CSS files are referenced and how many times
  const cssLinkPattern = /<link\b[^>]*href="(css\/[^"?]+)(\?[^"]*)?"[^>]*>/gi;
  const refs = [];
  let match;
  
  while ((match = cssLinkPattern.exec(content)) !== null) {
    refs.push({
      fullMatch: match[0],
      basePath: match[1],      // e.g. "css/revolution.min.css"
      queryString: match[2] || '', // e.g. "?v=1.5" or ""
      index: match.index
    });
  }

  // Group by basePath
  const groups = {};
  for (const ref of refs) {
    if (!groups[ref.basePath]) groups[ref.basePath] = [];
    groups[ref.basePath].push(ref);
  }

  // For each group with duplicates, remove the unversioned reference
  let removedInFile = 0;
  for (const [basePath, entries] of Object.entries(groups)) {
    if (entries.length <= 1) continue;

    const versioned = entries.filter(e => e.queryString);
    const unversioned = entries.filter(e => !e.queryString);

    if (versioned.length > 0 && unversioned.length > 0) {
      // Remove unversioned duplicates
      for (const dup of unversioned) {
        // Remove the full <link> tag + any trailing whitespace
        content = content.replace(dup.fullMatch, '');
        removedInFile++;
      }
    }
  }

  if (content !== original) {
    // Clean up any double spaces left by removal
    content = content.replace(/  +/g, ' ');
    fs.writeFileSync(filePath, content, 'utf8');
    totalFixed++;
    totalDupsRemoved += removedInFile;
    console.log(`✅ ${path.relative(ROOT, filePath)} (${removedInFile} duplicates removed)`);
  }
}

console.log(`\n📊 Summary: ${totalFixed} files fixed, ${totalDupsRemoved} duplicate CSS refs removed`);
