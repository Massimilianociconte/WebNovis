# Interventi SEO — Ponte citazione→commerciale + meta fuori range
**Data:** 2026-08-31 · **Operatore:** agente SEO (opencode) · **Scope:** solo file statici, nessun deploy, nessuna pagina nuova

## Sezione A — Ponte citazione→commerciale

Criterio skip: target (o preventivo/contatti contestuale al target servizio) già presente nel body `<article>`. Nav e footer esclusi dal conteggio (boilerplate).

| # | File | Target | Esito | Anchor |
|---|------|--------|-------|--------|
| 1 | blog/mockup-grafici-guida.html | servizi/graphic-design.html | SKIP (già 2x in body: inline-CTA + CTA finale) | — |
| 2 | blog/indicizzazione-google-problemi.html | servizi/seo-milano.html | AGGIUNTO (1° paragrafo content) | servizi di SEO a Milano |
| 3 | blog/instagram-algoritmo-2026.html | servizi/social-media.html | SKIP (già 2x in body) | — |
| 4 | blog/manutenzione-sito-web.html | /preventivo.html | SKIP (link contestuale già presente: "Scopri i dettagli →") | — |
| 5 | blog/partita-iva-ecommerce.html | /realizzazione-siti-web/ | AGGIUNTO (1° paragrafo content) | creazione e-commerce su misura |
| 6 | blog/api-rest-cosa-sono.html | servizi/sviluppo-web.html | SKIP (già 3x in body) | — |
| 7 | blog/gestione-resi-ecommerce.html | /realizzazione-siti-web/ | AGGIUNTO (1° paragrafo content) | realizzazione di e-commerce su misura |
| 8 | blog/quanto-costa-un-logo.html | servizi/brand-identity.html | SKIP (già 2x in body) | — |
| 9 | blog/gdpr-sito-web-guida.html | servizi/sviluppo-web.html | SKIP (già 3x in body) | — |
| 10 | blog/pagamenti-online-ecommerce.html | /realizzazione-siti-web/ | AGGIUNTO (1° paragrafo content) | realizzazione dell'e-commerce |
| 11 | blog/sanzioni-sito-non-accessibile-2026.html | servizi/accessibilita.html | SKIP (già 2x in body) | — |
| 12 | blog/quanto-costa-campagna-facebook-ads.html | servizi/social-media.html | SKIP (già 4x in body) | — |
| 13 | blog/intelligenza-artificiale-pmi.html | servizi/consulenze.html | SKIP (già 1x in body) | — |
| 14 | blog/quanto-costa-gestione-social-media.html | servizi/social-media.html | SKIP (già 4x in body) | — |
| 15 | blog/dati-obbligatori-sito-web.html | /realizzazione-siti-web/ | SKIP (già 1x in body) | — |
| 16 | blog/seo-per-ai-overviews.html | servizi/seo-milano.html | AGGIUNTO (1° paragrafo content) | servizio SEO a Milano |
| 17 | blog/canva-vs-designer-professionista.html | servizi/graphic-design.html | SKIP (già 1x in body) | — |
| 18 | blog/google-ads-guida-principianti.html | /preventivo.html | AGGIUNTO (1° paragrafo content; v. anomalie) | richiedere un preventivo per la tua campagna Google Ads |
| 19 | blog/brand-identity-guida-completa.html | servizi/brand-identity.html | SKIP (già 1x in body) | — |
| 20 | blog/quanto-costa-brand-identity.html | servizi/brand-identity.html | SKIP (già 2x in body) | — |
| 21 | blog/quanto-costa-un-sito-web.html | /realizzazione-siti-web/ | SKIP (già 1x in body) | — |
| 22 | blog/naming-aziendale-guida.html | servizi/brand-identity.html | SKIP (già 1x in body) | — |
| 23 | blog/instagram-insights-guida.html | servizi/social-media.html | SKIP (già 2x in body) | — |
| 24 | blog/schema-markup-guida.html | servizi/seo-milano.html | AGGIUNTO (1° paragrafo content) | consulenza SEO a Milano |

**Totale A: 7 link aggiunti, 17 skip, 24 pagine valutate.**
Formato href: `../servizi/*.html` e `../preventivo.html` (relativi coerenti con blog/); `/realizzazione-siti-web/` root-relative come già usato nei file. Max 1 link per pagina, nessuna frase esistente rimossa (solo integrazioni in coda al paragrafo).

## Sezione B — Meta description fuori range

Range applicato: 130–158 (index: 145–155; termini-condizioni: ~120–140). `og:description` e `twitter:description` allineati dove presenti. Title mai toccati.

| File | Len OLD→NEW |
|------|-------------|
| index.html | 107 → 150 |
| blog/errori-comuni-siti-web.html | 81 → 133 |
| blog/personal-branding-online.html | 93 → 144 |
| blog/google-analytics-4-guida.html | 84 → 142 |
| blog/landing-page-efficace.html | 107 → 141 |
| blog/content-marketing-per-pmi.html | 93 → 139 |
| blog/tone-of-voice-aziendale.html | 107 → 135 |
| blog/core-web-vitals-guida.html | 91 → 138 |
| blog/sito-web-mobile-first.html | 98 → 147 |
| blog/logo-design-processo-creativo.html | 104 → 133 |
| blog/facebook-ads-guida-pratica.html | 95 → 137 |
| blog/instagram-per-aziende.html | 105 → 143 |
| blog/rebranding-aziendale-guida.html | 89 → 139 |
| blog/ecommerce-errori-da-evitare.html | 91 → 143 |
| blog/wordpress-vs-codice-custom.html | 109 → 139 |
| partner.html | 174 → 146 |
| blog/come-velocizzare-sito-web-lento.html | 175 → 151 |
| blog/ai-act-2026-obblighi.html | 200 → 150 |
| servizi/audit-gratuito.html | 184 → 148 |
| portfolio/case-study/unimidoc.html | 174 → 154 |
| blog/google-business-profile-ottimizzazione.html | 172 → 147 |
| zone-servite/index.html | 164 → 149 |
| termini-condizioni.html | 145 → 132 (og 114→132, twitter 49→132) |
| cookie-policy.html | ok così (109, invariata — bassa priorità) |

**Totale B: 23 meta corrette, 1 invariata per decisione.**

## Riepilogo

- Link aggiunti: **7** · Skip: **17** (già puntati correttamente)
- Meta corrette: **23**
- **File toccati: 30** (7 Task A + 23 Task B, nessuna sovrapposizione)

## Anomalie e note

1. **17/24 pagine avevano già il ponte** nel body (spesso duplicato 2–4 volte): il gap reale era concentrato su 7 pagine, tutte sistemate. Suggerimento futuro: deduplicare i doppi href service-page nelle 17 skip.
2. **blog/google-ads-guida-principianti.html**: target /preventivo.html assente nel body; presenti solo CTA box verso contatti. Aggiunto link contestuale a preventivo (nessuna duplicazione: preventivo restava solo in footer).
3. **termini-condizioni.html**: lunghezza reale description era 145 car (il dato "22" fornito non corrispondeva al file); og:description (114) e twitter:description (49) erano disallineati tra loro → tutti uniformati a 132.
4. **Pagine senza box CTA**: nessuna. Tutte le 24 presentano footer + almeno una CTA contatti/preventivo.
5. **Target inesistenti**: nessuno — tutti i 10 target verificati su disco.
6. La description di `blog/partita-iva-ecommerce.html` inserisce il ponte e-commerce a valle della scelta fiscale (ordine logico: prima P.IVA, poi piattaforma).
