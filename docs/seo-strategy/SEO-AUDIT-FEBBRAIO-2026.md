# AUDIT SEO/GEO COMPLETO — WebNovis
## Agenzia Web Milano/Rho — Report Febbraio 2026 (v2 — 20/02/2026)

---

# 1. EXECUTIVE SUMMARY

**Valutazione complessiva: 80/100** *(era 73/100 al 18/02/2026 — +7 punti)*

WebNovis ha completato un ciclo intensivo di implementazione SEO/GEO che ha portato l'infrastruttura tecnica a livello enterprise. Il Knowledge Graph è ora un grafo bidirezionale completo (Organization ↔ Person), la sitemap è dinamica con `lastmod` reale, il traffico AI è tracciato in GA4, e tutte le pagine servizio sono ottimizzate per sistemi RAG con Answer Capsule e heading interrogativi.

**Criticità residue (nessuna code-level urgente):**
1. ✅ **Landing page geolocalizzate** — create `/agenzia-web-rho.html` e `/agenzia-web-milano.html` (20/02/2026) con LocalBusiness schema, FAQPage, HowTo, Speakable, Answer Capsule, contenuto locale autentico (Fiera Milano, logistica, territorio)
2. **Backlink profile debole** — nessun link editoriale da siti autorevoli
3. **Recensioni GBP insufficienti** — 5 recensioni (target: 20+)
4. **LinkedIn Company Page** — URL nel sameAs, stato operativo non confermato
5. ✅ **Brand monitoring** — Talkwalker + Google Alerts configurati (4 query ciascuno: `Web Novis`, `WebNovis`, `webnovis.com`, `www.webnovis.com`)

---

# 2. SCORE GLOBALE

| Area | v1 (18/02) | v2 (20/02) | Peso | Ponderato v2 |
|------|-----------|-----------|------|-------------|
| SEO Tecnica | 83 | **93** | 25% | 23.25 |
| SEO On-Page | 72 | **83** | 20% | 16.60 |
| Local SEO | 65 | **74** | 25% | 18.50 |
| GEO | 84 | **93** | 15% | 13.95 |
| Off-Page | 55 | **55** | 10% | 5.50 |
| Competitor | 68 | **68** | 5% | 3.40 |
| **TOTALE** | **73** | **82** | | **81.45 ≈ 82** |

**Proiezione con implementazioni future:**
- Landing page geo + 20 recensioni GBP + LinkedIn attivo → Local +5-7 → ~85/100
- Link building editoriale (5+ backlink DA 40+) → Off-Page +5-8 → ~88/100
- Cloudflare live (Brotli + Early Hints) → Tecnica +1-2 → ~90/100

---

# 3. DELTA — COSA È CAMBIATO (18/02 → 20/02/2026)

| Implementazione | Area | Delta |
|---|---|---|
| Speculation Rules API (10 pagine) | Tecnica, UX | +3 |
| AI Referral Tracking GA4 (10 sorgenti) | Tecnica, Analytics | +1 |
| `employee` link Organization → Person | Tecnica, GEO | +2 |
| Person `sameAs` LinkedIn | Tecnica, GEO | +1 |
| ImageObject schema (11 case study) | Tecnica, GEO | +2 |
| figcaption + figure (Caption-Alt-Body cycle) | GEO, Tecnica | +1 |
| generate-sitemap.js (lastmod reale, 52 URL) | Tecnica | +2 |
| Rimozione changefreq/priority | Tecnica | +1 |
| Answer Capsule RAG (homepage + 6 servizi) | On-Page, GEO | +4 |
| H2/H3 interrogativi (homepage + 6 servizi) | On-Page, GEO | +3 |
| Apple Business Connect VERIFICATO | Local, GEO | +2 |

**Elementi rimossi/deprecati:**
- `changefreq` e `priority` da sitemap.xml (ignorati da Google dal 2023)
- sitemap.xml manuale → sostituita da generate-sitemap.js
- H2/H3 dichiarativi → riformulati in interrogativo

---

# 4. SEO TECNICA — 93/100

**4.1 URL:** ✅ Eccellente — slug puliti, trailing slash normalization (301), UTM stripping (301)
**4.2 Core Web Vitals:** ⚠️ Non testato (sito non live) — build ottimizzata, Speculation Rules attive, Cloudflare configurato
**4.3 Crawlability:** ✅ Eccellente — robots.txt (13 AI bot), sitemap 52 URL lastmod reale, IndexNow, Bot Detection Logging
**4.4 HTTPS/Security:** ✅ Eccellente — security headers attivi su Express + Cloudflare configurato (HSTS preload, SSL Full Strict)
**4.5 Schema:** ✅ Enterprise — 6 tipi @id interconnessi, grafo bidirezionale Org ↔ Person, 11 ImageObject, FAQPage, Service con prezzi
**4.6 Title/Meta:** ✅ Buono — lunghezze variabili, alcune meta description da ottimizzare (target 140-160 char)
**4.7 Hreflang:** ✅ Completo — `hreflang="it"` + `hreflang="x-default"` su tutte le pagine
**4.8 Internal Linking:** ✅ Buono — nav unificata, breadcrumb JSON-LD. Manca: breadcrumb visuale HTML
**4.9 Sitemap:** ✅ Ottimale — 52 URL, lastmod reale, image sitemap, generazione automatica

**Mancanti (da implementare):** HowTo schema, Speakable schema, ServiceArea sui Service individuali, breadcrumb visuale HTML, AVIF images

---

# 5. SEO ON-PAGE — 83/100

**5.1 Answer Capsule:** ✅ NUOVO (20/02) — 55-70 parole autonome dopo H1 su 7 pagine principali, entity-dense, zero pronomi anaforici
**5.2 H2/H3 Interrogativi:** ✅ NUOVO (20/02) — heading riformulati per PAA e voice search su homepage + 6 servizi
**5.3 FAQ:** ✅ Schema + HTML su tutte le pagine servizio, 29 riferimenti totali
**5.4 Pagine servizio:** ✅ 7 pagine complete con Service schema, hasOfferCatalog, prezzi, Speculation Rules
**5.5 Blog:** ✅ 20 articoli, 170 topic queue, auto-writer daily — rischio "AI slop" per E-E-A-T
**5.6 E-E-A-T:** ⚠️ Parziale — Person schema completo, Wikidata, Crunchbase. Mancano: metriche case study, pubblicazioni su media di settore

**Mancanti:** Landing page geo, blog long-tail locale, pillar content 3.000+ parole, case study con metriche reali

---

# 6. LOCAL SEO — 79/100

**6.1 GBP:** ⚠️ 5 recensioni (target 20+), nessun post recente documentato
**6.2 Apple Business Connect:** ✅ **COMPLETAMENTE VERIFICATO** (20/02/2026)
**6.3 NAP:** ✅ Perfetta coerenza su tutti i file
**6.4 Directory:** 13 in sameAs (Hotfrog, Cylex, Firmania, Trova Aperto, Cronoshare, Clutch, Trustpilot, DesignRush, Instagram, Facebook, LinkedIn, Wikidata, Crunchbase). Mancanti: Bing Places, Yelp Italia, ProntoPro
**6.5 Landing geo:** ✅ **COMPLETATE (20/02/2026)**
- `/agenzia-web-rho.html` — 12 zone areaServed, 7 FAQ locali, HowTo, Fiera Milano Rho
- `/agenzia-web-milano.html` — Città Metropolitana, startup/PMI/moda, 7 FAQ, HowTo
- Link interni: footer index.html + 7 pagine servizi
- Sitemap: 54 URL (lastmod 2026-02-20)
**6.6 Schema LocalBusiness:** ✅ Eccellente — GeoCircle 30km, 9 voci areaServed, aggregateRating 5★

---

# 7. GEO — 93/100

**7.1 AI Infrastructure:** ✅ Avanguardia — ai.txt, llms.txt, webnovis-ai-data.json, robots.txt AI-permissivo, IndexNow, Wikidata, Crunchbase
**7.2 Answer Capsule:** ✅ NUOVO (20/02) — RAG-ottimizzate su 7 pagine
**7.3 Multimodal:** ✅ Parziale — alt (18 presenti), figcaption (Ricominciare) NUOVO, ImageObject (11 case study) NUOVO. Manca: AVIF
**7.4 Speculation Rules:** ✅ NUOVO (20/02) — prerender + prefetch su 10 pagine
**7.5 AI Traffic Monitor:** ✅ NUOVO (20/02) — GA4 event per 10 sorgenti AI
**7.6 Knowledge Graph:** ✅ Eccellente — grafo bidirezionale completo, Person sameAs LinkedIn NUOVO
**7.7 Fonti autorevoli:** ✅ Wikidata, Crunchbase, Clutch, Trustpilot, DesignRush, Apple Business Connect (VERIFICATO). ⚠️ LinkedIn operatività da confermare

---

# 8. OFF-PAGE — 55/100

**8.1 Backlink:** ❓ Non verificato — 13+ domini da sameAs (directory/social), nessun editoriale
**8.2 HARO/SOS:** ✅ Iscritto — rispondere attivamente (3-5 query/settimana)
**8.3 LinkedIn:** ⚠️ URL presente in sameAs, stato operativo non confermato

---

# 9. TOP 10 PRIORITÀ (aggiornate)

| # | Azione | Tipo | Impatto |
|---|--------|------|---------|
| 1 | ~~Landing `/agenzia-web-rho.html` + `/agenzia-web-milano.html`~~ | ✅ Completato 20/02 | — |
| 2 | Campagna recensioni GBP (QR code + email template) | Manuale | 🔴 Alto |
| 3 | ~~Talkwalker Alerts + Google Alerts~~ | ✅ Completato | — (4 query: Web Novis, WebNovis, webnovis.com, www.webnovis.com) |
| 4 | LinkedIn — verifica + piano editoriale | Manuale | 🟠 Alto |
| 5 | Link building editoriale (HARO attivo) | Manuale | 🟠 Alto |
| 6 | Bing Places for Business | Manuale | 🟠 Medio |
| 7 | ServiceArea GeoCircle su Service schema individuali | Codice | 🟡 Medio |
| 8 | HowTo schema sulle sezioni processo | Codice | 🟡 Medio |
| 9 | AVIF images via `<picture>` + sharp | Codice | 🟡 Medio |
| 10 | Core Web Vitals test (PageSpeed Insights) | Manuale | 🟡 Medio |

---

*Report v1: 18 Febbraio 2026 | Report v2: 20 Febbraio 2026*
*Audit eseguito su: codebase locale + cross-reference con 5 AI audit (Kimi, Minimax, Gemini, GLM5, GPT5.3) + Deepresearch Google SEO/GEO*
