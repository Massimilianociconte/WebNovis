# 🔍 Crawl Audit — Report di Implementazione

**Sito:** webnovis.com  
**Documento analizzato:** `docs/crawl_audit_webnovis_v2.docx`  
**Data analisi:** 24 Febbraio 2026  
**Periodo dati GSC:** 26 Nov 2025 — 22 Feb 2026

---

## 📊 Problemi Identificati nel Report vs Stato Reale

| # | Problema dal Report | Verificato? | Stato Prima | Fix Applicato |
|---|---------------------|-------------|-------------|---------------|
| 1 | Solo 38.8% HTML sul totale richieste (CSS/JS cannibalizzano budget) | ✅ **CONFERMATO** — 46 ref CSS duplicati + nessun hash nei filename | CSS scaricati 2x da Googlebot | **RISOLTO** |
| 2 | 7.2% redirect 301 | ✅ Parzialmente — sitemap e link interni già puliti, redirect legacy portfolio corretti | Sitemap OK, link interni OK | Già a posto |
| 3 | www vs non-www (5% spreco) | ✅ **CONFERMATO** — nessun redirect server-side | 31 req su non-www sprecate | **RISOLTO** |
| 4 | 22.6% "Altro tipo di agente" | ⚠️ **PARZIALE** — Il 22.6% in GSC si riferisce a crawler Google interni (AdsBot, feedfetcher), non a terze parti. Risparmio reale dal blocco AdsBot/Storebot: ~5-8% | ~30-50 req/settimana | **PARZIALE** |
| 5 | 1.1% errori 404 | ⚠️ Da monitorare in GSC | Serve verifica URL specifici | Handler 410 pronto |
| 6 | Scoperta 24% vs Aggiornamento 76% | ℹ️ Fisiologico post-rilancio | Si normalizzerà da solo | IndexNow implementato |

---

## 🔧 Fix Implementati

### FIX 1: Rimozione CSS Duplicati (P0 — Impatto Molto Alto)

**Problema:** 46 riferimenti CSS duplicati in 21 pagine HTML. Ogni pagina referenziava lo stesso file CSS due volte: una volta con `?v=1.5` e una volta senza. Googlebot tratta `style.css` e `style.css?v=1.5` come risorse diverse, scaricandole entrambe.

**Impatto crawl budget:** ~46 richieste extra per scansione completa del sito = spreco diretto.

**Fix:**  
- Script: `scripts/fix-duplicate-css-refs.js`
- **46 riferimenti duplicati rimossi** da 21 file
- File impattati: homepage, chi-siamo, contatti, come-lavoriamo, preventivo, cookie-policy, privacy-policy, termini-condizioni, tutte le pagine locali, tutte le pagine agenzia

---

### FIX 2: Content-Hash Cache Busting (P0 — Impatto Molto Alto)

**Problema:** File CSS/JS referenziati senza parametri di versione (o con versioni manuali statiche come `?v=1.5`). Quando Googlebot incontra un URL senza cache busting, ri-scarica il file ad ogni visita anche se il contenuto è immutabile.

**Fix:**  
- Script: `scripts/fix-cache-busting.js`
- **248 riferimenti CSS/JS aggiornati** su 22 file
- Ogni file ora usa un hash MD5 del contenuto effettivo (es. `style.min.css?v=a3f8b2c1`)
- Quando il CSS/JS cambia, basta ri-eseguire lo script per aggiornare automaticamente gli hash

**Impatto stimato:** Riduzione 40-50% delle richieste di risorse accessorie. Con 34 req/giorno, significa ~6-8 pagine HTML in più scansionate al giorno.

**Comando per aggiornare gli hash dopo ogni modifica CSS/JS:**
```bash
node scripts/fix-cache-busting.js
```

---

### FIX 3: Redirect 301 non-www → www (P0 — Impatto Medio)

**Problema:** 31 richieste (5% del crawl budget) dirette a `webnovis.com` (senza www) invece di `www.webnovis.com`. Nessun redirect server-side esisteva.

**Fix:**  
- File: `server.js` linea 135-142
- Aggiunto middleware che in produzione redirige `webnovis.com/*` → `www.webnovis.com/*` con 301 permanente
- Coerente con il `<link rel="canonical">` che punta a `www.webnovis.com`

```javascript
// 2.0 Canonical host redirect: non-www → www
app.use((req, res, next) => {
    const host = req.hostname || req.headers.host;
    if (isProd && host === 'webnovis.com') {
        return res.redirect(301, `https://www.webnovis.com${req.originalUrl}`);
    }
    next();
});
```

**Impatto stimato:** Recupero 5% crawl budget + consolidamento segnali SEO su un unico host.

---

### FIX 4: Blocco Bot Non Necessari (P2 — Impatto Basso-Medio)

**Problema:** Il 22.6% di "Altro tipo di agente" nei dati GSC si riferisce a **crawler Google interni** (AdsBot, feedfetcher, Storebot), non a crawler di terze parti come Ahrefs/Semrush (che non compaiono nelle statistiche GSC). Il risparmio reale dal blocco è quindi **5-8%**, non 20%.

**Fix:**  
- File: `robots.txt` linee 78-108
- Bloccati (solo crawler Google non necessari):
  - `AdsBot-Google` — crawler per verifica landing page Google Ads
  - `AdsBot-Google-Mobile` — versione mobile di AdsBot
  - `Storebot-Google` — crawler per Google Merchant/Shopping
- **NON bloccati** (necessari per monitoraggio SEO in fase link building):
  - `SemrushBot` — ammesso con `Crawl-delay: 10`
  - `AhrefsBot` — ammesso con `Crawl-delay: 10`
- Mantenuto attivo: `Google-InspectionTool` (necessario per ispezione URL in GSC)

**⚠️ ATTENZIONE:** Se in futuro si attivano campagne Google Ads, rimuovere il blocco su `AdsBot-Google`.

**⚠️ NOTA:** Non bloccare mai AhrefsBot/SemrushBot durante una fase attiva di link building — servono per monitorare il profilo backlink e le posizioni in SERP.

**Impatto stimato:** Recupero ~5-8% crawl budget Google (solo AdsBot/Storebot).

---

### FIX 5: IndexNow — Segnalazione Proattiva (P2 — Impatto Medio)

**Problema:** Il sito dipende esclusivamente dal crawl passivo di Googlebot per scoprire nuovi contenuti. Con un crawl budget ancora basso (34 req/giorno), i nuovi articoli potrebbero impiegare giorni per essere scoperti.

**Fix:**  
- Key file: `fcba07953b913918408db7ab2f9331dc.txt` (root del sito)
- Script: `scripts/indexnow-notify.js`
- npm scripts aggiunti a `package.json`

**Comandi disponibili:**
```bash
# Notifica URL specifici
npm run indexnow -- https://www.webnovis.com/blog/nuovo-articolo.html

# Notifica tutti gli URL della sitemap (prima sottomissione)
npm run indexnow:all

# Notifica solo URL modificati negli ultimi 7 giorni
npm run indexnow:recent
```

**Motori supportati da IndexNow:** Bing, Yandex, Seznam, Naver. Google non supporta ancora IndexNow ma potrebbe in futuro.

**Workflow consigliato:** Dopo ogni pubblicazione di un nuovo articolo:
1. `npm run build:sitemap` (rigenera sitemap)
2. `npm run indexnow:recent` (notifica motori di ricerca)

---

### FIX 6: Handler 410 Gone (P1 — Impatto Basso)

**Problema:** Gli URL che restituiscono 404 continuano ad essere rivisitati da Googlebot (1.1% delle richieste). Per URL definitivamente rimossi, un 410 Gone è più forte di un 404 — dice esplicitamente a Google di rimuovere l'URL dall'indice e smettere di visitarlo.

**Fix:**  
- File: `server.js` linee 210-221
- Set `goneUrls` con URL placeholder da sostituire con quelli reali da GSC

**Azione richiesta:** Controllare in **GSC > Copertura > Escluse > Non trovata (404)** e aggiungere gli URL effettivi al set `goneUrls` in `server.js`.

---

## 📈 Impatto Complessivo Stimato

| Metrica | Prima | Dopo Fix | Variazione |
|---------|-------|----------|------------|
| % HTML sul totale richieste | 38.8% | ~55-60% | +16-21pp |
| Richieste CSS/JS duplicate | ~46/scansione | 0 | -100% |
| Crawl budget su non-www | 5% sprecato | 0% | -5pp |
| Crawl budget su AdsBot/Storebot | ~5-8% sprecato | ~0% | -5-8pp |
| Pagine HTML scansionate/giorno | ~13 | ~22-28 | +70-115% |

**Proiezione:** Con questi fix, il crawl budget effettivo per pagine HTML dovrebbe quasi raddoppiare a parità di richieste totali.

---

## 📋 Checklist Post-Deploy

- [ ] Verificare che il redirect non-www → www funzioni in produzione (`curl -I http://webnovis.com`)
- [ ] Verificare che il key file IndexNow sia accessibile (`curl https://www.webnovis.com/fcba07953b913918408db7ab2f9331dc.txt`)
- [ ] Eseguire `npm run indexnow:all` per la prima sottomissione a IndexNow
- [ ] Controllare GSC > Copertura > 404 e aggiungere URL al set `goneUrls`
- [ ] Monitorare GSC Crawl Stats per 2 settimane per verificare miglioramento % HTML
- [ ] Se si attivano Google Ads: rimuovere blocco AdsBot-Google da robots.txt
- [ ] Dopo ogni modifica CSS/JS: eseguire `node scripts/fix-cache-busting.js` per aggiornare hash

---

## 📁 File Modificati/Creati

| File | Azione | Descrizione |
|------|--------|-------------|
| `server.js` | Modificato | Redirect non-www, handler 410 Gone, IndexNow key in publicFiles |
| `robots.txt` | Modificato | Blocco AdsBot/Storebot; Ahrefs/Semrush ammessi con Crawl-delay: 10 |
| `package.json` | Modificato | Script npm indexnow |
| `fcba07953b913918408db7ab2f9331dc.txt` | Creato | Key file IndexNow |
| `scripts/indexnow-notify.js` | Creato | Script notifica IndexNow |
| `scripts/fix-duplicate-css-refs.js` | Creato | Script rimozione CSS duplicati |
| `scripts/fix-cache-busting.js` | Creato | Script hash cache busting |
| 21 pagine HTML | Modificate | Rimossi 46 CSS duplicati |
| 22 pagine HTML | Modificate | 248 ref CSS/JS con content-hash |
