// Configurazione AI condivisa per runtime e script.
// Manteniamo nomi espliciti per evitare hardcode sparsi in server.js e negli script di build.
const models = {
    chat: 'gemini-2.5-flash-lite',
    search: 'gemini-2.5-flash-lite',
    writer: 'gemini-2.5-flash'
};

module.exports = {
    models,

    // Compatibilità con il vecchio consumo della config
    model: models.chat,
    chatModel: models.chat,
    searchModel: models.search,
    writerModel: models.writer,

    // Parametri di generazione
    temperature: 0.7,        // 0.0 = più preciso e deterministico, 1.0 = più creativo
    maxTokens: 800,          // Lunghezza massima della risposta (maxOutputTokens)

    // Comportamento del bot
    systemPromptEnhancement: true, // Usa prompt di sistema avanzato
    conversationMemory: 20,        // Numero di messaggi da ricordare (max 20)

    // Fallback
    useFallbackOnError: true,      // Usa risposte locali se API fallisce

    // API key separation (tutte Gemini, chiavi diverse per diluire i consumi):
    // GEMINI_API_KEY_CHAT   → chatbot (gemini-2.5-flash)
    // GEMINI_API_KEY_SEARCH → search bar AI (gemini-2.5-flash-lite — fast, low-cost)
    // GEMINI_API_KEY_WRITER → auto blog writer (gemini-2.5-flash)
};
