---
kind: external_dependency
name: Cloudflare Workers — runtime for AI worker and forms worker
slug: cloudflare-workers
category: external_dependency
category_hints:
    - vendor_identity
    - client_constraint
scope:
    - '**'
---

Edge runtime used to deploy two Workers projects: `webnovis-ai` (AI assistant endpoint) and `webnovis-forms` (form handling). Deployed via Wrangler (`npx wrangler deploy -c workers/<name>/wrangler.jsonc`). Site itself is also published through the same `deploy:site:dry` / `deploy:site` flow, indicating a Cloudflare-based hosting strategy alongside GitHub Pages / Vercel / Netlify options documented in README.