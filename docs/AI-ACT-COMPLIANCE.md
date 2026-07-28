# WebNovis — Conformità AI Act (Regolamento UE 2024/1689)

Documento operativo interno. Non sostituisce consulenza legale.

**Ultimo aggiornamento:** 28 luglio 2026

## Inventario sistemi AI

| Sistema | Ruolo WebNovis | Tecnologie | Interazione utente | Riferimento Art. 50 |
|---|---|---|---|---|
| Chatbot Weby | Provider del sistema (brand WebNovis) + deployer Gemini | Gemini (chat), backend Render | Diretta (chat) | 50(1) disclosure obbligatoria |
| Ricerca AI | Provider del sistema + deployer Gemini | Gemini (search) | Diretta (risposte in search) | 50(1)/(2) trasparenza output |
| Redazione blog | Deployer | Gemini / Groq (auto-writer) | Contenuti pubblicati | 50(4) + review umana documentata |

## Misure implementate sul sito

1. **Chat Weby**
   - Header con pill «AI» e sottotitolo «Assistente AI · online»
   - Nota persistente sotto l’header: interazione con sistema AI + link Privacy e team umano
   - Messaggi di benvenuto e fallback che identificano Weby come assistente AI
   - System prompt (`chat-config.json`) impone l’auto-identificazione

2. **Ricerca AI**
   - Badge «AI» + etichetta «Risposta generata con AI»
   - Nota: «Sintesi automatica: verifica i dettagli importanti…»

3. **Blog**
   - Nota in fondo a ogni articolo: redazione con supporto AI **e revisione umana** WebNovis
   - Generatore `blog/build-articles.js` include la stessa nota per i nuovi pezzi

4. **Privacy**
   - Sezione `#sistemi-ai` (2.4)
   - Finalità, retention, destinatari (Gemini, hosting chat)
   - Sezione 10 aggiornata (no decisioni Art. 22, trasparenza AI)

## AI literacy (Art. 4) — checklist operativa

Chi opera i sistemi AI per WebNovis deve sapere:

- [ ] Che Weby e la search AI non sono operatori umani
- [ ] Che le risposte possono essere imprecise e i preventivi finali li conferma il team
- [ ] Di non pubblicare output del blog auto-writer senza review sostanziale (fatti, prezzi, claim)
- [ ] Di non inserire dati sensibili dei clienti nei prompt verso modelli terzi
- [ ] Dove trovare privacy `#sistemi-ai` e questo inventario

*Completare la checklist con data e iniziali quando formata la persona (anche solo-founder).*

### Registro formazione (esempio)

| Data | Persona | Argomento | Esito |
|---|---|---|---|
| 2026-07-28 | [nome] | Lettura AI Act Art. 4/50 + inventory WebNovis | [ ] |

## Cosa non risulta applicabile oggi

- High-risk Annex III (scadenza 2 dic 2027; use-case non presenti)
- Provider di modelli GPAI (obblighi Cap. V su Google/altri foundation model)
- Pratiche vietate Art. 5 (nessun social scoring, biometria, emotion recognition)

## Riferimenti

- Regolamento (UE) 2024/1689: https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32024R1689
- Pagina Commissione: https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai
- FAQ Art. 50: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- AI Act Service Desk: https://ai-act-service-desk.ec.europa.eu/en

## File toccati (implementazione)

- `index.html`, `src/html/index.html` — widget chat
- `js/chat.js`, `js/chat.min.js`, `chat-config.json`, `server.js`
- `js/search.js`, `js/search.min.js`, `css/search.css`, `css/search.min.css`
- `css/style.css`, `css/style.min.css`
- `privacy-policy.html`
- `blog/*.html`, `blog/build-articles.js`
- `docs/AI-ACT-COMPLIANCE.md` (questo file)
