---
kind: error_handling
name: Error Handling in Static Site & Cloudflare Workers Monorepo
category: error_handling
scope:
    - '**'
source_files:
    - workers/webnovis-ai/src/index.js
    - workers/webnovis-forms/src/index.js
    - blog/auto-writer.js
    - scripts/generate-ai-content.js
    - 404.html
---

## Error Handling System Overview

This WebNovis monorepo implements a multi-layered error handling strategy across three distinct execution environments: Node.js build scripts, Cloudflare Workers (runtime), and static HTML pages. Each layer follows consistent patterns appropriate to its environment.

### Cloudflare Workers Error Handling

The workers (`workers/webnovis-ai/src/index.js`, `workers/webnovis-forms/src/index.js`) implement structured error responses with HTTP status codes and JSON payloads:

**AI Worker Pattern:**
- Centralized `json()` helper returns standardized `{error, message}` responses with proper CORS headers
- Rate limiting errors return 429 with retry guidance
- API failures use retryable flags for automatic fallback between Gemini models
- Global try/catch wrapper in the main `fetch()` handler converts unhandled exceptions to 500 responses
- External service calls (Gemini, Brevo email) use individual try/catch blocks with graceful degradation

**Form Proxy Pattern:**
- Input validation returns specific error codes (`turnstile_token_invalid`, `turnstile_hostnames_missing`)
- Upstream failures distinguish between network errors (502) and business logic failures (403)
- Honeypot fields silently accept bot submissions as success

### Node.js Build Scripts Error Handling

Build scripts (`scripts/*.js`, `blog/auto-writer.js`) follow a consistent pattern:
- **Structured logging**: `log()` and `logError()` functions with timestamps and emoji indicators
- **Fail-fast validation**: Early parameter checks with descriptive `throw new Error()` messages
- **API resilience**: Retry logic with exponential backoff and key rotation for rate-limited requests
- **Graceful degradation**: Fallback providers (Gemini → Groq) when primary AI services fail
- **Process exit codes**: Non-zero exits for fatal configuration errors

### Static Frontend Error Handling

The 404 page (`404.html`) demonstrates client-side error handling:
- Form submission errors fall back to mailto links with pre-filled subject/body
- Analytics events track error page engagement without blocking user flow
- Graceful handling of missing external dependencies (localStorage, analytics scripts)

### Key Conventions Observed

1. **HTTP Status Codes**: Consistent use of 400 (validation), 403 (auth/CAPTCHA), 404 (not found), 429 (rate limit), 500/502 (server errors)
2. **JSON Error Structure**: All API errors return objects with `error` or `message` fields
3. **CORS Headers**: Every worker response includes proper CORS headers via helper functions
4. **Fallback Chains**: Critical operations have built-in fallbacks (AI models, upstream services)
5. **Logging Strategy**: Structured console output with severity indicators and timestamps
6. **Rate Limiting**: KV-backed rate limiting with configurable windows and limits
7. **Input Sanitization**: All user input is sanitized before processing or storage

### Error Propagation Patterns

- **Workers**: Errors bubble up to global catch handlers that standardize responses
- **Scripts**: Errors propagate to process-level handlers with meaningful exit codes
- **Frontend**: Errors are caught locally and converted to user-friendly messages
- **External Dependencies**: Network failures are wrapped with context and logged but don't crash the application

The system prioritizes user experience over technical precision, ensuring that failures are handled gracefully while maintaining audit trails through structured logging.