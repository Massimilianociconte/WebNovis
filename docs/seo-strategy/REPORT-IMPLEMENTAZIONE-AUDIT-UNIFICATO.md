# REPORT DI IMPLEMENTAZIONE UNIFICATO — WebNovis
## Cross-reference: Otterly.AI + Analisi Mista Accessibilità + Audit SEO Unificato
### Data: 21 Febbraio 2026

---

## 0. METODOLOGIA

Questo report incrocia i dati di **3 documenti di audit** (Otterly.AI Content + Crawlability, Analisi Mista 5 fonti, Audit SEO Unificato 4 fonti) con lo **stato reale attuale del codebase** verificato riga per riga. Ogni azione è classificata come:

- ✅ **GIÀ RISOLTO** — presente nel codebase, nessuna azione richiesta
- 🔴 **DA IMPLEMENTARE** — confermato mancante, azione necessaria
- 🟡 **PARZIALE** — parzialmente implementato, richiede completamento
- ⚪ **ESTERNO** — richiede azione manuale fuori dal codebase

---

## 1. STATO ATTUALE vs AUDIT — TRIAGE COMPLETO

### ✅ GIÀ RISOLTI (nessuna azione)

| # | Issue segnalata | Stato reale |
|---|---|---|
| 1 | **Crawler AI bloccati nel robots.txt** | ✅ RISOLTO — GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot, Bytespider, meta-externalagent, Amazonbot tutti su `Allow: /` |
| 2 | **Sitemap non dichiarata nel robots.txt** | ✅ RISOLTO — `Sitemap: https://www.webnovis.com/sitemap.xml` presente in riga 5 |
| 3 | **Email generica @gmail.com** | ✅ RISOLTO — usa `hello@webnovis.com` ovunque |
| 4 | **Schema.org mancante/incompleto** | ✅ RISOLTO — 6 blocchi JSON-LD interlinked (Organization, WebSite, LocalBusiness, WebPage, BreadcrumbList, FAQPage 8 Q&A) |
| 5 | **Open Graph incompleto** | ✅ RISOLTO — og:type, og:title, og:url, og:image, og:site_name, og:locale presenti |
| 6 | **Google Analytics non installato** | ✅ RISOLTO — GA4 con Consent Mode v2 su tutte le pagine |
| 7 | **Facebook Pixel non installato** | ✅ RISOLTO — Meta Pixel (ID 1405109048327436) consent-gated su tutte le pagine |
| 8 | **Microsoft Clarity non installato** | ✅ RISOLTO — Clarity (project vjbr983er7) consent-gated |
| 9 | **Alt mancanti su immagini** | ✅ RISOLTO — 17/17 `<img>` hanno attributo `alt` |
| 10 | **llms.txt mancante** | ✅ RISOLTO — presente e referenziato in robots.txt |
| 11 | **Contatti dedicati** | ✅ RISOLTO — /contatti.html pagina dedicata presente |
| 12 | **Google Business Profile** | ✅ RISOLTO — GBP attivo, schema LocalBusiness completo |

---

### 🔴 DA IMPLEMENTARE — PRIORITÀ CRITICA

#### 1.1 — H1 concatenato illeggibile per AI/LLM
**Fonti:** Otterly (55%), STO (55/100), Audit Unificato, Analisi Mista
**Stato attuale:**
```html
<h1 class="hero-title">
  <span class="glitch gradient-text">Agenzia Digitale</span> che
  <span class="highlight-gold">Accende</span><br> la tua
  <span class="hero-rotating-wrapper">
    <span class="hero-rotating-word active">visibilità</span>
    <span class="hero-rotating-word">crescita</span>
    <span class="hero-rotating-word">identità</span>
    <span class="hero-rotating-word">presenza</span>
  </span>
</h1>
```
**Problema:** I crawler leggono: "Agenzia Digitale che Accende la tua visibilitàcrescitaidentitàpresenza" — parole concatenate senza spazi, 72+ caratteri.
**Soluzione:**
1. Aggiungere un `<span class="sr-only">` con il testo completo leggibile per screen reader e crawler
2. Nascondere le rotating words ai crawler con `aria-hidden="true"`
3. Oppure: impostare la prima parola come testo statico nel DOM e le altre come decorative
**Impatto:** Readability AI +20%, H1 score 55→90/100

#### 1.2 — Counter animati partono da 0 nel DOM
**Fonti:** Otterly, Analisi Mista, Audit Unificato
**Stato attuale:**
```html
<span class="counter-value" data-target="100">0</span>%  <!-- Clienti Soddisfatti -->
<span class="counter-value" data-target="50">0</span>%   <!-- Crescita Media Online -->
```
**Problema:** Crawler/AI leggono "+0% Clienti Soddisfatti" e "+0% Crescita Media Online" — dato devastante per reputazione brand nelle risposte AI generate.
**Soluzione:**
1. Inserire il valore finale hardcoded nell'HTML: `<span class="counter-value" data-target="100">100</span>`
2. Il JS di animazione partirà comunque da 0 visivamente (già usa `element.textContent = current`)
3. Aggiungere `<noscript>` fallback per ambienti senza JS
**Impatto:** Brand reputation AI intatta, Content score +15%

#### 1.3 — Manca `twitter:description` meta tag
**Fonti:** STO (75/100), Audit Unificato
**Stato attuale:** Presenti `twitter:card`, `twitter:url`, `twitter:title`, `twitter:image` — manca SOLO `twitter:description`.
**Soluzione:** Aggiungere:
```html
<meta content="Web Novis è un'agenzia web a Milano (Rho) specializzata in sviluppo siti, grafica, brand identity e social media. Preventivo gratuito — contattaci oggi." property="twitter:description">
```
**Impatto:** Social score 75→100/100

#### 1.4 — Title tag troppo lungo (72 caratteri)
**Fonti:** SEOptimer, STO (70/100), Audit Unificato
**Stato attuale:** `Agenzia Web a Milano e Rho • Web Novis — Sviluppo Siti, Grafica e Social` (72 car)
**Target:** 55-66 caratteri
**Proposta (62 car):** `Agenzia Web Milano e Rho • Web Novis — Siti, Grafica, Social`
**Alternativa (58 car):** `Web Novis — Agenzia Web a Milano e Rho | Siti e Grafica`
**Impatto:** Title score 70→95/100

#### 1.5 — Manca Summary Block per AI extraction (dopo hero)
**Fonti:** Otterly (30%), Analisi Mista, Audit Unificato
**Stato attuale:** Nessun elemento `summary-block` o equivalente presente.
**Soluzione:** Inserire subito dopo l'hero un blocco semantico compatto:
```html
<section class="ai-summary" aria-label="In sintesi">
  <div class="container">
    <p><strong>Web Novis</strong> è un'agenzia web con sede a Rho (Milano) specializzata in
    sviluppo siti web custom, graphic design e social media advertising.
    Prezzi: landing page da €500, siti vetrina da €1.200, e-commerce da €3.500.
    Consegna: 2–6 settimane. Codice 100% proprietario, nessun template.
    <a href="preventivo.html">Preventivo gratuito</a> |
    <a href="tel:+393802647367">+39 380 264 7367</a></p>
  </div>
</section>
```
**Design:** Può essere compatto, elegante, con font-size ridotto e sfondo leggero — visibile sia a umani che AI. NON hidden.
**Impatto:** AI Readiness Summary 30→90%, estrazione LLM drasticamente migliorata

#### 1.6 — Title attribute mancante su 47/47 tag `<a>`
**Fonti:** STO (2/100), Audit Unificato
**Stato attuale:** 0 link su 47 hanno `title` attribute.
**Soluzione:** Aggiungere `title` descrittivo a tutti i link. Esempi:
- Nav: `title="Scopri i servizi Web Novis"`, `title="Portfolio progetti realizzati"`
- Footer: `title="Privacy Policy Web Novis"`, `title="Seguici su Instagram"`
- CTA: `title="Richiedi preventivo gratuito"`
**Impatto:** Link accessibility score 2→85/100

#### 1.7 — Chatbot Weby inietta testo nel DOM principale
**Fonti:** Otterly, Analisi Mista, Audit Unificato
**Stato attuale:** Il chatbot HTML (bottone, popup, messaggi, quick-replies) è direttamente nel DOM. I crawler leggono "Ciao! Sono Weby 👋 Il tuo assistente personale WebNovis!" come contenuto della pagina.
**Soluzione (preservando UX):**
1. Wrappare TUTTO il chatbot in un `<aside>` con `role="complementary"` e `aria-label="Assistente virtuale"`
2. Aggiungere `data-nosnippet` attribute al container per escludere da Google snippet
3. Idealmente: lazy-load il markup chatbot solo al primo click/hover sul bottone (JS injection)
**Impatto:** Pulizia semantica DOM, AI Content score +10%

---

### 🔴 DA IMPLEMENTARE — PRIORITÀ ALTA

#### 2.1 — Sezione "Il Nostro Metodo" duplicata
**Fonti:** Otterly (60%), Analisi Mista, Audit Unificato
**Stato attuale:** "Il Nostro Metodo" appare **2 volte** nell'HTML.
**Problema aggiuntivo:** I tempi sono ambigui — "2–6 settimane" vs somma fasi che dà 17-30 giorni lavorativi.
**Soluzione:**
1. Rimuovere la sezione duplicata, mantenere una sola
2. Allineare i tempi: specificare che 2–4 settimane per landing/siti semplici, 4–6 per e-commerce, con breakdown dettagliato
**Impatto:** Section Integrity 60→90%, eliminazione "allucinazioni" AI sui tempi

#### 2.2 — Keyword agenzia/Milano/Rho/grafica insufficienti nel body
**Fonti:** STO (56/100 coerenza Title↔Body, 43/100 coerenza H1↔Body)
**Stato attuale:** Le keyword del title (agenzia, Milano, Rho, grafica) e dell'H1 (accende, visibilità, crescita) non sono sufficientemente ripetute nel body text.
**Soluzione:** Inserire 3-5 occorrenze naturali di ciascuna keyword nelle sezioni principali (servizi, metodo, FAQ, CTA). Non keyword stuffing — integrazione naturale.
**Impatto:** Coerenza Title↔Body 56→80%, H1↔Body 43→75%

#### 2.3 — Indirizzo e telefono non visibili nel body/footer
**Fonti:** Audit Unificato (FAIL), STO
**Stato attuale:** L'indirizzo e il telefono sono SOLO nel JSON-LD, NON nel footer HTML visibile.
**Soluzione:** Aggiungere al footer:
```html
<div class="footer-contact-info" itemscope itemtype="https://schema.org/LocalBusiness">
  <address>
    <span itemprop="streetAddress">Via S. Giorgio, 2</span>,
    <span itemprop="postalCode">20017</span>
    <span itemprop="addressLocality">Rho</span> (MI) —
    <a href="tel:+393802647367" itemprop="telephone" title="Chiama Web Novis">+39 380 264 7367</a> —
    <a href="mailto:hello@webnovis.com" itemprop="email" title="Scrivi a Web Novis">hello@webnovis.com</a>
  </address>
</div>
```
**Impatto:** Local SEO FAIL→PASS, NAP consistency rafforzata

#### 2.4 — Link esterni autorevoli assenti
**Fonti:** Otterly (80%), Analisi Mista
**Stato attuale:** Poche risorse esterne citate (solo policy interne).
**Soluzione:** Aggiungere 2-3 link autorevoli nel body:
- Link a Google PageSpeed Insights nella sezione performance
- Link a W3C nella sezione accessibilità
- Link a GDPR.eu nella sezione privacy/compliance
**Impatto:** External Link Suggestions 80→95%, E-E-A-T boost

---

### 🔴 DA IMPLEMENTARE — PRIORITÀ MEDIA

#### 3.1 — Jargon e buzzword senza contesto operativo
**Fonti:** Otterly (65%), Audit Unificato
**Problema:** "Ultra Performance", "100% Responsive", "Design UI/UX curato nei minimi dettagli" — frasi senza metriche.
**Soluzione:** Affiancare ogni claim con dato misurabile:
- "Ultra Performance" → "Performance: LCP <2s desktop, PageSpeed 90+"
- "100% Responsive" → "Ottimizzato per ogni dispositivo, testato su 12+ breakpoint"
- "SEO Integrata" → "SEO tecnica: schema markup, sitemap XML, Core Web Vitals ottimizzati"
**Impatto:** Jargon score 65→85%, Specificity 65→80%

#### 3.2 — FAQ con risposte troppo lunghe
**Fonti:** Otterly (75%), Audit Unificato
**Soluzione:** Per ogni FAQ, prima frase = micro-risposta diretta (snippet-ready), poi dettaglio.
**Esempio:**
- **Attuale:** "Web Novis offre tre servizi principali: Sviluppo Web (siti web, e-commerce, landing page, web app), Graphic Design e Branding..."
- **Ottimizzata:** "**Sì — tre servizi: Sviluppo Web, Graphic Design e Social Media Marketing.** Nello specifico: siti web, e-commerce, landing page..."
**Impatto:** Readability 75→90%, snippet eligibility migliorata

#### 3.3 — Mancano moduli comparativi pacchetti
**Fonti:** Otterly (50%), Audit Unificato
**Soluzione:** Aggiungere tabella comparativa pacchetti (Landing vs Sito Vetrina vs E-commerce) con colonne: prezzo, tempi, pagine, funzionalità incluse, CTA.
**Impatto:** Modular Content 50→80%

#### 3.4 — Acronimi senza definizione
**Fonti:** Otterly (60%)
**Problema:** SEO, UI/UX, GA4, CTA usati senza definizione.
**Soluzione:** Prima occorrenza con definizione inline (es. "SEO (ottimizzazione per i motori di ricerca)") oppure tag `<abbr title="...">`.
**Impatto:** Acronyms score 60→85%, accessibilità migliorata

---

### 🟡 PARZIALI — DA COMPLETARE

#### 4.1 — Alt text immagini: presenti ma generici
**Fonti:** Otterly (Illustration Opportunities 80%), Analisi Mista
**Stato:** Tutte le 17 immagini hanno `alt`, ma alcuni sono generici. Verificare e arricchire con descrizioni specifiche per il portfolio (es. `alt="Mockup sito e-commerce Ember & Oak con carrello e checkout custom sviluppato da Web Novis"`).

#### 4.2 — Coerenza toni (formale vs informale)
**Fonti:** Otterly (70%)
**Stato:** Il chatbot Weby usa tono colloquiale ("Ciao!"), le sezioni servizi sono più neutre, le policy sono formali. Mantenere ma isolare meglio: chatbot colloquiale in aside, servizi professionali, policy formale.

---

### ⚪ ESTERNI — AZIONI MANUALI

| # | Azione | Stato |
|---|---|---|
| 1 | **Redirect HTTP→HTTPS 301 diretto** — Configurare in Cloudflare senza redirect chain (STO 0/100) | Da fare in Cloudflare dashboard |
| 2 | **Mixed Content** — Eliminare 1 richiesta HTTP residua (STO 0/100) | Da identificare e fixare |
| 3 | **Record SPF email** — Mancante per email deliverability | Da aggiungere in DNS |
| 4 | **WAF Cloudflare** — Creare bypass rules per User-Agent AI bot (PerplexityBot, GPTBot, etc.) | Da fare in Cloudflare dashboard |
| 5 | **Profilo X (Twitter)** — Mancante (STO 75/100 Social) | Creazione manuale |
| 6 | **Canale YouTube** — Mancante | Creazione manuale |
| 7 | **Campagna backlink building** — Nessun backlink significativo rilevato | Strategia ongoing |

---

## 2. PIANO DI ESECUZIONE (Sprint)

### Sprint 1 — Fix immediati nel codebase (1-2 ore)
1. ✏️ Aggiungere `twitter:description` meta tag su index.html
2. ✏️ Accorciare title tag a 58-62 caratteri
3. ✏️ Hardcode valori counter (0→100 e 0→50)
4. ✏️ Fix H1: aggiungere `aria-hidden` + `sr-only` span leggibile
5. ✏️ Aggiungere indirizzo + telefono visibili nel footer

### Sprint 2 — Arricchimento semantico (2-4 ore)
6. ✏️ Inserire Summary Block dopo hero
7. ✏️ Wrappare chatbot Weby in `<aside>` con `data-nosnippet`
8. ✏️ Aggiungere `title` attribute a tutti i 47 tag `<a>`
9. ✏️ Consolidare sezione "Il Nostro Metodo" duplicata
10. ✏️ Inserire keyword mancanti nel body (agenzia, Milano, Rho, grafica)

### Sprint 3 — Qualità contenuto (2-3 ore)
11. ✏️ Sostituire buzzword con metriche misurabili
12. ✏️ Ottimizzare FAQ con micro-risposte + dettaglio
13. ✏️ Aggiungere definizioni acronimi (<abbr>)
14. ✏️ Aggiungere link esterni autorevoli (PageSpeed, W3C, GDPR.eu)
15. ✏️ Arricchire alt text immagini portfolio

### Sprint 4 — Produzione
16. 🔨 `node build.js` per rigenerare tutti i file minificati
17. 🔍 Verifica output minificato con controlli specifici
18. 🚀 Deploy

---

## 3. IMPATTO STIMATO POST-IMPLEMENTAZIONE

| Metrica | Attuale | Stimato post-fix |
|---|---|---|
| **Otterly Readiness** | 63% | **85-90%** |
| **Otterly Content** | 56% | **78-85%** |
| **Otterly Structure** | 79% | **88-92%** |
| **SEOptimer Score** | B (66/100) | **A- (78-82)** |
| **STO Score** | 85.9/100 | **92-95** |
| **STO Title** | 70/100 | **95/100** |
| **STO H1** | 55/100 | **90/100** |
| **STO HTTPS** | 0/100 | **100/100** (con fix Cloudflare) |
| **STO Social** | 75/100 | **100/100** |
| **STO Link Title** | 2/100 | **85/100** |
| **AI Bot Access** | ✅ Allow | ✅ Allow (+ WAF bypass) |
| **Summary Block** | ❌ Assente | ✅ Presente |
| **Counter DOM** | ❌ 0% | ✅ Valori reali |
| **Local SEO Footer** | ❌ NAP assente | ✅ NAP visibile |

---

## 4. PRINCIPI GUIDA IMPLEMENTAZIONE

1. **Eleganza prima di tutto** — Ogni modifica deve migliorare o mantenere invariata l'esperienza visiva per il visitatore umano
2. **Semantic dual-layer** — Ogni elemento ha un livello visivo (umani) e un livello semantico (AI/crawler), mai in conflitto
3. **Progressive enhancement** — Il contenuto base deve essere perfettamente leggibile senza JS; JS aggiunge solo animazioni/interazioni
4. **No file minificati in dev** — Si lavora su file sorgente; `node build.js` solo per produzione finale
5. **Verifica post-build** — Dopo ogni build, controllo stringhe critiche nei file .min.*
