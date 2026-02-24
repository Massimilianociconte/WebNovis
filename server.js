// Backend Node.js per gestire le chiamate a ChatGPT
require('dotenv').config(); // Carica le variabili d'ambiente
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Per timing-safe auth
const aiConfig = require('./ai-config'); // Configurazione AI

// Global fetch instance
let _fetch;
async function getFetch() {
    if (!_fetch) _fetch = (await import('node-fetch')).default;
    return _fetch;
}

// Utility per escape HTML
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");
}

// Middleware: verifica admin secret per endpoint protetti
function requireAdminAuth(req, res, next) {
    const secret = process.env.NEWSLETTER_ADMIN_SECRET;
    const provided = req.headers['x-admin-secret'] || '';

    if (!secret || secret === 'change-this-to-a-random-secret-string-32chars') {
        return res.status(500).json({ error: 'NEWSLETTER_ADMIN_SECRET non configurato nel .env' });
    }

    if (!provided || provided.length !== secret.length) {
        return res.status(401).json({ error: 'Autenticazione richiesta o non valida.' });
    }

    if (!crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(secret))) {
        return res.status(401).json({ error: 'Autenticazione fallita.' });
    }

    next();
}

// Rate Limiting per protezione API
let rateLimit;
try {
    rateLimit = require('express-rate-limit');
} catch (e) {
    console.warn('⚠️ express-rate-limit non installato. Rate limiting disabilitato.');
    rateLimit = null;
}

console.log('🔧 AI Config loaded:', aiConfig);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// F1-06: Startup check — warn if newsletter secret is still placeholder
const adminSecret = process.env.NEWSLETTER_ADMIN_SECRET;
if (isProd && (!adminSecret || adminSecret === 'change-this-to-a-random-secret-string-32chars')) {
    console.error('🚨 CRITICAL: NEWSLETTER_ADMIN_SECRET is not configured! Newsletter API will reject all requests.');
}

// Brotli/Gzip compression — reduces transfer size ~70% for text assets
let compression;
try {
    compression = require('compression');
    app.use(compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) return false;
            return compression.filter(req, res);
        }
    }));
    console.log('✅ Compression middleware enabled');
} catch (e) {
    console.warn('⚠️ compression not installed. Run: npm install compression');
}
const corsOriginFromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
const allowedCorsOrigins = new Set([
    'https://www.webnovis.com',
    'https://webnovis.com',
    'https://webnovis-chat.onrender.com',
    ...corsOriginFromEnv
]);

// Rate limiter for chat API (30 requests per 15 minutes per IP)
const chatLimiter = rateLimit ? rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 30, // limite di 30 richieste per finestra
    message: {
        error: 'Troppe richieste. Riprova tra qualche minuto.',
        retryAfter: '15 minuti'
    },
    standardHeaders: true,
    legacyHeaders: false
}) : (req, res, next) => next();

// Middleware
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            // Non-browser requests (curl, health checks, server-to-server) lack Origin header.
            // Protection relies on rate-limiting + requireAdminAuth for sensitive endpoints.
            return callback(null, true);
        }

        const isLocalOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
        if (allowedCorsOrigins.has(origin) || isLocalOrigin) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Admin-Secret']
}));

// Trust the first proxy in front of the app (e.g., Nginx, Heroku, Render LB)
app.set('trust proxy', 1);

app.use(express.json({ limit: '16kb' })); // Prevenzione DoS da payload giganti

// === SEO MIDDLEWARE STACK (Ref: SEO-playbook §1, §5) ===

// 2.1 Security headers — trust signal + vulnerability prevention
app.use((req, res, next) => {
    res.set({
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://widget.trustpilot.com https://connect.facebook.net https://www.clarity.ms https://cdn.jsdelivr.net https://web3forms.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://api.web3forms.com https://www.facebook.com; frame-src https://widget.trustpilot.com https://www.facebook.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.web3forms.com; upgrade-insecure-requests",
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-XSS-Protection': '0'
    });
    next();
});

// 2.2 X-Robots-Tag — prevent indexing of API endpoints
app.use((req, res, next) => {
    if (req.path.match(/^\/(api|admin)/)) {
        res.set('X-Robots-Tag', 'noindex, nofollow');
    }
    next();
});

// 2.6 Trailing slash normalization (301)
app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/') && !req.path.startsWith('/blog/') && req.path !== '/servizi/') {
        const query = req.url.slice(req.path.length);
        return res.redirect(301, req.path.slice(0, -1) + query);
    }
    next();
});

// 2.6 UTM/tracking parameter stripping (prevents duplicate content)
app.use((req, res, next) => {
    const stripParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    try {
        const url = new URL(req.url, `https://${req.hostname}`);
        let modified = false;
        stripParams.forEach(p => {
            if (url.searchParams.has(p)) {
                url.searchParams.delete(p);
                modified = true;
            }
        });
        if (modified) return res.redirect(301, url.pathname + url.search);
    } catch (e) { /* malformed URL, continue */ }
    next();
});

// 2.6 Legacy URL canonicalization for portfolio case studies (301)
const legacyPortfolioRedirects = new Map([
    ['/portfolio/Aether-Digital.html', '/portfolio/case-study/aether-digital.html'],
    ['/portfolio/Ember-Oak.html', '/portfolio/case-study/ember-oak.html'],
    ['/portfolio/Lumina-Creative.html', '/portfolio/case-study/lumina-creative.html'],
    ['/portfolio/Muse-Editorial.html', '/portfolio/case-study/muse-editorial.html'],
    ['/portfolio/PopBlock-Studio.html', '/portfolio/case-study/popblock-studio.html'],
    ['/portfolio/Structure-Arch.html', '/portfolio/case-study/structure-arch.html']
]);

app.use((req, res, next) => {
    const canonicalPath = legacyPortfolioRedirects.get(req.path);
    if (!canonicalPath) return next();

    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    return res.redirect(301, canonicalPath + query);
});

// 2.3 Bot detection logging — crawl intelligence for GEO strategy
const botPatterns = new Map([
    ['Googlebot', /Googlebot/i], ['Bingbot', /bingbot/i],
    ['GPTBot', /GPTBot/i], ['ClaudeBot', /ClaudeBot/i],
    ['PerplexityBot', /PerplexityBot/i], ['ChatGPT-User', /ChatGPT-User/i],
    ['OAI-SearchBot', /OAI-SearchBot/i], ['Google-Extended', /Google-Extended/i],
    ['Applebot', /Applebot/i], ['DuckAssistBot', /DuckAssistBot/i]
]);

app.use((req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    for (const [name, pattern] of botPatterns) {
        if (pattern.test(ua)) {
            const entry = JSON.stringify({
                timestamp: new Date().toISOString(),
                bot: name,
                url: req.originalUrl,
                method: req.method
            }) + '\n';
            const logPath = path.join(__dirname, 'bot-access.log');
            fs.appendFile(logPath, entry, (err) => {
                if (err) console.error('⚠️ Bot log write error:', err.message);
            });
            // Basic log rotation: truncate if > 10MB
            try {
                const stats = fs.statSync(logPath);
                if (stats.size > 10 * 1024 * 1024) {
                    fs.writeFileSync(logPath, entry);
                }
            } catch (e) { /* file may not exist yet */ }
            break;
        }
    }
    next();
});

// Serve only safe public files (not server code, configs, .env, etc.)
const publicFiles = ['index.html', 'portfolio.html', 'privacy-policy.html', 'cookie-policy.html', 'termini-condizioni.html', 'chi-siamo.html', 'contatti.html', 'agenzia-web-rho.html', 'agenzie-web-rho.html', 'agenzia-web-milano.html', 'agenzia-web-lainate.html', 'agenzia-web-arese.html', 'agenzia-web-garbagnate.html', 'preventivo.html', 'come-lavoriamo.html', 'grazie.html', '404.html', 'robots.txt', 'sitemap.xml', 'manifest.json', 'favicon.ico', 'ai.txt', 'llms.txt', 'webnovis-ai-data.json', 'search-index.json', 'CNAME', '8531a1fa-b8b0-4136-8741-b5895865d3c4.txt', 'realizzazione-siti-web-rho.html', 'realizzazione-siti-web-arese.html', 'realizzazione-siti-web-pero.html', 'realizzazione-siti-web-lainate.html', 'realizzazione-siti-web-cornaredo.html', 'realizzazione-siti-web-settimo-milanese.html'];
// 2.4 Static assets with no-cache for development (files use cache-busting ?v= params)
const staticCacheOptions = {
    setHeaders: (res) => {
        if (isProd) {
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
            return;
        }
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
};
app.use('/css', express.static(path.join(__dirname, 'css'), staticCacheOptions));
app.use('/js', express.static(path.join(__dirname, 'js'), staticCacheOptions));
app.use('/Img', express.static(path.join(__dirname, 'Img'), staticCacheOptions));
app.use('/fonts', express.static(path.join(__dirname, 'fonts'), staticCacheOptions));

// HTML directories with short cache + stale-while-revalidate
const htmlCacheOptions = { setHeaders: (res) => res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200') };
app.use('/blog', express.static(path.join(__dirname, 'blog'), htmlCacheOptions));
app.use('/servizi', express.static(path.join(__dirname, 'servizi'), htmlCacheOptions));
app.use('/portfolio', express.static(path.join(__dirname, 'portfolio'), htmlCacheOptions));
publicFiles.forEach(file => {
    app.get('/' + file, (req, res) => {
        if (isProd) {
            if (file.endsWith('.html')) {
                res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
            } else {
                res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');
            }
        } else {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
        }
        res.sendFile(path.join(__dirname, file));
    });
});
app.get('/', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/servizi', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    res.sendFile(path.join(__dirname, 'servizi', 'index.html'));
});

// Carica la configurazione
let config;
try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'chat-config.json'), 'utf8'));
} catch (err) {
    console.error('❌ Failed to load chat-config.json:', err.message);
    config = { companyInfo: { email: 'hello@webnovis.com' }, chatbotInstructions: 'Sei Weby, assistente di WebNovis.' };
}

// Crea il system prompt da inviare a ChatGPT
function createSystemPrompt() {
    // TOON (Token-Oriented Object Notation) Helper
    // Ottimizza i dati per risparmiare token e migliorare la comprensione dell'AI
    const toToon = (obj, indent = 0) => {
        const spaces = '  '.repeat(indent);
        let output = '';

        for (const [key, value] of Object.entries(obj)) {
            if (key === 'chatbotInstructions') continue; // Salta istruzioni separate

            // Formatta la chiave (da camelCase a Human Readable)
            const readableKey = key.replace(/([A-Z])/g, ' $1').toUpperCase();

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                output += `${spaces}${readableKey}:\n${toToon(value, indent + 1)}`;
            } else if (Array.isArray(value)) {
                output += `${spaces}${readableKey}:\n`;
                value.forEach(item => {
                    if (typeof item === 'object') {
                        output += `${spaces}  -\n${toToon(item, indent + 2)}`;
                    } else {
                        output += `${spaces}  - ${item}\n`;
                    }
                });
            } else {
                output += `${spaces}${readableKey}: ${value}\n`;
            }
        }
        return output;
    };

    return `${config.chatbotInstructions}

DATI AZIENDALI (Formato TOON - Strict Data):
${toToon(config)}

Usa queste informazioni per rispondere. Mantieni un tono professionale ma cordiale.`;
}

// Cache system prompt at startup (static content, no need to regenerate per-request)
const cachedSystemPrompt = createSystemPrompt();

// Cache 404 page existence at startup (avoid sync I/O on every 404)
const notFoundPath = path.join(__dirname, '404.html');
const has404Page = fs.existsSync(notFoundPath);

// Rate limiter for newsletter API (10 requests per 15 minutes per IP)
const newsletterLimiter = rateLimit ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Troppe richieste. Riprova tra qualche minuto.' },
    standardHeaders: true,
    legacyHeaders: false
}) : (req, res, next) => next();

// Rate limiter for search AI (10 req/min per IP)
const searchAiLimiter = rateLimit ? rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Troppe ricerche AI. Riprova tra un minuto.' },
    standardHeaders: true,
    legacyHeaders: false
}) : (req, res, next) => next();

// POST /api/search-ai — Intelligent search powered by Gemini (key NEVER exposed to frontend)
app.post('/api/search-ai', searchAiLimiter, async (req, res) => {
    try {
        const { query, currentPage } = req.body;

        if (!query || typeof query !== 'string' || query.length < 3 || query.length > 500) {
            return res.status(400).json({ error: 'Query non valida.' });
        }

        // Sanitize: strip HTML tags and trim
        const sanitizedQuery = query.replace(/<[^>]*>/g, '').trim();

        const GEMINI_API_KEY_SEARCH = process.env.GEMINI_API_KEY_SEARCH;
        if (!GEMINI_API_KEY_SEARCH) {
            return res.status(503).json({ error: 'Servizio AI non configurato.' });
        }

        const fetch = await getFetch();

        const prompt = `Sei l'assistente di ricerca intelligente per il sito WebNovis (https://www.webnovis.com).
WebNovis è un'agenzia web a Milano/Rho specializzata in: sviluppo siti web, e-commerce, graphic design, logo e branding, social media management e advertising.

L'utente cerca: "${sanitizedQuery}"
${currentPage ? `Pagina corrente: ${currentPage}` : ''}

Rispondi SOLO con JSON valido:
{
  "answer": "Risposta completa e utile (3-5 frasi, max 500 caratteri). Inserisci link inline nel formato [testo visibile](url) per collegare direttamente alle pagine pertinenti del sito. La risposta deve essere conclusa e non troncata.",
  "suggestedPages": [{"title": "Titolo pagina", "url": "/percorso.html", "relevance": 0.95}],
  "relatedQueries": ["ricerca correlata 1", "ricerca correlata 2"]
}

Pagine disponibili (usa SOLO questi URL nei link inline e in suggestedPages):
- / (Homepage — panoramica servizi e agenzia)
- /servizi/sviluppo-web.html (Sviluppo Siti Web, E-commerce, Landing Page, SEO tecnica)
- /servizi/graphic-design.html (Graphic Design, Logo, Branding, Identità visiva)
- /servizi/social-media.html (Social Media Management, Advertising, Campagne)
- /chi-siamo.html (Chi Siamo, Team, Valori, Storia)
- /contatti.html (Contatti, Richiedi Preventivo Gratuito)
- /portfolio.html (Portfolio lavori e progetti realizzati)
- /blog/ (Blog con articoli su web, design, marketing)

REGOLE IMPORTANTI:
- La risposta in "answer" DEVE essere completa, mai troncata a metà frase.
- Includi almeno 1-2 link inline [testo](url) nella risposta per guidare l'utente.
- Suggerisci SOLO URL dalla lista sopra.
- Rispondi SOLO con JSON valido, nessun testo fuori dal JSON.`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY_SEARCH}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 1024,
                        responseMimeType: 'application/json'
                    }
                }),
                signal: controller.signal
            }
        );
        clearTimeout(timeout);

        if (!geminiRes.ok) {
            throw new Error(`Gemini API error: ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty Gemini response');

        // Robust JSON parsing — handle truncated output from Gemini
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            // Try to extract what we can from truncated JSON
            const answerMatch = text.match(/"answer"\s*:\s*"([^"]*)/);
            const urlMatches = [...text.matchAll(/"url"\s*:\s*"([^"]*)/g)];
            const titleMatches = [...text.matchAll(/"title"\s*:\s*"([^"]*)/g)];
            result = {
                answer: answerMatch ? answerMatch[1] : '',
                suggestedPages: urlMatches.map((m, i) => ({
                    title: titleMatches[i] ? titleMatches[i][1] : '',
                    url: m[1],
                    relevance: 0.8
                })),
                relatedQueries: []
            };
        }

        // Validate and sanitize output — never leak internal data
        const sanitizeInternalPath = (value) => {
            const normalized = String(value || '').trim();
            if (!normalized.startsWith('/')) return '/';
            if (!/^\/[a-z0-9\-./]*$/i.test(normalized)) return '/';
            return normalized;
        };

        res.json({
            answer: String(result.answer || '').slice(0, 600),
            suggestedPages: (result.suggestedPages || []).slice(0, 5).map(p => ({
                title: String(p.title || '').slice(0, 100),
                url: sanitizeInternalPath(String(p.url || '/').slice(0, 200)),
                relevance: Math.min(1, Math.max(0, parseFloat(p.relevance) || 0))
            })),
            relatedQueries: (result.relatedQueries || []).slice(0, 4).map(q => String(q || '').slice(0, 80))
        });

    } catch (error) {
        console.error('❌ Search AI error:', error.message);
        // Return empty result instead of 500 — search AI is non-critical
        res.json({ answer: '', suggestedPages: [], relatedQueries: [] });
    }
});

// Endpoint per il health check (Keep-Alive)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is awake and running! 🚀' });
});

// Endpoint per iscrizione newsletter via Brevo
// Gestisce iscrizioni dal widget newsletter E dal form contatto
// Brevo gestisce automaticamente la deduplicazione dei contatti
app.post('/api/newsletter', newsletterLimiter, async (req, res) => {
    try {
        const { email, name, source } = req.body;

        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !EMAIL_RE.test(email) || email.length > 254) {
            return res.status(400).json({ error: 'Email non valida.' });
        }

        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID) || 2;

        if (!BREVO_API_KEY || BREVO_API_KEY === 'xkeysib-your-api-key-here') {
            console.warn('⚠️ BREVO_API_KEY non configurata. Iscrizione newsletter saltata.');
            return res.status(200).json({
                success: true,
                message: 'Iscrizione registrata (Brevo non configurato).',
                brevoConfigured: false
            });
        }

        const fetch = await getFetch();

        // Brevo API: createContact (con deduplicazione automatica)
        // Se il contatto esiste già, viene aggiornato con le nuove liste
        const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email.toLowerCase().trim(),
                attributes: {
                    NOME: name || '',
                    SOURCE: source || 'website'
                },
                listIds: [BREVO_LIST_ID],
                updateEnabled: true // Deduplicazione: aggiorna se esiste già
            })
        });

        const brevoData = await brevoResponse.json().catch(() => ({}));

        if (brevoResponse.ok || brevoResponse.status === 204) {
            console.log(`✅ Newsletter: ${email} iscritto con successo (source: ${source || 'website'})`);
            return res.json({ success: true, message: 'Iscrizione completata!' });
        }

        // Contatto già esistente nella lista — non è un errore
        if (brevoData.code === 'duplicate_parameter') {
            console.log(`ℹ️ Newsletter: ${email} già iscritto (deduplicazione)`);
            return res.json({ success: true, message: 'Email già iscritta!', duplicate: true });
        }

        console.error('❌ Brevo API error:', brevoData);
        throw new Error(brevoData.message || 'Errore Brevo API');

    } catch (error) {
        console.error('❌ Newsletter error:', error.message);
        res.status(500).json({ error: 'Errore durante l\'iscrizione. Riprova.' });
    }
});

// Rate limiter for lead capture (5 requests per 15 minutes per IP — anti-abuse)
const leadLimiter = rateLimit ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Troppe richieste. Riprova tra qualche minuto.' },
    standardHeaders: true,
    legacyHeaders: false
}) : (req, res, next) => next();

// POST /api/lead — Lead capture from 404 page (and future forms)
// Saves contact to Brevo + sends notification email to admin
app.post('/api/lead', leadLimiter, async (req, res) => {
    try {
        const { email, url, type } = req.body;

        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !EMAIL_RE.test(email) || email.length > 254) {
            return res.status(400).json({ error: 'Email non valida.' });
        }

        // Sanitize inputs
        const cleanEmail = email.toLowerCase().trim();
        const cleanUrl = (url || '').trim().slice(0, 500);
        const leadType = type === 'analisi-sito' ? 'analisi-sito' : 'nuovo-progetto';

        console.log(`🎯 New lead: ${leadType} | ${cleanEmail}${cleanUrl ? ' | ' + cleanUrl : ''}`);

        // 1. Log to file (always works, zero dependency) - Async JSONL per evitare data loss
        const logEntry = {
            timestamp: new Date().toISOString(),
            email: cleanEmail,
            url: cleanUrl || null,
            type: leadType,
            ip: req.ip
        };
        const logPath = path.join(__dirname, 'leads-log.jsonl');
        try {
            await fs.promises.appendFile(logPath, JSON.stringify(logEntry) + '\n');
        } catch (logErr) {
            console.error('⚠️ Lead log write error:', logErr.message);
        }

        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const hasBravo = BREVO_API_KEY && BREVO_API_KEY !== 'xkeysib-your-api-key-here';

        if (hasBravo) {
            const fetch = await getFetch();
            const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID) || 2;
            const senderEmail = process.env.BREVO_SENDER_EMAIL || 'newsletter@webnovis.com';
            const senderName = process.env.BREVO_SENDER_NAME || 'WebNovis';
            const notifyEmail = process.env.BREVO_NOTIFICATION_EMAIL || 'hello@webnovis.com';

            // 2. Save contact to Brevo list
            try {
                await fetch('https://api.brevo.com/v3/contacts', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'api-key': BREVO_API_KEY
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        attributes: {
                            LEAD_TYPE: leadType,
                            SITO_URL: cleanUrl || '',
                            SOURCE: '404-page'
                        },
                        listIds: [BREVO_LIST_ID],
                        updateEnabled: true
                    })
                });
                console.log(`✅ Lead saved to Brevo: ${cleanEmail}`);
            } catch (brevoErr) {
                console.error('⚠️ Brevo contact save error:', brevoErr.message);
            }

            // 3. Send notification email to admin via Brevo Transactional SMTP
            try {
                const subjectLine = leadType === 'analisi-sito'
                    ? `🎯 Nuovo lead 404: Analisi sito — ${cleanUrl}`
                    : `🎯 Nuovo lead 404: Nuovo progetto`;

                const htmlBody = `
                    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e0e0e0;padding:32px;border-radius:16px;">
                        <h2 style="color:#a8b4f8;margin-top:0;">🎯 Nuovo Lead dalla Pagina 404</h2>
                        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                            <tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Tipo</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #222;font-weight:600;">${leadType === 'analisi-sito' ? '🔍 Analisi Sito Esistente' : '🚀 Nuovo Progetto'}</td></tr>
                            <tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Email</td><td style="padding:8px 12px;border-bottom:1px solid #222;"><a href="mailto:${escapeHtml(cleanEmail)}" style="color:#38b6ff;">${escapeHtml(cleanEmail)}</a></td></tr>
                            ${cleanUrl ? `<tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Sito Web</td><td style="padding:8px 12px;border-bottom:1px solid #222;"><a href="${escapeHtml(cleanUrl)}" style="color:#38b6ff;" target="_blank">${escapeHtml(cleanUrl)}</a></td></tr>` : ''}
                            <tr><td style="padding:8px 12px;color:#888;">Data</td><td style="padding:8px 12px;color:#ccc;">${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</td></tr>
                        </table>
                        <p style="color:#666;font-size:13px;margin-top:24px;">Lead catturato dalla pagina 404 di webnovis.com — Rispondi entro 24h.</p>
                    </div>`;

                const brevoMailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'content-type': 'application/json',
                        'api-key': BREVO_API_KEY
                    },
                    body: JSON.stringify({
                        sender: { name: senderName, email: senderEmail },
                        to: [{ email: notifyEmail, name: 'WebNovis Team' }],
                        replyTo: { email: cleanEmail },
                        subject: subjectLine,
                        htmlContent: htmlBody
                    })
                });

                if (brevoMailRes.ok) {
                    console.log(`✅ Lead notification email sent to ${notifyEmail}`);
                } else {
                    const errData = await brevoMailRes.json().catch(() => ({}));
                    console.error('⚠️ Brevo email send error:', errData.message || brevoMailRes.status);
                }
            } catch (mailErr) {
                console.error('⚠️ Lead notification email error:', mailErr.message);
            }
        } else {
            console.warn('⚠️ BREVO_API_KEY non configurata. Lead salvato solo nel log locale.');
        }

        res.json({ success: true, message: 'Lead ricevuto.' });

    } catch (error) {
        console.error('❌ Lead capture error:', error.message);
        res.status(500).json({ error: 'Errore durante l\'invio. Riprova.' });
    }
});

// POST /api/chat-lead — Capture high-intent chat users (fire-and-forget from frontend)
app.post('/api/chat-lead', chatLimiter, async (req, res) => {
    try {
        const { message, sessionId, page, messageCount } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Messaggio mancante.' });
        }

        const cleanMessage = message.replace(/<[^>]*>/g, '').trim().slice(0, 300);
        const cleanPage = (page || '').trim().slice(0, 200);
        const cleanSession = (sessionId || '').trim().slice(0, 50);

        console.log(`🎯 Chat lead intent: "${cleanMessage.substring(0, 60)}..." | page: ${cleanPage} | msgs: ${messageCount}`);

        // Log to file (always) - Async JSONL per evitare data loss
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: cleanMessage,
            sessionId: cleanSession,
            page: cleanPage || null,
            messageCount: messageCount || null,
            ip: req.ip
        };
        const logPath = path.join(__dirname, 'leads-log.jsonl');
        try {
            await fs.promises.appendFile(logPath, JSON.stringify(logEntry) + '\n');
        } catch (logErr) {
            console.error('⚠️ Chat lead log error:', logErr.message);
        }

        // Send email notification via Brevo (non-blocking)
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        if (BREVO_API_KEY && BREVO_API_KEY !== 'xkeysib-your-api-key-here') {
            const fetch = await getFetch();
            const senderEmail = process.env.BREVO_SENDER_EMAIL || 'newsletter@webnovis.com';
            const senderName = process.env.BREVO_SENDER_NAME || 'WebNovis';
            const notifyEmail = process.env.BREVO_NOTIFICATION_EMAIL || 'hello@webnovis.com';

            const htmlBody = `
                <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e0e0e0;padding:32px;border-radius:16px;">
                    <h2 style="color:#a8b4f8;margin-top:0;">💬 Nuovo Lead dal Chatbot Weby</h2>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                        <tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Messaggio</td><td style="padding:8px 12px;color:#fff;border-bottom:1px solid #222;font-weight:600;">${escapeHtml(cleanMessage)}</td></tr>
                        <tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Pagina</td><td style="padding:8px 12px;color:#ccc;border-bottom:1px solid #222;">${escapeHtml(cleanPage) || '—'}</td></tr>
                        <tr><td style="padding:8px 12px;color:#888;border-bottom:1px solid #222;">Messaggi inviati</td><td style="padding:8px 12px;color:#ccc;border-bottom:1px solid #222;">${messageCount || '—'}</td></tr>
                        <tr><td style="padding:8px 12px;color:#888;">Data</td><td style="padding:8px 12px;color:#ccc;">${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</td></tr>
                    </table>
                    <p style="color:#666;font-size:13px;margin-top:24px;">Lead ad alto intento rilevato dal chatbot Weby — considera di ricontattarlo proattivamente.</p>
                </div>`;

            fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': BREVO_API_KEY },
                body: JSON.stringify({
                    sender: { name: senderName, email: senderEmail },
                    to: [{ email: notifyEmail, name: 'WebNovis Team' }],
                    subject: `💬 Lead chatbot: "${cleanMessage.substring(0, 50)}..."`,
                    htmlContent: htmlBody
                })
            }).catch(err => console.error('⚠️ Chat lead email error:', err.message));
        }

        res.json({ ok: true });

    } catch (error) {
        console.error('❌ Chat lead error:', error.message);
        res.status(500).json({ error: 'Errore interno.' });
    }
});

// Endpoint per la chat (con rate limiting) — Powered by Gemini Flash Lite
app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Messaggio non valido.' });
        }
        
        // Valida conversationHistory
        if (!Array.isArray(conversationHistory) || conversationHistory.length > 20) {
             return res.status(400).json({ error: 'Cronologia chat non valida.' });
        }
        
        const validHistory = conversationHistory.filter(msg => 
            msg && typeof msg === 'object' && 
            (msg.role === 'user' || msg.role === 'assistant') && 
            typeof msg.content === 'string' && msg.content.length <= 1000
        );

        // Sanitize inputs
        const cleanMessage = escapeHtml(message.trim()).slice(0, 500);

        // Server-side prompt injection guard (defense-in-depth, saves tokens on obvious attacks)
        const INJECTION_PATTERNS = /ignora\s*(tutte\s*)?le\s*istruzioni|system\s*prompt|quali sono le tue istruzioni|dimmi il tuo prompt|mostrami le istruzioni|ripeti il testo sopra|forget\s*(all\s*)?instructions|ignore\s*(all\s*)?(previous|prior)|reveal your (instructions|prompt)|repeat the (text|words) above|you are now|act as (?!un cliente|un'azienda)|pretend to be|jailbreak|DAN mode/i;
        if (INJECTION_PATTERNS.test(cleanMessage)) {
            return res.json({ response: 'Sono Weby, l\'assistente di WebNovis! Come posso aiutarti con siti web, grafica o social media? 😊' });
        }

        console.log(`💬 New message: "${cleanMessage}"`);
        console.log(`📚 Conversation history length: ${validHistory.length}`);

        const GEMINI_API_KEY_CHAT = process.env.GEMINI_API_KEY_CHAT;

        if (!GEMINI_API_KEY_CHAT) {
            console.log('⚠️ No GEMINI_API_KEY_CHAT found, using local responses');
            const response = getLocalResponse(cleanMessage);
            console.log(`📤 Local response: ${response.substring(0, 50)}...`);
            return res.json({ response });
        }

        console.log('🤖 Calling Gemini Flash Lite API...');

        const fetch = await getFetch();

        // Build Gemini-compatible conversation
        const systemPrompt = cachedSystemPrompt;
        const contents = [];

        // Add conversation history (Gemini uses 'user'/'model' roles)
        for (const msg of validHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: escapeHtml(msg.content) }]
            });
        }

        // Add current user message
        contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY_CHAT}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents,
                    generationConfig: {
                        temperature: aiConfig.temperature,
                        maxOutputTokens: aiConfig.maxTokens,
                        topP: 0.95
                    }
                })
            }
        );

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('❌ Gemini API error:', data.error?.message || geminiResponse.status);
            throw new Error(data.error?.message || `Gemini API error: ${geminiResponse.status}`);
        }

        let response = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!response) {
            throw new Error('Empty Gemini response');
        }

        // CLEANUP: Rimuove eventuali residui di markdown se l'AI non ha obbedito
        response = response.replace(/\*\*/g, '')   // Rimuove grassetto
            .replace(/\#/g, '')      // Rimuove intestazioni
            .replace(/\-\s/g, '• ')  // Sostituisce trattini con pallini
            .replace(/\[.*?\]/g, ''); // Rimuove link markdown

        console.log(`✅ Gemini response: ${response.substring(0, 100)}...`);
        res.json({ response });

    } catch (error) {
        console.error('❌ Gemini chat error:', error.message);

        // Graceful fallback: return local response with 200 so chatbot stays functional
        if (aiConfig.useFallbackOnError) {
            const fallback = getLocalResponse(req.body.message);
            console.log('📤 Fallback response sent (Gemini unavailable)');
            return res.json({ response: fallback });
        }

        res.status(500).json({
            error: 'Si è verificato un errore. Riprova tra poco o contattaci direttamente.'
        });
    }
});

// Funzione di fallback per risposte locali
function getLocalResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('prezzo') || lowerMessage.includes('costo') || lowerMessage.includes('preventivo')) {
        return `Ecco i nostri prezzi principali:

💻 Web Development:
• Landing Page: da €500
• Sito Vetrina: da €1.200
• E-commerce: da €3.500

🎨 Graphic Design:
• Logo: da €150
• Brand Identity: da €450
• Materiale Stampa: preventivo

📱 Social Media:
• Social Start: da €300/mese
• Social Pro: da €600/mese
• Shooting: da €150/sessione

Per un preventivo personalizzato, contattaci a ${config.companyInfo.email}! 💼`;
    }

    if (lowerMessage.includes('servizi') || lowerMessage.includes('cosa fate')) {
        return `Offriamo tre servizi principali:

🌐 **Web Development** - Siti web, e-commerce, web app
🎨 **Graphic Design** - Logo, branding, materiale pubblicitario
📱 **Social Media** - Gestione, contenuti, campagne ads

Quale ti interessa di più? Posso darti maggiori dettagli! ✨`;
    }

    if (lowerMessage.includes('contatt') || lowerMessage.includes('email') || lowerMessage.includes('telefono')) {
        return `Puoi contattarci via email:

📧 Email: ${config.companyInfo.email}

Oppure compila il form nella sezione contatti qui sotto. Rispondiamo entro 24 ore! 🚀`;
    }

    return `Grazie per il tuo messaggio! Per informazioni dettagliate sui nostri servizi e prezzi, scrivici a ${config.companyInfo.email} o compila il form. Il nostro team sarà felice di aiutarti! 💬`;
}

// Endpoint per ottenere la configurazione (opzionale)
app.get('/api/config', requireAdminAuth, (req, res) => {
    const { chatbotInstructions, ...safeConfig } = config;
    res.json(safeConfig);
});

// ========== NEWSLETTER AI ENGINE ==========
const newsletterEngine = require('./newsletter-engine');

// POST /api/newsletter/send — Genera e invia newsletter AI (protetto da admin secret)
// Body: { topic: "argomento", subject: "Oggetto email" }
// Header: X-Admin-Secret: <your-secret>
app.post('/api/newsletter/send', requireAdminAuth, async (req, res) => {
    try {
        const { topic, subject } = req.body;

        if (!topic || !subject) {
            return res.status(400).json({
                error: 'Parametri mancanti.',
                required: { topic: 'Argomento della newsletter', subject: 'Oggetto email' }
            });
        }

        console.log(`📨 Newsletter send request — Topic: "${topic}", Subject: "${subject}"`);

        const result = await newsletterEngine.sendNewsletter(topic, subject);

        console.log(`✅ Newsletter result:`, JSON.stringify(result, null, 2));
        res.json(result);

    } catch (error) {
        console.error('❌ Newsletter send error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/newsletter/preview — Genera anteprima senza inviare (protetto da admin secret)
// Query: ?topic=argomento&name=NomeTest
app.get('/api/newsletter/preview', requireAdminAuth, async (req, res) => {
    try {
        const topic = req.query.topic || 'trend e consigli di digital marketing per il 2026';
        const name = req.query.name || 'Marco';

        console.log(`👁️ Newsletter preview — Topic: "${topic}"`);

        const content = await newsletterEngine.generateContent(topic, name);

        res.setHeader('Content-Type', 'text/html');
        res.send(`
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"><title>Newsletter Preview</title>
            <style>body{background:#0a0a0f;color:#e0e0e0;font-family:sans-serif;padding:40px;max-width:700px;margin:auto}
            h2{color:#fff}p{line-height:1.7;color:#c8c8d0}strong{color:#e8e8f0}em{color:#7B8CC9;font-style:normal;font-weight:600}
            .meta{background:#111;padding:16px;border-radius:8px;margin-bottom:24px;font-size:13px;color:#888}
            .meta strong{color:#7B8CC9}</style></head><body>
            <div class="meta">
                <strong>PREVIEW MODE</strong> — Questa email non è stata inviata<br>
                Topic: ${topic}<br>
                Destinatario test: ${name}<br>
                Edizione: ${newsletterEngine.getEditionLabel()}
            </div>
            <div style="background:#111118;padding:32px;border-radius:16px;border:1px solid rgba(91,106,174,0.15)">
                <p style="color:#b0b0b0">Ciao <strong style="color:#fff">${name}</strong>,</p>
                ${content}
            </div>
            </body></html>
        `);

    } catch (error) {
        console.error('❌ Newsletter preview error:', error.message);
        res.status(500).json({ error: 'Errore durante la generazione dell\'anteprima.' });
    }
});

// GET /api/newsletter/subscribers — Lista iscritti (protetto da admin secret)
app.get('/api/newsletter/subscribers', requireAdminAuth, async (req, res) => {
    try {
        const data = await newsletterEngine.getSubscribers();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Errore durante il recupero degli iscritti.' });
    }
});

// GET /api/newsletter/unsubscribe — Disiscrizione GDPR (pubblico, link nelle email)
app.get('/api/newsletter/unsubscribe', async (req, res) => {
    try {
        const email = req.query.email;
        const token = req.query.token;

        if (!email || !email.includes('@')) {
            return res.status(400).send(`
                <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Errore - WebNovis</title>
                <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
                h2{color:#ef4444;margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>
                <div class="card"><h2>Errore</h2><p>Email non valida. Verifica il link di disiscrizione.</p></div></body></html>
            `);
        }

        // Verifica HMAC token per prevenire disiscrizioni massive malevole
        if (!token) {
             return res.status(403).send(`
                <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Errore Sicurezza - WebNovis</title>
                <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
                h2{color:#ef4444;margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>
                <div class="card"><h2>Errore di sicurezza</h2><p>Token di disiscrizione mancante.</p></div></body></html>
            `);
        }

        const adminSecret = process.env.NEWSLETTER_ADMIN_SECRET;
        if (!adminSecret || adminSecret === 'change-this-to-a-random-secret-string-32chars') {
            return res.status(503).send(`
                <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Errore Configurazione - WebNovis</title>
                <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
                h2{color:#ef4444;margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>
                <div class="card"><h2>Servizio temporaneamente non disponibile</h2><p>La disiscrizione è momentaneamente non configurata. Contattaci a hello@webnovis.com</p></div></body></html>
            `);
        }

        const providedToken = String(token).trim();
        if (!/^[a-f0-9]{64}$/i.test(providedToken)) {
            return res.status(403).send(`
                <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Errore Sicurezza - WebNovis</title>
                <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
                h2{color:#ef4444;margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>
                <div class="card"><h2>Errore di sicurezza</h2><p>Token di disiscrizione non valido o contraffatto.</p></div></body></html>
            `);
        }

        const expectedToken = crypto.createHmac('sha256', adminSecret)
            .update(email.toLowerCase().trim())
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(providedToken), Buffer.from(expectedToken))) {
             return res.status(403).send(`
                <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
                <title>Errore Sicurezza - WebNovis</title>
                <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
                .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
                h2{color:#ef4444;margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>
                <div class="card"><h2>Errore di sicurezza</h2><p>Token di disiscrizione non valido o contraffatto.</p></div></body></html>
            `);
        }

        await newsletterEngine.unsubscribeContact(email);

        res.send(`
            <!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
            <title>Disiscrizione - WebNovis</title>
            <style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
            .card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}
            h2{color:#14b8a6;margin-bottom:12px}p{color:#999;line-height:1.6}a{color:#7B8CC9}</style></head><body>
            <div class="card">
                <h2>Disiscrizione completata</h2>
                <p><strong style="color:#fff">${email.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</strong> è stato rimosso dalla newsletter WebNovis.</p>
                <p>Non riceverai più email da noi. Se è stato un errore, puoi reiscriverti dal nostro <a href="https://www.webnovis.com/contatti.html">sito web</a>.</p>
            </div></body></html>
        `);

    } catch (error) {
        console.error('❌ Unsubscribe error:', error.message);
        res.status(500).send('Errore durante la disiscrizione. Contattaci a hello@webnovis.com');
    }
});

// Cron-like scheduler: controlla e invia newsletter automatica
// Frequenza: settimanale (ogni lunedì alle 9:00 UTC, che corrispondono alle 10:00 o 11:00 in Italia)
const NEWSLETTER_TOPICS = [
    'Le ultime tendenze del web design nel 2026 e come possono migliorare la presenza online delle PMI',
    'SEO pratico: 5 strategie che ogni piccola impresa può implementare oggi per migliorare il posizionamento',
    'Come il branding coerente può trasformare la percezione del tuo business online',
    'Social media marketing: errori comuni delle PMI e come evitarli per massimizzare engagement',
    'E-commerce: ottimizzare le conversioni con design, UX e psicologia del colore',
    'Core Web Vitals e performance: perché la velocità del sito impatta direttamente sul fatturato',
    'Content marketing per PMI: creare contenuti che attraggono clienti senza budget enormi',
    'AI nel marketing digitale: strumenti pratici che ogni azienda può usare oggi'
];

let newsletterCronInterval = null;

function startNewsletterCron() {
    // IMPORTANTE: Questo è un approccio in-memory base. 
    // Su piattaforme PaaS ephemeral (come Render free) si consiglia caldamente di sostituire questo 
    // con un cron trigger esterno (es. cron-job.org o GitHub Actions) che chiami POST /api/newsletter/send
    // passando l'header x-admin-secret.

    if (newsletterCronInterval) clearInterval(newsletterCronInterval);

    // Controlla ogni 5 minuti se è il momento di inviare
    newsletterCronInterval = setInterval(async () => {
        const now = new Date();
        const isMonday = now.getUTCDay() === 1;
        // Target: 9:00 UTC, verifichiamo la finestra 9:00 - 9:09
        const isNineAM = now.getUTCHours() === 9 && now.getUTCMinutes() < 10;

        if (!isMonday || !isNineAM) return;

        // Evita invii doppi: controlla log dell'ultima settimana
        try {
            const logPath = path.join(__dirname, 'newsletter-log.jsonl');
            let logsStr = '';
            try { logsStr = fs.readFileSync(logPath, 'utf8'); } catch { /* nessun log */ }
            
            const logs = logsStr.split('\n').filter(Boolean).map(l => {
                try { return JSON.parse(l); } catch { return null; }
            }).filter(Boolean);

            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const recentSends = logs.filter(l =>
                l.action === 'send' && l.status === 'success' && new Date(l.timestamp) > oneWeekAgo
            );

            if (recentSends.length > 0) {
                return; // Già inviata questa settimana
            }
        } catch { /* procedi comunque */ }

        // Scegli topic rotativo basato sulla settimana dell'anno
        const weekOfYear = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
        const topicIndex = weekOfYear % NEWSLETTER_TOPICS.length;
        const topic = NEWSLETTER_TOPICS[topicIndex];
        const subject = `WebNovis Digest — ${newsletterEngine.getEditionLabel()}`;

        console.log(`⏰ Cron newsletter triggered — Topic: "${topic}"`);

        try {
            const result = await newsletterEngine.sendNewsletter(topic, subject);
            console.log(`✅ Cron newsletter result:`, JSON.stringify(result));
        } catch (error) {
            console.error('❌ Cron newsletter error:', error.message);
        }
    }, 5 * 60 * 1000); // Controlla ogni 5 minuti
}

// 2.5 Custom 404 handler — branded response for unknown paths
app.use((req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        if (has404Page) {
            return res.sendFile(notFoundPath);
        }
        return res.send('<h1>404 — Pagina non trovata</h1><p><a href="/">Torna alla homepage</a></p>');
    }
    res.json({ error: 'Endpoint non trovato', status: 404 });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🔑 Gemini Chat: ${process.env.GEMINI_API_KEY_CHAT ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🔍 Gemini Search: ${process.env.GEMINI_API_KEY_SEARCH ? '✅ Configured' : '❌ Missing'}`);
    console.log(`✍️ Gemini Writer: ${process.env.GEMINI_API_KEY_WRITER ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🤖 Chat Model: gemini-2.5-flash | Search: gemini-2.5-flash`);
    console.log(`📋 Config loaded: ${Object.keys(config).length} sections`);
    console.log(`📬 Newsletter engine: ${process.env.GROQ_API_KEY ? '✅ Groq configured' : '⚠️ GROQ_API_KEY missing'}`);
    console.log(`📨 Brevo: ${process.env.BREVO_API_KEY ? '✅ Configured' : '⚠️ BREVO_API_KEY missing'}`);
    console.log(`🎯 Lead capture: ✅ /api/lead → ${process.env.BREVO_NOTIFICATION_EMAIL || 'hello@webnovis.com'}`);

    // Avvia cron newsletter solo se tutto è configurato
    if (process.env.GROQ_API_KEY && process.env.BREVO_API_KEY &&
        process.env.GROQ_API_KEY !== 'gsk_your-api-key-here' &&
        process.env.BREVO_API_KEY !== 'xkeysib-your-api-key-here') {
        startNewsletterCron();
        console.log(`⏰ Newsletter cron: ✅ Attivo (ogni lunedì alle 9:00)`);
    } else {
        console.log(`⏰ Newsletter cron: ⚠️ Disattivato (configura GROQ_API_KEY e BREVO_API_KEY)`);
    }
});
