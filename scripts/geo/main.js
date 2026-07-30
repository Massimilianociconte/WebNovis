/**
 * Geo generator orchestration (CLI main).
 */
const fs = require('fs');
const path = require('path');
const {
    ROOT,
    TODAY,
    DRY_RUN,
    VALIDATE_ONLY,
    GEN_TYPE,
    REPORT_DIR,
    TARGET_CITY_SLUGS,
    TARGET_SERVICE_SLUGS,
    matchesTargetCity,
    matchesTargetService
} = require('./config');
const {
    cities,
    services,
    contentBlocks,
    shouldGenerateGeoForService
} = require('./data');
const {
    resolvePageFaqs,
    resolveHandCraftedFaqs
} = require('./faq');
const { normalizeHandCraftedAgenziaPage } = require('./head-meta');
const { finalizePublishedHtml, writePublishedFile } = require('./paths');
const { validatePage } = require('./validate');
const { generateLinkGraph } = require('./link-graph');
const { savePageDates, isPageDatesDirty, getPageDates } = require('./dates');
const { generateAgenziaPage } = require('./render-agenzia');
const { generateRealizzazionePage } = require('./render-realizzazione');
const { generateServizioCittaPage } = require('./render-servizio');
const { generateHubPages } = require('./render-hubs');

function main() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — Unified Geo Page Generator v3 (pSEO)');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Cities: ${cities.length} | Services: ${services.length}`);
    console.log(`  Type: ${GEN_TYPE} | Dry run: ${DRY_RUN} | Validate only: ${VALIDATE_ONLY}`);
    console.log(`  Date: ${TODAY}`);
    if (TARGET_CITY_SLUGS.size > 0) {
        console.log(`  City filter: ${Array.from(TARGET_CITY_SLUGS).join(', ')}`);
    }
    if (TARGET_SERVICE_SLUGS.size > 0) {
        console.log(`  Service filter: ${Array.from(TARGET_SERVICE_SLUGS).join(', ')}`);
    }
    console.log('');

    const targetAgenziaCities = cities.filter(city => city.generate?.agenzia && matchesTargetCity(city));
    const targetRealizzazioneCities = cities.filter(city => city.generate?.realizzazione && matchesTargetCity(city));
    const targetGeoServices = services.filter(service => shouldGenerateGeoForService(service) && matchesTargetService(service));
    const targetServiceCities = targetAgenziaCities;
    const expected = {
        agenzia: GEN_TYPE === 'all' || GEN_TYPE === 'agenzia' ? targetAgenziaCities.length : 0,
        realizzazione: GEN_TYPE === 'all' || GEN_TYPE === 'realizzazione' ? targetRealizzazioneCities.length : 0,
        servizio: GEN_TYPE === 'all' || GEN_TYPE === 'servizio'
            ? targetGeoServices.length * targetServiceCities.length
            : 0,
        hubs: GEN_TYPE === 'all' || GEN_TYPE === 'hubs' ? 3 : 0
    };
    const blockedOrFailed = { agenzia: 0, realizzazione: 0, servizio: 0, hubs: 0 };
    const results = { agenzia: [], realizzazione: [], servizio: [], hubs: [], validations: [] };
    let generated = 0;
    let skipped = 0;

    // Generate agenzia pages
    if (GEN_TYPE === 'all' || GEN_TYPE === 'agenzia') {
        console.log('─── Generating agenzia-web pages ───');
        for (const city of cities) {
            if (!city.generate.agenzia) { skipped++; continue; }
            if (!matchesTargetCity(city)) { skipped++; continue; }

            const filename = `agenzia-web-${city.slug}.html`;
            let html;
            if (city.slug === 'rho') {
                const rhoSource = fs.readFileSync(path.join(ROOT, 'agenzia-web-rho.html'), 'utf8');
                const fallbackFaqs = resolvePageFaqs(city, 'agenzia', contentBlocks.get(city.slug));
                const resolvedFaqs = resolveHandCraftedFaqs(rhoSource, fallbackFaqs);
                html = normalizeHandCraftedAgenziaPage(rhoSource, resolvedFaqs);
            } else {
                html = generateAgenziaPage(city);
            }
            if (!html) {
                blockedOrFailed.agenzia++;
                console.error(`  ❌ Failed: agenzia-web-${city.slug}.html`);
                continue;
            }

            html = finalizePublishedHtml(filename, html);
            const validation = validatePage(html, filename);
            results.validations.push(validation);

            if (validation.issues.some(i => i.startsWith('⛔'))) {
                blockedOrFailed.agenzia++;
                console.error(`  ❌ ${filename} — BLOCKED by validation:`);
                validation.issues.forEach(i => console.error(`     ${i}`));
                continue;
            }

            if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
            const issueStr = validation.issues.length > 0 ? ` [${validation.issues.length} warnings]` : '';
            console.log(`  ✅ ${filename} (${sizeKb}KB, ${validation.wordCount} words, ${validation.internalLinks} links)${issueStr}`);
            results.agenzia.push(filename);
            generated++;
        }
    }

    // Generate realizzazione pages
    if (GEN_TYPE === 'all' || GEN_TYPE === 'realizzazione') {
        console.log('\n─── Generating realizzazione-siti-web pages ───');
        for (const city of cities) {
            if (!city.generate.realizzazione) { skipped++; continue; }
            if (!matchesTargetCity(city)) { skipped++; continue; }

            let html = generateRealizzazionePage(city);
            if (!html) {
                blockedOrFailed.realizzazione++;
                console.error(`  ❌ Failed: realizzazione-siti-web-${city.slug}.html`);
                continue;
            }

            const filename = `realizzazione-siti-web-${city.slug}.html`;
            html = finalizePublishedHtml(filename, html);
            const validation = validatePage(html, filename);
            results.validations.push(validation);

            if (validation.issues.some(i => i.startsWith('⛔'))) {
                blockedOrFailed.realizzazione++;
                console.error(`  ❌ ${filename} — BLOCKED by validation:`);
                validation.issues.forEach(i => console.error(`     ${i}`));
                continue;
            }

            if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
            const issueStr = validation.issues.length > 0 ? ` [${validation.issues.length} warnings]` : '';
            console.log(`  ✅ ${filename} (${sizeKb}KB, ${validation.wordCount} words, ${validation.internalLinks} links)${issueStr}`);
            results.realizzazione.push(filename);
            generated++;
        }
    }

    // Generate servizio×città pages (third page type — the combinatorial matrix)
    if (GEN_TYPE === 'all' || GEN_TYPE === 'servizio') {
        const geoEligibleServices = targetGeoServices;
        const eligibleCities = targetServiceCities;
        console.log(`\n─── Generating servizio×città pages (${geoEligibleServices.length} services × ${eligibleCities.length} cities) ───`);

        for (const service of geoEligibleServices) {
            const succeededBefore = results.servizio.length;
            const failedBefore = blockedOrFailed.servizio;
            for (const city of eligibleCities) {
                const filename = `${service.slug}-${city.slug}.html`;
                let html = generateServizioCittaPage(service, city);
                if (!html) {
                    blockedOrFailed.servizio++;
                    console.error(`  ❌ Failed: ${filename}`);
                    continue;
                }

                html = finalizePublishedHtml(filename, html);
                const validation = validatePage(html, filename);
                results.validations.push(validation);

                if (validation.issues.some(i => i.startsWith('⛔'))) {
                    blockedOrFailed.servizio++;
                    console.error(`  ❌ ${filename} — BLOCKED by validation:`);
                    validation.issues.forEach(issue => console.error(`     ${issue}`));
                    continue;
                }

                if (!DRY_RUN && !VALIDATE_ONLY) {
                    writePublishedFile(filename, html);
                }
                results.servizio.push(filename);
                generated++;
            }
            const serviceSucceeded = results.servizio.length - succeededBefore;
            const serviceFailed = blockedOrFailed.servizio - failedBefore;
            const serviceExpected = eligibleCities.length;
            const status = serviceSucceeded === serviceExpected && serviceFailed === 0 ? '✅' : '❌';
            console.log(
                `  ${status} ${service.slug}-*.html — ${serviceSucceeded}/${serviceExpected} cities; ${serviceFailed} blocked/failed`
            );
        }
    }

    // Generate hub pages (internal linking bridge)
    if (GEN_TYPE === 'all' || GEN_TYPE === 'hubs') {
        console.log('\n─── Generating hub pages ───');
        const hubResults = generateHubPages();
        if (hubResults.length < expected.hubs) {
            blockedOrFailed.hubs += expected.hubs - hubResults.length;
        }
        for (const hub of hubResults) {
            const relativePath = path.join(hub.dir, 'index.html');
            const html = finalizePublishedHtml(relativePath, hub.html);
            const validation = validatePage(html, relativePath);
            results.validations.push(validation);

            if (validation.issues.some(issue => issue.startsWith('⛔'))) {
                blockedOrFailed.hubs++;
                console.error(`  ❌ ${relativePath} — BLOCKED by validation:`);
                validation.issues.forEach(issue => console.error(`     ${issue}`));
                continue;
            }

            if (!DRY_RUN && !VALIDATE_ONLY) {
                writePublishedFile(relativePath, html);
            }
            const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
            console.log(`  ✅ ${hub.dir}/index.html (${sizeKb}KB)`);
            results.hubs.push(`${hub.dir}/index.html`);
            generated++;
        }
    }

    // Generate link graph
    if (!DRY_RUN && !VALIDATE_ONLY) {
        const linkGraph = generateLinkGraph();
        fs.mkdirSync(REPORT_DIR, { recursive: true });
        const linkGraphPath = path.join(REPORT_DIR, 'link-graph.json');
        fs.writeFileSync(
            linkGraphPath,
            JSON.stringify(linkGraph, null, 2), 'utf8'
        );
        console.log(`\n  📊 Link graph: ${path.relative(ROOT, linkGraphPath).replace(/\\/g, '/')} (${linkGraph.pages.length} pages)`);
    }

    // Summary
    const actual = {
        agenzia: results.agenzia.length,
        realizzazione: results.realizzazione.length,
        servizio: results.servizio.length,
        hubs: results.hubs.length
    };
    const categories = ['agenzia', 'realizzazione', 'servizio', 'hubs'];
    const expectedTotal = categories.reduce((sum, category) => sum + expected[category], 0);
    const succeededTotal = categories.reduce((sum, category) => sum + actual[category], 0);
    const blockedOrFailedTotal = categories.reduce((sum, category) => sum + blockedOrFailed[category], 0);
    const countMismatches = categories.filter(category => actual[category] !== expected[category]);

    console.log('\n══════════════════════════════════════════════════════');
    console.log(`  Generated: ${generated} | Skipped: ${skipped}`);
    console.log(`  Expected: ${expectedTotal} | Succeeded: ${succeededTotal} | Blocked/failed: ${blockedOrFailedTotal}`);
    console.log(
        `  Agenzia: ${actual.agenzia}/${expected.agenzia} | `
        + `Realizzazione: ${actual.realizzazione}/${expected.realizzazione} | `
        + `Servizio×Città: ${actual.servizio}/${expected.servizio} | `
        + `Hub: ${actual.hubs}/${expected.hubs}`
    );

    const warnings = results.validations.reduce(
        (sum, validation) => sum + validation.issues.filter(issue => !issue.startsWith('⛔')).length,
        0
    );
    if (warnings > 0) {
        console.log(`  ⚠ Total validation warnings: ${warnings}`);
    }

    if (DRY_RUN) console.log('  🔍 DRY RUN — no files written');
    if (VALIDATE_ONLY) console.log('  🔍 VALIDATE ONLY — no files written');

    // Persistiamo l'indice delle date DOPO la scrittura: se la generazione
    // fallisce a metà non vogliamo salvare impronte di pagine mai scritte.
    savePageDates();
    if (isPageDatesDirty()) {
        console.log(`  📅 Date editoriali aggiornate: ${Object.keys(getPageDates().pages).length} pagine indicizzate in data/geo-page-dates.json`);
    }

    if (blockedOrFailedTotal > 0 || countMismatches.length > 0) {
        if (countMismatches.length > 0) {
            console.error(`  ⛔ Target count mismatch: ${countMismatches.join(', ')}`);
        }
        console.error('  ⛔ GEO generation failed closed; review the blocked/failed outputs above.');
        process.exitCode = 1;
    }

    console.log('══════════════════════════════════════════════════════');
}

module.exports = { main };
