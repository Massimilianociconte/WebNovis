/**
 * WebNovis Newsletter Engine
 * 
 * Genera e invia newsletter AI-powered tramite Groq (Llama 3.3) + Brevo.
 * - Groq genera il contenuto personalizzato
 * - Brevo gestisce invio email e lista contatti
 * - Deduplicazione automatica, GDPR compliant
 * 
 * Sicurezza:
 * - API keys solo lato server (mai esposte al client)
 * - Input sanitizzati contro prompt injection
 * - Rate limiting e admin auth sugli endpoint
 * - System prompt separato dai dati utente
 */

const fs = require('fs');
const path = require('path');

// Carica template HTML una sola volta all'avvio
let emailTemplate = '';
try {
    emailTemplate = fs.readFileSync(path.join(__dirname, 'newsletter-template.html'), 'utf8');
} catch (err) {
    console.error('❌ Newsletter template non trovato:', err.message);
}

// Variabili consentite nel template (whitelist anti-injection)
const ALLOWED_TEMPLATE_VARS = ['SUBJECT', 'EDITION_LABEL', 'NOME', 'CONTENT', 'UNSUBSCRIBE_URL'];

// Sanitizza input utente per prevenire prompt injection
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/[<>]/g, '')           // Rimuove tag HTML
        .replace(/\{\{.*?\}\}/g, '')    // Rimuove placeholder template
        .replace(/\n{3,}/g, '\n\n')     // Limita newline consecutive
        .trim()
        .slice(0, 200);                 // Limita lunghezza
}

// System prompt per Llama 3.3 — separato dai dati utente
const SYSTEM_PROMPT = `Sei un esperto copywriter per newsletter specializzato in digital marketing, web development e innovazione tecnologica. Scrivi per conto di WebNovis, agenzia digitale italiana.

REGOLE DI SCRITTURA:
- Tono: Professionale ma caldo e confidenziale, mai generico o robotico
- Stile: Newsletter B2B/B2C, ben strutturato con paragrafi chiari
- Lunghezza: 300-500 parole di contenuto puro (esclusa apertura e chiusura)
- Lingua: Italiano fluente e naturale
- Personalizzazione: Usa il nome del lettore per creare familiarità
- Contenuto: Insider knowledge, trend attuali, consigli pratici e actionable
- Call-to-action: Incluso naturalmente alla fine, non invadente

FORMATO OUTPUT (HTML inline):
- Usa tag <h2> per il titolo principale dell'articolo
- Usa tag <p> per i paragrafi
- Usa <strong> per concetti chiave e <em> per evidenziazioni speciali
- NON generare tag <html>, <head>, <body>, <style> o struttura completa
- NON generare saluti iniziali (es. "Ciao Marco") — vengono inseriti dal template
- NON generare firme o footer — vengono inseriti dal template
- NON usare emoji nel testo
- NON usare liste puntate (<ul>, <li>) — usa solo paragrafi narrativi

ARGOMENTI POSSIBILI (scegli in base al topic richiesto):
- Trend web design e UX
- SEO e ottimizzazione motori di ricerca
- Social media strategy e content marketing
- Branding e identità visiva
- E-commerce e conversioni
- Performance web e Core Web Vitals
- AI applicata al marketing digitale
- Case study e best practices`;

// Genera contenuto newsletter tramite Groq API
async function generateContent(topic) {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY || GROQ_API_KEY === 'gsk_your-api-key-here') {
        throw new Error('GROQ_API_KEY non configurata');
    }

    const safeTopic = sanitizeInput(topic) || 'trend e consigli di digital marketing';

    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Scrivi un articolo newsletter sul seguente argomento: "${safeTopic}". Rivolgiti al lettore in modo diretto. Ricorda: genera SOLO il contenuto HTML (h2 + paragrafi), senza saluti iniziali, firme o struttura HTML completa.`
                }
            ],
            temperature: 0.7,
            max_tokens: 1200,
            top_p: 0.9
        })
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Groq API error: ${data.error.message}`);
    }

    return data.choices[0].message.content;
}

// Costruisce l'HTML finale dall'template + contenuto generato
function buildEmailHTML(vars) {
    if (!emailTemplate) {
        throw new Error('Template email non caricato');
    }

    let html = emailTemplate;

    for (const [key, value] of Object.entries(vars)) {
        if (!ALLOWED_TEMPLATE_VARS.includes(key)) continue;
        const safeValue = key === 'CONTENT' ? value : sanitizeInput(value);
        html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safeValue);
    }

    return html;
}

// Recupera la lista iscritti da Brevo
async function getSubscribers() {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID) || 2;

    if (!BREVO_API_KEY || BREVO_API_KEY === 'xkeysib-your-api-key-here') {
        throw new Error('BREVO_API_KEY non configurata');
    }

    const fetch = (await import('node-fetch')).default;

    const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}/contacts?limit=500&offset=0`,
        {
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Brevo API error: ${data.message || response.statusText}`);
    }

    return {
        count: data.count || 0,
        contacts: (data.contacts || []).map(c => ({
            email: c.email,
            name: (c.attributes && c.attributes.NOME) || ''
        }))
    };
}

// Invia una singola email tramite Brevo Transactional API
async function sendEmail(to, toName, subject, htmlContent) {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'newsletter@webnovis.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'WebNovis';

    const fetch = (await import('node-fetch')).default;

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to, name: toName || '' }],
            subject: subject,
            htmlContent: htmlContent,
            headers: {
                'List-Unsubscribe': `<https://www.webnovis.com/api/newsletter/unsubscribe?email=${encodeURIComponent(to)}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
            }
        })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(`Brevo send error: ${data.message || response.statusText}`);
    }

    return data;
}

// Genera il numero edizione basato su data
function getEditionLabel() {
    const now = new Date();
    const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const weekNum = Math.ceil(now.getDate() / 7);
    return `${months[now.getMonth()]} ${now.getFullYear()} — Settimana ${weekNum}`;
}

// Log invio newsletter (append-only audit trail) - Async JSONL
async function logSend(entry) {
    const logPath = path.join(__dirname, 'newsletter-log.jsonl');
    const logEntry = {
        ...entry,
        timestamp: new Date().toISOString()
    };
    try {
        await fs.promises.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (err) {
        console.error('⚠️ Error writing to newsletter log:', err.message);
    }
}

/**
 * WORKFLOW PRINCIPALE: Genera e invia newsletter a tutti gli iscritti
 * 
 * @param {string} topic - Argomento della newsletter
 * @param {string} subject - Oggetto email
 * @returns {object} Risultato con statistiche
 */
async function sendNewsletter(topic, subject) {
    const startTime = Date.now();

    // 1. Recupera iscritti
    const { count, contacts } = await getSubscribers();

    if (count === 0) {
        return {
            success: true,
            skipped: true,
            message: 'Nessun iscritto alla newsletter. Invio saltato (zero costi LLM).',
            subscriberCount: 0,
            sent: 0
        };
    }

    const editionLabel = getEditionLabel();
    const results = { sent: 0, failed: 0, errors: [] };

    console.log(`🤖 Generazione contenuto newsletter: "${topic}"...`);
    let baseContent = '';
    try {
        baseContent = await generateContent(topic);
    } catch (err) {
        console.error('❌ Errore generazione AI:', err.message);
        return { success: false, error: err.message };
    }

    // 2. Per ogni iscritto: costruisci HTML e invia
    for (const contact of contacts) {
        try {
            const recipientName = contact.name || 'lettore';

            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', process.env.NEWSLETTER_ADMIN_SECRET || 'secret');
            hmac.update(contact.email.toLowerCase().trim());
            const token = hmac.digest('hex');
            
            const unsubscribeUrl = `https://www.webnovis.com/api/newsletter/unsubscribe?email=${encodeURIComponent(contact.email)}&token=${token}`;
            
            const htmlEmail = buildEmailHTML({
                SUBJECT: subject,
                EDITION_LABEL: editionLabel,
                NOME: recipientName,
                CONTENT: baseContent,
                UNSUBSCRIBE_URL: unsubscribeUrl
            });

            // Invia via Brevo
            await sendEmail(contact.email, recipientName, subject, htmlEmail);

            results.sent++;

            // Log audit trail
            await logSend({
                action: 'send',
                email: contact.email,
                topic: topic,
                subject: subject,
                status: 'success'
            });

            // Piccola pausa tra invii per rispettare rate limits Brevo (300/giorno free)
            if (contacts.length > 1) {
                await new Promise(r => setTimeout(r, 200));
            }

        } catch (err) {
            results.failed++;
            results.errors.push({ email: contact.email, error: err.message });

            await logSend({
                action: 'send',
                email: contact.email,
                topic: topic,
                subject: subject,
                status: 'error',
                error: err.message
            });
        }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
        success: true,
        skipped: false,
        subscriberCount: count,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
        duration: `${duration}s`,
        edition: editionLabel
    };
}

// Disiscrizione contatto da Brevo
async function unsubscribeContact(email) {
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID) || 2;

    if (!BREVO_API_KEY) throw new Error('BREVO_API_KEY non configurata');

    const fetch = (await import('node-fetch')).default;

    // Rimuovi dalla lista newsletter (non cancella il contatto)
    const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}/contacts/remove`,
        {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                emails: [email.toLowerCase().trim()]
            })
        }
    );

    const data = await response.json().catch(() => ({}));

    await logSend({
        action: 'unsubscribe',
        email: email,
        status: response.ok ? 'success' : 'error'
    });

    return { success: response.ok, data };
}

module.exports = {
    sendNewsletter,
    getSubscribers,
    generateContent,
    unsubscribeContact,
    getEditionLabel
};
