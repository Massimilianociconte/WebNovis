# Interventi SEO — Heading H1 & ALT text — 2026-08-31

Verifica tecnica su statico. Nessun deploy. File toccati: solo HTML di prima zona (index, servizi, blog selezionati, directory index).

---

## TASK A — Verifica H1

Ipotesi Master audit: "H1 multipli su home e servizi".

**ESITO: IPOTESI SMENTITA.** Tutti i file verificati contengono **esattamente 1 H1** (conteggio occorrenze `grep -o '<h1'`, non solo righe). Nessun file con 0 o >1 H1. Nessuna correzione eseguita.

| File | n.H1 prima | Azione |
|---|---|---|
| index.html | 1 | nessuna |
| servizi/accessibilita.html | 1 | nessuna |
| servizi/audit-gratuito.html | 1 | nessuna |
| servizi/brand-identity.html | 1 | nessuna |
| servizi/consulenze.html | 1 | nessuna |
| servizi/ecommerce.html | 1 | nessuna |
| servizi/graphic-design.html | 1 | nessuna |
| servizi/index.html | 1 | nessuna |
| servizi/landing-page.html | 1 | nessuna |
| servizi/seo-milano.html | 1 | nessuna |
| servizi/sito-vetrina.html | 1 | nessuna |
| servizi/social-media.html | 1 | nessuna |
| servizi/sviluppo-web.html | 1 | nessuna |
| blog/index.html | 1 | nessuna |
| agenzia-web/index.html | 1 | nessuna |
| realizzazione-siti-web/index.html | 1 | nessuna |
| zone-servite/index.html | 1 | nessuna |
| blog/mockup-grafici-guida.html | 1 | nessuna |
| blog/indicizzazione-google-problemi.html | 1 | nessuna |
| blog/quanto-costa-brand-identity.html | 1 | nessuna |
| blog/quanto-costa-un-logo.html | 1 | nessuna |
| blog/dati-obbligatori-sito-web.html | 1 | nessuna |
| blog/sanzioni-sito-non-accessibile-2026.html | 1 | nessuna |
| blog/instagram-algoritmo-2026.html | 1 | nessuna |
| blog/manutenzione-sito-web.html | 1 | nessuna |
| blog/partita-iva-ecommerce.html | 1 | nessuna |
| blog/api-rest-cosa-sono.html | 1 | nessuna |
| blog/gestione-resi-ecommerce.html | 1 | nessuna |
| blog/gdpr-sito-web-guida.html | 1 | nessuna |
| blog/pagamenti-online-ecommerce.html | 1 | nessuna |
| blog/naming-aziendale-guida.html | 1 | nessuna |
| blog/piano-editoriale-social.html | 1 | nessuna |

**Totale H1 corretti: 0** (nessuna anomalia trovata).

---

## TASK B — ALT text

Verifica su index.html, servizi/*.html (12 pagine) e le 15 pagine blog del punto A. Ricerca `<img>` senza attributo `alt` o con `alt=""`.

**Risultato:** unica pagina con problemi = `index.html` (4 immagini). Tutte le pagine servizi e blog: 0 img senza alt, 0 alt vuoti.

| File | n.alt aggiunti | Esempi |
|---|---|---|
| index.html | 4 | `Img/webnovis-logo-bianco-150.webp` (classe `avatar-img`, feed social home) → `alt="Logo WebNovis"` ×4 |
| servizi/accessibilita.html | 0 | — |
| servizi/audit-gratuito.html | 0 | — |
| servizi/brand-identity.html | 0 | — |
| servizi/consulenze.html | 0 | — |
| servizi/ecommerce.html | 0 | — |
| servizi/graphic-design.html | 0 | — |
| servizi/index.html | 0 | — |
| servizi/landing-page.html | 0 | — |
| servizi/seo-milano.html | 0 | — |
| servizi/sito-vetrina.html | 0 | — |
| servizi/social-media.html | 0 | — |
| servizi/sviluppo-web.html | 0 | — |
| blog/* (15 pagine verificate) | 0 | — |

**Totale alt aggiunti: 4** (tutti su index.html). Post-fix: alt vuoti residui su index.html = 0.

Nota: le 4 immagini erano il logo WebNovis usato come avatar nei post del feed social simulato in home (username "webnovis" adiacente). Applicata la convenzione richiesta per i logo: `alt="Logo WebNovis"`.

---

## TASK C — Report immagini (solo numeri, nessuna modifica binaria)

File: index.html + 15 pagine blog. "Sotto il fold" = tutte le immagini successive alla prima (approssimazione: la prima è l'immagine hero/logo in testa al documento).

| File | Img totali | WebP/AVIF | JPG/PNG/GIF | Altro | Lazy tot | Sotto fold | Lazy sotto fold |
|---|---|---|---|---|---|---|---|
| index.html | 22 | 18 | 3 | 1 | 20 | 21 | 20 |
| blog/mockup-grafici-guida.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/indicizzazione-google-problemi.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/quanto-costa-brand-identity.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/quanto-costa-un-logo.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/dati-obbligatori-sito-web.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/sanzioni-sito-non-accessibile-2026.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/instagram-algoritmo-2026.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/manutenzione-sito-web.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/partita-iva-ecommerce.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/api-rest-cosa-sono.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/gestione-resi-ecommerce.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/gdpr-sito-web-guida.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/pagamenti-online-ecommerce.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/naming-aziendale-guida.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |
| blog/piano-editoriale-social.html | 5 | 0 | 4 | 1 | 4 | 4 | 4 |

Osservazioni (nessuna modifica eseguita, solo report):
- **index.html**: 18/22 immagini in WebP. Le 3 legacy + 1 svg: badge esterni (`maidensail.com/webnovis.svg`) e asset non identificati come critici. 1 immagine sotto il fold senza `loading="lazy"` (probabile hero/LCP intentionally eager).
- **Blog (15 pagine)**: 0 immagini in formato moderno — le 4 legacy per pagina sono tutti asset di template, non di contenuto: `Img/webnovis-logo-bianco.png` (×2, hero+footer), `Img/designrush-badge.png`, `Img/goodfirms-logo.jpeg` (+1 SVG badge esterno). Lazy loading presente su tutte le immagini sotto il fold.

---

## Riepilogo finale

| Voce | Valore |
|---|---|
| File verificati H1 | 32 |
| File con H1 multipli | 0 |
| H1 corretti | 0 |
| File verificati ALT | 28 |
| ALT aggiunti | 4 (index.html) |
| Anomalie registrate | Vedi sotto |

### Anomalie
1. Ipotesi "H1 multipli su home e servizi" **smentita**: 1 solo H1 su tutti i 32 file analizzati.
2. `index.html`: 4 alt vuoti sul logo-avatar del feed social — corretti.
3. Pagine blog: nessuna immagine di contenuto in formato moderno (solo asset template legacy PNG/JPEG) — non corretto (fuori scope: niente modifiche binarie).
4. `index.html`: 1 immagine sotto il fold (per approssimazione "dopo la prima") priva di `loading="lazy"` — da verificare visivamente se sia l'LCP.
