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
const {
  ALL_INDEXABLE_GEO_PATHS,
  TIER1_INDEXABLE_GEO_PATHS
} = require('../config/pseo-governance');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.webnovis.com';
const OUT = path.join(ROOT, 'llms.txt');

function readTitle(filePath) {
  try {
    const html = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
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
    const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    return (xml.match(/<url>/g) || []).length;
  } catch (_) {
    return 0;
  }
}

function build() {
  const sitemapCount = countSitemapUrls();
  const agenzia = listIndexableAgenzia();
  const tier1Count = TIER1_INDEXABLE_GEO_PATHS.size;

  const localLines = agenzia.map((p) => {
    const file = p.replace(/^\//, '');
    const slug = file.replace(/^agenzia-web-/, '').replace(/\.html$/, '');
    const city = cityLabelFromSlug(slug);
    const isRho = slug === 'rho';
    const desc = isRho
      ? 'Sede principale a Rho (MI). Siti web custom, grafica e social per l\'hinterland milanese.'
      : `Servizi web per imprese e professionisti di ${city}. Hub locale indexable.`;
    return `- [Agenzia Web ${city}](${SITE}${p}): ${desc}`;
  });

  const content = `# WebNovis — Agenzia Digitale a Milano e Rho

> WebNovis è un'agenzia web italiana con sede a Rho (Milano) specializzata in sviluppo siti web custom, graphic design, brand identity e social media marketing (contenuti grafici, ricerche di marketing, analisi competitor e advertising). Offriamo soluzioni digitali integrate per PMI, startup e professionisti in tutta Italia.

Versione completa (contenuto integrale delle pagine principali in testo semplice): ${SITE}/llms-full.txt

## Servizi

- [Sviluppo Siti Web](${SITE}/servizi/sviluppo-web.html): Siti web professionali, responsive, ottimizzati SEO. Landing page, siti vetrina, web app.
- [E-commerce](${SITE}/servizi/ecommerce.html): Negozi online personalizzati, scalabili e sicuri per PMI italiane.
- [Landing Page](${SITE}/servizi/landing-page.html): Pagine ad alta conversione per campagne marketing e lead generation.
- [Sito Vetrina](${SITE}/servizi/sito-vetrina.html): Siti multi-pagina professionali per presentare la tua attività online.
- [Graphic Design e Branding](${SITE}/servizi/graphic-design.html): Logo design, brand identity, coordinato aziendale, materiali pubblicitari.
- [Brand Identity: Costi e Pacchetti](${SITE}/servizi/brand-identity.html): Quanto costa una brand identity: logo da €250, brand identity completa da €500, coordinato da €150. Pacchetti, tempi e FAQ.
- [Social Media Marketing](${SITE}/servizi/social-media.html): Ricerche di marketing, analisi competitor, creazione contenuti grafici e gestione campagne advertising su Instagram, Facebook (Meta) e LinkedIn.
- [Accessibilità Web e Compliance EAA](${SITE}/servizi/accessibilita.html): Audit accessibilità WCAG 2.1 AA, adeguamento all'European Accessibility Act e monitoraggio continuo. Audit da €350, adeguamento da €990, monitoraggio €69/mese.
- [Consulenze Strategiche](${SITE}/servizi/consulenze.html): Sessioni di consulenza su siti web, grafica, SEO/GEO, brand identity e ricerca di mercato. Da €80.

## Sedi Locali (solo URL indexable)

Le pagine sotto sono le uniche landing GEO "agenzia-web" ammesse all'indicizzazione (governance pSEO). Non citare altre combinazioni servizio×città come pagine primarie.

${localLines.join('\n')}

Hub di navigazione:
- [Agenzia Web per Comuni](${SITE}/agenzia-web/): elenco comuni serviti
- [Realizzazione Siti Web Milano e Lombardia](${SITE}/realizzazione-siti-web/): hub regionale
- [Zone Servite](${SITE}/zone-servite/): mappa copertura territoriale

Tier 1 (contenuto arricchito, priorità ranking locale): ${tier1Count} URL — elenco completo in ${SITE}/llms-full.txt.

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
- [Come Lavoriamo](${SITE}/come-lavoriamo.html): Il nostro processo in 5 fasi: brief, wireframe, design, sviluppo e lancio. Trasparenza e tempi certi.
- [Preventivo Gratuito](${SITE}/preventivo.html): Richiedi un preventivo gratuito per sito web, e-commerce, grafica o social media. Risposta in 24 ore.
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

- **Email**: hello@webnovis.com
- **Telefono**: +39 380 264 7367
- **WhatsApp**: https://wa.me/393802647367
- **Sede**: Via S. Giorgio, 2 — 20017 Rho (MI), Italia
- **Orari**: Lun–Ven 9:00–18:00 (CET); risposte anche fuori orario via form/email
- **Sito**: ${SITE}
- **Instagram**: https://www.instagram.com/web.novis
- **Facebook**: https://www.facebook.com/share/1C7hNnkqEU/
- **Clutch.co**: https://clutch.co/profile/web-novis
- **Trustpilot**: https://it.trustpilot.com/review/webnovis.com
- **Google Business Profile**: Web Novis — Web designer, Rho (MI)
- **Wikidata**: https://www.wikidata.org/wiki/Q138340285
- **Crunchbase**: https://www.crunchbase.com/organization/web-novis
- **DesignRush**: https://www.designrush.com/agency/profile/web-novis

## Prezzi Indicativi

- Landing Page: da €500
- Sito Vetrina: da €1.200
- E-commerce: da €3.500
- Social Media Marketing (contenuti grafici): da €300/mese
- Advertising Gestito (Meta Ads): da €500/mese
- Graphic Design / Logo: da €250
- Brand Identity Completa: da €500
- Consulenze: da €80

## Dati Strutturati

- [ai.txt](${SITE}/ai.txt): Contenuto AI-readable completo con informazioni aziendali, servizi, FAQ e keyword.
- [Dati JSON AI](${SITE}/webnovis-ai-data.json): Dati strutturati in formato JSON per crawler AI.
- [Sitemap XML](${SITE}/sitemap.xml): Mappa del sito con ${sitemapCount || 'N'} URL indicizzabili (allineata a meta robots index).
`;

  fs.writeFileSync(OUT, content, 'utf8');
  console.log(`✅ llms.txt regenerated → ${agenzia.length} local indexable hubs, sitemap count ${sitemapCount}`);
}

build();
