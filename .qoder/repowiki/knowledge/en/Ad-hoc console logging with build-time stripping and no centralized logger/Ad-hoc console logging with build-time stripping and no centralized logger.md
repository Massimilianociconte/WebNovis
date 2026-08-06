---
kind: logging_system
name: Ad-hoc console logging with build-time stripping and no centralized logger
category: logging_system
scope:
    - '**'
source_files:
    - workers/webnovis-ai/src/index.js
    - workers/webnovis-forms/src/index.js
    - build.js
---

## What system/approach is used

The repository has **no centralized logging framework or library**. Logging is ad-hoc, using Node.js `console.log` / `console.error` directly at call sites. There is no logger abstraction, no structured log object shape, no log-level configuration, and no sink (file, remote collector, etc.) — output goes to standard error/stdout only.

For the Cloudflare Workers runtime (`workers/webnovis-ai/src/index.js`, `workers/webnovis-forms/src/index.js`), `console.error` is used for error paths; there are no `console.log` calls in the form worker. The AI chat worker logs errors via `console.error('chat error' | 'search-ai error' | 'brevo lead error' | 'worker error', err.message)` inside `try/catch` blocks around Gemini calls, rate-limiting, and email forwarding.

Build scripts use a tiny local helper: `build.js` defines a `log(level, message)` function that wraps `console.log(`[${level}] ${message}`)` and is used throughout the pipeline with levels like `INFO`, `OK`, `WARN`, `ERR`, `SKIP`. Other top-level scripts (`generate-sitemap.js`, `build-search-index.js`, `indexnow-submit.js`) use bare `console.log`/`console.error` without a shared helper.

## Key files and packages

- `workers/webnovis-ai/src/index.js` — only production-facing code with `console.error` calls for runtime failures (Gemini API errors, Brevo email send failures, generic worker catch-all).
- `workers/webnovis-forms/src/index.js` — intentionally **no logging**; failures return JSON error responses without emitting to stderr.
- `build.js` — central build script with a local `log(level, message)` wrapper around `console.log`; also configures Terser to strip console output from client JS bundles.
- Top-level scripts (`generate-sitemap.js`, `build-search-index.js`, `indexnow-submit.js`, `blog/auto-writer.js`, `newsletter-engine.js`) — each uses its own inline `console.log`/`console.error` calls.

## Architecture and conventions

1. **No logger module exists.** Each file that needs diagnostics writes directly to `console`. There is no `require('winston')`, `pino`, `bunyan`, `@cloudflare/logging`, or similar dependency anywhere in `package.json`.
2. **Workers rely on platform logs.** Cloudflare Workers emit `console.error` to the platform's built-in logs (viewable in the Cloudflare dashboard). Errors are not forwarded to an external sink.
3. **Build scripts use a simple level-tagged format.** `build.js` emits lines like `[INFO] Build started`, `[OK] ...`, `[WARN] ...`, `[ERR] ...`, which makes grep-friendly CI output but is not a structured log format.
4. **Client-side console calls are stripped at build time.** `build.js` passes `drop_console: true` plus `pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']` to Terser, so any `console.*` calls in bundled frontend JS (`js/main.js`, `js/chat.js`, etc.) are removed from the published artifacts.
5. **Structured fields do not exist.** Log messages are plain strings or short two-argument calls like `console.error('chat error', err.message)`. There is no consistent set of fields (e.g., `service`, `traceId`, `ip`, `endpoint`) attached to every log line.
6. **Error handling pattern in workers:** wrap risky operations in `try/catch`, `console.error` the error message, then return a safe JSON fallback response rather than propagating the exception to the caller.

## Conventions and constraints observed

- **Production runtime logging is minimal and error-only.** Only the AI chat worker emits `console.error` on failure paths; successful requests produce no log output. The form worker produces no logs at all.
- **Build-time console stripping is enforced by Terser config** in `build.js` (`drop_console: true`, `pure_funcs` list, `DEBUG: false` global def), guaranteeing that client bundles shipped to browsers contain no console calls.
- **There is no log-level strategy beyond the informal INFO/OK/WARN/ERR tags** used by the build script's local `log()` helper; this does not apply to runtime code.
- **No log rotation, retention policy, or external sink** is configured anywhere in the repo. Logs live only in the process stdout/stderr stream (Cloudflare platform logs for Workers, terminal output for build scripts).
- **IPs are anonymized before being stored** (in KV leads, not in logs): `anonymizeIp(clientIp(request))` is used when persisting lead data, showing a privacy-conscious approach that is not mirrored in the `console.error` lines themselves.