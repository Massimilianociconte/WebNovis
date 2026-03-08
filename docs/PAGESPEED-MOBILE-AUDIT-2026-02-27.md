# Audit Prestazioni Mobile — WebNovis

Data audit originaria: 2026-02-27

## Stato di questo documento

Questo report resta utile come diagnosi delle criticita` mobile della homepage, ma alcune note infrastrutturali contenute nella versione originale non descrivono piu` lo stato attuale del repository.

## Aggiornamenti rispetto all'audit originario

Gia` risolto nel repository:

- i security header hanno ora una sorgente unica in `config/security-headers.js`
- `_headers` viene rigenerato tramite script dedicato
- il widget DesignRush viene caricato tramite `js/designrush-loader.js` anziche` tramite tag diretti nelle pagine pubbliche
- esistono regression test specifici per SEO, security/legal, template immagini e widget loader
- alcuni broken internal link e normalizzazioni HTML ricorrenti sono stati corretti in modo centralizzato

Ancora aperto e coerente con il report originario:

- LCP mobile alto nella hero
- CLS sopra soglia nella zona above-the-fold
- costo runtime JS e animazioni sul primo viewport
- necessita` di verificare in produzione la policy effettiva di header/cache

## Interpretazione corretta oggi

La parte piu` affidabile del report resta quella diagnostica sul comportamento mobile della homepage. Le sezioni che parlano di mismatch permanente tra `_headers` e codice sorgente vanno invece lette come problema storico gia` chiuso nel repository, con residuo rischio solo sul layer di deploy.

## Prossimi passi consigliati

1. Ridurre il lavoro runtime della hero su mobile.
2. Stabilizzare dimensioni e animazioni nel primo viewport per ridurre il CLS.
3. Eseguire `npm run verify:prod-headers` contro il dominio reale o lo staging.
4. Misurare nuovamente Lighthouse mobile dopo la riduzione delle animazioni above-the-fold.
