---
kind: frontend_style
name: WebNovis CSS Design System — Token-Driven Dark Theme with Modular Stylesheets
category: frontend_style
scope:
    - '**'
source_files:
    - css/style.css
    - css/leviathan-inspired.css
    - css/nicole-inspired.css
    - css/search.css
    - css/social-feed-modern.css
    - css/portfolio-premium.css
    - css/weby-mobile-fix.css
    - src/html/index.html
    - package.json
---

The WebNovis site uses a hand-authored, token-driven CSS design system built on native CSS custom properties (CSS variables) rather than a framework like Tailwind or Bootstrap. All visual tokens are centralized in `css/style.css` under a single `:root` block that defines color palettes, gradients, typography scales, spacing, border radius, shadows, and animation timings. The theme is dark-first (`--dark: #0a0a0a`, `--white: #faf8f3`) with a brand palette centered on blue/indigo (`--primary: #5B6AAE`, `--electric: #2563EB`) and warm gray text (`--gray-light: #c4b5a0`). Typography tokens declare Syne for display/headings, Inter for body, and JetBrains Mono for code, with fluid sizing via `clamp()` and fallback fonts defined through `@font-face` to prevent CLS.

Styles are split into multiple modular, purpose-specific stylesheets loaded asynchronously via the `media="print" onload="this.media='all'"` pattern for critical rendering path optimization:
- `style.min.css` — core design system, resets, global components, cookie banner, animations
- `revolution.min.css` — base layout/grid utilities
- `leviathan-inspired.min.css` — impact numbers, modern service cards, testimonials, CTA sections inspired by levthn.com
- `nicole-inspired.min.css` — additional component variants
- `social-feed-modern.min.css` — social feed mockup styling
- `search.min.css` — search modal and results UI
- `weby-mobile-fix.min.css` — mobile-specific overrides
- `portfolio-premium.min.css` — portfolio page specific styles

Each stylesheet is preloaded as `as="style" fetchpriority="low"` and only activated when needed. Critical inline CSS in `src/html/index.html` handles LCP-safe elements (hero background, search bar anti-FOUC, nav-toggle) without blocking render.

Fonts are loaded from Google Fonts with `display=optional` and preconnect hints. The build pipeline uses `clean-css` for minification and `lightningcss` for CSS processing. There is no SCSS/Sass preprocessing — raw CSS files are directly minified and versioned with query strings (`?v=20260728c`).

Responsive strategy relies on CSS media queries (breakpoints at 600px, 768px, 900px) combined with fluid typography using `clamp()`. No CSS-in-JS or component libraries are used; all components are plain CSS classes applied directly in HTML templates. The design system enforces consistency through shared CSS variable usage across all modules, ensuring visual coherence across the ~100+ generated city pages.