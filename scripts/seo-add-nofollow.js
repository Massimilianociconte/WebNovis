#!/usr/bin/env node
/**
 * SEO Script: Add rel="nofollow noopener" to external <a> links
 * 
 * Rules:
 * - Only modifies <a href="https://..."> tags (not <link>, not <script> JSON-LD)
 * - Skips links to webnovis.com (internal)
 * - Skips links to fonts.googleapis.com / fonts.gstatic.com (resource hints)
 * - If <a> already has rel="...", appends nofollow/noopener if missing
 * - Adds target="_blank" to external links if not present
 * - Preserves everything inside <script> blocks untouched
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Domains that should NOT get nofollow (authoritative / own properties)
const SKIP_NOFOLLOW_DOMAINS = [
  'webnovis.com',
  'www.webnovis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'schema.org',
  'json-ld.org',
  'www.w3.org',
  'html.spec.whatwg.org',
  'rdfa.info',
];

// These are external but authoritative — keep dofollow but add noopener
const AUTHORITATIVE_DOMAINS = [
  'developers.google.com',
  'support.google.com',
  'web.dev',
  'developer.chrome.com',
  'it.wikipedia.org',
  'en.wikipedia.org',
  'www.google.com',
  'maps.google.com',
  'pagespeed.web.dev',
  'search.google.com',
];

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function shouldSkipEntirely(domain) {
  return SKIP_NOFOLLOW_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
}

function isAuthoritative(domain) {
  return AUTHORITATIVE_DOMAINS.some(d => domain === d || domain.endsWith('.' + d));
}

function processATag(aTag) {
  // Extract href
  const hrefMatch = aTag.match(/href="(https?:\/\/[^"]+)"/);
  if (!hrefMatch) return aTag; // no external href

  const url = hrefMatch[1];
  const domain = getDomain(url);

  if (!domain || shouldSkipEntirely(domain)) return aTag;

  let modified = aTag;
  const authoritative = isAuthoritative(domain);

  // Handle rel attribute
  const relMatch = modified.match(/\brel="([^"]*)"/);
  if (relMatch) {
    let relValues = relMatch[1].split(/\s+/).filter(Boolean);
    // Always add noopener for external links
    if (!relValues.includes('noopener')) relValues.push('noopener');
    // Add nofollow only for non-authoritative domains
    if (!authoritative && !relValues.includes('nofollow')) relValues.push('nofollow');
    modified = modified.replace(/\brel="[^"]*"/, `rel="${relValues.join(' ')}"`);
  } else {
    // No rel attribute — add one
    const relValue = authoritative ? 'noopener' : 'nofollow noopener';
    // Insert before the closing >
    modified = modified.replace(/>$/, ` rel="${relValue}">`);
    // Handle self-closing tags
    modified = modified.replace(/\/>$/, ` rel="${relValue}"/>`);
  }

  // Add target="_blank" if not present (for external links)
  if (!modified.includes('target=')) {
    modified = modified.replace(/\brel="/, 'target="_blank" rel="');
  }

  return modified;
}

function processHtml(content, filePath) {
  // Strategy: protect <script> blocks, then process <a> tags, then restore
  const scriptBlocks = [];
  let protected_ = content.replace(/<script[\s>][\s\S]*?<\/script>/gi, (match) => {
    const placeholder = `<!--SCRIPT_PLACEHOLDER_${scriptBlocks.length}-->`;
    scriptBlocks.push(match);
    return placeholder;
  });

  // Also protect <link> tags (they use href but aren't clickable links)
  const linkBlocks = [];
  protected_ = protected_.replace(/<link\b[^>]*>/gi, (match) => {
    const placeholder = `<!--LINK_PLACEHOLDER_${linkBlocks.length}-->`;
    linkBlocks.push(match);
    return placeholder;
  });

  // Now process <a> tags with external hrefs
  let modified = protected_.replace(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/gi, (aTag) => {
    return processATag(aTag);
  });

  // Restore <link> tags
  linkBlocks.forEach((block, i) => {
    modified = modified.replace(`<!--LINK_PLACEHOLDER_${i}-->`, block);
  });

  // Restore <script> blocks
  scriptBlocks.forEach((block, i) => {
    modified = modified.replace(`<!--SCRIPT_PLACEHOLDER_${i}-->`, block);
  });

  return modified;
}

function getAllHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) {
      results.push(...getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Main
const files = getAllHtmlFiles(ROOT);
let totalModified = 0;
let totalLinksChanged = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf8');
  const modified = processHtml(original, filePath);

  if (original !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    totalModified++;

    // Count changes
    const origExternalA = (original.match(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/gi) || []);
    const modExternalA = (modified.match(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/gi) || []);
    let changesInFile = 0;
    for (let i = 0; i < origExternalA.length; i++) {
      if (origExternalA[i] !== modExternalA[i]) changesInFile++;
    }
    totalLinksChanged += changesInFile;

    const rel = path.relative(ROOT, filePath);
    console.log(`✅ ${rel} (${changesInFile} links updated)`);
  }
}

console.log(`\n📊 Summary: ${totalModified} files modified, ${totalLinksChanged} external links updated`);
