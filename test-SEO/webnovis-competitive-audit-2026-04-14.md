# WebNovis SEO Competitive Audit

Data audit: 14 aprile 2026  
Ambito: Rho, Sesto San Giovanni, Cinisello Balsamo, Parabiago, Arese, Lainate, Garbagnate Milanese, Milano  
Intent analizzati: `agenzia web`, `realizzazione siti web`, `web agency`, `seo`, `ecommerce`

## Executive Summary

### I 5 fattori di ranking più determinanti nell'hinterland milanese

1. **Pagine city+service estremamente esplicite**  
   Nelle SERP locali fuori Milano centro vincono quasi sempre URL, title e H1 che dichiarano in modo diretto servizio + città. Esempi ricorrenti: `realizzazione-siti-web-rho`, `seo-agency-arese`, `sitiweb-parabiago.it`, `sitiweb-lainate.it`, `realizzazione-e-commerce-parabiago`.

2. **Reti di internal linking molto aggressive**  
   I competitor che rankano meglio su `ecommerce` e parte di `seo` usano spesso network di landing quasi-template ma con moltissimi link interni. Nei campioni raccolti la media competitor è **110 link interni/pagina**; i network `realizzazione-ecommerce.eu` e `progettazione-ecommerce.eu` arrivano a circa **343-348 link interni** con struttura heading minima.

3. **Trust locale confezionato in modo semplice ma visibile**  
   Nei campioni competitor il **100%** espone un telefono visibile o in schema, il **92%** mostra segnali di address/local business e circa **32%** usa `AggregateRating` o markup simile. Non sempre il contenuto è migliore: spesso è la confezione locale a essere più aggressiva.

4. **Milano è un mercato diverso dal resto del cluster**  
   A Milano non bastano pagine city+service “esatte”: entrano in gioco brand, breadth del sito e authority. Esempi come [The Rope](https://therope.it/) e [Artwork Studios](https://www.artworkstudios.it/) combinano homepage/servizi più ricche, molta architettura interna e schema più completo.

5. **WebNovis oggi compete davvero solo su una parte degli intent**  
   Le pagine `agenzia-web-*` e `realizzazione-siti-web-*` sono indexabili e strutturalmente competitive. Le pagine `seo-locale-*` invece sono de-amplificate via `noindex, follow`, e le `ecommerce-*` restano mediamente molto più corte. Quindi per molte query il gap non è “serve solo tempo”: è in parte **strutturale**.

### Conclusione netta

- Su `agenzia web [città]` e `realizzazione siti web [città]`, WebNovis è spesso **già allineata o superiore** ai competitor locali sul piano strutturale. Qui il fattore residuo è soprattutto **tempo + autorità + segnali esterni**.
- Su `seo [città]`, WebNovis oggi **non sta realmente partecipando** alla gara organica perché le `seo-locale-*` sono `noindex`.
- Su `ecommerce [città]`, WebNovis parte in svantaggio perché molte SERP sono presidiate da landing altamente esatte e molto interlinkate, mentre le `ecommerce-*` WebNovis restano ancora relativamente leggere.

## Metodo e limiti

- SERP raccolte con ricerca live non personalizzata il 14 aprile 2026 e spot-check web su query campione.
- Per diverse città le query nude `seo [città]` ed `ecommerce [città]` risultano rumorose o ambigue su motori pubblici:
  - `seo rho` restituisce risultati non commerciali.
  - `ecommerce rho` collide con il brand finanziario `Rho`.
  - `seo arese` ed `ecommerce arese` tendono a generare risultati generici.
- Per questo il set competitor è stato validato anche con le varianti commerciali:
  - `agenzia seo [città]`
  - `realizzazione ecommerce [città]`
- **Backlink counts, anchor distribution, CTR e dwell time reali non sono stati inclusi come verità**: non erano verificabili in modo affidabile con fonti pubbliche accessibili in questa sessione.
- Anche il benchmark Core Web Vitals da PSI non è stato completato perché l'API pubblica ha restituito `429 Too Many Requests`. Nel report sono quindi inclusi solo proxy tecnici osservabili (status, indexability, schema, link density, payload/TTFB di campioni).

## Stato attuale WebNovis

### Evidenza osservata sul sito corrente

- [robots.txt](https://www.webnovis.com/robots.txt) e [sitemap.xml](https://www.webnovis.com/sitemap.xml) sono pubblici, coerenti e aggiornati.
- Le pagine campione live condividono `Last-Modified: Mon, 13 Apr 2026 21:07:22 GMT`.
- Le pagine `agenzia-web-*` sono indexabili e includono `FAQPage`.
- Le pagine `realizzazione-siti-web-*` sono indexabili ma **nei campioni live non espongono `FAQPage`**.
- Le pagine `ecommerce-*` campionate sono indexabili eccetto `ecommerce-milano.html`, che risulta `noindex`.
- Le pagine `seo-locale-*` campionate risultano tutte `noindex, follow`.

### Dati medi rilevati sui template generati locali

| Famiglia | Count campioni | Word count medio | Link medi | H2 medi | FAQPage live campionato | Indexability |
|---|---:|---:|---:|---:|---|---|
| `agenzia-web-*` | 8 | 1.760 | 44.6 | 10.2 | Sì | index |
| `realizzazione-siti-web-*` | 7 | 2.005 | 44.4 | 9.7 | No nei campioni verificati | index |
| `ecommerce-*` | 8 | 875 | 44.0 | 9.0 | No nei campioni verificati | 7 index / 1 noindex |
| `seo-locale-*` | 8 | 901 | 44.0 | 9.0 | No nei campioni verificati | 8 noindex |

### Segnali tecnici proxy su campioni live

| Pagina | TTFB | Tempo totale | HTML scaricato |
|---|---:|---:|---:|
| `webnovis.com/realizzazione-siti-web-rho.html` | 0.669s | 0.682s | 51 KB |
| `digital-monkey.it/realizzazione-siti-web-rho/` | 0.454s | 0.655s | 28 KB |
| `sitisrl.it/seo-agency-arese` | 0.346s | 0.456s | 64 KB |
| `artworkstudios.it/` | 0.460s | 0.863s | 282 KB |
| `therope.it/` | 0.309s | 0.870s | 435 KB |

Lettura corretta: WebNovis non sembra tecnicamente “pesantissima”, ma senza un benchmark Lighthouse/CrUX affidabile non c'è abbastanza evidenza per dire che la performance sia oggi il vero collo di bottiglia.

## Analisi per Città

### Rho

**Competitor ricorrenti in top 10**

- [Digital Monkey](https://www.digital-monkey.it/realizzazione-siti-web-rho/)
- [SITI srl](https://www.sitisrl.it/seo-agency-rho)
- [AgenziaWeb21](https://agenziaweb21.com/agenzia-web-rho-web-agency-rho-creazione-siti-web/)
- [Lumiaweb](https://www.lumiaweb.com/realizzazione-ecommerce-rho-creazione-ecommerce-rho/)

**Fattori chiave**

- Digital Monkey usa una local page molto pulita: 1.400 parole, 12 H2, 49 link interni, phone/address presenti.
- SITI ranka con una SEO landing più corta: 858 parole, solo 3 H2, ma `AggregateRating` e title iper-esatto.
- La SERP contiene anche URL fragili/stale: `service-lab.com/agenzia-web-rho/` ha restituito 404; `semantycaweb.it` ha bloccato il fetch. Questo segnala che la competizione non è imbattibile.

**Lettura WebNovis**

- `agenzia-web-rho.html` è ben messa.
- `realizzazione-siti-web-rho.html` è competitiva sul contenuto.
- `seo-locale-rho.html` è `noindex`: il gap su intent SEO è **strutturale**, non temporale.

### Sesto San Giovanni

**Competitor ricorrenti in top 10**

- [Digital Monkey](https://www.digital-monkey.it/realizzazione-siti-web-sesto-san-giovanni/)
- [Lumiaweb](https://www.lumiaweb.com/web-agency-sesto-san-giovanni-realizzazione-siti-web-sesto-san-giovanni/)
- [OkSEO](https://www.okseo.it/agenzia-seo-sesto-san-giovanni/)
- [Realizzazione Ecommerce / Gragraphic](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-sesto-san-giovanni.html)

**Fattori chiave**

- Lumiaweb: 996 parole, H1/title perfettamente allineati a città+servizio, 33 link interni.
- OkSEO: 916 parole ma 75 link interni, forte presidio SEO-specialist.
- `realizzazione-ecommerce.eu`: 2.160 parole, solo 1 H2, ma 343 link interni e fortissima exact-match relevance.

**Lettura WebNovis**

- `realizzazione-siti-web-sesto-san-giovanni.html` è abbastanza forte da giocarsela.
- `seo-locale-sesto-san-giovanni.html` è fuori gioco per `noindex`.
- `ecommerce-sesto-san-giovanni.html` è troppo corta rispetto ai player che presidiano l'intento.

### Cinisello Balsamo

**Competitor ricorrenti in top 10**

- [Dbeeta](https://www.dbeeta.it/)
- [PNT Solutions](https://www.pntsolutions.it/agenzia-seo/agenzia-seo-cinisello-balsamo/)
- [Skylead](https://www.skylead.it/creazione-siti-web-a-cinisello-balsamo-realizzazione-siti-web/)
- [Realizzazione Ecommerce / Gragraphic](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-cinisello-balsamo.html)

**Fattori chiave**

- Skylead usa `AggregateRating` oltre a una local page molto verticale.
- PNT Solutions presidia l'intento SEO con una SEO-specific landing.
- Il network ecommerce replica il pattern già visto: heading povera, interlinking enorme.

**Lettura WebNovis**

- `realizzazione-siti-web-cinisello-balsamo.html` è competitiva.
- `seo-locale-cinisello-balsamo.html` è strutturalmente tagliata fuori.
- `ecommerce-cinisello-balsamo.html` non ha abbastanza profondità per un cluster dominato da network dedicati.

### Parabiago

**Competitor ricorrenti in top 10**

- [Siti Web Parabiago](https://www.sitiweb-parabiago.it/)
- [Digital Monkey](https://www.digital-monkey.it/realizzazione-siti-web-parabiago/)
- [AgenziaWebSEO](https://agenziawebseo.it/servizi-web/consulente-seo-web/lombardia/milano/parabiago/)
- [Realizzazione Ecommerce / Gragraphic](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-parabiago.html)

**Fattori chiave**

- `sitiweb-parabiago.it` ranka pur essendo molto sottile: circa 477 parole, zero H2, zero link interni misurati nel body campionato. Questo è il segnale più forte che a Parabiago pesa moltissimo l'esattezza del match local-service.
- Digital Monkey è la pagina più “vera” e strutturata tra i competitor rilevati.
- AgenziaWebSEO presidia bene il verticale SEO con title/H1 espliciti e 67 link interni.

**Lettura WebNovis**

- Qui WebNovis potrebbe superare diversi concorrenti sul medio periodo per qualità contenutistica.
- Ma l'assenza di indexation sulle pagine SEO impedisce di capitalizzare l'intento `seo Parabiago`.

### Arese

**Competitor ricorrenti in top 10**

- [SITI srl](https://www.sitisrl.it/seo-agency-arese)
- [Ecommerce Milano / Gragraphic](https://www.ecommercemilano.it/realizzazione-ecommerce-arese.html)
- [Digital Monkey SEO Arese](https://www.digital-monkey.it/posizionamento-seo-arese/)
- [Agenzia Web Milano](https://www.agenziawebmilano.net/agenzia-web-arese/)

**Fattori chiave**

- Due URL emersi nelle SERP (`ArteBrand` e `Service Lab`) hanno restituito 404 al fetch. Quindi c'è spazio reale di scalata.
- SITI vince su SEO con copy corto ma `AggregateRating` e intent esplicitissimo.
- `ecommercemilano.it` combina 1.580 parole, rating schema e 97 link interni.

**Lettura WebNovis**

- `realizzazione-siti-web-arese.html` è già ben costruita.
- La vera lacuna è che WebNovis non presidia in modo efficace né `seo` né `ecommerce` su Arese.

### Lainate

**Competitor ricorrenti in top 10**

- [Digital Monkey](https://www.digital-monkey.it/realizzazione-siti-web-lainate/)
- [Siti Web Lainate](https://www.sitiweb-lainate.it/)
- [Progettazione Ecommerce / Gragraphic](https://www.progettazione-ecommerce.eu/progettazione-e-commerce-lainate.html)
- [Inrete Digital](https://marketing.inretedigital.it/realizzazione-e-sviluppo-siti-web-lainate/)

**Fattori chiave**

- `sitiweb-lainate.it` ranka con appena ~478 parole: altro segnale di dominio exact-match fortissimo.
- Inrete Digital e Digital Monkey usano pagine locali più complete (1.319 e 1.381 parole, 12 H2).
- `progettazione-ecommerce.eu` combina rating, LocalBusiness e 348 link interni.

**Lettura WebNovis**

- `realizzazione-siti-web-lainate.html` è già nel livello giusto.
- `ecommerce-lainate.html` resta debole rispetto al cluster.
- `seo-locale-lainate.html` soffre dello stesso blocco di indexation.

### Garbagnate Milanese

**Competitor ricorrenti in top 10**

- [Realizzazione Ecommerce / Gragraphic](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-garbagnate-milanese.html)
- [SITI srl](https://www.sitisrl.it/seo-agency-garbagnate-milanese)
- [Agenzia Web Milano](https://www.agenziawebmilano.net/agenzia-web-garbagnate-milanese/)
- [NYC Web Design Italia](https://www.nycwebdesign.eu/webdesign/realizzazione-siti-webgarbagnate-milanese/)

**Fattori chiave**

- Anche qui il pattern dominante non è “miglior contenuto”, ma combinazione di exact-match, schema locale e rete di linking.
- I competitor SEO/ecommerce più visibili sono estremamente productized.

**Lettura WebNovis**

- `realizzazione-siti-web-garbagnate.html` può giocarsela.
- `seo-locale-garbagnate.html` è fuori indice.
- `ecommerce-garbagnate.html` non è ancora all'altezza dei competitor che presidiano l'intento.

### Milano

**Competitor ricorrenti in top 10**

- [The Rope](https://therope.it/)
- [Artwork Studios](https://www.artworkstudios.it/)
- [CDLab](https://www.cdlab.it/)
- [Ecommerce Milano](https://www.ecommercemilano.it/)

**Fattori chiave**

- Milano è dominata da brand con siti più ampi e autoritativi.
- The Rope: 2.465 parole, 13 H2, 118 link interni, `FAQPage`.
- Artwork Studios: 2.700 parole, 129 link interni, `ProfessionalService` + `AggregateRating`.
- CDLab è molto più corto, ma compensa con forte focus brand+SEO.
- Anche qui esistono micrositi verticali come `ecommercemilano.it`, ma il brand conta molto più che nei comuni minori.

**Lettura WebNovis**

- Su Milano non basta il framework delle geo pages: servono authority, hub di servizio più forti e segnali esterni più robusti.
- `ecommerce-milano.html` è anche `noindex`, quindi oggi l'intento ecommerce Milano non è realmente presidiato.

## GAP Analysis: WebNovis vs Competitor

### 1. Exact-match local intent

**Competitor**

- URL/title/H1 iper-esatti.
- Molti domini o sottopagine dedicati per combinazione servizio+città.

**WebNovis**

- Bene su `agenzia-web-*` e `realizzazione-siti-web-*`.
- Meno incisiva su `ecommerce-*`.
- Assente in pratica su `seo-locale-*` per via del `noindex`.

**Valutazione**

- `agenzia web` / `realizzazione siti web`: **gap temporale + authority**, non prioritariamente di struttura.
- `seo`: **gap strutturale**.
- `ecommerce`: **gap strutturale/qualitativo**.

### 2. Contenuto e topic coverage

**Competitor**

- Molta variabilità: da 414-478 parole a oltre 2.700.
- Fuori Milano rankano anche pagine sottili se il matching locale è fortissimo.

**WebNovis**

- `agenzia-web-*`: buone.
- `realizzazione-siti-web-*`: buone/molto buone.
- `ecommerce-*`: troppo leggere per competere in modo stabile.
- `seo-locale-*`: leggere e noindex.

**Valutazione**

- `agenzia web` / `realizzazione siti web`: **non serve un rewrite massivo subito**.
- `ecommerce` / `seo`: **serve revisione originale**, non solo attesa.

### 3. Schema markup

**Competitor**

- Uso frequente di `LocalBusiness`, `AggregateRating`, `BreadcrumbList`.
- A Milano compaiono anche `FAQPage`, `ProfessionalService`, `OfferCatalog`.

**WebNovis**

- `LocalBusiness` e `Service` presenti.
- `FAQPage` visibile su `agenzia-web-*`.
- Nei campioni live `realizzazione-siti-web-*`, `ecommerce-*` e `seo-locale-*` **non espongono ancora `FAQPage`** nonostante il template attuale lo preveda.

**Valutazione**

- **Gap tecnico** reale: rollout/schema incompleto o output non rigenerato/pubblicato.

### 4. Internal linking

**Competitor**

- Media campione: **110 link interni/pagina**.
- Alcuni network superano **340 link interni**.

**WebNovis**

- Media sulle pagine campione: circa **44 link/pagina**.
- Buona rete interna, ma meno aggressiva dei network che presidiano ecommerce/SEO.

**Valutazione**

- **Gap qualitativo medio** su `ecommerce` e cluster SEO.
- **Non urgente** su `agenzia web` e `realizzazione siti web`.

### 5. Local trust

**Competitor**

- Phone visibile: 100% campione.
- Address / segnali locali: 92%.
- Rating schema: 32%.

**WebNovis**

- NAP e schema locale presenti.
- Base trust locale buona.

**Valutazione**

- Qui WebNovis è **allineata**. Non è il collo di bottiglia principale.

### 6. Freshness

**Competitor**

- Diversi siti mostrano last-modified recente o headers aggiornati.
- Alcune SERP includono anche URL rotti/404, segnale di scarsa qualità competitiva in alcune città.

**WebNovis**

- Pubblicazione live coerente e recente (13 aprile 2026).

**Valutazione**

- **Nessun intervento urgente** sul freshness: il sito è fresco. Serve far maturare l'indicizzazione sulle famiglie già competitive.

## Natura dei gap

### GAP STRUTTURALI / QUALITATIVI

- Tutte le `seo-locale-*` campionate sono `noindex, follow`.
- `ecommerce-*` sono mediamente troppo corte per il cluster competitivo.
- `ecommerce-milano.html` è `noindex`.
- FAQPage non visibile nei campioni live `realizzazione-siti-web-*`, `ecommerce-*`, `seo-locale-*`.

### GAP TECNICI

- Rollout schema incompleto tra template e output pubblicato.
- Presidio insufficiente di intent `seo` e parte di `ecommerce` per scelte di governance/indexation.
- Internal linking meno aggressivo dei network che oggi presidiano le query ecommerce locali.

### GAP TEMPORALI

- `agenzia-web-*`
- `realizzazione-siti-web-*`

Su queste famiglie, nei comuni periferici il sito è già abbastanza forte da non giustificare un altro giro di riscritture generalizzate. Qui la mossa giusta è lasciare sedimentare crawling, indicizzazione e authority.

## Raccomandazioni Prioritarie

### Interventi urgenti (alto impatto SEO)

1. **Rimuovere il `noindex` dalle `seo-locale-*` che si vogliono davvero far rankare**  
   Se l'obiettivo include `seo [città]`, l'asset attuale è autolimitato. Tenere `noindex` e aspettare è incoerente con il target.

2. **Decidere in modo esplicito se `ecommerce-*` è una famiglia money page o solo support page**  
   Se deve competere, va portata a livello `realizzazione-siti-web-*`: più profondità, FAQPage live, più exact-match topical coverage, più linking interno dedicato.

3. **Verificare e rigenerare/publishare lo schema FAQPage sulle service×city live**  
   Il template ora lo prevede, ma i campioni live non lo mostrano. Questo è un fix tecnico a costo relativamente basso.

4. **Costruire un linking layer specifico per SEO/ecommerce**  
   I competitor rankano spesso con hub/network. WebNovis oggi ha linking buono ma non abbastanza “spinto” sui cluster che contano.

### Interventi da pianificare (medio impatto)

1. **Rendere le `ecommerce-*` molto più differenziate e commerciali**  
   Non solo contesto locale, ma:
   - casi d'uso ecommerce per città
   - stack/feature
   - checkout, catalogo, pagamenti, CRM
   - FAQ specifiche ecommerce
   - blocchi trust e deliverable

2. **Aggiungere segnali di proof / rating dove legalmente e realmente sostenibili**  
   I competitor usano spesso `AggregateRating`. Non va copiato se non supportato, ma è un segnale che in SERP esiste.

3. **Per Milano, rafforzare hub e authority invece di spingere solo geo pages**  
   Qui servono pagine madre di servizio più forti, asset editoriali, brand coverage e link earning.

### Lascia stare (già ottimale o quasi, serve tempo Google)

1. `agenzia-web-*` nei comuni dell'hinterland  
2. `realizzazione-siti-web-*` nei comuni dell'hinterland  
3. freshness / recency tecnica del sito  
4. NAP locale di base e LocalBusiness markup

## Appendice Dati

### Campione competitor page-level

| Città | Competitor | URL | Word count | H2 | Link interni | Rating schema | Note |
|---|---|---|---:|---:|---:|---|---|
| Rho | Digital Monkey | [link](https://www.digital-monkey.it/realizzazione-siti-web-rho/) | 1.400 | 12 | 49 | No | Local page strutturata |
| Rho | SITI srl | [link](https://www.sitisrl.it/seo-agency-rho) | 858 | 3 | 43 | Sì | SEO page molto esatta |
| Sesto S.G. | Lumiaweb | [link](https://www.lumiaweb.com/web-agency-sesto-san-giovanni-realizzazione-siti-web-sesto-san-giovanni/) | 996 | 9 | 33 | No | Title/H1 perfetti |
| Sesto S.G. | OkSEO | [link](https://www.okseo.it/agenzia-seo-sesto-san-giovanni/) | 916 | 7 | 75 | No | SEO specialist verticale |
| Sesto S.G. | Realizzazione Ecommerce | [link](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-sesto-san-giovanni.html) | 2.160 | 1 | 343 | No | Network altamente interlinkato |
| Cinisello | Dbeeta | [link](https://www.dbeeta.it/) | 7.867 | 2 | 2 | No | Homepage/local brand, outlier |
| Cinisello | Skylead | [link](https://www.skylead.it/creazione-siti-web-a-cinisello-balsamo-realizzazione-siti-web/) | 975 | 13 | 1 | Sì | `AggregateRating` |
| Cinisello | Realizzazione Ecommerce | [link](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-cinisello-balsamo.html) | 2.118 | 1 | 343 | No | Pattern network |
| Parabiago | Siti Web Parabiago | [link](https://www.sitiweb-parabiago.it/) | 477 | 0 | 0 | No | Exact-match domain molto sottile |
| Parabiago | Digital Monkey | [link](https://www.digital-monkey.it/realizzazione-siti-web-parabiago/) | 1.388 | 12 | 49 | No | Pagina meglio strutturata |
| Parabiago | AgenziaWebSEO | [link](https://agenziawebseo.it/servizi-web/consulente-seo-web/lombardia/milano/parabiago/) | 1.054 | 7 | 67 | No | Forte verticalità SEO |
| Parabiago | Realizzazione Ecommerce | [link](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-parabiago.html) | 2.076 | 1 | 343 | No | Network |
| Arese | Ecommerce Milano | [link](https://www.ecommercemilano.it/realizzazione-ecommerce-arese.html) | 1.580 | 5 | 97 | Sì | LocalBusiness + rating |
| Arese | SITI srl | [link](https://www.sitisrl.it/seo-agency-arese) | 858 | 3 | 43 | Sì | SEO page productized |
| Lainate | Digital Monkey | [link](https://www.digital-monkey.it/realizzazione-siti-web-lainate/) | 1.381 | 12 | 49 | No | Local page forte |
| Lainate | Inrete Digital | [link](https://marketing.inretedigital.it/realizzazione-e-sviluppo-siti-web-lainate/) | 1.319 | 12 | 51 | No | Copertura molto simile a DM |
| Lainate | Progettazione Ecommerce | [link](https://www.progettazione-ecommerce.eu/progettazione-e-commerce-lainate.html) | 2.157 | 1 | 348 | Sì | Network + rating |
| Lainate | Siti Web Lainate | [link](https://www.sitiweb-lainate.it/) | 478 | 0 | 0 | No | Exact-match domain sottile |
| Garbagnate | Realizzazione Ecommerce | [link](https://www.realizzazione-ecommerce.eu/realizzazione-e-commerce-garbagnate-milanese.html) | 2.118 | 1 | 343 | No | Network |
| Garbagnate | SITI srl | [link](https://www.sitisrl.it/seo-agency-garbagnate-milanese) | 872 | 3 | 43 | Sì | SEO product page |
| Milano | The Rope | [link](https://therope.it/) | 2.465 | 13 | 118 | No | FAQPage, brand + breadth |
| Milano | Artwork Studios | [link](https://www.artworkstudios.it/) | 2.700 | 6 | 129 | Sì | ProfessionalService + rating |
| Milano | CDLab | [link](https://www.cdlab.it/) | 781 | 3 | 59 | No | Brand SEO agency |
| Milano | Ecommerce Milano | [link](https://www.ecommercemilano.it/) | 414 | 4 | 76 | Sì | Microsito verticale |

### Query note

- Per Rho, le query nude `seo rho` ed `ecommerce rho` hanno restituito SERP fortemente rumorose su motori pubblici; il set competitor è stato quindi confermato con `agenzia seo rho` e `realizzazione ecommerce rho`.
- Lo stesso pattern di rumore è comparso in parte su Arese e su alcune query Milano molto generiche.

### Sorgenti principali utilizzate

- WebNovis live:
  - [Homepage](https://www.webnovis.com/)
  - [Agenzia Web Rho](https://www.webnovis.com/agenzia-web-rho.html)
  - [Realizzazione Siti Web Rho](https://www.webnovis.com/realizzazione-siti-web-rho.html)
  - [SEO Locale Rho](https://www.webnovis.com/seo-locale-rho.html)
  - [robots.txt](https://www.webnovis.com/robots.txt)
  - [sitemap.xml](https://www.webnovis.com/sitemap.xml)
- Governance/codebase:
  - [config/pseo-governance.js](/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro%20-%20backup/config/pseo-governance.js:1)
  - [scripts/generate-all-geo.js](/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro%20-%20backup/scripts/generate-all-geo.js:1634)
  - [templates/servizio-citta-content.njk](/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro%20-%20backup/templates/servizio-citta-content.njk:1)
- SERP sample pages:
  - [web agency rho](https://html.duckduckgo.com/html/?q=web%20agency%20rho)
  - [realizzazione siti web rho](https://html.duckduckgo.com/html/?q=realizzazione%20siti%20web%20rho)
  - [realizzazione siti web sesto san giovanni](https://html.duckduckgo.com/html/?q=realizzazione%20siti%20web%20sesto%20san%20giovanni)
  - [agenzia seo arese](https://html.duckduckgo.com/html/?q=agenzia%20seo%20arese)
  - [realizzazione ecommerce lainate](https://html.duckduckgo.com/html/?q=realizzazione%20ecommerce%20lainate)
