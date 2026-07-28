# WebNovis AI su Cloudflare Workers — guida operativa

Questa guida spiega **tutto** ciò che devi fare tu (esternamente) e ciò che è già pronto nel codice.

## Cosa è stato costruito

| Pezzo | Percorso | Ruolo |
|---|---|---|
| Worker AI API | `workers/webnovis-ai/` | Chat Weby, search AI, health, chat-lead |
| Indice ricerca | `workers/webnovis-ai/data/search-index.json` | Corpus grounded (generato da `search-index.json`) |
| Frontend chat | `js/chat.js` / `chat.min.js` | Chiama il Worker (non più Render) |
| Frontend search | `js/search.js` / `search.min.js` | AI remota **ON** in produzione |
| Shell chat site-wide | `js/weby-shell.js` | Inietta Weby su tutte le pagine |
| Script setup | `scripts/setup-cloudflare-ai.sh` | Login, deploy, secrets, smoke test |

### Endpoint del Worker

- `GET  /api/health`
- `POST /api/chat`
- `POST /api/search-ai`
- `POST /api/chat-lead`

URL previsto (se il sottodominio account lo consente):

`https://webnovis-ai.nexify-api.workers.dev`

> L’URL `*.workers.dev` reale dipende dall’account Cloudflare. Dopo il deploy copialo dal dashboard e, se diverso, aggiorna i tre file frontend/CSP elencati sotto.

---

## Prerequisiti (una sola volta)

1. **Account Cloudflare** (già presente: `massimilianociconte9@gmail.com`)
2. **Node.js 18+** e npm sul Mac
3. Progetto in:
   `Documents/Progetti/Webnovis_kiro - backup`
4. Nel file `.env` del progetto devono esserci (senza spazi intorno a `=`):
   - `GEMINI_API_KEY_CHAT=...`
   - `GEMINI_API_KEY_SEARCH=...`
   - `BREVO_API_KEY=...` (opzionale ma consigliato per lead email)
   - `BREVO_SENDER_EMAIL=...`
   - `BREVO_NOTIFICATION_EMAIL=hello@webnovis.com`

---

## Passo A — Autenticazione Wrangler (obbligatorio sul tuo Mac)

Apri il **Terminale** (non un ambiente CI) e lancia:

```bash
cd "/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro - backup"
npx wrangler login
```

1. Si apre il browser.
2. Accetta i permessi Cloudflare.
3. Torna al terminale: deve comparire “Successfully logged in”.

Verifica:

```bash
npx wrangler whoami
```

Devi vedere email e Account ID.

> Se `whoami` dice “not authenticated”, ripeti `wrangler login` **nello stesso terminale interattivo** (non da script non-interattivi).

---

## Passo B — Deploy del Worker + secrets (consigliato: script unico)

```bash
cd "/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro - backup"
bash scripts/setup-cloudflare-ai.sh
```

Lo script:

1. Rigenera l’indice per il Worker
2. Controlla il login (o lo avvia)
3. Esegue `wrangler deploy`
4. Imposta i secrets da `.env` (o chiede input)
5. Prova `/api/health`

### Alternativa manuale (stessi effetti)

```bash
cd "/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro - backup"

# 1. Dati
npm run ai:prepare

# 2. Deploy
npm run ai:deploy

# 3. Secrets (ogni comando chiede il valore se non lo passi da pipe)
npx wrangler secret put GEMINI_API_KEY_CHAT -c workers/webnovis-ai/wrangler.jsonc
npx wrangler secret put GEMINI_API_KEY_SEARCH -c workers/webnovis-ai/wrangler.jsonc
npx wrangler secret put BREVO_API_KEY -c workers/webnovis-ai/wrangler.jsonc
npx wrangler secret put BREVO_SENDER_EMAIL -c workers/webnovis-ai/wrangler.jsonc
npx wrangler secret put BREVO_SENDER_NAME -c workers/webnovis-ai/wrangler.jsonc
npx wrangler secret put BREVO_NOTIFICATION_EMAIL -c workers/webnovis-ai/wrangler.jsonc
```

Per passare un secret da `.env` senza copiarlo in chiaro nella history (esempio):

```bash
grep '^GEMINI_API_KEY_CHAT=' .env | cut -d= -f2- | tr -d '"' | \
  npx wrangler secret put GEMINI_API_KEY_CHAT -c workers/webnovis-ai/wrangler.jsonc
```

---

## Passo C — Verifica che l’API risponda

Sostituisci `BASE` con l’URL reale del Worker (dashboard Cloudflare → Workers & Pages → `webnovis-ai`).

```bash
BASE="https://webnovis-ai.nexify-api.workers.dev"

curl -sS "$BASE/api/health" | python3 -m json.tool

curl -sS -X POST "$BASE/api/chat" \
  -H 'Content-Type: application/json' \
  -d '{"message":"Quanto costa un sito vetrina?","sessionId":"test1","currentPage":"/"}' \
  | python3 -m json.tool

curl -sS -X POST "$BASE/api/search-ai" \
  -H 'Content-Type: application/json' \
  -d '{"query":"ecommerce milano","currentPage":"/"}' \
  | python3 -m json.tool
```

**Risultati attesi**

- health → `"status": "ok"`
- chat → testo con prezzi catalogo (es. vetrina da €1.200), non errore 503
- search-ai → `answer` + `suggestedPages` con URL del sito

Se l’URL workers.dev **non** è `massimilianociconte9.workers.dev`, aggiorna questi file con l’URL corretto:

1. `js/chat.js` (apiEndpoint / leadEndpoint / healthCheckUrl)
2. `js/search.js` (`SEARCH_API_BASE`)
3. `config/security-headers.js` (`connect-src` + CORS)
4. Poi:

```bash
npx terser js/chat.js -c -m -o js/chat.min.js
npx terser js/search.js -c -m -o js/search.min.js
npm run sync:headers
```

e pubblica il frontend (git push / deploy statico del sito).

---

## Passo D — (Ottimale) Dominio custom `api.webnovis.com`

Se il dominio `webnovis.com` è su Cloudflare:

1. Dashboard → **Workers & Pages** → `webnovis-ai` → **Settings** → **Domains & Routes**
2. **Add** → `api.webnovis.com`
3. Cloudflare crea DNS e certificato SSL
4. Aggiorna frontend e CSP verso `https://api.webnovis.com` (stessi 3 file del Passo C)
5. Ritesta con `BASE=https://api.webnovis.com`

Vantaggi: URL stabile, brand, meno dipendenza dal sottodominio workers.dev.

Se il DNS del sito **non** è su Cloudflare, prima sposta i nameserver del dominio su Cloudflare (Registrar → nameserver Cloudflare), attendi la propagazione, poi aggiungi il custom domain.

---

## Passo E — Pubblicare il frontend aggiornato

Il backend Worker da solo non basta: il sito deve puntare al nuovo host.

1. Commit / push del repo (o il flusso che già usi per `www.webnovis.com`)
2. Assicurati che vadano online:
   - `js/chat.min.js`
   - `js/search.min.js`
   - `js/weby-shell.min.js`
   - `js/noncritical-loader.min.js`
   - `css/style.min.css` (nota AI chat)
   - `_headers` (CSP con connect-src al Worker)
3. Hard refresh sul browser (`Cmd+Shift+R`)

### Checklist browser (produzione)

| Test | Come | OK se |
|---|---|---|
| Health | Network tab: request a `/api/health` del Worker | 200 |
| Chat homepage | Apri Weby, chiedi “Quanto costa un sito vetrina?” | Listino coerente, non solo fallback offline |
| Chat altra pagina | Apri `/servizi/sito-vetrina.html`, usa Weby | Widget presente |
| Search AI | Digita “ecommerce a milano” (frase lunga) | Sezione “Risposta generata con AI” |
| Disclosure AI | Header chat | Pill AI + nota privacy |
| Blog note | Fondo articolo | Nota AI + revisione umana |

---

## Passo F — Dismettere Render

Quando i test sopra passano da **almeno 24–48 ore**:

1. Login [Render Dashboard](https://dashboard.render.com)
2. Servizio `webnovis-chat` → **Suspend** o **Delete**
3. Rimuovi variabili/secrets solo se non servono altrove
4. (Opzionale) togli `https://webnovis-chat.onrender.com` da `config/security-headers.js` e ri-sync headers

Non cancellare Render **prima** che il Worker risponda al 100%.

---

## Sviluppo locale

```bash
cd "/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro - backup"

# Copia secrets locali
cp workers/webnovis-ai/.dev.vars.example workers/webnovis-ai/.dev.vars
# edita .dev.vars con le chiavi Gemini

npm run ai:dev
# Worker su http://127.0.0.1:8787
```

Nel browser, apri il sito locale e (se serve) forza:

```html
<script>
  window.WEBNOVIS_LOCAL_AI_API = 'http://127.0.0.1:8787';
</script>
```

---

## Manutenzione periodica

Dopo aggiornamenti massicci di pagine/blog:

```bash
npm run build:search-index
npm run ai:prepare
npm run ai:deploy
```

Log live:

```bash
npm run ai:tail
# oppure: npx wrangler tail webnovis-ai
```

---

## Risoluzione problemi

| Sintomo | Causa tipica | Fix |
|---|---|---|
| `wrangler whoami` non autenticato | Login scaduto / ambiente non interattivo | `npx wrangler login` in Terminal.app |
| Chat 503 / HTML “Service Suspended” | Ancora su Render | Controlla che `chat.min.js` punti al Worker |
| CSP blocked connect | CSP senza host Worker | Aggiorna `config/security-headers.js` + `npm run sync:headers` |
| Chat senza memoria tra messaggi | KV `SESSIONS` assente | Redeploy con binding KV; verifica in dashboard |
| Prezzi sbagliati | Cache browser JS vecchio | Hard refresh / CDN purge |
| Gemini high demand | Picco free tier | Worker prova già fallback `gemini-2.5-flash` |

---

## Sicurezza

- **Mai** committare `.dev.vars`, `.env`, né output di `wrangler secret`
- Secrets solo con `wrangler secret put`
- CORS limitato a `www.webnovis.com` / `webnovis.com` (+ localhost in dev)
