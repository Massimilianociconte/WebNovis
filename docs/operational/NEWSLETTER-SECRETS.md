# Newsletter secrets — isolation & rotation (2026-09)

Due secret separati, mai intercambiabili (blast-radius reduction):

| Variabile | Scopo esclusivo | Dove |
|---|---|---|
| `NEWSLETTER_ADMIN_SECRET` | header `X-Admin-Secret` (`/api/config`, `/api/newsletter/send`, `/preview`, `/subscribers`) | `server.js requireAdminAuth` |
| `UNSUBSCRIBE_HMAC_SECRET` | generazione/verifica token HMAC unsubscribe | `newsletter-engine.js` |
| `UNSUBSCRIBE_HMAC_SECRET_PREVIOUS` | solo verifica durante grace period | `newsletter-engine.js verifyUnsubscribeToken` |

## Generazione

```bash
openssl rand -hex 32   # eseguire due volte, valori diversi
```

Mai committare valori reali (solo `.env.example` con placeholder).
Mai stamparli nei log (solo `Configured/Missing`).

## Transizione senza rompere i vecchi link (una tantum)

1. Fase 0: `UNSUBSCRIBE_HMAC_SECRET` = copia esatta di `NEWSLETTER_ADMIN_SECRET` → deploy → zero rotture.
2. Fase 1: nuovo random in `UNSUBSCRIBE_HMAC_SECRET`, vecchio valore in `UNSUBSCRIBE_HMAC_SECRET_PREVIOUS` → nuovi invii con nuova chiave, vecchi link verificati via `previous`.
3. Fase 2 (dopo ~60gg o `previous` hit ≈ 0 per 14gg): svuotare `PREVIOUS`, rimuovere fallback.

## Rotazioni indipendenti

- Rotazione admin: cambia solo `NEWSLETTER_ADMIN_SECRET` → unsubscribe invariato.
- Rotazione HMAC: Fase 1→2 sopra → admin invariato.
