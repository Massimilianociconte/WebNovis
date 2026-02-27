# Scripts Legacy (Deprecati)

Questi script sono stati sostituiti dalla pipeline pSEO unificata (`scripts/generate-all-geo.js`).

**NON usare questi script** — sono mantenuti solo come riferimento storico.

| Script | Sostituito da | Data deprecazione |
|---|---|---|
| `generate-city-pages.js` | `scripts/generate-all-geo.js` (tipo: realizzazione) | 2026-02-27 |
| `gen-geo-pages.js` | `scripts/generate-all-geo.js` (tipo: agenzia) | 2026-02-27 |
| `gen-accessibilita.js` | `scripts/generate-all-geo.js` (tipo: servizio×città) | 2026-02-27 |
| `gen-pillar-articles.js` | `blog/auto-writer.js` + `topics-queue.json` | 2026-02-27 |

## Pipeline attuale

```bash
npm run build:geo          # Genera tutte le pagine geo (agenzia + realizzazione + servizio×città + hub)
npm run build:ai-content   # Genera contenuto AI unico per ogni città
npm run ci:quality         # Pipeline completa con validazione
```
