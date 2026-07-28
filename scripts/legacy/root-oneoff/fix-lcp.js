const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { JSDOM } = require('jsdom');

const BLOG_HTML_PATH = path.join(__dirname, 'blog', 'index.html');
const IMG_BLOG_DIR = path.join(__dirname, 'Img', 'blog');

async function convertMissingWebps() {
    console.log('--- STARTING IMAGE CONVERSION ---');
    const files = fs.readdirSync(IMG_BLOG_DIR);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    let converted = 0;
    for (const file of pngFiles) {
        const basename = path.basename(file, '.png');
        const webpPath = path.join(IMG_BLOG_DIR, `${basename}.webp`);
        const pngPath = path.join(IMG_BLOG_DIR, file);
        
        if (!fs.existsSync(webpPath)) {
            console.log(`Converting ${file} to ${basename}.webp...`);
            await sharp(pngPath)
                .webp({ quality: 80, effort: 6 })
                .toFile(webpPath);
            converted++;
        }
    }
    console.log(`Converted ${converted} PNGs to WebP.`);
    console.log('--- IMAGE CONVERSION DONE ---\n');
}

async function fixHtmlLCP() {
    console.log('--- STARTING HTML LCP FIXES ---');
    const htmlContent = fs.readFileSync(BLOG_HTML_PATH, 'utf-8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const cards = document.querySelectorAll('.blog-card');
    
    let preloadAdded = false;

    cards.forEach((card, index) => {
        const source = card.querySelector('source');
        const img = card.querySelector('img');
        
        // 1. Fix incorrect <source> type="image/png"
        if (source) {
            const srcset = source.getAttribute('srcset') || '';
            const type = source.getAttribute('type');
            
            if (type === 'image/png' || srcset.includes('.png')) {
                source.setAttribute('type', 'image/webp');
                source.setAttribute('srcset', srcset.replace(/\.png$/, '.webp'));
            }
            
            // Add Sizes descriptor to both
            source.setAttribute('sizes', '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
            
            if (img && index === 0 && !preloadAdded) {
                // Add <link rel="preload"> for the very first LCP image
                const preloadLink = document.createElement('link');
                preloadLink.setAttribute('rel', 'preload');
                preloadLink.setAttribute('as', 'image');
                preloadLink.setAttribute('href', source.getAttribute('srcset'));
                preloadLink.setAttribute('type', 'image/webp');
                preloadLink.setAttribute('fetchpriority', 'high');
                document.head.appendChild(preloadLink);
                preloadAdded = true;
                console.log('Added preload for:', source.getAttribute('srcset'));
            }
        }

        // 2 & 3. Fix loading="lazy" for first 3 cards, set fetchpriority="high"
        if (img) {
             img.setAttribute('src', img.getAttribute('src').replace(/\.png$/, '.webp')); // might as well ensure fallback is webp or keeping it png is fine, let's keep png as fallback

             if (index < 3) {
                 // Above the fold - eager loading
                 img.removeAttribute('loading'); 
                 img.setAttribute('loading', 'eager');
                 img.setAttribute('fetchpriority', 'high');
                 img.setAttribute('decoding', 'sync'); // We want it parsed synchronously
             } else {
                 // Below the fold - lazy loading
                 img.setAttribute('loading', 'lazy');
                 img.setAttribute('fetchpriority', 'auto');
                 img.setAttribute('decoding', 'async');
             }
        }
    });

    const outputHtml = dom.serialize();
    fs.writeFileSync(BLOG_HTML_PATH, outputHtml, 'utf-8');
    console.log(`Updated ${cards.length} blog cards in index.html.`);
    console.log('--- HTML LCP FIXES DONE ---\n');
}

async function fixHomePage() {
   // Let's verify and fix index.html just in case there are similar issues.
   const INDEX_HTML_PATH = path.join(__dirname, 'index.html');
   if(!fs.existsSync(INDEX_HTML_PATH)) return;

   const dom = new JSDOM(fs.readFileSync(INDEX_HTML_PATH, 'utf-8'));
   const heroImg = dom.window.document.querySelector('.hero-image img');
   if(heroImg && heroImg.getAttribute('loading') === 'lazy') {
       heroImg.removeAttribute('loading');
       heroImg.setAttribute('loading', 'eager');
       heroImg.setAttribute('fetchpriority', 'high');
       fs.writeFileSync(INDEX_HTML_PATH, dom.serialize(), 'utf-8');
       console.log('Fixed hero image in root index.html to load eager.');
   }
}

async function main() {
    try {
        await convertMissingWebps();
        await fixHtmlLCP();
        await fixHomePage();
        console.log('ALL OPTIMIZATIONS COMPLETE.');
    } catch (e) {
        console.error('Error during optimization:', e);
    }
}

main();
