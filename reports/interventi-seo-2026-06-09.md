# Interventi SEO data-driven — 9 giugno 2026

Seconda sessione: interventi applicati sulla base dei CSV Google Search Console (export "ultimi 3 mesi", 8/3 → 7/6/2026) e completamento delle azioni concordate. Tutti i test di regressione del repo (12 suite) passano.

---

## 1. Cosa dicono i dati GSC

**Quadro:** 171 clic e 37.626 impressioni in 3 mesi. Ultimi 28 giorni: 44 clic, 8.793 impressioni, posizione media ponderata 18,1 (peggiorata rispetto a 12,0 del mese precedente — effetto tipico dell'ingresso in indice di molte pagine long-tail a posizioni basse: da monitorare, non necessariamente negativo).

**Letture chiave:**
- Il **blog genera il 58% delle impressioni e il 61% dei clic** (229 pagine). Il cluster "quanto costa" è il più forte.
- **Problema n.1: CTR quasi nullo a posizioni buone.** Esempi: `quanto-costa-gestione-social-media` (1.366 impr, pos 5,5, **0 clic**), `partita-iva-ecommerce` (2.321 impr, pos 6,0, 3 clic), `quanto-costa-un-ecommerce` (460 impr, pos 4,8, 0 clic). A pos 5 il CTR atteso è 3–6%: titoli non allineati alla query + AI Overview che assorbe i clic informazionali.
- **"web agency rho": 324 impressioni, pos 13,3, 0 clic.** La query commerciale più importante del sito è a inizio pagina 2. La pagina dedicata (`agenzia-web-rho.html`, 232 impr, pos 23,7) non conteneva la dicitura esatta "web agency" nel title.
- **Query "realizzazione/creazione siti web lombardia": ~370 impressioni a pos 76–84.** Nessuna pagina copre il livello regionale: l'hub `/realizzazione-siti-web/` (1.070 impr, pos 55,9) era targettizzato solo "Comuni di Milano".
- Quasi tutto il traffico clic è brand ("web novis": 14 clic su 18 attribuiti).
- Desktop: 30.488 impr con CTR 0,38%. Mobile: 5.088 impr, CTR 1%.

## 2. Interventi applicati

### A. Title/description riallineati alle query reali (CTR)
Aggiornati in `config/priority-snippets.js` (single source, sopravvive alle rigenerazioni) **e** nelle pagine pubblicate:

| Pagina | Prima | Dopo |
|---|---|---|
| agenzia-web-rho | Agenzia web a Rho: siti, SEO e branding | **Web Agency Rho: siti web custom, SEO e branding** |
| quanto-costa-gestione-social-media | Gestione social media 2026: prezzi, pacchetti… | **Quanto costa la gestione dei social media? Prezzi 2026** |
| partita-iva-ecommerce | Partita IVA e-commerce 2026: costi, regime e obblighi | **Partita IVA per e-commerce: quando serve e costi 2026** |
| quanto-costa-campagna-facebook-ads | Costo Facebook Ads 2026: budget, CPC e gestione | **Quanto costa una campagna Facebook Ads? Budget 2026** |
| quanto-costa-un-ecommerce | Costo e-commerce 2026: tabella prezzi e costi nascosti | **Quanto costa un e-commerce? Tabella prezzi 2026** |
| quanto-costa-un-logo | (81 caratteri, troncato in SERP) | **Quanto costa un logo professionale? Prezzi reali 2026** |

Aggiornati coerentemente anche og:title/og:description/twitter:* su tutte.

### B. Hub /realizzazione-siti-web/ → targeting "Milano e Lombardia"
Title, H1, meta description, schema CollectionPage e answer-capsule ora coprono esplicitamente "Realizzazione Siti Web a Milano e in Lombardia" (generatore `scripts/generate-all-geo.js` + template + pagina pubblicata). Obiettivo: intercettare le query regionali oggi a pos 76–84.

### C. Internal linking verso agenzia-web-rho.html
Aggiunto link contestuale da `contatti.html` e `chi-siamo.html` (anchor "agenzia web con sede a Rho" / "sede a Rho"). Nota: la homepage non può linkare direttamente pagine città per scelta architetturale codificata nei test (de-amplificazione geo: homepage → hub → città). Rispettata.

### D. Stop automazione blog
`daily-blog.yml`: cron giornaliero **disabilitato** (commentato, riattivabile), generazione solo manuale via workflow_dispatch con default 2 articoli. Motivazione: 10 articoli AI/giorno = pattern "scaled content abuse".

### E. Immagini social di categoria
- 207 articoli blog: og:image/twitter:image dal logo bianco → immagine di categoria (`blog-cat-web/seo/social/marketing.png`).
- 923 pagine (geo + servizi + core): twitter:image allineata all'og:image reale della pagina.
- `blog/build-articles.js`: i futuri articoli nascono già con la cover di categoria.

### F. llms-full.txt (GEO)
Nuovo `scripts/generate-llms-full.js` (npm run build:llms-full): genera `llms-full.txt` (~229 KB) con il contenuto testuale completo di 39 pagine chiave (core + servizi + geo Tier 1, da `config/pseo-governance.js` come single source). Referenziato in robots.txt, llms.txt e server.js.

### G. Pulizia root pubblica
Rimossi 26 file di sviluppo tracciati (analysis.txt, tmp_*, contatti-*.txt, missing_*, _extract_precise_index_snippets.js, ecc.); `risorse-design.txt` spostato in docs/. `.gitignore` aggiornato per prevenire ricadute. Conservato `fcba0795….txt` (chiave IndexNow).

### H. Migrazione Cloudflare Pages — tutto pronto
- **`_redirects`** creato: apex→www, `consulenza-digitale-*`→`consulenze-*`, `/public/*`, `/dist/*`, redirect legacy espliciti.
- **Guida passo-passo**: `docs/deploy/MIGRAZIONE-CLOUDFLARE-PAGES.md` (setup, verifica su pages.dev, switch DNS, rollback). L'unica parte che richiede te: account Cloudflare e cambio nameserver (~30–45 min).
- Sitemap rigenerata con lastmod aggiornati sulle pagine modificate.

## 3. Link building gratuita e realistica (senza budget, senza P.IVA)

Le iscrizioni alle directory sono sature: il margine ora è altrove. In ordine di impatto/sforzo:

1. **Credit nel footer dei siti dei clienti** (il più importante, costo zero). Hai già clienti live in portfolio: Mikuna, FB Total Security, Arconti 31, Mimmo Fratelli, ecc. Un link "Sito realizzato da WebNovis" nel footer è prassi di settore e sono link dofollow da domini reali e tematici. Se l'hai già su alcuni, completare la copertura è la singola azione con il miglior ritorno. Eventualmente offrendo in cambio un piccolo intervento gratuito (es. check performance).
2. **Tool gratuito linkabile.** Hai già le competenze (QuickSEO in portfolio): pubblica su webnovis.com 1 micro-tool gratuito ad alto intento locale/EAA — es. "Verifica accessibilità EAA del tuo sito" o "Calcolatore costo sito web" (si sposa col cluster "quanto costa" che già ranka). I tool attraggono link spontanei e citazioni dagli LLM molto più degli articoli, e puoi listarli gratis su Product Hunt, Uneed, AlternativeTo, Tool directories.
3. **Gallerie di web design con submission gratuita.** Fai design custom: candida i progetti migliori a SiteInspire, Land-book, CSS Light, Httpster, Dark Mode Design. Link di profilo/progetto da domini DR 60-80 e visibilità presso altri designer.
4. **Piattaforme di contenuto con canonical/profilo.** Ripubblica i 3-4 articoli migliori su LinkedIn Articles e Medium (con canonical al tuo sito): i link sono per lo più nofollow ma contano per la GEO (gli LLM citano queste fonti) e portano menzioni del brand.
5. **Risposte da esperto.** Quora/Reddit (r/ItaliaPersonalFinance, r/commercialisti per il pezzo partita-iva-ecommerce — che è la tua pagina con più impressioni!), forum di settore italiani: rispondi davvero, linka solo quando è la risposta. Anche qui: più GEO che SEO, ma gratis.
6. **Richieste fonti per giornalisti** (gratis): Qwoted, Featured, Help a B2B Writer per testate internazionali; in Italia monitora #journorequest su X. Una citazione su una testata vale più di 50 directory.
7. **Menzioni non linkate**: cerca periodicamente "WebNovis" su Google/X; dove sei menzionato senza link, chiedi il link.
8. **Asset di dati originale** (solo tempo): es. "Quanto costano davvero i siti web per PMI in Lombardia — analisi di N preventivi/listini 2026". È il tipo di contenuto che blog e giornalisti linkano e che gli LLM citano come fonte.

Quando attiverai la P.IVA: Google Business Profile + recensioni diventa la priorità assoluta per il locale (e per la GEO).

## 4. Cosa monitorare (GSC, ogni 2 settimane)

- CTR delle 6 pagine con i title nuovi (attesa: da ~0% a 1,5–4% in 3–6 settimane, il tempo che Google riscriva gli snippet).
- Posizione di "web agency rho" (target: top 10) e delle query "lombardia" sull'hub.
- Copertura → "Scansionata, attualmente non indicizzata": il termometro del rischio contenuti scalati (dovrebbe migliorare con lo stop al cron).
- Dopo la migrazione Cloudflare: `npm run verify:prod-headers` e Copertura stabile per 2 settimane.
