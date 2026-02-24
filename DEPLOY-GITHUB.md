# 🚀 Deploy su GitHub Pages - Guida Completa

## 📋 Cosa Faremo

1. ✅ Preparare il progetto per GitHub
2. ✅ Creare repository su GitHub
3. ✅ Pubblicare su GitHub Pages
4. ✅ Collegare il dominio personalizzato

## 🔧 Preparazione Progetto

### 1. Verifica File Necessari

Assicurati di avere:
- ✅ `index.html` nella root
- ✅ Cartelle `css/`, `js/` con i file
- ✅ `.gitignore` configurato
- ✅ Nessun file sensibile (`.env`)

### 2. Crea/Aggiorna `.gitignore`

Il file `.gitignore` è già configurato, ma verifica che contenga:

```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Test files
test-*.html
test-*.js
*.bat
```

### 3. Scegli la modalità runtime (evita drift)

GitHub Pages serve solo file statici (HTML, CSS, JS). Non esegue `server.js`.

**Modalità A: Static-only (GitHub Pages puro)**
- ✅ Pubblichi solo file statici
- ✅ Nessuna infrastruttura backend da mantenere
- ❌ Endpoint Express non disponibili (`/api/chat`, `/api/search-ai`, `/api/newsletter/*`, `/api/lead`)

**Modalità B: Statico + backend Node separato**
- Frontend su GitHub Pages
- Backend Node su Render/Railway/VPS (o altra piattaforma Node)
- Configura il frontend per puntare al dominio backend (o reverse proxy)

Prima di ogni deploy esegui sempre:

```bash
npm run ci:quality
```

---

## 📦 Setup Git e GitHub

### Passo 1: Inizializza Git Locale

Apri il terminale nella cartella del progetto:

```bash
# Inizializza repository Git
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Initial commit - WebNovis website"
```

### Passo 2: Crea Repository su GitHub

1. **Vai su GitHub**
   - https://github.com/new

2. **Configura Repository**
   ```
   Repository name: webnovis-site
   Description: WebNovis - Agenzia Digitale Completa
   Visibility: Public (necessario per GitHub Pages gratuito)
   
   ❌ NON aggiungere:
   - README
   - .gitignore
   - License
   ```

3. **Crea Repository**
   - Clicca "Create repository"

### Passo 3: Collega Repository Locale a GitHub

Copia i comandi che GitHub ti mostra, oppure usa questi:

```bash
# Aggiungi remote
git remote add origin https://github.com/TUO-USERNAME/webnovis-site.git

# Rinomina branch in main
git branch -M main

# Push iniziale
git push -u origin main
```

**Sostituisci `TUO-USERNAME` con il tuo username GitHub!**

---

## 🌐 Attiva GitHub Pages

### Passo 1: Vai su Settings

1. Apri il repository su GitHub
2. Clicca su **Settings** (in alto)
3. Nella sidebar sinistra, clicca **Pages**

### Passo 2: Configura Source

```
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

Clicca **Save**

### Passo 3: Aspetta il Deploy

- GitHub inizierà automaticamente il deploy
- Vedrai un messaggio: "Your site is ready to be published"
- Dopo 1-2 minuti: "Your site is live at https://TUO-USERNAME.github.io/webnovis-site/"

---

## 🔗 Collega Dominio Personalizzato

### Passo 1: Aggiungi Dominio su GitHub

1. **Sempre in Settings → Pages**
2. **Custom domain**
   - Inserisci: `tuodominio.com`
   - Clicca "Save"

3. **Enforce HTTPS**
   - Aspetta qualche minuto
   - Spunta "Enforce HTTPS"

### Passo 2: Configura DNS sul Provider

Vai sul sito dove hai comprato il dominio (GoDaddy, Namecheap, etc.) e configura:

#### Record A (per dominio principale)

Aggiungi **4 record A** che puntano agli IP di GitHub:

```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600
```

#### Record CNAME (per www)

```
Type: CNAME
Name: www
Value: TUO-USERNAME.github.io
TTL: 3600
```

**Sostituisci `TUO-USERNAME` con il tuo username GitHub!**

### Passo 3: Verifica DNS

1. **Aspetta propagazione** (5 minuti - 48 ore, di solito 1-2 ore)
2. **Verifica su** https://dnschecker.org
3. **Testa il sito** su `https://tuodominio.com`

---

## 📁 Struttura File per GitHub Pages

```
webnovis-site/
├── index.html          ← Pagina principale
├── css/
│   ├── style.css
│   ├── social-feed-modern.css
│   └── weby-mobile-fix.css
├── js/
│   ├── main.js
│   └── chat.js
├── .gitignore
├── README.md           ← Opzionale
└── CNAME              ← Creato automaticamente da GitHub
```

---

## 🔄 Aggiornamenti Futuri

Ogni volta che modifichi il sito:

```bash
# 1. Modifica i file
# 2. Aggiungi modifiche
git add .

# 3. Commit
git commit -m "Descrizione modifiche"

# 4. Push
git push

# GitHub Pages aggiorna automaticamente in 1-2 minuti!
```

---

## 🤖 Chatbot su GitHub Pages

### Limitazioni

GitHub Pages serve solo file statici, quindi:
- ❌ Nessun backend Node.js
- ❌ Nessun endpoint Express (`/api/*`)
- ✅ Solo funzionalità client-side e risposte locali predefinite

### Soluzioni

#### Opzione 1: Risposte Locali (Attuale)
Il chatbot usa già risposte predefinite in `js/chat.js`:
- ✅ Funziona subito
- ✅ Nessun costo
- ❌ Risposte limitate

#### Opzione 2: Backend Separato
Deploy backend su una piattaforma Node (es. Render/Railway/VPS):

1. **Crea progetto separato per backend**
   ```
   webnovis-backend/
   ├── server.js
   ├── package.json
   └── .env
   ```

2. **Configura variabili ambiente backend**
   ```env
   GEMINI_API_KEY_CHAT=...
   GEMINI_API_KEY_SEARCH=...
   BREVO_API_KEY=...
   NEWSLETTER_ADMIN_SECRET=...
   ```

3. **Deploy backend**
   ```bash
   npm install
   npm start
   ```

4. **Aggiorna endpoint frontend (chat/search) verso il backend**
   ```javascript
   const API_ENDPOINT = 'https://tuo-backend.example.com/api/chat';
   ```

#### Opzione 3: Servizio Terzo
Usa servizi come:
- Tawk.to (chat live)
- Crisp
- Intercom

---

## ✅ Checklist Deploy

### Pre-Deploy
- [ ] `.gitignore` configurato
- [ ] `.env` NON committato
- [ ] File sensibili esclusi
- [ ] Sito testato localmente
- [ ] Link funzionanti
- [ ] Modalità runtime scelta (solo statico vs statico+backend)
- [ ] `npm run ci:quality` eseguito con esito positivo

### Deploy
- [ ] Git inizializzato
- [ ] Repository GitHub creato
- [ ] Codice pushato
- [ ] GitHub Pages attivato
- [ ] Sito raggiungibile su `.github.io`

### Dominio
- [ ] Dominio aggiunto su GitHub
- [ ] DNS configurato
- [ ] Propagazione completata
- [ ] HTTPS attivo
- [ ] Sito raggiungibile su dominio

### Test
- [ ] Homepage carica
- [ ] Tutte le sezioni visibili
- [ ] Link funzionanti
- [ ] Chat funzionante (risposte locali in static mode, API in node mode)
- [ ] Mobile responsive
- [ ] Performance OK

---

## 🐛 Troubleshooting

### "404 - File not found"

**Causa:** `index.html` non nella root

**Soluzione:**
```bash
# Verifica struttura
ls -la

# index.html deve essere nella root, non in sottocartelle
```

### "Page build failed"

**Causa:** Errore nei file

**Soluzione:**
1. Vai su Actions tab su GitHub
2. Controlla l'errore
3. Correggi e push di nuovo

### "Domain not found"

**Causa:** DNS non configurato o non propagato

**Soluzione:**
1. Verifica record DNS sul provider
2. Usa https://dnschecker.org
3. Aspetta propagazione (fino a 48h)

### "Chat non funziona"

**Causa:** Endpoint backend non raggiungibile oppure sito in modalità static-only

**Soluzione:**
- Se sei su GitHub Pages puro: è normale non avere `/api/*`
- Se usi backend separato: verifica URL endpoint, CORS e variabili ambiente
- Verifica che `getLocalResponse()` funzioni in fallback lato client

### "CSS/JS non caricano"

**Causa:** Path errati

**Soluzione:**
```html
<!-- Usa path relativi -->
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>

<!-- NON usare path assoluti -->
<!-- <link rel="stylesheet" href="/css/style.css"> -->
```

---

## 📊 Monitoraggio

### GitHub Insights

1. **Traffic**
   - Repository → Insights → Traffic
   - Visualizzazioni, visitatori unici

2. **Actions**
   - Repository → Actions
   - Storico deploy

### Google Analytics (Opzionale)

Aggiungi in `<head>` di `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🎯 Ottimizzazioni

### Performance

1. **Minifica CSS/JS** (opzionale)
   ```bash
   npm install -g minify
   minify css/style.css > css/style.min.css
   ```

2. **Comprimi immagini**
   - Usa TinyPNG.com
   - Converti in WebP

3. **Lazy loading**
   ```html
   <img src="image.jpg" loading="lazy">
   ```

### SEO

1. **Sitemap.xml**

   Nel progetto reale la sitemap viene rigenerata da script (non a mano):

   ```bash
   npm run build:sitemap
   ```

   Esempio minimale valido (senza `priority`/`changefreq`):

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://tuodominio.com/</loc>
       <lastmod>2024-01-01</lastmod>
     </url>
   </urlset>
   ```

2. **robots.txt**
   ```
   User-agent: *
   Allow: /
   Sitemap: https://tuodominio.com/sitemap.xml
   ```

3. **Meta tags** (già presenti in `index.html`)

---

## 💰 Costi

### GitHub Pages
- ✅ **Gratis** per repository pubblici
- ✅ Bandwidth illimitato
- ✅ Deploy automatici
- ✅ HTTPS gratuito

### Dominio
- 💰 $10-15/anno (dipende dal provider)

### Totale
- **$10-15/anno** (solo dominio)

---

## 🔐 Sicurezza

### File Sensibili

Verifica che `.gitignore` escluda:
```
.env
.env.*
*.key
*.pem
node_modules/
```

### HTTPS

- ✅ Automatico con GitHub Pages
- ✅ Certificato SSL gratuito
- ✅ Rinnovo automatico

---

## 📚 Risorse Utili

- **GitHub Pages Docs:** https://docs.github.com/pages
- **Custom Domain:** https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS Checker:** https://dnschecker.org
- **Git Docs:** https://git-scm.com/doc

---

## 🎉 Prossimi Passi

1. ✅ Segui questa guida
2. ✅ Deploy su GitHub Pages
3. ✅ Collega dominio
4. ✅ Testa tutto
5. ✅ Condividi il sito!

---

**Tempo totale:** 10-15 minuti + propagazione DNS
**Difficoltà:** ⭐☆☆☆☆ Molto Facile
**Costo:** Gratis (+ dominio)
