# Report Fix SEO/GEO WebNovis — Cluster P1–P4 (2026-08-04)

Branch: `codex/seo-geo-fixes-20260804`
Commit di riferimento: `a62f3006` (P1), `150a073d` (P4)
Pipeline: `npm run ci:quality:dist` **VERDE** (exit 0) — 1330 file artefatto, 1152 HTML pubblicati, 355 URL in sitemap, 791 pagine noindex, 24 test di regressione + seo-smoke + API PASS.

---

## 1. Registro evidenze e decisioni

| # | Voce | Evidenza | Decisione / Stato |
|---|------|----------|-------------------|
| 1 | Prezzi P4 | Catalogo esistente (vetrina €1.200, e-commerce €3.500, landing €500, SEO €400/mese, manutenzione €59/mese) | Prezzi presentati come **punti di partenza** ("da") nelle nuove pagine — nessun dato inventato |
| 2 | Stringhe esatte | Pagine e copy attuali del sito | Stringhe esatte tra virgolette **non modificabili** (regola vincolante); titoli/FAQ esistenti mantenuti |
| 3 | Stati SEO | Concorrenza GSC/ricerche non verificabili (no accesso dati) | Tutti gli stati dichiarati come **Rilevato → Monitorato**, mai "Risolto" senza conferma |
| 4 | "Bot AI bloccati" | Claim cliente, non verificabile in GSC | **NON confermato** — registrato come claim da verificare |
| 5 | "87 URL /agenzia-web/ in 404" | Non verificabile in GSC | **NON confermato** — registrato come claim da verificare |
| 6 | Baseline GSC | Nessun dato storico estratto | **NON VERIFICABILI** — il monitoraggio parte da zero dopo l'implementazione |
| 7 | P2: pagine stesse intenzione geo Milano | 5 pagine con intenzione "SEO Milano" sovrapposta (es. agenzia-web-milano, seo-milano) | Canonical self confermati; **monitorare in GSC** quale pagina viene servita per le query "SEO Milano" |
| 8 | "crawl budget" | Vocabolario vietato dal test `editorial-language` | Termine rimosso dal copy commerciale di `seo-milano` |
| 9 | CI dist rotta a HEAD (pre-esistente) | `scripts/prepare-public-artifact.js` non copiava `js/site-config.js` → "Missing runtime references (1143)" | Fix applicato: `copyFile js/site-config.js → staging/js/site-config.js` |
| 10 | Idempotenza CI rotta (pre-esistente, `275b4e2a`) | Iniezione `site-config` mai normalizzata nella root → dry-run normalizzava anche su main pulito | Pipeline ora idempotente: `normalize` → "Normalized 0" |
| 11 | Incidente: perdita file P4 | Checkout accidentale di `main` dopo drop dello stash `-u` | File recuperati integralmente da `dist/` promossa (contenuto completo, robots `index, follow`) e ri-applicati gli edit codice |
| 12 | 1163 HTML riallineati | Root non allineata a `normalize-public-html.js` (prefissi `../../../js/` + injection site-config) | Riallineamento committato in `150a073d`; testo visibile **identico** su 1162/1163 (unico diff: title di `agenzia-web-rho.html` riallineato dalla build da `src/html/`, drift preesistente) |
| 13 | Search index vs sitemap | Mismatch dopo aggiunta `quanto-costa-un-sito-web/` | `build-search-index.js`: `PUBLIC_SUBDIRS` aggiornato → **0 missing / 0 extra** |
| 14 | Inventario HTML | 1148 → 1152 pagine | Test `html-structure-regressions` aggiornato e PASS post-commit |

---

## 2. Tabella diff — interventi per cluster

| Cluster | Intervento | File | Prima | Dopo |
|---------|-----------|------|-------|------|
| **P1** (`a62f3006`) | Title homepage | `index.html` | — | `Web Agency Milano \| WebNovis - Siti Web Custom per PMI` |
| P1 | FAQ + JSON-LD FAQPage | `index.html` | FAQ senza schema | FAQ visibili + FAQPage JSON-LD (6 JSON-LD validi) |
| P1 | Title blog social / e-commerce | `blog/*`, `servizi/ecommerce-*.html` | — | Title geo-coerenti |
| P1 | H1 pagina Rho | `agenzia-web-rho.html` | — | H1 allineato (assert aggiornata in `tests/seo-regressions.test.js`) |
| **P2** | Pagine stesse intenzione geo Milano | `servizi/*`, `agenzia-web-milano.html` | — | Documentate con canonical self → **monitorare in GSC** |
| **P4** (`150a073d`) | Nuova pagina SEO Milano | `servizi/seo-milano.html` (+ `src/html/servizi/`) | assente | Title `SEO a Milano per PMI: Posizionamento Locale \| WebNovis`; Service schema €400/mese; FAQPage 3Q; 270→**311 parole uniche**; meta desc 159 char; robots `index, follow`; senza "crawl budget" |
| P4 | Nuova pagina costi | `quanto-costa-un-sito-web/index.html` (+ `src/html/quanto-costa-un-sito-web/`) | assente | Title `Quanto Costa un Sito Web nel 2026? Prezzi da €500`; tabella prezzi di partenza €500/€1.200/€3.500; FAQPage 4Q; BreadcrumbList; robots `index, follow` |
| P4 | Fix CI dist | `scripts/prepare-public-artifact.js` | site-config mancante (1143 riferimenti rotti) | site-config copiato in staging; CI **VERDE** |
| P4 | Search index | `build-search-index.js` | mismatch sitemap/index | 0 missing / 0 extra; entry indexable `page` |
| P4 | Test inventario | `tests/html-structure-regressions.test.js` | 1148 | 1152 |
| P4 | Artefatti rigenerati | `sitemap.xml`, `search-index.json`, `search-ai-index.json`, `llms-full.txt`, `data/content-lastmod.json`, `data/geo-page-dates.json` | — | 355 URL sitemap; `llms-full.txt` **41 sezioni** (`llms-export-regressions` PASS) |

---

## 3. Report stati — Rilevato → Monitorato

| Finding | Stato | Note |
|---------|-------|------|
| Homepage senza title/meta/H1 geo-ottimizzati | Rilevato → **Corretto** (P1) | Verificato su artefatto promosso |
| FAQ homepage senza schema | Rilevato → **Corretto** (P1) | 6 JSON-LD validi |
| Pagine "SEO Milano" assenti | Rilevato → **Corretto** (P4) | `servizi/seo-milano.html` pubblicata |
| Nessuna pagina sui costi (intento "quanto costa") | Rilevato → **Corretto** (P4) | `quanto-costa-un-sito-web/` pubblicata |
| CI dist rotta a HEAD | Rilevato → **Corretto** (P4) | `ci:quality:dist` exit 0 |
| Sovrapposizione intenzione geo Milano (5 pagine) | Rilevato → **Monitorato** | Canonical self OK; follow-up in GSC |
| Claim "bot AI bloccati" | Rilevato → **Non confermato** | Da verificare in GSC |
| Claim "87 URL /agenzia-web/ 404" | Rilevato → **Non confermato** | Da verificare in GSC |
| Baseline GSC | Rilevato → **Non verificabile** | Monitoraggio da avviare post-pubblicazione |

---

## Follow-up consigliati

1. **Pubblicazione**: merge/rilascio del branch e verifica del deploy (pipeline CI dist).
2. **GSC**: richiedere l'indicizzazione delle 2 nuove pagine; impostare monitoraggio 2-4 settimane per le query "SEO Milano" e "quanto costa un sito web".
3. **P2**: confrontare in GSC quali pagine vengono servite per le query geo Milano sovrapposte; valutare consolidamento se emergono cannibalizzazioni.
4. **Aggiornamento conteggi**: se il conteggio inventario (1152) o `llms-full.txt` (41 sezioni) cambia, aggiornare i test prima della prossima release.
