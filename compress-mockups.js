/**
 * Compress portfolio mockup images to optimized WebP
 * Generates two sizes: 800w (desktop) and 400w (mobile)
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'Img', 'Mockup-images-GBP', 'mockup-giusti');
const DEST = path.join(__dirname, 'Img', 'portfolio');

async function main() {
    if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

    const files = fs.readdirSync(SRC).filter(f => f.endsWith('.png'));
    console.log(`Found ${files.length} mockup PNGs to compress\n`);

    let totalOrig = 0, totalNew = 0;

    for (const file of files) {
        const src = path.join(SRC, file);
        const base = file.replace('.png', '');
        const origSize = fs.statSync(src).size;
        totalOrig += origSize;

        // Desktop: 800px wide
        const dest800 = path.join(DEST, `${base}-800.webp`);
        await sharp(src)
            .resize(800, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80, effort: 6, smartSubsample: true })
            .toFile(dest800);

        // Mobile: 400px wide
        const dest400 = path.join(DEST, `${base}-400.webp`);
        await sharp(src)
            .resize(400, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 75, effort: 6, smartSubsample: true })
            .toFile(dest400);

        const size800 = fs.statSync(dest800).size;
        const size400 = fs.statSync(dest400).size;
        totalNew += size800 + size400;

        const meta = await sharp(src).metadata();
        console.log(`  ${file} (${(origSize/1024/1024).toFixed(1)}MB, ${meta.width}x${meta.height})`);
        console.log(`    → ${base}-800.webp (${(size800/1024).toFixed(0)}KB)`);
        console.log(`    → ${base}-400.webp (${(size400/1024).toFixed(0)}KB)`);
    }

    console.log(`\nTotal original: ${(totalOrig/1024/1024).toFixed(1)}MB`);
    console.log(`Total compressed: ${(totalNew/1024/1024).toFixed(1)}MB`);
    console.log(`Savings: ${((1 - totalNew/totalOrig) * 100).toFixed(1)}%`);
}

main().catch(e => { console.error(e); process.exit(1); });
