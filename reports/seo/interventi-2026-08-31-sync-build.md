# Interventi 2026-08-31 — Sync build layer (priority-snippets + src/html)

Fonte di verità: copie root del repo (audit 31/08/2026). Nessun deploy eseguito. Non toccati: node_modules, dist (salvo rebuild), .git.

## TASK 1 — config/priority-snippets.js (95 entry, non 94 come previsto)

Scansione completa: per ogni entry è stato letto il file HTML root corrispondente ed estratti `<title>` e meta description; confronto con i valori della mappa.

- **Entry aggiornate: 1**
  - `blog/quanto-costa-un-sito-web.html` — title:
    - VECCHIO: `Guida 2026: da cosa dipende il prezzo di un sito | WebNovis`
    - NUOVO: `Quanto Costa un Sito Web: Prezzi e Costi Annuali 2026 | WebNovis`
    - (description già allineata alla root; nessun cambio)
- **Entry già corrette (lasciate invariate): 93**
- **Entry non toccate (pagina root inesistente): 1**
  - `accessibilità-cinisello-balsamo.html` — chiave con errore di battitura ("accessibilità" con accento); il file corretto è `accessibilita-cinisello-balsamo.html` (già ottimizzato e non presente in mappa). Lasciata intatta come da istruzioni.

Nota: la mappa contiene 95 entry, non 94.

## TASK 2 — src/html/* (file modificati: 15; src/html/servizi/index.html NON toccato)

### a) src/html/index.html
1. meta description = root: "Web agency a Rho (Milano) per PMI e professionisti: siti web custom, e-commerce, branding e SEO senza template. Preventivo gratuito dal team WebNovis."
2. og:description allineata allo stesso valore (in root le due meta coincidono; in src era rimasta la vecchia).
3. Aggiunto blocco JSON-LD FAQPage con `@id "https://www.webnovis.com/#faq-home-servizi"` — copia ESATTA del blocco root (5 domande servizi). Ora 6 blocchi JSON-LD come in root.
4. ProfessionalService `#localbusiness`: `serviceArea.geoMidpoint.latitude/longitude` e `geoRadius` convertiti da stringa a NUMERICO (45.5299 / 9.0393 / 30000) come in root. Nota: né root né src contengono `openingHoursSpecification` (l'atteso "come in root" = assente; nessuna aggiunta).

### b) src/html/contatti.html
1. RIMOSSO `<link rel="alternate" hreflang="it-IT" href="https://www.webnovis.com/contatti.html">`.
2. Aggiunto JSON-LD `["LocalBusiness","ProfessionalService"]` `@id "https://www.webnovis.com/#localbusiness"` — copia ESATTA da contatti.html root (address con @id senza streetAddress, telephone +393802647367, sameAs instagram/facebook ecc.).

### c) src/html/servizi/seo-milano.html
- Sostituite tutte le 6 occorrenze "da €80" → "da €100" (meta description, og:description, testo lista) allineando a root.
- `"minPrice":"400"` → `"minPrice": 400` (numerico, come in root).

### d) price numerico nelle offers JSON-LD
- `servizi/ecommerce.html`: `"price":"3500"` → `"price": 3500`
- `servizi/landing-page.html`: `"price":"500"` → `"price": 500`
- `servizi/sito-vetrina.html`: `"price":"1200"` → `"price": 1200`

### e) src/html/servizi/accessibilita.html — NESSUNA MODIFICA
title e description in src coincidono già con la root: "Audit Accessibilità Digitale: WCAG ed EAA | WebNovis" + "… Servizio da €350." (anomalia: il titolo citato nel brief "WCAG, EAA e Prezzi" NON è quello root certificato; seguita la convenzione root = verità).

### f) src/html/servizi/brand-identity.html — NESSUNA MODIFICA
title e description coincidono già con la root: "Brand Identity: costi, pacchetti e cosa include | WebNovis" (anomalia: il titolo citato nel brief "Brand Identity a Milano: Pacchetti di Branding da €500" NON è quello root; seguita la convenzione root = verità).

### g) footer-nap WhatsApp (11 file su 12)
Aggiunta ESATTA la riga root dopo la mail in `<address class="footer-nap">`:
`<br><a href="https://wa.me/393802647367?text=Ciao%20Web%20Novis%2C%20vorrei%20maggiori%20informazioni" target="_blank" rel="noopener noreferrer" title="Scrivici su WhatsApp">Scrivici su WhatsApp</a>`

File: accessibilita, audit-gratuito, brand-identity, consulenze, ecommerce, graphic-design, landing-page, seo-milano, sito-vetrina, social-media, sviluppo-web.

Anomalia: `servizi/index.html` (hub) in root NON contiene la riga WhatsApp → per convenzione allineato alla root, NON aggiunta anche in src.

### h) src/html/partner.html
Sostituiti tutti i 21 `href="../` → `href="/`.

### i) src/html/portfolio.html
Aggiunto il blocco CTA finale copiato ESATTO da root: `<section class="portfolio-section" id="portfolio-cta">` con h2 "Il prossimo progetto potrebbe essere il tuo", lead e `pf-btn pf-btn-primary` verso preventivo.html.

### j) name nei JSON-LD Service = H1 (10 file aggiornati)
Nella root il Service name coincide con l'H1; in src 10 pagine divergevano. Allineati (valore root):

| file | vecchio name | nuovo name (= H1 root) |
|---|---|---|
| audit-gratuito | Audit Digitale Preliminare | Audit Digitale: Scopri se il Tuo Sito Sta Perdendo Clienti Senza Saperlo |
| brand-identity | Brand Identity e Logo Design | Brand Identity: costi, pacchetti e cosa include davvero |
| consulenze | Consulenze Strategiche per il Business Digitale | Consulenze Strategiche per il Tuo Business Digitale |
| ecommerce | Sviluppo E-Commerce Personalizzato | E-Commerce Personalizzato che Vende Davvero |
| graphic-design | Graphic Design & Brand Identity | Graphic Design & Brand Identity che Lascia il Segno |
| landing-page | Creazione Landing Page Professionali | Landing Page ad Alta Conversione su Misura |
| seo-milano | SEO a Milano per PMI | SEO a Milano per PMI: posizionamento nei risultati di ricerca |
| sito-vetrina | Creazione Siti Web Vetrina Professionali | Siti Web Vetrina Professionali con Codice Custom |
| social-media | Social Media Marketing: Contenuti, Ricerche e Advertising | Social media marketing a Milano per brand che vogliono più richieste |
| sviluppo-web | Sviluppo Siti Web Professionali | Sviluppo Siti Web Professionali su Misura |

(accessibilita e hub index già conformi.)

### Validazione JSON-LD
Tutti i blocchi JSON-LD di tutti i file src/html toccati validati con JSON.parse dopo le modifiche: **0 errori** (index 6/6, contatti 3/3, partner 3/3, portfolio 1/1, chi-siamo 4/4, come-lavoriamo 2/2, preventivo 3/3, grazie 1/1, 404 2/2, tutti i servizi ok).

## TASK 3 — Test

`node --test tests/seo-regressions.test.js tests/entity-claim-corpus-regressions.test.js tests/faq-schema-regressions.test.js tests/build-pipeline-regressions.test.js`

| suite | esito |
|---|---|
| build-pipeline-regressions | ✅ PASS |
| faq-schema-regressions | ✅ PASS (239 pagine) |
| entity-claim-corpus-regressions | ❌ FAIL (pre-esistente) |
| seo-regressions | ❌ FAIL (pre-esistente) |

Nessuna asserzione aggiornata: i 2 fallimenti NON derivano dai vecchi title/desc di priority-snippets (e non sono stati indeboliti).

- **entity-claim-corpus**: claim SLA fisso "Preventivo gratuito in 24h" presente in `agenzia-web-pero.html`, `blog/quanto-costa-una-landing-page.html`, `search-ai-index.json`, `search-index.json` — file mai toccati in questa sessione (modifiche working-tree pre-esistenti).
- **seo-regressions**: `ENOENT` su `quanto-costa-un-sito-web/index.html` — file cancellato in una sessione precedente (git status `D` pre-esistente), il test non è ancora stato aggiornato a quella rimozione.

## TASK 4 — Rebuild + verifica dist

`npm run build:site:dist` (nessun deploy): VALIDATION PASSED — 373 pagine, 322 OK, 58 warning, **0 critical**, 0 similarity issues; artifact promosso in dist: 964 file, 375 HTML, 367 URL sitemap.

| # | verifica | esito |
|---|---|---|
| 1 | dist/blog/quanto-costa-un-sito-web.html title | ✅ "Quanto Costa un Sito Web: Prezzi e Costi Annuali 2026 \| WebNovis" (64 char) |
| 2 | dist/blog/caffe-sempione title | ✅ "Caso Studio Caffè Sempione: Strategia Locale \| WebNovis" (= root) |
| 3 | typo file dist/blog/quanto-casta-un-sito-web.html | ✅ NON esiste (artefatto typo assente); esiste solo il corretto "costa" |
| 4 | search-index / sitemap | ✅ search-index in dist contiene il nuovo title per /blog/quanto-costa-un-sito-web.html; dist/sitemap.xml contiene l'URL; nessun mismatch emesso dalla validation build |
| 5 | faq-home-servizi in dist/index.html | ✅ presente |
| 6 | dist/servizi/seo-milano.html prezzi | ✅ "da €100" ×6, "da €80" ×0 |

## Anomalie da segnalare

1. La mappa `priority-snippets.js` ha 95 entry, non 94.
2. Entry con typo `accessibilità-cinisello-balsamo.html` (accento) in mappa: pagina inesistente, lasciata intatta.
3. Titoli citati nel brief per accessibilita (2e) e brand-identity (2f) NON coincidono con le copie root certificate; src era già allineato alla root → nessuna modifica (convenzione root = verità).
4. `openingHoursSpecification`: assente sia in root index.html sia in src (nessuna aggiunta; solo lat/lon/geoRadius resi numerici come in root).
5. `servizi/index.html` (hub) in root è senza riga WhatsApp → src allineato (nessuna aggiunta).
6. Test pre-esistenti falliti (entity-claim-corpus, seo-regressions) non imputabili a questa sessione; richiedono intervento dedicato (SLA "24h" nei contenuti, aggiornamento test alla rimozione di quanto-costa-un-sito-web/index.html).
