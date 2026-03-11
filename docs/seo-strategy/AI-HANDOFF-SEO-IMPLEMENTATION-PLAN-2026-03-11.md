# AI Handoff SEO Implementation Plan

## Stato del documento

- Data: 2026-03-11
- Scopo: fornire a un'altra AI un riferimento operativo chiaro, verificato e direttamente eseguibile.
- Ambito: SEO on-site, metadata, cluster geo, consolidamento URL, branded entity, validazione tecnica.
- Fonte analitica di partenza: `docs/seo-strategy/Analisi-posizionamento.MD`
- Fonte tecnica di supporto: `docs/IMPLEMENTATION-BACKLOG-2026-03-08.md`

Questo documento non e` un audit generico. E` un handoff operativo basato su:

1. lettura completa del report `docs/seo-strategy/Analisi-posizionamento.MD`
2. verifica diretta della codebase
3. controllo dei punti di implementazione reali nel repository
4. revisione del piano iniziale con correzioni strategiche e tecniche

---

## Obiettivo per la prossima AI

La prossima AI deve lavorare con questa priorita`:

1. correggere i problemi SEO ad alto impatto e basso attrito
2. intervenire centralmente dove il sito e` generato da script o template
3. evitare modifiche manuali dispersive su centinaia di file statici quando esiste un punto di controllo unico
4. non trattare tutte le pagine geo come priorita` equivalente
5. separare le decisioni strategiche editoriali dai fix tecnici necessari

La prossima AI non deve ripartire da zero. Deve usare questo documento come piano operativo e usarlo insieme ai file sorgente qui sotto.

---

## Fonti Da Leggere Prima Di Toccare Il Codice

Ordine consigliato di lettura:

1. `docs/seo-strategy/Analisi-posizionamento.MD`
2. `docs/seo-strategy/README.md`
3. `docs/IMPLEMENTATION-BACKLOG-2026-03-08.md`
4. `scripts/generate-all-geo.js`
5. `blog/build-articles.js`
6. `templates/agenzia-web-content.njk`
7. `templates/servizio-citta-content.njk`
8. `index.html`
9. `server.js`
10. `_headers`
11. `package.json`

Motivo:

- il report SEO spiega il perche`
- i file tecnici spiegano il dove e il come
- `server.js` e `_headers` spiegano cosa e` gia` implementato a livello canonical/redirect/header
- `blog/build-articles.js` spiega come vengono prodotti molti articoli blog e perche` non va trattato il blog come puro HTML manuale
- `package.json` spiega la pipeline canonica da usare per build e validazione

---

## Stato Verificato Del Progetto

### 1. Il sito non e` solo statico manuale

Una parte consistente delle pagine geo e service x city e` generata centralmente.

File chiave:

- `scripts/generate-all-geo.js`
- `templates/agenzia-web-content.njk`
- `templates/servizio-citta-content.njk`
- `data/cities.json`
- `data/services.json`
- `data/content-blocks/*.json`

Conclusione operativa:

- non intervenire file per file sulle pagine geo generate, salvo casi molto specifici
- preferire fix nei generatori, nei template e nei dati di input

### 2. Il progetto ha gia` una pipeline dist-first consolidata

Comandi chiave in `package.json`:

- `npm run build:site:dist`
- `npm run validate:pages:dist`
- `npm run ci:quality:dist`
- `npm run build:geo:dist`
- `npm run normalize:public-html:dist`
- `npm run update:footer:dist`

Conclusione operativa:

- per verifiche complete usare la pipeline `dist`
- non validare il sito solo aprendo file HTML a mano

### 3. Gli header di sicurezza hanno una sorgente condivisa

File chiave:

- `config/security-headers.js`
- `_headers`

Conclusione operativa:

- `_headers` e` un artefatto generato
- dopo modifiche agli header, usare `npm run sync:headers`

### 4. Il progetto usa anche redirect lato server Express

File chiave:

- `server.js`

Elementi gia` verificati:

- redirect 301 non-www -> www
- normalizzazione trailing slash
- stripping parametri UTM
- redirect 301 da `/agenzie-web-rho.html` a `/agenzia-web-rho.html`
- altri redirect legacy di portfolio

Conclusione operativa:

- il progetto non e` limitato a canonical e meta refresh: esiste gia` logica redirect vera in `server.js`
- se il deploy effettivo non passa da questo server Node, il redirect va replicato a livello host/CDN

### 5. Il blog non va trattato come puro contenuto hand-crafted

File chiave:

- `blog/build-articles.js`
- `blog/index.html`

Stato verificato:

- `blog/build-articles.js` dichiara esplicitamente che genera gli HTML degli articoli a partire dai dati articolo
- molti articoli prioritari dello Stream 4 sono presenti nel generatore come oggetti con `slug`, `title`, `description`, FAQ e corpo contenuto
- gli HTML pubblicati sotto `blog/` sono quindi output del flusso di generazione, non la sorgente piu` sicura da modificare

Conclusione operativa:

- prima di modificare un post blog prioritario, verificare se il suo contenuto e metadata sono definiti in `blog/build-articles.js`
- se la pagina e` prodotta dal generatore, modificare la sorgente nel generatore e rigenerare, non l'HTML finale pubblicato
- trattare l'HTML del blog come output solo se si dimostra che quella specifica pagina non rientra piu` nel flusso del generatore

---

## Findings Tecnici Verificati E Importanti

## A. Il collo di bottiglia principale oggi e` il CTR, non il ranking puro

Dal report `docs/seo-strategy/Analisi-posizionamento.MD` emergono tre fatti forti:

- molte pagine sono gia` visibili in top 5 o top 10
- il CTR medio e` anomalo rispetto alla posizione
- il miglior ROI immediato sta nei title tag e nelle meta description, non in nuove pagine

Traduzione operativa:

- il primo stream di lavoro deve essere metadata-driven
- non iniziare da espansione contenutistica massiva

## B. Lo schema markup non e` "assente ovunque"

Il report suggeriva di aggiungerlo in modo ampio. La codebase mostra invece che molte landing geo hanno gia`:

- `BreadcrumbList`
- `WebPage`
- `LocalBusiness`
- `Service`
- `FAQPage`

Riferimento:

- `scripts/generate-all-geo.js`

Traduzione operativa:

- non reimplementare schema dappertutto
- fare normalizzazione, completamento e controllo dei casi non coperti o coperti male

## C. Esiste un bug sistemico nei social metadata di molte pagine geo

Sintomo verificato:

- molte pagine geo/accessibilita` hanno `og:title` e `og:description` corretti per la pagina
- ma `twitter:title` e `twitter:description` ereditano copy generico o orientato a Rho

Esempi verificati:

- `accessibilita-bresso.html`
- `agenzia-web-bresso.html`
- `agenzia-web/index.html`
- `zone-servite/index.html`
- `realizzazione-siti-web/index.html`

Traduzione operativa:

- la prossima AI deve correggere il layer centrale dei social metadata
- non basta sistemare `og:*`
- vanno allineati anche `twitter:title` e `twitter:description`

## D. Il caso Rho non e` solo contenuto: c'e` consolidamento URL

Sono presenti entrambe le pagine:

- `agenzia-web-rho.html`
- `agenzie-web-rho.html`

Stato verificato:

- `agenzie-web-rho.html` ha `noindex`
- `agenzie-web-rho.html` ha canonical verso `agenzia-web-rho.html`
- `agenzie-web-rho.html` ha meta refresh verso `agenzia-web-rho.html`
- `server.js` contiene anche un redirect 301 lato Express dalla forma plurale alla singolare

Traduzione operativa:

- prima di ottimizzare la pagina Rho, verificare il comportamento reale in produzione
- se il deploy usa il server Node, il 301 esiste gia`
- se il deploy e` statico o edge-only, la sola presenza del meta refresh non e` sufficiente: va configurato un 301 vero lato host/CDN

## E. La homepage branded e` gia` abbastanza buona, ma non risolve da sola l'ambiguita` di "novis"

File chiave:

- `index.html`

Stato verificato:

- title homepage brandizzato
- `Organization` presente
- `WebSite` presente
- `alternateName` presente
- `SearchAction` presente

Traduzione operativa:

- il problema branded non e` solo on-site
- servono anche segnali off-site coerenti

---

## Decisioni Gia` Prese E Da Non Rimettere In Discussione

Queste decisioni sono deliberate e devono guidare l'implementazione successiva.

### 1. Unire hardening del layer SEO e metadata rewrite nella stessa wave iniziale

Motivo:

- metadata e fix strutturali sono complementari
- farli in due fasi troppo distanti rallenta il ROI e complica il rollback

### 2. Togliere il cluster Caffe` Sempione dalla sequenza principale

Motivo:

- e` una decisione editoriale/strategica
- non blocca nessun fix tecnico urgente
- va trattata come appendice decisionale, non come prerequisito

### 3. Trattare Rho come caso di consolidamento prima che di content enhancement

Motivo:

- esiste una variante URL plurale
- il primo check e` la canonicalizzazione reale, non l'arricchimento della pagina

### 4. Applicare un threshold numerico alle pagine geo da ottimizzare

Threshold operativo approvato:

- Tier A: pagine con almeno 100 impressioni, a qualsiasi posizione
- Tier B: pagine con almeno 50 impressioni e posizione media almeno 20
- Tier C: tutto il resto in backlog, non ora

Motivo:

- impedisce che il cluster geo diventi un lavoro infinito e dispersivo

### 5. Fare sempre snapshot pre-intervento dei metadata prioritari

Motivo:

- i nuovi title possono teoricamente peggiorare CTR
- serve rollback rapido e confrontabile

---

## Piano Operativo Canonico

Questo e` il planning da seguire, salvo nuovi dati forti che lo smentiscano.

## Stream 1. Snapshot e baseline

### Obiettivo

Congelare lo stato delle pagine prioritarie prima di qualsiasi intervento.

### Output richiesto

Un CSV o tabella con queste colonne:

- URL
- query target primaria
- query target secondaria opzionale
- fonte query target (`report`, `GSC`, `inferenza da slug`, da confermare)
- title attuale
- meta description attuale
- impressioni
- clic
- CTR
- posizione media
- cluster di appartenenza
- priorita`

### Ambito minimo

Includere almeno:

- homepage
- `blog/partita-iva-ecommerce.html`
- `blog/quanto-costa-un-sito-web.html`
- `blog/quanto-costa-una-landing-page.html`
- `blog/caffe-sempione-caso-studio-locale.html`
- `blog/tendenze-social-media-2026.html`
- `chi-siamo.html`
- `blog/shopify-vs-sito-ecommerce-custom.html`
- `blog/aggiornamenti-algoritmo-google-2026.html`
- `agenzia-web-rho.html`

### Regola

Non riscrivere metadata prioritari senza baseline salvata.

### Regola aggiuntiva

Nessun metadata rewrite parte senza query target primaria assegnata. Se la query non e` esplicita nel report, va fissata dalla baseline GSC prima della scrittura.

## Stream 2. Hardening del layer SEO centrale

### Obiettivo

Chiudere i problemi sistemici che impattano molte pagine contemporaneamente.

### Task principali

1. Mappare dove vengono prodotti title, description, OG e Twitter metadata per ciascuna famiglia di pagina.
2. Correggere l'ereditarieta` sbagliata dei `twitter:*` nelle pagine generate.
3. Verificare coerenza tra canonical, og:url e twitter:url quando presenti.
4. Verificare se alcune famiglie di pagina non passano ancora da una sorgente centrale ma da base page estratta.

### File da ispezionare e, se necessario, modificare

- `scripts/generate-all-geo.js`
- `templates/agenzia-web-content.njk`
- `templates/servizio-citta-content.njk`
- eventuali generatori specifici di famiglie non coperte da `generate-all-geo.js`

### Nota importante

Le pagine `accessibilita-*` mostrano sintomi compatibili con ereditarieta` metadata da base page. Prima di editarle manualmente, identificare la loro sorgente reale.

## Stream 3. Consolidamento URL e canonicalizzazione reale

### Obiettivo

Rimuovere attrito e dispersione semantica prima dell'ottimizzazione di pagina.

### Caso prioritario: Rho

#### Stato attuale

- `agenzia-web-rho.html` e` la pagina canonica
- `agenzie-web-rho.html` e` una variante legacy
- `server.js` contiene `res.redirect(301, '/agenzia-web-rho.html' + query)` per la forma plurale

#### Cosa deve fare la prossima AI

1. verificare se l'ambiente di deploy usa davvero `server.js`
2. se si`, confermare che il 301 sia attivo in produzione
3. subito dopo la conferma del 301, verificare che `agenzie-web-rho.html` non compaia piu` in sitemap, internal links, menu, footer e canonical
4. verificare con query `site:webnovis.com/agenzie-web-rho.html` se la variante plurale risulta ancora indicizzata
5. se la variante plurale e` ancora indicizzata dopo il 301, pianificare rimozione/accelerazione in GSC
6. se il deploy non usa `server.js`, implementare il redirect equivalente a livello edge/hosting e poi ripetere i controlli sopra

### Regola generale

Prima di ottimizzare contenuti per query locali, verificare sempre che non esistano URL concorrenti o legacy da consolidare.

## Stream 4. Metadata rewrite ad alto ROI

### Obiettivo

Aumentare il CTR delle URL gia` visibili in SERP.

### Ordine di priorita`

1. `blog/partita-iva-ecommerce.html`
2. `blog/quanto-costa-un-sito-web.html`
3. `blog/caffe-sempione-caso-studio-locale.html`
4. `blog/quanto-costa-una-landing-page.html`
5. `blog/tendenze-social-media-2026.html`
6. `automazione-business-milano.html`
7. `blog/sviluppo-sito-web-da-zero.html`
8. `blog/javascript-performance-ottimizzare.html`
9. `blog/importanza-sito-web-attivita.html`
10. `blog/brand-loyalty-strategie.html`
11. `chi-siamo.html`
12. `blog/shopify-vs-sito-ecommerce-custom.html`
13. `index.html`
14. `agenzia-web-rho.html`

### Vincoli obbligatori di scrittura

- lingua: italiano
- title target: 50-60 caratteri, evitando troncamenti inutili in SERP
- meta description target: 140-155 caratteri
- ogni title deve contenere o riflettere chiaramente la query target primaria
- ogni description deve esplicitare il motivo del click e la promessa informativa/commerciale coerente con la pagina reale
- niente rewrite puramente creativo: il copy deve restare vincolato a query, intent e contenuto effettivo

### Ownership del copy

La prossima AI puo` scrivere title e meta description, ma solo dopo avere completato per ogni URL questo mini-brief:

- query target primaria
- intent prevalente (`informazionale`, `commerciale`, `navigazionale locale`, `brand`)
- fonte della query target (`report` o baseline GSC)
- tipo di pagina (`generata`, `manuale`, `da verificare`)

Senza questo mini-brief la riscrittura non e` autorizzata.

### Query target primaria iniziale per le URL prioritarie

Usare queste query come default operativo iniziale. Se la baseline GSC mostra un segnale piu` forte, aggiornare il brief prima di scrivere il copy.

1. `blog/partita-iva-ecommerce.html` -> `partita iva ecommerce` da confermare contro varianti procedurali come `aprire ecommerce partita iva`
2. `blog/quanto-costa-un-sito-web.html` -> `quanto costa un sito web`
3. `blog/caffe-sempione-caso-studio-locale.html` -> `caffe sempione` solo come query attuale intercettata, non come decisione definitiva di investimento
4. `blog/quanto-costa-una-landing-page.html` -> `quanto costa una landing page`
5. `blog/tendenze-social-media-2026.html` -> `tendenze social media 2026`
6. `automazione-business-milano.html` -> `automazione processi aziendali milano`
7. `blog/sviluppo-sito-web-da-zero.html` -> `sviluppo sito web da zero`
8. `blog/javascript-performance-ottimizzare.html` -> `javascript performance ottimizzare`
9. `blog/importanza-sito-web-attivita.html` -> `importanza sito web attivita`
10. `blog/brand-loyalty-strategie.html` -> `brand loyalty strategie`
11. `chi-siamo.html` -> `webnovis` o `web novis` se emerge nella baseline; in assenza, trattare come pagina brand/about
12. `blog/shopify-vs-sito-ecommerce-custom.html` -> `shopify vs sito ecommerce custom`
13. `index.html` -> `webnovis` come focus brand principale; `novis` resta query problematica ma non sufficiente come unico target
14. `agenzia-web-rho.html` -> `web agency rho` come primaria; secondarie da preservare: `realizzazione siti web rho`, `siti web rho`, `web designer rho`

### Regole di copy

- title focalizzato su intent, differenziazione e cliccabilita`
- meta description orientata al motivo del click, non solo riassuntiva
- evitare title generici, piatti o puramente descrittivi
- non disallineare violentemente il title rispetto al contenuto reale della pagina
- se il report o la baseline GSC mostrano query multiple forti, scegliere una primaria e proteggere le secondarie nel lessico della description e dell'H1, non nel title in overload

### Nota branded

Per la homepage, la logica non e` solo CTR. Serve anche consolidamento del naming brand.

### Workflow corretto di implementazione

Per pagine generate o orchestrate da script:

1. modificare generatore, template o sorgente dati
2. eseguire `npm run build:geo:dist` se la famiglia e` geo/service x city, oppure il comando di generazione coerente con quella famiglia
3. eseguire `npm run validate:pages:dist`
4. fare verifica manuale su sample di output

Per pagine manuali non governate da generatore:

1. modificare il file sorgente reale
2. rigenerare la `dist` completa se necessario
3. validare e verificare il risultato

Regola critica:

- non modificare direttamente HTML pubblicati o output in `dist` se esiste una sorgente generativa upstream, altrimenti il prossimo build sovrascrive tutto in silenzio

## Stream 5. Cluster geo selettivo

### Obiettivo

Intervenire solo sulle pagine geo che superano una soglia minima di valore.

### Threshold da usare

- Tier A: almeno 100 impressioni
- Tier B: almeno 50 impressioni e posizione media almeno 20

### Prime candidate gia` emerse

- `sviluppo-app-mobile-milano.html`
- `email-marketing-milano-nord.html`
- `social-media-bresso.html`
- `google-ads-milano.html`
- `graphic-design-milano.html`
- `agenzia-web-rho.html`

### Interventi consentiti

- answer-first intro piu` aderente all'intent
- FAQ utili e non decorative
- internal link contestuali reali
- controllo query-target e assenza cannibalizzazione
- completamento schema solo se necessario

### Interventi da evitare

- editing a tappeto di tutte le 368 pagine geo
- espansioni contenutistiche non guidate da dati
- duplicazione di sezioni uguali con solo nome citta` cambiato

## Stream 6. Branded entity e segnali off-site

### Obiettivo

Rafforzare la riconoscibilita` di WebNovis come entita`.

### On-site

Verificare e mantenere coerenti:

- title homepage in `index.html`
- `Organization` schema in `index.html`
- `WebSite` schema in `index.html`
- `alternateName` in `index.html`
- naming in footer, social meta e anchor principali

### Off-site

Da includere esplicitamente nella strategia, anche se fuori dal solo codice:

- Google Business Profile coerente e verificato
- NAP coerente nelle directory
- citazioni brand coerenti nelle schede esterne gia` presenti

### Nota critica

La query `novis` restera` probabilmente ambigua anche con ottimo on-site. Non promettere una soluzione totale solo tramite metadata o schema.

## Appendice decisionale. Caffe` Sempione

### Stato

Il cluster genera impressioni ma ha forte mismatch di intent.

### Scelte possibili

#### Opzione A

Mantenere la pagina e aggiungere un blocco informativo utile per intercettare parte dell'intent navigazionale.

#### Opzione B

Lasciare il case study puro e non investirci nella wave principale.

### Regola

Non lasciare che questa scelta blocchi i fix tecnici e di metadata prioritari.

---

## File Chiave Per Famiglia Di Intervento

## SEO centrale e generatori

- `scripts/generate-all-geo.js`
- `templates/agenzia-web-content.njk`
- `templates/servizio-citta-content.njk`
- `data/cities.json`
- `data/services.json`

## Blog e metadata editoriali

- `blog/build-articles.js`
- `blog/index.html`

## Homepage e branded entity

- `index.html`

## Redirect e canonicalizzazione reale

- `server.js`

## Header e comportamento host statico

- `config/security-headers.js`
- `_headers`

## Pipeline di build e quality gate

- `package.json`
- `docs/IMPLEMENTATION-BACKLOG-2026-03-08.md`

## Fonti strategiche di contesto

- `docs/seo-strategy/Analisi-posizionamento.MD`
- `docs/seo-strategy/README.md`

---

## Checklist Operativa Prima Di Ogni Modifica

Prima di toccare codice o contenuto, la prossima AI deve verificare queste condizioni:

1. esiste snapshot dei metadata e dei KPI delle pagine prioritarie
2. e` chiaro se la famiglia di pagine da modificare e` generata o manuale
3. e` chiaro se l'URL target e` gia` consolidato o ha varianti legacy concorrenti
4. e` chiaro dove passa il deploy reale del redirect o dell'header da toccare
5. e` chiaro come validare il cambiamento nella pipeline `dist`
6. e` chiaro se la pagina da toccare e` una sorgente reale o un output generato che verra` sovrascritto

Se una di queste sei condizioni manca, fermarsi e chiarirla prima di implementare.

---

## Checklist Di Verifica Dopo Le Modifiche

Ogni wave deve essere chiusa solo dopo questi controlli:

1. build `dist` completata senza errori
2. validazione pagine completata
3. regressioni SEO e smoke test eseguiti
4. metadata finali verificati sulle pagine toccate
5. canonical, og:url e twitter metadata coerenti sulle pagine prioritarie
6. per i redirect: conferma del 301 reale sul target di deploy, non solo nel codice locale

Comandi minimi consigliati:

- `npm run build:site:dist`
- `npm run test:regressions`
- `npm run test:seo-smoke`
- `npm run validate:pages:dist`

Se si toccano gli header:

- `npm run sync:headers`

Se si vuole una verifica completa canonica:

- `npm run ci:quality:dist`

---

## Errori Da Evitare

La prossima AI non deve fare questi errori:

1. riscrivere manualmente decine o centinaia di pagine geo generate
2. implementare nuovo schema markup senza prima verificare quello gia` esistente
3. ottimizzare `agenzia-web-rho.html` ignorando la variante `agenzie-web-rho.html`
4. toccare title ad alto traffico senza snapshot pre-intervento
5. lavorare sul cluster geo senza threshold numerico
6. confondere una decisione editoriale come Caffe` Sempione con un prerequisito tecnico
7. assumere che un redirect nel codice sia per forza attivo anche nel deploy reale
8. riscrivere un blog post direttamente in HTML se il metadata o il contenuto derivano da `blog/build-articles.js`
9. modificare file in `dist` pensando che siano la sorgente canonica

---

## Sequenza Raccomandata Di Esecuzione

Ordine canonico:

1. snapshot metadata e KPI
2. audit sorgenti metadata e social meta
3. consolidamento URL e verifica redirect reali
4. metadata rewrite delle pagine high-ROI
5. ottimizzazione cluster geo sopra threshold
6. branded/off-site checklist
7. decisione separata su Caffe` Sempione

Questo ordine e` deliberato. Non invertire 4 e 3 sul caso Rho. Non spostare il cluster geo prima dei metadata high-ROI.

---

## Cosa Significa Done In Questa Wave

La wave si considera completata solo quando tutte queste condizioni sono vere:

- esiste baseline dei metadata prioritari
- i social metadata centrali non ereditano piu` copy sbagliati o generici
- il caso Rho e` consolidato con redirect reale verificato nel deploy corretto
- le pagine ad alto ROI hanno title e description aggiornati
- il cluster geo e` stato filtrato con threshold esplicito, non gestito a tappeto
- il branded entity plan include esplicitamente segnali off-site e non solo on-site

---

## Nota Finale Per La Prossima AI

Se devi scegliere tra completezza teorica e impatto reale, scegli impatto reale.

La priorita` di questa codebase, oggi, non e` pubblicare piu` pagine. E` far rendere meglio quelle gia` visibili, chiudere i bug sistemici nei metadata, consolidare le URL che disperdono segnali e usare i generatori centrali nel modo corretto.

Questo documento e` la fonte operativa primaria per la wave successiva, insieme a:

- `docs/seo-strategy/Analisi-posizionamento.MD`
- `docs/IMPLEMENTATION-BACKLOG-2026-03-08.md`
