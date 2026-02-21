# 🔍 AUDIT SEO COMPLETO & PIANO DI OTTIMIZZAZIONE STRATEGICA — WebNovis

**Data**: 12 Febbraio 2026  
**Sito**: https://www.webnovis.com (GitHub Pages + CNAME)  
**Pagine analizzate**: `index.html`, `portfolio.html`, `privacy-policy.html`, `cookie-policy.html`  
**File di supporto**: `robots.txt`, `sitemap.xml`, `ai.txt`, `manifest.json`

---

## SOMMARIO ESECUTIVO

| Area | Score /10 |
|------|:---------:|
| Crawlability & Indexing | **7** |
| Core Web Vitals & Performance | **5** |
| Mobile & Accessibilità | **7** |
| Sicurezza & Protocollo | **6** |
| On-Page SEO Homepage | **7** |
| On-Page SEO Pagine Interne | **5** |
| Content Depth & E-E-A-T | **3** |
| Schema Markup | **8** |
| Off-Page SEO & Authority | **3** |
| Local SEO | **2** |
| AI Search Readiness (SGE/AIO) | **7** |
| **SEO SCORE COMPLESSIVO** | **54/100** |
| **Target post-ottimizzazione (6 mesi)** | **78-85/100** |

Il sito ha un'**ottima base tecnica** (Schema.org ricco, meta tag corretti, AI-readiness avanzata), ma soffre di **mancanza di profondità contenutistica** (solo 4 URL indicizzabili), **assenza di E-E-A-T verificabile**, **nessun blog**, **nessuna pagina servizio dedicata**, e **problemi di performance JS/CSS**.

---

## 1. PUNTI DI FORZA (PRO)

### 1.1 Meta Tag & Open Graph
- `<title>` descrittivo con brand + keyword (65 char): "WebNovis — Agenzia Digitale | Web, App, Grafica & Social Media"
- Open Graph completo (og:title, og:description, og:image, og:url, og:type) ✅
- Twitter Card configurata (`summary_large_image`) ✅
- `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` — ottimale
- `<link rel="canonical">` presente su tutte e 4 le pagine ✅
- `<html lang="it">` corretto su tutte le pagine ✅
- `hreflang="it"` presente su homepage e portfolio ✅

### 1.2 Schema.org / Dati Strutturati (Eccellente)
- **Organization** con logo, contactPoint, sameAs ✅
- **WebSite** con name, url, inLanguage ✅
- **ProfessionalService** con hasOfferCatalog (3 servizi), knowsAbout (12 competenze), serviceType (12 tipi) ✅✅
- **FAQPage** con 5 domande → abilita i rich snippets FAQ su Google ✅
- **LocalBusiness** + **AggregateRating** (5.0/5, 5 recensioni) + 5 **Review** individuali → abilita le stelle nei risultati ✅
- **CollectionPage** + **ItemList** su portfolio.html ✅

### 1.3 Contenuto AI-Ready (Avanzato)
- `ai.txt` ben strutturato con informazioni complete (126 righe) ✅
- `webnovis-ai-data.json` per crawlers AI ✅
- Meta tag `ai-content` per discovery ✅
- `robots.txt` permette esplicitamente GPTBot, CCBot, Google-Extended ✅
- Questo posiziona il sito **molto bene** per Google SGE/AI Overview e ChatGPT browsing

### 1.4 Struttura HTML & Accessibilità
- HTML5 semantico con `<main>`, `<section>`, `<nav>`, `<footer>`, `<header>` ✅
- Skip navigation link: `<a href="#main-content" class="sr-only">` ✅
- Form con `<label>` (sr-only) + `autocomplete` attributes ✅
- `aria-label`, `aria-expanded`, `aria-controls` su elementi interattivi ✅
- `aria-hidden="true"` su marquee duplicato e icone decorative ✅
- Noscript fallback per CSS asincrono ✅
- `<picture>` con source WebP + fallback PNG per logo e immagini locali ✅

### 1.5 Sitemap, Robots & Crawling
- `sitemap.xml` con image sitemap per homepage e portfolio ✅
- `robots.txt` ben configurato: bot malevoli bloccati, risorse critiche Allow, file tecnici Disallow ✅
- CNAME configurato per www.webnovis.com ✅
- `manifest.json` per PWA capabilities ✅

### 1.6 Form Contatti Funzionante
- Form contatti integrato con **Web3Forms** (action, access_key, honeypot botcheck) ✅
- Validazione JS con feedback visivo (success/error) ✅
- Hidden fields per subject e from_name ✅

### 1.7 Immagini Ottimizzate (parzialmente)
- Logo servito con `<picture>` WebP + PNG fallback ✅
- `loading="lazy"` su immagini below-fold ✅
- `width` e `height` espliciti sulle immagini principali ✅
- Hero background preload: `<link rel="preload" as="image" type="image/webp" href="Img/sfondo.webp">` ✅

---

## 2. CRITICITÀ & PROBLEMI (CONTRO)

### 2.1 🔴 CRITICI — Impatto diretto sul ranking

#### 2.1.1 Performance & Core Web Vitals

| Metrica | Stima attuale | Target Google | Stato |
|---------|:---:|:---:|:---:|
| **LCP** | ~2.5-3.5s | < 2.5s | 🟡/🔴 |
| **INP** | ~150-250ms | < 200ms | 🟡 |
| **CLS** | ~0.05-0.12 | < 0.1 | 🟡 |
| **FCP** | ~1.8-2.5s | < 1.8s | 🟡 |
| **TTFB** | ~200-500ms | < 800ms | ✅ |

**Problema A: `body.style.opacity = '0'` al caricamento** (`main.js` riga 242)
- Il body viene reso **invisibile** al load, poi visibile dopo 100ms via JS
- Causa flash bianco (FOUC), **peggiora LCP**, e se JS fallisce il body resta invisibile
- **Azione**: Rimuovere completamente. Se serve fade-in, usare CSS `animation` senza JS.

**Problema B: 7 file CSS + 5 file JS**
- `style.min.css` è render-blocking (unico critico — gli altri sono async via `media="print"` trick ✅)
- `text-effects.js` e `cursor.js` **NON sono minificati** ❌
- `main.js` contiene ~1395 righe con: particle system, Konami code, 6+ `console.log` decorativi, FPS monitor, sound effects commentati
- **Azione**: Minificare text-effects/cursor. Estrarre CSS critical-path inline nel `<head>`. Rimuovere codice morto. Merge CSS non critici.

**Problema C: 11+ immagini esterne da Unsplash**
- Latenza DNS + TLS aggiuntiva per ogni richiesta, dipendenza da servizio terzo
- **Azione**: Self-hostare in formato WebP.

**Problema D: Google Fonts — 3 famiglie pesanti (~100-150KB)**
- Inter (400,600,700) + Space Grotesk (600,700) + Syne (600,700,800)
- **Azione**: Ridurre a 2 famiglie. Self-hostare per eliminare cookie terze parti.

**Problema E: privacy/cookie pages caricano CSS non minificato**
- Caricano `revolution.css` invece di `revolution.min.css`
- **Azione**: Sostituire con `revolution.min.css?v=1.3`

#### 2.1.2 Contenuto Insufficiente (Problema PRINCIPALE)

**Problema: Solo 4 URL indicizzabili** — Google preferisce siti con struttura profonda.
- Nessuna pagina dedicata per servizio (Web, Design, Social)
- Nessun blog/articoli — zero contenuto informativo per long-tail keywords
- Nessuna pagina "Chi Siamo" / "About" — critico per E-E-A-T
- Nessun case study dettagliato con risultati misurabili
- Le 6 pagine in `file portfolio/` non sono in sitemap e hanno URL con spazi

**Azione (MASSIMA PRIORITÀ)**: Creare pagine dedicate:
- `/servizi/sviluppo-web.html` — target "sviluppo siti web", "creazione siti internet"
- `/servizi/graphic-design.html` — target "graphic design", "brand identity"
- `/servizi/social-media.html` — target "social media management"
- `/chi-siamo.html` — E-E-A-T (foto team, bio, credenziali, storia)
- `/blog/` — contenuti informativi (2-4 articoli/mese, 800+ parole ciascuno)
- Rinominare `file portfolio/` → `progetti/` (senza spazi!)

#### 2.1.3 Heading Hierarchy

**Problema: 13+ H2 sulla homepage** — diluisce il valore SEO.
- Le sezioni CTA ("Pronto a Trasformare...", "Sei Pronto a Dare un Boost..."), tech stack e "Ricominciare" dovrebbero essere **H3** non H2
- **Portfolio H1: "Digital Excellence"** ❌ — in inglese su sito italiano, nessuna keyword
  - Suggerimento: "Portfolio Web Design & Progetti Digitali"

**Nota positiva**: L'H1 della homepage **ora contiene "Agenzia Digitale"** grazie al `<span class="gradient-text">` — buono per SEO. Le parole rotanti (visibilità, crescita, identità, presenza) sono tutte nel DOM = crawlabili.

#### 2.1.4 Meta Description Homepage Troppo Lunga

**Attuale**: ~185 caratteri — verrà **troncata da Google** (max ~155-160).
- **Azione**: Accorciarla a ~155 char e aggiungere CTA: "Richiedi preventivo gratuito"

### 2.2 🟡 IMPORTANTI — Impatto significativo

#### 2.2.1 Alt Text delle Immagini — Parzialmente ottimizzati

Le immagini del social feed in index.html hanno alt text SEO-friendly (es. "Sito web moderno e responsivo creato da WebNovis agenzia digitale") ✅. Tuttavia le immagini Unsplash nella sezione social usano descrizioni generiche:
- `alt="Strategia social media marketing..."` — buono ma generico per un'immagine stock
- Le immagini portfolio in `portfolio.html` hanno alt text molto brevi: "Mikuna", "FB Total Security", etc.
- **Azione**: Espandere gli alt text del portfolio: `alt="Sito web e-commerce Mikuna Italia sviluppato da WebNovis con design responsive"`

#### 2.2.2 Link Interni Insufficienti

**Problema**: Solo 4 pagine = struttura troppo piatta.
- Footer ha link a: #web, #design, #social (ancore stessa pagina), portfolio.html, privacy-policy.html, cookie-policy.html
- Nessun breadcrumb su nessuna pagina
- Nessun cross-linking contestuale tra pagine
- Il link "Chi Siamo" nel footer punta a `#servizi` — **fuorviante**, non è una pagina about

**Azione**: Con le pagine servizio, implementare breadcrumb + BreadcrumbList Schema + cross-linking. Correggere "Chi Siamo" per puntare a una vera pagina about o cambiare il testo.

#### 2.2.3 Sezione "Ricominciare" — Classi esterne

La sezione usa classi `brxe-section`, `brxe-container`, `brxe-block`, `brxe-text-basic`, `brxe-text` che derivano dal tema Bricks Builder. Tuttavia:
- ✅ Il CTA ora punta correttamente a `#contatti` (non più a siti esterni)
- ✅ Nessuna immagine esterna da altri siti
- ⚠️ Le classi `brxe-*` non sono semantiche e creano dipendenza da stili di terze parti
- **Azione**: Rinominare le classi con naming convention propria per coerenza.

#### 2.2.4 Newsletter Form — Non funzionante

**Problema**: Il form newsletter (`#newsletterForm`) gestisce il submit solo via JS con feedback visivo "✓ Iscritto!" ma **non invia realmente i dati a nessun backend**. L'email inserita viene persa.
- **Azione**: Integrare con un servizio reale (Mailchimp, ConvertKit, Web3Forms) o rimuovere la sezione per evitare frustrazione utente.

#### 2.2.5 Cookie Consent Banner — Mancante

**Problema**: Il sito usa Google Fonts (cookie di terze parti) e Unsplash ma **non ha un cookie consent banner**. La Cookie Policy esiste ma non c'è modo per l'utente di gestire le preferenze.
- **Azione**: Implementare un cookie banner minimo che blocchi Google Fonts fino al consenso, o self-hostare i font.

#### 2.2.6 hreflang mancante su pagine legali

Le pagine `privacy-policy.html` e `cookie-policy.html` non hanno il tag `<link rel="alternate" hreflang="it">` presente sulle altre pagine.
- **Azione**: Aggiungere `hreflang` e `x-default` su tutte le pagine.

#### 2.2.7 Schema.org — Conflitto Entity Types

La homepage ha **3 entity types** per la stessa azienda: Organization, ProfessionalService, LocalBusiness. Google potrebbe confondersi sulla tipologia.
- **Azione**: Consolidare in un unico schema ProfessionalService (che eredita da LocalBusiness) e integrare le proprietà di Organization al suo interno.

### 2.3 🟢 MINORI — Da migliorare gradualmente

#### 2.3.1 Cache & HTTP Headers

**Problema**: Solo `style.min.css` ha cache-busting (`?v=1.2`). Gli altri CSS/JS non hanno versioning.
- **Azione**: Aggiungere `?v=X.X` a tutti i file statici. GitHub Pages gestisce cache headers automaticamente.

#### 2.3.2 Contenuto Duplicato nel Marquee

Il marquee ticker duplica gli stessi `<span>` per l'effetto loop, ma il secondo set ha `aria-hidden="true"` ✅. Google potrebbe indicizzarlo comunque.
- **Azione**: Bassa priorità. Considerare duplicazione via JS/CSS.

#### 2.3.3 Social Media Limitato

Solo Instagram nel footer e nello Schema `sameAs`. Mancano Facebook, LinkedIn, TikTok.
- **Azione**: Creare e collegare profili social. Aggiornare `sameAs` nello Schema.

#### 2.3.4 Copyright Year Fallback

L'HTML ha `2026` hardcoded aggiornato via JS — corretto per ora ✅. Se l'anno cambia e JS fallisce, resterebbe datato.

#### 2.3.5 API Key Esposta

L'API key Web3Forms è visibile nel source HTML. Web3Forms è progettato per l'uso client-side, ma conviene configurare il **domain lock** su Web3Forms dashboard per evitare abusi.

#### 2.3.6 Console.log in Produzione

`main.js` contiene 6+ `console.log` decorativi ("🚀 WebNovis - Powered by Innovation", etc.) + Konami code easter egg. Aggiungono peso e riducono la professionalità in DevTools.
- **Azione**: Rimuovere o condizionare a `process.env.NODE_ENV === 'development'`.

---

## 3. KEYWORD STRATEGY

### 3.1 Keyword Primarie (Alta competizione)
| Keyword | Volume IT stimato | Presenza attuale | Target pagina |
|---------|:---------:|---------|----------|
| agenzia digitale | ~2.900/mese | ✅ Title, H1, Description | Homepage |
| web agency | ~2.400/mese | ✅ Keywords meta | Homepage |
| sviluppo siti web | ~1.600/mese | ✅ Keywords, contenuto | Homepage + /servizi/sviluppo-web |
| social media management | ~1.300/mese | ✅ Contenuto, Schema | /servizi/social-media |
| graphic design | ~2.900/mese | ✅ Contenuto | /servizi/graphic-design |

### 3.2 Keyword Secondarie (Media competizione)
| Keyword | Volume stimato | Presenza | Azione necessaria |
|---------|:---------:|---------|----------|
| creazione siti internet | ~720/mese | ✅ Keywords meta | Aggiungere in H2 e contenuto |
| brand identity | ~590/mese | ✅ Contenuto | Creare pagina dedicata |
| logo design | ~1.300/mese | ✅ Keywords | Creare pagina dedicata |
| realizzazione siti web | ~880/mese | ❌ Assente | Aggiungere in pagina servizi |
| e-commerce | ~4.400/mese | ✅ Contenuto | Creare case study dedicato |
| web design | ~1.900/mese | ❌ Parziale | Aggiungere come keyword target |

### 3.3 Long-tail Keywords (Bassa competizione, alto intento d'acquisto)
Queste keyword richiedono **pagine blog/landing dedicate**:
- "quanto costa un sito web" (~1.000/mese) ← nella FAQ ma non come pagina
- "quanto costa un e-commerce" (~480/mese) ← opportunità articolo blog
- "come creare un brand identity" (~320/mese) ← guida blog
- "social media strategy per piccole imprese" (~260/mese)
- "preventivo sito web" (~390/mese) ← landing page con form
- "agenzia digitale Italia" (~210/mese)
- "restyling sito web" (~170/mese) ← case study + landing
- "migliore web agency" (~140/mese) ← pagina chi siamo ottimizzata

### 3.4 Keyword Gaps vs Competitor
Le web agency italiane ben posizionate targettizzano anche:
- "consulenza digitale", "trasformazione digitale", "marketing digitale"
- "sito web professionale", "sito web aziendale", "sito web economico"
- "gestione social media prezzi", "social media manager freelance"
- Queste keyword NON sono presenti nel sito attuale

---

## 4. CHECKLIST AZIONI PRIORITARIE

### Priorità 1 — URGENTE (questa settimana)
- [ ] **Rimuovere `body.style.opacity='0'`** da main.js (riga 242) — causa FOUC e peggiora LCP
- [ ] **Accorciare meta description homepage** a ~155 char con CTA
- [ ] **Far funzionare il form newsletter** o rimuovere la sezione
- [ ] **Implementare cookie consent banner** (GDPR compliance)
- [ ] **Aggiungere hreflang** su privacy-policy.html e cookie-policy.html
- [ ] **Sostituire `revolution.css`** con `revolution.min.css` su pagine legali
- [ ] **Minificare** text-effects.js e cursor.js → .min.js

### Priorità 2 — ALTA (entro 2 settimane)
- [ ] **Creare pagine servizio dedicate** (web, design, social) — 800+ parole ciascuna
- [ ] **Creare pagina Chi Siamo** — E-E-A-T (foto team, bio, credenziali, storia)
- [ ] **Correggere H1 portfolio** — da "Digital Excellence" a keyword italiana
- [ ] **Ridurre H2 homepage** — downgrade CTA/tech/ricominciare a H3
- [ ] **Espandere alt text** portfolio images con keyword + descrizioni
- [ ] **Self-hostare immagini Unsplash** in formato WebP
- [ ] **Consolidare Schema.org** — unire Organization + ProfessionalService + LocalBusiness
- [ ] **Aggiungere BreadcrumbList Schema** su portfolio e pagine legali
- [ ] **Rinominare `file portfolio/`** → `progetti/` (rimuovere spazi da URL)

### Priorità 3 — MEDIA (entro 1 mese)
- [ ] **Avviare blog** — primi 3 articoli target long-tail keywords
- [ ] **Pulire main.js** — rimuovere console.log, Konami code, codice commentato
- [ ] **Lazy-load globe.js** con IntersectionObserver
- [ ] **Ridurre Google Fonts** — eliminare Space Grotesk, ridurre weight
- [ ] **Aggiungere profili social** (Facebook, LinkedIn) + aggiornare Schema sameAs
- [ ] **Configurare Google Search Console** e Google Analytics 4
- [ ] **Configurare domain lock** su Web3Forms dashboard
- [ ] **Rinominare classi `brxe-*`** nella sezione Ricominciare

### Priorità 4 — Ongoing (mensile)
- [ ] **Pubblicare 2-4 articoli blog/mese** (target long-tail keywords da sezione 3.3)
- [ ] **Costruire backlinks** — directory locali, partnership, guest post, Clutch/Sortlist
- [ ] **Monitorare Core Web Vitals** via Search Console
- [ ] **Aggiornare sitemap.xml** ad ogni nuova pagina
- [ ] **Creare Google Business Profile** se operativi con sede fisica
- [ ] **A/B test** su CTA e meta description

---

## 5. ASPETTI STRUTTURALI & UX/UI

### 5.1 Desktop
- **Hero**: Sfondo WebP preloadato ✅, CTA ben visibili ✅. Particle canvas è decorativo ma aggiunge peso.
- **Navigazione**: Solo ancore e portfolio.html. Con pagine dedicate → aggiungere dropdown servizi.
- **CTA**: "Scopri Come" → #contatti ✅. "I Nostri Servizi" → #servizi ✅. Mancano CTA contestuali nelle sezioni servizio.
- **Footer**: Contiene link a Privacy/Cookie Policy ✅. "Chi Siamo" punta a #servizi ❌ (fuorviante). Manca indirizzo fisico.
- **Social feed mockup**: Effetto "phone frame" creativo ma le immagini Unsplash aggiungono peso.

### 5.2 Mobile
- **Viewport**: `meta viewport` corretto ✅
- **Touch targets**: Conformi alle linee guida Google (48px min) ✅
- **Tipografia fluida**: `clamp()` su tutti i livelli ✅
- **Particle system**: Ridotto a 30 particelle su mobile ✅, disabilitato se `prefers-reduced-motion` ✅
- **Social feed**: Auto-scroll disabilitato su mobile, solo scroll manuale ✅
- **Menu mobile**: Body scroll lock implementato con `document.body.classList.add('menu-open')` ✅
- **⚠️ Hero su mobile**: Verificare che il canvas particles non causi jank su device low-end. Suggerimento: disabilitare completamente sotto 480px.

### 5.3 Accessibilità
| Aspetto | Stato | Note |
|---------|:---:|------|
| Skip navigation | ✅ | `<a href="#main-content" class="sr-only">` |
| Focus states | ✅ | `focus-visible` implementati |
| aria-label | ✅ | Su tutti i bottoni interattivi |
| aria-expanded | ✅ | Su nav toggle |
| Form labels | ✅ | `sr-only` + `autocomplete` |
| Contrasto AAA | ⚠️ | `--text-muted` (#8a8a8a) borderline su small text |
| Marquee | ✅ | Duplicato ha `aria-hidden="true"` |
| Reduced motion | ✅ | `prefersReducedMotion` check in main.js |

---

## 6. SCHEMA.ORG — STATO ATTUALE & MIGLIORAMENTI

### 6.1 Schema già implementati (Homepage)

| Schema Type | Contenuto | Stato |
|-------------|-----------|:---:|
| Organization | name, url, logo, contactPoint, sameAs | ✅ |
| WebSite | name, url, description, inLanguage | ✅ |
| ProfessionalService | hasOfferCatalog (3), knowsAbout (12), serviceType (12), priceRange, areaServed | ✅✅ |
| FAQPage | 5 domande con risposte complete | ✅ |
| LocalBusiness | AggregateRating (5/5), 5 Review individuali | ✅ |

### 6.2 Schema implementati (Portfolio)
| Schema Type | Contenuto | Stato |
|-------------|-----------|:---:|
| CollectionPage | name, description, mainEntity (ItemList) | ✅ |
| ItemList | 5 items con name, url, description, image, creator | ✅ |

### 6.3 Miglioramenti consigliati

**A. Risolvere conflitto entity types** — Consolidare Organization + ProfessionalService + LocalBusiness:
```json
{
    "@type": ["ProfessionalService", "Organization"],
    "name": "WebNovis",
    "url": "https://www.webnovis.com",
    "logo": "...",
    "foundingDate": "2024",
    "founder": { "@type": "Person", "name": "..." },
    "aggregateRating": { ... },
    "review": [ ... ],
    "hasOfferCatalog": { ... },
    "knowsAbout": [ ... ]
}
```

**B. Aggiungere BreadcrumbList** su pagine interne:
```json
{
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.webnovis.com/" },
        { "@type": "ListItem", "position": 2, "name": "Portfolio", "item": "https://www.webnovis.com/portfolio.html" }
    ]
}
```

**C. Aggiungere `foundingDate` e `founder`** all'Organization schema per E-E-A-T.

**D. Aggiungere `potentialAction` SearchAction** al WebSite schema (solo se implementate funzionalità di ricerca).

---

## 7. OFF-PAGE SEO & AUTHORITY — Score: 3/10

### 7.1 Backlink Profile
- **Nessun backlink noto** — il sito è nuovo e non ha ancora costruito autorità
- Schema `sameAs` contiene solo Instagram
- Nessuna presenza su directory aziendali (Clutch, Sortlist, Pagine Gialle, Yelp)
- Nessun guest post o menzione su blog di settore

### 7.2 Azioni consigliate
1. **Registrare il sito** su: Clutch.co, Sortlist, Pagine Gialle, Google Business Profile, Yelp, TrustPilot
2. **Guest posting** su blog di settore (web design, marketing digitale, startup italiane)
3. **Creare profili social** completi su Facebook, LinkedIn, TikTok
4. **Partnership** con fornitori/clienti per scambio link naturali
5. **PR digitale** — comunicati stampa per progetti degni di nota

---

## 8. LOCAL SEO — Score: 2/10

### 8.1 Stato attuale
- **Google Business Profile**: NON presente ❌
- **NAP (Name, Address, Phone)**: Solo email presente, nessun indirizzo o telefono
- **Schema LocalBusiness**: Presente ma senza `address` e `telephone`
- **Citazioni locali**: Nessuna
- **Recensioni Google**: 0 (no GBP = no recensioni Google)

### 8.2 Azioni consigliate
Se WebNovis ha una sede fisica (anche home office):
1. **Creare Google Business Profile** con categorie: "Web design agency", "Graphic designer", "Social media agency"
2. **Aggiungere indirizzo e telefono** allo Schema LocalBusiness e al footer
3. **Raccogliere recensioni Google** dai clienti (Franco, Luis, Luca, Sara, Mimmo)
4. **Registrarsi** su directory locali italiane

---

## 9. AI SEARCH READINESS (SGE/AIO) — Score: 7/10

### 9.1 Punti di forza
- `ai.txt` completo e ben strutturato (126 righe, markdown) ✅
- `webnovis-ai-data.json` per crawlers AI ✅
- Meta tag `<meta name="ai-content">` per discovery ✅
- `robots.txt` permette GPTBot, CCBot, Google-Extended ✅
- FAQ strutturate in Schema FAQPage (ideali per AI Overviews) ✅
- Contenuto in formato Q&A nella sezione FAQ ✅

### 9.2 Miglioramenti per AI Overview
- **Creare contenuto più profondo** — le risposte FAQ sono brevi (~50 parole). Le AI preferiscono risposte di 100-200 parole
- **Aggiungere "How-to" content** — guide step-by-step su processi (es. "Come scegliere una web agency")
- **Strutturare i servizi** con bullet point + spiegazioni dettagliate (le AI estraggono meglio contenuti strutturati)
- **Aggiungere dati quantitativi** — percentuali, statistiche, risultati misurabili (le AI adorano dati concreti)

---

## 10. COMPETITOR ANALYSIS — COSA FANNO I MIGLIORI

Le web agency italiane ben posizionate hanno in comune:

| Fattore | Top Competitor | WebNovis |
|---------|:---------:|:---:|
| Blog attivo (50+ articoli) | ✅ | ❌ |
| Pagine servizio dedicate | ✅ | ❌ |
| Portfolio con case study | ✅ | ⚠️ (solo gallery) |
| Pagina team con bio | ✅ | ❌ |
| Testimonianze verificabili | ✅ | ⚠️ (nomi ma no link) |
| Google Business Profile | ✅ | ❌ |
| Backlinks da 50+ domini | ✅ | ❌ |
| Google Analytics/GSC | ✅ | ❌ |
| Schema markup ricco | ✅ | ✅ |
| AI-ready content | ⚠️ | ✅ |
| Cookie consent | ✅ | ❌ |

**Vantaggio competitivo WebNovis**: Schema markup eccellente e AI-readiness avanzata — questi sono fattori in crescita che molti competitor non hanno ancora implementato.

---

## 11. CONCLUSIONE & ROADMAP

### Stato attuale
Il sito WebNovis ha una **base tecnica solida e avanzata** (Schema.org eccellente, meta tag corretti, AI-readiness superiore alla media, HTML semantico con buona accessibilità). Tuttavia soffre di:

1. **🔴 Contenuto insufficiente** — 4 pagine non bastano per competere sulle SERP. Servono pagine servizio, chi siamo, blog.
2. **🔴 Performance JS** — `body.style.opacity='0'` al load, script non minificati, codice morto in produzione.
3. **🟡 Cookie compliance** — Form raccoglie dati, Google Fonts usa cookie, ma nessun consent banner.
4. **🟡 Zero authority** — Nessun backlink, nessun Google Business Profile, nessun profilo social oltre Instagram.
5. **🟡 E-E-A-T debole** — Nessuna pagina team, nessun case study, nessuna credenziale verificabile.

### Impatto stimato delle ottimizzazioni

| Timeframe | Score atteso | Azioni chiave |
|-----------|:---:|------|
| Oggi | 54/100 | Baseline |
| +2 settimane | 65/100 | Fix tecnici P1 + pagine servizio |
| +1 mese | 72/100 | Chi siamo + blog (3 articoli) + Schema consolidato |
| +3 mesi | 78/100 | 10+ articoli blog + GBP + primi backlinks |
| +6 mesi | 82-85/100 | 25+ articoli + authority crescente + CWV ottimi |

### 3 azioni a più alto impatto (da fare SUBITO)
1. **Creare 3 pagine servizio dedicate** — da solo può raddoppiare le keyword indicizzate
2. **Creare pagina Chi Siamo** — critico per E-E-A-T e fiducia utente
3. **Avviare il blog** — unico modo per competere sulle long-tail keywords

---

*Audit generato il 12/02/2026 — Revisione consigliata: mensile*  
*Prossimo audit: Marzo 2026*
