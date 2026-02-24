# AUDIT TECNICO SEO — WebNovis
**Data:** 2026-02-24  
**Auditor:** Cascade AI  
**Codebase:** WebNovis (Express + Static HTML, Node.js backend)

---

## RAPPORTO ESECUTIVO

### Stato Generale
La codebase WebNovis è un sito prevalentemente statico servito da Express.js con un backend Node.js per chatbot AI, newsletter e lead capture. L'architettura è funzionale ma presenta un **monolite server.js da 1.173 righe** che necessita modularizzazione. L'SEO on-page è generalmente ben curato (JSON-LD ricco, canonical corretti, meta description unici), ma ci sono **problemi critici di encoding** nei structured data e **lacune nella sicurezza** (CSP mismatch, dipendenze da aggiornare). Non esistono test automatizzati.

### Health Score Stimato
| Area | Score | Note |
|------|-------|------|
| SEO On-Page | 82/100 | Buono, ma mojibake in JSON-LD e schema duplicati |
| Technical SEO | 78/100 | Sitemap corretta, robots.txt ok, URL structure pulita |
| Performance | 75/100 | Compression ok, ma main.js troppo grande (~2000 righe) |
| Security | 70/100 | Headers ok in server.js, ma CSP mismatch con _headers |
| Code Quality | 60/100 | Monolite, nessun linter, nessun test, utility sparse |
| Accessibility | 72/100 | ARIA labels presenti, ma audit WCAG incompleto |

### TOP 5 PROBLEMI CRITICI

1. **[CRITICAL] Mojibake `â€"` nei JSON-LD** — 8+ file con encoding corrotto nei structured data. Google potrebbe ignorare o penalizzare questi schema.
2. **[CRITICAL] Schema JSON-LD duplicato in `portfolio.html`** — Lo stesso blocco `CollectionPage` appare 2 volte identico. Google segnala errore di structured data.
3. **[CRITICAL] CSP mismatch tra `server.js` e `_headers`** — server.js ha CSP minimale, `_headers` ha CSP completo. Dipendente dall'ambiente di deploy, il sito potrebbe avere protezione insufficiente.
4. **[HIGH] Zero test coverage** — Nessun unit test, integration test o e2e test. Qualsiasi modifica rischia regressioni silenti.
5. **[HIGH] `server.js` monolite (1.173 righe)** — Mescola routing, middleware, API endpoints, cron scheduler e business logic in un unico file.

### ROADMAP DI MIGLIORAMENTO (Impatto/Sforzo)

| Priorità | Azione | Impatto | Sforzo | Timeline |
|----------|--------|---------|--------|----------|
| 🔴 P0 | Fix mojibake JSON-LD | SEO critico | 30 min | Immediato |
| 🔴 P0 | Rimuovi schema duplicato portfolio.html | SEO critico | 5 min | Immediato |
| 🟠 P1 | Allinea CSP server.js ↔ _headers | Security | 1h | Questa settimana |
| 🟠 P1 | Aggiungi `preload` a HSTS in server.js | Security/SEO | 5 min | Questa settimana |
| 🟡 P2 | Modularizza server.js | Maintainability | 4h | Sprint corrente |
| 🟡 P2 | Aggiungi test base (health, API, build) | Quality | 4h | Sprint corrente |
| 🟢 P3 | Consolida IntersectionObservers in main.js | Performance | 2h | Prossimo sprint |
| 🟢 P3 | Separa manifest.json icons (192 vs 512) | PWA/SEO | 30 min | Prossimo sprint |
| ⚪ P4 | Code-split main.js | Performance | 3h | Backlog |
| ⚪ P4 | Aggiungi ESLint + Prettier | Quality | 1h | Backlog |

---

## FASE 1: ANALISI STRUTTURALE E ARCHITETTURALE

### 1.1 Architettura di Base

**Pattern architetturale:** Monolite Express.js che serve file statici + API endpoints. HTML pre-minificato dal build script.

**Problemi identificati:**

#### [HIGH] F1-01: server.js è un monolite da 1.173 righe
- **File:** `server.js`
- **Impatto:** Maintainability, team collaboration, debugging
- **Root cause:** Tutte le responsabilità (middleware, routing, API, newsletter, cron) sono in un singolo file
- **Soluzione:** Modularizzare in:
  ```
  server.js          → bootstrap + app.listen (50 righe)
  middleware/         → security.js, cors.js, cache.js, bot-logger.js
  routes/             → api-chat.js, api-newsletter.js, api-lead.js, api-search.js
  services/           → newsletter-engine.js (già separato ✅)
  config/             → ai-config.js, cors-origins.js
  ```
- **Side effects:** Richiede aggiornamento degli import e test di non-regressione

#### [MEDIUM] F1-02: Utility scripts sparsi nella root
- **File:** `check.js`, `check2.js`, `diag.js`, `debug.js`, `fix-select.js`, `find-wrapper.js`, `replace.js`, ecc. (~30 file)
- **Impatto:** Developer experience, confusion, accidental execution
- **Root cause:** Script one-off mai rimossi dopo l'uso
- **Soluzione:** Spostare in `scripts/` o eliminare se non più necessari. Aggiungere a `.gitignore` gli script temporanei.

#### [LOW] F1-03: Directory `Img/` con maiuscola
- **File:** Directory `Img/`
- **Impatto:** Consistenza naming, potenziali problemi su sistemi case-sensitive (Linux)
- **Root cause:** Convenzione non standard
- **Soluzione:** Rinominare a `img/` e aggiornare tutti i riferimenti. ⚠️ Operazione ad alto rischio — richiede search & replace su tutti gli HTML e CSS. Valutare se il beneficio giustifica lo sforzo.

### 1.2 Stack Tecnologico e Dipendenze

**File:** `package.json`

| Dipendenza | Versione | Ultima Stabile | Status |
|-----------|----------|---------------|--------|
| express | ^4.18.2 | 4.21.x | ⚠️ Aggiornare |
| compression | ^1.8.1 | 1.8.x | ✅ Aggiornato |
| cors | ^2.8.5 | 2.8.5 | ✅ Aggiornato |
| dotenv | ^16.3.1 | 16.4.x | ⚠️ Minor update |
| express-rate-limit | ^7.1.5 | 7.5.x | ⚠️ Aggiornare |
| node-fetch | ^3.3.2 | 3.3.2 | ✅ (ma ESM-only) |
| nodemon | ^3.0.1 | 3.1.x | ⚠️ Minor update |
| sharp | ^0.34.5 | 0.34.x | ✅ Aggiornato |
| terser | ^5.26.0 | 5.37.x | ⚠️ Aggiornare |

#### [MEDIUM] F1-04: node-fetch v3 è ESM-only, importato via dynamic import()
- **File:** `server.js:12-15`, `newsletter-engine.js:99`
- **Impatto:** Complessità, potenziali race condition
- **Root cause:** node-fetch v3 ha rimosso il supporto CommonJS
- **Soluzione consigliata:** Dato che Node.js 18+ ha `fetch` nativo, rimuovere `node-fetch` e usare `globalThis.fetch` direttamente. Se serve Node.js <18, usare `undici`.

#### [LOW] F1-05: web-vitals in devDependencies ma usato in produzione
- **File:** `package.json:34`, `js/web-vitals-reporter.js` (caricato su ogni pagina)
- **Impatto:** Semantica delle dipendenze
- **Root cause:** web-vitals è un pacchetto frontend bundlato, non serve a runtime Node.js
- **Soluzione:** Corretto come devDependency se il reporter è un file standalone. Verificare che `web-vitals-reporter.js` non faccia `require('web-vitals')` a runtime.

### 1.3 Configurazioni e Variabili d'Ambiente

#### [OK] `.env.example` è completo e ben documentato ✅
- Tutte le variabili hanno placeholder espliciti
- Commenti con link a dashboard di configurazione
- Nessun dato sensibile hardcoded

#### [MEDIUM] F1-06: NEWSLETTER_ADMIN_SECRET ha un placeholder debole
- **File:** `.env.example:39`
- **Impatto:** Security — se un dev usa il placeholder in produzione, l'auth è bypassabile
- **Root cause:** Il placeholder `change-this-to-a-random-secret-string-32chars` è controllato nel codice ma potrebbe essere dimenticato
- **Soluzione:** Il codice già verifica che il secret non sia il placeholder ✅. Aggiungere un check allo startup che impedisca l'avvio in produzione con il placeholder.

---

## FASE 2: SEO ON-PAGE E TECHNICAL SEO

### 2.1 Metadata e Semantica HTML

#### [CRITICAL] F2-01: Mojibake `â€"` nei JSON-LD di portfolio.html e contatti.html
- **File:** `portfolio.html:4,23,155,174`, `contatti.html:11`
- **Impatto:** Google potrebbe invalidare i structured data. Rich snippets compromessi.
- **Root cause:** L'em-dash Unicode `—` (U+2014) è stato corrotto durante la minificazione HTML. Il minifier ha probabilmente re-encoded UTF-8 come Latin-1, producendo `â€"`.
- **Occorrenze trovate:** 13 match in 8 file

**Prima:**
```json
"name": "Portfolio â€" WebNovis"
```

**Dopo:**
```json
"name": "Portfolio — WebNovis"
```

- **Testing:** Validare con Google Rich Results Test dopo il fix.
- **Prevenzione:** Aggiungere `{ decodeEntities: false }` alle opzioni di html-minifier-terser, oppure usare `&mdash;` entity nei JSON-LD.

#### [CRITICAL] F2-02: Schema JSON-LD duplicato in portfolio.html
- **File:** `portfolio.html:1-151` e `portfolio.html:152-302`
- **Impatto:** Google segnala errore "Duplicate structured data". Può degradare i rich snippets.
- **Root cause:** Il blocco `<script type="application/ld+json">` con `CollectionPage` appare due volte identico.
- **Soluzione:** Rimuovere il secondo blocco duplicato (righe 152-302 equivalenti).

#### [OK] Title tag e meta description ✅
- Ogni pagina ha `<title>` e `<meta name="description">` unici e ottimizzati
- Lunghezze appropriate (title <60 char, description <160 char)
- Keyword placement naturale nel title

#### [OK] Heading structure ✅ (verificato su index.html, contatti.html)
- Un solo H1 per pagina
- Gerarchia H1→H2→H3 coerente

#### [OK] Structured data ricchi ✅
- Organization, LocalBusiness, WebSite, WebPage, FAQPage, BreadcrumbList, CollectionPage
- Uso corretto di `@id` per cross-referencing tra schema
- `AggregateRating` e `Review` presenti per LocalBusiness

#### [MEDIUM] F2-03: `sameAs` duplicato tra Organization e LocalBusiness in index.html
- **File:** `index.html:41-74` e `index.html:246-280`
- **Impatto:** Ridondanza nei structured data. Non è un errore ma è inefficiente.
- **Root cause:** Entrambi gli schema definiscono lo stesso array `sameAs` da 30+ URL.
- **Soluzione:** In LocalBusiness, usare `"sameAs": { "@id": "https://www.webnovis.com/#organization" }` e lasciare il `sameAs` solo nell'Organization, oppure referenziare tramite `@id`.

### 2.2 Open Graph e Social Metadata

#### [OK] OG tags completi ✅
- `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`, `og:locale`
- Twitter Card (`summary_large_image`) presente
- Canonical link corretto su tutte le pagine

#### [MEDIUM] F2-04: Mojibake anche nei `og:title` e `twitter:title`
- **File:** `portfolio.html:1` (og:title), `contatti.html:1`
- **Impatto:** Social sharing mostra caratteri corrotti
- **Root cause:** Stesso problema di F2-01
- **Soluzione:** Fix globale dell'encoding (vedi F2-01)

#### [MEDIUM] F2-05: manifest.json usa la stessa immagine per 192x192 e 512x512
- **File:** `manifest.json:16-26`
- **Impatto:** PWA install prompt potrebbe mostrare icona sfocata su schermi ad alta risoluzione
- **Root cause:** Non è stata creata una versione 512x512 dell'icona
- **Soluzione:** Creare `/Img/favicon-512.png` a 512x512px e aggiornare manifest.json.

### 2.3 Performance e Core Web Vitals

#### [OK] Compression middleware attivo ✅
- `compression` in dependencies con livello 6 e threshold 1024 bytes
- Riduzione ~70% per asset testuali

#### [OK] Cache strategy ben definita ✅
- Asset statici: `max-age=31536000, immutable` in produzione
- HTML: `max-age=300, stale-while-revalidate=3600`
- Cache-busting via query param `?v=`

#### [OK] CSS non-critical caricato con `media="print" onload` ✅
- `revolution.min.css` e `search.min.css` caricati in modo non-bloccante
- Google Fonts caricati con lo stesso pattern

#### [HIGH] F2-06: main.js è un monolite da ~2.000 righe
- **File:** `js/main.js`
- **Impatto:** LCP/FID — script parsing bloccante. Anche se `defer`, la dimensione impatta il main thread.
- **Root cause:** Tutto il JS frontend è in un unico file: navigation, particles, animations, form validation, analytics, social feed, typing effects.
- **Soluzione:** Code-split in moduli:
  - `js/core.js` — nav, scroll, back-to-top (~200 righe)
  - `js/animations.js` — particles, parallax, reveals (~300 righe, load lazy)
  - `js/contact-form.js` — form validation, Web3Forms (~200 righe, load solo su contatti.html)
  - `js/analytics.js` — GA4, Clarity, Meta Pixel (~100 righe, load post-consent)

#### [MEDIUM] F2-07: 8+ IntersectionObserver istanze in main.js
- **File:** `js/main.js` — `revealObserver`, `observer`, `canvasObserver`, `restartObserver`, `codeObserver`, `numberObserver`, `sectionObserver`, `trackSectionView`, `testimonialObserver`, `staggerObserver`
- **Impatto:** Memory overhead, potenziale impatto su CLS/INP
- **Root cause:** Ogni sezione del JS crea il proprio observer
- **Soluzione:** Consolidare in 2-3 observer centralizzati con callback routing.

#### [MEDIUM] F2-08: Particle canvas animazione perpetua
- **File:** `js/main.js:310-408`
- **Impatto:** CPU drain su mobile, battery drain
- **Root cause:** `requestAnimationFrame` loop continuo anche quando il canvas è tecnicamente visibile ma l'utente non è nella viewport
- **Soluzione attuale:** `IntersectionObserver` già ferma l'animazione ✅ — ma il `restartObserver` potrebbe causare doppio avvio. Verificare.

#### [OK] Speculation Rules presenti ✅
- `prerender` per pagine servizi e portfolio
- `prefetch` conservativo per tutte le pagine HTML

### 2.4 Accessibility e UX Signals

#### [OK] ARIA labels sulla navigazione ✅
- `aria-controls`, `aria-expanded`, `aria-label` sul nav toggle
- `role="option"` e `aria-selected` nei risultati di ricerca

#### [OK] Meta viewport corretto ✅
- `width=device-width, initial-scale=1` su tutte le pagine

#### [MEDIUM] F2-09: `alt=""` trovato in Ember-Oak.html (portfolio legacy)
- **File:** `portfolio/Ember-Oak.html`
- **Impatto:** Accessibilità — immagine decorativa o alt text mancante
- **Root cause:** Generazione automatica incompleta
- **Soluzione:** Verificare se l'immagine è decorativa (ok `alt=""`) o informativa (servono alt descrittivi).

#### [MEDIUM] F2-10: Nessun skip-to-content link
- **Impatto:** Utenti con screen reader devono navigare l'intera nav per raggiungere il contenuto
- **Soluzione:** Aggiungere `<a href="#main" class="skip-link">Vai al contenuto</a>` come primo elemento del `<body>`.

---

## FASE 3: ANALISI DEL CODICE E QUALITÀ

### 3.1 Linting e Code Standards

#### [HIGH] F3-01: Nessun linter configurato
- **Impatto:** Inconsistenza di stile, bug silenti, difficoltà di onboarding
- **Root cause:** Nessun `.eslintrc`, `.prettierrc`, o `.editorconfig`
- **Soluzione:**
  ```bash
  npm install -D eslint prettier eslint-config-prettier
  ```
  Creare configurazione base che rispetti lo stile attuale del progetto.

#### [LOW] F3-02: Mix di arrow function e function declaration
- **File:** `js/main.js` — usa sia `const fn = () => {}` che `function fn() {}` senza pattern chiaro
- **Impatto:** Consistenza del codice
- **Soluzione:** Stabilire convenzione nel team e documentarla.

### 3.2 Type Safety e Validazione

#### [OK] Input sanitization sugli API endpoints ✅
- Email regex validation
- HTML tag stripping
- Length limits su tutti gli input
- `escapeHtml()` utility usata correttamente

#### [OK] Prompt injection protection ✅
- Pattern matching server-side per attacchi noti
- Input sanitizzato prima di passarlo a Gemini/Groq
- System prompt separato dai dati utente

#### [MEDIUM] F3-03: Newsletter engine importa node-fetch ad ogni chiamata
- **File:** `newsletter-engine.js:99,157,192,351`
- **Impatto:** Performance — dynamic import ripetuto (anche se cached dal runtime)
- **Root cause:** Ogni funzione fa `const fetch = (await import('node-fetch')).default;`
- **Soluzione:** Usare il pattern `getFetch()` già presente in `server.js`, oppure migrare a `globalThis.fetch` nativo.

### 3.3 Error Handling e Logging

#### [OK] Graceful fallback nel chatbot ✅
- Se Gemini API fallisce, risponde con risposte locali pre-configurate
- Status 200 per search AI anche in caso di errore (non-critical feature)

#### [OK] Errori non espongono dati sensibili ✅
- Messaggi generici verso il client
- Dettagli loggati solo server-side

#### [MEDIUM] F3-04: Console logging eccessivo in produzione
- **File:** `server.js:57,764,831` e molti altri
- **Impatto:** Performance I/O, rumore nei log
- **Root cause:** Emoji-rich console.log per tutti gli eventi
- **Soluzione:** Usare un logger strutturato (es. `pino`) con livelli. In produzione, disattivare `debug` e `info` non critici.

#### [MEDIUM] F3-05: Bot access log scritto con appendFile asincrono senza error handling
- **File:** `server.js:214`
- **Impatto:** Se il filesystem è pieno, errori silenti. Il file cresce illimitatamente.
- **Root cause:** `fs.appendFile(path, entry, () => {})` — callback vuoto
- **Soluzione:** Aggiungere error callback e implementare log rotation (o usare un logger con rotation).

### 3.4 Performance del Codice

#### [MEDIUM] F3-06: `fs.existsSync` nel 404 handler (hot path)
- **File:** `server.js:1143`
- **Impatto:** Operazione sincrona su ogni 404 — blocca l'event loop
- **Root cause:** Check file existence ad ogni request non trovata
- **Soluzione:** Cache il risultato all'avvio:
  ```js
  const has404Page = fs.existsSync(path.join(__dirname, '404.html'));
  // poi nel handler:
  if (has404Page) return res.sendFile(notFoundPath);
  ```

#### [MEDIUM] F3-07: `createSystemPrompt()` chiamato ad ogni chat request
- **File:** `server.js:781`
- **Impatto:** CPU overhead per stringhe ripetitive
- **Root cause:** Il system prompt è statico ma viene rigenerato ad ogni richiesta
- **Soluzione:** Generarlo una volta all'avvio e cachare il risultato:
  ```js
  const cachedSystemPrompt = createSystemPrompt();
  ```

---

## FASE 4: SEO FUNZIONALE E DINAMICO

### 4.1 Sitemap e Robots.txt

#### [OK] Sitemap ben strutturata ✅
- 93+ URL con `<lastmod>` basata su mtime dei file
- Image sitemap per portfolio case studies
- Nessun `changefreq`/`priority` (ignorati da Google)

#### [MEDIUM] F4-01: Tutte le lastmod con la stessa data
- **File:** `sitemap.xml`
- **Impatto:** Google non può distinguere contenuti aggiornati di recente. Perde il "freshness signal".
- **Root cause:** La sitemap è rigenerata manualmente e `mtime` viene aggiornata dal build/minification che tocca tutti i file
- **Soluzione:** Mantenere date reali di modifica del contenuto. Opzione: usare git log per la data dell'ultimo commit che ha modificato il contenuto (non il build).

#### [MEDIUM] F4-02: `grazie.html` nella sitemap ma dovrebbe essere noindex
- **File:** `sitemap.xml:387-389`
- **Impatto:** Pagina di ringraziamento post-form indicizzata → contenuto thin, waste crawl budget
- **Root cause:** `generate-sitemap.js` non esclude `grazie.html`
- **Soluzione:** Aggiungere `/grazie\.html$/` a `EXCLUDE_PATTERNS` in `generate-sitemap.js`.

#### [OK] robots.txt ben configurato ✅
- Blocca correttamente server code, .env, node_modules
- Permette crawl di AI bots (GPTBot, ClaudeBot, PerplexityBot, ecc.)
- Blocca scraper aggressivi (MJ12bot, DotBot, BLEXBot)

#### [LOW] F4-03: robots.txt usa `$` anchor non universalmente supportato
- **File:** `robots.txt:24,26,28`
- **Impatto:** Alcuni crawler potrebbero non riconoscere `/*.bat$` come pattern
- **Root cause:** Il `$` end-of-string anchor è un'estensione Google, non parte dello standard robots.txt
- **Soluzione:** Accettabile dato che Googlebot lo supporta. Per altri crawler, il pattern funziona comunque come prefisso.

### 4.2 URL Structure e Routing

#### [OK] URL SEO-friendly ✅
- Struttura piatta e leggibile: `/servizi/sviluppo-web.html`, `/blog/seo-per-piccole-imprese.html`
- Hyphens come separatori

#### [OK] Canonical tags corretti su tutte le 131 pagine HTML ✅

#### [OK] Trailing slash normalization ✅
- Redirect 301 per trailing slash (eccetto `/blog/` e `/servizi/`)
- UTM/tracking parameter stripping con 301

#### [OK] Legacy portfolio redirects ✅
- 6 redirect 301 da URL legacy (PascalCase) a canonical lowercase `/portfolio/case-study/`

#### [MEDIUM] F4-04: Potenziale keyword cannibalization
- **File:** `agenzia-web-rho.html` e `agenzie-web-rho.html`
- **Impatto:** Due pagine targetizzano la stessa keyword locale "agenzia web rho"
- **Root cause:** Variante singolare/plurale creata come pagine separate
- **Soluzione:** Verificare in Google Search Console quale delle due si posiziona. Consolidare in una sola pagina con redirect 301 dall'altra.

### 4.3 Crawlability

#### [OK] Sito completamente crawlabile ✅
- HTML statico pre-renderizzato — nessuna dipendenza da JavaScript per il contenuto
- Structured data in `<script type="application/ld+json">` (non generato da JS)
- Bot logging attivo per Googlebot, Bingbot, AI bots

#### [OK] X-Robots-Tag per API endpoints ✅
- `/api/*` e `/admin/*` hanno `noindex, nofollow`

### 4.4 Internal Linking

#### [OK] Navigazione consistente ✅
- Nav bar identica su tutte le pagine con link a Servizi, Portfolio, Chi Siamo, Blog, Contatti
- Breadcrumb JSON-LD su tutte le pagine

#### [MEDIUM] F4-05: Blog index link usa `/blog/index.html` invece di `/blog/`
- **File:** Nav in `404.html:3` e probabilmente altri
- **Impatto:** URL non canonico usato come link interno. Google potrebbe considerarli come pagine diverse.
- **Root cause:** Hardcoded `/blog/index.html` nei template
- **Soluzione:** Usare `/blog/` ovunque. La sitemap già usa `/blog/` ✅.

---

## FASE 5: SICUREZZA E COMPLIANCE

### 5.1 HTTPS e SSL/TLS

#### [OK] HSTS configurato ✅
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

#### [MEDIUM] F5-01: Manca `preload` nella direttiva HSTS di server.js
- **File:** `server.js:132`
- **Impatto:** Il dominio non è eleggibile per la HSTS preload list
- **Root cause:** `_headers` ha `preload` ma `server.js` no
- **Soluzione:**
  ```js
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  ```
- **Side effect:** Prima di aggiungere `preload`, assicurarsi che TUTTI i sottodomini supportino HTTPS.

### 5.2 GDPR e Privacy

#### [OK] Privacy Policy e Cookie Policy presenti ✅
- Pagine dedicate: `privacy-policy.html`, `cookie-policy.html`, `termini-condizioni.html`
- Indicizzate e linkate nel footer

#### [OK] Google Analytics con consent mode v2 ✅
- Consent default `denied` per tutte le categorie
- Script GA4 caricato SOLO dopo consenso esplicito
- Clarity e Meta Pixel stessa logica

#### [OK] Newsletter GDPR compliant ✅
- Link unsubscribe in ogni email con HMAC token verification
- `List-Unsubscribe` e `List-Unsubscribe-Post` header

#### [MEDIUM] F5-02: Cookie consent banner — implementazione da verificare
- I cookie consent function (`enableAnalyticsTracking`, `disableAnalyticsTracking`) esistono in `js/main.js:1278-1357`
- Il check `localStorage.getItem('cookie_consent') === 'accepted'` indica un banner
- Ma il banner HTML/CSS non è visibile nei file esaminati — potrebbe essere in un file CSS separato o iniettato da uno script
- **Soluzione:** Verificare che il cookie banner sia effettivamente visibile e conforme alla normativa italiana (Garante Privacy, Linee Guida Cookie giugno 2021).

### 5.3 Security Headers

#### [CRITICAL] F5-03: CSP mismatch tra server.js e _headers
- **File:** `server.js:135` vs `_headers:14`

**server.js (minimal):**
```
Content-Security-Policy: frame-ancestors 'self'; object-src 'none'; base-uri 'self'
```

**_headers (completo):**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com ...; style-src 'self' 'unsafe-inline' ...; img-src 'self' data: https: blob:; ...
```

- **Impatto:** Quando il sito è servito da server.js (Render), la CSP è troppo permissiva — non blocca script/style/img da origini non autorizzate. Quando servito da GitHub Pages + Cloudflare, la CSP piena di `_headers` protegge correttamente.
- **Root cause:** server.js non è stato aggiornato con la CSP completa.
- **Soluzione:** Copiare la CSP completa da `_headers` a `server.js:135`:
  ```js
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://widget.trustpilot.com https://connect.facebook.net https://www.clarity.ms https://cdn.jsdelivr.net https://web3forms.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://api.web3forms.com https://www.facebook.com; frame-src https://widget.trustpilot.com https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.web3forms.com; upgrade-insecure-requests"
  ```

#### [OK] Altri security headers corretti ✅
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-XSS-Protection: 0` (corretto — il filtro è deprecato)

---

## FASE 6: TESTING E DOCUMENTAZIONE

### 6.1 Test Coverage

#### [HIGH] F6-01: Zero test coverage
- **Impatto:** Qualsiasi modifica rischia regressioni silenti. Deploy senza rete di sicurezza.
- **Root cause:** Nessun framework di test configurato
- **Soluzione minima (Quick Win):**
  ```bash
  npm install -D vitest supertest
  ```
  Creare `tests/` con:
  - `health.test.js` — verifica che `/api/health` risponde 200
  - `security-headers.test.js` — verifica che gli header di sicurezza sono presenti
  - `sitemap.test.js` — verifica che la sitemap è valida e non contiene URL bloccati da robots.txt
  - `build.test.js` — verifica che il build produce file .min.js/.min.css validi

#### [OK] Lighthouse CI configurato ✅
- **File:** `lighthouserc.js`
- Soglie: Performance ≥85 (warn), SEO ≥90 (error), Accessibility ≥85 (warn)
- GitHub Actions workflow presente in `.github/workflows/lighthouse-ci.yml`

### 6.2 Documentazione

#### [OK] README.md presente ✅
#### [OK] `.env.example` completo e commentato ✅
#### [OK] Docs SEO strategy completi in `docs/seo-strategy/` ✅

#### [MEDIUM] F6-02: Nessun CONTRIBUTING.md
- **Impatto:** Onboarding nuovi sviluppatori
- **Soluzione:** Creare un CONTRIBUTING.md con setup locale, convenzioni di codice, e processo di deploy.

---

## QUICK WINS — FIX VELOCI PER IMPATTO IMMEDIATO

### QW-1: Fix mojibake `â€"` → `—` (30 min, SEO CRITICO)
File coinvolti: `portfolio.html`, `contatti.html`, e i 6 file legacy in `portfolio/`.
Cercare e sostituire `â€"` con `—` (o `&mdash;`).

### QW-2: Rimuovi schema JSON-LD duplicato in portfolio.html (5 min, SEO CRITICO)
Il secondo blocco `CollectionPage` (identico al primo) deve essere rimosso.

### QW-3: Aggiungi `preload` a HSTS in server.js (5 min, SECURITY)
```js
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
```

### QW-4: Escludi grazie.html dalla sitemap (5 min, SEO)
In `generate-sitemap.js`, aggiungere:
```js
/grazie\.html$/,
```
a `EXCLUDE_PATTERNS`.

### QW-5: Cache `createSystemPrompt()` all'avvio (5 min, PERFORMANCE)
```js
const cachedSystemPrompt = createSystemPrompt();
// In /api/chat handler:
const systemPrompt = cachedSystemPrompt;
```

### QW-6: Cache `fs.existsSync('404.html')` all'avvio (5 min, PERFORMANCE)
```js
const has404Page = fs.existsSync(path.join(__dirname, '404.html'));
```

### QW-7: Usa `/blog/` invece di `/blog/index.html` nei link di navigazione (15 min, SEO)
Search & replace in tutti gli HTML dove appare `/blog/index.html` come href.

---

## RIEPILOGO FINDINGS PER SEVERITY

| Severity | Count | ID |
|----------|-------|----|
| 🔴 CRITICAL | 3 | F2-01, F2-02, F5-03 |
| 🟠 HIGH | 4 | F1-01, F2-06, F3-01, F6-01 |
| 🟡 MEDIUM | 17 | F1-02, F1-04, F1-06, F2-03, F2-04, F2-05, F2-07, F2-08, F2-09, F2-10, F3-03, F3-04, F3-05, F3-06, F3-07, F4-01, F4-02, F4-04, F4-05, F5-01, F5-02, F6-02 |
| 🟢 LOW | 4 | F1-03, F1-05, F3-02, F4-03 |

**Findings totali: 28**

---

*Report generato automaticamente dall'analisi statica della codebase. Per validazione completa, eseguire Lighthouse CI, Google Rich Results Test, e test manuali su dispositivi reali.*
