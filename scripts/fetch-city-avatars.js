require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'Img', 'cities');
const citiesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'cities.json'), 'utf8'));
const cities = citiesData.cities;
const WIKIPEDIA_TITLE_OVERRIDES = {
    'magenta': 'Magenta_(Italia)',
    'solaro': 'Solaro_(Italia)',
    'milano-ovest': 'Milano',
    'milano-nord': 'Milano'
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const cityArg = args.find((arg) => arg.startsWith('--city='));
const onlyCities = new Set(
    (cityArg ? cityArg.split('=')[1] : '')
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getWikiTitle(city) {
    if (WIKIPEDIA_TITLE_OVERRIDES[city.slug]) {
        return WIKIPEDIA_TITLE_OVERRIDES[city.slug];
    }
    if (!city.wikipedia) return '';
    const pathname = new URL(city.wikipedia).pathname;
    const slug = pathname.split('/').pop() || '';
    return decodeURIComponent(slug);
}

async function getJson(url) {
    const response = await fetch(url, {
        headers: {
            'user-agent': 'WebNovis city avatar fetcher/1.0'
        }
    });
    if (!response.ok) {
        throw new Error(`Request failed ${response.status} for ${url}`);
    }
    return response.json();
}

async function downloadBuffer(url) {
    let attempt = 0;
    let waitMs = 1200;

    while (attempt < 5) {
        const response = await fetch(url, {
            headers: {
                'user-agent': 'WebNovis city avatar fetcher/1.0',
                referer: 'https://www.webnovis.com/'
            }
        });

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }

        if (response.status !== 429) {
            throw new Error(`Download failed ${response.status} for ${url}`);
        }

        attempt += 1;
        if (attempt >= 5) {
            throw new Error(`Download failed 429 for ${url}`);
        }

        await sleep(waitMs);
        waitMs *= 2;
    }
}

async function fetchSummaryAvatar(city) {
    const wikiTitle = getWikiTitle(city);
    if (!wikiTitle) {
        throw new Error(`Missing Wikipedia URL for ${city.slug}`);
    }

    const summaryUrl = `https://it.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const summary = await getJson(summaryUrl);
    const imageUrl =
        summary?.thumbnail?.source ||
        summary?.originalimage?.source;

    if (!imageUrl) {
        throw new Error(`No thumbnail found for ${city.slug}`);
    }

    return {
        imageUrl,
        sourceUrl: summary?.content_urls?.desktop?.page || city.wikipedia,
        provider: 'Wikipedia REST summary thumbnails'
    };
}

async function fetchPageImagesAvatar(city) {
    const wikiTitle = getWikiTitle(city);
    if (!wikiTitle) {
        throw new Error(`Missing Wikipedia URL for ${city.slug}`);
    }

    const apiUrl = `https://it.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail|name&pithumbsize=512&titles=${encodeURIComponent(wikiTitle)}`;
    const payload = await getJson(apiUrl);
    const pages = payload?.query?.pages || {};
    const firstPage = Object.values(pages)[0];
    const imageUrl = firstPage?.thumbnail?.source;

    if (!imageUrl) {
        throw new Error(`No page image found for ${city.slug}`);
    }

    return {
        imageUrl,
        sourceUrl: city.wikipedia,
        provider: 'MediaWiki pageimages fallback'
    };
}

async function fetchCityAvatar(city) {
    try {
        return await fetchSummaryAvatar(city);
    } catch (summaryError) {
        return fetchPageImagesAvatar(city).catch((pageImageError) => {
            throw new Error(`${summaryError.message}; fallback failed: ${pageImageError.message}`);
        });
    }
}

async function optimizeAvatar(inputBuffer, outputPath) {
    const base = sharp(inputBuffer, { failOn: 'none' });
    const metadata = await base.metadata();
    const size = Math.min(metadata.width || 160, metadata.height || 160);
    const left = metadata.width && metadata.width > size ? Math.floor((metadata.width - size) / 2) : 0;
    const top = metadata.height && metadata.height > size ? Math.floor((metadata.height - size) / 2) : 0;

    await base
        .extract({ left, top, width: size, height: size })
        .resize(160, 160, { fit: 'cover', position: 'attention' })
        .webp({ quality: 76, effort: 5 })
        .toFile(outputPath);
}

async function main() {
    if (!DRY_RUN) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const manifest = [];
    const selectedCities = cities.filter((city) => onlyCities.size === 0 || onlyCities.has(city.slug));
    const selectedSlugs = new Set(selectedCities.map((city) => city.slug));

    for (const city of cities) {
        const outFile = path.join(OUTPUT_DIR, `${city.slug}.webp`);
        const shouldProcess = selectedSlugs.size === 0 || selectedSlugs.has(city.slug);

        if (!shouldProcess) {
            manifest.push({
                slug: city.slug,
                file: fs.existsSync(outFile) ? `Img/cities/${city.slug}.webp` : '',
                source: city.wikipedia,
                status: fs.existsSync(outFile) ? 'existing' : 'missing'
            });
            continue;
        }

        if (!FORCE && fs.existsSync(outFile)) {
            manifest.push({ slug: city.slug, file: `Img/cities/${city.slug}.webp`, source: city.wikipedia, status: 'existing' });
            console.log(`↷ ${city.slug}: existing`);
            continue;
        }

        try {
            const { imageUrl, sourceUrl, provider } = await fetchCityAvatar(city);
            if (!DRY_RUN) {
                const imageBuffer = await downloadBuffer(imageUrl);
                await optimizeAvatar(imageBuffer, outFile);
            }
            manifest.push({ slug: city.slug, file: `Img/cities/${city.slug}.webp`, source: sourceUrl, provider, status: DRY_RUN ? 'planned' : 'downloaded' });
            console.log(`✓ ${city.slug}: ${DRY_RUN ? 'planned' : 'downloaded'}`);
        } catch (error) {
            manifest.push({ slug: city.slug, file: '', source: city.wikipedia, status: 'missing', error: error.message });
            console.warn(`⚠ ${city.slug}: ${error.message}`);
        }

        await sleep(1400);
    }

    const manifestPath = path.join(ROOT, 'data', 'city-avatars-manifest.json');
    if (!DRY_RUN) {
        fs.writeFileSync(manifestPath, JSON.stringify({
            generatedAt: new Date().toISOString(),
            provider: 'Wikipedia summary thumbnails + MediaWiki pageimages fallback',
            items: manifest
        }, null, 2));
    }

    console.log(`Done. Processed ${selectedCities.length} cities${DRY_RUN ? ' (dry run)' : ''}.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
