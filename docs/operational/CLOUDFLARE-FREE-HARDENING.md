# Cloudflare hardening — solo piano Free (2026-09)

Piano documentato: **Free**. Niente WAF Managed, niente Rate Limiting dashboard,
niente Bot Management: tutto sotto è creabile a costo zero. Verificato da file
(`wrangler.jsonc`, `_redirects`, `docs/deploy/*`).

## 1. Single Redirect apex → www (unica regola zona obbligatoria)

`Rules → Redirect Rules → Single Redirect → Create`, `301`, preserve query ON:

```txt
http.host eq "webnovis.com"
```

→ Dynamic: `concat("https://www.webnovis.com", http.request.uri.path)`

Prerequisito DNS: record apex proxied (altrimenti la regola non si attiva).
Non metterla in `_redirects` (impossibile lì — nota `_redirects:177-178`).
Vale post-migrazione Workers Assets; finché l'origine è Pages restano valide
anche le altre regole zona documentate in `CLOUDFLARE-ZONE-REDIRECTS.md`.

## 2. HTTPS/TLS (toggle, nessuna expression)

`SSL/TLS → Overview → Full (strict)`; Edge Certificates: Always Use HTTPS ON,
Automatic HTTPS Rewrites ON, Minimum TLS 1.2, TLS 1.3 ON.
Verifica: `curl -sI http://www.webnovis.com/` → `301 https`.

## 3. WAF Custom Rule "Block source files" (Free, NON Managed)

`Security → WAF → Custom rules → Create`, Action Block:

```txt
(starts_with(http.request.uri.path, "/scripts/")) or (starts_with(http.request.uri.path, "/config/")) or (starts_with(http.request.uri.path, "/src/")) or (starts_with(http.request.uri.path, "/data/")) or (starts_with(http.request.uri.path, "/tests/")) or (starts_with(http.request.uri.path, "/templates/")) or (starts_with(http.request.uri.path, "/reports/")) or (starts_with(http.request.uri.path, "/docs/")) or (starts_with(http.request.uri.path, "/workers/")) or (ends_with(http.request.uri.path, ".py")) or (ends_with(http.request.uri.path, ".jsonc")) or (http.request.uri.path in {"/server.js" "/package.json" "/package-lock.json" "/build.js" "/ai-config.js" "/chat-config.json" "/newsletter-engine.js" "/search-ai-engine.js" "/_headers" "/_redirects" "/.assetsignore"})
```

Su Workers è ridondante (`dist/` non contiene quei path → già 404) ma innocua
come difesa in caso di rollback a Pages. MAI bloccare
`/css/ /js/ /Img/ /fonts/ /robots.txt /sitemap.xml /ai.txt /llms*.txt /search-index.json /manifest.json /webnovis-ai-data.json`.

## 4. Rate limiting e bot (solo in-code + toggle Free)

NON creare Rate Limiting Rules dashboard: il piano Free ne include 1 sola
(finestra 10s, solo IP), inadeguata a 7 finestre differenziate. Restano i limiti
nel codice (KV `SESSIONS` su Worker AI, in-memory su Forms, `express-rate-limit`
su server dev): `chat 30/15min`, `search-ai 20/min`, `chat-lead 10/15min`,
`verify 10/10min`, `submit 5/10min`, admin `20/15min`, unsubscribe `30/h`.
Consentito: `Security → Bots → Bot Fight Mode: ON`. Mai Super Bot / Bot Management.

## 5. DNS (Free)

DNSSEC ON (DS al registrar); record CAA `0 issue` per la CA reale
(verificare in dashboard, non assumere); apex proxied per §1.

## 6. HSTS — NON sottomettere a preload

`_headers` serve già `max-age=31536000; includeSubDomains; preload` su `www/*`.
NON abilitare HSTS dashboard e NON sottomettere a `hstspreload.org` finché:
apex non serve HSTS (la 301 apex→www non eredita `_headers`), R1+R2 verificati
via `curl -sI http(s)://webnovis.com http(s)://www.webnovis.com`, nessun
sottodominio solo-HTTP residuo. Preload è irreversibile a breve termine.

## 7. Cache privata

Già a posto su tre strati: `_headers /api/*` (`no-store` + `Vary: Origin`),
`json()` di entrambi i Worker (`no-store` + `noindex`), KV search cache solo
server-side. Non cachare mai HTML con token né risposte `/verify|/submit`.
