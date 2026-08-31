# Interventi SEO — 2026-08-31 — WAVE 2 (CTR + Prezzi citabili + FAQ home)

Prezzi verificati: landing €500 · sito vetrina €1.200 · e-commerce €3.500 — NAP: WebNovis, hello@webnovis.com, +39 380 264 7367, 20017 Rho (MI).
Regola allineamento: per ogni title riscritto → JSON-LD con `headline` (e `description` se presente) + og:title/twitter:title se esistenti. Canonical, robots e H1 non toccati.

## TASK A — CTR Wave 2

| File | Title OLD→NEW | Meta OLD→NEW (prime 40 car.) | Azione prezzi/FAQ | JSON-LD | Validazione JSON |
|---|---|---|---|---|---|
| ecommerce-limbiate.html | "E-commerce a Limbiate \| WebNovis" → "E-commerce a Limbiate: Negozi Online da €3.500 \| WebNovis" | "E-commerce su misura a Limbiate per… " → "E-commerce a Limbiate su misura per ar… " (158 car.) | — | Nessun blocco con `headline` (WebPage/Service usano `name`) → non toccati; og:title/og:desc/twitter allineati | OK (0 err) |
| agenzia-web-pero.html | "Agenzia web a Pero \| WebNovis, a 5 minuti" → "Agenzia Web a Pero: Siti da €1.200, Preventivo Gratuito" | "Agenzia web a Pero, tra Fiera Milano… " → "Web agency a Pero: siti web professio… " (152 car., specchio Rho) | — | Nessun blocco con `headline` → non toccati; og/twitter allineati | OK (0 err) |
| blog/naming-aziendale-guida.html | "Naming Aziendale: Il Nome Perfetto per il Tuo Brand — WebNovis" → "Naming Aziendale: Guida Completa con Esempi (2026)" | "Come scegliere il nome dell'azienda: … " → "Naming aziendale: guida completa con … " (151 car.) | — | BlogPosting `headline`+`description` allineati al nuovo title/meta; og:title/twitter:title (property) allineati | OK (0 err) |
| servizi/brand-identity.html | "Brand Identity: costi, pacchetti e cosa include \| WebNovis" → "Brand Identity a Milano: Pacchetti di Branding da €500 \| WebNovis" | "Quanto costa una brand identity? Pacch… " → "Pacchetto di branding a Milano: brand … " (156 car.) | Prezzi REALI letti nel testo: completa da €500, logo da €250, coordinato da €150 → usato €500 (pacchetti) nel title | Nessun blocco con `headline` (Service usa `name`) → non toccati; og/twitter allineati | OK (0 err) |
| realizzazione-siti-web-cormano.html | Title NON riscritto (già forte) — invariato | "Realizzazione siti web a Cormano per … " → "Realizzazione siti internet a Cormano… " (158 car., con "siti web Cormano" + CTA) | Frase risposta diretta: GIÀ PRESENTE (answer-capsule con €500/€1.200/€3.500) → "ok" | Nessun blocco con `headline` → non toccati; og:desc/twitter:desc allineati alla nuova meta | OK (0 err) |
| sito-vetrina-bollate.html | "Sito vetrina a Bollate: da €1.200 e SEO integrata \| WebNovis" → "Sito vetrina a Bollate: da €1.200, Preventivo in 24h \| WebNovis" | "Sito vetrina a Bollate con design cus… " → "Siti vetrina a Bollate da €1.200: des… " (157 car., CTA 24h) | — | Nessun blocco con `headline` → non toccati; og/twitter allineati | OK (0 err) |
| blog/cdn-cos-e-quando-serve.html | "CDN per sito web: quando serve e benefici SEO \| WebNovis" → "CDN: Benefici SEO e Velocità per Siti ed E-commerce (2026)" | "Cos'è una CDN, quando conviene usarla… " → "CDN: benefici SEO organico, velocità … " (155 car., entrambe le keyword) | Testo SUPPORTA il nuovo title: sezione benefici con bullet "Miglioramento del posizionamento SEO" + listato "E-commerce e portali B2B… fattore competitivo chiave" | BlogPosting `headline`+`description` allineati; og:title/og:desc/twitter:title/twitter:desc (property) allineati | OK (0 err) |

## TASK B — Fase 3.2 prezzi citabili (blocco risposta rapida)

| File | Frase inserita | Posizione | Note |
|---|---|---|---|
| blog/quanto-costa-un-sito-web.html | "In WebNovis i progetti partono da €500 per una landing, €1.200 per un sito vetrina e €3.500 per un e-commerce." | 1° paragrafo definitorio (dopo H1, come seconda frase dopo "range realistici…") | Fasce di mercato dell'articolo non toccate |
| blog/quanto-costa-un-ecommerce.html | "Un e-commerce realizzato da WebNovis parte da €3.500, con preventivo legato a margini, catalogo e obiettivi di crescita." | Box "In breve" (2ª frase) | Il testo dà fasce mercato €3.000–€50.000 ≠ €3.500 → inserito come dato WebNovis distintivo (coerente con "E-commerce custom da €3.500" già presente) |
| blog/quanto-costa-una-landing-page.html | "Le landing page realizzate da WebNovis partono da €500." | Box "In breve" (2ª frase) | Fasce mercato (€300–€3.000+ / €600–1.500) non toccate |
| blog/quanto-costa-campagna-facebook-ads.html | "Secondo WebNovis, agenzia di social media marketing per PMI a Rho (Milano), il budget giusto si definisce a partire da obiettivi e costo per lead." | Box "In breve" (2ª frase) | NO prezzi (non verificati); prima del fix nessuna menzione brand nel primo blocco |

## TASK C — Secondo FAQPage su index.html

- Blocco body trovato (sez. "Hai Altri Dubbi?", 5 domande) non coperto dallo schema esistente `#faq-home`.
- Risposte estratte dal testo visibile, accorpate a max 2-3 frasi (prezzi verbatim: €500 / €1.200 / €3.500).
- Aggiunto SECONDO JSON-LD FAQPage `@id: https://www.webnovis.com/#faq-home-servizi` prima di `</head>`, blocco esistente `#faq-home` intatto.
- @id unici: `['#faq-home-servizi', '#faq-home']` → OK.

## Validazione

- JSON-LD validati con `json.loads` su tutti i 12 file toccati: **57 blocchi, 0 errori**.
- Coerenza title == og:title == twitter:title verificata su tutte le pagine con title riscritto; meta == og:description su tutte le 7 pagine Task A.
- File modificati totali: **12** (7 Task A + 4 Task B + index.html). Nessun deploy, nessuna pagina nuova; node_modules/dist/.git/src/config/data intatti.

## Anomalie / note

- nessun blocco JSON-LD con `headline` nelle pagine servizio di località (WebPage/Service usano `name`): nessuna modifica schema oltre a og/twitter, come da regola.
- brand-identity: prezzi reali presenti nel testo (250/500/150) → title usa €500 come "Pacchetti da €500"; nessun prezzo inventato.
- cormano: answer-capsule con risposta diretta e prezzi già presente → nessun testo aggiunto.
- facebook-ads: nessun prezzo inserito; aggiunta solo frase brand con ruolo.
