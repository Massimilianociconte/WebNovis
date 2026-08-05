# Source File Hashes

Raw Bing WMT exports are NOT committed to version control.
Verify integrity by comparing against these SHA-256 hashes.

## AI Performance Overview Stats
```
File: webnovis.com_AIPerformanceOverviewStats_8_5_2026.csv
SHA-256: 602eba30153b350e42556044cbd3eb34e7c0d73f918126b5bb4ed635a1f29e36
```

## AI Search Queries Report
```
File: webnovis.com_AISearchQueriesReport_8_5_2026.csv
SHA-256: 3bda6cdb442d2fb3fa577251cf85efa77074a922c24b191e30d0c45697970eeb
```

## Regenerating analysis

```bash
# Place original CSV exports in raw/ directory
cp "/path/to/downloads/webnovis.com_AIPerformanceOverviewStats_8_5_2026.csv"   reports/geo/ai-citation-drop-2026-06-19/raw/
cp "/path/to/downloads/webnovis.com_AISearchQueriesReport_8_5_2026.csv"         reports/geo/ai-citation-drop-2026-06-19/raw/

# Run analysis
node reports/geo/ai-citation-drop-2026-06-19/analyze_citations.js

# Verify hashes
shasum -a 256 reports/geo/ai-citation-drop-2026-06-19/raw/*.csv
```
