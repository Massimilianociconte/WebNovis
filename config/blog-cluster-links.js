const PAGE_CARDS = {
  'blog/google-search-console-guida.html': {
    label: 'Guida base',
    title: 'Google Search Console: guida completa',
    desc: 'Setup, metriche chiave e lettura corretta di query, impressioni e indicizzazione.'
  },
  'blog/google-search-console-avanzato.html': {
    label: 'Approfondimento',
    title: 'Search Console avanzato',
    desc: 'Filtri, segmentazioni e analisi operative per trasformare i report in decisioni SEO concrete.'
  },
  'blog/url-strane-search-console.html': {
    label: 'Caso pratico',
    title: 'URL strane in Search Console',
    desc: 'Come gestire URL duplicate, escluse o anomale senza sprecare crawl budget e segnali interni.'
  },
  'blog/obblighi-legge-accessibilita-siti.html': {
    label: 'Compliance',
    title: 'Obblighi accessibilita per siti aziendali',
    desc: 'Soglie, adempimenti, costi di adeguamento e priorita operative per PMI e aziende italiane.'
  },
  'blog/accessibilita-web-guida.html': {
    label: 'Guida base',
    title: 'Accessibilita web: guida per PMI',
    desc: 'Panoramica pratica su WCAG, audit, implementazione e governance dei contenuti accessibili.'
  },
  'blog/normativa-accessibilita-web-2026.html': {
    label: 'Normativa',
    title: 'Normativa accessibilita web 2026',
    desc: 'Timeline, scadenze e requisiti EAA/WCAG da monitorare per evitare ritardi e interventi parziali.'
  },
  'blog/strumenti-test-accessibilita.html': {
    label: 'Checklist',
    title: 'Strumenti per test di accessibilita',
    desc: 'Tool automatici e verifiche manuali per misurare problemi reali prima di correggere il sito.'
  },
  'blog/european-accessibility-act-siti-web.html': {
    label: 'Normativa UE',
    title: 'European Accessibility Act 2025-2026',
    desc: 'Cosa cambia con l\'EAA, chi deve adeguarsi e come impostare un piano di conformita credibile.'
  },
  'blog/dati-obbligatori-sito-web-aziendale.html': {
    label: 'Compliance',
    title: 'Dati obbligatori sul sito aziendale',
    desc: 'Checklist 2026 di partita IVA, REA, PEC, privacy, cookie e note legali per imprese italiane.'
  },
  'blog/dati-obbligatori-sito-web.html': {
    label: 'Versione sintetica',
    title: 'Dati obbligatori su un sito web',
    desc: 'Panoramica essenziale dei dati legali da mostrare per non lasciare buchi di compliance.'
  },
  'blog/instagram-per-aziende.html': {
    label: 'Guida base',
    title: 'Instagram per aziende',
    desc: 'Profilo business, contenuti, KPI e crescita organica con obiettivi business chiari.'
  },
  'blog/instagram-content-strategy.html': {
    label: 'Content strategy',
    title: 'Instagram content strategy',
    desc: 'Rubriche, format, frequenza e calendario editoriale per non pubblicare contenuti scollegati.'
  },
  'blog/instagram-hashtag-strategia.html': {
    label: 'Distribuzione',
    title: 'Hashtag Instagram: strategia',
    desc: 'Come scegliere hashtag utili senza dispersione e con un focus reale su reach qualificata.'
  },
  'blog/instagram-algoritmo-2026.html': {
    label: 'Algoritmo 2026',
    title: 'Instagram algoritmo 2026',
    desc: 'Segnali che incidono davvero su reach, engagement e distribuzione organica.'
  },
  'blog/instagram-carousel-guida.html': {
    label: 'Formato',
    title: 'Carousel Instagram: guida',
    desc: 'Come usare i caroselli per spiegare, convertire e far scorrere contenuti piu profondi.'
  },
  'blog/quanto-costa-gestione-social-media.html': {
    label: 'Prezzi',
    title: 'Quanto costa la gestione social',
    desc: 'Range di prezzo, cosa e incluso, costi contenuti e criteri per valutare un partner.'
  },
  'blog/social-media-strategy-2026.html': {
    label: 'Strategia',
    title: 'Social media strategy 2026',
    desc: 'Canali, obiettivi, KPI e priorita per costruire un piano social piu misurabile.'
  },
  'blog/quanto-costa-campagna-facebook-ads.html': {
    label: 'Prezzi ads',
    title: 'Quanto costa una campagna Facebook Ads',
    desc: 'Budget, fee di gestione, test creativi e metriche da guardare prima di scalare.'
  },
  'blog/facebook-ads-guida-pratica.html': {
    label: 'Adv pratico',
    title: 'Facebook Ads: guida pratica',
    desc: 'Setup, struttura campagne, audience e ottimizzazioni per lead e vendite.'
  },
  'blog/quanto-costa-un-ecommerce.html': {
    label: 'Prezzi',
    title: 'Quanto costa un e-commerce',
    desc: 'Budget, piattaforme, costi nascosti e ROI per scegliere lo stack giusto.'
  },
  'blog/partita-iva-ecommerce.html': {
    label: 'Fiscalita',
    title: 'Partita IVA per e-commerce',
    desc: 'Regime, costi fissi, adempimenti e documenti da mettere in conto prima di vendere online.'
  },
  'blog/shopify-vs-sito-ecommerce-custom.html': {
    label: 'Confronto',
    title: 'Shopify vs e-commerce custom',
    desc: 'Differenze su commissioni, SEO, flessibilita e controllo del business.'
  },
  'blog/ecommerce-che-vende.html': {
    label: 'Conversioni',
    title: 'E-commerce che vende',
    desc: 'Cosa deve avere un negozio online per convertire meglio tra UX, trust e funnel.'
  }
};

const SERVICE_CARDS = {
  webdev: {
    href: '../servizi/sviluppo-web.html',
    label: 'Servizio correlato',
    title: 'Audit tecnico e sviluppo web',
    desc: 'Roadmap tecnica, ottimizzazione on-page e interventi concreti sulle pagine che devono generare lead.'
  },
  accessibilita: {
    href: '../servizi/accessibilita.html',
    label: 'Servizio correlato',
    title: 'Accessibilita Web EAA',
    desc: 'Audit, adeguamento WCAG e supporto operativo per rendere il sito conforme e piu solido.'
  },
  social: {
    href: '../servizi/social-media.html',
    label: 'Servizio correlato',
    title: 'Social Media Marketing',
    desc: 'Strategia editoriale, contenuti e campagne Meta orientate a visibilita e lead qualificati.'
  },
  ecommerce: {
    href: '../servizi/ecommerce.html',
    label: 'Servizio correlato',
    title: 'E-Commerce Custom',
    desc: 'Scelta piattaforma, funnel e sviluppo su misura per vendere online con piu controllo.'
  }
};

const HUB_CARDS = {
  webdev: {
    href: '/realizzazione-siti-web/',
    label: 'Hub locale',
    title: 'Siti Web per i Comuni serviti',
    desc: 'Il nodo locale che raccoglie le pagine commerciali piu vicine a sviluppo web e lead generation.'
  },
  accessibilita: {
    href: '/zone-servite/#accessibilita',
    label: 'Hub locale',
    title: 'Accessibilita Web per Comune',
    desc: 'Le pagine territoriali per audit, adeguamento EAA e supporto WCAG rivolto alle imprese locali.'
  },
  social: {
    href: '/zone-servite/#social-media',
    label: 'Hub locale',
    title: 'Social Media per Comune',
    desc: 'Le landing territoriali per contenuti, advertising e gestione social con taglio business.'
  },
  ecommerce: {
    href: '/zone-servite/#ecommerce',
    label: 'Hub locale',
    title: 'E-Commerce per Comune',
    desc: 'Il presidio locale per aziende che cercano supporto e-commerce nell\'hinterland milanese.'
  }
};

const CLUSTERS = [
  {
    id: 'search-console',
    title: 'Percorsi consigliati nel cluster Search Console',
    pillar: 'blog/google-search-console-guida.html',
    serviceCard: 'webdev',
    hubCard: 'webdev',
    pages: [
      'blog/google-search-console-guida.html',
      'blog/google-search-console-avanzato.html',
      'blog/url-strane-search-console.html'
    ]
  },
  {
    id: 'accessibilita',
    title: 'Percorsi consigliati nel cluster Accessibilita',
    pillar: 'blog/obblighi-legge-accessibilita-siti.html',
    serviceCard: 'accessibilita',
    hubCard: 'accessibilita',
    pages: [
      'blog/obblighi-legge-accessibilita-siti.html',
      'blog/accessibilita-web-guida.html',
      'blog/normativa-accessibilita-web-2026.html',
      'blog/strumenti-test-accessibilita.html',
      'blog/european-accessibility-act-siti-web.html'
    ]
  },
  {
    id: 'dati-obbligatori',
    title: 'Percorsi consigliati nel cluster Compliance',
    pillar: 'blog/dati-obbligatori-sito-web-aziendale.html',
    serviceCard: 'webdev',
    hubCard: 'webdev',
    pages: [
      'blog/dati-obbligatori-sito-web-aziendale.html',
      'blog/dati-obbligatori-sito-web.html'
    ],
    extraCards: ['blog/obblighi-legge-accessibilita-siti.html']
  },
  {
    id: 'instagram',
    title: 'Percorsi consigliati nel cluster Instagram',
    pillar: 'blog/instagram-per-aziende.html',
    serviceCard: 'social',
    hubCard: 'social',
    pages: [
      'blog/instagram-per-aziende.html',
      'blog/instagram-content-strategy.html',
      'blog/instagram-hashtag-strategia.html',
      'blog/instagram-algoritmo-2026.html',
      'blog/instagram-carousel-guida.html'
    ]
  },
  {
    id: 'social-costi',
    title: 'Percorsi consigliati nel cluster Social Media',
    pillar: 'blog/quanto-costa-gestione-social-media.html',
    serviceCard: 'social',
    hubCard: 'social',
    pages: [
      'blog/quanto-costa-gestione-social-media.html',
      'blog/social-media-strategy-2026.html',
      'blog/quanto-costa-campagna-facebook-ads.html',
      'blog/facebook-ads-guida-pratica.html'
    ]
  },
  {
    id: 'ecommerce',
    title: 'Percorsi consigliati nel cluster E-Commerce',
    pillar: 'blog/quanto-costa-un-ecommerce.html',
    serviceCard: 'ecommerce',
    hubCard: 'ecommerce',
    pages: [
      'blog/quanto-costa-un-ecommerce.html',
      'blog/partita-iva-ecommerce.html',
      'blog/shopify-vs-sito-ecommerce-custom.html',
      'blog/ecommerce-che-vende.html'
    ]
  }
];

function normalizeBlogIdentifier(value = '') {
  const raw = String(value || '').replace(/\\/g, '/').trim();
  if (!raw) return '';

  if (raw.startsWith('blog/') && raw.endsWith('.html')) {
    return raw;
  }

  const withoutLeadingSlash = raw.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('blog/') && withoutLeadingSlash.endsWith('.html')) {
    return withoutLeadingSlash;
  }

  const slug = withoutLeadingSlash
    .replace(/^blog\//, '')
    .replace(/\.html$/, '');

  return slug ? `blog/${slug}.html` : '';
}

function getPageCard(pathname, labelOverride) {
  const normalized = normalizeBlogIdentifier(pathname);
  const card = PAGE_CARDS[normalized];
  if (!card) return null;

  return {
    href: normalized.split('/').pop(),
    label: labelOverride || card.label,
    title: card.title,
    desc: card.desc
  };
}

function dedupeCards(cards = []) {
  const seen = new Set();
  return cards.filter((card) => {
    if (!card || !card.href || seen.has(card.href)) return false;
    seen.add(card.href);
    return true;
  });
}

function getClusterStrategicLinks(identifier) {
  const normalized = normalizeBlogIdentifier(identifier);
  if (!normalized) return null;

  const cluster = CLUSTERS.find((entry) => entry.pages.includes(normalized));
  if (!cluster) return null;

  const cards = [];
  const serviceCard = SERVICE_CARDS[cluster.serviceCard];
  const hubCard = HUB_CARDS[cluster.hubCard];

  if (serviceCard) {
    cards.push(serviceCard);
  }

  if (normalized !== cluster.pillar) {
    cards.push(getPageCard(cluster.pillar, 'Guida pillar'));
  }

  const siblingCandidates = [...cluster.pages, ...(cluster.extraCards || [])]
    .filter((pathname) => pathname !== normalized)
    .filter((pathname) => (normalized === cluster.pillar ? true : pathname !== cluster.pillar))
    .map((pathname) => getPageCard(pathname))
    .filter(Boolean);

  const reservedSlots = cards.length + (hubCard ? 1 : 0);
  const availableSlots = Math.max(0, 4 - reservedSlots);
  cards.push(...siblingCandidates.slice(0, availableSlots));

  if (hubCard) {
    cards.push(hubCard);
  }

  const uniqueCards = dedupeCards(cards).slice(0, 4);
  if (!uniqueCards.length) return null;

  return {
    title: cluster.title,
    cards: uniqueCards
  };
}

module.exports = {
  PAGE_CARDS,
  CLUSTERS,
  getClusterStrategicLinks,
  normalizeBlogIdentifier
};
