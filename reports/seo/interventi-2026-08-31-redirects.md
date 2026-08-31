# Interventi SEO — Redirect P0 e link interni — 31/08/2026

Ambito: `_redirects`, link interni HTML, sitemap.xml, indici search, llms*.txt / ai.txt.
Nessun deploy eseguito. Directory vietate (node_modules, dist, .git, src, config, data) non toccate.

---

## ⚠️ ANOMALIA CRITICA — refuso "casta" → "casta" NON esiste, il doppione reale è "costa"

Il task indicava `quanto-casta-un-sito-web/`. Verifiche live (curl, 31/08 ~17:30):

| URL | Esito live |
|---|---|
| `/quanto-casta-un-sito-web/` | 404 |
| `/quanto-casta-un-sito-web/index.html` | 404 |
| `/blog/quanto-casta-un-sito-web.html` | 404 (target proposto inesistente!) |
| `/quanto-costa-un-sito-web/` | **404** (manca rewrite directory — stesso sintomo descritto) |
| `/quanto-costa-un-sito-web/index.html` | **200** |
| `/blog/quanto-costa-un-sito-web.html` | **200** — articolo reale (versione "più forte") |

Il doppione directory esiste in locale (`quanto-costa-un-sito-web/index.html`, canonical self-referente) ed è in sitemap.xml. L'intervento di consolidamento è stato applicato alla variante reale **costa**: redirect dir + /index.html → `/blog/quanto-costa-un-sito-web.html`, rimozione da sitemap e da generate-sitemap.js. Regola letterale "casta" NON aggiunta: sorgente e target inesistenti (sarebbe un 301 verso 404 per URL mai esistito).

## TASK 1 — Patch `_redirects`

Sostituzioni/inserimenti (ordine statico → splat preservato, commenti esistenti intatti):

```
# --- 301 P0 audit 31/08 ---                                  [NUOVO BLOCCO]
/quanto-costa-un-sito-web/ /blog/quanto-costa-un-sito-web.html 301
/quanto-costa-un-sito-web/index.html /blog/quanto-costa-un-sito-web.html 301
/servizi/fotografia-aziendale.html /servizi/graphic-design.html 301
/blog/ottimizzazione-immagini-web /blog/ottimizzazione-immagini-web.html 301

/consulenza-digitale-* /consulenze-:splat 301   →   /consulenza-digitale-* /servizi/consulenze.html 301   [SOSTITUITA — elimina catena 2 hop]
```

Note:
- `/quanto-casta-un-sito-web/ → /blog/quanto-casta-un-sito-web.html 301`: **NON aggiunta** (vedi anomalia).
- `/templates/base-pages/(.*)`: nessun redirect aggiunto (403 accettabile), solo registrazione.
- Nota deploy: `_redirects` è attivo solo su Workers Assets; su origine GitHub Pages le regole vanno duplicate come Cloudflare Single Redirects di zona (già dokumentato in coda al file).

Verifica sitemap pre-patch (condizione del Master): `rg "quanto-casta-un-sito-web/" sitemap.xml` → **0 match**. Per la variante reale "costa" la directory ERA presente in sitemap (vedi Task 3).

## TASK 2 — Link interni corretti (7)

| File | Old | New |
|---|---|---|
| servizi/sviluppo-web.html | `../quanto-costa-un-sito-web/index.html` | `/blog/quanto-costa-un-sito-web.html` |
| servizi/sviluppo-web.html | `/quanto-costa-un-sito-web/` (anchor "preventivo gratuito") | `/blog/quanto-costa-un-sito-web.html` |
| servizi/sviluppo-web.html | `/quanto-costa-un-sito-web/` (anchor "Prezzi di catalogo per un sito web") | `/blog/quanto-costa-un-sito-web.html` |
| servizi/seo-milano.html | `/quanto-costa-un-sito-web/index.html` | `/blog/quanto-costa-un-sito-web.html` |
| servizi/seo-milano.html | `/quanto-costa-un-sito-web/` | `/blog/quanto-costa-un-sito-web.html` |
| blog/sito-web-che-non-converte.html | `../quanto-costa-un-sito-web/` | `/blog/quanto-costa-un-sito-web.html` |
| blog/quanto-costa-un-sito-web.html | `/quanto-costa-un-sito-web/` (anchor "quanto costa un sito web") | `/preventivo.html` — **deviazione**: il mapping standard avrebbe creato un self-link (l'articolo È il target del redirect) |

Pattern cercati con esito 0 (nessuna modifica necessaria): `href` verso `/dist/`, `consulenza-digitale-*` (unico match = query param valido `contatti.html?servizio=consulenza-digitale`), `servizi/fotografia-aziendale.html`, `accessibilita-rho.html` (solo self-canonical nella pagina legacy 301-ata, non toccato), `social-media-rho.html` (idem), `chiedere-recensioni-clienti` senza `/blog/` (i match hanno `.html` e risolvono correttamente da blog/), `href="/blog/[slug]"` senza `.html` (regex eseguita: 0 match), `templates/base-pages` (0 match nei pubblicati), `quanto-casta` (0 match ovunque), `blog/ottimizzazione-immagini-web` senza `.html` (0 match, solo versioni .html).

Link verificati e lasciati invariati (corretti): `/zone-servite/#fotografia-aziendale` (200 + rewrite), link relativi blog/*.html, canonical/og:url self-referenti delle pagine legacy 301-ate (fuori scope link-navigazione; nota: i canonical delle pagine de-amplificate puntano a URL che ora 301ano — irrilevante finché l'origine non serve più quelle pagine).

## TASK 3 — Sitemap + indici

- **sitemap.xml**: loc prima **368** → dopo **367**. Rimossa la `<url>` con `<loc>https://www.webnovis.com/quanto-costa-un-sito-web/</loc>` (unica loc non-.html del file). Nessun'altra loc che reindirizza dopo la patch (`/dist/`, `consulenza-digitale-`, `servizi/fotografia-aziendale.html`, blog senza .html: 0 match in sitemap).
- **generate-sitemap.js**: aggiunta esclusione `/^quanto-costa-un-sito-web\//` in EXCLUDE_PATTERNS (lo script scandisce ricorsivamente la publish root; l'esclusione a pattern è il meccanismo già usato per docs/dist/templates).
- sitemap NON rigenerata via `npm run build:sitemap`: il generatore scrive anche `data/content-lastmod.json` (directory vietata dal DIVIETO); la modifica manuale è già coerente con l'output del generatore.
- **search-index.json / search-ai-index.json**: contenevano `/quanto-costa-un-sito-web/` (2 occorrenze ciascuno). Script identificato e verificato **puramente locale** (solo writeFileSync sui 2 JSON in root, nessuna rete, nessuna scrittura in data/): eseguito `node build-search-index.js` (≡ `npm run build:search-index`) — "✅ 368 public pages / ✅ 1157 AI pages". Diff: conteggi invariati (l'entry dir permane finché esiste il file sorgente `quanto-casta…/costa-un-sito-web/index.html`); i contenuti snippet delle 2 pagine corrette sono aggiornati nel diff (+~1,5 KB). URL `blog/ottimizzazione-immagini-web` senza .html: assente dagli indici. **Residuo da decidere a valle**: rimuovere la directory sorgente dal repo/artifact oppure escludere il path anche in build-search-index.js.
- Ottimizzazione-immagini-web (35 imp): presente solo come `/blog/ottimizzazione-immagini-web.html` in sitemap e indici — la nuova regola 301 copre la variante senza estensione indicizzata.

## TASK 4 — llms.txt / ai.txt / llms-full.txt

- **llms.txt**: 2 URL corretti `https://www.webnovis.com/quanto-costa-un-sito-web/` → `https://www.webnovis.com/blog/quanto-costa-un-sito-web.html` (riga 9 "Pagine canoniche" e riga 88 sezione Blog).
- **scripts/generate-llms-index.js**: stesse 2 correzioni nel template (righe 103 e 157) così la rigenerazione (`npm run build:llms`) resta coerente — non eseguita, file già corretto a mano.
- **ai.txt**: nessun URL di quelli reindirizzati. **llms-full.txt**: nessun match per dir quanto-costa, `/dist/`, blog senza .html, "casta".

## Comandi eseguiti

- `node build-search-index.js` (×2, dopo ciascun batch di fix link) — generazione indici locale verificata.
- Nessun deploy. Nessuna rigenerazione llms/sitemap (non necessarie / bloccate da DIVIETO su data/).

## Follow-up consigliati

1. Duplicare le nuove regole come Cloudflare Single Redirects di zona (finché origine non è Workers Assets).
2. Decidere sorte di `quanto-costa-un-sito-web/index.html` (rimozione dal repo o esclusione anche dagli indici search).
3. Valutare `/preventivo.html` come target più semantico per l'anchor "preventivo gratuito" in servizi/sviluppo-web.html.
