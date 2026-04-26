# WebNovis SEO/GEO Audit - 2026-04-26

## Executive summary

Periodo analizzato: Google Search Console "ultimi 28 giorni" esportato il 2026-04-26; Bing Webmaster Tools / AI reports 2026-03-27 - 2026-04-24; copertura GSC fino al 2026-04-20; crawl live eseguito su `https://www.webnovis.com/`.

Assunzioni: priorita commerciale su Rho, Milano Ovest e hinterland; servizi principali: siti web custom, e-commerce, SEO locale, graphic design/social; obiettivo GEO = Local Pack + query commerciali locali, obiettivo AI/GEO = essere citabili e poi convertire citazioni in contatti.

La causa piu probabile del calo recente non e un problema tecnico generico del sito: e l'effetto combinato di una de-indicizzazione pSEO molto ampia e di 482 URL 404 storici sotto `/dist/`. Il codice oggi applica una governance allowlist: circa 40-50 pagine GEO restano indexable, tutto il resto diventa `noindex, follow` ed esce dalla sitemap. La logica e corretta come direzione anti-doorway, ma e troppo rigida rispetto ai dati: 267 URL presenti nel report performance GSC sono oggi `noindex`, inclusi URL che avevano domanda reale o posizioni gia promettenti.

Numeri chiave:

| Area | Evidenza |
|---|---:|
| GSC ultimi 7 giorni vs 7 precedenti | click 12 vs 21 (-42,9%), impression 2.696 vs 3.058 (-11,8%) |
| GSC ultimi 14 giorni vs 14 precedenti | impression 5.754 vs 6.802 (-15,4%), posizione media peggiorata 9,91 -> 11,63 |
| Copertura GSC | indicizzate 714 il 2026-04-10 -> 600 il 2026-04-11 -> 598 il 2026-04-20 |
| Noindex GSC | +124 URL il 2026-04-11, totale 266 al 2026-04-20 |
| 404 GSC | 482 URL, 478 sotto `/dist/` |
| Codebase locale | 3.293 HTML, 1.340 con `noindex`; escluse `dist/.claude/src`, 826 HTML pubblicabili sono `noindex` |
| Sitemap live/local | 315 URL, nessun URL noindex in sitemap: bene |
| Bing Search | ultimi 7 giorni: impression -19,2%, click -20% |
| Bing AI | ultime 2 settimane: citazioni +89%; 623 citazioni totali nei report pagina, 612 da blog indexable |

## Critical issues

### 1. La governance `noindex` e troppo ampia e sta rimuovendo anche pagine con domanda

Nel codice, la strategia e dichiarata in `config/pseo-governance.js`: solo TIER 1 + TIER 2 sono indicizzabili, il resto e `noindex, follow` ed escluso dalla sitemap. L'applicazione concreta avviene in `config/seo-html-transforms.js` tramite `alignRobotsDirectives()`.

Evidenza:

- `config/pseo-governance.js:4-8`: la strategia concentra autorita su poche pagine.
- `config/pseo-governance.js:23-32`: de-amplificazione esplicita di pagine commerciali come `google-ads-milano.html`, `sviluppo-app-mobile-milano.html`, `email-marketing-milano.html`.
- `config/pseo-governance.js:170-178`: tutte le combinazioni GEO non in allowlist diventano de-amplificate.
- `config/seo-html-transforms.js:246-250`: trasforma il meta robots in `noindex, follow`.

Il problema non e usare `noindex`: il problema e che la allowlist non e ancora data-driven. Pagine noindex con segnale da recuperare:

| URL | Stato attuale | GSC impression | Pos. media | Azione |
|---|---|---:|---:|---|
| `/email-marketing-milano.html` | noindex | 248 | 31,92 | decidere se servizio strategico; se si, rifare e reindex |
| `/sviluppo-app-mobile-milano.html` | noindex | 160 | 24,99 | se non core, lasciare; se core, creare hub forte |
| `/social-media-milano.html` | noindex | 159 | 30,43 | reindex solo dopo proof/portfolio social |
| `/google-ads-monza.html` | noindex | 139 | 13,88 | candidato reindex |
| `/realizzazione-siti-web-garbagnate.html` | noindex | 43 | 9,72 | reindex + upgrade contenuto |
| `/realizzazione-siti-web-limbiate.html` | noindex | 28 | 7,96 | reindex + upgrade contenuto |
| `/seo-locale-cormano.html` | noindex | 24 | 3,00 | reindex immediato dopo verifica contenuto |
| `/seo-locale-rozzano.html` | noindex | 22 | 1,86 | reindex immediato dopo verifica contenuto |
| `/landing-page-milano.html` | noindex | 36 | 10,53 | candidato reindex se il servizio e prioritario |

Conseguenza business: Google sta progressivamente togliendo pagine che contribuivano a impression e test di ranking. Il calo di impression e in parte "voluto", ma in questa forma taglia anche superfici commerciali che potevano diventare lead.

### 2. I 404 `/dist/` stanno sporcando la copertura e consumando crawl/debug time

GSC segnala 482 URL 404; 478 sono sotto `/dist/`, per esempio `/dist/ecommerce-parabiago.html`. Live oggi restituisce `HTTP 404`, mentre nel codice esiste una logica Express di redirect `/dist/*` ma la produzione sembra servita come GitHub Pages/Cloudflare statico, quindi `server.js` non intercetta quelle richieste.

Conseguenza business: non e probabilmente la causa primaria del calo click, ma crea rumore di copertura, segnali storici negativi e rende piu difficile capire quali URL meritano davvero attenzione.

### 3. Le pagine commerciali indexable non ricevono abbastanza prova locale rispetto ai competitor

Le pagine live crawlate sono tecnicamente sane: status 200, canonical coerenti, H1 presente, schema presente. Il problema e qualitativo/competitivo. Per "realizzazione siti web Rho", competitor come Digital Monkey e Creative Studio mostrano sezioni molto orientate a "Rho", pubblico target, metodo, costi, recensioni, anni di esperienza e proof visibili. WebNovis ha ottime basi tecniche, ma molte pagine locali restano simili tra loro e con poco proof locale verificabile.

Esempi:

| URL | GSC | Problema principale |
|---|---:|---|
| `/realizzazione-siti-web-rho.html` | 144 impression, pos. 23,08 | indexable ma non competitivo: serve prova locale, recensioni, casi, link interni forti |
| `/realizzazione-siti-web-arese.html` | 111 impression, pos. 17,52 | domanda presente ma contenuto ancora troppo template-like |
| `/agenzia-web-rho.html` | 68 impression, pos. 22,62 | cannibalizza/si sovrappone con homepage e realizzazione-siti-web-rho |
| `/ecommerce-milano.html` | 66 impression, pos. 23,95 | query competitiva; serve pagina piu profonda su e-commerce Milano/custom vs Shopify/WooCommerce |

### 4. Le pagine blog rankano, ma non catturano click

Il sito ha molte pagine blog in top 4-6 media, ma CTR nullo. Queste sono le maggiori opportunita immediate di traffico:

| URL | Impression | Pos. media | Click | Problema |
|---|---:|---:|---:|---|
| `/blog/partita-iva-ecommerce.html` | 827 | 5,63 | 0 | titolo/snippet non abbastanza cliccabile, intento informativo assorbito da SERP/AI |
| `/blog/quanto-costa-gestione-social-media.html` | 563 | 4,62 | 0 | ottimo ranking, CTR 0: riscrivere title/meta e blocco prezzi |
| `/blog/quanto-costa-campagna-facebook-ads.html` | 443 | 4,16 | 1 | trasformare ranking in click con range, tabella, template budget |
| `/blog/instagram-algoritmo-2026.html` | 398 | 5,65 | 0 | forte AI citation, bassa conversione SERP |
| `/blog/quanto-costa-un-ecommerce.html` | 225 | 5,00 | 0 | titolo buono, serve snippet piu concreto e differenziante |

### 5. Bing AI/GEO sta citando il blog, non le pagine revenue

Bing AI e positivo: le citazioni sono cresciute (+89% ultime 2 settimane vs 2 precedenti). Pero 612/623 citazioni dei report pagina vengono da blog, non da pagine servizio/locali. Le query AI esportate sono tutte su e-commerce/logistica/resi, non su "agenzia web Rho", "realizzazione siti web Rho", "SEO locale Rho".

Conseguenza business: WebNovis viene gia usato come fonte informativa, ma non abbastanza come fornitore locale. Serve collegare ogni blog che riceve citazioni a un funnel commerciale visibile e citation-friendly.

## Quick wins

1. Creare una "reindex allowlist dinamica" usando dati GSC/Bing: riportare a `index, follow` solo pagine GEO che hanno almeno uno di questi segnali: `>=20` impression 28d, posizione media `<=12`, almeno 1 click, oppure citazioni AI. Prima di reindexarle, aggiungere un blocco contenuto unico.

2. Rimuovere dagli explicit de-amplified i casi commerciali con domanda se confermati prioritari: almeno valutare `google-ads-monza.html`, `landing-page-milano.html`, `seo-locale-cormano.html`, `seo-locale-rozzano.html`, `realizzazione-siti-web-garbagnate.html`, `realizzazione-siti-web-limbiate.html`.

3. Aggiungere un redirect Cloudflare: `/dist/* -> /$1` con 301. La regola in `server.js` non basta se la produzione e static/GitHub Pages. Dopo 301, validare in GSC "Non trovata (404)".

4. Riscrivere title/meta delle 10 pagine blog con posizione 3-6 e CTR 0. Pattern: numero + anno + promessa concreta + Italia/PMI quando pertinente. Evitare title oltre 60-65 caratteri quando possibile.

5. Rafforzare `realizzazione-siti-web-rho.html` con una sezione "Per chi lavoriamo a Rho", esempi/casi locali, tabella prezzi, FAQ locali e link interni dalla homepage, `agenzia-web-rho.html`, blog "quanto costa un sito web".

6. Aggiungere CTA e box "Richiedi una diagnosi" nei blog AI-cited, sopra il primo terzo della pagina e a meta articolo. Le citazioni AI portano autorevolezza, ma oggi il blog non spinge abbastanza verso servizio.

7. Ripulire snippet lunghi: nel crawl live molti title superano 60 caratteri e molte meta description superano 155. Non e un errore tecnico, ma riduce controllo dello snippet.

## GEO/local pack recommendations

1. Centralizzare il GEO su poche pagine citta forti, non su ogni servizio x ogni citta. Strategia consigliata:
   - Pagine core indexable: `agenzia-web-{citta}`, `realizzazione-siti-web-{citta}`, `seo-locale-{citta}` solo per citta dove c'e domanda.
   - Pagine supporto noindex: servizi secondari per citta, ma devono linkare il core city hub.
   - Pagine servizio nazionali/regionali: `/servizi/*` e pagine "Milano/Rho" per servizi principali.

2. Local proof: ogni pagina Tier 1 deve mostrare almeno 3 elementi concreti:
   - distanza/sede/NAP chiaro;
   - settori locali serviti;
   - caso studio o esempio;
   - recensione/testimonianza;
   - mappa o citazione della sede;
   - CTA locale.

3. Google Business Profile:
   - categoria primaria coerente con "Web designer" o equivalente;
   - servizi espliciti: realizzazione siti web, e-commerce, SEO locale, graphic design, social media;
   - UTM sui link GBP;
   - 10-20 recensioni reali con parole naturali su Rho, sito web, e-commerce, grafica, assistenza.

4. Entity clarity:
   - uniformare brand: scegliere `WebNovis` come forma principale e usare `Web Novis` come alternateName, non alternarle in modo casuale;
   - rafforzare pagina `chi-siamo.html` con fondatore, sede, metodo, competenze, proof;
   - collegare DesignRush/directory/profili esterni in `sameAs` solo se effettivamente presenti e controllati.

5. Schema:
   - mantenere Organization/LocalBusiness principale sul sito;
   - sulle pagine servizio usare `Service` con `areaServed`;
   - evitare che ogni pagina GEO sembri una LocalBusiness distinta se non c'e una sede distinta: meglio una sola entita business, molte aree servite.

## Page-by-page recommendations

| URL | Priorita | Issue | Raccomandazione |
|---|---|---|---|
| `/` | High | 411 impression, 17 click; title lungo; H1 molto carico | Snippet piu compatto su "Agenzia Web Rho"; link above-fold verso `agenzia-web-rho` e `realizzazione-siti-web-rho`; aggiungere proof/review visibile |
| `/agenzia-web-rho.html` | High | indexable ma pos. 22,62 | Chiarire ruolo: pagina local agency, non duplicato homepage; proof locale, recensioni, casi Rho/Milano Ovest |
| `/realizzazione-siti-web-rho.html` | High | 144 impression, pos. 23,08 | Upgrade competitivo: costi, processo, esempi, sezioni per professionisti/PMI, internal links exact-anchor |
| `/realizzazione-siti-web-arese.html` | High | 111 impression, pos. 17,52 | Aggiungere contenuto unico per Arese, settori locali, confronto pacchetti, FAQ |
| `/realizzazione-siti-web-garbagnate.html` | High | noindex ma pos. 9,72 | Candidate reindex dopo upgrade contenuto; inserirla in Tier 2/Tier 1 se strategica |
| `/seo-locale-cormano.html` | High | noindex ma pos. 3,00 | Reindex quasi immediato; e un asset che Google stava gia premiando |
| `/seo-locale-rozzano.html` | High | noindex ma pos. 1,86 e 1 click | Reindex quasi immediato; aggiungere proof/CTA per non perdere ranking |
| `/google-ads-monza.html` | Medium/High | noindex, 139 impression, pos. 13,88 | Se Google Ads e servizio prioritario: reindex + contenuto su budget/settori Monza |
| `/landing-page-milano.html` | Medium/High | noindex, 36 impression, pos. 10,53 | Reindex se landing Milano e revenue page; altrimenti consolidare su servizio/hub |
| `/email-marketing-milano.html` | Medium | noindex, 248 impression ma pos. 31,92 | Non reindexare cosi com'e; decidere se email marketing e core. Se si, serve pagina molto piu forte |
| `/social-media-milano.html` | Medium | noindex, 159 impression ma pos. 30,43 | Reindex solo con portfolio/social proof e differenziazione forte |
| `/blog/partita-iva-ecommerce.html` | High | pos. 5,63, 827 impression, 0 click | Riscrivere title/meta; aggiungere tabella "quando serve/non serve", CTA e-commerce |
| `/blog/quanto-costa-gestione-social-media.html` | High | pos. 4,62, 563 impression, 0 click | Snippet pricing, tabella pacchetti, CTA "audit social" |
| `/blog/instagram-algoritmo-2026.html` | Medium/High | 70 citazioni AI, 0 click GSC | Aggiungere blocco "risposta rapida", aggiornamento visibile, link a social media |
| `/blog/quanto-costa-campagna-facebook-ads.html` | High | pos. 4,16, 443 impression, 1 click | Migliorare title/meta e introdurre calcolatore/mini tabella budget |

## Implementation backlog prioritized by impact and effort

| Priorita | Task | Pagine | Impatto | Sforzo | Owner | Perche conta |
|---|---|---|---|---|---|---|
| P0 | Cloudflare 301 `/dist/* -> /$1` | 478 URL `/dist/` | High | S | Dev/Hosting | Riduce 404 GSC e recupera segnali su URL canonici |
| P0 | Data-driven reindex list | 10-25 GEO pages con segnali GSC/Bing | High | S/M | SEO + Dev | Evita di deindicizzare pagine che Google gia testava bene |
| P0 | Reindex `seo-locale-cormano` e `seo-locale-rozzano` dopo review | 2 URL | High | S | SEO/Content | Posizioni gia forti, rischio perdita immediata |
| P1 | Upgrade `realizzazione-siti-web-rho` | 1 URL | High | M | Content/SEO | Pagina commerciale core ma posizionamento debole |
| P1 | Upgrade `agenzia-web-rho` + homepage anchors | 2 URL | High | M | Content/Dev | Riduce cannibalizzazione e chiarisce cluster brand/local |
| P1 | Rewrite title/meta dei top blog CTR 0 | 10 URL blog | High | S | SEO/Content | Traffico rapido senza cambiare ranking |
| P1 | Blog-to-service CTA nei post AI-cited | 15-20 URL blog | Medium/High | S/M | Content/Dev | Trasforma citazioni AI in lead |
| P1 | Local proof module riutilizzabile | Tier 1 GEO | High | M | Dev/Content | Aumenta fiducia e differenziazione locale |
| P2 | Revisione schema LocalBusiness/Service | template GEO | Medium | M | Dev/SEO | Evita entita locali artificiali e migliora entity clarity |
| P2 | GBP/review sprint | GBP + sito | High | M | Business | Local pack e conversione dipendono molto dalla prova sociale |
| P2 | IndexNow pipeline post-build | sitemap + URL cambiate | Medium | S | Dev | Bing aggiorna piu velocemente aggiunte/rimozioni |
| P3 | Segmentazione internazionale GSC | report GSC | Low/Medium | S | SEO | USA e altri paesi generano impression non commerciali e CTR 0 |

## Optional scripts/checks when useful

Comandi gia usati o utili da ripetere:

```bash
python3 /Users/massimilianociconte/.codex/skills/seo-geo-audit/scripts/crawl_seo_pages.py https://www.webnovis.com --max-pages 120 --output /tmp/webnovis_crawl.json
python3 /Users/massimilianociconte/.codex/skills/seo-geo-audit/scripts/internal_link_report.py /tmp/webnovis_crawl.json --format markdown
rg -n "noindex|canonical|robots|sitemap" -g "*.html" -g "*.js" -g "*.xml"
node generate-sitemap.js
npm test -- --runInBand
curl -I https://www.webnovis.com/dist/ecommerce-parabiago.html
curl -Ls https://www.webnovis.com/seo-locale-cormano.html | rg -n "robots|canonical|<title>|<h1"
```

Post-fix:

1. GSC: valida "Non trovata (404)", "Esclusa in base al tag noindex" e "Rilevata ma attualmente non indicizzata".
2. GSC URL Inspection: richiedi indicizzazione solo per la nuova allowlist, non per tutte le pagine.
3. Bing: usa IndexNow per URL aggiunti/aggiornati/rimossi.
4. Dopo 7-14 giorni: confronta impression/click solo su Italia e solo Web Search; guarda pagine reindicizzate separatamente dal blog.

## Fonti esterne consultate

- Google Search Central: robots meta `noindex` indica di non mostrare una pagina nei risultati di ricerca.
- Google Search Central: sitemap e canonical URL vanno usate come segnali per indicare le pagine canoniche/importanti.
- Google Search Console Help: gli URL duplicati/canonicalizzati di norma non vengono mostrati nei risultati.
- Bing IndexNow: notifica aggiunte, aggiornamenti o rimozioni per accelerare la sincronizzazione.
- SERP/competitor live: Digital Monkey, Creative Studio, SITI srl, Livinup, WebNovis.
