const prioritySnippets = require('./priority-snippets');
const { getClusterStrategicLinks } = require('./blog-cluster-links');
const { getIndexationDirectivesForPath } = require('./pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const NOINDEX_ROBOTS = 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const HOMEPAGE_HERO_OLD = '<h1 class="hero-title"> <span class="glitch gradient-text" data-text="Agenzia Digitale">Agenzia Digitale</span> che <span class="highlight-gold">Accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> La tua agenzia digitale a Milano per sviluppo web,<br> grafica e crescita della tua visibilità online </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div>';
const HOMEPAGE_CORE_LINKS_PATTERN = /<(?:p|nav) class="hero-core-links"[^>]*>[\s\S]*?<\/(?:p|nav)>/i;
const HOMEPAGE_CORE_LINKS_HTML = '<nav class="hero-core-links" aria-label="Percorsi principali" style="display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem"> <a href="/servizi/sviluppo-web.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Sviluppo Web</a> <a href="/servizi/graphic-design.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Graphic Design</a> <a href="/servizi/social-media.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Social Media</a> </nav>';
const HOMEPAGE_HERO_NEW = `<h1 class="hero-title"> <span class="glitch gradient-text" data-text="WebNovis">WebNovis</span><br> agenzia web a Rho e Milano che <span class="highlight-gold">accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> Siti web custom, e-commerce, branding e SEO locale<br> per PMI e professionisti tra Rho, Milano e hinterland </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div> ${HOMEPAGE_CORE_LINKS_HTML}`;
const HOMEPAGE_MOBILE_PRELOAD_OLD = '<link href="Img/sfondo-mobile.webp" rel="preload" media="(max-width: 768px)" as="image" fetchpriority="high" type="image/webp">';
const HOMEPAGE_MOBILE_PRELOAD_NEW = '<link href="Img/sfondo-mobile-hq.webp" rel="preload" media="(max-width: 768px)" as="image" fetchpriority="high" type="image/webp">';
const HOMEPAGE_FONT_PRELOAD_PATTERN = /\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;600;700&family=Space\+Grotesk:wght@600;700&family=Syne:wght@600;700;800&display=swap" rel="preload" as="style">\s*/i;
const STRATEGIC_LINKS_STYLE_BLOCK = '<style data-webnovis-cluster-links>.article-strategic-links{padding:2.4rem 0;border-top:1px solid rgba(255,255,255,.06)}.article-strategic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.35rem}.article-strategic-card{display:block;padding:1.3rem;border-radius:14px;border:1px solid rgba(96,165,250,.18);background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(91,106,174,.08) 100%);text-decoration:none!important;transition:transform .2s ease,border-color .2s ease,background .2s ease}.article-strategic-card:hover{transform:translateY(-2px);border-color:rgba(96,165,250,.35);background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(91,106,174,.13) 100%)}.article-strategic-label{display:inline-flex;margin-bottom:.7rem;padding:.3rem .65rem;border-radius:999px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.18);font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--primary-light)}.article-strategic-card h3{margin:0 0 .5rem;font-size:1rem;color:var(--white)}.article-strategic-card p{margin:0;font-size:.9rem;line-height:1.6;color:var(--text-muted)}</style>';

function normalizeRelativePath(relativePath = '') {
  return String(relativePath || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toPublicUrlPath(relativePath = '') {
  const normalized = normalizeRelativePath(relativePath);
  if (!normalized || normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    return `/${normalized.replace(/index\.html$/, '')}`;
  }
  return `/${normalized}`;
}

function toAbsolutePublicUrl(relativePath = '') {
  const publicPath = toPublicUrlPath(relativePath);
  return publicPath === '/' ? `${BASE_URL}/` : `${BASE_URL}${publicPath}`;
}

function replaceTagContent(html, pattern, content) {
  return html.replace(pattern, (...args) => {
    const captures = args.slice(1, -2);
    const before = captures[0];
    const after = captures[captures.length - 1] || '';
    return `${before}${escapeHtmlAttr(content)}${after}`;
  });
}

function replaceMetaTagContent(html, attrName, attrValue, content) {
  const escapedAttrValue = escapeRegex(attrValue);
  let updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*\\bcontent=")[^"]*("[^>]*>)`, 'i'),
    content
  );

  if (updated !== html) return updated;

  updated = replaceTagContent(
    html,
    new RegExp(`(<meta\\b[^>]*\\bcontent=")[^"]*("[^>]*\\b${attrName}="${escapedAttrValue}"[^>]*>)`, 'i'),
    content
  );

  return updated;
}

function buildStrategicLinksHtml(strategicLinks) {
  if (!strategicLinks || !Array.isArray(strategicLinks.cards) || !strategicLinks.cards.length) {
    return '';
  }

  return `<section class="article-strategic-links" aria-labelledby="strategic-links-title"> <h2 id="strategic-links-title">${strategicLinks.title || 'Percorsi consigliati'}</h2> <div class="article-strategic-grid"> ${strategicLinks.cards.map((card) => `<a href="${card.href}" class="article-strategic-card"><span class="article-strategic-label">${card.label}</span><h3>${card.title}</h3><p>${card.desc}</p></a>`).join('')} </div> </section>`;
}

function replaceTitleTag(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
}

function replaceFirstH1(html, heading) {
  return html.replace(/<h1>[\s\S]*?<\/h1>/i, `<h1>${heading}</h1>`);
}

function replaceArticleSummaryLead(html, content) {
  return html.replace(
    /(<div class="article-summary">\s*<p><strong>In breve:<\/strong>)[\s\S]*?(<\/p>)/i,
    `$1 ${content}$2`
  );
}

function replaceQuickAnswer(html, content) {
  return html.replace(
    /(<p><strong>Risposta rapida:<\/strong>)[\s\S]*?(<\/p>)/i,
    `$1 ${content}$2`
  );
}

function replaceSectionTag(html, content) {
  return html.replace(/<span class="section-tag">[\s\S]*?<\/span>/i, `<span class="section-tag">${content}</span>`);
}

function replaceAnswerCapsule(html, content) {
  return html.replace(/<p class="answer-capsule">[\s\S]*?<\/p>/i, `<p class="answer-capsule">${content}</p>`);
}

function replaceFirstParagraphAfterH1(html, content) {
  return html.replace(/(<h1>[\s\S]*?<\/h1>\s*<p>)[\s\S]*?(<\/p>)/i, `$1${content}$2`);
}

function replaceArticleUpgrade(html, { title, description, href, label }) {
  return html.replace(
    /<section class="article-upgrade"[\s\S]*?<\/section>/i,
    `<section class="article-upgrade" aria-label="Risorsa bonus"> <h3>${title}</h3> <p>${description}</p> <a href="${href}" class="btn btn-secondary">${label}</a> </section>`
  );
}

function ensureSelfHreflang(html, relativePath) {
  const href = toAbsolutePublicUrl(relativePath);
  const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${href}">`;
  const withoutExisting = html.replace(/\s*<link\b[^>]*\bhreflang=["']it-IT["'][^>]*>/gi, '');

  if (/<link\b[^>]*rel=["']canonical["'][^>]*>/i.test(withoutExisting)) {
    return withoutExisting.replace(/(<link\b[^>]*rel=["']canonical["'][^>]*>)/i, `$1 ${hreflangTag}`);
  }

  return withoutExisting.replace(/<\/head>/i, `${hreflangTag}</head>`);
}

function alignPrioritySnippet(html, relativePath) {
  const snippet = prioritySnippets[normalizeRelativePath(relativePath)];
  if (!snippet) return html;

  let updated = replaceTitleTag(html, snippet.title);
  updated = replaceMetaTagContent(updated, 'name', 'description', snippet.description);
  updated = replaceMetaTagContent(updated, 'property', 'og:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'property', 'og:description', snippet.description);
  updated = replaceMetaTagContent(updated, 'name', 'twitter:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'name', 'twitter:description', snippet.description);
  updated = replaceMetaTagContent(updated, 'property', 'twitter:title', snippet.title);
  updated = replaceMetaTagContent(updated, 'property', 'twitter:description', snippet.description);
  return updated;
}

function alignRobotsDirectives(html, relativePath) {
  const publicPath = toPublicUrlPath(relativePath);
  if (getIndexationDirectivesForPath(publicPath) !== 'noindex, follow') return html;
  return replaceMetaTagContent(html, 'name', 'robots', NOINDEX_ROBOTS);
}

function alignHomepageBrandExperience(html, relativePath) {
  if (normalizeRelativePath(relativePath) !== 'index.html') return html;

  let updated = html;
  updated = updated.replace(HOMEPAGE_MOBILE_PRELOAD_OLD, HOMEPAGE_MOBILE_PRELOAD_NEW);
  updated = updated.replace(HOMEPAGE_FONT_PRELOAD_PATTERN, ' ');
  updated = updated.replace(HOMEPAGE_CORE_LINKS_PATTERN, '');
  updated = updated.replace(HOMEPAGE_HERO_OLD, HOMEPAGE_HERO_NEW);
  if (!updated.includes('Percorsi principali')) {
    updated = updated.replace(
      /(<div class="hero-cta">[\s\S]*?<\/div>)(\s*<\/div>\s*<\/div>\s*<\/section>)/i,
      `$1 ${HOMEPAGE_CORE_LINKS_HTML}$2`
    );
  }
  updated = updated.replace(
    '<p class="ai-summary-text"><strong>Web Novis</strong>',
    '<p class="ai-summary-text"><strong>WebNovis</strong>'
  );
  updated = updated.replace(/\s*<link href="https:\/\/www\.designrush\.com" rel="preconnect">\s*/i, ' ');
  return updated;
}

function alignPriorityContentTransforms(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);

  if (normalizedPath === 'blog/partita-iva-ecommerce.html') {
    return replaceArticleSummaryLead(
      replaceFirstH1(html, 'Partita IVA per E-Commerce nel 2026: quando serve, costi e regime'),
      'Quando serve la partita IVA per vendere online in Italia, quanto costa aprirla, quale regime scegliere e quali adempimenti devi prevedere per il tuo e-commerce nel 2026.'
    );
  }

  if (normalizedPath === 'blog/quanto-costa-gestione-social-media.html') {
    let updated = replaceFirstH1(html, 'Quanto costa la gestione social media nel 2026? Prezzi reali per PMI');
    updated = replaceArticleSummaryLead(
      updated,
      'Costi reali per la gestione social media aziendale: contenuti, ads, report, consulenza e range mensili per PMI. Cosa include davvero un preventivo e come valutarlo.'
    );
    return updated;
  }

  if (normalizedPath === 'blog/quanto-costa-un-ecommerce.html') {
    let updated = replaceFirstH1(html, 'Quanto costa un e-commerce nel 2026? Prezzi reali, Shopify o custom');
    updated = replaceArticleSummaryLead(
      updated,
      'Nel 2026 un e-commerce può richiedere da circa €3.000 a oltre €50.000 in base a piattaforma, catalogo, integrazioni e obiettivi di crescita. La scelta giusta dipende dal ROI, non solo dal costo iniziale.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist budget e-commerce 2026',
      description: 'Una traccia pratica per valutare piattaforma, costi nascosti, integrazioni, marketing e sostenibilita del progetto prima di investire.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=quanto-costa-ecommerce&utm_content=checklist-budget-ecommerce',
      label: 'Richiedi la checklist budget'
    });
    return updated
      .replace(
        /<p><a href="\.\.\/servizi\/sviluppo-web\.html">I nostri pacchetti e-commerce partono da €3\.500 →<\/a><\/p>/,
        '<p><a href="../servizi/ecommerce.html">I nostri pacchetti e-commerce partono da €3.500 →</a></p>'
      )
      .replace(
        /\.\.\/servizi\/sviluppo-web\.html\?utm_source=blog&utm_medium=inline_cta&utm_campaign=quanto-costa-ecommerce/g,
        '../servizi/ecommerce.html?utm_source=blog&utm_medium=inline_cta&utm_campaign=quanto-costa-ecommerce'
      );
  }

  if (normalizedPath === 'blog/instagram-algoritmo-2026.html') {
    let updated = replaceFirstH1(html, 'Algoritmo Instagram 2026: cosa premia davvero e come aumentare la reach');
    updated = replaceArticleSummaryLead(
      updated,
      'Cosa premia davvero l’algoritmo Instagram 2026: reach, salvataggi, reel, caroselli e segnali che aiutano PMI e professionisti a ottenere più visibilità qualificata.'
    );
    updated = replaceQuickAnswer(
      updated,
      'L’algoritmo Instagram 2026 premia soprattutto contenuti che generano interazioni forti e segnali di utilità, come tempo di visualizzazione, salvataggi, condivisioni e ritorni sul profilo. Per PMI e professionisti contano soprattutto reel chiari, caroselli utili e una pubblicazione coerente con il tema del profilo.'
    );
    return updated.replace(
      /<p>WebNovis ha aiutato aziende nel settore industriale[\s\S]*?<\/p>/,
      '<p>WebNovis aiuta PMI e professionisti a trasformare Instagram in un canale più misurabile, con contenuti, rubriche e campagne coerenti con gli obiettivi di lead generation.</p> <section class="article-inline-cta" aria-label="Servizio correlato"> <h3>Vuoi una strategia Instagram più chiara e sostenibile?</h3> <p>Possiamo aiutarti a definire format, calendario editoriale e campagne Meta in base al tuo obiettivo di visibilità o acquisizione contatti.</p> <a href="../servizi/social-media.html?utm_source=blog&utm_medium=inline_cta&utm_campaign=instagram-algoritmo-2026" class="article-inline-link">Scopri il servizio Social Media →</a> </section>'
    );
  }

  if (normalizedPath === 'blog/quanto-costa-campagna-facebook-ads.html') {
    let updated = replaceFirstH1(html, 'Quanto costa una campagna Facebook Ads nel 2026? Budget, CPC e gestione');
    updated = replaceArticleSummaryLead(
      updated,
      'Guida ai costi reali di una campagna Facebook e Meta Ads: budget minimo, costo per lead, fee di gestione, creatività e range realistici per PMI nel 2026.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Template budget Meta Ads',
      description: 'Una traccia pratica per stimare budget di test, creativita, fee di gestione e obiettivi lead prima di lanciare la campagna.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=quanto-costa-campagna-facebook-ads&utm_content=template-budget-meta-ads',
      label: 'Richiedi il template budget'
    });
    return updated;
  }

  if (normalizedPath === 'blog/obblighi-legge-accessibilita-siti.html') {
    let updated = replaceFirstH1(html, 'Obblighi accessibilità siti web 2026: chi deve adeguarsi e cosa fare');
    updated = replaceArticleSummaryLead(
      updated,
      'Obblighi legali di accessibilità web per aziende private in Italia: chi rientra, cosa verificare, quali adempimenti servono e quali rischi evitare in vista dell’EAA.'
    );
    return updated;
  }

  if (normalizedPath === 'blog/dati-obbligatori-sito-web-aziendale.html') {
    let updated = replaceFirstH1(html, 'Dati obbligatori su un sito web aziendale: checklist 2026');
    updated = replaceArticleSummaryLead(
      updated,
      'Partita IVA, ragione sociale, PEC, privacy, cookie policy e informazioni societarie: tutti i dati obbligatori da mostrare sul sito web di un’azienda italiana nel 2026.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist legale sito aziendale',
      description: 'Una checklist operativa per controllare footer, dati societari, privacy, cookie e riferimenti obbligatori prima di mettere online il sito.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=dati-obbligatori-sito-web-aziendale&utm_content=checklist-legale-sito-aziendale',
      label: 'Richiedi la checklist legale'
    });
    return updated;
  }

  if (normalizedPath === 'blog/google-search-console-guida.html') {
    let updated = replaceFirstH1(html, 'Google Search Console: guida 2026 per leggere query, CTR e indicizzazione');
    updated = replaceArticleSummaryLead(
      updated,
      'Come configurare e usare Google Search Console per leggere query, impressioni, CTR, pagine indicizzate ed errori. Guida pratica per capire cosa migliorare davvero.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Mini audit Search Console',
      description: 'Un check rapido su query, CTR, copertura e priorita operative per capire dove stai perdendo clic e quali pagine meritano lavoro subito.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=google-search-console-guida&utm_content=mini-audit-search-console',
      label: 'Richiedi il mini audit'
    });
    return updated;
  }

  if (normalizedPath === 'blog/aggiornamenti-algoritmo-google-2026.html') {
    return replaceArticleUpgrade(html, {
      title: 'Mini audit dopo i core update',
      description: 'Un controllo rapido su pagine calate, query stabili, CTR e segnali on-page per reagire ai Google update senza fare cambiamenti impulsivi.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=aggiornamenti-algoritmo-google-2026&utm_content=mini-audit-core-update',
      label: 'Richiedi il mini audit SEO'
    });
  }

  if (normalizedPath === 'blog/dati-obbligatori-sito-web.html') {
    let updated = replaceFirstH1(html, 'Dati obbligatori su un sito web: guida sintetica 2026');
    updated = replaceArticleSummaryLead(
      updated,
      'Guida sintetica ai dati obbligatori da esporre su un sito web in Italia: partita IVA, contatti, privacy, cookie e riferimenti societari per non lasciare buchi di compliance.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist dati obbligatori sito',
      description: 'Una traccia pratica per verificare footer, pagina contatti, privacy, cookie e riferimenti societari prima di pubblicare o aggiornare il sito.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=dati-obbligatori-sito-web&utm_content=checklist-dati-obbligatori-sito',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'blog/piattaforme-ecommerce-confronto.html') {
    let updated = replaceFirstH1(html, 'Piattaforme e-commerce 2026: Shopify, WooCommerce, PrestaShop o custom?');
    updated = replaceArticleSummaryLead(
      updated,
      'Confronto pratico tra Shopify, WooCommerce, PrestaShop e soluzioni custom: costi reali, commissioni, SEO, flessibilità e quando conviene ciascuna piattaforma per una PMI italiana nel 2026.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist scelta piattaforma e-commerce',
      description: 'Una traccia pratica per confrontare costi, commissioni, SEO, integrazioni e limiti tecnici prima di scegliere la piattaforma.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=piattaforme-ecommerce-confronto&utm_content=checklist-scelta-piattaforma',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'blog/pagamenti-online-ecommerce.html') {
    let updated = replaceFirstH1(html, 'Pagamenti online e-commerce 2026: Stripe, PayPal o Scalapay?');
    updated = replaceArticleSummaryLead(
      updated,
      'Per un e-commerce nel 2026 non basta attivare un gateway qualsiasi: bisogna confrontare commissioni, checkout, tassi di conversione, metodi rateali e compatibilità con la piattaforma scelta.'
    );
    updated = replaceQuickAnswer(
      updated,
      'Per molte PMI italiane la scelta migliore parte da Stripe o PayPal, ma il gateway giusto dipende da ticket medio, mercati serviti, metodo di checkout, pagamenti rateali e controllo sui costi ricorrenti.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist checkout e pagamenti',
      description: 'Una traccia per valutare gateway, commissioni, pagamenti rateali, checkout e rischi operativi prima di andare online.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=pagamenti-online-ecommerce&utm_content=checklist-checkout-pagamenti',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'blog/gdpr-sito-web-guida.html') {
    let updated = replaceFirstH1(html, 'GDPR sito web 2026: obblighi, cookie banner e cosa controllare');
    updated = replaceArticleSummaryLead(
      updated,
      'Privacy policy, cookie banner, consenso, form e gestione dati: i controlli essenziali per capire se un sito è davvero conforme al GDPR nel 2026 e dove si annidano i rischi più comuni.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist GDPR per il sito web',
      description: 'Una checklist operativa per verificare cookie banner, consenso, form, privacy policy e punti che spesso restano scoperti.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=gdpr-sito-web-guida&utm_content=checklist-gdpr-sito',
      label: 'Richiedi la checklist GDPR'
    });
    return updated;
  }

  if (normalizedPath === 'blog/sito-web-per-ristoranti.html') {
    let updated = replaceFirstH1(html, 'Sito web per ristoranti 2026: menu, prenotazioni, delivery e SEO locale');
    updated = replaceArticleSummaryLead(
      updated,
      'Un sito per ristoranti nel 2026 deve aiutare davvero a portare coperti e ordini: menu aggiornabile, prenotazioni, Google Maps, delivery, SEO locale e una struttura semplice da usare anche da smartphone.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist sito ristorante 2026',
      description: 'I controlli pratici per capire se il sito del tuo ristorante aiuta davvero prenotazioni, ordini, reputazione locale e conversioni.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=sito-web-per-ristoranti&utm_content=checklist-sito-ristorante',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'blog/shopify-vs-sito-ecommerce-custom.html') {
    let updated = replaceFirstH1(html, 'Shopify o e-commerce custom? Costi, SEO e limiti nel 2026');
    updated = replaceArticleSummaryLead(
      updated,
      'Shopify e sito e-commerce custom risolvono problemi diversi: costi iniziali, commissioni, SEO, proprietà del codice, integrazioni e margine di crescita cambiano molto a seconda del progetto.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Mini audit scelta piattaforma',
      description: 'Un confronto rapido per capire se oggi ha più senso Shopify, WooCommerce o una soluzione custom in base al tuo obiettivo di vendita.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=shopify-vs-custom&utm_content=mini-audit-piattaforma',
      label: 'Richiedi il mini audit'
    });
    return updated;
  }

  if (normalizedPath === 'blog/instagram-insights-guida.html') {
    let updated = replaceFirstH1(html, 'Instagram Insights 2026: metriche che contano davvero per PMI e professionisti');
    updated = replaceArticleSummaryLead(
      updated,
      'Instagram Insights serve a capire quali contenuti portano reach utile, salvataggi, click e richieste. Le metriche davvero importanti cambiano in base all’obiettivo, non al numero di vanity metriche disponibili.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Template KPI Instagram',
      description: 'Una traccia pratica per leggere reach, salvataggi, retention, click e segnali utili senza perderti nei numeri meno importanti.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=instagram-insights-guida&utm_content=template-kpi-instagram',
      label: 'Richiedi il template KPI'
    });
    return updated;
  }

  if (normalizedPath === 'blog/instagram-carousel-guida.html') {
    let updated = replaceFirstH1(html, 'Carousel Instagram 2026: come farli scorrere, salvare e ricordare');
    updated = replaceArticleSummaryLead(
      updated,
      'Un carousel efficace non è solo un post multi-immagine: serve un hook forte, una progressione chiara tra le slide e una CTA finale pensata per generare salvataggi, condivisioni o click.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Template carousel Instagram',
      description: 'Una traccia pratica per costruire carousel con hook, sviluppo slide e CTA finale senza disperdere attenzione.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=instagram-carousel-guida&utm_content=template-carousel-instagram',
      label: 'Richiedi il template'
    });
    return updated;
  }

  if (normalizedPath === 'blog/instagram-reels-strategia.html') {
    let updated = replaceFirstH1(html, 'Instagram Reels 2026: strategia per reach utile e lead');
    updated = replaceArticleSummaryLead(
      updated,
      'Nel 2026 i Reels funzionano quando hanno un gancio chiaro, un ritmo leggibile e una CTA coerente con l’obiettivo. Non basta pubblicare video brevi: serve una struttura pensata per trattenere attenzione e far compiere il passo successivo.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Mini piano Reels 2026',
      description: 'Una traccia per organizzare format, ganci, storyboard e CTA in modo più coerente con visibilità e lead generation.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=instagram-reels-strategia&utm_content=mini-piano-reels',
      label: 'Richiedi il mini piano'
    });
    return updated;
  }

  if (normalizedPath === 'blog/instagram-shop-guida.html') {
    let updated = replaceFirstH1(html, 'Instagram Shop 2026: requisiti, catalogo e limiti da conoscere');
    updated = replaceArticleSummaryLead(
      updated,
      'Instagram Shop può aiutare a vendere online, ma solo se catalogo, checkout, processi interni e integrazione con l’e-commerce sono impostati bene. In molti casi il vero problema non è attivarlo, ma farlo funzionare davvero.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist Instagram Shop',
      description: 'Una checklist pratica per verificare requisiti, catalogo, checkout e limiti operativi prima di attivare Instagram Shop.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=instagram-shop-guida&utm_content=checklist-instagram-shop',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'blog/campagne-locali-google-ads.html') {
    let updated = replaceFirstH1(html, 'Campagne locali Google Ads 2026: più clienti nella tua zona');
    updated = replaceArticleSummaryLead(
      updated,
      'Le campagne locali Google Ads funzionano quando intercettano ricerche ad alta intenzione con keyword giuste, estensioni corrette, una landing coerente e tracciamento pulito. Senza questi elementi, anche un buon budget si disperde.'
    );
    updated = replaceQuickAnswer(
      updated,
      'Per PMI e professionisti, le campagne locali Google Ads possono portare richieste molto qualificate se combinano search, Google Maps, estensioni, landing page coerente e ottimizzazione continua del budget.'
    );
    updated = replaceArticleUpgrade(updated, {
      title: 'Checklist campagne Google Ads locali',
      description: 'Una checklist operativa per verificare keyword, area geografica, landing, tracciamento e segnali locali prima di investire in Ads.',
      href: '../contatti.html?utm_source=blog&utm_medium=content_upgrade&utm_campaign=campagne-locali-google-ads&utm_content=checklist-google-ads-locali',
      label: 'Richiedi la checklist'
    });
    return updated;
  }

  if (normalizedPath === 'servizi/social-media.html') {
    let updated = replaceSectionTag(html, 'Social media marketing a Milano · contenuti, Meta Ads e lead');
    updated = replaceFirstH1(updated, 'Social media marketing a Milano per brand che vogliono più richieste');
    updated = replaceFirstParagraphAfterH1(
      updated,
      '<strong>WebNovis</strong> supporta PMI e professionisti con social media marketing a Milano: contenuti grafici, analisi competitor e campagne Meta Ads orientate a visibilità, lead generation e richieste misurabili. Pacchetti da <strong>€300/mese</strong>.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-garbagnate.html') {
    let updated = replaceSectionTag(html, 'Realizzazione siti web a Garbagnate · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Garbagnate Milanese per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Garbagnate Milanese con design su misura, SEO tecnica integrata e codice 100% custom. Landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta da Rho e preventivo in 24 ore.'
    );
    return updated;
  }

  if (normalizedPath === 'sito-vetrina-bollate.html') {
    let updated = replaceSectionTag(html, 'Sito vetrina a Bollate · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'Sito vetrina a Bollate per aziende che vogliono più contatti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti vetrina a Bollate con design su misura, SEO tecnica integrata e struttura orientata alle richieste. Siti vetrina da <strong>€1.200</strong>, tempi medi 2-3 settimane e gestione diretta da Rho con preventivo in 24 ore.'
    );
    return updated;
  }

  if (normalizedPath === 'graphic-design-bareggio.html') {
    let updated = replaceSectionTag(html, 'Graphic design a Bareggio · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'Graphic design a Bareggio per logo, brand identity e coordinato');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> offre graphic design a Bareggio per logo, brand identity e coordinato visivo. Progetti da <strong>€250</strong>, direzione creativa su misura e gestione diretta da Rho con preventivo rapido entro 24 ore.'
    );
    return updated;
  }

  if (normalizedPath === 'landing-page-milano.html') {
    let updated = replaceSectionTag(html, 'Landing page a Milano · da €500 · lead generation');
    updated = replaceFirstH1(updated, 'Landing page a Milano per campagne che devono portare contatti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> crea landing page a Milano con copy, design e tracking pensati per Google Ads, Meta Ads ed eventi. Progetti da <strong>€500</strong>, tempi rapidi e struttura pensata per trasformare il traffico in lead.'
    );
    return updated;
  }

  if (normalizedPath === 'ecommerce-milano.html') {
    let updated = replaceSectionTag(html, 'E-commerce a Milano · da €3.500 · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'E-commerce a Milano per PMI, retail e vendita online');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza e-commerce a Milano con SEO integrata, UX orientata alle vendite e codice custom o stack Shopify/WooCommerce. Progetti da <strong>€3.500</strong>, gestione diretta da Rho e preventivo in 24 ore.'
    );
    return updated;
  }

  if (normalizedPath === 'sviluppo-app-mobile-milano.html') {
    let updated = replaceSectionTag(html, 'App mobile a Milano · delivery, booking e loyalty');
    updated = replaceFirstH1(updated, 'Sviluppo app mobile a Milano per delivery, booking e loyalty');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> sviluppa app mobile a Milano per delivery, prenotazioni, programmi loyalty e servizi utility. Soluzioni custom, UX su misura, integrazioni operative e preventivo rapido con gestione diretta da Rho.'
    );
    return updated;
  }

  if (normalizedPath === 'email-marketing-monza.html') {
    let updated = replaceSectionTag(html, 'Email marketing a Monza · da €250/mese · automazioni');
    updated = replaceFirstH1(updated, 'Email marketing a Monza per newsletter e automazioni che generano contatti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> imposta email marketing a Monza con newsletter, automazioni e flussi di recupero pensati per aumentare riacquisti e richieste. Investimento da <strong>€250/mese</strong> e setup rapido con gestione diretta da Rho.'
    );
    return updated;
  }

  if (normalizedPath === 'google-ads-monza.html') {
    let updated = replaceSectionTag(html, 'Google Ads a Monza · campagne search · lead locali');
    updated = replaceFirstH1(updated, 'Google Ads a Monza per campagne search e contatti qualificati');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> gestisce Google Ads a Monza per PMI, e-commerce e servizi locali che vogliono intercettare ricerche ad alta intenzione. Search, tracking, landing e ottimizzazione budget per generare contatti più qualificati.'
    );
    return updated;
  }

  if (normalizedPath === 'ecommerce-senago.html') {
    let updated = replaceSectionTag(html, 'E-commerce a Senago · da €3.500 · SEO integrata');
    updated = replaceFirstH1(updated, 'E-commerce a Senago per negozi, retail e vendita online');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza e-commerce a Senago con SEO integrata, UX orientata alle vendite e stack Shopify, WooCommerce o custom. Progetti da <strong>€3.500</strong> con preventivo rapido e gestione diretta da Rho.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-bresso.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Bresso · Google Maps · contatti locali');
    updated = replaceFirstH1(updated, 'SEO locale a Bresso per farti trovare su Google Maps e nelle ricerche locali');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> aiuta attività e professionisti di Bresso a migliorare Google Maps, presidiare le ricerche locali e aumentare chiamate, visite in sede e richieste qualificate.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-cormano.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Cormano · Google Maps · preventivo rapido');
    updated = replaceFirstH1(updated, 'SEO locale a Cormano per attività e professionisti che vogliono più richieste');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> lavora sulla SEO locale a Cormano per migliorare Google Maps, presidiare le ricerche ad alta intenzione e generare più chiamate e contatti qualificati per attività e professionisti.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-lainate.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Lainate · Google Maps · richieste locali');
    updated = replaceFirstH1(updated, 'SEO locale a Lainate per attività che vogliono più visibilità e contatti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> lavora sulla SEO locale a Lainate per migliorare Google Maps, presidiare le ricerche in zona e trasformare la visibilità locale in chiamate, visite e richieste qualificate.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-nerviano.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Nerviano · Google Maps · contatti qualificati');
    updated = replaceFirstH1(updated, 'SEO locale a Nerviano per comparire meglio nelle ricerche in zona');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> aiuta attività e professionisti di Nerviano a migliorare Google Maps, rafforzare la presenza locale e ottenere più richieste qualificate dalle ricerche vicine al punto vendita o allo studio.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-cologno-monzese.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Cologno Monzese · Google Maps · lead locali');
    updated = replaceFirstH1(updated, 'SEO locale a Cologno Monzese per aziende e professionisti che vogliono più richieste');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> supporta aziende e professionisti di Cologno Monzese nel migliorare Google Maps, presidiare le ricerche locali e generare più chiamate e contatti qualificati tra Cologno e Milano Est.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-buccinasco.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Buccinasco · Google Maps · preventivo rapido');
    updated = replaceFirstH1(updated, 'SEO locale a Buccinasco per farti trovare su Google Maps e nelle ricerche locali');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> aiuta attività e professionisti di Buccinasco a migliorare Google Maps, rafforzare la presenza locale e ottenere più chiamate, visite in sede e richieste qualificate.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-bresso.html') {
    let updated = replaceSectionTag(html, 'Realizzazione siti web a Bresso · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Bresso per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Bresso con design su misura, SEO tecnica integrata e codice 100% custom. Landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta da Rho e preventivo in 24 ore.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-arese.html') {
    let updated = replaceSectionTag(html, 'Realizzazione siti web ad Arese · preventivo in 24 ore');
    updated = replaceFirstH1(updated, 'Realizzazione siti web ad Arese per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web ad Arese con design su misura, SEO tecnica integrata e codice 100% custom. Landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta da Rho e preventivo in 24 ore.'
    );
    return updated;
  }

  return html;
}

function ensureStrategicLinksStyles(html) {
  if (/data-webnovis-cluster-links/i.test(html) || /\.article-strategic-links\{/.test(html)) {
    return html;
  }

  return html.replace(/<\/head>/i, `${STRATEGIC_LINKS_STYLE_BLOCK}</head>`);
}

function alignClusterStrategicLinks(html, relativePath) {
  const strategicLinks = getClusterStrategicLinks(relativePath);
  if (!strategicLinks) return html;

  const strategicLinksHtml = buildStrategicLinksHtml(strategicLinks);
  let updated = ensureStrategicLinksStyles(html);

  if (/<section class="article-strategic-links"[\s\S]*?<\/section>/i.test(updated)) {
    return updated.replace(/<section class="article-strategic-links"[\s\S]*?<\/section>/i, strategicLinksHtml);
  }

  if (/<section class="article-upgrade"/i.test(updated)) {
    return updated.replace(/<section class="article-upgrade"/i, `${strategicLinksHtml} <section class="article-upgrade"`);
  }

  if (/<div class="article-cta"/i.test(updated)) {
    return updated.replace(/<div class="article-cta"/i, `${strategicLinksHtml} <div class="article-cta"`);
  }

  return updated.replace(/<\/article>/i, `${strategicLinksHtml} </article>`);
}

function applySeoHtmlTransforms(html, relativePath) {
  let updated = html;
  updated = alignPrioritySnippet(updated, relativePath);
  updated = alignPriorityContentTransforms(updated, relativePath);
  updated = alignClusterStrategicLinks(updated, relativePath);
  updated = ensureSelfHreflang(updated, relativePath);
  updated = alignRobotsDirectives(updated, relativePath);
  updated = alignHomepageBrandExperience(updated, relativePath);
  return updated;
}

module.exports = {
  BASE_URL,
  NOINDEX_ROBOTS,
  normalizeRelativePath,
  toPublicUrlPath,
  toAbsolutePublicUrl,
  ensureSelfHreflang,
  alignPrioritySnippet,
  alignPriorityContentTransforms,
  alignClusterStrategicLinks,
  alignRobotsDirectives,
  alignHomepageBrandExperience,
  applySeoHtmlTransforms
};
