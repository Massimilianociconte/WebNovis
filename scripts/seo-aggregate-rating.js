#!/usr/bin/env node
/**
 * Remove unsupported rating and review properties from location-page JSON-LD.
 *
 * This intentionally keeps visible review badges and links unchanged. It only
 * cleans structured data and is safe to run repeatedly.
 *
 * Usage: node scripts/seo-aggregate-rating.js [--dry-run] [--templates-only]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const TEMPLATES_ONLY = process.argv.includes('--templates-only');

function removeSchemaReviewProperties(schema) {
  if (Array.isArray(schema)) {
    return schema.reduce((removed, item) => removed + removeSchemaReviewProperties(item), 0);
  }
  if (!schema || typeof schema !== 'object') return 0;

  let removed = 0;
  if (Object.prototype.hasOwnProperty.call(schema, 'aggregateRating')) {
    delete schema.aggregateRating;
    removed++;
  }
  if (Object.prototype.hasOwnProperty.call(schema, 'review')) {
    delete schema.review;
    removed++;
  }

  for (const value of Object.values(schema)) {
    removed += removeSchemaReviewProperties(value);
  }
  return removed;
}

function removeUnsupportedReviewMarkup(content) {
  let removed = 0;
  const html = content.replace(
    /<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g,
    (fullMatch, json) => {
      try {
        const schema = JSON.parse(json);
        const blockRemoved = removeSchemaReviewProperties(schema);
        if (blockRemoved === 0) return fullMatch;
        removed += blockRemoved;
        return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
      } catch {
        return fullMatch;
      }
    }
  );

  return { html, removed };
}

function main() {
  const scanDirectory = TEMPLATES_ONLY ? path.join(ROOT, 'templates', 'base-pages') : ROOT;
  const locationFiles = fs.readdirSync(scanDirectory)
    .filter((file) =>
      (file.startsWith('agenzia-web-') || file.startsWith('realizzazione-siti-web-')) &&
      file.endsWith('.html')
    )
    .map((file) => path.join(scanDirectory, file));

  let filesChanged = 0;
  let propertiesRemoved = 0;

  for (const filePath of locationFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = removeUnsupportedReviewMarkup(content);
    if (result.removed === 0) continue;

    filesChanged++;
    propertiesRemoved += result.removed;
    console.log(`  ✓ ${path.basename(filePath)}: ${result.removed} unsupported schema properties removed`);
    if (!DRY_RUN) fs.writeFileSync(filePath, result.html, 'utf8');
  }

  console.log(
    `\nDone. ${filesChanged} files ${DRY_RUN ? 'would be ' : ''}updated; ` +
    `${propertiesRemoved} unsupported schema properties ${DRY_RUN ? 'would be ' : ''}removed.`
  );
}

if (require.main === module) main();

module.exports = { removeSchemaReviewProperties, removeUnsupportedReviewMarkup };
