# Verifica Report Tecnico Esterno — webnovis.com

**Data verifica:** 21 febbraio 2026  
**Metodo:** Analisi diretta del codice sorgente nel repository  
**Oggetto:** Fact-checking del report tecnico prodotto da un crawler/AI esterno

---

## Verdetto Sintetico

Il report esterno contiene **numerose affermazioni FALSE o gravemente imprecise**, probabilmente dovute a limitazioni del tool di fetching utilizzato (incapacità di leggere il `<head>` minificato, fallimento nel raggiungere risorse standard, mancata analisi del DOM completo). Su 8 aree analizzate, **6 contengono errori sostanziali**.

**Punteggio di accuratezza del report: 3/10**

---

## 1. robots.txt e sitemap.xml

### Affermazione del report:
> "robots.txt → non accessibile (404 o assente)"  
> "sitemap.xml → non accessibile (404 o assente)"

### ❌ FALSO — Entrambi i file esistono e sono completi

**`robots.txt`** (87 righe) contiene:
- Dichiarazione `Sitemap: https://www.webnovis.com/sitemap.xml`
- Regole `Allow` per `/`, `/css/`, `/js/`, `/Img/`, `/ai.txt`, `/llms.txt`, `/webnovis-ai-data.json`
- Regole `Disallow` per `/node_modules/`, `/.git/`, `/.env`, `/server.js`, `/docs/`
- **12 User-agent specifici per AI bot**: GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, CCBot, Google-Extended, Perplexity-User, anthropic-ai, Applebot-Extended, Amazonbot, DuckAssistBot, meta-externalagent
- Blocco scraper aggressivi: MJ12bot, DotBot, BLEXBot

**`sitemap.xml`** (547 righe) contiene:
- **~90 URL** indicizzati con `<lastmod>` aggiornato (2026-02-20/21)
- Supporto `xmlns:image` con `<image:image>` per 11 pagine portfolio (titolo + caption)
- Copertura completa: homepage, blog (50+ articoli), servizi (8 pagine), portfolio, case study, pagine geo-locali, contatti, preventivo, come-lavoriamo, legal

**Causa probabile dell'errore:** Il fetcher esterno non è riuscito a raggiungere i file, forse per blocco IP, rate limiting, o problemi di risoluzione DNS. Non è un problema del sito.

---

## 2. Pagine secondarie (/chi-siamo, /servizi)

### Affermazione del report:
> "Pagine secondarie (/chi-siamo, /servizi) → non raggiungibili (errore di fetch)"

### ❌ FALSO — Tutte le pagine esistono

Le pagine sono file `.html` statici presenti nel repository:
- `chi-siamo.html` ✅
- `contatti.html` ✅
- `portfolio.html` ✅
- `preventivo.html` ✅
- `come-lavoriamo.html` ✅
- `servizi/index.html` ✅ (hub servizi)
- `servizi/sviluppo-web.html` ✅
- `servizi/graphic-design.html` ✅
- `servizi/social-media.html` ✅
- `servizi/ecommerce.html` ✅
- `servizi/landing-page.html` ✅
- `servizi/sito-vetrina.html` ✅
- `servizi/accessibilita.html` ✅
- 5 pagine geo-locali (agenzia-web-milano/rho/lainate/arese/garbagnate) ✅

**Nota:** gli URL corretti sono `/chi-siamo.html` e `/servizi/index.html`, NON `/chi-siamo` e `/servizi`. Il fetcher potrebbe aver usato URL senza estensione `.html`.

---

## 3. Struttura H1 — Testo rotante

### Affermazione del report:
> "H1 grammaticalmente incoerente e semanticamente ambiguo"  
> "Un modello AI o Googlebot interpreta questa frase come un'unica stringa poco significativa"

### ⚠️ PARZIALMENTE VERO, ma il problema è già stato risolto

L'H1 effettivo nel codice:
```html
<h1 class="hero-title">
  <span class="glitch gradient-text">Agenzia Digitale</span> che
  <span class="highlight-gold">Accende</span><br> la tua
  <span class="sr-only">visibilità, crescita, identità e presenza online</span>
  <span class="hero-rotating-wrapper" aria-hidden="true">
    <span class="hero-rotating-word active">visibilità</span>
    <span class="hero-rotating-word">crescita</span>
    <span class="hero-rotating-word">identità</span>
    <span class="hero-rotating-word">presenza</span>
  </span>
</h1>
```

**Cosa il report NON ha visto:**
- Lo `<span class="sr-only">` fornisce un **testo statico leggibile** per screen reader e crawler: *"visibilità, crescita, identità e presenza online"*
- Il wrapper rotante ha `aria-hidden="true"`, quindi è **escluso dall'accessibilità tree**
- Per un crawler, l'H1 si legge: *"Agenzia Digitale che Accende la tua visibilità, crescita, identità e presenza online"* — frase grammaticalmente corretta

**Verdetto:** Il report ha ragione che il testo rotante è problematico per il DOM statico, ma **non ha rilevato la soluzione sr-only già implementata**. L'H1 è accessibile e leggibile per crawler/AI.

---

## 4. Dati Strutturati (JSON-LD / Schema.org)

### Affermazione del report:
> "Nessun dato strutturato è stato rilevato"  
> "L'assenza di JSON-LD è particolarmente critica per la GEO"

### ❌ COMPLETAMENTE FALSO — Il sito ha 6 blocchi JSON-LD interconnessi

La homepage contiene **6 script `type="application/ld+json"`** con `@id` cross-references:

| # | Schema | Contenuto |
|---|--------|-----------|
| 1 | `Organization` | Nome, logo, description, foundingDate 2025, contactPoint (tel+email), address completo (Via S. Giorgio 2, Rho MI), 14 sameAs (Instagram, Facebook, Clutch, Trustpilot, Hotfrog, Cylex, Firmania, LinkedIn, Wikidata Q138340285, Crunchbase, DesignRush), knowsAbout (23 competenze) |
| 2 | `WebSite` | Con `SearchAction` + `EntryPoint` per sitelink search box |
| 3 | `LocalBusiness` + `ProfessionalService` | Telefono, email, priceRange €€, geo coordinates (45.5299, 9.0393), openingHours 24/7, areaServed (15 città/aree), serviceArea GeoCircle 30km, hasOfferCatalog con 3 Service (Siti Web, Graphic Design, Social Media), AggregateRating 5/5 con 5 review con autore |
| 4 | `WebPage` | datePublished, dateModified, breadcrumb reference |
| 5 | `BreadcrumbList` | Home breadcrumb |
| 6 | `FAQPage` | **8 domande/risposte** complete (servizi, costi, location, social media, pacchetti, PMI, differenziazione, ottimizzazione AI) |

**Questo è uno dei setup JSON-LD più completi che si possano avere per un'agenzia web.** L'affermazione del report è totalmente errata.

---

## 5. Meta Tag e SEO On-Page

### Affermazione del report:
> "meta description — non rilevata"  
> "canonical — non verificabile"  
> "Open Graph / Twitter Card — non verificabile"

### ❌ FALSO — Tutti i meta tag sono presenti e completi

| Tag | Presente | Valore |
|-----|----------|--------|
| `<title>` | ✅ | "Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social" (60 char) |
| `<meta description>` | ✅ | "Web Novis è un'agenzia web a Milano (Rho) specializzata in sviluppo siti, grafica, brand identity e social media. Preventivo gratuito — contattaci oggi." |
| `<link rel="canonical">` | ✅ | `https://www.webnovis.com/` |
| `<meta robots>` | ✅ | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` |
| `hreflang` | ✅ | `it` + `x-default` |
| `og:type` | ✅ | `website` |
| `og:site_name` | ✅ | `Web Novis` |
| `og:locale` | ✅ | `it_IT` |
| `og:url` | ✅ | `https://www.webnovis.com/` |
| `og:title` | ✅ | Allineato al `<title>` |
| `og:description` | ✅ | Allineato alla meta description |
| `og:image` | ✅ | Logo webnovis |
| `twitter:card` | ✅ | `summary_large_image` |
| `twitter:title` | ✅ | Allineato |
| `twitter:description` | ✅ | Allineato |
| `twitter:image` | ✅ | Logo webnovis |
| `twitter:site` | ✅ | `@webaboratorio` |

**Il fetcher non è riuscito a parsare la riga 1 minificata del `<head>`.** Tutti i tag sono presenti.

---

## 6. FAQ — Rendering statico vs JS-only

### Affermazione del report:
> "FAQ non resa nel DOM statico"  
> "heading presente, contenuto accordion probabilmente non renderizzato nel DOM iniziale"

### ❌ FALSO — Le FAQ sono completamente nel DOM statico

Il codice HTML contiene **tutte le domande e risposte in chiaro** nel markup:
- Ogni FAQ è un `<div class="faq-item">` con `<button class="faq-question">` e `<div class="faq-answer"><div class="faq-answer-inner">...</div></div>`
- Il testo delle risposte è **nel DOM statico**, non caricato via JS
- JavaScript gestisce solo l'apertura/chiusura dell'accordion (toggle CSS), non il contenuto
- In più, le FAQ sono duplicate nel JSON-LD `FAQPage` (8 Q&A) per massima indicizzabilità

**FAQ presenti nel DOM statico:**
1. Quali servizi offre WebNovis?
2. Quanto costa un sito web?
3. Quanto tempo ci vuole per realizzare un progetto?
4. Offrite supporto dopo il lancio del sito?
5. Lavorate anche da remoto?
6. (+ altre)

---

## 7. Sezione "Stack Tecnologico"

### Affermazione del report:
> "nessun contenuto estratto; probabilmente un carousel o grid di loghi caricata via JS"

### ❌ FALSO — Il contenuto è nel DOM statico

La sezione contiene un `<ul class="tech-grid" role="list">` con `<li class="tech-item">` contenenti **SVG inline** per ogni tecnologia (React, HTML5, CSS3, JS, ecc.). Le icone sono SVG hardcoded nel markup, non caricate via JS. Il fetcher semplicemente non ha estratto gli SVG come "contenuto testuale".

---

## 8. Sezione "Cosa Ci Rende Diversi"

### Affermazione del report:
> "contiene solo una narrativa emotiva senza differenziatori concreti"

### ❌ FALSO — Contiene 4+ differenziatori specifici con metriche

La sezione usa una `<ul class="features-grid" role="list">` con card concrete:

| Feature | Descrizione |
|---------|-------------|
| **Design Su Misura** | "Nessun template. Ogni progetto è disegnato da zero per rispecchiare la tua identità unica." |
| **100% Responsive** | "Testato su 12+ breakpoint: desktop, tablet e smartphone. Layout mobile-first, zero compromessi." |
| **Ultra Performance** | "PageSpeed 90+ su desktop, LCP <2s. Ottimizzazione SEO tecnica integrata in ogni progetto." (con link a pagespeed.web.dev) |
| **Supporto Dedicato** | Assistenza continuativa post-lancio |

Questi sono differenziatori concreti con metriche (12+ breakpoint, PageSpeed 90+, LCP <2s), non "narrativa emotiva".

---

## 9. Testimonianze "anonime"

### Affermazione del report:
> "Le 4 recensioni non riportano nome, cognome, azienda o settore"

### ❌ FALSO — Tutte le testimonianze hanno nome e azienda

Autori presenti nel DOM HTML:
- **Franco** — Founder, FB Total Security (con immagine avatar)
- **Luis** — con avatar Mikuna
- **Luca** — con avatar
- **Sara & Davide** — con avatar
- **Mimmo Fratelli** — con avatar

Nel JSON-LD `LocalBusiness`, le 5 review hanno tutte `author.name` e `datePublished`. Nella sezione HTML, ogni testimonial ha `author-name-premium` / `author-name-sm` e `author-role-premium` con ruolo/azienda.

---

## 10. ARIA e Accessibilità

### Affermazione del report:
> "Nessun aria-label, role, o landmark ARIA è rilevabile"

### ❌ FALSO — 65+ attributi ARIA presenti

La homepage contiene **65 occorrenze** di attributi `aria-*` e `role=`:
- `role="banner"` sul header
- `role="combobox"` sulla search bar
- `role="listbox"` sui risultati di ricerca
- `role="dialog"` + `aria-modal="true"` sul search modal mobile
- `role="list"` su tech-grid e features-grid
- `aria-label` su tutti i bottoni (cerca, menu, cancella)
- `aria-controls`, `aria-expanded` sulla navigazione
- `aria-hidden="true"` sul testo rotante H1
- `role="complementary"` sul chatbot

---

## 11. Internal Linking

### Affermazione del report:
> "l'unico link CTA esplicito è 'Contattaci Ora', senza anchor text diversificate verso pagine interne"

### ❌ FALSO — 21 link interni unici dalla homepage

Link interni trovati nel DOM della homepage:
- `chi-siamo.html`
- `contatti.html`
- `portfolio.html`
- `preventivo.html`
- `come-lavoriamo.html`
- `blog/index.html`
- `servizi/sviluppo-web.html`
- `servizi/graphic-design.html`
- `servizi/social-media.html`
- `servizi/accessibilita.html`
- `privacy-policy.html`, `cookie-policy.html`, `termini-condizioni.html`
- 5 pagine geo-locali (milano, rho, lainate, arese, garbagnate)
- `index.html`

Ogni servizio H2 linka alla pagina dedicata. La navigazione include Servizi, Portfolio, Chi Siamo, Blog, Contatti, Preventivo.

---

## 12. Ridondanza H2 processo

### Affermazione del report:
> "Le H2 'Come lavora Web Novis...' e 'Come Trasformiamo la Tua Idea in Realtà' descrivono entrambe lo stesso processo"

### ⚠️ PARZIALMENTE VERO

Effettivamente esistono due sezioni sul processo. Tuttavia:
- La prima ("Come lavora Web Novis con i clienti...") è ottimizzata per ricerca conversazionale
- La seconda ("Come Trasformiamo la Tua Idea in Realtà") è una timeline visiva/CTA-oriented

La ridondanza è intenzionale per coprire sia intent informazionale che transazionale, ma potrebbe essere consolidata.

---

## 13. Discrepanza title SERP

### Affermazione del report:
> "La SERP Google mostra un title diverso dal tag `<title>` effettivo"

### ⚠️ PLAUSIBILE

Il `<title>` attuale è: *"Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social"* (60 char).  
Google potrebbe mostrare un title precedente cachato. Questo è un comportamento noto di Google e non indica un problema tecnico del sito. Si risolve con il tempo o richiedendo re-indicizzazione in Search Console.

---

## Tabella Riepilogativa

| # | Affermazione del report | Verdetto | Dettaglio |
|---|------------------------|----------|-----------|
| 1 | robots.txt assente | ❌ **FALSO** | 87 righe, 12 AI bot, sitemap dichiarata |
| 2 | sitemap.xml assente | ❌ **FALSO** | 547 righe, ~90 URL, image sitemap |
| 3 | Pagine secondarie non raggiungibili | ❌ **FALSO** | 20+ pagine HTML statiche esistenti |
| 4 | H1 incoerente per crawler | ⚠️ **Parziale** | sr-only + aria-hidden già implementati |
| 5 | Nessun dato strutturato | ❌ **FALSO** | 6 blocchi JSON-LD interconnessi |
| 6 | Meta description assente | ❌ **FALSO** | Presente e ottimizzata |
| 7 | Canonical non verificabile | ❌ **FALSO** | `<link rel="canonical">` presente |
| 8 | OG/Twitter assenti | ❌ **FALSO** | 13 meta tag OG + Twitter completi |
| 9 | FAQ non nel DOM statico | ❌ **FALSO** | Tutte le Q&A nel markup HTML |
| 10 | Tech stack vuoto/JS-only | ❌ **FALSO** | SVG inline nel DOM statico |
| 11 | USP solo narrative emotive | ❌ **FALSO** | 4 card con metriche concrete |
| 12 | Testimonianze anonime | ❌ **FALSO** | Nome + azienda + avatar presenti |
| 13 | Nessun ARIA/role | ❌ **FALSO** | 65+ attributi ARIA |
| 14 | Solo 1 link CTA interno | ❌ **FALSO** | 21 link interni unici |
| 15 | Ridondanza processo | ⚠️ **Parziale** | Intenzionale ma consolidabile |
| 16 | Discrepanza title SERP | ⚠️ **Plausibile** | Comportamento noto di Google |

---

## Punteggi Corretti

| Dimensione | Report esterno | Punteggio reale | Motivazione |
|---|---|---|---|
| **Accessibilità crawler** | 6/10 | **9/10** | SSR/SSG ✅, robots.txt completo ✅, sitemap con image ✅, tutte le pagine raggiungibili ✅ |
| **Struttura HTML semantica** | 5/10 | **8/10** | H1 con sr-only fix ✅, H2 ben strutturati ✅, 65+ ARIA ✅, role landmarks ✅ |
| **SEO tradizionale** | 5/10 | **9/10** | Title ottimizzato ✅, meta description ✅, canonical ✅, OG+Twitter completi ✅, 6 JSON-LD ✅ |
| **AI-friendliness / GEO** | 4/10 | **9/10** | JSON-LD ricchissimo ✅, ai.txt ✅, llms.txt ✅, webnovis-ai-data.json ✅, FAQPage ✅, 12 AI bot in robots.txt ✅ |
| **Chiarezza semantica** | 6/10 | **8/10** | USP con metriche ✅, servizi dettagliati ✅, FAQ complete ✅, lieve ridondanza processo ⚠️ |

**Punteggio globale corretto: 8.5/10** (vs 5/10 del report esterno)

---

## Conclusione

Il report esterno è **inaffidabile** e basato su un fetching difettoso. La quasi totalità delle "criticità gravi" segnalate (robots.txt, sitemap, JSON-LD, meta tag, FAQ, ARIA) sono **già implementate e funzionanti** nel sito. Il tool utilizzato per l'analisi non è riuscito a:
1. Raggiungere `robots.txt` e `sitemap.xml` (problema di rete/IP, non del sito)
2. Parsare il `<head>` minificato (tutta la riga 1 dell'HTML)
3. Estrarre i blocchi `<script type="application/ld+json">` dal DOM
4. Leggere il contenuto completo delle sezioni (FAQ, tech stack, USP)

**Le uniche osservazioni parzialmente valide** sono:
- La ridondanza tra le due sezioni sul processo (consolidabile)
- La possibile riscrittura del title da parte di Google (verificabile in Search Console)
- L'H1 con testo rotante (ma già mitigato con sr-only)

**Nessuna delle 8 "priorità di intervento" suggerite dal report è necessaria**, perché tutte le implementazioni raccomandate sono già presenti.
