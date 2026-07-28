#!/usr/bin/env node
/**
 * Rimuove dalle tabelle "Risultati Misurabili" le righe che contraddicono
 * il progetto descritto nella pagina stessa.
 *
 *   - mikuna.html    → ristorante peruviano a Varese con menu interattivo e
 *                      prenotazione: la pagina non descrive nessuna vendita
 *                      online, ma la tabella dichiarava "Tempo checkout",
 *                      "Tasso di conversione", "Valore medio ordine" e
 *                      "Ordini ricorrenti", con nota "GA4 Enhanced E-commerce".
 *   - ember-oak.html → ristorante fine dining da 28 coperti: la tabella
 *                      dichiarava "Carrelli abbandonati" e "Ordini/mese".
 *
 * Restano solo le righe di performance tecnica, coerenti con quanto la pagina
 * racconta. Nessun numero viene inventato o sostituito.
 *
 * Uso: node scripts/fix-case-study-incoherent-metrics.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const CASE_DIR = path.resolve(__dirname, '..', 'portfolio', 'case-study');
const DRY_RUN = process.argv.includes('--dry-run');

const PLAN = {
  'mikuna.html': {
    dropRows: ['Tempo checkout completo', 'Tasso di conversione', 'Valore medio ordine', 'Ordini ricorrenti'],
    intro: 'Confronto delle performance tecniche del sito prima e dopo il lancio.',
    note: 'Performance misurate con Google PageSpeed Insights. Il sito non gestisce ordini online: non pubblichiamo metriche e-commerce per questo progetto.'
  },
  'ember-oak.html': {
    dropRows: ['Tasso di conversione', 'Carrelli abbandonati', 'Ordini/mese'],
    // "pagina prodotto" è terminologia e-commerce: su un ristorante la pagina
    // equivalente è il menu. Cambia l'etichetta, non il dato.
    renameRows: { 'Tempo caricamento pagina prodotto': 'Tempo caricamento pagina menu' },
    intro: 'Confronto delle performance tecniche del sito prima e dopo il lancio.',
    note: 'Performance misurate con Google PageSpeed Insights. Il sito è una vetrina con prenotazione: non pubblichiamo metriche e-commerce per questo progetto.'
  }
};

/** Rimuove la <tr> la cui prima cella inizia con `label`. */
function dropTableRow(html, label) {
  const rows = html.match(/<tr>[\s\S]*?<\/tr>/gi) || [];
  for (const row of rows) {
    const firstCell = /<td[^>]*>([\s\S]*?)<\/td>/i.exec(row);
    if (!firstCell) continue;
    const text = firstCell[1].replace(/<[^>]+>/g, '').trim();
    if (text.startsWith(label)) return html.replace(row, '');
  }
  return html;
}

function main() {
  let touched = 0;
  for (const [file, plan] of Object.entries(PLAN)) {
    const full = path.join(CASE_DIR, file);
    if (!fs.existsSync(full)) { console.log(`  ⚠ ${file} non trovato`); continue; }

    const original = fs.readFileSync(full, 'utf8');
    let html = original;
    const removed = [];

    for (const label of plan.dropRows) {
      const before = html;
      html = dropTableRow(html, label);
      if (html !== before) removed.push(label);
    }

    for (const [from, to] of Object.entries(plan.renameRows || {})) {
      html = html.split(from).join(to);
    }

    // Intro: non parliamo più di "business metrics" se restano solo quelle tecniche.
    html = html.replace(
      /(<h2>Risultati Misurabili[^<]*<\/h2><p[^>]*>)([^<]*)(<\/p>)/i,
      (_m, open, _old, close) => `${open}${plan.intro}${close}`
    );

    // Nota metodologica: via il riferimento a GA4 Enhanced E-commerce.
    html = html.replace(
      /(font-style:italic">)([^<]*)(<\/p>)/i,
      (_m, open, _old, close) => `${open}${plan.note}${close}`
    );

    if (html !== original) {
      touched += 1;
      if (!DRY_RUN) fs.writeFileSync(full, html, 'utf8');
      console.log(`  ✅ ${file} — righe rimosse: ${removed.join(', ') || 'nessuna'}`);
    } else {
      console.log(`  = ${file} — già coerente`);
    }
  }
  console.log(DRY_RUN ? `— DRY RUN — ${touched} file da modificare` : `— applicato a ${touched} file —`);
}

main();
