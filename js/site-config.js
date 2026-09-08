/**
 * Public runtime config (no secrets; access_key sotto e pubblica per design Web3Forms).
 * Set TURNSTILE_SITEKEY after creating a Cloudflare Turnstile widget.
 * FORM_SUBMIT_MODE:
 *   - "web3forms" (default): browser posts to Web3Forms; for server-side Turnstile
 *     verification use Web3Forms Pro dashboard secret (see docs/TURNSTILE-SETUP.md)
 *   - "proxy": browser posts to FORM_PROXY_URL Worker which siteverifies then
 *     forwards to Web3Forms (works without Web3Forms Pro)
 *
 * Casella attiva: hello@webnovis.com (forward a webnovis.info@gmail.com, vedi
 * screenshot ImprovMX). Il token cf-turnstile-response NON viene mai spedito a
 * Web3Forms free ("Pro feature"): in proxy lo verifica il Worker (siteverify)
 * e lo scarta; in direct il browser lo scarta prima del fetch.
 */
window.WEBNOVIS_SITE_CONFIG = Object.assign(
  {
    TURNSTILE_SITEKEY: '0x4AAAAAAEqkqMBsAfHCu_We',
    FORM_SUBMIT_MODE: 'proxy',
    WEB3FORMS_PUBLIC_KEY: '99361b23-7e3b-46b7-affa-9ce06eb383d7',
    FORM_PROXY_URL: 'https://webnovis-forms.nexify-api.workers.dev/submit',
    TURNSTILE_THEME: 'dark'
  },
  window.WEBNOVIS_SITE_CONFIG || {}
);
