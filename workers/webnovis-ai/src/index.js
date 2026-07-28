/**
 * WebNovis AI API — Cloudflare Worker
 * Endpoints: /api/health, /api/chat, /api/chat-lead, /api/search-ai
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
  } else if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
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
  if (!id || typeof id !== 'string' || id.length > 64) {
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

async function handleChat(request, env) {
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
  const body = await request.json().catch(() => ({}));
  if (!body.message || typeof body.message !== 'string') {
    return json({ error: 'Messaggio mancante.' }, 400);
  }

  const cleanMessage = body.message.replace(/<[^>]*>/g, '').trim().slice(0, 300);
  const cleanPage = String(body.page || '').trim().slice(0, 200);
  const cleanSession = String(body.sessionId || '').trim().slice(0, 50);
  const messageCount = body.messageCount || null;

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
          subject: `Lead chatbot: "${cleanMessage.substring(0, 50)}..."`,
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
      } else {
        response = json({ error: 'Not found', path: url.pathname }, 404);
      }

      return withCors(response, request, env);
    } catch (err) {
      console.error('worker error', err);
      return withCors(json({ error: 'Errore interno.' }, 500), request, env);
    }
  }
};
