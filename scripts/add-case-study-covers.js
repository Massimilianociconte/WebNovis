#!/usr/bin/env node
/**
 * Aggiunge la cover del progetto ai case study che ne sono privi.
 *
 * Situazione rilevata: 11 dei 12 case study non mostravano NESSUNA immagine del
 * progetto nel corpo (solo logo e badge DesignRush) e usavano l'OG image generica
 * del sito invece del mockup del progetto — nonostante i WebP 400/800 esistano già
 * in Img/portfolio/ e siano usati dalle card di /portfolio.html.
 *
 * Lo script replica esattamente il pattern già presente su comeleapi.html:
 *   <section class="case-cover"> + <picture> con srcset 400/800 + CSS .case-cover
 * e allinea og:image / twitter:image al mockup del progetto.
 *
 * Uso: node scripts/add-case-study-covers.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASE_DIR = path.join(ROOT, 'portfolio', 'case-study');
const IMG_DIR = path.join(ROOT, 'Img', 'portfolio');
const SITE = 'https://www.webnovis.com';
const DRY_RUN = process.argv.includes('--dry-run');

// slug del case study -> basename del mockup in Img/portfolio/
const MOCKUPS = {
  'aether-digital': 'aether-digital-mockup',
  arconti31: 'arconti31-mockup',
  comeleapi: 'comeleapi-mockup',
  'ember-oak': 'ember-and-oak-mockup',
  fbtotalsecurity: 'fbtotalsecurity-mockup',
  'lumina-creative': 'lumina-creative-mockup',
  mikuna: 'mikuna-mockup',
  'mimmo-fratelli': 'mimmo-fratelli-mockup',
  'muse-editorial': 'muse-editorial-mockup',
  'popblock-studio': 'pop-block-mockup',
  quickseo: 'quick-seo-mockup',
  'structure-arch': 'structure-architecture-mockup'
};

const ALT_TEXT = {
  'aether-digital': 'Mockup del sito Aether Digital su laptop e tablet',
  arconti31: 'Mockup del sito Arconti 31 su laptop e tablet',
  'ember-oak': 'Mockup del sito Ember & Oak su laptop e tablet',
  fbtotalsecurity: 'Mockup del sito FB Total Security su laptop e tablet',
  'lumina-creative': 'Mockup del sito Lumina Creative su laptop e tablet',
  mikuna: 'Mockup del sito Mikuna su laptop, tablet e biglietto da visita',
  'mimmo-fratelli': "Mockup dell'e-commerce Mimmo Fratelli su laptop e tablet",
  'muse-editorial': 'Mockup del sito Muse Editorial su laptop e tablet',
  'popblock-studio': 'Mockup del sito PopBlock Studio su laptop e tablet',
  quickseo: 'Mockup della web app QuickSEO su laptop e tablet',
  'structure-arch': 'Mockup del sito Structure Architecture su laptop e tablet'
};

const COVER_CSS = ".case-cover{padding:0 0 4rem}.case-cover picture,.case-cover img{display:block;width:100%}.case-cover img{height:auto;border-radius:20px;border:1px solid rgba(255,255,255,.08);box-shadow:0 28px 80px rgba(0,0,0,.32)}";

/** Legge width/height dall'header WebP: evita CLS e dipendenze esterne. */
function webpSize(file) {
  const buf = Buffer.alloc(40);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, buf, 0, 40, 0);
  fs.closeSync(fd);
  const format = buf.toString('ascii', 12, 16);
  if (format === 'VP8X') {
    return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  }
  if (format === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (format === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

function buildCoverSection(slug, project, size) {
  const alt = ALT_TEXT[slug] || `Mockup del progetto ${project}`;
  return `<section class="case-cover" aria-label="Anteprima del progetto ${project}"> <div class="container case-shell">`
    + ` <picture> <source type="image/webp" srcset="../../Img/portfolio/${MOCKUPS[slug]}-400.webp 400w, ../../Img/portfolio/${MOCKUPS[slug]}-800.webp 800w" sizes="(max-width: 860px) 100vw, 800px">`
    + ` <img src="../../Img/portfolio/${MOCKUPS[slug]}-800.webp" width="${size.width}" height="${size.height}" alt="${alt}" loading="eager" fetchpriority="high" decoding="async">`
    + ` </picture> </div> </section>`;
}

/** Sostituisce il valore di un <meta> qualunque sia l'ordine degli attributi. */
function setMetaContent(html, key, value) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*(?:property|name)=["']${key}["'])[^>]*>`, 'i');
  const tag = pattern.exec(html);
  if (!tag) return html;
  const updated = tag[0].replace(/content=(["'])[^"']*\1/i, `content="${value}"`);
  return html.replace(tag[0], updated);
}

function main() {
  const report = { total: 0, cover: 0, css: 0, og: 0, skipped: [] };

  for (const [slug, mockup] of Object.entries(MOCKUPS)) {
    const file = path.join(CASE_DIR, `${slug}.html`);
    if (!fs.existsSync(file)) { report.skipped.push(`${slug}: html mancante`); continue; }

    const imgFile = path.join(IMG_DIR, `${mockup}-800.webp`);
    if (!fs.existsSync(imgFile)) { report.skipped.push(`${slug}: ${mockup}-800.webp mancante`); continue; }

    const size = webpSize(imgFile);
    if (!size) { report.skipped.push(`${slug}: dimensioni WebP illeggibili`); continue; }

    const original = fs.readFileSync(file, 'utf8');
    let html = original;
    report.total += 1;

    const project = (/<h1[^>]*>([^:<]+)/.exec(html) || [, slug])[1].trim();

    if (!/class="case-cover"/.test(html)) {
      // Inserita subito dopo la chiusura della hero, come su comeleapi.html.
      const heroIdx = html.indexOf('class="case-hero"');
      const anchor = heroIdx >= 0 ? html.indexOf('</section>', heroIdx) : -1;
      if (anchor < 0) {
        report.skipped.push(`${slug}: <section class="case-hero"> non trovata`);
      } else {
        const at = anchor + '</section>'.length;
        html = `${html.slice(0, at)} ${buildCoverSection(slug, project, size)}${html.slice(at)}`;
        report.cover += 1;
      }
    }

    if (!html.includes('.case-cover{')) {
      html = html.replace(/(<style>)(\.case-hero)/, (_m, open, rest) => `${open}${COVER_CSS}${rest}`);
      if (html.includes('.case-cover{')) report.css += 1;
      else report.skipped.push(`${slug}: CSS .case-cover non iniettato`);
    }

    const coverUrl = `${SITE}/Img/portfolio/${mockup}-800.webp`;
    if (!html.includes(`content="${coverUrl}"`)) {
      html = setMetaContent(html, 'og:image', coverUrl);
      html = setMetaContent(html, 'twitter:image', coverUrl);
      if (html.includes(coverUrl)) report.og += 1;
    }

    if (html !== original && !DRY_RUN) fs.writeFileSync(file, html, 'utf8');
  }

  console.log(DRY_RUN ? '— DRY RUN, nessun file scritto —' : '— cover applicate —');
  console.log(`  case study elaborati ${report.total}`);
  console.log(`  cover aggiunte       ${report.cover}`);
  console.log(`  CSS iniettato        ${report.css}`);
  console.log(`  og/twitter image     ${report.og}`);
  if (report.skipped.length) {
    console.log('  saltati:');
    report.skipped.forEach((s) => console.log(`    - ${s}`));
  }
}

main();
