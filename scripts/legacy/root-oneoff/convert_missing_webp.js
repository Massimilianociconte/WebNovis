const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const missing = [
  'Img/blog/blog-come-scegliere-web-agency',
  'Img/seo-blog-aziendale',
  'Img/aggiornamenti-algoritmo-google-2026',
  'Img/blog/blog-lead-magnet-guida',
  'Img/blog/blog-heatmap-analisi-comportamento',
  'Img/blog/blog-exit-intent-popup',
  'Img/blog/blog-trust-signals-ecommerce',
  'Img/blog/blog-thank-you-page-ottimizzazione',
  'Img/blog/blog-personal-brand-consulente',
  'Img/blog/blog-social-commerce-guida',
  'Img/blog/blog-influencer-marketing-pmi',
  'Img/blog/blog-social-media-automation-tool',
  'Img/blog/blog-tendenze-social-media-2026',
  'Img/blog/blog-bounce-rate-ridurre',
  'Img/blog/blog-data-driven-marketing',
  'Img/blog/blog-marketing-plan-modello',
  'Img/blog/blog-customer-journey-mapping',
  'Img/blog/blog-unique-selling-proposition',
  'Img/blog/blog-omnichannel-strategia',
  'Img/blog/blog-growth-hacking-pmi',
  'Img/blog/blog-competitor-analysis-metodo',
  'Img/blog/blog-digital-transformation-pmi',
  'Img/blog/blog-outsourcing-vs-inhouse-marketing',
  'Img/blog/blog-retention-marketing-strategie',
  'Img/blog/blog-marketing-digitale-attivita-locali',
  'Img/blog/blog-email-vs-sms-marketing',
  'Img/blog/blog-sito-intelligenza-artificiale-limiti',
  'Img/blog/blog-tradurre-sito-web-guida',
  'Img/blog/blog-url-strane-search-console',
  'Img/blog/blog-engagement-sito-web-strategie',
  'Img/blog/blog-dati-obbligatori-sito-web',
  'Img/blog/blog-alternativa-linktree-link-in-bio',
  'Img/blog/blog-analisi-competitiva-online',
];

async function main() {
  let converted = 0, failed = 0, skipped = 0;

  for (const base of missing) {
    const webpPath = base + '.webp';
    
    if (fs.existsSync(webpPath)) {
      skipped++;
      continue;
    }

    // Find source PNG or JPG
    let srcPath = null;
    if (fs.existsSync(base + '.png')) srcPath = base + '.png';
    else if (fs.existsSync(base + '.jpg')) srcPath = base + '.jpg';
    else if (fs.existsSync(base + '.jpeg')) srcPath = base + '.jpeg';

    if (!srcPath) {
      console.log(`❌ NO SOURCE: ${base} (no png/jpg found)`);
      failed++;
      continue;
    }

    try {
      const srcStats = fs.statSync(srcPath);
      await sharp(srcPath)
        .webp({ quality: 85, effort: 6, smartSubsample: true })
        .toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      const savings = ((1 - webpStats.size / srcStats.size) * 100).toFixed(1);
      console.log(`✅ ${path.basename(srcPath)} → ${path.basename(webpPath)} (${(srcStats.size/1024).toFixed(0)}KB → ${(webpStats.size/1024).toFixed(0)}KB, -${savings}%)`);
      converted++;
    } catch (err) {
      console.log(`❌ ERROR: ${base}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${converted} converted, ${skipped} already existed, ${failed} failed`);
}

main();
