const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Massi\\.gemini\\antigravity\\brain\\96161af9-a01f-428f-b975-940b32e1a9bb';
const IMG_BLOG_DIR = path.join(__dirname, 'Img', 'blog');
const BLOG_INDEX = path.join(__dirname, 'blog', 'index.html');

// Mapping: slug -> artifact image filename prefix
const IMAGE_MAP = {
  'retention-marketing-strategie': 'retention_marketing',
  'marketing-digitale-attivita-locali': 'marketing_locale',
  'email-vs-sms-marketing': 'email_vs_sms',
  'sito-intelligenza-artificiale-limiti': 'ai_sito_limiti',
  'tradurre-sito-web-guida': 'tradurre_sito',
  'url-strane-search-console': 'url_search_console',
  'engagement-sito-web-strategie': 'engagement_sito',
  'dati-obbligatori-sito-web': 'dati_obbligatori',
  'alternativa-linktree-link-in-bio': 'alternativa_linktree',
  'canva-vs-designer-professionista': 'canva_vs_designer',
  'pagina-prezzi-ottimizzazione': 'pagina_prezzi',
  'copywriting-persuasivo-web': 'copywriting_web',
  'lead-magnet-guida': 'lead_magnet',
  'heatmap-analisi-comportamento': 'heatmap_analisi',
  'exit-intent-popup': 'exit_intent',
  'trust-signals-ecommerce': 'trust_signals',
  'thank-you-page-ottimizzazione': 'thank_you_page',
};

// Step 1: Find and copy images
let copied = 0;
const copiedSlugs = [];

for (const [slug, prefix] of Object.entries(IMAGE_MAP)) {
  const files = fs.readdirSync(ARTIFACT_DIR).filter(f => f.startsWith(prefix + '_') && f.endsWith('.png'));
  if (files.length === 0) {
    console.log(`SKIP: No image found for ${slug} (prefix: ${prefix})`);
    continue;
  }
  // Pick the most recent one
  files.sort();
  const srcFile = path.join(ARTIFACT_DIR, files[files.length - 1]);
  const destFile = path.join(IMG_BLOG_DIR, `blog-${slug}.png`);
  fs.copyFileSync(srcFile, destFile);
  copied++;
  copiedSlugs.push(slug);
  console.log(`COPIED: ${files[files.length-1]} -> blog-${slug}.png`);
}

console.log(`\nTotal images copied: ${copied}`);

// Step 2: Update blog/index.html
let html = fs.readFileSync(BLOG_INDEX, 'utf8');
let updated = 0;

for (const slug of copiedSlugs) {
  const imgBase = `blog/blog-${slug}`;

  // Pattern: within the card for this slug, replace category placeholder in srcset and src
  const cardPattern = new RegExp(
    `(href="${slug}\\.html"\\s+class="blog-card-image"[\\s\\S]*?srcset="\\.\\./Img/)blog-cat-[^"]+(\\.webp"[\\s\\S]*?src="\\.\\./Img/)blog-cat-[^"]+(\\.png")`,
    'g'
  );

  const newHtml = html.replace(cardPattern, `$1${imgBase}$2${imgBase}$3`);
  if (newHtml !== html) {
    html = newHtml;
    updated++;
    console.log(`UPDATED HTML: ${slug}`);
  } else {
    console.log(`NOT FOUND in HTML: ${slug}`);
  }
}

fs.writeFileSync(BLOG_INDEX, html, 'utf8');
console.log(`\nTotal HTML references updated: ${updated}`);
