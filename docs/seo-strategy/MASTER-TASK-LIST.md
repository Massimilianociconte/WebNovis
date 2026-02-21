# MASTER TASK LIST — SEO/GEO WebNovis
**Versione:** 3.0 — Aggiornato 20 Febbraio 2026
**Architettura:** Frontend statico su GitHub Pages | API Express su Render | Dominio Aruba.it
**Cloudflare:** CONFIGURATO COMPLETAMENTE — entra in vigore al go-live del dominio

---

## INDICE

1. [IMPLEMENTATO — Storico Completo](#implementato)
2. [TODO CODE LEVEL](#todo-code)
3. [TODO MANUALE / OPERATIVO](#todo-manuale)
4. [Profili Esterni — Stato Dettagliato](#profili)
5. [Cloudflare — Stato e Prossimi Passi](#cloudflare)
6. [Elementi Rimossi / Deprecati](#deprecated)
7. [Note Architetturali](#note)

---

## IMPLEMENTATO ✅ — Storico Completo

### A — Frontend / HTML / Build Pipeline

| Task | File | Data | Dettaglio |
|------|------|------|-----------|
| web-vitals RUM → GA4 | `js/web-vitals-reporter.js` | 18/02 | CLS, INP, LCP, FCP, TTFB → GA4; lazy-loaded post-consenso |
| Lighthouse CI pipeline | `.github/workflows/lighthouse-ci.yml` + `lighthouserc.js` | 18/02 | Min score: 85 perf / 90 SEO / 85 a11y. Eseguito ogni Monday 8am UTC e ad ogni push su main |
| x-default hreflang su index.html | `index.html` | 18/02 | `<link rel="alternate" hreflang="x-default" href="https://www.webnovis.com/">` aggiunto |
| 404.html custom | `404.html` | 18/02 | GitHub Pages la serve automaticamente; con nav, link utili, stile premium |
| Date aggiornamento visibili `<time>` | Pagine servizio | 18/02 | Tag `<time datetime="...">` visibile sotto breadcrumb su pagine servizio |
| Blog daily GitHub Action | `.github/workflows/daily-blog.yml` | 18/02 | Articolo automatico ogni giorno via Gemini/Groq; 20 articoli live, 170 topic in queue |
| build.js pipeline | `build.js` | 18/02 | Terser per JS (7 file), LightningCSS per CSS (8 file), HTML minifier per HTML (54 file) |
| **Speculation Rules API** | `index.html` + 9 pagine | **20/02** | `<script type="speculationrules">` aggiunto prima di `</body>` su: index.html, chi-siamo.html, contatti.html, portfolio.html, 6 pagine `/servizi/`. Prerender `moderate` per servizi/contatti/portfolio/chi-siamo; prefetch `conservative` per tutto `/*.html` (escluso blog). LCP navigazioni interne → ~0ms percettibili |
| **AI Referral Tracking GA4** | `js/main.js` (riga 1825) | **20/02** | IIFE che rileva `document.referrer` per 10 sorgenti AI: `chat.openai.com`, `chatgpt.com`, `perplexity.ai`, `claude.ai`, `anthropic.com`, `bing.com/chat`, `copilot.microsoft.com`, `you.com`, `phind.com`, `gemini.google.com`, `bard.google.com`. Invia evento `ai_referral` a GA4 (category: "AI Traffic", label: dominio sorgente). Sistema a coda: se il consenso non è ancora dato, l'evento viene accodato in `window.__pendingAiReferral` e flushed dentro `enableAnalyticsTracking()` |
| **figcaption + figure** | `index.html` | **20/02** | Immagine "Ricominciare" wrappata in `<figure><figcaption>`. Testo figcaption: "Web Novis affianca le imprese di Rho e Milano per reinventare la loro identità digitale: siti web, branding e social media costruiti da zero..." Caption-Alt-Body cycle completato per VLM semantic grounding |
| **generate-sitemap.js** | Root | **20/02** | Script Node.js dinamico. Scansiona tutti gli HTML (esclude docs/, node_modules/, 404, newsletter-template, ecc.), usa `fs.statSync().mtime` per `lastmod` reale, include image sitemap per 12 immagini portfolio, output senza `changefreq` né `priority`. Esecuzione: `node generate-sitemap.js`. Aggiungere a script post-deploy |
| **sitemap.xml rigenerata** | `sitemap.xml` | **20/02** | 52 URL (era 40), `lastmod` reale da filesystem (2026-02-19/20), image sitemap per portfolio, **zero** `changefreq` e `priority` (deprecati da Google) |
| **build.js rebuild con AI tracking** | `js/main.min.js` | **20/02** | main.js (67.20 KB) → main.min.js (32.75 KB, -51.3%). Tutti i 15 asset totali: 358.72 KB → 208.52 KB (-41.9%) |
| **Landing page geo — Rho** | `agenzia-web-rho.html` | **20/02** | 278 righe. Contenuto locale autentico: Fiera Milano Rho (2° polo fieristico d'Europa), DHL/Sogemar/Fercam, Zagato, SS33/A8/A9/MM1. Schema: LocalBusiness dedicato (12 zone areaServed, GeoCircle 20km), Service, HowTo (5 fasi), FAQPage (7 domande locali), Speakable, BreadcrumbList, WebPage. Sezioni: perché locale, servizi, territorio, processo, portfolio, FAQ, CTA. Speculation Rules API. Link interni nel footer di index.html + 7 servizi |
| **Landing page geo — Milano** | `agenzia-web-milano.html` | **20/02** | 275 righe. Angolo: "studio a Rho, 20 min da Milano Centrale". Mercato: startup, PMI, moda/design/lifestyle, fintech, B2B. Schema: LocalBusiness (Città Metropolitana, GeoCircle 35km), Service, HowTo (5 fasi), FAQPage (7 domande), Speakable, BreadcrumbList, WebPage. Sezioni: perché WebNovis, servizi, zone servite (Porta Nuova/Brera/Navigli/Tortona/Bicocca/CityLife), processo, portfolio, FAQ, CTA cross-link verso Rho |
| **Sitemap aggiornata a 54 URL** | `sitemap.xml` | **20/02** | Rigenerata con `node generate-sitemap.js`. Entrambe le geo landing pages incluse con `lastmod: 2026-02-20` |
| **Link interni geo pages** | `index.html` + 7 `servizi/*.html` | **20/02** | Link "Web Agency Rho" e "Web Agency Milano" aggiunti al footer colonna "Azienda" di tutte le pagine chiave (index + sviluppo-web, ecommerce, landing-page, sito-vetrina, graphic-design, social-media, servizi/index) |

---

### B — Schema Markup e Knowledge Graph

| Task | File | Data | Dettaglio |
|------|------|------|-----------|
| Organization schema | `index.html` | 18/02 | `@id`, `name`, `alternateName` ["WebNovis","Web Novis — Agenzia Web"], `logo` (ImageObject con @id, width, height, caption), `foundingDate: "2025"`, `description`, `slogan`, `address` (@id ref), `contactPoint`, `knowsAbout` (10 competenze) |
| **`employee` link Org → Person** | `index.html` | **20/02** | `"employee": { "@id": "https://www.webnovis.com/#person-massimiliano" }` aggiunto al nodo Organization — Knowledge Graph bidirezionale completato. I crawler AI possono navigare la relazione in entrambe le direzioni |
| WebSite schema | `index.html` | 18/02 | `SearchAction/potentialAction` per sitelink search box, `publisher` @id ref |
| LocalBusiness schema completo | `index.html` | 18/02 | `@type: ["LocalBusiness","ProfessionalService"]`, full address @id, `geo` (lat: 45.5299, lng: 9.0393), `hasMap`, `openingHoursSpecification` (24/7), `priceRange: "€€"`, `currenciesAccepted`, `paymentAccepted`, `aggregateRating` (5★, ratingCount: 5, reviewCount: 5), `review` array (5 recensioni nominate) |
| `serviceArea` GeoCircle 30km | `index.html` | 18/02 | `geoMidpoint` Rho, `geoRadius: "30000"` |
| `areaServed` 9 voci | `index.html` | 18/02 | Rho, Milano, Monza, Pero, Arese, Lainate, Bollate (tutti con `sameAs` Wikipedia) + Hinterland milanese (AdministrativeArea) + Italia (Country) |
| Organization `sameAs` 13 voci | `index.html` | 18/02 | Instagram, Facebook, Clutch, Trustpilot, Hotfrog, Cylex, Firmania, Trova Aperto, Cronoshare, LinkedIn, Wikidata Q138340285, Crunchbase, DesignRush |
| `hasOfferCatalog` in LocalBusiness | `index.html` | 18/02 | 3 servizi (Sviluppo Web, Graphic Design, Social Media) con description e url |
| BreadcrumbList | Tutte le pagine | 18/02 | Presente su homepage, chi-siamo, contatti, portfolio, 11 case study, 6 servizi, blog |
| FAQPage schema | `index.html` + servizi | 18/02 | 6 FAQ homepage (inclusa 1 domanda su AI), FAQ su ogni pagina servizio con domande specifiche per servizio; 29 riferimenti totali nel codebase |
| Service schema su 6 pagine servizio | `servizi/*.html` | 18/02 | `@id`, `serviceType`, `name`, `description`, `provider` (@id ref), `areaServed` [Rho, Milano, Italia], `hasOfferCatalog` con prezzi (`Offer` con `price` e `priceCurrency: "EUR"`) |
| WebPage schema con date | Tutte le pagine | 18/02 | `datePublished: "2025-01-01"`, `dateModified: "2026-02-XX"` in ogni WebPage / AboutPage / ContactPage |
| Person schema Massimiliano | `chi-siamo.html` | 18/02 | `@type: "Person"`, `@id: "#person-massimiliano"`, `name`, `jobTitle: "Co-Founder & Web Developer"`, `worksFor` (@id ref Organization), `knowsAbout` (12 competenze: Web Development, JavaScript, Node.js, Express.js, SEO Tecnica, GEO, HTML5, CSS3, E-commerce, UI/UX, Core Web Vitals, Schema.org), `url`, `image` |
| **Person `sameAs` LinkedIn** | `chi-siamo.html` | **20/02** | `"sameAs": "https://www.linkedin.com/company/webnovis"` — grafo Person ora collegato al profilo LinkedIn |
| AboutPage schema | `chi-siamo.html` | 18/02 | `mainEntity → Organization` con `knowsAbout`, `areaServed`, `sameAs` |
| ContactPage schema | `contatti.html` | 18/02 | Con `ContactPoint`, `telephone`, `email`, `availableLanguage` |
| Article schema | 11 case study | 18/02 | `headline`, `description`, `author`, `publisher` (logo ImageObject), `datePublished`, `dateModified`, `mainEntityOfPage` |
| **ImageObject schema portfolio** | 11 case study | **20/02** | JSON-LD per ogni immagine principale: `@id: "[url]#image"`, `url` (mockup-800.webp), `caption` descrittivo con entity "Web Novis", `width: 800`, `height: 600`, `creator → #organization`, `copyrightHolder → #organization` |

---

### C — GEO / AI-Readiness

| Task | File | Data | Dettaglio |
|------|------|------|-----------|
| `ai.txt` | Root | 18/02 | 128+ righe: tassonomia entità, policy AI, direttive LLM, Wikidata Q138340285, Crunchbase, lista bot autorizzati |
| `llms.txt` | Root | 18/02 | Formato Jeremy Howard; struttura per modelli linguistici, informazioni di contatto, servizi |
| `webnovis-ai-data.json` | Root | 18/02 | Database JSON strutturato specificamente per crawler AI — bypass ambiguità HTML parsing |
| `robots.txt` AI-permissivo | Root | 18/02 | 13 User-agent AI bot esplicitamente `Allow: /`: GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, anthropic-ai, Applebot-Extended, CCBot, ChatGPT-User, cohere-ai, Diffbot, FacebookBot, PerplexityBot |
| `meta name="ai-content"` | Tutte le pagine | 18/02 | Punta a `https://www.webnovis.com/ai.txt` |
| IndexNow | `indexnow-submit.js` + `blog/auto-writer.js` | 18/02 | Ping istantaneo a Bing e motori compatibili ad ogni contenuto nuovo o modificato; chiave crittografica residente nel repo |
| Wikidata Q138340285 | `sameAs` + AI files | 18/02 | Profilo attivo: https://www.wikidata.org/wiki/Q138340285 — presente in index.html, ai.txt, llms.txt, webnovis-ai-data.json |
| Crunchbase | `sameAs` + AI files | 18/02 | https://www.crunchbase.com/organization/web-novis — aggiunto a tutti i file rilevanti |

---

### D — Content Optimization / GEO-RAG

| Task | Pagine | Data | Dettaglio |
|------|--------|------|-----------|
| **Answer Capsules RAG** | Homepage + 6 servizi | **20/02** | Paragrafi autonomi 55-70 parole aggiunti dopo H1 su ogni pagina servizio e homepage. Caratteristiche: entità "Web Novis" menzionata esplicitamente, location (Rho/Milano), differenziatore chiave (custom code, no WordPress/template), CTA (preventivo gratuito, timeframe). Zero pronomi anaforici — ogni chunk è auto-esplicativo per chunking RAG. Pagine aggiornate: index.html, sviluppo-web.html, ecommerce.html, landing-page.html, sito-vetrina.html, graphic-design.html, social-media.html |
| **H2/H3 interrogativi** | Homepage + 6 servizi | **20/02** | Heading dichiarativi riformulati come domande esplicite per PAA e voice search. Esempi: "Il Nostro Approccio allo Sviluppo" → "Come Web Novis affronta lo sviluppo di un sito web?"; "Il Processo: da Zero al Lancio" → "Come avviene il processo di sviluppo con Web Novis, dalla prima call al lancio?"; "Come Lavoriamo" → "Come lavora Web Novis con i clienti, dalla prima call al sito online?" |
| FAQ con FAQPage schema | Homepage + servizi | 18/02 | 29 riferimenti FAQ totali; include domande long-tail e vocazionali |

---

### E — Backend / server.js

| Task | Data | Dettaglio |
|------|------|-----------|
| Security Headers Middleware | 18/02 | `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()` |
| X-Robots-Tag Middleware | 18/02 | `noindex, nofollow` automatico per path che iniziano con `/api/` o `/admin/` |
| Trailing Slash Normalization | 18/02 | Redirect 301 permanente `/path/` → `/path` (esclude `/blog/` e `/servizi/`); previene contenuti duplicati |
| UTM Parameter Stripping | 18/02 | Redirect 301 che elimina `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `gclid` da qualsiasi URL |
| Bot Detection Logging | 18/02 | Log non-bloccante su `bot-access.log` per 10 bot: Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User, OAI-SearchBot, Google-Extended, Applebot, DuckAssistBot. Formato JSON per ogni accesso (timestamp, bot name, url, method) |
| Gzip Compression Middleware | 18/02 | `compression` npm, level 6, threshold 1024B, filtro su header `x-no-compression` |
| Cache-Control Headers | 18/02 | Asset statici (`/css/`, `/js/`, `/Img/`, `/fonts/`): `max-age=31536000, immutable`. HTML root: `max-age=300, stale-while-revalidate=3600`. Blog/servizi/portfolio: `max-age=3600, stale-while-revalidate=7200` |
| Custom 404 Handler | 18/02 | Ultima route Express: serve `404.html` per request HTML, JSON `{error, status}` per API request |
| Rate Limiting | 18/02 | `express-rate-limit` su endpoint `/api/chat` (principale punto di ingresso chatbot) |
| CORS Middleware | 18/02 | `cors` npm con whitelist domini configurabili via variabile d'ambiente `CORS_ORIGINS` |

---

### F — Monitoraggio Attivo

| Tool | Stato | Dettaglio |
|------|-------|-----------|
| GA4 (Google Analytics 4) | ✅ Attivo | Lazy-loaded post-consenso GDPR, `anonymize_ip: true`, evento `ai_referral` per traffico AI |
| Microsoft Clarity | ✅ Attivo | Heatmap + session recording, lazy-loaded post-consenso |
| web-vitals-reporter.js | ✅ Attivo | CWV → GA4 RUM (Real User Monitoring) |
| Lighthouse CI | ✅ Attivo | GitHub Actions, ogni Monday + ogni push su `main` |
| **AI Referral Tracking** | ✅ **Attivo** | 10 sorgenti AI rilevate → evento GA4 `ai_referral` con label dominio sorgente |
| Talkwalker Alerts | ✅ **Configurati** | Query attive: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com` — 4 alert |
| Google Alerts | ✅ **Configurati** | Query attive: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com` — 4 alert |
| Share of Model monitoring | ☐ DA FARE | Query manuale mensile su ChatGPT/Perplexity/Claude |



---

## TODO FUTURA — CODE LEVEL

Tutto ciò che può essere implementato modificando il codebase (HTML, JSON-LD, CSS, JS, Node.js).
Eseguibile senza accesso a piattaforme esterne o decisioni editoriali esterne.

---

### 🔴 Alta Priorità (impatto SEO/GEO diretto, effort basso-medio)

#### ✅ Landing Page Geolocalizzate — COMPLETATO (20/02/2026)
**File:** `/agenzia-web-rho.html` + `/agenzia-web-milano.html`

**Implementato:**
- ✅ H1 geolocalizzato + Answer Capsule RAG (55-70 parole, entity-dense)
- ✅ LocalBusiness schema dedicato per città (areaServed espanso, GeoCircle, hasOfferCatalog)
- ✅ Service schema con areaServed specifico
- ✅ FAQPage con 7 domande geolocalizzate per pagina
- ✅ HowTo schema per processo in 5 fasi
- ✅ Speakable schema su `.answer-capsule` e `h1`
- ✅ BreadcrumbList, WebPage schema con datePublished/dateModified
- ✅ Contenuto locale autentico: Fiera Milano Rho (2° polo fieristico d'Europa), DHL/Sogemar/Fercam, Zagato, logistica, SS33/A8/A9/MM1
- ✅ Sezioni: Perché locale, Servizi, Territorio, Processo, Portfolio, FAQ, CTA
- ✅ Link interni nel footer di index.html + 7 pagine servizi
- ✅ Speculation Rules API (prerender moderato verso servizi/contatti)
- ✅ Sitemap aggiornata a 54 URL (lastmod 2026-02-20)
- ✅ Build completato (56 HTML scanned, 0 errori)

**URL:**
- `https://www.webnovis.com/agenzia-web-rho.html` — Rho, hinterland NW Milano (12 zone)
- `https://www.webnovis.com/agenzia-web-milano.html` — Milano, Città Metropolitana (12 zone)

---

#### ServiceArea su Pagine Servizio Singole
**File:** `servizi/sviluppo-web.html`, `servizi/ecommerce.html`, `servizi/landing-page.html`, `servizi/sito-vetrina.html`, `servizi/graphic-design.html`, `servizi/social-media.html`
**Problema:** `serviceArea` GeoCircle è presente solo nel LocalBusiness di index.html. I Service schema sulle pagine individuali hanno `areaServed` con solo 3 voci [Rho, Milano, Italia] ma non il GeoCircle.
**Soluzione:** Aggiungere `"areaServed"` espanso con le 7 città + hinterland in tutti i Service schema.
**Effort:** 1h | **Eseguibile da codice:** ✅ Sì

---

#### FAQPage Estesa con Query Locali e Long-tail
**File:** `index.html` (FAQPage schema), pagine servizio
**Soluzione:** Aggiungere 5-10 domande geolocalizzate al FAQPage schema e alla sezione HTML visibile:
- "Quanto costa un sito web a Rho?"
- "Web Novis serve solo Rho o anche Milano e hinterland?"
- "Quanto tempo ci vuole per realizzare un sito web professionale?"
- "Posso avere un preventivo gratuito senza impegno?"
- "Qual è la differenza tra un sito vetrina e un e-commerce?"
**Effort:** 2h | **Eseguibile da codice:** ✅ Sì

---

#### Speakable Schema su Blog e Pagine Servizio
**File:** `blog/*.html`, `servizi/*.html`
**Descrizione:** `"@type": "Speakable"` con `cssSelector` che punta ai paragrafi chiave (Answer Capsule, intro H1). Ottimizza per Google Assistant, Alexa, voice search in generale.
```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": [".answer-capsule", "h1", ".section-subtitle"]
}
```
**Effort:** 2h | **Eseguibile da codice:** ✅ Sì

---

#### HowTo Schema sulle Sezioni Processo
**File:** `servizi/sviluppo-web.html`, `servizi/ecommerce.html`, `servizi/landing-page.html`
**Descrizione:** Aggiungere `HowTo` schema per le sezioni "Come avviene il processo con Web Novis" — aumenta eligibility per rich results "how-to" in SERP.
**Struttura:** `name`, `description`, `step` array con `@type: HowToStep`, `name`, `text` per ogni fase del processo (Briefing → Wireframe → Sviluppo → Test → Lancio).
**Effort:** 3h | **Eseguibile da codice:** ✅ Sì

---

### 🟠 Media Priorità

#### AVIF Images via `<picture>`
**File:** Tutte le pagine con `<img>` critici (homepage, case study, portfolio)
**Problema:** Attualmente solo WebP. AVIF è 40-50% più leggero di WebP.
**Soluzione:** Wrappare ogni immagine critica in `<picture>` con sorgente AVIF + fallback WebP:
```html
<picture>
  <source srcset="Img/file.avif" type="image/avif">
  <source srcset="Img/file.webp" type="image/webp">
  <img src="Img/file.jpg" alt="..." loading="lazy">
</picture>
```
**Conversione:** `sharp` è già in devDependencies — aggiungere task AVIF a `build.js`.
**Effort:** 4-6h | **Eseguibile da codice:** ✅ Sì

---

#### Bundle JS Split: homepage.js vs core.js
**File:** `js/main.js` + `build.js`
**Problema:** L'intero JS (particles, 3D globe, social simulator, cursor, text effects) carica su OGNI pagina. Le pagine interne (servizi, blog, case study) non usano particles né 3D globe.
**Soluzione:**
- Creare `js/homepage.js` con: particles, 3D globe, social simulator, cursor effect
- Creare `js/core.js` con: scroll behaviors, nav, cookie banner, search, vitals reporter, AI referral tracking
- Homepage: carica entrambi. Pagine interne: carica solo `core.min.js`
- Modifica `build.js` per minificare i due bundle separatamente
**Risparmio stimato:** ~50% del JS su pagine interne
**Effort:** 6-8h | **Eseguibile da codice:** ✅ Sì

---

#### Breadcrumb Visuale HTML (non solo JSON-LD)
**File:** Tutte le pagine interne
**Problema:** Il BreadcrumbList è solo JSON-LD machine-readable, nessun elemento HTML visibile.
**Soluzione:** Aggiungere `<nav aria-label="breadcrumb">` HTML visibile subito sotto la navbar, con microdata `itemscope` + `itemprop`.
**Effort:** 2h | **Eseguibile da codice:** ✅ Sì

---

#### Dataset/ImageObject JSON-LD per Contenuti Visivi
**File:** Case study + blog con grafici o tabelle
**Descrizione:** "Invisible Table Technique" — per ogni grafico o tabella riepilogativa, aggiungere nodo JSON-LD `Dataset` o tabella HTML nativa affiancata all'immagine. I VLM (Vision-Language Models) usano i token testuali adiacenti per interpretare il contenuto visivo.
**Effort:** 3h | **Eseguibile da codice:** ✅ Sì

---

#### Date Visibili `<time>` su chi-siamo.html
**File:** `chi-siamo.html`
**Soluzione:** Aggiungere `<p style="..."><time datetime="2026-02-20">Ultimo aggiornamento: 20 febbraio 2026</time></p>` visibile sotto il breadcrumb — segnale freschezza per crawler AI.
**Effort:** 15min | **Eseguibile da codice:** ✅ Sì

---

### 🟡 Bassa Priorità / Long-term

#### Case Study con Metriche Reali
**File:** `portfolio/case-study/aether-digital.html`, `arconti31.html`, `mimmo-fratelli.html` (i 3 più solidi)
**Soluzione:** Aggiungere sezione "Risultati" con KPI prima/dopo:
- Tempo di caricamento (LCP prima/dopo)
- Posizionamento keyword target
- Incremento traffico organico (se disponibile da clienti)
- Conversioni o lead generati
Aumenta E-E-A-T "Experience" e differenzia dai competitor
**Effort:** 4h | **Eseguibile da codice:** ✅ Sì (i dati reali devono essere forniti)

---

#### Blog Long-tail Geolocalizzato
**File:** `blog/auto-writer.js` — aggiungere topic alla queue
**Nuovi topic da aggiungere:**
- "web agency Rho costi e prezzi 2026"
- "come scegliere agenzia web Milano per PMI"
- "quanto costa e-commerce personalizzato Rho"
- "sito web professionale Arese Pero Bollate"
- "differenza tra web agency locale e grande studio"
**Effort:** 30min | **Eseguibile da codice:** ✅ Sì

---

#### SoM Query File
**File:** `docs/seo-strategy/SOM-QUERY-LIST.md` (nuovo)
**Descrizione:** Lista di 20-30 query da copiare/incollare ogni mese su ChatGPT, Perplexity, Claude per monitorare lo Share of Model. Include template di risposta per documentare i risultati.
**Effort:** 30min | **Eseguibile da codice:** ✅ Sì (creazione documento)

---

#### Pillar Content 3.000+ Parole
**File:** `blog/` — 2 nuovi articoli
**Articoli target:**
1. "Guida completa allo sviluppo siti web 2026: dal brief al lancio" (3.500+ parole)
2. "Come scegliere la migliore agenzia web a Milano nel 2026" (3.000+ parole)
**Struttura:** Answer Capsule dopo ogni H2, H2/H3 interrogativi, dati proprietari, grafici, link interni verso pagine servizio
**Effort:** 8h ciascuno | **Eseguibile da codice:** ⚠️ Il testo va scritto manualmente (per E-E-A-T) — la struttura e l'inserimento sì



---

## TODO FUTURA — MANUALE / OPERATIVO

Azioni che richiedono intervento umano, accesso a piattaforme esterne o decisioni editoriali. Non eseguibili da codice.

---

### 🔴 Alta Priorità (entro 2 settimane)

#### ✅ Talkwalker Alerts — COMPLETATO
**URL:** https://www.talkwalker.com/alerts
**Query attive (4):** `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com`
**Frequenza:** Giornaliera

#### ✅ Google Alerts — COMPLETATO
**URL:** https://www.google.com/alerts
**Query attive (4):** `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com`

#### Campagna Recensioni GBP
**Piattaforma:** Google Business Profile
**Obiettivo:** Da 5 a 20+ recensioni 5★ (soglia minima competitiva per il locale)
**Piano operativo:**
1. Creare QR code che punta direttamente alla pagina recensione GBP (usa `https://g.page/r/[PLACE_ID]/review`)
2. Stampare QR su cartoncino da consegnare a fine progetto
3. Template email post-consegna: "Ciao [Nome], il tuo progetto è online! Se sei soddisfatto, una recensione su Google ci aiuterebbe molto: [link]"
4. Rispondere a TUTTE le recensioni esistenti (anche le 5 già presenti) con: nome cliente, keyword servizio, location ("grazie per aver scelto Web Novis per il tuo sito web a Rho/Milano...")
**Effort:** 2h setup + 5 min per recensione futura

#### Verifica LinkedIn Company Page
**URL:** https://www.linkedin.com/company/webnovis
**Stato attuale:** URL presente nel `sameAs` schema ma stato operativo non confermato
**Azione:** Verificare che la pagina sia attiva e pubblicamente visibile. Se inattiva: riattivare o ricreare. Piano editoriale minimo: 1 post/mese con progetto completato, insight di settore o aggiornamento servizi
**Perché:** LinkedIn è citato nel `sameAs` — incoerenza tra schema e realtà penalizza l'E-E-A-T
**Effort:** 30 minuti verifica + piano editoriale

#### Bing Webmaster Tools — Grounding Queries
**URL:** https://www.bing.com/webmasters
**Stato:** Dominio probabilmente già verificato (IndexNow funziona con Bing)
**Azione:**
1. Accedere al pannello → Search Performance → Queries
2. Identificare le query generate internamente da Copilot/ChatGPT quando "cercano" il sito
3. Confrontare il vocabolario delle query AI con i termini nelle pagine
4. Colmare i gap semantici trovati aggiornando le Answer Capsule e i meta tag
**Effort:** 1h setup + 30 min analisi mensile

---

### 🟠 Media Priorità (entro 1 mese)

#### Bing Places for Business
**URL:** https://www.bingplaces.com
**Azione:** Creare/rivendicare il profilo — alimenta Microsoft Copilot AI e Bing Maps. Sincronizzabile con il GBP esistente (import automatico)
**Effort:** 30 minuti

#### GBP Post Mensili
**Piattaforma:** Google Business Profile → Posts
**Piano:** 2 post/mese minimi
- Post tipo 1: Foto di un progetto completato con descrizione keyword-rich ("Nuovo sito web realizzato per [settore] a Rho/Milano...")
- Post tipo 2: Offerta stagionale o aggiornamento servizi
**Perché:** I post GBP influenzano la relevance nelle AI Overviews geolocalizzate
**Effort:** 30 min/post

#### Link Building Editoriale HARO/SOS
**Piattaforme:** HARO (helpareporter.com) ✅ Iscritto, SOS (sourceofsources.com) ✅ Iscritto
**Azione:** Rispondere a 3-5 query/settimana come esperto di web development, SEO, digital marketing per PMI. Prioritizzare media con DA 40+. Target: 2-3 link editoriali in 90 giorni
**Template risposta:** Citare "Massimiliano, Co-Founder di Web Novis (webnovis.com), agenzia web specializzata in codice custom..."
**Effort:** 30 min/settimana

#### Digital PR Locale Lombarda
**Target:** MilanoToday.it, LegnanoNews.it, RhoNews (se esiste), portali Camera di Commercio Milano
**Angolo:** "Agenzia web di Rho che aiuta le PMI lombarde a competere online nell'era dell'intelligenza artificiale"
**Azione:** Email a redazione con comunicato stampa + offerta di intervista/contributo tecnico
**Effort:** 3-4h (stesura + invio)

#### Core Web Vitals Test Esterno
**Tool:** Google PageSpeed Insights (https://pagespeed.web.dev)
**Pagine da testare (in ordine):**
1. https://www.webnovis.com/
2. https://www.webnovis.com/servizi/sviluppo-web.html
3. https://www.webnovis.com/contatti.html
4. https://www.webnovis.com/blog/index.html
5. https://www.webnovis.com/portfolio/case-study/aether-digital.html
**Azione:** Documentare LCP, INP, CLS, FCP per mobile e desktop. Ripetere ogni mese. Inviare i dati per aggiornare la strategia di performance
**Effort:** 1h

---

### 🟡 Ricorrente (Settimanale / Mensile / Trimestrale)

| Frequenza | Task | Dettaglio |
|---|---|---|
| **Settimanale** | Ricerca manuale brand | Query Google: `"WebNovis" -site:webnovis.com` — documentare menzioni non tracciate da Talkwalker/Alerts |
| **Mensile** | SoM monitoring | Query su ChatGPT, Perplexity, Claude: "migliore agenzia web Rho", "web agency custom code Milano", "chi è Web Novis", "agenzia web senza WordPress". Documentare se il brand appare, posizione nella risposta, sentiment |
| **Mensile** | `node generate-sitemap.js` | Rigenerare sitemap dopo aggiornamenti HTML per `lastmod` accurati. Considerare di aggiungere al workflow GitHub Actions |
| **Mensile** | GBP Insights | Controllare impressioni, clic, richieste direzioni, chiamate nel pannello GBP. Confrontare mese su mese |
| **Mensile** | Bing Webmaster Grounding | Analisi gap query AI → vocabolario pagine. Aggiornare Answer Capsule se necessario |
| **Trimestrale** | Backlink audit | Ahrefs/Semrush (quando disponibile): profilo backlink, anchor text distribution, opportunità nuove directory |
| **Trimestrale** | HARO response review | Verificare quante risposte HARO/SOS hanno generato copertura, link o menzioni |

---

## PROFILI ESTERNI — STATO DETTAGLIATO

### ✅ Verificati e Pienamente Operativi

| Profilo | URL / ID | In `sameAs` | Note |
|---|---|---|---|
| Wikidata | Q138340285 | ✅ | Aggiunto a index.html, ai.txt, llms.txt, webnovis-ai-data.json |
| Crunchbase | /organization/web-novis | ✅ | Aggiunto a tutti i file rilevanti |
| **Apple Business Connect** | www.webnovis.com | ✅ | **COMPLETAMENTE VERIFICATO il 20/02/2026** — Nessuna azione ulteriore richiesta |
| Google Business Profile | Via S. Giorgio 2, Rho MI | ✅ | 5★ (5 recensioni) — da incrementare a 20+ |
| Clutch | /profile/web-novis | ✅ | In sameAs — attività profilo da verificare |
| Trustpilot | /review/webnovis.com | ✅ | In sameAs — recensioni da incrementare |
| DesignRush | /agency/profile/web-novis | ✅ | In sameAs + widget reviews attivo via script defer |
| Hotfrog Italia | /company/... | ✅ | In sameAs |
| Cylex Italia | /rho/web-novis | ✅ | In sameAs |
| Firmania | /rho/web-novis | ✅ | In sameAs |
| Trova Aperto | /rho/web-novis | ✅ | In sameAs |
| Cronoshare IT | /croner-... | ✅ | In sameAs |
| Instagram | @web.novis | ✅ | Social primario attivo |
| Facebook | /share/1C7hNnkqEU/ | ✅ | In sameAs |
| HARO | helpareporter.com | N/A | ✅ Iscritto — monitorare query settimanali |
| Source of Sources | sourceofsources.com | N/A | ✅ Iscritto |
| Help a B2B Writer | helpab2bwriter.com | N/A | ✅ Iscritto |

### ⚠️ Presenti ma Stato da Confermare

| Profilo | URL | Stato | Azione |
|---|---|---|---|
| **LinkedIn Company** | /company/webnovis | URL in `sameAs` | **Verificare che la pagina sia attiva e visibile.** Avviare piano editoriale minimo (1 post/mese). Se inattiva: riattivare |
| Yelp Italia | N/A | Non in sameAs | Valutare iscrizione — directory locale con buon peso locale |
| ProntoPro | N/A | Non in sameAs | Valutare iscrizione — genera traffico qualificato per preventivi |
| GoodFirms | N/A | Non in sameAs | Directory B2B internazionale — buon DA |

### ☐ Da Creare / Non ancora Configurati

| Piattaforma | Priorità | Note |
|---|---|---|
| Bing Places for Business | 🟠 Media | Sincronizzabile con GBP — alimenta Copilot AI |
| Talkwalker Alerts | ✅ Fatto | 4 query: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com` |
| Google Alerts | ✅ Fatto | 4 query: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com` |

---

## CLOUDFLARE — STATO E ATTIVAZIONE

**Stato:** ✅ Tutte le impostazioni configurate nel pannello Cloudflare per `www.webnovis.com`.
Entreranno in vigore **automaticamente** quando i DNS puntefanno a Cloudflare (go-live dominio).
**Nessuna ulteriore configurazione necessaria** — tutto è pronto.

### Configurazioni Attive (non ancora live)

| Categoria | Impostazione | Impatto Atteso |
|---|---|---|
| **Speed** | Early Hints HTTP 103 | LCP -100/200ms — server invia risorse prima che il browser elabori HTML |
| **Speed** | Brotli Compression | -20/30% rispetto a Gzip su testo/HTML/CSS/JS |
| **Speed** | Auto Minify JS/CSS/HTML | Size ridotto aggiuntivo |
| **Network** | HTTP/3 (QUIC) | Mobile connection setup più rapido |
| **Network** | 0-RTT Connection Resumption | Returning visitors più veloci |
| **SSL/TLS** | Full Strict mode | HTTPS enforcement con certificato valido |
| **SSL/TLS** | Always Use HTTPS | 301 redirect HTTP → HTTPS |
| **SSL/TLS** | Automatic HTTPS Rewrites | Correzione mixed content automatica |
| **SSL/TLS** | HSTS (max-age=31536000, includeSubDomains, preload) | Trust signal HTTPS massimo |
| **Cache** | Asset statici: Edge TTL 30d, Browser TTL 365d | CDN cache globale per /css/ /js/ /Img/ /fonts/ |
| **Cache** | HTML: Edge TTL 4h, Browser TTL 10min | HTML fresco con CDN acceleration |
| **Cache** | Bypass cache per /api/* | API sempre fresche, nessuna risposta stale |
| **Security** | Bot Fight Mode | Protezione da scraper senza bloccare bot SEO/AI |
| **Rules** | Security Headers (Transform Rules) | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |

### Procedura Switch DNS (quando pronto)

1. Pannello Aruba → Dominio → DNS → Cambiare nameserver da Aruba a Cloudflare (2 NS forniti da Cloudflare)
2. Propagazione: 24-48h
3. Dopo propagazione: verificare con `curl -I https://www.webnovis.com` che gli header Cloudflare siano presenti
4. Controllare che tutti i toggle siano attivi nel pannello Speed + SSL + Security

---

## ELEMENTI RIMOSSI / DEPRECATI

| Elemento | Rimosso Da | Data | Motivo |
|---|---|---|---|
| `<changefreq>` in sitemap.xml | `sitemap.xml` | 20/02/2026 | Google ignora ufficialmente questo attributo dal 2023. Rimosso dal generatore automatico |
| `<priority>` in sitemap.xml | `sitemap.xml` | 20/02/2026 | Ignorato da Google. Rimosso dal generatore automatico |
| sitemap.xml manuale | Root | 20/02/2026 | Sostituito da `generate-sitemap.js` che genera `lastmod` reali da `fs.statSync()` |
| H2/H3 dichiarativi sulle pagine servizio | 6 pagine servizio | 20/02/2026 | Riformulati come domande esplicite per PAA e voice search |
| `// Brotli/Gzip comment` in server.js | `server.js` | Pre-esistente | Il middleware `compression` npm usa Gzip/Deflate, non Brotli nativo. Brotli è gestito da Cloudflare |

---

## NOTE ARCHITETTURALI

### Stack Completo Attuale
```
Frontend:    Static HTML/CSS/JS su GitHub Pages
             Build: node build.js (Terser + LightningCSS + html-minifier-terser)
             54 HTML files totali, 7 JS bundle, 8 CSS bundle

Backend:     Express.js su Render (API chatbot, redirect, serving)
             Node.js 20, dipendenze: cors, dotenv, express, express-rate-limit, node-fetch

CDN/Proxy:   Cloudflare (configurato, non live — waiting DNS go-live)

Dominio:     Aruba.it — webnovis.com
             Nameserver: attualmente Aruba, da migrare a Cloudflare

Schema:      6 tipi @id interconnessi (Organization, WebSite, LocalBusiness, WebPage, Person, multiple Service)
             Knowledge Graph completo con link bidirezionale Org ↔ Person

Sitemap:     52 URL, generata dinamicamente da generate-sitemap.js
             Image sitemap per 12 portfolio images
             Aggiornata: 20/02/2026

Blog:        20 articoli live, 170 topic in queue
             Auto-writer: Gemini/Groq via GitHub Actions (daily-blog.yml)
             IndexNow su ogni nuovo articolo
```

### Regola d'oro per le nuove implementazioni
- **Ogni nuovo HTML** deve avere: canonical, hreflang (it + x-default), BreadcrumbList schema, WebPage schema con dateModified, meta ai-content, Speculation Rules API, link a main.min.js
- **Ogni nuova pagina servizio** deve avere: Service schema con @id + hasOfferCatalog + areaServed, FAQPage schema, Answer Capsule RAG dopo H1, H2/H3 interrogativi, ServiceArea GeoCircle
- **Ogni nuovo case study** deve avere: Article schema, ImageObject schema per immagine principale, figcaption sull'immagine hero
- **Dopo ogni modifica HTML significativa**: eseguire `node generate-sitemap.js` + `node build.js`

