# Intervento Internal Linking — 2026-08-31

Sito: https://www.webnovis.com (backup statico `Webnovis_kiro - backup`)
Metodo: script Python (`linkgraph.py`) — indicizzazione di 1.166 file HTML, normalizzazione href (assoluti/relativi/`../`, rimozione query+fragment), verifica meta robots, conteggio inbound univoci, confronto con sitemap.xml (367 URL).

## Statistiche grafo (DOPO intervento)

| Metrica | Valore |
|---|---|
| Pagine HTML indicizzate (scope: root, blog/, servizi/, portfolio/, realizzazione-siti-web/, agenzia-web/, zone-servite/) | 1.166 |
| Pagine indexabili (no noindex) | 373 |
| Pagine noindex | 793 |
| URL in sitemap.xml | 367 (0 mancanti su disco, 0 pagine fantasma) |
| Orfani indexabili (0 inbound) | **0** (prima: **0**) |
| Orfani noindex (0 inbound) | 768 (normali: varianti geo noindex e utility) |
| URL in sitemap con 0 inbound | **0** (prima: **0**) |
| URL in sitemap con 1 solo inbound | **119** (prima: **122**) |

Distribuzione inbound pagine indexabili (373):

| Inbound | Pagine |
|---|---|
| 0 | 0 |
| 1 | 119 |
| 2–4 | 63 |
| 5–9 | 36 |
| 10+ | 155 |

## Hub-check (prima → dopo)

| Hub | Check | Esito |
|---|---|---|
| `/realizzazione-siti-web/` → 41 geo | linka tutte le 41 pagine `realizzazione-siti-web-*.html` | ✓ già OK (prima e dopo) |
| Geo → hub | 17/17 geo **indexabili** linkano `/realizzazione-siti-web/` | ✓ già OK |
| `/zone-servite/` → comuni | linka 17/17 comuni indexabili; 0 link a pagine noindex | ✓ già OK |
| `/portfolio.html` → case study | linka 14/14 case study | ✓ già OK |
| `/blog/` → articoli | 243/247 → **247/247** (+4 card aggiunte) | ✗→✓ FIXED |
| `/servizi/` → pagine servizio | 8/11 → **11/11** (+3 card + JSON-LD) | ✗→✓ FIXED |

## Difetti corretti

### 1. `blog/index.html` — 4 articoli in sitemap assenti dall'indice del blog (3 dei quali con 1 solo inbound = criticità massima)
Card aggiunte con markup identico alle esistenti (stesso pattern `blog-card`, data-category/tag coerenti, ordinamento cronologico rispettato, immagine generica `../Img/og-image-social-graph.jpeg` perché gli articoli non hanno copertina dedicata — nessun 404 introdotto):

| Articolo | Data | Inbound prima → dopo | Inserimento |
|---|---|---|---|
| `/blog/importanza-del-design-siti-web.html` | 23 Feb 2026 | 1 → 2 | tra il blocco 24 Feb e il blocco 20 Feb |
| `/blog/caffe-sempione-caso-studio-locale.html` | 22 Feb 2026 | 1 → 2 | idem (ordine cronologico) |
| `/blog/ia-cartelle-cliniche-previsione-malattie.html` | 21 Feb 2026 | 1 → 2 | idem (ordine cronologico) |
| `/blog/quanto-costa-un-ecommerce.html` | 11 Feb 2026 | 17 → 18 | tra "12 Feb" e "10 Feb" |

### 2. `servizi/index.html` — 3 pagine servizio assenti dall'hub servizi
Aggiunte 3 `service-hub-card` (markup identico alle 8 esistenti) nel grid, subito dopo la card Sviluppo Web (coerenza tematica: sotto-servizi web):
- `/servizi/ecommerce.html` (154 inbound, ora linkata anche dall'hub)
- `/servizi/landing-page.html` (151 inbound)
- `/servizi/sito-vetrina.html` (145 inbound)

Aggiornato coerentemente il JSON-LD `CollectionPage`/`ItemList`: `numberOfItems` 8 → 11 e aggiunti i 3 `ListItem` (posizioni 9–11) con nome/descrizione/URL.

## Criticità rimaste SENZA fix (con motivo)

1. **118 articoli di blog con 1 solo inbound** (solo da `/blog/`): sitemap pagine indexabili con inbound=1. Correggerli significherebbe inserire sezioni "articoli correlati" su 118 articoli — intervento di massa non "chirurgico", alto rischio di pattern innaturale se fatto meccanicamente. Serve matching tematico per-articolo (fase successiva consigliata).
2. **`/partner.html`** (indexabile, in sitemap, 1 inbound da `/chi-siamo.html`): unica fonte coerente tematicamente; non in nav/footer (che non andavano toccati). Raccomandato: 1 link contestuale da una pagina commerciale.
3. **6 pagine `/portfolio/*.html`** (`Aether-Digital`, `Ember-Oak`, `Lumina-Creative`, `Muse-Editorial`, `PopBlock-Studio`, `Structure-Arch`): indexabili con 2 inbound ma **non in sitemap** (nomi file con maiuscole, sembrano versioni showcase dei case study). Da valutare: noindex o inserimento in sitemap — fuori dal perimetro linking.
4. **24 pagine geo noindex con 1 inbound** (dall'hub): normale, nessuna azione (noindex = autorità non richiesta).
5. **`/agenzie-web-rho.html`**: noindex + `canonical` + meta refresh verso `/agenzia-web-rho.html` — gestita correttamente, nessun fix.
6. **`/quanto-costa-un-sito-web/`**: ignorata come da istruzioni (ora 301).

## Integrità post-edit

- `blog/index.html`: 247 `<article>` / 247 `</article>` — bilanciato; 247/247 articoli linkati.
- `servizi/index.html`: 11 `service-hub-card`; JSON-LD valido (11 item); nessun link duplicato introdotto.
- Non toccati: nav, footer, link esistenti, pagine noindex, robots/canonical.
