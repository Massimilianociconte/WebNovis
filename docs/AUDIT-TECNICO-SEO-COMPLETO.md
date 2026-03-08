# AUDIT TECNICO SEO — WebNovis

Data aggiornamento: 2026-03-08

## Stato attuale

La codebase WebNovis resta un sito statico servito da Express con alcune API Node.js per chatbot, newsletter e lead capture. L'architettura non e` ancora stata modularizzata del tutto, ma diversi problemi segnalati negli audit di febbraio non sono piu` attuali.

## Cosa e` stato chiuso nel repository

- I security header sono centralizzati in `config/security-headers.js`.
- Il file `_headers` viene sincronizzato via `scripts/sync-security-headers.js`.
- Esiste una suite di regression test dedicata a SEO, security/legal, template immagini, footer e widget loader.
- Le pagine pubbliche non hardcodano piu` il widget DesignRush esterno: il caricamento passa da `js/designrush-loader.js`.
- La generazione geo usa template base dedicati e supporta `PUBLISH_DIR` nel generatore principale.
- Sono stati corretti broken internal link noti, normalizzazioni HTML ricorrenti e la presenza di URL non canoniche in sitemap.

## Rischi ancora aperti

1. `server.js` resta monolitico e accorpa troppe responsabilita`.
2. La pipeline di build/pubblicazione non e` ancora interamente orientata a un output separato.
3. Le prestazioni mobile della homepage restano il principale margine tecnico aperto.
4. La documentazione e` ancora rumorosa: audit attivi, report storici e dump raw convivono nello stesso albero.
5. La conformita` reale degli header va sempre verificata sul dominio esposto, non solo nel codice sorgente.

## Priorita` operative aggiornate

| Priorita` | Azione | Obiettivo |
|-----------|--------|-----------|
| P0 | Modularizzare `server.js` | Ridurre accoppiamento backend e rischio regressioni |
| P0 | Consolidare il publish flow | Rendere coerente tutta la toolchain su output dedicato |
| P1 | Eseguire `npm run verify:prod-headers` sul deploy reale | Verificare delivery effettiva degli header |
| P1 | Separare docs attive da archivio raw | Ridurre drift documentale |
| P2 | Ottimizzare hero mobile e runtime JS | Ridurre LCP/CLS e jank sopra la piega |
| P2 | Aggiungere smoke test su output `dist` | Coprire esplicitamente il percorso di publish |

## Nota di lettura

Questo file non va piu` considerato un audit storico di febbraio: e` una sintesi tecnica aggiornata usabile come checkpoint del repository dopo i refactor e i regression fix eseguiti a marzo 2026.
