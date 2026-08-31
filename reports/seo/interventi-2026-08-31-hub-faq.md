# Interventi SEO — Hub /realizzazione-siti-web/ + FAQ + coerenza prezzi

Data: 2026-08-31 · Ambito: verifica + correzioni minime · Nessun deploy, nessuna pagina nuova

---

## TASK 1 — Audit realizzazione-siti-web/index.html

### a) Prezzi €500 / €1.200 / €3.500 → PRESENTI e coerenti ✅
- Meta description, OG, Twitter card: "landing da €500, siti aziendali da €1.200 ed e-commerce da €3.500".
- Body (intro con `<strong>`): "landing page da **€500**, siti aziendali da **€1.200** ed e-commerce da **€3.500**".
- Tabella prezzi dedicata (`hub-table`, h2 "Creazione siti web in Lombardia: soluzione, prezzo di partenza e obiettivo"):
  - Landing page focalizzata su un solo obiettivo → **€500** → link `/landing-page-milano.html`
  - Sito aziendale / sito vetrina custom → **€1.200** → link `/servizi/sviluppo-web.html`
  - Sito e-commerce con checkout e SEO tecnica → **€3.500** → link `/servizi/ecommerce.html`
- Nota prezzi: "Le cifre sono prezzi di partenza pubblicati da WebNovis, IVA esclusa."
- Nessun blocco prezzi da aggiungere: gap prezzi = NESSUNO.

### b) Caso studio con numeri → ASSENTE ❌ (gap da registrare)
- Nessuna sezione "caso studio"/risultati numerici nel body (i % trovati sono solo CSS). Le uniche cifre sono prezzi e abitanti dei comuni.
- GAP: il Master richiede 1 caso studio numerico → da creare/validare col cliente (NON inventato).

### c) FAQ reali nel body → 4 domande ✅ (h2 "Domande frequenti sulla realizzazione di siti web in Lombardia", markup `<details>/<summary>` in `.hub-faq`)
1. **Quanto costa realizzare un sito web in Lombardia?** → "Le fasce indicative WebNovis partono da €500 per una landing page, €1.200 per un sito vetrina e €3.500 per un e-commerce. Funzioni, contenuti, integrazioni e numero di pagine determinano il preventivo finale."
2. **Realizzate siti web anche fuori dalla provincia di Milano?** → "Sì. WebNovis ha sede a Rho e segue direttamente l'area metropolitana di Milano, ma realizza siti per aziende nel resto della Lombardia e può gestire briefing, revisioni e consegne anche da remoto."
3. **La SEO è inclusa nella realizzazione del sito?** → "Il progetto include le basi tecniche concordate, come struttura semantica, metadata, performance, indicizzabilità e dati strutturati pertinenti. Il posizionamento dipende anche da contenuti, concorrenza e autorevolezza e non viene garantito."
4. **WebNovis usa WordPress o template preconfezionati?** → "L'offerta WebNovis descritta in questa pagina usa codice custom senza WordPress e senza template preconfezionati. Tecnologie, funzioni e modalità di gestione vengono confermate nel perimetro del progetto."
- Il JSON-LD FAQPage esistente (4 Question) è già allineato 1:1 al body → l'agente schema non deve aggiungere nulla qui.

### d) Link pagine comuni → PRIMA 18/41 (visivamente 17, vedi fix), DOPO **41/41** ✅
- Comuni esistenti su disco (41 file `realizzazione-siti-web-*.html` in root): arese, arluno, baranzate, bareggio, bollate, bresso, buccinasco, caronno-pertusella, castellanza, cerro-maggiore, cesano-boscone, cesate, cinisello-balsamo, cormano, cornaredo, corsico, cusago, garbagnate, lainate, legnano, limbiate, magenta, milano-nord, milano-ovest, nerviano, novate-milanese, origgio, paderno-dugnano, parabiago, pero, pogliano-milanese, pregnana-milanese, rescaldina, rho, saronno, senago, sesto-san-giovanni, settimo-milanese, solaro, trezzano-sul-naviglio, vanzago.
- Griglia principale pre-esistente: 18 card (rho, lainate, arese, garbagnate, bollate, senago, arluno, parabiago, buccinasco, cormano, magenta, legnano, castellanza, milano-ovest, solaro, origgio, caronno-pertusella, limbiate).
- Fix applicato: aggiunta seconda griglia compatta (classi CSS `hub-city-grid--compact` / `hub-city-card--sm` già presenti nel CSS inline della pagina ma inutilizzate) con le **23 card mancanti** (ordine alfabetico, dati nome/provincia/minuti da `data/cities.json`, immagini `Img/cities/*.webp` tutte esistenti): baranzate, bareggio, bresso, cerro-maggiore, cesano-boscone, cesate, cinisello-balsamo, cornaredo, corsico, cusago, milano-nord, nerviano, novate-milanese, paderno-dugnano, pero, pogliano-milanese, pregnana-milanese, rescaldina, saronno, sesto-san-giovanni, settimo-milanese, trezzano-sul-naviglio, vanzago.
- JSON-LD CollectionPage allineato: description "i 17 comuni" → "i 41 comuni", `numberOfItems` 17 → 41, `hasPart` esteso da 17 a 41 WebPage (1:1 coi file su disco), `dateModified` → 2026-08-31.
- Validazione: 41 card distinte in body, 0 duplicati, 0 file non linkati, 0 link verso file inesistenti, 4 blocchi JSON-LD tutti validi.

### e) CTA preventivo → PRESENTI ✅ (nessun fix necessario)
- Hero: `<a href="/preventivo.html" class="btn btn-large btn-primary">` "Richiedi preventivo gratuito".
- Sezione finale "Pronto a realizzare il tuo sito web?": `btn btn-large btn-primary` → /preventivo.html e /contatti.html.
- Nav (`nav-link nav-cta` → /preventivo.html) e footer (preventivo + contatti + tel:+393802647367 + mailto:hello@webnovis.com).

### f) Meta attuali (registrati, NON toccati — title di Fase 2 è di altro agente)
- **Title**: `Realizzazione Siti Web Lombardia: Prezzi e Comuni | WebNovis`
- **Description**: `Realizzazione siti web in Lombardia per PMI: landing da €500, siti aziendali da €1.200 ed e-commerce da €3.500. Codice custom, SEO tecnica e sede a Rho.`
- H1 (unico): "Realizzazione Siti Web in Lombardia per Aziende e Professionisti".

---

## TASK 2 — FAQ home (index.html) — verifica, NESSUNA modifica

Il claim Master è confermato: **2 blocchi FAQ visibili** (9 domande totali).

**Blocco 1** — sezione servizi ("le risposte alle domande più comuni dei nostri clienti"), 5 domande:
1. Quali servizi offre WebNovis?
2. Quanto costa un sito web?
3. Quanto tempo ci vuole per realizzare un progetto?
4. Offrite supporto dopo il lancio del sito?
5. Lavorate anche da remoto?

**Blocco 2** — sezione "Domande frequenti" ("Risposte rapide alle domande più comuni su web agency e preventivi"), 4 domande:
6. Quanto costa un sito web professionale?
7. Quanto tempo ci vuole per realizzare un sito web?
8. Perché scegliere una web agency invece di un template?
9. Lavorate solo a Milano o anche in altre zone?

Note per l'agente FAQPage schema:
- Il JSON-LD `#faq-home` esistente contiene SOLO le 4 domande del blocco 2 → il blocco 1 (5 domande) è senza schema.
- Quasi-duplicati da gestire: Q2≈Q6 ("Quanto costa un sito web" vs "…professionale", stesse cifre) e Q3≈Q7 (stesse tempistiche).

---

## TASK 3 — Coerenza prezzi sitewide (solo grep, nessuna cifra modificata)

Valori attesi: €500 landing / €1.200 vetrina / €3.500 e-commerce.

| File | €500 | €1.200 | €3.500 | Altre cifre presenti (contesto) | Esito |
|---|---|---|---|---|---|
| index.html (home) | ✅ (4×) | ✅ (4×) | ✅ (4×) | €5.000/€3.000/€1.000 = sole opzioni budget del form preventivo multi-step | OK |
| preventivo.html | ✅ (2×) | ✅ (2×) | ✅ (2×) | Schema Service `offers`: 500/1200/3500 ✓; €300 SMM/mese, €250, €2.000, €10.000 = altri servizi/budget | OK |
| realizzazione-siti-web/index.html | ✅ (7×) | ✅ (7×) | ✅ (7×) | — (prezzi, meta, FAQ e schema allineati) | OK |
| servizi/sito-vetrina.html | — | ✅ (4×) | — | €59/mese manutenzione extra | Gap minore: 500/3.500 non citati (pagina di servizio, non bloccante) |
| servizi/sviluppo-web.html | ✅ (3×) | ✅ (3×) | ✅ (3×) | Pacchetti/piani: €1.990–€2.990/anno, €299, €598, €150–€400 ecc. | OK |
| servizi/accessibilita.html | — | — | — | Audit da €350, adeguamento da €990 (fino a €2.500+), monitoraggio €69/mese | Gap prezzi core; cifre = altro servizio |
| servizi/seo-milano.html | ⚠️ (6×) | ✅ (1×) | ✅ (1×) | **€500 = "Google Ads da €500/mese"** (non landing!); SEO €400/mese, consulenze €80 | ⚠️ Incoerenza semantica da validare |
| servizi/social-media.html | ✅ (1×) | ⚠️ (1×) | — | **€1.200 = badge "Risparmi €1.200 all'anno"** (non sito vetrina!); piani €300–€6.000 | ⚠️ Incoerenza semantica da validare |
| servizi/consulenze.html | — | — | — | €80–€250 (consulenze/ora) | Gap prezzi core (atteso per il servizio) |
| servizi/graphic-design.html | ✅ (3×) | — | — | Piano "Design Premium" da €499/mese, €1.490–€4.990/anno, €998/€598 | €499 vs €500 adiacenti: da validare col cliente |
| servizi/audit-gratuito.html | — | — | — | nessun prezzo | OK (pagina audit gratuito) |

**Incoerenze da validare col cliente (nessuna cifra corretta senza conferma):**
1. `servizi/seo-milano.html`: "€500" usato per **Google Ads da €500/mese** → stesso valore del prezzo landing page: rischio ambiguità per estrattori di prezzi/AI.
2. `servizi/social-media.html`: "€1.200" usato come **risparmio annuale** di un piano → stesso valore del prezzo sito vetrina: rischio ambiguità.
3. `servizi/graphic-design.html`: piano a **€499/mese** accanto a €500 (landing) → cifre quasi identiche con significati diversi.
4. `servizi/accessibilita.html`: **€2.500+** (adeguamento accessibilità) → cifra diversa ma per servizio diverso; solo da non confondere con le fasce siti.
5. Osservazione dati (non prezzi): nel hub la card Lainate della griglia principale mostra "18.000 ab." mentre `data/cities.json` riporta 26.000; inoltre "8000 ab." (Origgio) senza separatore migliaia. Da validare, NON corretto.

**Nessuna occorrenza di prezzi siti con cifre diverse** (es. €800 vetrina o €2.500 e-commerce): le tre fasce core sono coerenti ovunque compaiono.

---

## TASK 4 — preventivo.html e contatti.html

| Check | preventivo.html | contatti.html |
|---|---|---|
| Esiste | ✅ | ✅ |
| H1 singolo | ✅ 1 ("Raccontaci il Tuo Progetto, …") | ✅ 1 ("Parliamo del Tuo …") |
| mailto | ✅ 2× `mailto:hello@webnovis.com` | ✅ 2× `mailto:hello@webnovis.com` |
| tel | ✅ 2× `tel:+393802647367` | ✅ 2× `tel:+393802647367` |
| Link rotti | nessuno trovato → nessun fix | nessuno trovato → nessun fix |

---

## Fix applicati (riepilogo)

Tutti e soli su `realizzazione-siti-web/index.html`:
1. Aggiunta griglia compatta con 23 card comuni mancanti (struttura CSS pre-esistente `hub-city-card--sm`/`hub-city-grid--compact`; dati e immagini dal sito stesso).
2. JSON-LD CollectionPage: description "i 17 comuni" → "i 41 comuni"; `numberOfItems` 17 → 41; `hasPart` 17 → 41 WebPage; `dateModified` → 2026-08-31.
3. Nessun tocco a title/description, prezzi, FAQ, CTA (già corretti), né ad altri file.

## Gap registrati (da gestire in fase successiva / col cliente)
- Hub: 1 caso studio numerico assente (Master lo richiede).
- Home: blocco FAQ 1 (5 domande) senza JSON-LD FAQPage + 2 coppie di domande quasi-duplicate.
- Prezzi core assenti su: sito-vetrina (500/3.500), accessibilita (tutti), consulenze (tutti), graphic-design (1.200/3.500), social-media (3.500) — pagine di servizio, valutare se citare le fasce.
- Incoerenze semantiche €500/€1.200/€499 su seo-milano, social-media, graphic-design.
