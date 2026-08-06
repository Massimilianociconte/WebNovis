---
kind: configuration_system
name: Configuration System — Env-driven Build & Runtime Config
category: configuration_system
scope:
    - '**'
source_files:
    - .env.example
    - ai-config.js
    - config/publish-targets.js
    - config/build-date.js
    - config/security-headers.js
    - wrangler.jsonc
    - server.js
    - package.json
---

## What system/approach is used
The project uses a **Node.js + dotenv-based configuration system** with three layers:
- **Environment variables** (`.env` / `.env.example`) for secrets and runtime toggles, loaded via `require('dotenv').config()` at process start.
- **JavaScript config modules** under `config/` that export plain objects consumed by build scripts and the Express server.
- **Wrangler JSONC** (`wrangler.jsonc`, plus per-worker configs) for Cloudflare Workers/Pages deployment settings.

There is no centralized config loader; each script or module loads what it needs directly from `process.env` or requires its own config file.

## Key files and packages
- `.env.example` — master template of all required environment variables (Gemini keys, Brevo, Groq, IndexNow, CORS, production URL).
- `ai-config.js` — shared AI model names, temperatures, token limits, and fallback behavior consumed by `server.js` and blog writer.
- `config/publish-targets.js` — resolves `--out-dir=` CLI args and `PUBLISH_DIR`/`REPORT_DIR` env vars to compute source/publish/report roots.
- `config/build-date.js` — deterministic build timestamps via `SOURCE_DATE_EPOCH` or `BUILD_DATE` env vars.
- `config/security-headers.js` — CSP directives, static security headers, and `_headers` file generator; also parses `CORS_ORIGINS` from env.
- `wrangler.jsonc` — Cloudflare Workers assets config (`html_handling: "none"`, `directory: "dist"`).
- `package.json` scripts — entry points that wire env/config into the build pipeline (`build`, `build:site:dist`, `deploy:site`, `ai:*`, `forms:*`).
- `server.js` — Express runtime that loads `.env`, applies rate limiting, security headers, and reads all API keys from `process.env`.

## Architecture and conventions
1. **Env-first, code-second**: Secrets and external service credentials live exclusively in `.env`; defaults are never hardcoded except as safe fallbacks (e.g., `NEWSLETTER_ADMIN_SECRET` default string triggers an error if not overridden).
2. **Per-feature env groups**: Keys are grouped by purpose — `GEMINI_API_KEY_CHAT`, `GEMINI_API_KEY_SEARCH`, `GEMINI_API_KEY_WRITER`, `GEMINI_API_KEY_PSEO`/`PSEO_2`, `BREVO_*`, `GROQ_API_KEY`, `INDEXNOW_KEY`, `PORT`, `PRODUCTION_SITE_URL`, `CORS_ORIGINS`.
3. **Config modules are pure JS**: Each `config/*.js` exports functions/constants; they read `process.env` internally rather than being passed arguments, keeping consumers simple.
4. **CLI overrides for build output**: `--out-dir=` and `--report-dir=` flags override `PUBLISH_DIR` and `REPORT_DIR` env vars, giving CI/local parity.
5. **Deterministic builds**: `SOURCE_DATE_EPOCH` (POSIX seconds) takes precedence over `BUILD_DATE` (ISO date string) for reproducible artifacts.
6. **Security header generation**: `npm run sync:headers` regenerates `_headers` from `config/security-headers.js`, ensuring platform header files stay in sync with code.
7. **Workers config separation**: Site assets use root `wrangler.jsonc`; AI chat and form workers have their own `workers/webnovis-ai/wrangler.jsonc` and `workers/webnovis-forms/wrangler.jsonc`, deployed via separate npm scripts.

## Conventions and constraints
- **Every external API key must be set in `.env`**; missing keys cause explicit errors (e.g., `NEWSLETTER_ADMIN_SECRET` default value is rejected).
- **Production enforces rate limiting**: `server.js` exits with code 1 if `express-rate-limit` is not installed when `NODE_ENV=production`.
- **CORS origins merge defaults with env**: `DEFAULT_CORS_ORIGINS` array is combined with comma-separated `CORS_ORIGINS` env var.
- **Build reproducibility**: `SOURCE_DATE_EPOCH` is honored across sitemap generation, build dates, and content timestamps.
- **No global config singleton**: Each module imports only what it needs; there is no single `config.load()` call — this is intentional to keep dependencies explicit.
- **Secrets are never committed**: Only `.env.example` is tracked; actual `.env` is gitignored.