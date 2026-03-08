# SEO Strategy Docs

Questa cartella raccoglie documentazione strategica e report SEO/GEO del progetto WebNovis. Non tutti i file hanno lo stesso peso operativo: alcuni sono piani attivi, altri sono audit storici o materiale di ricerca.

## Fonti operative principali

| File | Uso consigliato |
|------|------------------|
| `../IMPLEMENTATION-BACKLOG-2026-03-08.md` | Fonte primaria per backlog tecnico verificato sul codice. |
| `PIANO-STRATEGICO-SEO-2026.md` | Piano di medio periodo per priorita`, cluster e roadmap. |
| `KEYWORD-RESEARCH-REPORT-2026.md` | Base keyword, intent mapping e supporto editoriale. |
| `TOPIC-CLUSTER-SVILUPPO-WEB.md` | Struttura editoriale del cluster sviluppo web. |
| `REPORT-IMPLEMENTAZIONE-AUDIT-UNIFICATO.md` | Storico implementativo utile per ricostruire fix gia` eseguiti. |

## Documenti storici o di supporto

| File | Nota |
|------|------|
| `SEO-AUDIT.md` | Audit ampio, ma precedente ai refactor recenti su header, footer e regression test. |
| `REPORT-SEO-AVANZATO-2026.md` | Valido come analisi strategica, non come checklist tecnica puntuale. |
| `SEO-GEO.MD` | Documento di indirizzo, da verificare sempre sul codice prima di applicarlo. |
| `AUDIT-SEO-BRUTALE-WEBNOVIS.md` | Review critica storica, utile solo come confronto. |
| `WEBSITE-AUDIT-REPORT.md` | Audit trasversale non allineato in ogni dettaglio allo stato attuale del repo. |

## Materiale raw o derivato

I file `.txt`, `.pdf`, `.json` e gli export esterni presenti in questa cartella vanno trattati come input di lavoro o archivio, non come documentazione finale.

## Regole di manutenzione

- Quando un audit viene superato da fix reali nel repository, aggiornarlo o spostarlo in archivio.
- I documenti attivi devono descrivere stato verificabile nel codice o nella pipeline.
- Tutta la documentazione sotto `docs/` resta esclusa dal crawling pubblico.
