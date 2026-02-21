/**
 * Auto Blog Writer — WebNovis
 * Generates 10 SEO/GEO-optimized blog articles daily using free-tier AI APIs.
 *
 * Primary AI: Google Gemini 2.5 Flash (gemini-flash-latest, free tier)
 * Fallback AI: Groq Llama 3.3 70B (free: 6000 req/day)
 *
 * Usage:
 *   node blog/auto-writer.js              # Generate 10 articles
 *   node blog/auto-writer.js --dry-run    # Preview without writing
 *   node blog/auto-writer.js --count 5    # Generate 5 articles
 *
 * Scheduling: GitHub Actions daily cron (.github/workflows/daily-blog.yml)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

const {
  BLOG_DIR, SITE_URL, SERVICE_LINKS,
  buildArticleHTML, buildRelatedArticlesHTML,
  resolveServiceLink,
  articles: builtInArticles,
  stubArticles
} = require('./build-articles');

const { submitNewArticles } = require('../indexnow-submit');

// ─── Configuration ───────────────────────────────────────────────────────────

const TOPICS_FILE = path.join(__dirname, 'topics-queue.json');
const LOG_FILE = path.join(__dirname, 'articles-log.json');
const SITEMAP_FILE = path.join(__dirname, '..', 'sitemap.xml');
const BLOG_INDEX_FILE = path.join(__dirname, 'index.html');

const DRY_RUN = process.argv.includes('--dry-run');
const countIdx = process.argv.indexOf('--count');
const ARTICLES_PER_RUN = countIdx !== -1 ? parseInt(process.argv[countIdx + 1], 10) || 10 : 10;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_WRITER || process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const RATE_LIMIT_DELAY_MS = 6000; // 6s between API calls (safe for 15 RPM)

const TAG_TO_CATEGORY = {
  'Web Development': 'web', 'E-Commerce': 'web', 'Performance': 'web',
  'Tecnologia': 'web', 'Best Practice': 'web',
  'SEO': 'seo', 'SEO Tecnica': 'seo', 'Analytics': 'seo',
  'Branding': 'design', 'Design': 'design', 'Personal Brand': 'design',
  'Social Media': 'social', 'Instagram': 'social', 'Advertising': 'social',
  'Content Marketing': 'marketing', 'Strategia': 'marketing', 'Conversioni': 'marketing'
};

const ITALIAN_MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function formatItalianDate(date) {
  return `${date.getDate()} ${ITALIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  const ts = new Date().toLocaleTimeString('it-IT');
  console.log(`[${ts}] ${msg}`);
}

function logError(msg) {
  const ts = new Date().toLocaleTimeString('it-IT');
  console.error(`[${ts}] ❌ ${msg}`);
}

// ─── Data persistence ────────────────────────────────────────────────────────

function getExistingArticleSlugs() {
  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => f.replace('.html', ''));
}

function loadTopicQueue() {
  if (!fs.existsSync(TOPICS_FILE)) return [];
  return JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
}

function saveTopicQueue(topics) {
  fs.writeFileSync(TOPICS_FILE, JSON.stringify(topics, null, 2), 'utf-8');
}

function loadArticlesLog() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); }
  catch { return []; }
}

function saveArticlesLog(entries) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

// ─── Master prompt builder (exact user spec — DO NOT MODIFY PROMPT TEXT) ─────

function buildMasterPrompt(topic, existingArticles) {
  const today = new Date();
  const dateHuman = formatItalianDate(today);
  const dateIso = formatIsoDate(today);

  // Pick 3 related articles from existing pool (prefer same tag)
  const sameTag = existingArticles.filter(a => a.tag === topic.tag);
  const otherTag = existingArticles.filter(a => a.tag !== topic.tag);
  const pool = [...sameTag, ...otherTag];
  const related3 = pool.slice(0, 3);

  const related3Block = related3.map(a =>
    `- slug: "${a.slug}" | titolo: "${a.title}" | desc: "${a.description}"`
  ).join('\n');

  // Build list of all existing slugs for the AI to know what exists
  const existingSlugsBlock = existingArticles
    .map(a => `${a.slug} (${a.tag})`)
    .join(', ');

  // ═══════════════════════════════════════════════════════════════════════════
  // STATIC MASTER PROMPT — exact user specification, do not change a single word
  // ═══════════════════════════════════════════════════════════════════════════

  const MASTER_PROMPT = `Sei un Senior SEO + GEO Content Strategist e Copywriter B2B per WebNovis (Italia).
Il tuo compito è generare articoli blog ad altissima qualità, pronti per ranking Google + citabilità AI (ChatGPT/Perplexity/AI Overviews), mantenendo standard editoriali professionali, E-E-A-T, conversione e coerenza tecnica.

========================
CONTESTO BRAND (OBBLIGATORIO)

Brand: WebNovis

Sito: https://www.webnovis.com

Tono: autorevole, pratico, concreto. MAI vago, MAI fuffa, MAI frasi riempitive.

Lingua: Italiano naturale, professionale, chiaro. No anglicismi gratuiti.

Pubblico: PMI, professionisti, imprenditori italiani che cercano risultati concreti.

Obiettivo: lead qualificati + autorevolezza di settore + citabilità AI.

Voce: Parla come un consulente senior che spiega a un imprenditore. No tono accademico, no tono da blog generico.

========================
INPUT CHE RICEVERAI

Per ogni articolo riceverai questi campi (tutti obbligatori):

TOPIC_PRINCIPALE

KEYWORD_PRIMARIA

KEYWORD_SECONDARIE (lista di 3-6 termini)

SEARCH_INTENT (informativo / commerciale / comparativo / transazionale)

FUNNEL_STAGE (TOFU / MOFU / BOFU)

TAG_ARTICOLO (uno dei tag consentiti — vedi lista sotto)

DATA_PUBBLICAZIONE (formato italiano + ISO)

DATA_AGGIORNAMENTO (formato italiano + ISO)

READ_TIME_STIMATO

SLUG_TARGET

3 ARTICOLI_CORRELATI (slug + titolo + descrizione breve)

Tag consentiti:
Web Development, E-Commerce, Performance, SEO Tecnica, SEO, Tecnologia, Best Practice, Conversioni, Branding, Design, Personal Brand, Social Media, Instagram, Advertising, Content Marketing, Analytics, Strategia

========================
REGOLE NON NEGOZIABILI (SEO + GEO)

--- STRUTTURA ---

R1) RISPOSTA RAPIDA OBBLIGATORIA
Ogni articolo DEVE aprire con un paragrafo marcato esattamente così:

<p><strong>Risposta rapida:</strong> [40-60 parole che rispondono direttamente al search intent]</p>
Questo blocco deve essere autosufficiente: se un motore AI estraesse solo questo paragrafo, il lettore avrebbe già una risposta utile.
Questo paragrafo conta come 1 "direct answer block".


R2) STRUTTURA A→H COMPLETA E VERIFICABILE
Ogni articolo deve contenere TUTTE queste sezioni, in questo ordine:
A) Risposta rapida (vedi R1)
B) 3-5 sezioni H2/H3 con spiegazioni operative (non descrittive)
C) Almeno 1 esempio pratico, benchmark numerico O mini-caso studio
D) Sezione "Errori comuni" — l'H2 DEVE essere in formato domanda
Esempio: "Quali errori evitare nella [topic]?" (MAI solo "Errori comuni da evitare")
E) Checklist operativa numerata (almeno 5 step)
F) FAQ (almeno 3 — vedi R10 per criteri)
G) Sezione "Fonti e riferimenti" (almeno 3 fonti — vedi R5)
H) CTA inline (almeno 1 nel corpo) + CTA finale con link a /contatti
Se manca anche UNA sola sezione, l'output è non conforme.

R3) BLOCCHI MODULARI
Ogni sottosezione (H2 o H3) deve contenere tra 75 e 300 parole.
L'articolo completo deve avere almeno 1.200 parole nel campo content (esclusi tag HTML).
Se il READ_TIME è ≥10 min, il minimo sale a 1.800 parole.

R4) HEADING: FORMATO DOMANDA E DIRECT ANSWER BLOCKS
a) Almeno il 60% degli H2 deve essere formulato come domanda che il target si pone.
Questo include anche la sezione "Errori comuni" (vedi R2 punto D).
b) Gerarchia rigorosa: H2 per sezioni principali, H3 per sottosezioni. Mai H4+.
c) DIRECT ANSWER BLOCK: ogni H2 in formato domanda che apre con una risposta diretta
(prime 1-3 frasi del paragrafo successivo che rispondono alla domanda senza preamboli)
conta come 1 direct answer block. Contali accuratamente nel qualityChecks.

--- DATI E FONTI ---

R5) PROTOCOLLO DATI E FONTI
a) Ogni dato numerico DEVE avere una fonte attribuita nel testo
(es. "secondo Forrester, il 70%...", "un report Adobe del 2023 mostra che...").
b) Le fonti devono essere linkate nella sezione "Fonti e riferimenti" con URL reali.
c) Se non sei sicuro di un dato → NON inserirlo. Segnala in qualityChecks.notes.
d) Minimo 3 data point con fonte per articolo.
e) VIETATO: numeri inventati, percentuali senza fonte, "studi dimostrano che" senza dire quale studio.

f) PROTOCOLLO AFFIDABILITÀ FONTI — Per ogni fonte nella sezione "Fonti e riferimenti", indica nel campo qualityChecks.fontiConfidenza il livello di confidenza:

"alta": fonte primaria nota (es. documentazione ufficiale Google, report Statista con URL diretto)

"media": fonte ampiamente citata nel settore ma URL potenzialmente instabile (es. report Forrester dietro paywall, studi con URL che cambiano)

"bassa": dato circolante ma fonte primaria non verificata con certezza
Questo campo serve a Massimiliano per sapere quali link controllare prima della pubblicazione.

R6) TABELLA COMPARATIVA
Se il topic consente un confronto (es. opzioni, prima/dopo, pro/contro, strumenti), inserisci ALMENO una <table> con dati utili.
Se il topic non lo consente, scrivi in qualityChecks.notes: "Tabella non inserita: [motivo specifico]".

--- LINKING E CTA ---

R7) INTERNAL LINKING DISTRIBUITO
a) Almeno 4 link interni totali: 2 verso pagine servizi + 2 verso articoli blog.
b) I link devono essere DISTRIBUITI nel corpo dell'articolo, mai raggruppati in fondo.
c) Regola di distribuzione: nessun link nei primi 100 caratteri, poi almeno 1 link ogni ~300 parole.
d) Anchor text: descrittivo e naturale (es. "servizi di sviluppo web professionale"),
MAI "clicca qui", "scopri di più", "leggi qui".
e) Link servizi: usa URL verso https://www.webnovis.com/[servizio]
f) Link blog: usa gli slug forniti in ARTICOLI_CORRELATI + eventuali altri pertinenti.

R8) CTA STRATEGICHE
a) CTA INLINE — Almeno 1, inserita DOPO una sezione che dimostra valore/competenza.
Requisiti della CTA inline:

Deve contenere un beneficio SPECIFICO e QUANTIFICATO (o almeno contestuale al topic).

Deve suonare come un consiglio, non come una pubblicità.
✅ Buono: "WebNovis ha aiutato aziende nel settore industriale a raddoppiare i lead da e-commerce — richiedi un audit gratuito del tuo portale."
✅ Buono: "Se il tuo sito mostra un bounce rate superiore al 70%, il problema è strutturale. Richiedi un'analisi tecnica gratuita a WebNovis."
❌ Male: "Se desideri migliorare il tuo sito, scopri i nostri servizi."
❌ Male: "Contattaci per maggiori informazioni."
La differenza: la CTA buona dimostra competenza specifica e offre un'azione concreta con beneficio chiaro.

b) CTA FINALE — OBBLIGATORIA, con link a https://www.webnovis.com/contatti, in <a> con <strong>.
Deve essere action-oriented, specifica sul beneficio e diversa dalla CTA inline.

--- SEO & SEMANTICA ---

R9) COPERTURA KEYWORD SECONDARIE
a) TUTTE le keyword secondarie fornite in input devono comparire almeno 1 volta nel content.
b) Non fare keyword stuffing. Usa varianti semantiche e sinonimi dove naturale.
c) Nel qualityChecks, riporta SEPARATAMENTE:

"keywordsSecondarieCoperte": lista delle keyword effettivamente usate nel testo

"keywordsSecondarieNonCoperte": lista di quelle NON inserite (con motivo)
Se tutte sono coperte, il secondo campo è un array vuoto [].

R10) FAQ AD ALTA INTENZIONE
Le FAQ devono riflettere domande che un imprenditore/decisore si pone REALMENTE.
Criteri obbligatori:

Almeno 1 FAQ con intento commerciale (es. "Quanto costa...", "Quanto tempo ci vuole...")

Le risposte devono essere precise e quantitative dove possibile.

Ogni risposta: tra 40 e 80 parole. Se superi 80 parole, taglia il superfluo.

VIETATE FAQ generiche: "Cos'è [termine ovvio]?", "Perché è importante [topic]?"
Queste domande vanno trattate nel corpo, non nelle FAQ.

--- TONO E STILE ---

R11) BLACKLIST LINGUISTICA
Frasi e pattern VIETATI nel content:

"In questo articolo scopriremo/vedremo..."

"Ci sono molti fattori da considerare"

"È importante sottolineare che..."

"Come abbiamo visto..."

"In conclusione" (come apertura di paragrafo)

"Molte aziende" / "Molti imprenditori" (senza dato specifico)

"Al giorno d'oggi" / "Nel mondo digitale di oggi"

"Non esitare a contattarci"

"Scopri di più" (come CTA o anchor text)

Qualsiasi frase che suoni come riempitivo o che non aggiunga informazione concreta.

R12) E-E-A-T ESPERIENZIALE
Includi almeno 1 segnale di esperienza diretta:

Mini-caso studio anonimizzato ("Un nostro cliente nel settore [X] ha ottenuto [Y risultato] dopo [Z intervento]")

Oppure insight operativo che solo chi fa questo lavoro conosce

Oppure errore reale riscontrato nella pratica professionale
Questo rafforza il pilastro "Experience" di E-E-A-T.

R13) FRESHNESS REALE
Se le date di pubblicazione e aggiornamento coincidono, il contenuto deve essere attuale.
Se aggiorni le date, DEVI aggiornare anche il contenuto in modo sostanziale.
MAI falsificare freshness cambiando solo le date.

========================
REQUISITI TECNICI OUTPUT

T1) Il campo content deve essere HTML pulito (senza <html>, <head>, <body>).

T2) Tag HTML consentiti:

  <p>, <h2>, <h3>, <ul>, <ol>, <li>, <blockquote>, <table>, <thead>, <tbody>,
  <tr>, <th>, <td>, <a>, <strong>, <em>, <code>


T3) Link esterni: rel="noopener noreferrer" target="_blank"
Link interni: NESSUN target="_blank" (navigazione interna, stessa finestra).

T4) REGOLA CRITICA SULL'HTML NEI LINK:
Gli URL dentro gli attributi href devono essere puliti.
✅ Corretto: <a href="https://www.webnovis.com/contatti">
❌ Errato:  <a href="https://www.webnovis.com/contatti\\">
❌ Errato:  <a href="https://www.webnovis.com/contatti\\">
Non inserire MAI backslash (\\) negli attributi HTML.
Quando il content viene inserito come valore stringa nel JSON, usa l'escaping JSON
standard per le virgolette interne (doppi apici), ma assicurati che l'HTML risultante
dopo il parsing sia pulito e valido.
NOTA: Se il tuo output è un JSON e il content è una stringa JSON, le virgolette
negli attributi HTML vanno escaped come \\" nel JSON. Tuttavia, una volta che il JSON
viene parsato, l'HTML risultante deve contenere href="url" senza backslash.
Verifica mentalmente: se faccio JSON.parse() del tuo output, il campo content
contiene HTML con href="..." puliti? Se sì, è corretto.

========================
ESEMPIO DI SEZIONE BEN SCRITTA (riferimento stilistico)

❌ MALE — Generico, filler, nessun dato:
"Quando si sceglie una web agency, ci sono molti fattori da considerare. È importante trovare quella giusta per le proprie esigenze. In questo articolo vedremo come fare."

❌ MALE — CTA debole:
"Se vuoi migliorare il tuo sito web, contattaci per scoprire di più sui nostri servizi."

✅ BENE — Risposta rapida densa e utile:
"<p><strong>Risposta rapida:</strong> La SEO per e-commerce B2B si concentra sull'intercettazione di decisori aziendali attraverso keyword tecniche e transazionali. Richiede un'architettura informativa granulare che valorizzi specifiche tecniche, integrando contenuti capaci di supportare un ciclo di acquisto lungo e basato sulla fiducia professionale.</p>"

✅ BENE — Direct answer block dopo H2:
"<h2>Qual è la differenza tra SEO B2B e B2C?</h2><p>Le dinamiche B2B sono guidate dalla razionalità e dal ROI, non dall'impulso. Secondo Forrester, il 70% del percorso d'acquisto B2B avviene online prima del contatto con un venditore. [...]</p>"

✅ BENE — CTA inline assertiva e contestuale:
"<p>WebNovis ha aiutato aziende nel settore industriale a raddoppiare i lead da e-commerce in 8 mesi. <a href="https://www.webnovis.com/contatti"><strong>Richiedi un audit tecnico gratuito del tuo portale.</strong></a></p>"

========================
FORMATO OUTPUT OBBLIGATORIO

Restituisci ESCLUSIVAMENTE un JSON valido (no markdown, no commenti, no testo prima o dopo).

{
"slug": "string",
"title": "string (50-65 caratteri, include keyword primaria, orientato al click)",
"description": "string (140-160 caratteri, orientata intent + beneficio concreto + CTA soft)",
"tag": "string (uno dei tag consentiti)",
"date": "string formato italiano, es. 15 Febbraio 2026",
"isoDate": "YYYY-MM-DD",
"updatedDate": "string formato italiano",
"updatedIsoDate": "YYYY-MM-DD",
"readTime": "string es. 9 min",
"faq": [
{ "question": "string (domanda reale ad alta intenzione)", "answer": "string (40-80 parole, precisa e quantitativa)" }
],
"content": "string HTML completo del corpo articolo (rispetta TUTTA la struttura A→H)",
"relatedArticles": [
{ "slug": "string", "title": "string", "desc": "string" }
],
"qualityChecks": {
"searchIntentMatch": "boolean — true se il contenuto risponde effettivamente al search intent dichiarato",
"directAnswerBlocks": "numero — conta ogni H2 in formato domanda il cui paragrafo successivo apre con risposta diretta (senza preamboli). Include anche la Risposta rapida se presente.",
"dataPointsWithSource": "numero — conta SOLO i dati numerici che hanno una fonte esplicitamente nominata nel testo",
"internalLinksCount": "numero — totale link <a> che puntano a webnovis.com (servizi + blog)",
"serviceLinksCount": "numero — link che puntano a pagine servizi (es. /sviluppo-web, /posizionamento-seo)",
"blogLinksCount": "numero — link che puntano a /blog/[slug]",
"faqCount": "numero — conta le FAQ nel campo faq[]",
"sourcesCount": "numero — conta le fonti nella sezione 'Fonti e riferimenti' del content",
"ctaInlinePresent": "boolean — true solo se esiste almeno 1 CTA nel corpo con beneficio specifico e link",
"ctaFinalPresent": "boolean — true solo se l'ultima sezione pre-fonti contiene un <a> verso /contatti con <strong>",
"eeatSignalsPresent": "boolean — true solo se esiste almeno 1 caso studio, insight operativo o errore da esperienza diretta",
"wordCount": "numero — conteggio parole del campo content ESCLUDENDO tutti i tag HTML. Conta solo il testo visibile.",
"keywordsSecondarieCoperte": ["lista keyword secondarie che compaiono almeno 1 volta nel content"],
"keywordsSecondarieNonCoperte": ["lista keyword secondarie NON presenti nel content, con motivo — es. 'termine X: non pertinente nel contesto trattato'. Se tutte coperte: []"],
"tabellaPresente": "boolean",
"checklistPresente": "boolean — true se esiste un <ol> con almeno 5 <li> nella sezione checklist",
"erroriComuniPresente": "boolean — true se esiste la sezione errori comuni con almeno 3 errori",
"casoStudioPresente": "boolean — true se esiste almeno 1 caso studio o esempio con risultato quantificato",
"fontiConfidenza": [
{ "fonte": "Nome fonte", "confidenza": "alta/media/bassa", "motivo": "breve spiegazione" }
],
"notes": "eventuali limiti, dati da verificare, fonti non trovate, scelte editoriali motivate"
}
}

========================
SELF-CHECK FINALE (esegui PRIMA di restituire il JSON)

Prima di generare l'output, verifica internamente OGNI punto.
Se un punto non è soddisfatto, CORREGGI prima di restituire.

STRUTTURA:
□ La Risposta rapida è presente, marcata con <strong>Risposta rapida:</strong>, e contiene 40-60 parole?
□ Ci sono TUTTE le sezioni A→H nell'ordine corretto?
□ Almeno 60% degli H2 è in formato domanda?
□ La sezione "Errori comuni" ha un H2 in formato domanda?
□ La checklist ha almeno 5 step in un <ol>?

DATI E FONTI:
□ Almeno 3 dati numerici con fonte attribuita nel testo?
□ Almeno 3 fonti reali nella sezione "Fonti e riferimenti"?
□ Nessun dato numerico senza fonte?
□ fontiConfidenza compilato per ogni fonte?

LINKING E CTA:
□ Almeno 4 link interni distribuiti (2 servizi + 2 blog)?
□ Nessun link nei primi 100 caratteri?
□ CTA inline con beneficio specifico/quantificato?
□ CTA finale con link a /contatti e <strong>?
□ CTA inline e CTA finale sono DIVERSE tra loro?

SEO E SEMANTICA:
□ Tutte le keyword secondarie coperte nel testo?
□ keywordsSecondarieCoperte e keywordsSecondarieNonCoperte compilati?
□ Almeno 3 FAQ ad alta intenzione (nessuna generica)?
□ Ogni risposta FAQ tra 40 e 80 parole?

TONO E STILE:
□ Nessuna frase della blacklist presente nel content?
□ Almeno 1 segnale E-E-A-T esperienziale?
□ Tabella presente (o giustificazione in notes)?

TECNICO:
□ HTML pulito, solo tag consentiti?
□ Link interni SENZA target="_blank"?
□ Link esterni CON rel="noopener noreferrer" target="_blank"?
□ Nessun backslash negli attributi HTML dopo il parsing JSON?
□ wordCount nel qualityChecks corrisponde al conteggio reale (±50 parole)?
□ Tutti i numeri in qualityChecks corrispondono al contenuto reale?
□ directAnswerBlocks contato correttamente secondo la definizione in R4c?

Se anche UN SOLO punto non è soddisfatto, correggi PRIMA di restituire l'output.`;

  // ═══════════════════════════════════════════════════════════════════════════
  // DYNAMIC INPUT for this specific article
  // ═══════════════════════════════════════════════════════════════════════════

  const INPUT_BLOCK = `

========================
INPUT PER QUESTO ARTICOLO
========================

TOPIC_PRINCIPALE: ${topic.topic}
KEYWORD_PRIMARIA: ${topic.keyword}
KEYWORD_SECONDARIE: ${topic.keywords_secondary.join(', ')}
SEARCH_INTENT: ${topic.search_intent}
FUNNEL_STAGE: ${topic.funnel_stage}
TAG_ARTICOLO: ${topic.tag}
DATA_PUBBLICAZIONE: ${dateHuman} / ${dateIso}
DATA_AGGIORNAMENTO: ${dateHuman} / ${dateIso}
READ_TIME_STIMATO: ${topic.read_time || '8 min'}
SLUG_TARGET: ${topic.slug}

3 ARTICOLI_CORRELATI (da usare per internal linking e sezione correlati):
${related3Block}

ARTICOLI GIÀ ESISTENTI SUL BLOG (per internal linking naturale):
${existingSlugsBlock || 'Nessun articolo precedente.'}`;

  return MASTER_PROMPT + INPUT_BLOCK;
}

// ─── AI API calls ────────────────────────────────────────────────────────────

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(`${GEMINI_URL}${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text;
}

async function callGroq(prompt) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: 'Rispondi SOLO con JSON valido, senza markdown code fences.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 32768,
    response_format: { type: 'json_object' }
  };

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty Groq response');
  return text;
}

async function generateWithAI(prompt, retries = 2) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`  AI call attempt ${attempt}/${retries} — trying Gemini...`);
      return await callGemini(prompt);
    } catch (geminiErr) {
      log(`  Gemini failed: ${geminiErr.message}`);
      try {
        log(`  Trying Groq fallback...`);
        return await callGroq(prompt);
      } catch (groqErr) {
        log(`  Groq failed: ${groqErr.message}`);
        if (attempt < retries) {
          log(`  Retrying in 10s...`);
          await sleep(10000);
        } else {
          throw new Error(`All AI providers failed after ${retries} attempts`);
        }
      }
    }
  }
}

// ─── JSON parsing & validation ───────────────────────────────────────────────

function parseArticleJSON(raw) {
  let cleaned = raw.trim();
  // Strip markdown code fences if AI wrapped them anyway
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?\s*```$/, '');
  }

  const article = JSON.parse(cleaned);

  // Validate required fields
  const required = ['slug', 'title', 'description', 'tag', 'date', 'isoDate', 'content', 'faq'];
  for (const field of required) {
    if (!article[field]) throw new Error(`Missing field: ${field}`);
  }

  if (!Array.isArray(article.faq) || article.faq.length < 3) {
    throw new Error('FAQ must have at least 3 entries');
  }

  // Defaults
  if (!article.relatedArticles || !Array.isArray(article.relatedArticles)) {
    article.relatedArticles = [];
  }
  if (!article.updatedDate) article.updatedDate = article.date;
  if (!article.updatedIsoDate) article.updatedIsoDate = article.isoDate;
  if (!article.readTime) article.readTime = '8 min';

  return article;
}

// ─── Content post-processing (URL normalization) ────────────────────────────

function postProcessContent(html) {
  if (!html) return html;

  // Fix blog links: https://www.webnovis.com/blog/[slug] → [slug].html
  html = html.replace(/https?:\/\/(?:www\.)?webnovis\.com\/blog\/([^"'\s<]+)/g, (m, slug) => {
    return slug.replace(/\.html$/, '') + '.html';
  });

  // Fix contact page
  html = html.replace(/https?:\/\/(?:www\.)?webnovis\.com\/contatti(?:\.html)?/g, '../contatti.html');

  // Fix chi-siamo page
  html = html.replace(/https?:\/\/(?:www\.)?webnovis\.com\/chi-siamo(?:\.html)?/g, '../chi-siamo.html');

  // Fix service pages — map keyword-based URLs to correct relative paths
  html = html.replace(/https?:\/\/(?:www\.)?webnovis\.com\/(?:servizi\/)?([^"'\s<]+)/g, (match, p) => {
    const lower = p.toLowerCase();
    if (lower.includes('graphic') || lower.includes('design') || lower.includes('brand') || lower.includes('grafica') || lower.includes('logo') || lower.includes('identit')) {
      return '../servizi/graphic-design.html';
    }
    if (lower.includes('social') || lower.includes('instagram') || lower.includes('advertising') || lower.includes('ads') || lower.includes('content-marketing') || lower.includes('facebook')) {
      return '../servizi/social-media.html';
    }
    // Default: web dev, SEO, performance, ecommerce
    return '../servizi/sviluppo-web.html';
  });

  // T4 safety: clean stray backslashes before quotes in href attributes
  html = html.replace(/href="([^"]*?)\\"/g, 'href="$1"');

  return html;
}

// ─── Blog index updater ──────────────────────────────────────────────────────

function buildBlogCardHTML(article) {
  const category = TAG_TO_CATEGORY[article.tag] || 'marketing';

  return `                    <article class="blog-card" data-category="${category}">
                        <div class="blog-card-body">
                            <span class="blog-card-tag">${article.tag}</span>
                            <h2 class="blog-card-title"><a href="${article.slug}.html">${escapeHTML(article.title)}</a></h2>
                            <p class="blog-card-excerpt">${escapeHTML(article.description)}</p>
                            <div class="blog-card-meta">
                                <span>${article.date} · ${article.readTime}</span>
                                <a href="${article.slug}.html" class="blog-card-read">Leggi →</a>
                            </div>
                        </div>
                    </article>`;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function updateBlogIndex(allArticlesMeta) {
  let html = fs.readFileSync(BLOG_INDEX_FILE, 'utf-8');

  // Build all cards
  const cardsHTML = allArticlesMeta.map(a => buildBlogCardHTML(a)).join('\n\n');

  // Replace blog grid content using regex
  // Pattern: <div class="blog-grid" id="blogGrid">...cards...</div>\n</div>\n</section>
  const gridRegex = /(<div class="blog-grid" id="blogGrid">)([\s\S]*?)(\s*<\/div>\s*<\/div>\s*<\/section>)/;
  const match = html.match(gridRegex);

  if (!match) {
    logError('Could not find blogGrid in index.html — skipping index update');
    return;
  }

  html = html.replace(gridRegex, `$1\n\n${cardsHTML}\n\n                $3`);

  // Update CollectionPage numberOfItems
  html = html.replace(
    /"numberOfItems":\s*\d+/,
    `"numberOfItems": ${allArticlesMeta.length}`
  );

  // Update CollectionPage itemListElement
  const itemListJSON = allArticlesMeta.map((a, i) =>
    `{"@type":"ListItem","position":${i + 1},"url":"${SITE_URL}/blog/${a.slug}.html","name":"${a.title.replace(/"/g, '\\"')}"}`
  ).join(',\n                ');

  html = html.replace(
    /"itemListElement":\s*\[[\s\S]*?\]/,
    `"itemListElement": [\n                ${itemListJSON}\n            ]`
  );

  fs.writeFileSync(BLOG_INDEX_FILE, html, 'utf-8');
  log(`Updated blog/index.html (${allArticlesMeta.length} articles)`);
}

// ─── Sitemap updater ─────────────────────────────────────────────────────────

function updateSitemap(newArticles) {
  if (!fs.existsSync(SITEMAP_FILE)) {
    logError('sitemap.xml not found — skipping');
    return;
  }

  let sitemap = fs.readFileSync(SITEMAP_FILE, 'utf-8');
  const todayIso = formatIsoDate(new Date());
  let added = 0;

  for (const article of newArticles) {
    if (sitemap.includes(`/blog/${article.slug}.html`)) continue;

    const entry = `  <url>\n    <loc>${SITE_URL}/blog/${article.slug}.html</loc>\n    <lastmod>${todayIso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    sitemap = sitemap.replace('</urlset>', `${entry}</urlset>`);
    added++;
  }

  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf-8');
  log(`Updated sitemap.xml (+${added} entries)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log('══════════════════════════════════════════');
  log('  WebNovis Auto Blog Writer');
  log('══════════════════════════════════════════');
  log(`Mode: ${DRY_RUN ? 'DRY RUN (no files written)' : 'PRODUCTION'}`);
  log(`Articles to generate: ${ARTICLES_PER_RUN}`);
  log(`Date: ${formatItalianDate(new Date())}`);
  log(`Gemini API (Writer): ${GEMINI_API_KEY ? 'configured' : 'NOT SET'}`);
  log(`Groq API: ${GROQ_API_KEY ? 'configured' : 'NOT SET'}`);
  log('');

  // Check at least one API key
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    logError('No AI API keys. Set GEMINI_API_KEY_WRITER and/or GROQ_API_KEY in .env');
    process.exit(1);
  }

  // Load existing state
  const existingSlugs = new Set(getExistingArticleSlugs());
  log(`Existing articles on disk: ${existingSlugs.size}`);

  const articlesLog = loadArticlesLog();

  // Build metadata pool of all known articles (for related linking)
  const allKnownArticles = [
    ...builtInArticles.map(a => ({ slug: a.slug, title: a.title, description: a.description, tag: a.tag })),
    ...stubArticles.map(a => ({ slug: a.slug, title: a.title, description: a.description, tag: a.tag })),
    ...articlesLog.map(a => ({ slug: a.slug, title: a.title, description: a.description, tag: a.tag }))
  ];

  // Load topic queue
  const topics = loadTopicQueue();
  const availableTopics = topics.filter(t => !t.used && !existingSlugs.has(t.slug));
  log(`Topic queue: ${availableTopics.length} available / ${topics.length} total`);

  if (availableTopics.length === 0) {
    logError('No available topics! Add more to blog/topics-queue.json');
    process.exit(1);
  }

  if (availableTopics.length < 20) {
    log('⚠️  Less than 20 topics remaining — add more soon!');
  }

  // Select today's batch
  const todaysBatch = availableTopics.slice(0, ARTICLES_PER_RUN);
  log(`\nSelected ${todaysBatch.length} topics for this run:\n`);
  todaysBatch.forEach((t, i) => log(`  ${i + 1}. ${t.slug} [${t.tag}]`));
  log('');

  // Generate articles
  const newArticles = [];
  const newLogEntries = [];

  for (let i = 0; i < todaysBatch.length; i++) {
    const topic = todaysBatch[i];
    log(`─── Article ${i + 1}/${todaysBatch.length}: ${topic.slug} ───`);

    if (DRY_RUN) {
      log(`  [DRY RUN] Would generate: "${topic.topic}"`);
      continue;
    }

    try {
      // Build prompt with current knowledge of all articles
      const prompt = buildMasterPrompt(topic, allKnownArticles);

      // Generate via AI
      const rawJSON = await generateWithAI(prompt);

      // Parse & validate
      const article = parseArticleJSON(rawJSON);
      article.content = postProcessContent(article.content);
      log(`  ✓ Parsed: "${article.title}" (${article.readTime})`);

      // Build full HTML page using build-articles.js template
      // AI content already includes inline CTA, source references and final CTA — skip template duplicates
      const relatedHTML = buildRelatedArticlesHTML(article.relatedArticles || []);
      const fullHTML = buildArticleHTML(article, `${article.content}${relatedHTML}`, {
        skipInlineCta: true,
        skipSourceReferences: true,
        skipFinalCta: true
      });

      // Write HTML file
      const filepath = path.join(BLOG_DIR, `${article.slug}.html`);
      fs.writeFileSync(filepath, fullHTML, 'utf-8');
      log(`  ✅ Written: ${article.slug}.html (${Math.round(fullHTML.length / 1024)}KB)`);

      // Update tracking
      newArticles.push(article);
      allKnownArticles.push({
        slug: article.slug, title: article.title,
        description: article.description, tag: article.tag
      });

      newLogEntries.push({
        slug: article.slug,
        title: article.title,
        description: article.description,
        tag: article.tag,
        date: article.date,
        isoDate: article.isoDate,
        readTime: article.readTime,
        generatedAt: new Date().toISOString(),
        qualityChecks: article.qualityChecks || {}
      });

      // Mark topic as used in queue
      const qIdx = topics.findIndex(t => t.slug === topic.slug);
      if (qIdx !== -1) topics[qIdx].used = true;

      // Rate limit pause
      if (i < todaysBatch.length - 1) {
        log(`  ⏳ Rate limit pause (${RATE_LIMIT_DELAY_MS / 1000}s)...`);
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    } catch (err) {
      logError(`Failed "${topic.slug}": ${err.message}`);
      // Continue to next article
    }
  }

  if (DRY_RUN) {
    log('\n[DRY RUN] Complete. No files were written.');
    return;
  }

  // Save state
  saveTopicQueue(topics);
  const updatedLog = [...articlesLog, ...newLogEntries];
  saveArticlesLog(updatedLog);

  // Update blog index & sitemap
  if (newArticles.length > 0) {
    // Build complete article list for index (newest first)
    const allMeta = [
      ...newLogEntries,
      ...builtInArticles,
      ...stubArticles,
      ...articlesLog
    ].map(a => ({
      slug: a.slug, title: a.title, description: a.description,
      tag: a.tag, date: a.date, readTime: a.readTime
    }));

    // Sort by isoDate descending (newest first)
    allMeta.sort((a, b) => {
      const dateA = a.isoDate || '2000-01-01';
      const dateB = b.isoDate || '2000-01-01';
      return dateB.localeCompare(dateA);
    });

    updateBlogIndex(allMeta);
    updateSitemap(newArticles);

    // Submit new articles to IndexNow (Bing, Yandex, Naver, Seznam, Amazon, Yep)
    try {
      const newSlugs = newArticles.map(a => a.slug);
      log('Submitting new articles to IndexNow...');
      const indexNowResult = await submitNewArticles(newSlugs, { dryRun: DRY_RUN });
      if (indexNowResult.success) {
        log(`IndexNow: ${indexNowResult.submitted} URLs submitted to search engines`);
      } else {
        log(`IndexNow: submission failed — ${indexNowResult.message}`);
      }
    } catch (indexNowErr) {
      log(`IndexNow: error (non-blocking) — ${indexNowErr.message}`);
    }
  }

  // Summary
  log('\n══════════════════════════════════════════');
  log('  SUMMARY');
  log('══════════════════════════════════════════');
  log(`Generated: ${newArticles.length}/${todaysBatch.length}`);
  log(`Topics remaining: ${availableTopics.length - todaysBatch.length}`);
  log(`Total blog articles: ${existingSlugs.size + newArticles.length}`);

  if (newArticles.length > 0) {
    log('\nNew articles:');
    newArticles.forEach(a => log(`  📝 ${a.title}`));
  }

  if (newArticles.length < todaysBatch.length) {
    log(`\n⚠️  ${todaysBatch.length - newArticles.length} articles failed — check logs above`);
  }

  log('\nDone.');
}

main().catch(err => {
  logError(`Fatal: ${err.message}`);
  process.exit(1);
});
