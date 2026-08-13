const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getBlogFooterHtml } = require(path.join(process.cwd(), 'config', 'site-footer.js'));
const prioritySnippets = require(path.join(process.cwd(), 'config', 'priority-snippets.js'));
const { applySeoHtmlTransforms } = require(path.join(process.cwd(), 'config', 'seo-html-transforms.js'));
const servicesCatalog = require(path.join(process.cwd(), 'data', 'services.json'));

const ROOT = process.cwd();

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function extractTitle(html, file) {
  const match = html.match(/<title>(.*?)<\/title>/i);
  assert.ok(match, `${file} must expose a <title> tag`);
  return match[1];
}

function extractMetaDescription(html, file) {
  const tag = html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i)?.[0];
  assert.ok(tag, `${file} must expose a meta description`);
  const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1];
  assert.notEqual(content, undefined, `${file} meta description must expose content`);
  return content;
}

function parseJsonLd(html, file) {
  return [...html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/gi)].map((match) => {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      assert.fail(`${file} contains invalid JSON-LD: ${error.message}`);
    }
  });
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function normalizeFaqText(value) {
  return decodeHtmlEntities(String(value).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function visibleFaqEntries(html) {
  return [...html.matchAll(/<details\b[^>]*class=["'][^"']*\bfaq-item\b[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi)]
    .map((match) => {
      const question = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1];
      const answer = match[1].match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
      assert.notEqual(question, undefined, 'Every visible FAQ item must expose a summary');
      assert.notEqual(answer, undefined, 'Every visible FAQ item must expose an answer paragraph');
      return {
        question: normalizeFaqText(question),
        answer: normalizeFaqText(answer)
      };
    });
}

function schemaFaqEntries(schemas, file) {
  const faqPage = schemas.find((schema) => schema['@type'] === 'FAQPage');
  assert.ok(faqPage, `${file} must expose FAQPage JSON-LD`);
  return faqPage.mainEntity.map((entity) => ({
    question: normalizeFaqText(entity.name),
    answer: normalizeFaqText(entity.acceptedAnswer?.text)
  }));
}

function main() {
  const sitemap = readText('sitemap.xml');
  assert.ok(
    !sitemap.includes('https://www.webnovis.com/agenzie-web-rho.html'),
    'sitemap.xml must not list the noindex/non-canonical agenzie-web-rho.html URL'
  );

  // Defense-in-depth: no sitemap URL whose published HTML head says noindex
  const noindexInSitemap = [];
  for (const match of sitemap.matchAll(/<loc>https:\/\/www\.webnovis\.com([^<]*)<\/loc>/g)) {
    let file = match[1] === '/' || match[1] === '' ? 'index.html' : match[1].replace(/^\//, '');
    if (file.endsWith('/')) file += 'index.html';
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    const head = fs.readFileSync(path.join(ROOT, file), 'utf8').slice(0, 8000);
    const robots =
      (head.match(/name=["']robots["'][^>]*content=["']([^"']+)/i) ||
        head.match(/content=["']([^"']+)["'][^>]*name=["']robots["']/i) ||
        [])[1] || '';
    if (/noindex/i.test(robots)) noindexInSitemap.push(match[1] || '/');
  }
  assert.equal(
    noindexInSitemap.length,
    0,
    `sitemap must not include noindex URLs: ${noindexInSitemap.slice(0, 10).join(', ')}`
  );

  const agenzie = readText('agenzie-web-rho.html');
  assert.match(
    agenzie,
    /noindex/i,
    'agenzie-web-rho.html must expose noindex while the 301 is not yet live on GitHub Pages'
  );
  assert.ok(
    agenzie.includes('https://www.webnovis.com/agenzia-web-rho.html'),
    'agenzie-web-rho.html must canonical to the correct singular URL'
  );

  const llms = readText('llms.txt');
  assert.ok(
    !llms.includes('agenzia-web-nerviano.html'),
    'llms.txt must not promote noindex local pages (nerviano)'
  );
  assert.ok(
    !llms.includes('48+ URL'),
    'llms.txt must not keep the outdated "48+ URL" sitemap claim'
  );
  assert.ok(
    llms.includes('agenzia-web-rho.html'),
    'llms.txt must keep the primary Rho hub'
  );
  assert.match(
    llms,
    /export editoriale[^\n]+non (?:garantisce|produce)[^\n]+ranking/i,
    'llms.txt must disclose that the voluntary editorial export does not guarantee ranking'
  );

  const forbiddenEntityUrls = [
    'https://www.wikidata.org/wiki/Q138340285',
    'https://www.linkedin.com/company/webnovis',
    'https://www.cylex-italia.it/rho/web-novis-16332263.html',
    'https://www.cylex-italia.it/rho/web-novis-16332431.html'
  ];
  for (const file of ['index.html', 'src/html/index.html', 'chi-siamo.html', 'src/html/chi-siamo.html', 'llms.txt', 'ai.txt', 'webnovis-ai-data.json']) {
    const content = readText(file);
    for (const forbiddenUrl of forbiddenEntityUrls) {
      assert.ok(!content.includes(forbiddenUrl), `${file} must not publish obsolete entity URL ${forbiddenUrl}`);
    }
  }

  const homepageSchemas = parseJsonLd(readText('index.html'), 'index.html');
  const homepageOrganization = homepageSchemas.find((schema) => schema['@id'] === 'https://www.webnovis.com/#organization');
  assert.ok(homepageOrganization, 'index.html must expose the canonical WebNovis Organization');
  assert.equal(homepageOrganization.name, 'WebNovis', 'the canonical Organization name must use the stable WebNovis spelling');
  assert.ok(
    !JSON.stringify(homepageSchemas).includes('openingHours'),
    'index.html must not publish unverified structured business hours'
  );

  const aiData = JSON.parse(readText('webnovis-ai-data.json'));
  assert.equal(aiData.metadata?.document_type, 'editorial_export', 'webnovis-ai-data.json must identify itself as an editorial export');
  assert.match(
    aiData.metadata?.ranking_notice || '',
    /non (?:garantisce|produce)[^\n]+ranking/i,
    'webnovis-ai-data.json must not imply that the file creates ranking benefits'
  );
  assert.equal(aiData.company?.openingHours, undefined, 'webnovis-ai-data.json must omit unverified opening hours');
  assert.equal(aiData.company?.category, undefined, 'webnovis-ai-data.json must omit the unverified GBP category');

  const serviceBySlug = new Map(servicesCatalog.services.map((service) => [service.slug, service]));
  for (const exportedService of aiData.services || []) {
    const sourceService = serviceBySlug.get(exportedService.slug);
    assert.ok(sourceService, `AI export service ${exportedService.slug} must come from data/services.json`);
    assert.equal(exportedService.priceFrom, sourceService.priceFrom, `AI export price for ${exportedService.slug} must match data/services.json`);
    assert.equal(exportedService.priceCurrency, sourceService.priceCurrency, `AI export currency for ${exportedService.slug} must match data/services.json`);
  }

  const brokenGeoSamples = [
    ['accessibilita-arese.html', 'accessibilita-rho.html'],
    ['social-media-cornaredo.html', 'social-media-rho.html'],
    ['web-app-arese.html', 'web-app-rho.html']
  ];

  for (const [file, brokenHref] of brokenGeoSamples) {
    assert.ok(!readText(file).includes(brokenHref), `${file} still links to missing page ${brokenHref}`);
  }

  const indexHtml = readText('index.html');
  assert.match(
    indexHtml,
    /<h1 class="hero-title">[\s\S]*Web agency a Milano[\s\S]*non template/i,
    'Homepage hero H1 must carry the primary geo intent and the approved wording'
  );
  assert.ok(
    indexHtml.includes('Percorsi principali'),
    'Homepage hero must expose a body-level cluster of primary section links'
  );
  assert.match(
    indexHtml,
    /<input[^>]+name="email"[^>]+aria-label="Iscriviti alla newsletter"[^>]*>/,
    'Homepage newsletter email input must expose an accessible label'
  );
  assert.match(
    indexHtml,
    /<input[^>]+id="chatInput"[^>]+aria-label="Scrivi un messaggio a Weby"[^>]*>/,
    'Homepage chat input must expose an accessible label'
  );
  assert.ok(
    !/realizzazione-siti-web-(?:pero|lainate|cornaredo|settimo-milanese)\.html/.test(indexHtml),
    'Homepage must not promote de-amplified city landings'
  );
  assert.match(
    indexHtml,
    /href="(?:\/)?agenzia-web-milano\.html"/,
    'Homepage must pass Milano commercial intent to the dedicated hinterland landing'
  );
  assert.ok(
    indexHtml.includes('/zone-servite/') &&
      indexHtml.includes('/agenzia-web/') &&
      indexHtml.includes('/realizzazione-siti-web/'),
    'Homepage footer must surface hub links that consolidate local intent'
  );

  const blogFooterHtml = getBlogFooterHtml('..');
  assert.ok(
    blogFooterHtml.includes('/zone-servite/') &&
      blogFooterHtml.includes('/agenzia-web/') &&
      blogFooterHtml.includes('/realizzazione-siti-web/'),
    'Shared footer must keep the local hub links that consolidate geo intent'
  );
  assert.ok(
    !blogFooterHtml.includes('/agenzia-web-rho.html') &&
      !blogFooterHtml.includes('/agenzia-web-milano.html'),
    'Shared footer must not promote direct city landing pages sitewide'
  );
  assert.ok(
    blogFooterHtml.includes('https://g.page/r/CRblKdK0GGO_EBM/review') &&
      blogFooterHtml.includes('Lascia una recensione'),
    'Shared footer must retain the verified Google review action with neutral wording'
  );
  assert.ok(
    !blogFooterHtml.includes('★★★★★') && !blogFooterHtml.includes('review-badge-stars'),
    'Shared footer must not imply an unverified Google star rating'
  );

  // Scelta editoriale: gli articoli sono firmati da WebNovis, mai da una
  // persona. author e publisher puntano entrambi al nodo Organization, e la
  // byline visibile deve dire la stessa cosa dello schema.
  for (const file of ['blog/quanto-costa-un-sito-web.html', 'blog/seo-per-piccole-imprese.html']) {
    const html = readText(file);
    const schemas = parseJsonLd(html, file);
    const posts = schemas.filter((schema) => ['BlogPosting', 'Article'].includes(schema['@type']));
    assert.ok(posts.length > 0, `${file} must declare its article schema`);
    for (const post of posts) {
      assert.equal(
        post.author?.['@id'],
        'https://www.webnovis.com/#organization',
        `${file} must attribute the article to WebNovis, not to a person`
      );
      assert.ok(post.publisher, `${file} must keep WebNovis as publisher`);
    }
    assert.ok(
      !JSON.stringify(schemas).includes('#person-massimiliano'),
      `${file} must not attribute the article to an individual editor`
    );
    assert.ok(
      !schemas.some((schema) => schema.name === 'WebNovis Editorial Team'),
      `${file} must not keep an unreferenced collective editorial-team entity`
    );
    assert.match(
      html,
      /class="article-meta">Di <a href="\.\.\/chi-siamo\.html" rel="author">WebNovis<\/a>/,
      `${file} visible byline must read "Di WebNovis"`
    );
  }

  const caseStudyFiles = [
    'portfolio/case-study/aether-digital.html',
    'portfolio/case-study/arconti31.html',
    'portfolio/case-study/ember-oak.html',
    'portfolio/case-study/fbtotalsecurity.html',
    'portfolio/case-study/lumina-creative.html',
    'portfolio/case-study/mikuna.html',
    'portfolio/case-study/mimmo-fratelli.html',
    'portfolio/case-study/muse-editorial.html',
    'portfolio/case-study/popblock-studio.html',
    'portfolio/case-study/quickseo.html',
    'portfolio/case-study/structure-arch.html'
  ];

  for (const file of caseStudyFiles) {
    const html = readText(file);
    assert.ok(!html.includes('../../blog/index.html"index.html"'), `${file} still contains malformed footer blog link`);
    assert.ok(!html.includes('../../blog/index.html'), `${file} still points to ../../blog/index.html instead of ../../blog/`);
  }

  const brokenBlogLinks = [
    ['blog/contenuti-personal-brand.html', 'href="/personal-branding-online"'],
    ['blog/contenuti-personal-brand.html', 'href="/sito-personale-freelancer"'],
    ['blog/ecommerce-b2b-guida.html', 'href="/ecommerce-che-vende"'],
    ['blog/ecommerce-b2b-guida.html', 'href="/shopify-vs-sito-ecommerce-custom"'],
    ['blog/internal-linking-strategia.html', 'href="seo-tecnica.html"'],
    ['blog/javascript-performance-ottimizzare.html', 'href="/sito-web-mobile-first"'],
    ['blog/javascript-performance-ottimizzare.html', 'href="/velocita-sito-web-guida"'],
    ['blog/social-media-analytics-metriche.html', 'href="analytics-instagram-facebook-linkedin.html"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/chiedere-recensioni-clienti"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/funnel-vendita-online"'],
    ['blog/thank-you-page-ottimizzazione.html', 'href="/ottimizzazione-tasso-conversione"']
  ];

  for (const [file, brokenHref] of brokenBlogLinks) {
    assert.ok(!readText(file).includes(brokenHref), `${file} still contains broken internal link ${brokenHref}`);
  }

  const serviceCityHtml = readText('automazione-business-milano.html');
  assert.ok(
    !serviceCityHtml.includes('content="Agenzia Web a Rho — WebNovis" name="twitter:title"'),
    'automazione-business-milano.html still inherits the stale Rho twitter:title from the geo base template'
  );
  assert.ok(
    !serviceCityHtml.includes('https://www.webnovis.com/agenzia-web-rho.html#localbusiness-rho'),
    'automazione-business-milano.html still inherits the stale Rho LocalBusiness schema from the geo base template'
  );
  assert.ok(
    !serviceCityHtml.includes('"name": "Agenzia Web a Rho (Milano) — WebNovis"'),
    'automazione-business-milano.html still inherits the stale Rho WebPage schema from the geo base template'
  );

  for (const file of ['realizzazione-siti-web-arese.html', 'ecommerce-arese.html']) {
    const html = readText(file);
    const snippet = prioritySnippets[file];
    assert.ok(snippet, `${file} must have a canonical priority snippet`);
    assert.equal(extractTitle(html, file), snippet.title, `${file} must retain its final priority title after build:geo`);
    assert.equal(
      extractMetaDescription(html, file),
      snippet.description,
      `${file} must retain its final priority description after build:geo`
    );
    assert.equal(
      applySeoHtmlTransforms(html, file),
      html,
      `${file} must already contain the canonical visible and head transforms after build:geo`
    );
  }

  for (const file of [
    'agenzia-web-rho.html',
    'agenzia-web-arese.html',
    'realizzazione-siti-web-arese.html',
    'ecommerce-milano.html',
    'agenzia-web/index.html',
    'realizzazione-siti-web/index.html'
  ]) {
    const html = readText(file);
    const schemas = parseJsonLd(html, file);
    const visibleFaqs = visibleFaqEntries(html);
    assert.ok(visibleFaqs.length > 0, `${file} must expose visible FAQ items`);
    assert.deepEqual(
      schemaFaqEntries(schemas, file),
      visibleFaqs,
      `${file} FAQPage questions and normalized answers must exactly match the visible FAQs`
    );
    assert.ok(
      !JSON.stringify(schemas).includes('SpeakableSpecification'),
      `${file} must not use commercial-page speakable markup`
    );
    assert.ok(
      !JSON.stringify(schemas).includes('AggregateRating') && !JSON.stringify(schemas).includes('"@type":"Review"'),
      `${file} must not publish self-serving rating or review schema`
    );
  }

  const rhoTailWhitespace = readText('agenzia-web-rho.html').match(
    /<script defer src="js\/noncritical-loader\.min\.js"><\/script>(\s*)<script type="speculationrules">/i
  );
  assert.ok(rhoTailWhitespace, 'agenzia-web-rho.html must retain the canonical noncritical/speculation script tail');
  assert.equal(
    rhoTailWhitespace[1],
    ' ',
    'Repeated handcrafted Rho regeneration must not accumulate whitespace across the canonical pipeline'
  );

  const communityArticle = readText('blog/community-management-guida.html');
  assert.ok(
    !communityArticle.includes('href="community-online.html"') &&
      !communityArticle.includes('href="engagement-community.html"') &&
      !communityArticle.includes('href="gestire-community-social.html"'),
    'community-management-guida.html still contains self-referential broken links'
  );

  const gscOpportunityPages = {
    'blog/quanto-costa-brand-identity.html': {
      h1: 'Costo Brand Identity 2026: Prezzi e Pacchetti',
      answer: 'Una brand identity professionale per una PMI'
    },
    'blog/pillar-page-strategia.html': {
      h1: 'Pillar Page: Cos’è, Esempi e Come Crearla',
      answer: 'Una pillar page è una guida centrale'
    },
    'blog/community-management-guida.html': {
      h1: 'Community Management: Cos’è, Attività e KPI',
      answer: 'Il community management comprende'
    },
    'blog/analisi-competitiva-online.html': {
      h1: 'Analisi Competitor Online: Strumenti, Template e Checklist',
      answer: 'Un’analisi competitor online efficace confronta'
    },
    'blog/competitor-analysis-metodo.html': {
      h1: 'Come Fare un’Analisi Competitor: Metodo in 7 Passi',
      answer: 'Per fare un’analisi competitor'
    },
    'servizi/accessibilita.html': {
      h1: 'Audit Accessibilità Digitale per Siti Web: WCAG ed EAA',
      answer: 'svolge audit di accessibilità digitale'
    }
  };

  for (const [file, expected] of Object.entries(gscOpportunityPages)) {
    const html = readText(file);
    const snippet = prioritySnippets[file];
    assert.ok(snippet, `${file} must have a GSC-derived priority snippet`);
    assert.equal(extractTitle(html, file), snippet.title, `${file} must publish its canonical GSC title`);
    assert.ok(html.includes(`<h1>${expected.h1}</h1>`), `${file} must own its intended search intent in the H1`);
    assert.ok(html.includes(expected.answer), `${file} must expose a concise answer suitable for search and AI extraction`);
    assert.equal(
      applySeoHtmlTransforms(html, file),
      html,
      `${file} GSC opportunity transforms must be idempotent after normalization`
    );
  }

  const contacts = readText('contatti.html');
  assert.equal(extractTitle(contacts, 'contatti.html'), prioritySnippets['contatti.html'].title);
  assert.ok(
    contacts.includes('Contatti, sede a Rho e richiesta di preventivo'),
    'contatti.html must focus on contact intent instead of competing with agenzia-web-rho.html'
  );
  assert.ok(
    contacts.includes('href="/agenzia-web-rho.html"') && contacts.includes('web agency a Rho'),
    'contatti.html must pass local relevance to the dedicated Rho landing page with a contextual link'
  );

  const logAnalysis = readText('blog/log-analysis-seo.html');
  assert.ok(
    !logAnalysis.includes('href="server-log-seo.html"') &&
      !logAnalysis.includes('href="log-file-analysis.html"') &&
      !logAnalysis.includes('href="googlebot-log.html"'),
    'log-analysis-seo.html still contains broken log-analysis links'
  );

  const autoWriterLog = JSON.parse(readText('blog/articles-log.json'));
  const socialTrendsEntry = autoWriterLog.find((entry) => entry.slug === 'tendenze-social-media-2026');
  assert.ok(socialTrendsEntry, 'articles-log.json must track tendenze-social-media-2026 as an auto-writer article');

  const socialTrendsHtml = readText('blog/tendenze-social-media-2026.html');
  assert.ok(
    socialTrendsHtml.includes(`<title>${socialTrendsEntry.title} — WebNovis</title>`),
    'tendenze-social-media-2026.html title must stay aligned with articles-log.json'
  );
  assert.ok(
    socialTrendsHtml.includes(`name="description">`) && socialTrendsHtml.includes(socialTrendsEntry.description),
    'tendenze-social-media-2026.html description must stay aligned with articles-log.json'
  );

  const blogIndex = readText('blog/index.html');
  assert.ok(
    blogIndex.includes(`href="tendenze-social-media-2026.html">${socialTrendsEntry.title}</a>`),
    'blog/index.html must expose the current tendenze-social-media-2026 title from articles-log.json'
  );
  assert.ok(
    !blogIndex.includes('Tendenze Social Media 2026: Cosa Aspettarsi e Come Prepararsi'),
    'blog/index.html must not retain stale tendenze-social-media-2026 metadata after rebuilds'
  );

  const ownershipManifest = JSON.parse(readText('blog/articles-manifest.json'));
  assert.equal(
    ownershipManifest.priorityArticles['quanto-costa-un-sito-web']?.owner,
    'built-in-generator',
    'quanto-costa-un-sito-web must have an explicit non-legacy owner in blog/articles-manifest.json'
  );

  const wave2TitleFiles = [
    'blog/quanto-costa-un-sito-web.html',
    'blog/partita-iva-ecommerce.html',
    'blog/tendenze-social-media-2026.html',
    'blog/importanza-sito-web-attivita.html',
    'blog/shopify-vs-sito-ecommerce-custom.html',
    'blog/quanto-costa-una-landing-page.html'
  ];

  const socialMetaPages = [
    'servizi/seo-milano.html',
    'quanto-costa-un-sito-web/index.html'
  ];
  const claimAuditPages = [
    'servizi/seo-milano.html',
    'quanto-costa-un-sito-web/index.html',
    'servizi/sito-vetrina.html'
  ];

  for (const file of wave2TitleFiles) {
    const title = extractTitle(readText(file), file);
    assert.ok(title.length <= 65, `${file} title must stay within the 65-character Wave 2 guardrail`);
  }

  for (const file of socialMetaPages) {
    const html = readText(file);
    const title = extractTitle(html, file);
    const titleKeyword = title.split('|')[0].trim().toLowerCase();
    const twitterTitle = (html.match(/content="([^"]*)"\s+name="twitter:title"/i) || [])[1] || '';
    const twitterDesc = (html.match(/content="([^"]*)"\s+name="twitter:description"/i) || [])[1] || '';
    assert.ok(twitterTitle, `${file} must expose a twitter:title`);
    assert.ok(twitterDesc, `${file} must expose a twitter:description`);
    assert.ok(!twitterTitle.includes('Realizzazione Siti Web'), `${file} twitter:title must not inherit the stale "Realizzazione Siti Web" copy`);
    assert.ok(titleKeyword.split(/\s+/).some((w) => w && twitterTitle.toLowerCase().includes(w)), `${file} twitter:title must share a keyword with <title>`);
    assert.ok(twitterDesc.length > 40, `${file} twitter:description must be a real snippet, not a stub`);
  }

  const unverifiedNumericClaims = [
    /rating\s+medio\s+(?:sopra|superiore\s+a)\s+4[.,]2/i,
    /già\s+superiore\s+alla\s+media\s+dei\s+competitor/i,
    /4[.,]2\s*(?:stelle|su\s+5)/i
  ];
  for (const file of claimAuditPages) {
    const html = readText(file);
    for (const pattern of unverifiedNumericClaims) {
      assert.ok(!pattern.test(html), `${file} must not carry the unverified claim: ${pattern}`);
    }
  }

  const estimatePages = [
    { file: 'quanto-costa-un-sito-web/index.html', slug: 'sito-vetrina' },
    { file: 'servizi/sito-vetrina.html', slug: 'sito-vetrina' }
  ];
  for (const { file, slug } of estimatePages) {
    const html = readText(file);
    const estimate = servicesCatalog.services.find((s) => s.slug === slug).timeEstimate;
    assert.ok(!html.includes('3-4 settimane'), `${file} must not expose the stale "3-4 settimane" estimate`);
    assert.ok(html.includes(estimate), `${file} estimate must stay aligned with services.json (${slug} = ${estimate})`);
  }

  console.log('SEO regression checks passed.');
}

try {
  main();
} catch (error) {
  console.error('SEO regression checks failed:', error.message);
  process.exit(1);
}
