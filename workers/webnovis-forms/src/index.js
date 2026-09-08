/**
 * WebNovis form proxy — Turnstile siteverify (server-side) then forward to Web3Forms.
 * Use when Web3Forms Pro Turnstile is not available: browser → this Worker → Web3Forms.
 *
 * Secrets: TURNSTILE_SECRET (required)
 * Vars: TURNSTILE_HOSTNAMES, WEB3FORMS_ENDPOINT
 *
 * Casella attiva: hello@webnovis.com (forward a webnovis.info@gmail.com).
 * Il destinatario delle email NON è nel codice: è la casella collegata alla
 * WEB3FORMS_ACCESS_KEY su Web3Forms (wrangler secret put WEB3FORMS_ACCESS_KEY
 * con la key di hello@). Causa dei 502/400 (da HAR): la key free rifiuta
 * cf-turnstile-response con 400 "Pro feature", quindi il token viene verificato
 * (siteverify) e poi scartato prima dell'inoltro.
 * Nessun impatto SEO: il destinatario è solo backend, nessun contenuto visibile cambia.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400'
};

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extra
    }
  });
}

function clientIp(request) {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    ''
  );
}

// Rate limit best-effort per IP e per scopo (senza IP nessun blocco: mai
// negare per dati mancanti). Stessa semantica ovunque (submit e verify).
function checkRateLimit(ip, scope, limit, windowMs) {
  if (!ip) return false;
  const now = Date.now();
  const store =
    globalThis.__wnRateLimit || (globalThis.__wnRateLimit = new Map());
  const key = `${scope}:${ip}`;
  const hits = (store.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) return true;
  hits.push(now);
  store.set(key, hits);
  if (store.size > 2000) {
    for (const [k, v] of store) {
      if (!v.length || now - v[v.length - 1] > windowMs) store.delete(k);
    }
  }
  return false;
}

async function readFormData(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    return await request.formData();
  }
  if (contentType.includes('application/json')) {
    const payload = await request.json();
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload || {})) {
      if (v != null) fd.append(k, String(v));
    }
    return fd;
  }
  return await request.formData();
}

function parseHostnames(raw) {
  return new Set(
    String(raw || '')
      .split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
  );
}

async function siteverifyTurnstile(env, token, remoteip) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    return { ok: false, error: 'turnstile_secret_missing' };
  }
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
    return { ok: false, error: 'turnstile_token_invalid' };
  }

  const expectedHostnames = parseHostnames(env.TURNSTILE_HOSTNAMES);
  if (expectedHostnames.size === 0) {
    return { ok: false, error: 'turnstile_hostnames_missing' };
  }

  let result;
  try {
    const body = new URLSearchParams({
      secret,
      response: token
    });
    if (remoteip) body.set('remoteip', remoteip);

    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(10_000)
    });
    if (!r.ok) return { ok: false, error: `siteverify_http_${r.status}` };
    result = await r.json();
  } catch (err) {
    return { ok: false, error: 'siteverify_network' };
  }

  if (!result || result.success !== true) {
    return { ok: false, error: 'turnstile_failed', codes: result?.['error-codes'] || [] };
  }

  const hostname = String(result.hostname || '').toLowerCase();
  if (!expectedHostnames.has(hostname)) {
    return { ok: false, error: 'hostname_mismatch', hostname };
  }

  // Optional action check if client sent data-action
  if (result.action && !['contact', 'preventivo', 'newsletter', 'lead'].includes(result.action)) {
    return { ok: false, error: 'action_mismatch', action: result.action };
  }

  return { ok: true, result };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({
        ok: true,
        service: env.SERVICE_NAME || 'webnovis-forms',
        turnstileConfigured: Boolean(env.TURNSTILE_SECRET),
        web3formsConfigured: Boolean(env.WEB3FORMS_ACCESS_KEY)
      });
    }

    // POST /verify — sola verifica Turnstile (siteverify), senza inoltro.
    // Serve il flusso direct (default sul piano free): il browser verifica il
    // token qui e poi posta DIRETTAMENTE a Web3Forms. Il piano free blocca i
    // POST server-side (403) quindi il vecchio proxying via /submit non può
    // funzionare senza Pro — /verify aggira il muro (nessun inoltro).
    if (url.pathname === '/verify' && request.method === 'POST') {
      const ip = clientIp(request);
      if (checkRateLimit(ip, 'verify', 10, 600_000)) {
        return json({ ok: false, error: 'rate_limited' }, 429);
      }
      let formData;
      try {
        formData = await readFormData(request);
      } catch {
        return json({ ok: false, error: 'invalid_body' }, 400);
      }
      const token = String(
        formData.get('token') ||
        formData.get('cf-turnstile-response') ||
        formData.get('turnstile_token') ||
        ''
      ).slice(0, 2048);
      if (!token) {
        return json({ ok: false, error: 'token_missing' }, 400);
      }
      const verified = await siteverifyTurnstile(env, token, ip);
      if (!verified.ok) {
        return json(
          { ok: false, error: verified.error, codes: verified.codes || [] },
          403
        );
      }
      return json({ ok: true });
    }

    if (url.pathname !== '/submit' || request.method !== 'POST') {
      return json({ success: false, message: 'not_found' }, 404);
    }

    // NOTA: /submit inoltra a Web3Forms server-side: richiede Web3Forms Pro
    // (il free risponde 403 "Use our API in client side"). Tenuto per il
    // percorso Pro futuro; il default free usa /verify + direct. Vedi
    // docs/TURNSTILE-SETUP.md e js/site-config.js (FORM_SUBMIT_MODE).
    let formData;
    try {
      formData = await readFormData(request);
    } catch {
      return json({ success: false, message: 'invalid_body' }, 400);
    }

    // Honeypot
    if (formData.get('botcheck')) {
      return json({ success: true, message: 'ok' }, 200);
    }

    // Time-trap invisibile: submit <2s dal load = quasi sempre bot.
    // `ts` assente (no-JS, client vecchi) o orologio futuro = consentito.
    const tsRaw = formData.get('ts');
    if (typeof tsRaw === 'string' && tsRaw !== '') {
      const ts = Number(tsRaw);
      if (Number.isFinite(ts)) {
        const age = Date.now() - ts;
        if ((age >= 0 && age < 2000) || age > 24 * 3600 * 1000) {
          return json({ success: true, message: 'ok' }, 200);
        }
      }
    }

    // Rate limit best-effort per IP (5 submit / 10 min per isolate).
    if (checkRateLimit(clientIp(request), 'submit', 5, 600_000)) {
      return json({ success: false, message: 'rate_limited' }, 429);
    }

    const token =
      formData.get('cf-turnstile-response') ||
      formData.get('turnstile_token') ||
      '';
    const remoteip = clientIp(request);

    const verified = await siteverifyTurnstile(env, String(token || ''), remoteip);
    if (!verified.ok) {
      return json(
        { success: false, message: 'captcha_failed', code: verified.error },
        403
      );
    }

    // Forward to Web3Forms (strip empty turnstile field noise is fine; keep token optional for their Pro path)
    // Campi operativi nostri (redirect/ts) non inoltrati: niente rumore nella email.
    // Il token captcha NON viene mai inoltrato: sulle key free Web3Forms lo rifiuta
    // con 400 "Pro feature" (la verifica è già avvenuta qui sopra via siteverify).
    formData.delete('redirect');
    formData.delete('ts');
    formData.delete('cf-turnstile-response');
    formData.delete('turnstile_token');
    const endpoint = env.WEB3FORMS_ENDPOINT || 'https://api.web3forms.com/submit';
    // Il secret server-side è autoritativo: se presente sovrascrive qualsiasi
    // chiave arrivata dal client (che potrebbe essere stale). Se assente, si
    // tiene la chiave pubblica inviata dal browser (pubblica per design):
    // senza chiave Web3Forms risponde 400 e il proxy ritornerebbe 502 a
    // widget completato — il sintomo "form rotto" visto in produzione.
    if (env.WEB3FORMS_ACCESS_KEY) {
      formData.set('access_key', env.WEB3FORMS_ACCESS_KEY);
    }

    try {
      const upstream = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(15_000)
      });
      const text = await upstream.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: upstream.ok, message: text.slice(0, 200) || `upstream_http_${upstream.status}` };
      }
      if (!upstream.ok) {
        // Diagnostica nei log Worker (wrangler tail): status + snippet.
        // 403 = muro free sui POST server-side ("Use our API in client side"):
        // serve Web3Forms Pro oppure il flusso /verify + direct.
        try {
          console.error(`Web3Forms upstream ${upstream.status}: ${String(text).slice(0, 300)}`);
        } catch (_) { /* ignore */ }
        if (upstream.status === 403) {
          return json({ success: false, message: 'email_provider_forbidden', code: 'web3forms_pro_required' }, 502);
        }
      }
      return json(data, upstream.ok ? 200 : 502);
    } catch {
      return json({ success: false, message: 'upstream_error' }, 502);
    }
  }
};
