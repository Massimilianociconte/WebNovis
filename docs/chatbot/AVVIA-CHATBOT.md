# 🤖 Come Avviare il Chatbot con ChatGPT

## Situazione Attuale

Il chatbot **è già configurato** per usare ChatGPT, ma al momento usa risposte predefinite perché il server Node.js non è avviato.

## 🚀 Avvio Rapido (3 Passi)

### 1. Installa le Dipendenze

Apri il terminale nella cartella del progetto ed esegui:

```bash
npm install
```

Questo installerà:
- `express` - Server web
- `openai` - SDK per ChatGPT
- `dotenv` - Gestione variabili ambiente
- `cors` - Permessi cross-origin

### 2. Configura la Chiave API

Apri il file `.env` e inserisci la tua chiave API di OpenAI:

```env
OPENAI_API_KEY=sk-proj-tua-chiave-qui
```

**Dove trovare la chiave:**
1. Vai su https://platform.openai.com/api-keys
2. Crea una nuova chiave API
3. Copiala nel file `.env`

### 3. Avvia il Server

```bash
npm start
```

oppure

```bash
node server.js
```

Vedrai:
```
🚀 Server running on http://localhost:3000
💬 Chat API ready at http://localhost:3000/api/chat
```

## ✅ Verifica Funzionamento

1. Apri il sito (index.html)
2. Clicca sul bottone chat "Parla con Weby"
3. Scrivi un messaggio
4. Se vedi risposte intelligenti → **ChatGPT funziona!** ✅
5. Se vedi risposte predefinite → Server non avviato ⚠️

## 🔍 Debugging

### Il server non parte?

**Errore: "Cannot find module 'express'"**
```bash
npm install
```

**Errore: "OPENAI_API_KEY is not set"**
- Controlla che il file `.env` esista
- Verifica che la chiave sia corretta
- Riavvia il server

**Errore: "Port 3000 already in use"**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <numero> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Il chatbot non risponde?

1. **Verifica che il server sia avviato**
   - Apri http://localhost:3000/api/chat nel browser
   - Dovresti vedere: `{"error":"Method not allowed"}`

2. **Controlla la console del browser**
   - Premi F12
   - Vai su "Console"
   - Cerca errori tipo "Failed to fetch"

3. **Verifica l'endpoint**
   - In `js/chat.js` cerca:
   ```javascript
   const API_ENDPOINT = 'http://localhost:3000/api/chat';
   ```

## 📝 Configurazione Avanzata

### Cambia Modello AI

Apri `ai-config.js`:

```javascript
export const AI_CONFIG = {
    model: 'gpt-4o-mini',  // Cambia qui
    temperature: 0.7,
    maxTokens: 500
};
```

Modelli disponibili:
- `gpt-4o-mini` - Veloce ed economico (consigliato)
- `gpt-4o` - Più intelligente ma più costoso
- `gpt-3.5-turbo` - Economico ma meno capace

### Personalizza il Comportamento

Apri `chat-config.json`:

```json
{
    "systemPrompt": "Modifica qui il comportamento di Weby...",
    "personality": {
        "tone": "friendly",
        "style": "professional"
    }
}
```

### Cambia Porta Server

Apri `server.js`:

```javascript
const PORT = process.env.PORT || 3000; // Cambia 3000
```

Poi aggiorna anche in `js/chat.js`:

```javascript
const API_ENDPOINT = 'http://localhost:NUOVA_PORTA/api/chat';
```

## 🌐 Deploy in Produzione

### Opzione 1: Vercel (Consigliato)

1. Crea account su https://vercel.com
2. Installa Vercel CLI:
   ```bash
   npm i -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Aggiungi variabile ambiente su Vercel:
   - Dashboard → Settings → Environment Variables
   - Aggiungi `OPENAI_API_KEY`

### Opzione 2: Heroku

1. Crea account su https://heroku.com
2. Installa Heroku CLI
3. Deploy:
   ```bash
   heroku create nome-app
   heroku config:set OPENAI_API_KEY=tua-chiave
   git push heroku main
   ```

### Opzione 3: VPS (DigitalOcean, AWS, etc.)

1. Carica i file sul server
2. Installa Node.js
3. Configura `.env`
4. Usa PM2 per mantenere il server attivo:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

### Aggiorna Endpoint in Produzione

In `js/chat.js`, cambia:

```javascript
// Sviluppo
const API_ENDPOINT = 'http://localhost:3000/api/chat';

// Produzione
const API_ENDPOINT = 'https://tuo-dominio.com/api/chat';
```

## 💰 Costi ChatGPT

### GPT-4o-mini (Consigliato)
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens
- ~500 conversazioni = $0.10

### GPT-4o
- Input: $2.50 / 1M tokens
- Output: $10.00 / 1M tokens
- ~500 conversazioni = $1.50

### Limiti Gratuiti
- $5 di credito gratuito per nuovi account
- Sufficiente per ~5000-10000 messaggi con gpt-4o-mini

## 🔒 Sicurezza

### Proteggi la Chiave API

**MAI committare `.env` su Git!**

Verifica che `.gitignore` contenga:
```
.env
node_modules/
```

### Rate Limiting

Il server ha già rate limiting integrato:
- Max 20 richieste per IP ogni 15 minuti
- Previene abusi

### CORS

In produzione, limita i domini:

```javascript
// server.js
app.use(cors({
    origin: 'https://tuo-dominio.com'
}));
```

## 📊 Monitoraggio

### Log delle Conversazioni

Il server logga automaticamente:
- Timestamp
- Messaggio utente
- Risposta AI
- Errori

### Costi in Tempo Reale

Controlla su: https://platform.openai.com/usage

## 🆘 Supporto

### Problemi Comuni

**"ChatGPT non risponde"**
1. Server avviato? ✅
2. Chiave API corretta? ✅
3. Credito OpenAI disponibile? ✅
4. Console browser senza errori? ✅

**"Risposte lente"**
- Normale con gpt-4o (2-5 secondi)
- Usa gpt-4o-mini per velocità

**"Errore 429 - Rate Limit"**
- Troppi messaggi in poco tempo
- Aspetta 1 minuto
- Aumenta il rate limit su OpenAI

## 📚 Documentazione Completa

- **README-CHAT.md** - Setup dettagliato
- **MODELLI-AI.md** - Confronto modelli
- **chat-config.json** - Configurazione comportamento
- **ai-config.js** - Configurazione tecnica

## ✨ Funzionalità Attive

Quando il server è avviato, Weby può:
- ✅ Rispondere a domande sui servizi
- ✅ Fornire preventivi personalizzati
- ✅ Spiegare processi e tecnologie
- ✅ Gestire richieste di supporto
- ✅ Mantenere conversazioni contestuali
- ✅ Adattarsi al tono dell'utente

## 🎯 Prossimi Passi

1. ✅ Avvia il server (`npm start`)
2. ✅ Testa il chatbot
3. ✅ Personalizza le risposte in `chat-config.json`
4. ✅ Deploy in produzione
5. ✅ Monitora i costi

---

**Hai bisogno di aiuto?** Controlla i file di documentazione o apri un issue!
