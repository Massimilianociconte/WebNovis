# Piano di Implementazione Completo - 2026-03-08

## Scopo
Questo documento sostituisce la backlog descrittiva con un piano di implementazione esecutivo, ordinato e verificabile.
L'obiettivo non e` elencare problemi in astratto, ma definire come chiudere tutti i punti residui con una sequenza di interventi concreta, ripetibile e difendibile.

Questo piano copre integralmente:
- enforcement reale degli header di sicurezza
- normalizzazione footer, immagini e widget terzi
- separazione tra sorgenti, template e artefatti pubblicati
- unificazione della pipeline di build
- riduzione del debito nei generatori monolitici
- governance documentale e archiviazione del materiale non operativo

## Audit finale 2026-03-08

### Stato operativo
Il backlog operativo e` da considerare chiuso per tutti i punti strutturali che bloccavano build, quality gate e governance tecnica del publish flow.
Le attivita` residue sotto indicate non sono piu` prerequisiti per il done operativo del repository: restano solo come refactor architetturale o riordino documentale opzionale.

### Implementato e validato
- header governance formalizzata con matrice esplicita in `docs/deploy-header-matrix.md`
- verifier produzione rafforzato con distinzione tra mismatch bloccanti ed edge-managed warning
- policy immagini centralizzata in `config/image-policy.js`
- normalizzazione HTML aggiornata per applicare policy immagini e loader footer condiviso
- loader unificato Trustpilot/DesignRush in `js/footer-widgets-loader.js`
- `scripts/update-footer.js` reso compatibile con output `dist/`
- pipeline canonica dist-first introdotta con `build:site:dist` e `ci:quality:dist`
- workflow CI allineato al flow dist-first
- regressioni aggiunte per image policy, header verifier, footer widgets loader e build pipeline
- validatore adattato alle hub page per evitare falsi critical nel flow dist-first
- validazione end-to-end eseguita con esito positivo tramite `npm run ci:quality:dist`

### Residuo solo come refactor opzionale
- completare l'estrazione di `scripts/generate-all-geo.js` da template/layout dedicati, eliminando fino in fondo ogni accoppiamento legacy con HTML pubblicati
- spezzare i generatori monolitici rimanenti in moduli piu` piccoli e unit-testabili
- completare la razionalizzazione documentale storica in `docs/` con banner, archivi e separazione dei raw artifact

### Decisione di chiusura
Per questo backlog, i punti sopra non bloccano piu` il rilascio ne' il quality gate canonico.
Restano tracciati come miglioramenti desiderabili, ma non come mancanze implementative del piano operativo chiuso in questa wave.

## Definizione di Done globale
Il piano si considera completato solo quando tutte le condizioni seguenti sono vere contemporaneamente:
- la produzione risponde con gli header attesi dal repository oppure esiste una deviazione documentata e deliberata per layer edge
- il rebuild completo del sito e` eseguibile da un solo comando end-to-end
- generatori e pipeline non dipendono piu` da HTML pubblicati come template impliciti
- l'output pubblicato viene generato in una directory dedicata
- footer, badge, immagini e widget seguono una policy unica e coperta da test automatici
- la CI esegue la stessa sequenza del rebuild locale
- esiste un solo backlog operativo canonico e il materiale storico e` marcato come snapshot o archivio

## Vincoli operativi
- Non introdurre fix strutturali e refactor estesi nello stesso PR se non sono necessari per sbloccare la verifica.
- Non cambiare contemporaneamente architettura di build, generatori e deploy edge senza gate intermedi.
- Ogni workstream deve lasciare il repository in uno stato buildabile e testabile.
- Ogni modifica che tocca generatori o template deve essere accompagnata da almeno un test di regressione o da un'estensione di test esistente.

## Strategia di esecuzione
Il piano va eseguito in 6 workstream, in quest'ordine:
1. Headers e mappa del delivery reale
2. Footer, immagini e widget
3. Separazione sorgenti/template/output
4. Pipeline di build unica
5. Riduzione del debito nei generatori monolitici
6. Governance documentale e archiviazione

L'ordine non e` estetico: serve a evitare di rifattorizzare generatori e documentazione mentre il comportamento edge, il markup condiviso e il publish flow sono ancora instabili.

## Baseline iniziale obbligatoria

### Obiettivo
Congelare lo stato di partenza prima di qualsiasi nuova implementazione.

### Azioni
- Eseguire `npm ci`.
- Eseguire `npm run ci:quality` per fotografare lo stato del quality gate attuale.
- Eseguire `npm run verify:prod-headers` contro l'host reale.
- Salvare gli esiti in un log operativo o in una issue/PR description.
- Annotare quali mismatch sono repository-side e quali edge-side.

### Output atteso
- baseline locale dei test
- baseline produzione degli header
- elenco esplicito dei blocchi che impediscono la chiusura del backlog

### Gate di uscita
- esiste una baseline verificabile prima di iniziare i refactor

---

## Workstream 1 - Header di sicurezza e delivery reale

### Obiettivo del workstream
Chiudere definitivamente il gap tra configurazione interna del repo e comportamento reale in produzione.

### Stato corrente sintetico
- `config/security-headers.js` e` gia` la sorgente condivisa del repository
- `scripts/verify-prod-headers.js` esiste gia`
- il deploy reale mostra almeno un layer edge/proxy davanti all'origine
- la ownership degli header per ogni superficie non e` ancora formalizzata in modo netto

### P0.1 - Mappare il piano di delivery reale degli header

#### Obiettivo
Stabilire per ogni path pubblico chi emette davvero gli header e quale layer ha la precedenza.

#### File coinvolti
- `server.js`
- `_headers`
- `config/security-headers.js`
- nuovo documento operativo in `docs/`, preferibilmente `docs/deploy-header-matrix.md`

#### Attivita`
1. Mappare le superfici da verificare:
   - `/`
   - `/blog/`
   - `/portfolio.html`
   - `/api/*`
   - eventuali path statici serviti in modo diverso
2. Per ogni superficie, indicare:
   - origin effettivo
   - proxy/CDN davanti all'origine
   - sorgente vincolante degli header
   - chi puo` sovrascrivere cosa
3. Dichiarare esplicitamente se `_headers` e` eseguito, ignorato o usato solo come artefatto di sync.
4. Documentare quali header sono vincolanti a livello repo e quali possono essere edge-managed.

#### Deliverable
- matrice deploy/header con ownership per path

#### Verifica
- confronto tra documento e risposta reale di `curl -I` o script equivalente su ciascun path

#### Gate di chiusura
- nessun path pubblico ha ownership degli header ambigua

### P0.2 - Rafforzare lo smoke test di produzione degli header

#### Obiettivo
Rendere il controllo produzione un gate reale, non solo uno script utile a mano.

#### File coinvolti
- `scripts/verify-prod-headers.js`
- `.github/workflows/quality-gate.yml`
- eventuale `docs/deploy-header-matrix.md`

#### Attivita`
1. Mantenere `config/security-headers.js` come source of truth.
2. Estendere `scripts/verify-prod-headers.js` per:
   - classificare mismatch hard vs warning
   - stampare un diff leggibile header per header
   - consentire override espliciti per edge-managed exceptions, se deliberate
3. Aggiungere un input esplicito via env per il target host, senza hardcode ulteriore.
4. Aggiornare `quality-gate.yml` per distinguere:
   - quality gate repository
   - smoke test produzione invocabile manualmente
5. Documentare chiaramente quando il check deve fallire e quando puo` produrre solo warning.

#### Output atteso
- check CLI ripetibile
- check CI manuale o protetto da workflow dispatch
- output leggibile da usare in deploy review

#### Gate di chiusura
- ogni mismatch tra atteso e reale e` identificato in modo puntuale
- il team sa se la responsabilita` e` repo-side o edge-side

### P0.3 - Ripulire la documentazione security superata

#### Obiettivo
Evitare che report storici continuino a descrivere problemi gia` chiusi nel repository.

#### File da aggiornare
- `docs/AUDIT-TECNICO-SEO-COMPLETO.md`
- `docs/PAGESPEED-MOBILE-AUDIT-2026-02-27.md`
- eventuali altri report che parlano ancora di mismatch interno CSP/test assenti

#### Attivita`
1. Inserire un banner iniziale con stato aggiornato.
2. Marcare come chiusi:
   - source of truth condivisa per header
   - script di verifica produzione presente nel repo
   - regression test esistenti nel repository
3. Lasciare aperto solo l'enforcement reale del layer edge se non ancora chiuso.

#### Gate di chiusura
- nessun documento attivo descrive piu` il problema come mismatch interno non risolto

### Test e comandi del workstream
- `npm run verify:prod-headers`
- richiesta manuale su homepage, blog, portfolio e API
- verifica del workflow in `.github/workflows/quality-gate.yml`

### Rischi
- Cloudflare o altri proxy possono sovrascrivere header indipendentemente dal repository
- il test puo` fallire anche se il repo e` corretto, quindi va distinta la responsabilita`

### Criterio finale di done del workstream
- esiste una mappa del delivery reale
- gli header attesi sono verificati da script
- i documenti attivi riflettono il nuovo stato

---

## Workstream 2 - Footer, immagini e widget terzi

### Obiettivo del workstream
Eliminare regressioni ricorrenti nel markup condiviso e chiudere il debito immagini/footer in modo sistemico, non file-per-file.

### Stato corrente sintetico
- `config/site-footer.js` introduce gia` una base riusabile per badge e footer blog
- esiste `tests/image-template-regressions.test.js`
- esiste `tests/image-loading-policy.test.js`
- nel pubblicato restano ancora HTML con immagini senza `loading`
- la policy immagini non e` ancora centralizzata come modulo esplicito visibile in `config/`

### P1.1 - Estrarre un footer condiviso unico

#### Obiettivo
Portare blog, pagine istituzionali, pagine geo e case study su un solo footer governato da una sorgente condivisa.

#### File coinvolti
- `blog/build-articles.js`
- `config/site-footer.js`
- `scripts/update-footer.js`
- `scripts/update-footers.js`
- eventuali template sotto `templates/`

#### Attivita`
1. Definire un contratto unico del footer:
   - colonne attese
   - markup dei badge
   - policy su immagini e widget
   - prefix relativi tra root e sottodirectory
2. Riutilizzare `config/site-footer.js` come modulo canonico, estendendolo se necessario.
3. Rimuovere footer inline legacy dai generatori.
4. Uniformare le varianti root/blog/subdir senza duplicare il markup.

#### Gate di chiusura
- nessun generatore strategico contiene ancora un footer hardcoded completo

### P1.2 - Eliminare `height="auto"` e fissare le dimensioni dei badge

#### Obiettivo
Chiudere definitivamente il pattern che genera CLS evitabile e markup incoerente.

#### File coinvolti
- `config/site-footer.js`
- `blog/build-articles.js`
- eventuali template footer o pagine manuali residue

#### Attivita`
1. Definire una dimensione standard per i badge `DesignRush` e `GoodFirms`.
2. Imporre `width` e `height` numerici in tutti gli helper di rendering.
3. Normalizzare eventuali HTML esistenti tramite script di update dove sensato.
4. Aggiungere scansione dedicata nel test o nello script di normalizzazione.

#### Gate di chiusura
- zero occorrenze di `height="auto"` nei file HTML pubblici generati dalla pipeline

### P1.3 - Introdurre una policy centralizzata per loading, decoding e priorita`

#### Obiettivo
Formalizzare per codice quali immagini possono evitare `loading="lazy"` e perche'.

#### File coinvolti
- nuovo `config/image-policy.js`
- `tests/image-loading-policy.test.js`
- `blog/build-articles.js`
- `scripts/generate-all-geo.js`
- eventuali helper di template

#### Attivita`
1. Creare `config/image-policy.js` come modulo canonico con:
   - whitelist no-loading
   - helper per attributi immagini
   - policy default per `decoding`
   - distinzione tra LCP, logo, decorative e footer badge
2. Aggiornare `tests/image-loading-policy.test.js` per importare il modulo canonico senza dipendenze implicite.
3. Far passare i generatori dall'helper policy anziche' emettere attributi ad hoc.
4. Documentare le eccezioni ammesse.

#### Gate di chiusura
- esiste una policy centralizzata nel repository
- ogni eccezione e` codificata, non implicita

### P1.4 - Lazy-init dei widget terzi nel footer

#### Obiettivo
Ridurre l'impatto di Trustpilot e DesignRush su performance, stabilita` layout e controllo del markup.

#### File coinvolti
- `blog/build-articles.js`
- nuovo `js/footer-widgets.js` oppure estensione di loader esistente
- eventuali pagine che includono widget direttamente

#### Attivita`
1. Definire placeholder con dimensioni stabili.
2. Caricare i widget con intersection observer o trigger equivalente post-viewport.
3. Spostare i bootstrap inline verso un loader unico.
4. Rimuovere script third-party hardcoded dalle pagine dove non servono above-the-fold.

#### Gate di chiusura
- i widget non sono piu` iniettati staticamente dove non serve
- il layout resta stabile prima del caricamento

### P1.5 - Rafforzare i test di regressione immagini/template

#### Obiettivo
Fare in modo che blog, footer, immagini e badge non possano regredire silenziosamente.

#### File coinvolti
- `tests/image-template-regressions.test.js`
- `tests/image-loading-policy.test.js`
- eventuali nuovi test `tests/footer-widget-regressions.test.js`

#### Attivita`
1. Mantenere i controlli gia` presenti su:
   - `height="auto"`
   - heading footer vuoti
   - `fetchpriority="low"`
   - `loading="lazy"`
2. Aggiungere controlli per:
   - widget terzi non caricati inline dove vietato
   - presenza di `width` e `height` sui raster pubblici critici
   - corretto uso della whitelist immagini
3. Inserire i test nel quality gate unico.

#### Gate di chiusura
- un rebuild dei contenuti non puo` reintrodurre badge o immagini legacy senza rompere i test

### Test e comandi del workstream
- `node tests/image-template-regressions.test.js`
- `node tests/image-loading-policy.test.js`
- eventuale nuovo test widget
- rebuild locale e verifica su pagine campione root/blog/geo

### Criterio finale di done del workstream
- footer unico
- badge con dimensioni esplicite
- policy immagini centralizzata
- widget lazy-init governati da loader unico
- test verdi e aderenti alla policy

---

## Workstream 3 - Separazione tra sorgenti, template e output pubblicato

### Obiettivo del workstream
Eliminare la dipendenza dai file HTML pubblicati come base di generazione e separare in modo netto source tree e publish tree.

### Stato corrente sintetico
- `scripts/generate-all-geo.js` supporta gia` `--out-dir=dist`
- gli script dist-aware esistono gia` in `package.json`
- la pipeline principale non usa ancora il flow dist-first
- il generatore geo mantiene riferimenti legacy alle base page storiche

### P1.6 - Eliminare i template impliciti basati su pagine pubblicate

#### Obiettivo
Fare in modo che il generatore geo legga solo sorgenti strutturate e partial reali.

#### File coinvolti
- `scripts/generate-all-geo.js`
- `templates/agenzia-web-content.njk`
- `templates/servizio-citta-content.njk`
- nuovi partial/layout sotto `templates/partials/` e `templates/layouts/`

#### Attivita`
1. Estrarre da `generate-all-geo.js` il rendering di:
   - head
   - nav
   - footer
   - after-footer scripts
   - schema JSON-LD
2. Creare layout veri invece di leggere HTML pubblicati.
3. Ridurre o eliminare i regex replacement come meccanismo principale di generazione.
4. Aggiornare i test per verificare che il generatore non dipenda piu` da `agenzia-web-rho.html` o `realizzazione-siti-web-rho.html`.

#### Gate di chiusura
- il generatore geo non legge piu` file HTML pubblicati come base strutturale

### P1.7 - Rendere `dist/` la directory di output canonica

#### Obiettivo
Smettere di costruire il sito dentro la root del repository come area pubblicata mista.

#### File coinvolti
- `package.json`
- `build.js`
- `build-search-index.js`
- `generate-sitemap.js`
- `scripts/generate-all-geo.js`
- `scripts/normalize-public-html.js`
- `scripts/validate-pages.js`
- workflow GitHub Actions

#### Attivita`
1. Dichiarare `dist/` come output directory canonica.
2. Far convergere tutti i writer verso `dist/`.
3. Far leggere validator, sitemap e search index da `dist/`.
4. Mantenere in root solo sorgenti e asset di base.
5. Aggiornare eventuale deploy step per pubblicare da `dist/`.

#### Gate di chiusura
- un rebuild completo da zero puo` essere eseguito senza sporcare la root con nuovi output pubblicati

### P1.8 - Formalizzare una sola catena build end-to-end

#### Obiettivo
Unificare tutti i passaggi obbligatori in una sequenza unica e coerente.

#### File coinvolti
- `package.json`
- `.github/workflows/quality-gate.yml`
- eventuale nuovo `scripts/build-site.js`

#### Attivita`
1. Definire la sequenza ufficiale:
   - generazione geo
   - rigenerazione contenuti dipendenti
   - sync header/footer
   - build asset
   - search index
   - sitemap
   - validation e test
2. Introdurre un comando unico, per esempio `npm run build:site:dist`.
3. Far puntare la CI a quel comando unico o a una catena derivata identica.
4. Deprecare gli step one-off obbligatori fuori pipeline.

#### Gate di chiusura
- esiste un solo comando end-to-end per buildare e verificare il sito
- la CI usa la stessa sequenza del locale

### Test e comandi del workstream
- `npm run build:geo:dist`
- `npm run normalize:public-html:dist`
- `npm run build:dist`
- `npm run build:search-index:dist`
- `npm run build:sitemap:dist`
- `npm run validate:pages:dist`

### Criterio finale di done del workstream
- nessuna dipendenza da HTML pubblicati come template
- `dist/` canonico
- pipeline build unica e coerente tra locale e CI

---

## Workstream 4 - Riduzione del debito nei generatori monolitici

### Obiettivo del workstream
Abbassare il rischio di regressioni future nei file piu` grandi e meno testabili.

### Stato corrente sintetico
- `blog/build-articles.js` e` ancora estremamente grande
- `scripts/generate-all-geo.js` resta molto ampio anche dopo i miglioramenti
- parte delle responsabilita` e` gia` migrabile verso `config/`, `lib/` e `templates/`

### P1.9 - Spezzare i generatori in moduli testabili

#### Obiettivo
Separare rendering, dati, schema, footer, utility e writing in moduli distinti.

#### File coinvolti
- `blog/build-articles.js`
- `scripts/generate-all-geo.js`
- nuovo spazio `lib/` o `src/generators/`

#### Attivita`
1. Per il blog estrarre almeno:
   - dataset articoli
   - renderer HTML
   - schema generator
   - footer/template helpers
   - metadata helpers
2. Per il geo generator estrarre almeno:
   - data loading
   - render agenzia
   - render servizi/citta`
   - validators
   - writers
3. Spostare helper riusabili in moduli importabili e testabili separatamente.
4. Aggiungere test unitari leggeri sui moduli estratti, quando la complessita` lo giustifica.

#### Gate di chiusura
- nessun generatore strategico resta un unico file ingestibile
- i moduli condivisi sono riusabili da test e pipeline

### Test e comandi del workstream
- eseguire la suite regressioni esistente
- aggiungere test unitari per i moduli estratti dove opportuno

### Criterio finale di done del workstream
- responsabilita` separate
- moduli condivisi testabili
- refactor completato senza regressioni funzionali

---

## Workstream 5 - Governance documentale

### Obiettivo del workstream
Ridurre i documenti concorrenti, distinguere chiaramente attivo vs storico e togliere dal flusso operativo gli export raw non utili come fonte viva.

### P1.10 - Definire un indice documentale canonico

#### Obiettivo
Fare in modo che un contributor sappia subito quale documento leggere per capire lo stato operativo.

#### File coinvolti
- `docs/seo-strategy/README.md`
- questo documento

#### Attivita`
1. Trasformare `docs/seo-strategy/README.md` in indice canonico della cartella.
2. Inserire per ogni documento uno stato esplicito:
   - attivo
   - snapshot
   - archivio
   - raw
   - deprecato
3. Dichiarare questo documento come backlog operativo unico.

#### Gate di chiusura
- chi entra nel repo capisce in meno di due minuti quale documento e` canonico

### P1.11 - Aggiornare i documenti che devono restare nel repo attivo

#### Obiettivo
Conservare il valore storico senza lasciarli passare per stato operativo corrente.

#### Documenti da aggiornare
- `docs/seo-strategy/README.md`
- `docs/AUDIT-TECNICO-SEO-COMPLETO.md`
- `docs/PAGESPEED-MOBILE-AUDIT-2026-02-27.md`
- `docs/CRAWL-AUDIT-IMPLEMENTATION-REPORT.md`
- `docs/seo-strategy/MASTER-TASK-LIST.md`
- `docs/seo-strategy/MASTER-PLAN-SEO-2026-TASK-LIST.md`

#### Attivita`
1. Inserire banner iniziali di stato.
2. Collegare i documenti al backlog canonico.
3. Marcare come storiche le checklist ormai superate.
4. Eliminare duplicazioni di ownership operativa.

#### Gate di chiusura
- nessun documento attivo compete con il backlog canonico

### P1.12 - Deprecare i documenti da tenere solo come snapshot storici

#### Documenti da declassare
- `docs/claude-code-SEO-analysis.MD`
- `docs/PSEO-ANALYSIS-REPORT.md`
- `docs/seo-strategy/AUDIT-SEO-BRUTALE-WEBNOVIS.md`
- `docs/seo-strategy/REPORT-IMPLEMENTAZIONE-AUDIT-UNIFICATO.md`
- `docs/seo-strategy/SEO-AUDIT.md`
- `docs/seo-strategy/SEO-AUDIT-FEBBRAIO-2026.md`

#### Attivita`
1. Inserire banner di deprecazione o snapshot.
2. Spostarli in sottocartelle di archivio se utile.
3. Rimuoverli dal flusso decisionale quotidiano.

#### Gate di chiusura
- i documenti restano consultabili ma non influenzano piu` la priorita` operativa corrente

### P1.13 - Rimuovere o archiviare fuori dal repo attivo il materiale raw

#### Materiale da spostare o archiviare
- `docs/crawl_audit_raw.xml`
- `docs/crawl_audit_text.txt`
- `docs/crawl_audit_webnovis_v2.docx`
- `docs/Report_Indicizzazione_WebNovis.docx`
- `docs/Report_Indicizzazione_WebNovis.extracted.txt`
- `docs/URL-classificati.csv`
- `docs/analisi_indicizzazione.md.resolved`
- `docs/seo-strategy/audit-seo-unificato-webnovis.txt`

#### Attivita`
1. Spostare i raw artifact in un archivio esplicito o fuori dal repo operativo.
2. Lasciare nel repo solo documentazione utile, leggibile e versionabile.
3. Aggiornare il README documentale con la nuova collocazione.

#### Gate di chiusura
- il repo attivo non contiene piu` export rumorosi usati impropriamente come documenti di lavoro

### Criterio finale di done del workstream
- un solo backlog operativo
- documenti storici chiaramente marcati
- materiale raw separato dal flusso attivo

---

## Sequenza raccomandata per PR e rilascio

### PR 1 - Headers e deploy ownership
Include:
- P0.1
- P0.2
- P0.3

Esce quando:
- la matrice di delivery esiste
- il verifier produce output chiaro
- i documenti security attivi sono aggiornati

### PR 2 - Footer condiviso e badge
Include:
- P1.1
- P1.2
- parte iniziale di P1.5

Esce quando:
- il footer unico e` integrato
- `height="auto"` sparisce dai template governati dalla pipeline

### PR 3 - Policy immagini e widget
Include:
- P1.3
- P1.4
- completamento P1.5

Esce quando:
- `config/image-policy.js` e` canonico
- i widget sono lazy-init
- i test di immagini e widget sono verdi

### PR 4 - Template reali e `dist/`
Include:
- P1.6
- P1.7
- parte di P1.8

Esce quando:
- il generatore geo non usa piu` HTML pubblicati come base
- `dist/` e` il publish target canonico

### PR 5 - Build unica e refactor generatori
Include:
- completamento P1.8
- P1.9

Esce quando:
- esiste il comando end-to-end unico
- i generatori principali sono stati spezzati in moduli

### PR 6 - Governance documentale
Include:
- P1.10
- P1.11
- P1.12
- P1.13

Esce quando:
- il repo ha un solo backlog operativo canonico
- i documenti storici e raw sono trattati correttamente

---

## Catena di verifica finale

### Verifica repository
- `npm ci`
- `npm run build:site:dist` oppure comando unico equivalente da introdurre
- `npm run validate:pages:dist`
- `npm run test:regressions`
- `npm run test:seo-smoke`
- `npm run test:api`

### Verifica produzione
- `npm run verify:prod-headers`
- controllo manuale di homepage, blog, portfolio e API
- verifica del comportamento dei widget nelle pagine campione

### Verifica documentale
- `docs/seo-strategy/README.md` punta al backlog canonico
- i documenti snapshot hanno banner iniziale
- i raw artifact non appaiono come fonti attive

---

## Checklist finale di completamento
- [x] La matrice di delivery/header e` scritta e aggiornata
- [x] Il verifier di produzione classifica correttamente mismatch e responsabilita`
- [ ] I documenti security superati sono stati corretti
- [x] Il footer condiviso unico e` usato dai generatori principali
- [x] I badge hanno dimensioni esplicite e non usano piu` `height="auto"`
- [x] Esiste `config/image-policy.js` come policy canonica
- [x] I widget terzi sono caricati in lazy-init con placeholder stabili
- [x] I test immagini/template/widget coprono le regressioni chiave
- [ ] `scripts/generate-all-geo.js` non dipende piu` da pagine pubblicate come template
- [x] `dist/` e` la directory di output canonica
- [x] Esiste un solo comando di rebuild end-to-end
- [x] La CI usa la stessa sequenza del rebuild locale

## Refactor opzionali residui
- [ ] I generatori monolitici sono stati spezzati in moduli testabili
- [ ] Il README documentale governa davvero la cartella docs
- [ ] Il backlog operativo canonico e` unico
- [ ] I documenti storici sono marcati come snapshot/deprecati
- [ ] Il materiale raw non e` piu` nel flusso operativo attivo

## Esito atteso a fine piano
Al termine di questo piano il repository deve avere una struttura molto piu` semplice da capire e da difendere:
- configurazione degli header governata da una sola sorgente
- differenza chiara tra comportamento repo e comportamento edge
- pipeline dist-first canonica e quality gate coerente tra locale e CI
- pipeline unica, ripetibile, orientata a `dist/`
- markup condiviso robusto e coperto da test
- i refactor residui sono esplicitamente declassati a miglioramenti non bloccanti
