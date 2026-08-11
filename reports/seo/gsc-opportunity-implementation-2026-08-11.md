# GSC opportunity implementation — 11 agosto 2026

## Perimetro e baseline

Periodo analizzato: **13 luglio–9 agosto 2026** (ultimi 28 giorni disponibili nell'export).

- Totale proprietà: **55 clic**, **10.571 impression**, **CTR 0,52%**, posizione media ponderata **24,96**.
- Seconda metà rispetto alla prima: impression **+48,5%**, clic **-33,3%**, CTR **-55,1%**.
- Il file delle query espone una quota parziale e anonimizzata del totale: **6/55 clic** e **6.708/10.571 impression**. Le valutazioni sulle query vanno quindi lette come priorità osservabili, non come ricostruzione completa della domanda.
- Desktop: **7.700 impression**, CTR **0,49%**. Mobile: **2.367 impression**, CTR **0,72%**. Tablet: **504 impression**, 0 clic.
- Italia: **8.262 impression**, 55 clic. Traffico non italiano: **2.309 impression**, 0 clic; Stati Uniti: **1.172 impression**, posizione media **9,47**, 0 clic.

## Radici del divario impression-clic

1. **Intento regionale senza pagina sufficientemente forte.** Le query Lombardia accumulano circa 1.360 impression e 0 clic, mentre gli hub erano soprattutto directory di comuni e ricevevano autorevolezza quasi esclusivamente dal footer.
2. **Snippet non allineati alla formulazione della domanda.** Le pagine su brand identity, pillar page, community management, competitor e accessibilità avevano titoli e aperture meno diretti delle query effettivamente osservate.
3. **Cannibalizzazione d'intento locale.** Per “web agency Rho” Google mostrava la pagina contatti invece della landing dedicata: il segnale di sede era forte, ma lo scopo delle due pagine non era separato abbastanza.
4. **Sovrapposizione tra due guide competitor.** La pagina su strumenti/checklist e quella sul metodo rispondevano in parte alla stessa domanda senza una relazione gerarchica esplicita.
5. **Risposte informative adatte allo zero-click ma poco orientate al passaggio successivo.** Sulle query brand WebNovis è già comparso in superfici riassuntive; per ottenere clic servono specificità, fasce di prezzo, deliverable e percorsi di approfondimento, non una ripetizione generica della definizione.
6. **Il problema principale non è il crawl.** Il controllo del sito non ha rilevato errori critici di indicizzabilità, canonical o struttura nelle pagine prioritarie; il gap è soprattutto di intento, snippet, gerarchia e distribuzione dell'autorevolezza interna.

## Query e cluster prioritari

| Cluster | Impression osservate | Clic | Posizione media | Intervento |
|---|---:|---:|---:|---|
| Realizzazione/web agency Lombardia | 1.360 | 0 | 39,55 | Hub regionali, prezzi, servizi, FAQ, schema Service/FAQPage e link contestuali |
| Brand identity e prezzi | 792 | 1 | 24,82 | Titolo, H1, risposta diretta, fasce e pacchetti |
| Rho web | 208 | 0 | 18,25 | Separazione contatti/landing locale e anchor contestuale |
| Arese e Bollate | 218 | 0 | 11,35 | Conservazione delle landing Tier 1 e rafforzamento tramite hub |
| Analisi competitor | 266 | 0 | 54,89 | Separazione “strumenti/checklist” da “metodo in 7 passi” |
| Audit accessibilità | 193 | 0 | 34,58 | Intento audit, perimetro prudente, fonti ufficiali e offerta verificabile |
| Guide SEO informative | 482 | 0 | 27,03 | Definizione e risposta diretta per pillar page |
| Community management | 89 | 0 | 19,98 | Definizione, attività, KPI e link da contenuti social affini |

Query singole ad alta priorità: “analisi competitor online” (246 impression), “realizzazione siti web lombardia” (196), “creazione siti web lombardia” (151), “creazione siti lombardia” (141), “web agency lombardia” (137), “realizzazione siti internet lombardia” (126), “realizzazioni siti e-commerce lombardia” (120), “brand identity costo” (91), “prezzi logo” (91), “pillar page” (79), “audit accessibilità digitale” (78), “costo brand identity” (74), “community management” (55), “web agency rho” (53), “pacchetto di branding” (52).

## Implementazione completata

- Ricostruiti gli hub `/agenzia-web/` e `/realizzazione-siti-web/` con risposta diretta, mappa servizi/intenti, prezzi indicativi, metodologia, FAQ visibili e dati strutturati `Service` + `FAQPage` coerenti con il testo.
- Allineati title, meta description, H1, apertura e schema delle pagine prioritarie su brand identity, pillar page, community management, competitor e accessibilità.
- Differenziate le due guide competitor e aggiunti link reciproci contestuali.
- Aggiunti link editoriali da contenuti semanticamente affini verso pillar page, community management e competitor.
- Separato l'intento di `/contatti.html` da `/agenzia-web-rho.html`, conservando NAP e aggiungendo un collegamento descrittivo verso la landing locale.
- Collegati gli hub Lombardia dalle pagine autorevoli “Chi siamo” e “Sviluppo web”, oltre alla navigazione globale.
- Rivisto il servizio di accessibilità eliminando generalizzazioni legislative, percentuali e sanzioni non contestualizzate; aggiunte fonti istituzionali e confini espliciti tra audit tecnico, certificazione e parere legale.
- Rigenerati indici di ricerca, sitemap, export AI, `llms.txt` e `llms-full.txt`.

## Protocollo di verifica GSC

Le modifiche locali non provano un miglioramento di ranking. Dopo pubblicazione e nuova scansione di Google:

1. **Dopo 14 giorni:** controllare indicizzazione, pagina selezionata per “web agency Rho”, comparsa delle nuove query e anomalie di CTR.
2. **Dopo 28 giorni:** confrontare un periodo omogeneo precedente/successivo per cluster, pagina, dispositivo e Paese.
3. **KPI primari:** clic non-brand, CTR a parità di posizione, quota di query in Top 10/20, impression e clic delle due pagine competitor separate, landing corretta per query locale.
4. **KPI di qualità:** richieste di preventivo e contatti assistiti dalle landing, non soltanto impression.
5. **Regola decisionale:** modificare di nuovo title o intento solo con evidenza sufficiente; evitare riscritture settimanali che impediscano di attribuire il risultato.

## Verifiche locali eseguite

- Validazione: **869 pagine**, **0 errori critici**, **0 problemi di similarità**.
- Audit GEO: **80 pagine**, punteggio medio **100/100** secondo le verifiche pertinenti alle landing commerciali; `Speakable` non è trattato come requisito universale.
- Suite regressiva completa: superata.
- SEO smoke test: superato.
- API smoke test: superato.
- Controlli di sintassi e `git diff --check`: superati.
