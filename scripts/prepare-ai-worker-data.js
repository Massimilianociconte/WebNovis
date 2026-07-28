#!/usr/bin/env node
/**
 * Sync compact search index + chat-config into workers/webnovis-ai/data
 * Run before deploy: node scripts/prepare-ai-worker-data.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'workers/webnovis-ai/data');
fs.mkdirSync(outDir, { recursive: true });

const src = JSON.parse(fs.readFileSync(path.join(root, 'search-index.json'), 'utf8'));
const compact = src
  .filter((x) => x.indexable !== false)
  .map((x) => ({
    url: x.url,
    type: x.type || 'page',
    title: x.title || '',
    description: x.description || '',
    keywords: x.keywords || '',
    headings: Array.isArray(x.headings) ? x.headings.slice(0, 8) : [],
    content: String(x.content || '').slice(0, 520),
    indexable: true
  }));

fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(compact));
fs.copyFileSync(path.join(root, 'chat-config.json'), path.join(outDir, 'chat-config.json'));

console.log(`[prepare-ai-worker-data] ${compact.length} docs → workers/webnovis-ai/data/search-index.json`);
console.log(`[prepare-ai-worker-data] chat-config copied`);
