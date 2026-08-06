# Geo-Page Generation Testing

<cite>
**Referenced Files in This Document**
- [generate-all-geo.js](file://scripts/generate-all-geo.js)
- [main.js](file://scripts/geo/main.js)
- [config.js](file://scripts/geo/config.js)
- [data.js](file://scripts/geo/data.js)
- [render-agenzia.js](file://scripts/geo/render-agenzia.js)
- [render-servizio.js](file://scripts/geo/render-servizio.js)
- [render-realizzazione.js](file://scripts/geo/render-realizzazione.js)
- [schema.js](file://scripts/geo/schema.js)
- [validate.js](file://scripts/geo/validate.js)
- [pseo-governance.js](file://config/pseo-governance.js)
- [cities.json](file://data/cities.json)
- [geo-generator-regressions.test.js](file://tests/geo-generator-regressions.test.js)
- [geo-generator-fail-closed.test.js](file://tests/geo-generator-fail-closed.test.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains how the WebNovis project tests automated generation of location-specific pages and how integration tests verify data consistency, template rendering, and SEO optimization across geo-targeted content. It covers city data processing, template variable substitution, output file creation, multi-city page generation, content validation, and performance considerations. It also provides guidance on writing effective geo-generation tests and debugging failed page generations.

## Project Structure
The geo-generation pipeline is orchestrated by a single entrypoint that delegates to modular components under scripts/geo. The main flow reads centralized city and service data, renders HTML via Nunjucks or regex-based base templates, validates outputs, writes published files, and persists metadata such as dates and link graphs. Tests validate both source-level invariants and end-to-end behavior using isolated fixtures.

```mermaid
graph TB
A["Entry: generate-all-geo.js"] --> B["Orchestrator: scripts/geo/main.js"]
B --> C["Config & CLI: scripts/geo/config.js"]
B --> D["Data layer: scripts/geo/data.js"]
B --> E["Renderers:<br/>agenzia, realizzazione, servizio×città"]
E --> F["Templates:<br/>Nunjucks + base-pages"]
B --> G["Validation: scripts/geo/validate.js"]
B --> H["Schema: scripts/geo/schema.js"]
B --> I["Governance: config/pseo-governance.js"]
B --> J["Outputs: published HTML, link-graph.json, dates"]
```

**Diagram sources**
- [generate-all-geo.js:1-58](file://scripts/generate-all-geo.js#L1-L58)
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)
- [config.js:1-114](file://scripts/geo/config.js#L1-L114)
- [data.js:1-197](file://scripts/geo/data.js#L1-L197)
- [schema.js:1-199](file://scripts/geo/schema.js#L1-L199)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)

**Section sources**
- [generate-all-geo.js:1-58](file://scripts/generate-all-geo.js#L1-L58)
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)

## Core Components
- Orchestrator: coordinates generation per type (agenzia, realizzazione, servizio×città, hubs), applies filters for cities/services, runs validation, and writes outputs.
- Data layer: loads cities, services, approved content blocks, blog index, and Nunjucks environment; exposes helpers for pricing, avatar paths, and nearest cities.
- Renderers: produce final HTML per page type with SEO copy, FAQs, schema markup, and editorial overrides.
- Validation: fail-closed checks for word count, internal links, JSON-LD schemas, canonical tags, H1 presence, answer capsule class, and unsupported claims.
- Schema generator: builds BreadcrumbList, WebPage, Service, OfferCatalog, FAQPage, and areaServed entities tied to city data.
- Governance: tiered allowlist controls which generated paths are indexable and robots directives.

**Section sources**
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)
- [data.js:1-197](file://scripts/geo/data.js#L1-L197)
- [validate.js:1-55](file://scripts/geo/validate.js#L1-L55)
- [schema.js:1-199](file://scripts/geo/schema.js#L1-L199)
- [config.js:1-114](file://scripts/geo/config.js#L1-L114)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)

## Architecture Overview
The generation pipeline enforces a fail-closed strategy: any critical validation issue blocks output and marks the run as failed. Each page type follows a consistent sequence: load base template, build context from city/service data, render content, update head/meta, inject schemas, validate, and write if allowed.

```mermaid
sequenceDiagram
participant CLI as "CLI"
participant Entry as "generate-all-geo.js"
participant Main as "scripts/geo/main.js"
participant Data as "scripts/geo/data.js"
participant Rend as "Renderers"
participant Val as "scripts/geo/validate.js"
participant Out as "Filesystem"
CLI->>Entry : Run with flags (--type, --city, --out-dir)
Entry->>Main : main()
Main->>Data : Load cities, services, content blocks
loop For each target page
Main->>Rend : Generate HTML (agenzia/realizzazione/servizio×città)
Rend-->>Main : HTML string
Main->>Val : validatePage(html, filename)
Val-->>Main : {issues, metrics}
alt Critical issues
Main->>Main : Mark blocked/failed
else No critical issues
Main->>Out : Write published file (if not dry/validate-only)
end
end
Main->>Out : Persist link graph and dates
Main-->>CLI : Summary and exit code
```

**Diagram sources**
- [generate-all-geo.js:28-58](file://scripts/generate-all-geo.js#L28-L58)
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)
- [data.js:1-197](file://scripts/geo/data.js#L1-L197)
- [validate.js:1-55](file://scripts/geo/validate.js#L1-L55)

## Detailed Component Analysis

### City Data Processing and Filtering
- Centralized city definitions include slugs, names, CAP, coordinates, province, distance to headquarters, nearby cities, local context highlights, and per-page-type FAQ sets.
- The data module constructs lookup maps, computes display names, and prepares avatar paths. It also determines whether a service participates in geo generation based on explicit flags.
- Filters applied during generation respect CLI targets and governance tiers to limit scope and ensure only indexable paths are treated as primary targets.

```mermaid
flowchart TD
Start(["Load cities.json"]) --> BuildMaps["Build cityMap and service lists"]
BuildMaps --> FilterCities{"CLI city filter set?"}
FilterCities --> |Yes| ApplyCityFilter["Keep only matching slugs"]
FilterCities --> |No| KeepAllCities["Use all cities"]
ApplyCityFilter --> FilterServices{"CLI service filter set?"}
KeepAllCities --> FilterServices
FilterServices --> |Yes| ApplyServiceFilter["Keep only matching services"]
FilterServices --> |No| KeepAllServices["Use all services"]
ApplyServiceFilter --> Output["Provide filtered lists to orchestrator"]
KeepAllServices --> Output
```

**Diagram sources**
- [data.js:15-197](file://scripts/geo/data.js#L15-L197)
- [config.js:32-74](file://scripts/geo/config.js#L32-L74)

**Section sources**
- [data.js:15-197](file://scripts/geo/data.js#L15-L197)
- [config.js:32-74](file://scripts/geo/config.js#L32-L74)
- [cities.json:1-200](file://data/cities.json#L1-L200)

### Template Rendering and Variable Substitution
- Agenzia pages use a Nunjucks template with dynamic variables derived from city data, approved content blocks, and editorial overrides. Head meta, canonical, robots directives, and social tags are updated before assembly.
- Realizzazione pages use a regex-based base template with targeted replacements for city-specific text, images, addresses, and schema values. Editorial body injection and FAQ sections are rendered consistently.
- Servizio×città pages combine service and city contexts, select FAQ pools by service cluster, and enrich content with AI-derived insights when available. They also compute related city and service pages for internal linking.

```mermaid
classDiagram
class RenderAgenzia {
+generateAgenziaPage(city)
-buildTemplateData(city)
-updateHeadMeta(headBlock, seo)
-injectSchemas(page, faqs)
}
class RenderRealizzazione {
+generateRealizzazionePage(city)
-applyRegexReplacements(basePage, city)
-injectEditorialBody(page, editorial)
-renderFAQs(resolvedFaqs)
}
class RenderServizioCitta {
+generateServizioCittaPage(service, city)
-selectFaqPool(service)
-computeRelatedPages(service, city)
-assembleHeadAndSchemas(page, seo, faqs)
}
RenderAgenzia --> RenderRealizzazione : "shared utilities"
RenderServizioCitta --> RenderRealizzazione : "shared utilities"
```

**Diagram sources**
- [render-agenzia.js:34-189](file://scripts/geo/render-agenzia.js#L34-L189)
- [render-realizzazione.js:33-200](file://scripts/geo/render-realizzazione.js#L33-L200)
- [render-servizio.js:36-284](file://scripts/geo/render-servizio.js#L36-L284)

**Section sources**
- [render-agenzia.js:34-189](file://scripts/geo/render-agenzia.js#L34-L189)
- [render-realizzazione.js:33-200](file://scripts/geo/render-realizzazione.js#L33-L200)
- [render-servizio.js:36-284](file://scripts/geo/render-servizio.js#L36-L284)

### SEO Optimization and Schema Markup
- Canonical URLs, robots directives, and Open Graph tags are injected into the head block for each generated page.
- JSON-LD schemas include BreadcrumbList, WebPage, Service, OfferCatalog, FAQPage, and areaServed entities aligned with city data and governance tiers.
- Governance rules determine indexability and de-amplification for generated paths, ensuring only strategic pages are promoted while others remain follow but noindex.

```mermaid
flowchart TD
Page["Generated HTML"] --> Meta["Update head meta<br/>title, description, canonical, robots, OG"]
Meta --> Schemas["Generate JSON-LD<br/>BreadcrumbList, WebPage, Service, FAQPage"]
Schemas --> Governance{"Path indexable?"}
Governance --> |Yes| Publish["Write published file"]
Governance --> |No| DeAmplify["noindex,follow and exclude from sitemap"]
Publish --> End(["Output"])
DeAmplify --> End
```

**Diagram sources**
- [render-agenzia.js:146-189](file://scripts/geo/render-agenzia.js#L146-L189)
- [render-realizzazione.js:50-99](file://scripts/geo/render-realizzazione.js#L50-L99)
- [render-servizio.js:194-284](file://scripts/geo/render-servizio.js#L194-L284)
- [schema.js:73-192](file://scripts/geo/schema.js#L73-L192)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)

**Section sources**
- [schema.js:73-192](file://scripts/geo/schema.js#L73-L192)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)

### Fail-Closed Validation Strategy
- Word count thresholds enforce minimum content depth; warnings and critical failures are reported.
- Internal link density ensures sufficient cross-linking between geo pages.
- Presence of JSON-LD schemas and required HTML elements (canonical, H1, answer capsule) is verified.
- Unsupported claims are detected and flagged as critical blockers.

```mermaid
flowchart TD
VStart(["Validate HTML"]) --> Words["Count words"]
Words --> WordsOK{"≥300 words?"}
WordsOK --> |No| CriticalWords["Critical: too few words"]
WordsOK --> |Yes| Links["Count internal links"]
Links --> LinksOK{">=5 links?"}
LinksOK --> |No| WarnLinks["Warning: low internal links"]
LinksOK --> |Yes| Schemas["Count JSON-LD schemas"]
Schemas --> SchemasOK{">=3 schemas?"}
SchemasOK --> |No| WarnSchemas["Warning: insufficient schemas"]
SchemasOK --> |Yes| Tags["Check canonical, H1, answer-capsule"]
Tags --> Claims["Scan for unsupported claims"]
Claims --> Result(["Return issues and metrics"])
```

**Diagram sources**
- [validate.js:7-50](file://scripts/geo/validate.js#L7-L50)

**Section sources**
- [validate.js:7-50](file://scripts/geo/validate.js#L7-L50)

### Multi-City Page Generation and Content Validation
- The orchestrator generates agenzia and realizzazione pages per city where enabled, and a combinatorial matrix of servizio×città pages for eligible services and cities.
- Per-service FAQ pools and AI-enriched content reduce intra-municipal duplication and improve relevance.
- Related city and service pages are computed to strengthen internal linking and user navigation.

```mermaid
sequenceDiagram
participant M as "main.js"
participant D as "data.js"
participant R as "render-servizio.js"
participant V as "validate.js"
M->>D : Get eligible services and cities
loop For each service
loop For each city
M->>R : generateServizioCittaPage(service, city)
R-->>M : HTML
M->>V : validatePage(html, filename)
V-->>M : {issues, metrics}
alt Critical issues
M->>M : Block output
else OK
M->>M : Write file (if allowed)
end
end
end
```

**Diagram sources**
- [main.js:152-195](file://scripts/geo/main.js#L152-L195)
- [render-servizio.js:36-284](file://scripts/geo/render-servizio.js#L36-L284)
- [validate.js:7-50](file://scripts/geo/validate.js#L7-L50)

**Section sources**
- [main.js:152-195](file://scripts/geo/main.js#L152-L195)
- [render-servizio.js:36-284](file://scripts/geo/render-servizio.js#L36-L284)

### Test Scenarios and Strategies
- Source-level regression tests assert that generators do not read legacy base filenames, that date handling uses controlled build timestamps, that placeholders are replaced correctly, and that templates expose markers for preserved custom blocks.
- Integration tests spawn an isolated fixture, run the generator in validate-only mode, confirm baseline success, then inject a critical validation finding into a template and assert failure with precise error reporting and summary counts.
- These tests cover missing city data risks (by validating against real corpus), template errors (by injecting invalid content), and schema markup problems (by asserting schema presence and correctness).

```mermaid
sequenceDiagram
participant T as "Test Runner"
participant FS as "Fixture FS"
participant Gen as "generate-all-geo.js"
participant V as "validate.js"
T->>FS : Copy config, data, scripts, templates
T->>Gen : Run with --validate-only --type=agenzia --city=arese
Gen->>V : Validate generated HTML
V-->>Gen : Issues (none)
Gen-->>T : Success status and expected counts
T->>FS : Append unsupported claim to template
T->>Gen : Re-run same command
Gen->>V : Validate again
V-->>Gen : Critical issue found
Gen-->>T : Non-zero exit and blocked output details
```

**Diagram sources**
- [geo-generator-fail-closed.test.js:22-85](file://tests/geo-generator-fail-closed.test.js#L22-L85)
- [validate.js:7-50](file://scripts/geo/validate.js#L7-L50)

**Section sources**
- [geo-generator-regressions.test.js:24-157](file://tests/geo-generator-regressions.test.js#L24-L157)
- [geo-generator-fail-closed.test.js:22-85](file://tests/geo-generator-fail-closed.test.js#L22-L85)

## Dependency Analysis
The geo generator depends on centralized configuration, governance rules, and data modules. Renderers rely on shared utilities for HTML manipulation, FAQ resolution, and schema generation. Tests depend on the public entrypoint and modules to assert invariants and simulate failures.

```mermaid
graph LR
Entry["generate-all-geo.js"] --> Main["geo/main.js"]
Main --> Config["geo/config.js"]
Main --> Data["geo/data.js"]
Main --> RenderA["geo/render-agenzia.js"]
Main --> RenderR["geo/render-realizzazione.js"]
Main --> RenderS["geo/render-servizio.js"]
Main --> Schema["geo/schema.js"]
Main --> Validate["geo/validate.js"]
Config --> Gov["config/pseo-governance.js"]
Data --> Cities["data/cities.json"]
Tests["tests/*"] --> Entry
```

**Diagram sources**
- [generate-all-geo.js:28-58](file://scripts/generate-all-geo.js#L28-L58)
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)
- [config.js:1-114](file://scripts/geo/config.js#L1-L114)
- [data.js:1-197](file://scripts/geo/data.js#L1-L197)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)
- [cities.json:1-200](file://data/cities.json#L1-L200)

**Section sources**
- [generate-all-geo.js:28-58](file://scripts/generate-all-geo.js#L28-L58)
- [main.js:38-289](file://scripts/geo/main.js#L38-L289)

## Performance Considerations
- Use CLI filters to limit generation to specific cities or services for faster iteration during development.
- Prefer validate-only mode to avoid disk I/O when testing logic changes.
- Ensure content blocks and blog indexes are present to avoid fallback computations that can slow rendering.
- Monitor generated HTML size and internal link counts to keep pages performant and well-linked without excessive bloat.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and how to debug them:
- Missing city data: If a city lacks essential fields (slug, name, cap), renderers may fail or produce incomplete pages. Verify entries in cities.json and ensure generate flags are set appropriately.
- Template errors: Injected unsupported claims or malformed content will trigger critical validation failures. Use validate-only mode to identify the exact blocked output and inspect the template markers.
- Schema markup problems: Ensure JSON-LD schemas are present and consistent with city and service data. Check that areaServed entities reference correct cities and administrative areas.
- Indexation issues: Confirm that the generated path is in the allowlist for indexation. De-amplified pages should remain noindex,follow and excluded from sitemaps.

Debugging steps:
- Run with --dry-run and --validate-only to preview outputs and catch issues without writing files.
- Inspect console logs for blocked/failed outputs and validation warnings.
- Review generated link-graph.json to verify internal linking structure.
- Check date persistence to ensure editorial dates are updated only after successful generation.

**Section sources**
- [validate.js:7-50](file://scripts/geo/validate.js#L7-L50)
- [main.js:239-289](file://scripts/geo/main.js#L239-L289)
- [pseo-governance.js:1-200](file://config/pseo-governance.js#L1-L200)

## Conclusion
The WebNovis geo-generation system combines centralized data, modular renderers, strict validation, and governance-driven indexation to produce reliable, SEO-optimized location pages. Integration tests enforce fail-closed behavior, ensuring that critical issues block generation and provide actionable feedback. By following the strategies outlined here—filtering targets, validating outputs, verifying schema markup, and leveraging test fixtures—you can confidently maintain and extend geo-page generation while catching common issues early.

[No sources needed since this section summarizes without analyzing specific files]