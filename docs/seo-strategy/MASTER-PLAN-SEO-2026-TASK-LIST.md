# MASTER PLAN SEO WEB NOVIS 2026 — Audit & Task List Operativa

**Data analisi:** 21 Febbraio 2026
**Basato su:** Master Report Integrato SEO v5.0 ("The Bible")
**Metodo:** Confronto riga per riga del report vs. codice reale nel repository

---

## LEGENDA STATI

- ✅ **IMPLEMENTATO** — Presente e funzionante nel codice
- 🔶 **PARZIALE** — Presente ma incompleto o da migliorare
- ❌ **NON IMPLEMENTATO** — Assente, da creare
- 🔧 **MANUALE/ESTERNO** — Richiede azione fuori dal codice (GBP, piattaforme esterne, etc.)

---

## SEZIONE 1 — EXECUTIVE SUMMARY (Razionale Strategico)

Nessuna azione di codice richiesta. Il razionale è corretto e allineato con la struttura attuale del sito.

---

## SEZIONE 2 — FUNNEL SYMPTOM-TO-SERVICE

### 2.1 TOFU — Symptom Layer (Pillar Pages diagnostiche)

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Pillar Page "Sito web che non converte" (3500-5000 parole) | ❌ | Nessun articolo dedicato. Esiste `ottimizzazione-tasso-conversione.html` ma non è una guida diagnostica "symptom" |
| Pillar Page "Perché il mio sito non appare su Google" | ❌ | Nessun articolo dedicato. `seo-per-piccole-imprese.html` tocca il tema ma non è strutturato come symptom |
| Pillar Page "Sito WordPress lento o hackato" | ❌ | `velocita-sito-web-guida.html` copre velocità generica, non il symptom WordPress specifico |
| Struttura: ogni pillar termina con "Come Web Novis ha risolto questo problema" + link a servizio | ❌ | I blog articles hanno CTA inline ma non case study specifici integrati |
| 70% del traffico target su contenuti symptom | ❌ | Blog attuale è prevalentemente MOFU informativo, non TOFU symptom |

**TASK:**
- [ ] **T2.1a** — Creare pillar page `blog/sito-web-che-non-converte.html` (3500+ parole, guida diagnostica, FAQ 12+, case study integrato, CTA a servizi)
- [ ] **T2.1b** — Creare pillar page `blog/sito-non-appare-su-google.html` (3500+ parole, checklist 23 punti come da report)
- [ ] **T2.1c** — Creare pillar page `blog/sito-wordpress-lento-hackerato.html` (3500+ parole, guida fix + CTA manutenzione)
- [ ] **T2.1d** — Aggiungere topic "sito-web-che-non-converte", "sito-non-appare-su-google", "sito-wordpress-lento-hackerato" a `blog/topics-queue.json` con tag "Symptom" e funnel_stage "TOFU"
- [ ] **T2.1e** — Aggiornare `blog/build-articles.js` per supportare articles più lunghi (3500-5000 parole) e sezione "Come Web Novis ha risolto questo problema" obbligatoria
- [ ] **T2.1f** — Aggiungere nuovi articoli a sitemap.xml

### 2.2 MOFU — Diagnostic Layer (Lead Magnet & Conversione)

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Audit gratuito (tool interattivo) | ❌ | Nessun tool di audit. Solo form contatti standard |
| Checklist EAA scaricabile | ❌ | Blog articles su EAA esistono ma nessun PDF/download |
| Calcolatore preventivo interattivo | ❌ | `preventivo.html` ha form standard, non calcolatore interattivo |
| Tasso di conversione target 12-18% | ❌ | Nessun sistema di tracking conversioni MOFU |

**TASK:**
- [ ] **T2.2a** — Creare pagina `/audit-gratuito.html` con mini-tool diagnostico (form multi-step: URL sito, settore, problemi percepiti → output automatico con score e raccomandazioni base → CTA per audit completo)
- [ ] **T2.2b** — Creare lead magnet PDF "Checklist Accessibilità EAA 2026" — implementare come content-upgrade gate nei blog articles EAA (form email → redirect a PDF)
- [ ] **T2.2c** — Trasformare `preventivo.html` in calcolatore interattivo: aggiungere JS che calcola range di prezzo in tempo reale basato su selezioni (tipo sito, n. pagine, funzionalità, urgenza)
- [ ] **T2.2d** — Aggiungere a sitemap.xml

### 2.3 BOFU — Transactional Layer

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Pagine servizio verticali | ✅ | 7 pagine servizio: sviluppo-web, ecommerce, landing-page, sito-vetrina, graphic-design, social-media, index |
| Case study con metriche "forensic" | 🔶 | 11 case study esistono (`portfolio/case-study/`) ma sono descrittivi. Nessun dato concreto: nessun "+34% conversioni", nessuno screenshot Analytics, nessun Prima/Dopo con numeri |
| Preventivo interattivo | 🔶 | Form presente ma non interattivo (vedi T2.2c) |

**TASK:**
- [ ] **T2.3a** — Arricchire TUTTI gli 11 case study con dati "forensic": aggiungere sezione "Risultati Misurabili" con metriche concrete (LCP prima/dopo, PageSpeed score, tempo di caricamento, etc.) — anche se simulati/realistici per progetti demo
- [ ] **T2.3b** — Aggiungere schema `Review` agli case study che hanno testimonianze
- [ ] **T2.3c** — Creare template case study arricchito in `blog/build-articles.js` o separato per portfolio

---

## SEZIONE 3 — AEO (Answer Engine Optimization)

### 3.1 Entity Home

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Pagina Chi Siamo con Organization schema | ✅ | `chi-siamo.html` ha AboutPage + Organization + Person schema |
| Person schema per fondatori con knowsAbout | ✅ | Person "Massimiliano" con jobTitle, knowsAbout (12 skills), worksFor |
| sameAs a LinkedIn e profili autorevoli | ✅ | Organization sameAs ha 15+ profili (Instagram, Facebook, Clutch, Trustpilot, Wikidata, Crunchbase, DesignRush, LinkedIn, etc.) |
| Wikidata Q138340285 collegato | ✅ | Presente in sameAs Organization su index.html |

**Nessuna task aggiuntiva** — Entity Home è solida. Unico miglioramento possibile:
- [ ] **T3.1a** — Aggiungere foto reale del fondatore al Person schema (attualmente usa logo) — *solo se l'utente vuole uscire dall'anonimato*
- [ ] **T3.1b** — Aggiungere `sameAs` personale LinkedIn del fondatore al Person schema (attualmente punta al company LinkedIn) — *idem, solo se vuole*

### 3.2 Conversational FAQ

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| 12-15 FAQ per contenuto | 🔶 | La maggior parte delle pagine ha 3-8 FAQ. `agenzia-web-rho.html` ne ha 7, `servizi/sviluppo-web.html` ne ha 8. Nessuna pagina raggiunge 12-15 |
| FAQ in linguaggio naturale vocale | 🔶 | Le FAQ sono in italiano naturale ma non coprono pattern vocali specifici ("Ok Google, trovami...", "Qual è il migliore...") |
| FAQPage schema markup | ✅ | Presente su tutte le pagine principali e blog articles |

**TASK:**
- [ ] **T3.2a** — Espandere FAQ a 12-15 su TUTTE le pagine servizio (sviluppo-web, ecommerce, landing-page, sito-vetrina, graphic-design, social-media)
- [ ] **T3.2b** — Espandere FAQ a 12-15 sulle landing page geo (agenzia-web-rho, agenzia-web-milano)
- [ ] **T3.2c** — Aggiungere FAQ con pattern vocali italiani: "Ok Google, trovami un web designer a Rho", "Quanto costa fare un sito web?", "Qual è la migliore web agency a Milano?"
- [ ] **T3.2d** — Usare gli stessi formati come H2/H3 nel body content (non solo nello schema JSON-LD)

### 3.3 Video Short (YouTube)

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Video 90-120 secondi su YouTube | ❌ | Nessun video |
| VideoObject schema | ❌ | Non presente su nessuna pagina (trovato solo nei docs strategici) |
| Trascrizione completa | ❌ | N/A |

**TASK:**
- [ ] **T3.3a** — 🔧 MANUALE: Creare 3-5 video short (90-120s) su temi core: "Quanto costa un sito web?", "3 errori comuni dei siti aziendali", "EAA: il tuo sito è a norma?", "WordPress vs Codice Custom", "Come scegliamo i colori per un brand"
- [ ] **T3.3b** — 🔧 MANUALE: Caricare su YouTube con titoli SEO, descrizioni con link al sito, tag
- [ ] **T3.3c** — Dopo upload: aggiungere VideoObject schema alle pagine corrispondenti (embed video + schema con name, thumbnailUrl, uploadDate, description, duration, contentUrl, transcript)
- [ ] **T3.3d** — Creare `/video-sitemap.xml` e linkare da robots.txt

### 3.4 Monitoraggio AIO

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Tool Otterly.ai o Mention per citazioni AI | ❌ | Nessun monitoraggio |
| Obiettivo ≥15% impression AIO | ❌ | Nessun tracking |

**TASK:**
- [ ] **T3.4a** — 🔧 MANUALE: Iscriversi a Otterly.ai (free tier) per monitorare citazioni brand in AI Overviews
- [ ] **T3.4b** — 🔧 MANUALE: Configurare GSC per analizzare impression su query con AI Overview

---

## SEZIONE 4 — E-E-A-T (Experience, Expertise, Authoritativeness, Trust)

### Le 8 Regole

| # | Regola | Stato | Dettaglio |
|---|---|---|---|
| 1 | Author Box: autore reale, foto, bio, link LinkedIn | 🔶 | Blog usa "WebNovis Editorial Team" come autore (Person schema). NON c'è un autore reale individuale con foto e bio. Author box visuale è presente nel HTML ma con logo team, non foto persona |
| 2 | Case Study "Forensic" (metriche, screenshot) | ❌ | Case study sono descrittivi. Nessuna metrica concreta. Vedi T2.3a |
| 3 | Video Testimonianze con Review schema | ❌ | Nessun video e nessun Review schema su testimonianze |
| 4 | Backlink Locali (Assolombarda, Confcommercio) | 🔧 | Azione esterna |
| 5 | Trasparenza: pagina "Il nostro processo" | ✅ | `come-lavoriamo.html` completo con 5 fasi, timeline, ruoli, FAQ |
| 6 | Refresh contenuti ogni 90 giorni con dateModified | 🔶 | `dateModified` presente negli schema di tutte le pagine. Ma il content refresh non è sistematico — tutte le date sono concentrate su 2026-02-17/20 |
| 7 | GBP 50+ recensioni (rating 4.5-4.8) | 🔧 | Azione esterna. `aggregateRating` presente nello schema index.html |
| 8 | Niche Authority (keyword verticali) | ✅ | Blog copre ~50 argomenti verticali. 170 topic in queue |

**TASK:**
- [ ] **T4.1a** — Decidere se mantenere "WebNovis Editorial Team" o passare a un autore reale. Se sì → aggiornare AUTHOR_PROFILE in `blog/build-articles.js` con nome reale, foto reale, bio, LinkedIn personale
- [ ] **T4.1b** — Se si mantiene team: aggiungere almeno una bio più dettagliata e una foto team reale (non logo)
- [ ] **T4.3a** — 🔧 MANUALE: Raccogliere video-testimonianze dai clienti. Embeddarle nelle pagine con Review schema
- [ ] **T4.4a** — 🔧 MANUALE: Outreach a Confcommercio Milano, Camera di Commercio, Assolombarda per directory listing e backlink
- [ ] **T4.6a** — Implementare sistema di content refresh trimestrale: script che identifica articoli con `dateModified` > 90 giorni fa e genera report da aggiornare
- [ ] **T4.6b** — Aggiornare `blog/auto-writer.js` per supportare refresh di articoli esistenti (non solo nuovi)

---

## SEZIONE 5 — EAA & ACCESSIBILITÀ (Opportunità #1)

### 5.1 Offerta Commerciale EAA

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Service Page dedicata "Compliance EAA" | ❌ | Nessuna pagina `/servizi/accessibilita.html`. L'EAA è menzionato nel FAQ del ai-data.json e in 4 blog articles, ma non esiste come servizio dedicato |
| Audit Iniziale €890 | ❌ | Non presente in nessun pricing |
| Maintenance €49/mese monitoraggio accessibilità | 🔶 | Piano manutenzione €59/mese esiste ma non è specifico per accessibilità |
| Blog articles EAA | ✅ | 4 articoli: `european-accessibility-act-siti-web.html`, `normativa-accessibilita-web-2026.html`, `obblighi-legge-accessibilita-siti.html`, `strumenti-test-accessibilita.html` |

**TASK:**
- [ ] **T5.1a** — **PRIORITÀ MASSIMA**: Creare `/servizi/accessibilita.html` — pagina servizio dedicata "Compliance EAA & Accessibilità Web" con:
  - Hero: "Il tuo sito web è a norma? L'European Accessibility Act è in vigore"
  - Sezione sanzioni e obblighi (WCAG 2.1 AA)
  - Offerta: Audit Accessibilità €890, Adeguamento completo (preventivo), Monitoraggio continuo €49/mese
  - FAQ 12+ con FAQPage schema
  - Service schema con Offer pricing
  - Nota micro-imprese (<10 dipendenti) = esoneri parziali ma SEO benefit +12%
  - CTA alla pagina preventivo
- [ ] **T5.1b** — Aggiungere "Accessibilità" alla navigazione servizi su tutte le pagine
- [ ] **T5.1c** — Aggiungere al sitemap.xml
- [ ] **T5.1d** — Aggiornare `llms.txt`, `ai.txt`, `webnovis-ai-data.json` con nuovo servizio
- [ ] **T5.1e** — Aggiornare `chat-config.json` e `js/chat.js` con risposte EAA

### 5.2 Pillar Content EAA

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Pillar "Sanzioni sito non accessibile 2026" | ❌ | Nessun articolo dedicato specificamente alle sanzioni |
| Pillar "Adeguamento EAA Italia" | 🔶 | `normativa-accessibilita-web-2026.html` copre parzialmente ma non è una pillar page 3500+ parole |

**TASK:**
- [ ] **T5.2a** — Creare pillar `blog/sanzioni-sito-non-accessibile-2026.html` (KD 10-15, traffico in esplosione +300%) — 3500+ parole con tabella sanzioni, timeline, settori obbligati, come adeguarsi
- [ ] **T5.2b** — Espandere `normativa-accessibilita-web-2026.html` a pillar completa (3500+ parole) O creare nuova `blog/adeguamento-eaa-italia-guida.html`
- [ ] **T5.2c** — Aggiungere internal linking bidirezionale tra i 4 blog EAA + nuova service page + nuove pillar

### 5.3 WCAG Audit del Proprio Sito

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Audit con axe DevTools | ❌ | Nessun audit WCAG documentato |
| Core Web Vitals risolti | ✅ | `web-vitals-reporter.js` presente, Lighthouse CI configurato in `.github/workflows/lighthouse-ci.yml` |

**TASK:**
- [ ] **T5.3a** — Eseguire audit WCAG con axe DevTools su tutte le pagine principali
- [ ] **T5.3b** — Correggere eventuali violazioni WCAG 2.1 AA (contrasto, alt text, struttura semantica, navigazione tastiera)
- [ ] **T5.3c** — Aggiungere attributi `aria-label`, `role` dove mancanti

---

## SEZIONE 6 — LOCAL SEO

### 6.1 Landing Pages Geografiche

| Città | Stato | Dettaglio |
|---|---|---|
| **Rho** | ✅ | `agenzia-web-rho.html` completa: LocalBusiness, ProfessionalService, Service, HowTo, FAQPage (7 FAQ), areaServed 12 città, GeoCircle 20km |
| **Milano** | ✅ | `agenzia-web-milano.html` completa: stessa struttura di Rho |
| **Lainate** | ❌ | Nessuna landing page dedicata (menzionata solo in areaServed) |
| **Arese** | ❌ | Idem |
| **Garbagnate Milanese** | ❌ | Idem |
| **Pero** | ❌ | Idem |
| **Bollate** | ❌ | Idem |

**TASK:**
- [ ] **T6.1a** — Creare 3-5 landing page aggiuntive: `agenzia-web-lainate.html`, `agenzia-web-arese.html`, `agenzia-web-garbagnate.html` (priorità), opzionali: `agenzia-web-pero.html`, `agenzia-web-bollate.html`
- [ ] **T6.1b** — Ogni pagina DEVE avere: 500+ parole di contenuto UNICO (non city-name swap), caso studio locale o testimonianza specifica, contesto area (es. "vicino al centro commerciale Il Centro di Arese"), Google Maps embed, LocalBusiness+ProfessionalService schema, FAQPage 7+, internal link a servizi
- [ ] **T6.1c** — **30%+ differenziazione** tra pagine per evitare doorway page penalty
- [ ] **T6.1d** — Aggiungere tutte al sitemap.xml
- [ ] **T6.1e** — Aggiungere a `llms.txt` e `ai.txt`

### 6.2 Google Business Profile

| Raccomandazione | Stato | Dettaglio |
|---|---|---|
| Categoria primaria: Web Designer | ✅ | Configurato (da memoria) |
| 4+ categorie secondarie | 🔧 | Da verificare su GBP reale |
| Post 4/settimana (foto reali) | 🔧 | Non implementato |
| Q&A: 10 domande manuali | 🔧 | Non implementato |
| QR code nativo per recensioni | 🔧 | Non implementato |
| Rispondere a TUTTE le review entro 24h | 🔧 | Non implementato |
| Foto geo-tagged mensili | 🔧 | Non implementato |

**TASK (tutte manuali/esterne):**
- [ ] **T6.2a** — 🔧 Verificare e aggiungere 4 categorie secondarie su GBP: Marketing Agency, Software Company, E-commerce Service, Graphic Designer
- [ ] **T6.2b** — 🔧 Creare calendario editoriale GBP: 4 post/settimana con foto reali (progetti, processo, team, risultati)
- [ ] **T6.2c** — 🔧 Popolare manualmente 10 Q&A su GBP (usare le FAQ dal sito)
- [ ] **T6.2d** — 🔧 Generare QR review da GBP Dashboard → inserire su fatture, email firma, biglietti da visita, pagina contatti del sito
- [ ] **T6.2e** — 🔧 Caricare foto geo-tagged mensilmente (EXIF con coordinate Rho)
- [ ] **T6.2f** — 🔧 Completare TUTTI gli attributi GBP: metodi pagamento, accessibilità, sostenibilità
- [ ] **T6.2g** — 🔧 Compilare Products e Services GBP con descrizioni keyword-enriched

---

## SEZIONE 7 — KEYWORD BIBLE

### Tier 1: Quick Wins (Mesi 1-3)

| Keyword | Stato | File/Azione |
|---|---|---|
| Conformità EAA / Sito Accessibile | 🔶 | 4 blog articles ma nessuna service page. Vedi T5.1a |
| Web Designer Rho | ✅ | `agenzia-web-rho.html` |
| Agenzia Web Rho | ✅ | Idem |
| Quanto costa un sito web | ✅ | `blog/quanto-costa-un-sito-web.html` |
| AI per piccole imprese / PMI | ✅ | `blog/intelligenza-artificiale-pmi.html` |
| Preventivo sito web | ✅ | `preventivo.html` |
| E-commerce per PMI | ✅ | `servizi/ecommerce.html` + `blog/ecommerce-che-vende.html` |
| Restyling sito web | ✅ | `blog/restyling-sito-web-quando-farlo.html` |

### Tier 2: Content Marketing & Symptom (Mesi 3-6)

| Keyword | Stato | File/Azione |
|---|---|---|
| Sito web che non converte | ❌ | Vedi T2.1a |
| Perché il mio sito non appare su Google | ❌ | Vedi T2.1b |
| Sito WordPress lento o hackato | ❌ | Vedi T2.1c |
| Quanto costa un logo | ✅ | `blog/quanto-costa-un-logo.html` |

---

## SEZIONE 8 — SCHEMA MARKUP (Correzioni Critiche)

### Stack Corretto vs. Attuale

| Tipo | Raccomandazione | Stato | Dettaglio |
|---|---|---|---|
| Home: Organization + LocalBusiness | ✅ | index.html ha entrambi con @id, interlinked, completi |
| Servizi: Service + FAQPage + Review | 🔶 | Service ✅ + FAQPage ✅ ma Review ❌ — nessun Review schema su pagine servizio |
| Blog: Article + Author + FAQPage | ✅ | BlogPosting + Person (author) + FAQPage su tutti gli articoli |
| Video: VideoObject | ❌ | Non esiste. Vedi T3.3c |
| **HowTo (DEPRECATO — da rimuovere)** | ⚠️ | **HowTo schema ANCORA PRESENTE** su: `agenzia-web-rho.html`, `agenzia-web-milano.html`, `come-lavoriamo.html`. Il report dice "Non usare HowTo (su desktop deprecato, mobile visibile ma a rischio)" |

**TASK:**
- [ ] **T8.1a** — ⚠️ **URGENTE**: Rimuovere HowTo schema da `agenzia-web-rho.html`, `agenzia-web-milano.html`, `come-lavoriamo.html`
- [ ] **T8.1b** — Aggiungere `Review` schema alle pagine servizio che hanno testimonianze visibili
- [ ] **T8.1c** — Dopo creazione video (T3.3): aggiungere VideoObject schema
- [ ] **T8.1d** — Verificare che nessuna pagina usi `QAPage` o `SpecialAnnouncement` (deprecati)

---

## SEZIONE 9 — ROADMAP OPERATIVA INTEGRATA

### 🔴 FASE 1: Fondamenta & Compliance (Settimane 1-4)

**Settimana 1 — Audit Tecnico + Fix Schema**
- [ ] T8.1a — Rimuovere HowTo schema deprecato (3 file)
- [ ] T5.3a — Audit WCAG con axe DevTools
- [ ] T5.3b — Correggere violazioni WCAG 2.1 AA
- [ ] T5.3c — Aggiungere aria-label/role mancanti
- [ ] Eseguire `node build.js` dopo ogni modifica

**Settimana 2 — Pagina Servizio EAA + Landing Geo**
- [ ] T5.1a — Creare `/servizi/accessibilita.html` (GOLD — KD 10-15)
- [ ] T5.1b — Aggiornare navigazione servizi
- [ ] T5.1c — Aggiornare sitemap.xml
- [ ] T5.1d — Aggiornare llms.txt, ai.txt, webnovis-ai-data.json
- [ ] T5.1e — Aggiornare chat-config.json e chat.js

**Settimana 3 — Landing Pages Geografiche**
- [ ] T6.1a — Creare 3 landing geo (Lainate, Arese, Garbagnate)
- [ ] T6.1b — Contenuto unico 500+ parole per ciascuna
- [ ] T6.1d — Aggiungere a sitemap.xml
- [ ] T6.2a — 🔧 Verificare categorie GBP
- [ ] T6.2c — 🔧 Popolare 10 Q&A su GBP

**Settimana 4 — FAQ Expansion + Entity Hardening**
- [ ] T3.2a — Espandere FAQ a 12-15 su tutte le pagine servizio
- [ ] T3.2b — Espandere FAQ sulle landing geo
- [ ] T3.2c — Aggiungere FAQ voice-optimized
- [ ] T3.2d — Usare stessi formati come H2/H3 nel body
- [ ] T8.1b — Aggiungere Review schema ai servizi

### 🟡 FASE 2: Produzione Symptom Content (Mesi 2-3)

**Mese 2 — Pillar Pages Symptom**
- [ ] T2.1a — Pillar "Sito web che non converte" (3500+ parole)
- [ ] T2.1b — Pillar "Sito non appare su Google" (3500+ parole)
- [ ] T2.1c — Pillar "Sito WordPress lento/hackato" (3500+ parole)
- [ ] T5.2a — Pillar "Sanzioni sito non accessibile 2026" (3500+ parole)
- [ ] T5.2b — Espandere/creare pillar "Adeguamento EAA Italia"
- [ ] T5.2c — Internal linking bidirezionale tra tutti i content EAA
- [ ] T2.3a — Arricchire case study con metriche forensic

**Mese 3 — MOFU Assets + Lead Magnets**
- [ ] T2.2a — Creare `/audit-gratuito.html` (mini-tool diagnostico)
- [ ] T2.2b — Creare lead magnet PDF "Checklist Accessibilità EAA 2026"
- [ ] T2.2c — Trasformare preventivo.html in calcolatore interattivo
- [ ] T4.6a — Script content refresh trimestrale
- [ ] T6.2b — 🔧 Avviare calendario editoriale GBP

### 🟢 FASE 3: Consolidamento & Scale (Mesi 3-6)

- [ ] T3.3a-d — 🔧 Produzione video short + VideoObject schema
- [ ] T6.1a — Landing geo aggiuntive (Pero, Bollate) se le prime 3 funzionano
- [ ] T4.4a — 🔧 Outreach locale (Confcommercio, Camera Commercio)
- [ ] T4.6b — Implementare content refresh automatico
- [ ] T3.4a — 🔧 Setup monitoraggio AIO (Otterly.ai)
- [ ] T6.2d — 🔧 QR code review + strategia recensioni
- [ ] Review trimestrale Keyword Strategy con dati GSC reali

---

## RIEPILOGO QUANTITATIVO

| Categoria | ✅ Implementato | 🔶 Parziale | ❌ Non Implementato | 🔧 Manuale |
|---|---|---|---|---|
| Funnel Symptom-to-Service | 2 | 3 | 8 | 0 |
| AEO & AI Overviews | 4 | 2 | 6 | 2 |
| E-E-A-T | 2 | 3 | 2 | 3 |
| EAA & Accessibilità | 2 | 2 | 5 | 0 |
| Local SEO | 2 | 0 | 5 | 7 |
| Keyword Bible | 7 | 1 | 3 | 0 |
| Schema Markup | 3 | 1 | 1 | 0 |
| **TOTALE** | **22** | **12** | **30** | **12** |

### Score Complessivo di Allineamento al Report: **~40%**

**Cosa è già forte:**
- Entity SEO (Wikidata, Crunchbase, sameAs completo)
- Schema markup base (Organization, LocalBusiness, WebSite, FAQPage, BlogPosting)
- Landing geo Rho/Milano
- Blog volume (50+ articoli, 170 topic in queue)
- Consent Mode v2, Meta Pixel, Clarity (tutti consent-gated)
- ai.txt, llms.txt, webnovis-ai-data.json (AI readiness)
- come-lavoriamo.html (trasparenza processo)
- preventivo.html (BOFU)
- Lighthouse CI + web-vitals-reporter

**Cosa manca di più critico:**
1. **Servizio EAA dedicato** (opportunità #1 del 2026, KD bassissima)
2. **Pillar Pages symptom** (zero contenuti TOFU diagnostici)
3. **Case study forensic** (nessuna metrica concreta)
4. **Lead magnets** (nessun download, nessun tool interattivo)
5. **HowTo deprecato** (ancora presente su 3 pagine — fix urgente)
6. **Landing geo Lainate/Arese/Garbagnate** (hinterland non coperto)
7. **Video** (zero presenza YouTube)
8. **FAQ troppo poche** (3-8 invece di 12-15)

---

## NOTE IMPLEMENTATIVE

1. **Dopo OGNI modifica CSS/JS**: eseguire `node build.js`
2. **Dopo nuove pagine HTML**: aggiornare `sitemap.xml`, `llms.txt`, `ai.txt`
3. **Blog articles via auto-writer**: possibile automatizzare le pillar usando `node blog/auto-writer.js` con topic customizzati, ma le pillar da 3500+ parole richiedono probabilmente editing manuale
4. **Le 3 pillar symptom** possono essere aggiunte a `topics-queue.json` come topic speciali con `"pillar": true`
5. **IndexNow**: dopo deploy di nuove pagine, eseguire `node indexnow-submit.js --all` per notificare i motori
