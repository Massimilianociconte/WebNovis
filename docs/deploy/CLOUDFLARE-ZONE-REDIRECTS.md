# Cloudflare Single Redirects (zona) — bridge finché l'origine è GitHub Pages

**Contesto:** `https://www.webnovis.com` è ancora servito da **GitHub Pages** dietro proxy Cloudflare (`x-github-request-id` presente).  
In questo setup **`_redirects` e gran parte di `_headers` non sono applicati** (valgono solo con deploy Workers Assets / Pages via `wrangler deploy`).

Finché non completi la migrazione in `MIGRAZIONE-CLOUDFLARE-PAGES.md`, configura queste **Regole di reindirizzamento (Single Redirects)** a livello di zona `webnovis.com`.

## Dove

Cloudflare Dashboard → **webnovis.com** → **Regole** → **Regole di reindirizzamento** → **Crea regola** (Single Redirect).

Ordine consigliato: regole più specifiche prima di quelle con wildcard.

---

## Regole obbligatorie (SEO)

### 1. Typo plurale → URL canonico Rho

| Campo | Valore |
|---|---|
| Se | URI Path uguale a `/agenzie-web-rho.html` |
| Allora | URL statico `https://www.webnovis.com/agenzia-web-rho.html` |
| Codice | **301** |
| Preserve query string | Sì |

### 2. Artefatti `/dist/*` (404 GSC storici)

| Campo | Valore |
|---|---|
| Se | URI Path corrisponde a regex `^/dist/(.*)` |
| Allora | Dinamico: `concat("https://www.webnovis.com/", http.request.uri.path)` **sbagliato** — usare: `concat("https://www.webnovis.com/", regex_replace(http.request.uri.path, "^/dist/", ""))` |
| Codice | **301** |
| Preserve query string | Sì |

Espressione alternativa (Dynamic):

```txt
concat("https://www.webnovis.com/", regex_replace(http.request.uri.path, "^/dist/", ""))
```

Filtro:

```txt
starts_with(http.request.uri.path, "/dist/")
```

### 3. Cluster deprecato `consulenza-digitale-*` → `consulenze-*`

| Campo | Valore |
|---|---|
| Se | URI Path corrisponde a regex `^/consulenza-digitale-(.*)$` |
| Allora | Dinamico: `concat("https://www.webnovis.com/consulenze-", regex_replace(http.request.uri.path, "^/consulenza-digitale-", ""))` |
| Codice | **301** |

### 4. Prefisso legacy `/public/*`

| Campo | Valore |
|---|---|
| Se | `starts_with(http.request.uri.path, "/public/")` |
| Allora | `concat("https://www.webnovis.com/", regex_replace(http.request.uri.path, "^/public/", ""))` |
| Codice | **301** |

### 5. Apex → www (se non già presente)

| Campo | Valore |
|---|---|
| Se | Hostname uguale a `webnovis.com` |
| Allora | `concat("https://www.webnovis.com", http.request.uri.path)` |
| Codice | **301** |
| Preserve query string | Sì |

---

## Verifica post-deploy regole

```bash
curl -sI "https://www.webnovis.com/agenzie-web-rho.html" | head -5
# atteso: HTTP/2 301  + location: .../agenzia-web-rho.html

curl -sI "https://www.webnovis.com/dist/ecommerce-parabiago.html" | head -5
# atteso: HTTP/2 301  + location: .../ecommerce-parabiago.html

curl -sI "https://www.webnovis.com/consulenza-digitale-rho.html" | head -5
# atteso: HTTP/2 301  + location: .../consulenze-rho.html
```

Dopo la migrazione a Workers Assets queste regole di zona restano utili (apex→www) ma le altre diventano ridondanti con `_redirects`.

## Diffesa HTML già in repo (funziona anche senza 301)

`agenzie-web-rho.html` ha:

- `meta robots = noindex, follow`
- `link rel=canonical` → `/agenzia-web-rho.html`
- `meta refresh` → `/agenzia-web-rho.html`

Il 301 di zona resta preferibile: trasferisce equity e chiude i 404/duplicati in GSC.
