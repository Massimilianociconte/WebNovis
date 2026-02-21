/**
 * WebNovis — Image to WebP Converter
 * 
 * Converts all PNG/JPG images in Img/ to WebP format with near-identical quality.
 * Keeps original PNG files as fallback (for og:image, favicon, manifest etc.).
 * Updates CSS background-image references to use WebP.
 * 
 * Usage: node convert-webp.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.join(__dirname, 'Img');
const CSS_DIR = path.join(__dirname, 'css');

// Quality settings — high quality to maintain visual fidelity
const WEBP_QUALITY = 85;           // General images (portfolio, logos)
const WEBP_QUALITY_HERO = 90;      // Hero background — needs to look pristine
const WEBP_QUALITY_SMALL = 90;     // Small icons/avatars — keep sharp

// Files that should NOT be converted (favicons must stay PNG for browser compat)
const SKIP_FILES = ['favicon.png', 'react.svg'];

// Files that need maximum quality (hero backgrounds, key visuals)
const HIGH_QUALITY_FILES = ['sfondo.png'];

// Small files (<50KB) get higher quality to avoid artifacts on small icons
const SMALL_FILE_THRESHOLD = 50 * 1024; // 50KB

async function convertImage(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    
    // Skip non-image or excluded files
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null;
    if (SKIP_FILES.includes(fileName)) {
        console.log(`  [SKIP] ${fileName} (excluded)`);
        return null;
    }

    const webpName = fileName.replace(/\.(png|jpe?g)$/i, '.webp');
    const webpPath = path.join(IMG_DIR, webpName);
    const stats = fs.statSync(filePath);
    const originalSizeKB = (stats.size / 1024).toFixed(1);

    // Determine quality based on file type
    let quality = WEBP_QUALITY;
    if (HIGH_QUALITY_FILES.includes(fileName)) {
        quality = WEBP_QUALITY_HERO;
    } else if (stats.size < SMALL_FILE_THRESHOLD) {
        quality = WEBP_QUALITY_SMALL;
    }

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        // For very large images (>2000px wide), resize to max 2560px for web
        let pipeline = image;
        if (metadata.width > 2560) {
            pipeline = pipeline.resize(2560, null, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        await pipeline
            .webp({
                quality: quality,
                effort: 6,         // Higher effort = better compression, slower
                smartSubsample: true,
                nearLossless: quality >= 90  // Near-lossless for high quality files
            })
            .toFile(webpPath);

        const webpStats = fs.statSync(webpPath);
        const webpSizeKB = (webpStats.size / 1024).toFixed(1);
        const savings = ((1 - webpStats.size / stats.size) * 100).toFixed(1);

        console.log(`  [OK] ${fileName} (${originalSizeKB} KB) -> ${webpName} (${webpSizeKB} KB) — saved ${savings}% [q=${quality}]`);
        
        return {
            original: fileName,
            webp: webpName,
            originalSize: stats.size,
            webpSize: webpStats.size,
            savings: parseFloat(savings)
        };
    } catch (err) {
        console.error(`  [ERR] ${fileName}: ${err.message}`);
        return null;
    }
}

function updateCSSReferences() {
    console.log('\n[INFO] Updating CSS background-image references...');
    
    const cssFile = path.join(CSS_DIR, 'style.css');
    let css = fs.readFileSync(cssFile, 'utf8');
    
    // Replace sfondo.png with sfondo.webp in background-image
    const oldRef = "url('../Img/sfondo.png')";
    const newRef = "url('../Img/sfondo.webp')";
    
    if (css.includes(oldRef)) {
        css = css.replace(oldRef, newRef);
        fs.writeFileSync(cssFile, css, 'utf8');
        console.log(`  [OK] style.css: ${oldRef} -> ${newRef}`);
    } else {
        console.log(`  [SKIP] style.css: sfondo.png reference not found (may already be updated)`);
    }
}

async function main() {
    console.log('[INFO] WebNovis Image-to-WebP Converter');
    console.log(`[INFO] Source: ${IMG_DIR}`);
    console.log(`[INFO] Quality: general=${WEBP_QUALITY}, hero=${WEBP_QUALITY_HERO}, small=${WEBP_QUALITY_SMALL}\n`);

    // Get all image files
    const files = fs.readdirSync(IMG_DIR)
        .filter(f => /\.(png|jpe?g)$/i.test(f))
        .map(f => path.join(IMG_DIR, f));

    console.log(`[INFO] Found ${files.length} images to process\n`);

    let results = [];
    let totalOriginal = 0;
    let totalWebp = 0;

    for (const file of files) {
        const result = await convertImage(file);
        if (result) {
            results.push(result);
            totalOriginal += result.originalSize;
            totalWebp += result.webpSize;
        }
    }

    // Update CSS references
    updateCSSReferences();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('[SUMMARY]');
    console.log(`  Images converted: ${results.length}`);
    console.log(`  Total original:   ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Total WebP:       ${(totalWebp / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Total saved:      ${((totalOriginal - totalWebp) / 1024 / 1024).toFixed(2)} MB (${((1 - totalWebp / totalOriginal) * 100).toFixed(1)}%)`);
    console.log('='.repeat(60));
    
    console.log('\n[IMPORTANT] Next steps:');
    console.log('  1. Run "node build.js" to regenerate minified CSS (sfondo.webp reference)');
    console.log('  2. Update HTML <img> tags to use <picture> with WebP + PNG fallback');
    console.log('  3. Keep original PNGs for og:image, favicon, and manifest (browsers require PNG)');
}

main().catch(err => {
    console.error('[FATAL]', err);
    process.exit(1);
});
