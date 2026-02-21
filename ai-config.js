// Configurazione AI per il chatbot — Gemini Flash Lite
module.exports = {
    // Modello Gemini per il chatbot (usato in server.js)
    model: 'gemini-2.5-flash', // Veloce, gratuito, il più capace

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
    // GEMINI_API_KEY_SEARCH → search bar AI (gemini-2.5-flash)
    // GEMINI_API_KEY_WRITER → auto blog writer (gemini-2.5-flash)
};
