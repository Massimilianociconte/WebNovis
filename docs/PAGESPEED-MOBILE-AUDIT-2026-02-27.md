# Audit Prestazioni Mobile — WebNovis

**Data audit:** 27/02/2026 18:11 CET  
**Ambiente test (Lighthouse):** Mobile, Moto G Power emulato, Slow 4G, sessione singola homepage  
**Scope:** Analisi diagnostica della codebase e dell’infrastruttura **solo mobile**, senza modifiche al codice.

---

## 1) Snapshot KPI (dal report fornito)

- **Performance:** 67
- **FCP:** 2.9s
- **LCP:** 5.2s
- **TBT:** 30ms
- **CLS:** 0.179
- **Speed Index:** 3.7s

### Lettura rapida

- **CPU blocking non è il problema principale** (TBT molto basso).
- Il problema principale è una combinazione di:
  1. **ritardo di rendering LCP** (hero text)
  2. **instabilità visiva (CLS) in hero**
  3. **rendering/animazioni costose su mobile**
  4. **cache effettiva in produzione non allineata all’intento del codice**

---

## 2) Executive summary (mobile-only)

La homepage mobile è visivamente ricca e molto animata. Questo crea un’esperienza premium lato brand, ma su rete/CPU mobile porta a:

- comparsa ritardata del contenuto principale (LCP alto)
- micro e macro-shift percepibili in hero (CLS 0.179)
- fluidità non costante durante le prime fasi di interazione

### Root cause dominante

Il tuo LCP è un **H1 hero testuale** (non un’immagine), quindi il collo di bottiglia è soprattutto il tempo necessario a “stabilizzare” layout + stili + font + script, non il download di un’immagine.

Evidenze chiave:
- LCP element: `<h1 class="hero-title">` (report)
- catena critica con CSS/font/script (report)
- aggiornamenti dinamici larghezza/testo in hero via JS e CSS (vedi riferimenti sotto)

---

## 3) Evidenze tecniche (codebase)

## 3.1 CSS e render path above-the-fold

- CSS critico bloccante: `style.min.css` (report; link presente in homepage minificata).
- Diversi fogli stile vengono caricati con pattern `media="print" onload="this.media='all'"` (defer CSS), tra cui `revolution`, `nicole-inspired`, `search`, ecc. (homepage minificata, linea unica @index.html#1-1).
- In hero ci sono effetti pesanti mobile:
  - glow/overlay con blur e animazione in pseudo-elemento (`.hero::before`) @css/style.css#5823-5839
  - shimmer testo e glow CTA in loop @css/style.css#5757-5771, @css/style.css#5893-5902, @css/style.css#5939-5948
- Overlay hero base anche in `revolution.css` @css/revolution.css#14-26

**Impatto mobile:** più passaggi di style/paint/compositing durante la finestra critica del LCP.

---

## 3.2 Instabilità CLS in hero

Il report attribuisce gran parte del CLS a `section.hero > ::before` e segnala anche shift del wrapper parole rotanti.

Contributori plausibili confermati da codice:

1. **Wrapper parole rotanti con larghezza dinamica**
   - Update JS periodico larghezza wrapper in base alla parola attiva @js/main.js#1405-1426
   - Rotazione ogni 2.5s @js/main.js#1413-1426
2. **Morphing text con resize container e blur**
   - Misurazione `offsetWidth` + `container.style.width` @js/text-effects.js#85-88, @js/text-effects.js#101-114
   - Cambio periodico ogni 3s @js/text-effects.js#127-127
3. **Testo reveal con opacità minima 0.12** (impatto anche accessibilità/leggibilità)
   - CSS @css/nicole-inspired.css#1196-1199
   - JS set dinamico opacità @js/text-effects.js#44-48

**Impatto UX mobile:** salto visivo nella zona più importante della pagina (hero), perdita di “stabilità percepita”, rischio tap errati.

---

## 3.3 Forced reflow / layout thrashing (diagnostica Lighthouse)

Lighthouse segnala forced reflow con origine principale in `main.min.js`, `text-effects.min.js`, `globe.min.js`.

Punti coerenti in sorgente:

- `getBoundingClientRect()` in logiche scroll/frame @js/main.js#177-178
- calcolo altezze + margini feed (`offsetHeight` + `getComputedStyle`) @js/main.js#697-701
- width dinamica hero rotating @js/main.js#1405-1408
- text effects: `getBoundingClientRect` e `offsetWidth` @js/text-effects.js#29-31, @js/text-effects.js#85-88
- globe: `offsetWidth` + aggiornamento dimensioni render @js/globe.js#21-29, @js/globe.js#47-53

**Impatto UX mobile:** micro-jank in scroll e durante animazioni iniziali.

---

## 3.4 DOM size e lavoro runtime

Report: ~1376 elementi DOM.

Contributori:
- homepage molto ricca (molte sezioni/componenti)
- auto-clonazione feed social su desktop (non mobile) @js/main.js#703-709
- numerose osservazioni/interazioni attive in `main.js` (molti observer/event loop) @js/main.js#11-21, @js/main.js#131-143, @js/main.js#219-225, @js/main.js#675-683

**Nota mobile:** la clonazione feed è desktop-only, ma il resto del carico JS/CSS resta rilevante anche su mobile.

---

## 3.5 Terze parti

### DesignRush widget
- Script esterno incluso direttamente in homepage @index.html#267-267
- Lighthouse segnala:
  - immagini widget senza width/height
  - asset esterni (font/svg/widget) che contribuiscono a transfer/CLS

**Impatto UX mobile:** variabilità del layout nella zona widget e costo rete extra.

### ESM/CDN per globe
- Import dinamico `https://esm.sh/cobe@0.6.3` @js/globe.js#11-12
- Catena dipendenze terza parte (report: `esm.sh`, `phenomenon`, `cobe`)

**Impatto UX mobile:** richieste e parsing extra, non critiche ma evitabili nella fase iniziale.

### Chat keep-alive
- ping periodico + wake-up immediato @js/chat.js#607-614

**Impatto UX mobile:** una richiesta di rete in più all’avvio e polling periodico (basso impatto singolo, ma costante).

---

## 3.6 Caching: mismatch tra intenzione codice e comportamento rilevato

Lighthouse riporta cache TTL ~4h per molti asset.

Nel backend Node, in produzione, hai impostazioni molto più aggressive:
- static asset immutable 1 anno @server.js#283-299
- HTML breve @server.js#317-333

Nel repo è presente anche `_headers` che dichiara cache lunga, ma è esplicitamente documentale/non eseguito automaticamente in alcuni deployment @ _headers#1-5.

**Conclusione:** l’header policy effettiva in produzione non coincide con la policy “desiderata” nel codice/documentazione.

**Impatto UX mobile:** ritorni utente meno veloci del potenziale; penalizzazione FCP/SI repeat visits.

---

## 3.7 Accessibilità correlata alla performance (mobile)

### Skip link non funzionante
- Link generato verso `#main` ma main reale è `id="main-content"`
- Generatore skip-link: `href="#main"` @scripts/add-skip-to-content.js#4-5, @scripts/add-skip-to-content.js#17-17
- Main reale in homepage: `<main id="main-content">` (homepage minificata, evidenza runtime; file @index.html#1-1)

**Impatto UX:** navigazione tastiera/screen reader peggiorata; audit a11y penalizzato.

### Contrasto ridotto nel text reveal
- opacità minima 0.12 per parole @css/nicole-inspired.css#1196-1199 e @js/text-effects.js#47-48

**Impatto UX mobile:** leggibilità ridotta su dispositivi con luminosità/contrasto non ottimali.

---

## 4) Mappa problemi -> causa -> effetto UX -> intervento

| Priorità | Problema | Causa principale | Effetto su UX mobile | Tipo intervento |
|---|---|---|---|---|
| P0 | LCP 5.2s (hero text) | Render delay: CSS/animazioni/font/script sopra la piega | Hero percepita lenta, "pagina pesante" | Critical rendering path |
| P0 | CLS 0.179 | Hero dinamica (width/blur/overlay/transizioni) | Salti visivi nel punto di conversione | Stabilizzazione layout |
| P1 | Cache inefficiente (TTL 4h) | Policy edge/proxy non allineata a server.js/_headers | Repeat visits meno rapide | Infra/cache governance |
| P1 | Forced reflow | Misure layout frequenti + update stile runtime | Jank sottile in scroll/interazioni | JS scheduling/layout discipline |
| P1 | Terze parti widget | DesignRush + asset senza dimensioni | CLS locale + costo rete | Third-party budget |
| P2 | Non-composited animations | animazioni su box-shadow/filter/background-position | GPU/paint cost su device lenti | Motion optimization |
| P2 | A11y skip/contrast | skip target mismatch + opacity reveal aggressiva | usabilità/leggibilità ridotte | A11y hardening |

---

## 5) Impatto su UX, grafica e fluidità (in pratica)

## Hero (impatto massimo)

- **UX:** l’utente vede il titolo tardi e con micro-riposizionamenti.
- **Grafica:** effetto premium presente, ma su mobile appare meno "solido".
- **Fluidità:** animazioni + blur + width changes possono risultare "nervose" su fascia media/bassa.

## Navigazione e scansione contenuto

- **UX:** layout shift nel primo viewport riduce fiducia e orientamento.
- **Grafica:** feed/widget esterni aggiungono variabilità visiva non controllata.
- **Fluidità:** i long task non sono drammatici, ma la sensazione è comunque di caricamento non immediato.

## Interazioni post-load

- **UX:** TBT buono, quindi input non è gravemente bloccato.
- **Grafica/Fluidità:** restano piccoli jank legati a reflow e animazioni non composite.

---

## 6) Piano di risoluzione (senza stravolgere la piattaforma)

## Fase 1 — Quick wins ad alto impatto (P0)

1. **Stabilizzare hero per CLS**
   - congelare dimensioni min/max delle aree testuali dinamiche
   - evitare resize frequenti del wrapper in viewport iniziale
   - ridurre/ritardare effetti blur/shimmer in above-the-fold mobile
2. **Ridurre render delay LCP**
   - minimizzare stili/animazioni non indispensabili nel primo viewport mobile
   - limitare lavoro JS nei primi secondi (soprattutto hero-related)

**Impatto atteso:** LCP -0.8s / -1.5s, CLS < 0.1.

## Fase 2 — Runtime discipline (P1)

1. Audit puntuale delle letture layout (`offset*`, `getBoundingClientRect`) in loop/interval.
2. Batch read/write e posticipo logiche non critiche dopo first paint.
3. Gating più aggressivo delle animazioni decorative in mobile/reduced-motion.

**Impatto atteso:** fluidità più costante, minori warning forced reflow.

## Fase 3 — Governance asset e terze parti (P1)

1. Allineare cache policy effettiva di produzione all’obiettivo (immutable assets).
2. Spostare widget terzi non critici fuori dalla finestra LCP (lazy/idle/interaction).
3. Definire budget terze parti (peso, tempo, variabilità layout).

**Impatto atteso:** repeat visits più veloci, minori regressioni impreviste.

## Fase 4 — A11y/perf hygiene (P2)

1. Correggere skip link target (`#main` vs `#main-content`).
2. Ribilanciare opacità text reveal per contrasto mobile.

---

## 7) Backlog AI-ready (strutturato)

```yaml
audit_scope: mobile_homepage
priority_order:
  - id: PERF-MOB-001
    area: hero
    issue: high_lcp_render_delay
    intervention_type: critical_rendering_path
    effort: medium
    expected_impact: high
    confidence: high
    evidence:
      - "@css/style.css#5823-5839"
      - "@css/style.css#5893-5902"
      - "@js/main.js#1405-1426"
  - id: PERF-MOB-002
    area: hero
    issue: cls_instability
    intervention_type: layout_stabilization
    effort: medium
    expected_impact: high
    confidence: high
    evidence:
      - "@js/main.js#1405-1426"
      - "@js/text-effects.js#101-114"
      - "@css/nicole-inspired.css#1212-1245"
  - id: PERF-MOB-003
    area: infrastructure
    issue: cache_ttl_mismatch
    intervention_type: caching_governance
    effort: low
    expected_impact: medium
    confidence: high
    evidence:
      - "@server.js#283-333"
      - "@_headers#1-5"
  - id: PERF-MOB-004
    area: runtime_js
    issue: forced_reflow_patterns
    intervention_type: js_layout_discipline
    effort: medium
    expected_impact: medium
    confidence: medium_high
    evidence:
      - "@js/main.js#177-178"
      - "@js/main.js#697-701"
      - "@js/text-effects.js#29-31"
  - id: PERF-MOB-005
    area: third_party
    issue: designrush_layout_variability
    intervention_type: third_party_budgeting
    effort: low_medium
    expected_impact: medium
    confidence: high
    evidence:
      - "@index.html#267-267"
  - id: PERF-MOB-006
    area: accessibility
    issue: skip_link_broken_target
    intervention_type: semantic_accessibility
    effort: low
    expected_impact: low_medium
    confidence: high
    evidence:
      - "@scripts/add-skip-to-content.js#4-5"
      - "@scripts/add-skip-to-content.js#17-17"
```

---

## 8) Ordine consigliato di implementazione (operativo)

1. **P0:** Hero stability + LCP render delay
2. **P1:** Cache effective policy + forced reflow audit
3. **P1:** Terze parti (DesignRush/esm/chat wakeup) con budget
4. **P2:** Accessibilità (skip-link + contrast)

---

## 9) Conclusione

Il punteggio 67 mobile è coerente con una homepage molto scenografica ma densamente animata. La base tecnica è solida lato TBT (30ms), quindi il miglioramento più rapido e incisivo passa da:

- stabilità e semplificazione del **primo viewport**
- riduzione delle mutazioni layout in hero
- allineamento della **cache reale** di produzione
- controllo più rigoroso delle dipendenze terze parti

Con queste azioni, senza cambiare architettura del sito, è realistico portare mobile performance in fascia sensibilmente superiore mantenendo identità visiva.
