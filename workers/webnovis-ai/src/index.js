/**
 * WebNovis AI API — Cloudflare Worker
 * Endpoints: /api/health, /api/chat, /api/chat-lead, /api/search-ai,
 *   /api/newsletter (POST, double opt-in), /api/newsletter/confirm (GET)
 */
import searchIndex from '../data/search-index.json';
import chatConfig from '../data/chat-config.json';
import { createSearchAiEngine, normalizePath, normalizeText } from './search-engine.js';
import { getLocalChatResponse, isPricingIntent } from './catalog.js';

const searchEngine = createSearchAiEngine(searchIndex);

const AI_MODELS = {
  chatPrimary: 'gemini-2.5-flash-lite',
  chatFallback: 'gemini-2.5-flash',
  searchPrimary: 'gemini-2.5-flash-lite',
  searchFallback: 'gemini-2.5-flash'
};

const SESSION_TTL_SECONDS = 30 * 60;
const SESSION_MAX_MESSAGES = 20;
const CHAT_RL_LIMIT = 30;
const CHAT_RL_WINDOW = 15 * 60;
const SEARCH_RL_LIMIT = 20;
const SEARCH_RL_WINDOW = 60;
const NEWSLETTER_RL_LIMIT = 10;
const NEWSLETTER_RL_WINDOW = 15 * 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_ORIGINS = [
  'https://www.webnovis.com',
  'https://webnovis.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8787',
  'http://127.0.0.1:8787'
];

const INJECTION_PATTERNS = new RegExp([
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
  'i\\s+g\\s+n\\s+o\\s+r\\s+a',
  'ign[o0]ra\\s*(tutte)?\\s*le',
  'forget\\s*(all\\s*)?instructions',
  'ignore\\s*(all\\s*)?(previous|prior|above)',
  'reveal your (instructions|prompt|system|rules)',
  'what (are|is) your (system )?(prompt|instructions|rules)',
  'show me your (prompt|instructions|config)',
  'you are now',
  'act as (?!un cliente|un\'azienda)',
  'pretend to be',
  'from now on (you are|act|behave|respond)',
  'jailbreak',
  'DAN mode',
  'developer mode',
  'bypass (filter|safety|content|restriction)',
  'override (instructions|safety|rules)',
  '\\[system\\]',
  '<\\|im_start\\|>'
].join('|'), 'i');

const INJECTION_SAFE_CHAT =
  "Sono Weby, l'assistente AI di WebNovis! Come posso aiutarti con siti web, grafica o social media?";

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      ...extraHeaders
    }
  });
}

function getAllowedOrigins(env) {
  const extra = String(env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...extra]);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = getAllowedOrigins(env);
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
  if (origin && allowed.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (!origin) {
    // non-browser
  } else if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    // Dev only: anchored exact match. Never substring (evil-localhost.com must not match).
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(request, env);
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function clientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function anonymizeIp(ip) {
  if (!ip || ip === 'unknown') return 'unknown';
  const raw = ip.replace(/^::ffff:/, '');
  if (raw.includes(':')) {
    const parts = raw.split(':');
    return parts.slice(0, 3).join(':') + ':0:0:0:0:0';
  }
  const parts = raw.split('.');
  if (parts.length === 4) {
    parts[3] = '0';
    return parts.join('.');
  }
  return 'unknown';
}

async function rateLimit(env, key, limit, windowSeconds) {
  if (!env.SESSIONS) return { allowed: true, remaining: limit };
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const kvKey = `rl:${key}:${bucket}`;
  const current = Number((await env.SESSIONS.get(kvKey)) || '0');
  if (current >= limit) {
    return { allowed: false, remaining: 0 };
  }
  await env.SESSIONS.put(kvKey, String(current + 1), { expirationTtl: windowSeconds + 5 });
  return { allowed: true, remaining: limit - current - 1 };
}

function buildSystemPrompt() {
  const instructions = chatConfig.chatbotInstructions ||
    "SEI WEBY, l'assistente di intelligenza artificiale ufficiale di WebNovis.";
  const services = chatConfig.services || {};
  const company = chatConfig.companyInfo || {};
  return [
    instructions,
    '',
    'DATI AZIENDALI:',
    `Nome: ${company.name || 'WebNovis'}`,
    `Email: ${company.email || 'hello@webnovis.com'}`,
    `Telefono: ${company.phone || ''}`,
    `WhatsApp: ${company.whatsapp || ''}`,
    `Sede: ${company.address || ''}`,
    '',
    'SERVIZI E PREZZI CATALOGO (usa solo questi):',
    JSON.stringify(services, null, 0),
    '',
    'Dichiarati sempre come assistente AI. Non inventare prezzi fuori listino.',
    'I preventivi finali li conferma il team umano.'
  ].join('\n');
}

const CACHED_SYSTEM_PROMPT = buildSystemPrompt();

async function getSession(env, sessionId) {
  if (!env.SESSIONS) return { sessionId: sessionId || crypto.randomUUID(), history: [] };
  let id = sessionId;
  // Fail-closed: accept only opaque token charset; reject path separators/keys
  // (e.g. "../../", "lead:", "chat:") — otherwise issue a fresh server-side id.
  if (!id || typeof id !== 'string' || id.length < 8 || id.length > 64 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    id = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  }
  const raw = await env.SESSIONS.get(`chat:${id}`, 'json');
  return { sessionId: id, history: Array.isArray(raw?.history) ? raw.history : [] };
}

async function saveSession(env, sessionId, history) {
  if (!env.SESSIONS) return;
  const trimmed = history.slice(-SESSION_MAX_MESSAGES * 2);
  await env.SESSIONS.put(
    `chat:${sessionId}`,
    JSON.stringify({ history: trimmed, updatedAt: Date.now() }),
    { expirationTtl: SESSION_TTL_SECONDS }
  );
}

async function callGemini(apiKey, model, { systemInstruction, contents, temperature = 0.7, maxOutputTokens = 800, jsonMode = false }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
      topP: 0.95
    }
  };
  if (jsonMode) {
    body.generationConfig.responseMimeType = 'application/json';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const data = await res.json();
    if (!res.ok) {
      const msg = data?.error?.message || `Gemini HTTP ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.retryable = res.status === 429 || res.status >= 500 || /high demand|unavailable|overloaded/i.test(msg);
      throw err;
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiWithFallback(apiKey, primary, fallback, opts) {
  try {
    return await callGemini(apiKey, primary, opts);
  } catch (err) {
    if (fallback && err.retryable) {
      return callGemini(apiKey, fallback, opts);
    }
    throw err;
  }
}

function cleanGeminiChatText(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/\#/g, '')
    .replace(/\-\s/g, '• ')
    .trim();
}

function escapeHtml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// HMAC-SHA256 via WebCrypto (il Worker non ha node:crypto). La chiave è
// BREVO_API_KEY: segreto server-side ad alta entropia già presente nell'env,
// mai esposto al client. Nessun nuovo secret da gestire.
async function hmacHex(keyMaterial, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(keyMaterial), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqualHex(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  if (!/^[a-f0-9]{64}$/i.test(x) || x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

async function brevoFetch(apiKey, path, options = {}) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'GET',
    ...options,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(10_000)
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

// POST /api/newsletter — double opt-in senza backend dedicato.
// Crea il contatto FUORI dalla lista (attributo DOI_PENDING) e invia l'email
// transazionale con link di conferma. Risposta sempre uniforme (no oracle).
async function handleNewsletter(request, env) {
  if (!requireJsonContent(request)) {
    return json({ error: 'Content-Type non supportato. Usare application/json.' }, 415);
  }
  const rl = await rateLimit(env, `newsletter:${clientIp(request)}`, NEWSLETTER_RL_LIMIT, NEWSLETTER_RL_WINDOW);
  if (!rl.allowed) {
    return json({ error: 'Troppe richieste. Riprova tra qualche minuto.' }, 429);
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase().slice(0, 254);
  const name = String(body.name || '').trim().slice(0, 100);
  const source = String(body.source || 'website').trim().slice(0, 30);
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Email non valida.' }, 400);
  }

  const BREVO_API_KEY = env.BREVO_API_KEY;
  const listId = Number.parseInt(env.BREVO_LIST_ID, 10);
  const senderEmail = env.BREVO_SENDER_EMAIL || 'newsletter@webnovis.com';
  const senderName = env.BREVO_SENDER_NAME || 'WebNovis';
  const notifyEmail = env.BREVO_NOTIFICATION_EMAIL || 'hello@webnovis.com';
  if (!BREVO_API_KEY || !Number.isSafeInteger(listId)) {
    console.error('newsletter misconfigured: missing BREVO_API_KEY or BREVO_LIST_ID');
    return json({ error: 'Servizio temporaneamente non disponibile.' }, 503);
  }

  // Se già iscritto e confermato: successo silenzioso, nessuna nuova email (anti-abuse).
  try {
    const existing = await brevoFetch(BREVO_API_KEY, `/contacts/${encodeURIComponent(email)}`);
    if (existing.res.ok) {
      const inList = Array.isArray(existing.data.listIds) && existing.data.listIds.includes(listId);
      const pending = existing.data.attributes && existing.data.attributes.DOI_PENDING;
      if (inList && !pending) return json({ success: true });
    }
  } catch (err) {
    console.error('newsletter lookup error', err && err.message ? err.message : 'unknown');
  }

  // Crea/aggiorna FUORI dalla lista, in attesa di conferma (double opt-in).
  const upsert = await brevoFetch(BREVO_API_KEY, '/contacts', {
    method: 'POST',
    body: JSON.stringify({
      email,
      attributes: { NOME: name || '', SOURCE: source, DOI_PENDING: true },
      updateEnabled: true
    })
  });
  if (!upsert.res.ok && upsert.data.code !== 'duplicate_parameter') {
    console.error('newsletter upsert error', upsert.res.status, upsert.data.code || '');
    return json({ error: 'Servizio temporaneamente non disponibile.' }, 502);
  }

  const token = await hmacHex(BREVO_API_KEY, email);
  const confirmUrl = `https://webnovis-ai.nexify-api.workers.dev/api/newsletter/confirm?email=${encodeURIComponent(email)}&token=${token}`;
  const mail = await brevoFetch(BREVO_API_KEY, '/smtp/email', {
    method: 'POST',
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: 'Conferma la tua iscrizione alla newsletter WebNovis',
      htmlContent: `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0f;color:#e0e0e0;border-radius:16px;">`
        + `<h2 style="color:#a8b4f8;">Un ultimo passo 🌱</h2>`
        + `<p>Ciao${name ? ' ' + escapeHtml(name) : ''}! Clicca il pulsante per confermare l'iscrizione alla newsletter WebNovis.</p>`
        + `<p><a href="${confirmUrl}" style="display:inline-block;background:#5B6AAE;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;">Conferma iscrizione</a></p>`
        + `<p style="color:#888;font-size:13px;">Se non hai richiesto tu l'iscrizione, ignora pure questa email.</p></div>`
    })
  });
  if (!mail.res.ok) {
    console.error('newsletter confirm-mail error', mail.res.status);
    return json({ error: 'Servizio temporaneamente non disponibile.' }, 502);
  }

  // Notifica admin fire-and-forget (destinatario fisso, mai pilotabile).
  try {
    await brevoFetch(BREVO_API_KEY, '/smtp/email', {
      method: 'POST',
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: notifyEmail, name: 'WebNovis Team' }],
        subject: 'Nuova iscrizione newsletter (in attesa di conferma)',
        htmlContent: `<p>Nuova richiesta di iscrizione da ${escapeHtml(email)} (fonte: ${escapeHtml(source)}). In attesa di conferma via link.</p>`
      })
    });
  } catch (err) {
    console.error('newsletter notify error', err && err.message ? err.message : 'unknown');
  }

  return json({ success: true });
}

// GET /api/newsletter/confirm?email=&token= — conferma double opt-in.
// Non muta mai via prefetch senza token valido (HMAC 256-bit); idempotente.
async function handleNewsletterConfirm(request, env) {
  const url = new URL(request.url);
  const email = String(url.searchParams.get('email') || '').trim().toLowerCase().slice(0, 254);
  const token = String(url.searchParams.get('token') || '').trim();
  const BREVO_API_KEY = env.BREVO_API_KEY;
  const listId = Number.parseInt(env.BREVO_LIST_ID, 10);
  if (!BREVO_API_KEY || !Number.isSafeInteger(listId)) {
    return htmlPage('Servizio non disponibile', 'La conferma è momentaneamente non configurata. Scrivici a hello@webnovis.com.', false);
  }
  if (!EMAIL_RE.test(email) || !/^[a-f0-9]{64}$/i.test(token)) {
    return htmlPage('Link non valido', 'Il link di conferma non è valido. Richiedi una nuova iscrizione dal sito.', false);
  }
  const expected = await hmacHex(BREVO_API_KEY, email);
  if (!safeEqualHex(token, expected)) {
    return htmlPage('Link non valido', 'Il link di conferma non è valido o è stato manomesso.', false);
  }
  try {
    const update = await brevoFetch(BREVO_API_KEY, `/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      body: JSON.stringify({ listIds: [listId], attributes: { DOI_PENDING: false }, updateEnabled: true })
    });
    if (!update.res.ok) {
      return htmlPage('Errore temporaneo', 'Conferma non riuscita, riprova tra qualche minuto.', false);
    }
  } catch (err) {
    console.error('newsletter confirm error', err && err.message ? err.message : 'unknown');
    return htmlPage('Errore temporaneo', 'Conferma non riuscita, riprova tra qualche minuto.', false);
  }
  return htmlPage('Iscrizione confermata', `L'indirizzo ${escapeHtml(email)} è ora iscritto alla newsletter WebNovis. Benvenuto! 🎉`, true);
}

function htmlPage(title, message, ok) {
  const color = ok ? '#14b8a6' : '#ef4444';
  return new Response(
    `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${escapeHtml(title)} - WebNovis</title>`
    + `<style>body{background:#0a0a0f;color:#e0e0e0;font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem}`
    + `.card{background:#111118;border:1px solid rgba(91,106,174,0.15);border-radius:16px;padding:48px;text-align:center;max-width:460px}`
    + `h2{color:${color};margin-bottom:12px}p{color:#999;line-height:1.6}</style></head><body>`
    + `<div class="card"><h2>${escapeHtml(title)}</h2><p>${message}</p></div></body></html>`,
    {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow',
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    }
  );
}

function requireJsonContent(request) {
  const ct = request.headers.get('content-type') || '';
  return ct.includes('application/json');
}

async function handleChat(request, env) {
  if (!requireJsonContent(request)) {
    return json({ error: 'Content-Type non supportato. Usare application/json.' }, 415);
  }
  const body = await request.json().catch(() => ({}));
  const message = body.message;
  const clientSessionId = body.sessionId;
  const currentPage = normalizePath(body.currentPage || body.page || '/');

  if (!message || typeof message !== 'string') {
    return json({ error: 'Messaggio non valido.' }, 400);
  }

  const cleanMessage = message.replace(/<[^>]*>/g, '').trim().slice(0, 500);
  if (!cleanMessage) return json({ error: 'Messaggio non valido.' }, 400);

  const rl = await rateLimit(env, `chat:${clientIp(request)}`, CHAT_RL_LIMIT, CHAT_RL_WINDOW);
  if (!rl.allowed) {
    return json({ error: 'Troppe richieste. Riprova tra qualche minuto.', retryAfter: '15 minuti' }, 429);
  }

  if (INJECTION_PATTERNS.test(cleanMessage)) {
    return json({ response: INJECTION_SAFE_CHAT });
  }

  const { sessionId, history } = await getSession(env, clientSessionId);

  // Trivial deterministic replies
  if (/^(ciao|salve|buongiorno|buonasera|hey|hello|hi|hola|salut)[!.\s]*$/i.test(cleanMessage)) {
    const response =
      "Ciao! Sono Weby, l'assistente AI di WebNovis (risposte automatiche).\nCi occupiamo di siti web, grafica e social media.\n\nCome posso aiutarti oggi?";
    const next = history.concat(
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: response }
    );
    await saveSession(env, sessionId, next);
    return json({ response, sessionId });
  }
  if (/^(grazie|thanks|ok grazie|grazie mille|perfetto grazie|ottimo grazie)[!.\s]*$/i.test(cleanMessage)) {
    const response = 'Prego! Se hai altre domande sono qui.\nBuona giornata!';
    const next = history.concat(
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: response }
    );
    await saveSession(env, sessionId, next);
    return json({ response, sessionId });
  }

  const apiKey = env.GEMINI_API_KEY_CHAT;
  if (!apiKey) {
    const response = getLocalChatResponse(cleanMessage);
    const next = history.concat(
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: response }
    );
    await saveSession(env, sessionId, next);
    return json({ response, sessionId, fallback: true });
  }

  try {
    const grounding =
      cleanMessage.length >= 12
        ? searchEngine.buildChatGroundingContext(cleanMessage, currentPage)
        : '';
    const systemPrompt = grounding
      ? `${CACHED_SYSTEM_PROMPT}\n\nCONTESTO INTERNO RILEVANTE:\n${grounding}\n\nUsa il contesto solo se pertinente. Se non basta, dillo senza inventare.`
      : CACHED_SYSTEM_PROMPT;

    const contents = [];
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

    const raw = await callGeminiWithFallback(
      apiKey,
      AI_MODELS.chatPrimary,
      AI_MODELS.chatFallback,
      {
        systemInstruction: systemPrompt,
        contents,
        temperature: 0.7,
        maxOutputTokens: 800
      }
    );
    const response = cleanGeminiChatText(raw);
    const next = history.concat(
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: response }
    );
    await saveSession(env, sessionId, next);
    return json({ response, sessionId });
  } catch (err) {
    console.error('chat error', err.message);
    const response = getLocalChatResponse(cleanMessage);
    const next = history.concat(
      { role: 'user', content: cleanMessage },
      { role: 'assistant', content: response }
    );
    await saveSession(env, sessionId, next);
    return json({ response, sessionId, fallback: true });
  }
}

async function handleSearchAi(request, env) {
  if (!requireJsonContent(request)) {
    return json({ error: 'Content-Type non supportato. Usare application/json.' }, 415);
  }
  const body = await request.json().catch(() => ({}));
  const query = body.query;
  const currentPage = normalizePath(body.currentPage || '/');

  if (!query || typeof query !== 'string' || query.length < 3 || query.length > 500) {
    return json({ error: 'Query non valida.' }, 400);
  }

  const rl = await rateLimit(env, `search:${clientIp(request)}`, SEARCH_RL_LIMIT, SEARCH_RL_WINDOW);
  if (!rl.allowed) {
    return json({ error: 'Troppe ricerche AI. Riprova tra un minuto.' }, 429);
  }

  const sanitizedQuery = query.replace(/<[^>]*>/g, '').trim().slice(0, 320);
  const retrievedDocs = searchEngine.search(sanitizedQuery, currentPage, 8);
  const fallback = searchEngine.buildFallbackResponse(sanitizedQuery, retrievedDocs);

  if (INJECTION_PATTERNS.test(sanitizedQuery)) {
    return json(fallback);
  }

  const apiKey = env.GEMINI_API_KEY_SEARCH || env.GEMINI_API_KEY_CHAT;
  if (!apiKey || !retrievedDocs.length) {
    return json(fallback);
  }

  // Cache via KV
  const cacheKey = `search:${searchEngine.getCacheKey(normalizeText(sanitizedQuery), currentPage)}`;
  if (env.SESSIONS) {
    const cached = await env.SESSIONS.get(cacheKey, 'json');
    if (cached && cached.answer) return json(cached);
  }

  try {
    const prompt = searchEngine.buildPrompt(sanitizedQuery, currentPage, retrievedDocs);
    const text = await callGeminiWithFallback(
      apiKey,
      AI_MODELS.searchPrimary,
      AI_MODELS.searchFallback,
      {
        systemInstruction: prompt.systemInstruction,
        contents: [{ role: 'user', parts: [{ text: prompt.userPrompt }] }],
        temperature: 0.25,
        maxOutputTokens: 512,
        jsonMode: true
      }
    );

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const answerMatch = text.match(/"answer"\s*:\s*"((?:\\.|[^"\\])*)"/);
      parsed = {
        answer: answerMatch ? answerMatch[1].replace(/\\"/g, '"') : '',
        suggestedPages: [],
        relatedQueries: []
      };
    }

    const sanitized = searchEngine.sanitizeResult(parsed, retrievedDocs, sanitizedQuery);
    if (env.SESSIONS) {
      await env.SESSIONS.put(cacheKey, JSON.stringify(sanitized), { expirationTtl: 300 });
    }
    return json(sanitized);
  } catch (err) {
    console.error('search-ai error', err.message);
    return json(fallback);
  }
}

async function handleChatLead(request, env) {
  if (!requireJsonContent(request)) {
    return json({ error: 'Content-Type non supportato. Usare application/json.' }, 415);
  }
  const body = await request.json().catch(() => ({}));
  if (!body.message || typeof body.message !== 'string') {
    return json({ error: 'Messaggio mancante.' }, 400);
  }

  // Dedicated bucket: chat-lead must not share/starve chat budget, and must be throttled on its own.
  const rlLead = await rateLimit(env, `chatlead:${clientIp(request)}`, 10, 15 * 60);
  if (!rlLead.allowed) {
    return json({ error: 'Troppe richieste. Riprova tra qualche minuto.' }, 429);
  }

  const cleanMessage = body.message.replace(/<[^>]*>/g, '').trim().slice(0, 300);
  const cleanPage = String(body.page || '').trim().slice(0, 200);
  const cleanSession = String(body.sessionId || '').trim().slice(0, 50);
  // Fail-closed: messageCount is a counter, never raw HTML for KV/email.
  const cleanCount = Number.isSafeInteger(body.messageCount)
    ? Math.min(Math.max(body.messageCount, 0), 100000)
    : null;
  const messageCount = cleanCount;

  // Store lead in KV for audit
  if (env.SESSIONS) {
    const id = `lead:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`;
    await env.SESSIONS.put(
      id,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        message: cleanMessage,
        sessionId: cleanSession,
        page: cleanPage || null,
        messageCount,
        ip: anonymizeIp(clientIp(request))
      }),
      { expirationTtl: 60 * 60 * 24 * 90 }
    );
  }

  const BREVO_API_KEY = env.BREVO_API_KEY;
  if (BREVO_API_KEY && !BREVO_API_KEY.includes('your-api')) {
    const senderEmail = env.BREVO_SENDER_EMAIL || 'newsletter@webnovis.com';
    const senderName = env.BREVO_SENDER_NAME || 'WebNovis';
    const notifyEmail = env.BREVO_NOTIFICATION_EMAIL || 'hello@webnovis.com';
    const htmlBody = `
      <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#e0e0e0;padding:32px;border-radius:16px;">
        <h2 style="color:#a8b4f8;margin-top:0;">Nuovo Lead dal Chatbot Weby</h2>
        <p><strong>Messaggio:</strong> ${escapeHtml(cleanMessage)}</p>
        <p><strong>Pagina:</strong> ${escapeHtml(cleanPage) || '—'}</p>
        <p><strong>Messaggi:</strong> ${messageCount || '—'}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}</p>
      </div>`;

    // Fire-and-forget email
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: notifyEmail, name: 'WebNovis Team' }],
          subject: `Nuovo lead dal chatbot Weby`,
          htmlContent: htmlBody
        })
      });
    } catch (e) {
      console.error('brevo lead error', e.message);
    }
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), request, env);
    }

    try {
      let response;

      if (request.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/health' || url.pathname === '/')) {
        response = json({
          status: 'ok',
          service: 'webnovis-ai',
          platform: 'cloudflare-workers',
          corpusSize: searchEngine.corpusSize,
          time: new Date().toISOString()
        });
      } else if (request.method === 'POST' && url.pathname === '/api/chat') {
        response = await handleChat(request, env);
      } else if (request.method === 'POST' && url.pathname === '/api/search-ai') {
        response = await handleSearchAi(request, env);
      } else if (request.method === 'POST' && url.pathname === '/api/chat-lead') {
        response = await handleChatLead(request, env);
      } else if (request.method === 'POST' && url.pathname === '/api/newsletter') {
        response = await handleNewsletter(request, env);
      } else if (request.method === 'GET' && url.pathname === '/api/newsletter/confirm') {
        response = await handleNewsletterConfirm(request, env);
      } else if (url.pathname === '/api/chat' || url.pathname === '/api/search-ai' || url.pathname === '/api/chat-lead' || url.pathname === '/api/newsletter') {
        // Path noto, metodo errato: 405 esplicito (fail-closed, no path echo oltre il noto).
        response = json({ error: 'Metodo non consentito.' }, 405, { Allow: 'POST, OPTIONS' });
      } else if (url.pathname === '/api/newsletter/confirm') {
        response = json({ error: 'Metodo non consentito.' }, 405, { Allow: 'GET, OPTIONS' });
      } else if (request.method === 'GET' && (url.pathname === '/api/health' || url.pathname === '/health' || url.pathname === '/')) {
        response = json({
          status: 'ok',
          service: 'webnovis-ai',
          platform: 'cloudflare-workers',
          corpusSize: searchEngine.corpusSize,
          time: new Date().toISOString()
        });
      } else if (url.pathname === '/api/health' || url.pathname === '/health' || url.pathname === '/') {
        response = json({ error: 'Metodo non consentito.' }, 405, { Allow: 'GET, OPTIONS' });
      } else {
        // Generic 404: never echo attacker-controlled path.
        response = json({ error: 'Not found' }, 404);
      }

      return withCors(response, request, env);
    } catch (err) {
      console.error('worker error', err && err.message ? err.message : 'unknown');
      return withCors(json({ error: 'Errore interno.' }, 500), request, env);
    }
  }
};
