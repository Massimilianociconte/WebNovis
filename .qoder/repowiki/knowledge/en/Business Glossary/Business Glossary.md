---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### pSEO
- Definition：Programmatic SEO — the practice of generating large volumes of landing pages programmatically (here, ~649 geo-targeted pages plus service-city pages) using templates and data-driven content, rather than hand-writing each page.
- Aliases：programmatic SEO

### geo page
- Definition：A city-targeted landing page generated from the geo generator (`scripts/generate-all-geo.js`) for each Italian municipality served by WebNovis (Arese, Rho, Milano, etc.), each carrying its own meta, JSON-LD Service schema, and localized copy.
- Aliases：pagina geo、city page

### normalize:public-html
- Definition：Build step (`scripts/normalize-public-html.js`) that rewrites asset paths in generated HTML so links resolve correctly regardless of filesystem depth; it walks `src/html/` and rewrites relative `../../js/` / `../../../js/` references to the correct publish-root-relative paths.
- Aliases：HTML normalizer

### audit-seo-a11y-regressions.test.js
- Definition：Fail-closed regression test suite added during the audit that asserts every SEO/accessibility fix remains present in both source (`src/html/`) and built output, preventing future changes from silently reintroducing issues like inline tracking without consent, empty noscript blocks, or broken script paths.
- Aliases：SEO/a11y regression tests

### DesignRush badge noscript
- Definition：A small `<noscript>` block preserving the DesignRush trust badge when JavaScript is disabled; kept intentionally alongside the newly populated noscript stylesheet fallbacks so the badge still renders without JS.
- Aliases：badge noscript

### consent-gated loader
- Definition：The pattern in `js/main.js` that defers loading of GA4, Clarity, and Meta Pixel until the cookie banner grants consent; any inline tracking snippet that bypasses this gate is considered non-compliant and must be removed.
- Aliases：consent flow、cookie consent loader

### static mode / Node mode
- Definition：Two deployment modes defined by the project: *static mode* (GitHub Pages / Vercel / Netlify) serves only HTML/CSS/JS with no `/api/*` endpoints; *Node mode* (Express `server.js`) enables AI chatbot, search, unsubscribe HMAC, security headers, canonical redirects, and newsletter automation.
- Aliases：deployment modes、runtime modes
