/**
 * WebNovis — SEO Monitoring Script (pSEO Post-Deploy)
 *
 * Checks critical SEO health metrics by analyzing local files and sitemap.
 * For GSC API integration, requires Google Search Console API credentials.
 *
 * Monitors:
 *   - Total indexed pages (from sitemap)
 *   - Page generation health (validate-pages.js integration)
 *   - Content freshness (pages not updated in >90 days)
 *   - Link graph integrity (orphan pages, broken internal links)
 *   - Bot crawl log analysis (which AI bots are crawling what)
 *
 * Usage:
 *   node scripts/monitor-seo.js              Full monitoring report
 *   node scripts/monitor-seo.js --json       Output as JSON (for CI/alerting)
 *   node scripts/monitor-seo.js --freshness  Check content freshness only
 *
 * For GSC API monitoring (future):
 *   Set GOOGLE_APPLICATION_CREDENTIALS in .env pointing to service account JSON
 *   Then: node scripts/monitor-seo.js --gsc
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const args = process.argv.slice(2);
const JSON_OUTPUT = args.includes('--json');
const FRESHNESS_ONLY = args.includes('--freshness');

// ─── Thresholds ───────────────────────────────────────────────────────────────
const FRESHNESS_WARN_DAYS = 90;
const FRESHNESS_CRITICAL_DAYS = 180;
const MIN_INDEXATION_RATIO = 0.6;

// ─── Sitemap Analysis ─────────────────────────────────────────────────────────
function analyzeSitemap() {
    const sitemapPath = path.join(ROOT, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) return { total: 0, urls: [], error: 'sitemap.xml not found' };

    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const urls = [];
    const locRegex = /<loc>(.*?)<\/loc>/g;
    const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/g;
    let locMatch, lastmodMatch;
    const locs = [], lastmods = [];

    while ((locMatch = locRegex.exec(xml)) !== null) {
        if (!locMatch[1].match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)) {
            locs.push(locMatch[1]);
        }
    }
    while ((lastmodMatch = lastmodRegex.exec(xml)) !== null) {
        lastmods.push(lastmodMatch[1]);
    }

    for (let i = 0; i < locs.length; i++) {
        urls.push({ url: locs[i], lastmod: lastmods[i] || null });
    }

    // Categorize by type
    // Load service slugs for categorization
    let serviceSlugs = [];
    try {
        const svcData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'services.json'), 'utf8'));
        serviceSlugs = svcData.services.map(s => s.slug);
    } catch (e) { /* services.json not available */ }

    const categories = {
        geo_agenzia: urls.filter(u => u.url.includes('agenzia-web-')).length,
        geo_realizzazione: urls.filter(u => u.url.includes('realizzazione-siti-web-')).length,
        geo_servizio: urls.filter(u => {
            const filename = u.url.split('/').pop();
            return serviceSlugs.some(s => filename.startsWith(s + '-')) &&
                !filename.startsWith('agenzia-') && !filename.startsWith('realizzazione-');
        }).length,
        hub: urls.filter(u => u.url.match(/\/(agenzia-web|realizzazione-siti-web|zone-servite)\/$/)).length,
        blog: urls.filter(u => u.url.includes('/blog/')).length,
        servizi: urls.filter(u => u.url.includes('/servizi/')).length,
        portfolio: urls.filter(u => u.url.includes('/portfolio/')).length,
        core: 0
    };
    categories.core = urls.length - categories.geo_agenzia - categories.geo_realizzazione - categories.geo_servizio - categories.hub - categories.blog - categories.servizi - categories.portfolio;

    return { total: urls.length, urls, categories };
}

// ─── Content Freshness ────────────────────────────────────────────────────────
function checkFreshness(urls) {
    const now = new Date();
    const stale = [];
    const critical = [];

    for (const u of urls) {
        if (!u.lastmod) continue;
        const lastmod = new Date(u.lastmod);
        const daysSince = Math.floor((now - lastmod) / (1000 * 60 * 60 * 24));

        if (daysSince > FRESHNESS_CRITICAL_DAYS) {
            critical.push({ url: u.url, lastmod: u.lastmod, daysSince });
        } else if (daysSince > FRESHNESS_WARN_DAYS) {
            stale.push({ url: u.url, lastmod: u.lastmod, daysSince });
        }
    }

    return { stale, critical };
}

// ─── Bot Log Analysis ─────────────────────────────────────────────────────────
function analyzeBotLog() {
    const logPath = path.join(ROOT, 'bot-access.log');
    if (!fs.existsSync(logPath)) return { available: false, message: 'bot-access.log not found' };

    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
    const entries = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

    if (entries.length === 0) return { available: true, total: 0, bots: {} };

    // Last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = entries.filter(e => new Date(e.timestamp) > weekAgo);

    // Group by bot
    const bots = {};
    for (const e of recent) {
        if (!bots[e.bot]) bots[e.bot] = { count: 0, urls: new Set() };
        bots[e.bot].count++;
        bots[e.bot].urls.add(e.url);
    }

    // Convert Sets to counts
    const botSummary = {};
    for (const [name, data] of Object.entries(bots)) {
        botSummary[name] = { requests: data.count, uniquePages: data.urls.size };
    }

    return { available: true, total: recent.length, period: '7 days', bots: botSummary };
}

// ─── Link Graph Integrity ─────────────────────────────────────────────────────
function checkLinkGraph() {
    const graphPath = path.join(ROOT, 'data', 'link-graph.json');
    if (!fs.existsSync(graphPath)) return { available: false };

    const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
    const allPages = new Set(graph.pages.map(p => p.url));
    const orphans = [];
    const brokenLinks = [];

    for (const page of graph.pages) {
        // Check if linked pages exist
        for (const target of page.linksTo) {
            if (!allPages.has(target)) {
                brokenLinks.push({ from: page.url, to: target });
            }
        }

        // Check if page file exists
        const filePath = path.join(ROOT, page.url.replace(/^\//, ''));
        if (!fs.existsSync(filePath)) {
            orphans.push(page.url);
        }
    }

    // Find pages with zero inbound links
    const inboundCount = {};
    for (const page of graph.pages) {
        if (!inboundCount[page.url]) inboundCount[page.url] = 0;
        for (const target of page.linksTo) {
            inboundCount[target] = (inboundCount[target] || 0) + 1;
        }
    }
    const zeroInbound = graph.pages.filter(p => (inboundCount[p.url] || 0) === 0).map(p => p.url);

    return {
        available: true,
        totalPages: graph.pages.length,
        totalLinks: graph.pages.reduce((s, p) => s + p.linksTo.length, 0),
        orphanFiles: orphans,
        brokenLinks: brokenLinks,
        zeroInbound: zeroInbound
    };
}

// ─── Data Layer Health ────────────────────────────────────────────────────────
function checkDataLayer() {
    const citiesPath = path.join(ROOT, 'data', 'cities.json');
    const servicesPath = path.join(ROOT, 'data', 'services.json');
    const contentBlocksDir = path.join(ROOT, 'data', 'content-blocks');

    const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
    const services = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));

    let aiContentCount = 0;
    if (fs.existsSync(contentBlocksDir)) {
        aiContentCount = fs.readdirSync(contentBlocksDir).filter(f => f.endsWith('.json')).length;
    }

    const totalCities = cities.cities.length;
    const activeCities = cities.cities.filter(c => c.generate.agenzia).length;
    const aiCoverage = totalCities > 0 ? Math.round((aiContentCount / (totalCities - 1)) * 100) : 0; // -1 for Rho (hand-crafted)

    return {
        cities: { total: totalCities, active: activeCities },
        services: { total: services.services.length, core: services.services.filter(s => s.tier === 'core').length },
        aiContent: { generated: aiContentCount, coverage: `${aiCoverage}%` },
        potentialPages: activeCities * 2 + // agenzia + realizzazione
            (cities.cities.filter(c => c.population >= 15000).length *
                services.services.filter(s => s.generateGeoPages !== false).length) // servizio×città
    };
}

// ─── Main Report ──────────────────────────────────────────────────────────────
function main() {
    const report = {
        timestamp: new Date().toISOString(),
        sitemap: null,
        freshness: null,
        botLog: null,
        linkGraph: null,
        dataLayer: null,
        alerts: []
    };

    // 1. Sitemap analysis
    report.sitemap = analyzeSitemap();

    // 2. Content freshness
    {
        report.freshness = checkFreshness(report.sitemap.urls);
        if (report.freshness.critical.length > 0) {
            report.alerts.push({ level: 'CRITICAL', msg: `${report.freshness.critical.length} pages not updated in ${FRESHNESS_CRITICAL_DAYS}+ days` });
        }
        if (report.freshness.stale.length > 0) {
            report.alerts.push({ level: 'WARNING', msg: `${report.freshness.stale.length} pages not updated in ${FRESHNESS_WARN_DAYS}+ days` });
        }
    }

    if (!FRESHNESS_ONLY) {
        // 3. Bot log analysis
        report.botLog = analyzeBotLog();

        // 4. Link graph integrity
        report.linkGraph = checkLinkGraph();
        if (report.linkGraph.available) {
            if (report.linkGraph.brokenLinks.length > 0) {
                report.alerts.push({ level: 'CRITICAL', msg: `${report.linkGraph.brokenLinks.length} broken internal links in link graph` });
            }
            if (report.linkGraph.zeroInbound.length > 0) {
                report.alerts.push({ level: 'WARNING', msg: `${report.linkGraph.zeroInbound.length} pages with zero inbound links` });
            }
        }

        // 5. Data layer health
        report.dataLayer = checkDataLayer();
        if (report.dataLayer.aiContent.generated === 0) {
            report.alerts.push({ level: 'INFO', msg: 'No AI content blocks generated yet. Run: npm run build:ai-content' });
        }
    }

    // ─── Output ───────────────────────────────────────────────────────────────
    if (JSON_OUTPUT) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    console.log('══════════════════════════════════════════════════════');
    console.log('  WebNovis — SEO Monitoring Report');
    console.log('══════════════════════════════════════════════════════');
    console.log(`  Date: ${new Date().toLocaleDateString('it-IT')}\n`);

    // Sitemap
    console.log('─── Sitemap ───');
    console.log(`  Total URLs: ${report.sitemap.total}`);
    const cats = report.sitemap.categories;
    console.log(`  Geo (agenzia): ${cats.geo_agenzia} | Geo (realizzazione): ${cats.geo_realizzazione}`);
    console.log(`  Blog: ${cats.blog} | Servizi: ${cats.servizi} | Portfolio: ${cats.portfolio} | Core: ${cats.core}`);

    // Freshness
    if (report.freshness) {
        console.log('\n─── Content Freshness ───');
        if (report.freshness.critical.length === 0 && report.freshness.stale.length === 0) {
            console.log('  ✅ All pages updated within the last 90 days.');
        } else {
            if (report.freshness.critical.length > 0) {
                console.log(`  ⛔ ${report.freshness.critical.length} pages not updated in ${FRESHNESS_CRITICAL_DAYS}+ days`);
            }
            if (report.freshness.stale.length > 0) {
                console.log(`  ⚠ ${report.freshness.stale.length} pages not updated in ${FRESHNESS_WARN_DAYS}+ days`);
            }
        }
    }

    if (!FRESHNESS_ONLY) {
        // Bot log
        console.log('\n─── Bot Crawl Activity (last 7 days) ───');
        if (report.botLog.available && report.botLog.total > 0) {
            console.log(`  Total requests: ${report.botLog.total}`);
            for (const [bot, data] of Object.entries(report.botLog.bots)) {
                console.log(`  ${bot}: ${data.requests} requests, ${data.uniquePages} unique pages`);
            }
        } else {
            console.log('  No bot crawl data available.');
        }

        // Link graph
        if (report.linkGraph.available) {
            console.log('\n─── Link Graph Integrity ───');
            console.log(`  Pages: ${report.linkGraph.totalPages} | Links: ${report.linkGraph.totalLinks}`);
            console.log(`  Broken links: ${report.linkGraph.brokenLinks.length}`);
            console.log(`  Zero inbound: ${report.linkGraph.zeroInbound.length}`);
            console.log(`  Orphan files: ${report.linkGraph.orphanFiles.length}`);
        }

        // Data layer
        console.log('\n─── Data Layer ───');
        console.log(`  Cities: ${report.dataLayer.cities.total} (${report.dataLayer.cities.active} active)`);
        console.log(`  Services: ${report.dataLayer.services.total} (${report.dataLayer.services.core} core)`);
        console.log(`  AI content blocks: ${report.dataLayer.aiContent.generated} (${report.dataLayer.aiContent.coverage} coverage)`);
        console.log(`  Potential geo pages: ${report.dataLayer.potentialPages}`);
    }

    // Alerts
    if (report.alerts.length > 0) {
        console.log('\n─── Alerts ───');
        for (const alert of report.alerts) {
            const icon = alert.level === 'CRITICAL' ? '⛔' : alert.level === 'WARNING' ? '⚠' : 'ℹ';
            console.log(`  ${icon} [${alert.level}] ${alert.msg}`);
        }
    }

    console.log('\n══════════════════════════════════════════════════════');
}

main();
