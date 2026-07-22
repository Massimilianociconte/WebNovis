# Audit GEO indexable — WebNovis

Generato: 2026-07-22T19:10:46.691Z

## Sintesi

| Metrica | Valore |
|---|---:|
| Pagine audit | 80 |
| Score medio | 98/100 |
| Tier 1 / 2 / Data-validated | 24 / 22 / 34 |
| Priorità P0 / P1 / P2 / P3 | 0 / 24 / 0 / 56 |

### Città con più landing indexable (rischio cannibalizzazione)

- **milano** (7): agenzia-web, email-marketing, landing-page, ecommerce, graphic-design, seo-locale, social-media
- **arese** (6): seo-locale, sito-vetrina, agenzia-web, ecommerce, landing-page, realizzazione-siti-web
- **rho** (6): seo-locale, agenzia-web, ecommerce, landing-page, realizzazione-siti-web, sito-vetrina
- **legnano** (5): agenzia-web, ecommerce, realizzazione-siti-web, sito-vetrina, social-media
- **bollate** (5): agenzia-web, ecommerce, landing-page, realizzazione-siti-web, sito-vetrina
- **garbagnate** (4): seo-locale, agenzia-web, ecommerce, realizzazione-siti-web
- **lainate** (4): seo-locale, agenzia-web, ecommerce, sito-vetrina
- **monza** (4): agenzia-web, ecommerce, email-marketing, google-ads
- **parabiago** (4): agenzia-web, seo-locale, realizzazione-siti-web, social-media


## Nota metodologica (score alti ≠ ranking garantito)

Lo score on-page (~98/100 medio) misura **completezza tecnica e checklist GEO** (canonical, H1, FAQ, NAP, CTA, word count, capsule).  
**Non misura** autorità di dominio, CTR reale, qualità competitiva vs SERP, né unicità semantica profonda.

### Unicità intra-cluster (Jaccard token, sole pagine indexable)

Misura ad hoc 2026-07-22 tra pagine **stesso servizio** nell'allowlist:

| Cluster | Similarità media / note |
|---|---|
| agenzia-web Tier1 (13) | ~0.49 — accettabile |
| realizzazione-siti-web Tier1 (4) | ~0.58 — da differenziare di più |
| seo-locale (mix T1/DV) | **0.65–0.77** tra coppie — alto rischio template |
| ecommerce (DV/T2) | **0.72–0.75** tra coppie — alto rischio template |
| social-media | ~0.72 milano↔parabiago |

**Implicazione:** le pagine indexable superano i check "hard SEO", ma i cluster **seo-locale** e **ecommerce** restano troppo simili tra città. Prima di spingere link building su queste URL, aggiungere ≥30% contenuto unico (settori, casi, FAQ, dati locali).

### Intent e cannibalizzazione (priorità business)

| Città | Problema | Azione |
|---|---|---|
| **milano** (7 URL) | Troppe intent commerciali indexable | Primary: agenzia-web-milano + ecommerce-milano + seo-locale-milano; le altre devono linkare e non competere sul brand |
| **rho** (6 URL) | Sovrapposizione homepage / agenzia / realizzazione / seo | Homepage = brand ecosistema; agenzia-web-rho = web agency; realizzazione-siti-web-rho = siti; seo-locale-rho = Maps |
| **arese / bollate / legnano** (5–6) | Cluster denso | 1 primary per intent; no nuove indexable senza GSC |

### Tier 1 — coda di upgrade (ordine consigliato)

1. `/agenzia-web-rho.html` + `/realizzazione-siti-web-rho.html` (revenue core, query "web agency rho")
2. `/seo-locale-rho.html` + SEO Tier1 senza Speakable (cinisello, garbagnate, lainate, arese, parabiago)
3. Title lunghi agenzia-web (garbagnate 85, cinisello 83, settimo 82, novate 81) → ≤62 char
4. Cluster ecommerce indexable: differenziare o consolidare su hub + 3–4 città top
5. Verificare AggregateRating 5/5 su Rho allineato a review Google/Trustpilot pubbliche

### Checklist qualità "oltre lo score" (per ogni T1)

- [ ] Prime 40–60 parole = risposta diretta alla query primaria
- [ ] Almeno 1 dato proprietario (tempo da sede, settore locale, case, prezzo reale)
- [ ] FAQ con 1 domanda che solo un player locale può rispondere bene
- [ ] Internal link exact-anchor dalla homepage hub e da 2 blog correlati
- [ ] Screenshot/portfolio o recensione citabile
- [ ] Title ≤60–65, meta ≤155, H1 con città + servizio senza stuffing


## Legenda score

- **90–100**: pronta a competere, solo proof/CTR
- **75–89**: solida, manca 1–2 elementi GEO/local proof
- **60–74**: template-like o gap schema/link — upgrade prima di spingere link
- **<60**: non competitiva o errore tecnico

## Top priorità (score più basso)

| Pri | Score | Tier | URL | Issue principali |
|---|---:|---|---|---|
| P1 | 88 | T1 | `/seo-locale-cinisello-balsamo.html` | title lungo (67 char); meta description lunga (166); Tier1 senza Speakable |
| P1 | 88 | T1 | `/seo-locale-garbagnate.html` | title lungo (69 char); meta description lunga (168); Tier1 senza Speakable |
| P3 | 92 | DV | `/realizzazione-siti-web-caronno-pertusella.html` | title lungo (66 char); meta description lunga (166) |
| P1 | 92 | T1 | `/seo-locale-lainate.html` | title lungo (68 char); Tier1 senza Speakable |
| P3 | 92 | T2 | `/seo-locale-sesto-san-giovanni.html` | title lungo (68 char); meta description lunga (167) |
| P3 | 96 | DV | `/agenzia-web-baranzate.html` | title lungo (75 char) |
| P1 | 96 | T1 | `/agenzia-web-cinisello-balsamo.html` | title lungo (83 char) |
| P3 | 96 | T2 | `/agenzia-web-cornaredo.html` | title lungo (75 char) |
| P1 | 96 | T1 | `/agenzia-web-garbagnate.html` | title lungo (85 char) |
| P1 | 96 | T1 | `/agenzia-web-lainate.html` | title lungo (73 char) |
| P1 | 96 | T1 | `/agenzia-web-legnano.html` | title lungo (73 char) |
| P1 | 96 | T1 | `/agenzia-web-milano-nord.html` | title lungo (77 char) |
| P1 | 96 | T1 | `/agenzia-web-milano-ovest.html` | title lungo (78 char) |
| P3 | 96 | T2 | `/agenzia-web-milano.html` | title lungo (72 char) |
| P1 | 96 | T1 | `/agenzia-web-monza.html` | title lungo (71 char) |
| P3 | 96 | T2 | `/agenzia-web-novate-milanese.html` | title lungo (81 char) |
| P1 | 96 | T1 | `/agenzia-web-parabiago.html` | title lungo (75 char) |
| P3 | 96 | T2 | `/agenzia-web-pero.html` | title lungo (70 char) |
| P1 | 96 | T1 | `/agenzia-web-saronno.html` | title lungo (73 char) |
| P3 | 96 | DV | `/agenzia-web-settimo-milanese.html` | title lungo (82 char) |
| P3 | 96 | DV | `/email-marketing-milano.html` | title lungo (74 char) |
| P3 | 96 | DV | `/landing-page-milano.html` | meta description lunga (167) |
| P1 | 96 | T1 | `/seo-locale-arese.html` | Tier1 senza Speakable |
| P3 | 96 | DV | `/seo-locale-bresso.html` | title lungo (67 char) |
| P1 | 96 | T1 | `/seo-locale-parabiago.html` | Tier1 senza Speakable |

## Dettaglio pagina per pagina

### `/seo-locale-cinisello-balsamo.html` — T1 · score 88 · P1

- **Intent**: commercial-investigational — query: _SEO locale cinisello balsamo / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (67): SEO Locale a Cinisello Balsamo: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Cinisello Balsamo per farti trovare su Google Maps
- **Words**: 1952 · **City hits**: 54
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (67 char)
  - meta description lunga (166)
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale cinisello balsamo / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/seo-locale-garbagnate.html` — T1 · score 88 · P1

- **Intent**: commercial-investigational — query: _SEO locale garbagnate / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (69): SEO Locale a Garbagnate Milanese: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Garbagnate Milanese per farti trovare su Google Maps
- **Words**: 1989 · **City hits**: 62
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (69 char)
  - meta description lunga (168)
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale garbagnate / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/realizzazione-siti-web-caronno-pertusella.html` — DV · score 92 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web caronno pertusella / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (66): Siti Web a Caronno Pertusella: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Caronno Pertusella per PMI e professionisti
- **Words**: 2003 · **City hits**: 36
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (66 char)
  - meta description lunga (166)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/seo-locale-lainate.html` — T1 · score 92 · P1

- **Intent**: commercial-investigational — query: _SEO locale lainate / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (68): SEO locale a Lainate: Google Maps, visibilità e richieste | WebNovis
- **H1**: SEO locale a Lainate per attività che vogliono più visibilità e contatti
- **Words**: 1963 · **City hits**: 65
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (68 char)
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale lainate / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/seo-locale-sesto-san-giovanni.html` — T2 · score 92 · P3

- **Intent**: commercial-investigational — query: _SEO locale sesto san giovanni / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (68): SEO Locale a Sesto San Giovanni: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Sesto San Giovanni per farti trovare su Google Maps
- **Words**: 1719 · **City hits**: 50
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (68 char)
  - meta description lunga (167)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-baranzate.html` — DV · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web baranzate / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (75): Agenzia Web a Baranzate (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Baranzate: Siti Professionali per Imprese e Professionisti
- **Words**: 1840 · **City hits**: 42
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (75 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-cinisello-balsamo.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web cinisello balsamo / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (83): Agenzia Web a Cinisello Balsamo (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Cinisello Balsamo: Siti Professionali per Imprese e Professionisti
- **Words**: 2235 · **City hits**: 41
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (83 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web cinisello balsamo / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-cornaredo.html` — T2 · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web cornaredo / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (75): Agenzia Web a Cornaredo (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Cornaredo: Siti Professionali per Imprese e Professionisti
- **Words**: 1990 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (75 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-garbagnate.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web garbagnate / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (85): Agenzia Web a Garbagnate Milanese (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Garbagnate Milanese: Siti Professionali per Imprese e Professionisti
- **Words**: 2255 · **City hits**: 44
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (85 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web garbagnate / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-lainate.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web lainate / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (73): Agenzia Web a Lainate (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Lainate: Siti Professionali per Imprese e Professionisti
- **Words**: 2277 · **City hits**: 54
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (73 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web lainate / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-legnano.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web legnano / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (73): Agenzia Web a Legnano (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Legnano: Siti Professionali per Imprese e Professionisti
- **Words**: 2176 · **City hits**: 47
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (73 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web legnano / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-milano-nord.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web milano nord / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (77): Agenzia Web a Milano Nord (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Milano Nord: Siti Professionali per Imprese e Professionisti
- **Words**: 2253 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, AdministrativeArea, City, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (77 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web milano nord / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-milano-ovest.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web milano ovest / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (78): Agenzia Web a Milano Ovest (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Milano Ovest: Siti Professionali per Imprese e Professionisti
- **Words**: 2204 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, AdministrativeArea, City, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (78 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web milano ovest / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-milano.html` — T2 · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web milano / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (72): Agenzia Web a Milano (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Milano: Siti Professionali per Imprese e Professionisti
- **Words**: 1883 · **City hits**: 42
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=1
- **Issue**:
  - title lungo (72 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-monza.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web monza / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (71): Agenzia Web a Monza (MB) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Monza: Siti Professionali per Imprese e Professionisti
- **Words**: 2255 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (71 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web monza / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-novate-milanese.html` — T2 · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web novate milanese / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (81): Agenzia Web a Novate Milanese (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Novate Milanese: Siti Professionali per Imprese e Professionisti
- **Words**: 1822 · **City hits**: 34
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (81 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-parabiago.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web parabiago / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (75): Agenzia Web a Parabiago (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Parabiago: Siti Professionali per Imprese e Professionisti
- **Words**: 2292 · **City hits**: 42
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (75 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web parabiago / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-pero.html` — T2 · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web pero / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (70): Agenzia Web a Pero (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Pero: Siti Professionali per Imprese e Professionisti
- **Words**: 1900 · **City hits**: 42
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (70 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-saronno.html` — T1 · score 96 · P1

- **Intent**: commercial-brand-local — query: _agenzia web saronno / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (73): Agenzia Web a Saronno (VA) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Saronno: Siti Professionali per Imprese e Professionisti
- **Words**: 2321 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (73 char)
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web saronno / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-settimo-milanese.html` — DV · score 96 · P3

- **Intent**: commercial-brand-local — query: _agenzia web settimo milanese / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (82): Agenzia Web a Settimo Milanese (MI) — WebNovis | Siti Web Custom, Grafica e Social
- **H1**: Agenzia Web a Settimo Milanese: Siti Professionali per Imprese e Professionisti
- **Words**: 2073 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - title lungo (82 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/email-marketing-milano.html` — DV · score 96 · P3

- **Intent**: commercial-service — query: _email marketing milano_
- **Ruolo**: Newsletter, automazioni, lead nurturing
- **Title** (74): Email marketing a Milano: newsletter e automazioni da €250/mese | WebNovis
- **H1**: Email marketing a Milano per newsletter e automazioni che generano ricavi
- **Words**: 1120 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Issue**:
  - title lungo (74 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/landing-page-milano.html` — DV · score 96 · P3

- **Intent**: commercial-transactional — query: _landing page milano_
- **Ruolo**: Landing ad alta conversione per ads/campagne
- **Title** (61): Landing page a Milano: da €500 per lead generation | WebNovis
- **H1**: Landing page a Milano per campagne che devono portare contatti
- **Words**: 1195 · **City hits**: 39
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Issue**:
  - meta description lunga (167)
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/seo-locale-arese.html` — T1 · score 96 · P1

- **Intent**: commercial-investigational — query: _SEO locale arese / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (55): SEO Locale a Arese: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Arese per farti trovare su Google Maps
- **Words**: 2010 · **City hits**: 60
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale arese / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.

### `/seo-locale-bresso.html` — DV · score 96 · P3

- **Intent**: commercial-investigational — query: _SEO locale bresso / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (67): SEO locale a Bresso: Google Maps, ricerche locali e lead | WebNovis
- **H1**: SEO locale a Bresso per farti trovare su Google Maps e nelle ricerche locali
- **Words**: 1622 · **City hits**: 52
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Issue**:
  - title lungo (67 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/seo-locale-parabiago.html` — T1 · score 96 · P1

- **Intent**: commercial-investigational — query: _SEO locale parabiago / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (59): SEO Locale a Parabiago: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Parabiago per farti trovare su Google Maps
- **Words**: 1984 · **City hits**: 57
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale parabiago / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.

### `/seo-locale-rho.html` — T1 · score 96 · P1

- **Intent**: commercial-investigational — query: _SEO locale rho / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (54): SEO locale a Rho: Google Maps e lead locali | WebNovis
- **H1**: SEO locale a Rho per comparire meglio su Google Maps e nelle ricerche in zona
- **Words**: 1914 · **City hits**: 61
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "SEO locale rho / SEO Google Maps {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.

### `/sito-vetrina-arese.html` — T1 · score 96 · P1

- **Intent**: commercial-transactional — query: _sito vetrina arese_
- **Ruolo**: Sito multi-pagina PMI / professionisti
- **Title** (60): Sito Vetrina a Arese: sito professionale da €1200 | WebNovis
- **H1**: Sito Vetrina a Arese per aziende che vogliono più richieste
- **Words**: 1671 · **City hits**: 52
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Issue**:
  - Tier1 senza Speakable
- **Azioni consigliate**:
  1. Upgrade competitivo su query "sito vetrina arese": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.

### `/social-media-sesto-san-giovanni.html` — DV · score 96 · P3

- **Intent**: commercial-service — query: _social media sesto san giovanni / gestione social {city}_
- **Ruolo**: Creatività + ads social (non gestione account full-time se non offerto)
- **Title** (66): Social media a Sesto San Giovanni: contenuti e Meta Ads | WebNovis
- **H1**: Social media a Sesto San Giovanni per PMI e professionisti
- **Words**: 1158 · **City hits**: 38
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Issue**:
  - title lungo (66 char)
- **Azioni consigliate**:
  1. Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.

### `/agenzia-web-arese.html` — T1 · score 100 · P1

- **Intent**: commercial-brand-local — query: _agenzia web arese / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (59): Agenzia web ad Arese: siti custom, SEO e grafica | WebNovis
- **H1**: Agenzia Web a Arese: Siti Professionali per Imprese e Professionisti
- **Words**: 2368 · **City hits**: 46
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web arese / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/agenzia-web-bollate.html` — T1 · score 100 · P1

- **Intent**: commercial-brand-local — query: _agenzia web bollate / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (59): Agenzia web a Bollate: siti custom, SEO e social | WebNovis
- **H1**: Agenzia Web a Bollate: Siti Professionali per Imprese e Professionisti
- **Words**: 2247 · **City hits**: 49
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web bollate / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/agenzia-web-castellanza.html` — DV · score 100 · P3

- **Intent**: commercial-brand-local — query: _agenzia web castellanza / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (58): Siti web a Castellanza (VA): agenzia web custom | WebNovis
- **H1**: Agenzia Web a Castellanza: Siti Professionali per Imprese e Professionisti
- **Words**: 1860 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/agenzia-web-rho.html` — T1 · score 100 · P1

- **Intent**: commercial-brand-local — query: _agenzia web rho / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (58): Web Agency Rho: siti web custom, SEO e branding | WebNovis
- **H1**: Agenzia web a Rho per siti custom, SEO locale e identità digitale
- **Words**: 2083 · **City hits**: 55
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, AggregateRating, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web rho / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Chiarire ruolo vs homepage: homepage = brand/ecosistema; questa = web agency Rho commerciale.

### `/agenzia-web-sesto-san-giovanni.html` — T1 · score 100 · P1

- **Intent**: commercial-brand-local — query: _agenzia web sesto san giovanni / web agency {city}_
- **Ruolo**: Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo
- **Title** (60): Agenzia web a Sesto San Giovanni: siti, SEO e Ads | WebNovis
- **H1**: Agenzia web a Sesto San Giovanni per PMI e professionisti
- **Words**: 2364 · **City hits**: 41
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "agenzia web sesto san giovanni / web agency {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/ecommerce-arese.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce arese / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (59): E-commerce ad Arese: shop online da €3.500 e SEO | WebNovis
- **H1**: Realizzazione e-commerce ad Arese per negozi e brand locali
- **Words**: 1759 · **City hits**: 56
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-bollate.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce bollate / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (53): E-Commerce a Bollate: shop online da €3500 | WebNovis
- **H1**: E-Commerce a Bollate per vendere online senza vincoli
- **Words**: 1652 · **City hits**: 56
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-bresso.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce bresso / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (59): E-commerce a Bresso: shop online da €3.500 e SEO | WebNovis
- **H1**: E-commerce a Bresso per negozi e brand che vogliono vendere online
- **Words**: 1472 · **City hits**: 48
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-cinisello-balsamo.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce cinisello balsamo / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (63): E-Commerce a Cinisello Balsamo: shop online da €3500 | WebNovis
- **H1**: E-Commerce a Cinisello Balsamo per vendere online senza vincoli
- **Words**: 1472 · **City hits**: 45
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-cormano.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce cormano / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (53): E-Commerce a Cormano: shop online da €3500 | WebNovis
- **H1**: E-Commerce a Cormano per vendere online senza vincoli
- **Words**: 1460 · **City hits**: 46
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-garbagnate.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce garbagnate / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (56): E-commerce a Garbagnate: vendite online e SEO | WebNovis
- **H1**: E-commerce a Garbagnate per attivita locali che vogliono vendere online
- **Words**: 1589 · **City hits**: 49
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-lainate.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce lainate / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (53): E-Commerce a Lainate: shop online da €3500 | WebNovis
- **H1**: E-Commerce a Lainate per vendere online senza vincoli
- **Words**: 1595 · **City hits**: 55
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-legnano.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce legnano / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (62): E-commerce a Legnano: Shopify, WooCommerce o custom | WebNovis
- **H1**: E-commerce a Legnano per negozi, retail e brand che vogliono vendere meglio
- **Words**: 1573 · **City hits**: 53
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-limbiate.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce limbiate / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (54): E-Commerce a Limbiate: shop online da €3500 | WebNovis
- **H1**: E-Commerce a Limbiate per vendere online senza vincoli
- **Words**: 1469 · **City hits**: 48
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-milano.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce milano / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (57): E-commerce a Milano: da €3.500 e SEO integrata | WebNovis
- **H1**: E-commerce a Milano per PMI, retail e vendita online
- **Words**: 1575 · **City hits**: 51
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=1
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-monza.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce monza / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (58): E-commerce a Monza: shop online da €3.500 e SEO | WebNovis
- **H1**: E-commerce a Monza per negozi, retail e brand locali
- **Words**: 1720 · **City hits**: 54
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-rho.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce rho / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (58): Realizzazione e-commerce a Rho: da €3.500 e SEO | WebNovis
- **H1**: Realizzazione e-commerce a Rho per negozi, brand e PMI
- **Words**: 1497 · **City hits**: 52
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/ecommerce-senago.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _ecommerce senago / negozio online {city}_
- **Ruolo**: Revenue e-commerce: piattaforma, costi, UX vendita
- **Title** (63): E-commerce a Senago: da €3.500, SEO e vendite online | WebNovis
- **H1**: E-commerce a Senago per negozi, retail e vendita online
- **Words**: 1568 · **City hits**: 48
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/email-marketing-monza.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _email marketing monza_
- **Ruolo**: Newsletter, automazioni, lead nurturing
- **Title** (62): Email marketing a Monza: da €250/mese e automazioni | WebNovis
- **H1**: Email marketing a Monza per newsletter e automazioni che generano contatti
- **Words**: 1216 · **City hits**: 39
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/google-ads-monza.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _Google Ads monza_
- **Ruolo**: Campagne search/paid locali
- **Title** (60): Google Ads a Monza: campagne search e lead locali | WebNovis
- **H1**: Google Ads a Monza per campagne search e contatti qualificati
- **Words**: 1270 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/graphic-design-milano.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _graphic design milano / logo {city}_
- **Ruolo**: Logo, brand identity, materiali
- **Title** (65): Graphic design a Milano: logo, brand identity e visual | WebNovis
- **H1**: Graphic design a Milano per brand che vogliono sembrare subito più credibili
- **Words**: 1247 · **City hits**: 38
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/landing-page-arese.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _landing page arese_
- **Ruolo**: Landing ad alta conversione per ads/campagne
- **Title** (56): Landing Page a Arese: lead generation da €500 | WebNovis
- **H1**: Landing Page a Arese per campagne che portano contatti
- **Words**: 1285 · **City hits**: 45
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/landing-page-bollate.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _landing page bollate_
- **Ruolo**: Landing ad alta conversione per ads/campagne
- **Title** (58): Landing Page a Bollate: lead generation da €500 | WebNovis
- **H1**: Landing Page a Bollate per campagne che portano contatti
- **Words**: 1303 · **City hits**: 49
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/landing-page-milano-ovest.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _landing page milano ovest_
- **Ruolo**: Landing ad alta conversione per ads/campagne
- **Title** (63): Landing Page a Milano Ovest: lead generation da €500 | WebNovis
- **H1**: Landing Page a Milano Ovest per campagne che portano contatti
- **Words**: 1259 · **City hits**: 42
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/landing-page-rho.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _landing page rho_
- **Ruolo**: Landing ad alta conversione per ads/campagne
- **Title** (54): Landing Page a Rho: lead generation da €500 | WebNovis
- **H1**: Landing Page a Rho per campagne che portano contatti
- **Words**: 1030 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-arese.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web arese / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (59): Realizzazione siti web ad Arese: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web ad Arese per PMI e professionisti
- **Words**: 2055 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-arluno.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web arluno / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (54): Siti Web a Arluno: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Arluno per PMI e professionisti
- **Words**: 1991 · **City hits**: 36
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-bollate.html` — T1 · score 100 · P1

- **Intent**: commercial-transactional — query: _realizzazione siti web bollate / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (60): Realizzazione siti web a Bollate: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Bollate per attivita locali e PMI
- **Words**: 2484 · **City hits**: 48
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "realizzazione siti web bollate / creazione sito web {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/realizzazione-siti-web-buccinasco.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web buccinasco / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (58): Siti Web a Buccinasco: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione siti web a Buccinasco per attività che vogliono più richieste
- **Words**: 2045 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=2
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-castellanza.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web castellanza / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (59): Siti Web a Castellanza: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Castellanza per PMI e professionisti
- **Words**: 2055 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-cormano.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web cormano / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (60): Realizzazione siti web a Cormano: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Cormano per PMI, studi e attività locali
- **Words**: 2039 · **City hits**: 35
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-garbagnate.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web garbagnate / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (63): Realizzazione siti web a Garbagnate: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Garbagnate Milanese per PMI e professionisti
- **Words**: 2174 · **City hits**: 41
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-legnano.html` — T1 · score 100 · P1

- **Intent**: commercial-transactional — query: _realizzazione siti web legnano / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (60): Realizzazione siti web a Legnano: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Legnano per PMI, artigiani e professionisti
- **Words**: 2458 · **City hits**: 43
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "realizzazione siti web legnano / creazione sito web {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/realizzazione-siti-web-limbiate.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web limbiate / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (47): Siti web a Limbiate: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Limbiate per PMI e professionisti
- **Words**: 2261 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-magenta.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web magenta / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (55): Siti Web a Magenta: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Magenta per PMI e professionisti
- **Words**: 2086 · **City hits**: 39
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-milano-ovest.html` — T1 · score 100 · P1

- **Intent**: commercial-transactional — query: _realizzazione siti web milano ovest / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (60): Siti Web a Milano Ovest: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Milano Ovest per PMI e professionisti
- **Words**: 2341 · **City hits**: 35
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, AdministrativeArea, City, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=2
- **Azioni consigliate**:
  1. Upgrade competitivo su query "realizzazione siti web milano ovest / creazione sito web {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.

### `/realizzazione-siti-web-origgio.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web origgio / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (55): Siti Web a Origgio: da €1.200, SEO integrata | WebNovis
- **H1**: Realizzazione Siti Web a Origgio per PMI e professionisti
- **Words**: 2128 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-parabiago.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web parabiago / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (62): Realizzazione siti web a Parabiago: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Parabiago per PMI, artigiani e professionisti
- **Words**: 2122 · **City hits**: 38
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-rho.html` — T1 · score 100 · P1

- **Intent**: commercial-transactional — query: _realizzazione siti web rho / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (56): Realizzazione siti web a Rho: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Rho per aziende che vogliono più richieste
- **Words**: 2007 · **City hits**: 35
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Upgrade competitivo su query "realizzazione siti web rho / creazione sito web {city}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.
  1. Pagina revenue core: costi da €1.200, processo 5 fasi, esempi Rho/Milano Ovest, link da blog "quanto costa un sito".

### `/realizzazione-siti-web-senago.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web senago / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (59): Realizzazione siti web a Senago: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Senago per aziende che vogliono più contatti
- **Words**: 1951 · **City hits**: 38
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/realizzazione-siti-web-solaro.html` — DV · score 100 · P3

- **Intent**: commercial-transactional — query: _realizzazione siti web solaro / creazione sito web {city}_
- **Ruolo**: Pagina revenue siti: prezzi, processo, deliverable, casi, CTA
- **Title** (59): Realizzazione siti web a Solaro: da €1.200 e SEO | WebNovis
- **H1**: Realizzazione siti web a Solaro per PMI e professionisti locali
- **Words**: 2082 · **City hits**: 37
- **Schema**: BreadcrumbList, ListItem, WebPage, SpeakableSpecification, PostalAddress, GeoCoordinates, City, AdministrativeArea, GeoCircle, OpeningHoursSpecification, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✓ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/seo-locale-cormano.html` — DV · score 100 · P3

- **Intent**: commercial-investigational — query: _SEO locale cormano / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (58): SEO locale a Cormano: Google Maps e lead locali | WebNovis
- **H1**: SEO locale a Cormano per attività e professionisti che vogliono più richieste
- **Words**: 1604 · **City hits**: 50
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/seo-locale-milano.html` — T2 · score 100 · P3

- **Intent**: commercial-investigational — query: _SEO locale milano / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (56): SEO Locale a Milano: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Milano per farti trovare su Google Maps
- **Words**: 1630 · **City hits**: 51
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=1
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/seo-locale-rozzano.html` — DV · score 100 · P3

- **Intent**: commercial-investigational — query: _SEO locale rozzano / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (55): SEO locale a Rozzano: Google Maps e contatti | WebNovis
- **H1**: SEO locale a Rozzano per Google Maps, ricerche locali e richieste
- **Words**: 1564 · **City hits**: 47
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/seo-locale-senago.html` — DV · score 100 · P3

- **Intent**: commercial-investigational — query: _SEO locale senago / SEO Google Maps {city}_
- **Ruolo**: Servizio SEO locale: Maps, NAP, pagine locali, reporting
- **Title** (56): SEO Locale a Senago: Google Maps da €400/mese | WebNovis
- **H1**: SEO Locale a Senago per farti trovare su Google Maps
- **Words**: 1481 · **City hits**: 47
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/sito-vetrina-bollate.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _sito vetrina bollate_
- **Ruolo**: Sito multi-pagina PMI / professionisti
- **Title** (60): Sito vetrina a Bollate: da €1.200 e SEO integrata | WebNovis
- **H1**: Sito vetrina a Bollate per aziende che vogliono più contatti
- **Words**: 1324 · **City hits**: 50
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/sito-vetrina-lainate.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _sito vetrina lainate_
- **Ruolo**: Sito multi-pagina PMI / professionisti
- **Title** (62): Sito Vetrina a Lainate: sito professionale da €1200 | WebNovis
- **H1**: Sito Vetrina a Lainate per aziende che vogliono più richieste
- **Words**: 1260 · **City hits**: 49
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/sito-vetrina-legnano.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _sito vetrina legnano_
- **Ruolo**: Sito multi-pagina PMI / professionisti
- **Title** (62): Sito Vetrina a Legnano: sito professionale da €1200 | WebNovis
- **H1**: Sito Vetrina a Legnano per aziende che vogliono più richieste
- **Words**: 1223 · **City hits**: 46
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/sito-vetrina-rho.html` — T2 · score 100 · P3

- **Intent**: commercial-transactional — query: _sito vetrina rho_
- **Ruolo**: Sito multi-pagina PMI / professionisti
- **Title** (58): Sito Vetrina a Rho: sito professionale da €1200 | WebNovis
- **H1**: Sito Vetrina a Rho per aziende che vogliono più richieste
- **Words**: 1046 · **City hits**: 44
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=3
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/social-media-legnano.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _social media legnano / gestione social {city}_
- **Ruolo**: Creatività + ads social (non gestione account full-time se non offerto)
- **Title** (61): Social media a Legnano: contenuti, Meta Ads e lead | WebNovis
- **H1**: Social media a Legnano per PMI e professionisti che vogliono più richieste
- **Words**: 1080 · **City hits**: 41
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/social-media-milano.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _social media milano / gestione social {city}_
- **Ruolo**: Creatività + ads social (non gestione account full-time se non offerto)
- **Title** (55): Social Media a Milano: gestione da €300/mese | WebNovis
- **H1**: Social Media a Milano per visibilità, contenuti e lead
- **Words**: 1094 · **City hits**: 36
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

### `/social-media-parabiago.html` — DV · score 100 · P3

- **Intent**: commercial-service — query: _social media parabiago / gestione social {city}_
- **Ruolo**: Creatività + ads social (non gestione account full-time se non offerto)
- **Title** (58): Social Media a Parabiago: gestione da €300/mese | WebNovis
- **H1**: Social Media a Parabiago per visibilità, contenuti e lead
- **Words**: 1131 · **City hits**: 40
- **Schema**: BreadcrumbList, ListItem, WebPage, PostalAddress, GeoCoordinates, City, OfferCatalog, Offer, Service, FAQPage, Question, Answer
- **GEO flags**: capsule=✓ speakable=✗ FAQ=✓ NAP=✓ price=✓ proof=✓
- **Internal**: preventivo/contatti=✓ hub servizi=✓ same-service altre città=0
- **Azioni consigliate**:
  1. Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.

## Matrice intent consigliata (anti-cannibalizzazione)

| Città | URL primaria brand | URL primaria siti | URL primaria SEO | Altre indexable |
|---|---|---|---|---|
| arese | ✓ | ✓ | ✓ | sito-vetrina, ecommerce, landing-page |
| arluno | — | ✓ | — | — |
| baranzate | ✓ | — | — | — |
| bollate | ✓ | ✓ | — | ecommerce, landing-page, sito-vetrina |
| bresso | — | — | ✓ | ecommerce |
| buccinasco | — | ✓ | — | — |
| caronno-pertusella | — | ✓ | — | — |
| castellanza | ✓ | ✓ | — | — |
| cinisello-balsamo | ✓ | — | ✓ | ecommerce |
| cormano | — | ✓ | ✓ | ecommerce |
| cornaredo | ✓ | — | — | — |
| garbagnate | ✓ | ✓ | ✓ | ecommerce |
| lainate | ✓ | — | ✓ | ecommerce, sito-vetrina |
| legnano | ✓ | ✓ | — | ecommerce, sito-vetrina, social-media |
| limbiate | — | ✓ | — | ecommerce |
| magenta | — | ✓ | — | — |
| milano | ✓ | — | ✓ | email-marketing, landing-page, ecommerce, graphic-design, social-media |
| milano-nord | ✓ | — | — | — |
| milano-ovest | ✓ | ✓ | — | landing-page |
| monza | ✓ | — | — | ecommerce, email-marketing, google-ads |
| novate-milanese | ✓ | — | — | — |
| origgio | — | ✓ | — | — |
| parabiago | ✓ | ✓ | ✓ | social-media |
| pero | ✓ | — | — | — |
| rho | ✓ | ✓ | ✓ | ecommerce, landing-page, sito-vetrina |
| rozzano | — | — | ✓ | — |
| saronno | ✓ | — | — | — |
| senago | — | ✓ | ✓ | ecommerce |
| sesto-san-giovanni | ✓ | — | ✓ | social-media |
| settimo-milanese | ✓ | — | — | — |
| solaro | — | ✓ | — | — |

## Next steps operativi

1. Sistemare tutte le P0 (file mancanti / noindex accidentali / canonical rotti).
2. Upgrade contenuto su tutte le **Tier 1** sotto score 85.
3. Per città dense (Milano, Rho, e multi-service): definire 1 primary URL per intent e far linkare le secondarie verso di essa.
4. Estendere answer-capsule + Speakable a tutto il T1 e alle DV con impression GSC.
5. Rimuovere o non spingere AggregateRating fuori da review verificabili.
