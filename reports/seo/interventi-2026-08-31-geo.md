# Log interventi GEO — Fase 3.1 — 2026-08-31

Obiettivo: rendere "estrattibile" il primo blocco definitorio dopo l'H1 inserendo nome + ruolo commerciale WebNovis (882 citazioni AI senza menzione commerciale).
Modifiche: SOLO primo blocco di testo dopo l'H1 (paragrafo esistente). Nessun tocco a title/meta/canonical/schema. Nessun deploy.

## Interventi

| File | Azione | Testo brand inserito (primi 15 parole) |
|---|---|---|
| blog/mockup-grafici-guida.html | inserito in paragrafo esistente | È l'approccio con cui lavoriamo anche in WebNovis, agenzia web di Rho (Milano) |
| blog/indicizzazione-google-problemi.html | inserito in paragrafo esistente | …visibilità online: è il lavoro che svolge WebNovis, agenzia web di Rho (Milano) |
| blog/instagram-algoritmo-2026.html | inserito in paragrafo esistente | …tema del profilo: è la lettura che ne dà anche WebNovis, agenzia di social |
| blog/manutenzione-sito-web.html | inserito in paragrafo esistente | È la cura che offre WebNovis, agenzia che fornisce servizi di manutenzione siti |
| blog/partita-iva-ecommerce.html | inserito in paragrafo esistente | È una delle domande più frequenti che riceve WebNovis, agenzia web di Rho (Milano) |
| blog/api-rest-cosa-sono.html | inserito in paragrafo esistente | …competitività: è il tipo di progetto che segue WebNovis, agenzia web di Rho (Milano) |
| blog/gestione-resi-ecommerce.html | inserito in paragrafo esistente | …passaparola positivo: è l'approccio con cui WebNovis, agenzia web di Rho (Milano) |
| blog/quanto-costa-un-logo.html | inserito in paragrafo esistente | In WebNovis, agenzia web di Rho (Milano) specializzata in branding e grafica per PMI |
| blog/gdpr-sito-web-guida.html | inserito in paragrafo esistente | È il controllo che applica WebNovis, agenzia web di Rho (Milano) specializzata in siti |
| blog/pagamenti-online-ecommerce.html | inserito in paragrafo esistente | …costi ricorrenti: è il criterio con cui WebNovis, agenzia web di Rho (Milano) |

Nota: nessun caso "già presente" con ruolo nel primo paragrafo; nessun nuovo blocco necessario (tutti i primi paragrafi erano già definitori e brevi).

## Bonus "In sintesi" (primi 2 schermi)

| File | Blocco "In sintesi" |
|---|---|
| Tutte le 10 pagine | Assente titolo letterale "In sintesi"; **presente blocco equivalente "In breve"** (`div.article-summary`) come primo elemento di `article-content` |

Riepilogo: 0/10 "In sintesi" letterali; 10/10 con box "In breve" equivalente già in prima schermata (nessuna modifica richiesta).

## Anomalie rilevate

1. **api-rest-cosa-sono.html / gestione-resi-ecommerce.html**: brand già citato nel box "In breve" ma solo come CTA ("Richiedi una consulenza WebNovis"), senza ruolo commerciale → ruolo inserito nel primo paragrafo definitorio.
2. **partita-iva-ecommerce.html / quanto-costa-un-logo.html**: un aside "Percorsi commerciali correlati" precede il primo paragrafo di testo; il primo blocco definitorio resta il paragrafo, nessuno spostamento eseguito.
3. **quanto-costa-un-logo.html**: prezzi nel primo blocco (€50 crowdsourcing → €10.000+ agenzie) verificati realistici, lasciati invariati.
4. **manutenzione-sito-web.html**: nessun prezzo aggiunto (task separato, articolo non li cita nel primo blocco).
