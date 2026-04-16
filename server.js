// Backend Node.js per gestire le chiamate a ChatGPT
require('dotenv').config(); // Carica le variabili d'ambiente
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Per timing-safe auth
const aiConfig = require('./ai-config'); // Configurazione AI
const { createSearchAiEngine, normalizePath: normalizeSearchPath } = require('./search-ai-engine');
const { SECURITY_HEADERS, getAllowedCorsOrigins } = require('./config/security-headers');
const { buildCspWithNonce } = require('./config/security-headers');
const { getIndexationDirectivesForPath } = require('./config/pseo-governance');

// Global fetch instance — eagerly imported at boot to avoid cold-start latency
let _fetch;
async function getFetch() {
    if (!_fetch) _fetch = (await import('node-fetch')).default;
    return _fetch;
}
// Pre-warm fetch at startup (non-blocking)
getFetch().catch(() => {});

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

function getRedirectQuerySuffix(req) {
    return req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
}

function resolveDistCanonicalPath(reqPath) {
    if (!reqPath.startsWith('/dist/')) return null;

    const strippedPath = reqPath.replace(/^\/dist/, '');
    const normalizedPath = path.posix.normalize(strippedPath);
    const relativeTarget = normalizedPath.slice(1);

    if (!normalizedPath.startsWith('/')) return null;
    if (!relativeTarget) return '/';

    const fsTarget = path.join(__dirname, relativeTarget);

    let stats;
    try {
        stats = fs.statSync(fsTarget);
    } catch (error) {
        return null;
    }

    if (stats.isDirectory()) {
        return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
    }

    if (!stats.isFile()) return null;

    const safeLegacyExtensions = new Set(['.html', '.xml', '.txt', '.ico', '.json']);
    if (!safeLegacyExtensions.has(path.extname(normalizedPath))) {
        return null;
    }

    if (normalizedPath === '/index.html') return '/';
    if (normalizedPath.endsWith('/index.html')) {
        return normalizedPath.slice(0, -'index.html'.length);
    }

    return normalizedPath;
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

// Rate Limiting per protezione API (HARD REQUIREMENT in production)
let rateLimit;
try {
    rateLimit = require('express-rate-limit');
} catch (e) {
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 FATAL: express-rate-limit is NOT installed. Refusing to start without rate limiting in production.');
        console.error('   Run: npm install express-rate-limit');
        process.exit(1);
    }
    console.warn('⚠️ express-rate-limit non installato. Rate limiting disabilitato (solo dev).');
    rateLimit = null;
}

// ========== SECURITY: IP anonymization (GDPR compliance) ==========
// Truncate last octet (IPv4) or last 80 bits (IPv6) to remove PII
// while preserving enough info for geographic/abuse analysis.
function anonymizeIp(ip) {
    if (!ip) return 'unknown';
    const raw = ip.replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6
    if (raw.includes(':')) {
        // IPv6: keep first 3 groups, zero the rest
        const parts = raw.split(':');
        return parts.slice(0, 3).join(':') + ':0:0:0:0:0';
    }
    // IPv4: zero the last octet
    const parts = raw.split('.');
    if (parts.length === 4) {
        parts[3] = '0';
        return parts.join('.');
    }
    return 'unknown';
}

// ========== SECURITY: Shared prompt-injection guard (defense-in-depth) ==========
// Matches known injection patterns in Italian + English, including:
// - Leetspeak/spacing tricks (i g n o r a, ign0ra)
// - Indirect injection ("traduci:", "ripeti:", "scrivi:")
// - Role-play escalation, jailbreak keywords, DAN mode
// - Multi-turn preamble attacks ("da ora in poi", "nuova personalità")
const INJECTION_PATTERNS = new RegExp([
    // Italian direct
    'ignora\\s*(tutte\\s*)?le\\s*istruzioni',
    'dimentica\\s*(tutte\\s*)?le\\s*(regole|istruzioni)',
    'quali sono le tue istruzioni',
    'dimmi il tuo prompt',
    'mostrami le (istruzioni|regole|configurazione)',
    'ripeti il testo (sopra|precedente)',
    'cosa (dice|c\'è) nel (tuo )?system prompt',
    'da ora in poi (sei|rispondi|comportati|fai)',
    'nuova personalit[àa]',
    'cambia (ruolo|personalit[àa]|comportamento)',
    'rispondi senza (restrizioni|limiti|regole|filtri)',
    // Italian indirect / encoding tricks
    'i\\s+g\\s+n\\s+o\\s+r\\s+a',      // spaced-out "ignora"
    'ign[o0]ra\\s*(tutte)?\\s*le',         // leetspeak "ign0ra"
    'traduci[:\\s].{0,60}ignor',              // indirect via translation
    '(scrivi|ripeti|traduci)[:\\s].{0,60}prompt', // indirect extraction
    // English direct
    'forget\\s*(all\\s*)?instructions',
    'ignore\\s*(all\\s*)?(previous|prior|above)',
    'reveal your (instructions|prompt|system|rules)',
    'repeat the (text|words|instructions) above',
    'what (are|is) your (system )?(prompt|instructions|rules)',
    'show me your (prompt|instructions|config)',
    'you are now',
    'act as (?!un cliente|un\'azienda)',
    'pretend to be',
    'from now on (you are|act|behave|respond)',
    'respond without (restrictions|limits|rules|filters)',
    'new persona',
    // Universal keywords
    'jailbreak',
    'DAN mode',
    'developer mode',
    'bypass (filter|safety|content|restriction)',
    'override (instructions|safety|rules)',
    '\\[system\\]',
    '<\\|im_start\\|>',
    'SUDO mode'
].join('|'), 'i');

const INJECTION_SAFE_RESPONSE_CHAT = 'Sono Weby, l\'assistente di WebNovis! Come posso aiutarti con siti web, grafica o social media? 😊';
const INJECTION_SAFE_RESPONSE_SEARCH = { answer: '', suggestedPages: [], relatedQueries: [] };

// ========== SECURITY: API quota monitoring (prevents runaway spend / abuse) ==========
// Per-key daily counters with configurable warn/hard-cap thresholds.
// Gemini free tier = 1,500 req/day per project. Warn at 80%, block at 100%.
const API_QUOTA = {
    GEMINI_API_KEY_CHAT:   { daily: 1500, warnPct: 0.80 },
    GEMINI_API_KEY_SEARCH: { daily: 1500, warnPct: 0.80 }
};
const apiUsage = new Map(); // key-name → { count, date (YYYY-MM-DD) }

function getApiUsageBucket(keyName) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let bucket = apiUsage.get(keyName);
    if (!bucket || bucket.date !== today) {
        bucket = { count: 0, date: today };
        apiUsage.set(keyName, bucket);
    }
    return bucket;
}

/**
 * Increment usage counter for a Gemini key.
 * Returns { allowed: boolean, remaining: number }.
 * Logs warnings when approaching the daily cap.
 */
function trackApiCall(keyName) {
    const quota = API_QUOTA[keyName];
    if (!quota) return { allowed: true, remaining: Infinity }; // unknown key, no cap
    const bucket = getApiUsageBucket(keyName);
    bucket.count++;
    const remaining = quota.daily - bucket.count;
    const usagePct = bucket.count / quota.daily;

    if (bucket.count >= quota.daily) {
        console.error(`🚨 QUOTA EXCEEDED: ${keyName} hit daily limit (${bucket.count}/${quota.daily}). Blocking further calls.`);
        return { allowed: false, remaining: 0 };
    }
    if (usagePct >= quota.warnPct && (bucket.count % 50 === 0 || bucket.count === Math.ceil(quota.daily * quota.warnPct))) {
        console.warn(`⚠️ QUOTA WARNING: ${keyName} at ${bucket.count}/${quota.daily} (${Math.round(usagePct * 100)}%) — ${remaining} remaining today`);
    }
    return { allowed: true, remaining };
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
const allowedCorsOrigins = getAllowedCorsOrigins(process.env);

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

// 2.0 Canonical host redirect: non-www → www (Ref: CRAWL-AUDIT FIX 3)
app.use((req, res, next) => {
    const host = req.hostname || req.headers.host;
    if (isProd && host === 'webnovis.com') {
        return res.redirect(301, `https://www.webnovis.com${req.originalUrl}`);
    }
    next();
});

// 2.1 Security headers — trust signal + vulnerability prevention
// Per-request CSP nonce: modern browsers enforce nonce over 'unsafe-inline'
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.cspNonce = nonce;
    // Set all static security headers first, then override CSP with nonce
    res.set(SECURITY_HEADERS);
    res.set('Content-Security-Policy', buildCspWithNonce(nonce));
    next();
});

// 2.2 X-Robots-Tag — prevent indexing of API endpoints
app.use((req, res, next) => {
    if (req.path.match(/^\/(api|admin)/)) {
        res.set('X-Robots-Tag', 'noindex, nofollow');
        return next();
    }
    const indexationDirectives = getIndexationDirectivesForPath(req.path);
    if (indexationDirectives === 'noindex, follow') {
        res.set('X-Robots-Tag', indexationDirectives);
    }
    next();
});

// 2.3.1 Deprecated cluster redirects — `consulenza-digitale-*` duplicates `consulenze-*`
// and is fully deprecated (see data/services.json + config/pseo-governance.js).
// This parametric middleware covers all cities without hardcoding individual slugs.
// Runs BEFORE the static file handler so residual HTML files are not served.
app.use((req, res, next) => {
    const match = req.path.match(/^\/consulenza-digitale-([a-z0-9-]+)\.html$/);
    if (match) {
        const query = getRedirectQuerySuffix(req);
        return res.redirect(301, `/consulenze-${match[1]}.html${query}`);
    }
    next();
});

// 2.4 Legacy build-artifact redirects — collapse stale /dist/ URLs to canonical public paths
const legacyPathRedirects = new Map([
    ['/accessibilita-rho.html', '/servizi/accessibilita.html'],
    ['/social-media-rho.html', '/servizi/social-media.html'],
    ['/chiedere-recensioni-clienti', '/blog/chiedere-recensioni-clienti.html'],
    ['/blog/*', '/blog/']
]);

app.use((req, res, next) => {
    const query = getRedirectQuerySuffix(req);
    const distCanonicalPath = resolveDistCanonicalPath(req.path);

    if (distCanonicalPath) {
        return res.redirect(301, distCanonicalPath + query);
    }

    const explicitRedirect = legacyPathRedirects.get(req.path);
    if (explicitRedirect) {
        return res.redirect(301, explicitRedirect + query);
    }

    next();
});

// 2.6 Trailing slash normalization (301)
// Exclude directories that serve index.html via express.static
const trailingSlashExclusions = ['/blog/', '/servizi/', '/agenzia-web/', '/realizzazione-siti-web/', '/zone-servite/'];
app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/') && !trailingSlashExclusions.some(ex => req.path.startsWith(ex))) {
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

// 2.6 Singular/plural location page canonicalization (301)
app.use((req, res, next) => {
    if (req.path === '/agenzie-web-rho.html') {
        const query = getRedirectQuerySuffix(req);
        return res.redirect(301, '/agenzia-web-rho.html' + query);
    }
    next();
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

// 2.7 Strip /public/ prefix — redirect to canonical path (301)
app.use((req, res, next) => {
    if (req.path.startsWith('/public/')) {
        const canonical = req.path.replace(/^\/public/, '');
        const query = getRedirectQuerySuffix(req);
        return res.redirect(301, canonical + query);
    }
    next();
});

// Serve only safe public files (not server code, configs, .env, etc.)
// Core static pages (manually maintained)
const corePublicFiles = ['index.html', 'portfolio.html', 'privacy-policy.html', 'cookie-policy.html', 'termini-condizioni.html', 'chi-siamo.html', 'contatti.html', 'preventivo.html', 'come-lavoriamo.html', 'grazie.html', '404.html', 'robots.txt', 'sitemap.xml', 'manifest.json', 'favicon.ico', 'ai.txt', 'llms.txt', 'webnovis-ai-data.json', 'search-index.json', 'CNAME', '8531a1fa-b8b0-4136-8741-b5895865d3c4.txt'];
// Auto-discover all pSEO pages (geo + service×city) — scales without manual updates
// Must match generate-all-geo.js filter: all services where generateGeoPages !== false
const pseoPatterns = ['agenzia-web-', 'agenzie-web-', 'realizzazione-siti-web-'];
try {
    const svcData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'services.json'), 'utf8'));
    svcData.services
        .filter(s => s.generateGeoPages !== false)
        .forEach(s => pseoPatterns.push(s.slug + '-'));
} catch (e) { /* services.json not available — use base patterns only */ }
const geoFiles = fs.readdirSync(__dirname)
    .filter(f => f.endsWith('.html') && pseoPatterns.some(p => f.startsWith(p)));
const publicFiles = [...corePublicFiles, ...geoFiles];
console.log(`📄 Public files: ${corePublicFiles.length} core + ${geoFiles.length} pSEO = ${publicFiles.length} total`);

const setSharedCacheHeaders = (res, value) => {
    res.set('Cache-Control', value);
    if (isProd) {
        res.set('CDN-Cache-Control', value);
        res.set('Surrogate-Control', value);
    }
};

// 2.4 Static assets with no-cache for development (files use cache-busting ?v= params)
const staticCacheOptions = {
    setHeaders: (res) => {
        if (isProd) {
            setSharedCacheHeaders(res, 'public, max-age=31536000, immutable');
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
const htmlCacheOptions = {
    setHeaders: (res) => {
        if (isProd) {
            setSharedCacheHeaders(res, 'public, max-age=3600, stale-while-revalidate=7200');
            return;
        }
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
};
app.use('/blog', express.static(path.join(__dirname, 'blog'), htmlCacheOptions));
app.use('/agenzia-web', express.static(path.join(__dirname, 'agenzia-web'), htmlCacheOptions));
app.use('/realizzazione-siti-web', express.static(path.join(__dirname, 'realizzazione-siti-web'), htmlCacheOptions));
app.use('/zone-servite', express.static(path.join(__dirname, 'zone-servite'), htmlCacheOptions));
app.use('/servizi', express.static(path.join(__dirname, 'servizi'), htmlCacheOptions));
app.use('/portfolio', express.static(path.join(__dirname, 'portfolio'), htmlCacheOptions));
// AI-discoverable files: open CORS so any AI crawler/tool can fetch them regardless of Origin
const aiOpenFiles = new Set(['robots.txt', 'sitemap.xml', 'ai.txt', 'llms.txt', 'webnovis-ai-data.json']);

publicFiles.forEach(file => {
    app.get('/' + file, (req, res) => {
        if (aiOpenFiles.has(file)) {
            res.set('Access-Control-Allow-Origin', '*');
        }
        if (isProd) {
            if (file.endsWith('.html')) {
                setSharedCacheHeaders(res, 'public, max-age=300, stale-while-revalidate=3600');
            } else {
                setSharedCacheHeaders(res, 'public, max-age=3600, stale-while-revalidate=7200');
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
    setSharedCacheHeaders(res, 'public, max-age=300, stale-while-revalidate=3600');
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/servizi', (req, res) => {
    setSharedCacheHeaders(res, 'public, max-age=300, stale-while-revalidate=3600');
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

// ========== SECURITY: Server-side session store (prevents history forgery) ==========
// The server is the source-of-truth for conversation history.
// Client-sent conversationHistory is IGNORED — only server-tracked history is used.
const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_MAX_MESSAGES = 20;            // max messages per session (matches ai-config)
const SESSION_MAX_CONCURRENT = 1000;        // max concurrent sessions (memory guard)
const chatSessions = new Map();

function getOrCreateSession(sessionId) {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 50) {
        sessionId = crypto.randomBytes(12).toString('hex');
    }
    let session = chatSessions.get(sessionId);
    if (!session) {
        // Evict oldest sessions if at capacity
        if (chatSessions.size >= SESSION_MAX_CONCURRENT) {
            let oldestKey = null, oldestTime = Infinity;
            for (const [key, val] of chatSessions) {
                if (val.lastActivity < oldestTime) { oldestTime = val.lastActivity; oldestKey = key; }
            }
            if (oldestKey) chatSessions.delete(oldestKey);
        }
        session = { history: [], lastActivity: Date.now() };
        chatSessions.set(sessionId, session);
    }
    session.lastActivity = Date.now();
    return { sessionId, session };
}

// Periodic cleanup of expired sessions (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of chatSessions) {
        if (now - val.lastActivity > SESSION_MAX_AGE_MS) chatSessions.delete(key);
    }
}, 5 * 60 * 1000);

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

const searchAiEngine = createSearchAiEngine({ rootDir: __dirname });
console.log(`🔎 Search AI corpus loaded: ${searchAiEngine.corpusSize} documents`);

// ─── Search AI: in-memory cache (TTL 5 min, max 100 entries) ─────────────────
const SEARCH_AI_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SEARCH_AI_CACHE_MAX = 100;
const searchAiCache = new Map();
// In-flight deduplication: coalesce concurrent identical queries into one API call
const searchAiInflight = new Map();

function normalizeSearchQuery(q) {
    return q.toLowerCase().replace(/\s+/g, ' ').trim();
}

function getSearchCacheKey(normalizedQuery, currentPage) {
    return searchAiEngine.getCacheKey(normalizedQuery, currentPage);
}

function pruneSearchCache() {
    if (searchAiCache.size <= SEARCH_AI_CACHE_MAX) return;
    // Evict oldest entries first
    const entries = [...searchAiCache.entries()];
    entries.sort((a, b) => a[1].ts - b[1].ts);
    const toRemove = entries.slice(0, entries.length - SEARCH_AI_CACHE_MAX);
    for (const [key] of toRemove) searchAiCache.delete(key);
}

function sanitizeSearchCurrentPage(value) {
    const normalized = normalizeSearchPath(value || '/');
    return /^\/[a-z0-9\-./]*$/i.test(normalized) ? normalized : '/';
}

// Core AI search logic — shared between cache-miss and deduplication
async function executeSearchAI(sanitizedQuery, currentPage) {
    const retrievedDocs = searchAiEngine.search(sanitizedQuery, currentPage, 8);
    const fallbackResult = searchAiEngine.buildFallbackResponse(sanitizedQuery, retrievedDocs);

    // Quota guard: block if daily limit reached
    const quota = trackApiCall('GEMINI_API_KEY_SEARCH');
    if (!quota.allowed) {
        return fallbackResult;
    }

    const fetch = await getFetch();
    const prompt = searchAiEngine.buildPrompt(sanitizedQuery, currentPage, retrievedDocs);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.searchModel}:generateContent?key=${process.env.GEMINI_API_KEY_SEARCH}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: prompt.systemInstruction }] },
                contents: [{ parts: [{ text: prompt.userPrompt }] }],
                generationConfig: {
                    temperature: 0.25,
                    maxOutputTokens: 512,
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

    return searchAiEngine.sanitizeResult(result, retrievedDocs, sanitizedQuery);
}

// POST /api/search-ai — Intelligent search powered by Gemini (key NEVER exposed to frontend)
app.post('/api/search-ai', searchAiLimiter, async (req, res) => {
    try {
        const { query, currentPage } = req.body;

        if (!query || typeof query !== 'string' || query.length < 3 || query.length > 500) {
            return res.status(400).json({ error: 'Query non valida.' });
        }

        // Sanitize: strip HTML tags, normalize for cache key
        const sanitizedQuery = query.replace(/<[^>]*>/g, '').trim().slice(0, 320);
        const safeCurrentPage = sanitizeSearchCurrentPage(currentPage);
        const cacheKey = getSearchCacheKey(normalizeSearchQuery(sanitizedQuery), safeCurrentPage);

        if (INJECTION_PATTERNS.test(sanitizedQuery)) {
            const safeFallback = searchAiEngine.buildFallbackResponse(
                sanitizedQuery,
                searchAiEngine.search(sanitizedQuery, safeCurrentPage, 8)
            );
            return res.json(safeFallback);
        }

        const GEMINI_API_KEY_SEARCH = process.env.GEMINI_API_KEY_SEARCH;
        if (!GEMINI_API_KEY_SEARCH) {
            const fallback = searchAiEngine.buildFallbackResponse(
                sanitizedQuery,
                searchAiEngine.search(sanitizedQuery, safeCurrentPage, 8)
            );
            return res.json(fallback);
        }

        // Check cache first
        const cached = searchAiCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < SEARCH_AI_CACHE_TTL) {
            return res.json(cached.data);
        }

        // Deduplication: if an identical query is already in-flight, wait for it
        if (searchAiInflight.has(cacheKey)) {
            try {
                const inflightResult = await searchAiInflight.get(cacheKey);
                return res.json(inflightResult);
            } catch {
                // In-flight request failed, fall through to make a new request
            }
        }

        // Execute API call with deduplication
        const promise = executeSearchAI(sanitizedQuery, safeCurrentPage);
        searchAiInflight.set(cacheKey, promise);

        try {
            const sanitizedResult = await promise;

            // Store in cache
            searchAiCache.set(cacheKey, { data: sanitizedResult, ts: Date.now() });
            pruneSearchCache();

            res.json(sanitizedResult);
        } finally {
            searchAiInflight.delete(cacheKey);
        }

    } catch (error) {
        console.error('❌ Search AI error:', error.message);
        const safeQuery = typeof req.body?.query === 'string' ? req.body.query.replace(/<[^>]*>/g, '').trim().slice(0, 320) : '';
        const safeCurrentPage = sanitizeSearchCurrentPage(req.body?.currentPage);
        const fallback = searchAiEngine.buildFallbackResponse(
            safeQuery,
            searchAiEngine.search(safeQuery, safeCurrentPage, 8)
        );
        res.json(fallback);
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
            ip: anonymizeIp(req.ip)
        };
        const logPath = path.join(__dirname, 'leads-log.jsonl');
        try {
            await fs.promises.appendFile(logPath, JSON.stringify(logEntry) + '\n');
        } catch (logErr) {
            console.error('⚠️ Lead log write error:', logErr.message);
        }

        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const hasBrevo = BREVO_API_KEY && BREVO_API_KEY !== 'xkeysib-your-api-key-here';

        if (hasBrevo) {
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
            ip: anonymizeIp(req.ip)
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

function appendChatSessionTurn(session, userMessage, assistantMessage) {
    session.history.push({ role: 'user', content: userMessage });
    session.history.push({ role: 'assistant', content: assistantMessage });
    if (session.history.length > SESSION_MAX_MESSAGES * 2) {
        session.history = session.history.slice(-SESSION_MAX_MESSAGES * 2);
    }
}

// v4.1 Smart routing: only TRIVIAL messages (pure greetings, thanks) get hardcoded
// responses to save API tokens. Everything else goes through Gemini AI.
function getDeterministicChatResponse(message) {
    const lower = String(message || '').toLowerCase().trim();
    if (!lower) return '';

    // Only intercept pure greetings (short, no follow-up question)
    if (/^(ciao|salve|buongiorno|buonasera|hey|hello|hi|hola|salut)[!.\s]*$/i.test(lower)) {
        return "Ciao! Sono Weby, l'assistente AI di WebNovis.\nCi occupiamo di siti web, grafica e social media.\n\nCome posso aiutarti oggi?";
    }

    // Only intercept pure thanks (no follow-up)
    if (/^(grazie|thanks|ok grazie|grazie mille|perfetto grazie|ottimo grazie)[!.\s]*$/i.test(lower)) {
        return "Prego! Se hai altre domande sono qui.\nBuona giornata!";
    }

    // Everything else → Gemini AI
    return '';
}

// Endpoint per la chat (con rate limiting) — Powered by Gemini Flash Lite
// SECURITY: Server-side session store is the ONLY source-of-truth for history.
// Client-sent conversationHistory is IGNORED to prevent history forgery attacks.
app.post('/api/chat', chatLimiter, async (req, res) => {
    try {
        const { message, sessionId: clientSessionId } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Messaggio non valido.' });
        }

        // Sanitize inputs
        const cleanMessage = escapeHtml(message.trim()).slice(0, 500);

        // Server-side prompt injection guard (defense-in-depth, saves tokens on obvious attacks)
        if (INJECTION_PATTERNS.test(cleanMessage)) {
            console.warn('🛡️ Chat injection blocked:', cleanMessage.substring(0, 80));
            return res.json({ response: INJECTION_SAFE_RESPONSE_CHAT });
        }

        // Retrieve or create server-side session (client cannot forge history)
        const { sessionId, session } = getOrCreateSession(clientSessionId);

        console.log(`💬 New message [${sessionId.substring(0, 8)}…]: "${cleanMessage}"`);
        console.log(`📚 Server-side history length: ${session.history.length}`);

        // v4.1 Smart routing: only pure greetings/thanks are handled locally.
        // All substantive questions (prices, services, contacts, etc.) go to Gemini AI.
        const deterministicResponse = getDeterministicChatResponse(cleanMessage);
        if (deterministicResponse) {
            appendChatSessionTurn(session, cleanMessage, deterministicResponse);
            console.log('📋 Smart local response (trivial greeting/thanks)');
            return res.json({ response: deterministicResponse, sessionId });
        }

        const GEMINI_API_KEY_CHAT = process.env.GEMINI_API_KEY_CHAT;

        if (!GEMINI_API_KEY_CHAT) {
            console.log('⚠️ No GEMINI_API_KEY_CHAT found, using local responses');
            const response = getLocalResponse(cleanMessage);
            appendChatSessionTurn(session, cleanMessage, response);
            console.log(`📤 Local response: ${response.substring(0, 50)}...`);
            return res.json({ response, sessionId });
        }

        // Quota guard: block if daily limit reached
        const quota = trackApiCall('GEMINI_API_KEY_CHAT');
        if (!quota.allowed) {
            const fallback = getLocalResponse(cleanMessage);
            appendChatSessionTurn(session, cleanMessage, fallback);
            console.warn('🚨 Chat quota exceeded — serving local fallback');
            return res.json({ response: fallback, sessionId });
        }

        console.log('🤖 Calling Gemini Flash Lite API...');

        const fetch = await getFetch();
        const chatGroundingContext = cleanMessage.length >= 24
            ? searchAiEngine.buildChatGroundingContext(cleanMessage, '/')
            : '';

        // Build Gemini-compatible conversation from SERVER-SIDE history (tamper-proof)
        const systemPrompt = chatGroundingContext
            ? `${cachedSystemPrompt}\n\nCONTESTO INTERNO RILEVANTE:\n${chatGroundingContext}\n\nUsa il contesto solo se pertinente. Se il contesto non basta, dillo chiaramente senza inventare dettagli.`
            : cachedSystemPrompt;
        const contents = [];

        // Add server-tracked conversation history (Gemini uses 'user'/'model' roles)
        for (const msg of session.history) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        // Add current user message
        contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 9000);

        let geminiResponse;
        try {
            geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${aiConfig.chatModel}:generateContent?key=${GEMINI_API_KEY_CHAT}`,
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
                    }),
                    signal: controller.signal
                }
            );
        } finally {
            clearTimeout(timeout);
        }

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

        appendChatSessionTurn(session, cleanMessage, response);

        console.log(`✅ Gemini response: ${response.substring(0, 100)}...`);
        res.json({ response, sessionId });

    } catch (error) {
        console.error('❌ Gemini chat error:', error.message);

        // Graceful fallback: return local response with 200 so chatbot stays functional
        if (aiConfig.useFallbackOnError) {
            const fallback = getLocalResponse(req.body.message);
            const { sessionId, session } = getOrCreateSession(req.body.sessionId);
            appendChatSessionTurn(session, escapeHtml(String(req.body.message || '').trim()).slice(0, 500), fallback);
            console.log('📤 Fallback response sent (Gemini unavailable)');
            return res.json({ response: fallback, sessionId });
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
        res.status(500).json({ error: 'Errore durante l\'invio della newsletter. Riprova.' });
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
                <p><strong style="color:#fff">${email.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))}</strong> è stato rimosso dalla newsletter WebNovis.</p>
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
    console.log(`🤖 Chat Model: ${aiConfig.chatModel} | Search: ${aiConfig.searchModel} | Writer: ${aiConfig.writerModel}`);
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
