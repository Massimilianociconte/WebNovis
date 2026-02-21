# 🌐 WebNovis - Agenzia Digitale Completa

![WebNovis](https://img.shields.io/badge/WebNovis-Digital%20Agency-6366f1?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

> **Accendi la scintilla che illumina la tua visibilità**

Sito web professionale per WebNovis, agenzia digitale specializzata in Web Development, Graphic Design e Social Media Management.

## ✨ Features

- 🎨 **Design Moderno** - Interfaccia pulita e professionale
- 📱 **Responsive** - Perfetto su tutti i dispositivi
- ⚡ **Performance** - Ottimizzato per velocità
- 🤖 **Chatbot Integrato** - Assistenza clienti automatizzata
- 🎭 **Animazioni Avanzate** - Effetti visivi coinvolgenti
- 🌙 **Dark Theme** - Design scuro elegante

## 🚀 Demo

**Live Site:** [https://tuodominio.com](https://tuodominio.com)

## 📋 Sezioni

- **Hero** - Presentazione impattante con call-to-action
- **Triade Servizi** - Web Development, Graphic Design, Social Media
- **Servizi Dettagliati** - Descrizione approfondita di ogni servizio
- **Social Feed** - Feed Instagram moderno e interattivo
- **Contatti** - Form di contatto e informazioni
- **Chat** - Chatbot Weby per assistenza immediata

## 🛠️ Tecnologie

### Frontend
- **HTML5** - Struttura semantica
- **CSS3** - Styling avanzato con animazioni
- **JavaScript** - Interattività e dinamicità
- **Font Awesome** - Icone vettoriali
- **Google Fonts** - Typography professionale

### Librerie
- **Vanilla JS** - Nessuna dipendenza pesante
- **CSS Grid & Flexbox** - Layout responsive
- **CSS Animations** - Transizioni fluide

### Backend (Opzionale)
- **Node.js** - Server backend
- **Express** - API REST
- **OpenAI API** - Chatbot intelligente

## 📦 Installazione

### Metodo 1: GitHub Pages (Consigliato)

```bash
# 1. Clona il repository
git clone https://github.com/TUO-USERNAME/webnovis-site.git
cd webnovis-site

# 2. Apri index.html nel browser
# Oppure usa un server locale:
python -m http.server 8000
# Apri http://localhost:8000
```

### Metodo 2: Con Backend

```bash
# 1. Clona il repository
git clone https://github.com/TUO-USERNAME/webnovis-site.git
cd webnovis-site

# 2. Installa dipendenze
npm install

# 3. Configura variabili ambiente
cp .env.example .env
# Modifica .env con la tua OPENAI_API_KEY

# 4. Avvia server
npm start

# 5. Apri http://localhost:3000
```

## 🚀 Deploy

### GitHub Pages

1. **Fork questo repository**
2. **Vai su Settings → Pages**
3. **Source:** Deploy from a branch
4. **Branch:** main, Folder: / (root)
5. **Save**

Il sito sarà live su: `https://TUO-USERNAME.github.io/webnovis-site/`

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

1. Connetti repository GitHub
2. Build command: (lascia vuoto)
3. Publish directory: /
4. Deploy

## 🎨 Personalizzazione

### Colori

Modifica le variabili CSS in `css/style.css`:

```css
:root {
    --primary: #6366f1;      /* Blu principale */
    --secondary: #ec4899;    /* Rosa secondario */
    --accent: #14b8a6;       /* Verde accento */
    --dark: #0f172a;         /* Sfondo scuro */
}
```

### Contenuti

- **Testi:** Modifica direttamente in `index.html`
- **Immagini:** Sostituisci i placeholder
- **Servizi:** Aggiorna le sezioni service
- **Contatti:** Modifica email, telefono, indirizzo

### Chatbot

Personalizza le risposte in `js/chat.js`:

```javascript
function getLocalResponse(message) {
    // Aggiungi/modifica risposte qui
}
```

## 📱 Responsive Breakpoints

- **Desktop:** > 1024px
- **Tablet:** 768px - 1024px
- **Mobile:** < 768px
- **Small Mobile:** < 480px

## ⚡ Performance

- **Lighthouse Score:** 95+
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Total Bundle Size:** < 500KB

## 🤖 Chatbot

### Risposte Locali (Default)

Il chatbot usa risposte predefinite per:
- Informazioni servizi
- Preventivi
- Supporto
- Contatti

### ChatGPT Integration (Opzionale)

Per abilitare ChatGPT:

1. Ottieni API key da [OpenAI](https://platform.openai.com/api-keys)
2. Configura `.env`:
   ```
   OPENAI_API_KEY=sk-proj-tua-chiave
   ```
3. Avvia server: `npm start`
4. Deploy backend su Vercel/Heroku

## 📄 Struttura Progetto

```
webnovis-site/
├── index.html                 # Pagina principale
├── css/
│   ├── style.css             # Stili principali
│   ├── social-feed-modern.css # Stili feed social
│   └── weby-mobile-fix.css   # Fix mobile chatbot
├── js/
│   ├── main.js               # JavaScript principale
│   └── chat.js               # Logica chatbot
├── server.js                 # Backend Node.js (opzionale)
├── package.json              # Dipendenze
├── .gitignore               # File da ignorare
├── README.md                # Questo file
└── docs/                    # Documentazione
    ├── DEPLOY-GITHUB.md
    ├── DEPLOY-VERCEL.md
    └── ...
```

## 🔧 Configurazione

### Variabili Ambiente

```env
# .env
OPENAI_API_KEY=sk-proj-xxx    # Chiave API OpenAI
NODE_ENV=production            # Ambiente
PORT=3000                      # Porta server
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "deploy": "vercel --prod"
  }
}
```

## 🐛 Troubleshooting

### Chatbot non risponde
- Verifica che `js/chat.js` sia caricato
- Controlla console browser (F12)
- Verifica endpoint API se usi backend

### Animazioni non funzionano
- Verifica che `js/main.js` sia caricato
- Controlla compatibilità browser
- Disabilita estensioni browser

### Layout rotto su mobile
- Verifica viewport meta tag
- Controlla media queries in CSS
- Testa su dispositivi reali

## 📚 Documentazione

- **[Deploy GitHub](DEPLOY-GITHUB.md)** - Guida deploy GitHub Pages
- **[Deploy Vercel](DEPLOY-VERCEL.md)** - Guida deploy Vercel
- **[Setup Chatbot](AVVIA-CHATBOT.md)** - Configurazione chatbot
- **[Comandi Rapidi](COMANDI-RAPIDI.md)** - Cheat sheet comandi

## 🤝 Contribuire

Contributi sono benvenuti! Per favore:

1. Fork il progetto
2. Crea un branch (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 License

Questo progetto è sotto licenza MIT. Vedi `LICENSE` per dettagli.

## 👤 Autore

**WebNovis Team**

- Website: [https://webnovis.com](https://webnovis.com)
- Email: info@webnovis.com
- GitHub: [@webnovis](https://github.com/webnovis)

## 🌟 Supporto

Se questo progetto ti è stato utile, lascia una ⭐ su GitHub!

## 📞 Contatti

- **Email:** info@webnovis.com
- **Telefono:** +39 XXX XXX XXXX
- **Indirizzo:** Via Example, 123 - Città, Italia

---

<p align="center">
  Made with ❤️ by WebNovis Team
</p>

<p align="center">
  <a href="https://webnovis.com">Website</a> •
  <a href="https://github.com/webnovis">GitHub</a> •
  <a href="mailto:info@webnovis.com">Email</a>
</p>
