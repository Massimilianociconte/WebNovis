# Audit SEO & GEO Completo — WebNovis (Agenzia Web Rho/Milano)

**Data Audit:** Febbraio 2026 (v1) — **Aggiornato: 20 Febbraio 2026 (v2)**
**Target:** https://www.webnovis.com
**Settore:** Sviluppo Web Custom, SEO, Design, Social Media (B2B)
**Area Geografica:** Rho, Milano, Lombardia

---

## ⚡ AGGIORNAMENTO v2 — 20 Febbraio 2026

**Score aggiornato: 80/100** *(era 79/100 in questo audit — metodologia leggermente diversa da SEO-AUDIT-FEBBRAIO-2026.md)*

**Implementazioni completate tra v1 e v2:**

| Area | Implementazione | Stato |
|------|----------------|-------|
| Tech | Speculation Rules API su 10 pagine | ✅ FATTO |
| Tech | AI Referral Tracking GA4 (10 sorgenti) | ✅ FATTO |
| Tech | `employee` link Organization → Person (grafo bidirezionale) | ✅ FATTO |
| Tech | Person `sameAs` LinkedIn nel schema | ✅ FATTO |
| Tech | ImageObject schema per tutti gli 11 case study | ✅ FATTO |
| Tech | figcaption + figure su immagine chiave (Caption-Alt-Body cycle) | ✅ FATTO |
| Tech | generate-sitemap.js — lastmod reale, 52 URL, zero attributi deprecati | ✅ FATTO |
| Tech | changefreq e priority rimossi da sitemap.xml | ✅ FATTO |
| On-Page | Answer Capsule RAG (55-70 parole) su homepage + 6 servizi | ✅ FATTO |
| On-Page | H2/H3 interrogativi per PAA e voice search | ✅ FATTO |
| Local | Apple Business Connect | ✅ **COMPLETAMENTE VERIFICATO** |
| Core Web Vitals | FCP/LCP — analytics già lazy-loaded (era un falso positivo del report originale) | ✅ Non era un problema reale |

**Stato top 10 originale (aggiornato):**
1. Link Building Locale — ☐ ancora da fare
2. GBP Recensioni — ☐ ancora da fare (target 20+)
3. Pagine Geo-Specifiche — ☐ ancora da fare
4. Core Web Vitals FCP/LCP — ✅ Già ottimizzato (analytics lazy, Speculation Rules attive)
5. LinkedIn Aziendale — ⚠️ URL in sameAs, stato operativo da confermare
6. Immagini Next-Gen AVIF — ☐ ancora da fare
7. Apple Business Connect — ✅ **COMPLETAMENTE VERIFICATO**
8. Consolidamento E-E-A-T Blog — ☐ ancora da fare
9. Bundle Splitting JS — ☐ ancora da fare
10. Digital PR B2B — ☐ ancora da fare (HARO iscritto, risposte attive da avviare)

**Nota:** I punti 4 e 7 della top-10 originale sono stati risolti. La vera verità brutale rimane: **backlink e recensioni** sono l'unico ostacolo reale alla dominanza locale.

---

## 1. Executive Summary

WebNovis ha implementato un'infrastruttura SEO tecnica e GEO (Generative Engine Optimization) di livello enterprise, nettamente superiore alla media delle agenzie web locali concorrenti. L'adozione di un ecosistema semantico avanzato (Schema Markup a grafo), protocolli per AI (`llms.txt`, `ai.txt`, IndexNow) e pipeline di contenuti automatizzate posiziona il brand in netto vantaggio per la Search Generative Experience (SGE).

**La verità brutale:** Se l'infrastruttura tecnica sfiora la perfezione, il "motore" fatica a scaricare a terra la potenza a causa di un **profilo backlink debole (Off-Page)** e della mancanza di "social proof" reale su scala locale (poche o zero recensioni storicizzate su Google Business Profile rispetto ad agenzie presenti da 10 anni). Inoltre, l'automazione dei contenuti del blog deve essere attentamente monitorata per evitare cannibalizzazione e garantire un E-E-A-T percepibile dall'utente umano, non solo dai bot.

Per dominare la SERP locale a Rho e Milano, l'effort dei prossimi mesi deve spostarsi radicalmente dal codice alla costruzione di autorità (Digital PR, Link Building, Recensioni).

---

## 2. Score Globale Stimato: 80/100 *(v2 — aggiornato 20/02/2026)*

| Area | v1 | v2 | Variazione |
|------|----|----|------------|
| SEO Tecnica | 95 | **98** | +3 (Speculation Rules, AI Tracking, sitemap dinamica, employee link, ImageObject) |
| GEO | 95 | **98** | +3 (Answer Capsule, H2/H3 interrogativi, figcaption, Person sameAs, Apple BC verificato) |
| On-Page & Contenuti | 85 | **88** | +3 (Answer Capsule RAG, H2/H3 interrogativi) |
| Local SEO | 75 | **77** | +2 (Apple Business Connect verificato) |
| Off-Page & Link Building | 45 | **45** | = (nessuna azione off-site) |

---

## 3. Top 10 Priorità di Intervento (Impatto/Sforzo)

1. **[Off-Page] Link Building Locale:** Acquisire backlink da testate locali (es. MilanoToday, RhoNews) e directory aziendali lombarde. *(Impatto: Alto | Sforzo: Alto)*
2. **[Local] Google Business Profile (GBP) Velocity:** Impostare un processo sistematico per ottenere recensioni reali a 5 stelle dai clienti. *(Impatto: Altissimo | Sforzo: Medio)*
3. ✅ **[On-Page] Pagine Iper-Geolocalizzate:** ~~Creare landing page specifiche dedicate a "Realizzazione Siti Web Rho" e "Web Agency Milano"~~ **COMPLETATO** (20/02/2026) — `/agenzia-web-rho.html` e `/agenzia-web-milano.html` con LocalBusiness schema, FAQPage 7 domande, HowTo schema, contenuto locale autentico (Fiera Milano Rho, territorio, logistica).
4. ✅ **[Tech] Core Web Vitals (FCP/LCP):** ~~Risolvere il blocco del rendering spostando script analytics/Clarity e minificando l'HTML come da report tecnico interno.~~ **RISOLTO** — Analytics già lazy-loaded post-consenso. Speculation Rules API attiva. Gzip attivo. Cloudflare (Brotli + Early Hints) configurato e attivo al go-live.
5. **[Off-Page] Verifica Profilo LinkedIn:** Completare la verifica dell'identità aziendale su LinkedIn per consolidare il Trust Entity. *(Impatto: Alto | Sforzo: Basso)*
6. **[Tech] Ottimizzazione Immagini Next-Gen:** Implementare conversioni massive in AVIF e tag `<picture>` per servire formati ottimali. *(Impatto: Medio | Sforzo: Basso)*
7. ✅ **[Local] Apple Business Connect:** ~~Espandere la presenza sulle mappe oltre Google.~~ **COMPLETAMENTE VERIFICATO** (20/02/2026). **Bing Places:** ancora da creare.
8. **[Contenuti] Consolidamento E-E-A-T Blog:** Iniettare casi studio reali (es. Aether Digital, Arconti31) all'interno degli articoli auto-generati per spezzare il tono "AI-generated". *(Impatto: Alto | Sforzo: Medio)*
9. **[Tech] Bundle Splitting JS:** Separare la logica JS della homepage (particles, 3D) dalle pagine interne per abbattere i tempi di caricamento del 50%. *(Impatto: Medio | Sforzo: Medio)*
10. **[Off-Page] Digital PR B2B:** Sfruttare iscrizioni esistenti (HARO, Help a B2B Writer) per ottenere citazioni su blog tech nazionali. *(Impatto: Alto | Sforzo: Alto)*

---

## 4. Analisi Dettagliata per Aree

### SEZIONE 1 — SEO TECNICA
- **Struttura URL:** Ottima. Slug puliti (`/servizi/sviluppo-web.html`), senza parametri superflui.
- **Core Web Vitals:** Buoni ma migliorabili. *Problema:* FCP rallentato da caricamento CSS non critico e script in head. *Soluzione:* Estrarre CSS critico in inline, asincronizzare fogli di stile pesanti, spostare analytics a fondo body post-consenso.
- **Crawlability & Indexing:** Eccellente. `robots.txt` perfetto (permette l'accesso a 12+ AI bot bot e ai motori classici), `sitemap.xml` aggiornata automaticamente, implementazione di IndexNow perfetta per ping istantanei.
- **Schema Markup:** Capolavoro tecnico. Uso di grafo semantico con riferimenti `@id` (Organization -> LocalBusiness -> WebSite -> WebPage) e JSON-LD privi di errori. L'inclusione di `SearchAction` per i sitelink è un plus notevole.
- **Internal Linking:** Eccellente automazione nei log articoli e navigazione cross-pagina consistente. Non risultano pagine orfane.

### SEZIONE 2 — SEO ON-PAGE & CONTENUTI
- **Keyword Strategy:** Il sito intercetta bene intenti head ("agenzia web milano", "sviluppo web custom") e long-tail tramite i 170 argomenti in coda per il blog.
- **Competitor Content Gap:** I competitor puntano molto su casi studio con metriche numeriche pesanti ("+300% traffico"). WebNovis ha i casi studio (`/portfolio/case-study/`), ma i numeri vanno resi più prominenti in homepage.
- **E-E-A-T:** *Criticità rilevata.* L'uso di articoli AI (Gemini/Llama) scala i volumi, ma rischia la piattezza. *Soluzione:* Inserire in automatico o manualmente citazioni umane, firme del fondatore o estratti di portfolio dentro i blog post per alzare il Trust.
- **CTA:** Chiare e ben distribuite (inline, content upgrades, moduli form).

### SEZIONE 3 — LOCAL SEO (Priorità Alta)
- **NAP & Entità:** Perfetta sincronizzazione tecnica. Telefono (+39 380 264 7367), Indirizzo (Via S. Giorgio 2, Rho) e naming coerenti. Wikidata (Q138340285) agganciato magistralmente.
- **Google Business Profile (GBP):** *Problema:* Per dominare a Milano/Rho servono volumi di recensioni. Il codice non batte un competitor con 150 recensioni a 4.9 stelle. *Soluzione:* Attivare campagne di richiesta recensioni ai clienti esistenti.
- **Citazioni Locali:** Presenti su Trustpilot, Clutch, Crunchbase, Cylex, Hotfrog. Ottima base. Da estendere a PagineGialle, ProntoPro, Yelp.
- **Landing Page Locali:** *Opportunità mancata.* La home funge da aggregatore, ma servono pagine dedicate tipo `/agenzia-web-rho.html` o `/realizzazione-siti-web-milano.html` per forzare la geolocalizzazione senza cannibalizzare i servizi generali.

### SEZIONE 4 — GEO (Generative Engine Optimization)
- **Menzionabilità LLM:** Incredibilmente avanzata. I file `llms.txt`, `ai.txt` e `webnovis-ai-data.json` nutrono direttamente i crawler come ChatGPTBot, ClaudeBot e Perplexity.
- **Autorevolezza (Entity SEO):** La creazione dell'entità Wikidata e Crunchbase segnala chiaramente all'AI che WebNovis è un'organizzazione legittima e non un sito amatoriale.
- **Ottimizzazione Q&A:** Il markup `FAQPage` aggiornato su tutti i servizi ("Quanto costa un sito web", etc.) rende i contenuti direttamente utilizzabili dalle AI come snippet di risposta.
- *Verdetto:* 10/10. WebNovis è pronta per il passaggio di Google a SGE (Search Generative Experience) e per le risposte di Perplexity.

### SEZIONE 5 — OFF-PAGE & LINK BUILDING
- **Profilo Backlink:** Essendo il dominio nato/strutturato di recente (2025), la DA (Domain Authority) è fisiologicamente bassa.
- **Link Building Opportunities:** *Criticità rilevata.* Senza backlink autorevoli, la migliore SEO tecnica non posiziona in Top 3 su keyword competitive a Milano. *Soluzione:* Acquistare guest post su network italiani tematici (digital, business), scambi link con agenzie non concorrenti (es. agenzie eventi), PR locali.
- **Social Signals:** L'attivazione di Facebook e Instagram c'è, ma serve ultimare l'abilitazione di LinkedIn Aziendale per massimizzare il trust algoritmico lato B2B.

### SEZIONE 6 — COMPETITOR BENCHMARK
**Competitor Tipo (Agenzie Web Milano/Rho):**
1. *Competitor Storici (DA 30-40):* Siti spesso obsoleti (WordPress lenti) ma forti di domini registrati nel 2010 e centinaia di link.
2. *Competitor Locali Rho (DA 10-20):* Focalizzati solo su Rho, design vecchi, assenza di Schema Markup.

**Il Vantaggio Competitivo di WebNovis:**
I competitor falliscono su Core Web Vitals, Schema Markup e architettura custom. WebNovis può letteralmente "superarli in curva" sul piano tecnico e semantico.
*Punto debole:* Loro hanno "storicità", WebNovis deve compensare con un ritmo di pubblicazione contenuti x10 (grazie all'automazione) e una freschezza tecnologica perfetta.

---

## 5. Piano d'Azione a 90 Giorni

### Fase 1: Quick Wins (Mese 1)
- [x] ~~Creare 2 landing page dedicate~~ ✅ COMPLETATO — `/agenzia-web-rho.html` e `/agenzia-web-milano.html` live (20/02/2026)
- [x] ~~Fix CWV (analytics lazy, Speculation Rules)~~ ✅ RISOLTO
- [ ] Concludere verifica stato operativo LinkedIn Aziendale.
- [x] ~~Apple Business Connect~~ ✅ COMPLETAMENTE VERIFICATO (20/02/2026)
- [ ] Bing Places for Business (30 minuti — sync con GBP)
- [x] ~~Talkwalker Alerts + Google Alerts~~ ✅ COMPLETATO — 4 query ciascuno: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com`

### Fase 2: Authority Building (Mese 2)
- [ ] Lanciare campagna richiesta recensioni per Google Business Profile (obiettivo: prime 5-10 recensioni a 5 stelle).
- [ ] Attivare Digital PR: Inviare comunicati stampa locali ("Nuova web agency AI-driven apre a Rho").
- [ ] Generare e pubblicare i primi 30 articoli informativi dal tool `auto-writer.js`, assicurandosi che inviino ad IndexNow.

### Fase 3: Ottimizzazione Avanzata & Espansione (Mese 3)
- [ ] Guest Posting: Acquisire almeno 3 backlink da portali IT o economia italiani.
- [ ] Bundle splitting: Implementare separazione JS (`core.js` vs `homepage.js`) per velocizzare i portali interni.
- [ ] Auditing AI: Testare prompt su ChatGPT e Perplexity del tipo "Migliore agenzia web a Rho" per verificare la ricezione dei file `ai.txt` e l'entità.

---

## 6. Tabella Riepilogativa delle Azioni

| Area | Azione | Stato | Priorità | Sforzo |
| :--- | :--- | :--- | :--- | :--- |
| **Local** | Campagna Recensioni su GBP (QR code + email template) | ☐ Da Iniziare | Alta | Medio |
| **Local** | Apple Business Connect | ✅ **VERIFICATO 20/02** | — | — |
| **Local** | Bing Places for Business | ☐ Da Iniziare | Media | Basso |
| **Local** | Brand monitoring (Talkwalker + Google Alerts) | ✅ **COMPLETATO** | — | 4 query attive per piattaforma |
| On-Page | Creazione Landing Page Geo-Specifiche (Rho/Milano) | ✅ **COMPLETATO 20/02** | — | 2 pagine, 54 URL sitemap |
| **On-Page** | Answer Capsule RAG + H2/H3 interrogativi | ✅ **FATTO 20/02** | — | — |
| **Off-Page** | LinkedIn Aziendale — verifica stato operativo | ⚠️ Da Verificare | Alta | Basso |
| **Off-Page** | Campagna Link Building / Guest Posting (HARO attivo) | ☐ Da Iniziare | Alta | Alto |
| **Tech** | Core Web Vitals (analytics lazy, Speculation Rules) | ✅ **RISOLTO** | — | — |
| **Tech** | Separazione Bundle JS (Homepage vs Interno) | ☐ Da Iniziare | Media | Medio |
| **Tech** | Conversione Immagini in AVIF + `<picture>` | ☐ Da Iniziare | Media | Medio |
| **Tech** | HowTo + Speakable schema | ☐ Da Iniziare | Media | Basso |
| **Tech** | ServiceArea sui Service schema individuali | ☐ Da Iniziare | Media | Basso |
| **Contenuti** | Inserimento metriche reali nei case study | ☐ Da Iniziare | Media | Medio |
| **Contenuti** | Pillar content 3.000+ parole (2 articoli) | ☐ Da Iniziare | Media | Alto |
| **Contenuti** | Blog long-tail geolocalizzato | ☐ Da Iniziare | Media | Basso |

---
*Fine Audit. Redatto da Sistema AI SEO.*
