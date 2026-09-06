# WebNovis — Performance Best Practices (MUST READ)

Questo file DEVE essere letto da ogni AI prima di modificare pagine, asset o
pipeline di questo sito. Ogni regola nasce da audit HAR/PageSpeed reali.
Vincolo assoluto: **mai perdere qualità visiva, definizione, estetica o fluidità**.

## 0. Architettura build (capirla prima di toccare file)

- Sorgenti pagine: `src/html/*.html` + `src/html/servizi/*.html` (+ `templates/base-pages/` per le ~1000 pagine geo).
- Output pubblicati (`index.html`, `servizi/*.html` in root) sono **rigenerati** da `node build.js` (minify + seo transforms). Non editarli a mano: modifica i sorgenti e rebuilda.
- Eccezioni (artefatti tracciati, editabili diretti): `blog/*.html`, `portfolio/case-study/*.html`, `Img/*`, `js/*`, `css/*`.
- Dopo ogni modifica: `node build.js` → `node scripts/normalize-public-html.js --only=<file>` (o senza `--only`) → `node scripts/fix-cache-busting.js --dry-run` per controllo → test (vedi §8).
- Il deploy (`build:site:dist`) ristampa automaticamente i `?v=` e rigenera gli header: in locale NON committare `dist/`.

## 1. Immagini (regola d'oro: DPR prima dei byte)

- MAI scegliere il file solo dai px CSS: su mobile DPR 2, 362px CSS = 724px reali → il `-800` è corretto, il report "file troppo grande" di PageSpeed assume 1x. Ridimensionare rompe la definizione retina.
- Risparmiare peso così (invisibile): stesso formato ricompresso, WebP→AVIF a qualità verificata (diff medio <2/255 + controllo visivo), strip metadati. AVIF solo con fallback `<picture>` + preload con `type` corrispondente.
- `srcset`/`sizes` DEVONO descrivere il rendering reale (misura il CSS, moltiplica per DPR 1 e 2, verifica quale candidato vince in entrambi i casi).
- Preload LCP: esattamente 1 per viewport (media query mutuamente esclusive), stesso URL/candidato che sceglierà l'`<img>`, `fetchpriority="high"`. Mai preloadare formati diversi da quelli serviti.
- `width`+`height` sempre (no CLS). `decoding="async"` ovunque tranne LCP. `fetchpriority="high"` SOLO LCP; logo/badge `low`; mai promuovere badge a high/eager.
- Above-fold: `loading="eager"` (+ prime card). Below-fold: SEMPRE `loading="lazy"`. Thumbnails (avatar, badge, recensioni): file dedicati ~2× il rendering CSS (es. 96–112px per 36–52px), mai file 800px+.
- Logo header: sempre `<picture>` webp (`-150.webp 150w` + `.webp 300w`, `sizes="150px"`) + fallback `-300.png`, `loading="lazy" fetchpriority="low"`. Mai PNG da 51KB diretto.
- Favicon: un solo set con `?v=<sha256-8 del contenuto>`; se cambia il file, aggiorna l'hash OVUNQUE (grep `favicon.*\?v=`).
- JSON-LD/og/twitter `logo`/`image`: URL webp, `og:image:width/height` = dimensioni REALI del file (mai hardcoded). Cover blog: script `apply-all-blog-covers.js` legge le dims dall'header — non hardcodare mai.
- Niente hotlink Unsplash/esterni per immagini proprie. Niente PNG quando esiste il WebP equivalente.

## 2. Head e critical path

- 1 solo CSS render-blocking (`style.min.css`). Tutto il resto via `media="print" onload="this.media='all'"` + fallback `<noscript>`. Mai aggiungere stylesheet bloccanti.
- 0 JS render-blocking: solo `defer`. `search.min.js` NON è eager da nessuna parte: va via `noncritical-loader` su idle/intent ovunque (il loader ha guardia anti-doppio-caricamento: non romperla, `search.js` non è idempotente). Se un template/builder lo rimette eager, toglierlo.
- Hint: `preconnect` font ok; `dns-prefetch` solo verso origini davvero contattate (mai Trustpilot finché non si usa). Preconnect ai tracker SOLO dinamici post-consenso (vedi `enableAnalyticsTracking` in `js/main.js`), mai statici in head col default denied.
- Speculation Rules: solo `prefetch` (il `prerender` viene rifiutato con 503 `cf-speculation-refused`). Verificare con HAR che non generi errori.
- Viewport: sempre `viewport-fit=cover`. Font Google: `display=optional` + fallback locali con `size-adjust` (già in `style.css`).

## 3. JS: caricamento e runtime

- `noncritical-loader.js` è l'unico owner del lazy-loading (chat, search, cursor, nebula, text-effects, globe). Nuovi script differibili vanno lì con trigger idle + intent, MAI in head.
- `resolveAsset()` deve versionare (`?v=ASSET_V`) TUTTI i file a `max-age=1y` caricati dinamicamente (pattern `^(chat|weby-shell|search|cursor|globe|text-effects|cosmic-nebula)\.min\.js$`). Bumpa `ASSET_V` a ogni modifica di quei file. Eccezioni con versione manuale: import dinamici con query in `js/globe.js` (`cobe.min.js?v=<hash>` — aggiorna l'hash se sostituisci il bundle).
- `js/chat.js`/`weby-shell.js`: MAI ridimensionare il popup via JS al focus tastiera (era la causa del flash); layout via CSS `dvh` + `visualViewport` solo per scroll; niente autofocus su touch; scroll-lock con salvataggio `scrollY`.
- Niente `setInterval`/rAF perpetui senza gate su visibilità (`IntersectionObserver` + `document.hidden`). Throttle canvas mobile a ~30fps per moti lenti (percezione identica). Niente letture di layout in loop (`offsetTop/scrollWidth/getBoundingClientRect` solo cached o post-`fonts.ready`).
- `site-config.js` è volutamente separato (pipeline `normalize`/`artifact`/test lo conoscono): NON unirlo a `main.js` per 705 byte.
- Analytics/terze parti SOLO post-consenso esplicito (`cookie_consent==='accepted'`), mai all'avvio. Verificare a profilo pulito: sessione fresca + rifiuto banner = zero chiamate a gtag/clarity/fbq.

## 4. Animazioni (WebGL/Canvas/CSS)

- `js/cosmic-nebula.js`: shader e palette non si toccano. Leve consentite: DPR caps, throttle fps, `powerPreference`, pause offscreen/hidden-tab, fallback statico a 1 frame per renderer software (SwiftShader/llvmpipe: solo lab headless, zero impatto utenti reali) e per `prefers-reduced-motion` (statico + halt, mai loop rallentato).
- CSS: animazioni infinite solo su `transform`/`opacity` (composite). Mai animare `box-shadow/background-position/filter` in loop su elementi above-fold. `content-visibility: auto` + `contain-intrinsic-size` solo su sezioni below-fold SENZA sticky/ancore critiche (mai su hero, triade, contact).
- Niente `will-change` permanente, niente `backdrop-filter` su sfondi quasi-opachi, niente `filter: drop-shadow` dove basta `box-shadow`.

## 5. Cache e versionamento

- `?v=` = sha256-8 del contenuto (via `fix-cache-busting.js`), stabile tra build: se un hash cambia senza modifiche al file, la build è non-deterministica → indagare, non ignorare.
- Nuovi asset sotto `/js/*`, `/css/*`, `/Img/*` ereditano `immutable 1y`: devono avere `?v=` (tag o loader) DAL PRIMO deploy o resteranno stale un anno.
- `search-index.json`: regola SWR dedicata (`max-age=86400, SWR=604800`) in `config/security-headers.js` + `npm run sync:headers`. Mai `immutable` senza versione nell'URL.
- Header: fonte unica `config/security-headers.js` (+ `npm run sync:headers`). CSP `connect-src` deve coprire ogni host contattato via XHR/fetch (incluso `g.clarity.ms` se Clarity resta).

## 6. Blog (`blog/`)

- Card: `loading="lazy" decoding="async"`, niente `fetchpriority` (default). Prime 3 card: `eager` (+ `high` alla prima) + preload coerente della prima. Mai paginare senza preservare il filtro client-side (oggi: niente paginazione, lazy+filter).
- Nuove card dai template (`auto-writer.js`, `apply-all-blog-covers.js`) devono uscire già conformi (lazy/async/niente auto). `og:image` = file reale esistente + dims reali (lo script le legge dagli header).
- 152 articoli senza `og:image`: task contenuti separato (servono cover reali, non inventabili).

## 7. Pagine geo (~1000, generate)

- Modificare `templates/base-pages/*.html` + `scripts/geo/*.js`, mai gli output — MA il generatore preserva i custom block esistenti (`preserveCustomBlocks`): dopo un template edit, eseguire SEMPRE `npm run build:geo` e verificare col diff che gli output abbiano recepito il cambio.
- Eccezione: `agenzia-web-rho.html` è handcrafted (`normalizeHandCraftedAgenziaPage`) — va editata direttamente (logo, favicon, hint).
- Path relativi `../../` coerenti con output in root; logo header in webp come homepage; `decoding="async"` sulle content-img; hint coerenti.

## 9. AI-readiness (audit Cloudflare: migliorie, mai regressioni)

- Formati testuali: `ai.txt`, `llms.txt`, `llms-full.txt` si rigenerano con `npm run build:ai-exports|build:llms|build:llms-full` — mai scriverli a mano. I test ne verificano il determinismo.
- `robots.txt`: policy effettiva testata (allow AI legittimi, block scraper). Solo commenti o Allow/Disallow coerenti; mai bloccare `/llms*.txt`, `/ai.txt`, css/js/Img.
- Discovery bot via header `Link:` (config `AI_DISCOVERY_LINK`): solo sui blocchi documento di `_headers`, MAI su `/*` (colpirebbe gli asset) e mai tag `<link>` in head (bloat per gli utenti).
- `.well-known/agent.json`: card statica e veritiera di Weby (capacità dal `chat-config.json`, prezzi dal listino). Niente endpoint inventati: solo widget on-site, WhatsApp, email, llms.txt.
- NON implementare per spunta audit: API Catalog con endpoint di scrittura ( calamita spam contro l'hardening form), MCP/OAuth/WebMCP/DNS-AID/pagamenti macchina (nessun account/checkout/paywall = superficie d'attacco inutile), preload font (contende l'LCP immagine).

## 10. Verifica obbligatoria prima di dire "fatto"

1. `node --check` sui JS toccati; `node build.js` (0 errori); `npm run build:geo` se toccati template/geo; normalize della pagina.
2. Test: `widget-loader`, `build-pipeline`, `html-structure`, `seo-smoke`, `audit-seo-a11y`, `lcp-hero`, `faq-schema`, `public-html`, `public-artifact`, `seo`, `security-and-legal`, `footer-widget-loader`, `image-loading-policy`, `geo-generator`, `nav-canonical` — tutti verdi.
3. `git diff --stat`: nessun file fuori scope; nessun HTML root editato a mano (solo via build, tranne `blog/`, `portfolio/case-study/`, `agenzia-web-rho.html` che sono artefatti diretti); nessuna `?v=` incoerente.
4. Verificare le affermazioni degli audit con `rg` prima di applicare: placeholder nei contenuti tutorial (`<code>` escaped), `og:url` con attributi in ordine diverso, preload già presenti, template che emettono già il fix, duplicati solo apparenti (DPR!), keyframes con `animation-name` separato, classi definite in 2 file (cascade!) — mai fix "a fiducia".
5. Per fix di rete: HAR fresco di controllo (errori 4xx/5xx = 0, niente doppi download, preload hit).
6. Dubbi qualità/byte (AVIF, resize): diff numerico + controllo visivo, mai "a occhio" sul solo peso.
7. Mai committare `dist/`; mai toccare `portfolio/*.html` CamelCase legacy (design isolato, canonical verso case-study) oltre head invisibili (og:url, preconnect, hero eager).
