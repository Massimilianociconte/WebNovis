#!/usr/bin/env node
/**
 * IndexNow — Proactive URL submission to search engines.
 * 
 * Usage:
 *   node scripts/indexnow-notify.js <url1> [url2] [url3] ...
 *   node scripts/indexnow-notify.js --sitemap    # Submit all URLs from sitemap.xml
 *   node scripts/indexnow-notify.js --recent 7   # Submit URLs modified in last 7 days
 * 
 * IndexNow instantly notifies Bing, Yandex, Seznam, Naver of new/updated content.
 * Google doesn't support IndexNow yet but may in the future.
 * 
 * Key: fcba07953b913918408db7ab2f9331dc
 * Key file: https://www.webnovis.com/fcba07953b913918408db7ab2f9331dc.txt
 */

const fs = require('fs');
const path = require('path');

const HOST = 'www.webnovis.com';
const KEY = 'fcba07953b913918408db7ab2f9331dc';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow';

async function submitUrls(urls) {
    if (urls.length === 0) {
        console.log('⚠️  No URLs to submit.');
        return;
    }

    console.log(`📤 Submitting ${urls.length} URL(s) to IndexNow...`);

    // IndexNow batch API (max 10,000 URLs per request)
    const body = JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls
    });

    try {
        const response = await fetch(INDEXNOW_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body
        });

        if (response.ok || response.status === 202) {
            console.log(`✅ Success! ${urls.length} URLs submitted (HTTP ${response.status})`);
        } else {
            const text = await response.text();
            console.error(`❌ IndexNow returned HTTP ${response.status}: ${text}`);
        }
    } catch (err) {
        console.error(`❌ Network error: ${err.message}`);
    }
}

function getUrlsFromSitemap() {
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const urls = [];
    const matches = content.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const m of matches) {
        urls.push(m[1]);
    }
    return urls;
}

function getRecentUrls(days) {
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    const content = fs.readFileSync(sitemapPath, 'utf8');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const urls = [];
    const urlBlocks = content.matchAll(/<url>([\s\S]*?)<\/url>/g);
    for (const block of urlBlocks) {
        const locMatch = block[1].match(/<loc>([^<]+)<\/loc>/);
        const modMatch = block[1].match(/<lastmod>([^<]+)<\/lastmod>/);
        if (locMatch && modMatch && modMatch[1] >= cutoffStr) {
            urls.push(locMatch[1]);
        }
    }
    return urls;
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/indexnow-notify.js <url1> [url2] ...');
    console.log('  node scripts/indexnow-notify.js --sitemap');
    console.log('  node scripts/indexnow-notify.js --recent <days>');
    process.exit(0);
}

let urls = [];

if (args[0] === '--sitemap') {
    urls = getUrlsFromSitemap();
    console.log(`📋 Found ${urls.length} URLs in sitemap.xml`);
} else if (args[0] === '--recent') {
    const days = parseInt(args[1]) || 7;
    urls = getRecentUrls(days);
    console.log(`📋 Found ${urls.length} URLs modified in last ${days} days`);
} else {
    urls = args.filter(a => a.startsWith('http'));
}

submitUrls(urls);
