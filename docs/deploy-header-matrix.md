# Deploy Header Matrix

## Scope

This matrix defines which layer owns each production header so repository checks can distinguish hard regressions from edge-managed differences.

| Header | Expected Source of Truth | Runtime Owner | Verification Mode | Notes |
| --- | --- | --- | --- | --- |
| `X-Content-Type-Options` | `config/security-headers.js` | App + static host | Hard fail | Must match exactly across static and API responses. |
| `X-Frame-Options` | `config/security-headers.js` | App + static host | Hard fail | Must remain identical in `_headers` and Express responses. |
| `Referrer-Policy` | `config/security-headers.js` | App + static host | Hard fail | Managed entirely in repo. |
| `Permissions-Policy` | `config/security-headers.js` | App + static host | Hard fail | Managed entirely in repo. |
| `X-Robots-Tag` | `server.js` API middleware | App | Hard fail | Applies to `/api/*` and `/admin/*` only. |
| `Strict-Transport-Security` | `config/security-headers.js` | Edge-managed | Warning | Cloudflare or other CDN layers may append or override. |
| `Content-Security-Policy` | `config/security-headers.js` | Edge-managed | Warning | CDN/WAF layers may inject or mutate directives. |
| `Cache-Control` (HTML) | `config/security-headers.js` | Static host / edge | Hard fail in artifact | Short TTL with stale revalidation; never immutable. |
| `Cache-Control` (stable CSS/JS/media paths) | `config/security-headers.js` | Static host / edge | Hard fail in artifact | Stable filenames use bounded TTL; immutable is reserved for future content-hashed paths. |

## Operational Rule

- `Hard fail`: CI or manual verification must block deployment if the value differs.
- `Warning`: verification must report drift, but drift can be tolerated if the effective policy is intentionally managed at the edge.

## Production Reality (2026-08-25: migrazione Workers completata)

`www.webnovis.com` è servito da **Workers Assets** (`dist/` sanitizzato, route
`www.webnovis.com/*` su zona `webnovis.com`): le `_headers` del repository sono
attive e le attese del verifier tornano `SECURITY_HEADERS` (strict).
Il DNS di `www` resta puntato a GitHub Pages (irrilevante: il Worker intercetta
prima dell'origine) — rollback = rimuovere la route da `wrangler.jsonc` e
ridistribuire.

**Drift edge noto**: Transform Rules di zona (bridge pre-migrazione) sovrascrivono
`X-Frame-Options` (SAMEORIGIN), `Referrer-Policy` (same-origin) e
`X-XSS-Protection` (1; mode=block). Finché non vengono rimosse
(Dashboard → Regole → Transform Rules), questi tre header sono trattati come
edge-managed (warning). Dopo la rimozione, riportarli a `error` in
`scripts/verify-prod-headers.js` (`headerSeverity` + `edgeManagedHeaders`).
L'apex `webnovis.com` → `www` resta gestito da Single Redirects di zona.

## Review Checklist

- When changing `config/security-headers.js`, regenerate `_headers` via `npm run sync:headers`.
- `npm run build:site:dist` generates `dist/_headers` from the same policy and validates it byte-for-byte before local promotion.
- When production warnings appear, compare the edge configuration before changing repository defaults.
- Do not mark a header as edge-managed without updating this matrix.
- Run the live verifier only from `workflow_dispatch`. If `API_BASE_URL` is not configured, API checks are reported as `N/A`, not as a defect of the static site.
