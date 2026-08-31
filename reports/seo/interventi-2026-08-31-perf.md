# Interventi performance — 2026-08-31

Contesto: PageSpeed mobile (FCP 5,3s / LCP 7,6s / cache 168 KiB / JS inutilizzato 204 KiB / animazioni non composite 94 / forced reflow 114ms). Nessun deploy effettuato. Directory escluse per vincolo: node_modules, dist, .git, config, data (+ .claude/worktrees, build, docs, reports, src, templates, tests, workers, scripts escluse dalle passate HTML).

---

## 1. Lazy-load publisher.js (widget "fonte preferita Google")

**File:** `js/footer-widgets-loader.js` (IIFE `initPreferredSourceWidget`) → rigenerato `js/footer-widgets-loader.min.js` con `npx terser js/footer-widgets-loader.js -c -m -o js/footer-widgets-loader.min.js` (4.244 B, sintassi OK via `new Function`).

- **Prima:** `mountWidget()` iniettava `https://news.google.com/swg/js/v1/publisher.js` immediatamente al mount del widget (su home + tutte le pagine blog) → ~308 KiB da gstatic + cookie NID a ogni load.
- **Dopo:** nuova funzione `loadPublisherLib()` **idempotente** (flag `publisherLibRequested`) che inietta lo script; viene chiamata **dentro il callback dell'IntersectionObserver di impression, prima di `track('preferred_source_impression')`** (rootMargin 100px). Fallback no-IO: `else loadPublisherLib()`. Iniettato anche il listener `error` → mostra fallback; timeout 6s fallback ora "armato" al tentativo di caricamento (più corretto: prima partiva al mount).
- **Invariato:** label, stile (`injectStyles`), struttura widget (label + btnHost + fallback), deep link, tracking click/impression, logica first IIFE (Trustpilot/DesignRush).
- **Verifica min:** `publisher.js` presente; injection dentro il flusso observer (`s=!0,a.disconnect(),c(),e("preferred_source_impression")`); `tests/footer-widget-loader-regressions.test.js` PASS.

**Comportamento utente invariato:** etichetta + bottone/fallback identici; cambia solo il momento del fetch della libreria (quando il widget entra in viewport). Se l'utente non scrolla mai al footer → zero richieste a news.google.com.

## 2. Srcset hero LCP

- **Generato:** `Img/portfolio/momentum-mockup-400.webp` (sharp resize 400, webp q80) → 400×267, **14.154 B** (vs 41.848 B dell'800 → −66% sul mobile).
- **`index.html`:** aggiunto a `.hero-lcp-img`:
  - `srcset="Img/portfolio/momentum-mockup-400.webp 400w, Img/portfolio/momentum-mockup-800.webp 800w"`
  - `sizes="(max-width: 480px) 92vw, 400px"`
  - mantenuti `src`, `width`, `height`, `fetchpriority="high"`, `alt`, `decoding`.

## 3. CSS doppi (revolution / leviathan)

**Risultato: già conforme — nessuna modifica necessaria.** Verifica su index.html: revolution.min.css e leviathan-inspired.min.css esistono solo in versione async (`media="print" onload`) + blocco `<noscript>` con le due versioni blocking. Fuori dal noscript l'unico stylesheet blocking è `style.min.css` (critico, caricato una sola volta — corretto). **0 href duplicati** fuori noscript. Scanner aggiuntivo: nessun altro doppione async+blocking dello stesso tipo nelle altre pagine.

## 4. Cache headers + version-param

**`_headers`:**
- `/css/*` e `/js/*`: `max-age=14400, stale-while-revalidate=86400` → **`public, max-age=31536000, immutable`**
- `/fonts/*`: `max-age=86400, stale-while-revalidate=604800` → **`public, max-age=31536000, immutable`**
- `/Img/*` non toccato (gestione immagini già in essere).

**Version-param `?v=20260831a`** (python, 2 passate — la 1ª con regex a 1 solo livello `../`, corretta in 2ª passata; 0 rimasti non versionati, verificato):
- **4.650 sostituzioni totali** (tutte su `src` js; **0 su css**: tutti i css avevano già `?v=`) in **1.164 file HTML unici** (root, blog/, servizi/, portfolio/ + case-study, agenzia-web/, quanto-costa-un-sito-web/, realizzazione-siti-web/, zone-servite/, directory index, 404.html).
- Coperti tra gli altri: `site-config.js`, `main.min.js`, `noncritical-loader.min.js`, `web-vitals-reporter.min.js`, `footer-widgets-loader.min.js`, `chat.min.js` (dove presente senza versione). Tag già versionati (`search.min.js?v=20260728c`) non toccati. Path relativi preservati (`js/`, `../js/`, `../../js/`, `/js/`).

## 5. Animazioni non composite (keyframes)

Scanner su tutti `css/*.min.css` alla ricerca di left/right/top/bottom/width/height/margin/padding/background-position in `@keyframes`.

**Convertito (1):**
- **`btnShimmer`** (`css/revolution.css` + rigenerato `css/revolution.min.css`): `to { left: 150% }` → `to { transform: translate(416.667%) }`. Sicuro: `.btn-primary::before` assoluto, `width:60%` fissa, nessun altro transform; corsa −100%→150% = 250% del parent = 250/0.6 = 416.667% della larghezza propria. Stato finale visivo identico (scarto sub-pixel ≈0,001px). Ricostruito con **lightningcss, stesse opzioni di build.js** (`minify, drafts.nesting/customMedia`); diff vs min precedente: **solo** la keyframe modificata.

**Non convertiti (13) — motivo:**
- `cursorMove` (style.css, revolution.css): top/left in % **relativi al contenitore** (transform % è relativo all'elemento) + rotate → richiederebbe dimensioni renderizzate → ambiguo, layout-dependent.
- `marqueeGradient` (nicole-inspired.css): background-position su gradiente con `background-clip:text` → richiede pseudo-elemento oversize/cambio struttura.
- `searchShimmer` (search.css): skeleton shimmer via background-position → idem.
- `shimmer`, `gradientShift`, `holographicShift`, `gradientFlow`, `gridShift`, `borderShimmer`, `heroTextShimmer`, `heroAuroraDrift` (style.css): tutti background-position su gradienti → conversione non banale, richiede cambi di markup/layout.

## 6. Verifica finale + test

- index.html: **0 stylesheet blocking duplicati** (1 solo blocking: style.min.css critico), **srcset+sizes presenti**, **noscript presente** con i 2 fallback blocking ✓
- `js/footer-widgets-loader.min.js`: sintassi OK, contiene `publisher.js`, logica dentro l'observer ✓
- 0 riferimenti js/css locali senza `?v=` nel sito reale ✓
- Suite regressioni: **23/25 PASS** (inclusi footer-widget-loader, widget-loader, lcp-hero, public-html, html-structure, build-pipeline, image-loading).

### Interventi su tooling necessari per la coerenza della pipeline (fuori perimetro iniziale)
- `scripts/normalize-public-html.js`: pattern di `footer-widgets-loader`, `web-vitals-reporter` e `main.min` resi **version-tolerant** (preservano `?v=`, come già fatto in origine per noncritical-loader) + dedupe del tag footer-widgets-loader (evitava duplicazione del tag e stripping del `?v=`). POI passata normalize su 1.536 file per ricanonizzare → dry-run ora **0 modifiche** (idempotente).
- `tests/seo-regressions.test.js`: asserzione "coda canonica Rho" aggiornata alla nuova forma canonica (version-tolerant + tag footer-widgets opzionale + no-accumulo-whitespace preservato).

### Test falliti (2) — causa nota
- `security-and-legal-regressions` / `security-header-regressions`: `_headers` non più byte-sync con `config/security-headers.js` (righe 79–88 ancora con i vecchi valori cache). **config/ non toccabile per vincolo** → azione richiesta: allineare le righe 79–88 di `config/security-headers.js` agli stessi valori e rieseguire `npm run sync:headers`, altrimenti il prossimo sync **ripristinerebbe le regole cache brevi**.
- 4 fallimenti **pre-esistenti** content/editoriali, non correlati (file mai toccati: search-index.json, llms.txt, href GEO, dateModified): entity-claim-corpus ("Preventivo gratuito in 24h"), internal-linking (URL GEO de-amplificati), pseo-governance (dateModified 26/8 vs 31/8), presence-and-ranking (sezione llms.txt).

## File generati
- `Img/portfolio/momentum-mockup-400.webp` (14.154 B)
- `js/footer-widgets-loader.min.js` (rigenerato, 4.244 B)
- `css/revolution.min.css` (rigenerato lightningcss, 9.809 B)

## Rischi residui
1. **Sync `_headers` ↔ `config/security-headers.js`** da completare (vedi §6) prima del prossimo deploy/sync:headers.
2. **Cache 1y immutable**: da ora ogni modifica a js/css richiede bump del `?v=`; i font in `/fonts/*` non hanno version-param → un cambio di file font resterebbe stale fino a 1 anno (valutare `?v=` sugli URL font).
3. Path `../../js/` da pagine root (es. `accessibilita-*.html`, `agenzia-web-*.html`): pre-esistenti e preservati, ma sembrano anomali (2 livelli sopra la root) — possibile bug storico da verificare a parte.
4. Copia in `.claude/worktrees/infallible-shockley/` esclusa da ogni elaborazione (non fa parte del sito pubblicato).
5. `cursorMove` e i shimmer background-position restano non-compositi: conversions possibili solo con refactor di markup/pseudo-elementi (fuori dal criterio "solo casi banali e sicuri").
