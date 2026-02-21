/**
 * IndexNow URL Submission — WebNovis
 * 
 * Notifica istantaneamente i motori di ricerca (Bing, Yandex, Naver, Seznam,
 * Amazon, Yep) quando contenuti vengono aggiunti, aggiornati o rimossi.
 * 
 * Modalità d'uso:
 * 
 *   1) Come modulo (importato da auto-writer.js o altri script):
 *      const { submitUrls, submitAllSitemapUrls } = require('./indexnow-submit');
 *      await submitUrls(['https://www.webnovis.com/blog/nuovo-articolo.html']);
 * 
 *   2) CLI — Submit tutte le URL dalla sitemap:
 *      node indexnow-submit.js --all
 * 
 *   3) CLI — Submit URL specifici:
 *      node indexnow-submit.js https://www.webnovis.com/blog/articolo.html
 * 
 *   4) CLI — Submit URL da file (uno per riga):
 *      node indexnow-submit.js --file urls.txt
 * 
 *   5) CLI — Dry run (mostra cosa verrebbe inviato senza inviare):
 *      node indexnow-submit.js --all --dry-run
 * 
 * Protocollo: https://www.indexnow.org/documentation
 * Bing setup: https://www.bing.com/indexnow/getstarted
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────────────

const SITE_HOST = 'www.webnovis.com';
const SITE_URL = 'https://www.webnovis.com';

// API key — can be overridden via env var for rotation without code changes
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '8531a1fa-b8b0-4136-8741-b5895865d3c4';
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// IndexNow global endpoint (shares with ALL participating search engines)
const INDEXNOW_API_URL = 'https://api.indexnow.org/indexnow';

// Max URLs per POST request (protocol limit: 10,000)
const MAX_URLS_PER_BATCH = 10000;

// Delay between batches to avoid rate limiting (ms)
const BATCH_DELAY_MS = 2000;

const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');
const LOG_FILE = path.join(__dirname, 'indexnow-log.json');

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toLocaleTimeString('it-IT');
  console.log(`[IndexNow ${ts}] ${msg}`);
}

function logError(msg) {
  const ts = new Date().toLocaleTimeString('it-IT');
  console.error(`[IndexNow ${ts}] ❌ ${msg}`);
}

// ─── Submission log (tracks what was submitted and when) ─────────────────────

function loadSubmissionLog() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8')); }
  catch { return []; }
}

function saveSubmissionLog(entries) {
  // Keep last 500 entries to avoid unbounded growth
  const trimmed = entries.slice(-500);
  fs.writeFileSync(LOG_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
}

function logSubmission(urls, statusCode, success, error = null) {
  const entries = loadSubmissionLog();
  entries.push({
    timestamp: new Date().toISOString(),
    urlCount: urls.length,
    urls: urls.slice(0, 20), // Log first 20 URLs max for readability
    statusCode,
    success,
    error: error || null
  });
  saveSubmissionLog(entries);
}

// ─── Core: Submit URLs to IndexNow ──────────────────────────────────────────

/**
 * Submit a batch of URLs to IndexNow.
 * Uses the global endpoint (api.indexnow.org) which shares with ALL
 * participating search engines: Bing, Yandex, Naver, Seznam, Amazon, Yep.
 * 
 * @param {string[]} urls - Array of full URLs to submit
 * @param {object} options - { dryRun: boolean }
 * @returns {object} { success: boolean, statusCode: number, submitted: number, message: string }
 */
async function submitUrls(urls, options = {}) {
  const { dryRun = false } = options;

  if (!urls || urls.length === 0) {
    log('No URLs to submit.');
    return { success: true, statusCode: 0, submitted: 0, message: 'No URLs provided' };
  }

  // Validate and normalize URLs
  const validUrls = urls
    .map(u => u.trim())
    .filter(u => u.startsWith('https://') || u.startsWith('http://'))
    .filter(u => {
      try { new URL(u); return true; }
      catch { return false; }
    });

  if (validUrls.length === 0) {
    logError('No valid URLs after filtering.');
    return { success: false, statusCode: 0, submitted: 0, message: 'No valid URLs' };
  }

  log(`Submitting ${validUrls.length} URL(s) to IndexNow...`);

  if (dryRun) {
    log('[DRY RUN] Would submit:');
    validUrls.forEach((u, i) => log(`  ${i + 1}. ${u}`));
    return { success: true, statusCode: 0, submitted: 0, message: 'Dry run — no URLs submitted' };
  }

  // Split into batches if needed (max 10,000 per request)
  const batches = [];
  for (let i = 0; i < validUrls.length; i += MAX_URLS_PER_BATCH) {
    batches.push(validUrls.slice(i, i + MAX_URLS_PER_BATCH));
  }

  let totalSubmitted = 0;
  let lastStatusCode = 0;
  let lastError = null;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];

    if (batches.length > 1) {
      log(`  Batch ${batchIdx + 1}/${batches.length} (${batch.length} URLs)...`);
    }

    const payload = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch
    };

    try {
      const res = await fetch(INDEXNOW_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });

      lastStatusCode = res.status;

      if (res.status === 200 || res.status === 202) {
        totalSubmitted += batch.length;
        log(`  ✅ Batch accepted (HTTP ${res.status}) — ${batch.length} URLs`);
        logSubmission(batch, res.status, true);
      } else if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '?';
        lastError = `Rate limited (429). Retry-After: ${retryAfter}`;
        logError(lastError);
        logSubmission(batch, res.status, false, lastError);
        // Stop submitting further batches on rate limit
        break;
      } else {
        const body = await res.text().catch(() => '');
        lastError = `HTTP ${res.status}: ${body.slice(0, 300)}`;
        logError(lastError);
        logSubmission(batch, res.status, false, lastError);
      }
    } catch (err) {
      lastError = err.message;
      logError(`Network error: ${lastError}`);
      logSubmission(batch, 0, false, lastError);
    }

    // Delay between batches
    if (batchIdx < batches.length - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  const success = totalSubmitted > 0;
  const message = success
    ? `Submitted ${totalSubmitted}/${validUrls.length} URLs to IndexNow`
    : `Failed to submit URLs: ${lastError}`;

  log(message);

  return {
    success,
    statusCode: lastStatusCode,
    submitted: totalSubmitted,
    message
  };
}

// ─── Parse sitemap.xml for all URLs ─────────────────────────────────────────

function parseSitemapUrls() {
  if (!fs.existsSync(SITEMAP_FILE)) {
    logError('sitemap.xml not found');
    return [];
  }

  const xml = fs.readFileSync(SITEMAP_FILE, 'utf-8');
  const urls = [];
  const locRegex = /<loc>(.*?)<\/loc>/g;
  let match;

  while ((match = locRegex.exec(xml)) !== null) {
    const url = match[1].trim();
    // Only include page URLs, not image URLs (those are inside <image:loc>)
    if (url.startsWith('https://') && !url.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Submit ALL URLs from sitemap.xml to IndexNow.
 * Useful after initial setup or after a major site update.
 * 
 * @param {object} options - { dryRun: boolean }
 */
async function submitAllSitemapUrls(options = {}) {
  log('Parsing sitemap.xml for all URLs...');
  const urls = parseSitemapUrls();
  log(`Found ${urls.length} URLs in sitemap.xml`);
  return submitUrls(urls, options);
}

/**
 * Submit specific new/updated blog article URLs.
 * Called by auto-writer.js after generating new articles.
 * 
 * @param {string[]} slugs - Array of article slugs (without .html)
 * @param {object} options - { dryRun: boolean, includeIndex: boolean }
 */
async function submitNewArticles(slugs, options = {}) {
  const { includeIndex = true } = options;

  const urls = slugs.map(slug => `${SITE_URL}/blog/${slug}.html`);

  // Also submit blog index and sitemap URL since they were updated
  if (includeIndex && slugs.length > 0) {
    urls.push(`${SITE_URL}/blog/`);
    urls.push(`${SITE_URL}/`); // Homepage may show latest articles
  }

  return submitUrls(urls, options);
}

// ─── CLI Mode ────────────────────────────────────────────────────────────────

async function cli() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const submitAll = args.includes('--all');
  const fileIdx = args.indexOf('--file');

  console.log('══════════════════════════════════════════');
  console.log('  IndexNow URL Submission — WebNovis');
  console.log('══════════════════════════════════════════');
  console.log(`Key: ${INDEXNOW_KEY.slice(0, 8)}...`);
  console.log(`Key file: ${KEY_LOCATION}`);
  console.log(`Endpoint: ${INDEXNOW_API_URL}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log('');

  if (submitAll) {
    // Submit all sitemap URLs
    const result = await submitAllSitemapUrls({ dryRun });
    console.log('\nResult:', JSON.stringify(result, null, 2));
  } else if (fileIdx !== -1 && args[fileIdx + 1]) {
    // Submit URLs from file
    const filePath = path.resolve(args[fileIdx + 1]);
    if (!fs.existsSync(filePath)) {
      logError(`File not found: ${filePath}`);
      process.exit(1);
    }
    const urls = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'));
    const result = await submitUrls(urls, { dryRun });
    console.log('\nResult:', JSON.stringify(result, null, 2));
  } else {
    // Submit specific URLs from arguments
    const urls = args.filter(a => a.startsWith('http'));
    if (urls.length === 0) {
      console.log('Usage:');
      console.log('  node indexnow-submit.js --all                    Submit all sitemap URLs');
      console.log('  node indexnow-submit.js --all --dry-run          Preview without submitting');
      console.log('  node indexnow-submit.js URL1 URL2 ...            Submit specific URLs');
      console.log('  node indexnow-submit.js --file urls.txt          Submit URLs from file');
      console.log('');
      console.log('Examples:');
      console.log('  node indexnow-submit.js https://www.webnovis.com/blog/nuovo-articolo.html');
      console.log('  node indexnow-submit.js --all');
      process.exit(0);
    }
    const result = await submitUrls(urls, { dryRun });
    console.log('\nResult:', JSON.stringify(result, null, 2));
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  submitUrls,
  submitAllSitemapUrls,
  submitNewArticles,
  parseSitemapUrls,
  INDEXNOW_KEY,
  SITE_URL
};

// Run CLI if executed directly
if (require.main === module) {
  cli().catch(err => {
    logError(`Fatal: ${err.message}`);
    process.exit(1);
  });
}
