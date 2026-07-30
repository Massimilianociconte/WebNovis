/**
 * Public runtime config (no secrets).
 * Set TURNSTILE_SITEKEY after creating a Cloudflare Turnstile widget.
 * FORM_SUBMIT_MODE:
 *   - "web3forms" (default): browser posts to Web3Forms; for server-side Turnstile
 *     verification use Web3Forms Pro dashboard secret (see docs/TURNSTILE-SETUP.md)
 *   - "proxy": browser posts to FORM_PROXY_URL Worker which siteverifies then
 *     forwards to Web3Forms (works without Web3Forms Pro)
 */
window.WEBNOVIS_SITE_CONFIG = Object.assign(
  {
    TURNSTILE_SITEKEY: '',
    FORM_SUBMIT_MODE: 'web3forms',
    FORM_PROXY_URL: 'https://webnovis-forms.nexify-api.workers.dev/submit',
    TURNSTILE_THEME: 'dark'
  },
  window.WEBNOVIS_SITE_CONFIG || {}
);
