#!/usr/bin/env node
/**
 * Corregge il nodo ImageObject dei case study.
 *
 * Due difetti sistematici trovati in audit:
 *   1. width/height dichiarati 800x600 su TUTTI i case study, mentre i WebP
 *      reali sono 800x441 (800x498 per mimmo-fratelli). Le dimensioni nello
 *      schema vanno lette dal file, non copiate da un template.
 *   2. caption che descrive un business diverso da quello del case study:
 *      - mikuna         -> "brand alimentazione naturale"  (è un ristorante peruviano a Varese)
 *      - arconti31      -> "portfolio fotografico"          (è un pub storico a Gallarate)
 *      - mimmo-fratelli -> "ristorante tradizionale"        (è un e-commerce ortofrutta)
 *
 * Uso: node scripts/fix-case-study-image-schema.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CASE_DIR = path.join(ROOT, 'portfolio', 'case-study');
const IMG_DIR = path.join(ROOT, 'Img', 'portfolio');
const DRY_RUN = process.argv.includes('--dry-run');

const MOCKUPS = {
  'aether-digital': 'aether-digital-mockup',
  arconti31: 'arconti31-mockup',
  comeleapi: 'comeleapi-mockup',
  'ember-oak': 'ember-&-oak-mockup',
  fbtotalsecurity: 'fbtotalsecurity-mockup',
  'lumina-creative': 'lumina-creative-mockup',
  mikuna: 'mikuna-mockup',
  'mimmo-fratelli': 'mimmo-fratelli-mockup',
  'muse-editorial': 'muse-editorial-mockup',
  'popblock-studio': 'pop-block-mockup',
  quickseo: 'quick-seo-mockup',
  'structure-arch': 'structure-architecture-mockup'
};

// Solo le caption oggettivamente sbagliate: le altre restano come sono.
const CAPTION_FIXES = {
  mikuna: 'Sito web per Mikuna, ristorante peruviano a Varese — realizzato da Web Novis, Rho',
  arconti31: 'Sito web per Arconti 31, pub storico a Gallarate — realizzato da Web Novis, Rho',
  'mimmo-fratelli': 'E-commerce per Mimmo Fratelli, negozio di ortofrutta — realizzato da Web Novis, Rho',
  // La pagina descrive un ristorante fine dining da 28 coperti, non un brand di arredamento.
  'ember-oak': 'Sito web per Ember & Oak, ristorante fine dining — realizzato da Web Novis, Rho'
};

function webpSize(file) {
  const buf = Buffer.alloc(40);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, buf, 0, 40, 0);
  fs.closeSync(fd);
  const format = buf.toString('ascii', 12, 16);
  if (format === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  if (format === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (format === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  return null;
}

function main() {
  const report = { size: 0, caption: 0, skipped: [] };

  for (const [slug, mockup] of Object.entries(MOCKUPS)) {
    const file = path.join(CASE_DIR, `${slug}.html`);
    const imgFile = path.join(IMG_DIR, `${mockup}-800.webp`);
    if (!fs.existsSync(file) || !fs.existsSync(imgFile)) { report.skipped.push(slug); continue; }

    const size = webpSize(imgFile);
    if (!size) { report.skipped.push(`${slug} (dimensioni illeggibili)`); continue; }

    const original = fs.readFileSync(file, 'utf8');
    let html = original;

    // Il blocco ImageObject è un JSON-LD compatto: patch mirata sui due campi.
    html = html.replace(
      /("@type":"ImageObject"[\s\S]{0,1200}?)"width":\s*\d+,\s*"height":\s*\d+/,
      (_m, head) => {
        report.size += 1;
        return `${head}"width":${size.width},"height":${size.height}`;
      }
    );

    const caption = CAPTION_FIXES[slug];
    if (caption) {
      html = html.replace(
        /("@type":"ImageObject"[\s\S]{0,1200}?"caption":")([^"]*)(")/,
        (_m, head, _old, tail) => {
          report.caption += 1;
          return `${head}${caption}${tail}`;
        }
      );
    }

    if (html !== original && !DRY_RUN) fs.writeFileSync(file, html, 'utf8');
  }

  console.log(DRY_RUN ? '— DRY RUN, nessun file scritto —' : '— schema immagini corretto —');
  console.log(`  width/height allineati ${report.size}`);
  console.log(`  caption corrette       ${report.caption}`);
  if (report.skipped.length) console.log(`  saltati: ${report.skipped.join(', ')}`);
}

main();
