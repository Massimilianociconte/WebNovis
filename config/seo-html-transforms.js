const prioritySnippets = require('./priority-snippets');
const { getClusterStrategicLinks } = require('./blog-cluster-links');
const { getIndexationDirectivesForPath } = require('./pseo-governance');

const BASE_URL = 'https://www.webnovis.com';
const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NON_PUBLIC_ARTIFACT_ROBOTS = 'noindex, nofollow, max-image-preview:none, max-snippet:0, max-video-preview:0';
const CANVA_RESIZE_TOOL_URL = 'https://www.canva.com/it_it/strumenti/ridimensionare-foto/';
const CANVA_LOGO_URL = 'https://static.canva.com/static/images/canva_logo.svg';
const CANVA_PARTNER_CREDIT_HTML = `<aside data-webnovis-canva-credit="true" aria-label="Strumento citato" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin:2rem 0;padding:1rem 1.15rem;border:1px solid rgba(0,196,204,.28);border-radius:14px;background:linear-gradient(135deg,rgba(0,196,204,.1),rgba(125,42,231,.08));box-shadow:0 12px 32px rgba(0,0,0,.16)"> <p style="margin:0;max-width:560px;font-size:.95rem;line-height:1.6;color:var(--gray-light)">Realizzato con lo strumento per <strong>ridimensionare foto</strong> di <a href="${CANVA_RESIZE_TOOL_URL}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Canva - strumento per ridimensionare foto">Canva</a>, utile per adattare rapidamente gli asset visuali ai diversi formati web e social senza perdere coerenza.</p> <img src="${CANVA_LOGO_URL}" alt="Canva" width="80" height="30" loading="eager" decoding="async" fetchpriority="low" style="display:block;width:80px;height:auto;flex:0 0 auto"> </aside>`;
const NON_PUBLIC_ARTIFACT_PATTERNS = [
  /^src\//,
  /^templates\//,
  /^reports\//,
  /^newsletter-template\.html$/i
];
const NON_INDEXABLE_STATIC_PATHS = new Set(['/404.html', '/grazie.html']);
const HOMEPAGE_HERO_OLD = '<h1 class="hero-title"> <span class="glitch gradient-text" data-text="Agenzia Digitale">Agenzia Digitale</span> che <span class="highlight-gold">Accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> La tua agenzia digitale a Milano per sviluppo web,<br> grafica e crescita della tua visibilità online </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div>';
const HOMEPAGE_CORE_LINKS_PATTERN = /\s*<(?:p|nav) class="hero-core-links"[^>]*>[\s\S]*?<\/(?:p|nav)>\s*/i;
const HOMEPAGE_CORE_LINKS_HTML = '<nav class="hero-core-links" aria-label="Percorsi principali" style="display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem"> <a href="/servizi/sviluppo-web.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Sviluppo Web</a> <a href="/servizi/graphic-design.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Graphic Design</a> <a href="/servizi/social-media.html" style="display:inline-flex;align-items:center;padding:.45rem .85rem;border:1px solid rgba(255,255,255,.14);border-radius:999px;color:var(--gray-light);text-decoration:none;background:rgba(255,255,255,.03);backdrop-filter:blur(10px)">Social Media</a> </nav>';
const HOMEPAGE_HERO_NEW = `<h1 class="hero-title"> <span class="glitch gradient-text" data-text="WebNovis">WebNovis</span><br> agenzia web a Rho e Milano che <span class="highlight-gold">accende</span><br> la tua <span class="sr-only">visibilità, crescita, identità e presenza online</span><span class="hero-rotating-wrapper" aria-hidden="true"> <span class="hero-rotating-word active">visibilità</span> <span class="hero-rotating-word">crescita</span> <span class="hero-rotating-word">identità</span> <span class="hero-rotating-word">presenza</span> </span> </h1> <p class="hero-subtitle"> Siti web custom, e-commerce, branding e SEO locale<br> per PMI e professionisti tra Rho, Milano e hinterland </p> <div class="hero-cta"> <a href="contatti.html" title="Contattaci per iniziare il tuo progetto" class="btn btn-primary"> <span>Scopri Come</span> <svg viewBox="0 0 20 20" fill="none" height="20" width="20"> <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/> </svg> </a> <a href="#servizi" title="Scopri i nostri servizi" class="btn btn-secondary">I Nostri Servizi</a> </div> ${HOMEPAGE_CORE_LINKS_HTML}`;
const HOMEPAGE_MOBILE_PRELOAD_OLD = '<link href="Img/sfondo-mobile.webp" rel="preload" media="(max-width: 768px)" as="image" fetchpriority="high" type="image/webp">';
const HOMEPAGE_MOBILE_PRELOAD_NEW = '<link href="Img/sfondo-mobile-hq.webp" rel="preload" media="(max-width: 768px)" as="image" fetchpriority="high" type="image/webp">';
const HOMEPAGE_FONT_PRELOAD_PATTERN = /\s*<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter:wght@400;600;700&family=Space\+Grotesk:wght@600;700&family=Syne:wght@600;700;800&display=swap" rel="preload" as="style">\s*/i;
const STRATEGIC_LINKS_STYLE_BLOCK = '<style data-webnovis-cluster-links>.article-strategic-links{padding:2.4rem 0;border-top:1px solid rgba(255,255,255,.06)}.article-strategic-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1.35rem}.article-strategic-card{display:block;padding:1.3rem;border-radius:14px;border:1px solid rgba(96,165,250,.18);background:linear-gradient(180deg,rgba(255,255,255,.04) 0%,rgba(91,106,174,.08) 100%);text-decoration:none!important;transition:transform .2s ease,border-color .2s ease,background .2s ease}.article-strategic-card:hover{transform:translateY(-2px);border-color:rgba(96,165,250,.35);background:linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(91,106,174,.13) 100%)}.article-strategic-label{display:inline-flex;margin-bottom:.7rem;padding:.3rem .65rem;border-radius:999px;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.18);font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--primary-light)}.article-strategic-card h3{margin:0 0 .5rem;font-size:1rem;color:var(--white)}.article-strategic-card p{margin:0;font-size:.9rem;line-height:1.6;color:var(--text-muted)}</style>';
const LEGAL_PAGES = new Set(['privacy-policy.html', 'cookie-policy.html', 'termini-condizioni.html']);
const MONEY_PAGE_INTERNAL_LINK_BLOCKS = {
  'blog/partita-iva-ecommerce.html': {
    title: 'Stai aprendo un e-commerce e vuoi evitare costi sbagliati?',
    text: 'Dopo la parte fiscale, il passaggio decisivo è scegliere una struttura tecnica sostenibile: catalogo, checkout, SEO e automazioni devono nascere insieme.',
    links: [
      { href: '../servizi/ecommerce.html', label: 'Sviluppo e-commerce custom' },
      { href: '/ecommerce-milano.html', label: 'E-commerce a Milano' },
      { href: '/ecommerce-senago.html', label: 'E-commerce a Senago' }
    ]
  },
  'blog/quanto-costa-un-ecommerce.html': {
    title: 'Vuoi stimare il budget e-commerce sul tuo caso reale?',
    text: 'Possiamo aiutarti a capire se conviene Shopify, WooCommerce o una soluzione custom, con un preventivo legato a margini, catalogo e obiettivi.',
    links: [
      { href: '../servizi/ecommerce.html', label: 'E-commerce custom da €3.500' },
      { href: '/ecommerce-milano.html', label: 'E-commerce a Milano' },
      { href: '/ecommerce-bresso.html', label: 'E-commerce a Bresso' }
    ]
  },
  'blog/pagamenti-online-ecommerce.html': {
    title: 'Checkout e pagamenti vanno progettati insieme al sito',
    text: 'Gateway, commissioni e UX del checkout incidono su conversioni e fiducia: per questo li trattiamo come parte del progetto e-commerce, non come dettaglio finale.',
    links: [
      { href: '../servizi/ecommerce.html', label: 'Progetto e-commerce completo' },
      { href: '/ecommerce-milano.html', label: 'E-commerce a Milano' }
    ]
  },
  'blog/quanto-costa-gestione-social-media.html': {
    title: 'Vuoi trasformare il budget social in richieste misurabili?',
    text: 'Per PMI e professionisti colleghiamo contenuti, creatività e campagne Meta a obiettivi concreti: visibilità utile, lead e continuità editoriale.',
    links: [
      { href: '../servizi/social-media.html', label: 'Social media marketing' },
      { href: '/social-media-milano.html', label: 'Social media a Milano' },
      { href: '/social-media-sesto-san-giovanni.html', label: 'Social media a Sesto San Giovanni' }
    ]
  },
  'blog/quanto-costa-campagna-facebook-ads.html': {
    title: 'Prima di aumentare il budget, metti in ordine creatività e landing',
    text: 'Campagne Meta e Google Ads funzionano meglio quando annuncio, promessa, pagina e tracking raccontano lo stesso percorso.',
    links: [
      { href: '../servizi/social-media.html', label: 'Gestione campagne Meta' },
      { href: '/landing-page-milano.html', label: 'Landing page a Milano' },
      { href: '/google-ads-monza.html', label: 'Google Ads a Monza' }
    ]
  },
  'blog/quanto-costa-un-logo.html': {
    title: 'Il logo deve diventare un sistema visivo, non restare un file isolato',
    text: 'Per rendere il brand più credibile servono logo, palette, tipografia, materiali e coerenza tra sito, social e presentazioni. Logo da €250, brand identity completa da €500.',
    links: [
      { href: '../servizi/brand-identity.html', label: 'Logo e brand identity: costi e pacchetti' },
      { href: '/graphic-design-milano.html', label: 'Graphic design a Milano' }
    ]
  },
  'blog/quanto-costa-brand-identity.html': {
    title: 'Vuoi trasformare la brand identity in un vantaggio commerciale?',
    text: 'Costruiamo identità visive utilizzabili su sito, social, sales deck e materiali corporate, con un sistema coerente e riutilizzabile. Pacchetti da €500 con prezzi e tempi chiari.',
    links: [
      { href: '../servizi/brand-identity.html', label: 'Costi e pacchetti brand identity' },
      { href: '../servizi/graphic-design.html', label: 'Graphic design WebNovis' },
      { href: '/graphic-design-milano.html', label: 'Graphic design a Milano' }
    ]
  },
  'blog/canva-vs-designer-professionista.html': {
    title: 'Quando il template non basta, serve un sistema di marca',
    text: 'Canva e template sono utili per produrre velocemente, ma logo, brand identity e visual commerciali devono restare coerenti tra sito, social e materiali di vendita.',
    links: [
      { href: '../servizi/brand-identity.html', label: 'Logo e brand identity: costi e pacchetti' },
      { href: '/graphic-design-milano.html', label: 'Graphic design a Milano' },
      { href: '../portfolio.html#portfolio-grafico', label: 'Portfolio grafico' }
    ]
  },
  'blog/scegliere-hosting-sito-web.html': {
    title: 'Hosting, codice e performance vanno decisi insieme',
    text: 'La scelta dell’hosting incide su TTFB, sicurezza e conversioni, ma funziona davvero solo dentro un progetto web costruito con architettura e asset leggeri.',
    links: [
      { href: '../servizi/sviluppo-web.html', label: 'Sviluppo web custom' },
      { href: '/realizzazione-siti-web-rho.html', label: 'Siti web a Rho' },
      { href: '/realizzazione-siti-web-arese.html', label: 'Siti web ad Arese' }
    ]
  },
  'blog/copywriting-ads-tecniche.html': {
    title: 'Il copy degli annunci deve continuare nella landing',
    text: 'Promessa, prova e CTA devono essere coerenti tra Google Ads, Meta Ads e pagina di destinazione: altrimenti aumentano click inutili e costo per lead.',
    links: [
      { href: '/landing-page-milano.html', label: 'Landing page per campagne' },
      { href: '/google-ads-monza.html', label: 'Google Ads a Monza' },
      { href: '../servizi/social-media.html', label: 'Campagne e contenuti social' }
    ]
  },
  'blog/strumenti-test-accessibilita.html': {
    title: 'Hai trovato problemi di accessibilita? Trasformali in un piano',
    text: 'I tool automatici aiutano a scoprire errori, ma per adeguare davvero un sito servono priorita, correzioni WCAG e verifica manuale sui flussi importanti.',
    links: [
      { href: '../servizi/accessibilita.html', label: 'Audit accessibilita web' },
      { href: '/accessibilita-cinisello-balsamo.html', label: 'Accessibilita a Cinisello Balsamo' }
    ]
  },
  'blog/digital-transformation-pmi.html': {
    title: 'Per una PMI la trasformazione digitale parte dalle priorita',
    text: 'Sito, automazioni, CRM e advertising funzionano quando sono collegati a processi reali: prima si ordina il percorso, poi si investe sugli strumenti.',
    links: [
      { href: '../servizi/sviluppo-web.html', label: 'Sviluppo web e automazioni' },
      { href: '/agenzia-web-rho.html', label: 'Agenzia web a Rho' },
      { href: '../contatti.html?servizio=consulenza-digitale', label: 'Consulenza digitale' }
    ]
  },
  'blog/personal-brand-consulente.html': {
    title: 'Vuoi accelerare il tuo personal brand?',
    text: 'Posizionamento, identità visiva e sito personale coerenti valgono più di mille post: WebNovis affianca consulenti e professionisti con consulenze mirate e brand identity su misura.',
    links: [
      { href: '../servizi/consulenze.html', label: 'Consulenza personal branding' },
      { href: '../servizi/brand-identity.html', label: 'Brand identity personale' },
      { href: '../portfolio.html', label: 'Portfolio WebNovis' }
    ]
  },
  'blog/chiedere-recensioni-clienti.html': {
    title: 'Le recensioni rendono di più dentro un sistema locale',
    text: 'Recensioni, Google Business Profile e pagine locali lavorano insieme: portano fiducia e contatti solo se sito e presenza local sono curati e collegati.',
    links: [
      { href: '/seo-locale-rho.html', label: 'SEO locale e recensioni' },
      { href: '../servizi/sviluppo-web.html', label: 'Sito web che valorizza le recensioni' }
    ]
  },
  'blog/ttfb-server-response-time.html': {
    title: 'TTFB alto? La performance va corretta dentro il progetto web',
    text: 'Hosting, caching, asset e codice incidono su velocità, crawling e conversione: interveniamo sulle pagine che devono portare contatti.',
    links: [
      { href: '../servizi/sviluppo-web.html', label: 'Sviluppo web e performance' },
      { href: '/realizzazione-siti-web-rho.html', label: 'Siti web a Rho' },
      { href: '/realizzazione-siti-web-cormano.html', label: 'Siti web a Cormano' }
    ]
  },
  'blog/cdn-cos-e-quando-serve.html': {
    title: 'Una CDN serve davvero solo se il sito è progettato bene',
    text: 'Prima di aggiungere strumenti, conviene sistemare architettura, immagini, caching e percorso di conversione delle pagine più importanti.',
    links: [
      { href: '../servizi/sviluppo-web.html', label: 'Siti web veloci e SEO' },
      { href: '/realizzazione-siti-web-rho.html', label: 'Realizzazione siti web a Rho' }
    ]
  },
  'blog/instagram-insights-guida.html': {
    title: 'Dai dati Instagram al piano editoriale: serve un metodo',
    text: 'Reach, salvataggi e click diventano utili quando guidano format, budget e contenuti collegati a una pagina o a una richiesta concreta.',
    links: [
      { href: '../servizi/social-media.html', label: 'Strategia social media' },
      { href: '/social-media-milano.html', label: 'Social media a Milano' }
    ]
  },
  'blog/instagram-carousel-guida.html': {
    title: 'Carousel e contenuti social devono portare a un’azione',
    text: 'Progettiamo format e rubriche per aumentare fiducia, salvataggi e passaggi verso sito, landing o richiesta di preventivo.',
    links: [
      { href: '../servizi/social-media.html', label: 'Piano social e contenuti' },
      { href: '/social-media-parabiago.html', label: 'Social media a Parabiago' }
    ]
  }
};
const EDITORIAL_CONTEXT_LINKS = {
  'blog/marketing-digitale-attivita-locali.html': {
    href: '/blog/caffe-sempione-caso-studio-locale.html',
    title: 'Caso locale: Caffè Sempione',
    text: 'Un approfondimento sul posizionamento digitale di una torrefazione locale e sulle scelte che rendono riconoscibile un’attività del territorio.'
  },
  'blog/intelligenza-artificiale-pmi.html': {
    href: '/blog/ia-cartelle-cliniche-previsione-malattie.html',
    title: 'IA e dati clinici: un caso d’uso da conoscere',
    text: 'Come i modelli possono leggere dati sanitari eterogenei, con opportunità e limiti da valutare prima di trasferire l’approccio in azienda.'
  },
  'blog/web-design-trends-2026.html': {
    href: '/blog/importanza-del-design-siti-web.html',
    title: 'Perché UX e UI incidono sul risultato del sito',
    text: 'Una guida complementare sul ruolo del design nella chiarezza, nella fiducia e nel percorso di conversione.'
  },
  'blog/obblighi-legge-accessibilita-siti.html': {
    href: '/blog/sanzioni-sito-non-accessibile-2026.html',
    title: 'Sanzioni e rischi di un sito non accessibile',
    text: 'Il quadro operativo da leggere insieme agli obblighi, con fonti e verifiche da aggiornare in base al caso concreto.'
  },
  'blog/ottimizzazione-tasso-conversione.html': {
    href: '/blog/sito-web-che-non-converte.html',
    title: 'Diagnosi: perché un sito non converte',
    text: 'Quindici cause frequenti da usare come checklist prima di pianificare test, interventi UX e modifiche alle CTA.'
  },
  'blog/portare-attivita-online.html': {
    href: '/portfolio/case-study/comeleapi.html',
    title: 'Case study: presenza digitale locale per comeleapi',
    text: 'Un esempio concreto di sito mobile-first, identità editoriale, SEO locale e contatto diretto per un servizio sul territorio.'
  }
};
const HOMEPAGE_GEO_CARD_REPLACEMENTS = [
  {
    from: 'realizzazione-siti-web-pero.html',
    to: 'realizzazione-siti-web-bollate.html',
    fromCity: 'Pero',
    toCity: 'Bollate',
    title: 'Realizzazione Siti Web a Bollate',
    area: 'Milano Nord-Ovest',
    text: 'Siti web su misura per imprese e professionisti di Bollate e dell’area nord-ovest.'
  },
  {
    from: 'realizzazione-siti-web-lainate.html',
    to: 'realizzazione-siti-web-legnano.html',
    fromCity: 'Lainate',
    toCity: 'Legnano',
    title: 'Realizzazione Siti Web a Legnano',
    area: 'Alto Milanese',
    text: 'Siti web custom per aziende, attività locali e professionisti di Legnano.'
  },
  {
    from: 'realizzazione-siti-web-cornaredo.html',
    to: 'realizzazione-siti-web-garbagnate.html',
    fromCity: 'Cornaredo',
    toCity: 'Garbagnate Milanese',
    title: 'Realizzazione Siti Web a Garbagnate Milanese',
    area: 'Milano Nord-Ovest',
    text: 'Realizzazione siti web per PMI e professionisti di Garbagnate Milanese.'
  },
  {
    from: 'realizzazione-siti-web-settimo-milanese.html',
    to: 'realizzazione-siti-web-milano-ovest.html',
    fromCity: 'Settimo Milanese',
    toCity: 'Milano Ovest',
    title: 'Realizzazione Siti Web a Milano Ovest',
    area: 'Area metropolitana',
    text: 'Siti web professionali per aziende e attività dell’area di Milano Ovest.'
  }
];
const LOCAL_PAGES_ALREADY_OPTIMIZED = new Set([
  'sito-vetrina-bollate.html',
  'graphic-design-bareggio.html',
  'realizzazione-siti-web-garbagnate.html',
  'realizzazione-siti-web-limbiate.html',
  'realizzazione-siti-web-bresso.html',
  'agenzia-web-rho.html',
  'realizzazione-siti-web-rho.html',
  'seo-locale-rho.html',
  'landing-page-milano.html',
  'ecommerce-milano.html',
  'sviluppo-app-mobile-milano.html',
  'email-marketing-monza.html',
  'google-ads-monza.html',
  'ecommerce-senago.html',
  'seo-locale-bresso.html',
  'seo-locale-cormano.html',
  'seo-locale-rozzano.html',
  'seo-locale-buccinasco.html',
  'seo-locale-lainate.html',
  'seo-locale-nerviano.html',
  'seo-locale-cologno-monzese.html',
  'realizzazione-siti-web-arese.html'
]);
const CONTACT_INFO_CARDS_PATTERN = /<div class="contatti-info-cards">[\s\S]*?<div class="contatti-map">[\s\S]*?<\/div>\s*<\/div>/i;
const CONTACT_INFO_CARDS_REPLACEMENT = `<div class="contatti-info-cards"> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L10.89 13.26C11.54 13.67 12.46 13.67 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"/></svg> <h2>Email</h2> </div> <div class="contatti-card-body contatti-card-body--offset"> <a href="mailto:hello@webnovis.com" class="contatti-card-link">hello@webnovis.com</a> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <h2>Telefono</h2> </div> <div class="contatti-card-body contatti-card-body--offset contatti-card-stack"> <a href="tel:+393802647367" title="Chiama Web Novis" class="phone-cta" aria-label="Chiama WebNovis al numero +39 380 264 7367" data-contact-phone="+393802647367"><span class="phone-cta-label">Chiama WebNovis</span></a> <a href="https://wa.me/393802647367?text=Ciao%20Web%20Novis%2C%20vorrei%20maggiori%20informazioni" target="_blank" rel="noopener noreferrer" class="contatti-card-link">Scrivici su WhatsApp →</a> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> <h2>Sede</h2> </div> <div class="contatti-card-body contatti-card-body--offset"> <p>Via S. Giorgio, 2<br>20017 Rho (MI), Italia</p> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <h2>Contatti</h2> </div> <div class="contatti-card-body contatti-card-body--offset"> <p>Usa i canali indicati.<br>Tempi e modalità vengono definiti al contatto.</p> </div> </article> <div class="contatti-map"> <iframe allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2799.5!2d9.0393!3d45.5299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c1237f2e291d%3A0x7e38e24c285e5a0!2sVia%20S.%20Giorgio%2C%202%2C%2020017%20Rho%20MI!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit" title="Sede Web Novis — Via S. Giorgio 2, Rho (MI)"></iframe> </div> </div>`;
const LEGAL_NAV_MENU = '<ul class="nav-menu" id="navMenu"> <li><a href="servizi/" class="nav-link">Servizi</a></li> <li><a href="portfolio.html" class="nav-link">Portfolio</a></li> <li><a href="chi-siamo.html" class="nav-link">Chi Siamo</a></li> <li><a href="blog/" class="nav-link">Blog</a></li> <li><a href="contatti.html" class="nav-link">Contatti</a></li> <li><a href="preventivo.html" class="nav-link nav-cta">Inizia Ora</a></li> </ul>';
const PORTFOLIO_GRAPHIC_SECTION_PATTERN = /<section class="portfolio-section" style="padding:4rem 0" id="portfolio-grafico">[\s\S]*?<\/section>/i;
const PORTFOLIO_SOCIAL_SECTION_PATTERN = /<section class="portfolio-section" style="padding:4rem 0;background:rgba\(255,255,255,.01\)" id="portfolio-social">[\s\S]*?<\/section>/i;
const PORTFOLIO_GRAPHIC_SECTION_REPLACEMENT = `<section class="portfolio-section portfolio-capability-section" id="portfolio-grafico"> <div class="container"> <div class="portfolio-capability-shell"> <div class="portfolio-capability-header"> <span class="portfolio-capability-kicker">Graphic Design</span> <h2>Identità visive, sistemi grafici e materiali che danno spessore al brand</h2> <p class="portfolio-section-lead">Nel portfolio grafico inseriamo ciò che realizziamo davvero per i clienti: logo, brand system, coordinato, packaging leggero e supporti digitali. Quando un progetto completo non è pubblico o è coperto da NDA, mostriamo comunque il tipo di output e il livello di profondità del lavoro.</p> </div> <div class="portfolio-capability-grid"> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Logo & brand mark</span> <h3>Identità visive memorabili</h3> <p>Marchi originali, versioni responsive, palette, tipografia e regole d’uso pensate per rendere il brand riconoscibile sia sul web sia nei materiali stampati.</p> <ul class="portfolio-capability-list"> <li>Logo principale e versioni secondarie</li> <li>Palette, tipografia e tono visivo</li> <li>Linee guida d’uso essenziali</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Brand system</span> <h3>Coordinato coerente e riutilizzabile</h3> <p>Sistemi visivi che non si fermano al logo: pattern, iconografia, layout ricorrenti e materiali coerenti per sito, presentazioni, social e supporti offline.</p> <ul class="portfolio-capability-list"> <li>Biglietti da visita e supporti corporate</li> <li>Presentazioni, brochure e mini kit stampa</li> <li>Template digitali coordinati</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Packaging & visual</span> <h3>Elementi grafici pensati per vendere meglio</h3> <p>Visual per campagne, packaging leggero, etichette, menu e materiali promozionali progettati per aumentare qualità percepita e chiarezza del messaggio.</p> <ul class="portfolio-capability-list"> <li>Packaging essenziale e label design</li> <li>Menu, leaflet e materiali promozionali</li> <li>Creative per campagne e annunci</li> </ul> </article> </div> <p class="portfolio-capability-note">Alcuni lavori grafici vengono mostrati integralmente solo in call o su richiesta, perché spesso nascono dentro progetti più ampi di branding, sito o advertising.</p> <div class="portfolio-capability-cta"> <a href="contatti.html?servizio=graphic-design" class="pf-btn pf-btn-primary">Richiedi un progetto grafico <svg viewBox="0 0 24 24" fill="none" height="14" width="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a> </div> </div> </div> </section>`;
const PORTFOLIO_SOCIAL_SECTION_REPLACEMENT = `<section class="portfolio-section portfolio-capability-section portfolio-capability-section--muted" id="portfolio-social"> <div class="container"> <div class="portfolio-capability-shell"> <div class="portfolio-capability-header"> <span class="portfolio-capability-kicker">Social & content</span> <h2>Creative social, campagne e contenuti pensati per essere usati davvero</h2> <p class="portfolio-section-lead">La parte social del portfolio non viene mostrata come una galleria finta di feed inventati: presentiamo invece i sistemi creativi che sviluppiamo per Instagram, Facebook e LinkedIn, spesso integrati con advertising, branding e pagine landing.</p> </div> <div class="portfolio-capability-grid"> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Template social</span> <h3>Post, stories e carousel coerenti</h3> <p>Template riutilizzabili per rubriche, post educativi, highlights e stories con una gerarchia visiva chiara e coerente con il brand.</p> <ul class="portfolio-capability-list"> <li>Template per feed e stories</li> <li>Copertine carousel e highlights</li> <li>Sistemi grafici per piani editoriali</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Advertising creative</span> <h3>Visual per Meta Ads e campagne locali</h3> <p>Creatività per campagne conversion e lead generation con varianti A/B, CTA leggibili e visual pensati per funzionare anche in formati piccoli e rapidi.</p> <ul class="portfolio-capability-list"> <li>Visual statici per campagne Meta</li> <li>Varianti per test creativi</li> <li>Coerenza tra annuncio e landing</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Art direction</span> <h3>Impostazione visuale del profilo</h3> <p>Direzione creativa per profili aziendali che devono sembrare più professionali: ritmo del feed, palette, copertine e tono visivo coordinato.</p> <ul class="portfolio-capability-list"> <li>Setup visuale del feed</li> <li>Moodboard e linee guida rapide</li> <li>Supporto grafico per contenuti ricorrenti</li> </ul> </article> </div> <p class="portfolio-capability-note">Molti lavori social cambiano nel tempo o vengono prodotti in continuità: per questo mostriamo soprattutto struttura, approccio e qualità del sistema creativo, non una vetrina artificiale di post casuali.</p> <div class="portfolio-capability-cta"> <a href="contatti.html?servizio=social-media" class="pf-btn pf-btn-primary">Parliamo dei tuoi contenuti social <svg viewBox="0 0 24 24" fill="none" height="14" width="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a> </div> </div> </div> </section>`;
const LOCAL_PAGE_CONTENT_UPGRADES = {
  'email-marketing-milano.html': {
    sectionTag: 'Email marketing a Milano · newsletter, automazioni e lead nurturing',
    h1: 'Email marketing a Milano per newsletter e automazioni che generano ricavi',
    answer: '<strong>WebNovis</strong> imposta email marketing a Milano per PMI, e-commerce e servizi B2B: newsletter, automazioni, recupero preventivi e flussi CRM da <strong>€250/mese</strong>, con strategia, copy e setup operativo.',
    lead: 'A <strong>Milano</strong> molte aziende investono in advertising e contenuti ma perdono lead dopo il primo contatto. L’email marketing serve a recuperare opportunità già generate, nutrire prospect e aumentare riacquisti con flussi misurabili.'
  },
  'realizzazione-siti-web-cormano.html': {
    sectionTag: 'Realizzazione siti web a Cormano · da €1.200 · SEO integrata',
    h1: 'Realizzazione siti web a Cormano per PMI, studi e attività locali',
    answer: '<strong>WebNovis</strong> realizza siti web a Cormano con codice custom, SEO tecnica e struttura orientata alle richieste. Landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta da Rho.',
    lead: 'A <strong>Cormano</strong> la concorrenza digitale è concreta: per essere scelti servono una proposta chiara, performance, segnali locali e una pagina capace di trasformare la visita in contatto.'
  },
  'realizzazione-siti-web-parabiago.html': {
    sectionTag: 'Realizzazione siti web a Parabiago · da €1.200 · SEO integrata',
    h1: 'Realizzazione siti web a Parabiago per PMI, artigiani e professionisti',
    answer: '<strong>WebNovis</strong> crea siti web a Parabiago per attività che vogliono sembrare più solide e ricevere più richieste. Siti vetrina da <strong>€1.200</strong>, landing da <strong>€500</strong> ed e-commerce da <strong>€3.500</strong>, con SEO integrata.',
    lead: 'Per le attività di <strong>Parabiago</strong>, un sito efficace deve raccontare competenza locale, servizi, prove di fiducia e percorso di contatto in modo più chiaro rispetto ai competitor generici.'
  },
  'realizzazione-siti-web-senago.html': {
    sectionTag: 'Realizzazione siti web a Senago · da €1.200 · SEO integrata',
    h1: 'Realizzazione siti web a Senago per aziende che vogliono più contatti',
    answer: '<strong>WebNovis</strong> realizza siti web a Senago con design custom, SEO tecnica e struttura orientata alla lead generation. Landing da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong>, e-commerce da <strong>€3.500</strong>.',
    lead: 'A <strong>Senago</strong> molte ricerche hanno intento locale diretto: chi cerca un sito vuole capire subito prezzi, tempi, metodo e affidabilità del fornitore.'
  },
  'realizzazione-siti-web-solaro.html': {
    sectionTag: 'Realizzazione siti web a Solaro · da €1.200 · preventivo rapido',
    h1: 'Realizzazione siti web a Solaro per PMI e professionisti locali',
    answer: '<strong>WebNovis</strong> sviluppa siti web a Solaro con codice custom, performance, SEO tecnica e gestione diretta da Rho. Landing da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong>, e-commerce da <strong>€3.500</strong>.',
    lead: 'Per aziende e professionisti di <strong>Solaro</strong>, il sito deve chiarire offerta, fiducia e prossimità operativa: non basta una presenza online generica.'
  },
  'realizzazione-siti-web-buccinasco.html': {
    sectionTag: 'Realizzazione siti web a Buccinasco · da €1.200 · SEO integrata',
    h1: 'Realizzazione siti web a Buccinasco per attività che vogliono più richieste',
    answer: '<strong>WebNovis</strong> realizza siti web a Buccinasco con design su misura, SEO tecnica e percorsi di conversione chiari. Siti vetrina da <strong>€1.200</strong>, landing da <strong>€500</strong>, e-commerce da <strong>€3.500</strong>.',
    lead: 'A <strong>Buccinasco</strong> il sito deve lavorare su fiducia e chiarezza: servizi, prova, prezzi indicativi e contatto devono essere leggibili già dai primi secondi.'
  },
  'social-media-sesto-san-giovanni.html': {
    sectionTag: 'Social media a Sesto San Giovanni · contenuti, Meta Ads e lead',
    h1: 'Social media a Sesto San Giovanni per PMI e professionisti',
    answer: '<strong>WebNovis</strong> gestisce social media a Sesto San Giovanni con contenuti grafici, piano editoriale e campagne Meta Ads orientate a visibilità utile e richieste misurabili. Pacchetti da <strong>€300/mese</strong>.',
    lead: 'A <strong>Sesto San Giovanni</strong> i social funzionano quando contenuti, advertising e pagina di destinazione sono collegati: l’obiettivo è generare fiducia e richieste, non solo pubblicare.'
  },
  'ecommerce-bresso.html': {
    sectionTag: 'E-commerce a Bresso · da €3.500 · vendite online',
    h1: 'E-commerce a Bresso per negozi e brand che vogliono vendere online',
    answer: '<strong>WebNovis</strong> realizza e-commerce a Bresso con Shopify, WooCommerce o codice custom, SEO integrata, checkout curato e UX orientata alle vendite. Progetti da <strong>€3.500</strong>.',
    lead: 'Per negozi e brand di <strong>Bresso</strong>, vendere online richiede più di un catalogo: servono struttura, pagamenti, SEO, fiducia e gestione operativa sostenibile.'
  },
  'ecommerce-legnano.html': {
    sectionTag: 'E-commerce a Legnano · Shopify, WooCommerce o custom',
    h1: 'E-commerce a Legnano per negozi, retail e brand che vogliono vendere meglio',
    answer: '<strong>WebNovis</strong> realizza e-commerce a Legnano per negozi, brand e attività locali che vogliono vendere online con una struttura più solida: Shopify, WooCommerce o custom, SEO integrata, UX orientata alle conversioni e preventivo rapido.',
    lead: '<strong>Legnano</strong> ha un tessuto commerciale e artigianale molto competitivo: per un e-commerce locale non basta “andare online”, serve scegliere la piattaforma giusta, lavorare su checkout, SEO e fiducia percepita fin dal primo accesso.'
  },
  'ecommerce-monza.html': {
    sectionTag: 'E-commerce a Monza · da €3.500 · SEO e checkout',
    h1: 'E-commerce a Monza per negozi, retail e brand locali',
    answer: '<strong>WebNovis</strong> realizza e-commerce a Monza con Shopify, WooCommerce o sviluppo custom, SEO integrata, catalogo ordinato e checkout orientato alle vendite. Progetti da <strong>€3.500</strong>, con preventivo rapido e strategia prima della piattaforma.',
    lead: 'A <strong>Monza</strong> la concorrenza e-commerce richiede piu di uno shop online: categorie chiare, schede prodotto credibili, performance, pagamenti affidabili e un percorso di acquisto senza attriti.'
  },
  'ecommerce-garbagnate.html': {
    sectionTag: 'E-commerce a Garbagnate Milanese · vendite online e SEO',
    h1: 'E-commerce a Garbagnate per attivita locali che vogliono vendere online',
    answer: '<strong>WebNovis</strong> sviluppa e-commerce a Garbagnate Milanese per negozi, brand e PMI: piattaforma adatta al catalogo, SEO tecnica, UX mobile, pagamenti e gestione ordini. Preventivo rapido e progetto da <strong>€3.500</strong>.',
    lead: 'Per un negozio o brand di <strong>Garbagnate Milanese</strong>, l’e-commerce deve essere sostenibile da gestire e abbastanza solido da competere anche fuori dal territorio.'
  },
  'realizzazione-siti-web-legnano.html': {
    sectionTag: 'Realizzazione siti web a Legnano · da €1.200 · SEO integrata',
    h1: 'Realizzazione siti web a Legnano per PMI, artigiani e professionisti',
    answer: '<strong>WebNovis</strong> realizza siti web a Legnano con codice custom, SEO tecnica e percorsi di contatto chiari. Landing da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>; la proposta conferma perimetro, prezzo e tempistiche.',
    lead: 'A <strong>Legnano</strong> il sito deve aiutare a distinguersi in un mercato locale molto attivo: offerta, prova, prezzi indicativi e CTA devono essere leggibili subito.'
  },
  'realizzazione-siti-web-bollate.html': {
    sectionTag: 'Realizzazione siti web a Bollate · siti vetrina e SEO',
    h1: 'Realizzazione siti web a Bollate per attivita locali e PMI',
    answer: '<strong>WebNovis</strong> crea siti web a Bollate per aziende, studi e attivita locali che vogliono piu richieste da Google. Siti vetrina da <strong>€1.200</strong>, landing da <strong>€500</strong> ed e-commerce da <strong>€3.500</strong>.',
    lead: 'Le ricerche su <strong>Bollate</strong> mostrano intento pratico: chi cerca siti vetrina o sviluppo web vuole capire subito costi, tempi, metodo e affidabilita del fornitore.'
  },
  'agenzia-web-sesto-san-giovanni.html': {
    sectionTag: 'Agenzia web a Sesto San Giovanni · siti, SEO e campagne',
    h1: 'Agenzia web a Sesto San Giovanni per PMI e professionisti',
    answer: '<strong>WebNovis</strong> supporta imprese e professionisti di Sesto San Giovanni con siti custom, branding, social media e campagne locali. La sede è a Rho, con gestione diretta e una proposta personalizzata sul perimetro del progetto.',
    lead: 'A <strong>Sesto San Giovanni</strong> la ricerca “agenzia web” è vicina alla prima pagina: per trasformare impression in contatti servono chiarezza sui servizi, prove di fiducia e collegamenti forti verso siti web, SEO e advertising.'
  },
  'ecommerce-arese.html': {
    sectionTag: 'E-commerce ad Arese · da €3.500 · SEO e checkout',
    h1: 'Realizzazione e-commerce ad Arese per negozi e brand locali',
    answer: '<strong>WebNovis</strong> realizza e-commerce ad Arese con Shopify, WooCommerce o sviluppo custom: catalogo ordinato, pagamenti affidabili, SEO integrata e checkout orientato alle vendite. Progetti indicativi da <strong>€3.500</strong>; la proposta conferma prezzo e tempistiche.',
    lead: 'Ad <strong>Arese</strong>, tra grande retail e attività locali, vendere online significa competere con catene strutturate: servono schede prodotto credibili, velocità reale e un percorso di acquisto senza attriti.'
  },
  'ecommerce-rho.html': {
    sectionTag: 'E-commerce a Rho · da €3.500 · gestione diretta',
    h1: 'Realizzazione e-commerce a Rho per negozi, brand e PMI',
    answer: '<strong>WebNovis</strong> sviluppa e-commerce a Rho — dove ha sede — con piattaforma adatta al catalogo (Shopify, WooCommerce o custom), SEO tecnica, UX mobile e gestione ordini semplice. Progetti indicativi da <strong>€3.500</strong>; la proposta conferma prezzo e tempistiche.',
    lead: 'A <strong>Rho</strong> lavoriamo fianco a fianco con negozi e PMI: per un e-commerce locale contano la piattaforma giusta, costi chiari e un partner raggiungibile, non solo “andare online”.'
  },
  'seo-locale-limbiate.html': {
    sectionTag: 'SEO locale a Limbiate · da €400/mese · Maps e ricerche locali',
    h1: 'Consulenza SEO locale a Limbiate per farti trovare su Google',
    answer: '<strong>WebNovis</strong> offre consulenza SEO locale a Limbiate: ottimizzazione Google Business Profile, pagine locali, recensioni e on-page per comparire su Maps e nelle ricerche “vicino a me”. Percorsi indicativi da <strong>€400/mese</strong>; la proposta conferma attività e durata.',
    lead: 'A <strong>Limbiate</strong> la maggior parte delle ricerche commerciali è locale: chi cerca un servizio guarda mappa, recensioni e vicinanza prima di decidere chi contattare.'
  },
  'landing-page-monza.html': {
    sectionTag: 'Landing page a Monza · da €500 · lead generation locale',
    h1: 'Landing page a Monza per campagne che devono generare richieste vere',
    answer: '<strong>WebNovis</strong> crea landing page a Monza per campagne Google Ads, Meta Ads e acquisizione lead locale. Copy, design e tracking vengono progettati per trasformare il traffico in richieste concrete, non in semplici visite.',
    lead: 'A <strong>Monza</strong> le campagne funzionano quando la pagina di atterraggio è coerente con l’annuncio, chiarisce subito proposta e fiducia, e riduce al minimo i passaggi tra click e richiesta.'
  },
  'graphic-design-milano.html': {
    sectionTag: 'Graphic design a Milano · logo, brand identity e materiali visivi',
    h1: 'Graphic design a Milano per brand che vogliono sembrare subito più credibili',
    answer: '<strong>WebNovis</strong> segue progetti di graphic design a Milano per logo, brand identity, coordinato e visual digitali. L’obiettivo non è solo “fare qualcosa di bello”, ma dare al brand un sistema visivo chiaro, coerente e riutilizzabile.',
    lead: 'Nel mercato di <strong>Milano</strong> la percezione visiva pesa moltissimo: logo, palette, tipografia e materiali coordinati influenzano fiducia, premium positioning e capacità di farsi ricordare.'
  },
  'social-media-legnano.html': {
    sectionTag: 'Social media a Legnano · contenuti, Meta Ads e lead',
    h1: 'Social media a Legnano per PMI e professionisti che vogliono più richieste',
    answer: '<strong>WebNovis</strong> gestisce social media a Legnano con contenuti, creatività e campagne Meta pensate per portare visibilità utile, più fiducia e più contatti, non solo numeri da vanity metrics.',
    lead: 'Per molte attività di <strong>Legnano</strong>, il vero salto non arriva dalla semplice presenza sui social ma da una strategia capace di collegare contenuti, advertising e conversione locale.'
  },
  'email-marketing-legnano.html': {
    sectionTag: 'Email marketing a Legnano · newsletter e automazioni',
    h1: 'Email marketing a Legnano per fidelizzare, recuperare e vendere meglio',
    answer: '<strong>WebNovis</strong> imposta email marketing a Legnano con newsletter, automazioni e flussi CRM pensati per aumentare richieste, riacquisti e relazione con i clienti senza disperdere contatti acquisiti.',
    lead: 'Per chi lavora a <strong>Legnano</strong> con clienti ricorrenti, lead o riacquisti, l’email marketing resta uno dei canali più efficienti: costa poco, si misura bene e aiuta a non perdere opportunità già generate.'
  },
  'accessibilita-cinisello-balsamo.html': {
    sectionTag: 'Accessibilità web a Cinisello Balsamo · audit EAA e WCAG',
    h1: 'Accessibilità web a Cinisello Balsamo per ridurre rischi e blocchi di compliance',
    answer: '<strong>WebNovis</strong> supporta aziende e professionisti di Cinisello Balsamo con audit EAA, adeguamento WCAG e priorità operative chiare. L’obiettivo è capire cosa va corretto davvero e come intervenire senza rifare tutto da zero.',
    lead: 'A <strong>Cinisello Balsamo</strong>, come nel resto dell’area milanese, l’accessibilità non è più solo una buona pratica: per molti progetti è una questione concreta di compliance, reputazione e continuità operativa.'
  },
  'social-media-monza.html': {
    sectionTag: 'Social media a Monza · contenuti, advertising e lead',
    h1: 'Social media a Monza per brand che vogliono più visibilità utile e più contatti',
    answer: '<strong>WebNovis</strong> cura social media a Monza con contenuti, campagne e direzione creativa pensati per aumentare riconoscibilità, qualità percepita e richieste commerciali in modo misurabile.',
    lead: 'Per un brand che lavora su <strong>Monza</strong>, i social non devono solo “presidiare il feed”: devono sostenere posizionamento, fiducia, advertising e continuità della relazione col pubblico giusto.'
  },
  'landing-page-legnano.html': {
    sectionTag: 'Landing page a Legnano · da €500 · campagne e contatti',
    h1: 'Landing page a Legnano per campagne che devono convertire davvero',
    answer: '<strong>WebNovis</strong> progetta landing page a Legnano per campagne Google Ads e Meta Ads con una struttura orientata a click qualificati, moduli più chiari e messaggi coerenti con l’intento di ricerca.',
    lead: 'A <strong>Legnano</strong> una landing efficace fa la differenza soprattutto nei servizi locali e nelle campagne lead generation: meno dispersione, più chiarezza, più possibilità di richiesta.'
  },
  'graphic-design-legnano.html': {
    sectionTag: 'Graphic design a Legnano · logo, visual e brand identity',
    h1: 'Graphic design a Legnano per brand che vogliono distinguersi con più coerenza',
    answer: '<strong>WebNovis</strong> offre graphic design a Legnano per logo, visual, brand identity e materiali coordinati. Ogni progetto nasce per alzare qualità percepita, coerenza visiva e memorabilità del brand.',
    lead: 'Per molte attività di <strong>Legnano</strong>, il primo problema non è l’assenza di servizi ma un’immagine visiva troppo generica. Una brand identity più chiara aiuta a sembrare più affidabili e più professionali.'
  },
  'email-marketing-cinisello-balsamo.html': {
    sectionTag: 'Email marketing a Cinisello Balsamo · automazioni e CRM',
    h1: 'Email marketing a Cinisello Balsamo per trasformare contatti in clienti più spesso',
    answer: '<strong>WebNovis</strong> imposta email marketing a Cinisello Balsamo con newsletter, automazioni e flussi CRM pensati per aumentare riacquisti, richieste e qualità della relazione con i clienti già acquisiti.',
    lead: 'Per attività e PMI di <strong>Cinisello Balsamo</strong>, l’email marketing diventa davvero utile quando è collegato a preventivi, form, e-commerce o customer journey già esistenti, non quando viene trattato come un canale isolato.'
  }
};

const LOCAL_AUTHORITY_PROOF_BLOCKS = {
  'agenzia-web-rho.html': {
    title: 'Perché WebNovis può competere sulle ricerche locali di Rho',
    lead: 'A Rho lavoriamo con una presenza locale verificabile, contatti diretti e un ecosistema di servizi collegati: sito, SEO, branding, contenuti e campagne devono rafforzarsi a vicenda.',
    cards: [
      {
        title: 'Sede e NAP coerenti',
        text: 'Via S. Giorgio 2, Rho (MI), telefono e canali di contatto sono ripetuti in modo coerente tra sito, footer, contatti e dati strutturati.'
      },
      {
        title: 'Intento ampio, non generico',
        text: 'La pagina presidia agenzia web, siti, branding, SEO e crescita digitale a Rho senza disperdere il focus su decine di servizi secondari.'
      },
      {
        title: 'Percorsi interni forti',
        text: 'Colleghiamo la pagina ai servizi core, alle pagine locali principali e agli hub territoriali per consolidare il significato geografico.'
      }
    ],
    closer: 'In pratica, chi cerca un partner digitale a Rho trova un riferimento completo: non solo sviluppo, ma strategia, identità e crescita misurabile.'
  },
  'realizzazione-siti-web-rho.html': {
    title: 'Come trasformiamo un sito locale in uno strumento commerciale',
    lead: 'Per competere con fornitori locali e agenzie milanesi non basta un bel layout: servono prezzo chiaro, metodo, performance, sede riconoscibile e una proposta capace di generare contatti.',
    cards: [
      {
        title: 'Offerta leggibile subito',
        text: 'Landing da 500 euro, siti vetrina da 1.200 euro ed e-commerce da 3.500 euro chiariscono il range prima del contatto.'
      },
      {
        title: 'Differenza tecnica',
        text: 'Il focus sul codice custom, sulla SEO tecnica e sulle performance distingue WebNovis dalle soluzioni basate solo su template o plugin.'
      },
      {
        title: 'Contesto locale reale',
        text: 'Rho, Fiera Milano e hinterland sono citati come contesto commerciale concreto, non come semplice sostituzione automatica di città.'
      }
    ],
    closer: 'Il risultato è un sito più utile per chi deve scegliere: capisce cosa viene realizzato, quanto può investire e perché WebNovis è una scelta concreta sul territorio.'
  },
  'seo-locale-rho.html': {
    title: 'Il cluster SEO locale parte da Rho e si espande con criterio',
    lead: 'La SEO locale efficace parte da un centro chiaro: Google Business Profile, pagine territoriali, recensioni, tracking e query devono raccontare la stessa attività nello stesso territorio.',
    cards: [
      {
        title: 'GBP e sito insieme',
        text: 'La pagina spiega che Maps, profilo Google, contenuti locali e segnali on-page devono raccontare la stessa area servita.'
      },
      {
        title: 'Misurazione concreta',
        text: 'Non promettiamo posizioni automatiche: misuriamo query, impression, CTR, chiamate e richieste generate dalla visibilità locale.'
      },
      {
        title: 'Hinterland coerente',
        text: 'Rho resta il centro geografico e rafforza le pagine limitrofe senza tornare alla generazione massiva di pagine quasi duplicate.'
      }
    ],
    closer: 'Questo approccio consente di crescere senza perdere qualità: poche pagine locali forti, contenuti utili e misurazione continua.'
  },
  'realizzazione-siti-web-garbagnate.html': {
    title: 'Perché Garbagnate è una zona interessante per progetti web locali',
    lead: 'Garbagnate Milanese ha un tessuto di PMI, servizi e attività locali che può beneficiare di siti più chiari, veloci e orientati alle richieste. Qui il sito deve aiutare a farsi trovare e a farsi scegliere.',
    cards: [
      {
        title: 'Vicino alla sede',
        text: 'La distanza da Rho rende credibile la copertura locale e facilita incontri, raccolta materiali e gestione rapida del progetto.'
      },
      {
        title: 'Servizio ad alta intenzione',
        text: '“Realizzazione siti web” intercetta una domanda transazionale più forte rispetto a servizi laterali o informativi.'
      },
      {
        title: 'Contenuto orientato al contatto',
        text: 'Prezzi, tempi, metodo e CTA sono espliciti, così la pagina può lavorare sia per ranking sia per conversione.'
      }
    ],
    closer: 'Per questo lavoriamo su contenuti, struttura, CTA e segnali locali: ogni elemento deve rendere più semplice passare dalla ricerca al contatto.'
  },
  'realizzazione-siti-web-limbiate.html': {
    title: 'Limbiate: siti web per attività che vogliono sembrare più solide online',
    lead: 'A Limbiate molte attività hanno già presenza fisica, reputazione e clientela locale: il salto digitale arriva quando il sito rende tutto questo più visibile, ordinato e misurabile.',
    cards: [
      {
        title: 'Domanda locale non satura',
        text: 'Il contenuto racconta un mercato con PMI, commercio e servizi che possono beneficiare di siti più veloci, chiari e misurabili.'
      },
      {
        title: 'Proposta completa',
        text: 'Sito vetrina, landing ed e-commerce sono collegati a prezzi e deliverable, evitando una pagina vaga da “web agency generica”.'
      },
      {
        title: 'Prossimità operativa',
        text: 'La gestione da Rho e il raggio dell’hinterland rendono credibile la copertura senza fingere una sede fisica a Limbiate.'
      }
    ],
    closer: 'Il prossimo salto qualitativo, per ogni progetto locale, è collegare il sito a prove concrete: portfolio, recensioni, contenuti utili e percorsi di contatto più semplici.'
  },
  'seo-locale-cormano.html': {
    title: 'Cormano: SEO locale per essere scelti nelle ricerche vicine',
    lead: 'A Cormano la competizione locale si gioca spesso su Google Maps, recensioni, chiarezza dei servizi e fiducia immediata. Il sito deve sostenere questi segnali, non vivere separato dal profilo Google.',
    cards: [
      {
        title: 'Intento Maps molto chiaro',
        text: 'La pagina parla di Google Maps, profilo Google Business, recensioni e richieste locali con una promessa coerente col servizio.'
      },
      {
        title: 'Schema e contenuto allineati',
        text: 'Canonical, dati strutturati, H1 e answer capsule indicano lo stesso servizio nella stessa città, riducendo ambiguità semantica.'
      },
      {
        title: 'Misurazione continua',
        text: 'Query, chiamate, richieste e visibilità sulle pagine locali aiutano a capire quali interventi stanno portando valore reale.'
      }
    ],
    closer: 'Il vantaggio arriva quando ogni segnale racconta la stessa cosa: chi sei, dove lavori, cosa offri e perché contattarti ora.'
  },
  'seo-locale-bresso.html': {
    title: 'Bresso: SEO locale per attività che vogliono più contatti in zona',
    lead: 'A Bresso la visibilità locale passa da segnali molto concreti: profilo Google curato, pagine chiare, recensioni, servizi descritti bene e un sito capace di trasformare ricerche vicine in richieste.',
    cards: [
      {
        title: 'Profilo Google più leggibile',
        text: 'Categorie, servizi, descrizioni, immagini e aggiornamenti aiutano chi cerca a capire subito se l’attività è adatta alla sua esigenza.'
      },
      {
        title: 'Pagine locali più utili',
        text: 'La pagina non deve ripetere solo la città: deve spiegare cosa viene fatto, per chi, con quali priorità e con quali segnali di fiducia.'
      },
      {
        title: 'Recensioni e contatti',
        text: 'Il lavoro locale funziona meglio quando recensioni, telefono, form e percorsi di richiesta sono coerenti e facili da usare.'
      }
    ],
    closer: 'Così la SEO locale smette di essere solo “posizionamento” e diventa un sistema per aumentare fiducia, richieste e qualità dei contatti.'
  },
  'seo-locale-rozzano.html': {
    title: 'Rozzano: presidiare Maps con contenuti utili e segnali chiari',
    lead: 'A Rozzano la SEO locale deve parlare a chi cerca un professionista, un negozio, uno studio o un servizio vicino. Serve una presenza chiara su Maps, sito e segnali di fiducia.',
    cards: [
      {
        title: 'Settori e punti di domanda',
        text: 'Il contenuto collega sanitario, commercio, servizi e logistica al bisogno reale di comparire in ricerche locali ad alta intenzione.'
      },
      {
        title: 'Metodo leggibile',
        text: 'Audit locale, interventi on-page, profilo Google e review process spiegano cosa viene fatto prima, durante e dopo il lavoro.'
      },
      {
        title: 'Niente promesse assolute',
        text: 'La pagina lavora su visibilità e richieste misurabili, evitando claim non dimostrabili come “primi garantiti” o ranking automatici.'
      }
    ],
    closer: 'Il risultato atteso è una presenza locale più comprensibile: più facile da trovare, più facile da valutare, più facile da contattare.'
  },
  'google-ads-monza.html': {
    title: 'Google Ads a Monza: separare traffico, tracking e pagina di atterraggio',
    lead: 'Per competere a Monza con Google Ads non basta attivare campagne: traffico, landing page, tracking e qualità del contatto devono essere progettati come un unico percorso.',
    cards: [
      {
        title: 'Intento commerciale forte',
        text: 'Chi cerca Google Ads a Monza spesso vuole lead, chiamate o vendite: la pagina mette il focus su campagne search e tracciamento.'
      },
      {
        title: 'Landing coerenti',
        text: 'Il messaggio collega advertising e pagine di destinazione, punto chiave per non sprecare budget su traffico non convertito.'
      },
      {
        title: 'Ottimizzazione continua',
        text: 'Budget, query, conversioni e qualità del contatto vengono letti insieme per decidere dove scalare e dove tagliare.'
      }
    ],
    closer: 'Per Monza la priorità non è solo comparire: è far capire perché una campagna locale gestita bene costa meno di una campagna confusa.'
  },
  'landing-page-milano.html': {
    title: 'Landing page a Milano: qualità della pagina prima del budget media',
    lead: 'Milano è competitiva: la pagina deve intercettare chi investe in campagne e vuole una landing che converta, non una pagina generica con un modulo in fondo.',
    cards: [
      {
        title: 'Copy e offerta',
        text: 'Headline, prova, FAQ e CTA vengono progettate in funzione dell’intento dell’annuncio e del livello di consapevolezza dell’utente.'
      },
      {
        title: 'Tracking pulito',
        text: 'La pagina sottolinea la misurazione di form, click, chiamate e micro-conversioni prima di aumentare il budget.'
      },
      {
        title: 'Velocità e mobile',
        text: 'A Milano molte campagne partono da mobile: caricamento, leggibilità e gerarchia della CTA sono fattori di conversione.'
      }
    ],
    closer: 'Questa pagina rafforza il ponte tra SEO e paid: più è chiara, più aiuta anche gli annunci Google e Meta.'
  },
  'ecommerce-senago.html': {
    title: 'E-commerce a Senago: vendere online con una struttura più solida',
    lead: 'Per un negozio o brand locale di Senago, l’e-commerce deve unire catalogo, checkout, SEO, UX e gestione operativa. La piattaforma giusta dipende da margini, prodotti e obiettivi reali.',
    cards: [
      {
        title: 'Piattaforma scelta sul ROI',
        text: 'Shopify, WooCommerce o custom vengono valutati in base a catalogo, margini, integrazioni e crescita prevista.'
      },
      {
        title: 'SEO e UX insieme',
        text: 'Categorie, schede prodotto, checkout e performance non sono dettagli tecnici: incidono su traffico organico e conversioni.'
      },
      {
        title: 'Percorso locale credibile',
        text: 'La pagina parla a negozi e brand dell’area nord, con gestione da Rho e una proposta adatta a PMI.'
      }
    ],
    closer: 'Un progetto e-commerce funziona quando ogni scelta tecnica sostiene una scelta commerciale: meno attrito, più fiducia, più possibilità di vendita.'
  },
  'ecommerce-monza.html': {
    title: 'Monza: e-commerce locale con struttura commerciale chiara',
    lead: 'La pagina e-commerce Monza deve intercettare chi vuole vendere online ma non ha ancora deciso piattaforma, budget e percorso tecnico. Per questo mette al centro catalogo, checkout, SEO e gestione operativa.',
    cards: [
      {
        title: 'Intento transazionale',
        text: 'Le query su e-commerce a Monza indicano una domanda vicina al preventivo: la pagina deve rispondere subito su costi, piattaforma e tempi.'
      },
      {
        title: 'Scelta della piattaforma',
        text: 'Shopify, WooCommerce o custom vengono presentati come decisione strategica, non come preferenza tecnica astratta.'
      },
      {
        title: 'Ponte con campagne e SEO',
        text: 'Un e-commerce locale deve collegare traffico organico, eventuali Ads, schede prodotto e checkout per non disperdere il budget.'
      }
    ],
    closer: 'Il messaggio da rafforzare è semplice: non basta aprire uno shop, serve un sistema di vendita misurabile.'
  },
  'ecommerce-garbagnate.html': {
    title: 'Garbagnate: e-commerce sostenibile per negozi e PMI',
    lead: 'Per Garbagnate Milanese la priorità è rendere credibile una pagina e-commerce che non promette una sede locale inventata, ma una copertura operativa vicina e un progetto gestibile.',
    cards: [
      {
        title: 'Copertura territoriale credibile',
        text: 'La gestione da Rho e la prossimità con Garbagnate rendono realistici briefing, raccolta materiali e assistenza senza forzare segnali geografici.'
      },
      {
        title: 'Catalogo e checkout',
        text: 'La pagina deve parlare di prodotti, pagamenti, ordini e gestione quotidiana: sono i temi decisivi per un negozio che vuole vendere online.'
      },
      {
        title: 'SEO per prodotti e categorie',
        text: 'Il traffico organico arriva se categorie e schede prodotto vengono progettate prima della pubblicazione, non dopo.'
      }
    ],
    closer: 'Questo rende la pagina più utile sia per chi cerca un preventivo sia per chi deve capire se l’e-commerce è davvero sostenibile.'
  },
  'realizzazione-siti-web-legnano.html': {
    title: 'Legnano: sito web locale con offerta e prezzi leggibili',
    lead: 'La pagina di Legnano deve trasformare impression in click facendo capire subito che WebNovis lavora su siti custom, prezzi indicativi e gestione diretta del progetto.',
    cards: [
      {
        title: 'Domanda locale ampia',
        text: 'Legnano unisce PMI, professionisti, artigiani e commercio: la pagina deve parlare a più casi senza diventare generica.'
      },
      {
        title: 'Prezzi e deliverable',
        text: 'Landing, sito vetrina ed e-commerce con range di prezzo aiutano l’utente a orientarsi prima di chiedere un preventivo.'
      },
      {
        title: 'Collegamento e-commerce',
        text: 'Le query e-commerce su Legnano sono già presenti: i link interni devono collegare sito vetrina, sviluppo e vendita online.'
      }
    ],
    closer: 'Il valore sta nel rendere la scelta semplice: cosa viene realizzato, quanto può costare e perché WebNovis è adatta al territorio.'
  },
  'realizzazione-siti-web-bollate.html': {
    title: 'Bollate: presidiare siti vetrina e sviluppo web locale',
    lead: 'Bollate mostra domanda per siti vetrina e presenza digitale locale. La pagina deve rispondere a chi vuole un sito chiaro, veloce e orientato ai contatti.',
    cards: [
      {
        title: 'Intento molto pratico',
        text: 'Chi cerca siti vetrina o realizzazione siti web vuole capire subito prezzo, tempi, affidabilità e cosa riceverà.'
      },
      {
        title: 'Prossimità da Rho',
        text: 'La vicinanza rende credibile la gestione diretta e consente di raccontare l’area senza fingere una sede fisica a Bollate.'
      },
      {
        title: 'CTA più dirette',
        text: 'Preventivo, call e pagine servizio devono essere facili da raggiungere perché il traffico locale tende a valutare più fornitori.'
      }
    ],
    closer: 'La pagina deve diventare una risposta locale concreta, non solo una variante del servizio generico.'
  },
  'agenzia-web-sesto-san-giovanni.html': {
    title: 'Sesto San Giovanni: agenzia web con servizi collegati',
    lead: 'La pagina deve presidiare un intento più ampio di “realizzazione siti”: chi cerca un’agenzia web può voler sito, branding, social, SEO o campagne locali.',
    cards: [
      {
        title: 'Cluster di servizi',
        text: 'Sito web, graphic design, social media e advertising vengono collegati per rispondere a un intento più consulenziale.'
      },
      {
        title: 'Vicino alla prima pagina',
        text: 'Le query rilevate sono già in posizioni interessanti: migliorare title, intro e link interni può incidere sul CTR.'
      },
      {
        title: 'Prova e metodo',
        text: 'Per superare le alternative locali servono metodo, prezzi indicativi, esempi e percorsi di contatto chiari.'
      }
    ],
    closer: 'Il prossimo obiettivo è far percepire WebNovis come partner digitale completo, non solo come fornitore di una singola pagina web.'
  },
  'ecommerce-arese.html': {
    title: 'Arese: e-commerce locale che regge il confronto con il retail organizzato',
    lead: 'Le ricerche “realizzazione ecommerce Arese” sono già vicine alle prime posizioni: la pagina deve rispondere subito su piattaforma, costi e tempi per trasformare questa visibilità in richieste di preventivo.',
    cards: [
      {
        title: 'Intento transazionale',
        text: 'Chi cerca e-commerce ad Arese è vicino alla decisione di acquisto: prezzi di partenza, tempi e metodo devono essere leggibili sopra la piega.'
      },
      {
        title: 'Piattaforma come scelta commerciale',
        text: 'Shopify, WooCommerce o custom vengono presentati in funzione di catalogo, margini e gestione quotidiana, non come preferenza tecnica.'
      },
      {
        title: 'Vicinanza operativa',
        text: 'La sede WebNovis è a Rho, a 10 minuti: incontri di persona, assistenza diretta e conoscenza reale del mercato locale.'
      }
    ],
    closer: 'Un e-commerce locale ad Arese funziona quando piattaforma, catalogo e checkout sostengono una strategia di vendita misurabile.'
  },
  'ecommerce-rho.html': {
    title: 'Rho: e-commerce seguiti direttamente dalla sede WebNovis',
    lead: 'Per Rho la pagina deve valorizzare l’unico elemento che nessun competitor può copiare: WebNovis ha sede in città e segue i progetti e-commerce di persona, dal preventivo alla gestione ordini.',
    cards: [
      {
        title: 'Gestione diretta',
        text: 'Briefing, revisioni e formazione avvengono anche di persona: un vantaggio concreto per negozi e PMI che vogliono un referente raggiungibile.'
      },
      {
        title: 'Percorso chiaro',
        text: 'Piattaforma, catalogo, pagamenti, spedizioni e SEO vengono decisi in un percorso ordinato con costi trasparenti da €3.500.'
      },
      {
        title: 'Ponte con SEO e campagne',
        text: 'L’e-commerce viene collegato a SEO locale, Google Ads e social per non dipendere da un solo canale di vendita.'
      }
    ],
    closer: 'Il messaggio per Rho è diretto: un partner e-commerce in città, con metodo e numeri verificabili.'
  },
  'email-marketing-monza.html': {
    title: 'Email marketing a Monza: trasformare lead e clienti in ricavi ricorrenti',
    lead: 'Per PMI e professionisti di Monza, l’email marketing diventa utile quando collega sito, form, preventivi, clienti e riacquisti in flussi chiari e misurabili.',
    cards: [
      {
        title: 'Automazioni pratiche',
        text: 'Newsletter, recupero preventivi, follow-up, riacquisto e segmentazione spiegano casi d’uso concreti per PMI e servizi.'
      },
      {
        title: 'Collegamento con sito e CRM',
        text: 'L’email marketing funziona quando è collegato a form, e-commerce, liste pulite e consenso, non come invio sporadico.'
      },
      {
        title: 'Misurazione sostenibile',
        text: 'Open rate, click, richieste e riacquisti vengono letti per migliorare messaggi e flussi nel tempo.'
      }
    ],
    closer: 'L’obiettivo non è inviare più email, ma recuperare opportunità che il sito, le campagne e il passaparola hanno già generato.'
  },
  'graphic-design-milano.html': {
    title: 'Graphic design a Milano: posizionamento visivo, non solo “logo bello”',
    lead: 'Milano è il mercato più competitivo: per questo la pagina deve raccontare brand identity, materiali e coerenza visuale come leve di fiducia e conversione.',
    cards: [
      {
        title: 'Sistema di marca',
        text: 'Logo, palette, tipografia e regole d’uso vengono pensati come un kit riutilizzabile su sito, social, presentazioni e materiali commerciali.'
      },
      {
        title: 'Output concreti',
        text: 'La pagina chiarisce cosa può essere consegnato: brand identity, coordinato, visual digitali, template e materiali promozionali.'
      },
      {
        title: 'Coerenza con SEO e web',
        text: 'Il design non resta isolato: deve migliorare qualità percepita, leggibilità e fiducia nelle pagine che generano richieste.'
      }
    ],
    closer: 'Così il design diventa un asset commerciale: rende il brand più riconoscibile, più coerente e più facile da scegliere in un mercato affollato.'
  }
};

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

function isNonPublicArtifactPath(relativePath = '') {
  const normalized = normalizeRelativePath(relativePath);
  return NON_PUBLIC_ARTIFACT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function normalizeHtmlDocumentStructure(html, relativePath) {
  const source = String(html || '');
  if (normalizeRelativePath(relativePath) !== 'blog/index.html') return source;

  const withoutDoctype = source.replace(/^\s*<!doctype\s+html[^>]*>\s*/i, '');
  const documentMatch = withoutDoctype.match(
    /^\s*<html\b([^>]*)>\s*<head\b[^>]*>([\s\S]*?)<\/head>\s*<body\b([^>]*)>([\s\S]*)<\/body>\s*<\/html>\s*$/i
  );
  if (!documentMatch) return source;

  const [, htmlAttributes, currentHead, bodyAttributes, currentBody] = documentMatch;
  let head = currentHead.trim();
  let body = currentBody.replace(/^\s*\uFEFF?\s*/, '');
  const skipLinkIndex = body.search(
    /<a\b(?=[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'])[^>]*>/i
  );

  if (skipLinkIndex > 0) {
    const misplacedHeadContent = body.slice(0, skipLinkIndex).trim();
    if (misplacedHeadContent) head = `${head} ${misplacedHeadContent}`;
    body = body.slice(skipLinkIndex);
  }

  return `<!DOCTYPE html> <html${htmlAttributes}><head>${head}</head><body${bodyAttributes}> ${body.trim()}</body></html>`;
}

function ensureSkipLinkTargets(html) {
  const skipLinkPattern = /<a\b(?=[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'])[^>]*>/gi;
  const targetIds = new Set(
    [...String(html || '').matchAll(skipLinkPattern)]
      .map((match) => getTagAttribute(match[0], 'href'))
      .filter((href) => href.startsWith('#') && href.length > 1)
      .map((href) => {
        try {
          return decodeURIComponent(href.slice(1));
        } catch (_) {
          return href.slice(1);
        }
      })
  );

  let updated = html;
  for (const targetId of targetIds) {
    const escapedTarget = escapeRegex(targetId);
    const existingTargetPattern = new RegExp(`\\bid=(["'])${escapedTarget}\\1`, 'gi');
    if ([...String(updated).matchAll(existingTargetPattern)].length !== 0) continue;

    const preferredTagPattern = /<main\b[^>]*>/i.test(updated)
      ? /<main\b[^>]*>/i
      : /<section\b[^>]*>/i;
    if (!preferredTagPattern.test(updated)) continue;

    updated = updated.replace(preferredTagPattern, (openingTag) => {
      if (!/\bid=(["']).*?\1/i.test(openingTag)) {
        const tabindex = /\btabindex=(["']).*?\1/i.test(openingTag) ? '' : ' tabindex="-1"';
        return openingTag.replace(/>$/, ` id="${escapeHtmlAttr(targetId)}"${tabindex}>`);
      }
      return `${openingTag}<span id="${escapeHtmlAttr(targetId)}" tabindex="-1"></span>`;
    });
  }
  return updated;
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

function getTagAttribute(tag, attrName) {
  const pattern = new RegExp(`\\b${escapeRegex(attrName)}=(["'])(.*?)\\1`, 'i');
  const match = String(tag || '').match(pattern);
  return match ? match[2] : '';
}

function upsertRobotsMeta(html, content) {
  const robotsTagPattern = /\s*<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi;
  const existingTags = [...String(html || '').matchAll(robotsTagPattern)].map((match) => match[0]);
  if (existingTags.length === 1 && getTagAttribute(existingTags[0], 'content') === content) {
    return html;
  }

  let found = false;
  const robotsTag = ` <meta name="robots" content="${escapeHtmlAttr(content)}">`;
  const normalized = html.replace(robotsTagPattern, () => {
    if (found) return '';
    found = true;
    return robotsTag;
  });

  if (found) return normalized;

  return html.replace(/<\/head>/i, `${robotsTag} </head>`);
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

function replaceFirstServiceDetailIntro(html, content) {
  return html.replace(
    /(<section class="service-detail">[\s\S]*?<div class="container">\s*<h2>[\s\S]*?<\/h2>\s*<p>)[\s\S]*?(<\/p>)/i,
    `$1${content}$2`
  );
}

function replaceArticleUpgrade(html, { title, description, href, label }) {
  return html.replace(
    /<section class="article-upgrade"[\s\S]*?<\/section>/i,
    `<section class="article-upgrade" aria-label="Risorsa bonus"> <h3>${title}</h3> <p>${description}</p> <a href="${href}" class="btn btn-secondary">${label}</a> </section>`
  );
}

function ensureSelfHreflang(html, relativePath) {
  const withoutExisting = html.replace(/\s*<link\b(?=[^>]*\bhreflang\s*=)[^>]*>/gi, '');
  const publicPath = toPublicUrlPath(relativePath);
  const isNoindex = isNonPublicArtifactPath(relativePath)
    || NON_INDEXABLE_STATIC_PATHS.has(publicPath)
    || getIndexationDirectivesForPath(publicPath) === 'noindex, follow';
  if (isNoindex) return withoutExisting;

  const canonicalTag = withoutExisting.match(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i);
  const href = canonicalTag ? getTagAttribute(canonicalTag[0], 'href') : toAbsolutePublicUrl(relativePath);
  const hreflangTag = `<link rel="alternate" hreflang="it-IT" href="${href}">`;

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
  if (isNonPublicArtifactPath(relativePath)) {
    return upsertRobotsMeta(html, NON_PUBLIC_ARTIFACT_ROBOTS);
  }

  const publicPath = toPublicUrlPath(relativePath);
  const directives = getIndexationDirectivesForPath(publicPath);

  if (NON_INDEXABLE_STATIC_PATHS.has(publicPath)) {
    return upsertRobotsMeta(html, NON_PUBLIC_ARTIFACT_ROBOTS);
  }

  if (directives === 'noindex, follow') {
    return upsertRobotsMeta(html, NOINDEX_ROBOTS);
  }

  return upsertRobotsMeta(html, INDEX_ROBOTS);
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
    let updated = replaceSectionTag(html, 'Realizzazione siti web a Garbagnate · da €1.200 · SEO integrata');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Garbagnate Milanese per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Garbagnate Milanese con design su misura, SEO tecnica integrata e codice 100% custom. Prezzi indicativi: landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>; la proposta conferma perimetro e tempistiche.'
    );
    return updated;
  }

  if (normalizedPath === 'agenzia-web-rho.html') {
    let updated = replaceSectionTag(html, 'Agenzia web a Rho · siti, SEO, branding e crescita locale');
    updated = replaceFirstH1(updated, 'Agenzia web a Rho per siti custom, SEO locale e identità digitale');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> è un’agenzia web a Rho con sede in Via S. Giorgio 2: realizziamo siti custom, e-commerce, branding e SEO locale per PMI e professionisti che vogliono più visibilità, fiducia e richieste misurabili.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-rho.html') {
    let updated = replaceSectionTag(html, 'Realizzazione siti web a Rho · sede locale · SEO integrata');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Rho per aziende che vogliono più richieste');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Rho con codice custom, SEO tecnica integrata e struttura orientata ai contatti. Landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta dalla nostra sede.'
    );
    return updated;
  }

  if (normalizedPath === 'seo-locale-rho.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Rho · Google Maps · richieste qualificate');
    updated = replaceFirstH1(updated, 'SEO locale a Rho per comparire meglio su Google Maps e nelle ricerche in zona');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> lavora sulla SEO locale a Rho con Google Business Profile, pagine locali, segnali on-page, recensioni e report su query e richieste. L’obiettivo è aumentare visibilità utile, non solo impression.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-limbiate.html') {
    let updated = replaceSectionTag(html, 'Siti web a Limbiate · da €1.200 · SEO integrata');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Limbiate per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Limbiate con design su misura, performance, SEO tecnica integrata e codice custom. Landing da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>, con gestione diretta da Rho.'
    );
    return updated;
  }

  if (normalizedPath === 'sito-vetrina-bollate.html') {
    let updated = replaceSectionTag(html, 'Sito vetrina a Bollate · da €1.200 · SEO integrata');
    updated = replaceFirstH1(updated, 'Sito vetrina a Bollate per aziende che vogliono più contatti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti vetrina a Bollate con design su misura, SEO tecnica integrata e struttura orientata alle richieste. Prezzo indicativo da <strong>€1.200</strong>; la proposta conferma perimetro, prezzo e tempistiche.'
    );
    return updated;
  }

  if (normalizedPath === 'graphic-design-bareggio.html') {
    let updated = replaceSectionTag(html, 'Graphic design a Bareggio · da €250 · identità visiva');
    updated = replaceFirstH1(updated, 'Graphic design a Bareggio per logo, brand identity e coordinato');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> offre graphic design a Bareggio per logo, brand identity e coordinato visivo. Prezzo indicativo da <strong>€250</strong>; la proposta conferma output, revisioni, prezzo e tempistiche.'
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
    let updated = replaceSectionTag(html, 'E-commerce a Milano · da €3.500 · SEO integrata');
    updated = replaceFirstH1(updated, 'E-commerce a Milano per PMI, retail e vendita online');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza e-commerce a Milano con SEO integrata, UX orientata alle vendite e codice custom o stack Shopify/WooCommerce. Prezzo indicativo da <strong>€3.500</strong>; la proposta conferma piattaforma, integrazioni, prezzo e tempistiche.'
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

  if (normalizedPath === 'seo-locale-rozzano.html') {
    let updated = replaceSectionTag(html, 'SEO locale a Rozzano · Google Maps · contatti qualificati');
    updated = replaceFirstH1(updated, 'SEO locale a Rozzano per Google Maps, ricerche locali e richieste');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> aiuta attività e professionisti di Rozzano a migliorare Google Maps, pagine locali e segnali di fiducia per aumentare chiamate, visite e richieste qualificate dalle ricerche in zona.'
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
    let updated = replaceSectionTag(html, 'Realizzazione siti web a Bresso · da €1.200 · SEO integrata');
    updated = replaceFirstH1(updated, 'Realizzazione siti web a Bresso per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web a Bresso con design su misura, SEO tecnica integrata e codice 100% custom. Prezzi indicativi: landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>; la proposta conferma perimetro e tempistiche.'
    );
    return updated;
  }

  if (normalizedPath === 'realizzazione-siti-web-arese.html') {
    let updated = replaceSectionTag(html, 'Realizzazione siti web ad Arese · da €1.200 · SEO integrata');
    updated = replaceFirstH1(updated, 'Realizzazione siti web ad Arese per PMI e professionisti');
    updated = replaceAnswerCapsule(
      updated,
      '<strong>WebNovis</strong> realizza siti web ad Arese con design su misura, SEO tecnica integrata e codice 100% custom. Prezzi indicativi: landing page da <strong>€500</strong>, siti vetrina da <strong>€1.200</strong> ed e-commerce da <strong>€3.500</strong>; la proposta conferma perimetro e tempistiche.'
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

function buildMoneyPageInternalLinkBlockHtml(block) {
  const linksHtml = block.links
    .map((link) => `<a href="${link.href}" style="display:inline-flex;align-items:center;padding:.45rem .75rem;border-radius:999px;border:1px solid rgba(96,165,250,.22);background:rgba(96,165,250,.08);color:var(--primary-light);font-size:.86rem;font-weight:700;text-decoration:none">${link.label}</a>`)
    .join(' ');

  return `<aside data-webnovis-money-links="true" aria-label="Percorsi commerciali correlati" style="margin:1.7rem 0 2.2rem;padding:1.15rem 1.25rem;border-radius:14px;border:1px solid rgba(96,165,250,.2);background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(91,106,174,.06))"> <strong style="display:block;color:var(--white);font-size:1rem;margin-bottom:.45rem">${block.title}</strong> <p style="margin:0 0 .85rem;color:var(--gray-light);font-size:.95rem;line-height:1.65">${block.text}</p> <div style="display:flex;flex-wrap:wrap;gap:.55rem">${linksHtml}</div> </aside>`;
}

function alignMoneyPageInternalLinks(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const block = MONEY_PAGE_INTERNAL_LINK_BLOCKS[normalizedPath];
  if (!block) return html;

  const blockHtml = buildMoneyPageInternalLinkBlockHtml(block);
  let updated = html.replace(/\s*<aside\b[^>]*data-webnovis-money-links=["']true["'][\s\S]*?<\/aside>/gi, '');

  if (/<div class="article-summary">[\s\S]*?<\/div>/i.test(updated)) {
    return updated.replace(/(<div class="article-summary">[\s\S]*?<\/div>)/i, `$1 ${blockHtml}`);
  }

  return updated.replace(/(<div class="article-content">)/i, `$1 ${blockHtml}`);
}

function alignEditorialContextLinks(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const link = EDITORIAL_CONTEXT_LINKS[normalizedPath];
  if (!link) return html;

  const blockHtml = `<aside data-webnovis-editorial-links="true" aria-label="Approfondimento editoriale correlato" style="margin:1.7rem 0 2.2rem;padding:1.15rem 1.25rem;border-radius:14px;border:1px solid rgba(96,165,250,.2);background:linear-gradient(135deg,rgba(37,99,235,.08),rgba(91,106,174,.06))"> <strong style="display:block;color:var(--white);font-size:1rem;margin-bottom:.45rem">${link.title}</strong> <p style="margin:0 0 .85rem;color:var(--gray-light);font-size:.95rem;line-height:1.65">${link.text}</p> <a href="${link.href}" style="color:var(--primary-light);font-size:.9rem;font-weight:700">Leggi l’approfondimento →</a> </aside>`;
  let updated = html.replace(/\s*<aside\b[^>]*data-webnovis-editorial-links=["']true["'][\s\S]*?<\/aside>/gi, '');

  if (/<div class="article-summary">[\s\S]*?<\/div>/i.test(updated)) {
    return updated.replace(/(<div class="article-summary">[\s\S]*?<\/div>)/i, `$1 ${blockHtml}`);
  }

  return updated.replace(/(<div class="article-content">)/i, `$1 ${blockHtml}`);
}

function alignHomepageGeoPromotions(html, relativePath) {
  if (normalizeRelativePath(relativePath) !== 'index.html') return html;

  let updated = html;
  for (const replacement of HOMEPAGE_GEO_CARD_REPLACEMENTS) {
    const cardPattern = new RegExp(
      `<a\\b(?=[^>]*href="${escapeRegex(replacement.from)}")(?=[^>]*class="[^"]*\\bzone-card\\b)[^>]*>[\\s\\S]*?<\\/a>`,
      'i'
    );
    updated = updated.replace(cardPattern, (card) => card
      .replace(`href="${replacement.from}"`, `href="${replacement.to}"`)
      .replace(/title="[^"]*"/, `title="${replacement.title}"`)
      .replace(new RegExp(`>\\s*${escapeRegex(replacement.fromCity)}<\\/div>`), `> ${replacement.toCity}</div>`)
      .replace(/(<div style="font-size:\.75rem;[^>]*>)[\s\S]*?(<\/div>)/, `$1${replacement.area}$2`)
      .replace(/(<p style="font-size:\.85rem;[^>]*>)[\s\S]*?(<\/p>)/, `$1${replacement.text}$2`));
  }
  return updated;
}

function normalizeInternalAttributionLinks(html) {
  const attributionMap = new Map([
    ['utm_source', 'data-analytics-source'],
    ['utm_medium', 'data-analytics-medium'],
    ['utm_campaign', 'data-analytics-campaign'],
    ['utm_content', 'data-analytics-content']
  ]);

  return String(html || '').replace(/<a\b[^>]*>/gi, (tag) => {
    const hrefMatch = tag.match(/\bhref=(["'])(.*?)\1/i);
    if (!hrefMatch) return tag;

    const rawHref = hrefMatch[2].replace(/&amp;/g, '&');
    if (!rawHref.includes('?') || /^(?:#|mailto:|tel:|javascript:)/i.test(rawHref)) return tag;

    let resolved;
    try {
      resolved = new URL(rawHref, BASE_URL);
    } catch (_) {
      return tag;
    }
    if (!/^https?:$/.test(resolved.protocol) || !['webnovis.com', 'www.webnovis.com'].includes(resolved.hostname)) return tag;

    const hashIndex = rawHref.indexOf('#');
    const hash = hashIndex >= 0 ? rawHref.slice(hashIndex) : '';
    const withoutHash = hashIndex >= 0 ? rawHref.slice(0, hashIndex) : rawHref;
    const queryIndex = withoutHash.indexOf('?');
    if (queryIndex < 0) return tag;

    const baseHref = withoutHash.slice(0, queryIndex);
    const remainingParts = [];
    const attribution = [];
    for (const part of withoutHash.slice(queryIndex + 1).split('&').filter(Boolean)) {
      const [rawKey, ...rawValueParts] = part.split('=');
      const key = decodeURIComponent(rawKey.replace(/\+/g, ' ')).toLowerCase();
      const dataAttribute = attributionMap.get(key);
      if (!dataAttribute) {
        remainingParts.push(part);
        continue;
      }
      const rawValue = rawValueParts.join('=');
      const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));
      attribution.push([dataAttribute, value]);
    }
    if (attribution.length === 0) return tag;

    const cleanHref = `${baseHref}${remainingParts.length ? `?${remainingParts.join('&')}` : ''}${hash}`;
    let updated = tag.replace(hrefMatch[0], `href=${hrefMatch[1]}${escapeHtmlAttr(cleanHref)}${hrefMatch[1]}`);
    for (const [attribute, value] of attribution) {
      const attributePattern = new RegExp(`\\s${attribute}=["'][^"']*["']`, 'i');
      const serialized = ` ${attribute}="${escapeHtmlAttr(value)}"`;
      updated = attributePattern.test(updated)
        ? updated.replace(attributePattern, serialized)
        : updated.replace(/>$/, `${serialized}>`);
    }
    return updated;
  });
}

function alignCanvaPartnerCredit(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (normalizedPath !== 'blog/ottimizzazione-immagini-web.html') return html;

  let updated = html.replace(/\s*<aside\b[^>]*data-webnovis-canva-credit=["']true["'][\s\S]*?<\/aside>/gi, '');

  updated = updated.replace(
    /<\/ol>\s*<p>Non lasciare che immagini pesanti rallentino il successo del tuo business online\./i,
    `</ol> ${CANVA_PARTNER_CREDIT_HTML} <p>Non lasciare che immagini pesanti rallentino il successo del tuo business online.`
  );

  updated = updated.replace(
    /<meta content="[^"]*" property="article:modified_time">/i,
    '<meta content="2026-05-18" property="article:modified_time">'
  );
  updated = updated.replace(
    /<span class="article-updated">Aggiornato:\s*<time datetime="[^"]*">[^<]*<\/time><\/span>/i,
    '<span class="article-updated">Aggiornato: <time datetime="2026-05-18">18 Maggio 2026</time></span>'
  );
  updated = updated.replace(
    /<p><strong>Ultimo aggiornamento:<\/strong>\s*[^<]+<\/p>/i,
    '<p><strong>Ultimo aggiornamento:</strong> 18 Maggio 2026</p>'
  );
  updated = updated.replace(/"dateModified":"[^"]*"/i, '"dateModified":"2026-05-18"');

  return updated;
}

function alignContactPageInfoCards(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (normalizedPath !== 'contatti.html') return html;
  if (!CONTACT_INFO_CARDS_PATTERN.test(html)) return html;
  return html.replace(CONTACT_INFO_CARDS_PATTERN, CONTACT_INFO_CARDS_REPLACEMENT);
}

function alignLegalNavbar(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (!LEGAL_PAGES.has(normalizedPath)) return html;
  return html.replace(/<ul class="nav-menu" id="navMenu">[\s\S]*?<\/ul>/i, LEGAL_NAV_MENU);
}

function alignPortfolioExperience(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (normalizedPath !== 'portfolio.html') return html;

  let updated = html;

  if (PORTFOLIO_GRAPHIC_SECTION_PATTERN.test(updated)) {
    updated = updated.replace(PORTFOLIO_GRAPHIC_SECTION_PATTERN, PORTFOLIO_GRAPHIC_SECTION_REPLACEMENT);
  }

  if (PORTFOLIO_SOCIAL_SECTION_PATTERN.test(updated)) {
    updated = updated.replace(PORTFOLIO_SOCIAL_SECTION_PATTERN, PORTFOLIO_SOCIAL_SECTION_REPLACEMENT);
  }

  const internalDemos = [
    { demo: 'portfolio/Aether-Digital.html', caseStudy: 'portfolio/case-study/aether-digital.html' },
    { demo: 'portfolio/Lumina-Creative.html', caseStudy: 'portfolio/case-study/lumina-creative.html' },
    { demo: 'portfolio/Muse-Editorial.html', caseStudy: 'portfolio/case-study/muse-editorial.html' },
    { demo: 'portfolio/PopBlock-Studio.html', caseStudy: 'portfolio/case-study/popblock-studio.html' },
    { demo: 'portfolio/Structure-Arch.html', caseStudy: 'portfolio/case-study/structure-arch.html' },
    { demo: 'portfolio/Ember-Oak.html', caseStudy: 'portfolio/case-study/ember-oak.html' }
  ];

  for (const { demo, caseStudy } of internalDemos) {
    const escapedHref = escapeRegex(demo);
    const escapedCaseStudy = escapeRegex(caseStudy);
    updated = updated.replace(
      new RegExp(`<a href="${escapedHref}" class="pf-btn pf-btn-outline" rel="noopener noreferrer" target="_blank">([\\s\\S]*?)Visita Sito\\s*<\\/a>`, 'g'),
      `<a href="${demo}" class="pf-btn pf-btn-outline">$1Apri Demo</a>`
    );
    updated = updated.replace(
      new RegExp(`<a href="${escapedCaseStudy}" class="pf-card-img-link"`, 'g'),
      `<a href="${demo}" class="pf-card-img-link"`
    );
  }

  updated = updated.replace(
    /<a href="#" class="pf-card-img-link" aria-label="DreamSense AI">/g,
    '<a href="https://www.mydreamsense.app" class="pf-card-img-link" aria-label="Visita DreamSense" rel="noopener noreferrer" target="_blank">'
  );

  updated = updated.replace(
    /("name":\s*"DreamSense"[\s\S]*?"url":\s*")https:\/\/www\.webnovis\.com\/portfolio\/case-study\/dreamsense\.html(")/i,
    '$1https://www.mydreamsense.app$2'
  );

  return updated;
}

function buildLocalAuthorityProofHtml(block) {
  const cardsHtml = block.cards
    .map((card) => `<div class="service-card-mini"> <h3>${card.title}</h3> <p>${card.text}</p> </div>`)
    .join(' ');

  return `<section class="service-detail" data-webnovis-local-proof="true" style="background:rgba(255,255,255,.01)"> <div class="container"> <h2>${block.title}</h2> <p>${block.lead}</p> <div class="service-grid">${cardsHtml}</div> <p>${block.closer}</p> </div> </section>`;
}

function alignLocalAuthorityProof(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  const block = LOCAL_AUTHORITY_PROOF_BLOCKS[normalizedPath];
  if (!block) return html;

  const proofHtml = buildLocalAuthorityProofHtml(block);
  const existingProofPattern = /<section class="service-detail" data-webnovis-local-proof="true"[\s\S]*?<\/section>/i;
  if (existingProofPattern.test(html)) {
    return html.replace(existingProofPattern, proofHtml);
  }

  if (/<section class="cta-inline"/i.test(html)) {
    return html.replace(/<section class="cta-inline"/i, `${proofHtml} <section class="cta-inline"`);
  }

  return html.replace(/<\/main>/i, `${proofHtml} </main>`);
}

function normalizeLocalMetricPlaceholders(html) {
  return html.replace(/<strong([^>]*)>NaN\+<\/strong>/g, '<strong$1>Mercato locale</strong>');
}

function removeUnverifiedTwitterSiteMeta(html) {
  return String(html || '').replace(
    /\s*<meta\b(?=[^>]*(?:name|property)\s*=\s*(?:["']twitter:site["']|twitter:site\b))[^>]*>/gi,
    ''
  );
}

function alignLocalPageOpportunityTransforms(html, relativePath) {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (LOCAL_PAGES_ALREADY_OPTIMIZED.has(normalizedPath)) return html;

  const upgrade = LOCAL_PAGE_CONTENT_UPGRADES[normalizedPath];
  if (!upgrade) return html;

  let updated = html;
  updated = replaceSectionTag(updated, upgrade.sectionTag);
  updated = replaceFirstH1(updated, upgrade.h1);
  updated = replaceAnswerCapsule(updated, upgrade.answer);
  updated = replaceFirstServiceDetailIntro(updated, upgrade.lead);
  return updated;
}

function applySeoHtmlTransforms(html, relativePath) {
  let updated = normalizeHtmlDocumentStructure(html, relativePath);
  updated = removeUnverifiedTwitterSiteMeta(updated);
  updated = alignPrioritySnippet(updated, relativePath);
  updated = alignPriorityContentTransforms(updated, relativePath);
  updated = alignLocalPageOpportunityTransforms(updated, relativePath);
  updated = alignLocalAuthorityProof(updated, relativePath);
  updated = alignContactPageInfoCards(updated, relativePath);
  updated = alignLegalNavbar(updated, relativePath);
  updated = alignPortfolioExperience(updated, relativePath);
  updated = alignHomepageGeoPromotions(updated, relativePath);
  updated = alignMoneyPageInternalLinks(updated, relativePath);
  updated = alignEditorialContextLinks(updated, relativePath);
  updated = alignClusterStrategicLinks(updated, relativePath);
  updated = alignCanvaPartnerCredit(updated, relativePath);
  updated = normalizeLocalMetricPlaceholders(updated);
  updated = alignRobotsDirectives(updated, relativePath);
  updated = ensureSelfHreflang(updated, relativePath);
  updated = alignHomepageBrandExperience(updated, relativePath);
  updated = normalizeInternalAttributionLinks(updated);
  updated = ensureSkipLinkTargets(updated);
  return updated;
}

module.exports = {
  BASE_URL,
  NOINDEX_ROBOTS,
  normalizeRelativePath,
  toPublicUrlPath,
  toAbsolutePublicUrl,
  isNonPublicArtifactPath,
  normalizeHtmlDocumentStructure,
  ensureSkipLinkTargets,
  ensureSelfHreflang,
  alignPrioritySnippet,
  alignPriorityContentTransforms,
  alignLocalPageOpportunityTransforms,
  alignLocalAuthorityProof,
  normalizeLocalMetricPlaceholders,
  removeUnverifiedTwitterSiteMeta,
  alignContactPageInfoCards,
  alignLegalNavbar,
  alignPortfolioExperience,
  alignHomepageGeoPromotions,
  alignMoneyPageInternalLinks,
  alignEditorialContextLinks,
  alignClusterStrategicLinks,
  alignCanvaPartnerCredit,
  alignRobotsDirectives,
  alignHomepageBrandExperience,
  normalizeInternalAttributionLinks,
  applySeoHtmlTransforms
};
