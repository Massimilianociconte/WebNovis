# Audit CRO per template — WebNovis · 31/08/2026

Verifica che ogni pagina risponda all'intento di ricerca e guidi alla conversione. Campione: 20 pagine (1 home, 11 servizi, 1 hub, 3 geo commerciali, 2 contatto, portfolio + 1 case study), analizzate integralmente.

Scala checklist: 0-2 per voce (2=ok, 1=migliorabile, 0=assente). Massimo 16.

Voci: 1 INTENT · 2 PROVA · 3 PREZZO · 4 CTA · 5 RASSICURAZIONE · 6 DIFFERENZIAZIONE · 7 USABILITÀ CTA · 8 COERENZA title→H1

## Tabella pagine × checklist

| Pagina | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Tot /16 |
|---|---|---|---|---|---|---|---|---|---|
| index.html (Home) | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | **16** |
| servizi/sviluppo-web.html | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 1 | **14** |
| servizi/graphic-design.html | 2 | 1 | 2 | 2 | 2 | 1 | 2⁺ | 2 | **14** |
| servizi/social-media.html | 2 | 1 | 2 | 2 | 2 | 1 | 2⁺ | 2 | **14** |
| servizi/seo-milano.html | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| servizi/accessibilita.html | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| servizi/ecommerce.html | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| servizi/landing-page.html | 2 | 1 | 2 | 2 | 1 | 2 | 2⁺ | 2 | **15** |
| servizi/sito-vetrina.html | 2 | 1 | 1 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| servizi/brand-identity.html | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| servizi/consulenze.html | 2 | 1 | 2 | 2 | 2 | 1 | 2⁺ | 2 | **15** |
| servizi/audit-gratuito.html | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 1 | **14** |
| realizzazione-siti-web/index.html (Hub) | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| realizzazione-siti-web-rho.html (Geo) | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| agenzia-web-bollate.html (Geo) | 2 | 1 | 2 | 2 | 2 | 2 | 2⁺ | 2 | **15** |
| ecommerce-legnano.html (Geo) | 2 | 1 | 2 | 2 | 1 | 2 | 2⁺ | 2 | **14** |
| contatti.html | 2 | 1 | 2 | 2 | 1 | 1 | 2 | 2 | **13** |
| preventivo.html | 2 | 1 | 2 | 2 | 2 | 1 | 2 | 2 | **14** |
| portfolio.html | 2 | 2 | n/a | 1→2⁺ | 1 | 1 | 2⁺ | 2 | **13** |
| portfolio/case-study/momentum.html | 2 | 2 | n/a | 2 | 2 | 2 | 2 | 2 | **16** |

⁺ = punteggio ottenuto dopo fix applicato in data odierna (prima del fix: 1).
n/a = prezzo non atteso su quel tipo di pagina (portfolio, case study).

### Punteggi medi per template

| Template | Media /16 | Note |
|---|---|---|
| Home | **16,0** | Benchmark interno: prova sociale, prezzi, FAQ e percorsi completi |
| Servizio (11 pagine) | **14,9** | Gap ricorrente: prova inline (1) e qualche rassicurazione/USP |
| Hub "realizzazione siti web" | **15,0** | Tabella decisionale con prezzi: ottima per intento |
| Geo commerciale (3 campioni) | **14,7** | Intento e listino forti; mancano prove locali |
| Contatto (contatti + preventivo) | **13,5** | Form validi; rassicurazioni sui tempi deboli |
| Portfolio + case study | **14,5** | Prova eccellente; CTA di conversione era il punto debole (fixato) |
| **Media complessiva campione** | **14,6 (91%)** | Base solida: i gap sono puntuali, non strutturali |

## Fix applicati (chirurgici, 16 file — backup in `/var/folders/.../opencode/cro/backup/`)

1. **Riga contatto WhatsApp nel footer NAP** (16 pagine commerciali): le 11 pagine servizio, l'hub, le 3 geo e portfolio avevano tel+mail nel footer ma nessun WhatsApp (presente solo su home/contatti/preventivo). Aggiunta una riga discreta dentro `address.footer-nap` dopo la mail, riusando la stessa struttura `<br><a>`: `Scrivici su WhatsApp` → `https://wa.me/393802647367?text=...` ( numero verificato NAP), `target="_blank" rel="noopener noreferrer"`. Zero modifiche a testi o stili.
   File: servizi/{sviluppo-web,graphic-design,social-media,seo-milano,accessibilita,ecommerce,landing-page,sito-vetrina,brand-identity,consulenze,audit-gratuito}.html, realizzazione-siti-web/index.html, realizzazione-siti-web-rho.html, agenzia-web-bollate.html, ecommerce-legnano.html, portfolio.html
2. **Blocco CTA finale su portfolio.html**: la pagina chiudeva con il testo SEO e nessuna CTA di conversione generica (esistevano solo CTA di sezione per graphic-design e social). Inserito prima di `<section class="seo-content">` un blocco minimale che riusa esclusivamente classi già in uso nella pagina (`portfolio-section`, `portfolio-section-lead`, `portfolio-capability-cta`, `pf-btn pf-btn-primary`): titolo breve + 1 frase di valore + bottone `Richiedi Preventivo` → `preventivo.html` (percorso relativo coerente con le CTA esistenti della pagina).

Verifiche post-fix: 0 link interni rotti su tutto il campione (scan ricorsivo pre e post intervento); inserimenti validati nel markup.

Non applicati (fuori perimetro "fix leggeri"): riscrittura testi, aggiunta prezzi non in listino, casi studio. Tutte le segnalazioni sotto.

## Top 10 raccomandazioni prioritarie

| # | Prio | Pagina/i | Intervento consigliato | Impatto stimato |
|---|---|---|---|---|
| 1 | **P0** | servizi/sito-vetrina.html | L'intro dice "Prezzi trasparenti a partire da **€500**" ma il servizio vale **da €1.200** (€500 è la landing page). Ambiguità di prezzo nel primo schermo sulla pagina a maggior volume: allineare al listino o rimuovere il numero dall'intro. | +5-10% CVR sul traffico vetrina; riduzione lead incoerenti |
| 2 | **P0** | servizi/sviluppo-web.html (JSON-LD) | Lo schema `OfferCatalog` espone "Piano SEO & Crescita **€199**" e "Piano Advertising **€299**": in conflitto con seo-milano ("SEO locale da **€400/mese**", "Google Ads da **€500/mese**", valori verificati). Uniformare il listino nei dati strutturati. | Coerenza prezzo mostrata a Google/AI Overviews; protezione CTR e fiducia |
| 3 | **P0** | servizi/consulenze.html | "Consulenza SEO/GEO da **€100**" vs seo-milano che dichiara "consulenze SEO/GEO da **€80**" (valore verificato). Scegliere il valore corretto e allineare le due pagine. | Elimina esitazione in fase di confronto tra pagine |
| 4 | **P1** | Tutte le pagine servizio (11) | Prova sociale inline assente: solo widget Trustpilot nel footer e link casi studio in aside. Inserire in ogni pagina servizio 1 testimonianza pertinente (con nome/azienda come in home) o un blocco "casi studio correlati" visibile. | +10-20% CVR (benchmark social proof); è il gap medio più grande del campione |
| 5 | **P1** | realizzazione-siti-web-rho.html | Frasi corrotte: "la sede è in e possiamo parlarne di persona" e "La nostra sede operativa è a Rho in ed è il comune…" — manca il complemento dopo la preposizione (indirizzo assente). Completare con la dicitura NAP ufficiale ("a Rho (MI)") o riformulare. | Credibilità locale sulla geo pagina principale; +qualità percepita |
| 6 | **P1** | Geo/hub + seo-milano + preventivo | Formato NAP incoerente con top Automata assente: "Sede:, 20017 Rho MI" (Bollate, Legnano, hub, seo-milano) e ", Rho (MI)" (preventivo). Definire un NAP unico (con o senza via) e applicarlo identico ovunque — dipendenza diretta col Local Pack. | +consistenza NAP → local SEO e fiducia |
| 7 | **P1** | landing-page, sito-vetrina, social-media, ecommerce-legnano | CTA secca "Richiedi Preventivo" senza "gratuito" e micro-rassicurazione assente (le altre pagine la hanno). Uniformare su "Richiedi Preventivo Gratuito" + riga "senza impegno". | +3-8% CTR sulle CTA primarie |
| 8 | **P1** | portfolio.html | Nessuna CTA primaria nel primo schermo (solo filtri progetto dopo il sottotitolo). Aggiungere accanto all'hero un bottone `pf-btn pf-btn-primary` → preventivo.html. | +5% uscita diretta verso preventivo dai visitatori portfolio |
| 9 | **P2** | Geo (Rho, Bollate, Legnano) | Nessun caso studio con territory match citato. Collegare 1 case study pertinente per pagina (es. Rho → FB Total Security; Legnano → Mimmo Fratelli per e-commerce). | Rafforza prova e pertinenza locale; +tempo su pagina |
| 10 | **P2** | seo-milano.html, consulenze.html, sviluppo-web.html | Pulizie editoriali: FAQ seo-milano con risposta duplicata/frammentata (§ recensioni); consulenze FAQ "via WhatsApp al Chiama WebNovis" (etichetta link anonima → "+39 380 264 7367"); title sviluppo-web senza "Sviluppo" (title→H1 sfasato ma non grave). | Polish: minor attrito, migliore lettura AI |

### Note di coerenza title→H1 (nessuna gravità P0)
- `servizi/sviluppo-web.html`: title "Siti Web Professionali Milano" vs H1 "Sviluppo Siti Web Professionali su Misura" — allineati nel fondaco, title privo del verbo distintivo (P2).
- `servizi/audit-gratuito.html`: title "Candidatura per PMI" vs H1 "Sta Perdendo Clienti Senza Saperlo" — tono diverso, stessa offerta (P2).
- Tutte le altre: promessa allineata (score 2).

### Prezzi
Listino verificato confermato presente e coerente in home, hub, geo, servizi web, accessibilità (€350/990/2.500+/69), SEO (€400/mese), preventivo (opzioni form con prezzi) e FAQ. Prezzi brand identity (€250/500/150), social (€300/600/500), graphic design e piani mensili (€59/149) sono pubblicati sul sito e non rientrano nel listino verificato fornito: nessun intervento, nessun prezzo inventato.

---
*Audit eseguito su copia locale di lavoro. Nessun deploy effettuato. Backup dei file modificati: `/var/folders/rb/gltk48212j39qn2wskhlj3s80000gn/T/opencode/cro/backup/`.*
