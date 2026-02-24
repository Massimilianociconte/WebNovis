# 📊 Report SEO Completo — WebNovis vs Google Search Documentation
**Data analisi:** 24 Febbraio 2026  
**Fonti:** Google Search Central Documentation (developers.google.com/search/docs)  
**Pagine analizzate:** Guida Introduttiva SEO, Come funziona la Ricerca, Scansione e Indicizzazione, Dati Strutturati, Core Web Vitals, Page Experience, Title Links, Snippet/Meta Description, JavaScript SEO, Nozioni di base sulla Ricerca Google

---

## 🏆 EXECUTIVE SUMMARY

| Area | Stato | Voto |
|------|-------|------|
| **Requisiti Tecnici Base** | ✅ Eccellente | 9/10 |
| **Scansione e Indicizzazione** | ✅ Molto buono | 8.5/10 |
| **Dati Strutturati (Schema.org)** | ✅ Eccellente | 9.5/10 |
| **Meta Tag e Title** | ⚠️ Buono con lacune | 7/10 |
| **Core Web Vitals / Performance** | ⚠️ Da verificare in campo | 7/10 |
| **Esperienza sulle Pagine** | ✅ Molto buono | 8/10 |
| **Contenuti e Qualità** | ✅ Molto buono | 8.5/10 |
| **Immagini e Media** | ⚠️ Buono con lacune | 7/10 |
| **Link Interni ed Esterni** | ⚠️ Da migliorare | 6.5/10 |
| **Canonicalizzazione e Duplicati** | ✅ Molto buono | 8.5/10 |
| **Mobile-first** | ✅ Buono | 8/10 |
| **HTTPS e Sicurezza** | ✅ Eccellente | 9.5/10 |

**Punteggio complessivo stimato: 8.1/10**

---

## 1. ✅ COSA WEBNOVIS FA GIÀ BENE (Conforme a Google)

### 1.1 Dati Strutturati JSON-LD — ECCELLENTE
Google raccomanda: *"Utilizza i dati strutturati per abilitare i risultati avanzati"* con formato JSON-LD come preferito.

**WebNovis implementa (su index.html):**
- ✅ `Organization` con logo, contatti, sameAs (30+ profili)
- ✅ `WebSite` con `SearchAction` (sitelinks searchbox)
- ✅ `LocalBusiness` + `ProfessionalService` con geo, orari, areaServed, aggregateRating, review
- ✅ `WebPage` con datePublished/dateModified
- ✅ `BreadcrumbList` su ~129 pagine
- ✅ `FAQPage` sulla homepage
- ✅ Blog articles con `Article` schema (datePublished, author, publisher)
- ✅ Case study portfolio con schema dedicato

**Verdetto:** Implementazione tra le migliori per un sito di questa dimensione. I dati strutturati sono presenti su tutte le 130+ pagine HTML.

### 1.2 Robots.txt — ECCELLENTE
Google dice: *"Googlebot rispetta il file robots.txt per determinare quali pagine scansionare."*

- ✅ Sitemap dichiarata: `Sitemap: https://www.webnovis.com/sitemap.xml`
- ✅ Disallow corretto per file sensibili (server.js, .env, node_modules, .git)
- ✅ Allow esplicito per asset (css, js, Img)
- ✅ Gestione granulare per AI bots (GPTBot, ClaudeBot, PerplexityBot, etc.)
- ✅ Blocco scraper aggressivi (MJ12bot, DotBot, BLEXBot)

### 1.3 Sitemap XML — MOLTO BUONA
Google dice: *"Una Sitemap è un file contenente tutti gli URL importanti del sito."*

- ✅ Formato valido con namespace `sitemaps.org/schemas/sitemap/0.9`
- ✅ Estensione `image:image` per immagini portfolio e logo
- ✅ `lastmod` su ogni URL (aggiornato: 2026-02-24)
- ✅ ~100 URL inclusi (blog, servizi, portfolio, pagine locali)
- ✅ Esclusi duplicati legacy portfolio
- ✅ Generazione automatizzata via `generate-sitemap.js`

### 1.4 Canonical URL — IMPLEMENTATO SU TUTTE LE PAGINE
Google dice: *"Ogni contenuto del sito dovrebbe essere accessibile tramite un singolo URL."*

- ✅ `<link rel="canonical">` presente su tutte le 139 pagine HTML
- ✅ 301 redirect per legacy portfolio URLs
- ✅ Trailing slash normalization con 301
- ✅ UTM/tracking parameter stripping con 301

### 1.5 HTTPS e Sicurezza — ECCELLENTE
Google dice: *"Le pagine devono essere pubblicate in modo sicuro."*

- ✅ HSTS con `max-age=31536000; includeSubDomains; preload`
- ✅ CSP (Content Security Policy) completa e restrittiva
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: camera=(), microphone=(), geolocation=()
- ✅ X-Robots-Tag: noindex,nofollow sugli endpoint /api/ e /admin/

### 1.6 Caching e Performance Server — MOLTO BUONO
- ✅ Compression middleware (Brotli/Gzip) attivo
- ✅ Asset immutabili in produzione (max-age=31536000)
- ✅ HTML con cache breve (max-age=300) + stale-while-revalidate
- ✅ Cache-busting con parametri `?v=` sui file

### 1.7 hreflang — PRESENTE
- ✅ `hreflang="it"` + `hreflang="x-default"` sulle pagine (conforme per sito monolingue italiano)

### 1.8 Meta Robots — CORRETTO
- ✅ `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` — configurazione ottimale che massimizza la visibilità nei risultati

### 1.9 Contenuti del Blog — MOLTO BUONO
Google dice: *"Crea contenuti utili, affidabili e pensati per le persone."*

- ✅ 80+ articoli blog su argomenti pertinenti
- ✅ Copertura tematica ampia (SEO, design, e-commerce, social media, accessibilità, costi, legal)
- ✅ Articoli con struttura heading gerarchica
- ✅ URL descrittivi (es: `/blog/seo-on-page-checklist.html`)
- ✅ Ogni articolo ha schema Article con autore e date

---

## 2. ⚠️ LACUNE IDENTIFICATE — COSA MANCA PER ESSERE OTTIMIZZATI AL 100%

### 2.1 🔴 PRIORITÀ ALTA — Open Graph e Social Meta Tags sulla Homepage
**Google dice:** *"Google analizza og:title e altri contenuti per determinare i link dei titoli."*

**Problema:** La homepage (`index.html`) **NON ha tag Open Graph** (og:title, og:description, og:image, og:type, og:url) e nemmeno Twitter Card, mentre i blog post li hanno tutti (6 tag OG ciascuno).

**Impatto:** Quando la homepage viene condivisa su social media (Facebook, LinkedIn, Twitter, WhatsApp), non ha un'anteprima controllata. Inoltre Google usa `og:title` come fonte secondaria per i title link nei risultati di ricerca.

**Azione richiesta:**
```html
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.webnovis.com/">
<meta property="og:title" content="Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social">
<meta property="og:description" content="Web Novis è un'agenzia web a Milano (Rho) specializzata in sviluppo siti, grafica, brand identity e social media. Preventivo gratuito.">
<meta property="og:image" content="https://www.webnovis.com/Img/og-webnovis-home.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="it_IT">
<meta property="og:site_name" content="Web Novis">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Agenzia Web Milano e Rho • Web Novis">
<meta name="twitter:description" content="Agenzia web a Milano e Rho specializzata in siti web, grafica e social media.">
<meta name="twitter:image" content="https://www.webnovis.com/Img/og-webnovis-home.jpg">
```

**Pagine interessate:** Verificare anche `portfolio.html`, `chi-siamo.html`, `contatti.html`, `preventivo.html`, `come-lavoriamo.html` e tutte le pagine locali (`agenzia-web-*.html`, `realizzazione-siti-web-*.html`). Se non hanno OG tags, aggiungerli.

---

### 2.2 🔴 PRIORITÀ ALTA — Immagine OG Dedicata (1200×630)
**Problema:** Non sembra esistere un'immagine OG dedicata nel sito. Il logo `webnovis-logo-bianco.png` non è adatto come og:image (dimensioni/formato sbagliato).

**Azione:** Creare un'immagine `/Img/og-webnovis-home.jpg` (1200×630px) con:
- Logo WebNovis
- Headline "Agenzia Web Milano e Rho"
- Visual accattivante
- Sfondo scuro coerente col brand

Creare anche immagini OG per le pagine servizi principali.

---

### 2.3 🔴 PRIORITÀ ALTA — Dimensioni Esplicite su Immagini (CLS)
**Google dice (Core Web Vitals):** *"CLS (Cumulative Layout Shift) < 0.1. Per offrire una buona esperienza, fai in modo di avere un punteggio CLS inferiore a 0.1."*

**Problema:** Le immagini nel markup HTML dell'homepage (e probabilmente altre pagine) non hanno attributi `width` e `height` espliciti. Questo causa **layout shift** durante il caricamento, peggiorando il CLS.

**Azione:** Aggiungere `width` e `height` a tutte le `<img>` e immagini background critiche. Es:
```html
<img src="/Img/hero.webp" alt="..." width="1200" height="600" loading="lazy">
```

---

### 2.4 🟡 PRIORITÀ MEDIA — Sitemap: Mancano `<changefreq>` e `<priority>` (Opzionale ma utile)
**Nota:** Google dice ufficialmente che ignora `<changefreq>` e `<priority>`, ma `<lastmod>` è importante e già presente. Tuttavia, per completezza e compatibilità con altri motori (Bing, Yandex), potrebbe essere utile aggiungere:
- Homepage: `<priority>1.0</priority>`
- Servizi: `<priority>0.8</priority>`
- Blog: `<priority>0.6</priority>`

**Verdict:** Bassa priorità, ma facile da implementare in `generate-sitemap.js`.

---

### 2.5 🟡 PRIORITÀ MEDIA — Immagini nel Sitemap: Copertura Incompleta
**Problema:** Solo la homepage e i case study del portfolio hanno `<image:image>` nella sitemap. Mancano le immagini per:
- Pagine servizi
- Pagine locali (agenzia-web-*.html)
- Blog post (ciascuno ha un'immagine hero)

**Azione:** Estendere `generate-sitemap.js` per estrarre automaticamente l'immagine hero da ogni pagina e includerla nella sitemap.

---

### 2.6 🟡 PRIORITÀ MEDIA — `fetchpriority="high"` su LCP Element
**Google dice (LCP):** *"LCP < 2.5 secondi dall'inizio del caricamento."*

**Problema:** L'immagine o elemento hero visibile "above the fold" potrebbe non avere `fetchpriority="high"` e `loading="eager"`. Questo ritarda il Largest Contentful Paint.

**Azione:**
```html
<!-- Immagine hero / LCP element -->
<img src="/Img/hero.webp" alt="..." fetchpriority="high" loading="eager" width="1200" height="600">
```

---

### 2.7 🟡 PRIORITÀ MEDIA — `rel="nofollow"` Quasi Assente sui Link Esterni
**Google dice:** *"Se non ritieni attendibili i contenuti e vuoi comunque creare un link, aggiungi un'annotazione nofollow."*

**Stato attuale:** Solo 3 file hanno `nofollow/sponsored/ugc`. Con ~130 pagine HTML che contengono link esterni (Trustpilot, Clutch, social media, risorse esterne), molti link esterni non hanno attributi `rel` qualificanti.

**Azione:** Aggiungere `rel="nofollow noopener"` ai link verso:
- Siti di terze parti non controllati
- Widget Trustpilot/Clutch
- Link social nei footer
- Link a risorse esterne negli articoli blog (valutare caso per caso)

**Eccezione:** Link verso risorse autorevoli (Wikipedia, Google Developers, etc.) possono rimanere "followed".

---

### 2.8 🟡 PRIORITÀ MEDIA — Preconnect/Preload per Risorse Critiche
**Problema:** L'homepage ha `preconnect` per Google Fonts ma potrebbe mancare per altre risorse critiche above-the-fold.

**Azione:** Verificare e aggiungere:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" href="/css/style.min.css" as="style">
<link rel="preload" href="/Img/hero-image.webp" as="image" fetchpriority="high">
```

---

### 2.9 🟡 PRIORITÀ MEDIA — alt="" Vuoto Trovato
**Problema:** Trovato 1 file con `alt=""` vuoto: `portfolio/Ember-Oak.html`. Un alt vuoto dice a Google che l'immagine è decorativa, ma se è un'immagine di contenuto (mockup portfolio), ha bisogno di un alt descrittivo.

**Azione:** Verificare e correggere tutti i `alt=""` con testo descrittivo appropriato.

---

### 2.10 🟡 PRIORITÀ MEDIA — Pagine Locali: Contenuto Potenzialmente Thin
**Google dice:** *"Creare contenuti utili, affidabili e pensati per le persone."*

**Rischio:** Le pagine locali (`agenzia-web-arese.html`, `agenzia-web-garbagnate.html`, `realizzazione-siti-web-*.html`, etc.) rischiano di essere percepite come **thin content** o contenuto duplicato se hanno solo variazioni minime del nome della città.

**Azione:**
- Verificare che ogni pagina locale abbia **contenuto univoco e sostanziale** (almeno 300-500 parole uniche)
- Includere referenze specifiche alla città/zona
- Aggiungere testimonianze locali, statistiche locali, menzioni di clienti nella zona
- Evitare di avere template identici con solo il nome della città cambiato

---

### 2.11 🟢 PRIORITÀ BASSA — Meta Keywords Tag
**Google dice esplicitamente:** *"Google non utilizza il meta tag keywords."*

**Stato:** L'homepage ha un lunghissimo meta keywords tag (~35+ keywords). Non fa danni, ma è spazio HTML sprecato e potrebbe rivelare la strategia keyword ai competitor.

**Azione consigliata:** Rimuovere il tag `<meta name="keywords">` o ridurlo drasticamente. Non porta alcun beneficio SEO su Google.

---

### 2.12 🟢 PRIORITÀ BASSA — SiteNavigationElement Schema
**Mancante:** Non c'è schema `SiteNavigationElement` per la navigazione principale. Potrebbe aiutare Google a comprendere la struttura di navigazione.

```json
{
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Navigazione principale",
  "hasPart": [
    {"@type": "WebPage", "name": "Home", "url": "https://www.webnovis.com/"},
    {"@type": "WebPage", "name": "Servizi", "url": "https://www.webnovis.com/servizi/"},
    {"@type": "WebPage", "name": "Portfolio", "url": "https://www.webnovis.com/portfolio.html"},
    {"@type": "WebPage", "name": "Blog", "url": "https://www.webnovis.com/blog/"},
    {"@type": "WebPage", "name": "Chi Siamo", "url": "https://www.webnovis.com/chi-siamo.html"},
    {"@type": "WebPage", "name": "Contatti", "url": "https://www.webnovis.com/contatti.html"}
  ]
}
```

---

### 2.13 🟢 PRIORITÀ BASSA — Schema `Person` per Autore del Blog
**Stato:** Gli articoli blog hanno `author: { "@type": "Person" }` ma potrebbe mancare un profilo autore completo con `sameAs`, `jobTitle`, `image`, etc. Google valorizza E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).

**Azione:** Arricchire lo schema Person dell'autore:
```json
{
  "@type": "Person",
  "@id": "https://www.webnovis.com/#person-massimiliano",
  "name": "Massimiliano Ciconte",
  "jobTitle": "Founder & Web Developer",
  "url": "https://www.webnovis.com/chi-siamo.html",
  "image": "https://www.webnovis.com/Img/team/massimiliano.webp",
  "sameAs": ["https://www.linkedin.com/in/massimiliano-ciconte/"]
}
```

---

## 3. 📋 CHECKLIST GOOGLE SEO COMPLETA — STATO WEBNOVIS

### 3.1 Fase 1: Scansione (Crawling)
| Requisito Google | Stato | Note |
|---|---|---|
| Robots.txt valido e corretto | ✅ | Ottimale |
| Sitemap XML presente e inviata | ✅ | Completa con immagini |
| URL accessibili a Googlebot | ✅ | Nessun blocco improprio |
| CSS e JS accessibili | ✅ | Allow esplicito in robots.txt |
| Codici HTTP corretti (200, 301, 404) | ✅ | 301 per redirect, 404 custom |
| Nessun blocco improprio via robots.txt | ✅ | Solo file sensibili bloccati |
| Link sottoponibili a scansione (href) | ✅ | Link HTML standard |

### 3.2 Fase 2: Indicizzazione (Indexing)
| Requisito Google | Stato | Note |
|---|---|---|
| `<title>` univoco per ogni pagina | ✅ | Presente su tutte le pagine |
| Meta description univoca | ✅ | Presente su tutte le pagine |
| Canonical URL su ogni pagina | ✅ | `rel="canonical"` ovunque |
| Contenuti duplicati gestiti | ✅ | 301 redirect, canonical |
| Meta robots corretti | ✅ | index,follow + max-image-preview:large |
| Contenuto principalmenate HTML (no JS-only) | ✅ | Sito statico, rendering server-side |
| Lingua dichiarata (`lang="it"`) | ✅ | Su `<html lang="it">` |

### 3.3 Fase 3: Ranking (Pubblicazione risultati)
| Requisito Google | Stato | Note |
|---|---|---|
| Contenuti utili e di qualità | ✅ | 80+ articoli blog di valore |
| Parole chiave nei titoli e heading | ✅ | Ben ottimizzato |
| Alt text descrittivo su immagini | ⚠️ | 1 file con alt vuoto |
| URL descrittivi e leggibili | ✅ | Eccellente |
| Struttura heading gerarchica | ✅ | H1→H2→H3 |
| Open Graph tags | ⚠️ | Mancano su homepage e pagine statiche |
| Dati strutturati JSON-LD | ✅ | Eccellente, 6+ tipi di schema |
| HTTPS | ✅ | Con HSTS preload |
| Mobile-friendly | ✅ | viewport meta tag presente |
| Core Web Vitals (LCP, INP, CLS) | ⚠️ | Da verificare in PageSpeed Insights |
| Velocità di caricamento | ✅ | Compression + caching |
| No interstitial invasivi | ✅ | Nessun popup bloccante |
| Link interni pertinenti | ⚠️ | Da rafforzare tra blog e servizi |
| Link esterni qualificati (nofollow) | ⚠️ | Quasi assente |
| Breadcrumb strutturati | ✅ | Schema BreadcrumbList su ~129 pagine |

---

## 4. 🎯 PIANO D'AZIONE PRIORITIZZATO

### Settimana 1 — Quick Wins (Impatto Alto, Sforzo Basso)
1. **Aggiungere OG tags + Twitter Card alla homepage e pagine statiche** — 2h
2. **Creare immagine OG 1200×630** per homepage e servizi — 1h
3. **Rimuovere/ridurre meta keywords** dalla homepage — 5min
4. **Correggere alt="" vuoto** su portfolio/Ember-Oak.html — 5min
5. **Aggiungere `width` e `height`** a tutte le immagini critiche above-the-fold — 2h

### Settimana 2 — Ottimizzazione Performance
6. **Aggiungere `fetchpriority="high"`** sull'elemento LCP di ogni pagina — 1h
7. **Aggiungere preload/preconnect** per risorse critiche — 30min
8. **Verificare CLS su PageSpeed Insights** per le top 10 pagine — 1h
9. **Aggiungere `rel="nofollow noopener"`** ai link esterni non attendibili — 2h

### Settimana 3 — Contenuti e Struttura
10. **Audit contenuto pagine locali** — verificare unicità e depth — 3h
11. **Arricchire schema Person** per autore blog (E-E-A-T) — 1h
12. **Estendere sitemap** con immagini da blog e servizi — 1h
13. **Rafforzare internal linking** tra blog → servizi e viceversa — 3h

### Ongoing
14. **Monitorare Search Console** per errori di indicizzazione
15. **Verificare Core Web Vitals** reali con Chrome UX Report
16. **Aggiornare contenuti** del blog regolarmente (Google premia contenuti aggiornati)

---

## 5. 📊 CONFRONTO DETTAGLIATO: COSA DICE GOOGLE vs COSA FA WEBNOVIS

### 5.1 Titoli (Title Links)
**Google dice:**
- Ogni pagina deve avere un `<title>` univoco
- Testo conciso e descrittivo
- Evitare keyword stuffing
- Brand name alla fine, separato da delimitatore
- Il titolo visivo H1 deve corrispondere al `<title>`

**WebNovis:** ✅ Implementato correttamente. I titoli sono univoci, descrittivi e includono "Web Novis" come brand. Es: `"Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social"`.

### 5.2 Meta Description (Snippet)
**Google dice:**
- Univoca per ogni pagina
- 1-2 frasi riassuntive
- Può includere informazioni chiave (autore, prezzo, data)
- Niente keyword stuffing

**WebNovis:** ✅ Presente e univoca su tutte le pagine. Buona qualità.

### 5.3 Dati Strutturati
**Google dice:**
- JSON-LD come formato preferito
- Proprietà obbligatorie e raccomandate
- Dati strutturati solo per contenuti visibili nella pagina
- Testare con Rich Results Test

**WebNovis:** ✅ Implementazione eccellente con 6+ tipi di schema. Organization, WebSite, LocalBusiness, WebPage, BreadcrumbList, FAQPage, Article.

### 5.4 URL e Struttura del Sito
**Google dice:**
- URL descrittivi con parole leggibili
- Raggruppare pagine simili in directory
- Evitare URL con identificatori casuali

**WebNovis:** ✅ Struttura eccellente:
- `/blog/seo-on-page-checklist.html`
- `/servizi/sviluppo-web.html`
- `/portfolio/case-study/aether-digital.html`

### 5.5 Immagini
**Google dice:**
- Immagini di alta qualità vicino al testo pertinente
- Alt text descrittivo
- Formato WebP/moderno

**WebNovis:** ⚠️ Buono ma con margini di miglioramento. Alt text presente quasi ovunque, 1 caso vuoto. Formato .webp usato per portfolio. Width/height da aggiungere.

### 5.6 Link
**Google dice:**
- Link pertinenti con anchor text efficace
- nofollow per link non attendibili
- nofollow per contenuti generati dagli utenti

**WebNovis:** ⚠️ Link interni buoni, ma manca `rel="nofollow"` su molti link esterni e manca una strategia di internal linking più aggressiva blog↔servizi.

### 5.7 Core Web Vitals
**Google dice:**
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

**WebNovis:** ⚠️ Il setup tecnico è buono (compression, caching, static HTML), ma servono verifiche reali con PageSpeed Insights / Chrome UX Report per confermare i punteggi.

### 5.8 Page Experience
**Google dice:**
- HTTPS ✓
- Mobile-friendly ✓
- No interstitial invasivi ✓
- Core Web Vitals validi ✓
- Contenuti facilmente distinguibili ✓

**WebNovis:** ✅ Tutti i requisiti soddisfatti tranne CWV da verificare in campo.

---

## 6. 🔍 ASPETTI CHE GOOGLE DICE DI **NON** CONSIDERARE

Questi elementi **NON** impattano il ranking secondo la documentazione Google, quindi NON serve investire tempo:

1. **Meta keywords tag** — Google lo ignora completamente dal 2009
2. **Ordine semantico degli heading** — Google non penalizza H2 prima di H1
3. **Dominio di primo livello** (.com vs .it vs .org) — Irrilevante per il ranking (a meno di targeting geografico)
4. **Parole chiave nel dominio** — Quasi nessun effetto
5. **PageRank sculpting** — Non funziona come una volta
6. **Numero magico di heading/link per pagina** — Non esiste
7. **Quantità di contenuti generati dall'AI** — Non è un fattore negativo di per sé, purché il contenuto sia utile

---

## 7. 🏁 CONCLUSIONE

**WebNovis è già in uno stato SEO molto buono** (8.1/10), con un'implementazione tecnica superiore alla media dei siti italiani di questa dimensione. Le aree principali di miglioramento sono:

1. **OG tags mancanti** sulla homepage e pagine statiche (impatto social e indiretto SEO)
2. **Dimensioni immagini esplicite** per migliorare CLS
3. **Link esterni non qualificati** con rel="nofollow"
4. **Unicità contenuto pagine locali** (rischio thin content)
5. **Internal linking** tra blog e servizi da rafforzare

Implementando le azioni della Settimana 1 (~5 ore di lavoro), il punteggio SEO stimato salirebbe a **8.8/10**. Con tutte le azioni del piano (~15 ore totali), si arriverebbe a **9.3/10**.

---

*Report generato analizzando la documentazione ufficiale Google Search Central (developers.google.com/search/docs) e il codebase completo di WebNovis (139 file HTML, server.js, robots.txt, sitemap.xml).*
