# Cloudflare Turnstile — form lead WebNovis

## Contesto

I form contatti/preventivo inviano a **Web3Forms** dal browser.  
Web3Forms verifica Turnstile **lato server solo sul piano Pro** (secret nel dashboard Web3Forms).

Senza Pro, un widget solo-client è debole: serve **siteverify su un backend nostro**.

## Due modalità supportate dal codice

### A) Web3Forms Pro (più semplice)

1. Crea widget Turnstile (managed) su dashboard Cloudflare con domini:
   - `www.webnovis.com`
   - `webnovis.com`
   - `localhost` (solo se usi preview locale)
2. Copia **sitekey** in `js/site-config.js` → `TURNSTILE_SITEKEY`
3. In [Web3Forms dashboard](https://app.web3forms.com) → form → captcha provider **turnstile** → incolla **secret**
4. Lascia `FORM_SUBMIT_MODE: 'web3forms'`
5. Deploy asset statici (sitekey pubblico ok; secret **mai** nel repo)

### B) Worker proxy (senza Web3Forms Pro) — consigliato se Free

1. Stesso widget Turnstile (step A1)
2. Sitekey in `js/site-config.js`
3. `FORM_SUBMIT_MODE: 'proxy'`
4. Deploy Worker:

```bash
cd workers/webnovis-forms
# secret (stdin, non in chat)
printf '%s' "$TURNSTILE_SECRET" | npx wrangler secret put TURNSTILE_SECRET
npx wrangler deploy
```

5. Aggiorna `FORM_PROXY_URL` in `js/site-config.js` se l’URL workers.dev differisce  
6. CSP già include `challenges.cloudflare.com` (script/frame/connect)

## Attivazione frontend

Con `TURNSTILE_SITEKEY` **vuoto**, i form restano come prima (solo honeypot) — nessun breaking change.

Con sitekey valorizzato, `js/main.js`:

- carica lo script Turnstile
- monta il widget nei form `#contactForm`
- blocca submit senza token
- resetta il widget dopo errori
- in modalità `proxy` posta a `FORM_PROXY_URL` invece che a Web3Forms

## Checklist go-live

- [ ] Widget creato (domini corretti)
- [ ] Sitekey in `js/site-config.js` (e rebuild/min se serve)
- [ ] Secret: Web3Forms Pro **oppure** Worker secret
- [ ] Test submit umano OK
- [ ] Test replay token / submit senza token → blocco
- [ ] `npm run sync:headers` già eseguito per CSP

## Note skill turnstile-spin

La skill completa richiede token API Cloudflare con `Account.Turnstile:Edit` e conferma interattiva.  
Questa integrazione è pronta al cablaggio: crea il widget dal dashboard e incolla sitekey/secret come sopra.
