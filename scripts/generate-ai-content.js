/**
 * WebNovis — AI Content Generation Layer (pSEO)
 *
 * Generates unique content blocks per city using Gemini Flash API:
 *   - Unique local market description (200-300 words)
 *   - 5 unique FAQs per city×pageType combination
 *   - City-specific data points (sectors, competitors, opportunity score)
 *
 * Content is saved to data/content-blocks/{city-slug}.json
 * and merged into the build pipeline by generate-all-geo.js
 *
 * Cost estimate: ~$0.002 per city → $0.10 for 50 cities → $0.26 for 130 cities
 *
 * Usage:
 *   node scripts/generate-ai-content.js                   Generate for all cities missing content
 *   node scripts/generate-ai-content.js --city=lainate    Generate for specific city
 *   node scripts/generate-ai-content.js --force           Regenerate all (overwrite existing)
 *   node scripts/generate-ai-content.js --dry-run         Preview prompts without calling API
 *
 * Requires: GEMINI_API_KEY_SEARCH in .env (same key used by search-ai endpoint)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'data', 'content-blocks');
const MODEL = 'gemini-2.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_RETRIES = 3;

// ─── API Key Pool (round-robin across 2 DEDICATED pSEO keys) ──────────────────
// PSEO + PSEO_2: completamente isolate da CHAT, SEARCH, WRITER.
// Non c'è MAI fallback sulle chiavi runtime — se entrambe le PSEO sono esaurite, lo script si ferma.
const API_KEY_POOL = [
    process.env.GEMINI_API_KEY_PSEO,
    process.env.GEMINI_API_KEY_PSEO_2
].filter(k => k && !k.startsWith('INSERISCI') && k.length > 10);

// Track which keys are exhausted (429'd) with cooldown timestamps
const exhaustedKeys = new Map(); // key → timestamp when it was 429'd
const KEY_COOLDOWN_MS = 60 * 1000; // 60s cooldown before retrying an exhausted key
let currentKeyIndex = 0;

function getNextApiKey() {
    const now = Date.now();
    // Try each key in the pool, skipping recently exhausted ones
    for (let attempts = 0; attempts < API_KEY_POOL.length; attempts++) {
        const idx = (currentKeyIndex + attempts) % API_KEY_POOL.length;
        const key = API_KEY_POOL[idx];
        const exhaustedAt = exhaustedKeys.get(key);
        if (!exhaustedAt || (now - exhaustedAt) > KEY_COOLDOWN_MS) {
            currentKeyIndex = (idx + 1) % API_KEY_POOL.length; // Advance for next call
            return { key, index: idx };
        }
    }
    // All keys exhausted — return the least recently exhausted
    let oldestKey = API_KEY_POOL[0];
    let oldestTime = Infinity;
    for (const [k, t] of exhaustedKeys) {
        if (t < oldestTime) { oldestTime = t; oldestKey = k; }
    }
    return { key: oldestKey, index: API_KEY_POOL.indexOf(oldestKey) };
}

function markKeyExhausted(key) {
    exhaustedKeys.set(key, Date.now());
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const cityArg = args.find(a => a.startsWith('--city='));
const SINGLE_CITY = cityArg ? cityArg.split('=')[1] : null;

// Rate limiting: 2s between requests (safe with 4 keys rotating)
const DELAY_MS = 2000;

// ─── Load Data ────────────────────────────────────────────────────────────────
const citiesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const servicesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
const cities = citiesData.cities;
const coreServices = servicesData.services.filter(s => s.tier === 'core');

// Ensure content-blocks directory exists
if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

// ─── Prompt Templates ─────────────────────────────────────────────────────────

function buildPrompt(city) {
    const ctx = city.localContext || {};
    const nearNames = (city.nearCities || []).slice(0, 5).join(', ');

    return `Sei un copywriter SEO esperto per WebNovis, agenzia web con sede a Rho (MI).
Genera contenuto UNICO e SPECIFICO per la città di ${city.name} (${city.cap}, ${city.province}).

DATI CITTÀ:
- Popolazione: ${city.population ? city.population.toLocaleString('it-IT') : 'N/D'}
- Distanza da sede Rho: ${city.distanzaSede}
- Comuni vicini: ${nearNames}
- Settori chiave: ${(ctx.settoriChiave || []).join(', ') || 'N/D'}
- Punti di riferimento: ${(ctx.highlights || []).join(', ') || 'N/D'}

SERVIZI WEBNOVIS (con prezzi):
${coreServices.map(s => `- ${s.name}: da €${s.priceFrom}${s.priceUnit || ''} (${s.timeEstimate})`).join('\n')}

ISTRUZIONI:
Genera un JSON con questa struttura ESATTA:

{
  "localMarketAnalysis": "Paragrafo di 150-200 parole che descrive il mercato digitale specifico di ${city.name}. DEVE includere: almeno 2 dati statistici concreti (popolazione, densità imprese, settori trainanti), riferimenti a zone specifiche o punti di riferimento locali, e un'analisi dell'opportunità digitale unica per questo comune. NON ripetere informazioni generiche applicabili a qualsiasi città.",

  "competitiveContext": "Paragrafo di 100-150 parole sul contesto competitivo digitale di ${city.name}: quante web agency ci sono nella zona, perché WebNovis da Rho (${city.distanzaSede}) è un'alternativa concreta, e quale vantaggio specifico hanno le PMI locali che investono ora nel digitale.",

  "faqsAgenzia": [
    {"q": "Domanda specifica su agenzia web a ${city.name}?", "a": "Risposta con dati concreti e specifici per ${city.name}. Includi almeno 1 prezzo o dato numerico."},
    {"q": "Domanda su costi/tempi a ${city.name}?", "a": "Risposta specifica."},
    {"q": "Domanda su settore locale di ${city.name}?", "a": "Risposta che cita settori economici specifici del comune."},
    {"q": "Domanda su vantaggi agenzia locale vs milanese?", "a": "Risposta con confronto concreto."},
    {"q": "Domanda su servizio specifico per ${city.name}?", "a": "Risposta con caso d'uso locale."}
  ],

  "faqsRealizzazione": [
    {"q": "Quanto costa realizzare un sito web a ${city.name}?", "a": "Risposta con prezzi specifici e confronto locale."},
    {"q": "Domanda su SEO locale per ${city.name}?", "a": "Risposta con keyword locali specifiche."},
    {"q": "Domanda su e-commerce per attività di ${city.name}?", "a": "Risposta con riferimento a settori locali."},
    {"q": "Domanda su tempi e processo?", "a": "Risposta con timeline specifica."},
    {"q": "Domanda su supporto post-lancio?", "a": "Risposta con dettagli manutenzione."}
  ],

  "uniqueDataPoints": {
    "estimatedLocalBusinesses": "Numero stimato di attività nel comune (basato sulla popolazione)",
    "digitalMaturityScore": "basso|medio|alto — stima del livello di maturità digitale delle PMI locali",
    "topSearchQueries": ["query 1 specifica per ${city.name}", "query 2", "query 3"],
    "competitionLevel": "basso|medio|alto — livello di competizione SEO locale per web agency"
  }
}

REGOLE CRITICHE:
- Ogni FAQ deve essere GENUINAMENTE DIVERSA dalle FAQ di altre città
- NON usare frasi generiche come "il tessuto imprenditoriale" senza specificare COSA
- Includi NOMI di zone, strade, punti di riferimento REALI di ${city.name}
- Le risposte alle FAQ devono contenere almeno 1 dato numerico ciascuna
- Il tono è professionale ma diretto — no marketing fluff
- Rispondi SOLO con JSON valido, nessun testo fuori dal JSON`;
}

// ─── API Call ─────────────────────────────────────────────────────────────────

// Robust JSON recovery for truncated Gemini responses
function repairJson(text) {
    let cleaned = text.trim();
    // Try parsing as-is first
    try { return JSON.parse(cleaned); } catch (e) { /* continue with repair */ }

    // Close unclosed strings and brackets
    let inString = false;
    let escaped = false;
    for (let i = 0; i < cleaned.length; i++) {
        if (escaped) { escaped = false; continue; }
        if (cleaned[i] === '\\') { escaped = true; continue; }
        if (cleaned[i] === '"') inString = !inString;
    }
    if (inString) cleaned += '"';

    // Count and close brackets
    const opens = { '{': 0, '[': 0 };
    const closes = { '}': '{', ']': '[' };
    inString = false; escaped = false;
    for (let i = 0; i < cleaned.length; i++) {
        if (escaped) { escaped = false; continue; }
        if (cleaned[i] === '\\') { escaped = true; continue; }
        if (cleaned[i] === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (cleaned[i] in opens) opens[cleaned[i]]++;
        if (cleaned[i] in closes) opens[closes[cleaned[i]]]--;
    }
    // Remove trailing comma before closing
    cleaned = cleaned.replace(/,\s*$/, '');
    for (let i = 0; i < opens['[']; i++) cleaned += ']';
    for (let i = 0; i < opens['{']; i++) cleaned += '}';

    try { return JSON.parse(cleaned); } catch (e) {
        throw new Error(`JSON repair failed: ${e.message}`);
    }
}

async function callGemini(prompt, retryCount = 0) {
    if (API_KEY_POOL.length === 0) {
        throw new Error('No Gemini API keys configured in .env (need at least one of: GEMINI_API_KEY_PSEO, GEMINI_API_KEY_WRITER, GEMINI_API_KEY_SEARCH, GEMINI_API_KEY)');
    }

    const { key, index } = getNextApiKey();
    const keyLabel = `key${index + 1}/${API_KEY_POOL.length}`;

    const response = await fetch(`${API_URL}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json'
            }
        })
    });

    // Handle rate limiting with key rotation
    if (response.status === 429) {
        markKeyExhausted(key);
        const activeKeys = API_KEY_POOL.filter(k => {
            const t = exhaustedKeys.get(k);
            return !t || (Date.now() - t) > KEY_COOLDOWN_MS;
        }).length;

        if (activeKeys > 0 && retryCount < MAX_RETRIES * API_KEY_POOL.length) {
            // Another key is available — switch immediately, no wait
            console.log(`     🔄 Key ${keyLabel} rate-limited, switching to next key (${activeKeys} active)...`);
            return callGemini(prompt, retryCount + 1);
        } else if (retryCount < MAX_RETRIES * API_KEY_POOL.length) {
            // All keys exhausted — wait with backoff then retry
            const waitSec = Math.min(30, Math.pow(2, Math.floor(retryCount / API_KEY_POOL.length) + 2));
            console.log(`     ⏳ All ${API_KEY_POOL.length} keys exhausted, waiting ${waitSec}s...`);
            await new Promise(r => setTimeout(r, waitSec * 1000));
            return callGemini(prompt, retryCount + 1);
        } else {
            throw new Error(`All ${API_KEY_POOL.length} API keys exhausted after ${retryCount} retries`);
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error ${response.status} [${keyLabel}]: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');

    // Use robust JSON recovery
    return repairJson(text);
}

// ─── Content Generation ───────────────────────────────────────────────────────

async function generateForCity(city) {
    const outPath = path.join(CONTENT_DIR, `${city.slug}.json`);

    // Skip if already exists and not forcing
    if (!FORCE && fs.existsSync(outPath)) {
        console.log(`  ⏭ ${city.slug} — already exists (use --force to overwrite)`);
        return { status: 'skipped', city: city.slug };
    }

    const prompt = buildPrompt(city);

    if (DRY_RUN) {
        console.log(`  🔍 ${city.slug} — prompt preview (${prompt.length} chars)`);
        console.log(`     First 200 chars: ${prompt.slice(0, 200)}...`);
        return { status: 'dry-run', city: city.slug };
    }

    try {
        console.log(`  ⏳ ${city.slug} — generating...`);
        const content = await callGemini(prompt);

        // Validate response structure
        if (!content.localMarketAnalysis || !content.faqsAgenzia || !content.faqsRealizzazione) {
            throw new Error('Invalid response structure — missing required fields');
        }

        // Add metadata
        const enrichedContent = {
            _meta: {
                city: city.slug,
                generatedAt: new Date().toISOString(),
                model: MODEL,
                version: 1
            },
            ...content
        };

        fs.writeFileSync(outPath, JSON.stringify(enrichedContent, null, 2), 'utf8');
        const faqCount = (content.faqsAgenzia?.length || 0) + (content.faqsRealizzazione?.length || 0);
        console.log(`  ✅ ${city.slug} — ${faqCount} FAQs, ${content.localMarketAnalysis.length} chars market analysis`);
        return { status: 'generated', city: city.slug, faqCount };
    } catch (error) {
        console.error(`  ❌ ${city.slug} — ${error.message}`);
        return { status: 'error', city: city.slug, error: error.message };
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — AI Content Generation Layer (pSEO)');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Model: ${MODEL}`);
    console.log(`  API Key Pool: ${API_KEY_POOL.length} keys available`);
    API_KEY_POOL.forEach((k, i) => {
        const envName = ['PSEO', 'PSEO_2'][i] || `KEY${i}`;
        console.log(`    ${i + 1}. ${envName}: ${k.slice(0, 10)}...${k.slice(-4)}`);
    });
    console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : FORCE ? 'FORCE REGENERATE' : 'GENERATE MISSING'}`);
    console.log(`  Target: ${SINGLE_CITY || 'all cities'}\n`);

    if (API_KEY_POOL.length === 0 && !DRY_RUN) {
        console.error('❌ No pSEO API keys found in .env. Set GEMINI_API_KEY_PSEO and/or GEMINI_API_KEY_PSEO_2 (chiavi dedicate, separate da CHAT/SEARCH/WRITER)');
        process.exit(1);
    }

    const targetCities = SINGLE_CITY
        ? cities.filter(c => c.slug === SINGLE_CITY)
        : cities.filter(c => !c.isSede); // Skip Rho (hand-crafted)

    if (targetCities.length === 0) {
        console.error('❌ No matching cities found.');
        process.exit(1);
    }

    console.log(`  Processing ${targetCities.length} cities...\n`);

    const results = { generated: 0, skipped: 0, errors: 0 };

    for (const city of targetCities) {
        const result = await generateForCity(city);
        results[result.status === 'generated' ? 'generated' : result.status === 'skipped' ? 'skipped' : 'errors']++;

        // Rate limiting between API calls
        if (result.status === 'generated' && targetCities.indexOf(city) < targetCities.length - 1) {
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }

    console.log('\n══════════════════════════════════════════════════════');
    console.log(`  Generated: ${results.generated} | Skipped: ${results.skipped} | Errors: ${results.errors}`);
    console.log('══════════════════════════════════════════════════════');

    if (results.generated > 0 && !DRY_RUN) {
        console.log('\n  Next step: run `npm run build:geo` to merge AI content into pages.');
    }
}

main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
});
