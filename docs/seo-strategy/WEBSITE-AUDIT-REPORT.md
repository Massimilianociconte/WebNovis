# WEBSITE AUDIT REPORT — WebNovis
**Date:** 15 Febbraio 2026  
**Scope:** Full-site audit — SEO, Security, Performance, Accessibility, CSS/JS Architecture, Server, Cross-file Consistency  
**Action:** REPORT ONLY — No code changes applied. Hand off to implementation AI.

---

## SEVERITY LEGEND
- **CRITICAL** — Breaks functionality, causes GDPR/legal risk, or blocks indexing
- **HIGH** — Significant SEO/security/UX impact, should fix before launch
- **MEDIUM** — Best-practice violations that affect quality/performance
- **LOW** — Minor improvements, polish, future-proofing

---

## 1. CRITICAL ISSUES

### 1.1 PRICING INCONSISTENCY ACROSS PAGES (Data Integrity)
**Files:** `index.html` (FAQ section + JSON-LD), `servizi/sviluppo-web.html`, `js/chat.js`, `server.js`, `blog/quanto-costa-un-sito-web.html`

The **homepage** FAQ section and JSON-LD schema state:
- Landing Page: **da €700**
- E-Commerce: **da €2.500**

But **every other source** states:
- Landing Page: **da €500** (sviluppo-web.html, chat.js, server.js, blog articles)
- E-Commerce: **da €3.500** (sviluppo-web.html, chat.js, server.js, blog articles)

**Impact:** Google Rich Results may show conflicting prices. Users see different prices depending on the page. Chatbot gives different pricing than homepage.

**Fix:** Align `index.html` FAQ text (line ~980), JSON-LD FAQ (line ~1518), and all other sources to a single authoritative set of prices.

---

### 1.2 PORTFOLIO DETAIL PAGES MISSING GA4 CONSENT GATING (GDPR)
**Files:** All 6 files in `portfolio/` — `Aether-Digital.html`, `Lumina-Creative.html`, `Muse-Editorial.html`, `PopBlock-Studio.html`, `Structure-Arch.html`, `Ember-Oak.html`

These pages have **zero GA4 tracking code** and **no cookie consent banner**. While this means they don't track without consent (good), it also means:
- No analytics data is collected even for consenting users
- No cookie banner appears, creating an inconsistent UX
- If GA4 is ever added without the consent gate, it would violate GDPR

**Fix:** Add the same consent-gated GA4 bootstrap snippet and cookie banner markup used on all other pages. Also add `js/main.min.js` and `js/cursor.min.js` script tags.

---

### 1.3 PORTFOLIO DETAIL PAGES MISSING FROM SITEMAP (SEO)
**File:** `sitemap.xml`

The sitemap lists `portfolio.html` but **none of the 6 individual portfolio detail pages**:
- `/portfolio/Aether-Digital.html`
- `/portfolio/Lumina-Creative.html`
- `/portfolio/Muse-Editorial.html`
- `/portfolio/PopBlock-Studio.html`
- `/portfolio/Structure-Arch.html`
- `/portfolio/Ember-Oak.html`

These pages have canonical URLs set to `https://www.webnovis.com/portfolio/...` so Google should index them, but without sitemap entries they may be discovered slowly or not at all.

**Fix:** Add all 6 portfolio detail pages to `sitemap.xml` with priority 0.6.

---

### 1.4 `<picture>` TAG WEBP TYPE MISMATCH (Performance / SEO)
**Files:** Every page with logo in nav/footer (~30+ files)

All `<picture>` tags for the logo use:
```html
<source srcset="Img/webnovis-logo-bianco.png" type="image/webp">
<img src="Img/webnovis-logo-bianco.png" ...>
```

The `type="image/webp"` attribute tells the browser the source is WebP, but the actual file is **PNG** (`webnovis-logo-bianco.png`). There is **no WebP version** of the logo in `Img/`. The browser will attempt to decode a PNG as WebP, which may silently fail and fall back to the `<img>` tag, or render incorrectly in some browsers.

**Fix:** Either:
1. Convert the logo to WebP and update the srcset path, OR
2. Remove the `<picture>/<source>` wrapper entirely and use a plain `<img>` tag since both paths point to the same PNG.

**Note:** The blog article template in `build-articles.js` (line ~686, ~710) also generates this broken pattern — fix the template AND regenerate articles.

---

## 2. HIGH SEVERITY ISSUES

### 2.1 HOMEPAGE `#contatti` ANCHOR LINKS NOT NORMALIZED (Navigation)
**File:** `index.html` — lines 166, 771, 799

Three CTA buttons on the homepage still link to `#contatti` (the in-page anchor section) instead of the dedicated `contatti.html` page:
1. Hero CTA "Scopri Come" → `href="#contatti"`
2. "Ricomincia ora" arrow button → `href="#contatti"`
3. Final CTA "Contattaci Ora" → `href="#contatti"`

**Context:** The homepage has an in-page `#contatti` section (id="contatti", line 1041), so these links technically work. However, the entire rest of the site (nav, footer, service pages, blog) links to `contatti.html`. This creates:
- Inconsistent user journey
- Duplicate contact surfaces that may diverge
- The in-page form on index.html is **missing the service select dropdown** that `contatti.html` has

**Fix:** Decide whether to keep the in-page contact form OR redirect all CTAs to `contatti.html`. If keeping both, ensure feature parity (add service dropdown to index.html form).

---

### 2.2 HTML SEMANTIC ERROR: `<nav>` INSIDE `<main>` (Accessibility / SEO)
**File:** `index.html` — lines 113-115

```html
<main id="main-content">
<!-- Navigation -->
<nav class="nav" id="nav">
```

The `<nav>` element is placed **inside** `<main>`. The HTML spec says `<main>` should contain the dominant content of the document, and navigation is explicitly **not** part of main content. Screen readers and search engines use `<main>` to identify core content.

**Fix:** Move the `<main>` opening tag to just before the first `<section>` (the hero), and ensure `</main>` closes before the `<footer>`. The `<nav>` should be a sibling of `<main>`, not a child.

---

### 2.3 MISSING `manifest.json` FILE
**Files:** Referenced by `<link rel="manifest" href="/manifest.json">` on every page

The file `manifest.json` was **not found** in the project root directory listing. Every page references it. A missing manifest results in:
- Console 404 error on every page load
- PWA installability broken
- Lighthouse audit failure

**Fix:** Create a proper `manifest.json` with app name, icons, theme_color, etc.

---

### 2.4 PORTFOLIO DETAIL PAGES MISSING `meta robots` TAG (SEO)
**Files:** All 6 portfolio detail pages

None of the portfolio detail pages have a `<meta name="robots">` tag. While Google defaults to `index, follow`, explicitly setting it (like all other pages do) ensures consistent crawling behavior and enables `max-image-preview:large` for better SERP appearance.

**Fix:** Add `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">` to each portfolio detail page.

---

### 2.5 SITEMAP REFERENCES NON-EXISTENT IMAGE FORMATS (SEO)
**File:** `sitemap.xml` — lines 28-51

The sitemap references `.png` versions of portfolio images:
- `Img/mikuna.png`
- `Img/fbtotalsecurity.png`
- `Img/quickseo.png`
- `Img/dreamsense.png`
- `Img/portfolio-mimmo-fratelli.png`

But the actual files on disk are `.webp`:
- `Img/mikuna.webp`
- `Img/fbtotalsecurity.webp`
- `Img/quickseo.webp`
- `Img/dreamsense.webp`
- `Img/portfolio-mimmo-fratelli.webp`

Google Image Search will get 404s for these image URLs.

**Fix:** Update sitemap image references to use `.webp` extensions (or create PNG aliases if both formats should be served).

---

### 2.6 `server.js` SERVES STALE DIRECTORY (`file portfolio`)
**File:** `server.js` — line 73

```javascript
app.use('/file portfolio', express.static(path.join(__dirname, 'file portfolio')));
```

The directory `file portfolio/` has been deleted (shown in `git status` as deleted). This route will 404 or error. Also, the URL path contains a space which is unusual and could cause issues.

**Fix:** Remove this line from `server.js`.

---

### 2.7 `server.js` NEWSLETTER ERROR LEAKS INTERNAL ERROR MESSAGES
**File:** `server.js` — line 380

```javascript
res.status(500).json({ error: error.message });
```

The `/api/newsletter/send` endpoint returns raw `error.message` to the client. This could leak internal details (file paths, API errors, stack traces) to an attacker probing the admin API.

**Fix:** Return a generic error: `{ error: 'Errore nell\'invio della newsletter.' }`

Same issue on line 418 (newsletter preview) and line 428 (subscribers).

---

### 2.8 `server.js` UNSUBSCRIBE ENDPOINT XSS VULNERABILITY
**File:** `server.js` — line 458

```javascript
<p><strong style="color:#fff">${email}</strong> è stato rimosso...
```

The `email` query parameter is inserted directly into HTML without sanitization. An attacker could craft a URL like:
`/api/newsletter/unsubscribe?email=<script>alert('xss')</script>`

**Fix:** HTML-escape the email before insertion, or use `textContent` equivalent server-side.

---

## 3. MEDIUM SEVERITY ISSUES

### 3.1 CSS ARCHITECTURE: 7 SEPARATE STYLESHEETS ON HOMEPAGE
**File:** `index.html` — lines 85-99

The homepage loads **7 CSS files**:
1. `style.min.css` (74 KB) — critical
2. `revolution.min.css` (12 KB) — async
3. `leviathan-inspired.min.css` (5 KB) — async
4. `social-feed-modern.min.css` (4 KB) — async
5. `weby-mobile-fix.min.css` (0.5 KB) — async
6. `nicole-inspired.min.css` (19 KB) — async
7. Google Fonts CSS — async

While most are loaded async via `media="print" onload`, this is still 7 separate HTTP requests. The total CSS payload is ~115 KB (minified).

**Recommendation:** Consider concatenating the async CSS files into a single bundle (e.g., `style-async.min.css`) to reduce HTTP requests.

---

### 3.2 JS: DUPLICATE SCROLL EVENT LISTENER FOR `highlightNav`
**File:** `js/main.js` — lines 245 and 267

```javascript
window.addEventListener('scroll', highlightNav);        // line 245
// ...
const debouncedHighlight = debounce(highlightNav, 100); // line 266
window.addEventListener('scroll', debouncedHighlight);   // line 267
```

`highlightNav` runs on **every scroll event** (line 245) AND debounced (line 267). The un-debounced version should be removed since the debounced version provides better performance.

**Fix:** Remove line 245.

---

### 3.3 JS: MULTIPLE COMPETING SCROLL LISTENERS (Performance)
**File:** `js/main.js`

The file registers at least **7 separate scroll event listeners**:
1. Navigation scroll effect (line 28)
2. `highlightNav` raw (line 245)
3. `highlightNav` debounced (line 267)
4. Parallax orbs + background color (line 156)
5. Back-to-top button (line 600)
6. Scroll progress bar (line 622)
7. Mouse-move parallax for orbs (line 652, overrides scroll parallax from #4)

The parallax effect for gradient orbs on scroll (line 162-165) is **overridden** by the mousemove handler (line 667-672) which sets `transform` on the same elements, creating a visual conflict.

**Fix:** Consolidate scroll listeners into a single `requestAnimationFrame`-throttled handler. Remove the conflicting orb parallax (either scroll or mousemove, not both).

---

### 3.4 JS: GLOBAL CLICK RIPPLE EFFECT ON EVERY CLICK
**File:** `js/main.js` — lines 435-466

A ripple effect is created on **every click** on the page, appending a new `<div>` to the DOM and injecting a `<style>` tag into `<head>`. This:
- Fires on form field clicks, menu clicks, etc. where it's unwanted
- Creates DOM churn on every click
- The injected `<style>` tag is appended on every page load

**Fix:** Scope the ripple to `.btn` elements only, and move the `@keyframes` into the main CSS file.

---

### 3.5 JS: FPS MONITOR CODE IN PRODUCTION
**File:** `js/main.js` — lines 517-532

The FPS monitor runs `requestAnimationFrame` in a loop (currently commented out at the call site, but the function is still defined and callable). Dead code that should be removed for production.

---

### 3.6 JS: RIGHT-CLICK PREVENTION CODE (Commented Out)
**File:** `js/main.js` — line 553

```javascript
// document.addEventListener('contextmenu', (e) => e.preventDefault());
```

Dead code. Remove.

---

### 3.7 JS: KEYBOARD SHORTCUT HIJACKING
**File:** `js/main.js` — lines 1012-1029

Pressing 'H' scrolls to top, pressing 'C' scrolls to contact. These fire on ANY page (blog articles, legal pages, etc.) when the user is not in an input field. This could confuse users typing in the chat widget's text area if `isContentEditable` check misses the custom input.

**Recommendation:** Remove these shortcuts or gate them behind a modifier key (e.g., Alt+H).

---

### 3.8 CACHE BUSTING VERSION MISMATCH
**Files:** Various HTML pages

Different pages use different cache-busting versions:
- `index.html`: `style.min.css?v=1.4`, `revolution.min.css?v=1.3`
- `chi-siamo.html`: `style.min.css?v=1.2`, `revolution.min.css?v=1.3`
- `contatti.html`: `style.min.css?v=1.4`, `revolution.min.css?v=1.3`
- Blog articles (generated): `style.min.css?v=1.4`

`chi-siamo.html` uses `?v=1.2` for style.css while other pages use `?v=1.4`. Users navigating between pages may load stale CSS.

**Fix:** Align all cache-busting versions to `v=1.4` across ALL pages: `chi-siamo.html`, `cookie-policy.html`, `privacy-policy.html`, `termini-condizioni.html`, `portfolio.html`, all service pages.

---

### 3.9 `chi-siamo.html` LOGO `<picture>` SOURCE USES `.png` AS WEBP
**File:** `chi-siamo.html` — line 121

Same issue as 1.4 but additionally, the chi-siamo page and several other secondary pages do **not** have the social-feed-modern CSS or Weby mobile fix CSS loaded, which is correct (not needed). However, they also lack `<noscript>` fallbacks for Google Fonts (unlike `index.html`), which means fonts won't load for users with JS disabled.

**Fix:** Add `<noscript>` Google Fonts fallback to all secondary pages.

---

### 3.10 NEWSLETTER FORM ON INDEX.HTML USES WEB3FORMS (Not Brevo)
**File:** `index.html` — line 1027

The newsletter signup form on the homepage submits to `https://api.web3forms.com/submit` instead of using the `/api/newsletter` Brevo endpoint built in `server.js`. This means:
- Newsletter signups from the homepage go through Web3Forms (email forwarding), NOT Brevo (mailing list)
- The subscriber doesn't get added to the Brevo mailing list
- The cron newsletter system won't reach them

**Fix:** The newsletter form should call the `/api/newsletter` endpoint via fetch (like the contact form does for newsletter consent), OR integrate Brevo subscription into the Web3Forms submission callback.

---

### 3.11 `globe.js` LOADED AS `type="module"` WITHOUT MINIFIED VERSION
**File:** `index.html` — line 1265

```html
<script type="module" src="js/globe.js"></script>
```

All other JS files use `.min.js` versions, but `globe.js` is loaded unminified. The build system creates `globe.min.js` but it's not used here.

**Fix:** Change to `src="js/globe.min.js"`.

---

### 3.12 BLOG ARTICLES MISSING COOKIE CONSENT BANNER MARKUP
**Files:** All 20 generated blog article HTML files

Blog articles load `js/main.min.js` which contains the cookie consent logic, but the articles don't include the cookie banner HTML markup (`<div class="cookie-banner" id="cookieBanner">`). The JS looks for `#cookieBanner` and silently fails if not found. Users navigating to blog articles directly (from Google) never see the consent banner.

**Fix:** Add cookie banner markup to the blog article template in `build-articles.js` (before `</body>`), then regenerate all articles.

---

### 3.13 BLOG INDEX MISSING COOKIE CONSENT BANNER MARKUP
**File:** `blog/index.html`

Same issue as 3.12 — the blog index page loads the JS but has no cookie banner HTML.

**Fix:** Add cookie banner markup to `blog/index.html`.

---

## 4. LOW SEVERITY ISSUES

### 4.1 HOMEPAGE HERO `<canvas>` HAS `display:none`
**File:** `index.html` — line 142

```html
<canvas id="particlesCanvas" style="display:none"></canvas>
```

The particle canvas is hidden by inline style, but `js/main.js` (line 276) checks for the canvas element and creates particle animations. The animation runs but is invisible. This wastes CPU cycles.

**Fix:** Either remove the `style="display:none"` to show particles, or remove the canvas element entirely and skip the particle animation code.

---

### 4.2 `newsletter-template.html` USES MS OFFICE CSS PROPERTIES
**File:** `newsletter-template.html` — line 21

```css
mso-table-lspace: 0pt;
mso-table-rspace: 0pt;
```

These are Microsoft Outlook-specific CSS properties, which is **correct** for email templates. The lint warnings are false positives. **No action needed** — document this as expected.

---

### 4.3 SOCIAL FEED STATS COUNTER AUTO-INCREMENT
**File:** `js/main.js` — lines 748-766

The social feed stats (likes, comments) auto-increment with `setInterval` every 3-6 seconds. This creates artificially inflating numbers that never stop, which could appear deceptive to users who watch the feed for extended periods.

**Recommendation:** Cap the increments or remove the auto-increment.

---

### 4.4 COPYRIGHT YEAR SCRIPT INLINE IN FOOTER
**Files:** All pages

```html
<p>&copy; <span id="copyrightYear">2026</span> WebNovis.</p>
<script>document.getElementById('copyrightYear').textContent=new Date().getFullYear();</script>
```

This is fine functionally, but having an inline `<script>` in the footer on every page is suboptimal. Could be moved into `main.js`.

---

### 4.5 PORTFOLIO DETAIL PAGES USE DIFFERENT FONT STACKS
**Files:** Portfolio detail pages vs. rest of site

Portfolio detail pages load `Manrope` + `Syne` fonts, while the rest of the site uses `Inter` + `Space Grotesk` + `Syne`. This is intentional (portfolio showcases are design demos), but creates additional font download overhead if a user navigates from the main site to a portfolio page.

**No action needed** if intentional.

---

### 4.6 `server.js` — NEWSLETTER CRON CHECKS EVERY 5 MINUTES
**File:** `server.js` — line 523

```javascript
}, 5 * 60 * 1000); // Controlla ogni 5 minuti
```

The comment above says "controlla ogni ora" but the interval is 5 minutes. This is harmless but the comment is misleading.

**Fix:** Update comment to match actual interval.

---

### 4.7 HOMEPAGE `og:description` DIFFERS FROM `<meta name="description">`
**File:** `index.html`

- `<meta name="description">`: "Web Novis è un'agenzia web a Milano (Rho) specializzata in sviluppo siti, grafica, brand identity e social media. Preventivo gratuito — contattaci oggi."
- `og:description`: "Sviluppo siti web, app mobile, grafica professionale, loghi, stamperia, social media management, photo editing e servizi fotografici. Accendi la scintilla che illumina la tua visibilità."

The OG description mentions "stamperia", "photo editing", "servizi fotografici" which are NOT listed as services anywhere else on the site. It also uses the old branding language.

**Fix:** Align `og:description` with the primary `<meta name="description">`.

---

### 4.8 `contatti.html` FORM HONEYPOT MISSING `autocomplete="off"`
**Files:** `index.html`, `contatti.html`

The botcheck honeypot fields use `style="display:none"` but lack `autocomplete="off"`. Some browsers' autofill could fill hidden fields, causing legitimate submissions to be flagged as bots.

**Fix:** Add `autocomplete="off"` to all honeypot inputs.

---

### 4.9 `chi-siamo.html` — TESTIMONIAL IMAGE FALLBACK MISMATCH
**File:** `chi-siamo.html` — line 266

```html
<picture>
  <source srcset="Img/mikuna.webp" type="image/webp">
  <img src="Img/mikuna.png" alt="Mikuna Italia" width="44" height="44">
</picture>
```

The fallback `<img>` references `Img/mikuna.png` but only `Img/mikuna.webp` exists on disk. Users with browsers that don't support WebP will get a 404.

**Fix:** Generate PNG fallbacks OR remove the `<picture>` wrapper and use the `.webp` directly (supported by all modern browsers).

---

### 4.10 ROBOTS.TXT DOLLAR SIGN PATTERNS
**File:** `robots.txt` — lines 22-23, 26

```
Disallow: /*.bat$
Disallow: /*.md$
Disallow: /*.log$
```

The `$` end-of-URL anchor is only supported by Google. Other crawlers (Bing, etc.) may not interpret it correctly. Additionally, `.md` files like `docs/seo-strategy/SEO-GEO.MD` and `docs/seo-strategy/DIRECTORY-LISTINGS.md` won't be blocked from non-Google crawlers.

**Fix:** Consider using `.htaccess` or server-level blocking for sensitive file types, or accept that only Google respects the `$` anchor.

---

## 5. CROSS-FILE DEPENDENCY MAP

### Navigation Consistency ✅
All pages share the same nav structure: `Servizi | Portfolio | Chi Siamo | Blog | Contatti | Inizia Ora`. Verified across: index.html, chi-siamo.html, contatti.html, portfolio.html, 3 service pages, blog index, 20 blog articles.

### Footer Consistency ✅
All pages share identical footer structure with correct links to legal pages.

### GA4 Consent Gating ✅ (except portfolio detail pages)
Verified identical consent-gated GA4 bootstrap on: index.html, chi-siamo.html, contatti.html, portfolio.html, cookie-policy.html, privacy-policy.html, termini-condizioni.html, 3 service pages, blog index, 20 blog articles.
**Missing on:** 6 portfolio detail pages.

### Cookie Banner Markup ⚠️
Present on: index.html, chi-siamo.html, contatti.html (assumed from main.js logic), portfolio.html, service pages.
**Missing on:** Blog index, 20 blog articles, 6 portfolio detail pages.

### `rel="noopener noreferrer"` on `target="_blank"` ✅
Verified: zero instances of `target="_blank"` without `rel` attributes across all HTML files.

### Pricing Data Matrix

| Source | Landing Page | Sito Vetrina | E-Commerce | Social Start | Social Pro |
|--------|-------------|-------------|------------|-------------|-----------|
| sviluppo-web.html | €500 | €1.200 | €3.500 | — | — |
| social-media.html | — | — | — | €300/m | €600/m |
| server.js (fallback) | €500 | €1.200 | €3.500 | €300/m | €600/m |
| chat.js (fallback) | €500 | €1.200 | €3.500 | €300/m | €600/m |
| **index.html FAQ** | **€700** ❌ | €1.200 | **€2.500** ❌ | — | — |
| **index.html JSON-LD** | **€700** ❌ | €1.200 | **€2.500** ❌ | — | — |
| blog articles | €500 | €1.200 | €3.500 | — | — |

---

## 6. SUMMARY STATISTICS

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| SEO | 1 | 2 | 2 | 2 |
| Security | 1 | 2 | 0 | 0 |
| Performance | 1 | 1 | 4 | 2 |
| Accessibility | 0 | 1 | 0 | 0 |
| Data Integrity | 1 | 0 | 1 | 0 |
| GDPR/Compliance | 1 | 0 | 2 | 0 |
| Code Quality | 0 | 1 | 4 | 3 |
| **TOTAL** | **4** | **7** | **13** | **7** |

---

## 7. RECOMMENDED IMPLEMENTATION ORDER

### Phase 1 — Critical (Do First)
1. Fix pricing inconsistency in `index.html` FAQ + JSON-LD (1.1)
2. Add GA4 consent + cookie banner to portfolio detail pages (1.2)
3. Fix `<picture>` WebP type mismatch across all files + blog template (1.4)
4. Add portfolio detail pages to sitemap (1.3)

### Phase 2 — High Priority
5. Fix sitemap image extensions .png → .webp (2.5)
6. Create `manifest.json` (2.3)
7. Fix `og:description` on index.html (4.7)
8. Fix HTML semantics: `<nav>` outside `<main>` (2.2)
9. Add `meta robots` to portfolio detail pages (2.4)
10. Fix XSS in unsubscribe endpoint (2.8)
11. Sanitize newsletter error responses (2.7)
12. Remove dead `file portfolio` route from server.js (2.6)

### Phase 3 — Medium Priority
13. Add cookie banner markup to blog template + index, regenerate (3.12, 3.13)
14. Fix newsletter form to use Brevo endpoint (3.10)
15. Align cache-busting versions across all pages (3.8)
16. Fix `globe.js` → `globe.min.js` (3.11)
17. Consolidate scroll listeners in main.js (3.3)
18. Remove duplicate highlightNav listener (3.2)
19. Scope ripple effect to buttons only (3.4)
20. Decide `#contatti` anchor vs `contatti.html` strategy (2.1)

### Phase 4 — Polish
21. Remove dead FPS monitor code (3.5)
22. Remove commented-out contextmenu prevention (3.6)
23. Fix keyboard shortcut hijacking (3.7)
24. Fix canvas display:none or remove (4.1)
25. Add autocomplete="off" to honeypot fields (4.8)
26. Fix PNG fallback for mikuna testimonial image (4.9)
27. Fix cron interval comment (4.6)
28. Run `node build.js` after all JS/CSS changes
29. Run `node blog/build-articles.js` after template changes

---

*END OF AUDIT REPORT*
