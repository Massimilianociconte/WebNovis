# Consolidamento Geo — Analisi comune × famiglia (2026-08-31)

> **Scope**: solo analisi. Nessun file del sito è stato modificato.
> **Fonti**: `sitemap.xml` (368 URL), listing disco (radice), dati GSC verificati (ultimi 28 gg, imp/pos).
> **Famiglie analizzate (6 indexabili)**: `agenzia-web-`, `realizzazione-siti-web-`, `ecommerce-`, `seo-locale-`, `landing-page-`, `sito-vetrina-`.
> **Escluse (già de-amplificate: noindex+301, NON toccare)**: `accessibilita-`, `consulenze-`, `copywriting-`, `fotografia-aziendale-`, `web-app-`, `automazione-business-`, `restyling-`, `manutenzione-`, `sviluppo-app-mobile-`, `email-marketing-`, `google-ads-`, `graphic-design-`, `social-media-`.

---

## 1. Verifica del claim Master "fino a 6 URL per comune"

**VERDICT: ✅ CONFERMATO — max reale = 6/6, raggiunto da `arese` e `rho`.**

Sitemap: **78 URL** matchano i 6 prefissi commerciali, di cui:
- **73 pagine geo** (`{famiglia}-{comune}.html`)
- **5 articoli editoriale/guida in /blog/** (intent editoriale, NON consolidare): `blog/ecommerce-b2b-guida.html`, `blog/ecommerce-che-vende.html`, `blog/ecommerce-errori-da-evitare.html`, `blog/landing-page-ads.html`, `blog/seo-locale-google-maps.html`
- + 2 hub directory già in sitemap: `/agenzia-web/`, `/realizzazione-siti-web/`

> ⚠️ Nota di riconciliazione: il Master audit cita "83 URL". Il conteggio sitemap reale sui 6 prefissi è **78** (73 geo + 5 blog). Il delta di ~5 probabilmente include gli hub `/agenzia-web/` + `/realizzazione-siti-web/`, la variante plurale `agenzie-web-rho.html` (presente **solo su disco**, non in sitemap) o conteggi su file-system. Da riconciliare nel prossimo audit.

### Matrice comune × famiglia (da sitemap, solo pagine geo)

| Comune | n/6 | agen | rsw | ecom | seo-loc | land | vetr |
|---|---|---|---|---|---|---|---|
| **arese** | **6/6** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **rho** | **6/6** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| bollate | 5/6 | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| garbagnate | 4/6 | ✅ | ✅ | ✅ | ✅ | — | — |
| lainate | 4/6 | ✅ | — | ✅ | ✅ | — | ✅ |
| legnano | 4/6 | ✅ | ✅ | ✅ | — | — | ✅ |
| milano | 4/6 | ✅ | — | ✅ | ✅ | ✅ | — |
| cinisello-balsamo | 3/6 | ✅ | — | ✅ | ✅ | — | — |
| cormano | 3/6 | — | ✅ | ✅ | ✅ | — | — |
| milano-ovest | 3/6 | ✅ | ✅ | — | — | ✅ | — |
| parabiago | 3/6 | ✅ | ✅ | — | ✅ | — | — |
| senago | 3/6 | — | ✅ | ✅ | ✅ | — | — |
| bresso | 2/6 | — | — | ✅ | ✅ | — | — |
| castellanza | 2/6 | ✅ | ✅ | — | — | — | — |
| limbiate | 2/6 | — | ✅ | ✅ | — | — | — |
| monza | 2/6 | ✅ | — | ✅ | — | — | — |
| sesto-san-giovanni | 2/6 | ✅ | — | — | ✅ | — | — |
| baranzate | 1/6 | ✅ | — | — | — | — | — |
| cornaredo | 1/6 | ✅ | — | — | — | — | — |
| milano-nord | 1/6 | ✅ | — | — | — | — | — |
| monza (sopra) / novate-milanese | 1/6 | ✅ | — | — | — | — | — |
| pero | 1/6 | ✅ | — | — | — | — | — |
| saronno | 1/6 | ✅ | — | — | — | — | — |
| settimo-milanese | 1/6 | ✅ | — | — | — | — | — |
| arluno | 1/6 | — | ✅ | — | — | — | — |
| buccinasco | 1/6 | — | ✅ | — | — | — | — |
| caronno-pertusella | 1/6 | — | ✅ | — | — | — | — |
| magenta | 1/6 | — | ✅ | — | — | — | — |
| origgio | 1/6 | — | ✅ | — | — | — | — |
| solaro | 1/6 | — | ✅ | — | — | — | — |
| rozzano | 1/6 | — | — | — | ✅ | — | — |

**Distribuzione famiglie (URL geo in sitemap)**: agenzia-web 20 · realizzazione-siti-web 17 · ecommerce 16 · seo-locale 13 · landing-page 7 · sito-vetrina 5.

### ⚠️ Delta disco vs sitemap (nota P2)
Su disco esistono **271 file** con i 6 prefissi, ma solo **73 geo sono in sitemap**: **199 file su disco NON in sitemap** (es. `agenzia-web-senago.html`, `realizzazione-siti-web-lainate.html`, `ecommerce-pero.html`, `agenzie-web-rho.html` plurale…). Non sono "indexabili" al netto, ma vanno verificati (canonical/noindex/410) perché sono potenziale cannibalizzazione latente o URL orfani.

---

## 2. Incrocio GSC → pagina più forte per comune

Stima click attesi = imp × CTR(pos) con curva approssimata: pos≤5→5% · 6-10→2,5% · 11-15→1,2% · 16-20→0,6% · 21-30→0,3% · 31-50→0,15% · >50→0,08%.

| Comune | Pagina più forte per imp | Pagina più forte per pos | Click attesi (top 2) | Hub consigliato |
|---|---|---|---|---|
| legnano | rsw-legnano 182/17,91 | rsw-legnano (ecom 17,47, margine minimo) | rsw ≈1,1 | **realizzazione-siti-web-legnano** |
| bollate | rsw-bollate 146/18,79 | **agenzia-web-bollate 98/12,97** | agen ≈1,2 vs rsw ≈0,8 | **agenzia-web-bollate** |
| rho | rsw-rho 87/20,26 | agenzia-web-rho 19/19,37 (pari) | rsw ≈0,5 | **realizzazione-siti-web-rho** |
| arese | rsw-arese 77/11,61 | rsw-arese 11,61 | rsw ≈0,9 | **realizzazione-siti-web-arese** |
| senago | rsw-senago 65/10,75 | ecommerce-senago 18/5,94 (intent diverso) | rsw ≈1,6 | **realizzazione-siti-web-senago** |
| garbagnate | rsw-garbagnate 56/15,59 | seo-locale-garbagnate 4/7,75 (intent diverso) | rsw ≈0,7 | **realizzazione-siti-web-garbagnate** |
| lainate | **agenzia-web-lainate 101/10,07** | agenzia-web-lainate | agen ≈2,5 (miglior pagina geo agenzia) | **agenzia-web-lainate** |
| milano-ovest | rsw-mo 84/50,44 | **agenzia-web-mo 16/19,94** | quasi pari (0,13 vs 0,10) | **agenzia-web-milano-ovest** |
| milano-nord | agenzia-web-milano-nord 41/10,41 | idem | ≈1,0 | **agenzia-web-milano-nord** |
| pero | agenzia-web-pero 26/13,5 | idem | ≈0,3 | **agenzia-web-pero** |
| cornaredo | agenzia-web-cornaredo 23/13 | idem | ≈0,3 | **agenzia-web-cornaredo** |
| monza | ecommerce-monza 149/36,17 | ecommerce-limbiate 13/2,92 (altro comune) | ecom-monza ≈0,2 | **agenzia-web-monza** (unica famiglia web) |
| limbiate | ecommerce-limbiate 13/2,92 | idem | ≈0,3 | **realizzazione-siti-web-limbiate** (unica web) |
| cormano | seo-locale-cormano 7/7,71 | idem | ≈0,2 | **realizzazione-siti-web-cormano** (unica web) |
| bresso | ecommerce-bresso 5/4,2 | idem | ≈0,1 | n/d (nessuna famiglia web) |
| rozzano | seo-locale-rozzano 5/9,6 | idem | ≈0,1 | n/d |
| milano | landing-page-milano 2/**2,0** | idem | ≈0,1 | **agenzia-web-milano** (unica web) |
| (hub globali) | realizzazione-siti-web/ 2094/37,43 · zone-servite/ 52/21,46 | — | rsw/ ≈3,1 | — |

---

## 3. Tabella di decisione

**Regole applicate**: (a) un solo hub per comune; (b) hub = pagina più forte (imp × CTR(pos)); eccezione Master rsw-standard se pari; (c) **NO 301** per intent diverso (ecommerce, seo-locale, landing-page = servizi distinti → si mantengono); (d) consolidamento solo su coppie/triple `agenzia-web` vs `realizzazione-siti-web` vs `sito-vetrina` quando coesistono e una+ è debole.

| Comune | Hub consigliato | Secondari da MANTENERE | Secondari da 301 → hub | Note |
|---|---|---|---|---|
| **bollate** | `agenzia-web-bollate` (98/12,97) | `ecommerce-bollate` (intent diverso, n/d GSC) | `realizzazione-siti-web-bollate` (146/18,79), `sito-vetrina-bollate` (17/14,88) | P0. Caso più netto di tripla coesistente con dati su tutte e 3. rsw porta più imp ma pos peggiore (CTR-adj: agen vince). Alternativa lecita: hub rsw standard — l'importante è UN solo hub, il 301 fonde i segnali comunque. |
| **rho** | `realizzazione-siti-web-rho` (87/20,26) | `ecommerce-rho` (9/21,33), `landing-page-rho` (1/9, monitor), `seo-locale-rho` (n/d) | `agenzia-web-rho` (19/19,37), `sito-vetrina-rho` (n/d) | P0. Comune 6/6. pos quasi pari (19-20), rsw vince 4,5× su imp → hub standard. |
| **arese** | `realizzazione-siti-web-arese` (77/11,61) | `ecommerce-arese`, `seo-locale-arese`, `landing-page-arese` (tutti intent/servizio diverso) | `agenzia-web-arese` (43/13,28), `sito-vetrina-arese` (n/d) | P0. Comune 6/6. rsw domina su entrambe le metriche. |
| **legnano** | `realizzazione-siti-web-legnano` (182/17,91 — 2° impatto geo dopo l'hub) | `ecommerce-legnano` (15/17,47, intent diverso) | `agenzia-web-legnano` (n/d GSC), `sito-vetrina-legnano` (n/d GSC) | P0. Le 2 pagine da fondere non hanno dati GSC = zero traffico da preservare, consolidamento "gratuito". |
| **milano-ovest** | `agenzia-web-milano-ovest` (16/19,94) | `landing-page-milano-ovest` (8/29,12, servizio diverso — monitor) | `realizzazione-siti-web-milano-ovest` (84/50,44) | P1. pos 50 = quasi invisibile; click attesi pari ma agenzia è a ~page 2 con potenziale. Invertire direzione solo se si vuole coerenza standard-rsw. |
| **garbagnate** | `realizzazione-siti-web-garbagnate` (56/15,59) | `ecommerce-garbagnate` (n/d), `seo-locale-garbagnate` (4/7,75 — buona pos, ottimizzare) | `agenzia-web-garbagnate` (n/d GSC) | P1. Coppia rsw+agenzia, agenzia senza tracciamento → 301 pulito. |
| **lainate** | `agenzia-web-lainate` (101/10,07 — miglior agenzia geo) | `ecommerce-lainate`, `seo-locale-lainate` (n/d, servizi diversi) | `sito-vetrina-lainate` (n/d GSC) | P1. Nessun rsw-lainate. proteggere l'hub: è il miglior segnale famiglia agenzia. |
| **parabiago** | `realizzazione-siti-web-parabiago` (standard, n/d) | `seo-locale-parabiago` (n/d) | `agenzia-web-parabiago` (n/d) | P2. Coppia agenzia+rsw entrambe zero-GSC → consolidamento a rischio ~zero. |
| **castellanza** | `realizzazione-siti-web-castellanza` (standard, n/d) | — | `agenzia-web-castellanza` (n/d) | P2. Idem, coppia debole-debole. |
| **senago** | `realizzazione-siti-web-senago` (65/10,75) | `ecommerce-senago` (18/5,94), `seo-locale-senago` (2/9) | nessuno (no agenzia/vetrina) | P2. Nessuna sovrapposizione: solo potenziamento hub. |
| **milano** | `agenzia-web-milano` (n/d — unica web) | `landing-page-milano` (2/**2,0** — opportunità!), `ecommerce-milano`, `seo-locale-milano` | nessuno | P2. landing-page-milano già a pos 2 con 2 imp: spingere contenuti + link interni dall'hub. |
| **monza** | `agenzia-web-monza` (n/d — unica web) | `ecommerce-monza` (149/**36,17** — intent diverso, MA 149 imp sprecate a pos 36 → priorità ottimizzazione) | nessuno | P2. Maggiore opportunità "latente" del set: recuperare pos su ecommerce-monza. |
| **limbiate** | `realizzazione-siti-web-limbiate` (n/d — unica web) | `ecommerce-limbiate` (13/**2,92** — ottima pos, ottimizzare titolo/meta) | nessuno | P2. |
| **cormano** | `realizzazione-siti-web-cormano` (n/d — unica web) | `seo-locale-cormano` (7/7,71), `ecommerce-cormano` (n/d) | nessuno | P2. |
| **milano-nord** | `agenzia-web-milano-nord` (41/10,41) | — | nessuno | P2. Unica pagina del comune: fortificare con link interni da hub. |
| **pero** | `agenzia-web-pero` (26/13,5) | — | nessuno (in sitemap) | P2. NB: `realizzazione-siti-web-pero.html` esiste su disco ma NON in sitemap → verificare noindex/301 (delta disco). |
| **cornaredo** | `agenzia-web-cornaredo` (23/13) | — | nessuno | P2. |
| **bresso** | n/d (nessuna famiglia web) | `ecommerce-bresso` (5/4,2), `seo-locale-bresso` (n/d) | nessuno | P2. Eventuale futura pagina web da valutare (pos già buone su ecommerce). |
| **rozzano** | n/d | `seo-locale-rozzano` (5/9,6) | nessuno | P2. |
| cinisello-balsamo | `agenzia-web-cinisello-balsamo` (unica web, n/d) | `ecommerce-…`, `seo-locale-…` | nessuno | P2. |
| sesto-san-giovanni | `agenzia-web-sesto-san-giovanni` (unica web) | `seo-locale-sesto-san-giovanni` | nessuno | P2. |
| baranzate, novate-milanese, saronno, settimo-milanese | hub = unica pagina agenzia-web- | — | nessuno | P2. Nessuna azione strutturale. |
| arluno, buccinasco, caronno-pertusella, magenta, origgio, solaro | hub = unica pagina rsw- | — | nessuno | P2. Idem. |

**Fuori scope geo ma correlato**: `/realizzazione-siti-web/` 2094 imp a pos **37,43** = il maggiore serbatoio di impressioni del sito mal posizionato (P1 trasversale: ottimizzazione hub + link interni dalle pagine geo). `zone-servite/` 52/21,46 → usarlo come ponte interlink verso gli hub comunali.

---

## 4. Priorità

### P0 — eseguire subito (sovrapposizione con traffico GSC reale; 8 301)
1. **Bollate** → 301 `realizzazione-siti-web-bollate` + `sito-vetrina-bollate` → `agenzia-web-bollate`. Unire Title/H1/FAQ verso keyword "agenzia web Bollate".
2. **Rho** → 301 `agenzia-web-rho` + `sito-vetrina-rho` → `realizzazione-siti-web-rho`.
3. **Arese** → 301 `agenzia-web-arese` + `sito-vetrina-arese` → `realizzazione-siti-web-arese`.
4. **Legnano** → 301 `agenzia-web-legnano` + `sito-vetrina-legnano` → `realizzazione-siti-web-legnano` (zero rischio: nessun dato GSC sulle 2 pagine assorbite).

### P1 — secondo batch (3 301)
5. **Milano-ovest** → 301 `realizzazione-siti-web-milano-ovest` → `agenzia-web-milano-ovest` (decisione direzione documentata; alternativa speculare).
6. **Garbagnate** → 301 `agenzia-web-garbagnate` → `realizzazione-siti-web-garbagnate`.
7. **Lainate** → 301 `sito-vetrina-lainate` → `agenzia-web-lainate` (hub migliore famiglia agenzia: proteggere e irrobustire).
8. *(trasversale)* Ottimizzazione hub `/realizzazione-siti-web/` (2094 imp / pos 37,4).

### P2 — consolidamento a basso rischio + hygiene (2 301 + verifiche)
9. **Parabiago** → 301 `agenzia-web-parabiago` → `realizzazione-siti-web-parabiago`.
10. **Castellanza** → 301 `agenzia-web-castellanza` → `realizzazione-siti-web-castellanza`.
11. Verifica dei **199 file geo su disco non in sitemap** (noindex/canonical/410) — inclusa la variante plurale `agenzie-web-rho.html` (orfana o redirect?).
12. Opportunità contenuto: `ecommerce-monza` (149 imp/pos 36) e `ecommerce-limbiate` (13 imp/pos 2,9); `landing-page-milano` (pos 2) → spingere con link interni.

---

## 5. Stima URL coinvolti

| Voce | N |
|---|---|
| Pagine geo commerciali in sitemap oggi | 73 (+2 hub dir = 75) |
| 301 proposti totali | **13** (8 P0 · 3 P1 · 2 P2) |
| Hub da potenziare (contenuto/interlink) | 9 |
| Pagine geo commerciali in sitemap dopo consolidamento | **60** (+2 hub = 62) → **−17% URL geo** |
| File su disco con i 6 prefissi da verificare (non in sitemap) | 199 |
| Articoli blog con prefissi commerciali (NON toccare) | 5 |

**Rischio**: basso. Nessun 301 verso pagine di intent diverso; ecommerce/seo-locale/landing-page restano intatti; le famiglie già de-amplificate non sono incluse.

---
*Generato da analisi sitemap.xml + listing disco + dati GSC 28gg. Solo report: nessun file del sito modificato.*
