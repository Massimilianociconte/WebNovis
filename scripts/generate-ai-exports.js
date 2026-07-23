#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { ENTITY_FACTS } = require('../config/entity-facts');
const { ALL_INDEXABLE_GEO_PATHS } = require('../config/pseo-governance');
const servicesCatalog = require('../data/services.json');

const ROOT = path.join(__dirname, '..');
const services = servicesCatalog.services
  .filter((service) => service.hasPage === true)
  .map((service) => ({
    slug: service.slug,
    name: service.name,
    description: service.shortDesc,
    url: `${ENTITY_FACTS.siteUrl}${service.url}`,
    priceFrom: service.priceFrom,
    priceCurrency: service.priceCurrency,
    ...(service.priceUnit ? { priceUnit: service.priceUnit } : {}),
    priceNotice: 'Prezzo iniziale indicativo dal catalogo WebNovis; il preventivo conferma il caso specifico.'
  }));

function formatPrice(service) {
  const formatted = Number(service.priceFrom).toLocaleString('it-IT');
  return `da €${formatted}${service.priceUnit || ''}`;
}

function buildAiText() {
  const serviceLines = services.map((service) =>
    `- [${service.name}](${service.url}): ${service.description} Prezzo iniziale indicativo ${formatPrice(service)}.`
  );
  const profileLines = ENTITY_FACTS.publicProfiles.map((url) => `- ${url}`);

  return `# WebNovis — export editoriale per sistemi di risposta

> Questo file è un riepilogo editoriale volontario. Non è uno standard di ranking, non sostituisce le pagine HTML e non garantisce indicizzazione, ranking o citazioni nei sistemi generativi.

## Identità dichiarata

- Nome principale: ${ENTITY_FACTS.name}
- Variante leggibile: ${ENTITY_FACTS.alternateName}
- Sito canonico: ${ENTITY_FACTS.siteUrl}
- Sede dichiarata: ${ENTITY_FACTS.address.streetAddress}, ${ENTITY_FACTS.address.postalCode} ${ENTITY_FACTS.address.addressLocality} (${ENTITY_FACTS.address.addressRegion}), Italia
- Email: ${ENTITY_FACTS.email}
- Telefono: ${ENTITY_FACTS.phoneDisplay}
- Google Business Profile: esistenza confermata dal proprietario; [azione per lasciare una recensione](${ENTITY_FACTS.reviewActionUrl})
- Rating, numero recensioni, categoria e orari GBP: non pubblicati in questo export perché non verificati tramite accesso autenticato.

## Servizi e prezzi di catalogo

${serviceLines.join('\n')}

I prezzi sono valori iniziali presenti in data/services.json. Non sono preventivi né promesse di risultato; perimetro, tempi e prezzo finale dipendono dal progetto.

## Copertura geografica

- Rho è la località della sede dichiarata.
- Le altre città citate nelle landing sono aree servite, non filiali o sedi aggiuntive.
- Le landing GEO ammesse all'indicizzazione dalla governance corrente sono ${ALL_INDEXABLE_GEO_PATHS.size}.
- L'indicizzazione effettiva e la visibilità per query locali dipendono dai motori di ricerca e non sono garantite da questo file.

## Profili pubblici già collegati dal sito

${profileLines.join('\n')}

Questi link non attestano rating, ownership autenticata o completezza dei profili. I backlink e i profili esterni non vengono convertiti automaticamente in sameAs.

## Fonti canoniche

- [Homepage](${ENTITY_FACTS.siteUrl}/)
- [Chi siamo](${ENTITY_FACTS.siteUrl}/chi-siamo.html)
- [Servizi](${ENTITY_FACTS.siteUrl}/servizi/sviluppo-web.html)
- [Portfolio](${ENTITY_FACTS.siteUrl}/portfolio.html)
- [Contatti](${ENTITY_FACTS.siteUrl}/contatti.html)
- [Sitemap](${ENTITY_FACTS.siteUrl}/sitemap.xml)
- [Indice llms](${ENTITY_FACTS.siteUrl}/llms.txt)

Ultima nota: ai.txt, llms.txt e llms-full.txt sono export editoriali sperimentali; le informazioni operative vanno verificate nelle pagine canoniche collegate.
`;
}

function buildAiData() {
  return {
    metadata: {
      document_type: 'editorial_export',
      generated_by: 'scripts/generate-ai-exports.js',
      ranking_notice: 'Questo export non garantisce indicizzazione, ranking o citazioni nei sistemi generativi.',
      experimental: true,
      canonical_source: `${ENTITY_FACTS.siteUrl}/`
    },
    company: {
      name: ENTITY_FACTS.name,
      alternateName: ENTITY_FACTS.alternateName,
      website: ENTITY_FACTS.siteUrl,
      email: ENTITY_FACTS.email,
      phone: ENTITY_FACTS.phoneDisplay,
      address: ENTITY_FACTS.address,
      googleBusinessProfile: {
        existence: 'owner_confirmed',
        reviewAction: ENTITY_FACTS.reviewActionUrl,
        rating: 'not_verified',
        reviewCount: 'not_verified',
        category: 'not_verified',
        openingHours: 'not_verified'
      }
    },
    services,
    geographicCoverage: {
      declaredLocation: ENTITY_FACTS.address.addressLocality,
      indexedGeoLandingCount: ALL_INDEXABLE_GEO_PATHS.size,
      note: 'Le altre città sono aree servite e non sedi o filiali WebNovis.'
    },
    publicProfiles: ENTITY_FACTS.publicProfiles,
    entityPolicy: {
      backlinkIsNotSameAs: true,
      profileOwnershipRequiredBeforeSameAs: true,
      externalProfileMetrics: 'not_verified'
    }
  };
}

fs.writeFileSync(path.join(ROOT, 'ai.txt'), buildAiText(), 'utf8');
fs.writeFileSync(path.join(ROOT, 'webnovis-ai-data.json'), `${JSON.stringify(buildAiData(), null, 2)}\n`, 'utf8');
console.log(`✅ AI editorial exports regenerated → ${services.length} sourced services, ${ALL_INDEXABLE_GEO_PATHS.size} governed GEO URLs`);
