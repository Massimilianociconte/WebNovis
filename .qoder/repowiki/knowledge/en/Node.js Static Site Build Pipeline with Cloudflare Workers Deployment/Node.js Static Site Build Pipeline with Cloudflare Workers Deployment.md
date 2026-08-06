---
kind: build_system
name: Node.js Static Site Build Pipeline with Cloudflare Workers Deployment
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - build.js
    - wrangler.jsonc
    - scripts/prepare-public-artifact.js
    - .github/workflows/quality-gate.yml
    - .github/workflows/daily-blog.yml
    - .github/workflows/lighthouse-ci.yml
    - .github/workflows/weekly-pseo.yml
    - lighthouserc.js
---

## Build System Overview

This repository uses a Node.js-driven static site generation pipeline that produces a geo-targeted marketing site (~80 city pages) plus Cloudflare Workers, deployed to Cloudflare Pages via Wrangler. There is no Makefile or Dockerfile — the entire build is orchestrated through `package.json` scripts and custom Node.js build scripts.

## Core Build Scripts

**Primary entry point:** `build.js` — minifies JS (Terser), CSS (LightningCSS with CleanCSS fallback), and HTML (html-minifier-terser). It auto-discovers assets referenced by generated HTML files and writes `.min.js` / `.min.css` outputs next to sources. HTML minification only applies to `src/html/` templates; geo-generated pages are not touched.

**Public artifact preparation:** `scripts/prepare-public-artifact.js` — the canonical dist builder. It stages a clean `dist/` tree by copying only whitelisted root files (`PUBLIC_HTML_ROOT_FILES`, `PUBLIC_TECHNICAL_FILES`), blog/portfolio `.html` files, media under `Img/` and `fonts/` filtered by allowlisted extensions, and per-site verification tokens matching `[a-f0-9]{32}.txt`. It prunes unreferenced media/fonts via asset closure analysis, writes an `.assetsignore` for Workers, and atomically promotes the staging directory to `dist/`.

**Geo page generation:** `scripts/generate-all-geo.js` (invoked via `npm run build:geo`) generates the ~80 city landing pages from centralized data in `data/` and `config/`, with `--dry-run` and `--validate-only` modes.

**Supporting generators:**
- `generate-sitemap.js` — builds `sitemap.xml`
- `build-search-index.js` — builds search index JSON
- `scripts/generate-llms-index.js` / `scripts/generate-llms-full.js` — LLM-facing exports
- `scripts/normalize-public-html.js` — post-processes public HTML
- `scripts/update-footer.js` — updates footer widgets across all pages
- `scripts/fetch-city-avatars.js` — downloads city avatar images
- `scripts/apply-blog-cluster-links.js` — links related blog articles

## CI/CD Pipelines (GitHub Actions)

Four workflows live under `.github/workflows/`:

1. **quality-gate.yml** — Runs on push to `main` and PRs. Installs deps with `npm ci`, executes `npm run ci:quality:dist` (which chains `build:site:dist → verify:artifact → test:regressions → test:seo-smoke → test:api`), asserts no tracked-source mutations via `git diff --exit-code`, uploads `dist/` as an artifact, and runs `verify:prod-headers` on non-PR pushes to check production security headers.

2. **daily-blog.yml** — Manually triggered workflow (cron commented out due to Google scaled content abuse policy) that runs `blog/auto-writer.js` with Gemini/Groq API keys to generate Italian SEO blog articles, then commits them back to the repo so they pass the quality gate.

3. **lighthouse-ci.yml** — Runs Lighthouse audits against the published site URLs defined in `lighthouserc.js` with thresholds: performance ≥ 0.85 (warn), SEO ≥ 0.90 (error), accessibility ≥ 0.85 (warn).

4. **weekly-pseo.yml** — Weekly pSEO governance checks.

All workflows use Node.js 20 on `ubuntu-latest`.

## Deployment Model

**Cloudflare Pages:** `wrangler.jsonc` configures the project name `webnovis`, sets `assets.directory = "dist"`, and critically sets `html_handling: "none"` to preserve `.html` URL paths (matching GitHub Pages behavior and existing Google indices). The comment documents the deploy flow: `npm run build:site:dist && npx wrangler deploy`, with dry-run via `deploy:workers:check`.

**Workers deployment:** Separate Wrangler configs under `workers/webnovis-ai/wrangler.jsonc` and `workers/webnovis-forms/wrangler.jsonc`, invoked via `npm run ai:deploy` and `npm run forms:deploy`.

## Versioning & Reproducibility

- No semantic versioning of the site itself; `package.json` version is `1.0.0`.
- `SOURCE_DATE_EPOCH` is resolved from git log timestamp (or env override) during artifact preparation to enable reproducible builds.
- `compatibility_date` in `wrangler.jsonc` is pinned to `2026-06-09`.
- Lockfiles exist (`pnpm-lock.yaml`, `package-lock.json`); CI uses `npm ci`.

## Quality Gates & Validation

- `test:regressions` runs a large suite of Vitest regression tests covering image loading, geo generation, HTML structure, robots policy, editorial language, FAQ schema, widget loaders, security/legal, build pipeline, public artifacts, security headers, SEO, priority content, entity claims, LLMs export, internal linking, pSEO governance, LCP hero, audit/a11y.
- `validate:pages` / `validate:pages:all` validates generated pages.
- `verify:artifact` ensures the built `dist/` is self-contained.
- `verify:prod-headers` checks production security headers (CSP, Permissions-Policy).
- `ci:quality` orchestrates the full pre-deploy pipeline.

## Conventions

- All build output goes into `dist/`; source tree is never mutated by the build.
- Asset discovery is automatic: the build scans generated HTML for `<script src>` and `<link rel="stylesheet">` references to determine which JS/CSS to minify.
- CSS prefers LightningCSS with a safe CleanCSS fallback; level-2 transforms are disabled in fallback mode to avoid risky reordering.
- JS minification strips `console.*` calls, debuggers, dead code, and unused variables via Terser passes.
- Only `src/html/` templates are minified as HTML; geo-generated pages bypass HTML minification.
- Public artifact assembly is strictly allowlist-based — nothing outside the configured lists is copied into `dist/`.