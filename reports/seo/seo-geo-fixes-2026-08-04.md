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
| Claim "bot AI bloccati" | Rilevato → **Smentito per il presente** | `robots.txt` consente esplicitamente GPTBot, OAI-SearchBot e tutti i crawler AI (`Allow: /`, `Allow: /llms-full.txt`). Nessun blocco attivo |
| Claim "87 URL /agenzia-web/ 404" | Rilevato → **Non confermato** | Da verificare in GSC |
| Baseline GSC | Rilevato → **Non verificabile** | Monitoraggio da avviare post-pubblicazione |
| Schema Service "€400/mese" | Rilevato → **Corretto** (`86a92f62`) | `Offer.price` fisso → `priceSpecification` con `minPrice` 400 + `unitCode` MON, coerente con il visibile "da €400/mese" |

---

## Controlli di accettazione pre-merge (12 punti)

Eseguiti sul branch dopo la valutazione; 10/12 superati, 2 gap aperti. Chiusi in `c24dd4b6` i gap "Internal linking" e "Incoerenza tempistiche"; resta aperta solo la strategia anti-cannibalizzazione Milano (dipendente da dati GSC).

| # | Controllo | Esito |
|---|-----------|-------|
| 1 | Fresh clone: `npm ci` + `ci:quality:dist` + `git status`/`git diff --exit-code` | ✅ **PASS** — CI verde e repository immutato dalla pipeline (idempotenza reale) |
| 2 | Revisione manuale sorgenti recuperate da dist/ | ✅ **PASS** — pagine complete (CTA, FAQ, prezzi, link interni in pagina); ⚠ incoerenza minore: intro "consegna 2-6 settimane" vs FAQ "3-4 settimane" in `quanto-costa-un-sito-web` |
| 3 | Audit diff non-testuale dei 1163 HTML | ✅ **PASS** — canonical/robots/description/OG/JSON-LD/href/hreflang/data-attr identici su 1161 file; 2 blog: FAQPage 7→6 domande (rimossa dal JSON-LD una voce che era un CTA, non una FAQ) |
| 4 | Claim prezzi e "performance garantite" | ✅ **PASS** — "performance garantite" assente dal repo; €400/€500/€80/€1.200/€3.500/€500/€59 tutti confermati in `data/services.json` |
| 5 | Schema Service €400/mese | ✅ **CORRETTO** (`86a92f62`) — `priceSpecification` minPrice 400 EUR, `unitCode` MON; CI dist rilanciata verde dopo la correzione |
| 6 | JSON-LD vs contenuto visibile | ✅ **PASS** — FAQPage 3/3 e 4/4 coincidenti con le FAQ visibili; BreadcrumbList coerenti |
| 7 | Link interni verso le 2 nuove pagine | ✅ **CHIUSO** (`c24dd4b6`) — 12 link editoriali aggiunti: card `servizi/index.html` → seo-milano; consulenze, sviluppo-web (×2), seo-locale-milano, agenzia-web-milano, blog marketing-digitale-attivita-locali-milano, blog quanto-costa-un-sito-web, blog quanto-costa-un-ecommerce (via `config/seo-html-transforms.js`, sopravvive alla rigenerazione), blog come-scegliere-web-agency, seo-milano ↔ quanto-costa-un-sito-web (reciproci). Test `internal-linking` PASS |
| 8 | Mappa pagine Milano | ⚠ **PARZIALE** — 3 pagine index con intenzione "SEO Milano" sovrapposta: `servizi/seo-milano.html` (nuova, primaria proposta), `seo-locale-milano.html` (Tier2), `agenzia-web-milano.html` (Tier2, supporter). Le varianti Milano Nord/Ovest hanno intenzione geografica distinta e non cannibalizzano "Milano" puro. Strategia di differenziazione da definire con dati GSC |
| 9 | Audit 791 noindex | ✅ **PASS** — la quasi totalità sono pagine geo pSEO auto-de-amplificate dalla governance (`AUTO_DEAMPLIFIED_GEO_PATHS`), più test/utility/archive; nessun pattern anomalo di pagine commerciali non indicizzate |
| 10 | OAI-SearchBot / GPTBot | ✅ **PASS** — robots.txt: entrambi `Allow: /` (stessi confini del gruppo generico); il claim "bot AI bloccati" è smentito per il presente |
| 11 | llms-full.txt | ✅ **PASS** — 41 sezioni, 43 URL, **0 URL noindex**, nessun duplicato; generazione byte-deterministica (test dedicato) |
| 12 | Sitemap vs URL indicizzabili | ✅ **PASS** — 355 URL, 0 noindex, 0 duplicati; search-index con 0 missing/extra |

### Gap aperti prima del merge

1. **Internal linking** (controllo 7): ✅ **CHIUSO** in `c24dd4b6` — 12 link editoriali (vedi tabella); i link per i blog con aside money-links rigenerato vanno aggiunti in `config/seo-html-transforms.js` (single source of truth), non nell'HTML.
2. **Strategia anti-cannibalizzazione Milano** (controllo 8): ⏳ **APERTO** — stabilire pagina primaria per "SEO Milano" tra `servizi/seo-milano.html`, `seo-locale-milano.html`, `agenzia-web-milano.html` e differenziare title/contenuti. Senza dati GSC non è possibile chiudere; proposta: primaria `servizi/seo-milano.html`, `seo-locale-milano.html` orientata alle ricerche "SEO locale Milano quartieri", `agenzia-web-milano.html` già supporter.
3. **Incoerenza tempistiche** (controllo 2): ✅ **CHIUSA** — intro e FAQ visibile + JSON-LD ora dicono "2-3 settimane per un sito vetrina standard, intervallo complessivo 2-6 settimane", allineati a `data/services.json` (`sito-vetrina.timeEstimate` = "2-3 settimane"). Prima del fix erroneamente scritto "3-4 settimane".

---

## Correzioni post-review (feedback su PR #3)

| Punto reviewer | Stato | Commit |
|---|---|---|
| `twitter:title/description` errati su **entrambe** le landing (erede "Realizzazione Siti Web") | ✅ **CHIUSY** — allineati a `<title>`/og: su `servizi/seo-milano.html` e `quanto-costa-un-sito-web/index.html` | `f36fd16c` |
| Soglie recensioni non documentate (30-50, rating 4.2) | ✅ **CHIUSO** — riformulati in "stime indicative" con rating "alto (>4,0)" e disclaimer "dipendono da settore e concorrenza"; visibile e FAQ JSON-LD allineati | `f36fd16c` |
| Claim "SEO superiore media competitor" non dimostrato | ✅ **CHIUSO** — "già superiore alla media dei competitor" → "strutturalmente solida", in `quanto-costa-un-sito-web` (visibile + JSON-LD) e `servizi/sito-vetrina` | `39bba0db` |
| Promesse SEO €400 (report/monitoraggio/revisione trimestrale) | ✅ **VERIFICATE** — già presenti nella sezione Reporting di `seo-milano`; "report mensile", "monitoraggio continuo" e "revisione trimestrale" sono documentati | nessun fix |
| Tempistiche 3-4 settimane vs catalogo 2-3 | ✅ **CHIUSA** — see punto tempo sopra | `f36fd16c` |
| Aggiungere test specifici (social, claim, tempistiche) | ✅ **CHIUSO** — aggiunti guard-rail in `tests/seo-regressions.test.js`: `social-meta` (twitter title/description ≠ template, keyword-sharing), `claim` (nessun "4.2"/"superiore media"), `estimate` (nessun "3-4 settimane", allineamento `services.json`) | `f36fd16c` |
| Coerenza tempistiche claim su `servizi/sito-vetrina.html` (out diff PR) | ✅ **CHIUSA** — "3-4 settimane" → "2-3 settimane" (visibile + FAQ) e claim "superiore media" → "strutturalmente solida"; estesi i guard-rail `claimAuditPages` e `estimatePages` a questa landing | `2464d05b`

> Il claim su `servizi/sito-vetrina.html` (fuori diff PR originale) è stato corretto per coerenza editoriale: "3-4 settimane" → "2-3 settimane" e "superiore media competitor" → "strutturalmente solida"; commit `2464d05b`.

---

## Follow-up consigliati

1. **Pubblicazione**: merge/rilascio del branch e verifica del deploy (pipeline CI dist).
2. **GSC**: richiedere l'indicizzazione delle 2 nuove pagine; impostare monitoraggio 2-4 settimane per le query "SEO Milano" e "quanto costa un sito web".
3. **P2**: confrontare in GSC quali pagine vengono servite per le query geo Milano sovrapposte; valutare consolidamento se emergono cannibalizzazioni.
4. **Aggiornamento conteggi**: se il conteggio inventario (1152) o `llms-full.txt` (41 sezioni) cambia, aggiornare i test prima della prossima release.
5. **Merge**: gap residuo solo sulla mappa Milano (in attesa GSC); internal linking e tempistiche chiusi in `c24dd4b6`. Approvare la PR con il gap documentato e follow-up pianificato, oppure attendere i dati GSC.
