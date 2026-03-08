# Production Header Verification

Questo documento descrive come verificare che gli header definiti nel repository siano effettivamente serviti in produzione.

## Comando

```bash
npm run verify:prod-headers
```

## Endpoint controllati

- `/`
- `/blog/`
- `/portfolio.html`
- `/api/health`

## Sorgente di verita`

Lo script confronta le risposte HTTP con i valori definiti in `config/security-headers.js`.

## Variabile opzionale

Per verificare staging o un altro host:

```bash
PRODUCTION_SITE_URL=https://staging.webnovis.com npm run verify:prod-headers
```

Su PowerShell:

```powershell
$env:PRODUCTION_SITE_URL = 'https://staging.webnovis.com'
npm run verify:prod-headers
```

## Cosa valida

- conformita` degli header attesi sul dominio realmente esposto
- eventuali mismatch introdotti da CDN, reverse proxy o hosting statico

## Cosa non valida

- non sostituisce i regression test locali
- non controlla markup, asset o contenuti SEO
- non garantisce che tutti gli endpoint del sito abbiano la stessa policy, ma copre i punti principali
