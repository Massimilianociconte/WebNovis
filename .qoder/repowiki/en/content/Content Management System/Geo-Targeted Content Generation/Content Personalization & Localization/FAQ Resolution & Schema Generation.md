# FAQ Resolution & Schema Generation

<cite>
**Referenced Files in This Document**
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [html-utils.js](file://scripts/geo/html-utils.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [cities.json](file://data/cities.json)
- [expand-faqs.js](file://scripts/expand-faqs.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)
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
10. [Appendices](#appendices)

## Introduction
This document explains the FAQ resolution and schema generation system used for geo-targeted pages. It covers how location-specific FAQs are resolved from content blocks, how visible FAQ items are extracted and rebuilt into page structure, and how JSON-LD FAQPage schemas are generated and validated. It also documents governance rules that ensure FAQ content meets SEO best practices and remains truthful to what is visible on the page.

## Project Structure
The FAQ system spans several modules:
- Geo-specific FAQ resolution and rendering helpers
- JSON-LD schema generation for geo pages (including FAQPage)
- HTML utilities for text normalization
- SEO transforms that enforce idempotent FAQPage injection based on visible content
- Data sources for city-level FAQs
- Maintenance scripts to expand or fix FAQ content and schemas
- Regression tests ensuring correctness and stability

```mermaid
graph TB
A["City data<br/>data/cities.json"] --> B["Geo FAQ resolver<br/>scripts/geo/faq.js"]
B --> C["HTML utils<br/>scripts/geo/html-utils.js"]
B --> D["Geo schema generator<br/>scripts/geo/schema.js"]
E["SEO HTML transforms<br/>config/seo-html-transforms.js"] --> F["Visible FAQ extraction<br/>ensureFaqPageSchema()"]
G["Maintenance: expand FAQs<br/>scripts/expand-faqs.js"] --> H["Published HTML pages"]
I["Maintenance: fix schemas<br/>scripts/fix-faq-schemas.js"] --> H
J["Regression tests<br/>tests/faq-schema-regressions.test.js"] --> E
```

**Diagram sources**
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [html-utils.js](file://scripts/geo/html-utils.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [cities.json](file://data/cities.json)
- [expand-faqs.js](file://scripts/expand-faqs.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)

**Section sources**
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [html-utils.js](file://scripts/geo/html-utils.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [cities.json](file://data/cities.json)
- [expand-faqs.js](file://scripts/expand-faqs.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)

## Core Components
- Geo FAQ resolver: selects AI-provided FAQs when available and above a minimum threshold; otherwise falls back to city-defined FAQs.
- Visible FAQ extractor: parses rendered HTML to find question-answer pairs from both <details>/<summary> and heading-based patterns.
- Rebuilder: replaces existing FAQ items in HTML with resolved ones to keep markup consistent with resolved data.
- Schema builder: generates FAQPage JSON-LD from resolved Q/A pairs, stripping HTML to plain text.
- SEO transform pipeline: ensures idempotent injection of FAQPage only when visible FAQs exist and the page is indexable; preserves hand-authored schemas.

**Section sources**
- [faq.js](file://scripts/geo/faq.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)

## Architecture Overview
The system operates in two complementary flows:
- Build-time flow for geo pages: resolve FAQs from data, render them into HTML, and generate corresponding FAQPage schema.
- Transform-time flow for all public pages: extract visible FAQs from HTML and inject an idempotent FAQPage block if needed.

```mermaid
sequenceDiagram
participant Data as "City Data<br/>cities.json"
participant Resolver as "FAQ Resolver<br/>faq.js"
participant Utils as "HTML Utils<br/>html-utils.js"
participant Renderer as "Renderer<br/>faq.js"
participant Schema as "Schema Generator<br/>schema.js"
participant SEO as "SEO Transforms<br/>seo-html-transforms.js"
participant Page as "Generated HTML"
Data-->>Resolver : Provide city.faqs[pageType]
Resolver->>Utils : stripHtml(text)
Resolver-->>Renderer : Resolved FAQs [{q,a}]
Renderer->>Renderer : rebuildVisibleFaqItems(html, resolvedFaqs)
Renderer-->>Page : Updated HTML with FAQ section
Schema->>Schema : buildFaqPageSchema(resolvedFaqs)
Schema-->>Page : Inject FAQPage JSON-LD
SEO->>SEO : ensureFaqPageSchema(html)
SEO-->>Page : Ensure idempotent FAQPage presence
```

**Diagram sources**
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [cities.json](file://data/cities.json)

## Detailed Component Analysis

### Geo FAQ Resolution and Rendering
- Resolution logic chooses between AI-provided FAQs and city-defined FAQs based on page type and minimum thresholds.
- Visible FAQ extraction supports multiple HTML shapes and normalizes text safely for schema use.
- Rebuilding replaces existing FAQ items in-place to maintain structural consistency.
- Rendering produces semantic <details> blocks suitable for users and crawlers.

```mermaid
flowchart TD
Start(["Resolve FAQs"]) --> CheckAI["Check AI FAQs by pageType"]
CheckAI --> |Meets minimum| UseAI["Use AI FAQs"]
CheckAI --> |Below minimum| UseCity["Fallback to city.faqs[pageType]"]
UseCity --> Normalize["Normalize text with stripHtml"]
UseAI --> Normalize
Normalize --> Render["Render <details> items"]
Render --> Rebuild["Rebuild visible FAQ block in HTML"]
Rebuild --> End(["Return updated HTML"])
```

**Diagram sources**
- [faq.js](file://scripts/geo/faq.js)
- [html-utils.js](file://scripts/geo/html-utils.js)

**Section sources**
- [faq.js](file://scripts/geo/faq.js)
- [html-utils.js](file://scripts/geo/html-utils.js)

### JSON-LD Schema Generation for Geo Pages
- Generates BreadcrumbList, WebPage, Service, OfferCatalog, and core service schemas tailored per city and page type.
- Appends FAQPage schema when resolved FAQs exist, mapping each Q/A pair to Question/Answer nodes.
- Uses normalized text to avoid HTML leakage into schema fields.

```mermaid
classDiagram
class SchemaGenerator {
+generateSchemas(city, pageType, resolvedFaqs)
+getAreaServedEntity(city)
+buildCoverageScopes(...)
}
class CityData {
+slug
+name
+cap
+nearCities
+faqs
}
class HtmlUtils {
+stripHtml(html)
}
SchemaGenerator --> CityData : "reads"
SchemaGenerator --> HtmlUtils : "uses"
```

**Diagram sources**
- [schema.js](file://scripts/geo/schema.js)
- [html-utils.js](file://scripts/geo/html-utils.js)
- [cities.json](file://data/cities.json)

**Section sources**
- [schema.js](file://scripts/geo/schema.js)

### SEO Transform Pipeline for FAQPage Injection
- Extracts visible Q/A pairs from published HTML using robust patterns.
- Skips noindex pages and preserves hand-authored FAQPage blocks.
- Ensures idempotency by marking generated blocks and replacing rather than stacking.
- Validates coverage and truthfulness via regression tests.

```mermaid
flowchart TD
Input(["HTML Page"]) --> StripGenerated["Remove previously generated FAQ blocks"]
StripGenerated --> CheckNoindex{"Is page noindex?"}
CheckNoindex --> |Yes| ReturnOriginal["Return original HTML"]
CheckNoindex --> |No| HasHandAuthored{"Has hand-authored FAQPage?"}
HasHandAuthored --> |Yes| Preserve["Preserve hand-authored FAQPage"]
HasHandAuthored --> |No| ExtractVisible["Extract visible FAQ pairs"]
ExtractVisible --> Enough{"At least 2 valid pairs?"}
Enough --> |No| ReturnOriginal
Enough --> |Yes| BuildSchema["Build FAQPage JSON-LD"]
BuildSchema --> Inject["Inject marked script block"]
Inject --> Output(["Idempotent HTML"])
```

**Diagram sources**
- [seo-html-transforms.js](file://config/seo-html-transforms.js)

**Section sources**
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)

### Data Model: City FAQs
- Each city entry includes a faqs object keyed by pageType (e.g., agenzia, realizzazione).
- Each FAQ item contains q (question) and a (answer), which may include HTML formatting.
- The resolver uses these structures to populate page content and schema.

```mermaid
erDiagram
CITY {
string slug
string name
string cap
array nearCities
json faqs
}
FAQ_ITEM {
string q
string a
}
CITY ||--o{ FAQ_ITEM : "per pageType"
```

**Diagram sources**
- [cities.json](file://data/cities.json)

**Section sources**
- [cities.json](file://data/cities.json)

### Maintenance Scripts
- Expand FAQs: Adds new FAQ items to specific pages and updates their FAQPage schema in place.
- Fix schemas: Synchronizes schema answers with corrected HTML answers and standardizes pricing references.

```mermaid
sequenceDiagram
participant Script as "expand-faqs.js"
participant Page as "HTML Page"
Script->>Page : Insert <details> items
Script->>Page : Append to FAQPage mainEntity
Script-->>Script : Log changes
participant Fixer as "fix-faq-schemas.js"
participant Page2 as "HTML Page"
Fixer->>Page2 : Replace outdated schema answers
Fixer-->>Fixer : Log fixes
```

**Diagram sources**
- [expand-faqs.js](file://scripts/expand-faqs.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)

**Section sources**
- [expand-faqs.js](file://scripts/expand-faqs.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)

## Dependency Analysis
- Geo FAQ module depends on html-utils for text normalization.
- Geo schema module depends on config constants and data services, plus html-utils for safe text handling.
- SEO transforms depend on pSEO governance for indexation directives and on internal helpers for URL normalization.
- Tests depend on seo-html-transforms to validate behavior across many pages.

```mermaid
graph LR
html_utils["html-utils.js"] --> faq_js["faq.js"]
cities_json["cities.json"] --> faq_js
faq_js --> schema_js["schema.js"]
seo_transforms["seo-html-transforms.js"] --> tests["faq-schema-regressions.test.js"]
schema_js --> seo_transforms
```

**Diagram sources**
- [html-utils.js](file://scripts/geo/html-utils.js)
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)
- [cities.json](file://data/cities.json)

**Section sources**
- [faq.js](file://scripts/geo/faq.js)
- [schema.js](file://scripts/geo/schema.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)
- [cities.json](file://data/cities.json)

## Performance Considerations
- Regex-based extraction is efficient but should be scoped to relevant sections to minimize overhead.
- Idempotent injection prevents repeated parsing and re-injection during builds.
- Text normalization avoids heavy DOM operations by using regex replacements.
- Limiting FAQPage generation to indexable pages reduces unnecessary processing.

## Troubleshooting Guide
Common issues and resolutions:
- Missing FAQPage despite visible FAQs: Ensure the page is not noindex and does not already contain a hand-authored FAQPage. The transform pipeline will skip such cases.
- Duplicate FAQPage blocks: The pipeline marks generated blocks and replaces them instead of appending. Verify the marker attribute is present.
- Mismatched schema vs visible content: The test suite enforces that every schema question must appear visibly on the page. Update either the visible content or the schema accordingly.
- Outdated schema answers: Use the maintenance script to synchronize schema answers with corrected HTML answers.

**Section sources**
- [seo-html-transforms.js](file://config/seo-html-transforms.js)
- [faq-schema-regressions.test.js](file://tests/faq-schema-regressions.test.js)
- [fix-faq-schemas.js](file://scripts/fix-faq-schemas.js)

## Conclusion
The FAQ resolution and schema generation system ensures that geo-targeted pages publish accurate, verifiable, and SEO-friendly structured data. By deriving FAQPage content directly from visible HTML or validated city data, and by enforcing idempotency and governance rules, the system maintains high quality and reliability across large-scale page generation.

## Appendices

### Example FAQ Data Structures
- City FAQ entry:
  - Key: faqs.pageType
  - Items: array of objects with q and a fields
- Resolved FAQ shape:
  - Array of objects with q and a fields used for rendering and schema generation

**Section sources**
- [cities.json](file://data/cities.json)
- [faq.js](file://scripts/geo/faq.js)

### Generated Schema Outputs
- FAQPage JSON-LD:
  - @context: https://schema.org
  - @type: FAQPage
  - mainEntity: array of Question objects with name and acceptedAnswer.text

- Geo page additional schemas:
  - BreadcrumbList, WebPage, Service, OfferCatalog, core services, and areaServed entities

**Section sources**
- [schema.js](file://scripts/geo/schema.js)
- [seo-html-transforms.js](file://config/seo-html-transforms.js)