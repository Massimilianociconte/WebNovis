# Interventi SEO — Dati strutturati JSON-LD (2026-08-31)

Obiettivo: Master §3.7/§10.1 — GSC "Aspetto nella ricerca" vuoto → schema JSON-LD completo e coerente.
Esito chiave: **JSON-LD preesistente trovato in TUTTI i file target** (valido al 100%). Nessun inserimento da zero necessario salvo contatti; lavoro svolto in modalità **aggiorna/integra senza duplicare**, come da protocollo.

## Riepilogo gruppi

| Gruppo | Pagine modificate | Note |
|---|---|---|
| index | 1 (index.html) | Integrazione su schema preesistente |
| contatti | 1 (contatti.html) | ProfessionalService aggiunto (era assente) |
| servizi | 11 di 12 | servizi/index.html (hub) non richiede Service |
| blog | 0 di 10 | Già conformi, solo verifica |

## Dettaglio per file

| File | Schema (tipo) | Note |
|---|---|---|
| index.html | Organization, WebSite, ProfessionalService/LocalBusiness, WebPage, FAQPage (preesistenti, validi) | Aggiunto `openingHoursSpecification` Mo-Fr 09:00-18:00 al ProfessionalService. Verificato prima: NESSUN orario dichiarato in contatti.html/js → usati gli orari da specifica. FAQ reali: SÌ, le 4 domande del blocco FAQPage esistente sono presenti nel body visibile (inclusi "Quanto costa un sito web professionale?", "Lavorate solo a Milano...") → FAQPage mantenuto, non duplicato |
| contatti.html | + ProfessionalService (nuovo), BreadcrumbList + ContactPage (preesistenti) | Inserito prima di `</head>`. Copia della entity `@id https://www.webnovis.com/#localbusiness` di index (stesso @id richiesto). Address PostalAddress inline SENZA streetAddress (Rho/MI/20017/IT), priceRange €€, areaServed Rho+Milano+Hinterland milanese+Italia, openingHours Mo-Fr 09:00-18:00. Nessuna duplicazione FAQPage |
| servizi/accessibilita.html | Service + BreadcrumbList + FAQPage (preesistenti) | name già = H1. provider unificato → ProfessionalService @id #localbusiness. areaServed + AdministrativeArea "Hinterland milanese". Offers preesistenti (hasOfferCatalog 350/990/...) verificate nel testo → mantenute. Prezzi Master 500/1200/3500 non pertinenti a questa pagina → non aggiunti |
| servizi/audit-gratuito.html | idem | name aggiornato a H1 reale "Audit Digitale: Scopri se il Tuo Sito Sta Perdendo Clienti Senza Saperlo". Nessun prezzo nel testo → offers omessa (corretto) |
| servizi/brand-identity.html | idem | name → H1 "Brand Identity: costi, pacchetti e cosa include davvero". offers omessa (nessun prezzo Master nel testo) |
| servizi/consulenze.html | idem | name → H1 "Consulenze Strategiche per il Tuo Business Digitale". offers omessa |
| servizi/ecommerce.html | idem | name → H1 "E-Commerce Personalizzato che Vende Davvero". offers preesistente **3500 EUR verificata nel testo** ("Il prezzo parte da €3.500") → mantenuta. areaServed integrato (prima solo Italia) |
| servizi/graphic-design.html | idem | name → H1 "Graphic Design & Brand Identity che Lascia il Segno". offers omessa |
| servizi/landing-page.html | idem | name → H1 "Landing Page ad Alta Conversione su Misura". offers preesistente **500 EUR verificata nel testo** ("da €500") → mantenuta. areaServed integrato |
| servizi/seo-milano.html | idem | name → H1 "SEO a Milano per PMI: posizionamento nei risultati di ricerca". offers preesistente **minPrice 400 EUR/mese verificata nel testo** ("SEO locale da €400/mese") → mantenuta (non è un prezzo Master, ma è nel testo della pagina) |
| servizi/sito-vetrina.html | idem | name → H1 "Siti Web Vetrina Professionali con Codice Custom". offers preesistente **1200 EUR verificata nel testo** ("da €1.200") → mantenuta. areaServed integrato |
| servizi/social-media.html | idem | name → H1 "Social media marketing a Milano per brand che vogliono più richieste". offers omessa |
| servizi/sviluppo-web.html | idem | name → H1 "Sviluppo Siti Web Professionali su Misura". offers omessa |
| servizi/index.html | BreadcrumbList + WebPage + CollectionPage (preesistenti) | Hub di elenco, non pagina servizio: Service NON applicabile → nessuna modifica |
| blog/mockup-grafici-guida.html | BlogPosting + BreadcrumbList + FAQPage (preesistenti) | Nessuna modifica: headline, datePublished 2026-02-20 / dateModified 2026-08-07 (letti dal file), author Organization "WebNovis" @id #organization, publisher+logo, mainEntityOfPage, image, breadcrumb — tutti presenti e validi |
| blog/indicizzazione-google-problemi.html | idem | Nessuna modifica. Date: 2026-02-27 / 2026-07-26 |
| blog/instagram-algoritmo-2026.html | idem | Nessuna modifica. Date: 2026-03-07 / 2026-07-26 |
| blog/manutenzione-sito-web.html | idem | Nessuna modifica. Date: 2026-02-20 / 2026-08-07 |
| blog/partita-iva-ecommerce.html | idem | Nessuna modifica. Date: 2026-02-20 / 2026-03-26 |
| blog/api-rest-cosa-sono.html | idem | Nessuna modifica. Date: 2026-03-01 / 2026-07-26 |
| blog/gestione-resi-ecommerce.html | idem | Nessuna modifica. Date: 2026-02-25 / 2026-07-26 |
| blog/quanto-costa-un-logo.html | idem | Nessuna modifica. Date: 2026-02-20 / 2026-08-07 |
| blog/gdpr-sito-web-guida.html | idem | Nessuna modifica. Date: 2026-02-20 / 2026-08-07 |
| blog/pagamenti-online-ecommerce.html | idem | Nessuna modifica. Date: 2026-02-25 / 2026-07-26 |

## BreadcrumbList
Già presente e corretto (Home > Servizi > X con 3 step; Home > Blog > Titolo) su tutte le 12 pagine servizi e tutte le 10 pagine blog → **nessun inserimento necessario**, nessun @graph aggiuntivo creato per evitare duplicazione.

## Errori evitati / verifiche
- Schema preesistente trovato ovunque (grep `application/ld+json` su ogni file target PRIMA di scrivere) → zero blocchi duplicati; zero doppie FAQPage su index/contatti.
- `streetAddress`: mai inserito (non verificato) — confermato assente da tutti i blocchi dopo modifica.
- sameAs: blocchi preesistenti già contenevano profili social del sito (IG, FB, YouTube handle, Trustpilot, DesignRush, GoodFirms) — dati del sito, non inventati; nessun profilo nuovo aggiunto.
- Logo `Img/webnovis-logo-bianco.png` verificato esistente in Img/ e sitemap.xml.
- Orari: nessuna dichiarazione di orari nel sito (contatti.html non dichiara orari) → applicati Mo-Fr 09:00-18:00 da specifica.
- Autore articoli: Organization "WebNovis" (nessun Person inventato) — già conforme, confermato.
- Prezzi Master usati solo dove presenti nel testo visibile della pagina (landing 500, vetrina 1200, ecommerce 3500).

## Validazione
- 71 blocchi JSON-LD estratti e validati con `python3 json.loads`: **71 validi, 0 errori**.
- Nessun commento nei JSON; serializzazione compatta coerente con lo stile minificato dei file.
- File toccati: 13 (index.html, contatti.html, 11 servizi). Blog e servizi/index.html: 0 scritture.
- Divieti rispettati: nessuna pagina creata; nessun tocco a node_modules, dist, .git, src, config, data (escluso worktree .claude/*).
