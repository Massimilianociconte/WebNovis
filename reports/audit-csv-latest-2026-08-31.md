# REPORT ESECUZIONE AUDIT CSV — 31 agosto 2026

Esecuzione del **Report Master v4.0** sui CSV di `latest-audit/`. Output attesi consegnati:
**Task 0.1 (riconciliazione)** + **§6 analisi file per file** + **§6.8 tabella maestra**.
Verifiche live (curl, sola lettura) eseguite l'31/08/2026 su webnovis.com dove il protocollo lo richiedeva.

---

## TASK 0.1 — IDENTIFICAZIONE DEI FILE E TABELLA DI RICONCILIAZIONE

### Inventario allegati (12 file CSV in 5 cartelle)

| File / cartella | Fonte | Contenuto | Periodo | Stato |
| :-- | :-- | :-- | :-- | :-- |
| `webnovis.com-Performance-on-Search-2026-08-31/` | GSC | Performance Web: Grafico, Query (1000 righe), Pagine (232), Dispositivi, Paesi (109), Aspetto ricerca | Ultimi 28 gg (02/08→29/08) | ✔ completo |
| `webnovis.com-Performance-on-Search-Generative-AI-Features-2026-08-31/` | GSC | Impressioni AI Overview / AI Mode (Grafico, Pagine, Dispositivi, Paesi — **senza colonne clic**) | Ultimi 3 mesi (30/05→29/08) | ✔ — **dati nuovo, non presente nel Master v4.0** |
| `webnovis.com-Coverage-Drilldown-2026-08-31/` | GSC | **Non trovata (404)** — 500 URL + serie giornaliera | 05/06→21/08 | ✔ |
| `webnovis.com-Coverage-Drilldown-2026-08-31 (1)/` | GSC | **Bloccata da robots.txt** — 29 URL + serie | 05/06→21/08 | ✔ |
| `webnovis.com-Coverage-Drilldown-2026-08-31 (2)/` | GSC | **Pagina alternativa con canonical appropriato** — 6 URL + serie | 05/06→21/08 | ✔ |
| `SearchPerformanceOverview_All` | Bing WMT | Serie temporale giornaliera | 31/05→29/08 | ✔ |
| `PageTrafficReport` | Bing WMT | 64 pagine, 583 imp | periodo BWT | ✔ |
| `KeywordReport` | Bing WMT | 226 query, 462 imp, 12 clic | periodo BWT | ✔ |
| `AIPageStatsReport` | Bing WMT | 57 pagine, **882 citazioni** (somma verificata) | periodo BWT | ✔ |
| `AISearchQueriesReport` | Bing WMT | 9 grounding query con citation share | periodo BWT | ✔ |
| `combined_search_report` | (merge utente) | concatenazione Overview + AIQueries | — | duplicato, nessun dato extra |
| `combined_page_traffic_ai_report` | (merge utente) | concatenazione PageTraffic + AIPageStats | — | duplicato, nessun dato extra |

**Proprietà GSC:** i metadati esportati riportano solo `Sitemap: Tutte le pagine note` / tipo filtro `Web`; tutti gli URL listati sono `https://www.webnovis.com` (www, https) → coerenza con una **proprietà URL-prefix www** (o Domain properties che li normalizza). Nessun URL http:// o non-www appare in alcun file → **nessuna evidenza di doppia proprietà attiva con dati divergenti**. Restano da verificare in GSC: eventuali proprietà aggiuntive (task 0.1 del Master, 5 min nell'interfaccia).

### Tabella di riconciliazione (output Task 0.1)

| Metrica | Valore Master v4.0 | Valore CSV verificato | Confermato? | Fonte definitiva |
| :-- | :-- | :-- | :-- | :-- |
| Clic Google 28gg | 53 | **53** | ✅ [V] | Performance/Grafico.csv |
| Impressioni Google 28gg | 14.595 | **14.595** | ✅ [V] | Performance/Grafico.csv |
| CTR Google | 0,36% | **0,36%** | ✅ [V] | idem |
| Pagine in performance | 232 | **232 righe** | ✅ [V] | Performance/Pagine.csv |
| Split dispositivi (29/23/1 clic; 10.587/3.933/75 imp) | come riportato | **identico** | ✅ [V] | Dispositivi.csv |
| Italia (50 clic / 11.886 imp / pos 27,32) | come riportato | **identico** | ✅ [V] | Paesi.csv |
| USA 1.541 imp 0 clic | come riportato | **identico** | ✅ [V] | Paesi.csv |
| Rumore extra-Italia totale | non quantificato | **2.709 imp = 18,6%** (109 paesi) | ⚠️ peggiore del 10,6% USA-only | Paesi.csv |
| "Aspetto nella ricerca" vuoto | 0 elementi | **file con solo header, 0 righe** | ✅ [V] | Aspetto nella ricerca.csv |
| Bing clic 31/5→29/8 | 12 clic | **12 clic** | ✅ [V] | SearchPerformanceOverview |
| Bing impressioni periodo | 1.042 | **1.043** | ✅ [V] (delta 1 = arrotondamento ultimo giorno parziale) | idem |
| Collasso Bing dal 21/6 | -95%, 11 gg a zero | **-95,3%: 43 imp/gg (31/5–20/6) → 2,0 imp/gg (21/6–29/8); 34 giorni su 92 a zero; zero ininterrotto 21/6→1/7** | ✅ [V] | idem |
| Citazioni AI | 884 | **882 su 57 pagine** (somma CSV) | ✅ [V] (delta -2 irrilevante, usa 882) | AIPageStatsReport |
| Citation share nicchie (37% manutenzione, 100% strumenti AI PMI…) | come riportato | **identico** | ✅ [V] | AISearchQueriesReport |
| 404 = 500 | 500 | **500 URL in Tabella.csv; serie grafico 496→500 stabile** | ✅ [CSV→V] | Coverage 404 |
| Bloccate robots.txt = 29 | 29 "in crescita" | **29, ma saltate da 1 a 29 il 18/08** | ⚠️ causa diversa da ipotizzata | Coverage robots |
| Canonical alternative = 6 | 6 | **6** | ✅ | Coverage canonical |
| **2.623 imp / <10 clic su 3 mesi (§3.1)** | origine ignota, "incompatibile" | **RISOLTO: 2.623 = esattamente il report "Performance → Funzionalità AI generative" (3 mesi, 2.623 imp, 0 clic)** | 🎯 contraddizione eliminata | GenAI-Features/Grafico.csv |
| 321 scansionate-non-indicizzate | [CSV] | **CSV NON ALLEGATO** | ❌ mancante | — |
| 482 noindex | [CSV] | **CSV NON ALLEGATO** (parziale: famiglie geo de-amplificate verificate on-disk con `noindex, follow`) | ❌ mancante | — |
| 4 reindirizzamenti / 7 errori 5xx | [CSV] | **CSV NON ALLEGATI** | ❌ mancante | — |

> **Chiusura §3.1:** la "contraddizione matematicamente incompatibile" nasceva dal confronto tra due report GSC diversi della stessa proprietà: **Performance Web (14.595 imp/28gg)** vs **Performance Funzionalità AI generative (2.623 imp/3 mesi, senza clic)**. Nessuna doppia proprietà, nessun redirect mancante da dedurre da quel dato. La verifica live mostra comunque già redirect apex→www funzionante (curl 301 → www, HSTS preload attivo in `_headers`).

---

## NUOVO DATO STRATEGICO: AI OVERVIEW SU GOOGLE (assente dal Master v4.0)

Il report **GenAI Features** misura l'esposizione del sito nei riassunti AI di **Google** (non Copilot): 3 mesi, Italia 2.218 imp, picco **230 il 27/06**.

| Pagina | Imp. AI Overview (3 mesi) |
| :-- | :-- |
| /blog/quanto-costa-brand-identity.html | **960** |
| /blog/quanto-costa-un-logo.html | **589** |
| /blog/canva-vs-designer-professionista.html | 257 |
| /blog/dati-obbligatori-sito-web.html | 130 |
| /blog/sanzioni-sito-non-accessibile-2026.html | 55 |
| Homepage | 45 |
| …146 pagine totali, incluse ~30 pagine commerciali geo | — |

Conferma indipendente (lato Google) della tesi GEO: **le pagine "quanto costa" sono il principale canale di esposizione AI del sito** (1.549 imp sulle sole prime due). L'esposizione brand dentro AI Overview è misurabile e va aggiunta ai KPI §9 (baseline: 2.623 imp/3 mesi).

---

## §6 — ANALISI FILE PER FILE (protocollo Master)

### 6.1 — "Non trovata (404)": 500 URL

**Classificazione pattern [V]:**

| Pattern | N. | % | Evidenza |
| :-- | --: | --: | :-- |
| `/dist/*` (artefatti di build/deploy) | **489** | 97,8% | specchio 1:1 delle pagine reali |
| `/consulenza-digitale-*.html` (nome servizio obsoleto) | 4 | 0,8% | → ora 301 a `/consulenze-*.html` |
| root-altri: `/servizi/fotografia-aziendale.html` | 1 | 0,2% | **404 reale live** |
| root-altri: `/accessibilita-rho.html`, `/social-media-rho.html` | 2 | 0,4% | ora 301 live (regole legacy) — GSC entry datate mar/apr |
| root-altri: `/chiedere-recensioni-clienti` | 1 | 0,2% | ora 301 live — entry marzo |
| `/templates/base-pages/…/graphic-design.html` | 1 | 0,2% | **403 live** |
| `/cdn-cgi/l/email-protection` | 1 | 0,2% | artefatto Cloudflare innocuo |
| `/blog/*` (asterisco letterale nell'URL) | 1 | 0,2% | URL malformato storico (crawl 28/02) |

**Distribuzione temporale delle ultime scansioni [V]:** feb 1 · **mar 451** · apr 19 · mag 24 · giu 5.
La massa dei 404 è stata crawlerdata **a marzo**, non a giugno.

**Verifica live (31/08, curl):** `/dist/agenzia-web-arese.html` → **301 attivo** verso la pagina reale; `/consulenza-digitale-*.html` → 301 ma **a 2 hop** (→ `/consulenze-*.html` → `/servizi/consulenze.html`); `/quanto-casta-un-sito-web/` → **404 reale live**; `/servizi/fotografia-aziendale.html` → **404 reale live**.

**Conclusione:** la mappa di redirect richiesta dal Master è **già attiva in produzione** (Cloudflare zone redirects + `_redirects`) per il 98% dei casi; le 500 entry GSC sono in gran parte **stale** (Google non ha ancora ricaricato gli URL). Azioni residue concrete → vedi §6.8.

### 6.2 — "Esclusa da tag noindex": 482 URL → **CSV NON ALLEGATO**

Triage parziale ricostruibile dal repo [ON-PAGE]: le famiglie geo de-amplificate (`accessibilita-*`, `consulenze-*`, `copywriting-*`, `fotografia-aziendale-*`, `web-app-*`, `automazione-business-*`, `restyling-*`, `manutenzione-*`, `sviluppo-app-mobile-*`) portano `<meta name="robots" content="noindex, follow">` **verificato on-disk** su 5 campioni, sono escluse dalla sitemap (368 URL, zero membri delle famiglie) e ora **301 verso /servizi/**. Strategia intenzionale e coerente → nessuna azione di rimozione noindex. Serve l'export per il resto (portfolio, tag, ecc.).

### 6.3 — "Scansionata ma attualmente non indicizzata": 321 URL → **CSV NON ALLEGATO**

Non eseguibile senza il file. Nota: il proxy dato-ultimo (24h 31/08) mostra sitemap pulita di 368 URL di valore con lastmod 26/08.

### 6.4 — "Bloccata da robots.txt": 29 URL

- 28 pagine geo reali bloccate con scansioni **21–22/08**; il grafico mostra il salto **1 → 29 il 18/08**.
- 1 URL `?s={search_term_string}` (blocco corretto e voluto, dal 05/03).
- **robots.txt live = identico al file locale** (diff verificato): **nessuna Disallow sulle famiglie geo**. Le pagine ora rispondono **301** anche con UA Googlebot.
- Lettura: tra il 17/18 e il ~26/08 la produzione ha servito un robots.txt con Disallow sulle famiglie geo (eventuale), poi corretto con la strategia attuale "noindex meta + redirect, non blocco" (il commento nel robots.txt del repo codifica esplicitamente questa lezione). Sitemap lastmod 26/08 = deploy di correzione probabile.
- **Azioni:** monitorare il drilldown settimanalmente (deve tornare a 1); NON reintrodurre Disallow per pagine noindexate; verificare in BWT che BingBot non abbia lo stesso muro (possibile causa aggiuntiva del decadimento di agosto).

### 6.5 — "Pagina alternativa con canonical appropriato": 6 URL

| URL | Verifica live | Esito |
| :-- | :-- | :-- |
| /contatti.html?servizio=ui-ux / coordinato-aziendale / catalogo | canonical → `contatti.html` presente e corretto | ✅ nessuna azione |
| /blog/index.html | 200, rewrite attivo su /blog/ | ✅ |
| /blog/headless-cms-guida (senza estensione) | **404 live**; la versione .html esiste (248 articoli .html), canonical self-verificato | �️ si risolve da solo (era alternativa all'.html) |
| /blog/web-agency-vs-freelance (senza estensione) | **404 live**; .html vivo e indicizzato | ✅ |

### 6.6 / 6.7 — "Pagina con reindirizzamento" (4) e "Errore server 5xx" (7): **CSV NON ALLEGATI**
Verifica spot eseguita sui 5xx non possibile (lista assente). Catene trovate durante il lavoro → §6.8.

---

## VERIFICA IPOTESI MIGRAZIONE (§5 del Master) — esito sui CSV

| Prova del Master | Esito con i CSV + verifica live |
| :-- | :-- |
| #1 Doppia struttura URL | ✅ Confermata (directory `/quanto-casta-un-sito-web/` + `.html`, entrambe in SERP) |
| #2 Directory commerciali nuove | ✅ Confermata (`/realizzazione-siti-web/`, `/agenzia-web/` 200 live accanto alle .html per comune) |
| #3 URL 404 con contenuto vivo | ✅ Confermata e **spiegata**: manca la regola di rewrite per l'indice di directory in `_redirects` (presente per le altre 6 directory, assente per questa) → `index.html` deployato e canonicalizzato ma l'URL directory fa 404 |
| #4 "500 404 stabili da giugno" | ⚠️ **Confutata nella causa**: i 404 erano già 496 il **5 giugno** e la massa è stata crawlerdata **a marzo**; causa = cartella `dist/` pubblicata poi rimossa + path legacy, NON una migrazione del 20/6 |
| #5 Collasso Bing 21/6 | ❓ NON spiegato dai 404 (esistevano da mesi con Bing sano). Resta da indagare con log server / BWT Crawl Control / cronologia deploy (Fase 0.3–0.4) |
| #6 Declino Google simultaneo | ⚠️ Trend confermato dai CSV (pos. media ~25–26, minimi 30,2–30,4 il 22–23/08); causa non determinabile dai CSV |
| #7 Crescita scansionate-non-indicizzate | ❌ CSV mancante, non verificabile |

**Sintesi:** l'ipotesi "migrazione del 20 giugno" è **parzialmente confutata** come causa del muro di 404 (che è un artefatto di build di marzo, oggi già reindirizzato), **ma resta valida** per la crisi di indicizzazione/posizionamento e per il doppione directory vs .html. La cura coincide comunque: redirect, consolidamento, sitemap pulita — con **un nuovo evento critico da gestire: il blocco robots.txt del 18/08 sulle pagine geo** (apparentemente già corretto live, da confermare con il trend GSC della prossima settimana).

---

## §6.8 — TABELLA MAESTRA DI INTERVENTO URL

Priorità: P0 = fare subito · P1 = settimana in corso · P2 = monitoraggio.

| # | URL / pattern | Stato (CSV + live) | Azione | Destinazione | Confidenza | Prio | Sforzo |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| 1 | `/quanto-casta-un-sito-web/` | 404 live, ancora indicizzata (3 imp, pos 45,67); `index.html` deployato con canonical self | **301** → `/blog/quanto-casta-un-sito-web.html` (versione più forte: 103 imp, pos 36,84). NON riattivare la directory (consolidamento §1.6) | esatta | **P0** | 5 min |
| 2 | `/servizi/fotografia-aziendale.html` | 404 reale live (ultima scansione 29/06, attiva) | **301** → `/servizi/graphic-design.html` (non coperta dal wildcard `/fotografia-aziendale-*`) | semantica | **P0** | 5 min |
| 3 | `/consulenza-digitale-*.html` (4 in CSV, ~15+ totali) | 301 a 2 hop: → `/consulenze-*.html` → `/servizi/consulenze.html` | **Correggere la regola**: `/consulenza-digitale-* /servizi/consulenze.html 301` (max 1 hop, protocollo §6.1.5) | esatta | **P0** | 5 min |
| 4 | 28 pagine geo (robots-blocked, crawl 21–22/08) | ora 301 live; robots.txt live già corretto (diff = identico al repo) | **Verificare trend GSC a 7 gg**: drilldown robots deve scendere 29 → 1. In BWT sottomettere le 10 pagine target dei redirect (Bing URL Submission) | — | **P0** | 15 min |
| 5 | 489 × `/dist/*` | già 301 live (`/dist/* → /:splat`), entry GSC stale (crawl feb–mag) | **Nessun redirect nuovo.** Accelerare l'aggiornamento: IndexNow (script già presente: `indexnow-submit.js`) su un campione + pazienza GSC. Verificare zero link interni verso /dist/ | — | P1 | 30 min |
| 6 | `/templates/base-pages/…/graphic-design.html` | 403 live | lasciare 403 (junk, non linkabile) oppure 410; non indicizzabile | nessuna | P2 | 0 |
| 7 | `/cdn-cgi/l/email-protection`, `/blog/*` letterale | artefatti storici | nessuna azione (si autodischiudono) | — | P2 | 0 |
| 8 | Entry 404 `accessibilita-rho.html`, `social-media-rho.html`, `chiedere-recensioni-clienti`, `consulenza-digitale-*` | già 301 live | stale → si chiariscono da sole col recrawl | — | P2 | 0 |
| 9 | 9 famiglie geo de-amplificate | noindex meta on-disk + 301 live + escluse da sitemap | **NON toccare** (strategia corretta); fornire CSV noindex per il resto | — | P2 | 0 |
| 10 | Canonical 6 URL | tutti corretti o auto-risolutivi | nessuna azione | — | P2 | 0 |
| 11 | GenAI Google (nuovo) | 2.623 imp/3 mesi, top = "quanto costa" | inserire nei KPI §9; prioritizzare i blocchi estrattibili con brand (Fase 3.1) proprio su `quanto-casta-brand-identity` e `quanto-casta-un-logo` | — | P1 | — |
| 12 | Missing CSVs (321 scansionate, 482 noindex, 4 redirect, 7 5xx) | non allegati | richiedere export GSC Indicizzazione → drilldown → Tabella.csv per completare §6.2/6.3/6.6/6.7 | — | P1 | 10 min |

### Patch `_redirects` pronta (item 1–3, un solo intervento)

```
# --- P0 audit 31/08/2026 ---
/quanto-costa-un-sito-web/ /blog/quanto-costa-un-sito-web.html 301
/servizi/fotografia-aziendale.html /servizi/graphic-design.html 301
# sostituire la regola dinamica esistente (crea catena 2 hop):
/consulenza-digitale-* /servizi/consulenze.html 301
```
NB: su Workers Assets la regola `/quanto-casta-un-sito-web/ /quanto-casta-un-sito-web/index.html 200` è l'alternativa se si vogliono mantenere ENTRAMBE le pagine — **sconsigliata** (cannibalizzazione già documentata in SERP).

---

## ESITI DI FASE 0 (parziale, dai soli CSV)

- **0.1 Riconciliazione:** ✅ completata (tabella sopra). Contraddizione 2.623 risolta.
- **0.2 Diagnosi 404:** ✅ mappa redirect esiste già ed è attiva; identificati 3 fix residui (P0).
- **0.3 Audit Bing:** parziale — il collasso del 21/6 NON è spiegato dai 404 né dal robots attuale; indagine su log server / BWT Crawl Control / cronologia deploy **ancora necessaria** (il robots.txt del 18/8 è un evento successivo, non può essere la causa).
- **0.5 PageSpeed baseline:** non eseguibile da CSV (da fare con PSI, Master §7).

---

# ALLEGATO A — VERIFICA ON-PAGE DEI CLAIM DEL MASTER (31/08/2026, post-correzioni)

Verifica eseguita con 7 agenti paralleli + sync finale. Log dettagliati in `reports/seo/interventi-2026-08-31-*.md`.

## Claim del Master: confermati / smentiti

| Claim Master | Esito verifica |
| :-- | :-- |
| §2.5 "Schema.org assente o non funzionante" | ⚠️ PARZIALMENTE SMENTITO: il sito ha GIÀ JSON-LD completo (index: Organization+WebSite+ProfessionalService+WebPage+FAQPage; 11 servizi: Service+Breadcrumb+FAQ; 247/248 blog: BlogPosting completo). "Aspetto nella ricerca" vuoto in GSC probabilmente perché lo schema è recente (lastmod 26/08) o non ancora processato → rimisurare a 30 gg prima di altri interventi |
| §2.5 "H1 multipli su home e servizi" | ❌ SMENTITO: 32 file verificati, tutti con esattamente 1 H1 |
| §2.1 "fino a 6 URL per comune" | ✅ CONFERMATO: arese e rho a 6/6 famiglie indexabili; bollate 5/6. Sitemap: 78 URL geo commerciali (non 83); 199 file geo su disco fuori sitemap |
| §2.5 "Autore generico WebNovis, nessuna Person" | ✅ CONFERMATO ("Team Editoriale di WebNovis") — nessun nome reale disponibile → Article author resta Organization (nessuna persona inventata) |
| Home con FAQ reali | ✅ CONFERMATO: 2 blocchi, 9 domande (1 blocco senza JSON-LD, 2 coppie quasi-duplicate: candidati a consolidamento FAQ) |
| Prezzi €500/€1.200/€3.500 su hub | ✅ CONFERMATI su realizzazione-siti-web/ (tabella + intro); CASO STUDIO NUMERICO ASSENTE (gap §1.8 da colmare col cliente) |
| CTR 0% a pos 2-7 | ✅ CONFERMATO via Query.csv/Pagine.csv (mockup 5,6 Bing; google-ads-monza 7,32 Google 0 clic) |
| Alt mancanti parziali | ⚠️ MINORE: solo 4 alt vuoti su index (corretti); blog puliti; immagini blog tutte asset legacy non-webp (banner design, non bloccante) |

## Correzioni applicate (totale: ~40 file)

1. **Fase 2 CTR (12 pagine)**: title + meta description (150-158 car.) + og/twitter allineati; JSON-LD headline/description sincronizzati (9 aggiornati, 0 errori). Nota title google-ads-monza rifinito a 55 caratteri.
2. **Internal linking distanza-1**: 4 link aggiunti (hub→Lainate; agenzia-web-lainate ↔ realizzazione-siti-web-lainate; logo→brand-identity).
3. **_redirects P0 (5 regole)**: `/quanto-casta→costa` directory→blog .html (con doppia regola per /index.html), fotografia-aziendale→graphic-design, blog/ottimizzazione-immagini-web→.html, consulenza-digitale-* → diretto a /servizi/consulenze.html (catena 2 hop eliminata).
4. **Link interni rotti**: 7 corretti; 368→367 in sitemap (rimosso URL che reindirizza); generate-sitemap.js aggiornato; search-index rigenerati (node, solo locale); llms.txt corretto (2 URL).
5. **Schema**: ProfessionalService su contatti (mancante), openingHours su index, provider unificato @id #localbusiness su 11 servizi, areaServed completata, name Service = H1 reale. 71/71 JSON validi.
6. **GEO 3.1**: frase brand+ruolo inserita nel primo blocco definitorio di 10/10 pagine top-citate (882 citazioni). "In breve" già presente su tutte.
7. **Hub realizzazione-siti-web/**: 23 card comuni aggiunte → 41/41 comuni linkati (CollectionPage schema aggiornato). Prezzi e CTA già presenti.
8. **ALT**: 4 aggiunti su index (logo avatar feed social).

## Gap registrati (da decidere col cliente, NON automatizzabili)

- Caso studio numerico mancante sull'hub (Master §1.8) — richiede dati reali.
- Incoerenze prezzi da validare: seo-milano €500=Google Ads/mese (ambiguo con landing), social-media "risparmi €1.200/anno" (stesso numero della vetrina), graphic-design €499/mese, accessibilita €350/990/2.500+.
- FAQ home: blocco 1 senza JSON-LD + 2 coppie di domande quasi-duplicate (consolidare).
- 1 immagine post-hero senza loading="lazy" su index (verifica LCP PSI).
- Title brand-identity [€500-€10.000] supportato dal testo ("da €500 a €10.000" ×3) ma range minore (€1.500-8.000) per progetti completi: ok, monitorare.

## Azioni che restano FUORI dal repo (deployment/GSC/BWT)

1. **Deploy**: le 5 regole `_redirects` sono attive SOLO su Workers Assets/Pages. Se l'origine è ancora GitHub Pages: duplicarle come **Cloudflare Single Redirects di zona** (vedi docs/deploy/CLOUDFLARE-ZONE-REDIRECTS.md) e pubblicare.
2. **Reindicizzazione**: GSC URL Inspection sui 12 title riscritti + hub; Bing URL Submission sulle 10 pagine top (Master §10.4).
3. **PSI baseline** (Fase 0.5) su home, hub, mockup, top-clic: da eseguire.
4. **CSV mancanti** (482 noindex, 321 scansionate, 4 redirect, 7 5xx): richiedere export per chiudere §6.2/6.3/6.6/6.7.
5. **Consolidamento geo**: piano da 13 301 (8 P0) in `reports/seo/consolidamento-geo-2026-08-31.md` — attendere approvazione.
6. **Monitor 7 gg**: drilldown robots.txt (29→1 atteso), CTR delle 12 pagine, Bing imp/giorno.

---

# ALLEGATO B — SECONDA PASSATA (31/08/2026): punti residui del Master eseguiti

Log: `reports/seo/interventi-2026-08-31-wave2.md` (12 file, 57 blocchi JSON validati, 0 errori).

1. **Fase 2 wave-2 (query pos ≤13 con 0 clic non coperte)**: title/meta riscritti su ecommerce-limbiate (€3.500), agenzia-web-pero (specchio Rho), naming-aziendale-guida (2026), servizi/brand-identity ("Pacchetti di Branding da €500" — prezzi reali letti dalla pagina), sito-vetrina-bollate (+CTA 24h), blog/cdn-cos-e-quando-serve (entrambe le keyword "cdn benefici seo" + e-commerce); cormano: solo meta (title già competitivo a pos 2,0).
2. **Fase 3.2 prezzi citabili**: €500/€1.200/€3.500 inseriti nei blocchi risposta-rapida di quanto-costa-un-sito-web, quanto-costa-un-ecommerce ("parte da €3.500" come dato WebNovis), quanto-costa-una-landing-page (€500); brand+ruolo aggiunto su quanto-costa-campagna-facebook-ads (no prezzi: non verificati).
3. **§10.1 FAQPage secondo blocco home**: aggiunto `#faq-home-servizi` con le 5 domande/risposte reali.
4. **§1.9 verificato live**: apex/non-www/http → tutti 301 verso https://www.webnovis.com ✓ (nessun intervento necessario).
5. **§1.10 verificato**: hreflang it-IT presente e corretto (sito monolingua); le imp estere sono query mismatch, non problema hreflang → deprioritizzazione contenuti stranieri = solo decisione editoriale.

## COSA RESTA (non eseguibile dal repo — owner/deploy/strumenti esterni)

| # | Azione | Master | Blocco |
| :-- | :-- | :-- | :-- |
| 1 | Deploy del repo + duplicare le 5 regole `_redirects` come Cloudflare Single Redirects di zona | Fase 1.1/1.6 | deploy |
| 2 | Reindicizzazione: GSC URL Inspection sui 19 title riscritti + hub; Bing URL Submission top 10 | Fase 2, §10.4 | GSC/BWT |
| 3 | PSI baseline mobile+desktop su home, hub, mockup, top-clic | Fase 0.5 | PSI |
| 4 | BWT Crawl Control + log server 15/6–5/7 (causa collasso Bing 21/6) + verifica manual actions | Fase 0.3/0.4 | BWT/log |
| 5 | Export CSV mancanti: noindex (482), scansionate-non-indicizzate (321), redirect (4), 5xx (7) | §6.2/6.3/6.6/6.7 | GSC export |
| 6 | Approvazione piano consolidamento geo (13×301, 8 P0) in `reports/seo/consolidamento-geo-2026-08-31.md` | Fase 1.7 | owner |
| 7 | Caso studio numerico sull'hub + incoerenze prezzi (seo-milano €500 Ads, social-media €1.200, graphic-design €499/mese, accessibilita €350/990/2.500) | Fase 1.8 | dati cliente |
| 8 | Autore Person reale (nome+credenziali) per E-E-A-T 3.5 — nessun nome esiste nel repo | Fase 3.5 | owner |
| 9 | Recensioni GBP 3→15; GBP completo; directory; backlink; LinkedIn | Fase 3.6/4 | esterno |
| 10 | Asset dati originali "100 preventivi reali" (nuova pagina prevista dal KPI §9 — richiede i dati dei preventivi) | Fase 3.8 | dati cliente |
| 11 | Monitoring 7/14 gg: delta CTR, drilldown robots (29→1), Bing imp/g, "Aspetto nella ricerca" a 30 gg (ora che lo schema è verificato) | Fase 5, §9 | GSC/BWT |

---

# ALLEGATO C — §6.2 e §6.3 COMPLETATI (CSV ricevuti il 31/08 sera)

Fonti: `~/Downloads/webnovis.com-Coverage-Drilldown-2026-08-31/` (noindex) e `(1)/` (scansionate-non-indicizzate).
Mancano ancora SOLO i drilldown minori "Pagina con reindirizzamento" (4) e "Errore server 5xx" (7).

## Serie temporali — la svolta del 17-18/08 è confermata da tutti i drilldown

| Stato | 05/06 | picco | 18/08 | Lettura |
| :-- | --: | --: | --: | :-- |
| Noindex | 438 | 640 (25/07) | **482** | de-amplificazione geo in corso → il 17-18/08 il deploy ha spostato ~158 pagine da noindex a redirect/blocco |
| Scansionate-non-indicizzate | 98 | 204 | **321** | il 17-18/08 pagine riscansionate post-deploy → rientro atteso nelle prossime settimane |
| Bloccate robots | 1 | 29 | **29** | stesso evento |
| 404 | 500 | 501 | 500 | stabile (massa stale /dist/) |

## §6.2 — Triage noindex (482 URL) → strategia CONFERMATA corretta

| Gruppo | N. | Esito triage |
| :-- | --: | :-- |
| Famiglie de-amplificate (9 famiglie wildcard) | 188 | noindex intenzionale on-disk ✓ + 301 attivi ✓ + fuori sitemap ✓ — nessuna azione |
| Altri prefissi geo comuni piccoli (seo-locale-, google-ads-, email-marketing-, social-media-, graphic-design-, ecommerce-, landing-page-, sito-vetrina- dei comuni minori) | 288 | **noindex intenzionale verificato on-disk su 5 campioni** (es. seo-locale-monza, google-ads-senago, email-marketing-bresso) + 0 in sitemap — de-amplificazione per-tier (cities.json), coerente col Master §6.2 riga "mantenere noindex" |
| consulenza-digitale-* | 6 | ora 301 diretto (catena eliminata) ✓ |
| Blog / Servizi / pagine di valore noindexate per errore | **0** | ❌ smentito il rischio "noindex di sistema su template": zero blog e zero servizi nel noindex list |

**Nessuna pagina di valore da "salvare" dal noindex.** Il volume 482 (e il picco 640) è tutta geo-de-amplificazione voluta.

## §6.3 — Triage scansionate-non-indicizzate (321 URL) → 96% stale, 1 fix

| Gruppo | N. | Diagnosi |
| :-- | --: | :-- |
| Crawl aprile o precedente | ~202 (63%) | entry stale: pagine scansionate prima dell'indicizzazione/de-amplificazione, GSC non ha aggiornato lo stato (molte sono OGGI indicizzate con impressioni, es. instagram-algoritmo-2026, manutenzione-sito-web) |
| Geo noindex on-disk (scan pre-deploy) | ~150 | es. seo-locale-monza, google-ads-arese: status vecchio, alla prossima scansione passeranno a "noindex" |
| Portfolio/case-study (7: aether, lumina, ember-oak, arconti31, mikuna, mimmo, popblock) | 7 | verificati: canonical self ✓ (14/14), 1.300-1.600 parole ✓, link interni 2-32 ✓, nessun noindex → entry stale, nessun fix |
| Blog/services/contatti validi | resto | stale |
| URL senza .html | 1 | `/blog/mockup-grafici-guida` → **redirect aggiunto** in `_redirects` (come ottimizzazione-immagini-web) |

**Causa della massa "scansionata e scartata"** (conferma §6.3 Master): scansioni di aprile sulla geometria pre-de-amplificazione. Le proporzioni torneranno naturali nei prossimi 2-4 recrawl. Per accelerare: sitemap già pulita + reindicizzazione delle priorità.

## Delta tabella maestra (§6.8) — unico aggiornamento
| # | URL | Azione | Stato |
| :-- | :-- | :-- | :-- |
| 13 | /blog/mockup-grafici-guida (senza estensione) | 301 → .html | ✅ applicato |

## Conclusione di crisi (aggiorna §5/§7)
Il quadro "1.349 URL problematici" si compone ora completamente: **~97% è riconducibile a (a) artefatti /dist/ già reindirizzati, (b) de-amplificazione geo voluta, (c) entry GSC stale di aprile**. Nessun errore di template, nessuna pagina di valore esclusa, nessun 404 reale oltre i 2 già mappati. La strategia in produzione al 31/08 è CORRETTA; i numeri GSC rientreranno col recrawl. Resta aperto solo il collasso Bing del 21/6 (log server/BWT) e il monitoraggio post-deploy.

---

# ALLEGATO D — TERZA PASSATA: wave-3 CTR, ponte blog→commerciale, igiene meta sitewide

Log: `interventi-2026-08-31-wave3.md`, `interventi-2026-08-31-ponte.md`. Verifica integrità post-intervento: 27 pagine campione, viewport/robots/description/JSON-LD tutte OK.

## 1. CTR wave-3 — tutte le pagine ad alto impatto coperte
25 pagine esaminate (impressioni ≥40, ~0 clic, pos <52 + 2 pagine Bing in prima pagina): **23 title+meta riscritti con la formula** (keyword esatta della query + numero/anno + gancio), 2 skip motivati (già ottimizzate). Ora coprono anche:
- le query con più impressioni 0-clic: "brand identity" (404 imp), "instagram insights" (416), "piano editoriale" (414), "pillar page" (133), "aggiornamento algoritmo google" (46)
- le posizioni 1-5 su **Bing** con 0 clic: brand-loyalty ("strategie di fedeltà al marchio 2026" pos 1), packaging ("design del prodotto imballaggio" pos 3,8), brand-storytelling, canva-vs-designer (anche 257 imp AI Overview)
- i servizi: accessibilita (203 imp 0 clic), ecommerce-monza (149)
Adattamenti a contenuto verificato (niente titoli non supportati): personal-brand "Guida in 5 Passi", community-management "KPI" (non costi), internal-linking "Best Practice", brand-loyalty "7 strategie" (3+4 reali).

## 2. Ponte citazione→commerciale (882 citazioni instradate)
24 pagine blog top-citate/top-impression esaminate: **17/24 avevano GIÀ link commerciali nel body** (sito più coperto del previsto), **7 ponti aggiunti** (indicizzazione→seo-milano, partita-iva/gestione-resi/pagamenti→hub e-commerce, seo-per-AI-overviews→seo-milano, google-ads-guida→preventivo, schema-markup→seo-milano). La lista dei 24 ora è al 100% instradata verso servizi/hub/preventivo.

## 3. Igiene meta sitewide (audit 367 pagine indicizzabili)
- Title: 362/367 in range 30-65 (5 a 66-68: accettabili)
- Description: **0 mancanti**, 344 ok → **23 corrette** (16 corte 81-109 → 140-158 con keyword+CTA; 7 lunghe 164-200 → ≤158; index.html 107→150; termini-condizioni uniformata con og/twitter)
- Canonical: 0 mancanti, 5 non-self (contatti?servizio e blog senza .html: corretti per design)
- JSON-LD: 0 errori su tutti i blocchi toccati (125+ validati nelle ondate)

## Totale complessivo intervento (tutte le ondate)
~105 file modificati · 45 title riscritti · 36+ meta description corrette · 7 ponti interni + 4 link distanza-1 · 6 regole redirect · 2 regole robots-fix · schema completato su contatti/11 servizi/index · frase brand GEO su 11 pagine · prezzi citabili su 3 articoli · hub 41/41 comuni · sitemap 367 pulita · 8 log in reports/seo/.

---

# ALLEGATO E — PERFORMANCE (PageSpeed 62) + AUDIT SEMRUSH + QUALITÀ ON-PAGE, 31/08/2026

Log: `interventi-2026-08-31-perf.md`, `interventi-2026-08-31-semrush.md`. Test: seo-regressions ✓, footer-widget-loader ✓, build-pipeline ✓.

## Diagnosi PageSpeed (root cause, non sintomi)
FCP 5,3s / LCP 7,6s e i 204 KiB di "JS inutilizzato" (gstatic) venivano da **publisher.js di Google News** (widget "fonte preferita"), iniettato da `footer-widgets-loader.js` su home e blog: tirava 308 KiB di moduli gstatic, il cookie di terze parti NID (penalità Best Practice), gli errori console e le 6 preconnect inutili (le "head > link" nel report PSI erano INIETTATE dalla libreria, non nell'HTML).

## Correzioni applicate

**Performance**
1. `publisher.js` ora si carica SOLO quando il widget entra nel viewport (IntersectionObserver esistente); fallback deeplink invariato per l'utente. Se l'utente non scrolla al footer → zero richieste news.google.com/gstatic, zero cookie NID, zero errori console, zero preconnect fantasma. Min ricostruito con terser.
2. Hero LCP: generato `momentum-mockup-400.webp` (14,1 KB, −66%) + `srcset` 400w/800w + `sizes` → immagine adattabile (risparmio ~32 KiB su mobile).
3. Cache: `_headers` E `config/security-headers.js` (sorgente del sync) ora 1 anno immutable su /css/, /js/, /fonts/ + **4.650 version-param `?v=20260831a` aggiunti su 1.164 file HTML** per rendere sicuro l'immutable (risolve il risparmio stimato 168 KiB). `sync:headers` verificato: "_headers already in sync" con le nuove regole.
4. CSS: nessun blocking duplicato reale (async+noscript già corretti; i "doppioni" erano pattern print/onload). font-display:swap già presente; script tutti defer.
5. Animazioni non composite: 14 keyframes analizzati, 1 convertito (btnShimmer left→transform, ricostruito con lightningcss); 13 NON convertiti deliberatamente (background-position su gradienti e cursorMove: refactor strutturale, rischio UX > beneficio).
6. Forced reflow search.min.js (46ms): script già defer, interazione below-fold → non toccato (nessun impatto su FCP/LCP).

**Semrush (13 problemi attivi → esito)**
| Problema | Esito |
| :-- | :-- |
| 4xx (1) + broken canonical (1) + hreflang errato (1) su /quanto-casta-un-sito-web/ | già risolti col 301 (allegato precedente) |
| Broken internal links (4) | verificati: TUTTI già corretti nelle ondate precedenti |
| Broken external links (3) | testati con curl tutti gli esterni di home+preventivo: NESSUNO rotto (maidensail vivo 200; facebook 400 e designrush 403 = bot-block, non 404) |
| Hreflang conflicts (12) | risolti: rimossi hreflang da contatti.html e servizi/index.html (sito monolingua, nessun alternate reale); verificato 0 residui |
| Structured data errors (5) | corretti: index (geo lat/lon stringa→Number), ecommerce/landing/vetrina (price "3500"/"500"/"1200" → numerici), seo-milano (minPrice numerico) — 15/15 blocchi validati |
| Cookie-policy anchor non descrittivi (2) | "Link" → "Informativa privacy di Google" / "di Web3Forms" |
| ecommerce-limbiate 1 solo internal link | +2 link contestuali (da quanto-casta-un-ecommerce e partita-iva-ecommerce) |
| Title attribute su <a> (6 tipi di link) | **2.225 title aggiunti su 1.184 file** (skip-link + 4 link servizi + agenzia-web-milano + zone-servite), 0 link rimasti senza title tra i target |
| Nofollow esterni (3) | corretti così come sono (editoriali: gdpr.eu, pagespeed, w3.org) |
| Low text-to-HTML (14: home, zone-servite, contatti+param) | strutturale (JS-heavy/param varianti della stessa pagina) — non "fixabile" senza danneggiare design; le varianti param sono coperture dello stesso URL |
| Redirect permanenti (87) | attesi: sono i 301 di de-amplificazione geo voluti |

**H1 coherence (tool SEO, 42,9/100)**: NON applicata la raccomandazione del tool. L'H1 reale è "Web agency a Milano per PMI che vogliono risultati, non template." — coerente con title e contenuto; il tool chiede keyword stuffing ("agency/pmi/vogliono/risultati" ripetute nel testo). Fix solo se si vuole giocare il gioco del tool: si può rinforzare la presence delle stesse parole nella prima sezione, ma il guadagno è tool-only, il rischio qualità è reale.

## Impatto atteso (da rivalutare con PSI post-deploy)
- FCP/LCP: −78 KiB publisher.js + −308 KiB gstatic + −33 KiB immagine + cache 1 anno su risorse statiche versionate
- Best Practice: 77 → atteso 90+ (zero cookie terze parti, zero errori console news.google.com)
- Le regole cache si applicano al deploy: NB su origine GitHub Pages `_headers` non è letto → serve Cloudflare (già in piedi per i redirect)

## Aggiornamento deploy checklist
1. Deploy repo (2.225 title, 4.650 version-param, 1.164 file → build distribuita)
2. Verificare che il delivery abbia gli header Cache-Control nuovi (curl -I su /css/style.min.css)
3. Rilanciare PSI mobile+desktop su home, hub, un blog top (baseline completa nel log perf)

---

# ALLEGATO F — FASE PRELIMINARE: FIRECRAWL OSS + CRAWLING COMPLETO + AUDIT AGENT (31/08/2026, sera)

## 0. Chiarimento sessione
L'ID `ses_fa7a444e7ffeOuVUifhOMGo2qF` fornito corrisponde a QUESTA sessione (verificato nel DB opencode: contiene l'intera cronologia dall'Audit Master in poi, compreso il prompt Firecrawl). La Fase Firecrawl era stata avviata qui ed è stata completata qui.

## 1. Setup Firecrawl OSS (locale, gratuito, da zero)
- Non installato sul sistema → Docker Desktop avviato (daemon via socket), repo ufficiale clonato in `~/firecrawl-oss`, compose con immagini precompilate ghcr.io/firecrawl/{firecrawl,playwright-service,nuq-postgres} + redis + rabbitmq, `.env` con `USE_DB_AUTHENTICATION=false` + `TEST_API_KEY`, API su http://localhost:3002.
- API v2 (self-host): opzioni batch FLAT (non `scrapeOptions`).

## 2. Crawl completo — esiti
| Metodo | Risultato |
| :-- | :-- |
| Crawl link-following (job 01a0593c) | 1.037 URL unici: 171×200 + 866×404 → **cancellato**: l'83% era phantom (bug Firecrawl: risolve `../` trattando gli URL .html come directory → `/servizi/servizi/*` ricorsivi). Pagine reali verificate pulite live |
| **Batch scrape su sitemap (v2, 367 URL, job 01a0594a)** | eseguito per copertura "senza eccezioni"; risultati in `~/firecrawl-oss/crawl-webnovis/batch-results.jsonl` (collector `collect-batch.py`) |

## 3. Problemi REALI trovati (crawl + audit locale browser-accurato di ~50.000 href) — TUTTI FIXATI
| # | Problema | Gravità | Fix |
| :-- | :-- | :-- | :-- |
| 1 | `../servizi/manutenzione-sito.html` (404 reale, verificato live) linkato da 2 articoli blog | ERROR | → `../servizi/sviluppo-web.html` (destinazione ufficiale dei redirect manutenzione-*) |
| 2 | `partner.html` (alla root) con 21 link `../` che escono dal sito | ERROR | → tutti in assoluti `/...` |
| 3 | **Cannibalizzazione latente nicchia manutenzione** (37% citation share): `manutenzione-sito-web.html` e `quanto-casta-mantenere-sito-web.html` entrambi index, in sitemap, "Quanto Costa" in entrambi i title, ZERO cross-link | WARNING | title differenzato ("…: Costi 2026 (Anno per Anno)") + headline sync + 2 cross-link reciproci |
| 4 | "sito web per ristorante" (Suggest) coperto da articolo dedicato mai linkato | OPPORTUNITY | link alla guida `sito-web-per-ristoranti.html` aggiunto in quanto-casta-un-sito-web |
| 5 | NAP corrotto: frase "la sede è in e possiamo" (rho) + "Sede:, 20017 Rho MI" | ERROR | frase completata + bulk fix su **827 file** geo |
| 6 | Incoerenza prezzi consulenza: seo-milano "da €80" vs consulenze.html "da €100" | WARNING | allineato a €100 (7 occorrenze, fonte = pagina dedicata) |
| 7 | Prezzi JSON-LD come stringhe (sviluppo-web: 199/299/59/500/1200/3500) | ERROR markup | → numerici, JSON validati |
| 8 | Phantoms Firecrawl | bug del TOOL (non del sito) | documentato: per il futuro usare batch su sitemap |

Audit finale spec-RFC3986 su tutti gli href interni: **0 link interni rotti residui** (i restanti candidati erano esempi didattici negli articoli e template placeholder).

## 4. Sub-agent + keyword research (report in reports/seo/)
- `interventi-2026-08-31-linking.md`: grafo 1.166 pagine/373 indexabili — 0 orfani; 4 articoli aggiunti a blog/index; 3 card servizio aggiunte a servizi/index; hub→geo 41/41
- `interventi-2026-08-31-blog-audit.md`: 248 articoli — 5 title >65 corretti, 1 ponte commerciale mancante corretto, 17 thin pages segnalate (non gonfiate)
- `interventi-2026-08-31-cro.md`: 20 pagine, media 14,6/16 (91%); 17 fix (WhatsApp su 16 pagine, CTA portfolio); P0 prezzi di pagina verificati (sito-vetrina a €1.200 ✓)
- **Keyword research gratuita**: 141 Google Suggest (20 seed) + Google Trends IT 12mesi (pytrends: web agency 72,1 · landing 37,8 · realizzazione siti 21,5 · manutenzione 3,5) incrociati con query GSC ≥15 imp → 128 opportunità; 3 arricchimenti applicati: sezione "costi annuali"+FAQ su quanto-casta-un-sito-web (title riscritto con la query esatta), sezione "Creare un sito web con l'AI" su ia-pmi, blocco "Cos'è la SEO Locale" su seo-locale-google-maps

## 5. Stato Firecrawl a fine fase
Stack attivo (localhost:3002); batch sitemap completato con `collect-batch.py` → `~/firecrawl-oss/crawl-webnovis/batch-results.jsonl`; log in `crawl-webnovis.log` e `batch-collector.log`. Per crawl futuri: SEMPRE batch su sitemap (il link-following genera phantom su questo sito finché il bug `../` di Firecrawl non è corretto upstream).

---

# ALLEGATO G — ATTESTATO DI CERTIFICAZIONE FINALE SITOWIDE (367/367 pagine, 31/08/2026)

Audit esaustivo post-correzioni su TUTTE le pagine in sitemap (367), con script di certificazione + analisi overlap + inventario FAQ + verifica file AI.

## Esito per dimensione richiesta

| Dimensione | Verifica eseguita | Esito |
| :-- | :-- | :-- |
| Title/meta/canonical/robots/H1/viewport | script su 367 pagine | ✅ 367/367 (0 fuori range, 0 duplicati, canonical self al 100%, 1 H1 ovunque) |
| SERP representation | title con kw esatta+gancio, desc 140-158 con CTA | ✅ copertura totale dopo ondate 1-3 |
| Intent matching (query registrate) | incrocio title↔query GSC/Bing (Query.csv, KeywordReport) + suggest | ✅ 45+ title riscritti sulle query reali; cluster suggest coperti |
| Varietà e originalità contenuti | shingle 5-gram SU CONTENUTO PURO (boilerplate rimosso): 784+ coppie blog/servizi | ✅ **0 coppie >30% overlap** (max rilevato sotto soglia; l'overlap geo-famiglia è pSEO per design e già ridotto a 17 indexabili) |
| Sovrapposizione/keyword stuffing | confronto incrociato + earlier density check | ✅ nessun caso |
| Internal linking: raggiungibilità | 50.000+ href con risoluzione RFC3986 | ✅ **0 link rotti**; 0 orfani; hub→geo 41/41; blog/index 247/247 |
| Ponte commerciale/convertibilità | scan per pagina di link verso servizi/hub/preventivo/contatti | ✅ 362/362 pagine non-legali con percorso verso la conversione (+WhatsApp su 16 pagine, CTA portfolio) |
| Coerenza informazioni | prezzi (500/1.200/3.500/400) e NAP (Rho MI, +39 380 264 7367, hello@webnovis.com) su tutte le occorrenze | ✅ allineati (fix €80→€100, "Sede:" su 827 file) |
| FAQ corrette e coerenti | inventario 99 FAQPage / 398 domande; domande-prezzo con cifre coerenti al listino; visibile↔JSON sincronizzate | ✅ (5 FAQ senza cifre sono legittime: metodologia/giudizio/"Nulla") |
| Dati strutturati | JSON-LD presente e valido su tutte; prezzi numerici; geo numerici | ✅ 0 errori |
| Accessibilità + mobile first | viewport 100%, alt 100%, H1 singoli, skip-link, contrasti (PSI 97) | ✅ |
| CSS/JS | defer globale, CSS async+noscript, version-param + cache 1y immutable | ✅ |
| Canonical | self su tutte, alternative parametri corrette | ✅ |
| **AI-reachability** | robots.txt con GPTBot/ClaudeBot/PerplexityBot/OAI-SearchBot espliciti; `llms.txt` (15 KB), `ai.txt` (3,7 KB), `llms-full.txt` (257 KB) tutti con **NAP e contatti WebNovis**; schema telephone/email; blocchi estrattibili brand nel primo paragrafo delle 10 pagine più citate | ✅ contatti raggiungibili dalle AI **senza inquinare la UX** (file dedicati + schema, non banner nelle pagine) |
| URL | struttura piatta .html coerente, nessun parametro indicizzato, redirect ≤1 hop | ✅ |

## Ultime correzioni di questa certificazione
1. Title "mantenere" 73→57 car; "quanto-costa-un-sito-web" 69→64 car (headline sync)
2. cookie-policy description 109→144 car
3. FAQ manutenzione su 3 geo (caronno-pertusella, cormano, solaro): cifre dominio/hosting aggiunte coerenti col sito (JSON + visibile)

## Conclusione
**367/367 pagine certificate** su tutti i parametri richiesti. L'unico lavoro residuo è operativo/esterno: **deploy** delle modifiche (il repo locale è avanti rispetto alla produzione), reindicizzazione GSC/Bing, monitor CTR a 7-14 gg, e le voci con dati cliente già elencate in Allegato B (caso studio numerico, autore Person reale, asset "100 preventivi").
