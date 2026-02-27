#!/usr/bin/env node
/**
 * Add AggregateRating to location page LocalBusiness schemas.
 * Extends the existing AggregateRating from homepage to all location pages.
 * 
 * Usage: node scripts/seo-aggregate-rating.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const AGGREGATE_RATING = `"aggregateRating":{"@type":"AggregateRating","ratingValue":"5","bestRating":"5","worstRating":"1","ratingCount":"5","reviewCount":"5"}`;

// Find all location pages
const locationFiles = fs.readdirSync(ROOT)
  .filter(f => (f.startsWith('agenzia-web-') || f.startsWith('realizzazione-siti-web-')) && f.endsWith('.html'))
  .map(f => path.join(ROOT, f));

let fixed = 0;

for (const filePath of locationFiles) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Skip if already has AggregateRating
  if (content.includes('AggregateRating')) {
    console.log(`  ⊘ ${fileName}: already has AggregateRating`);
    continue;
  }
  
  // Find LocalBusiness schema and inject AggregateRating before the closing }
  // Pattern: look for "areaServed" or "openingHours" which are typically the last properties
  // We inject before the final } of the LocalBusiness JSON-LD block
  
  // Strategy: find the LocalBusiness script block, parse-modify-serialize
  // Find all ld+json blocks and pick the one with LocalBusiness
  const ldJsonPattern = /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g;
  let ldMatch;
  let lbBlock = null;
  let lbFullMatch = null;
  
  while ((ldMatch = ldJsonPattern.exec(content)) !== null) {
    if (ldMatch[1].includes('LocalBusiness')) {
      lbFullMatch = ldMatch[0];
      lbBlock = ldMatch[1].trim();
      break;
    }
  }
  
  if (!lbBlock) {
    console.log(`  ⚠ ${fileName}: no LocalBusiness schema found`);
    continue;
  }
  
  try {
    const obj = JSON.parse(lbBlock);
    obj.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "5",
      "reviewCount": "5"
    };
    const newScript = `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
    content = content.replace(lbFullMatch, newScript);
    fixed++;
    console.log(`  ✓ ${fileName}: AggregateRating added`);
    if (!DRY_RUN) fs.writeFileSync(filePath, content, 'utf-8');
  } catch (err) {
    console.log(`  ⚠ ${fileName}: JSON parse error — ${err.message}`);
  }
}

console.log(`\nDone. ${fixed} files ${DRY_RUN ? 'would be ' : ''}updated.`);
