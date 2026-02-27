Tutti i dati raccolti. Compilo il report finale completo.

REPORT SEO COMPLETO — WebNovis (www.webnovis.com)
Data Audit: 27 febbraio 2026
Tipo Sito: Sito statico HTML — Web Agency italiana (Milano/Rho)
Pagine Analizzate: ~160 file HTML (110 articoli blog + 1 index blog, 8 servizi incl. index, 12 pagine località, 11 case study, 6 legacy portfolio uppercase, ~12 pagine istituzionali)

SEO HEALTH SCORE COMPLESSIVO: 74/100
Categoria	Peso	Punteggio	Ponderato
Technical SEO	25%	82/100	20.5
Content Quality (E-E-A-T)	25%	68/100	17.0
On-Page SEO	20%	72/100	14.4
Schema / Structured Data	10%	85/100	8.5
Performance (CWV)	10%	75/100	7.5
Images	5%	62/100	3.1
AI Search Readiness	5%	90/100	4.5
TOTALE	100%		75.5
1. TECHNICAL SEO — 82/100
PASS
robots.txt (9/10): Corretto, blocca file sensibili, permette AI crawlers (GPTBot, ClaudeBot, PerplexityBot), blocca scraper aggressivi
Sitemap.xml (8/10): ~151 URL, tutte con lastmod recente (2026-02-24/26), namespace image presente
Canonical tags (10/10): Presenti su tutte le 159 pagine, self-referencing corretti con dominio www
Viewport/charset/lang (10/10): <html lang="it">, viewport e charset su tutte le 160 pagine
Mobile (9/10): Responsive con clamp(), media queries @media(max-width:768px), PWA con manifest.json
JavaScript rendering (10/10): HTML statico, tutti gli script con defer, nessuna dipendenza JS per rendering
Speculation Rules API: Presente sulla homepage per prefetch/prerender
PROBLEMI
Priorità	Problema	Dettaglio
CRITICO	Handle Twitter errato su 103 pagine	twitter:site impostato su @webaboratorio (vecchio brand?) su 103 pagine blog/servizi. 54 pagine usano @webnovis corretto, 2 pagine hanno un formato diverso
BASSO	CSP assente come meta tag HTML	Nessun CSP meta tag nelle pagine HTML, ma CSP è già impostato via HTTP header in server.js (runtime Node) e documentato in _headers per Cloudflare. Il rischio XSS è già mitigato a livello server
MEDIO	Portfolio duplicati uppercase/lowercase	portfolio/Aether-Digital.html + portfolio/case-study/aether-digital.html (6 coppie duplicate) — redirect 301 già implementati in server.js (linee 192-207) per runtime Node. Per hosting statico (GitHub Pages) i file uppercase restano accessibili senza redirect
MEDIO	agenzie-web-rho.html vs agenzia-web-rho.html	Singolare/plurale duplicato
MEDIO	Hreflang non necessario	159 pagine con hreflang="it" + hreflang="x-default" su sito monolingua — overhead inutile
BASSO	Script DesignRush senza SRI	crossorigin="anonymous" ma no integrity attribute
2. CONTENT QUALITY & E-E-A-T — 68/100
E-E-A-T Breakdown
Fattore	Peso	Punteggio	Note
Experience	20%	60/100	Case study presenti (11 nel portfolio), ma blog manca di esperienza diretta ("ho testato...", "nel nostro progetto...")
Expertise	25%	70/100	Contenuti tecnicamente accurati, ma autore generico "WebNovis" senza bio individuale
Authoritativeness	25%	55/100	Nessuna citazione esterna visibile, no speaking/pubblicazioni, brand giovane
Trustworthiness	30%	80/100	Indirizzo fisico, telefono, email, Privacy/Cookie/T&C presenti, HTTPS, recensioni
Word Count per Tipo Pagina
Tipo	Minimo Richiesto	Media Trovata	Stato
Homepage	500	~3.288	PASS
Chi Siamo	400	~1.005	PASS
Servizi	800	~2.179	PASS
Blog	1.500	~1.400	ATTENZIONE
Location (agenzia-web-*)	500	~1.047	PASS
Location (realizzazione-*)	500	~2.066	PASS
PROBLEMI
Priorità	Problema	Dettaglio
ALTO	~40% degli articoli blog sotto le 1.500 parole	Campioni: ecommerce-che-vende ~1.207, content-marketing-pmi ~1.265, seo-on-page-checklist ~1.324, gdpr-guida ~1.191. Articoli troppo brevi per copertura tematica completa
ALTO	Autore generico "WebNovis" su tutti i blog	111 articoli con riferimento "author" ma sempre brand, mai persona fisica. Dopo Dec 2025 Core Update, l'attribuzione personale è critica
MEDIO	Segnali Experience deboli nel blog	Contenuti informativi validi ma senza esperienza diretta: mancano screenshot propri, processi interni documentati, risultati misurabili
MEDIO	Pattern ripetitivo nei blog	Struttura simile: intro > H2 pillars > FAQ > correlati > CTA. Possibile flag AI content
BASSO	Nessun "ultimo aggiornamento" visibile nel frontend	dateModified presente nello schema ma non mostrato all'utente
3. ON-PAGE SEO — 72/100
Title Tags
154 pagine: Tutte con <title> unico (0 duplicati)
Lunghezza: Generalmente 40-70 caratteri — alcune leggermente oltre 60 (troncamento Google)
Keyword placement: Keyword primaria all'inizio, brand alla fine
Formato coerente: Keyword — WebNovis | Sottotitolo
Meta Description
Presenti su tutte le pagine
Uniche per pagina
Lunghezza adeguata (120-160 caratteri)
Heading Structure
H1 presente su quasi tutte le pagine (404.html manca H1)
Gerarchia H1 > H2 > H3 generalmente corretta
Blog articles hanno struttura heading eccellente
PROBLEMI
Priorità	Problema	Dettaglio
CRITICO	twitter:site = @webaboratorio su 103 pagine	Handle Twitter incoerente col brand WebNovis — errore di branding critico per condivisioni social. 54 pagine hanno già @webnovis corretto
ALTO	FAQPage schema su blog commerciali	133 pagine usano FAQPage schema. Da agosto 2023, FAQ rich results sono ristretti a siti governativi/sanitari. Schema non genererà rich results e potrebbe confondere Google
MEDIO	404.html senza H1	La pagina 404 non ha tag H1
MEDIO	Heading hierarchy nel footer	H3 usati nel footer per "Servizi", "Azienda", "Legale" — semanticamente scorretto, dovrebbero essere <strong> o <div>
MEDIO	Meta keywords presenti	<meta name="keywords"> ancora presente — ignorato da Google dal 2009, overhead inutile
BASSO	Paragrafo duplicato in realizzazione-siti-web-arese.html	Stesso paragrafo ripetuto due volte
4. SCHEMA / STRUCTURED DATA — 85/100
Implementazione Eccellente
582 blocchi JSON-LD su 160 file
Tipi principali: BreadcrumbList (151), WebPage (347), BlogPosting (112), Organization (154), FAQPage (133), Service (78), Person (121), Offer (111)
LocalBusiness + ProfessionalService sulle pagine location con coordinate geo, areaServed, openingHours
SpeakableSpecification presente (12 istanze) — ottimo per voice search
SearchAction su WebSite schema
PROBLEMI
Priorità	Problema	Dettaglio
ALTO	FAQPage su 133 pagine commerciali	Ristretta dal Aug 2023 a siti gov/health. Non genererà rich results, aggiunge rumore ai dati strutturati. Rimuovere e sostituire con schema Q&A generico o rimuovere interamente
MEDIO	AggregateRating presente ma limitato	3 istanze trovate (homepage LocalBusiness + altre). Valutare se estendere ad altre pagine location/servizi con recensioni Trustpilot/Google
BASSO	ScholarlyArticle usato (1 istanza)	Verificare se appropriato per contenuti non accademici
5. PERFORMANCE (Core Web Vitals) — 75/100
Ottimizzazioni Presenti
CSS non-critico caricato con media="print" onload="this.media='all'" (revolution, search, social-feed, etc.)
7 script con defer sulla homepage — nessun render-blocking
Resource hints: 4 dns-prefetch, 3 preconnect, 3 preload
Hero image preloaded con fetchpriority="high" e formato WebP
font-display: swap attivo
web-vitals-reporter.js integrato (monitoring CWV)
GDPR consent default = denied per analytics (non rallenta)
PROBLEMI
Priorità	Problema	Dettaglio
ALTO	CSS principale: 93KB minificato	style.min.css pesa 93KB (151KB non-min). Per un sito statico è pesante — considerare critical CSS inlining + split
ALTO	JS principale: 35KB minificato	main.min.js 35KB + search.min.js 12.5KB + chat.min.js 19.5KB = ~67KB JS totale. Non terribile ma ottimizzabile
MEDIO	Nessun formato AVIF	0 immagini AVIF. WebP presente (176 file) ma AVIF offre 20-30% risparmio ulteriore
MEDIO	38 immagini >500KB (fuori mockup)	File pesanti nella directory Img/ che non sono nel folder mockup
BASSO	Inline styles nelle pagine location	CSS inline pesante nelle pagine agenzia-web-* e realizzazione-siti-web-*
6. IMAGES — 62/100
Statistiche
Metrica	Valore
Totale immagini file	318 (176 WebP, 139 PNG, 2 JPEG, 1 JPG)
Tag <img> analizzati	~752
Alt text presenti	~753 (100% copertura)
Alt text vuoti (alt="")	0
loading="lazy"	158 pagine con lazy loading
<picture> + srcset	158 pagine con responsive images
width/height attributi	~3.018 occorrenze
PROBLEMI
Priorità	Problema	Dettaglio
CRITICO	Mockup PNG da 6.7-8.3MB ciascuno	12 file in Img/Mockup-images-GBP/mockup-giusti/ pesano 6.7-8.3MB ciascuno (tot ~90MB). Anche se non serviti direttamente, occupano spazio hosting. Il file Img/mikuna.png è 7MB
ALTO	38 immagini >500KB	Troppe immagini pesanti fuori dalla cartella mockup
MEDIO	0 immagini AVIF	Manca il formato next-gen più efficiente
MEDIO	139 PNG senza WebP equivalente verificato	Verificare che ogni PNG abbia il corrispondente WebP (176 WebP vs 139 PNG — i numeri non tornano perfettamente)
7. AI SEARCH READINESS — 90/100
Eccellente Implementazione
ai.txt presente (16KB) — contenuto AI-readable
llms.txt presente (7KB) — istruzioni per LLM
<meta content="ai-content"> tag con link a ai.txt
robots.txt permette GPTBot, ClaudeBot, PerplexityBot esplicitamente
SpeakableSpecification nei dati strutturati (12 pagine)
Schema ricco e completo — ~2.5x maggiore probabilità di citazione AI
Speculation Rules API per prefetch/prerender
PROBLEMI
Priorità	Problema	Dettaglio
BASSO	llms.txt potrebbe essere più dettagliato	Aggiungere sitemap dei contenuti principali e abstract per ogni sezione
8. LOCATION PAGES — Analisi Quality Gates
Conteggio: 12 pagine (sotto la soglia dei 30)
Pattern	Pagine	Word Count Medio	Rischio
agenzia-web-*	5	~1.047	MEDIO
realizzazione-siti-web-*	6	~2.066	BASSO
agenzie-web-rho (plurale)	1	~1.000	MEDIO (duplicato)
Valutazione: NON sono doorway pages classiche
Contenuto locale unico per città (landmark, dati demografici, economia)
Schema LocalBusiness con coordinate diverse per ogni città
FAQ con risposte city-specific
MA: template ~60-70% identico (griglia servizi, prezzi, footer, CTA)
Cannibalization Risk
Arese: 2 pagine (agenzia-web-arese + realizzazione-siti-web-arese)
Lainate: 2 pagine
Rho: 3 pagine (agenzia-web-rho + agenzie-web-rho + realizzazione-siti-web-rho)
PIANO D'AZIONE PRIORITIZZATO
CRITICI (Fix immediato)
Correggere twitter:site da @webaboratorio a @webnovis su 103 pagine — Errore di branding che impatta le condivisioni social. 54 pagine hanno già il valore corretto

Rimuovere/ottimizzare mockup PNG 6.7-8.3MB — 12 file da ~90MB totali che consumano spazio inutilmente

ALTI (Entro 1 settimana)
Rimuovere FAQPage schema da 133 pagine commerciali — Sostituire con Q&A schema generico o rimuovere. Non genera rich results dal 2023

Aumentare word count su articoli blog sotto 1.500 parole — ~40% degli articoli sono sotto soglia. Espandere con case study, dati originali, esempi concreti

Aggiungere autori persona fisica ai blog — Creare profili autore con nome, bio, credenziali, foto. Critico dopo Dec 2025 Core Update

301 redirect portfolio uppercase — già implementati in server.js per runtime Node. Per hosting statico, valutare eliminazione dei 6 file uppercase o aggiunta meta refresh/canonical

Ottimizzare 38 immagini >500KB — Compressione WebP/AVIF aggressiva

CSP già presente via HTTP header in server.js e _headers Cloudflare — nessuna azione necessaria per runtime Node. Per hosting statico senza Cloudflare, valutare CSP meta tag come fallback

MEDI (Entro 1 mese)
Redirect agenzie-web-rho.html > agenzia-web-rho.html — Eliminare duplicato singolare/plurale

Risolvere cannibalization location pages — Differenziare contenuto tra agenzia-web-* e realizzazione-siti-web-* o consolidare

Aumentare contenuto unico nelle pagine agenzia-web-* — Portare dal 30-40% unico al 60%+ (case study locali, testimonial, dettagli specifici)

Critical CSS inlining — Estrarre above-the-fold CSS e inline, split del CSS da 93KB

Generare immagini AVIF — 20-30% risparmio ulteriore rispetto a WebP

Estendere AggregateRating ad altre pagine — Già presente in 3 istanze (homepage LocalBusiness). Valutare aggiunta su pagine location/servizi con recensioni Trustpilot/Google

BASSI (Backlog)
Rimuovere <meta name="keywords"> — Ignorato da Google, overhead inutile
Rimuovere hreflang da sito monolingua — Funziona ma è overhead
Aggiungere SRI per script third-party
Mostrare "ultimo aggiornamento" nel frontend degli articoli
Correggere H3 nel footer con tag semantici appropriati
Aggiungere <h1> alla pagina 404
Update Todos

Analyze Technical SEO (robots.txt, sitemap, canonicals, meta tags, security)

Analyze Schema Markup (JSON-LD detection & validation)

Analyze Content Quality & E-E-A-T signals

Analyze Performance (Core Web Vitals indicators)

Analyze Images (alt text, optimization, WebP)

Analyze On-Page SEO (titles, descriptions, headings, internal links)

Compile final SEO Health Score report
Report completo. In sintesi:

Score: 74-76/100 — Il sito è ben costruito tecnicamente con eccellente structured data (582 blocchi JSON-LD), canonicals perfetti e ottima AI readiness (ai.txt + llms.txt). Le criticità principali sono:

Handle Twitter sbagliato (@webaboratorio) su 103 pagine (54 già corrette) — fix immediato
FAQPage schema abusato su 133 pagine commerciali — non genera più rich results
Blog senza autori persona fisica — penalizzante dopo il Dec 2025 Core Update
~40% blog sotto 1.500 parole — thin content risk
Immagini mockup da 6.7-8.3MB (12 file, ~90MB totali) e 38 immagini >500KB
CSP già implementata via server.js e _headers Cloudflare (non è un problema aperto)
Portfolio 301 redirect già implementati in server.js per runtime Node