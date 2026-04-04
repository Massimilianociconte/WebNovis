Drop qui i CSV page-level esportati da Google Search Console quando vuoi aggiornare il pruning report.

Flusso consigliato:

1. Esporta da GSC il report pagine con clic, impression, CTR e posizione su 90 giorni.
2. Salva i CSV in questa cartella.
3. Esegui `npm run governance:seo`.
4. Leggi:
   - `docs/seo-strategy/governance-report.md`
   - `docs/seo-strategy/governance-report.json`

Note:

- Il parser cerca in automatico colonne come `Page`, `Pagine`, `URL`, `Clicks`, `Impressions`, `CTR`, `Position`.
- Se vuoi usare un file fuori da questa cartella: `node scripts/build-governance-report.js --gsc=percorso/al/file.csv`
- Il report non applica nuovi `noindex` da solo: propone bucket e candidati.
