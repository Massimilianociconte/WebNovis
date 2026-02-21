# Guida ai Modelli AI — WebNovis

## Architettura Attuale (Febbraio 2026)

Il progetto utilizza **Google Gemini** come provider AI principale, con Groq come fallback per il blog auto-writer.

### Chiavi API separate per servizio

| Variabile `.env` | Servizio | Modello |
|---|---|---|
| `GEMINI_API_KEY_CHAT` | Chatbot sito | gemini-2.5-flash |
| `GEMINI_API_KEY_SEARCH` | Search bar AI | gemini-2.0-flash |
| `GEMINI_API_KEY_WRITER` | Blog auto-writer | gemini-2.0-flash |
| `GROQ_API_KEY` | Blog auto-writer (fallback) | llama-3.3-70b |

## Modelli in Uso

### Chatbot — gemini-2.5-flash
- **Configurato in**: `ai-config.js`
- **Costo**: Gratuito (free tier Google AI Studio)
- **Velocità**: Molto veloce
- **Qualità**: Eccellente per FAQ, servizi e preventivi
- **Parametri**: temperature 0.7, maxTokens 800, memoria 20 messaggi

### Blog Auto-Writer — gemini-2.0-flash (primario) / Groq llama-3.3-70b (fallback)
- **Configurato in**: `blog/auto-writer.js`
- **Costo**: Gratuito (free tier)
- **Uso**: Generazione automatica articoli SEO/GEO

### Search Bar AI — gemini-2.0-flash
- **Configurato in**: `js/search.js` via `server.js`
- **Costo**: Gratuito (free tier)

## Come Cambiare Modello

Modifica `ai-config.js`:

```javascript
model: 'gemini-2.5-flash', // Cambia qui
```

## Tips

1. **Usa chiavi API separate** per ogni servizio per diluire i consumi del free tier
2. **Limita maxTokens** a 500-800 (già configurato)
3. **Mantieni conversationMemory** a max 20 messaggi
4. **Il fallback locale** si attiva automaticamente se l'API fallisce

## Risorse

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Groq Console](https://console.groq.com/)
