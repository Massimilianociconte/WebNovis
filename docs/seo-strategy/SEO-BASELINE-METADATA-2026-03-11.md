# SEO Baseline Metadata 2026-03-11

## Scopo

Baseline retroattiva del batch metadata applicato il 2026-03-11.

Ricostruzione eseguita da:
- KPI pre-intervento presenti in `Analisi-posizionamento.MD`
- metadati pre-fix recuperati da `git show HEAD:<file>`
- ownership verificata contro `blog/build-articles.js`, `blog/auto-writer.js`, `blog/topics-queue.json`, `blog/articles-log.json` e `git log --follow`

Questa baseline serve come snapshot pre/post prima del deploy e come riferimento per futuri refresh del generatore.

## Regole SERP del piano

- target title: 50-60 caratteri
- target meta description: 150-160 caratteri
- nota: il batch implementato migliora nettamente intent e CTR atteso, ma 8 title su 9 restano oltre il target lunghezza; la lunghezza va quindi trattata come guardrail aggiuntivo, non come criterio gia` pienamente soddisfatto.

## Snapshot KPI pre-intervento

| URL | Query target primaria | Impressioni | Click | CTR | Pos. media | Ownership rilevata | Note ownership |
|---|---|---:|---:|---:|---:|---|---|
| `/` | `webnovis` | 342 | 9 | 2.63% | 6.42 | manuale | homepage brand, nessun generatore coinvolto |
| `/chi-siamo.html` | `webnovis` / `web novis` | 40 | 0 | 0% | 5.80 | manuale | pagina about statica |
| `/agenzia-web-rho.html` | `web agency rho` | 106 | 0 | 0% | 13.87 | manuale | pagina geo statica; secondarie: `realizzazione siti web rho`, `siti web rho`, `web designer rho` |
| `/blog/partita-iva-ecommerce.html` | `partita iva ecommerce` | 399 | 0 | 0% | 4.89 | generata | record sorgente verificato in `blog/build-articles.js` |
| `/blog/quanto-costa-un-sito-web.html` | `quanto costa un sito web` | 290 | 2 | 0.69% | 9.48 | built-in generator | migrato in `blog/build-articles.js` il 2026-03-11; l'HTML pubblicato e` ora output del generatore |
| `/blog/quanto-costa-una-landing-page.html` | `quanto costa una landing page` | 101 | 0 | 0% | 7.77 | generata | record sorgente verificato in `blog/build-articles.js` |
| `/blog/tendenze-social-media-2026.html` | `tendenze social media 2026` | 21 | 0 | 0% | 3.95 | auto-writer | slug presente in `blog/topics-queue.json` (`used: true`) e `blog/articles-log.json`; `git log --follow` mostra commit del bot `4173cae` con rename/generazione automatica |
| `/blog/importanza-sito-web-attivita.html` | `importanza sito web attivita` | 15 | 0 | 0% | 4.13 | generata | record sorgente verificato in `blog/build-articles.js` |
| `/blog/shopify-vs-sito-ecommerce-custom.html` | `shopify vs sito ecommerce custom` | 39 | 0 | 0% | 5.46 | generata | record sorgente verificato in `blog/build-articles.js` |

## Metadata diff pre/post

| File | Old title | New title | Title len | Title target | Old description | New description | Desc len | Desc target |
|---|---|---|---:|---|---|---|---:|---|
| `index.html` | `Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social` | `Agenzia Web Milano e Rho — Siti Web, E-commerce e SEO | WebNovis` | 64 | Long | `Web Novis è un'agenzia web a Milano (Rho) specializzata in sviluppo siti, grafica, brand identity e social media. Preventivo gratuito — contattaci oggi.` | `WebNovis è l'agenzia web tra Milano e Rho per siti custom, e-commerce, branding e SEO locale. Preventivo gratuito entro 24 ore.` | 127 | Short |
| `chi-siamo.html` | `Chi Siamo — WebNovis | La Nostra Storia e il Nostro Team` | `Chi Siamo | WebNovis, Agenzia Web tra Milano e Rho` | 50 | OK | `Scopri chi c'è dietro WebNovis. Agenzia digitale italiana specializzata in web development, graphic design e social media marketing. Missione, valori e team.` | `Scopri chi c'è dietro WebNovis: valori, metodo e team dell'agenzia web tra Milano e Rho specializzata in siti custom, design e social media.` | 140 | Short |
| `agenzia-web-rho.html` | `Agenzia Web Rho (Milano) — WebNovis | Siti Custom e Social` | `Agenzia Web Rho e Milano Ovest — Siti Custom, SEO e Social | WebNovis` | 69 | Long | `Agenzia web a Rho (MI): siti 100% custom, graphic design e social media marketing per PMI. Serviamo Rho, Pero, Arese, Lainate e Bollate. Preventivo gratuito.` | `WebNovis è l'agenzia web a Rho per PMI e professionisti di Milano Ovest: siti custom, e-commerce, branding e social. Preventivo gratuito in 24 ore.` | 147 | Short |
| `blog/partita-iva-ecommerce.html` | `Serve la Partita IVA per un E-commerce? Guida Fiscale Pratica 2026 — WebNovis` | `Serve la Partita IVA per un E-commerce? Regole, Costi e Obblighi 2026 — WebNovis` | 80 | Long | `Obblighi fiscali per vendere online in Italia: Partita IVA, regime forfettario, adempimenti e costi. Guida pratica per e-commerce.` | `Quando serve la partita IVA per vendere online, quanto costa aprirla e quali adempimenti devi prevedere per il tuo e-commerce nel 2026.` | 135 | Short |
| `blog/quanto-costa-un-sito-web.html` | `Quanto Costa un Sito Web nel 2026? Guida Completa ai Prezzi — WebNovis` | `Quanto Costa un Sito Web nel 2026? Prezzi Reali per PMI e Professionisti — WebNovis` | 83 | Long | `Quanto costa un sito web nel 2026? Prezzi per landing page, siti vetrina ed e-commerce con i fattori che influenzano il costo.` | `Prezzi reali per landing page, siti vetrina ed e-commerce: scopri quanto costa un sito web professionale e da cosa dipende il preventivo.` | 137 | Short |
| `blog/quanto-costa-una-landing-page.html` | `Quanto Costa una Landing Page nel 2026? Prezzi, Fattori e ROI — WebNovis` | `Quanto Costa una Landing Page? Prezzi Reali, Variabili e ROI 2026 — WebNovis` | 76 | Long | `Guida completa ai costi di una landing page: dal template al design custom, cosa influisce sul prezzo, come calcolare il ROI e quando conviene investire di più.` | `Quanto costa una landing page professionale nel 2026, cosa incide sul prezzo e quando conviene investire in design, copy e tracking.` | 132 | Short |
| `blog/tendenze-social-media-2026.html` | `Tendenze Social Media 2026: Cosa Aspettarsi e Come Prepararsi — WebNovis` | `Tendenze Social Media 2026: Trend, Formati e Strategie da Monitorare — WebNovis` | 79 | Long | `Scopri le tendenze social media 2026 e come preparare la tua strategia per ottenere risultati concreti. Leggi il nostro articolo per approfondire le novità e i trend del futuro.` | `Le principali tendenze social media 2026 per aziende e brand: video, AI, community, social commerce e come adattare il piano editoriale.` | 136 | Short |
| `blog/importanza-sito-web-attivita.html` | `Perché è Importante Avere un Sito Web per la Tua Attività nel 2026 — WebNovis` | `Perché Avere un Sito Web nel 2026: Vantaggi Reali per Aziende e PMI — WebNovis` | 78 | Long | `Vantaggi concreti di un sito web aziendale per PMI e attività locali a Milano e Rho: visibilità, credibilità, conversioni e ROI misurabile.` | `Perché avere un sito web è ancora decisivo nel 2026: più visibilità, credibilità e contatti per PMI, professionisti e attività locali.` | 134 | Short |
| `blog/shopify-vs-sito-ecommerce-custom.html` | `Shopify vs Sito E-commerce Custom: Quale Conviene nel 2026? — WebNovis` | `Shopify o E-commerce Custom? Costi, SEO e Scalabilità a Confronto — WebNovis` | 76 | Long | `Confronto completo Shopify vs e-commerce su misura: costi, performance, SEO, scalabilità e personalizzazione. Guida per PMI che devono scegliere la piattaforma.` | `Confronto tra Shopify e sito e-commerce custom: costi reali, limiti SEO, commissioni, flessibilità e quando conviene una soluzione su misura.` | 141 | Short |

## Implicazioni operative prima del deploy

- `blog/build-articles.js` va considerato sorgente autorevole per almeno: `partita-iva-ecommerce`, `quanto-costa-una-landing-page`, `importanza-sito-web-attivita`, `shopify-vs-sito-ecommerce-custom`
- `blog/auto-writer.js` + `blog/topics-queue.json` + `blog/articles-log.json` vanno considerati sorgente autorevole per slug auto-generated come `tendenze-social-media-2026`
- `quanto-costa-un-sito-web` non e` piu` legacy HTML-only: dal 2026-03-11 la sorgente canonica e` `blog/build-articles.js`
- usare `blog/articles-manifest.json` come lookup order esplicito prima di toccare metadata blog ad alta priorita`

## Wave 2 consigliata: title length

- priorita` alta: `blog/quanto-costa-un-sito-web.html` e `blog/partita-iva-ecommerce.html` restano money page con title oltre il guardrail SERP
- priorita` media: `blog/tendenze-social-media-2026.html`, `blog/importanza-sito-web-attivita.html`, `blog/shopify-vs-sito-ecommerce-custom.html`, `blog/quanto-costa-una-landing-page.html`
- guardrail operativo: introdurre un check non distruttivo su title/meta length prima di ogni batch metadata o rigenerazione blog