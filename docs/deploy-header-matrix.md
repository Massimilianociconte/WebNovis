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

## Operational Rule

- `Hard fail`: CI or manual verification must block deployment if the value differs.
- `Warning`: verification must report drift, but drift can be tolerated if the effective policy is intentionally managed at the edge.

## Review Checklist

- When changing `config/security-headers.js`, regenerate `_headers` via `npm run sync:headers`.
- When production warnings appear, compare the edge configuration before changing repository defaults.
- Do not mark a header as edge-managed without updating this matrix.