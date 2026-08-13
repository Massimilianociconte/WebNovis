#!/usr/bin/env node
/**
 * generate-llms-index.js — Rigenera llms.txt da single source.
 *
 * Allinea le "Sedi Locali" e il conteggio sitemap alle sole URL indexable
 * (config/pseo-governance.js + sitemap.xml), evitando di promuovere pagine
 * noindex verso crawler AI / LLM.
 *
 * Uso: node scripts/generate-llms-index.js
 * npm: npm run build:llms
 */

const fs = require('fs');
const path = require('path');
const { getPublishDir } = require('../config/publish-targets');
const {
  ALL_INDEXABLE_GEO_PATHS,
  TIER1_INDEXABLE_GEO_PATHS
} = require('../config/pseo-governance');
const { ENTITY_FACTS } = require('../config/entity-facts');
const { formatPublicLocality } = require('../config/presence-policy');
const servicesCatalog = require('../data/services.json');

const PUBLISH_ROOT = getPublishDir();
const SITE = ENTITY_FACTS.siteUrl;
const OUT = path.join(PUBLISH_ROOT, 'llms.txt');
const serviceBySlug = new Map(servicesCatalog.services.map((service) => [service.slug, service]));

function formatPrice(service) {
  return `€${Number(service.priceFrom).toLocaleString('it-IT')}${service.priceUnit || ''}`;
}

function readTitle(filePath) {
  try {
    const html = fs.readFileSync(path.join(PUBLISH_ROOT, filePath), 'utf8');
    const m = html.match(/<title>([^<]*)<\/title>/i);
    return m ? m[1].replace(/\s*\|\s*WebNovis.*$/i, '').trim() : filePath;
  } catch (_) {
    return filePath;
  }
}

function cityLabelFromSlug(slug) {
  return slug
    .split('-')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
    .replace(/\bMi\b/g, 'MI');
}

function listIndexableAgenzia() {
  return [...ALL_INDEXABLE_GEO_PATHS]
    .filter((p) => p.startsWith('/agenzia-web-'))
    .sort((a, b) => {
      // Rho first, then alpha
      if (a.includes('-rho.')) return -1;
      if (b.includes('-rho.')) return 1;
      return a.localeCompare(b);
    });
}

function countSitemapUrls() {
  try {
    const xml = fs.readFileSync(path.join(PUBLISH_ROOT, 'sitemap.xml'), 'utf8');
    return (xml.match(/<url>/g) || []).length;
  } catch (_) {
    return 0;
  }
}

function build() {
  const sitemapCount = countSitemapUrls();
  const agenzia = listIndexableAgenzia();
  const tier1Count = TIER1_INDEXABLE_GEO_PATHS.size;
  const exportedServices = servicesCatalog.services.filter((service) => service.hasPage === true);
  const serviceLines = exportedServices.map((service) =>
    `- [${service.name}](${SITE}${service.url}): ${service.shortDesc} Prezzo iniziale indicativo da ${formatPrice(service)}; il preventivo conferma il caso specifico.`
  );
  const priceLines = ['landing-page', 'sito-vetrina', 'ecommerce', 'graphic-design', 'social-media', 'accessibilita', 'consulenze']
    .map((slug) => serviceBySlug.get(slug))
    .filter(Boolean)
    .map((service) => `- ${service.name}: da ${formatPrice(service)}`);

  const localLines = agenzia.map((p) => {
    const file = p.replace(/^\//, '');
    const slug = file.replace(/^agenzia-web-/, '').replace(/\.html$/, '');
    const city = cityLabelFromSlug(slug);
    const isRho = slug === 'rho';
    const desc = isRho
      ? 'Base operativa a Rho (MI). Siti web custom, grafica e social per l\'hinterland milanese. Nessuno showroom aperto al pubblico.'
      : `Servizi web per imprese e professionisti di ${city}; ${city} è un'area servita, non una sede WebNovis.`;
    return `- [Agenzia Web ${city}](${SITE}${p}): ${desc}`;
  });

  const content = `# WebNovis — Agenzia Digitale a Milano e Rho

## Fact sheet (in breve)

- **Cosa è**: agenzia web italiana specializzata in siti custom, graphic design, brand identity e social media marketing.
- **Dove opera**: ${formatPublicLocality()}, hinterland ovest di Milano. Non ha filiali e non ha uno showroom aperto al pubblico.
- **Come lavora**: da remoto e presso il cliente.
- **Prezzi di catalogo**: landing da €500, sito vetrina da €1.200, e-commerce da €3.500. Il preventivo conferma perimetro e tempi.
- **Pagine canoniche**: ${SITE}/ · ${SITE}/chi-siamo.html · ${SITE}/quanto-costa-un-sito-web/

> WebNovis è un'agenzia web italiana con base a Rho (Milano) specializzata in sviluppo siti web custom, graphic design, brand identity e social media marketing (contenuti grafici, ricerche di marketing, analisi competitor e advertising). Offriamo soluzioni digitali integrate per PMI, startup e professionisti in tutta Italia.

> Questo è un export editoriale volontario: non è uno standard dei motori di ricerca e non garantisce indicizzazione, ranking o citazioni nei sistemi generativi.

Versione completa (contenuto integrale delle pagine principali in testo semplice): ${SITE}/llms-full.txt

## Servizi

${serviceLines.join('\n')}

- [Brand Identity: guida a costi e pacchetti](${SITE}/servizi/brand-identity.html): dettagli da verificare nella pagina canonica e nel preventivo.

## Landing territoriali (solo URL indicizzabili secondo governance)

Le pagine sotto sono le landing "agenzia-web" ammesse all'indicizzazione dalla governance pSEO. Rho è la base operativa dichiarata; le altre città sono aree servite. La governance non garantisce l'indicizzazione effettiva da parte dei motori.

${localLines.join('\n')}

Hub di navigazione:
- [Agenzia Web per Comuni](${SITE}/agenzia-web/): elenco comuni serviti
- [Realizzazione Siti Web Milano e Lombardia](${SITE}/realizzazione-siti-web/): hub regionale
- [Zone Servite](${SITE}/zone-servite/): mappa copertura territoriale

Tier 1 (priorità editoriale interna): ${tier1Count} URL — elenco completo in ${SITE}/llms-full.txt.

## Portfolio

- [Portfolio Progetti](${SITE}/portfolio.html): Raccolta dei progetti realizzati da WebNovis per clienti in diversi settori.
- [Aether Digital — Case Study](${SITE}/portfolio/case-study/aether-digital.html): Agenzia digitale — sito corporate moderno.
- [FB Total Security — Case Study](${SITE}/portfolio/case-study/fbtotalsecurity.html): Azienda sicurezza — sito professionale.
- [Mikuna — Case Study](${SITE}/portfolio/case-study/mikuna.html): Ristorante peruviano a Varese — sito immersivo con menù digitale.
- [Mimmo Fratelli — Case Study](${SITE}/portfolio/case-study/mimmo-fratelli.html): Negozio alimentari — e-commerce locale.
- [QuickSEO — Case Study](${SITE}/portfolio/case-study/quickseo.html): Web app con strumenti SEO avanzati.
- [Lumina Creative — Case Study](${SITE}/portfolio/case-study/lumina-creative.html): Studio creativo — portfolio e brand identity.
- [Muse Editorial — Case Study](${SITE}/portfolio/case-study/muse-editorial.html): Casa editrice — piattaforma editoriale.
- [PopBlock Studio — Case Study](${SITE}/portfolio/case-study/popblock-studio.html): Studio di animazione — portfolio interattivo.
- [Structure Arch — Case Study](${SITE}/portfolio/case-study/structure-arch.html): Studio di architettura — portfolio progetti.
- [Ember & Oak — Case Study](${SITE}/portfolio/case-study/ember-oak.html): Ristorante — sito con prenotazioni online.
- [Arconti 31 — Case Study](${SITE}/portfolio/case-study/arconti31.html): Attività locale — presenza digitale completa.
- [UnimiDoc — Case Study](${SITE}/portfolio/case-study/unimidoc.html): Piattaforma EdTech — appunti verificati per la Statale di Milano, ricerca per corso ed esame e sistema a crediti.
- [Momentum — Case Study](${SITE}/portfolio/case-study/momentum.html): App padel — segnapunti offline per Apple Watch e Wear OS, landing page, blog e preview Android.

## Azienda

- [Chi Siamo](${SITE}/chi-siamo.html): La storia, la missione, i valori e il team di WebNovis.
- [Come Lavoriamo](${SITE}/come-lavoriamo.html): Processo in 5 fasi: brief, wireframe, design, sviluppo e lancio; tempi e responsabilità vengono definiti nella proposta.
- [Preventivo Gratuito](${SITE}/preventivo.html): Richiedi una valutazione per sito web, e-commerce, grafica o social media.
- [Contatti](${SITE}/contatti.html): Email, telefono, WhatsApp, form di contatto e mappa per raggiungere WebNovis.

## Blog

- [Blog WebNovis](${SITE}/blog/): Articoli su web design, SEO, branding, social media e marketing digitale per PMI italiane.
- [Quanto costa un sito web: prezzi di catalogo](${SITE}/quanto-costa-un-sito-web/): landing, vetrina ed e-commerce con prezzi di partenza WebNovis.
- [Guida 2026 al prezzo di un sito](${SITE}/blog/quanto-costa-un-sito-web.html): approfondimento di mercato, cosa incide sul preventivo e come leggere i range.
- [Quanto Costa un E-commerce](${SITE}/blog/quanto-costa-un-ecommerce.html): Guida ai costi di sviluppo e-commerce per PMI.
- [Come Scegliere una Web Agency](${SITE}/blog/come-scegliere-web-agency.html): Criteri per scegliere l'agenzia web giusta.
- [SEO per Piccole Imprese](${SITE}/blog/seo-per-piccole-imprese.html): Guida SEO pratica per PMI italiane.
- [Brand Identity — Guida Completa](${SITE}/blog/brand-identity-guida-completa.html): Come costruire un'identità di marca efficace.
- [Social Media Strategy 2026](${SITE}/blog/social-media-strategy-2026.html): Strategie social media aggiornate per il 2026.
- [Core Web Vitals — Guida](${SITE}/blog/core-web-vitals-guida.html): Ottimizzare LCP, INP e CLS per prestazioni e SEO.
- [SEO Locale e Google Maps](${SITE}/blog/seo-locale-google-maps.html): Come apparire primi nei risultati locali.
- [Schema Markup — Guida ai Dati Strutturati](${SITE}/blog/schema-markup-guida.html): Implementare dati strutturati per rich snippet e AI.
- [Sito Web che Non Converte: 15 Cause](${SITE}/blog/sito-web-che-non-converte.html): Diagnosi e soluzioni per aumentare lead e contatti.
- [Accessibilità Web e Sanzioni EAA 2026](${SITE}/blog/sanzioni-sito-non-accessibile-2026.html): Obblighi, scadenze e rischi legali.
- [Test A/B: Migliorare le Conversioni con i Dati](${SITE}/blog/test-ab-sito-web-guida.html): Come usare esperimenti basati sui dati.
- [Dominio e Hosting: Guida per Non Tecnici](${SITE}/blog/dominio-hosting-guida-non-tecnico.html): Scegliere dominio e hosting senza farsi fregare.
- [Automazione Marketing per PMI](${SITE}/blog/automazione-marketing-pmi-strumenti.html): 7 strumenti che fanno risparmiare ore ogni settimana.
- [GDPR e Sito Web: Guida alla Conformità](${SITE}/blog/gdpr-sito-web-guida.html): Requisiti privacy per siti aziendali italiani.
- [Google Analytics 4 — Guida Pratica](${SITE}/blog/google-analytics-4-guida.html): Configurare GA4 e leggere i dati che contano.
- [UX Design: 10 Best Practice](${SITE}/blog/ux-design-best-practice.html): Regole fondamentali per un sito che converte.
- [Strategia Digitale per PMI](${SITE}/blog/strategia-digitale-pmi.html): Da dove iniziare e quali canali attivare per primi.
- [Sito Web Professionale: Checklist 2026](${SITE}/blog/sito-web-professionale-checklist.html): I 20 elementi essenziali di un sito che funziona.

## Informazioni di Contatto

- **Email**: ${ENTITY_FACTS.email}
- **Telefono**: ${ENTITY_FACTS.phoneDisplay}
- **WhatsApp**: https://wa.me/393802647367
- **Base operativa**: ${formatPublicLocality()} — lavoro da remoto e presso il cliente, senza showroom aperto al pubblico
- **Sito**: ${SITE}
- **Instagram**: https://www.instagram.com/web.novis
- **Facebook**: https://www.facebook.com/share/1C7hNnkqEU/
- **YouTube**: https://www.youtube.com/@WebNovis
- **Trustpilot**: https://it.trustpilot.com/review/webnovis.com
- **Google Business Profile**: esistenza confermata dal proprietario; rating, conteggio, categoria e orari non verificati
- **Azione recensione Google**: ${ENTITY_FACTS.reviewActionUrl}
- **DesignRush**: https://www.designrush.com/agency/profile/web-novis
- **GoodFirms**: https://www.goodfirms.co/company/web-novis

## Prezzi Indicativi

${priceLines.join('\n')}

I prezzi sono valori iniziali presenti in data/services.json, non preventivi né promesse di risultato.

## Dati Strutturati

- [ai.txt](${SITE}/ai.txt): export editoriale sintetico; nessun beneficio di ranking o citazione è dichiarato.
- [Dati JSON AI](${SITE}/webnovis-ai-data.json): gli stessi fatti e prezzi di catalogo in JSON, con campi non verificati esplicitamente esclusi.
- [Sitemap XML](${SITE}/sitemap.xml): Mappa del sito con ${sitemapCount || 'N'} URL indicizzabili (allineata a meta robots index).
`;

  fs.writeFileSync(OUT, content, 'utf8');
  console.log(`✅ llms.txt regenerated → ${agenzia.length} local indexable hubs, sitemap count ${sitemapCount}`);
}

build();
