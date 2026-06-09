# Migrazione GitHub Pages → Cloudflare Workers (static assets)

**Perché:** GitHub Pages ignora `_headers` e `_redirects`. Su Cloudflare (piano Free) entrambi diventano attivi: CSP, HSTS, X-Frame-Options, cache headers e i 301 legacy. È l'intervento singolo a maggior impatto sicurezza+SEO a costo zero.

**Nota:** nei nuovi account Cloudflare il flusso guidato è "Workers" (non c'è più il tab Pages). Questa guida usa Workers static assets: il repo contiene già i 3 file di configurazione necessari (`wrangler.jsonc`, `_redirects`, `_headers`, più `.assetsignore`).

**⚠️ Dettaglio critico già gestito:** il default di Cloudflare farebbe redirect 307 di ogni URL `.html` verso la versione senza estensione — una migrazione di URL dell'intero sito, disastrosa visto che tutte le pagine sono indicizzate come `.html`. In `wrangler.jsonc` è impostato `html_handling: "none"` e gli indici di directory sono gestiti con rewrite nel `_redirects`: **gli URL restano identici a oggi**. Non cambiare quel valore.

---

## Fase 1 — Collegamento repo (dashboard Cloudflare)

1. **Workers e Pagine → Crea → Importa un repository** → seleziona `Massimilianociconte/WebNovis`, branch `main`.
2. Campi del wizard:
   - **Nome progetto**: `webnovis` (deve combaciare con `name` in wrangler.jsonc)
   - **Comando di generazione**: *lascia vuoto* (cancella `pnpm run build` se precompilato)
   - **Comando Distribuisci**: `npx wrangler deploy` (il default va bene: legge wrangler.jsonc)
   - "Generazioni per ramificazioni non di produzione": può restare attivo
3. **Distribuisci**. Otterrai un URL `webnovis.<account>.workers.dev`.

Se in passato avevi già creato un progetto, controlla prima la lista in Workers e Pagine: se esiste, riusalo (Impostazioni → Build) invece di crearne un altro.

## Fase 2 — Verifica su workers.dev (PRIMA di toccare il DNS)

```bash
BASE="https://webnovis.<tuo-account>.workers.dev"
# 1. Homepage e directory (rewrite attivi?)
curl -sI "$BASE/" | head -1                      # atteso: 200
curl -sI "$BASE/blog/" | head -1                 # atteso: 200
# 2. Gli URL .html NON devono redirezionare (html_handling: none)
curl -sI "$BASE/agenzia-web-rho.html" | head -1  # atteso: 200 (NON 307!)
# 3. Header di sicurezza attivi?
curl -sI "$BASE/" | grep -iE "content-security|strict-transport|x-frame"
# 4. Redirect legacy
curl -sI "$BASE/consulenza-digitale-rho.html" | head -1   # atteso: 301
curl -sI "$BASE/public/robots.txt" | head -1              # atteso: 301
# 5. 404 personalizzata
curl -s -o /dev/null -w "%{http_code}" "$BASE/pagina-inesistente"  # atteso: 404
```

Controlla a mano: homepage, una pagina geo, un articolo blog, ricerca (Ctrl+K), chatbot (backend su Render: invariato), form contatti (Web3Forms: invariato).

## Fase 3 — Dominio

1. **Cloudflare → Account Home → Aggiungi sito → webnovis.com** (piano Free): importa i DNS esistenti.
2. Cambia i **nameserver** presso il registrar con quelli indicati da Cloudflare. Attendi l'attivazione.
3. Worker `webnovis` → **Impostazioni → Domini e Route → Aggiungi → Dominio personalizzato** → `www.webnovis.com`.
4. **Redirect apex → www** (non può stare nel `_redirects`): nella zona webnovis.com → **Regole → Regole di reindirizzamento (Single Redirects) → Crea regola**:
   - Se: Hostname uguale a `webnovis.com`
   - Allora: reindirizzamento dinamico, espressione `concat("https://www.webnovis.com", http.request.uri.path)`, codice 301, "Preserve query string" attivo.
   (Serve anche un record DNS per l'apex: un A/AAAA proxied fittizio tipo `192.0.2.1` / `100::` va bene, la regola risponde prima.)
5. SSL/TLS → modalità **Full (strict)**.

## Fase 4 — Pulizia post-migrazione

1. Verifica produzione: `npm run verify:prod-headers` + ripeti i curl della Fase 2 su `https://www.webnovis.com`.
2. Worker → Impostazioni → Domini e Route → **disabilita l'URL workers.dev** (evita contenuti duplicati indicizzabili).
3. GitHub → Settings → Pages → **disabilita** GitHub Pages.
4. Search Console: nessuna azione (stesso dominio e stessi URL). Monitora Copertura per 1–2 settimane.

## Rollback

Ripristina i vecchi nameserver presso il registrar e riabilita GitHub Pages. Il repo resta l'unica fonte di verità, nessun dato si perde.
