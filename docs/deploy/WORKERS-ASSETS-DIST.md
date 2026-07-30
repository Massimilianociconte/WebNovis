# Cloudflare Workers Assets — deploy da `dist/`

**Stato attuale produzione:** GitHub Pages su `www.webnovis.com`.  
**Obiettivo:** Workers static assets che servono solo l’artefatto sanitizzato in `dist/`, non la root del repo.

Non cambiare DNS finché la verifica su `*.workers.dev` non è passata.

## Perché `dist/` e non la root

La root contiene tooling, config, script e sorgenti.  
`npm run build:site:dist` esegue `scripts/prepare-public-artifact.js` (allowlist + staging atomico) e produce `dist/` con HTML, CSS/JS, media, e i file di piattaforma:

| File in `dist/` | Ruolo su Workers Assets |
|---|---|
| `_headers` | Header di sicurezza e cache (parsato da CF, non servito come asset) |
| `_redirects` | 301/rewrite legacy e directory index |
| `.assetsignore` | Esclusioni relative a `dist/` (defense-in-depth; **non** esclude `dist/` stesso né `_headers`/`_redirects`) |

Il root `.assetsignore` resta solo come rete di sicurezza se qualcuno ripuntasse `assets.directory` sulla root.

## Configurazione

`wrangler.jsonc`:

```jsonc
"assets": {
  "directory": "dist",
  "html_handling": "none",
  "not_found_handling": "404-page"
}
```

**Non cambiare** `html_handling: "none"`: il default di Cloudflare redirezionerebbe ogni `*.html` verso l’URL senza estensione (rottura SEO).

## Build e deploy

### Locale

```bash
# Build artefatto
npm run build:site:dist

# Verifica artefatto
npm run verify:artifact

# Dry-run: build + wrangler senza upload (non deploya)
npm run deploy:workers:check
# alias: npm run deploy:site:dry

# Deploy reale (richiede autenticazione: npx wrangler login)
npm run deploy:site
# equivalente: npm run build:site:dist && npx wrangler deploy
```

`deploy:site` **non** va lanciato in CI/automation senza auth e senza intenzione esplicita di pubblicare.

### Cloudflare dashboard / Workers Builds

| Campo | Valore |
|---|---|
| **Comando di generazione** | `npm ci && npm run build:site:dist` |
| **Comando Distribuisci** | `npx wrangler deploy` |
| **Nome progetto** | `webnovis` (allineato a `name` in `wrangler.jsonc`) |

Se il runtime di build ha già le dipendenze: `npm run build:site:dist` basta come build command.

## Ordine di migrazione (DNS)

1. Deploy Worker → URL `webnovis.<account>.workers.dev`
2. Smoke test su workers.dev (vedi `MIGRAZIONE-CLOUDFLARE-PAGES.md` Fase 2)
3. Solo dopo: custom domain `www` + redirect apex → www
4. Solo dopo verifica su dominio custom: spegnere GitHub Pages e (opzionale) workers.dev indexing

## Cache headers

`_headers` (generato da `config/security-headers.js`):

- HTML: TTL corto (`max-age=300`)
- `/css/*`, `/js/*`: `max-age=14400` + SWR  
  I path sono **stabili** (versioning via query `?v=…`); **non** si usa `immutable` su questi path (policy del repo / verifier).
- `/Img/*`, `/fonts/*`: TTL giornaliero + SWR

## Script correlati

- `npm run build:site:dist` — prepara `dist/`
- `npm run verify:artifact` — valida allowlist, sentinels, `_headers` sync
- `npm run deploy:workers:check` — build + `wrangler deploy --dry-run`
- `npm run deploy:site` — build + deploy (auth richiesta)

Vedi anche: [MIGRAZIONE-CLOUDFLARE-PAGES.md](./MIGRAZIONE-CLOUDFLARE-PAGES.md).
