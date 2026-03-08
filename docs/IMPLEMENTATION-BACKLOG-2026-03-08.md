# Backlog Implementativo Residuo - 2026-03-08

## Scope
Questo documento traduce i punti residui del report tecnico in una backlog esecutiva ancorata al codice reale del repository.
Non sostituisce gli audit storici: li normalizza in una lista di interventi con file, priorita, dipendenze e criteri di accettazione.

## Evidenze raccolte nel codice

### 1. Security headers: runtime e file statico ora sono allineati, ma il deploy reale non e verificato
- `config/security-headers.js` e `scripts/sync-security-headers.js` sono ora la sorgente comune per `server.js` e `_headers`.
- Il repository non contiene nessuna prova automatica che l'hosting reale applichi gli stessi header su `https://www.webnovis.com/`.
- Questo rende chiuso il problema di coerenza interna del repo, ma non quello di enforcement edge/proxy.

### 2. Il debito immagini/footer nasce ancora nei generatori
- `blog/build-articles.js:6171` contiene ancora il footer hardcoded che reintroduce:
  - badge `DesignRush` con `height="auto"`
  - badge `GoodFirms` con `height="auto"`
  - heading footer vuoti
  - link geo hardcoded nel footer blog
- Scan HTML corrente:
  - `1694` tag `<img>` senza `loading`
  - `175` file HTML con `height="auto"`
  - distribuzione `height="auto"`: root `638`, blog `185`, servizi `9`, portfolio `0`
  - distribuzione `<img>` senza `loading`: root `1298`, blog `350`, servizi `18`, portfolio `22`
- `14` file HTML includono ancora direttamente lo script Trustpilot nel markup.

### 3. Il problema architetturale e confermato: i generatori usano pagine pubblicate come template e scrivono in root
- `scripts/generate-all-geo.js:289-397` estrae head/nav/footer da `agenzia-web-rho.html`.
- `scripts/generate-all-geo.js:422-518` modifica `realizzazione-siti-web-rho.html` via regex replacement.
- `scripts/generate-all-geo.js:624-727` riusa di nuovo `agenzia-web-rho.html` come base per servizio x citta.
- `scripts/generate-all-geo.js:1065,1096,1126,1147,1159` scrive gli output direttamente nel repo pubblicato.
- Stato repository:
  - `644` file HTML in root
  - `287` pagine root riconducibili a pattern servizio/citta
- Il rebuild quindi dipende ancora da artefatti HTML pubblicati, non da sole sorgenti strutturate.

### 4. La documentazione e troppo ridondante e in parte superata
- Inventario `docs/` + `docs/seo-strategy/`:
  - `33` file `.md`
  - `4` file `.txt`
  - `2` file `.docx`
  - `1` file `.csv`
  - `1` file `.xml`
  - `1` file `.resolved`
  - `1` file `.pdf`
- `docs/seo-strategy/README.md` elenca solo una parte dei documenti strategici e non governa piu la directory.
- Report sicuramente superati o parzialmente superati dai fix gia presenti:
  - `docs/AUDIT-TECNICO-SEO-COMPLETO.md:11-19,27,37` parla ancora di mismatch CSP e di assenza totale di test automatizzati
  - `docs/PAGESPEED-MOBILE-AUDIT-2026-02-27.md:143` descrive `_headers` come "solo documentale"
  - `docs/claude-code-SEO-analysis.MD` tratta la CSP come tema sostanzialmente chiuso con assunzioni non piu affidabili
- Esistono anche raw artifact non diff-friendly e non operativi (`.docx`, `.xml`, `.csv`, `.resolved`, export testuali) che rendono la cartella `docs/` rumorosa.

## Backlog operativo

## P0 - Verifica e enforcement reale degli header di sicurezza

### P0.1 - Decidere e documentare il piano di delivery reale degli header
**Obiettivo**
Capire con esattezza quale layer serve HTML e API in produzione e quale deve essere la sorgente vincolante degli header.

**File coinvolti**
- `server.js`
- `_headers`
- `config/security-headers.js`
- documentazione deploy da creare in `docs/`

**Azioni**
- Mappare per ogni superficie (`/`, `/blog/*`, `/portfolio/*`, `/api/*`) quale layer risponde davvero in produzione.
- Scrivere una matrice "runtime Express / static hosting / proxy edge" con ownership esplicita.
- Dichiarare `config/security-headers.js` come source of truth unica del repo.

**Accettazione**
- Esiste un documento deploy breve ma preciso.
- Ogni path pubblico ha un owner tecnico degli header.
- Non restano affermazioni ambigue tipo "_headers forse documentale".

### P0.2 - Aggiungere smoke test di produzione per gli header
**Obiettivo**
Verificare che produzione risponda con gli stessi header previsti dal repo.

**File da creare/modificare**
- `scripts/verify-prod-headers.js` o `.mjs`
- workflow CI dedicato o step opzionale in `.github/workflows/quality-gate.yml`
- eventuale `.env.example` se servono URL/env dedicati

**Azioni**
- Fare richieste HTTP a homepage, una pagina blog, una pagina portfolio e un endpoint API.
- Confrontare gli header ricevuti con quelli attesi derivati da `config/security-headers.js`.
- Fallire il check se mancano `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP e `X-Robots-Tag` sugli endpoint API.

**Accettazione**
- Il controllo e ripetibile da CLI.
- Il controllo evidenzia differenze tra repo e produzione, non solo presenza/assenza generica.
- Il controllo e documentato nel README/ops doc.

### P0.3 - Ripulire la documentazione security ormai superata
**Obiettivo**
Evitare che futuri interventi ripartano da report non piu veri.

**Documenti da aggiornare**
- `docs/AUDIT-TECNICO-SEO-COMPLETO.md`
- `docs/PAGESPEED-MOBILE-AUDIT-2026-02-27.md`

**Azioni**
- Aggiungere box iniziale "stato al 2026-03-08".
- Marcare come risolti i fix gia chiusi: source-of-truth condivisa per header, test di regressione nel repo, allineamento `CORS_ORIGINS`.
- Lasciare aperto solo il punto davvero residuo: enforcement edge/proxy.

**Accettazione**
- Nessun report attivo descrive ancora la CSP come mismatch interno al repo.

## P1 - Normalizzazione immagini, footer e widget

### P1.1 - Estrarre un footer condiviso per blog, pagine istituzionali e case study
**Obiettivo**
Bloccare la reintroduzione di markup errato dai generatori.

**File coinvolti**
- `blog/build-articles.js`
- `scripts/update-footer.js`
- `scripts/update-footers.js`
- eventuale nuovo partial/template condiviso in `templates/` o `src/templates/`

**Azioni**
- Definire un solo snippet footer con:
  - badge review con dimensioni esplicite
  - heading footer semanticamente corretti
  - link geo non hardcoded se non necessari
  - policy uniforme per lazy loading e `decoding`
- Sostituire il footer inline in `blog/build-articles.js` con il partial condiviso.
- Verificare se le pagine portfolio usano gia una variante piu corretta e riusarla come base.

**Accettazione**
- Il footer non e piu hardcoded in piu generatori.
- Rigenerare blog/case study non reintroduce `height="auto"` o heading vuoti.

### P1.2 - Eliminare `height="auto"` e rendere esplicite le dimensioni dei badge
**Obiettivo**
Chiudere il pattern che oggi ricompare in `175` file HTML.

**File coinvolti**
- `blog/build-articles.js`
- template/footer condivisi
- eventuali HTML istituzionali ancora manuali

**Azioni**
- Sostituire tutti i `height="auto"` con dimensioni numeriche stabili.
- Per `DesignRush` e `GoodFirms` definire una coppia `width/height` standard e riutilizzarla ovunque.
- Aggiungere `fetchpriority="low"` e `loading="lazy"` dove appropriato.

**Accettazione**
- Scan repo: `0` occorrenze di `height="auto"` nei file HTML pubblici.
- Nessun badge footer genera CLS evitabile.

### P1.3 - Definire una policy centralizzata per `loading`, `decoding` e priorita immagini
**Obiettivo**
Ridurre le `1694` immagini senza `loading` senza rompere gli asset LCP.

**File coinvolti**
- `blog/build-articles.js`
- `scripts/generate-all-geo.js`
- template `templates/*.njk`
- eventuale helper immagini da introdurre

**Azioni**
- Stabilire le eccezioni ammesse per `loading="eager"`/assenza di lazy:
  - logo sopra la piega se necessario
  - LCP hero image se realmente LCP
  - immagini decorative minuscole in SVG inline escluse
- Applicare `loading="lazy"` di default a ogni immagine non critica.
- Applicare `decoding="async"` di default agli asset raster non critici.
- Distinguere le immagini generate dai badge/footer dalle hero.

**Accettazione**
- Esiste una whitelist esplicita delle eccezioni.
- Le scansioni automatiche non segnalano piu `<img>` senza `loading` al di fuori della whitelist.

### P1.4 - Lazy-init dei widget terzi nel footer
**Obiettivo**
Ridurre impatto di widget review su performance e stabilita layout.

**File coinvolti**
- `blog/build-articles.js`
- eventuale `js/footer-widgets.js`
- eventuali pagine portfolio che includono ancora Trustpilot in head

**Azioni**
- Spostare il bootstrap di Trustpilot/DesignRush a intersezione viewport o consenso ottenuto.
- Rimuovere gli script third-party hardcoded nelle pagine che possono caricarli in ritardo.
- Normalizzare il comportamento tra blog, portfolio e istituzionali.

**Accettazione**
- Lo script Trustpilot non e piu iniettato staticamente nei template dove non serve in above-the-fold.
- I placeholder hanno dimensioni stabili prima del caricamento widget.

### P1.5 - Aggiungere un test di regressione sulle immagini/template
**Obiettivo**
Evitare di ricadere negli stessi difetti al prossimo rebuild.

**File da creare**
- `tests/image-template-regressions.test.js`

**Regole minime da verificare**
- nessun `height="auto"`
- niente footer blog legacy hardcoded
- `loading` presente su immagini non whitelisted
- `width` e `height` presenti sugli asset raster pubblici

**Accettazione**
- Test eseguibile con solo Node.
- Test referenziato nella pipeline quality gate quando il sandbox lo consente.

## P1 - Separazione sorgenti / template / artefatti pubblicati

### P1.6 - Smettere di usare `agenzia-web-rho.html` e `realizzazione-siti-web-rho.html` come template impliciti
**Obiettivo**
Eliminare la dipendenza da pagine live come base di generazione.

**File coinvolti**
- `scripts/generate-all-geo.js`
- `templates/agenzia-web-content.njk`
- `templates/servizio-citta-content.njk`
- nuovi layout/partial da creare

**Azioni**
- Estrarre head, nav, footer e after-footer in layout veri.
- Portare metadata, schema e footer in partial riusabili.
- Ridurre i regex replacement al minimo o eliminarli del tutto.

**Accettazione**
- `generate-all-geo.js` non legge piu HTML pubblicati come base.
- Le modifiche strutturali passano da template e data files, non da pagine pubblicate.

### P1.7 - Introdurre una directory di output esplicita (`dist/` o `generated/`)
**Obiettivo**
Separare cio che e sorgente da cio che e build artifact.

**File coinvolti**
- `package.json`
- `build.js`
- `generate-sitemap.js`
- `build-search-index.js`
- `scripts/generate-all-geo.js`
- workflow GitHub Actions

**Azioni**
- Definire una publish directory unica.
- Far puntare i generatori all'output directory, non alla root del repo.
- Adattare sitemap/search index/validator per lavorare sulla publish directory.
- Ridurre i file HTML in root alle sole pagine sorgente che restano hand-authored.

**Accettazione**
- Il repo non miscela piu template e output pubblicato nella stessa area.
- Il rebuild completo e ripetibile da zero in CI.

### P1.8 - Formalizzare la catena build unica
**Obiettivo**
Rendere chiara la sequenza di generazione e validazione.

**File coinvolti**
- `package.json`
- `.github/workflows/quality-gate.yml`
- eventuale nuovo `scripts/build-site.js`

**Azioni**
- Unire in una pipeline ordinata:
  1. generazione geo
  2. rigenerazione blog/template dipendenti
  3. sync footer/header
  4. build assets
  5. search index
  6. sitemap
  7. validation/tests
- Evitare script one-off fuori pipeline per passaggi obbligatori.

**Accettazione**
- Esiste un comando unico di rebuild end-to-end.
- La CI usa la stessa sequenza locale.

### P1.9 - Ridurre il debito dei generatori monolitici
**Obiettivo**
Ridurre il rischio di regressioni in file enormi.

**Evidenze**
- `server.js` e ancora a `1250` righe.
- `blog/build-articles.js` e a `6243` righe.
- `scripts/generate-all-geo.js` e a `1182` righe.

**Azioni**
- Spezzare `blog/build-articles.js` in moduli: metadata, schema, footer, rendering, dataset articoli.
- Spezzare `generate-all-geo.js` in loader dati, renderer, validators, writers.
- Spostare helper riusabili in `lib/` o `config/`.

**Accettazione**
- Nessun generatore strategico resta un unico file > 1500 righe.
- Le porzioni condivise sono testabili separatamente.

## P1 - Governance documentale

### P1.10 - Definire un indice documentale canonico
**Obiettivo**
Fermare la proliferazione di report concorrenti.

**File da aggiornare**
- `docs/seo-strategy/README.md`
- questo backlog come documento canonico operativo

**Azioni**
- Distinguere chiaramente tra:
  - `audit snapshot`
  - `backlog operativo`
  - `documenti di supporto/raw source`
- Inserire una tabella con stato: `attivo`, `snapshot`, `archivio`, `da eliminare`.
- Indicare un solo backlog operativo canonico.

**Accettazione**
- Un nuovo contributor capisce in 2 minuti quale documento deve leggere per sapere cosa fare.

### P1.11 - Documenti da aggiornare sicuramente
**Aggiornare, non eliminare**
- `docs/seo-strategy/README.md`
  - oggi non governa davvero la cartella e non indica i documenti canonici.
- `docs/AUDIT-TECNICO-SEO-COMPLETO.md`
  - utile come audit snapshot, ma da premettere come parzialmente superato dai fix di marzo.
- `docs/PAGESPEED-MOBILE-AUDIT-2026-02-27.md`
  - da correggere nel punto in cui `_headers` viene trattato come non eseguito per definizione.
- `docs/CRAWL-AUDIT-IMPLEMENTATION-REPORT.md`
  - da marcare come storico e da collegare ai fix gia incorporati nella pipeline attuale.
- `docs/seo-strategy/MASTER-TASK-LIST.md`
  - se resta nel repo attivo, va allineato al backlog canonico o dichiarato storico.
- `docs/seo-strategy/MASTER-PLAN-SEO-2026-TASK-LIST.md`
  - oggi duplica la funzione del master task list; va o fuso o deprecato esplicitamente.

### P1.12 - Documenti da archiviare/deprecare, non tenere come riferimento attivo
**Non necessariamente da cancellare subito, ma da togliere dal flusso operativo**
- `docs/claude-code-SEO-analysis.MD`
- `docs/PSEO-ANALYSIS-REPORT.md`
- `docs/seo-strategy/AUDIT-SEO-BRUTALE-WEBNOVIS.md`
- `docs/seo-strategy/REPORT-IMPLEMENTAZIONE-AUDIT-UNIFICATO.md`
- `docs/seo-strategy/SEO-AUDIT.md`
- `docs/seo-strategy/SEO-AUDIT-FEBBRAIO-2026.md`

**Motivo**
- Sono utili come snapshot storici, ma sovrappongono audit, task list e decisioni operative.
- Se restano attivi senza banner di deprecazione, creano conflitti di priorita.

### P1.13 - Documenti da rimuovere sicuramente dal repo attivo
**Da eliminare o spostare fuori dal repo/archivio raw**
- `docs/crawl_audit_raw.xml`
- `docs/crawl_audit_text.txt`
- `docs/crawl_audit_webnovis_v2.docx`
- `docs/Report_Indicizzazione_WebNovis.docx`
- `docs/Report_Indicizzazione_WebNovis.extracted.txt`
- `docs/URL-classificati.csv`
- `docs/analisi_indicizzazione.md.resolved`
- `docs/seo-strategy/audit-seo-unificato-webnovis.txt`

**Motivo**
- Non sono documenti di lavoro versionabili in modo utile.
- Sono export/raw material o conversioni intermedie.
- Aumentano rumore, merge friction e ambiguita su quale sia la fonte affidabile.

## Ordine di esecuzione consigliato
1. P0.1 + P0.2 + P0.3
2. P1.1 + P1.2 + P1.5
3. P1.3 + P1.4
4. P1.6 + P1.7 + P1.8
5. P1.9
6. P1.10 + P1.11 + P1.12 + P1.13

## Deliverable attesi quando si passera all'implementazione
- produzione verificata rispetto agli header attesi dal repo
- footer/template unificati e privi di `height="auto"`
- policy immagini con lazy loading governata da test
- generatori non piu dipendenti da pagine pubblicate come template
- output build separato dalle sorgenti
- documentazione con un solo backlog operativo e archivi storici chiaramente marcati
