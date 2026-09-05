#!/usr/bin/env node
/**
 * Apply / upsert article-strategic-links sections on blog articles
 * based on config/blog-cluster-links.js clusters.
 *
 * Usage:
 *   node scripts/apply-blog-cluster-links.js           # write
 *   node scripts/apply-blog-cluster-links.js --dry-run  # report only
 */

const fs = require('fs');
const path = require('path');

const {
  getClusterStrategicLinks,
  getDefaultStrategicLinks,
  CLUSTERS
} = require('../config/blog-cluster-links');

const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const DRY_RUN = process.argv.includes('--dry-run');

const STRATEGIC_LINKS_STYLE_BLOCK =
  '<style data-webnovis-cluster-links>.article-strategic-links{padding:2.4rem 0;border-top:1px solid rgba(255,255,255,.06)}.article-strategic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.35rem}.article-strategic-card{display:block;padding:1.3rem;border-radius:14px;border:1px solid rgba(96,165,250,.18);background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(91,106,174,.08) 100%);text-decoration:none!important;transition:transform .2s ease,border-color .2s ease,background .2s ease}.article-strategic-card:hover{transform:translateY(-2px);border-color:rgba(96,165,250,.35);background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(91,106,174,.13) 100%)}.article-strategic-label{display:inline-flex;margin-bottom:.7rem;padding:.3rem .65rem;border-radius:999px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.18);font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--primary-light)}.article-strategic-card h3{margin:0 0 .5rem;font-size:1rem;color:var(--white)}.article-strategic-card p{margin:0;font-size:.9rem;line-height:1.6;color:var(--text-muted)}</style>';

const SECTION_RE = /<section class="article-strategic-links"[\s\S]*?<\/section>/i;
const MONEY_HREF_RE =
  /(\/servizi\/|preventivo\.html|\/realizzazione-siti|\/landing-page-|\/ecommerce-|\/google-ads-|\/zone-servite|\/agenzia-web)/i;

function listArticles() {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .filter((name) => fs.statSync(path.join(BLOG_DIR, name)).isFile())
    .sort();
}

function buildStrategicLinksHtml(strategicLinks) {
  if (!strategicLinks || !Array.isArray(strategicLinks.cards) || !strategicLinks.cards.length) {
    return '';
  }

  const cardsHtml = strategicLinks.cards
    .map(
      (card) =>
        `<a href="${card.href}" class="article-strategic-card"><span class="article-strategic-label">${card.label}</span><h3>${card.title}</h3><p>${card.desc}</p></a>`
    )
    .join('');

  return `<section class="article-strategic-links" aria-labelledby="strategic-links-title"> <h2 id="strategic-links-title">${strategicLinks.title || 'Percorsi consigliati'}</h2> <div class="article-strategic-grid"> ${cardsHtml} </div> </section>`;
}

function ensureStrategicLinksStyles(html) {
  if (/data-webnovis-cluster-links/i.test(html) || /\.article-strategic-links\{/.test(html)) {
    return html;
  }
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${STRATEGIC_LINKS_STYLE_BLOCK}</head>`);
  }
  return html;
}

function cardsHaveMoneyLink(cards = []) {
  return cards.some((card) => card && card.href && MONEY_HREF_RE.test(card.href));
}

function sectionHasMoneyLink(html) {
  const match = html.match(SECTION_RE);
  return Boolean(match && MONEY_HREF_RE.test(match[0]));
}

function upsertStrategicSection(html, strategicLinksHtml) {
  let updated = ensureStrategicLinksStyles(html);

  if (SECTION_RE.test(updated)) {
    return updated.replace(SECTION_RE, strategicLinksHtml);
  }

  if (/<section class="article-upgrade"/i.test(updated)) {
    return updated.replace(
      /<section class="article-upgrade"/i,
      `${strategicLinksHtml} <section class="article-upgrade"`
    );
  }

  if (/<div class="article-cta"/i.test(updated)) {
    return updated.replace(/<div class="article-cta"/i, `${strategicLinksHtml} <div class="article-cta"`);
  }

  if (/<\/article>/i.test(updated)) {
    return updated.replace(/<\/article>/i, `${strategicLinksHtml} </article>`);
  }

  // Fallback: inject before footer / end of body
  if (/<\/main>/i.test(updated)) {
    return updated.replace(/<\/main>/i, `${strategicLinksHtml}</main>`);
  }

  return updated.replace(/<\/body>/i, `${strategicLinksHtml}</body>`);
}

function analyzeHtml(html) {
  const hasSection = SECTION_RE.test(html);
  const hasMoney = hasSection && sectionHasMoneyLink(html);
  const hasStyle =
    /data-webnovis-cluster-links/i.test(html) || /\.article-strategic-links\{/.test(html);
  return { hasSection, hasMoney, hasStyle };
}

function main() {
  const articles = listArticles();
  const clusterPageSet = new Set();
  for (const cluster of CLUSTERS) {
    for (const page of cluster.pages || []) {
      clusterPageSet.add(page);
    }
  }

  const before = {
    total: articles.length,
    withSection: 0,
    withMoney: 0,
    inCluster: 0
  };
  const after = {
    total: articles.length,
    withSection: 0,
    withMoney: 0,
    inCluster: 0
  };

  const stats = {
    written: 0,
    wouldWrite: 0,
    unchanged: 0,
    clusterApplied: 0,
    defaultApplied: 0,
    skippedNoLinks: 0,
    styleInjected: 0
  };

  const changedFiles = [];

  for (const file of articles) {
    const filePath = path.resolve(BLOG_DIR, file);
    if (!filePath.startsWith(BLOG_DIR + path.sep)) {
      throw new Error(`Path escapes blog dir: ${file}`);
    }
    const relativePath = `blog/${file}`;
    const original = fs.readFileSync(filePath, 'utf8');
    const beforeState = analyzeHtml(original);

    if (beforeState.hasSection) before.withSection += 1;
    if (beforeState.hasMoney) before.withMoney += 1;
    if (clusterPageSet.has(relativePath)) before.inCluster += 1;

    let strategicLinks = getClusterStrategicLinks(relativePath);
    let source = 'cluster';

    if (!strategicLinks) {
      // Only inject defaults when the page has no strategic section yet
      if (!beforeState.hasSection) {
        strategicLinks = getDefaultStrategicLinks(relativePath);
        source = 'default';
      } else {
        stats.skippedNoLinks += 1;
        after.withSection += beforeState.hasSection ? 1 : 0;
        after.withMoney += beforeState.hasMoney ? 1 : 0;
        if (clusterPageSet.has(relativePath)) after.inCluster += 1;
        stats.unchanged += 1;
        continue;
      }
    }

    if (!strategicLinks || !strategicLinks.cards || !strategicLinks.cards.length) {
      stats.skippedNoLinks += 1;
      after.withSection += beforeState.hasSection ? 1 : 0;
      after.withMoney += beforeState.hasMoney ? 1 : 0;
      if (clusterPageSet.has(relativePath)) after.inCluster += 1;
      stats.unchanged += 1;
      continue;
    }

    const sectionHtml = buildStrategicLinksHtml(strategicLinks);
    let updated = upsertStrategicSection(original, sectionHtml);

    if (!beforeState.hasStyle && /data-webnovis-cluster-links/i.test(updated)) {
      stats.styleInjected += 1;
    }

    const afterState = analyzeHtml(updated);
    if (afterState.hasSection) after.withSection += 1;
    if (afterState.hasMoney) after.withMoney += 1;
    if (clusterPageSet.has(relativePath)) after.inCluster += 1;

    if (updated !== original) {
      changedFiles.push(file);
      if (source === 'cluster') stats.clusterApplied += 1;
      else stats.defaultApplied += 1;

      if (DRY_RUN) {
        stats.wouldWrite += 1;
      } else {
        fs.writeFileSync(filePath, updated, 'utf8');
        stats.written += 1;
      }
    } else {
      stats.unchanged += 1;
    }
  }

  const pct = (n, d) => (d ? ((n / d) * 100).toFixed(1) : '0.0');

  console.log('');
  console.log('=== apply-blog-cluster-links ===');
  console.log(DRY_RUN ? 'Mode: DRY-RUN (no writes)' : 'Mode: APPLY (writes enabled)');
  console.log(`Articles scanned: ${articles.length}`);
  console.log(`Clusters defined: ${CLUSTERS.length}`);
  console.log(`Pages in clusters: ${clusterPageSet.size}`);
  console.log('');
  console.log('Coverage BEFORE:');
  console.log(
    `  strategic section: ${before.withSection}/${before.total} (${pct(before.withSection, before.total)}%)`
  );
  console.log(
    `  money/service link in section: ${before.withMoney}/${before.total} (${pct(before.withMoney, before.total)}%)`
  );
  console.log(
    `  in strategic clusters: ${before.inCluster}/${before.total} (${pct(before.inCluster, before.total)}%)`
  );
  console.log('');
  console.log('Coverage AFTER:');
  console.log(
    `  strategic section: ${after.withSection}/${after.total} (${pct(after.withSection, after.total)}%)`
  );
  console.log(
    `  money/service link in section: ${after.withMoney}/${after.total} (${pct(after.withMoney, after.total)}%)`
  );
  console.log(
    `  in strategic clusters: ${after.inCluster}/${after.total} (${pct(after.inCluster, after.total)}%)`
  );
  console.log('');
  console.log('Actions:');
  console.log(`  cluster sections applied: ${stats.clusterApplied}`);
  console.log(`  default sections applied: ${stats.defaultApplied}`);
  console.log(`  style blocks injected: ${stats.styleInjected}`);
  console.log(`  files ${DRY_RUN ? 'that would change' : 'written'}: ${DRY_RUN ? stats.wouldWrite : stats.written}`);
  console.log(`  unchanged: ${stats.unchanged}`);
  console.log(`  skipped (no links / keep existing): ${stats.skippedNoLinks}`);
  console.log('');
  if (changedFiles.length) {
    console.log(`Changed files (${changedFiles.length}):`);
    for (const f of changedFiles) {
      console.log(`  - blog/${f}`);
    }
  }
  console.log('');

  const success =
    after.withMoney / after.total >= 0.6 && after.withSection / after.total >= 0.6;
  console.log(success ? 'SUCCESS: ≥60% coverage target met.' : 'WARNING: coverage target not met.');
  process.exit(success ? 0 : 1);
}

main();
