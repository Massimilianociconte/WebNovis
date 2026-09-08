# Cloudflare Turnstile — form lead WebNovis

## Contesto

I form contatti/preventivo inviano a **Web3Forms** dal browser.
Web3Forms verifica Turnstile **lato server solo sul piano Pro** (secret nel
dashboard Web3Forms) e — soprattutto — **blocca i POST server-side sul piano
free** con 403 `"Use our API in client side"` (verificato 2026-09-09 via
curl: il Worker che inoltra a Web3Forms riceve 403/pagina HTML e ritorna
502). Senza Pro, quindi:

- il proxy `browser → Worker → Web3Forms` (`FORM_SUBMIT_MODE: 'proxy'`)
  **non può funzionare** (muro 403 → 502);
- il widget solo-client senza verifica è debole.

## Architettura attiva (default, piano free)

`FORM_SUBMIT_MODE: 'web3forms'` in `js/site-config.js`:

1. Il browser monta il widget Turnstile **visibile a inizio form** e blocca
   avanzamento/invio finché la verifica non è completata (gate).
2. Al submit, il browser invia il token al Worker **`POST /verify`**
   (solo `siteverify`, nessun inoltro — nessuna restrizione free).
3. Se `/verify` risponde ok, il browser posta **direttamente** a Web3Forms
   (client-side, consentito dal free) **senza** il campo
   `cf-turnstile-response` (il free lo rifiuta con 400 "Pro feature") e senza
   i campi operativi (`redirect`, `ts`, `botcheck`).

Il gate è obbligatorio su tutti i form: multistep homepage (step 1),
contatti, preventivo, newsletter, mini-form AI Act, form 404. Se il mount
fallisce tecnicamente (script bloccato) il gate va in fail-open per non
murare utenti reali; il submit resta protetto dal `/verify` quando un token
esiste. Su localhost il `/verify` è bypassato (fail-open).

## Due modalità supportate dal codice

### A) Direct + /verify (default, consigliata sul free)

1. Crea widget Turnstile (managed) su dashboard Cloudflare con domini:
   - `www.webnovis.com`
   - `webnovis.com`
   - `localhost` (solo se usi preview locale)
2. Copia **sitekey** in `js/site-config.js` → `TURNSTILE_SITEKEY`
3. Lascia `FORM_SUBMIT_MODE: 'web3forms'`
4. Deploy Worker forms (serve `/verify` + siteverify):
   `npx wrangler deploy -c workers/webnovis-forms/wrangler.jsonc`
   con secret `TURNSTILE_SECRET` (stdin, non in chat).
5. Deploy asset statici (sitekey pubblico ok; secret **mai** nel repo)

### B) Worker proxy (SOLO con Web3Forms Pro)

Stessi passi di A, poi `FORM_SUBMIT_MODE: 'proxy'` e secret Web3Forms Pro
nel dashboard Web3Forms (captcha provider **turnstile**). Senza Pro il
proxy ritorna 502: non usare.

6. CSP già include `challenges.cloudflare.com` (script/frame/connect)

## Attivazione frontend

Con `TURNSTILE_SITEKEY` **vuoto**, i form restano come prima (solo honeypot) — nessun breaking change.

Con sitekey valorizzato, `js/main.js`:

- monta il widget visibile a inizio form (`#contactForm` step 1, form
  singoli sopra il submit, newsletter, AI Act, 404)
- blocca "Continua"/submit finché il token non c'è (callback Turnstile +
  `expired-callback`/`error-callback`)
- al submit verifica il token via `/verify` (con un retry su token stantio),
  poi invia in direct senza token né campi operativi
- resetta il widget dopo invio/errori

## Checklist go-live

- [ ] Widget creato (domini corretti)
- [ ] Sitekey in `js/site-config.js` (e rebuild/min se serve)
- [ ] Secret `TURNSTILE_SECRET` nel Worker forms (+ `WEB3FORMS_ACCESS_KEY`
      solo se usi il proxy Pro)
- [ ] Test submit umano OK (verifica arrivo email a hello@webnovis.com)
- [ ] Test submit senza risolvere il widget → blocco con messaggio
- [ ] Test replay token / token scaduto → retry o ritorno allo step 1
- [ ] `npm run sync:headers` già eseguito per CSP

## Note skill turnstile-spin

La skill completa richiede token API Cloudflare con `Account.Turnstile:Edit` e conferma interattiva.
Questa integrazione è pronta al cablaggio: crea il widget dal dashboard e incolla sitekey/secret come sopra.
