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
const LEGAL_PAGES = new Set(['privacy-policy.html', 'cookie-policy.html', 'termini-condizioni.html']);
const LOCAL_PAGES_ALREADY_OPTIMIZED = new Set([
  'sito-vetrina-bollate.html',
  'graphic-design-bareggio.html',
  'realizzazione-siti-web-garbagnate.html',
  'realizzazione-siti-web-bresso.html',
  'landing-page-milano.html',
  'ecommerce-milano.html',
  'sviluppo-app-mobile-milano.html',
  'email-marketing-monza.html',
  'google-ads-monza.html',
  'ecommerce-senago.html',
  'seo-locale-bresso.html',
  'seo-locale-cormano.html',
  'seo-locale-buccinasco.html',
  'seo-locale-lainate.html',
  'seo-locale-nerviano.html',
  'seo-locale-cologno-monzese.html',
  'realizzazione-siti-web-arese.html'
]);
const CONTACT_INFO_CARDS_PATTERN = /<div class="contatti-info-cards">[\s\S]*?<div class="contatti-map">[\s\S]*?<\/div>\s*<\/div>/i;
const CONTACT_INFO_CARDS_REPLACEMENT = `<div class="contatti-info-cards"> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L10.89 13.26C11.54 13.67 12.46 13.67 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"/></svg> <h3>Email</h3> </div> <div class="contatti-card-body contatti-card-body--offset"> <a href="mailto:hello@webnovis.com" class="contatti-card-link">hello@webnovis.com</a> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> <h3>Telefono</h3> </div> <div class="contatti-card-body contatti-card-body--offset contatti-card-stack"> <a href="tel:+393802647367" title="Chiama Web Novis" class="phone-cta" aria-label="Chiama WebNovis al numero +39 380 264 7367" data-contact-phone="+393802647367"><span class="phone-cta-label">Chiama WebNovis</span></a> <a href="https://wa.me/393802647367?text=Ciao%20Web%20Novis%2C%20vorrei%20maggiori%20informazioni" target="_blank" rel="noopener noreferrer" class="contatti-card-link">Scrivici su WhatsApp →</a> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> <h3>Sede</h3> </div> <div class="contatti-card-body contatti-card-body--offset"> <p>Via S. Giorgio, 2<br>20017 Rho (MI), Italia</p> </div> </article> <article class="contatti-card"> <div class="contatti-card-head"> <svg viewBox="0 0 24 24" fill="none" height="22" width="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> <h3>Orari</h3> </div> <div class="contatti-card-body contatti-card-body--offset"> <p>Aperto 24 ore su 24<br>7 giorni su 7</p> </div> </article> <div class="contatti-map"> <iframe allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2799.5!2d9.0393!3d45.5299!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c1237f2e291d%3A0x7e38e24c285e5a0!2sVia%20S.%20Giorgio%2C%202%2C%2020017%20Rho%20MI!5e0!3m2!1sit!2sit!4v1700000000000!5m2!1sit!2sit" title="Sede Web Novis — Via S. Giorgio 2, Rho (MI)"></iframe> </div> </div>`;
const LEGAL_NAV_MENU = '<ul class="nav-menu" id="navMenu"> <li><a href="servizi/" class="nav-link">Servizi</a></li> <li><a href="portfolio.html" class="nav-link">Portfolio</a></li> <li><a href="chi-siamo.html" class="nav-link">Chi Siamo</a></li> <li><a href="blog/" class="nav-link">Blog</a></li> <li><a href="contatti.html" class="nav-link">Contatti</a></li> <li><a href="preventivo.html" class="nav-link nav-cta">Inizia Ora</a></li> </ul>';
const PORTFOLIO_GRAPHIC_SECTION_PATTERN = /<section class="portfolio-section" style="padding:4rem 0" id="portfolio-grafico">[\s\S]*?<\/section>/i;
const PORTFOLIO_SOCIAL_SECTION_PATTERN = /<section class="portfolio-section" style="padding:4rem 0;background:rgba\(255,255,255,.01\)" id="portfolio-social">[\s\S]*?<\/section>/i;
const PORTFOLIO_GRAPHIC_SECTION_REPLACEMENT = `<section class="portfolio-section portfolio-capability-section" id="portfolio-grafico"> <div class="container"> <div class="portfolio-capability-shell"> <div class="portfolio-capability-header"> <span class="portfolio-capability-kicker">Graphic Design</span> <h2>Identità visive, sistemi grafici e materiali che danno spessore al brand</h2> <p class="portfolio-section-lead">Nel portfolio grafico inseriamo ciò che realizziamo davvero per i clienti: logo, brand system, coordinato, packaging leggero e supporti digitali. Quando un progetto completo non è pubblico o è coperto da NDA, mostriamo comunque il tipo di output e il livello di profondità del lavoro.</p> </div> <div class="portfolio-capability-grid"> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Logo & brand mark</span> <h3>Identità visive memorabili</h3> <p>Marchi originali, versioni responsive, palette, tipografia e regole d’uso pensate per rendere il brand riconoscibile sia sul web sia nei materiali stampati.</p> <ul class="portfolio-capability-list"> <li>Logo principale e versioni secondarie</li> <li>Palette, tipografia e tono visivo</li> <li>Linee guida d’uso essenziali</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Brand system</span> <h3>Coordinato coerente e riutilizzabile</h3> <p>Sistemi visivi che non si fermano al logo: pattern, iconografia, layout ricorrenti e materiali coerenti per sito, presentazioni, social e supporti offline.</p> <ul class="portfolio-capability-list"> <li>Biglietti da visita e supporti corporate</li> <li>Presentazioni, brochure e mini kit stampa</li> <li>Template digitali coordinati</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Packaging & visual</span> <h3>Elementi grafici pensati per vendere meglio</h3> <p>Visual per campagne, packaging leggero, etichette, menu e materiali promozionali progettati per aumentare qualità percepita e chiarezza del messaggio.</p> <ul class="portfolio-capability-list"> <li>Packaging essenziale e label design</li> <li>Menu, leaflet e materiali promozionali</li> <li>Creative per campagne e annunci</li> </ul> </article> </div> <p class="portfolio-capability-note">Alcuni lavori grafici vengono mostrati integralmente solo in call o su richiesta, perché spesso nascono dentro progetti più ampi di branding, sito o advertising.</p> <div class="portfolio-capability-cta"> <a href="contatti.html?servizio=graphic-design" class="pf-btn pf-btn-primary">Richiedi un progetto grafico <svg viewBox="0 0 24 24" fill="none" height="14" width="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a> </div> </div> </div> </section>`;
const PORTFOLIO_SOCIAL_SECTION_REPLACEMENT = `<section class="portfolio-section portfolio-capability-section portfolio-capability-section--muted" id="portfolio-social"> <div class="container"> <div class="portfolio-capability-shell"> <div class="portfolio-capability-header"> <span class="portfolio-capability-kicker">Social & content</span> <h2>Creative social, campagne e contenuti pensati per essere usati davvero</h2> <p class="portfolio-section-lead">La parte social del portfolio non viene mostrata come una galleria finta di feed inventati: presentiamo invece i sistemi creativi che sviluppiamo per Instagram, Facebook e LinkedIn, spesso integrati con advertising, branding e pagine landing.</p> </div> <div class="portfolio-capability-grid"> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Template social</span> <h3>Post, stories e carousel coerenti</h3> <p>Template riutilizzabili per rubriche, post educativi, highlights e stories con una gerarchia visiva chiara e coerente con il brand.</p> <ul class="portfolio-capability-list"> <li>Template per feed e stories</li> <li>Copertine carousel e highlights</li> <li>Sistemi grafici per piani editoriali</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Advertising creative</span> <h3>Visual per Meta Ads e campagne locali</h3> <p>Creatività per campagne conversion e lead generation con varianti A/B, CTA leggibili e visual pensati per funzionare anche in formati piccoli e rapidi.</p> <ul class="portfolio-capability-list"> <li>Visual statici per campagne Meta</li> <li>Varianti per test creativi</li> <li>Coerenza tra annuncio e landing</li> </ul> </article> <article class="portfolio-capability-card"> <span class="portfolio-capability-tag">Art direction</span> <h3>Impostazione visuale del profilo</h3> <p>Direzione creativa per profili aziendali che devono sembrare più professionali: ritmo del feed, palette, copertine e tono visivo coordinato.</p> <ul class="portfolio-capability-list"> <li>Setup visuale del feed</li> <li>Moodboard e linee guida rapide</li> <li>Supporto grafico per contenuti ricorrenti</li> </ul> </article> </div> <p class="portfolio-capability-note">Molti lavori social cambiano nel tempo o vengono prodotti in continuità: per questo mostriamo soprattutto struttura, approccio e qualità del sistema creativo, non una vetrina artificiale di post casuali.</p> <div class="portfolio-capability-cta"> <a href="contatti.html?servizio=social-media" class="pf-btn pf-btn-primary">Parliamo dei tuoi contenuti social <svg viewBox="0 0 24 24" fill="none" height="14" width="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a> </div> </div> </div> </section>`;
const LOCAL_PAGE_CONTENT_UPGRADES = {
  'ecommerce-legnano.html': {
    sectionTag: 'E-commerce a Legnano · Shopify, WooCommerce o custom',
    h1: 'E-commerce a Legnano per negozi, retail e brand che vogliono vendere meglio',
    answer: '<strong>WebNovis</strong> realizza e-commerce a Legnano per negozi, brand e attività locali che vogliono vendere online con una struttura più solida: Shopify, WooCommerce o custom, SEO integrata, UX orientata alle conversioni e preventivo rapido.',
    lead: '<strong>Legnano</strong> ha un tessuto commerciale e artigianale molto competitivo: per un e-commerce locale non basta “andare online”, serve scegliere la piattaforma giusta, lavorare su checkout, SEO e fiducia percepita fin dal primo accesso.'
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
  let updated = html;
  updated = alignPrioritySnippet(updated, relativePath);
  updated = alignPriorityContentTransforms(updated, relativePath);
  updated = alignLocalPageOpportunityTransforms(updated, relativePath);
  updated = alignContactPageInfoCards(updated, relativePath);
  updated = alignLegalNavbar(updated, relativePath);
  updated = alignPortfolioExperience(updated, relativePath);
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
  alignLocalPageOpportunityTransforms,
  alignContactPageInfoCards,
  alignLegalNavbar,
  alignPortfolioExperience,
  alignClusterStrategicLinks,
  alignRobotsDirectives,
  alignHomepageBrandExperience,
  applySeoHtmlTransforms
};
