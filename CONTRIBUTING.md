# Contributing to WebNovis

## Setup Locale

```bash
# 1. Clona il repository
git clone https://github.com/Massimilianociconte/WebNovis.git
cd WebNovis

# 2. Installa dipendenze
npm install

# 3. Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue API keys (vedi commenti nel file)

# 4. Avvia il server di sviluppo
npm run dev
# Il sito sarà disponibile su http://localhost:3000
```

## Struttura del Progetto

```
├── server.js              # Express server (API, middleware, routing)
├── newsletter-engine.js   # Newsletter AI engine (Groq + Brevo)
├── ai-config.js           # Configurazione chatbot AI
├── js/                    # JavaScript frontend (main.js, chat.js, etc.)
├── css/                   # Fogli di stile (revolution.min.css, etc.)
├── blog/                  # Articoli blog (HTML statico)
├── portfolio/             # Portfolio case studies
├── servizi/               # Pagine servizi
├── scripts/               # Script di build e utility
├── docs/                  # Documentazione interna e strategia SEO
├── Img/                   # Asset immagini (WebP, PNG)
└── tests/                 # Test suite (vitest)
```

## Convenzioni di Codice

- **JavaScript:** Configurato con ESLint (`.eslintrc.json`) e Prettier (`.prettierrc.json`)
- **HTML:** Minificato in produzione, sorgenti leggibili in development
- **CSS:** Minificato con PostCSS, sorgenti in `css/`
- **Naming:** kebab-case per file HTML, camelCase per JS

## Workflow di Sviluppo

1. **Branch:** Crea un branch da `main` con nome descrittivo (`fix/mojibake-portfolio`, `feat/skip-to-content`)
2. **Commit:** Messaggi in inglese, prefisso tipo (`fix:`, `feat:`, `docs:`, `perf:`, `refactor:`)
3. **Test:** Esegui `npx vitest run` prima di committare
4. **Build:** Rigenera sitemap con `node generate-sitemap.js` se hai modificato pagine HTML
5. **PR:** Descrivi cosa cambia e perché

## Comandi Utili

```bash
npm run dev                  # Avvia server con nodemon (hot reload)
npm start                    # Avvia server in produzione
node generate-sitemap.js     # Rigenera sitemap.xml
node build-search-index.js   # Rigenera search-index.json
node blog/auto-writer.js     # Genera articoli blog con AI
npx vitest run               # Esegui test suite
```

## Deploy

Il sito è deployato su **GitHub Pages** (frontend statico) e **Render** (server Express).
Vedi `DEPLOY-GITHUB.md` per la procedura completa.

## Regole Importanti

- **Non committare mai** `.env`, `node_modules/`, o file con API keys
- **Rigenera la sitemap** dopo ogni aggiunta/rimozione di pagine HTML
- **Testa i structured data** con [Google Rich Results Test](https://search.google.com/test/rich-results) dopo modifiche ai JSON-LD
- **Verifica l'encoding** — usare `—` (em-dash Unicode) o `&mdash;` entity, mai `â€"`
