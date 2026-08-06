# SEO/Accessibility Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all actionable findings from the 2026-08 technical SEO/accessibility audit (C1, A1, A3, M1, M4, M5, M2, B1, B3, B4, B6, B8, B9) plus additional issues found during verification (partner.html asset paths, servizi/* script paths, portfolio main.min.js missing defer, quanto-costa mixed paths).

**Architecture:** Root HTML files are build artifacts: `src/html/**/*.html` → `build.js` (minify) → root → `scripts/normalize-public-html.js` (applies `config/seo-html-transforms.js`). Edits go into `src/html/` sources, then rebuild. Cross-cutting head fixes (og:image dimensions) go into the shared idempotent transform. Consent-gated analytics already exists in `js/main.js` (`enableAnalyticsTracking` loads GA4 + Clarity + Meta Pixel only after consent) — C1 is pure deletion of legacy inline snippets.

**Tech Stack:** Static HTML/CSS/vanilla JS, Node build pipeline, node:assert regression tests in `tests/`.

**Key constraints (verified against test suite):**
- `tests/html-structure-regressions.test.js` requires exactly ONE hreflang (`it-IT`) on indexable pages → **B5 (x-default) is forbidden, skip**.
- `tests/security-and-legal-regressions.test.js` forbids nonce CSP; `_headers` (synced from `config/security-headers.js`) deliberately allows `'unsafe-inline'` → **M3 (strict CSP) skip**; no `_headers` changes.
- `config/image-policy.js` whitelists no-`loading` imgs by src keyword `logo` — avatar imgs pass today, but explicit `loading="lazy"` is still added (B1).
- `tests/lcp-hero-regressions.test.js` guards hero/logo fetchpriority — untouched.
- `applySeoHtmlTransforms` must stay idempotent (html-structure test).

**Deliberate skips (with justification):**
- **A2** (logo preload mismatch): already fixed in current source — header/footer use `<picture>` with webp `srcset` matching the preload `imagesrcset`/`imagesizes`. Verified in `src/html/index.html:26,38,702`. No action.
- **M3** (CSP-hostile inline blocks): project's CSP posture is deliberate and test-enforced (`unsafe-inline`, nonce CSP forbidden). Moving 190+ pages of inline snippets adds risk without security gain.
- **B2** (11 JSON-LD blocks on geo pages): multiple blocks are valid structured data; `@graph` consolidation is cosmetic and high-risk across the geo generator + 649 pages.
- **B5** (hreflang x-default): forbidden by html-structure test (exactly one it-IT hreflang).
- **B7** (SVG aria-hidden systematic): decorative SVGs live inside labeled controls (innocuous per audit); fixed only inside the FAQ buttons touched in Task 4.
- CSS `?v=` version bump for the `--gray` change: cosmetic-only change; stale cache is acceptable. `bump-css-version.js` is a stale Windows-path one-off, not usable.

---

### Task 1: Failing regression test for all audit guarantees

**Files:**
- Create: `tests/audit-seo-a11y-regressions.test.js`
- Modify: `package.json` (append `&& node tests/audit-seo-a11y-regressions.test.js` at the END of the `test:regressions` chain, before nothing else changes)

- [ ] **Step 1: Write the failing test**

Create `tests/audit-seo-a11y-regressions.test.js` (node:assert, style matches existing tests):

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const SRC_PAGES = [
  'index.html', 'chi-siamo.html', 'come-lavoriamo.html', 'contatti.html',
  'grazie.html', 'partner.html', 'portfolio.html', 'preventivo.html', '404.html'
];

function main() {
  const failures = [];

  // C1: no inline Clarity/Meta Pixel snippets in any HTML source or built page
  // (consent-gated loader lives only in js/main.js)
  for (const rel of SRC_PAGES) {
    for (const file of [`src/html/${rel}`, rel]) {
      const html = read(file);
      if (/clarity\.ms\/tag/.test(html)) failures.push(`${file}: inline Clarity snippet present (C1)`);
      if (/fbevents\.js/.test(html)) failures.push(`${file}: inline Meta Pixel snippet present (C1)`);
    }
  }

  // A1: no above-root relative script paths; site-config must be deferred
  for (const rel of SRC_PAGES) {
    const html = read(`src/html/${rel}`);
    if (/<script[^>]+src="(?:\.\.\/){2,}js\//.test(html)) {
      failures.push(`src/html/${rel}: above-root ../../js script path (A1)`);
    }
    for (const m of html.matchAll(/<script[^>]+src="[^"]*site-config\.js"[^>]*>/g)) {
      if (!/\bdefer\b/.test(m[0])) failures.push(`src/html/${rel}: site-config.js without defer (A1)`);
    }
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'src/html/servizi'))) {
    if (!f.endsWith('.html')) continue;
    const html = read(`src/html/servizi/${f}`);
    if (/<script[^>]+src="(?:\.\.\/){2,}js\//.test(html)) {
      failures.push(`src/html/servizi/${f}: above-root ../../../js script path (A1)`);
    }
  }

  // A3: FAQ buttons carry state + controls, panels carry matching ids
  {
    const html = read('src/html/index.html');
    const buttons = [...html.matchAll(/<button class="faq-question"[^>]*>/g)].map((m) => m[0]);
    assert.equal(buttons.length, 9, 'expected 9 FAQ buttons on homepage');
    buttons.forEach((btn, i) => {
      if (!/aria-expanded="false"/.test(btn)) failures.push(`FAQ button #${i + 1}: missing aria-expanded="false" (A3)`);
      const ctl = (btn.match(/aria-controls="([^"]+)"/) || [])[1];
      if (!ctl) failures.push(`FAQ button #${i + 1}: missing aria-controls (A3)`);
      else if (!new RegExp(`<div class="faq-answer" id="${ctl}"`).test(html)) {
        failures.push(`FAQ button #${i + 1}: aria-controls target #${ctl} not found (A3)`);
      }
    });
  }

  // M1: every async (media=print) CSS/font href appears inside a <noscript> fallback
  for (const rel of SRC_PAGES) {
    const html = read(`src/html/${rel}`);
    const asyncHrefs = [...html.matchAll(/<link href="([^"]+)" rel="stylesheet" media="print"/g)].map((m) => m[1]);
    if (asyncHrefs.length === 0) continue;
    const noscripts = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)].map((m) => m[1]).join(' ');
    for (const href of asyncHrefs) {
      if (!noscripts.includes(href)) failures.push(`src/html/${rel}: noscript missing fallback for ${href} (M1)`);
    }
  }

  // M4: no SearchAction anywhere (no server-side ?s= results page exists)
  for (const rel of SRC_PAGES) {
    if (/"@type"\s*:\s*"SearchAction"/.test(read(`src/html/${rel}`))) {
      failures.push(`src/html/${rel}: SearchAction JSON-LD present (M4)`);
    }
  }

  // M5: --gray must reach WCAG AA (>= 4.5:1) on #0a0a0a
  {
    const css = read('css/style.css');
    const hex = (css.match(/--gray:\s*(#[0-9a-fA-F]{6})/) || [])[1];
    assert.ok(hex, '--gray variable not found');
    const lum = (h) => {
      const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const contrast = (lum(hex) + 0.05) / (lum('#0a0a0a') + 0.05);
    if (contrast < 4.5) failures.push(`--gray ${hex} contrast ${contrast.toFixed(2)}:1 < 4.5:1 (M5)`);
  }

  // B4: no single-item BreadcrumbList on the homepage
  if (/BreadcrumbList/.test(read('src/html/index.html'))) {
    failures.push('src/html/index.html: BreadcrumbList on home (B4)');
  }

  // B6: search inputs must declare type="search"
  {
    const html = read('src/html/index.html');
    for (const m of html.matchAll(/<input[^>]*id="searchInput(?:Mobile)?"[^>]*>/g)) {
      if (!/type="search"/.test(m[0])) failures.push(`search input missing type="search" (B6): ${m[0].slice(0, 80)}`);
    }
  }

  // B8: portfolio fonts use display=optional (consistent with index)
  {
    const html = read('src/html/portfolio.html');
    if (/fonts\.googleapis\.com\/css2[^"]*display=swap/.test(html)) {
      failures.push('src/html/portfolio.html: fonts use display=swap (B8)');
    }
  }

  // B9: budget radios wrapped in fieldset + legend
  {
    const html = read('src/html/preventivo.html');
    if (!/<fieldset class="form-group full-width budget-fieldset">\s*<legend>Budget indicativo<\/legend>/.test(html)) {
      failures.push('preventivo.html: budget radios not in fieldset/legend (B9)');
    }
  }

  // B1: feed avatars decorative (alt="") and lazy
  {
    const html = read('src/html/index.html');
    for (const m of html.matchAll(/<img[^>]*class="avatar-img"[^>]*>/g)) {
      if (!/alt=""/.test(m[0])) failures.push(`avatar-img without alt="" (B1)`);
      if (!/loading="lazy"/.test(m[0])) failures.push(`avatar-img without loading="lazy" (B1)`);
    }
  }

  // M2: portfolio nicole-inspired must use the async pattern
  {
    const html = read('src/html/portfolio.html');
    if (/<link href="css\/nicole-inspired\.min\.css[^"]*" rel="stylesheet">/.test(html)) {
      failures.push('portfolio.html: nicole-inspired render-blocking (M2)');
    }
  }

  // B3: known og:image URLs must carry width/height (checked on built+normalized root files)
  {
    const KNOWN = {
      'https://www.webnovis.com/Img/og-image-social-graph.jpeg': ['1600', '840'],
      'https://www.webnovis.com/Img/blog-cat-web.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-seo.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-marketing.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-social.png': ['800', '450']
    };
    for (const rel of ['index.html', 'contatti.html', 'realizzazione-siti-web-arese.html']) {
      const html = read(rel);
      for (const [url, [w, h]] of Object.entries(KNOWN)) {
        if (!html.includes(`"${url}"`) && !html.includes(url)) continue;
        if (!html.includes(`property="og:image:width" content="${w}"`) && !html.includes(`content="${w}" property="og:image:width"`)) {
          failures.push(`${rel}: missing og:image:width=${w} (B3)`);
        }
        if (!html.includes(`property="og:image:height" content="${h}"`) && !html.includes(`content="${h}" property="og:image:height"`)) {
          failures.push(`${rel}: missing og:image:height=${h} (B3)`);
        }
      }
    }
  }

  assert.deepEqual(failures, [], `audit regressions:\n${failures.join('\n')}`);
}

try {
  main();
  console.log('Audit SEO/a11y regression checks passed.');
} catch (error) {
  console.error('Audit SEO/a11y regression checks failed:', error.message);
  process.exit(1);
}
```

- [ ] **Step 2: Register in package.json**

In `package.json`, append at the end of the `test:regressions` chain:
` && node tests/audit-seo-a11y-regressions.test.js`

- [ ] **Step 3: Run test to verify it fails**

Run: `node tests/audit-seo-a11y-regressions.test.js`
Expected: FAIL listing C1, A1, A3, M1, M4, M5, B4, B6, B8, B9, B1, M2, B3 violations.

- [ ] **Step 4: Commit**

`git add tests/audit-seo-a11y-regressions.test.js package.json && git commit -m "test(audit): add fail-closed guards for SEO/a11y audit findings"`

---

### Task 2: C1 — remove inline Clarity/Meta Pixel snippets (GDPR)

**Files:**
- Modify: `src/html/preventivo.html` (line 22), `src/html/come-lavoriamo.html` (head), `src/html/grazie.html` (head)

Context: `js/main.js` `enableAnalyticsTracking()` already loads GA4, Clarity (`vjbr983er7`) and Meta Pixel (`1405109048327436`) only after `cookie_consent === 'accepted'`. The inline snippets bypass consent (and read the wrong localStorage key `cookieConsent`). Pure deletion; no JS changes.

- [ ] **Step 1: Delete the two inline scripts from all three files**

In each of the 3 files, delete this exact string (identical in all three; note trailing space before `<style>`/`<script>`):

```
<script type="text/javascript">!function(e,t,n,r,c,a,s){e[n]=e[n]||function(){(e[n].q=e[n].q||[]).push(arguments)},(a=t.createElement(r)).async=1,a.src="https://www.clarity.ms/tag/vjbr983er7",(s=t.getElementsByTagName(r)[0]).parentNode.insertBefore(a,s)}(window,document,"clarity","script")</script> <script>!function(e,t,n,o,c,a,s){e.fbq||(c=e.fbq=function(){c.callMethod?c.callMethod.apply(c,arguments):c.queue.push(arguments)},e._fbq||(e._fbq=c),c.push=c,c.loaded=!0,c.version="2.0",c.queue=[],(a=t.createElement(n)).async=!0,a.src="https://connect.facebook.net/en_US/fbevents.js",(s=t.getElementsByTagName(n)[0]).parentNode.insertBefore(a,s))}(window,document,"script"),fbq("consent","revoke"),fbq("init","1405109048327436"),"accepted"===localStorage.getItem("cookieConsent")&&(fbq("consent","grant"),fbq("track","PageView"))</script> 
```

- [ ] **Step 2: Verify** — `grep -c "clarity.ms/tag\|fbevents" src/html/preventivo.html src/html/come-lavoriamo.html src/html/grazie.html` → all 0.

- [ ] **Step 3: Commit** — `git commit -m "fix(privacy): load Clarity/Meta Pixel only via consent-gated main.js flow (C1)"`

---

### Task 3: A1 — fix above-root script paths + missing defer (+ partner/quanto-costa extras)

**Files:** `src/html/{index,chi-siamo,come-lavoriamo,contatti,grazie,portfolio,preventivo,404,partner}.html`, `src/html/servizi/*.html` (9 files), `src/html/quanto-costa-un-sito-web/index.html`

Replacements (SearchReplace per file; paths are relative to OUTPUT location — root pages `js/`, servizi `../js/`):

Root-level pages (index, chi-siamo, come-lavoriamo, contatti, grazie, preventivo):
- `<script src="../../js/site-config.js"></script>` → `<script defer src="js/site-config.js"></script>`
- `<script defer src="../../js/noncritical-loader.min.js"></script>` → `<script defer src="js/noncritical-loader.min.js"></script>`
- `<script defer src="../../js/web-vitals-reporter.min.js"></script>` → `<script defer src="js/web-vitals-reporter.min.js"></script>`

index.html additionally: `<script defer src="../../js/noncritical-loader.min.js"></script>` (same as above).

404.html: `../../js/footer-widgets-loader.min.js` → `js/footer-widgets-loader.min.js`; site-config (add defer, → `js/`); noncritical-loader → `js/`; web-vitals-reporter → `js/`. (`/js/main.min.js` already absolute — leave.)

portfolio.html: site-config (as above) + `<script src="js/main.min.js?v=1.1">` → `<script defer src="js/main.min.js?v=1.1">` + `<script defer src="../../js/web-vitals-reporter.min.js">` → `js/` + `<script defer src="../../js/footer-widgets-loader.min.js">` → `js/` + `<script defer src="../../js/noncritical-loader.min.js?v=20260728c">` → `js/`.

partner.html (outputs to ROOT — all `../` paths wrong):
- `href="../css/` → `href="css/` (4 stylesheet links)
- `<script src="../../../js/site-config.js">` → `<script defer src="js/site-config.js">`
- `<script src="../js/main.min.js" defer>` → `<script defer src="js/main.min.js">`
- `<script src="../js/search.min.js?v=20260728c" defer>` → `<script defer src="js/search.min.js?v=20260728c">`
- `../../js/noncritical-loader.min.js` / `../../js/web-vitals-reporter.min.js` / `../../js/footer-widgets-loader.min.js` → `js/…`

servizi/*.html (9 files, output depth 1):
- `<script src="../../../js/site-config.js"></script>` → `<script defer src="../js/site-config.js"></script>`
- `../../../js/noncritical-loader.min.js` → `../js/noncritical-loader.min.js`
- `../../../js/web-vitals-reporter.min.js` → `../js/web-vitals-reporter.min.js`

quanto-costa-un-sito-web/index.html (depth 1): `<script src="../js/site-config.js">` → `<script defer src="../js/site-config.js">`; `../../../js/web-vitals-reporter.min.js` / `../../../js/footer-widgets-loader.min.js` / `../../../js/noncritical-loader.min.js?v=20260728c` → `../js/…`.

Safety: no inline script reads `WEBNOVIS_SITE_CONFIG` (verified) — deferred site-config before deferred main.min.js preserves execution order.

- [ ] **Step 1: Apply replacements** per file above.
- [ ] **Step 2: Verify** — `grep -rn '\.\./\.\./js/' src/html/` → empty; `node tests/audit-seo-a11y-regressions.test.js` A1 failures gone.
- [ ] **Step 3: Commit** — `git commit -m "fix(perf): correct above-root script paths and defer site-config (A1)"`

---

### Task 4: A3 — FAQ accordion aria attributes (homepage)

**Files:** `src/html/index.html`

9 `.faq-item` blocks (5 compact at ~L474-502, 4 expanded at ~L679-693). For item N (1-9), edit button + panel:

- Button: `<button class="faq-question">` → `<button class="faq-question" aria-expanded="false" aria-controls="faq-answer-N" id="faq-question-N">` (match each button by its unique question text, e.g. `<button class="faq-question"> <span>Quali servizi offre WebNovis?</span>`).
- Toggle SVG inside button: add `aria-hidden="true"` to the `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ...>` inside `.faq-toggle` (B7 partial).
- Panel: `<div class="faq-answer">` → `<div class="faq-answer" id="faq-answer-N" role="region" aria-labelledby="faq-question-N">`.

`js/main.js` already toggles `aria-expanded` on click — no JS change.

- [ ] **Step 1: Apply 9 button + 9 panel edits** (both markup styles).
- [ ] **Step 2: Verify** — audit test A3 checks pass.
- [ ] **Step 3: Commit** — `git commit -m "fix(a11y): expose FAQ accordion state to AT server-side (A3)"`

---

### Task 5: M1 — noscript CSS/font fallbacks

**Files:** all `src/html/*.html` + `src/html/servizi/*.html` + `src/html/quanto-costa-un-sito-web/index.html`

Replace `<noscript> </noscript>` in each page with plain stylesheet links mirroring that page's `media="print"` hrefs (exact version queries and font URL from the same page):

- index: revolution?v=1.5, leviathan-inspired?v=1.3, social-feed-modern?v=1.4, weby-mobile-fix?v=1.3, nicole-inspired?v=1.3, search?v=2.1 + fonts URL with `display=optional`
- chi-siamo/come-lavoriamo/contatti/grazie/preventivo: revolution?v=1.5, search?v=2.1, weby-mobile-fix?v=1.3 + that page's fonts URL (`display=swap`)
- portfolio: revolution?v=1.5, leviathan-inspired?v=1.3, social-feed-modern?v=1.4, search?v=2.1, weby-mobile-fix?v=1.3, nicole-inspired?v=1.3 (after Task 12) + fonts URL with `display=optional` (after Task 9)
- partner: revolution?v=1.5, search?v=2.1, weby-mobile-fix?v=1.3 (with corrected `css/` paths) + fonts URL
- 404 / servizi/* / quanto-costa: mirror each page's media=print hrefs (collect with `grep -o 'href="[^"]*" rel="stylesheet" media="print"' <file>`; include the page's fonts link if it uses the media=print pattern)

Order of operations: do this AFTER Tasks 3, 9, 12 so fallback hrefs use final paths/params.

- [ ] **Step 1: Apply per-page noscript replacement.**
- [ ] **Step 2: Verify** — audit test M1 checks pass.
- [ ] **Step 3: Commit** — `git commit -m "fix(perf): restore no-JS rendering with noscript stylesheet fallbacks (M1)"`

---

### Task 6: M4 + B4 — remove SearchAction and home BreadcrumbList

**Files:** `src/html/index.html`

- M4: from the WebSite JSON-LD (line ~768) delete:
`,"potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://www.webnovis.com/?s={search_term_string}"},"query-input":"required name=search_term_string"}`
- B4: delete the whole block:
`<script type="application/ld+json"> {\n"@context": "https://schema.org",\n"@type": "BreadcrumbList",\n"@id": "https://www.webnovis.com/#breadcrumb-home",\n"itemListElement": [\n{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.webnovis.com/" }\n]\n} </script>`
and from the WebPage JSON-LD delete: `,"breadcrumb":{"@id":"https://www.webnovis.com/#breadcrumb-home"}`

- [ ] **Step 1: Apply deletions.**
- [ ] **Step 2: Verify JSON validity** — `node -e` parse every remaining ld+json block of the file; audit test M4/B4 pass.
- [ ] **Step 3: Commit** — `git commit -m "fix(seo): drop fake SearchAction and single-item home BreadcrumbList (M4, B4)"`

---

### Task 7: M5 — --gray contrast fix

**Files:** `css/style.css` (line 207)

- [ ] **Step 1:** `--gray: #787878;` → `--gray: #909090;` (6.2:1 on #0a0a0a — AA pass with margin).
- [ ] **Step 2: Rebuild CSS** — `npm run build` regenerates `css/style.min.css` (also regenerates root HTML from src — expected).
- [ ] **Step 3: Verify** — audit test M5 passes; `grep -o -- '--gray: #909090' css/style.min.css` matches.
- [ ] **Step 4: Commit** — `git commit -m "fix(a11y): raise --gray to 6.2:1 contrast on dark bg (M5)"`

---

### Task 8: B3 — og:image dimensions via shared transform

**Files:**
- Modify: `config/seo-html-transforms.js` (add `OG_IMAGE_DIMENSIONS` map + `injectOgImageDimensions(html)` + call inside `applySeoHtmlTransforms` before `return`)

```js
const OG_IMAGE_DIMENSIONS = {
  'https://www.webnovis.com/Img/og-image-social-graph.jpeg': ['1600', '840'],
  'https://www.webnovis.com/Img/blog-cat-web.png': ['800', '450'],
  'https://www.webnovis.com/Img/blog-cat-seo.png': ['800', '450'],
  'https://www.webnovis.com/Img/blog-cat-marketing.png': ['800', '450'],
  'https://www.webnovis.com/Img/blog-cat-social.png': ['800', '450']
};

function injectOgImageDimensions(html) {
  if (/property="og:image:width"/i.test(html)) return html; // idempotent
  for (const [url, [w, h]] of Object.entries(OG_IMAGE_DIMENSIONS)) {
    const pattern = new RegExp(
      `(<meta\\b[^>]*\\bproperty="og:image"[^>]*\\bcontent="${url.replace(/[./]/g, '\\$&')}"[^>]*>|<meta\\b[^>]*\\bcontent="${url.replace(/[./]/g, '\\$&')}"[^>]*\\bproperty="og:image"[^>]*>)`,
      'i'
    );
    if (pattern.test(html)) {
      return html.replace(pattern, `$1 <meta property="og:image:width" content="${w}"> <meta property="og:image:height" content="${h}">`);
    }
  }
  return html;
}
```

(Read `applySeoHtmlTransforms` tail first and wire the call so it applies to every public page; keep single-og:image pages only — insertion happens once per page.)

- [ ] **Step 1: Read the tail of `config/seo-html-transforms.js`** to find the return path of `applySeoHtmlTransforms`.
- [ ] **Step 2: Implement + wire transform.**
- [ ] **Step 3: Run** `npm run normalize:public-html` — spot-check `index.html`, `realizzazione-siti-web-arese.html`, one blog page for the new metas; run twice to confirm idempotency (html-structure test also enforces).
- [ ] **Step 4: Commit** — `git commit -m "feat(seo): inject og:image dimensions via shared HTML transform (B3)"`

---

### Task 9: B6 + B8 + M2 — search input type, portfolio fonts, portfolio CSS

**Files:** `src/html/index.html`, `src/html/portfolio.html`

- B6: `<input id="searchInput" placeholder="Cerca nel sito..." autocomplete="off"` → add `type="search"`; same for `searchInputMobile`. Sweep other src pages for identical inputs (`grep -l 'id="searchInput"' src/html/*.html src/html/servizi/*.html`) and fix all. Check `.search-input` in `css/style.css` for an appearance reset; if missing add `appearance:none;-webkit-appearance:none;` to it.
- B8: in portfolio both font URLs `&display=swap"` → `&display=optional"`.
- M2: `<link href="css/nicole-inspired.min.css?v=1.3" rel="stylesheet">` → `<link href="css/nicole-inspired.min.css?v=1.3" rel="stylesheet" media="print" onload='this.media="all"'>` (matches index; `portfolio-premium.min.css` stays render-blocking — it owns above-fold body background).

- [ ] **Step 1: Apply edits.**
- [ ] **Step 2: Verify** — audit test B6/B8/M2 pass.
- [ ] **Step 3: Commit** — `git commit -m "fix(seo): search input type, portfolio font display, async nicole CSS (B6, B8, M2)"`

---

### Task 10: B9 + B1 — preventivo budget fieldset; feed avatars

**Files:** `src/html/preventivo.html`, `src/html/index.html`

B9:
- Replace `<div class="form-group full-width"> <label>Budget indicativo</label>` + following `<div class="budget-options">` wrapper with `<fieldset class="form-group full-width budget-fieldset"> <legend>Budget indicativo</legend> <div class="budget-options">`, and close with `</div> </fieldset>` right before `<div class="form-group full-width"> <label for="prev-timeline">`.
- Add to preventivo inline `<style>`: `.budget-fieldset{border:0;margin:0;padding:0;min-width:0}.budget-fieldset legend{display:block;font-size:.85rem;font-weight:600;color:var(--white);margin-bottom:.4rem;padding:0}`
- Mirror contatti.html's aria-live pattern: inspect contatti.html `aria-live` regions and preventivo's `.field-error`/`#form-result` elements; add `aria-live="polite"` to the budget group error slot / form result region consistently.

B1 (index): replace all 4 occurrences:
`<img alt="WebNovis" height="83" src="Img/webnovis-logo-bianco-150.webp" width="150" decoding="async" class="avatar-img">` → `<img alt="" height="83" src="Img/webnovis-logo-bianco-150.webp" width="150" decoding="async" loading="lazy" class="avatar-img">`

- [ ] **Step 1: Apply edits.**
- [ ] **Step 2: Verify** — audit test B9/B1 pass.
- [ ] **Step 3: Commit** — `git commit -m "fix(a11y): budget radiogroup semantics + decorative lazy avatars (B9, B1)"`

---

### Task 11: Full build + quality gate

- [ ] **Step 1:** `npm run build` (regenerates root HTML from src + minified CSS)
- [ ] **Step 2:** `npm run normalize:public-html`
- [ ] **Step 3:** `npm run validate:pages`
- [ ] **Step 4:** `npm run test:regressions` (all 25 suites incl. new audit test)
- [ ] **Step 5:** `npm run test:seo-smoke`
- [ ] **Step 6:** Spot-verify built output: `grep -c "clarity.ms/tag" preventivo.html come-lavoriamo.html grazie.html` → 0; `grep -o 'src="js/site-config.js"' index.html` → defer present; built noscript populated; og:image dims present in `realizzazione-siti-web-arese.html`.
- [ ] **Step 7: Commit** — `git commit -m "build: regenerate public HTML after audit fixes"`

**Self-review notes:** every audit item maps to a task or a documented skip (A2 verified-fixed, M3/B2/B5/B7 skip rationale in header). No placeholders; all edit strings are exact.

---

## Execution notes (2026-08-06) — deviations discovered during execution

All 11 tasks executed inline and verified. Two pipeline defects were discovered mid-flight and fixed as part of the work; without these fixes the A1/M1 fixes were silently reverted on every `npm run normalize:public-html`:

1. **`deduplicateStylesheetLinks` (config/seo-html-transforms.js)** stripped the M1 `<noscript>` fallback `<link>` tags as "duplicate stylesheets" (same href as the async `media="print"` copies). Fix: mask `<noscript>` blocks before deduping, restore after. This protects fallbacks on all ~2250 public pages, not just src pages.
2. **`normalize-public-html.js` walked `src/`** (missing from `EXCLUDED_DIRS`) and rewrote loader script paths using filesystem depth (`../../js/`, `../../../js/`) — wrong for sources that publish to root/depth-1. Fix: added `'src'` to `EXCLUDED_DIRS`; re-applied A1/M1 to sources.

Also during execution:
- **Execution order swap:** Task 9 (B6/B8/M2) was executed before Task 5 (M1), as the plan itself required (noscript fallbacks must mirror final hrefs after the portfolio CSS/font changes).
- **Test refinement:** the M2 check now strips `<noscript>` blocks before matching (fallback copies required by M1 intentionally match the render-blocking pattern).
- **Extra fixes beyond the audit:** chi-siamo.html loaded `footer-widgets-loader.min.js` twice (deduped); grazie.html conversion script read the wrong localStorage key `cookieConsent` (now `cookie_consent` ×3), gained a `window.__gaConfigured` guard, and dropped the dead `AW-CONVERSION_ID/CONVERSION_LABEL` placeholder; partner.html had broken `../css/` links (root-output page) — all corrected in Task 3.
- Final state: `npm run build` + `normalize:public-html` (idempotent, 0 rewrites on second run), `validate:pages`, all 26 `test:regressions` suites (incl. the new `audit-seo-a11y-regressions`), `test:seo-smoke` — all green; 22/22 spot checks on built output passed.

**Known follow-up (out of plan scope):** the 649 geo-generated pages share the same empty-`<noscript>` pattern; extending M1 fallbacks requires changing the geo generator head template (`scripts/geo/head-meta.js`) and re-running `build:geo`. The pipeline fixes above already ensure those fallbacks would survive normalization once generated.
