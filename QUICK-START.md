# 🚀 Quick Start - Chat con ChatGPT

## Setup in 5 minuti

### 1️⃣ Installa dipendenze
```bash
npm install
```

### 2️⃣ Configura API Key (Opzionale)

**Con ChatGPT:**
```bash
copy .env.example .env
```
Poi modifica `.env` e inserisci la tua API key da https://platform.openai.com/api-keys

**Senza ChatGPT:**
Salta questo step - userà risposte predefinite

### 3️⃣ Personalizza prezzi e info

Modifica `chat-config.json` con i tuoi dati reali

### 4️⃣ Avvia il server
```bash
npm start
```

### 5️⃣ Testa!

Apri http://localhost:3000 e clicca sul pulsante chat 💬

## 🧪 Test Rapido

Apri http://localhost:3000/test-chat.html per testare l'API direttamente

## 📝 Domande di Test

Prova a chiedere:
- "Quanto costa un sito web?"
- "Quali servizi offrite?"
- "Vorrei un preventivo per un e-commerce"
- "Gestite anche i social media?"

## ⚙️ Configurazione Produzione

Quando sei pronto per il deploy:

1. **Cambia l'URL in `js/chat.js`:**
   ```javascript
   const API_ENDPOINT = 'https://tuo-dominio.com/api/chat';
   ```

2. **Deploy su Vercel (Gratis):**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Aggiungi la variabile d'ambiente su Vercel:**
   - Dashboard > Settings > Environment Variables
   - Aggiungi `OPENAI_API_KEY`

## 💡 Tips

- **Costi:** Con gpt-4o-mini spendi ~$0.15 per 1000 messaggi
- **Fallback:** Se ChatGPT non è disponibile, usa risposte locali automaticamente
- **Personalizzazione:** Modifica `chatbotInstructions` in `chat-config.json` per cambiare il tono

## 🆘 Problemi?

- Server non parte? → Verifica che la porta 3000 sia libera
- Chat non risponde? → Controlla la console del browser (F12)
- Errore API? → Verifica che l'API key sia corretta

## 📚 Documentazione Completa

Leggi `README-CHAT.md` per istruzioni dettagliate
