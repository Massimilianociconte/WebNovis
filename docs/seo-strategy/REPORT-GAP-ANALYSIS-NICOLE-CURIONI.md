# 📊 Gap Analysis — WebNovis vs Nicole Curioni
> Audit diretto del codebase (script PS1) | Febbraio 2026

**Legenda:** ✅ Implementato | ⚠️ Parziale | ❌ Mancante

---

## 📋 Riepilogo Esecutivo

| # | Categoria | Stato | Priorità |
|---|---|---|---|
| 1 | Title Tag Geo-Ottimizzati | ⚠️ PARZIALE | 🔴 Alta |
| 2 | Geo-Targeting Multilivello | ⚠️ PARZIALE | 🔴 Alta |
| 3 | Blog + Content Cluster | ⚠️ PARZIALE | 🟡 Media |
| 4 | Chi Siamo E-E-A-T | ⚠️ PARZIALE | 🔴 Alta |
| 5 | Social Proof + Recensioni | ⚠️ PARZIALE (CRITICO) | 🔴 Alta |
| 6 | URL Structure | ⚠️ PARZIALE | 🟡 Media |
| 7 | Schema LocalBusiness + Service | ⚠️ PARZIALE | 🟡 Media |
| 8 | Newsletter + Lead Magnet | ⚠️ PARZIALE | 🟡 Media |
| 9 | Scarcity Page + Processo | ❌ MANCANTE | 🟢 Bassa |
| 10 | Footer Trust (P.IVA + anno) | ⚠️ PARZIALE | 🔴 Alta |
| 11 | Backlink Strategy | ⚠️ PARZIALE | 🟡 Media |
| 12 | Analytics Stack | ✅ COMPLETO | — |

**Score: 6.5/12** — Buona base tecnica, lacune critiche su E-E-A-T, recensioni reali e title geo su pagine servizi.

---

## 1. 🎯 Title Tag Geo-Ottimizzati — ⚠️ PARZIALE

**✅ OK:** `index.html` ("Agenzia Web a Milano e Rho • Web Novis..."), `contatti.html`, `servizi/index.html`, `agenzia-web-milano.html`, `agenzia-web-rho.html`.

**❌ MANCANTE GEO su 6 pagine:**
| File | Title attuale | Title corretto |
|---|---|---|
| `chi-siamo.html` | "Chi Siamo — WebNovis \| La Nostra Storia..." | "Chi Siamo — Web Novis \| Web Agency a Milano e Rho" |
| `portfolio.html` | "Portfolio — WebNovis \| I Nostri Progetti" | "Portfolio Web Agency Milano — WebNovis \| Progetti" |
| `servizi/ecommerce.html` | "Sviluppo E-Commerce — WebNovis \| Da €3.500" | "E-Commerce Professionale a Milano — WebNovis \| Da €3.500" |
| `servizi/landing-page.html` | "Creazione Landing Page — WebNovis \| Da €500" | "Landing Page Milano e Rho — WebNovis \| Da €500" |
| `servizi/sito-vetrina.html` | "Creazione Siti Vetrina — WebNovis \| Da €1.200" | "Siti Vetrina a Milano e Rho — WebNovis \| Da €1.200" |
| `servizi/social-media.html` | "Social Media Marketing — WebNovis \| ..." | "Social Media Marketing Milano — WebNovis \| ..." |

**Impatto: +15–30% CTR organico su quelle pagine. Stima lavoro: 1 ora.**

---

## 2. 🗺️ Geo-Targeting Multilivello — ⚠️ PARZIALE

**✅ OK:** 2 landing page geo (Milano, Rho), schema `areaServed` con 8 città, FAQ JSON-LD "da remoto".

**❌ MANCANTE:**
- Footer **senza riga geo testuale visibile** — "Rho (MI) · Milano · Hinterland · Da remoto in tutta Italia" è solo nei link, non nel testo.
- `contatti.html` non esplicita "Serviamo clienti a Rho, Milano, Monza, Pero..." nel body.
- Nessuna pagina per Monza, Pero, Arese, Bollate (città nell'`areaServed` ma senza landing dedicata).
- Nessuna pagina geo all'interno di `/servizi/`.

**Azioni:**
1. Aggiungere nel footer: `<p>Via S. Giorgio 2, Rho (MI) · Area metropolitana Milano · Da remoto in tutta Italia</p>`
2. In `contatti.html` body: aggiungere sezione "Dove operiamo" con elenco città.
3. Creare `/agenzia-web-monza.html` (Monza = zona ad alto traffico).

---

## 3. 📝 Blog + Content Cluster — ⚠️ PARZIALE

**✅ OK:** 20 articoli attivi, `auto-writer.js` con Gemini/Groq, schema `BlogPosting`, 170 topic in queue, media 3 link interni per articolo.

**❌ MANCANTE:**
- **Zero articoli con keyword geo locale** (es. "web design PMI Milano", "sito web Rho"). Tutti gli articoli sono nazionali/generici.
- URL piatti `/blog/articolo.html` — nessun URL nested per topic cluster (es. `/blog/seo/articolo.html`).
- Nessun form newsletter inline nei post del blog (solo in homepage).
- La coda `topics-queue.json` ha 0 topic geo-locali.
- 3 link interni a articolo è il minimo — Nicole ne ha 5–8.

**Azioni:**
1. Aggiungere alla queue almeno 5 topic geo: "Web Design per PMI a Milano 2026", "Quanto Costa un Sito a Rho e Hinterland", "Agenzia Web Milano vs Freelance", "SEO Locale per Negozi a Rho MI", "E-Commerce per PMI Hinterland Milanese".
2. Modificare il prompt in `auto-writer.js` per richiedere ≥5 link interni per articolo (2 servizi + 1 case study + 2 altri articoli).
3. Aggiungere blocco form newsletter nel template `build-articles.js` (intorno al 60% dell'articolo).

---

## 4. 👤 Chi Siamo E-E-A-T — ⚠️ PARZIALE

**✅ OK:** Storia dell'agenzia presente, numeri (50+ Progetti, 100% Soddisfatti, 5.0 Rating), schema `Person` + `Organization` + `AboutPage` JSON-LD.

**❌ MANCANTE:**
- Title senza geo (vedi punto 1).
- **"50+ Progetti"** è un numero molto basso per costruire autorità — Nicole ha "+300 clienti dal 2011". Valutare metriche alternative più forti (ore di sviluppo erogate, velocità media consegna, tasso di soddisfazione con dati).
- **Nessuna foto reale** del team — `image` nel schema Person punta al logo aziendale.
- **Nessuna sezione personalità/curiosità** — Nicole ha sezione "curiosità" con dettagli personali che aumentano il tempo sul sito.
- **Nessuna credenziale formale** visibile nel testo (certificazioni Google, Meta Blueprint, Shopify Partner).
- `Person.image` punta a `webnovis-logo-bianco.png` — non una foto persona.

**Azioni:**
1. Aggiornare title con geo (vedi punto 1).
2. Aggiungere sezione "Il nostro stack tecnologico" con tecnologie + eventuali badge certificazioni.
3. Valutare sezione breve "Oltre il lavoro" — 2–3 frasi che umanizzano il team senza esporre identità.
4. Aggiornare `Person.image` con immagine appropriata (avatar custom/illustrazione).

---

## 5. 🏆 Social Proof + Recensioni — ⚠️ PARZIALE (CRITICO)

**✅ OK:** Schema `AggregateRating` (`ratingValue: 5`, `reviewCount: 5`), 5 Review in JSON-LD, counter animati, footer con link Trustpilot + DesignRush widget script.

**❌ MANCANTE (MASSIMA PRIORITÀ):**
- **`reviewCount: 5` è insufficiente** per i rich snippet Google — soglia minima pratica: 10+ recensioni reali. Con 5, Google non mostra le stelle in SERP.
- Le 5 recensioni in JSON-LD sono **mock data hardcoded** (Franco, Luis, Luca, ecc.) — non reali/verificabili. Se Google incrocia con il profilo GBP e trova discrepanza, è penalizzante.
- **Nessun widget live** (Trustindex, Elfsight, Google Reviews embed) che mostri recensioni reali.
- **Nessuna pagina `/recensioni.html`** dedicata.
- Non è chiaro se il **Google Business Profile** è attivo e con recensioni reali.

**Azioni urgenti:**
1. **Raccogliere ≥10 recensioni Google reali** dai clienti del portfolio (Mimmo Fratelli, Aether Digital, Ember Oak, Arconti31, Mikuna, ecc.) — inviare link diretto GBP.
2. Registrarsi su [trustindex.io](https://trustindex.io) (piano free) e integrare widget in homepage e `/chi-siamo.html`.
3. Una volta raggiunte 10+ recensioni reali, aggiornare `reviewCount` nel JSON-LD con il numero reale.
4. Creare pagina `/recensioni.html` con widget Google + Trustpilot + DesignRush + testimonianze portfolio.

**Impatto: +15–30% CTR SERP con rich snippet stelle. Impatto diretto sulle conversioni.**

---

## 6. 🔗 URL Structure — ⚠️ PARZIALE

**✅ OK:** URL semantici italiani, BreadcrumbList ovunque, landing page geo dedicate.

**❌ MANCANTE:**
- **Nessuna pagina `/preventivo.html`** — keyword ad alto intento commerciale ("preventivo sito web Milano") senza landing dedicata.
- **Nessuna pagina `/grazie.html`** — necessaria per tracking conversione GA4 (`conversion` event) e Meta Pixel (`Lead` event). Senza di essa le conversioni del form non sono trackate correttamente.
- Estensione `.html` visibile (Nicole usa `/chi-sono/` clean URL) — impatto SEO minimo, ma da considerare.

**Azioni:**
1. Creare `/preventivo.html` con form dettagliato, FAQ, e pricing trasparente.
2. Creare `/grazie.html` con script di conversione: `gtag('event', 'conversion')` + `fbq('track', 'Lead')`.
3. Aggiungere entrambe alla `sitemap.xml` e al footer.

---

## 7. 📱 Schema LocalBusiness + Service — ⚠️ PARZIALE

**✅ OK:** Schema `LocalBusiness` + `ProfessionalService` completo in `index.html` con GeoCoordinates, areaServed (8 città), openingHours, priceRange, NAP. FAQPage, WebSite+SearchAction, BreadcrumbList ovunque.

**❌ MANCANTE:**
- **Nessun schema `Service`** nelle singole pagine servizio. Le pagine `/servizi/ecommerce.html`, `/servizi/graphic-design.html`, ecc. hanno solo `BreadcrumbList` + `WebPage` — mancano i dati strutturati `Service` con `Offer`.

**Azioni (stima: 3 ore):**
Aggiungere in ogni pagina servizi uno script JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Nome Servizio]",
  "provider": { "@id": "https://www.webnovis.com/#organization" },
  "serviceType": "[Tipo]",
  "areaServed": [{"@type": "City", "name": "Rho"}, {"@type": "City", "name": "Milano"}],
  "offers": {
    "@type": "Offer",
    "price": "XXXX",
    "priceCurrency": "EUR",
    "url": "https://www.webnovis.com/servizi/[slug].html"
  }
}
```

---

## 8. ✉️ Newsletter + Lead Magnet — ⚠️ PARZIALE

**✅ OK:** Form newsletter in homepage, `newsletter-engine.js` server-side, template newsletter.

**❌ MANCANTE:**
- **Nessun lead magnet** — nessun PDF/checklist/template scaricabile in cambio dell'iscrizione.
- **Nessun form newsletter inline negli articoli del blog** — `build-articles.js` non include il blocco newsletter.
- Copy della newsletter in homepage generico — manca proposta di valore specifica.

**Azioni:**
1. Creare PDF lead magnet: "Checklist: 15 cose che il tuo sito DEVE avere per convertire nel 2026".
2. Aggiungere in `build-articles.js` blocco newsletter inline tra le sezioni dell'articolo (al 60% del contenuto).
3. Aggiornare copy homepage: "Scarica gratis la checklist + ricevi consigli settimanali su web e marketing".

---

## 9. 🧠 Scarcity Page + Processo — ❌ MANCANTE

**Non esiste nulla** equivalente alla pagina `/lista-attesa/` di Nicole.

**Cosa creare:**
- **`/come-lavoriamo.html`** — Spiega il processo in 5 step (Brief → Wireframe → Design → Sviluppo → Launch). Include timeline realistica, cosa fa il cliente, cosa fa WebNovis. Aggiunge scarcity soft: "Accettiamo nuovi progetti ogni mese in base alla disponibilità".
- **Benefici SEO/UX:** Pagina extra indicizzata con keyword processo/workflow. Aumenta il tempo medio sul sito. Riduce l'incertezza del prospect → aumento conversioni.

**Stima lavoro: 3–4 ore. Priorità bassa ma ROI alto sul lungo termine.**

---

## 10. 🔐 Footer Trust — ⚠️ PARZIALE

**✅ OK:** Privacy Policy, Cookie Policy, Termini e Condizioni linkati nel footer. © 2026 WebNovis presente.

**❌ MANCANTE:**
- **P.IVA non presente** nel footer — Nicole la mostra visibilmente. È un forte segnale E-E-A-T (legittimità aziendale) e riduce la diffidenza dei prospect B2B.
- **Anno di fondazione** ("Dal 2025") non presente nel footer — va comunicato anche se recente.
- **Link a recensioni/Trustpilot** dal footer è presente come link testuale ma non come CTA visibile.

**Azione (stima: 20 min):**
```html
<!-- Aggiungere nel footer dopo il copyright -->
<p class="footer-legal">P.IVA: XXXXXXXXXX · Web Novis — Dal 2025</p>
```
**Nota:** Inserire la P.IVA reale quando disponibile.

---

## 11. 🌐 Backlink Strategy — ⚠️ PARZIALE

**✅ OK (nel sameAs schema):** Clutch.co, DesignRush, LinkedIn, Crunchbase, Wikidata, Hotfrog, Cylex, Firmania, Trova Aperto, Cronoshare, Instagram, Facebook, Trustpilot. DesignRush widget script caricato in `chi-siamo.html`.

**❌ MANCANTE:**
- **Footer attribution** sui siti clienti — il codice dei siti realizzati non include (o non è verificabile) "Sito realizzato da Web Novis | webnovis.com". Ogni sito cliente = 1 backlink dofollow gratuito.
- **Sortlist.it** non nel sameAs — directory B2B importante per agenzie web.
- **PagineGialle**, **Kompass**, **GoodFirms** non nel sameAs — directory locali con DA alto.
- **Guest post** su blog di settore (zero contributi esterni identificabili).

**Azioni:**
1. Aggiungere nel footer di ogni sito realizzato per clienti: `<a href="https://www.webnovis.com" rel="dofollow">Sito realizzato da Web Novis</a>` (se il cliente lo consente).
2. Registrarsi e ottimizzare il profilo su Sortlist.it.
3. Aggiungere Sortlist e GoodFirms al `sameAs` in `index.html` e `chi-siamo.html`.

---

## 12. 📊 Analytics Stack — ✅ COMPLETO

**✅ Tutto implementato:**
- GA4 (`gtag`) con Consent Mode v2 completo (`ad_storage`, `ad_user_data`, `ad_personalization` denied by default).
- Microsoft Clarity (project `vjbr983er7`), consent-gated.
- Meta Pixel (`fbq`, ID `1405109048327436`), consent-gated con `fbq('consent', 'revoke')` prima di `fbq('init')`.
- Tutti e 3 si attivano solo su `enableAnalyticsTracking()`.

**Unica lacuna (non verificabile da codice):** Nessun collegamento documentato a Looker Studio per dashboard GSC+GA4. Raccomandata come step manuale.

---

## 🚀 Piano di Implementazione Prioritizzato

### 🔴 FASE 1 — Quick wins (entro 1 settimana)

| Azione | File da modificare | Stima |
|---|---|---|
| **1. Raccogliere ≥10 recensioni Google reali** | — (azione esterna) | Immediato |
| **2. Aggiungere geo ai 6 title tag mancanti** | `chi-siamo.html`, `portfolio.html`, 4 servizi | 1 ora |
| **3. Aggiungere riga geo testuale nel footer** | `index.html` (+ propagare) | 30 min |
| **4. Aggiungere P.IVA + "Dal 2025" al footer** | `index.html` (+ tutte le pagine via build) | 20 min |
| **5. Aggiungere geo esplicita in `contatti.html`** | `contatti.html` | 30 min |
| **6. Aggiungere `alt` con geo a img chiave** | `index.html` (18 img, 0 con geo in alt) | 1 ora |

### 🟡 FASE 2 — Medio termine (entro 1 mese)

| Azione | File da modificare | Stima |
|---|---|---|
| **7. Creare `/preventivo.html`** | Nuovo file | 2–3 ore |
| **8. Creare `/grazie.html`** | Nuovo file | 1 ora |
| **9. Aggiungere schema `Service` a ogni pagina servizi** | 6 file servizi | 3 ore |
| **10. Integrare widget Trustindex recensioni live** | `index.html`, `chi-siamo.html` | 1 ora |
| **11. Creare pagina `/recensioni.html`** | Nuovo file | 2 ore |
| **12. Aggiungere form newsletter in blog template** | `blog/build-articles.js` | 1 ora |
| **13. Aggiungere 5 topic geo alla coda blog** | `blog/topics-queue.json` | 15 min |
| **14. Aumentare link interni a ≥5 per articolo (prompt)** | `blog/auto-writer.js` | 1 ora |
| **15. Creare `/agenzia-web-monza.html`** | Nuovo file (clone di agenzia-web-rho) | 2 ore |

### 🟢 FASE 3 — Lungo termine (entro 3 mesi)

| Azione | File da modificare | Stima |
|---|---|---|
| **16. Creare `/come-lavoriamo.html`** | Nuovo file | 3–4 ore |
| **17. Lead magnet PDF scaricabile** | PDF + form aggiornato | 3–4 ore |
| **18. Aggiungere Sortlist + GoodFirms al sameAs** | `index.html`, `chi-siamo.html` | 20 min |
| **19. Footer attribution su siti clienti** | Template siti clienti | Ongoing |
| **20. Potenziare E-E-A-T chi-siamo (credenziali, personalità)** | `chi-siamo.html` | 2–3 ore |
| **21. Looker Studio dashboard** | Esterno (manuale) | 2 ore |

---

## ⚡ Quick Wins Immediati (< 24h, zero sviluppo)

Dal checklist finale del report Nicole Curioni, verifica stato:

| Quick Win | Stato WebNovis |
|---|---|
| Title tag con città su tutte le pagine | ⚠️ Parziale (6 pagine mancanti) |
| Meta description con keyword geo | ⚠️ Parziale (ok homepage/contatti, no servizi) |
| NAP consistency (sito = GSC = GBP) | ✅ OK — NAP coerente |
| Alt text immagini con geo city | ❌ 18 img in index.html, 0 con geo nel alt |
| WebP + lazy loading | ✅ OK — tutte le img sono .webp |
| Internal linking ≥3 per pagina | ⚠️ OK (3 media) — migliorabile a 5 |
| HTTPS | ✅ OK |
| Sitemap XML inviata a GSC | ✅ OK — `sitemap.xml` presente |

---

*Analisi basata su audit diretto del codebase tramite script PowerShell. Febbraio 2026.*
*Script di analisi: `/scripts/analyze-seo.ps1` e `/scripts/analyze-seo2.ps1`*
