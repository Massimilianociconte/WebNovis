---
kind: dependency_management
name: Node.js Monorepo Dependency Management via pnpm with Cloudflare Workers
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-lock.yaml
    - workers/webnovis-ai/wrangler.jsonc
    - workers/webnovis-forms/wrangler.jsonc
    - .env.example
---

## System Overview

This repository is a Node.js monorepo that builds a static marketing site and deploys two Cloudflare Workers (AI chat and form proxy). Dependencies are managed through **pnpm** as the package manager, with a single root `package.json` declaring both runtime and build-time dependencies for the entire project.

## Key Files

- `package.json` — Single source of truth for all project dependencies. Declares runtime deps (`express`, `compression`, `cors`, `dotenv`, `node-fetch`, `nunjucks`) and dev deps (`wrangler`, `vitest`, `sharp`, `terser`, `knip`, `clean-css`, `html-minifier-terser`, `lightningcss`, `nodemon`, `parse5`, `web-vitals`).
- `pnpm-lock.yaml` — Deterministic lockfile (lockfileVersion 9.0) pinning every transitive dependency with integrity hashes; committed to version control.
- `workers/webnovis-ai/wrangler.jsonc` — Cloudflare Worker config for the AI chat worker, pinned to compatibility date `2026-07-28` with `nodejs_compat` flag.
- `workers/webnovis-forms/wrangler.jsonc` — Cloudflare Worker config for the forms proxy, also pinned to `2026-07-28`; secrets are managed via `wrangler secret put` (documented in comments).
- `.env.example` — Template for environment variables consumed at runtime by workers and scripts.
- `wrangler.jsonc` (root-level) — Present alongside the workers sub-configs; used by `npx wrangler deploy` invoked from npm scripts.

## Architecture and Conventions

### Single-root dependency graph
All dependencies — including those needed only by Cloudflare Workers — are declared in the root `package.json`. There are no per-worker `package.json` files; the two workers under `workers/` share the same dependency set resolved from the root lockfile. This keeps the monorepo flat and avoids duplication.

### Versioning strategy
Dependencies use caret ranges (`^x.y.z`) in `package.json`, allowing minor/patch updates while blocking major bumps. The lockfile then pins exact versions (e.g., `express@4.22.1`, `wrangler@4.115.0`, `sharp@0.34.5`). This gives reproducible installs while retaining flexibility for safe upgrades.

### Lockfile-first workflow
The presence of `pnpm-lock.yaml` indicates a lockfile-first approach: developers should install via `pnpm install` so the exact tree recorded in the lockfile is reproduced. The CI quality gate runs `npm run ci:quality` which executes the full build pipeline, relying on the locked dependency tree.

### Wrangler as a devDependency
`wrangler` is listed in `devDependencies` and invoked via `npx wrangler` from npm scripts (`deploy:site`, `ai:deploy`, `forms:deploy`, `ai:dev`, etc.). This means the Cloudflare CLI is installed locally per project rather than globally, keeping deployments reproducible across environments.

### Secrets management
Worker secrets (e.g., `TURNSTILE_SECRET`, optional `WEB3FORMS_ACCESS_KEY`) are not stored in code. They are injected via `wrangler secret put` before deployment, as documented in the worker config comments. Runtime configuration values that are not secrets (e.g., `TURNSTILE_HOSTNAMES`, `WEB3FORMS_ENDPOINT`) are passed through `vars` in `wrangler.jsonc`.

### No vendoring or private registry
There is no `vendor/` directory, no `.npmrc`/`.pnp*` private registry configuration, and no `GOPRIVATE` equivalents. All packages are pulled from the public npm registry. The `node_modules/` directory exists but is gitignored.

### Build-time vs runtime separation
Runtime server dependencies (`express`, `compression`, `cors`, `dotenv`, `node-fetch`, `nunjucks`) are split from build tooling (`wrangler`, `vitest`, `sharp`, `terser`, `knip`, `clean-css`, `html-minifier-terser`, `lightningcss`, `nodemon`, `parse5`, `web-vitals`). Scripts like `build`, `build:geo`, `build:search-index`, `generate-sitemap`, and the blog/article generators run against these dev-only tools during the build phase.

## Conventions and Constraints

- **Single lockfile**: The project uses one `pnpm-lock.yaml` at the repo root; there are no per-package lockfiles.
- **Carets for semver ranges**: All dependency specifiers in `package.json` use `^` ranges, not exact pins, delegating exact resolution to the lockfile.
- **Wrangler pinned by compatibility date**: Each worker's `wrangler.jsonc` sets an explicit `compatibility_date` (`2026-07-28`) to freeze the Workers runtime behavior independently of the npm package version.
- **Secrets out of VCS**: Secrets are explicitly documented as being set via `wrangler secret put` and never committed; only their names appear as comments in `wrangler.jsonc`.
- **CI-driven verification**: The `ci:quality` script chains build, normalize, search-index generation, page validation, regression tests, smoke tests, and API tests — ensuring the locked dependency tree produces a valid artifact before any deployment step.
- **No Go modules**: There is no `go.mod` / `go.sum`; this category applies only to the Node.js/pnpm surface.