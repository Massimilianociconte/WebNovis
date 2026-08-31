# Interventi SEO — Crawl Semrush 31/08/2026

Sito statico `Webnovis_kiro - backup`. Nessun deploy eseguito. Esclusi da ogni modifica: `node_modules`, `dist`, `.git`, `config`, `data`, directory nascoste.

---

## TASK 1 — Verifica link interni rotti già fixati

**servizi/sviluppo-web.html** — 4 occorrenze, tutte → `href="/blog/quanto-costa-un-sito-web.html"` ✔ FIXATO (nessun residuo verso `/quanto-costa-un-sito-web/`).

**servizi/seo-milano.html** — 2 occorrenze, tutte → `href="/blog/quanto-costa-un-sito-web.html"` ✔ FIXATO.

**blog/quanto-costa-un-sito-web.html** — NOTA: nel prompt "quanto-casta-un-sito-web.html" è un typo; il file reale è `quanto-costa-un-sito-web.html`. Verificati TUTTI i target interni (21 path distinti, incl. `blog/index.html`, `come-scegliere-web-agency.html`, `wordpress-vs-codice-custom.html`, `../servizi/*`, `/agenzia-web/`, `/zone-servite/`, `/portfolio/case-study/arconti31.html`): **tutti esistenti**.

**Esito: 6 link verificati (già fixati), 0 rotti residui, 0 fix necessari.**

---

## TASK 2 — Link esterni rotti (index.html + preventivo.html)

Test: `curl -s -o /dev/null -w "%{http_code}" --max-time 15 -L` con UA Chrome 126.

| URL | Status | Tipo | Azione |
|---|---|---|---|
| https://maidensail.com/startup/webnovis | **200** (title reale: "WebNovis — Maidensail") | `<a>` rel="dofollow", 1× index.html, 1× preventivo.html | **VIVO → lasciato** |
| https://www.facebook.com/share/1C7hNnkqEU/ | 400 (bot-block FB; falso positivo tipico, funziona da browser) | `<a>` | Nessuna modifica |
| https://www.designrush.com/agency/profile/web-novis#reviews | 403 (bot protection; da browser OK) | `<a>` | Nessuna modifica |
| https://www.instagram.com/web.novis | 200 | `<a>` | — |
| https://www.youtube.com/@WebNovis | 200 | `<a>` | — |
| https://g.page/r/CRblKdK0GGO_EBM/review | 200 | `<a>` | — |
| https://gdpr.eu/ | 200 | `<a>` | — |
| https://pagespeed.web.dev/ | 200 | `<a>` | — |
| https://www.w3.org/standards/ | 403 (bot-block W3C, non 404) | `<a>` | Nessuna modifica |
| https://wa.me/393802647367 (+ variante ?text=) | 200 | `<a>` | — |
| https://fonts.googleapis.com / fonts.gstatic.com / googletagmanager.com / connect.facebook.net / widget.trustpilot.com | 400/403/404 | SOLO `<link rel="preconnect">`/`dns-prefetch`/resource hint — NON sono `<a>` navigabili, non conteggiati | — |

**Esito: 11 URL `<a>` testati; 0 con 404/410/timeout/DNS-fail; 0 rimozioni. Il sospetto primario maidensail è vivo (200 con pagina dedicata a WebNovis).**

---

## TASK 3 — hreflang conflicts

- `contatti.html`: rimosso `<link rel="alternate" hreflang="it-IT" href="https://www.webnovis.com/contatti.html">` (1 occorrenza). Canonical intatto. ✔
- `servizi/index.html`: rimosso `<link rel="alternate" hreflang="it-IT" href="https://www.webnovis.com/servizi/">` (1 occorrenza). Canonical intatto. ✔
- `quanto-costa-un-sito-web/index.html`: NON toccato (redirect 301 verso il blog). ✔
- `index.html`: NON toccato (hreflang it-IT self coerente). ✔

**Esito: 2 hreflang rimossi → risolti i 10 conflitti parametrici su contatti.html + quelli di servizi/index.html.**

---

## TASK 4 — Structured data con errori (5 pagine)

| Pagina | Blocco | Violazione | Fix |
|---|---|---|---|
| index.html | LocalBusiness/ProfessionalService (`#localbusiness`) | `GeoCoordinates.latitude`/`longitude` e `GeoCircle.geoRadius` come **stringhe** ("45.5299", "9.0393", "30000") — attesi Number | `"latitude": 45.5299`, `"longitude": 9.0393`, `"geoRadius": 30000` (minimo tocco: 3 valori, da stringa a Number) |
| servizi/ecommerce.html | Service → offers | `"price": "3500"` stringa | `"price": 3500` (Number) + `priceCurrency: EUR` già presente |
| servizi/landing-page.html | Service → offers | `"price": "500"` stringa | `"price": 500` |
| servizi/sito-vetrina.html | Service → offers | `"price": "1200"` stringa | `"price": 1200` |
| servizi/seo-milano.html | Service → offers.priceSpecification | `"minPrice": "400"` stringa | `"minPrice": 400` (priceCurrency EUR già presente) |

Checklist post-fix (validati con `json.loads`): (a) JSON valido 15/15 blocchi; (b) price/minPrice/geoRadius numerici; (c) priceCurrency EUR ovunque ci sia price; (d) nessun "€" in valori numerici (gli € nei testi FAQ/description sono prose, ammessi); (e) @type validi. `priceRange: "€€"` su LocalBusiness è Text valido, lasciato. @id verificati: nessun duplicato (solo dichiarazione+reference coerenti).

**Esito: 5 blocchi corretti su 5 pagine, 15/15 blocchi JSON-LD validi.**

---

## TASK 5 — cookie-policy.html: anchor non descrittivi

| Old anchor | New anchor | Destinazione |
|---|---|---|
| "Link" | **"Informativa privacy di Google"** | https://policies.google.com/privacy |
| "Link" | **"Informativa privacy di Web3Forms"** | https://web3forms.com/privacy |

Destinazioni invariate. **Esito: 2 anchor riscritti.**

---

## TASK 6 — ecommerce-limbiate.html: link interni in entrata

Target verificato esistente: `ecommerce-limbiate.html`. Nessun href pre-esistente verso di esso nei file scelti.

1. **blog/quanto-costa-un-ecommerce.html** — nuova frase contestuale a fine sezione ROI: "Esempio locale: per un `<a href="/ecommerce-limbiate.html">e-commerce a Limbiate</a>` nel settore arredi su misura, al carrello classico funziona meglio un catalogo visivo con richiesta di preventivo strutturata." (coerente col tema arredi/su misura della pagina Limbiate).
2. **blog/partita-iva-ecommerce.html** — scelto rispetto a ecommerce-che-vende.html (più naturale: il paragrafo parla della struttura tecnica giusta per partire; l'esempio locale mostra la scelta catalogo+preventivo): "Un esempio concreto del nostro approccio locale: l'`<a href="/ecommerce-limbiate.html">e-commerce a Limbiate</a>` per arredi e lavori su misura."

Anchor descrittivi "e-commerce a Limbiate", 1 link per pagina, href non duplicati nel body.

**Esito: 2 link contestuali aggiunti (inbound da 2 → 4).**

---

## TASK 7 — Attributi title sui link

Script python: solo tag `<a>` fuori da commenti/`<script>`/`<style>`; skip dei tag con `title=` esistente; inserimento `title="..."` prima di `>`. Esclusi node_modules/.git/dist/.claude/config/data.

| Regola href | Title | Aggiunti |
|---|---|---|
| `#main-content` | "Salta al contenuto principale" | 1184 |
| `…servizi/sviluppo-web.html` | "Servizio sviluppo web" | 697 |
| `…servizi/graphic-design.html` | "Servizio graphic design" | 152 |
| `…servizi/social-media.html` | "Servizio social media" | 174 |
| `…agenzia-web-milano.html` | "Agenzia web a Milano" | 11 |
| `…zone-servite/` | "Zone servite da WebNovis" | 7 |
| **TOTALE** | | **2225 title su 1184 file HTML** |

Post-check: **0** link con quegli href ancora privi di title su 6982 `<a>` totali nel body (i restanti 4757 avevano già title). Conteggi per file salvati in `title_counts.json` (sessione).

---

## TASK 8 — Nofollow esterni su home (solo verifica, nessuna modifica)

Tutti e 3 i link in index.html hanno già `rel="noopener noreferrer nofollow"` — nofollow editoriale corretto:

- `<a href="https://gdpr.eu/" title="Regolamento GDPR per siti web" rel="noopener noreferrer nofollow" target="_blank">` ✔
- `<a href="https://pagespeed.web.dev/" title="Verifica con Google PageSpeed Insights" rel="noopener noreferrer nofollow" target="_blank">` ✔
- `<a href="https://www.w3.org/standards/" title="Standard web W3C" rel="noopener noreferrer nofollow" target="_blank">` ✔

**Esito: 3/3 confermati, 0 modifiche.**

---

## Anomalie e note

1. **Typo nel prompt**: "quanto-casta-un-sito-web" → i file reali sono `blog/quanto-costa-un-sito-web.html` e la directory 301 `quanto-costa-un-sito-web/`. Interventi eseguiti sui file reali.
2. **maidensail.com/startup/webnovis**: vivo (200 + title dedicato) → mantenuto con rel="dofollow" come richiesto ("se vivo: lascia").
3. **Facebook share (400) e DesignRush/W3C (403)**: falsi positivi da bot-block curl, non 404/410/timeout/DNS → nessuna azione secondo i criteri del task.
4. **href `/zone-servite/#anchor`** (~2000 varianti con frammento: #seo-locale, #google-ads, ecc.): escluse per aderenza letterale all'elenco ("href=/zone-servite/"). Se il tool le segnala ancora, estendere la stessa title a quelle varianti.
5. Script python TASK 7 include anche sorgenti `src/html/*` e `templates/base-pages/*` (coerenza con future build).
6. Nessun deploy eseguito; nessun file in `config`, `data`, `dist`, `node_modules`, `.git` toccato.
