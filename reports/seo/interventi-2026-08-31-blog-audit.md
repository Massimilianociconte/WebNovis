# Audit SEO completo — Blog WebNovis (248 articoli)

**Data:** 31 agosto 2026 · **Scope:** `blog/*.html` (248 file) · **Metodo:** script Python bulk (diagnosi) + fix chirurgici
**Deploy:** nessuno · **File toccati:** 6 di 248 · **Errori JSON-LD residui:** 0
**Backup pre-fix:** copia dei 6 file in archivio temporaneo di sessione (fuori dal repo)

---

## 1. Diagnosi per categoria (Fase 1 → post-fix)

| # | Categoria | Soglia/regola | Trovati | Corretti | Residui |
|---|-----------|---------------|--------:|---------:|--------:|
| a | Title assenti | absent | 0 | — | 0 |
| a | Title corti | <30 char | 0 | — | 0 |
| a | Title lunghi | >65 char | **5** | **5** | 0 |
| b | Meta description assenti | absent | 0 | — | 0 |
| b | Meta description corte | <110 char | 0 | — | 0 |
| b | Meta description lunghe | >160 char | 0 | — | 0 |
| c | H1 mancanti / multipli / vuoti | ≠1 o vuoto | 0 | — | 0 |
| d | Canonical assenti | absent | 0 | — | 0 |
| d | Canonical non-self | mismatch | 0 | — | 0 |
| e | Robots meta assenti | absent | 0 | — | 0 |
| e | Noindex inattesi | noindex | 0 | — | 0 |
| f | JSON-LD assenti | 0 blocchi | 0 | — | 0 |
| f | JSON-LD invalidi | json.loads KO | 0 | — | 0 |
| f | BlogPosting assente | articoli | 0 | — | 0 |
| k | datePublished assente | JSON-LD | 0 | — | 0 |
| g | og:image assente | absent | 0 | — | 0 |
| h | 0 link interni contestuali nel body | =0 | 0 | — | 0 |
| i | 0 link commerciali (ponte) | =0 in `<main>` | **1** | **1** | 0 |
| j | Thin content | <400 parole body | **17** | 0 (decisione editoriale) | 17 |
| l | `<img>` senza alt | empty/absent | 0 (su 1.480 img) | — | 0 |

**Verifica ondate precedenti:** tutti gli articoli già ottimizzati (title/meta/H1-schema/brand-block/ponte) risultano conformi. Nessuna riscrittura effettuata.

---

## 2. Interventi eseguiti (Fase 2)

### 2.1 Title >65 caratteri — 5 file corretti
Difetto comune: suffisso brand ` — WebNovis` che portava il title a 66–68 char (og:title e JSON-LD headline erano già privi del suffisso).
Fix: rimozione del suffisso (keyword invariata, nessuna riscrittura creativa). Sync automatico: `<title>` = `og:title` = `headline` verificato post-fix.

| File | Prima | Dopo | Title finale |
|------|------:|-----:|--------------|
| ai-act-2026-obblighi.html | 68 | 57 | AI Act 2026: Cosa Cambia dal 2 Agosto per il Tuo Sito Web |
| call-to-action-efficaci.html | 68 | 57 | Call to Action Efficaci: Come Scrivere CTA che Convertono |
| come-proteggere-sito-web-hacker.html | 68 | 57 | Proteggere il Sito Web dagli Hacker: 10 Misure Essenziali |
| cosa-scrivere-sito-web-aziendale.html | 66 | 55 | Cosa Scrivere sul Sito della Tua Azienda per Convertire |
| european-accessibility-act-siti-web.html | 66 | 55 | European Accessibility Act: Cosa Cambia per il Tuo Sito |

Nessuno dei 5 rientra nella lista degli articoli già ottimizzati.

### 2.2 Ponte commerciale — 1 file corretto
**PRIMA/DOPO (metrica: link verso `/servizi/`, `/realizzazione-siti-web/`, `/preventivo`, `/contatti` dentro `<main>`, nav/footer esclusi):**

- PRIMA: 1 file a zero → `index.html` (hub del blog, ~230 card articoli, 0 link commerciali)
- DOPO: 0 — inserito blocco CTA di chiusura dopo la griglia articoli:
  - anchor «siti web professionali per PMI» → `/realizzazione-siti-web/`
  - anchor «Richiedi un preventivo gratuito» → `/preventivo.html`

**Nota metodologica:** una prima passata con taglio del body al blocco "Articoli Correlati" segnalava 19 falsi positivi: in 18 articoli il ponte (box "Servizio correlato / Case study / Guida pillar / Hub locale" + CTA contatti) è posizionato **dopo** il blocco correlati, sempre dentro `<main>`. Rimisurando sull'intera regione `<main>` il conteggio reale è quello sopra. Articoli confermati con ponte (18): checkout-ottimizzazione, conversion-tracking-guida, copywriting-ads-tecniche, creative-fatigue-ads, guida-stile-brand, headless-cms-guida, influencer-marketing-pmi, instagram-carousel-guida, instagram-collaborazioni-brand, linkedin-personal-branding, piano-editoriale-social, robots-txt-sitemap-xml, roi-marketing-digitale, seo-ecommerce-guida, tendenze-social-media-2026, tipografia-web-guida, tone-of-voice-aziendale, web-analytics-privacy.

### 2.3 Interventi non necessari (verificati, 0 difetti)
Canonical self su 248/248 · robots `index, follow` su 248/248 · JSON-LD valido e con `datePublished` su tutti · og:image presente su tutti · H1 singolo non vuoto su tutti · link interni contestuali ≥3 in ogni articolo · 0 `<img>` senza alt su 1.480.

---

## 3. Thin pages — lista per decisione editoriale (non gonfiate)

Corpo articolo (core, senza box correlati/ponte/ai-note) < 400 parole:

| Articolo | Parole (core) | Parole (con box) |
|----------|--------------:|-----------------:|
| instagram-carousel-guida.html | 284 | 546 |
| checkout-ottimizzazione.html | 310 | 623 |
| tendenze-social-media-2026.html | 326 | 657 |
| seo-ecommerce-guida.html | 329 | 639 |
| seo-blog-aziendale.html | 330 | 680 |
| robots-txt-sitemap-xml.html | 338 | 676 |
| cloud-hosting-vs-tradizionale.html | 341 | 681 |
| email-marketing-ecommerce.html | 342 | 647 |
| piano-editoriale-social.html | 342 | 662 |
| influencer-marketing-pmi.html | 349 | 654 |
| copywriting-ads-tecniche.html | 351 | 698 |
| headless-cms-guida.html | 356 | 677 |
| instagram-collaborazioni-brand.html | 357 | 660 |
| roi-marketing-digitale.html | 357 | 694 |
| tone-of-voice-aziendale.html | 372 | 700 |
| tipografia-web-guida.html | 381 | 689 |
| customer-journey-mapping.html | 394 | 724 |

Con i box ponte/correlati il testo renderizzato supera 540 parole su tutti; il rischio thin verso Google è contenuto. Eventuale espansione dei corpi (approfondimenti, esempi, FAQ) rimandata a decisione editoriale.

---

## 4. Anomalie e note

1. **Suffisso brand nei title non uniforme** (solo estetico/consistenza): 68 file con ` — WebNovis`, 39 con ` | WebNovis`, 141 senza suffisso. Suggerimento: uniformare in una futura ondata (nessun impatto range attuale: tutti ≤65).
2. **JSON-LD `headline` ≠ `<title>`** su 210/248 file: differenze dovute al suffisso brand o varianti minori; tutti i valori sono validi e coerenti col contenuto. Non trattato come difetto.
3. **`og:description` ≠ meta description** su 3 file (variazioni volute, range comunque corretto).
4. **Posizione del ponte negli 18 articoli:** i box commerciali stanno dopo "Articoli Correlati" — funzionanti ma in fondo pagina; spostarli prima dei correlati ne aumenterebbe la visibilità (nota editoriale, non intervenuto).
5. **`index.html` hub:** ~230 link di artículo in un'unica pagina, nessuna paginazione — possibile diluizione di crawl equity su siti grandi (da valutare in un'audit dedicata).
6. **twitter:title/twitter:description** presenti solo su 2 file: comportamento standard (fallback su og:), nessuna azione.

---

## 5. Riepilogo numerico finale

- **File analizzati:** 248 · **File modificati:** 6 (5 title + 1 ponte)
- **Difetti trovati → corretti:** title lunghi 5→5 · ponte commerciale 1→1 · tutto il resto 0
- **Errori JSON-LD residui:** 0 (json.loads verificato su tutti i blocchi di tutti i file post-fix)
- **Thin pages:** 17 (segnalate, non modificate)
- **Zone intoccate rispettate:** `node_modules/`, `dist/`, `.git/`, `config/`, `data/` — nessun deploy
