# ⚡ Setup GitHub - Guida Rapida (5 Minuti)

## 🎯 Obiettivo

Pubblicare il sito su GitHub Pages in 5 minuti.

## 📋 Prerequisiti

- ✅ Git installato (https://git-scm.com)
- ✅ Account GitHub (https://github.com)

## 🚀 Metodo 1: Script Automatico (Windows)

### Passo 1: Crea Repository su GitHub

1. Vai su https://github.com/new
2. Nome: `webnovis-site`
3. Visibilità: **Public**
4. ❌ NON aggiungere README, .gitignore, license
5. Clicca "Create repository"

### Passo 2: Esegui Script

1. Doppio click su `deploy-github.bat`
2. Inserisci username GitHub
3. Inserisci nome repository (o premi Enter per default)
4. Segui le istruzioni

### Passo 3: Attiva GitHub Pages

1. Vai su https://github.com/TUO-USERNAME/webnovis-site
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)**
5. Save

✅ **Fatto!** Sito live su: `https://TUO-USERNAME.github.io/webnovis-site/`

---

## 🚀 Metodo 2: Comandi Manuali

### Passo 1: Crea Repository su GitHub

(Come sopra)

### Passo 2: Comandi Git

```bash
# 1. Inizializza Git
git init

# 2. Aggiungi file
git add .

# 3. Commit
git commit -m "Initial commit"

# 4. Collega a GitHub (sostituisci USERNAME e REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# 5. Rinomina branch
git branch -M main

# 6. Push
git push -u origin main
```

### Passo 3: Attiva GitHub Pages

(Come sopra)

---

## 🌐 Collega Dominio (Opzionale)

### Su GitHub

1. Settings → Pages
2. Custom domain: `tuodominio.com`
3. Save
4. Spunta "Enforce HTTPS" (dopo qualche minuto)

### Sul Provider Dominio

Aggiungi questi record DNS:

**4 Record A:**
```
Type: A, Name: @, Value: 185.199.108.153
Type: A, Name: @, Value: 185.199.109.153
Type: A, Name: @, Value: 185.199.110.153
Type: A, Name: @, Value: 185.199.111.153
```

**1 Record CNAME:**
```
Type: CNAME, Name: www, Value: TUO-USERNAME.github.io
```

⏱️ Aspetta 1-48 ore per propagazione DNS

---

## 🔄 Aggiornamenti

```bash
# Modifica file, poi:
git add .
git commit -m "Descrizione modifiche"
git push
```

GitHub Pages aggiorna automaticamente in 1-2 minuti!

---

## ✅ Verifica

### Sito Funziona?
- Apri: `https://TUO-USERNAME.github.io/REPO-NAME/`
- Dovresti vedere il sito

### GitHub Pages Attivo?
- Settings → Pages
- Dovresti vedere: "Your site is live at..."

### Dominio Funziona?
- Apri: `https://tuodominio.com`
- Verifica DNS: https://dnschecker.org

---

## 🐛 Problemi?

### "404 Not Found"
- Verifica che `index.html` sia nella root
- Aspetta 1-2 minuti dopo il push

### "Push failed"
- Verifica credenziali GitHub
- Usa Personal Access Token come password
- Ottieni token: https://github.com/settings/tokens

### "Domain not found"
- Verifica record DNS sul provider
- Aspetta propagazione (fino a 48h)

---

## 📞 Supporto

- **Guida completa:** Leggi `DEPLOY-GITHUB.md`
- **GitHub Docs:** https://docs.github.com/pages
- **DNS Checker:** https://dnschecker.org

---

## 🎯 Checklist

- [ ] Repository creato su GitHub
- [ ] Codice pushato
- [ ] GitHub Pages attivato
- [ ] Sito raggiungibile su .github.io
- [ ] (Opzionale) Dominio collegato
- [ ] (Opzionale) DNS configurato
- [ ] Sito testato e funzionante

---

**Tempo:** 5 minuti
**Difficoltà:** ⭐☆☆☆☆
**Costo:** Gratis
