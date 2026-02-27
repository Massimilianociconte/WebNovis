#!/usr/bin/env node
/**
 * SEO Bulk Fix Script — WebNovis
 * Implements all actionable SEO improvements from the audit report.
 *
 * Fixes applied:
 * 1. CRITICO: twitter:site @webaboratorio → @webnovis (103 pages)
 * 2. ALTO: Remove FAQPage schema from commercial pages (keep FAQ HTML visible)
 * 3. BASSO: Remove <meta name="keywords"> (ignored by Google since 2009)
 * 4. BASSO: Remove hreflang tags from monolingual site (unnecessary overhead)
 * 5. MEDIO: Fix H3 in footer → <strong> semantic tags
 * 6. BASSO: Show "ultimo aggiornamento" date in blog article frontend
 * 7. ALTO: Add meta refresh to portfolio uppercase files (static hosting fallback)
 *
 * Usage: node scripts/seo-bulk-fix.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

const stats = {
  twitterFixed: 0,
  faqSchemaRemoved: 0,
  keywordsRemoved: 0,
  hreflangRemoved: 0,
  footerH3Fixed: 0,
  dateModifiedShown: 0,
  portfolioMetaRefresh: 0,
  filesProcessed: 0,
  errors: []
};

function log(msg) {
  console.log(`${DRY_RUN ? '[DRY-RUN] ' : ''}${msg}`);
}

function getAllHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    if (entry.isDirectory()) {
      // Skip non-content directories
      if (['Img', 'css', 'js', 'fonts', 'docs', 'scripts', 'tests', '.git', '.github', '.kiro', '.claude', 'test-SEO'].includes(entry.name)) continue;
      results = results.concat(getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// ─── Fix 1: twitter:site @webaboratorio → @webnovis ───────────────────────
function fixTwitterSite(content, filePath) {
  const pattern = /content="@webaboratorio"/g;
  if (pattern.test(content)) {
    stats.twitterFixed++;
    log(`  ✓ Fix twitter:site: ${path.relative(ROOT, filePath)}`);
    return content.replace(/content="@webaboratorio"/g, 'content="@webnovis"');
  }
  return content;
}

// ─── Fix 2: Remove FAQPage schema JSON-LD (keep FAQ HTML visible) ─────────
// Only removes the <script type="application/ld+json"> block containing FAQPage
// Blog pages, service pages, location pages — all commercial
function removeFaqPageSchema(content, filePath) {
  // Match entire script block containing FAQPage
  // Pattern: <script type="application/ld+json">...FAQPage...</script>
  const faqScriptPattern = /<script\s+type="application\/ld\+json"\s*>\s*\{[^<]*"@type"\s*:\s*"FAQPage"[^<]*\}<\/script>/g;
  
  if (faqScriptPattern.test(content)) {
    stats.faqSchemaRemoved++;
    log(`  ✓ Remove FAQPage schema: ${path.relative(ROOT, filePath)}`);
    // Reset lastIndex after test()
    return content.replace(/<script\s+type="application\/ld\+json"\s*>\s*\{[^<]*"@type"\s*:\s*"FAQPage"[^<]*\}<\/script>/g, '');
  }
  
  // Also handle minified single-line pages where the JSON might be more compact
  const faqScriptPattern2 = /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[^<]*<\/script>/g;
  if (faqScriptPattern2.test(content)) {
    stats.faqSchemaRemoved++;
    log(`  ✓ Remove FAQPage schema (minified): ${path.relative(ROOT, filePath)}`);
    return content.replace(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"FAQPage"[^<]*<\/script>/g, '');
  }
  
  return content;
}

// ─── Fix 3: Remove <meta name="keywords"> ─────────────────────────────────
function removeMetaKeywords(content, filePath) {
  // Match both formats: content="..." name="keywords" and name="keywords" content="..."
  const pattern1 = /\s*<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>\s*/g;
  const pattern2 = /\s*<meta\s+content="[^"]*"\s+name="keywords"\s*\/?>\s*/g;
  
  let modified = content;
  let found = false;
  
  if (pattern1.test(content)) { found = true; modified = content.replace(pattern1, '\n'); }
  else if (pattern2.test(content)) { found = true; modified = content.replace(pattern2, ' '); }
  
  if (found) {
    stats.keywordsRemoved++;
    log(`  ✓ Remove meta keywords: ${path.relative(ROOT, filePath)}`);
  }
  return modified;
}

// ─── Fix 4: Remove hreflang tags ──────────────────────────────────────────
function removeHreflang(content, filePath) {
  const pattern = /\s*<link\s+[^>]*hreflang="[^"]*"[^>]*\/?>\s*/g;
  
  if (pattern.test(content)) {
    stats.hreflangRemoved++;
    log(`  ✓ Remove hreflang: ${path.relative(ROOT, filePath)}`);
    return content.replace(/\s*<link\s+[^>]*hreflang="[^"]*"[^>]*\/?>\s*/g, '\n');
  }
  return content;
}

// ─── Fix 5: Fix H3 in footer → <strong> ───────────────────────────────────
function fixFooterH3(content, filePath) {
  // Footer H3s are plain <h3>Text</h3> inside <div class="footer-column">
  // Only target H3s that appear inside the <footer> section
  const footerIdx = content.indexOf('<footer');
  if (footerIdx === -1) return content;
  
  const beforeFooter = content.substring(0, footerIdx);
  let footerContent = content.substring(footerIdx);
  
  // Match H3s inside footer-column: <h3>Servizi</h3>, <h3>Azienda</h3>, etc.
  const footerH3Pattern = /(<div class="footer-column">\s*)<h3>([^<]+)<\/h3>/g;
  
  if (footerH3Pattern.test(footerContent)) {
    stats.footerH3Fixed++;
    log(`  ✓ Fix footer H3: ${path.relative(ROOT, filePath)}`);
    footerContent = footerContent.replace(
      /(<div class="footer-column">\s*)<h3>([^<]+)<\/h3>/g,
      '$1<strong class="footer-heading" role="heading" aria-level="3">$2</strong>'
    );
    return beforeFooter + footerContent;
  }
  return content;
}

// ─── Fix 6: Show dateModified in blog frontend ────────────────────────────
function showDateModified(content, filePath) {
  // Only for blog articles
  if (!filePath.includes(path.join('blog', ''))) return content;
  if (filePath.endsWith('index.html')) return content;
  
  // Skip if already showing update date
  if (content.includes('article-updated') || content.includes('Aggiornato:')) return content;
  
  // Find dateModified in JSON-LD schema
  const dateModMatch = content.match(/"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})"/);
  if (!dateModMatch) return content;
  
  const isoDate = dateModMatch[1];
  const [y, m, d] = isoDate.split('-');
  const months = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const humanDate = `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
  
  // Actual pattern: <p class="article-meta">Di WebNovis ... · DATE · READ_TIME</p>
  // Insert "Aggiornato" before the closing </p>
  const articleMetaPattern = /(class="article-meta">[^<]*\d+ min di lettura)(<\/p>)/;
  if (articleMetaPattern.test(content)) {
    stats.dateModifiedShown++;
    log(`  ✓ Show dateModified (${isoDate}): ${path.relative(ROOT, filePath)}`);
    return content.replace(articleMetaPattern, `$1 · <span class="article-updated">Aggiornato: <time datetime="${isoDate}">${humanDate}</time></span>$2`);
  }
  
  return content;
}

// ─── Main ─────────────────────────────────────────────────────────────────
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  SEO Bulk Fix — WebNovis');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no files modified)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  const htmlFiles = getAllHtmlFiles(ROOT);
  log(`Found ${htmlFiles.length} HTML files to process\n`);
  
  for (const filePath of htmlFiles) {
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      stats.errors.push(`Read error: ${filePath} — ${err.message}`);
      continue;
    }
    
    const original = content;
    
    // Apply all fixes
    content = fixTwitterSite(content, filePath);
    content = removeFaqPageSchema(content, filePath);
    content = removeMetaKeywords(content, filePath);
    content = removeHreflang(content, filePath);
    content = fixFooterH3(content, filePath);
    content = showDateModified(content, filePath);
    
    // Write if changed
    if (content !== original) {
      stats.filesProcessed++;
      if (!DRY_RUN) {
        try {
          fs.writeFileSync(filePath, content, 'utf-8');
        } catch (err) {
          stats.errors.push(`Write error: ${filePath} — ${err.message}`);
        }
      }
    }
  }
  
  // ─── Portfolio uppercase meta refresh (Fix 7) ────────────────────────────
  const portfolioRedirects = {
    'Aether-Digital.html': 'case-study/aether-digital.html',
    'Ember-Oak.html': 'case-study/ember-oak.html',
    'Lumina-Creative.html': 'case-study/lumina-creative.html',
    'Muse-Editorial.html': 'case-study/muse-editorial.html',
    'PopBlock-Studio.html': 'case-study/popblock-studio.html',
    'Structure-Arch.html': 'case-study/structure-arch.html'
  };
  
  for (const [oldFile, newPath] of Object.entries(portfolioRedirects)) {
    const filePath = path.join(ROOT, 'portfolio', oldFile);
    if (!fs.existsSync(filePath)) continue;
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const canonicalUrl = `https://www.webnovis.com/portfolio/${newPath}`;
    
    // Check if meta refresh already exists
    if (content.includes('http-equiv="refresh"')) {
      log(`  ⊘ Portfolio ${oldFile}: meta refresh already present`);
      continue;
    }
    
    // Add meta refresh right after <head> or after <meta charset>
    const redirectPage = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=${newPath}">
    <link rel="canonical" href="${canonicalUrl}">
    <title>Redirect — WebNovis</title>
    <meta name="robots" content="noindex, follow">
</head>
<body>
    <p>Pagina spostata. <a href="${newPath}">Clicca qui</a> se non vieni reindirizzato automaticamente.</p>
</body>
</html>`;
    
    stats.portfolioMetaRefresh++;
    log(`  ✓ Portfolio meta refresh: ${oldFile} → ${newPath}`);
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, redirectPage, 'utf-8');
    }
  }
  
  // ─── Summary ────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Files processed:        ${stats.filesProcessed}`);
  console.log(`  twitter:site fixed:     ${stats.twitterFixed}`);
  console.log(`  FAQPage schema removed: ${stats.faqSchemaRemoved}`);
  console.log(`  meta keywords removed:  ${stats.keywordsRemoved}`);
  console.log(`  hreflang removed:       ${stats.hreflangRemoved}`);
  console.log(`  footer H3 fixed:        ${stats.footerH3Fixed}`);
  console.log(`  dateModified shown:     ${stats.dateModifiedShown}`);
  console.log(`  portfolio meta refresh: ${stats.portfolioMetaRefresh}`);
  if (stats.errors.length) {
    console.log(`  ERRORS: ${stats.errors.length}`);
    stats.errors.forEach(e => console.log(`    ⚠ ${e}`));
  }
  console.log('═══════════════════════════════════════════════════════');
}

main();
