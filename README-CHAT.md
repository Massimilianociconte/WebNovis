# 🤖 Integrazione ChatGPT per WebNovis

## 📋 Setup Completo

### 1. Installa Node.js
Se non l'hai già, scarica Node.js da: https://nodejs.org/

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura l'API Key di OpenAI

#### Opzione A: Con ChatGPT (Consigliato)
1. Vai su https://platform.openai.com/api-keys
2. Crea un account o fai login
3. Crea una nuova API key
4. Copia il file `.env.example` in `.env`:
   ```bash
   copy .env.example .env
   ```
5. Apri `.env` e inserisci la tua API key:
   ```
   OPENAI_API_KEY=sk-tua-chiave-qui
   ```

#### Opzione B: Senza ChatGPT (Risposte Locali)
Se non vuoi usare ChatGPT, il sistema funzionerà comunque con risposte predefinite locali.

### 4. Personalizza le informazioni

Modifica il file `chat-config.json` con:
- ✏️ I tuoi prezzi reali
- 📞 Il tuo numero di telefono
- 📧 La tua email
- 🎯 Informazioni specifiche sui tuoi servizi

### 5. Avvia il server

```bash
npm start
```

Il server partirà su http://localhost:3000

### 6. Testa la chat

1. Apri il browser su http://localhost:3000
2. Clicca sul pulsante chat in basso a destra
3. Prova a chiedere:
   - "Quali sono i vostri prezzi?"
   - "Quanto costa un sito web?"
   - "Offrite servizi di social media?"

## 🚀 Deploy in Produzione

### Opzione 1: Vercel (Consigliato - Gratis)

1. Crea un account su https://vercel.com
2. Installa Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Aggiungi la variabile d'ambiente:
   - Vai su Vercel Dashboard > Settings > Environment Variables
   - Aggiungi `OPENAI_API_KEY` con la tua chiave

### Opzione 2: Heroku

1. Crea un account su https://heroku.com
2. Installa Heroku CLI
3. Deploy:
   ```bash
   heroku create webnovis-chat
   heroku config:set OPENAI_API_KEY=sk-tua-chiave
   git push heroku main
   ```

### Opzione 3: VPS (DigitalOcean, AWS, etc.)

1. Carica i file sul server
2. Installa Node.js sul server
3. Installa PM2 per gestire il processo:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

## 🔧 Configurazione Avanzata

### Cambia il modello ChatGPT

Nel file `server.js`, cerca la sezione `model:` e scegli:

```javascript
// CONSIGLIATO - Migliore rapporto qualità/prezzo
model: 'gpt-4o-mini', // ~$0.15/1M tokens - Veloce ed economico

// ALTERNATIVE
model: 'gpt-4o', // ~$2.50/1M tokens - Più intelligente
model: 'gpt-4-turbo', // ~$10/1M tokens - Molto intelligente
model: 'gpt-3.5-turbo', // ~$0.50/1M tokens - Vecchio ma economico
```

**Quale scegliere?**
- **Startup/Budget limitato**: `gpt-4o-mini` o `gpt-3.5-turbo`
- **Qualità premium**: `gpt-4o` o `gpt-4-turbo`
- **Uso intensivo**: `gpt-4o-mini` (migliore rapporto qualità/prezzo)

### Modifica il comportamento del bot

Modifica il campo `chatbotInstructions` in `chat-config.json` per cambiare il tono e lo stile delle risposte.

### Aggiungi più informazioni

Aggiungi nuove sezioni in `chat-config.json` e il bot le userà automaticamente.

## 💰 Costi Stimati

**Per 1000 messaggi (circa 100 conversazioni):**
- **gpt-4o-mini**: ~$0.15 ⭐ CONSIGLIATO
- **gpt-4o**: ~$2.50
- **gpt-4-turbo**: ~$10
- **gpt-3.5-turbo**: ~$0.50

**Esempio mensile (100 conversazioni/giorno = 3000 messaggi/mese):**
- **gpt-4o-mini**: ~$0.45/mese 🎉
- **gpt-4o**: ~$7.50/mese
- **gpt-4-turbo**: ~$30/mese

**Esempio alto volume (500 conversazioni/giorno = 15000 messaggi/mese):**
- **gpt-4o-mini**: ~$2.25/mese
- **gpt-4o**: ~$37.50/mese

## 🔒 Sicurezza

✅ L'API key è sul server, mai esposta al client
✅ CORS configurato per accettare solo il tuo dominio
✅ Rate limiting per prevenire abusi (da implementare se necessario)

## 🐛 Troubleshooting

### La chat non si apre
- Controlla la console del browser (F12)
- Verifica che il server sia avviato

### "Backend non disponibile"
- Verifica che il server sia in esecuzione
- Controlla che l'URL in `js/chat.js` sia corretto
- In produzione, cambia `http://localhost:3000` con il tuo dominio

### Risposte generiche
- Verifica che l'API key sia corretta
- Controlla i log del server per errori
- Verifica di avere credito sul tuo account OpenAI

## 📞 Supporto

Per domande o problemi, contatta il team di sviluppo.

## 🎉 Funzionalità Future

- [ ] Salvataggio conversazioni nel database
- [ ] Analytics delle domande più frequenti
- [ ] Integrazione con CRM
- [ ] Notifiche email per nuove conversazioni
- [ ] Supporto multilingua
- [ ] Voice input/output
