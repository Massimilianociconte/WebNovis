/**
 * Public runtime config (no secrets; access_key sotto e pubblica per design Web3Forms).
 * Set TURNSTILE_SITEKEY after creating a Cloudflare Turnstile widget.
 * FORM_SUBMIT_MODE:
 *   - "web3forms" (default): browser posts to Web3Forms; for server-side Turnstile
 *     verification use Web3Forms Pro dashboard secret (see docs/TURNSTILE-SETUP.md)
 *   - "proxy": browser posts to FORM_PROXY_URL Worker which siteverifies then
 *     forwards to Web3Forms (works without Web3Forms Pro)
 *
 * TEMP-DIRECT (2026-09-07, temporaneo — da revertare): il proxy riceve 502
 * perché Web3Forms mura le chiamate server-to-server; finché dura, direct con
 * la public key della casella webnovis.info@gmail.com (hello@ non riceve: DNS
 * spostati per Zoho). REVERT: FORM_SUBMIT_MODE 'proxy' + key hello@.
 */
window.WEBNOVIS_SITE_CONFIG = Object.assign(
  {
    TURNSTILE_SITEKEY: '0x4AAAAAAEqkqMBsAfHCu_We',
    FORM_SUBMIT_MODE: 'web3forms',
    WEB3FORMS_PUBLIC_KEY: '1afa700f-e66d-4054-a98d-6d922f3435bb',
    FORM_PROXY_URL: 'https://webnovis-forms.nexify-api.workers.dev/submit',
    TURNSTILE_THEME: 'dark'
  },
  window.WEBNOVIS_SITE_CONFIG || {}
);
