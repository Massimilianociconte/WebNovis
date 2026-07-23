#!/usr/bin/env node
/**
 * SEO Script: Enrich author schema in blog articles for E-E-A-T
 * 
 * Normalizes the collective editorial byline as an Organization.
 * Named people must only be published from a separately verified source.
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..', 'blog');

const { normalizeEntityJsonLd } = require('../config/entity-facts');

let modified = 0;

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const updated = normalizeEntityJsonLd(content);
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    modified++;
    console.log(`✅ ${file}`);
  }
}

console.log(`\n📊 Summary: ${modified} blog articles updated with enriched author schema`);
