/**
 * Public runtime config (no secrets; access_key sotto e pubblica per design Web3Forms).
 * Set TURNSTILE_SITEKEY after creating a Cloudflare Turnstile widget.
 * FORM_SUBMIT_MODE:
 *   - "web3forms" (default, consigliata sul piano free): il browser verifica
 *     il token Turnstile via Worker (/verify = solo siteverify, senza inoltro)
 *     e poi posta DIRETTAMENTE a Web3Forms (client-side, consentito dal free).
 *     Il token NON viene mai inoltrato a Web3Forms (il free lo rifiuta con
 *     400 "Pro feature"). Vedi docs/TURNSTILE-SETUP.md.
 *   - "proxy" (SOLO con Web3Forms Pro): browser posta al Worker
 *     FORM_PROXY_URL che fa siteverify e inoltra a Web3Forms. Sul piano free
 *     Web3Forms blocca i POST server-side con 403 ("Use our API in client
 *     side") e il proxy ritorna 502 — non usare senza Pro.
 *
 * Casella attiva: hello@webnovis.com (forward a webnovis.info@gmail.com, vedi
 * screenshot ImprovMX). Il destinatario delle email NON è nel codice: è la
 * casella collegata alla WEB3FORMS_ACCESS_KEY su Web3Forms.
 */
window.WEBNOVIS_SITE_CONFIG = Object.assign(
  {
    TURNSTILE_SITEKEY: '0x4AAAAAAEqkqMBsAfHCu_We',
    FORM_SUBMIT_MODE: 'web3forms',
    WEB3FORMS_PUBLIC_KEY: '99361b23-7e3b-46b7-affa-9ce06eb383d7',
    FORM_PROXY_URL: 'https://webnovis-forms.nexify-api.workers.dev/submit',
    FORM_VERIFY_URL: 'https://webnovis-forms.nexify-api.workers.dev/verify',
    TURNSTILE_THEME: 'dark'
  },
  window.WEBNOVIS_SITE_CONFIG || {}
);
