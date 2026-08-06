---
kind: external_dependency
name: Google Gemini API — optional AI backend for chatbot, search, auto blog writer, pSEO content generation
slug: google-gemini-api
category: external_dependency
category_hints:
    - vendor_identity
    - auth_protocol
scope:
    - '**'
---

Optional Node.js backend integration used in four isolated roles: (1) chatbot responses via `GEMINI_API_KEY_CHAT`, (2) search bar AI via `GEMINI_API_KEY_SEARCH`, (3) nightly auto blog writer via `GEMINI_API_KEY_WRITER`, (4) batch pSEO content generation via two round-robin keys `GEMINI_API_KEY_PSEO` / `GEMINI_API_KEY_PSEO_2`. Keys are created at https://aistudio.google.com/apikey; each key must belong to a separate Google project to obtain independent free-tier quotas. When deployed as pure static (GitHub Pages / Vercel / Netlify) these endpoints are disabled by design — only HTML/CSS/JS are served.