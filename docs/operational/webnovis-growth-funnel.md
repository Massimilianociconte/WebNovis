# Webnovis Growth Funnel — Dati Operativi

Derivato dal PRD §4-5 (Growth OS + Webnovis motore di cassa). Istruzioni operative per il funnel permission-first.

## SOP Opportunity Scan (Audit Preliminare)

### Selezione (max 5/mese)
1. Ricevi candidatura via `servizi/audit-gratuito.html` → CRM status: `new`
2. Verifica che il business abbia un'attività reale e un segnale concreto
3. Controlla compatibilità con il perimetro attuale (aree analizzabili)
4. Se compatibile: → status `accepted`, rispondi entro 48h per concordare la consegna
5. Se non compatibile: → status `rejected`, rispondi comunque con orientamento, entro 72h

6. Se compatibile ma limite mensile raggiunto: → status `waitlisted`, comunica la lista d'attesa

 (15-20 min per audit)
1. Visita il sito segnalato
2. Annota fino a 3 osservazioni concrete (non opinioni)
3. Verifica: performance base, UX/percorso contatto, visibilità locale
4. Scrivi in linguaggio semplice, senza gergo tecnico

### Consegna
1. Invia 1 pagina con le 3 osservazioni, ordinate per priorità → status `delivered`
2. NON includere proposte commerciali
3. Offri una call di 10 min se richiesta

### Follow-up (dopo 7 giorni)
1. Se il prospect chiede approfondimento → proponi consulenza o preventivo
2. Se non risponde → non sollecitare oltre un reminder
3. Traccia nel CRM: esito (approfondito / rimandato / perso)

## Schema CRM Minimo

Foglio strutturato o tabella Supabase. Campi minimi:

| Campo | Tipo | Note |
|---|---|---|
| `source` | string | audit_form, partner_form, referral, organic, event, manual |
| `segment` | string | local_business, professional, sme, multi_site |
| `trigger` | string | segnale concreto (es. "sito lento", "zero contatti") |
| `permission_basis` | string | form_consent, referral, discovery_call |
| `status` | string | new, qualified, in_discovery, proposed, won, lost, rejected, waitlisted, accepted, delivered, inactive |
| `owner` | string | massimiliano / alessandro |
| `last_contact` | date | ultima interazione |
| `next_action` | string | prossimo passo concreto |
| `problem_signal` | text | dal campo form preventivo / audit |
| `current_website` | url | URL analizzato |
| `utm_source` | string | se disponibile |
| `utm_medium` | string | se disponibile |
| `utm_campaign` | string | se disponibile |

## Pipeline Partner

Stati e criteri:

1. **New** — proposta di collaborazione ricevuta via `partner.html`
2. **Screening** — verifica compatibilità (settore, cliente tipo, aspettative)
3. **Discovery Call** — videochiamata conoscitiva di 20 min
4. **Active** — collaborazione avviata, primo caso in pipeline condivisa
5. **Inactive** — nessuna segnalazione da >90 giorni
6. **Declined** — non compatibile o richieste non allineate

Criteri di qualificazione:
- Il partner ha una base clienti reale e attiva
- I suoi clienti hanno esigenze digitali concrete
- Il partner è disposto a concordare condizioni per iscritto caso per caso

## Template Richiesta Permission-First

```
Ciao [Nome],

ho notato [segnale concreto: es. "il tuo sito carica in 6 secondi"
/ "la tua scheda Google ha orari errati" / "il form di contatto
restituisce errore"]. Mi occupo di sviluppo web e performance e ho
preparato tre osservazioni rapide che potrebbero esserti utili.
Non è una proposta commerciale.

Se ti interessa, te le mostro in 15 minuti. Se non è il momento,
nessun problema.

[firma]
```

## Template Consegna 3 Osservazioni

**Audit Preliminare — [Nome Attività] — [Data]**

1. **[Area prioritaria]** — [Osservazione concreta]
2. **[Seconda area]** — [Osservazione]
3. **[Terza area]** — [Osservazione]

**Cosa puoi fare ora:** [1-2 azioni immediate, costo zero o quasi]

**Se vuoi approfondire:** [Link alla pagina consulenze o contatti]

## Weekly Scorecard Webnovis

| Metrica | Target settimanale |
|---|---|
| Account analizzati (segnali) | 5 |
| Richieste di permesso inviate | 2 |
| Candidature audit ricevute | — (monitorare) |
| Audit consegnati | max 5/mese |
| Discovery call | ≥3 |
| Proposte inviate | ≥2 |
| Contratti / depositi | ≥1 |
| Follow-on / retainer / referral | monitorare |
| Contatti partner | 2 |

## Metriche Funnel

| Step | Soglia iniziale |
|---|---|
| Candidature → Selezionati | 30-60% |
| Audit → Discovery Call | ≥30% |
| Proposta → Contratto | monitorare dopo 10 proposte |

Note: le soglie sono indicative e vanno calibrate dopo almeno 20 candidature.

## Checklist Primi 30 Account e 15 Partner

- [ ] Lista 30 account con trigger reale (raccogli da osservazione diretta)
- [ ] Classifica per segmento e priorità
- [ ] Lista 15 potenziali partner con canale di contatto
- [ ] Prepara 3 audit "dimostrativi" su casi pubblici per allenamento
- [ ] Definisci CRM con i campi sopra (foglio Google / Supabase)
- [ ] Calendarizza 2 sessioni/settimana di analisi account (lunedì)
- [ ] Calendarizza 2 contatti partner/settimana (giovedì)

> **NON compilare con contatti inventati.**
