const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const brainDir = '/Users/massimilianociconte/.gemini/antigravity/brain/861f0a17-62bd-4446-9d3d-65fd1d6ebf86';
const baseDir = '/Users/massimilianociconte/Documents/Progetti/Webnovis_kiro - backup';
const imgBlogDir = path.join(baseDir, 'Img', 'blog');

const covers = [
  {
    slug: 'ai-act-2026-obblighi',
    source: path.join(brainDir, 'ai_act_cover_1788627199284.jpg'),
    alt: "Scultura geometrica minimalista con bilancia della giustizia e marmo scuro, rappresentante la conformità normativa e gli obblighi dell'AI Act 2026 per siti web aziendali"
  },
  {
    slug: 'sito-web-che-non-converte',
    source: path.join(brainDir, 'conversion_leak_cover_1788627210145.jpg'),
    alt: "Clessidra scultorea in vetro fumé e sabbia dorata su cemento levigato, metafora dell'ottimizzazione del tasso di conversione e della dispersione di contatti sul sito web"
  },
  {
    slug: 'sanzioni-sito-non-accessibile-2026',
    source: path.join(brainDir, 'web_accessibility_cover_1788627220802.jpg'),
    alt: "Sigillo scultoreo in ottone con rilievi tattili su pietra vulcanica scura, simbolo dei requisiti di accessibilità web e sanzioni dell'European Accessibility Act"
  },
  {
    slug: 'dominio-hosting-guida-non-tecnico',
    source: path.join(brainDir, 'domain_hosting_cover_1788627231805.jpg'),
    alt: "Monolite in granito levigato e ottone su base architettonica illuminata, simboleggiante l'infrastruttura solida di hosting web professionale e registrazione dominio aziendale"
  },
  {
    slug: 'test-ab-sito-web-guida',
    source: path.join(brainDir, 'ab_testing_cover_1788627250927.jpg'),
    alt: "Due prismi ottici geometrici su piano scuro che riflettono due fasci di luce paralleli, rappresentazione concettuale di test A/B e ottimizzazione conversioni CRO"
  },
  {
    slug: 'automazione-marketing-pmi-strumenti',
    source: path.join(brainDir, 'marketing_automation_cover_1788627262144.jpg'),
    alt: "Scultura cinetica con ingranaggi di precisione in ottone spazzolato su sfondo scuro, metafora dei workflow di automazione marketing per piccole e medie imprese"
  },
  {
    slug: 'google-business-profile-ottimizzazione',
    source: path.join(brainDir, 'local_business_cover_1788627273938.jpg'),
    alt: "Pin geografico architettonico in ottone posizionato su mappa topografica tridimensionale in pietra, simboleggiante l'ottimizzazione di Google Business Profile e Local SEO"
  },
  {
    slug: 'cosa-scrivere-sito-web-aziendale',
    source: path.join(brainDir, 'website_copywriting_cover_1788627284500.jpg'),
    alt: "Penna stilografica d'autore su carta artigianale con luce radente su noce scuro, rappresentante il copywriting persuasivo e la stesura testi per siti web aziendali"
  },
  {
    slug: 'come-aprire-ecommerce-da-zero',
    source: path.join(brainDir, 'ecommerce_launch_cover_1788627303046.jpg'),
    alt: "Confezione packaging di lusso in cartone materico nero su piedistallo di marmo chiaro, simboleggiante l'apertura e il lancio strategico di un negozio e-commerce da zero"
  },
  {
    slug: 'quanto-costa-pubblicita-google-ads',
    source: path.join(brainDir, 'google_ads_budget_cover_1788627313386.jpg'),
    alt: "Lente ottica da banco di precisione con riflessi caldi su piano millimetrato, simbolo del calcolo del ROI e gestione budget per campagne pubblicitarie Google Ads"
  },
  {
    slug: 'come-velocizzare-sito-web-lento',
    source: path.join(brainDir, 'web_speed_perf_cover_1788627323484.jpg'),
    alt: "Scultura aerodinamica a flusso d'aria in titanio lucidato su fondo scuro, rappresentazione visiva di velocità di caricamento, performance web e Core Web Vitals"
  },
  {
    slug: 'quanto-costa-mantenere-sito-web',
    source: path.join(brainDir, 'site_maintenance_cover_1788627333989.jpg'),
    alt: "Manometro di calibrazione di precisione in ottone e vetro minerale, simbolo della manutenzione preventiva, aggiornamenti e controllo costi annuali di un sito web"
  },
  {
    slug: 'come-proteggere-sito-web-hacker',
    source: path.join(baseDir, 'Img', 'blog', 'cyber-security-pmi.png'),
    alt: "Monolite di sicurezza in titanio spazzolato con finitura protettiva blindata, rappresentazione della sicurezza informatica e protezione hacker per siti web aziendali"
  },
  {
    slug: 'seo-youtube-video',
    source: path.join(baseDir, 'Img', 'blog', 'seo-youtube-video.png'),
    alt: "Prisma ottico e cilindro scultoreo con riflessione luminosa prismatica su piedistallo scuro, simboleggiante l'ottimizzazione SEO e l'algoritmo di ranking dei video YouTube"
  },
  {
    slug: 'importanza-del-design-siti-web',
    source: path.join(baseDir, 'Img', 'rho-web-design-studio.png'),
    alt: "Studio professionale di web design e visual communication con monitor calibrato, rappresentante la progettazione UX e UI sartoriale per siti web"
  },
  {
    slug: 'caffe-sempione-caso-studio-locale',
    source: '/tmp/coffee_beans.jpg',
    alt: "Macro fotografica di chicchi di caffè artigianali tostati di qualità superiore, caso studio di marketing locale e digital branding per il Caffè Sempione"
  },
  {
    slug: 'ia-cartelle-cliniche-previsione-malattie',
    source: '/tmp/biotech_abstract.jpg',
    alt: "Imaging diagnostico biomedico ad alta risoluzione con reticolo analitico, rappresentazione dell'intelligenza artificiale applicata all'analisi delle cartelle cliniche elettroniche"
  },
  {
    slug: 'quanto-costa-un-ecommerce',
    source: '/tmp/luxury_product_watch.jpg',
    alt: "Orologio meccanico di alta gamma fotografato su supporto espositivo minimalista, metafora del valore, funzionalità avanzate e costi di sviluppo di una piattaforma e-commerce"
  },
  {
    slug: 'gdpr-sito-web-conformita',
    source: path.join(baseDir, 'Img', 'blog', 'gdpr-sito-web-conformita.png'),
    alt: "Scudo protettivo scultoreo in cristallo satinato e cornice metallica, simbolo della conformità GDPR, cookie policy e tutela della privacy per siti web"
  }
];

async function run() {
  console.log('Processing', covers.length, 'covers into Img/blog/ ...');
  for (const item of covers) {
    if (!fs.existsSync(item.source)) {
      console.error(`ERROR: Source missing for ${item.slug}: ${item.source}`);
      continue;
    }

    const targetWebp = path.join(imgBlogDir, `blog-${item.slug}.webp`);
    const targetPng = path.join(imgBlogDir, `blog-${item.slug}.png`);

    // 1. Generate WebP (800x450, 16:9 ratio, high quality, low weight)
    await sharp(item.source)
      .resize(800, 450, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 6 })
      .toFile(targetWebp);

    const statWebp = fs.statSync(targetWebp);

    // 2. Generate PNG fallback (1200x675 for OpenGraph/Twitter crisp cards)
    await sharp(item.source)
      .resize(1200, 675, { fit: 'cover', position: 'center' })
      .png({ compressionLevel: 9, effort: 7 })
      .toFile(targetPng);

    const statPng = fs.statSync(targetPng);

    console.log(`[OK] ${item.slug}:`);
    console.log(`     WebP: ${(statWebp.size / 1024).toFixed(1)} KB -> ${targetWebp}`);
    console.log(`     PNG:  ${(statPng.size / 1024).toFixed(1)} KB -> ${targetPng}`);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
