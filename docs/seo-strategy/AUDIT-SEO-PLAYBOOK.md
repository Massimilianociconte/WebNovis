# Audit SEO Playbook vs. Stato Attuale WebNovis

**Data audit:** 18 febbraio 2026  
**File analizzato:** `docs/seo-strategy/SEO-playbook.MD`  
**Obiettivo:** confronto sistematico tra ogni principio del playbook e l'attuale implementazione, con classificazione, impatto, priorità e azioni concrete.

---

## Legenda classificazione

| Simbolo | Categoria |
|---------|-----------|
| ✅ | Già implementato correttamente |
| 🔶 | Parzialmente implementato / migliorabile |
| ❌ | Non implementato ma ad alto valore strategico |
| ⚪ | Non prioritario o a basso impatto attuale |

---

## 1. SEO TECNICA (Express.js / Server-side)

### 1.1 Early Hints (103 status code)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Riduce LCP percepito, il browser preleva CSS/JS mentre il server processa |
| **Priorità** | **Alta** |
| **Motivazione** | Il playbook lo identifica come "single highest-impact, lowest-effort technical change". Node.js v18.11+ supporta `res.writeEarlyHints()` nativamente. Il sito è hostato su GitHub Pages (non Express in produzione per le pagine statiche), ma se si usa Cloudflare basta un toggle in Speed > Optimization. |
| **Azione** | Abilitare Early Hints su Cloudflare (1 click). Se il server Express serve pagine in produzione, aggiungere `res.writeEarlyHints()` per CSS/JS critici. |

### 1.2 Brotli compression
| | |
|---|---|
| **Stato** | ❌ Non implementato lato server |
| **Impatto** | **Alto** — 20–30% meglio di gzip, impatto diretto su TTFB e LCP |
| **Priorità** | **Alta** |
| **Motivazione** | `server.js` non ha alcun middleware di compressione (nessun `compression`, nessun `shrink-ray-current`). Per GitHub Pages + Cloudflare, basta il toggle Cloudflare. |
| **Azione** | 1) Abilitare Brotli su Cloudflare free tier (1 click). 2) Per il server Express (chat API su Render), installare `shrink-ray-current` come middleware. |

### 1.3 HTTP/3 (QUIC)
| | |
|---|---|
| **Stato** | 🔶 Dipende da Cloudflare |
| **Impatto** | **Medio** — Miglior connection setup, specialmente su mobile |
| **Priorità** | **Bassa** |
| **Motivazione** | HTTP/3 è abilitato di default su Cloudflare se il sito passa da lì. Nessuna azione Express-side necessaria. |
| **Azione** | Verificare che HTTP/3 sia attivo nella dashboard Cloudflare (di solito lo è di default). |

### 1.4 Security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio-Alto** — HSTS rinforza il segnale HTTPS ranking; gli altri prevengono vulnerabilità e migliorano trust |
| **Priorità** | **Alta** |
| **Motivazione** | `server.js` non imposta NESSUN security header. Nessun middleware per HSTS, nosniff, referrer-policy o permissions-policy. |
| **Azione** | Aggiungere middleware Express: `Strict-Transport-Security: max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Oppure configurarli via Cloudflare Transform Rules. |

### 1.5 X-Robots-Tag middleware per admin/API paths
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — Impedisce indicizzazione accidentale di endpoint API/admin senza inquinare HTML |
| **Priorità** | **Media** |
| **Motivazione** | I path `/api/*` e `/admin/*` non hanno header `X-Robots-Tag: noindex, nofollow`. robots.txt blocca `/server.js` e `/docs/` ma non gli endpoint API serviti dal server Express. |
| **Azione** | Aggiungere middleware: `if (req.path.match(/\/(admin|api|search|tag)/)) res.set('X-Robots-Tag', 'noindex, nofollow');` |

### 1.6 Trailing slash normalization (301 redirect)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Previene contenuti duplicati, consolida segnali di ranking |
| **Priorità** | **Alta** |
| **Motivazione** | `server.js` non ha alcun middleware di normalizzazione URL. `/servizi/` e `/servizi` sono potenzialmente due URL diversi per Google. |
| **Azione** | Aggiungere middleware trailing-slash normalization come da playbook. Per GitHub Pages, è gestito nativamente (redirect automatico). |

### 1.7 Self-referencing canonical injection via middleware
| | |
|---|---|
| **Stato** | 🔶 Parziale — canonical presente in HTML, non in middleware |
| **Impatto** | **Medio** — Le pagine HTML hanno `<link rel="canonical">` hardcoded, ma il middleware sarebbe più robusto per pagine dinamiche |
| **Priorità** | **Media** |
| **Motivazione** | index.html ha `<link rel="canonical" href="https://www.webnovis.com/">` correttamente. Tutte le pagine principali hanno canonical. Tuttavia non c'è middleware server-side per pagine generate dinamicamente. |
| **Azione** | Aggiungere `res.locals.canonicalUrl` middleware per consistenza. Bassa urgenza dato che le pagine statiche hanno già i canonical. |

### 1.8 UTM/tracking parameter stripping (301)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio-Alto** — Previene duplicati da campagne UTM/fbclid/gclid |
| **Priorità** | **Media** |
| **Motivazione** | Nessun middleware per strippare parametri UTM. Se si fanno campagne con UTM, Google potrebbe indicizzare URL con parametri come pagine separate. |
| **Azione** | Aggiungere middleware UTM stripping come da playbook. Alternativa: configurare parametri in Google Search Console. |

### 1.9 Cache-Control headers / stale-while-revalidate
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Migliora drasticamente performance percepita per visite ripetute |
| **Priorità** | **Alta** |
| **Motivazione** | `server.js` usa `express.static()` senza opzioni di cache personalizzate. Nessun `Cache-Control`, nessun `stale-while-revalidate`. |
| **Azione** | 1) HTML: `Cache-Control: public, max-age=300, stale-while-revalidate=3600`. 2) Asset statici (.min.js/.min.css con cache-bust): `max-age=31536000, immutable`. 3) Configurare 3 Cloudflare Cache Rules. |

### 1.10 Dynamic sitemap con lastmod accurato
| | |
|---|---|
| **Stato** | 🔶 Parziale — sitemap statica, lastmod presente ma manuale |
| **Impatto** | **Medio** — Google usa `lastmod` solo quando accurato; `changefreq` e `priority` vengono ignorati |
| **Priorità** | **Media** |
| **Motivazione** | `sitemap.xml` è statico con date manuali. Contiene `changefreq` e `priority` che Google ignora. Le date `lastmod` devono essere aggiornate manualmente. Non c'è generazione dinamica via `sitemap` npm package. |
| **Azione** | Creare endpoint `/sitemap.xml` dinamico che legge le date di modifica reali dei file. Rimuovere `changefreq` e `priority` (inutili). Integrare nel build pipeline per auto-aggiornamento. |

### 1.11 Bot detection/logging middleware
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — Intelligenza critica per strategia GEO: quali bot visitano, quanto spesso, quali pagine |
| **Priorità** | **Media** |
| **Motivazione** | Nessun logging di bot in `server.js`. Non si sa se GPTBot, ClaudeBot, Bingbot visitano il sito e con quale frequenza. |
| **Azione** | Aggiungere middleware bot-detection come da playbook. Analizzare log con Screaming Frog Log File Analyser (free per 1K eventi). |

### 1.12 Hreflang (Italian + English)
| | |
|---|---|
| **Stato** | 🔶 Solo italiano, nessuna versione inglese |
| **Impatto** | **Medio** — +20-300% impression nelle regioni target secondo il playbook |
| **Priorità** | **Bassa** (finché non esiste contenuto inglese) |
| **Motivazione** | index.html ha `<link rel="alternate" hreflang="it">` ma non c'è versione inglese del sito. Non c'è `x-default`. |
| **Azione** | Quando si crea contenuto inglese: aggiungere subdirectory `/en/`, implementare hreflang bidirezionale con `x-default` → italiano. Per ora, non prioritario. |

### 1.13 Custom 404/500 error pages
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — UX, retention, e segnali di qualità |
| **Priorità** | **Media** |
| **Motivazione** | `server.js` non ha handler per 404 o 500. Le richieste a URL inesistenti restituiscono il default Express (HTML generico). |
| **Azione** | Creare pagine 404.html e 500.html branded con navigazione, search bar, e link alle pagine principali. Aggiungere handler Express: `app.use((req,res) => res.status(404).sendFile('404.html'))`. |

---

## 2. ON-PAGE SEO

### 2.1 Meta tag completi (title, description, canonical, robots, OG, Twitter)
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Critico** |
| **Priorità** | — |
| **Motivazione** | Tutte le 40+ pagine hanno title, description, canonical, robots con `max-image-preview:large`, OG tags, Twitter cards, og:site_name, og:locale. |

### 2.2 Resource hints (preconnect, preload, dns-prefetch, fetchpriority)
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Alto** |
| **Priorità** | — |
| **Motivazione** | index.html ha `preconnect` per Google Fonts, `preload` per sfondo hero e font stylesheet, `fetchpriority="high"` sul logo. Tutte le pagine hanno preconnect per fonts.googleapis.com e fonts.gstatic.com. |

### 2.3 Image SEO (WebP, width/height, nomi descrittivi, image sitemap)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Alto** — Impatto su CLS, LCP, e Google Images |
| **Priorità** | **Media** |
| **Motivazione** | Le immagini usano WebP ✅, il logo ha `width`/`height` ✅, c'è image sitemap nel sitemap.xml ✅. Tuttavia: nessun formato AVIF come fallback progressivo, nessun uso di `<picture>` element con fallback, e non tutte le immagini nel sito hanno `width`/`height` espliciti. |
| **Azione** | 1) Aggiungere `width`/`height` a tutte le immagini mancanti. 2) Considerare AVIF con `<picture>` fallback per le immagini hero più pesanti. 3) Nomi file sono già descrittivi (buono). |

### 2.4 "Answer capsule" formatting per GEO
| | |
|---|---|
| **Stato** | 🔶 Parziale — blog articles hanno CTA/summary, ma non la specifica tecnica "answer capsule" |
| **Impatto** | **Molto Alto** — +30-40% visibilità AI, pages con questa tecnica sono "significantly more likely to be cited" |
| **Priorità** | **Alta** |
| **Motivazione** | Il playbook richiede: "250–350 caratteri di risposta completa standalone subito dopo l'heading primario, prima di qualsiasi contesto introduttivo". I blog post attuali hanno intro ma NON nel formato specifico answer capsule ottimizzato per citazione AI. Le service pages non hanno answer capsules. |
| **Azione** | Ristrutturare le top 10 pagine (homepage, 3 servizi, 5 blog post principali, contatti) con answer capsule di 40-70 parole subito dopo ogni H1/H2 chiave. Priorità assoluta per le pagine servizi. |

### 2.5 Question-based H2/H3 headings
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Alto** — PAA boxes appaiono nel 75% delle ricerche; voce search >40% interazioni |
| **Priorità** | **Alta** |
| **Motivazione** | Le FAQ in JSON-LD usano domande in formato question ✅. Ma gli heading H2/H3 nel body content delle service pages e blog usano prevalentemente formato dichiarativo, non interrogativo. |
| **Azione** | Riscrivere gli H2/H3 chiave delle service pages in formato domanda: "Quanto costa un sito web?", "Come funziona il nostro processo?", "Perché scegliere codice custom?". Mantenere 120-180 parole tra heading. |

### 2.6 Internal linking strategico (8-20 link contestuali per pagina)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Molto Alto** — +30% traffico organico, ranking 2.5x più duraturi |
| **Priorità** | **Alta** |
| **Motivazione** | Blog articles hanno related articles e CTA ma i link contestuali nel body sono limitati. Le service pages linkano principalmente via navigazione, non nel contenuto. Homepage ha link di navigazione ma pochi link contestuali nel body content. Il playbook richiede 8-20 link CONTESTUALI (nel body, non nella nav). |
| **Azione** | 1) Audit link interni con Screaming Frog free. 2) Aggiungere 8-20 link contestuali per pagina. 3) Linkare dalla homepage (alta autorità) alle money pages (servizi, contatti). 4) Link nei primi 2-3 paragrafi delle pagine. |

### 2.7 Content length e aggiornamento (2,900+ words, quarterly updates)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Alto** — Articoli >2,900 parole ottengono 5.1 citazioni AI vs 3.2 per <800 parole |
| **Priorità** | **Media** |
| **Motivazione** | I blog post auto-generati variano in lunghezza. I due pricing articles manuali sono lunghi e dettagliati. Le service pages sono più brevi. Non c'è un processo sistematico di aggiornamento trimestrale. |
| **Azione** | 1) Espandere le 3 service pages principali a 2,000+ parole. 2) Creare 3-5 "pillar articles" da 3,000+ parole. 3) Implementare `dateModified` schema visibile. 4) Calendario aggiornamento trimestrale. |

### 2.8 Statistics, citations, expert quotes nel contenuto
| | |
|---|---|
| **Stato** | 🔶 Parziale — blog articles hanno citazioni via build template, ma non sistematico |
| **Impatto** | **Molto Alto** — Statistiche +30-40% visibilità AI; quote +41% |
| **Priorità** | **Alta** |
| **Motivazione** | Il blog auto-writer include istruzioni per citazioni e statistiche, ma il contenuto effettivo varia. Le service pages NON hanno statistiche o citazioni esterne. Il playbook chiede 3+ statistiche citate ogni 1,000 parole. |
| **Azione** | 1) Aggiungere sezioni con dati quantitativi alle service pages ("il 75% delle PMI italiane non ha un sito web ottimizzato — fonte ISTAT 2025"). 2) Includere citazioni di esperti o clienti. 3) Verificare che il blog auto-writer produca effettivamente 3+ statistiche/1000 parole. |

---

## 3. DATI STRUTTURATI (Schema.org)

### 3.1 Organization, WebSite, LocalBusiness, WebPage, BreadcrumbList, FAQPage
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Critico** |
| **Priorità** | — |
| **Motivazione** | index.html ha 6 blocchi JSON-LD interlinked con @id references: Organization, WebSite con SearchAction, LocalBusiness+ProfessionalService con geo/openingHours/areaServed/hasOfferCatalog/aggregateRating/reviews, WebPage, BreadcrumbList, FAQPage con 8 FAQ. NAP consistente e corretto. |

### 3.2 GeoCoordinates, ServiceArea (GeoCircle), areaServed espanso
| | |
|---|---|
| **Stato** | 🔶 Parziale — GeoCoordinates e areaServed presenti, manca ServiceArea GeoCircle |
| **Impatto** | **Medio** — Migliora comprensione machine del raggio di servizio |
| **Priorità** | **Media** |
| **Motivazione** | LocalBusiness ha `geo` con lat/lng ✅ e `areaServed` con Rho, Milano, Hinterland, Italia ✅. Manca il `serviceArea` con `GeoCircle` e `geoRadius` come suggerito dal playbook. Mancano anche città specifiche come Monza, Pero, Arese dal playbook. |
| **Azione** | Aggiungere `serviceArea` GeoCircle con raggio 30km. Espandere `areaServed` con Monza, Pero, Arese, Lainate, Bollate. |

### 3.3 Person schema con knowsAbout
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Critico per E-E-A-T, collegamento autori → competenze → contenuti |
| **Priorità** | **Alta** |
| **Motivazione** | Non esiste Person schema per i fondatori/team. Il playbook lo indica come tipo "high-impact" da aggiungere. La pagina chi-siamo.html è il luogo ideale. |
| **Azione** | Aggiungere Person schema per ogni membro del team su chi-siamo.html con `knowsAbout`, `jobTitle`, `worksFor`, `sameAs` (LinkedIn, ecc.). Riferire Person schema da BlogPosting.author negli articoli. |

### 3.4 Service schema standalone
| | |
|---|---|
| **Stato** | 🔶 Parziale — presente come parte di hasOfferCatalog, non come schema dedicato |
| **Impatto** | **Medio** — Rich result per servizi, miglior comprensione AI |
| **Priorità** | **Media** |
| **Motivazione** | I servizi sono elencati in `hasOfferCatalog` nel LocalBusiness ✅. Ma le pagine servizi individuali (sviluppo-web.html, graphic-design.html, social-media.html) probabilmente non hanno Service schema dedicato. |
| **Azione** | Aggiungere Service schema dedicato su ogni pagina servizio con name, description, provider, areaServed, offers/priceSpecification. |

### 3.5 Wikidata entry + riferimento in sameAs
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — +47% rilevanza in AI; Wikidata è fonte primaria per Knowledge Graph |
| **Priorità** | **Alta** |
| **Motivazione** | Il playbook lo indica come fondamentale per entity SEO. Wikidata ha requisiti di notabilità meno stringenti di Wikipedia. Nessun riferimento Wikidata attuale nel sameAs. |
| **Azione** | 1) Creare entry Wikidata per WebNovis (instance of: business, country: Italy, industry: web development). 2) Aggiungere URL Wikidata al sameAs dell'Organization schema. |

### 3.6 Crunchbase profile
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio-Alto** — AI platforms citano frequentemente Crunchbase per info business |
| **Priorità** | **Media** |
| **Motivazione** | Nessun profilo Crunchbase. Il playbook lo indica come fonte frequentemente citata da AI. |
| **Azione** | Creare profilo Crunchbase gratuito e aggiungere URL al sameAs. |

---

## 4. PERFORMANCE & CORE WEB VITALS

### 4.1 INP optimization (≤200ms)
| | |
|---|---|
| **Stato** | 🔶 Probabile OK ma non monitorato |
| **Impatto** | **Alto** — Siti con INP scarso hanno +40% bounce rate |
| **Priorità** | **Media** |
| **Motivazione** | Il sito usa vanilla JS (non framework pesanti), il che è un vantaggio. Ma non c'è monitoraggio Real User con `web-vitals` library. Non si sa il valore reale di INP. |
| **Azione** | 1) Integrare `web-vitals` npm per RUM → GA4. 2) Verificare DOM size (target <1,400 nodi). 3) Usare `requestIdleCallback` per task non critici. |

### 4.2 TTFB optimization
| | |
|---|---|
| **Stato** | 🔶 Dipende dall'hosting |
| **Impatto** | **Alto** — TTFB è ranking signal nel 2025 |
| **Priorità** | **Media** |
| **Motivazione** | GitHub Pages + Cloudflare ha buon TTFB nativo. Il server Express su Render (per chat API) non ha ottimizzazioni specifiche (nessun `node-cache`, nessun response streaming). |
| **Azione** | 1) Aggiungere `node-cache` per risposte API frequenti. 2) Early Hints (vedi 1.1). 3) Verificare TTFB reale con CrUX API. |

### 4.3 web-vitals RUM → GA4
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Dati reali da utenti, non solo lab data Lighthouse |
| **Priorità** | **Alta** |
| **Motivazione** | Non c'è integrazione `web-vitals`. Non si monitora CLS, INP, LCP con dati di campo. GA4 è configurato ma non riceve metriche CWV. |
| **Azione** | Aggiungere script `web-vitals` che invia CLS, INP, LCP a GA4 come custom events. |

### 4.4 Lighthouse CI in GitHub Actions
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — Previene regressioni performance, enforce minimum scores |
| **Priorità** | **Media** |
| **Motivazione** | `.github/workflows/` ha solo `daily-blog.yml`. Nessun Lighthouse CI. Non ci sono performance budget. |
| **Azione** | Aggiungere `lighthouserc.js` e workflow GitHub Actions per Lighthouse CI con soglie: performance ≥85, SEO ≥90. |

### 4.5 Structured data testing in CI/CD
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — Cattura regressioni schema prima del deploy |
| **Priorità** | **Bassa** |
| **Motivazione** | Nessun test automatizzato per validazione schema.org. Il playbook suggerisce `structured-data-testing-tool` in CI. |
| **Azione** | Aggiungere `npx sdtt --url https://webnovis.com --presets Google` nel pipeline CI. |

---

## 5. OFF-PAGE SEO & LINK BUILDING

### 5.1 robots.txt con AI bot espliciti Allow
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Critico per GEO** |
| **Priorità** | — |
| **Motivazione** | robots.txt ha Allow esplicito per: GPTBot, OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, CCBot, Google-Extended, Perplexity-User, anthropic-ai, Applebot-Extended, Amazonbot, DuckAssistBot, meta-externalagent. 12 AI bot totali. Scraper aggressivi (MJ12bot, DotBot, BLEXBot) bloccati. |

### 5.2 AI content files (ai.txt, llms.txt, webnovis-ai-data.json)
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Alto per GEO** |
| **Priorità** | — |
| **Motivazione** | Tre file AI-specific serviti da server.js e referenziati in robots.txt e meta tags. llms.txt segue formato Jeremy Howard. |

### 5.3 Unlinked brand mention monitoring
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Molto Alto** — 40-60% conversion rate, ROI più alto di qualsiasi tattica di link building |
| **Priorità** | **Alta** |
| **Motivazione** | Nessun alert configurato per menzioni WebNovis senza link. Il playbook indica questo come "highest-ROI tactic available". |
| **Azione** | 1) Configurare Talkwalker Alerts per "WebNovis" e "webnovis.com". 2) Google Alerts stessi termini. 3) Ricerca manuale periodica: `"WebNovis" -site:webnovis.com`. |

### 5.4 HARO / Source of Sources / Help a B2B Writer
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Backlink da media autorevoli, boost E-E-A-T |
| **Priorità** | **Media** |
| **Motivazione** | Nessuna iscrizione a piattaforme di journalist outreach. |
| **Azione** | Iscriversi a: Source of Sources, HARO (relaunched), Help a B2B Writer. Monitorare #journorequests su X/BlueSky per il mercato italiano. |

### 5.5 Competitor backlink analysis
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Identifica opportunità di link mancati |
| **Priorità** | **Media** |
| **Motivazione** | Nessuna analisi backlink dei competitor documentata. |
| **Azione** | Analizzare 3-5 web agency italiane competitor con: Ahrefs Free Backlink Checker, OpenLinkProfiler, Moz Link Explorer. Identificare siti che linkano competitor ma non WebNovis. |

### 5.6 Italian developer communities
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — Authority building a lungo termine |
| **Priorità** | **Bassa** |
| **Motivazione** | Nessuna partecipazione documentata a Developers Italia, GrUSP, Milano Front End, HTML.it, MrWebmaster.it. |
| **Azione** | Unirsi a 2-3 community prioritarie. Contribuire attivamente con risposte utili. |

### 5.7 Linkable assets (tool gratuiti)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Molto Alto** — Attrae link organici, il playbook cita "website cost calculator" come esempio perfetto |
| **Priorità** | **Alta** |
| **Motivazione** | Nessun tool gratuito pubblicato. Le pagine "quanto costa" sono articoli informativi, non tool interattivi. |
| **Azione** | Creare uno di: 1) Calcolatore costi sito web interattivo. 2) Meta tag generator per PMI italiane. 3) Schema Markup Generator per local business. Promuovere attivamente. |

### 5.8 Directory listings (sameAs)
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Medio** |
| **Priorità** | — |
| **Motivazione** | sameAs include: Instagram, Clutch, Trustpilot, Hotfrog, Cylex, Firmania, Trova Aperto, Cronoshare. NAP allineato su tutte le directory. |

---

## 6. LOCAL SEO

### 6.1 Google Business Profile completo
| | |
|---|---|
| **Stato** | 🔶 Parziale — schema completo, GBP reale da verificare |
| **Impatto** | **Critico** — Primary GBP category è il fattore #1 per local pack |
| **Priorità** | **Alta** |
| **Motivazione** | JSON-LD ha tutto: indirizzo, geo, orari 24/7, telefono, hasOfferCatalog, aggregateRating. Il GBP reale deve essere verificato per: tutte le 4 categorie aggiuntive, attributi completi, posting settimanale, foto geo-tagged mensili. |
| **Azione** | 1) Verificare che GBP abbia 4+ categorie aggiuntive. 2) Iniziare posting GBP settimanale. 3) Caricare foto geo-tagged mensilmente. 4) Completare tutti gli attributi. |

### 6.2 Review generation (QR code nativo Google)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Molto Alto** — Review recency è top-5 factor; QR code +40% submission |
| **Priorità** | **Alta** |
| **Motivazione** | Il playbook indica review signals come la categoria che è cresciuta di più. Google ha introdotto QR code nativi per recensioni a marzo 2025. |
| **Azione** | 1) Generare QR review da GBP Dashboard. 2) Inserire su fatture, email firma, biglietti da visita, pagina contatti del sito. 3) Rispondere a TUTTE le review entro 24h con keyword locali. |

### 6.3 GBP weekly posting e foto geo-tagged
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Inattività 30+ giorni = decay drammatico impressioni; 100+ foto = +520% chiamate |
| **Priorità** | **Alta** |
| **Motivazione** | Nessun sistema di posting GBP. Il playbook cita "decay rate of visibility" per business inattivi. |
| **Azione** | Creare calendario editoriale GBP settimanale. Caricare foto geo-tagged del team/ufficio/progetti almeno mensilmente. |

### 6.4 City landing pages (5-8 città)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Cattura traffico "web agency + [città]" per 5-8 località |
| **Priorità** | **Media** |
| **Motivazione** | Non esistono landing page per Rho, Milano, Monza, Pero, Arese, Lainate, Bollate. Il playbook richiede 500+ parole uniche e 30%+ differenziazione tra pagine. |
| **Azione** | Creare 5-8 pagine `/aree-servite/[città]/` con contenuto unico: testimonianze locali, contesto area, case study locali, mappa Google embedded. |

### 6.5 Voice search optimization (FAQ in formato domanda italiana)
| | |
|---|---|
| **Stato** | 🔶 Parziale — FAQ schema presenti, heading non ottimizzati per voce |
| **Impatto** | **Alto** — 40%+ interazioni digitali via voce; 58% cerca business locali via voce |
| **Priorità** | **Media** |
| **Motivazione** | FAQPage schema ha 8 domande in formato naturale ✅. Tuttavia le domande non coprono pattern vocali italiani specifici ("Ok Google, trovami...", "Quanto costa...", "Qual è il migliore..."). Heading nelle pagine non sono in formato interrogativo. |
| **Azione** | Espandere FAQ con domande in formato voce italiana. Usare stessi formati come H2/H3 nel body content. |

---

## 7. CONTENT STRATEGY & GEO

### 7.1 Entity SEO / Knowledge Graph recognition
| | |
|---|---|
| **Stato** | 🔶 Parziale — schema forte, manca Wikidata/Crunchbase |
| **Impatto** | **Molto Alto** — Fondamentale per SEO tradizionale E visibilità AI |
| **Priorità** | **Alta** |
| **Motivazione** | Organization schema con sameAs a 8 directory ✅. Ma mancano Wikidata e Crunchbase (le due fonti più citate da AI). Per un Knowledge Panel servono 7+ menzioni su siti DA 80+. |
| **Azione** | 1) Creare Wikidata entry. 2) Creare Crunchbase profile. 3) Puntare a 7+ menzioni su siti DA 80+ (Ninja Marketing, Wired Italia, Il Sole 24 Ore tech, etc.). |

### 7.2 Programmatic SEO (city+service, industry+service pages)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — 40-60% delle pagine guadagnano traffico organico in 6 mesi |
| **Priorità** | **Media** (richiede contenuto unico per evitare penalità doorway page) |
| **Motivazione** | Nessuna pagina programmatica. Potenziale per "Web Design Milano", "SEO Monza", "Sito web per ristoranti", "E-commerce per negozi". |
| **Azione** | Iniziare con 10-20 pagine city+service con Express.js template + contenuto unico 500+ parole. Monitorare e scalare. |

### 7.3 Semantic SEO (TF-IDF, entity co-occurrence)
| | |
|---|---|
| **Stato** | 🔶 Parziale — contenuto semanticamente ricco ma non analizzato sistematicamente |
| **Impatto** | **Medio-Alto** |
| **Priorità** | **Media** |
| **Motivazione** | I contenuti usano terminologia rilevante ma non c'è analisi TF-IDF sistematica vs competitor. |
| **Azione** | Usare Seobility TF*IDF Tool e TextRazor (500 free req/day) per analizzare top 10 pagine vs competitor e colmare gap semantici. |

### 7.4 PAA (People Also Ask) domination
| | |
|---|---|
| **Stato** | 🔶 Parziale — FAQ presenti, ma non ricerca sistematica PAA |
| **Impatto** | **Alto** — PAA in 75% ricerche; visibilità cresciuta 34.7% YoY |
| **Priorità** | **Media** |
| **Motivazione** | FAQPage ha 8 domande. Ma non c'è ricerca sistematica con Answer Socrates / AlsoAsked / AnswerThePublic per trovare le domande reali degli utenti. |
| **Azione** | 1) Ricerca PAA con Answer Socrates (3 free/day). 2) Espandere FAQ in ogni pagina servizio. 3) Aggiornare FAQ mensilmente con dati Search Console. |

### 7.5 Zero-click optimization (brand visibility in SERP)
| | |
|---|---|
| **Stato** | 🔶 Parziale — schema completo aiuta, ma manca strategia proattiva |
| **Impatto** | **Alto** — 58.5% ricerche sono zero-click; 80-83% con AI Overview |
| **Priorità** | **Media** |
| **Motivazione** | Schema FAQPage e rich results sono implementati. Ma non c'è strategia di featured snippet targeting, né pubblicazione di dati originali per citazione AI. |
| **Azione** | Targetizzare featured snippet per keyword chiave. Pubblicare ricerche originali (es. "stato dei siti web delle PMI italiane 2026"). |

### 7.6 Brand signals / branded search
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Critico** — "Brand matters more than anything else" (Google leak) |
| **Priorità** | **Alta** |
| **Motivazione** | NAP consistente ✅, directory presenti ✅. Ma mancano: menzioni terze parti su siti autorevoli, ricerche originali, tracking volume branded search, strategia attiva di brand building. |
| **Azione** | 1) Monitorare branded search volume come north-star metric (Google Search Console). 2) Perseguire menzioni su siti DA 80+. 3) Pubblicare ricerche originali. 4) Guest posting su blog di settore italiani. |

---

## 8. E-E-A-T

### 8.1 Experience signals (behind-the-scenes, case study dettagliati)
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Alto** |
| **Priorità** | — |
| **Motivazione** | 11 case study dettagliati in `/portfolio/case-study/`. Portfolio con mockup reali. Pagina chi-siamo presente. |

### 8.2 Expertise signals (Person schema, knowsAbout, whitepapers)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Alto** |
| **Priorità** | **Alta** |
| **Motivazione** | Organization ha `knowsAbout` ✅. Ma manca Person schema individuale per i fondatori. Nessun whitepaper o guida tecnica approfondita (>5,000 parole). |
| **Azione** | 1) Person schema su chi-siamo.html. 2) Pubblicare 1-2 whitepaper/guide complete. |

### 8.3 Authoritativeness signals (awards, podcast, publications)
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Alto** — Segnali di autorità difficili da replicare |
| **Priorità** | **Media** |
| **Motivazione** | Nessun award visibile, nessun podcast, nessuna pubblicazione su media di settore. |
| **Azione** | 1) Candidarsi a premi (Awwwards, CSS Design Awards, etc.). 2) Pitch podcast italiani di marketing digitale. 3) Contribuire a pubblicazioni di settore italiane. |

### 8.4 Trustworthiness signals (team photos, visible contact, update dates)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Critico** — "Trustworthiness is the most critical pillar" |
| **Priorità** | **Alta** |
| **Motivazione** | Contatti visibili (telefono, email, indirizzo) ✅. Ma: le date di pubblicazione/aggiornamento non sono sempre visibili nel contenuto. Non verificato se chi-siamo ha foto reali del team. |
| **Azione** | 1) Aggiungere date pubblicazione/aggiornamento visibili su tutti i contenuti. 2) Foto reali team su chi-siamo. 3) Link a fonti esterne autorevoli in tutti i contenuti. |

---

## 9. SOCIAL & EMERGING TRENDS

### 9.1 Social presence (LinkedIn, Reddit, YouTube)
| | |
|---|---|
| **Stato** | 🔶 Parziale — Instagram attivo, altri canali da sviluppare |
| **Impatto** | **Medio-Alto** — Reddit visibility +1,328%; LinkedIn indicizzato in AI |
| **Priorità** | **Media** |
| **Motivazione** | Solo Instagram nel sameAs. LinkedIn, Reddit, YouTube non presenti. Il playbook indica LinkedIn come "most important for B2B" e Reddit con visibilità SEO esplosa. |
| **Azione** | 1) LinkedIn aziendale + posting regolare. 2) Partecipazione utile su Reddit (r/webdev, r/SEO, subreddit italiani). 3) Considerare contenuti YouTube tutorial. |

### 9.2 Server-side GTM
| | |
|---|---|
| **Stato** | ❌ Non implementato |
| **Impatto** | **Medio** — +41% qualità dati, bypass ad-blocker |
| **Priorità** | **Bassa** |
| **Motivazione** | GA4 con Consent Mode v2 implementato ✅. Server-side GTM è miglioramento incrementale. |
| **Azione** | Implementare quando il volume di traffico giustifica l'investimento in setup. |

### 9.3 Consent Mode v2 completo
| | |
|---|---|
| **Stato** | ✅ Implementato correttamente |
| **Impatto** | **Critico per compliance** |
| **Priorità** | — |
| **Motivazione** | Tutte le pagine hanno `ad_storage: 'denied'`, `ad_user_data: 'denied'`, `ad_personalization: 'denied'` + analytics_storage gated su cookie consent. Microsoft Clarity consent-gated. |

### 9.4 First-party data strategies (email list, interactive tools)
| | |
|---|---|
| **Stato** | 🔶 Parziale |
| **Impatto** | **Alto** — Indipendenza da cookie di terze parti |
| **Priorità** | **Media** |
| **Motivazione** | Newsletter via Brevo ✅. Form contatti ✅. Chatbot AI ✅. Ma mancano tool interattivi (ROI calculator, quiz, ecc.) che generano lead qualificati. |
| **Azione** | Creare 1-2 tool interattivi (calcolatore costo sito, quiz "che tipo di sito ti serve?") per lead generation + linkable asset. |

---

## 10. EXPRESS.JS MIDDLEWARE STACK (Ordine raccomandato dal playbook)

| # | Middleware | Stato |
|---|-----------|-------|
| 1 | www → non-www redirect (301) | ❌ Non presente |
| 2 | Trailing slash normalization (301) | ❌ Non presente |
| 3 | UTM parameter stripping (301) | ❌ Non presente |
| 4 | Compression (Brotli via shrink-ray-current) | ❌ Non presente |
| 5 | Security headers (HSTS, nosniff, etc.) | ❌ Non presente |
| 6 | X-Robots-Tag per admin/API paths | ❌ Non presente |
| 7 | Canonical URL injection in res.locals | ❌ Non presente (canonical in HTML hardcoded) |
| 8 | Hreflang injection in res.locals | ❌ Non applicabile (no contenuto multilingua) |
| 9 | Bot detection/logging | ❌ Non presente |
| 10 | Cache-Control headers differenziati | ❌ Non presente |
| 11 | Custom 404/500 error pages | ❌ Non presente |

**Nota:** Il server Express è usato principalmente per API chat/newsletter su Render.com. Il sito statico è servito da GitHub Pages. Molti di questi middleware avrebbero impatto limitato se le pagine statiche passano da GitHub Pages + Cloudflare. Tuttavia, il middleware stack è critico se il server Express serve anche pagine HTML in altri contesti.

---

# ROADMAP OPERATIVA ORDINATA PER PRIORITÀ

## 🔴 FASE 1 — Quick Wins (Settimane 1-2) | Impatto immediato, sforzo minimo

| # | Azione | Impatto | Effort |
|---|--------|---------|--------|
| 1 | **Cloudflare: attivare Early Hints + Brotli + verificare HTTP/3** | ⬆⬆⬆ LCP/TTFB | 10 min |
| 2 | **Cloudflare: configurare 3 Cache Rules** (bypass API, cache static 1 mese, cache HTML 4h) | ⬆⬆⬆ Performance | 30 min |
| 3 | **Configurare Talkwalker Alerts + Google Alerts** per "WebNovis" e "webnovis.com" | ⬆⬆⬆ Link building | 15 min |
| 4 | **Iscriversi a HARO + Source of Sources + Help a B2B Writer** | ⬆⬆ Authority | 30 min |
| 5 | **Aggiungere security headers** in server.js (HSTS, nosniff, referrer-policy) | ⬆⬆ Trust + ranking | 20 min |
| 6 | **Aggiungere X-Robots-Tag middleware** per /api/* e /admin/* | ⬆ Crawl hygiene | 10 min |
| 7 | **Creare pagina 404.html** branded | ⬆ UX + retention | 1h |
| 8 | **Integrare web-vitals → GA4** per CWV reali | ⬆⬆ Monitoraggio | 30 min |

## 🟡 FASE 2 — Foundation Building (Settimane 3-8) | Alto impatto, sforzo medio

| # | Azione | Impatto | Effort |
|---|--------|---------|--------|
| 9 | **Creare Wikidata entry** per WebNovis + aggiungere a sameAs | ⬆⬆⬆ Entity SEO | 2h |
| 10 | **Creare Crunchbase profile** + aggiungere a sameAs | ⬆⬆ AI visibility | 1h |
| 11 | **Ristrutturare top 10 pagine con "answer capsule"** GEO formatting | ⬆⬆⬆ AI citation | 1 giorno |
| 12 | **Aggiungere Person schema** su chi-siamo.html per fondatori | ⬆⬆ E-E-A-T | 2h |
| 13 | **Espandere areaServed** con Monza, Pero, Arese + aggiungere serviceArea GeoCircle | ⬆⬆ Local SEO | 1h |
| 14 | **Riscrivere H2/H3** delle service pages in formato domanda | ⬆⬆ PAA + voice | 3h |
| 15 | **Aggiungere statistiche citate** alle 3 service pages | ⬆⬆⬆ GEO | 1 giorno |
| 16 | **Implementare review QR code** da GBP + sistema risposta review | ⬆⬆⬆ Local ranking | 2h |
| 17 | **Iniziare posting GBP settimanale** | ⬆⬆⬆ Local visibility | ongoing |
| 18 | **Audit internal linking** con Screaming Frog + portare a 8-20 link contestuali/pagina | ⬆⬆⬆ Ranking | 1 giorno |
| 19 | **Aggiungere Service schema** dedicato alle pagine servizi | ⬆⬆ Rich results | 3h |
| 20 | **Aggiungere bot detection middleware** in server.js | ⬆ Intelligence | 1h |
| 21 | **Competitor backlink analysis** (3-5 agency) con tool gratuiti | ⬆⬆ Link strategy | 3h |
| 22 | **Express middleware stack**: trailing slash, UTM strip, Cache-Control | ⬆⬆ SEO hygiene | 2h |
| 23 | **Aggiungere Lighthouse CI** in GitHub Actions | ⬆ Regression prevention | 2h |

## 🟢 FASE 3 — Authority Building (Mesi 2-4) | Alto impatto, sforzo alto

| # | Azione | Impatto | Effort |
|---|--------|---------|--------|
| 24 | **Creare primo linkable asset** (calcolatore costi sito web interattivo) | ⬆⬆⬆ Backlinks organici | 1 settimana |
| 25 | **Creare 5-8 city landing pages** con contenuto unico (Rho, Milano, Monza, Pero, Arese) | ⬆⬆⬆ Local traffic | 1 settimana |
| 26 | **Pubblicare 2-3 guide pillar** da 3,000+ parole con citazioni e statistiche | ⬆⬆⬆ GEO + authority | 2 settimane |
| 27 | **Pitch podcast italiani** di marketing digitale | ⬆⬆ E-E-A-T + backlinks | ongoing |
| 28 | **Broken link building campaign** (target siti .it + università) | ⬆⬆ DA link building | ongoing |
| 29 | **LinkedIn aziendale** + posting B2B regolare | ⬆⬆ Brand signals | ongoing |
| 30 | **Confcommercio/Camera di Commercio** membership per backlink DA alto | ⬆⬆ Local authority | 1 mese |

## 🔵 FASE 4 — Compounding Growth (Mesi 4-12) | Crescita esponenziale

| # | Azione | Impatto | Effort |
|---|--------|---------|--------|
| 31 | **Programmatic SEO** pages (city+service, industry+service) | ⬆⬆⬆ Long-tail traffic | ongoing |
| 32 | **Contenuto hreflang EN** per mercato internazionale | ⬆⬆ Nuovi mercati | ongoing |
| 33 | **npm open-source packages** (Express SEO middleware, Italian tools) | ⬆⬆ DA90 GitHub backlinks | ongoing |
| 34 | **University partnerships** (Politecnico, IULM) per backlink .edu | ⬆⬆⬆ High-DA links | ongoing |
| 35 | **Original research** ("Stato digitale PMI italiane 2026") | ⬆⬆⬆ Citazioni AI + media | 1 mese |
| 36 | **Monitorare AI citation** con Otterly.ai free tier | ⬆ Tracking | ongoing |
| 37 | **Tracked branded search volume** come north-star metric | ⬆ Strategy compass | ongoing |

---

# TOP 10 AZIONI A PIÙ ALTO ROI SEO NEL BREVE TERMINE

| Rank | Azione | ROI | Perché |
|------|--------|-----|--------|
| **1** | Cloudflare Early Hints + Brotli + Cache Rules | ⬆⬆⬆⬆ | 10 minuti di sforzo → miglioramento misurabile LCP/TTFB su tutte le pagine |
| **2** | Talkwalker + Google Alerts per brand monitoring | ⬆⬆⬆⬆ | 15 minuti → accesso a opportunità con 40-60% conversion rate |
| **3** | Answer capsule formatting su top 10 pagine | ⬆⬆⬆⬆ | +30-40% visibilità AI su pagine chiave |
| **4** | Security headers in server.js | ⬆⬆⬆ | 20 minuti → segnale HTTPS rafforzato + security trust |
| **5** | Wikidata + Crunchbase entries | ⬆⬆⬆ | 3h → entity recognition in Knowledge Graph + AI systems |
| **6** | Posting GBP settimanale + review QR | ⬆⬆⬆ | Sforzo minimo → review recency è top-5 local factor; inattività = decay |
| **7** | Internal linking audit + 8-20 link/pagina | ⬆⬆⬆ | +30% traffico organico; ranking 2.5x più duraturi |
| **8** | Person schema su chi-siamo.html | ⬆⬆⬆ | 2h → boost E-E-A-T misurabile |
| **9** | Statistiche citate nelle service pages | ⬆⬆⬆ | +41% citazioni AI con expert quotes; +30-40% con statistiche |
| **10** | web-vitals RUM → GA4 | ⬆⬆ | 30 min → visibilità dati reali CWV per decisioni informate |

---

# OTTIMIZZAZIONI STRUTTURALI PER MASSIMIZZARE INDICIZZAZIONE, RANKING E SOLIDITÀ A LUNGO TERMINE

## A. Architettura tecnica
1. **Middleware stack Express completo** (11 middleware nell'ordine raccomandato) — crea una base SEO solida automatizzata per qualsiasi pagina servita
2. **Dynamic sitemap** con lastmod accurato da date file reali — elimina manutenzione, migliora freshness signals
3. **Lighthouse CI + schema validation in CI/CD** — impedisce regressioni, enforce standard minimi

## B. Struttura contenuti
4. **Topic cluster architecture** — ogni servizio diventa un "pillar" con 5-10 articoli satellite interconnessi → +30% traffico, ranking 2.5x più duraturi
5. **Answer capsule su tutte le pagine** — la tecnica GEO più impattante, front-load informazioni per AI citation
6. **Content calendar trimestrale** con aggiornamento sistematico → `dateModified` sempre fresco → 6 citazioni AI vs 3.6 per contenuti datati

## C. Entity & Authority
7. **Wikidata → Crunchbase → 7+ menzioni DA 80+** — pipeline per Knowledge Panel e riconoscimento AI come entità
8. **Person schema + author pages** — collegamento autori → competenze → contenuti per E-E-A-T completo
9. **Linkable assets** (tool gratuiti) + **original research** — dual strategy per backlink organici e citazioni AI

## D. Local SEO
10. **GBP posting settimanale + review generation sistematica** — i due fattori local più in crescita secondo Whitespark 2026
11. **City landing pages** con contenuto genuinamente unico — cattura long-tail local senza penalità doorway
12. **areaServed + serviceArea espansi** in schema — machine understanding completo del raggio operativo

---

# RIEPILOGO STATISTICO

| Categoria | ✅ OK | 🔶 Parziale | ❌ Da implementare | ⚪ Non prioritario |
|-----------|-------|------------|-------------------|-------------------|
| SEO Tecnica (Server) | 0 | 4 | 9 | 0 |
| On-Page SEO | 2 | 6 | 0 | 0 |
| Dati Strutturati | 1 | 2 | 3 | 0 |
| Performance/CWV | 0 | 2 | 3 | 0 |
| Off-Page/Link Building | 2 | 0 | 5 | 1 |
| Local SEO | 0 | 2 | 3 | 0 |
| Content/GEO | 0 | 4 | 1 | 0 |
| E-E-A-T | 1 | 2 | 1 | 0 |
| Social/Emerging | 1 | 2 | 1 | 0 |
| **TOTALE** | **7** | **24** | **26** | **1** |

**Score attuale stimato:** ~54/100 (come dichiarato nel playbook)  
**Score raggiungibile con Fase 1+2:** ~72-78  
**Score raggiungibile con tutte le fasi:** 85+
