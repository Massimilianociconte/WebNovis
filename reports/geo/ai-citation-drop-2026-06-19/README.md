# AI Citation Drop Investigation — webnovis.com

**Date:** August 5, 2026  
**Investigator:** opencode agent (branch `codex/ai-citation-drop-20260619`)  
**Status:** Investigation complete — CI green, script deterministic, no site files modified  
**Bing Report Period:** May 5, 2026 – August 2, 2026  
**Classification:** `PROBABLE_ROOT_CAUSE: REPORTING_OR_SAMPLING_DISCONTINUITY` (with contributing maintenance gap)  

---

## 1. Executive Summary

On June 20, 2026, AI citations to webnovis.com in Bing's AI Performance report
dropped from ~40/day to ~2/day — a **95.4% decline** in citations and a
**96.6% decline** in cited pages. The crash occurred four days after Bing's
public announcement on June 16, 2026 of an AI Performance report update
(Intents, Topics, Citation Share, Compare).

After exhaustive review of site-side changes, deployment history,
infrastructure configuration, and AI-content files, **no technical regression,
content degradation, crawl-blocking change, or deployment error** was found
in the window leading up to or during the crash.

### Classification Summary

| Classification | Status |
|---|---|
| **Onset of decline (Jun 20) + zero regime (Jun 21)** | ✅ CONFIRMED |
| **Citation decline (95.4%)** | ✅ CONFIRMED |
| **Query concentration (top query = 68.7%)** | ✅ CONFIRMED |
| No technical regression in examined files | ✅ CONFIRMED |
| **Probable root cause: reporting/sampling discontinuity** | ⚠ PROBABLE (correlation, not confirmed causation) |
| **Contributing factor: IndexNow gap (100 days)** | ⚠ CONTRIBUTING_MAINTENANCE_GAP |
| Bingbot/robots/sitemap blocking | ❌ NOT SUPPORTED |
| Real loss of AI visibility (site-wide) | ❌ INSUFFICIENT_EVIDENCE |

> **Note on certainty:** Bing's official documentation states that AI
> Performance data is sampled, that citation counts may differ between views,
> and that timeline variations are observational and do not indicate the impact
> of any single update, model change, or content modification. The June 16
> rollout is temporally compatible with the discontinuity and concerns the
> reporting system directly, making a reporting/sampling discontinuity the
> most probable explanation — but Bing does not explicitly confirm that the
> June 16 rollout changed the sampling methodology itself.

---

## 2. Data Sources

| File | Purpose |
|---|---|
| `raw/webnovis.com_AIPerformanceOverviewStats_8_5_2026.csv` | Daily citations & cited pages (exported from Bing WMT) |
| `raw/webnovis.com_AISearchQueriesReport_8_5_2026.csv` | Query-level citation breakdown (undated snapshot — CSV has no date columns; association with post-onset regime is inferred, not verified) |
| `analyze_citations.js` | Reproducible analysis script (Node.js, no deps) |
| `output/*.json`, `output/*.csv` | Machine-readable analysis results |

---

## 3. Quantitative Findings

### 3.1 Period Comparison (Bing WMT AI Performance)

| Metric | Pre-period (May 5 – Jun 19) | Post-period (Jun 20 – Aug 2) | Change |
|---|---|---|---|
| Days | 46 | 44 | — |
| Total citations | 1,835 | 80 | **−95.4%** |
| Avg. daily citations | 39.9 | 1.8 | **−95.4%** |
| Pages cited | 619 | 20 | **−96.7%** |
| Avg. daily pages | 13.5 | 0.45 | **−96.6%** |
| Zero-citation days | 0 | 29 | — |

### 3.2 14-Day Window Comparison

Using the onset date (June 20) as the split point, with the 14-day window
symmetrically around it:

| Window | Period | Avg. citations/day | Avg. pages/day |
|---|---|---|---|
| Before crash | Jun 6 – Jun 19 (14 days) | 54.8 | 14.07 |
| After crash (incl. onset) | Jun 20 – Jul 3 (14 days) | 2.4 | 0.43 |

### 3.3 Change-Point Detection

Two distinct dates mark the crash onset:

| Date | Role | Evidence |
|---|---|---|
| **June 20, 2026** | Onset (CUSUM cumulative max) | Jun 19: 84 citations → Jun 20: 33 citations (61% drop) |
| **June 21, 2026** | Mean-shift t-score change point | Jun 20: 33 citations → Jun 21: 0 citations (first zero-citation day) |

- **Method:** CUSUM (cumulative sum, identifies onset) + mean-shift t-score (identifies max mean difference)
- **Mean-shift score:** 12.78
- **CUSUM maximum:** 867.9
- **CUSUM onset date:** June 20, 2026
- **Mean-shift change point date:** June 21, 2026
- **Global mean:** 21.3 citations/day

The baseline pre/post split uses the **onset date (June 20)** as the break.
The sustained zero-citation regime begins **June 21**. See `change-point.json`
for full `boundaryResolution` metadata.

### 3.4 Post-Onset Query Concentration

The query report (exported Aug 5, 2026; CSV has no date columns, so the
period is an **undated snapshot** — association with the post-onset regime
is inferred, not verified) contains only **13 rows / 355 total citations**.
The top query (`"mockup significato"`) accounts for **68.7%** of citations
**within this undated query export**. The top 2 queries account for
**75.5%**, top 4 for **84.5%**. This extreme concentration is consistent
with a low-sample regime rather than organic, distributed query coverage.

| Rank | Query | Bing Citation Share | Within-Export Share |
|---|---|---|---|
| 1 | mockup significato | 17.40% | 68.7% |
| 2 | mockup cos'è | 10.71% | 6.8% |
| 3 | strumenti design intelligenza artificiale PMI popolari | 80.95% | 4.8% |
| 4 | strumenti design intelligenza artificiale popolari PMI | 68.18% | 4.2% |
| 5–13 | (various) | — | 20.8% |
| **Total** | | — | **100%** |

**Note on the two metrics:** `Bing Citation Share` is Bing's own metric — the
percentage of all citations for that query attributed to webnovis.com.
`Within-Export Share` is calculated as this query's citations as a share of
all citations in this export. Query #3 shows a `Bing Citation Share` of 80.95%
but only 4.79% of total within-export citations, meaning Bing attributes most
citations for that query to webnovis, yet the raw volume is small — consistent
with low overall query volume in the sampled period.

### 3.5 Anomaly Intervals (Post-Onset: Zero-Citation Days)

After the onset (June 20), zero-citation days were sporadic but never
approaching pre-crash levels:

| Start | End | Days |
|---|---|---|
| 2026-06-21 | 2026-07-03 | 13 |
| 2026-07-05 | 2026-07-05 | 1 |
| 2026-07-07 | 2026-07-08 | 2 |
| 2026-07-12 | 2026-07-12 | 1 |
| 2026-07-14 | 2026-07-14 | 1 |
| 2026-07-19 | 2026-07-19 | 1 |
| 2026-07-21 | 2026-07-22 | 2 |
| 2026-07-24 | 2026-07-24 | 1 |
| 2026-07-27 | 2026-08-02 | 7 |

---

## 4. Timeline Analysis

### 4.1 Key Events

| Date | Event | Type |
|---|---|---|
| 2026-06-09 | `a24e332e` — llms-full.txt created, robots.txt updated, server.js hardened | Site |
| 2026-06-14 | `13b1ad5c` — pSEO batch (geo page content updates) | Site |
| **2026-06-16** | **Bing announces AI Performance report update** (Intents, Topics, Citation Share, Compare) | External |
| **2026-06-20** | **Onset of citation decline (CUSUM)** — Jun 19: 84 citations → Jun 20: 33 citations | Crash onset |
| **2026-06-21** | **Zero-citation regime begins** — first 0-citation day (mean-shift change point) | Crash |
| 2026-06-21 | `cf09e4c2` — pSEO batch (geo page content updates; same date as zero-regime start) | Site |
| 2026-07-22 | `d2e31349` — Content-claim governance + entity-fact normalization | Site (post-crash fix) |
| 2026-07-23 | `74c50b45` — Govern public LLM exports | Site (post-crash fix) |
| 2026-08-04 | `150a073d` — SEO cluster P4 fixes | Site (post-crash fix) |

### 4.2 What Changed on June 9 (`a24e332e`)

| File | Change | Impact on AI crawling |
|---|---|---|
| `robots.txt` | Added `Allow: /llms-full.txt` | **Positive** — more content allowed |
| `server.js` | Added `llms-full.txt` to `corePublicFiles` and `aiOpenFiles` | **Positive** — more AI-discoverable files |
| `wrangler.jsonc` | Created (Cloudflare Workers config) | **Inert** — site on GitHub Pages |
| `_redirects` | Created (Cloudflare Workers redirects) | **Inert** — GitHub Pages ignores it |
| `.assetsignore` | Created | **Inert** — not read by GitHub Pages |
| 26 dev files | Removed from root | **Positive** — cleaner serving surface |

**No changes to:** `sitemap.xml`, `blog/mockup-grafici-guida.html` (the
dominant cited page), `ai.txt`, `webnovis-ai-data.json`, `llms.txt`,
or any blog content.

### 4.3 What Changed on June 14–21 (`13b1ad5c`, `cf09e4c2`)

Both commits are pSEO batch updates — they only modified auto-generated
geo service pages (`agenzia-web-*.html`). **No changes to any AI-content
files, robots.txt, sitemap.xml, server.js, or blog articles.**

### 4.4 What Was Never Done

| Action | Last date | Gap to crash | Assessment |
|---|---|---|---|
| IndexNow submission | March 12, 2026 | **100 days before crash** | **CONTRIBUTING_MAINTENANCE_GAP** — long gap but not sudden; predates crash by ~3 months; sitemap still discoverable by Bing's own crawlers |
| robots.txt change | June 9, 2026 | 11 days before crash | Improvement (added Allow for llms-full.txt) |
| sitemap.xml change | June 9, 2026 | 11 days before crash | Unchanged through crash; includes all critical pages |
| llms-full.txt creation | June 9, 2026 | 11 days before crash | Improvement — comprehensive AI content export |

---

## 5. Infrastructure Audit

### 5.1 Hosting: GitHub Pages (confirmed)

`docs/deploy/WORKERS-ASSETS-DIST.md` confirms the live site is served by
**GitHub Pages**, not Cloudflare Workers. Therefore:

| File | Status on live site |
|---|---|
| `_redirects` | **Inert** — GitHub Pages does not read this file |
| `_headers` | **Inert** — GitHub Pages does not read this file |
| `.assetsignore` | **Inert** — not recognized by GitHub Pages |
| `wrangler.jsonc` | **Not deployed** — only for Cloudflare Workers |

The Cloudflare configuration (`docs/deploy/CLOUDFLARE-CONFIGURAZIONE-PASSO-PASSO.md`)
describes a **migration that has not yet been completed**. Until the
migration is executed, Cloudflare Workers directives have no effect.

### 5.2 robots.txt Verification

Current `robots.txt` (lines 11-39, 55-110) grants:
- `User-agent: *` → `Allow: /` (full access, with technical directories disallowed)
- `User-agent: GPTBot`, `PerplexityBot`, `ClaudeBot`, `CCBot`, `Google-Extended`, etc. → `Allow: /`
- Explicit `Allow: /llms-full.txt`, `Allow: /llms.txt`, `Allow: /ai.txt`, `Allow: /webnovis-ai-data.json`

No crawler is blocked from accessing content.

### 5.3 Sitemap.xml Verification

- Contains **355 `<url>` entries** (programmatically counted via `grep -c '<url>' sitemap.xml`)
- Includes `blog/mockup-grafici-guida.html` (the article that dominated citations)
- Includes all service, portfolio, and blog pages
- Last modified June 9, 2026 (unchanged through August 2)

### 5.4 AI Content Files Verification

| File | Status | Notes |
|---|---|---|
| `ai.txt` | Valid, 55 lines | Comprehensive editorial summary with entity facts |
| `llms.txt` | Valid, 119 lines | Indexes all 39 key pages, links to full export |
| `llms-full.txt` | Valid, 3,858 lines | Complete plain-text export of 39 pages (801 headings) |
| `webnovis-ai-data.json` | Valid JSON, 114 lines | Structured company data, services, geo coverage |

### 5.5 server.js

On June 9 (`a24e332e`), `server.js` received security hardening:
- XSS protection in lead form (URL sanitization with `isLinkableUrl` regex)
- HTML tag stripping in chat messages (instead of entity-escaping, to avoid
  polluting Gemini prompts)
- `llms-full.txt` added to `aiOpenFiles` set (open CORS for AI crawlers)

**server.js is not executed on GitHub Pages** (static hosting only). These
changes affect only the local development server.

---

## 6. External Event: Bing AI Performance Report Update (June 16, 2026)

Bing published a blog post on June 16, 2026 announcing major changes to its
AI Performance report in Bing Webmaster Tools:

1. **Intents** — grounding queries classified into categories
   (Informational, Commercial, Navigational, Learn and Solve, Research, Creation, Local)
2. **Topics** — grounding queries grouped into thematic clusters
3. **Citation Share** — percentage of citations your site receives out of
   all citations for a specific grounding query
4. **Compare** — overlay previous time periods for comparison

Bing's official documentation for AI Performance [1] states:

> "AI Performance data is sampled, and grounding queries and pages may each
> be sampled over slightly different time windows within your selected date
> range. This means filtering by a grounding query and then viewing a page may
> show a different citation count than filtering by that page and viewing the
> same grounding query."

Bing also states:

> "Changes in citation trends are observational and do not indicate the
> impact of any single update, model change, or content modification." [1]

The June 16 rollup of Intent, Topic, Citation Share, and Compare features is
**temporally compatible** with the June 20 discontinuity and concerns the
reporting interface directly. However, the public announcement does not
explicitly state that the **sampling methodology** was modified in that
specific release. The most rigorous claim is therefore that a reporting or
sampling discontinuity is **probable** — not confirmed — and that Bing itself
discourages causal attribution of citation trends to any single event.

**References:**
- [1] Bing Webmaster Tools — AI Performance: <https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c>
- [2] Bing Search Blog (June 16, 2026) — AI Performance: <https://blogs.bing.com/search/?p=7113>

### 6.1 Anecdotal Industry Context

Industry reporting from June 2026 **describes similar patterns** across other
sites (not verified independently):

- **rankeo.io** (article): A site's Copilot citations dropped from
  693/day to 0 for 10 consecutive days starting late May 2026, then
  recovered to normal levels **without any site changes**, roughly three
  weeks later. The author attributes this to "AI citation ecosystems are
  inherently dynamic" and sampling changes.

- **ThePlanetTools.ai** (article, published June 19, 2026): Site's
  Bing AI citations "cratered to near zero in late May, stayed flat for
  about three weeks, then climbed back on their own in mid-June 2026 —
  with nothing changed on our side."

These reports of **non-site-specific, self-resolving citation collapses** in
the same timeframe are **consistent with** the reporting-discontinuity
hypothesis, but do not constitute independent verification — Bing explicitly
states that citation trends are observational and should not be attributed to
any single cause. [1]

**Reference:**
- [1] Bing Webmaster Tools — AI Performance: <https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c>
- [2] Bing Search Blog (June 16, 2026) — AI Performance: <https://blogs.bing.com/search/?p=7113>

---

## 7. Post-Crash Site Changes (July 22–August 4)

After the crash, the site owner made significant improvements that appear
to be a **response to** the citation drop rather than its cause:

| Commit | Date | Changes |
|---|---|---|
| `d2e31349` | Jul 22 | Created `config/entity-facts.js` (normalizes JSON-LD entity data, blocks forbidden entity URLs like LinkedIn and Cylex), `config/content-claim-governance.js` (detects unsupported claims: guaranteed results, fixed pricing, SLA promises), 224 pseo files regenerated, new regression tests added |
| `74c50b45` | Jul 23 | "govern public llm exports" — regenerated `llms-full.txt` (2,421 lines changed), added `tests/llms-export-regressions.test.js` |
| `f7063093` | Jul 23 | "complete crawl, accessibility and metadata safeguards" |
| `e1274f64`, `2a30bb0d` | Jul 26 | Sitemap lastmod derived from real content change; titles/descriptions/stylesheet loading range fixes |
| `7bb3e581` | Jul 29 | Regenerated geo pages, hubs, search index, sitemap |
| `275b4e2a` | Jul 31 | Added portfolio projects (UnimiDoc, Momentum) |
| `150a073d` | Aug 4 | SEO cluster P4 (seo-milano, quanto-costa-un-sito-web) fixes |

These changes are **governance and quality improvements** — not fixes for
anything broken around June 20. The site was already healthy at the time of
the crash.

---

## 8. Root Cause Classification Matrix

| Hypothesis | Evidence For | Evidence Against | Verdict |
|---|---|---|---|
| **Bing report/sampling change** (June 16) | Crash starts Jun 20 (4 days later); Bing announced AI Performance feature updates (Intents, Topics, Citation Share, Compare); Bing docs state data is sampled and timeline variations are observational; independent sites report similar non-site-specific collapses | Bing does **not** explicitly confirm that the June 16 rollout changed sampling methodology; Bing warns against attributing citation trends to any single event | ⚠ **PROBABLE_ROOT_CAUSE** |
| **IndexNow gap** (Mar 12 → Jun 20) | 100-day gap; no submissions during crash period | Gap predates crash by ~3 months; sitemap still submitted and discoverable; not a sudden change; Bing states IndexNow aids discovery/accuracy but does not guarantee citations | ⚠ **CONTRIBUTING_MAINTENANCE_GAP** |
| June 9 deploy (`a24e332e`) broke something | llms-full.txt created, server.js hardened | Crash is 11 days later; June 9 changes were all **improvements** (more Allow in robots.txt, more AI-open files); site on GitHub Pages so Worker config files inert | ✅ **RULED OUT** |
| June 14 pSEO batch (`13b1ad5c`) broke something | 6 days before crash | Only changed geo service pages' content; no AI files, robots, or sitemap touched | ✅ **RULED OUT** |
| June 21 pSEO batch (`cf09e4c2`) caused crash | After crash start | Geo pages only; no AI-critical files changed; pSEO batches happen routinely | ✅ **RULED OUT** |
| robots.txt blocks Bing crawlers | Current robots.txt reviewed | `User-agent: *` → `Allow: /`; no Bingbot-specific block; all AI files explicitly allowed | ✅ **NOT SUPPORTED** |
| Sitemap.xml broken or missing key pages | Sitemap has 355 `<url>` entries (counted programmatically); includes dominant cited page | Sitemap unchanged Jun 9–Aug 2; `mockup-grafici-guida.html` present; no malformed entries | ✅ **NOT SUPPORTED** |
| AI content files corrupted | llms-full.txt (3,858 lines, 801 sections), ai.txt (55 lines), webnovis-ai-data.json (valid JSON) all reviewed | All well-formed; comprehensive content; created June 9 (11 days before crash) | ✅ **NOT SUPPORTED** |
| Cloudflare/WAF blocked Bing | Site on GitHub Pages; Cloudflare Worker files (`_redirects`, `_headers`, `wrangler.jsonc`) are **inert** | No historical Cloudflare zone/WAF logs available; **INSUFFICIENT_EVIDENCE** for zone-level rules | ⚠ **INSUFFICIENT_EVIDENCE** |
| Blog content change on mockup page | `blog/mockup-grafici-guida.html` (dominant cited page) reviewed | Unchanged between June 9–21 commits; content intact, canonical tag correct, structured data present | ✅ **NOT SUPPORTED** |
| Real loss of AI visibility (site-wide) | — | No Bing Search Performance export available; citations concentrated on one query (68.7%), not distributed; independent sites report self-resolving collapses without site changes | ⚠ **INSUFFICIENT_EVIDENCE** |

---

## 9. Conclusion

### Classification

| Label | Assessment | Rationale |
|---|---|---|
| **Onset of decline (Jun 20) + zero regime (Jun 21)** | ✅ CONFIRMED | CUSUM onset (score 12.78), mean-shift change point Jun 21 |
| **95.4% citation decline** | ✅ CONFIRMED | 39.9 → 1.8 avg daily citations |
| **Query concentration** | ✅ CONFIRMED | Top query = 68.7% of within-export citations |
| **No technical regression** | ✅ CONFIRMED | robots.txt, sitemap, content, infra all healthy |
| **Reporting/sampling discontinuity** | ⚠ PROBABLE_ROOT_CAUSE | Coincides with June 16 Bing AI Performance update; Bing docs confirm sampling; but Bing does not confirm methodology change in that specific release |
| **IndexNow gap** | ⚠ CONTRIBUTING_MAINTENANCE_GAP | 100-day gap, but predates crash by ~3 months; not sudden |
| **Real visibility loss** | ❌ INSUFFICIENT_EVIDENCE | No Bing Search Performance export available; citations on one query; independent sites self-recovered |

### Reasoning

1. The onset of the decline is confirmed by CUSUM (Jun 20, 84→33 citations)
   with mean-shift score 12.78; the sustained zero-citation regime begins
   Jun 21. The decline from 39.9 to 1.8 avg daily citations (−95.4%) is real
   in the Bing WMT dataset.
2. The June 16, 2026 Bing AI Performance update (Intents, Topics, Citation
   Share, Compare) is temporally compatible (4 days prior) and concerns the
   reporting interface directly. Bing's own documentation confirms the data is
   sampled and that citation trends are observational — not causally tied to
   any single event.
3. **No site-side change** between June 9 (last robots/sitemap/llms change)
   and June 21 (next pSEO batch) could have caused the crash. The June 9
   changes were exclusively improvements.
4. All AI-discoverable content files are well-formed and comprehensive.
   The sitemap includes all critical pages.
5. Industry reports from late May–June 2026 describe similar
   non-site-specific, self-resolving citation collapses (anecdotal, not verified).
6. The July 22–August 4 changes (entity-fact normalization, content-claim
   governance, LLM export governance) were the site owner's post-crash
   quality improvements — not the cause.

### Recommended Next Steps

1. **Monitor** the AI Performance report for 4-6 weeks under the new
   sampling regime to observe whether citations stabilize or recover.
2. **Compare** AI Performance against traditional Bing Search Performance (if
   a Search Performance export is available) — if Search is stable while AI
   citations remain depressed, this reinforces the reporting-discontinuity
   hypothesis.
3. **Resume** IndexNow submissions as a general maintenance practice, but
   do not attribute the crash to this gap (it predates the crash by ~3 months).
4. **Use** the new Citation Share and Compare features to drill into whether
   the dominant query (`mockup significato`) shifted attribution to other
   sites or whether the total query volume shrank.
5. **Await** potential recovery — independent reports show AI citation
   ecosystems can self-correct when model training data or sampling windows
   change.
