/**
 * FAQPage coverage and truthfulness.
 *
 * Audit 2026-07-25 finding 4.1: 236 articles carried a visible FAQ with no
 * FAQPage markup — the single highest-yield structured-data gap for generative
 * surfaces. The rule enforced here is not "emit FAQPage everywhere" but
 * "whenever a page answers questions on screen, publish exactly those
 * questions and answers, verbatim".
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const {
  applySeoHtmlTransforms,
  ensureFaqPageSchema,
  extractVisibleFaqPairs
} = require('../config/seo-html-transforms');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function listHtml(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.endsWith('.html')).map((f) => `${dir}/${f}`);
}

function faqBlocks(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => { try { return JSON.parse(m[1]); } catch (_) { return null; } })
    .filter(Boolean)
    .flatMap((json) => (Array.isArray(json) ? json : [json]))
    .filter((json) => json['@type'] === 'FAQPage');
}

function main() {
  const pages = [...listHtml('blog'), ...listHtml('servizi')];
  const missing = [];
  const mismatched = [];
  const duplicated = [];
  const notIdempotent = [];
  let covered = 0;

  for (const relativePath of pages) {
    const html = readText(relativePath);
    if (/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*\bcontent=["'][^"']*\bnoindex\b/i.test(html)) continue;

    const visible = extractVisibleFaqPairs(html);
    const blocks = faqBlocks(html);

    if (blocks.length > 1) duplicated.push(`${relativePath}: ${blocks.length} FAQPage blocks`);
    if (visible.length >= 2 && blocks.length === 0) {
      missing.push(`${relativePath}: ${visible.length} visible Q/A, no FAQPage`);
      continue;
    }
    if (blocks.length === 0) continue;
    covered++;

    // Every published question must be answerable on the page itself.
    const questions = new Set(
      blocks.flatMap((b) => (b.mainEntity || []).map((q) => String(q.name || '').toLowerCase()))
    );
    const visibleQuestions = new Set(visible.map((p) => p.q.toLowerCase()));
    for (const q of questions) {
      if (visibleQuestions.size && !visibleQuestions.has(q)) {
        mismatched.push(`${relativePath}: schema question not visible on page — "${q.slice(0, 70)}"`);
        break;
      }
    }

    const once = ensureFaqPageSchema(html, relativePath);
    if (ensureFaqPageSchema(once, relativePath) !== once) notIdempotent.push(relativePath);
  }

  assert.deepEqual(duplicated, [], `a page must publish at most one FAQPage:\n${duplicated.join('\n')}`);
  assert.deepEqual(
    mismatched,
    [],
    `FAQPage must only contain questions the visitor can read:\n${mismatched.slice(0, 20).join('\n')}`
  );
  assert.deepEqual(
    missing,
    [],
    `pages with a visible FAQ must publish FAQPage:\n${missing.slice(0, 20).join('\n')}`
  );
  assert.deepEqual(notIdempotent, [], `FAQ generation must be idempotent:\n${notIdempotent.join('\n')}`);
  assert.ok(covered > 200, `expected broad FAQPage coverage, got ${covered} pages`);

  // The whole transform chain must stay stable too.
  const sample = ['blog/core-web-vitals-guida.html', 'servizi/sviluppo-web.html'];
  for (const relativePath of sample) {
    const html = readText(relativePath);
    const once = applySeoHtmlTransforms(html, relativePath);
    assert.equal(
      applySeoHtmlTransforms(once, relativePath),
      once,
      `${relativePath}: full transform chain must remain idempotent with FAQ generation`
    );
  }

  console.log(`FAQ schema regressions passed: ${covered} pages publish a FAQPage matching their visible FAQ.`);
}

main();
