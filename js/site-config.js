/**
 * Public runtime config (no secrets; access_key sotto e pubblica per design Web3Forms).
 * Set TURNSTILE_SITEKEY after creating a Cloudflare Turnstile widget.
 * FORM_SUBMIT_MODE:
 *   - "web3forms" (default): browser posts to Web3Forms; for server-side Turnstile
 *     verification use Web3Forms Pro dashboard secret (see docs/TURNSTILE-SETUP.md)
 *   - "proxy": browser posts to FORM_PROXY_URL Worker which siteverifies then
 *     forwards to Web3Forms (works without Web3Forms Pro)
 *
 * TEMP-EMAIL (2026-09-07, temporaneo — da revertare): casella attiva
 * webnovis.info@gmail.com (hello@ non riceve: DNS spostati per Zoho).
 * Causa vera dei 502/400 (da HAR): Web3Forms free rifiuta il campo
 * cf-turnstile-response ("Pro feature"). Il token NON viene mai spedito:
 * in proxy lo verifica il Worker (siteverify) e lo scarta; in direct il
 * browser lo scarta prima del fetch. REVERT: key hello@ (se Pro, togliere
 * gli strip) e rimuovere i commenti TEMP.
 */
window.WEBNOVIS_SITE_CONFIG = Object.assign(
  {
    TURNSTILE_SITEKEY: '0x4AAAAAAEqkqMBsAfHCu_We',
    FORM_SUBMIT_MODE: 'proxy',
    WEB3FORMS_PUBLIC_KEY: '1afa700f-e66d-4054-a98d-6d922f3435bb',
    FORM_PROXY_URL: 'https://webnovis-forms.nexify-api.workers.dev/submit',
    TURNSTILE_THEME: 'dark'
  },
  window.WEBNOVIS_SITE_CONFIG || {}
);
