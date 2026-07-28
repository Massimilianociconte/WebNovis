# Cloudflare — configurazione passo per passo

> **Perché serve.** L'origine del sito è GitHub Pages, che **non legge**
> `_headers`, `_redirects` né `.assetsignore`. Quei tre file sono scritti per
> Cloudflare Workers Assets e oggi sono inerti. Finché l'origine resta GitHub
> Pages, le regole vanno create **a livello di zona su Cloudflare**.
>
> Il comando `npm run verify:prod-headers` gira a ogni push su `main` e
> **fallisce** finché i passi 1 e 2 non sono completati. È il segnale, non un bug.

Tutto quello che segue si fa dal browser su **dash.cloudflare.com**, con
l'account che gestisce il dominio `webnovis.com`. Nessun comando da terminale.

Ordine consigliato: **3 → 2 → 1** (dal più semplice al più delicato).

---

## Come arrivare al dominio

1. Vai su <https://dash.cloudflare.com> e fai login.
2. Nella schermata iniziale (**Account Home**) vedi l'elenco dei domini.
   Clicca su **webnovis.com**.
3. Da qui in poi la colonna di sinistra è il menu del dominio. Tutti i passi
   sotto partono da lì.

---

## 1. Transform Rule — header di sicurezza

**Cosa risolve.** In produzione oggi mancano `Content-Security-Policy` e
`Permissions-Policy`, e tre header hanno il valore sbagliato ereditato da
GitHub Pages (`X-Frame-Options: SAMEORIGIN` invece di `DENY`,
`Referrer-Policy: same-origin`, `X-XSS-Protection: 1; mode=block`).

**Attenzione.** La CSP è l'unica regola che può *rompere* il sito se sbagliata
(blocca script e stili non elencati). Per questo si fa in due tempi: prima in
modalità "solo segnalazione", poi si attiva davvero.

### 1a. Creare la regola in modalità sicura

1. Menu di sinistra → **Rules** → **Overview** (o **Transform Rules**, a
   seconda della versione della dashboard).
2. Scheda **Modify Response Header** → pulsante **Create rule**.
3. **Rule name**: `Security headers`
4. Sotto **If incoming requests match…** scegli **All incoming requests**.
   (Se la dashboard non offre questa scelta, seleziona *Custom filter
   expression* e nel campo **Expression** scrivi `true`.)
5. Sotto **Then…** aggiungi **una voce per riga** cliccando ogni volta
   **+ Set new header** (o **Add header** → azione **Set static**):

   | Azione | Header name | Value |
   |---|---|---|
   | Set static | `Content-Security-Policy-Report-Only` | *(vedi blocco sotto)* |
   | Set static | `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
   | Set static | `X-Frame-Options` | `DENY` |
   | Set static | `Referrer-Policy` | `strict-origin-when-cross-origin` |
   | Set static | `X-XSS-Protection` | `0` |

   Valore per `Content-Security-Policy-Report-Only` — **una riga sola**,
   copiala tutta:

   ```
   default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://widget.trustpilot.com https://connect.facebook.net https://www.clarity.ms https://scripts.clarity.ms https://cdn.jsdelivr.net https://web3forms.com https://esm.sh https://www.designrush.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.designrush.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com https://www.designrush.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://scripts.clarity.ms https://api.web3forms.com https://www.facebook.com https://www.designrush.com https://widget.trustpilot.com https://webnovis-ai.nexify-api.workers.dev https://*.workers.dev; frame-src https://widget.trustpilot.com https://www.facebook.com https://www.google.com https://maps.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' https://api.web3forms.com; upgrade-insecure-requests
   ```

   > La fonte di verità di questo valore è `config/security-headers.js`.
   > Se in futuro cambia lì, va riportato qui.

6. **Deploy**.

`Strict-Transport-Security` e `X-Content-Type-Options` sono già corretti in
produzione: **non aggiungerli**.

### 1b. Verificare per 48 ore

Con `-Report-Only` il browser **non blocca nulla**, segnala soltanto. Nel
frattempo:

- Apri il sito in Chrome, premi F12 → scheda **Console**.
- Naviga home, contatti, preventivo, blog, portfolio, e **apri la chat Weby**.
- Cerca messaggi che iniziano con `[Report Only] Refused to…`.

Se compare un `Refused to load … https://qualcosa.com`, quel dominio va
aggiunto alla direttiva giusta della CSP (`script-src` per gli script,
`connect-src` per le chiamate di rete, e così via). Se non compare nulla in
48 ore, sei a posto.

### 1c. Attivare la CSP

Torna nella regola, cambia il nome dell'header da
`Content-Security-Policy-Report-Only` a `Content-Security-Policy`
(il valore resta identico), poi **Deploy**.

### 1d. Confermare

```bash
npm run verify:prod-headers
```

Deve stampare `OK` su tutti i target.

---

## 2. WAF — bloccare i sorgenti esposti

**Cosa risolve.** La root del repository *è* la cartella pubblicata da GitHub
Pages. Oggi chiunque può scaricare `https://www.webnovis.com/server.js`,
`/scripts/generate-all-geo.js`, `/config/pseo-governance.js`,
`/chat-config.json`, `/package.json`. Nessuna chiave API è esposta (verificato),
ma sono la logica di business, il listino e i prompt del chatbot.

`robots.txt` non protegge nulla: è una preferenza di crawling, non un permesso.

### Come si crea

1. Menu di sinistra → **Security** → **WAF**.
2. Scheda **Custom rules** → **Create rule**.
3. **Rule name**: `Block source files`
4. Sotto il costruttore di condizioni clicca **Edit expression** (link testuale
   in alto a destra del riquadro): passi all'editor testuale, molto più veloce
   che comporre 12 condizioni a mano.
5. Incolla **esattamente** questa espressione:

   ```
   (starts_with(http.request.uri.path, "/scripts/")) or
   (starts_with(http.request.uri.path, "/config/")) or
   (starts_with(http.request.uri.path, "/src/")) or
   (starts_with(http.request.uri.path, "/data/")) or
   (starts_with(http.request.uri.path, "/tests/")) or
   (starts_with(http.request.uri.path, "/templates/")) or
   (starts_with(http.request.uri.path, "/reports/")) or
   (starts_with(http.request.uri.path, "/docs/")) or
   (starts_with(http.request.uri.path, "/workers/")) or
   (ends_with(http.request.uri.path, ".py")) or
   (ends_with(http.request.uri.path, ".jsonc")) or
   (http.request.uri.path in {"/server.js" "/package.json" "/package-lock.json" "/build.js" "/ai-config.js" "/chat-config.json" "/newsletter-engine.js" "/search-ai-engine.js" "/_headers" "/_redirects" "/.assetsignore"})
   ```

6. Sotto **Then take action…** scegli **Block**.
7. **Deploy**.

### Confermare

```bash
for p in /server.js /scripts/generate-all-geo.js /config/pseo-governance.js /package.json /chat-config.json /src/html/index.html; do printf "%-38s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://www.webnovis.com$p"; done
```

Devono rispondere **403**. Prima rispondevano 200.

### Cosa NON bloccare

`/css/`, `/js/`, `/Img/`, `/fonts/`, `/robots.txt`, `/sitemap.xml`, `/ai.txt`,
`/llms.txt`, `/llms-full.txt`, `/webnovis-ai-data.json`, `/manifest.json`,
`/search-index.json`. Servono al sito o ai crawler: se li blocchi, rompi la
ricerca interna o la visibilità sugli assistenti AI.

> **Nota.** `/.env` risponde già 404 perché non è tracciato in git — verificato,
> nessuna chiave è mai finita nel repository.

---

## 3. Single Redirect — `/index.html` → `/`

**Cosa risolve.** `https://www.webnovis.com/index.html` risponde **200** invece
di reindirizzare a `/`. Sono due URL con lo stesso contenuto. Il canonical
protegge, ma il redirect è la soluzione pulita.

È il passo più semplice: fallo per primo, così prendi confidenza con
l'interfaccia.

1. Menu di sinistra → **Rules** → **Overview**.
2. Scheda **Redirect Rules** → **Create rule** → **Single Redirect**.
3. **Rule name**: `index.html to root`
4. Sotto **If incoming requests match…** scegli **Custom filter expression**,
   poi **Edit expression** e incolla:

   ```
   http.request.uri.path eq "/index.html"
   ```

5. Sotto **Then…**:
   - **Type**: `Static`
   - **URL**: `https://www.webnovis.com/`
   - **Status code**: `301`
   - Spunta **Preserve query string**.
6. **Deploy**.

### Altri redirect utili (stessa procedura, una regola ciascuno)

| Expression | Destinazione | Perché |
|---|---|---|
| `http.request.uri.path eq "/accessibilita-rho.html"` | `https://www.webnovis.com/servizi/accessibilita.html` | URL legacy |
| `http.request.uri.path eq "/social-media-rho.html"` | `https://www.webnovis.com/servizi/social-media.html` | URL legacy |
| `http.request.uri.path eq "/chiedere-recensioni-clienti"` | `https://www.webnovis.com/blog/chiedere-recensioni-clienti.html` | manca `.html` |

Già funzionanti, **non rifarli**: `webnovis.com` → `www.webnovis.com`,
`/servizi` → `/servizi/`, `/agenzie-web-rho.html` → `/agenzia-web-rho.html`.

### Confermare

```bash
for u in /index.html /accessibilita-rho.html /social-media-rho.html /chiedere-recensioni-clienti; do printf "%-34s " "$u"; curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}\n" "https://www.webnovis.com$u"; done
```

---

## 4. (Opzionale) Cache Rule per gli asset versionati

**Cosa risolve.** `/css/*` e `/js/*` sono serviti con `max-age=14400` (4 ore)
anche quando l'URL è già versionato (`style.min.css?v=20260728c`). Un URL
versionato non cambia mai contenuto: può essere cachato per un anno.

1. **Caching** → **Cache Rules** → **Create rule**.
2. **Rule name**: `Versioned assets immutable`
3. **Edit expression**:

   ```
   (starts_with(http.request.uri.path, "/css/") or starts_with(http.request.uri.path, "/js/")) and http.request.uri.query contains "v="
   ```

4. **Then**:
   - **Cache eligibility**: `Eligible for cache`
   - **Edge TTL**: `Ignore cache-control header and use this TTL` → `1 year`
   - **Browser TTL**: `Override origin` → `1 year`
5. **Deploy**.

> **Prerequisito.** Funziona solo se a ogni deploy che cambia CSS o JS bumpi la
> versione. Nel repo c'è già `bump-css-version.js`. Senza il bump, gli utenti
> restano su asset vecchi per un anno.

---

## Riepilogo verifica finale

```bash
npm run verify:prod-headers
```

Un solo comando: controlla header, redirect legacy e che i sorgenti non siano
più raggiungibili. Se passa, la configurazione Cloudflare è completa.
