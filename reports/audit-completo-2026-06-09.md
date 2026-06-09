# Audit completo WebNovis — 9 giugno 2026

Analisi dell'intero repository: sicurezza, UX/UI, SEO e GEO (Generative Engine Optimization).
I fix prioritari indicati come **[CORRETTO]** sono già stati applicati ai file.

---

## 1. Quadro generale

Il sito è un progetto molto più maturo della media: pipeline pSEO con governance di indicizzazione a tier (349 URL in sitemap, ~790 pagine in `noindex, follow`), contenuti città unici (~2.300 parole, similarità misurata tra città ~48%), schema.org ricchissimo (Service, FAQPage, City, GeoCircle, Speakable), sitemap e search-index automatici, IndexNow, llms.txt/ai.txt/webnovis-ai-data.json per i crawler AI, test di regressione estesi. Il backend Node (Render) è insolitamente ben difeso: rate limiting, sessioni server-side anti-forgery, injection guard, HMAC per unsubscribe, confronti timing-safe, quota guard sulle API Gemini, CORS in whitelist.

Il limite strutturale è uno: **la produzione è GitHub Pages (statico)**, quindi tutto ciò che vive in `server.js` e `_headers` non esiste sul dominio principale.

---

## 2. Bug corretti in questa sessione

1. **[CORRETTO] Newsletter rotta in produzione** — `js/main.js` (e `main.min.js`) chiamava `fetch('/api/newsletter')` con path relativo: su GitHub Pages l'endpoint non esiste, quindi ogni iscrizione dal widget e dal form contatti falliva silenziosamente. Ora punta al backend Render (`webnovis-chat.onrender.com`), stesso pattern di chat.js/search.js. Il dominio è già in `connect-src` della CSP.
2. **[CORRETTO] 5 immagini rotte in `blog/index.html`** — le card di cyber-security-pmi, cloud-hosting-vs-tradizionale, gdpr-sito-web-conformita, headless-cms-guida e seo-youtube-video puntavano a file mai generati. Rimappate su immagini esistenti in `Img/blog/` (il rebuild dell'indice le preserva via `extractCustomImageMap`).
3. **[CORRETTO] XSS riflesso in `/api/newsletter/preview`** — `topic` e `name` venivano interpolati nell'HTML senza escape. Rischio basso (endpoint protetto da admin secret) ma ora sono escapati.
4. **[CORRETTO] URL non validato nell'email di notifica lead** — l'URL inviato dal form 404 diventava un link cliccabile senza controllo di schema; ora solo `http(s)://` diventa `<a href>`, il resto è testo.
5. **[CORRETTO] Entity-escaping nel prompt Gemini** — `/api/chat` applicava `escapeHtml` al messaggio prima di inviarlo all'AI: "l'azienda" arrivava come "l&#39;azienda", degradando le risposte. Ora si rimuovono i tag HTML senza convertire le entità (l'escaping per il rendering è già a carico del client, verificato in chat.js).
6. **[CORRETTO] `twitter:image` incoerente** — 19 pagine (inclusa la homepage) dichiaravano il logo bianco PNG come twitter:image pur avendo un og:image corretto: card invisibile su X/Twitter. Sincronizzate con il rispettivo og:image.

Verifica: `node --check` su tutti i file modificati + test del repo (security-and-legal, seo-regressions, widget-loader, public-html, internal-linking, pseo-governance, seo-smoke) → **tutti passati**.

---

## 3. Sicurezza — problemi aperti

### 3.1 CRITICO: nessun header di sicurezza in produzione
GitHub Pages **ignora il file `_headers`** (è una convenzione Netlify/Cloudflare Pages). Sul dominio live non esistono quindi CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. In più, nessuno dei redirect 301 di `server.js` (strip UTM, trailing slash, `consulenza-digitale-*` → `consulenze-*`, `/public/`, `/dist/`) è attivo in statico: i vecchi URL `consulenza-digitale-*` oggi rispondono 404 secco, non 301.

**Soluzione consigliata (a costo zero):** migrare l'hosting statico su **Cloudflare Pages**. Il file `_headers` è già pronto e funzionerebbe subito; con un file `_redirects` si recuperano anche i 301 oggi persi. Alternativa: Cloudflare gratuito come proxy davanti a GitHub Pages + Transform Rules per gli header. Questo è il singolo intervento con il miglior rapporto beneficio/sforzo dell'intero audit (sicurezza + trust signal + redirect SEO).

### 3.2 Igiene del repository pubblico
Il repo è pubblico (requisito GitHub Pages free), quindi **ogni file committato è scaricabile dal sito**: `server.js`, `chat-config.json`, e soprattutto i residui di sviluppo nella root (`analysis.txt`, `blog_analysis.txt`, `check_results.txt`, `copy_results.txt`, `contatti-*.txt`, `_extract_precise_index_snippets.js`). Nessun segreto esposto (verificato: `.env` mai committato nella history, nessuna chiave hardcoded — solo placeholder), ma andrebbero rimossi o spostati fuori dalla root. Il `Disallow` in robots.txt non è una protezione: evita l'indicizzazione, non l'accesso.

### 3.3 Note minori
- `chat.js` salva la cronologia in `localStorage` e la ri-renderizza: il percorso è correttamente escapato, nessuna azione necessaria.
- La sanitizzazione dell'AI search (whitelist URL lato server in `sanitizeResult` + escape lato client) è ben fatta.
- Il cron newsletter in-memory su Render free è già documentato come fragile nel codice: un cron esterno (cron-job.org / GitHub Actions) verso `/api/newsletter/send` resta preferibile.

---

## 4. UX/UI — problemi aperti

1. **Cold start del backend Render (free tier)**: la prima risposta della chat/ricerca AI può richiedere 30-50s dopo inattività. Il keep-alive client-side mitiga ma non elimina. Valutare: messaggio di attesa più esplicito al primo invio, o piano Render a pagamento.
2. **Path relativi anomali** in alcune pagine root (`../../js/...` da `index.html`): il browser li risolve per clamping alla root, quindi funzionano, ma sono fragili (si rompono dietro reverse-proxy con sub-path). Da normalizzare in pipeline.
3. **og:image = logo bianco su ~200 articoli blog**: la condivisione social di quasi tutto il blog mostra una card scadente (logo bianco su sfondo trasparente). Estendere `auto-writer.js` per assegnare l'immagine di categoria (`blog-cat-*.webp`) anche a og:image/twitter:image, non solo alla card dell'indice.
4. Accessibilità complessivamente buona (skip-link, aria-label, role, sr-only, combobox per la ricerca). Nessun blocker rilevato nei flussi principali.

---

## 5. SEO — diagnosi e strategia

### 5.1 Il collo di bottiglia reale: autorità (DR 19)
Domain Rating Ahrefs attuale: **19**. Con 349 pagine locali indicizzabili e un'architettura on-page già sopra la media, il fattore limitante per "rankare meglio di tutti" non è più il sito: è il profilo di backlink. Nessun intervento on-page sposterà le posizioni quanto la crescita di autorità. Piano concreto:

- **Locale**: citazioni NAP coerenti su directory italiane (PagineGialle, Cylex, Yelp, Hotfrog, camere di commercio), sponsorizzazioni/eventi a Rho e hinterland, associazioni di categoria (Confcommercio/Confartigianato locali).
- **Digital PR**: i case study del portfolio sono asset linkabili; chiedere ai clienti il link "sito realizzato da WebNovis" nel footer (già prassi di settore, link dofollow da domini reali).
- **Contenuti linkabili**: 1-2 asset "data-driven" l'anno (es. "Osservatorio digitalizzazione PMI hinterland milanese" con dati originali) battono 100 articoli tutorial in capacità di attrarre link e citazioni AI.
- **Guest post mirati** su blog di settore italiani (marketing, impresa locale).

### 5.2 Rischio "scaled content abuse" (priorità alta)
Il cron `daily-blog.yml` genera **10 articoli AI al giorno** (237 già pubblicati). La policy Google di marzo 2024 colpisce esattamente questo pattern: contenuto generato su larga scala senza valore aggiunto. Il rischio non è teorico: una manual action o un demotion algoritmico (HCU) affosserebbe anche le pagine locali buone. Raccomandazioni:

- Ridurre la cadenza a 2-3 articoli/settimana **con revisione umana** prima del publish (il commit automatico diretto su main senza review è il punto debole).
- Aggiungere esperienza reale (screenshot di progetti, dati dei clienti, opinioni firmate) ad almeno gli articoli strategici.
- Consolidare gli articoli sovrapposti esistenti (es. cluster SEO tecnico) in guide pillar aggiornate, con 301 dei duplicati deboli.
- Monitorare in GSC la % di pagine "Scansionata, attualmente non indicizzata": è il termometro di questo rischio.

### 5.3 E-E-A-T
Gli articoli sono firmati "WebNovis Editorial Team" (entità anonima). Per un'agenzia che vende competenza, servono **autori reali**: pagina autore con bio, foto, Person schema con `sameAs` (LinkedIn), firma sugli articoli strategici. È anche un requisito pratico per la GEO: gli LLM citano più volentieri fonti con autore identificabile.

### 5.4 Punti già a posto (da mantenere)
Governance pSEO a tier con noindex (anti-doorway), canonical coerenti, hreflang it-IT, robots.txt con gestione bot AI completa, sitemap auto-rigenerata, IndexNow, dati strutturati estesi, contenuti locali realmente differenziati, nessun titolo duplicato tra le pagine indicizzabili, blog interlinking via cluster. La verifica `lastmod` mostra date plausibili.

---

## 6. GEO (Generative Engine Optimization)

Base già eccellente: `llms.txt` ben strutturato, `ai.txt` con dati fattuali (prezzi, sede, tempi), `webnovis-ai-data.json`, robots.txt che accoglie GPTBot/ClaudeBot/PerplexityBot/ecc., entità Wikidata (Q138340285), FAQPage + Speakable schema, bot-logging per crawl intelligence. Pochi siti italiani di settore hanno questo livello. Per salire ancora:

1. **llms-full.txt**: aggiungere la variante completa (contenuto integrale delle pagine chiave concatenato) accanto all'attuale llms.txt indice — è lo standard emergente che Perplexity e altri preferiscono.
2. **Single source of truth per i fatti**: prezzi e claim sono duplicati tra ai.txt, llms.txt, schema e pagine. Generarli da `data/` in build (come già fate per le pagine geo) per evitare derive: gli LLM penalizzano le incoerenze fattuali tra fonti dello stesso dominio.
3. **Citazioni esterne**: i motori generativi citano ciò che le loro fonti citano. Le stesse azioni della §5.1 (directory, recensioni Google, articoli di terzi che nominano "WebNovis Rho") sono la leva GEO principale. Obiettivo: essere la risposta a "migliore web agency a Rho" su Perplexity/ChatGPT — oggi quella query pesca da directory e liste, quindi bisogna stare in quelle liste.
4. **Recensioni Google Business Profile**: volume e recency delle recensioni GBP sono il segnale locale più citato dagli LLM con browsing. Processo sistematico di richiesta recensioni post-progetto.
5. **Monitoraggio**: ho provato gli endpoint Ahrefs Brand Radar/GSC dal connettore ma il piano attuale non li include ("Insufficient plan"). In alternativa: test manuale mensile di 10-15 prompt su ChatGPT/Perplexity/Gemini ("agenzia web Rho", "quanto costa un sito a Milano", ecc.) registrando se e come WebNovis viene citata + analisi di `bot-access.log` sul backend.

---

## 7. Priorità d'azione

| # | Intervento | Impatto | Sforzo |
|---|-----------|---------|--------|
| 1 | Migrazione statico → Cloudflare Pages (header + redirect attivi) | Alto (sicurezza+SEO) | Basso |
| 2 | Ridurre cadenza blog AI + review umana + consolidamento | Alto (rischio esistenziale SEO) | Medio |
| 3 | Piano link building / citazioni locali (DR 19 → 30+) | Altissimo | Continuativo |
| 4 | Autori reali + Person schema su articoli strategici | Medio-alto | Basso |
| 5 | og:image di categoria sugli articoli blog (auto-writer) | Medio | Basso |
| 6 | llms-full.txt + fatti generati da single source | Medio (GEO) | Basso |
| 7 | Pulizia file di sviluppo dalla root pubblica | Basso | Minimo |
| 8 | Recensioni GBP sistematiche | Alto (local+GEO) | Continuativo |

I fix del §2 sono già nel working tree: ricordati di committare e pushare (la newsletter in produzione resta rotta finché il fix di `main.min.js` non è deployato).
