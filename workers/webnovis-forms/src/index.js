/**
 * WebNovis form proxy — Turnstile siteverify (server-side) then forward to Web3Forms.
 * Use when Web3Forms Pro Turnstile is not available: browser → this Worker → Web3Forms.
 *
 * Secrets: TURNSTILE_SECRET (required)
 * Vars: TURNSTILE_HOSTNAMES, WEB3FORMS_ENDPOINT
 *
 * TEMP-EMAIL-REDIRECT (2026-09-07, temporaneo — da revertare):
 * il destinatario delle email NON è nel codice: è la casella collegata alla
 * WEB3FORMS_ACCESS_KEY su Web3Forms. Dal 2026-09-07 hello@webnovis.com non riceve
 * (record DNS spostati per Zoho), quindi la key attiva deve essere quella collegata
 * a webnovis.info@gmail.com (wrangler secret put WEB3FORMS_ACCESS_KEY).
 * REVERT: appena hello@webnovis.com torna attiva, ripristinare la key precedente
 * e rimuovere questo blocco di commento. Nessun impatto SEO: il destinatario è
 * solo backend, nessun contenuto visibile cambia.
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
        turnstileConfigured: Boolean(env.TURNSTILE_SECRET)
      });
    }

    if (url.pathname !== '/submit' || request.method !== 'POST') {
      return json({ success: false, message: 'not_found' }, 404);
    }

    const contentType = request.headers.get('content-type') || '';
    let formData;
    try {
      if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
        formData = await request.formData();
      } else if (contentType.includes('application/json')) {
        const payload = await request.json();
        formData = new FormData();
        for (const [k, v] of Object.entries(payload || {})) {
          if (v != null) formData.append(k, String(v));
        }
      } else {
        formData = await request.formData();
      }
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
    // Senza IP identificabile nessun blocco (mai negare per dati mancanti).
    const remoteipEarly =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      '';
    if (remoteipEarly) {
      const now = Date.now();
      const store =
        globalThis.__wnRateLimit || (globalThis.__wnRateLimit = new Map());
      const hits = (store.get(remoteipEarly) || []).filter(
        (t) => now - t < 600_000
      );
      if (hits.length >= 5) {
        return json({ success: false, message: 'rate_limited' }, 429);
      }
      hits.push(now);
      store.set(remoteipEarly, hits);
      if (store.size > 2000) {
        for (const [k, v] of store) {
          if (!v.length || now - v[v.length - 1] > 600_000) store.delete(k);
        }
      }
    }

    const token =
      formData.get('cf-turnstile-response') ||
      formData.get('turnstile_token') ||
      '';
    const remoteip =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
      '';

    const verified = await siteverifyTurnstile(env, String(token || ''), remoteip);
    if (!verified.ok) {
      return json(
        { success: false, message: 'captcha_failed', code: verified.error },
        403
      );
    }

    // Forward to Web3Forms (strip empty turnstile field noise is fine; keep token optional for their Pro path)
    // Campi operativi nostri (redirect/ts) non inoltrati: niente rumore nella email.
    formData.delete('redirect');
    formData.delete('ts');
    const endpoint = env.WEB3FORMS_ENDPOINT || 'https://api.web3forms.com/submit';
    if (env.WEB3FORMS_ACCESS_KEY && !formData.get('access_key')) {
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
        data = { success: upstream.ok, message: text.slice(0, 200) };
      }
      return json(data, upstream.ok ? 200 : 502);
    } catch {
      return json({ success: false, message: 'upstream_error' }, 502);
    }
  }
};
