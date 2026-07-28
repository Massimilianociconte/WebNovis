#!/usr/bin/env node
/**
 * Migrazione one-shot degli articoli blog già pubblicati.
 *
 * Allinea gli HTML esistenti alle correzioni fatte in blog/build-articles.js,
 * senza rigenerare il contenuto (che contiene revisioni redazionali a mano).
 *
 *   1. dateModified >= datePublished   (53 articoli avevano modified < published)
 *   2. skip link "Vai al contenuto" + <main id="main-content" tabindex="-1">
 *   3. Google Fonts non render-blocking (media=print/onload + <noscript>)
 *   4. versioni CSS allineate al resto del sito (?v=1.4 -> ?v=20260728c)
 *   5. byline visibile coerente con l'author Person del JSON-LD
 *
 * Uso:
 *   node scripts/migrate-blog-article-debt.js            # applica
 *   node scripts/migrate-blog-article-debt.js --dry-run  # solo report
 */

const fs = require('fs');
const path = require('path');
const { ENTITY_FACTS } = require('../config/entity-facts');

const BLOG_DIR = path.resolve(__dirname, '..', 'blog');
const DRY_RUN = process.argv.includes('--dry-run');

const ASSET_VERSION = '20260728c';
const REVOLUTION_CSS_VERSION = '1.5';
const SEARCH_CSS_VERSION = '2.1';

const IT_MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const SKIP_LINK_HTML = '<a href="#main-content" class="skip-link" style="position:absolute;top:-100%;left:0;z-index:100000;padding:.8rem 1.5rem;background:#7b8cc9;color:#fff;font-size:.9rem;text-decoration:none;border-radius:0 0 8px 0;transition:top .2s">Vai al contenuto</a><style>.skip-link:focus{top:0}</style>';

const FONTS_HREF_RE = /https:\/\/fonts\.googleapis\.com\/css2\?[^"']+/;

function formatItalianDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!match) return '';
  const [, year, month, day] = match;
  return `${Number(day)} ${IT_MONTHS[Number(month) - 1]} ${year}`;
}

/** Estrae la data ISO (YYYY-MM-DD) da un valore che può avere o meno l'ora. */
function isoDay(value) {
  const match = /(\d{4}-\d{2}-\d{2})/.exec(String(value || ''));
  return match ? match[1] : '';
}

// ── 1. Date ──────────────────────────────────────────────────────────────────
function fixDates(html, report) {
  const published = isoDay(
    (/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i.exec(html) || [])[1]
      || (/"datePublished"\s*:\s*"([^"]+)"/.exec(html) || [])[1]
  );
  const modified = isoDay(
    (/<meta[^>]+property=["']article:modified_time["'][^>]+content=["']([^"']+)["']/i.exec(html) || [])[1]
      || (/"dateModified"\s*:\s*"([^"]+)"/.exec(html) || [])[1]
  );

  if (!published || !modified || modified >= published) return html;

  report.dates += 1;
  const oldHuman = formatItalianDate(modified);
  const newHuman = formatItalianDate(published);

  let out = html
    .replace(
      /(<meta[^>]+property=["']article:modified_time["'][^>]+content=["'])([^"']+)(["'])/gi,
      (_m, pre, value, post) => `${pre}${value.replace(modified, published)}${post}`
    )
    .replace(
      /("dateModified"\s*:\s*")([^"]+)(")/g,
      (_m, pre, value, post) => `${pre}${value.replace(modified, published)}${post}`
    );

  // Testo visibile. Sostituzione ancorata ai due contenitori noti: una replace
  // globale della data cambierebbe anche le date citate nel corpo dell'articolo.
  if (oldHuman && newHuman) {
    const escaped = oldHuman.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(
        new RegExp(`(<span class=["']article-updated["']>\\s*Aggiornato:\\s*)${escaped}`, 'g'),
        (_m, pre) => pre + newHuman
      )
      .replace(
        new RegExp(`(Ultimo aggiornamento:\\s*(?:</strong>)?\\s*)${escaped}`, 'g'),
        (_m, pre) => pre + newHuman
      );
  }
  return out;
}

// ── 2. Skip link ─────────────────────────────────────────────────────────────
function fixSkipLink(html, report) {
  let out = html;
  if (!/class=["']skip-link["']/.test(out)) {
    const bodyMatch = /<body[^>]*>/i.exec(out);
    if (!bodyMatch) return out;
    const at = bodyMatch.index + bodyMatch[0].length;
    out = `${out.slice(0, at)} ${SKIP_LINK_HTML}${out.slice(at)}`;
    report.skipLink += 1;
  }
  // Il target deve esistere ed essere focusabile, altrimenti il link non fa nulla.
  if (!/<main[^>]*id=["']main-content["']/i.test(out)) {
    out = out.replace(/<main(\s[^>]*)?>/i, (_m, attrs) => `<main id="main-content" tabindex="-1"${attrs || ''}>`);
    report.mainId += 1;
  }
  return out;
}

// ── 3. Google Fonts non-blocking ─────────────────────────────────────────────
// I <noscript> vengono mascherati: il fallback che iniettiamo è un
// <link rel="stylesheet"> senza media, quindi una seconda esecuzione lo
// ri-avvolgerebbe generando <noscript> annidati.
function fixFonts(html, report) {
  const noscripts = [];
  const masked = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, (block) => {
    noscripts.push(block);
    return ` NOSCRIPT${noscripts.length - 1} `;
  });
  return fixFontsInMarkup(masked, report)
    .replace(/ NOSCRIPT(\d+) /g, (_m, i) => noscripts[Number(i)]);
}

function fixFontsInMarkup(html, report) {
  const blocking = new RegExp(
    '<link([^>]*?)href=(["\'])(https://fonts\\.googleapis\\.com/css2\\?[^"\']+)\\2([^>]*?)>',
    'gi'
  );
  let changed = false;
  const out = html.replace(blocking, (tag, pre, quote, href, post) => {
    const attrs = `${pre} ${post}`;
    if (/rel=["']preconnect["']/i.test(attrs) || /rel=["']preload["']/i.test(attrs)) return tag;
    if (/\bmedia=/i.test(attrs)) return tag; // già differito
    changed = true;
    return `<link href="${href}" rel="stylesheet" media="print" onload="this.media='all'">`
      + `<noscript><link href="${href}" rel="stylesheet"></noscript>`;
  });
  if (changed) report.fonts += 1;
  return out;
}

// ── 4. Versioni CSS ──────────────────────────────────────────────────────────
function fixCssVersions(html, report) {
  let changed = false;
  let out = html.replace(/(css\/style\.min\.css\?v=)([^"'&]+)/g, (m, pre, ver) => {
    if (ver === ASSET_VERSION) return m;
    changed = true;
    return pre + ASSET_VERSION;
  });
  out = out.replace(/(css\/revolution\.min\.css\?v=)([^"'&]+)/g, (m, pre, ver) => {
    if (ver === REVOLUTION_CSS_VERSION) return m;
    changed = true;
    return pre + REVOLUTION_CSS_VERSION;
  });
  out = out.replace(/(css\/search\.min\.css\?v=)([^"'&]+)/g, (m, pre, ver) => {
    if (ver === SEARCH_CSS_VERSION) return m;
    changed = true;
    return pre + SEARCH_CSS_VERSION;
  });
  if (changed) report.cssVersion += 1;
  return out;
}

// ── 5. Byline: sempre WebNovis ───────────────────────────────────────────────
// Scelta editoriale: gli articoli sono firmati dall'agenzia. La byline visibile
// deve dire lo stesso dell'author nel JSON-LD (nodo Organization).
function fixByline(html, report) {
  const target = `Di <a href="../chi-siamo.html" rel="author">${ENTITY_FACTS.name}</a>`;
  if (html.includes(target)) return html;

  // La variante con ruolo ("…</a>, Co-Founder &amp; Web Developer") va rimossa
  // senza mangiare lo spazio prima del separatore "·" che segue.
  const variants = [
    /Di <a href="\.\.\/chi-siamo\.html" rel="author">[^<]*<\/a>(?:,[^·<]*?)?(?=\s*·)/,
    /Di <a href="\.\.\/chi-siamo\.html" rel="author">[^<]*<\/a>/,
    /Di WebNovis Editorial Team/
  ];
  for (const pattern of variants) {
    if (pattern.test(html)) {
      report.byline += 1;
      return html.replace(pattern, target);
    }
  }
  return html;
}

function main() {
  const files = fs.readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(BLOG_DIR, f));

  const report = { total: 0, touched: 0, dates: 0, skipLink: 0, mainId: 0, fonts: 0, cssVersion: 0, byline: 0 };

  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    report.total += 1;

    let html = original;
    html = fixDates(html, report);
    html = fixSkipLink(html, report);
    html = fixFonts(html, report);
    html = fixCssVersions(html, report);
    html = fixByline(html, report);

    if (html !== original) {
      report.touched += 1;
      if (!DRY_RUN) fs.writeFileSync(file, html, 'utf8');
    }
  }

  console.log(DRY_RUN ? '— DRY RUN, nessun file scritto —' : '— migrazione applicata —');
  console.log(`  file analizzati       ${report.total}`);
  console.log(`  file modificati       ${report.touched}`);
  console.log(`  date corrette         ${report.dates}`);
  console.log(`  skip link aggiunti    ${report.skipLink}`);
  console.log(`  <main id> aggiunti    ${report.mainId}`);
  console.log(`  font resi async       ${report.fonts}`);
  console.log(`  versioni CSS allineate ${report.cssVersion}`);
  console.log(`  byline allineate      ${report.byline}`);
}

main();
