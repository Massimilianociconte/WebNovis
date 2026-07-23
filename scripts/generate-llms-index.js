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
      ? 'Sede dichiarata a Rho (MI). Siti web custom, grafica e social per l\'hinterland milanese.'
      : `Servizi web per imprese e professionisti di ${city}; ${city} è un'area servita, non una sede WebNovis.`;
    return `- [Agenzia Web ${city}](${SITE}${p}): ${desc}`;
  });

  const content = `# WebNovis — Agenzia Digitale a Milano e Rho

> WebNovis è un'agenzia web italiana con sede a Rho (Milano) specializzata in sviluppo siti web custom, graphic design, brand identity e social media marketing (contenuti grafici, ricerche di marketing, analisi competitor e advertising). Offriamo soluzioni digitali integrate per PMI, startup e professionisti in tutta Italia.

> Questo è un export editoriale volontario: non è uno standard dei motori di ricerca e non garantisce indicizzazione, ranking o citazioni nei sistemi generativi.

Versione completa (contenuto integrale delle pagine principali in testo semplice): ${SITE}/llms-full.txt

## Servizi

${serviceLines.join('\n')}

- [Brand Identity: guida a costi e pacchetti](${SITE}/servizi/brand-identity.html): dettagli da verificare nella pagina canonica e nel preventivo.

## Landing territoriali (solo URL indicizzabili secondo governance)

Le pagine sotto sono le landing "agenzia-web" ammesse all'indicizzazione dalla governance pSEO. Soltanto Rho è indicata come sede; le altre città sono aree servite. La governance non garantisce l'indicizzazione effettiva da parte dei motori.

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
- [Mikuna — Case Study](${SITE}/portfolio/case-study/mikuna.html): Ristorante Nikkei — sito immersivo con menù digitale.
- [Mimmo Fratelli — Case Study](${SITE}/portfolio/case-study/mimmo-fratelli.html): Negozio alimentari — e-commerce locale.
- [QuickSEO — Case Study](${SITE}/portfolio/case-study/quickseo.html): Web app con strumenti SEO avanzati.
- [Lumina Creative — Case Study](${SITE}/portfolio/case-study/lumina-creative.html): Studio creativo — portfolio e brand identity.
- [Muse Editorial — Case Study](${SITE}/portfolio/case-study/muse-editorial.html): Casa editrice — piattaforma editoriale.
- [PopBlock Studio — Case Study](${SITE}/portfolio/case-study/popblock-studio.html): Studio di animazione — portfolio interattivo.
- [Structure Arch — Case Study](${SITE}/portfolio/case-study/structure-arch.html): Studio di architettura — portfolio progetti.
- [Ember & Oak — Case Study](${SITE}/portfolio/case-study/ember-oak.html): Ristorante — sito con prenotazioni online.
- [Arconti 31 — Case Study](${SITE}/portfolio/case-study/arconti31.html): Attività locale — presenza digitale completa.

## Azienda

- [Chi Siamo](${SITE}/chi-siamo.html): La storia, la missione, i valori e il team di WebNovis.
- [Come Lavoriamo](${SITE}/come-lavoriamo.html): Processo in 5 fasi: brief, wireframe, design, sviluppo e lancio; tempi e responsabilità vengono definiti nella proposta.
- [Preventivo Gratuito](${SITE}/preventivo.html): Richiedi una valutazione per sito web, e-commerce, grafica o social media.
- [Contatti](${SITE}/contatti.html): Email, telefono, WhatsApp, form di contatto e mappa per raggiungere WebNovis.

## Blog

- [Blog WebNovis](${SITE}/blog/): Articoli su web design, SEO, branding, social media e marketing digitale per PMI italiane.
- [Quanto Costa un Sito Web nel 2026](${SITE}/blog/quanto-costa-un-sito-web.html): Guida completa ai costi di realizzazione siti web in Italia.
- [Quanto Costa un E-commerce](${SITE}/blog/quanto-costa-un-ecommerce.html): Guida ai costi di sviluppo e-commerce per PMI.
- [Come Scegliere una Web Agency](${SITE}/blog/come-scegliere-web-agency.html): Criteri per scegliere l'agenzia web giusta.
- [SEO per Piccole Imprese](${SITE}/blog/seo-per-piccole-imprese.html): Guida SEO pratica per PMI italiane.
- [Brand Identity — Guida Completa](${SITE}/blog/brand-identity-guida-completa.html): Come costruire un'identità di marca efficace.
- [Social Media Strategy 2026](${SITE}/blog/social-media-strategy-2026.html): Strategie social media aggiornate per il 2026.
- [Core Web Vitals — Guida](${SITE}/blog/core-web-vitals-guida.html): Ottimizzare LCP, INP e CLS per prestazioni e SEO.

## Informazioni di Contatto

- **Email**: ${ENTITY_FACTS.email}
- **Telefono**: ${ENTITY_FACTS.phoneDisplay}
- **WhatsApp**: https://wa.me/393802647367
- **Sede dichiarata**: ${ENTITY_FACTS.address.streetAddress} — ${ENTITY_FACTS.address.postalCode} ${ENTITY_FACTS.address.addressLocality} (${ENTITY_FACTS.address.addressRegion}), Italia
- **Sito**: ${SITE}
- **Instagram**: https://www.instagram.com/web.novis
- **Facebook**: https://www.facebook.com/share/1C7hNnkqEU/
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
