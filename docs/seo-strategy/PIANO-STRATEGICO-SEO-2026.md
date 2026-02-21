# PIANO STRATEGICO SEO & PERFORMANCE — WebNovis 2026

**Data**: 17 Febbraio 2026  
**Autore**: Analisi automatizzata su codebase completa  
**Scope**: Stato attuale, gap analysis, keyword strategy, piano operativo, roadmap 3–6 mesi  
**Documenti sorgente**: `SEO-AUDIT.md`, `REPORT-SEO-AVANZATO-2026.md`, `SEO-GEO.MD`, `WEBSITE-AUDIT-REPORT.md`, `Best-free-backlinks-platforms.MD`, `DIRECTORY-LISTINGS.md`, `seo_webnovis_hierarchy.json`, `tecniche-SEO-avanzate.txt`, codebase completa

---

## INDICE

1. [Stato Attuale SEO](#1-stato-attuale-seo)
2. [Analisi Strategica Keyword Hierarchy](#2-analisi-strategica-keyword-hierarchy)
3. [Gap Analysis Strutturata](#3-gap-analysis-strutturata)
4. [Mappa Cannibalizzazione e Sovrapposizioni](#4-mappa-cannibalizzazione-e-sovrapposizioni)
5. [Architettura Topic Cluster / Pillar Pages](#5-architettura-topic-cluster--pillar-pages)
6. [Strategia Funnel TOFU–MOFU–BOFU](#6-strategia-funnel-tofumofubofu)
7. [Piano d'Azione Operativo](#7-piano-dazione-operativo)
8. [Task List Prioritizzata](#8-task-list-prioritizzata)
9. [Proposte Nuove Pagine / Articoli / Sezioni](#9-proposte-nuove-pagine--articoli--sezioni)
10. [Miglioramenti Tecnici SEO](#10-miglioramenti-tecnici-seo)
11. [Ottimizzazioni Contenuto e Semantica](#11-ottimizzazioni-contenuto-e-semantica)
12. [Roadmap Evolutiva 3–6 Mesi](#12-roadmap-evolutiva-36-mesi)

---

## 1. STATO ATTUALE SEO

### 1.1 Scorecard Sintetica

| Area | Score | Trend | Note |
|------|:-----:|:-----:|------|
| **Crawlability & Indexing** | 7/10 | ↗ | Sitemap OK, robots.txt ottimizzato, 40+ URL indicizzabili |
| **Core Web Vitals** | 5/10 | → | LCP ~2.5-3.5s, body opacity hack presente, 7 CSS + 5 JS |
| **On-Page SEO** | 7/10 | ↗ | Title/meta OK, heading hierarchy da migliorare |
| **Schema Markup** | 8/10 | ↗ | 6 JSON-LD interlinked, FAQPage su tutte le pagine servizio |
| **Content Depth** | 5/10 | ↗ | 20 articoli + 6 servizi + Chi Siamo — mancano pillar |
| **E-E-A-T** | 4/10 | → | Nessun author byline, no Person schema, no case study con dati |
| **Off-Page / Authority** | 2/10 | → | Zero backlink noti, solo Instagram |
| **Local SEO** | 2/10 | ⏳ | GBP in attesa dati fiscali, Bing Places in attesa PIN |
| **AI Search Readiness** | 8/10 | ↗ | ai.txt v3.0, webnovis-ai-data.json, 6 crawler ammessi, FAQPage |
| **Internal Linking** | 3/10 | → | No architettura pillar-cluster, no link bidirezionali |
| **Conversioni / CRO** | 3/10 | → | CTA generiche, zero lead magnet, no exit-intent |
| **SEO SCORE COMPLESSIVO** | **49/100** | | **Target 6 mesi: 78-85/100** |

### 1.2 Asset Esistenti — Punti di Forza

| Asset | Stato | Valore Competitivo |
|-------|:-----:|:------------------:|
| `ai.txt` v3.0 (172 righe) | ✅ | Alto — solo ~2% dei siti italiani |
| `webnovis-ai-data.json` v3.0 | ✅ | Alto — dati nativi per crawler AI |
| `robots.txt` AI-permissive (6 crawler) | ✅ | Alto |
| 6 JSON-LD interlinked (@id) | ✅ | Alto — Organization + WebSite + LocalBusiness + WebPage + Breadcrumb + FAQ |
| FAQPage Schema su 7 pagine (homepage + 6 servizi) | ✅ | Alto |
| 20 articoli blog SEO/GEO-optimized | ✅ | Medio-Alto |
| 170 topic in coda (`topics-queue.json`) | ✅ | Alto — pipeline 12+ mesi |
| Auto-writer AI (Gemini/Groq) | ✅ | Alto — produzione scalabile |
| Newsletter engine AI-powered (Brevo + Groq) | ✅ | Medio |
| IndexNow protocol implementato | ✅ | Medio — indicizzazione istantanea |
| Cookie consent + GA4 consent-gated | ✅ | Compliance |
| LLM Source Sniffing eseguito | ✅ | Alto — dati competitivi unici |

### 1.3 Struttura Sito Attuale

**40+ URL indicizzabili in sitemap:**

| Sezione | Pagine | Stato |
|---------|:------:|:-----:|
| Homepage | 1 | ✅ |
| Servizi | 6 (sviluppo-web, ecommerce, landing-page, sito-vetrina, graphic-design, social-media) | ✅ |
| Portfolio | 1 index + 6 detail | ✅ |
| Blog | 1 index + 20 articoli | ✅ |
| Chi Siamo | 1 | ✅ |
| Contatti | 1 | ✅ |
| Case Study | 8 (sottocartella portfolio/case-study/) | ⚠️ Non in sitemap |
| Legal | 3 (privacy, cookie, termini) | ✅ |
| **Totale** | **~48 URL** | |

**Lacune strutturali critiche:**
- **Case study in `portfolio/case-study/`** — 8 file HTML esistenti ma **NON in sitemap**
- **Nessuna pagina /tools/** — opportunità micro-SaaS (calcolatori)
- **Nessuna landing page locale** — Rho, Milano, Monza non presidiati
- **Nessuna pagina prezzi dedicata** — solo FAQ e blog
- **Blog senza architettura cluster** — 20 articoli non strutturati

---

## 2. ANALISI STRATEGICA KEYWORD HIERARCHY

### 2.1 Panoramica Cluster dal file `seo_webnovis_hierarchy.json`

Il file contiene **7 cluster tematici** con **~85 keyword** distribuite tra PAA, query seed e correlate:

| Cluster | # Keyword | Intent Dominante | Priorità ROI media | Pagine Target Suggerite |
|---------|:---------:|:----------------:|:-------------------:|:-----------------------:|
| ⚪ DOMANDE PONTE (Fiducia/Scelta + Rho locale) | 13 | Informazionale + Transazionale locale | ⭐⭐⭐ | Blog guide + Landing Rho |
| 🔴 E-COMMERCE | 10 | Commerciale + Transazionale | ⭐⭐⭐ | Landing + Blog + Servizio |
| 🔵 WEB AGENCY MILANO | 15 | Transazionale + Commerciale | ⭐⭐⭐ | Homepage + Landing + Blog |
| 🟠 SITI PER SETTORI | 17 | Transazionale | ⭐⭐-⭐⭐⭐ | Landing settoriali |
| 🟡 RESTYLING SITI | 10 | Commerciale + Transazionale | ⭐⭐⭐ | Servizio + Blog + Landing |
| 🟢 REALIZZAZIONE SITI WEB | 18 | Commerciale + Transazionale | ⭐⭐⭐ | Servizio + Blog + Landing |
| 🟣 SEO E VISIBILITÀ | 12 | Informazionale + Transazionale | ⭐⭐⭐ | Blog + Landing SEO |

### 2.2 Analisi per Intento di Ricerca

| Intento | # Keyword | % del totale | Stato copertura |
|---------|:---------:|:------------:|:---------------:|
| **Transazionale** | 28 | 33% | ⚠️ Bassa — poche landing dedicate |
| **Transazionale locale** | 10 | 12% | ❌ Zero — nessuna landing locale |
| **Commerciale** | 22 | 26% | ⚠️ Parziale — blog costi esistenti |
| **Informazionale** | 22 | 26% | ✅ Buona — blog copre molti temi |
| **Navigazionale** | 1 | 1% | ❌ Nessuna pagina Careers |
| **Comparativo** | 2 | 2% | ⚠️ Parziale — 1 articolo comparativo |

**Insight critico:** Il 45% delle keyword ha intento transazionale (diretto + locale) ma la struttura del sito è sbilanciata verso contenuti informativi. **Mancano landing page commerciali dedicate** che intercettino le query ad alto valore di conversione.

### 2.3 Opportunità di Espansione Semantica

**Cluster con maggiore potenziale non sfruttato:**

1. **🟠 SITI PER SETTORI** — 17 keyword tutte transazionali, nessuna pagina dedicata. Nicchie verticali (ristoranti, parrucchieri, avvocati, dentisti, palestre) con competizione bassa e alto intent d'acquisto. **Massima opportunità di espansione.**

2. **⚪ DOMANDE PONTE — Nicchia locale Rho** — 5 keyword transazionali locali ("web agency Rho", "siti web per attività a Rho") con **zero copertura**. Competizione bassissima, first mover advantage.

3. **🟣 SEO E VISIBILITÀ** — 12 keyword con mix SEO locale + generale. Nessuna pagina servizio SEO dedicata, solo blog informativi. Opportunità di creare un **servizio SEO esplicito** con landing page.

4. **🟡 RESTYLING SITI** — 10 keyword senza pagina servizio dedicata. Il blog `restyling-sito-web-quando-farlo.html` esiste ma non c'è una landing commerciale.

### 2.4 Keyword a Priorità Massima (Top 15 per ROI)

| # | Keyword | Intento | Cluster | Copertura Attuale | Azione |
|---|---------|:-------:|:-------:|:-----------------:|--------|
| 1 | web agency Milano | Trans. | 🔵 | ⚠️ Homepage generica | Landing dedicata |
| 2 | realizzazione siti web Milano | Trans. | 🟢 | ⚠️ Pagina servizio generica | Ottimizzare + landing |
| 3 | quanto costa un sito web professionale 2026 | Comm. | 🟢 | ✅ Blog esistente | Content refresh |
| 4 | sito web per ristorante | Trans. | 🟠 | ❌ Zero | Landing settoriale |
| 5 | sito web per parrucchiere | Trans. | 🟠 | ❌ Zero | Landing settoriale |
| 6 | web agency Rho | Trans. locale | ⚪ | ❌ Zero | Landing locale |
| 7 | e-commerce per piccole aziende | Trans. | 🔴 | ⚠️ Blog parziale | Landing + Blog |
| 8 | restyling sito web | Trans. | 🟡 | ⚠️ Solo blog info | Landing servizio |
| 9 | SEO locale per attività commerciali | Trans. | 🟣 | ❌ Zero | Landing servizio SEO |
| 10 | come scegliere una web agency | Info. | 🔵 | ✅ Blog esistente | Content refresh + CTA |
| 11 | posizionamento SEO Milano | Trans. | 🟣 | ❌ Zero | Landing SEO Milano |
| 12 | manutenzione sito web costi | Comm. | 🟡 | ❌ Zero | Blog + pagina piani |
| 13 | siti web per aziende | Trans. | 🟢 | ⚠️ Generico | Landing dedicata |
| 14 | rifare sito web Milano | Trans. | 🟡 | ❌ Zero | Landing restyling |
| 15 | agenzia web Rho | Trans. locale | 🔵 | ❌ Zero | Landing locale |

---

## 3. GAP ANALYSIS STRUTTURATA

### 3.1 Gap Contenutistici

| Gap | Severità | Keyword Non Presidiate | Azione |
|-----|:--------:|:----------------------:|--------|
| **Zero landing page settoriali** | 🔴 Critico | 17 keyword da cluster 🟠 | Creare 5-6 landing verticali |
| **Zero landing page locali** | 🔴 Critico | 10 keyword locali (Rho, Milano, Monza) | Creare 3 landing geo-targeted |
| **Nessun servizio SEO esplicito** | 🔴 Critico | 12 keyword da cluster 🟣 | Creare pagina servizio + landing |
| **Nessuna pagina restyling** | 🟡 Alto | 10 keyword da cluster 🟡 | Creare servizio + landing |
| **Nessuna pagina manutenzione/piani ricorrenti** | 🟡 Alto | 3 keyword commerciali | Creare pagina piani |
| **Blog senza struttura pillar-cluster** | 🟡 Alto | — | Ristrutturare linking |
| **Case study non in sitemap** | 🟡 Alto | — | Aggiungere a sitemap |
| **Zero content upgrade / lead magnet** | 🟡 Alto | — | Creare 5 lead magnet |
| **Blog non ha date "Ultimo aggiornamento"** | 🟡 Medio | — | Aggiungere a template |
| **Author byline assente** | 🟡 Medio | — | Aggiungere + Person schema |

### 3.2 Gap Tecnici

| Gap | Severità | Impatto | Azione |
|-----|:--------:|:-------:|--------|
| **body.style.opacity='0'** in main.js | 🔴 Critico | LCP +500ms | Rimuovere |
| **7 CSS + 5 JS separati** | 🟡 Alto | HTTP requests | Consolidare async CSS |
| **`<picture>` WebP mismatch** (logo PNG dichiarato WebP) | 🔴 Critico | Rendering errato | Fix template + rigenerare |
| **globe.js non minificato** | 🟡 Medio | Bundle size | Usare globe.min.js |
| **Duplicate scroll listeners** (7 in main.js) | 🟡 Medio | INP | Consolidare in rAF |
| **Google Fonts 3 famiglie (~150KB)** | 🟡 Medio | LCP | Ridurre a 2, self-host |
| **Cache busting versions disallineate** | 🟡 Medio | Stale CSS | Allineare v1.4 ovunque |
| **Cookie banner mancante su blog articles** | 🔴 Critico | GDPR | Fix template + rigenerare |
| **Newsletter form homepage → Web3Forms (non Brevo)** | 🟡 Alto | Subscriber persi | Integrare Brevo |
| **og:description ≠ meta description** | 🟡 Medio | Social sharing | Allineare |

### 3.3 Gap Off-Page e Authority

| Gap | Severità | Stato | Azione |
|-----|:--------:|:-----:|--------|
| **Google Business Profile** | 🔴 Critico | ⏳ In attesa dati fiscali | Priorità #1 quando disponibili |
| **Zero backlink** | 🔴 Critico | ❌ | Piano directory + guest post |
| **Solo Instagram come social** | 🟡 Alto | ❌ | LinkedIn, Facebook, GitHub, Behance |
| **Zero directory submissions** | 🟡 Alto | ❌ | Seguire Best-free-backlinks-platforms.MD |
| **Zero Google Alerts** | 🟢 Basso | ❌ | Setup 10 minuti |
| **Bing Webmaster Tools** | ⏳ | Registrato | Attendere elaborazione |
| **Bing Places** | ⏳ | Registrato | Attendere PIN postale |

### 3.4 Gap vs Competitor (da LLM Sniffing)

I 9 competitor identificati da ChatGPT (Web Agency Milano, Artwork, Webyblue, PMR Studio, etc.) hanno tutti:

| Fattore | Competitor | WebNovis | Gap |
|---------|:---------:|:--------:|:---:|
| Google Business Profile con Place ID | ✅ Tutti | ❌ | 🔴 |
| Presenza su Clutch/Sortlist | ✅ Maggioranza | ❌ | 🔴 |
| Blog attivo 50+ articoli | ✅ Maggioranza | ⚠️ 20 | 🟡 |
| Pagine servizio dedicate | ✅ Tutti | ✅ 6 | ✅ |
| Schema markup ricco | ⚠️ Pochi | ✅ | **Vantaggio** |
| AI-ready content | ❌ Quasi nessuno | ✅ | **Vantaggio forte** |
| Landing page locali | ✅ Alcuni | ❌ | 🟡 |

---

## 4. MAPPA CANNIBALIZZAZIONE E SOVRAPPOSIZIONI

### 4.1 Rischi di Cannibalizzazione Identificati

| Keyword | Pagine in Competizione | Rischio | Azione |
|---------|:---------------------:|:-------:|--------|
| "quanto costa un sito web" | `blog/quanto-costa-un-sito-web.html` + Homepage FAQ | 🟡 Medio | Differenziare: blog = guida dettagliata, FAQ = risposta breve. Link dal FAQ al blog |
| "quanto costa un ecommerce" | `blog/quanto-costa-un-ecommerce.html` + `servizi/ecommerce.html` FAQ | 🟡 Medio | Stessa strategia: FAQ rimanda al blog per approfondimento |
| "web agency Milano" | Homepage + potenziale landing dedicata | 🟡 Medio | Homepage = brand, landing = keyword-focused. Canonical su homepage se necessario |
| "come scegliere web agency" | `blog/come-scegliere-web-agency.html` + `chi-siamo.html` | 🟢 Basso | Intenti diversi: blog = guida, chi-siamo = proposta di valore |
| "brand identity" | `blog/brand-identity-guida-completa.html` + `servizi/graphic-design.html` | 🟢 Basso | Blog = informativo, servizio = transazionale |

### 4.2 Cannibalizzazione Potenziale nella Keyword Hierarchy

Nel file `seo_webnovis_hierarchy.json`, alcune keyword si sovrappongono tra cluster:

- **"agenzia web Rho"** appare sia in ⚪ DOMANDE PONTE che in 🔵 WEB AGENCY MILANO → **Consolidare in una sola landing**
- **"siti web per aziende"** nel cluster 🟢 si sovrappone con la homepage → **Differenziare: landing per PMI specifica**
- **"manutenzione sito web costi"** nel cluster 🟡 si sovrappone con la keyword "gestione sito web mensile" → **Una sola pagina con entrambe**

### 4.3 Strategia Anti-Cannibalizzazione

1. **Ogni keyword transazionale → una sola pagina target primaria**
2. **Keyword informative correlate → possono coesistere come cluster articles** con link alla pillar
3. **Link interni unidirezionali** dalla pagina secondaria alla primaria con anchor text della keyword target
4. **Canonical esplicito** solo se due pagine competono sulla stessa SERP

---

## 5. ARCHITETTURA TOPIC CLUSTER / PILLAR PAGES

### 5.1 Mappa Pillar-Cluster Proposta

```
PILLAR 1: /servizi/sviluppo-web.html (già esistente — espandere)
├── blog/quanto-costa-un-sito-web.html ✅
├── blog/errori-comuni-siti-web.html ✅
├── blog/wordpress-vs-codice-custom.html ✅
├── blog/sito-web-mobile-first.html ✅
├── blog/core-web-vitals-guida.html ✅
├── [NUOVO] blog/sviluppo-sito-web-da-zero.html
├── [NUOVO] blog/manutenzione-sito-web.html
└── [NUOVO] blog/sicurezza-sito-web-guida.html

PILLAR 2: /servizi/ecommerce.html (già esistente — espandere)
├── blog/quanto-costa-un-ecommerce.html ✅
├── blog/ecommerce-errori-da-evitare.html ✅
├── [NUOVO] blog/piattaforme-ecommerce-confronto.html
├── [NUOVO] blog/seo-ecommerce-guida.html
├── [NUOVO] blog/checkout-ottimizzazione.html
└── [NUOVO] blog/scheda-prodotto-perfetta.html

PILLAR 3: /servizi/graphic-design.html (già esistente)
├── blog/brand-identity-guida-completa.html ✅
├── blog/logo-design-processo-creativo.html ✅
├── blog/rebranding-aziendale-guida.html ✅
├── [NUOVO] blog/naming-aziendale-guida.html
├── [NUOVO] blog/guida-stile-brand.html
└── [NUOVO] blog/colori-brand-psicologia.html

PILLAR 4: /servizi/social-media.html (già esistente)
├── blog/social-media-strategy-2026.html ✅
├── blog/instagram-per-aziende.html ✅
├── blog/facebook-ads-guida-pratica.html ✅
├── blog/content-marketing-per-pmi.html ✅
├── [NUOVO] blog/linkedin-personal-branding.html
└── [NUOVO] blog/calendario-editoriale-social.html

PILLAR 5: blog/seo-per-piccole-imprese.html (già esistente — promuovere a pillar)
├── blog/google-analytics-4-guida.html ✅
├── [NUOVO] blog/seo-locale-google-maps.html
├── [NUOVO] blog/keyword-research-guida-2026.html
├── [NUOVO] blog/schema-markup-guida.html
├── [NUOVO] blog/featured-snippet-come-ottenere.html
├── [NUOVO] blog/google-search-console-guida.html
└── [NUOVO] blog/internal-linking-strategia.html

PILLAR 6: [NUOVA] /servizi/restyling.html
├── blog/restyling-sito-web-quando-farlo.html ✅
├── [NUOVO] blog/manutenzione-sito-web.html (condiviso con Pillar 1)
└── [NUOVO] blog/web-design-trends-2026.html
```

### 5.2 Landing Page Aggiuntive (Non-Blog)

```
LANDING LOCALI:
├── [NUOVA] /landing/web-agency-rho.html
├── [NUOVA] /landing/web-agency-milano.html
└── [NUOVA] /landing/web-agency-monza.html

LANDING SETTORIALI:
├── [NUOVA] /landing/siti-web-ristoranti.html
├── [NUOVA] /landing/siti-web-parrucchieri.html
├── [NUOVA] /landing/siti-web-professionisti.html
├── [NUOVA] /landing/siti-web-attivita-locali.html
└── [NUOVA] /landing/ecommerce-pmi.html

TOOL INTERATTIVI:
├── [NUOVO] /tools/calcolatore-costo-sito.html
└── [NUOVO] /tools/audit-seo-gratuito.html

SERVIZI AGGIUNTIVI:
├── [NUOVA] /servizi/seo.html
├── [NUOVA] /servizi/restyling.html
└── [NUOVA] /servizi/manutenzione.html
```

---

## 6. STRATEGIA FUNNEL TOFU–MOFU–BOFU

### 6.1 Mappatura Attuale del Funnel

| Stage | Contenuti Esistenti | % Coverage | Gap |
|:-----:|:-------------------:|:----------:|-----|
| **TOFU** (Awareness) | 8 articoli informativi (brand identity, social strategy, Instagram, mobile-first, etc.) | 40% | Mancano temi SEO, tech, design |
| **MOFU** (Consideration) | 7 articoli comparativi/guida (come scegliere web agency, wordpress vs custom, errori, etc.) | 35% | Mancano comparativi piattaforme, guide settoriali |
| **BOFU** (Decision) | 5 articoli/pagine commerciali (quanto costa sito, quanto costa ecommerce, landing efficace, etc.) | 25% | Mancano: calcolatore prezzi, case study con ROI, pagina prezzi |

### 6.2 Keyword Hierarchy Mappata al Funnel

**TOFU (22 keyword informazionali nel hierarchy):**
- "Cosa fa una web agency?" → Blog
- "Posso fare il sito da solo?" → Blog
- "Come creare un sito per il mio ristorante?" → Blog/Guida
- "Come farsi trovare su Google?" → Blog guida SEO

**MOFU (22 keyword commerciali):**
- "Come valutare il preventivo di un sito web?" → Blog guida preventivi
- "Conviene WooCommerce o Shopify?" → Blog comparativo
- "Quando conviene rifare il sito web?" → Blog segnali restyling
- "Quanto costa la SEO locale?" → Blog costi SEO

**BOFU (38 keyword transazionali + transazionali locali):**
- "web agency Milano" → Landing
- "realizzazione siti web Milano" → Pagina servizio
- "sito web per parrucchiere" → Landing settoriale
- "e-commerce per piccole aziende" → Landing PMI
- "web agency Rho" → Landing locale

### 6.3 Piano di Conversione per Stage

| Stage | CTA Primaria | Lead Magnet | Content Upgrade |
|:-----:|:------------:|:-----------:|:---------------:|
| **TOFU** | Newsletter signup | Guide PDF generali | Checklist settoriali |
| **MOFU** | Consulenza gratuita 15 min | Comparativi PDF, Template | Calcolatore costi |
| **BOFU** | Richiedi preventivo | Audit SEO gratuito | Case study dettagliato |

---

## 7. PIANO D'AZIONE OPERATIVO

### Fase 1 — Foundation (Settimana 1-2)

**Obiettivo:** Fix tecnici critici + base per authority building

| # | Task | File | Impatto | Effort |
|---|------|------|:-------:|:------:|
| 1.1 | Fix `body.style.opacity='0'` | `js/main.js` | CWV +15% | 15 min |
| 1.2 | Fix `<picture>` WebP mismatch (logo) | Template + tutti HTML | SEO/rendering | 1 ora |
| 1.3 | Cookie banner su blog articles | `blog/build-articles.js` + rigenerare | GDPR | 30 min |
| 1.4 | Allineare cache busting a v1.4 | Tutte le pagine HTML | Performance | 30 min |
| 1.5 | Usare `globe.min.js` | `index.html` | Performance | 5 min |
| 1.6 | Aggiungere 8 case study a sitemap | `sitemap.xml` | Indexing | 15 min |
| 1.7 | Allineare og:description con meta description | `index.html` | Social SEO | 10 min |
| 1.8 | Newsletter form homepage → Brevo | `index.html` | Lead capture | 1 ora |
| 1.9 | GBP → completare appena dati fiscali disponibili | Esterno | Local SEO +++| Variabile |
| 1.10 | Directory submissions Tier 1 (12 piattaforme) | Esterno | Authority | 4-5 ore |

### Fase 2 — Content Architecture (Settimana 3-4)

**Obiettivo:** Pillar-cluster + landing pages + content refresh

| # | Task | Output | Impatto | Effort |
|---|------|--------|:-------:|:------:|
| 2.1 | Implementare link bidirezionali pillar-cluster | 20 articoli aggiornati | Topical Authority +30% | 4-5 ore |
| 2.2 | Content refresh top 5 articoli (citation blocks, stats, date) | 5 articoli | Ranking +30-80% | 10-15 ore |
| 2.3 | Creare `/servizi/seo.html` | 1 nuova pagina | 12 keyword presidiate | 3-4 ore |
| 2.4 | Creare `/servizi/restyling.html` | 1 nuova pagina | 10 keyword presidiate | 3-4 ore |
| 2.5 | Creare `/landing/web-agency-rho.html` | 1 landing locale | Local SEO ++ | 2-3 ore |
| 2.6 | Creare `/landing/web-agency-milano.html` | 1 landing locale | Local SEO ++ | 2-3 ore |
| 2.7 | Author byline + Person schema su tutti gli articoli | Template + rigenerare | E-E-A-T ++ | 2-3 ore |
| 2.8 | FAQPage Schema espanso su landing locali | Nuove landing | AI Overviews | Incluso in 2.5/2.6 |
| 2.9 | CTA inline nei blog articles (2-3 per articolo) | 20 articoli | Conversioni +121% | 2-3 ore |
| 2.10 | Directory submissions Tier 2-3 (20+ piattaforme) | Esterno | Authority | 4-5 ore |

### Fase 3 — Scale (Settimana 5-8)

**Obiettivo:** Landing settoriali + tool + nuovi contenuti + lead magnet

| # | Task | Output | Impatto | Effort |
|---|------|--------|:-------:|:------:|
| 3.1 | Creare 3 landing settoriali (ristoranti, parrucchieri, professionisti) | 3 landing | 12+ keyword | 6-9 ore |
| 3.2 | Sviluppare Calcolatore Costo Sito su `/tools/` | 1 tool interattivo | BOFU keyword +++ | 1-2 giorni |
| 3.3 | Pubblicare 8-10 nuovi articoli (completamento cluster) | 8-10 articoli | Topical Authority | Auto-writer |
| 3.4 | Content refresh restanti 15 articoli | 15 articoli aggiornati | Ranking recovery | Batch |
| 3.5 | Creare primo lead magnet (Checklist SEO 2026 PDF) | 1 PDF + opt-in form | Lead gen +785% | 3-4 ore |
| 3.6 | Exit-intent popup con lead magnet | JS + CSS | Conversion +10-15% | 2-3 ore |
| 3.7 | Creare profili social (LinkedIn, Facebook, GitHub, Behance) | 4+ profili | Authority + sameAs | 3-4 ore |
| 3.8 | Google Alerts per brand mentions | Esterno | Link reclamation | 10 min |
| 3.9 | 2-3 landing settoriali aggiuntive (attività locali, e-commerce PMI) | 2-3 landing | Keyword expansion | 4-6 ore |

### Fase 4 — Optimize (Settimana 9-12)

**Obiettivo:** Analisi dati, ottimizzazione iterativa, authority building

| # | Task | Output | Impatto | Effort |
|---|------|--------|:-------:|:------:|
| 4.1 | Analizzare Bing Grounding Queries | Gap analysis AI | GEO optimization | 2-3 ore |
| 4.2 | Analizzare GSC → refresh mirato pagine pos. 4-20 | Ottimizzazioni targeted | Ranking ++ | Ongoing |
| 4.3 | LLM Source Sniffing round 2 (keyword commerciali) | Nuove grounding queries | AI visibility | 2-3 ore |
| 4.4 | Pubblicare 8-10 nuovi articoli | Pipeline continua | Content depth | Auto-writer |
| 4.5 | Guest post su 2-3 blog italiani (Connect.gt, Ninja Marketing) | 2-3 backlink DR 50+ | Authority +++ | 6-10 ore |
| 4.6 | Richiedere recensioni Google ai 5 clienti | 5 reviews | GBP + trust | 30 min |
| 4.7 | Creare 3-5 infografiche per link building passiva | Asset visivi | Backlink potenziali | Ongoing |
| 4.8 | A/B test oggetti newsletter | Ottimizzazione open rate | Engagement | Ongoing |
| 4.9 | Secondo lead magnet (Template Design Brief) | 1 PDF + opt-in | Lead gen | 2-3 ore |

---

## 8. TASK LIST PRIORITIZZATA

### Priorità ALTA — Impatto immediato, blocco critico

| # | Task | Impatto Stimato | Complessità | Orizzonte |
|---|------|:---------------:|:-----------:|:---------:|
| A1 | **GBP appena dati fiscali disponibili** | Entity visibility +++ per AI | Bassa | Immediato |
| A2 | **Fix tecnici CWV** (body opacity, WebP mismatch, globe.min) | LCP -500ms, rendering fix | Bassa | 1 giorno |
| A3 | **Cookie banner su blog** + rigenerare | GDPR compliance | Bassa | 30 min |
| A4 | **Directory Tier 1** (GBP, PagineGialle, Clutch, Sortlist, LinkedIn, Facebook) | 10+ citazioni, authority base | Media | 1 settimana |
| A5 | **Architettura pillar-cluster** + link bidirezionali | Topical authority +30% | Media | 1 settimana |
| A6 | **Content refresh top 5 articoli** | Ranking +30-80% su articoli refreshed | Media | 2 settimane |
| A7 | **Creare /servizi/seo.html** con FAQPage Schema | 12 keyword coperte, servizio esplicito | Media | 3-4 ore |
| A8 | **Landing page Rho + Milano** | Local SEO first mover, keyword locali | Media | 1 settimana |

### Priorità MEDIA — Alto impatto, effort moderato

| # | Task | Impatto Stimato | Complessità | Orizzonte |
|---|------|:---------------:|:-----------:|:---------:|
| M1 | **3 landing settoriali** (ristoranti, parrucchieri, professionisti) | 12+ keyword transazionali | Media | 2 settimane |
| M2 | **Calcolatore Costo Sito** su /tools/ | BOFU keyword + link bait | Alta | 1-2 giorni dev |
| M3 | **Author byline + Person schema** | E-E-A-T +++ | Bassa | 2-3 ore |
| M4 | **CTA inline + content upgrade** in articoli | Conversioni +121% | Bassa | 2-3 ore |
| M5 | **Lead magnet #1** (Checklist SEO PDF) | Lead gen +785% | Media | 3-4 ore |
| M6 | **Newsletter form → Brevo** | Subscriber non persi | Bassa | 1 ora |
| M7 | **/servizi/restyling.html** + manutenzione | 10+ keyword coperte | Media | 3-4 ore |
| M8 | **Exit-intent popup** | Recovery visitatori +10-15% | Bassa | 2-3 ore |
| M9 | **8 case study in sitemap** | Indexing pagine orfane | Bassa | 15 min |
| M10 | **Profili social** (LinkedIn, Facebook, GitHub, Behance) | Authority + sameAs | Bassa | 3-4 ore |

### Priorità BASSA — Impatto a lungo termine

| # | Task | Impatto Stimato | Complessità | Orizzonte |
|---|------|:---------------:|:-----------:|:---------:|
| B1 | **Guest post** su blog italiani | Backlink DR 50+ | Alta | Mese 2+ |
| B2 | **Infografiche** per link building passiva | Backlink naturali | Media | Ongoing |
| B3 | **Consolidare CSS async** in bundle singolo | Performance minor | Media | 2-3 ore |
| B4 | **Consolidare scroll listeners** in main.js | INP improvement | Media | 2-3 ore |
| B5 | **Self-host Google Fonts** | Privacy + performance | Bassa | 1-2 ore |
| B6 | **Schema Person per fondatori** dettagliato | E-E-A-T long term | Bassa | 2-3 ore |
| B7 | **WordPress.org plugin** per developer EEAT | Authority signal DA 95 | Alta | Mese 3+ |
| B8 | **Landing Monza/Brianza** | Espansione geo | Media | Mese 2 |
| B9 | **Podcast italiano web design** (nicchia vuota) | Brand authority | Alta | Mese 3+ |
| B10 | **Scholarship link building** (.edu backlink) | Authority DA 90+ | Alta | Mese 3+ |

---

## 9. PROPOSTE NUOVE PAGINE / ARTICOLI / SEZIONI

### 9.1 Nuove Pagine Servizio (3)

| Pagina | Keyword Target Primaria | Keyword Secondarie | Priorità |
|--------|:-----------------------:|:------------------:|:--------:|
| `/servizi/seo.html` | posizionamento SEO Milano | agenzia SEO, SEO locale, consulente SEO | 🔴 Alta |
| `/servizi/restyling.html` | restyling sito web | rifare sito web, restyling WordPress | 🔴 Alta |
| `/servizi/manutenzione.html` | manutenzione sito web costi | gestione sito web mensile, assistenza WordPress | 🟡 Media |

### 9.2 Landing Page Locali (3-4)

| Pagina | Keyword Target | Volume Stimato | Competizione |
|--------|:-------------:|:--------------:|:------------:|
| `/landing/web-agency-rho.html` | web agency Rho, siti web Rho | ~50-100/mese | Bassissima |
| `/landing/web-agency-milano.html` | web agency Milano, agenzia web Milano | ~2.400/mese | Alta |
| `/landing/web-agency-monza.html` | web agency Monza | ~200/mese | Media |
| `/landing/seo-locale-rho-milano.html` | SEO locale Milano, SEO per negozi Rho | ~300/mese | Media |

### 9.3 Landing Page Settoriali (5-6)

| Pagina | Keyword Target | Settori PAA Correlate | Volume Stimato |
|--------|:-------------:|:--------------------:|:--------------:|
| `/landing/siti-web-ristoranti.html` | sito web per ristorante | menù digitale, prenotazione online | ~500/mese |
| `/landing/siti-web-parrucchieri.html` | sito web per parrucchiere | prenotazione appuntamenti, centri estetici | ~400/mese |
| `/landing/siti-web-professionisti.html` | sito web per avvocati/commercialisti/dentisti | studi professionali | ~600/mese |
| `/landing/siti-web-attivita-locali.html` | sito web per negozio, palestra, impresa edile | attività locali | ~400/mese |
| `/landing/ecommerce-pmi.html` | e-commerce per piccole aziende | negozio online costi | ~480/mese |

### 9.4 Tool Interattivi (2)

| Tool | Keyword Target | Volume | Effort |
|------|:-------------:|:------:|:------:|
| `/tools/calcolatore-costo-sito.html` | quanto costa un sito web | ~1.000/mese | 1-2 giorni |
| `/tools/audit-seo-gratuito.html` | audit SEO gratuito | ~720/mese | 2-3 giorni |

### 9.5 Nuovi Articoli Blog — Top 20 (dalla topics-queue + keyword hierarchy)

| # | Slug | Keyword | Cluster | Funnel | Pillar |
|---|------|---------|:-------:|:------:|:------:|
| 1 | `seo-locale-google-maps` | SEO locale Google Maps | 🟣 | TOFU | Pillar 5 |
| 2 | `keyword-research-guida-2026` | keyword research guida | 🟣 | TOFU | Pillar 5 |
| 3 | `schema-markup-guida` | schema markup | 🟣 | MOFU | Pillar 5 |
| 4 | `piattaforme-ecommerce-confronto` | piattaforme ecommerce | 🔴 | MOFU | Pillar 2 |
| 5 | `seo-ecommerce-guida` | SEO ecommerce | 🔴 | MOFU | Pillar 2 |
| 6 | `manutenzione-sito-web` | manutenzione sito web | 🟡 | MOFU | Pillar 1/6 |
| 7 | `naming-aziendale-guida` | naming aziendale | 🟢 | TOFU | Pillar 3 |
| 8 | `sviluppo-sito-web-da-zero` | sviluppo sito web da zero | 🟢 | TOFU | Pillar 1 |
| 9 | `featured-snippet-come-ottenere` | featured snippet | 🟣 | MOFU | Pillar 5 |
| 10 | `google-search-console-guida` | Google Search Console | 🟣 | TOFU | Pillar 5 |
| 11 | `internal-linking-strategia` | internal linking strategia | 🟣 | MOFU | Pillar 5 |
| 12 | `web-design-trends-2026` | web design trends 2026 | 🟢 | TOFU | Pillar 6 |
| 13 | `ottimizzazione-tasso-conversione` | CRO strategia | — | MOFU | Trasversale |
| 14 | `lead-magnet-guida` | lead magnet | — | MOFU | Trasversale |
| 15 | `velocita-sito-web-guida` | velocizzare sito web | — | TOFU | Pillar 1 |
| 16 | `linkedin-personal-branding` | LinkedIn personal branding | — | TOFU | Pillar 4 |
| 17 | `checkout-ottimizzazione` | ottimizzazione checkout | 🔴 | MOFU | Pillar 2 |
| 18 | `call-to-action-efficaci` | CTA efficaci | — | MOFU | Trasversale |
| 19 | `colori-brand-psicologia` | psicologia colori branding | — | TOFU | Pillar 3 |
| 20 | `guida-stile-brand` | guida stile brand | — | MOFU | Pillar 3 |

---

## 10. MIGLIORAMENTI TECNICI SEO

### 10.1 Performance / Core Web Vitals

| Intervento | Impatto su CWV | Effort | File |
|-----------|:--------------:|:------:|------|
| Rimuovere `body.style.opacity='0'` | LCP -500ms | 15 min | `js/main.js` |
| Usare `globe.min.js` | Bundle -20KB | 5 min | `index.html` |
| Consolidare CSS async (6 file → 1) | HTTP req -5 | 2-3 ore | Build system |
| Consolidare 7 scroll listeners → 1 rAF | INP -50ms | 2-3 ore | `js/main.js` |
| Rimuovere ripple su ogni click | INP -20ms, DOM churn | 30 min | `js/main.js` |
| Ridurre Google Fonts a 2 famiglie | LCP -100ms | 1 ora | Tutti HTML |
| Self-host Google Fonts | Privacy + TTFB -50ms | 1-2 ore | Font + CSS |
| `<canvas>` hidden → rimuovere o mostrare | CPU waste | 15 min | `index.html` |

### 10.2 Struttura e Linking

| Intervento | Impatto | File |
|-----------|:-------:|------|
| Link bidirezionali pillar ↔ cluster (20 articoli) | Topical authority +30% | Blog articles |
| Link contestuali blog → servizi (1-2 per articolo) | Conversioni + PageRank | Blog articles |
| Breadcrumb con BreadcrumbList schema su tutte le pagine | CTR +30% desktop | Tutti HTML |
| `<nav>` fuori da `<main>` | Accessibilità + SEO semantico | `index.html` |
| Aggiornare sitemap con 8 case study + nuove pagine | Indexing | `sitemap.xml` |
| Data "Ultimo aggiornamento" visibile su articoli | E-E-A-T + freshness | Template blog |

### 10.3 Schema Markup

| Intervento | Impatto | File |
|-----------|:-------:|------|
| Person schema per autori con knowsAbout | E-E-A-T per AI | Template blog |
| FAQPage su landing settoriali (5-8 FAQ ciascuna) | Rich snippets + AI Overviews | Nuove landing |
| HowTo schema su guide procedurali | Rich snippets | Blog selezionati |
| SearchAction sul WebSite schema | Sitelink search box | `index.html` |
| AggregateRating su pagine servizio | Stelle in SERP | Pagine servizio |

### 10.4 Indexing e Crawling

| Intervento | Impatto | File |
|-----------|:-------:|------|
| IndexNow submit dopo ogni nuovo contenuto | Indexing istantaneo | Già implementato ✅ |
| Aggiungere `meta robots` a portfolio detail pages | Crawling coerente | 6 portfolio HTML |
| Fix sitemap image extensions (.webp non .png) | Image SEO | `sitemap.xml` |
| Verificare GSC attivo e monitorare | Baseline dati | Esterno |
| Bing Webmaster Tools → analizzare grounding queries | GEO optimization | Esterno |

---

## 11. OTTIMIZZAZIONI CONTENUTO E SEMANTICA

### 11.1 Content Refresh Protocol (per ciascuno dei 20 articoli)

Per ogni articolo applicare la seguente checklist:

1. **Citation block** — Risposta diretta 40-60 parole sotto ogni H2 (per AI extraction)
2. **Statistiche** — Almeno 1 statistica con fonte ogni 150-200 parole
3. **Data visibile** — "Ultimo aggiornamento: [data]" in alto
4. **Author byline** — Nome + credenziali + link profilo
5. **2-3 CTA inline** — Contestuali al contenuto, verso servizi correlati
6. **Internal links** — 3-5 link ad altri articoli del cluster + 1-2 link a pagina servizio
7. **FAQ expand** — Aggiungere 3-5 FAQ con FAQPage schema a fine articolo
8. **Content upgrade** — Specifica per l'articolo (PDF, checklist, template)
9. **Source references** — Citazioni a fonti .edu, .gov, studi di settore
10. **Related articles** — 3 articoli correlati a fine pagina

### 11.2 SEO Semantico — Entità e Relazioni

| Entità | Stato | Azione |
|--------|:-----:|--------|
| WebNovis (Organization) | ✅ JSON-LD | Aggiungere `foundingDate`, `founder` dettagliato |
| Fondatori (Person) | ❌ | Creare schema Person con `knowsAbout`, `sameAs` LinkedIn |
| Servizi (Offer/Service) | ✅ | Espandere con `priceRange`, `areaServed` specifici |
| Clienti (Review) | ✅ 5 reviews | Espandere con `author` → Person schema |
| Articoli (Article) | ✅ BlogPosting | Aggiungere `author` → Person, `citation`, `mentions` |

### 11.3 Contenuti per AI Overviews

| Formato | Impatto su AI Citation | Priorità |
|---------|:---------------------:|:--------:|
| Tabelle HTML con dati comparativi | 4,1x citazioni | 🔴 Alta |
| Definizioni 40-60 parole sotto heading | Extraction diretta | 🔴 Alta |
| Liste puntate strutturate | 2,5x citazioni | 🟡 Media |
| Statistiche con fonte | +40% visibilità | 🔴 Alta |
| Citazioni di esperti con attribuzione | +35% citazioni | 🟡 Media |
| Q&A format con FAQPage schema | 3,4x su Perplexity | 🔴 Alta |

---

## 12. ROADMAP EVOLUTIVA 3–6 MESI

### Mese 1 (Febbraio-Marzo 2026) — FOUNDATION

```
Settimana 1-2:
✦ Fix tecnici CWV (body opacity, WebP, globe.min, cache versions)
✦ Cookie banner su blog articles + rigenerare
✦ Directory Tier 1 (12 piattaforme)
✦ Definire mappa pillar-cluster
✦ Newsletter form → Brevo
✦ 8 case study in sitemap
✦ GBP (appena possibile)

Settimana 3-4:
✦ Implementare link bidirezionali pillar-cluster (20 articoli)
✦ Content refresh top 5 articoli
✦ Creare /servizi/seo.html
✦ Creare /servizi/restyling.html
✦ Landing page Rho + Milano
✦ Author byline + Person schema
✦ CTA inline in tutti gli articoli
✦ Directory Tier 2-3

KPI Target fine Mese 1:
- Impressioni GSC: baseline stabilita
- Pagine indicizzabili: 55+ (da 48)
- Citazioni/directory: 15+
- FAQPage Schema: 10+ pagine
```

### Mese 2 (Marzo-Aprile 2026) — SCALE

```
Settimana 5-6:
✦ 3 landing settoriali (ristoranti, parrucchieri, professionisti)
✦ Calcolatore Costo Sito su /tools/
✦ Content refresh restanti 15 articoli
✦ Lead magnet #1 (Checklist SEO PDF)
✦ Profili social (LinkedIn, Facebook, GitHub, Behance)

Settimana 7-8:
✦ 8-10 nuovi articoli (via auto-writer, completamento cluster)
✦ Exit-intent popup con lead magnet
✦ 2 landing settoriali aggiuntive
✦ Landing Monza/Brianza
✦ Google Alerts per brand mentions
✦ /servizi/manutenzione.html

KPI Target fine Mese 2:
- Impressioni GSC settimanali: +50% dalla baseline
- Pagine indicizzabili: 70+
- Articoli blog: 28-30
- Backlink domini unici: 10-15
- Email subscriber: 50+
```

### Mese 3 (Aprile-Maggio 2026) — OPTIMIZE

```
Settimana 9-10:
✦ Analizzare Bing Grounding Queries
✦ GSC analysis → refresh mirato pagine pos. 4-20
✦ LLM Source Sniffing round 2
✦ Guest post #1 (Connect.gt o Ninja Marketing)
✦ Lead magnet #2 (Template Design Brief)

Settimana 11-12:
✦ 8-10 nuovi articoli
✦ Richiedere recensioni Google (5 clienti)
✦ Guest post #2
✦ Tool #2: Mini audit SEO gratuito
✦ A/B test oggetti newsletter
✦ 3-5 infografiche per link building

KPI Target fine Mese 3:
- Impressioni GSC settimanali: +100% dalla baseline
- Articoli blog: 38-40
- Pagine con FAQPage: 15+
- Backlink domini unici: 20-30
- Email subscriber: 100+
- GBP reviews: 5+
```

### Mesi 4-6 (Maggio-Agosto 2026) — DOMINATE

```
Focus continuo su:
✦ 2 nuovi articoli/settimana (auto-writer + editorial)
✦ Content refresh trimestrale su articoli trending
✦ 1-2 guest post/mese
✦ Espansione landing settoriali (5 nuove nicchie)
✦ WordPress.org plugin per developer EEAT
✦ Podcast italiano web design (nicchia vuota)
✦ Scholarship link building (.edu)
✦ Calcolatore Costo E-commerce
✦ Espansione landing locali (Bergamo, Varese, Como)

KPI Target fine Mese 6:
- SEO Score complessivo: 78-85/100
- Impressioni GSC settimanali: +200% dalla baseline
- Articoli blog: 55-60
- Pagine totali indicizzabili: 100+
- Backlink domini unici: 40-60
- Email subscriber: 300+
- GBP reviews: 10+
- Citazioni AI (Perplexity, ChatGPT): misurabile
- Lead qualificati/mese: 20+
```

---

## APPENDICE A — MATRICE IMPATTO × SFORZO

```
              ALTO IMPATTO
                  │
    ┌─────────────┼─────────────┐
    │  QUICK WINS  │  BIG BETS    │
    │             │              │
    │ • Fix CWV   │ • Calcolatore│
    │ • Cookie    │ • Landing    │
    │   banner    │   settoriali │
    │ • Directory │ • Guest post │
    │   Tier 1    │ • WP plugin  │
    │ • Sitemap   │ • Podcast    │
    │   fix       │              │
POCO├─────────────┼──────────────┤MOLTO
EFFORT│ FILL-INS   │  MONEY PITS  │EFFORT
    │             │              │
    │ • Cache     │ • Self-host  │
    │   versions  │   fonts      │
    │ • og:desc   │ • CSS merge  │
    │ • Google    │ • Scroll     │
    │   Alerts    │   consolidate│
    │             │              │
    └─────────────┼─────────────┘
                  │
              BASSO IMPATTO
```

## APPENDICE B — FILE DOCUMENTALI RIORGANIZZATI

Tutti i documenti SEO/performance/indicizzazione sono stati spostati in `docs/seo-strategy/`:

| File Originale (root) | Nuova Posizione |
|----------------------|-----------------|
| `REPORT-SEO-AVANZATO-2026.md` | `docs/seo-strategy/REPORT-SEO-AVANZATO-2026.md` |
| `SEO-AUDIT.md` | `docs/seo-strategy/SEO-AUDIT.md` |
| `SEO-GEO.MD` | `docs/seo-strategy/SEO-GEO.MD` |
| `tecniche-SEO-avanzate.txt` | `docs/seo-strategy/tecniche-SEO-avanzate.txt` |
| `Best-free-backlinks-platforms.MD` | `docs/seo-strategy/Best-free-backlinks-platforms.MD` |
| `WEBSITE-AUDIT-REPORT.md` | `docs/seo-strategy/WEBSITE-AUDIT-REPORT.md` |
| `DIRECTORY-LISTINGS.md` | `docs/seo-strategy/DIRECTORY-LISTINGS.md` |
| `seo_webnovis_hierarchy.json` | `docs/seo-strategy/seo_webnovis_hierarchy.json` |
| **(NUOVO)** | `docs/seo-strategy/PIANO-STRATEGICO-SEO-2026.md` |
| **(NUOVO)** | `docs/seo-strategy/README.md` |

Riferimenti interni tra documenti aggiornati. `robots.txt` aggiornato con `Disallow: /docs/`.

---

## APPENDICE C — LOG IMPLEMENTAZIONE (17/02/2026)

### ✅ Completati in questa sessione

| # | Task | File Modificati | Stato |
|---|------|----------------|:-----:|
| 1 | **Riorganizzazione 8 file SEO** in `docs/seo-strategy/` | 8 file spostati + README.md creato | ✅ |
| 2 | **Cross-reference aggiornati** tra documenti spostati | `REPORT-SEO-AVANZATO-2026.md`, `WEBSITE-AUDIT-REPORT.md` | ✅ |
| 3 | **`robots.txt`** — Aggiunto `Disallow: /docs/` | `robots.txt` | ✅ |
| 4 | **`<nav>` fuori da `<main>`** — Fix semantica HTML5 | `index.html` (nav ora sibling di main) | ✅ |
| 5 | **11 case study aggiunti a sitemap** | `sitemap.xml` (+11 URL portfolio/case-study/) | ✅ |
| 6 | **Cache busting allineato** — social-feed-modern v1.3→v1.4 | `portfolio.html` | ✅ |
| 7 | **Blog template refresh date** aggiornata a 17/02/2026 | `blog/build-articles.js` | ✅ |
| 8 | **`node build.js`** — Rigenerati 14 file minificati (134KB risparmiati) | js/*.min.js, css/*.min.css | ✅ |
| 9 | **`node blog/build-articles.js`** — Rigenerati 18 articoli blog | blog/*.html | ✅ |
| 10 | **Piano strategico SEO creato** — 12 sezioni, 41KB | `PIANO-STRATEGICO-SEO-2026.md` | ✅ |
| 11 | **Analisi `seo_webnovis_hierarchy.json`** — 7 cluster, 85 keyword mappate | Integrato nel piano | ✅ |
| 12 | **Reference blog Nicole Curioni** aggiunto | `docs/seo-strategy/reference-blog.MD` | ✅ |

### ✅ Verificati come già implementati (sessioni precedenti)

| Task | Stato Verificato |
|------|:----------------:|
| `body.style.opacity='0'` rimosso (ora usa CSS `.page-loaded`) | ✅ già fixato |
| Ripple effect scopato a `.btn` only | ✅ già fixato |
| `globe.min.js` usato (non `globe.js`) | ✅ già corretto |
| `og:description` allineata con `meta description` | ✅ già allineata |
| `meta robots` su portfolio detail pages | ✅ già presente |
| `meta robots` su case study pages | ✅ già presente |
| Duplicate `highlightNav` scroll listener rimosso | ✅ già fixato |
| Cookie banner su portfolio detail pages | ✅ già presente |
| GA4 consent gating su portfolio detail pages | ✅ già presente |
| `particlesCanvas display:none` rimosso | ✅ canvas rimosso da index.html |
| `<picture>` logo WebP mismatch in blog template | ✅ template usa `<img>` diretto |

### 📋 Prossime azioni prioritarie (non implementabili senza intervento manuale/esterno)

| # | Task | Blocco |
|---|------|--------|
| 1 | **Google Business Profile** | In attesa dati fiscali |
| 2 | **Directory submissions Tier 1** (12 piattaforme) | Richiede registrazione manuale |
| 3 | **Creare `/servizi/seo.html`** | Richiede contenuto + design |
| 4 | **Creare `/servizi/restyling.html`** | Richiede contenuto + design |
| 5 | **Landing page Rho + Milano** | Richiede contenuto + design |
| 6 | **Content refresh top 5 articoli** | Richiede revisione editoriale |
| 7 | **Architettura pillar-cluster** — link bidirezionali | Richiede mappatura manuale contenuti |
| 8 | **Profili social** (LinkedIn, Facebook, GitHub, Behance) | Richiede registrazione manuale |

---

## APPENDICE D — LOG IMPLEMENTAZIONE (18/02/2026) — Toolkit SEO Completo

### Analisi eseguita

Audit completo del file `docs/seo-strategy/toolkit-seo.MD` confrontato con lo stato attuale del progetto. Identificate e implementate tutte le azioni tecniche fattibili senza intervento manuale esterno.

### ✅ Implementazioni completate

| # | Task | File Modificati | Impatto |
|---|------|----------------|:-------:|
| 1 | **Microsoft Clarity** — Heatmap & session recording su TUTTE le 30 pagine HTML | Tutti i file .html (esclusi blog/ e newsletter-template) | Analytics comportamentale completa |
| 2 | **Clarity Consent API** — Integrazione con cookie banner esistente (consent-gated per EEA) | `js/main.js` → enableAnalyticsTracking/disableAnalyticsTracking | GDPR compliance |
| 3 | **robots.txt AI bots** — Aggiunti 6 bot mancanti: Perplexity-User, anthropic-ai, Applebot-Extended, Amazonbot, DuckAssistBot, meta-externalagent | `robots.txt` | 12 AI bot totali (da 6) |
| 4 | **llms.txt** — File creato da zero con struttura completa (servizi, portfolio, case study, blog, contatti, prezzi, dati strutturati) | `llms.txt` (nuovo) | AI comprehension +++ |
| 5 | **WebSite SearchAction** — Aggiunto potentialAction/SearchAction con EntryPoint al JSON-LD WebSite | `index.html` | Sitelink search box eligibility |
| 6 | **Consent Mode v2 completo** — Aggiunti `ad_storage`, `ad_user_data`, `ad_personalization` defaults su tutte le 30 pagine | Tutti i file .html | Full CM v2 compliance (obbligatorio dal marzo 2024) |
| 7 | **Open Graph potenziato** — Aggiunti `og:site_name` ("Web Novis") e `og:locale` ("it_IT") su 25 pagine | 25 file .html | Social sharing ottimizzato |
| 8 | **Privacy Policy aggiornata** — Microsoft Clarity come data processor + finalità analisi comportamentale + base giuridica | `privacy-policy.html` | GDPR compliance |
| 9 | **Cookie Policy aggiornata** — Sezione 3.2 completa con 6 cookie Clarity documentati (_clck, _clsk, CLID, ANONCHK, MR, SM), MIOL/SCCs, DPF, opt-out | `cookie-policy.html` | GDPR compliance |
| 10 | **llms.txt servito** — Aggiunto a server.js publicFiles + robots.txt Allow | `server.js`, `robots.txt` | Accessibilità AI |
| 11 | **Build rigenerata** — 14 file minificati (141KB risparmiati) | `js/*.min.js`, `css/*.min.css` | Performance |

### Aggiornamento Scorecard

| Area | Score Precedente | Score Aggiornato | Variazione |
|------|:----------------:|:----------------:|:----------:|
| **AI Search Readiness** | 8/10 | **9.5/10** | ↗ +1.5 — llms.txt + 12 AI bot + SearchAction |
| **Crawlability & Indexing** | 7/10 | **8/10** | ↗ +1 — llms.txt + robots.txt completo |
| **On-Page SEO** | 7/10 | **8/10** | ↗ +1 — og:site_name, og:locale, Consent Mode v2 |
| **Analytics & Monitoring** | (non misurato) | **9/10** | ↗ — GA4 + Clarity + IndexNow |
| **SEO SCORE COMPLESSIVO** | 49/100 | **~54/100** | ↗ +5 punti |

### Stato attuale vs Toolkit SEO (sintesi)

| Raccomandazione Toolkit | Stato |
|------------------------|:-----:|
| Schema markup JSON-LD (6 tipi) | ✅ Completo + SearchAction aggiunto |
| Canonical tags auto-referenzianti | ✅ Completo |
| Sitemap XML con lastmod + image | ✅ Completo |
| Open Graph + Twitter Cards | ✅ Completo + og:site_name/locale |
| robots.txt AI-permissive (12 bot) | ✅ Completo |
| llms.txt per AI comprehension | ✅ Nuovo — implementato |
| Microsoft Clarity (heatmap + recordings) | ✅ Nuovo — implementato su 30 pagine |
| GA4 con Consent Mode v2 | ✅ Completo — tutti i 4 default impostati |
| IndexNow protocol | ✅ Già implementato |
| ai.txt v3.0 + webnovis-ai-data.json | ✅ Già implementato |
| Cookie consent banner | ✅ Già implementato |
| Newsletter/Brevo | ✅ Già implementato |
| Contatori animati homepage | ✅ Già implementato |
| Privacy + Cookie Policy aggiornate | ✅ Aggiornate per Clarity |

### 📋 Raccomandazioni toolkit NON ancora implementate (richiedono intervento manuale/budget)

| # | Raccomandazione | Tipo | Stima Effort | Note |
|---|----------------|:----:|:------------:|------|
| 1 | **iubenda** (€4.99/mese) — CMP professionale per Consent Mode v2 | Servizio a pagamento | Setup 1 ora | Sostituirebbe cookie banner custom |
| 2 | **Tawk.to** — Live chat gratuita | Widget esterno | Setup 15 min | Snippet JS prima di `</body>` |
| 3 | **Botpress** — Chatbot AI per risposte automatiche | Widget esterno | Setup 2-3 ore | Alternativa a chat custom esistente |
| 4 | **Senja** — Widget testimonianze | Widget esterno | Setup 30 min | Import da Google, WhatsApp |
| 5 | **Poptin** — Popup exit-intent | Widget esterno | Setup 30 min | 1.000 visitatori/mese free |
| 6 | **SEOptimer** ($59/mese) — Audit SEO embeddabile | Servizio a pagamento | Setup 1 ora | Lead gen con gating email |
| 7 | **Calcolatore preventivo** custom | Sviluppo | 1-2 giorni | HTML/CSS/JS multi-step |
| 8 | **lite-youtube-embed** per video | Libreria | 30 min | Se video vengono aggiunti |
| 9 | **Bing Webmaster Tools** — AI Performance Dashboard | Configurazione esterna | 10 min | Importare da GSC |
| 10 | **Google Looker Studio** — Dashboard SEO custom | Configurazione esterna | 2-3 ore | Template gratuiti disponibili |
| 11 | **Directory submissions** — 15-20 directory di qualità | Registrazione manuale | 4-5 ore | Vedi DIRECTORY-LISTINGS.md |
| 12 | **Clutch/DesignRush/GoodFirms** — Profili agenzia | Registrazione manuale | 2-3 ore | Badge + backlink dofollow |
| 13 | **Brevo form embed** su tutte le pagine | Integrazione | 1-2 ore | Attualmente newsletter via Web3Forms |

---

## APPENDICE E — ALLINEAMENTO NAP / BRAND CONSISTENCY (18/02/2026)

### Bug critici risolti

| # | Problema | Gravità | Fix |
|---|----------|:-------:|-----|
| 1 | **DUE numeri di telefono diversi** nel sito: `+393792042131` (JSON-LD, tel:, WhatsApp) vs `+393802647367` (ai.txt, testo visibile) | 🔴 CRITICO | Sostituito ovunque con numero GBP corretto: `+393802647367` |
| 2 | **Indirizzo incompleto**: `streetAddress: "Rho"` senza via/civico | 🔴 CRITICO | Aggiornato a `"Via S. Giorgio, 2"` in tutti i JSON-LD |
| 3 | **Orari errati**: Lun-Ven 09:00-18:00 nel JSON-LD e contatti.html | 🟡 ALTO | Aggiornato a 24/7 come da GBP |
| 4 | **Link WhatsApp** puntava al numero sbagliato | 🔴 CRITICO | Corretto a `wa.me/393802647367` |
| 5 | **Google Maps embed** generico (tutta Rho) | 🟡 MEDIO | Aggiornato per Via S. Giorgio, 2 |
| 6 | **sameAs** solo Instagram | 🟡 MEDIO | Aggiunti 7 profili directory attivi |
| 7 | **chat-config.json** diceva "non ha telefono pubblico" | 🟡 MEDIO | Aggiornato con telefono, WhatsApp, indirizzo |
| 8 | **Coordinate geo** generiche per Rho | 🟡 BASSO | Aggiornate per indirizzo specifico |

### Scheda Brand Ufficiale (Master Reference)

Questi dati DEVONO essere **identici** su tutte le piattaforme (GBP, directory, sito, schema):

```
NOME ATTIVITÀ:      Web Novis
NOME ALTERNATIVO:   WebNovis
CATEGORIA GBP:      Web designer
INDIRIZZO:          Via S. Giorgio, 2, 20017 Rho MI
CAP:                20017
CITTÀ:              Rho
PROVINCIA:          MI
NAZIONE:            Italia (IT)
TELEFONO:           +39 380 264 7367
WHATSAPP:           https://wa.me/393802647367
EMAIL:              hello@webnovis.com
SITO WEB:           https://www.webnovis.com
INSTAGRAM:          https://www.instagram.com/web.novis
ORARI:              Aperto 24/7
ANNO FONDAZIONE:    2024
SLOGAN:             Accendi la scintilla che illumina la tua visibilità
MOTTO:              Porta alla luce la tua attività
RANGE PREZZO:       €€
PAGAMENTI:          Bonifico bancario, PayPal, Carta di credito
VALUTA:             EUR
LINGUE:             Italiano, Inglese
```

### Directory attive (profili pubblici)

| Directory | URL Profilo | Stato |
|-----------|------------|:-----:|
| Google Business Profile | Web Novis — Rho (MI) | ✅ Attivo |
| Instagram | instagram.com/web.novis | ✅ Attivo |
| Clutch.co | clutch.co/profile/web-novis | ✅ Attivo |
| Trustpilot | it.trustpilot.com/review/webnovis.com | ✅ Attivo |
| Hotfrog | hotfrog.it/.../web-novis/rho/web-design | ✅ Attivo |
| Cylex | cylex-italia.it/rho/web-novis-16332263 | ✅ Attivo |
| Firmania.it | firmania.it/rho/web-novis-5232582 | ✅ Attivo |
| Trova Aperto | trova-aperto.it/rho/web-novis-2966234 | ✅ Attivo |
| Chronoshare | cronoshare.it/croner-1340732-web-novis | ✅ Attivo |
| Yelp | — | ⏳ In revisione |
| ProntoPro | — | ⏳ In revisione |
| DesignRush | — | ⏳ In revisione |
| GoodFirms | — | ⏳ In revisione |
| Apple Business Connect | — | ⏳ Verifica dominio (TXT _dmarc) |
| Directory Italia | — | ⏳ Piano free, in coda |
| Bing Places | — | ⏳ In verifica |

### File aggiornati in questa sessione

| File | Modifiche |
|------|-----------|
| `index.html` | Telefono JSON-LD ×2, streetAddress, geo, hasMap, openingHours 24/7, sameAs (7 directory) |
| `contatti.html` | Telefono tel:, WhatsApp wa.me, indirizzo visibile, orari visibili, Maps embed, JSON-LD |
| `ai.txt` | Sede completa, FAQ sede, directory list, versione 3.1 |
| `webnovis-ai-data.json` | Indirizzo, CAP, orari, categoria, WhatsApp, Instagram, directory_profiles, versione 3.1 |
| `llms.txt` | Sede, WhatsApp, orari, directory principali |
| `chat-config.json` | Telefono, WhatsApp, indirizzo, sito www, istruzioni chatbot aggiornate |
| `js/main.min.js` | Rigenerato via build.js |

---

*Piano strategico generato il 17/02/2026 — Aggiornato il 18/02/2026 (NAP alignment)*  
*Prossima revisione: 03/03/2026*
