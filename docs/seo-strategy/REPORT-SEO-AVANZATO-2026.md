# REPORT ANALITICO: SEO & AI DOMINANCE PROTOCOL v.2026
## Analisi approfondita contestualizzata al progetto Web Novis

**Data**: 16 Febbraio 2026 (aggiornato)  
**Documenti sorgente**: `docs/seo-strategy/tecniche-SEO-avanzate.txt` + `llm-sniffing.txt` (ChatGPT query analysis)  
**Sito**: https://www.webnovis.com (GitHub Pages)  
**Stato progetto**: 20 articoli blog, 6 pagine servizio, Schema.org avanzato, AI-readiness elevata

---

## SCORECARD DEL PROTOCOLLO

| Area | Copertura | Applicabilità WebNovis | Voto /10 |
|------|:---------:|:----------------------:|:--------:|
| GEO / LLM Reverse Engineering | Alta | **Alta** | **8** |
| Architettura Programmatica | Media | **Media** | **6** |
| Link Building Passiva | Media | **Media-Bassa** | **5** |
| On-Page Optimization | Buona | **Alta** | **7** |
| Retention / Newsletter | Bassa | **Media** | **4** |
| **Score complessivo** | | | **6/10** |

### Punti di forza
- **GEO-first mindset** — corretto nell'identificare le risposte AI come battleground emergente
- **LLM Source Sniffing** — tecnica avanzata e poco conosciuta, genuinamente innovativa
- **PAA Loops** — strategia scalabile a costo zero
- **Content Refresh > New Content** — il consiglio a ROI più alto dell'intero documento

### Lacune critiche
- **Zero menzione di E-E-A-T** — il fattore più importante per citazioni AI
- **Zero Schema markup** — ponte critico tra contenuti e AI
- **Zero Internal Linking** — il moltiplicatore di autorità tematica
- **Zero copertura analytics** — come si misura il successo?
- **Zero Local SEO** — critico per Web Novis (Rho/Milano)
- **Newsletter sottodimensionata** — 4 righe per l'unico canale proprietario

---

## SEZIONE 1 — GEO & LLM REVERSE ENGINEERING

### 1.1 Protocollo "Bing Grounding" — ⭐⭐⭐⭐ (4/5)

**Il protocollo dice**: Collegare il sito a Bing Webmaster Tools → AI Performance > Grounding Queries → analizzare il gap tra query AI e contenuto della pagina.

**Perché è importante**: Quando ChatGPT/Copilot cerca informazioni, genera query interne verso Bing. Queste query rivelano come l'AI "traduce" le domande degli utenti. Intercettarle = intercettare il traffico AI alla fonte.

**Il protocollo identifica 2 scenari ma ne omette un terzo**:
- **Scenario A (Gap Semantico)** ✅ — Integrare termini mancanti nel primo paragrafo
- **Scenario B (Gap Strutturale)** ✅ — Creare pagina dedicata per query distanti
- **Scenario C (Gap di Formato)** ❌ MANCANTE — Le AI preferiscono estrarre tabelle, liste puntate, blocchi Q&A di 40-60 parole. Ristrutturare il formato è spesso sufficiente senza creare nuove pagine.

**Dati chiave non nel protocollo**:
- L'82% delle citazioni AI Overviews proviene da URL "profondi" (non homepage)
- Le pagine con FAQPage schema ricevono **3,4x più citazioni** su Perplexity
- Perplexity privilegia contenuti aggiornati negli ultimi **90 giorni**
- Il turno 1 di una conversazione ChatGPT ha **2,5x più probabilità** di attivare citazioni

**Stato WebNovis**:

| Elemento | Stato |
|----------|:-----:|
| Bing Webmaster Tools | ❌ Non configurato — **AZIONE IMMEDIATA** |
| robots.txt AI-friendly | ✅ 6 crawler AI ammessi |
| ai.txt + webnovis-ai-data.json | ✅ Implementati |
| Meta tag ai-content | ✅ Su tutte le pagine |
| FAQPage Schema | ✅ Homepage (5 FAQ) — manca su pagine servizio |
| Contenuti modulari Q&A | ⚠️ Blog ha headings-domanda ma risposte troppo lunghe per estrazione AI |

**Azioni**:
1. Registrare il sito su Bing Webmaster Tools (15 minuti)
2. Aggiungere FAQPage Schema su ogni pagina servizio (5-8 FAQ ciascuna)
3. Ristrutturare primi paragrafi dei 20 articoli con "citation block" di 40-60 parole sotto ogni H2

---

### 1.2 Protocollo "LLM Source Sniffing" — ⭐⭐⭐⭐⭐ (5/5)

**Il protocollo dice**: Aprire ChatGPT → DevTools > Network → trovare ID conversazione → estrarre JSON con le query esatte che l'AI usa per cercare nel web.

**Questa è la tecnica più sofisticata dell'intero protocollo.** La meccanica: quando ChatGPT attiva web search, le query transitano nel payload JSON delle risposte di rete. Rivelano:
1. Come l'AI traduce domande colloquiali in query strutturate (spesso in inglese, 4-8 parole)
2. Quali termini l'AI considera rilevanti per quel topic
3. Quante query parallele vengono generate (tipicamente 2-4)

**Integrazione critica mancante nel protocollo**:

Il protocollo suggerisce di creare contenuti con "esattamente quella stringa come Titolo". Questo è semplificato. L'approccio completo:

**Fase 1 — Raccolta**: Lanciare 10-15 varianti della stessa domanda in sessioni diverse. Per WebNovis: "Migliore agenzia web Milano", "Chi fa siti web a Rho", "Quanto costa un sito web Italia", "Web agency economica Milano", "Agenzia digitale piccole imprese".

**Fase 2 — Clusterizzazione**: Raggruppare per intent (informativo/commerciale/transazionale). Prioritizzare le query commerciali.

**Fase 3 — Deploy completo** (il protocollo copre solo i primi 2 punti):
- Articolo blog con query come H1 ✅
- Video YouTube con query come titolo ✅
- Sezione FAQ dedicata con risposta <300 parole ❌ MANCANTE
- Schema FAQPage/HowTo sulla pagina ❌ MANCANTE
- Aggiornamento ai.txt/webnovis-ai-data.json con nuove keyword ❌ MANCANTE

**Per WebNovis**: La nicchia locale (Rho/Milano) ha **competizione AI ancora bassa**. Le query di grounding per "agenzia web Milano" probabilmente non sono presidiate da nessun competitor nella dimensione AI. **First mover advantage significativo.**

---

## SEZIONE 2 — ARCHITETTURA PROGRAMMATICA

### 2.1 PAA Loops — ⭐⭐⭐ (3/5) — Buona idea, esecuzione rischiosa

**Il protocollo dice**: Espandere People Also Ask → catturare domande → farle rispondere da AI (120 parole) → creare una pagina per ogni domanda → link nel footer.

**Criticità non menzionate**:

1. **Thin Content**: 120 parole/pagina è pericolosamente basso nel 2026. Google classifica contenuti sotto 300 parole come thin content dopo gli Helpful Content Updates. **Minimo raccomandato: 500-800 parole**.

2. **Cannibalizzazione**: Domande PAA semanticamente sovrapposte = più pagine competono per la stessa keyword, diluendo l'autorità.

3. **Link nel footer — FORTEMENTE SCONSIGLIATO**: Google tratta i link footer come navigazione, non endorsement. Un footer con 50+ link FAQ: diluisce PageRank, segnala link manipulation, può triggerare flag "doorway pages".

**Approccio alternativo raccomandato per WebNovis**:

Invece di 1 pagina per domanda → **FAQ integrate nelle pillar pages esistenti**:

```
Pillar: /blog/seo-per-piccole-imprese.html (già esistente)
  ├── FAQ integrata con 8-10 domande PAA + Schema FAQPage
  ├── Cluster: /blog/seo-locale-google-maps.html (dal topics-queue)
  ├── Cluster: /blog/keyword-research-guida-2026.html
  └── Cluster: /blog/featured-snippet-come-ottenere.html

Pillar: /blog/quanto-costa-un-sito-web.html (già esistente)
  ├── FAQ integrata con 8-10 domande PAA
  ├── Cluster: /blog/manutenzione-sito-web.html
  └── Cluster: /blog/sviluppo-sito-web-da-zero.html
```

Dati: i cluster tematici generano **+30% traffico organico** e mantengono ranking **2,5x più a lungo**.

**Stato WebNovis**: 20 articoli + 170 topic in coda, ma **nessuna architettura pillar-cluster** implementata. I 20 articoli non hanno linking bidirezionale strutturato. **Priorità alta**.

---

### 2.2 Micro-SaaS / Tool interattivi — ⭐⭐⭐⭐ (4/5)

**Il protocollo dice**: Creare calcolatori/generatori interattivi su sottodominio per keyword bottom-of-funnel.

**Correzione critica**: NON su sottodominio. Google tratta i sottodomini come entità semi-separate. Per WebNovis (autorità in costruzione), **hostare su sottocartella** (`/tools/calcolatore-costo-sito`) per concentrare l'autorità.

**Tool prioritari per WebNovis**:

| Tool | Keyword | Volume | Priorità |
|------|---------|:------:|:--------:|
| Calcolatore Costo Sito Web | "quanto costa un sito web" | ~1.000/mese | 🔴 |
| Calcolatore Costo E-commerce | "quanto costa un ecommerce" | ~480/mese | 🔴 |
| Mini Audit SEO Gratis | "audit seo gratuito" | ~720/mese | 🟡 |
| Generatore Meta Description | "generatore meta description" | ~320/mese | 🟡 |

Il "Calcolatore Costo Sito Web" è tecnicamente semplice (form + slider + JS) e attacca la keyword più commerciale di WebNovis. Costruibile in 1 giorno.

---

## SEZIONE 3 — LINK BUILDING PASSIVA

### 3.1 Trappola Attribuzione Immagini — ⭐⭐⭐ (3/5)

**Il protocollo dice**: Creare asset visivi → caricare su Unsplash/Pexels → inserire link attribuzione → aspettare backlink naturali.

**Realtà**: Il protocollo menziona "DR90+" ma è estremamente ottimistico. I siti che usano stock free hanno tipicamente DR <30. Ciò che funziona realmente: **infografiche con dati originali**, diagrammi di processo, grafici con statistiche — non foto generiche.

**Per WebNovis**: Posizione ideale per produrre infografiche di processo (come si sviluppa un sito web, anatomia di un e-commerce, processo di branding) ad alto valore di condivisione.

### 3.2 Link Reclamation — ⭐⭐⭐⭐ (4/5)

Tasso di risposta confermato: **40-65%** (Ahrefs), molto superiore al cold outreach (5-15%).

**Integrazione per WebNovis**:
- **Brand mention reclamation**: Google Alerts per "WebNovis" e "Web Novis" → richiedere link quando menzionato senza link
- **Competitor backlink analysis**: Analizzare backlink competitor con Ahrefs/Semrush → replicare quelli ottenibili

**Strategia link building completa** (integrando il protocollo):

| Tattica | Volume atteso (6 mesi) | DR medio |
|---------|:---------------------:|:--------:|
| Directory locali (PagineGialle, Clutch, Sortlist, Yelp) | 8-12 citazioni | 60-90 |
| Google Business Profile | 1 (critico per local) | N/A |
| Guest post blog italiani | 3-6 backlink | 30-60 |
| Infografiche su stock platforms | 5-15 backlink | 15-40 |
| HARO / Connectively | 2-5 backlink | 50-80 |

**Stato WebNovis**: ❌ Nessuna attività di link building implementata. Zero backlink noti. Solo Instagram come profilo social. GBP assente.

---

## SEZIONE 4 — ON-PAGE OPTIMIZATION

### 4.1 Magic Title Formula — ⭐⭐⭐⭐ (4/5)

**Formula protocollo**: `[Keyword] | [Benefit] | [Brand]`

**Correzione tecnica**: Usare `–` invece di `|`. Google rimuove la pipe nel 41% dei casi vs solo il 19,7% per i trattini.

**Stato WebNovis**: I title tag sono **già ben strutturati** e seguono varianti della formula. Non è una priorità di intervento.

### 4.2 Stop New Content / Start Optimization — ⭐⭐⭐⭐⭐ (5/5)

**Il consiglio a ROI più alto dell'intero protocollo.**

Dati schiaccianti:
- HubSpot: content refresh ha **raddoppiato i lead mensili** e **+106% traffico organico**
- Brian Dean: **+260%** dopo content refresh
- Il **76% delle visualizzazioni** e il **92% dei lead** provengono da articoli vecchi
- Dalla posizione 4 alla 1 = **3x traffico** — molto più efficace che creare pagine nuove

**Per WebNovis con 20 articoli**: Campagna di content refresh PRIMA di creare nuovi articoli:
1. Configurare GSC (se non attivo) → attendere 2-4 settimane dati
2. Filtrare pagine posizione 4-20
3. Per ogni candidata: aggiungere citation blocks 40-60 parole, statistiche con fonte, FAQ expand con schema, internal links a pagine servizio, data "Ultimo aggiornamento" visibile
4. Alternare: 2 settimane refresh → 2 settimane nuovi articoli → ripetere

**Stima impatto**: +30-80% traffico organico sugli articoli aggiornati in 3 mesi.

---

## SEZIONE 5 — NEWSLETTER

### ⭐⭐ (2/5) — Troppo superficiale

**Il protocollo**: 4 righe (cadenza mercoledì/giovedì, oggetto 1 parola, stile diretto).

**WebNovis è GIÀ molto più avanti**: newsletter-engine.js con Groq/Llama 3.3 + Brevo, template HTML, endpoint server, cron scheduler, GDPR compliance.

**Gap reali** (non coperti dal protocollo):

1. **Lead magnet assenti** — Content upgrade specifici per articolo aumentano opt-in fino al **785%**:
   - quanto-costa-un-sito-web → Calcolatore PDF con breakdown costi
   - seo-per-piccole-imprese → Checklist SEO 2026 stampabile
   - brand-identity-guida-completa → Template Design Brief
   - social-media-strategy-2026 → Calendario Editoriale 30 Giorni

2. **Exit-intent popup assente** — Recupera il 10-15% visitatori in uscita

3. **CTA inline blog generiche** — Le CTA inline performano il **121% meglio** delle CTA sidebar

---

## STATO IMPLEMENTAZIONE: ASSET PRE-ESISTENTI (vantaggi non nel protocollo)

WebNovis è **avanti rispetto al protocollo** in diverse aree:

| Asset | Valore |
|-------|:------:|
| ai.txt (128 righe) | 🔥 Solo ~2% dei siti italiani ne ha uno |
| webnovis-ai-data.json | 🔥 Struttura dati nativa per crawler AI |
| robots.txt AI-permissive (6 crawler) | 🔥 |
| 6 JSON-LD interlinked (@id) | 🔥 Organization + WebSite + LocalBusiness + WebPage + Breadcrumb + FAQ |
| 20 articoli blog SEO/GEO | ✅ |
| 170 topic in coda (topics-queue.json) | ✅ Pipeline per 12+ mesi |
| Auto-writer (Gemini/Groq) | ✅ |
| Newsletter engine AI-powered | ✅ |
| 6 pagine servizio dedicate | ✅ |
| Cookie consent + GA4 consent-gated | ✅ |

---

## PIANO OPERATIVO 90 GIORNI

### Settimana 1-2: Foundation
- [ ] Registrare su **Bing Webmaster Tools** (15 min)
- [ ] Verificare **Google Search Console** attivo
- [ ] Creare **Google Business Profile**
- [ ] Registrazione **4-5 directory** (Clutch, Sortlist, PagineGialle, Yelp)
- [ ] **Content Refresh** sui 5 articoli principali (citation blocks, statistiche, FAQ expand)
- [ ] Definire **mappa Pillar-Cluster** per i 20 articoli

### Settimana 3-4: Cluster & Conversion
- [ ] Implementare **link bidirezionali** tra articoli secondo mappa cluster
- [ ] Aggiungere **link contestuali** da blog a pagine servizio
- [ ] **FAQPage Schema** su 6 pagine servizio
- [ ] Eseguire **LLM Source Sniffing** per top 10 keyword
- [ ] Creare primo **lead magnet** (Checklist SEO PDF)
- [ ] Aggiungere **CTA inline** in tutti gli articoli (2-3 per articolo)
- [ ] **Content Refresh** sui restanti 15 articoli

### Settimana 5-8: Scale
- [ ] Sviluppare **Calcolatore Costo Sito** su `/tools/`
- [ ] Pubblicare **8-10 nuovi articoli** (completamento cluster)
- [ ] Creare **3-5 infografiche** per Unsplash/Pexels
- [ ] Attivare **Google Alerts** per brand mentions
- [ ] **2-3 guest post** su blog italiani
- [ ] **Exit-intent popup** con lead magnet

### Settimana 9-12: Optimize
- [ ] Analizzare **Bing Grounding Queries**
- [ ] Analizzare **GSC** → refresh mirato pagine pos. 4-20
- [ ] Secondo round **LLM Source Sniffing**
- [ ] Pubblicare **8-10 nuovi articoli**
- [ ] Richiedere **recensioni Google** ai 5 clienti
- [ ] **A/B test** oggetti newsletter

### KPI Target

| KPI | Target 90 giorni |
|-----|:----------------:|
| Impressioni GSC settimanali | +100% dalla baseline |
| Articoli blog | 38-40 |
| Pagine con FAQPage Schema | 7+ |
| Backlink domini unici | 20-30 |
| Email subscriber | 100+ |
| GBP reviews | 5+ |

---

## APPENDICE: TECNICHE NON COPERTE DAL PROTOCOLLO

### A. Entity SEO & Topical Authority
Google ragiona per entità (8 miliardi nel Knowledge Graph). Per diventare entità riconosciuta: NAP coerente, Schema interlinked, profili social verificati con sameAs, menzioni autorevoli.

### B. AI Overviews Optimization
Compaiono nell'88% delle query informative. Chiavi: tabelle HTML (4,1x citazioni), statistiche ogni 150-200 parole, definizioni 40-60 parole, formato Q&A.

### C. Reddit & Community
ChatGPT cita Reddit nel 3% di tutte le citazioni. Presenza attiva su r/webdev, r/SEO con risposte utili = citazioni AI + backlink DR99.

### D. Schema Person per fondatori
Critico per E-E-A-T. Ogni articolo dovrebbe avere author byline con schema Person (knowsAbout, credenziali, sameAs LinkedIn).

### E. Content Decay Monitoring
Confrontare periodi di 6 mesi in GSC per individuare cali. Articoli con topic annuali → aggiornamenti trimestrali. Evergreen → ogni 6-12 mesi.

---

## SEZIONE 6 — LLM SOURCE SNIFFING: RISULTATI OPERATIVI (ChatGPT Query Analysis)

### Contesto

In data 16/02/2026 è stata eseguita un'analisi di reverse engineering delle query interne di ChatGPT (modello gpt-5-2) per il prompt: **"Miglior agenzia web per fare sito web per piccole imprese"**. L'analisi ha estratto il payload JSON dalla rete per identificare le grounding queries esatte, le entity lookup e le fonti citate.

### 6.1 Grounding Queries Estratte

L'AI ha generato **due set di ricerche** per la stessa richiesta, affinando la localizzazione nel secondo tentativo:

| Set | Query (stringa esatta) | Lingua | Localizzazione |
|:---:|------------------------|:------:|:--------------:|
| 1 | `migliori agenzie web per siti web piccole imprese Italia` | IT | Italia |
| 1 | `best web design agencies for small business websites globally and examples of top agencies` | EN | Globale |
| 2 | `migliori agenzie web per siti web piccole imprese Italia` | IT | Italia |
| 2 | `top web design agencies for small business websites Italy web design services` | EN | Italia |

**Insight critico**: L'AI cerca sempre sia in italiano che in inglese, e nel secondo tentativo restringe al mercato italiano. Questo significa che WebNovis deve avere contenuti ottimizzati per **entrambe le lingue** nelle keyword principali.

### 6.2 Entity Lookup — Competitor Identificati

L'AI ha estratto specifici profili business (Google Maps/Bing Places) tramite `entity_lookup_request`. Queste sono le agenzie che ChatGPT **attualmente mostra come risultati**:

| Entità | Google Place ID | Categoria |
|--------|:--------------:|:---------:|
| Web Agency Milano - Realizzazione Siti Web | `ChIJZRt-v_DHhkcRrGoujgRFcUw` | Website designer |
| Artwork - Web Agency Milano | `ChIJ6XE6zOnGhkcRQYiPbnIc5pU` | Website designer |
| FD Consulenze Web | `ChIJE88CH77XhkcRNTHjso9yqcY` | Website designer |
| Webyblue | `ChIJ0wSKOijHhkcRlEmx0neM6IY` | Website designer |
| PMR Studio Web | `ChIJu0Z4C3DGhkcRjrK7rQ2zXx8` | Website designer |
| White & Stone Italia | `ChIJmZjdP7jBhkcRlkz1I40zWKQ` | Website designer |
| Aleide Web Agency | `ChIJo50WYt3GhkcRQ_P7QAhvfVY` | Website designer |
| Ottobix | `ChIJ2exF247HhkcRiMkG4EmUuiU` | Website designer |
| Studio Up | `ChIJu-SR4PvGhkcRuigtucC2zZ4` | Website designer |

**Nota SEO critica**: Tutti i competitor hanno un `business_id` strutturato (Google Maps). WebNovis **non ha ancora** un Google Business Profile → invisibile per le entity_lookup dell'AI. Questo è il gap più urgente (in attesa di dati fiscali).

### 6.3 Authority Sources — Fonti Citate dall'AI

Questi domini sono stati utilizzati per costruire la risposta (RAG):

| Tipo | Fonti |
|------|-------|
| **Blog/Guide** | emergeitalia.it, shopify.com, digitale.co, klorofilla.com |
| **Directory/Ranking** | designrush.com, clutch.co, sortlist.com, semrush.com |
| **Social/Forum** | reddit.com (r/webagencies, r/smallbusiness, r/ItaliaCareerAdvice) |
| **News** | lmtonline.com, michigansthumb.com |
| **Academic** | arxiv.org |

**Implicazione strategica**: Per essere citati dall'AI, WebNovis deve essere presente su **almeno 3 di queste categorie**: directory (Clutch, Sortlist, DesignRush — vedi `docs/seo-strategy/Best-free-backlinks-platforms.MD`), forum (Reddit), e blog di settore italiani.

### 6.4 Pattern Linguistici e Istruzioni del Modello

- **Model Slug**: `gpt-5-2` (versione avanzata con search)
- **Tone Directive**: "Usa un umorismo pronto e intelligente... Assumi una visione orientata al futuro"
- **Entity Priority Tags**: L'AI usa `priority: 1` per risultati ad alta rilevanza e `priority: 0` per quelli secondari
- **Date-Forward Preference**: L'AI recupera contenuti che si proiettano nel futuro (es. "Top 10... in 2026"), confermando la strategia di usare date future nei title tag

### 6.5 Azioni Implementate dal LLM Sniffing

Sulla base dei dati estratti, sono state implementate le seguenti ottimizzazioni:

1. **ai.txt aggiornato a v3.0** — Aggiunte tutte le grounding queries (IT + EN), sezione posizionamento competitivo, lista competitor milanesi, differenziazione rispetto alla concorrenza
2. **webnovis-ai-data.json aggiornato a v3.0** — Aggiunto oggetto `ai_grounding_queries` con query IT/EN, `competitive_advantages`, 3 nuove FAQ GEO-optimized (PMI, confronto competitor Milano, AI readiness)
3. **Homepage FAQPage Schema espanso** — Da 5 a 8 FAQ con 3 nuove domande targeting grounding queries: "WebNovis è adatta per PMI?", "Perché scegliere WebNovis vs competitor Milano?", "Ottimizzazione per Google e AI?"
4. **Tutte 6 pagine servizio** — FAQPage Schema espanso da 3 a 5 FAQ ciascuna, con domande GEO-optimized targeting le grounding queries scoperte
5. **Meta tag `ai-content`** — Aggiunto su tutte le 8 pagine che ne erano prive (6 servizi + contatti + chi-siamo)

---

## TASK TRACKER — STATO IMPLEMENTAZIONE (aggiornato 16/02/2026)

### ✅ COMPLETATE

| # | Task | File modificati | Data |
|---|------|----------------|:----:|
| 1 | **ai.txt aggiornato a v3.0** — grounding keywords IT/EN, posizionamento competitivo, competitor, directory | `ai.txt` | 16/02 |
| 2 | **webnovis-ai-data.json aggiornato a v3.0** — `ai_grounding_queries`, `competitive_advantages`, 3 FAQ extra, metadata | `webnovis-ai-data.json` | 16/02 |
| 3 | **Meta tag `ai-content` aggiunto su 8 pagine** | `servizi/sviluppo-web.html`, `servizi/graphic-design.html`, `servizi/social-media.html`, `servizi/ecommerce.html`, `servizi/landing-page.html`, `servizi/sito-vetrina.html`, `contatti.html`, `chi-siamo.html` | 16/02 |
| 4 | **Homepage FAQPage Schema espanso** — da 5 a 8 FAQ, 3 nuove GEO-optimized | `index.html` | 16/02 |
| 5 | **sviluppo-web.html FAQPage Schema espanso** — da 5 a 8 FAQ, +3 domande (PMI, web agency Milano, CMS custom) | `servizi/sviluppo-web.html` | 16/02 |
| 6 | **ecommerce.html FAQPage Schema espanso** — da 3 a 5 FAQ, +2 domande (PMI, SEO/AI) | `servizi/ecommerce.html` | 16/02 |
| 7 | **sito-vetrina.html FAQPage Schema espanso** — da 3 a 5 FAQ, +2 domande (attività locale, AI readiness) | `servizi/sito-vetrina.html` | 16/02 |
| 8 | **landing-page.html FAQPage Schema espanso** — da 3 a 5 FAQ, +2 domande (PMI, SEO/AI) | `servizi/landing-page.html` | 16/02 |
| 9 | **graphic-design.html FAQPage Schema espanso** — da 3 a 5 FAQ, +2 domande (PMI, differenza logo vs brand identity) | `servizi/graphic-design.html` | 16/02 |
| 10 | **social-media.html FAQPage Schema espanso** — da 3 a 5 FAQ, +2 domande (PMI, piattaforme) | `servizi/social-media.html` | 16/02 |
| 11 | **Report SEO aggiornato** — integrazione LLM sniffing, task tracker | `docs/seo-strategy/REPORT-SEO-AVANZATO-2026.md` | 16/02 |

### ⏳ IN ATTESA (dipendenze esterne)

| # | Task | Stato | Blocco |
|---|------|:-----:|--------|
| 12 | **Bing Webmaster Tools** — registrato, in attesa elaborazione dati | ⏳ | Elaborazione dati in corso |
| 13 | **Bing Places** — registrato, in attesa PIN postale | ⏳ | PIN postale non ancora ricevuto |
| 14 | **Google Business Profile** — critico per entity_lookup AI | ⏳ | In attesa definizione dati fiscali. **PRIORITÀ MASSIMA** quando disponibili — tutti i competitor hanno GBP con Place ID strutturato |

### 📋 DA IMPLEMENTARE — PROSSIME SESSIONI

#### Priorità ALTA (Settimana 1-2)

| # | Task | Impatto | Sforzo stimato |
|---|------|:-------:|:--------------:|
| 15 | **Content Refresh top 5 articoli** — citation blocks 40-60 parole sotto ogni H2, statistiche con fonte ogni 200 parole, data "Ultimo aggiornamento" visibile | 🔥🔥🔥 | 2-3 ore/articolo |
| 16 | **Architettura Pillar-Cluster** — mappa linking bidirezionale tra i 20 articoli, definire 5-6 pillar, implementare link interni | 🔥🔥🔥 | 4-5 ore |
| 17 | **Link da blog a pagine servizio** — aggiungere 1-2 link contestuali da ogni articolo blog alla pagina servizio correlata (max 10-15% dei link totali) | 🔥🔥 | 2-3 ore |
| 18 | **CTA inline nei blog articles** — 2-3 per articolo, contestuali al contenuto | 🔥🔥 | 1-2 ore |
| 19 | **Directory submissions** — Clutch, Sortlist, DesignRush, GoodFirms, PagineGialle (vedi `docs/seo-strategy/Best-free-backlinks-platforms.MD` per la lista completa) | 🔥🔥🔥 | 4-5 ore |

#### Priorità MEDIA (Settimana 3-4)

| # | Task | Impatto | Sforzo stimato |
|---|------|:-------:|:--------------:|
| 20 | **Content Refresh restanti 15 articoli** — stessa operazione del task 15 | 🔥🔥 | Batch con auto-writer in modalità refresh |
| 21 | **LLM Source Sniffing round 2** — nuove query per keyword commerciali rimanenti | 🔥🔥 | 2-3 ore |
| 22 | **Calcolatore Costo Sito Web** — micro-tool su `/tools/calcolatore-costo-sito` | 🔥🔥🔥 | 1-2 giorni dev |
| 23 | **Lead magnet #1** — Checklist SEO 2026 PDF (content upgrade per seo-per-piccole-imprese.html) | 🔥🔥 | 3-4 ore |
| 24 | **Google Alerts** — setup per "WebNovis" e "Web Novis" | 🔥 | 10 min |
| 25 | **Profili social extra** — Facebook Business, LinkedIn Company Page, Twitter/X | 🔥🔥 | 1-2 ore |

#### Priorità BASSA (Mese 2+)

| # | Task | Impatto | Sforzo stimato |
|---|------|:-------:|:--------------:|
| 26 | **Infografiche su Unsplash/Pexels** — 3-5 asset visivi per passive link building | 🔥 | Ongoing |
| 27 | **Guest post** — 2-3 articoli su blog italiani (Connect.gt, Ninja Marketing, etc.) | 🔥🔥 | 3-5 ore/articolo |
| 28 | **Exit-intent popup** — con lead magnet pertinente per pagine blog | 🔥 | 2-3 ore |
| 29 | **Schema Person per fondatori** — author byline con credenziali su ogni articolo | 🔥🔥 | 2-3 ore |
| 30 | **Recensioni Google** — richiedere ai 5 clienti (Franco, Luis, Luca, Sara, Mimmo) su GBP | 🔥🔥 | Dopo creazione GBP |

---

*Report generato il 16/02/2026 — Aggiornato con LLM Sniffing data e task tracker — Revisione consigliata: settimanale*
