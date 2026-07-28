# Script one-off legacy (ex root del repo)

Questi file erano **nella root del repository**, che è anche la directory
pubblicata da GitHub Pages: erano quindi **scaricabili da chiunque** su
`https://www.webnovis.com/<nome-file>` (verificato: `/check.js`, `/debug.js`,
`/deep_audit.py` rispondevano `200`).

Sono script usa-e-getta scritti durante migrazioni passate (conversione WebP,
fix path immagini, ispezione form, ecc.). Alcuni contengono ancora path
Windows assoluti (`C:\Users\...`) e non sono più eseguibili così come sono.

Non sono referenziati da `package.json`, dai workflow GitHub Actions, né da
altri script: sono stati spostati qui per toglierli dalla superficie pubblica
senza perdere la storia. `scripts/` è escluso dal build pubblico
(`.assetsignore`, `scripts/prepare-public-artifact.js`).

Se un file qui dentro non serve più a nessuno, si può cancellare: la storia
git resta.
