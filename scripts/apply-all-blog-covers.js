const fs = require('fs');
const path = require('path');

const covers = [
  {
    slug: 'ai-act-2026-obblighi',
    alt: "Scultura geometrica minimalista con bilancia della giustizia e marmo scuro, rappresentante la conformità normativa e gli obblighi dell'AI Act 2026 per siti web aziendali"
  },
  {
    slug: 'sito-web-che-non-converte',
    alt: "Clessidra scultorea in vetro fumé e sabbia dorata su cemento levigato, metafora dell'ottimizzazione del tasso di conversione e della dispersione di contatti sul sito web"
  },
  {
    slug: 'sanzioni-sito-non-accessibile-2026',
    alt: "Sigillo scultoreo in ottone con rilievi tattili su pietra vulcanica scura, simbolo dei requisiti di accessibilità web e sanzioni dell'European Accessibility Act"
  },
  {
    slug: 'dominio-hosting-guida-non-tecnico',
    alt: "Monolite in granito levigato e ottone su base architettonica illuminata, simboleggiante l'infrastruttura solida di hosting web professionale e registrazione dominio aziendale"
  },
  {
    slug: 'test-ab-sito-web-guida',
    alt: "Due prismi ottici geometrici su piano scuro che riflettono due fasci di luce paralleli, rappresentazione concettuale di test A/B e ottimizzazione conversioni CRO"
  },
  {
    slug: 'automazione-marketing-pmi-strumenti',
    alt: "Scultura cinetica con ingranaggi di precisione in ottone spazzolato su sfondo scuro, metafora dei workflow di automazione marketing per piccole e medie imprese"
  },
  {
    slug: 'google-business-profile-ottimizzazione',
    alt: "Pin geografico architettonico in ottone posizionato su mappa topografica tridimensionale in pietra, simboleggiante l'ottimizzazione di Google Business Profile e Local SEO"
  },
  {
    slug: 'cosa-scrivere-sito-web-aziendale',
    alt: "Penna stilografica d'autore su carta artigianale con luce radente su noce scuro, rappresentante il copywriting persuasivo e la stesura testi per siti web aziendali"
  },
  {
    slug: 'come-aprire-ecommerce-da-zero',
    alt: "Confezione packaging di lusso in cartone materico nero su piedistallo di marmo chiaro, simboleggiante l'apertura e il lancio strategico di un negozio e-commerce da zero"
  },
  {
    slug: 'quanto-costa-pubblicita-google-ads',
    alt: "Lente ottica da banco di precisione con riflessi caldi su piano millimetrato, simbolo del calcolo del ROI e gestione budget per campagne pubblicitarie Google Ads"
  },
  {
    slug: 'come-velocizzare-sito-web-lento',
    alt: "Scultura aerodinamica a flusso d'aria in titanio lucidato su fondo scuro, rappresentazione visiva di velocità di caricamento, performance web e Core Web Vitals"
  },
  {
    slug: 'quanto-costa-mantenere-sito-web',
    alt: "Manometro di calibrazione di precisione in ottone e vetro minerale, simbolo della manutenzione preventiva, aggiornamenti e controllo costi annuali di un sito web"
  },
  {
    slug: 'come-proteggere-sito-web-hacker',
    alt: "Monolite di sicurezza in titanio spazzolato con finitura protettiva blindata, rappresentazione della sicurezza informatica e protezione hacker per siti web aziendali"
  },
  {
    slug: 'seo-youtube-video',
    alt: "Prisma ottico e cilindro scultoreo con riflessione luminosa prismatica su piedistallo scuro, simboleggiante l'ottimizzazione SEO e l'algoritmo di ranking dei video YouTube"
  },
  {
    slug: 'importanza-del-design-siti-web',
    alt: "Studio professionale di web design e visual communication con monitor calibrato, rappresentante la progettazione UX e UI sartoriale per siti web"
  },
  {
    slug: 'caffe-sempione-caso-studio-locale',
    alt: "Macro fotografica di chicchi di caffè artigianali tostati di qualità superiore, caso studio di marketing locale e digital branding per il Caffè Sempione"
  },
  {
    slug: 'ia-cartelle-cliniche-previsione-malattie',
    alt: "Imaging diagnostico biomedico ad alta risoluzione con reticolo analitico, rappresentazione dell'intelligenza artificiale applicata all'analisi delle cartelle cliniche elettroniche"
  },
  {
    slug: 'quanto-costa-un-ecommerce',
    alt: "Orologio meccanico di alta gamma fotografato su supporto espositivo minimalista, metafora del valore, funzionalità avanzate e costi di sviluppo di una piattaforma e-commerce"
  },
  {
    slug: 'gdpr-sito-web-conformita',
    alt: "Scudo protettivo scultoreo in cristallo satinato e cornice metallica, simbolo della conformità GDPR, cookie policy e tutela della privacy per siti web"
  }
];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 1. UPDATE blog/index.html
const blogIndexPath = path.join(__dirname, '..', 'blog', 'index.html');
let blogIndexHtml = fs.readFileSync(blogIndexPath, 'utf8');

let indexUpdatedCount = 0;
for (const item of covers) {
  const slug = item.slug;
  const escapedAlt = escapeHtml(item.alt);
  const newPicture = `<a href="${slug}.html" class="blog-card-image" style="display:block" aria-hidden="true" tabindex="-1"> <picture> <source srcset="../Img/blog/blog-${slug}.webp" type="image/webp"> <img alt="${escapedAlt}" height="450" src="../Img/blog/blog-${slug}.png" width="800" loading="lazy" fetchpriority="auto" decoding="async"> </picture> </a>`;

  const cardLinkRe = new RegExp(`<a\\s+href="${slug}\\.html"\\s+class="blog-card-image"[^>]*>[\\s\\S]*?<\\/a>`);
  if (cardLinkRe.test(blogIndexHtml)) {
    blogIndexHtml = blogIndexHtml.replace(cardLinkRe, newPicture);
    indexUpdatedCount++;
  } else {
    console.warn(`Card link not found in index.html for: ${slug}`);
  }
}

fs.writeFileSync(blogIndexPath, blogIndexHtml, 'utf8');
console.log(`[OK] Updated ${indexUpdatedCount} / ${covers.length} cards in blog/index.html`);

// 2. UPDATE EACH ARTICLE HTML FILE
let articlesUpdatedCount = 0;
for (const item of covers) {
  const slug = item.slug;
  const articleFile = path.join(__dirname, '..', 'blog', `${slug}.html`);
  if (!fs.existsSync(articleFile)) {
    console.warn(`Article file not found: ${articleFile}`);
    continue;
  }

  let html = fs.readFileSync(articleFile, 'utf8');
  const imageUrl = `https://www.webnovis.com/Img/blog/blog-${slug}.png`;
  const escapedAlt = escapeHtml(item.alt);

  // Remove existing width/height/alt meta if present to avoid duplicates
  html = html.replace(/<meta\s+[^>]*property="og:image:width"[^>]*>/gi, "");
  html = html.replace(/<meta\s+[^>]*property="og:image:height"[^>]*>/gi, "");
  html = html.replace(/<meta\s+[^>]*property="og:image:alt"[^>]*>/gi, "");

  // Replace og:image
  const ogImageReplacement = `<meta property="og:image" content="${imageUrl}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="675">\n    <meta property="og:image:alt" content="${escapedAlt}">`;
  if (/<meta\s+[^>]*property="og:image"[^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+[^>]*property="og:image"[^>]*>/i, ogImageReplacement);
  } else {
    html = html.replace('</head>', `    ${ogImageReplacement}\n</head>`);
  }

  // Replace twitter:image
  const twImageReplacement = `<meta property="twitter:image" content="${imageUrl}">`;
  if (/<meta\s+[^>]*(?:property|name)="twitter:image"[^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+[^>]*(?:property|name)="twitter:image"[^>]*>/i, twImageReplacement);
  } else {
    html = html.replace('</head>', `    ${twImageReplacement}\n</head>`);
  }

  // Update JSON-LD BlogPosting / Article schema image
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (fullMatch, jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      if (data["@type"] === "BlogPosting" || data["@type"] === "Article") {
        data.image = imageUrl;
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      }
    } catch(e) {}
    return fullMatch;
  });

  fs.writeFileSync(articleFile, html, 'utf8');
  articlesUpdatedCount++;
}

console.log(`[OK] Updated ${articlesUpdatedCount} / ${covers.length} individual article files.`);

