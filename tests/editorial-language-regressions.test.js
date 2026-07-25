/**
 * Editorial language gate.
 *
 * Public pages are written for clients, not for the SEO operator. This suite
 * fails the build when internal operational vocabulary, automation artefacts or
 * unaccented Italian words reach user-visible copy or head metadata.
 *
 * Covers audit findings 3.1 (internal SEO notes on hubs), 3.5 (prompt artefact
 * in production) and 5.2 (missing accents).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { collectExpectedPublicHtml } = require('../scripts/public-artifact');

/**
 * Internal SEO/operational vocabulary that must never appear in commercial or
 * institutional copy.
 *
 * Deliberately NOT applied to /blog/: the blog teaches SEO, so "Search Console"
 * and "indicizzabile" are its legitimate subject matter. On a hub, a service
 * page or a territorial landing the same words mean internal notes leaked out.
 */
const INTERNAL_VOCABULARY = [
  /approvat[ae]\s+(?:per\s+l['’]indicizzazione|dalla\s+governance)/i,
  /ammess[ae]\s+all['’]indicizzazione/i,
  /\bindicizzabil[ei]\b/i,
  /\bdeindicizzat[ae]\b/i,
  /governance\s+SEO/i,
  /\bda\s+presidiare\b/i,
  /\bnel\s+report\b/i,
  // Naming Search Console as a service deliverable ("invio sitemap a Search
  // Console") is legitimate; treating our own queries as page content is not.
  /(?:gi[àa]\s+presenti|nostre\s+query|query[^.<]{0,40}visibilit)[^.<]{0,60}Search\s+Console/i,
  /Search\s+Console[^.<]{0,40}(?:pochi\s+click|impression|posizione\s+media)/i,
  /ultimi\s+28\s+giorni/i,
  /pi[uù]\s+link\s+interni/i,
  /crawl\s+budget/i,
  /\bCTR\s+null[oa]\b/i,
  /posizioni\s+medie\s+ma\b/i,
  /non\s+amplifica\s+URL/i
];

/**
 * Artefacts left behind by automated content generation.
 *
 * Checked ONLY against head metadata and the H1 — never against body prose.
 * This is an SEO blog: "keyword primaria", "placeholder" and "lorem ipsum" are
 * legitimate subject matter inside an article, but they can never legitimately
 * appear in that article's own title, description or heading.
 */
const AUTOMATION_ARTEFACTS = [
  /keyword\s+(?:primaria|secondaria)/i,
  /\[inserire\b/i,
  /\{\{\s*\w+/,
  /\bplaceholder\b/i,
  /lorem\s+ipsum/i,
  /\bTODO\b/,
  /come\s+assistente\s+(?:AI|virtuale)/i,
  /scrivi\s+un\s+articolo/i
];

/**
 * Editorial working notes that must never be published anywhere, blog included:
 * the source-confidence apparatus used while drafting, and citations of
 * unverifiable internal data presented as a source.
 */
const INTERNAL_ANNOTATIONS = [
  /\(\s*Confidenza\s*:/i,
  /\bMotivo\s*:\s*(?:fonte|report|dato|esperienza)/i,
  /Dati\s+interni\s+WebNovis/i
];

/** Italian words published without their final accent. */
/*
 * Only words with no valid unaccented spelling in Italian.
 * Deliberately excluded because they are legitimate other words:
 *   "meta"      — goal, and the HTML tag name;
 *   "necessita" — third person of "necessitare" ("il sito necessita di ...");
 *   "seguito", "subito", "capita", "principi" — unrelated homographs.
 */
const UNACCENTED_WORDS = [
  'piu', 'gia', 'perche', 'poiche', 'cosi', 'puo', 'percio', 'citta', 'qualita',
  'attivita', 'visibilita', 'prossimita', 'liberta', 'novita', 'realta',
  'specialita', 'identita', 'velocita', 'semplicita', 'affidabilita',
  'produttivita', 'accessibilita', 'usabilita', 'universita'
];
const UNACCENTED = new RegExp(`\\b(${UNACCENTED_WORDS.join('|')})\\b`, 'gi');

/** Strip scripts, styles and tags, keeping only what a reader actually sees. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Head metadata that is rendered in SERPs and social previews. */
function headMetadata(html) {
  const parts = [];
  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (title) parts.push(title[1]);
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (/name=["'](?:description|keywords)["']/i.test(tag) || /property=["']og:[^"']*["']/i.test(tag)) {
      const content = tag.match(/content=["']([^"']*)["']/i);
      if (content) parts.push(content[1]);
    }
  }
  return parts.join(' • ');
}

function excerpt(text, pattern) {
  const match = text.match(pattern);
  if (!match) return '';
  const at = text.indexOf(match[0]);
  return text.slice(Math.max(0, at - 60), at + match[0].length + 60).trim();
}

function main() {
  const files = collectExpectedPublicHtml(ROOT);
  assert.ok(files.length > 1000, `expected the full public HTML inventory, got ${files.length}`);

  const internal = [];
  const artefacts = [];
  const annotations = [];
  const accents = [];

  for (const relativePath of files) {
    const html = fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
    const head = headMetadata(html);
    const body = visibleText(html);
    const auditable = `${head} • ${body}`;
    const headings = (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || []).map(visibleText).join(' • ');
    const metadataOnly = `${head} • ${headings}`;

    const isEditorial = relativePath.replace(/\\/g, '/').startsWith('blog/');
    if (!isEditorial) {
      for (const pattern of INTERNAL_VOCABULARY) {
        if (pattern.test(auditable)) {
          internal.push(`${relativePath}: ${pattern} → "${excerpt(auditable, pattern)}"`);
          break;
        }
      }
    }
    for (const pattern of INTERNAL_ANNOTATIONS) {
      if (pattern.test(auditable)) {
        annotations.push(`${relativePath}: ${pattern} → "${excerpt(auditable, pattern)}"`);
        break;
      }
    }
    for (const pattern of AUTOMATION_ARTEFACTS) {
      if (pattern.test(metadataOnly)) {
        artefacts.push(`${relativePath}: ${pattern} → "${excerpt(metadataOnly, pattern)}"`);
        break;
      }
    }
    // URLs and file paths legitimately carry unaccented slugs
    // (/servizi/accessibilita.html); only prose is checked.
    const prose = auditable
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/\S*\/\S*/g, ' ')
      .replace(/\S+\.(?:html|webp|png|jpe?g|json|txt|css|js)\b/gi, ' ');
    const unaccented = [...new Set((prose.match(UNACCENTED) || []).map((w) => w.toLowerCase()))];
    if (unaccented.length) accents.push(`${relativePath}: ${unaccented.join(', ')}`);
  }

  assert.deepEqual(
    artefacts,
    [],
    `automation artefacts must never reach published copy:\n${artefacts.slice(0, 30).join('\n')}`
  );
  assert.deepEqual(
    annotations,
    [],
    `editorial working notes must never be published:\n${annotations.slice(0, 30).join('\n')}`
  );
  assert.deepEqual(
    internal,
    [],
    `internal SEO vocabulary must never reach commercial copy:\n${internal.slice(0, 30).join('\n')}`
  );
  assert.deepEqual(
    accents,
    [],
    `Italian copy must keep its accents:\n${accents.slice(0, 30).join('\n')}`
  );

  console.log(
    `Editorial language regressions passed: ${files.length} public HTML files, `
    + '0 automation artefacts, 0 working notes, 0 internal SEO vocabulary, 0 unaccented words.'
  );
}

main();
