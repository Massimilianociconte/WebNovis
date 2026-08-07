/**
 * JSON-LD schema generation for geo pages.
 */
const {
    SITE,
    SINGLETON_LOCAL_BUSINESS_ID,
    FIRST_DEPLOY_DATE,
    PAGE_DATE_ISO_TOKEN
} = require('./config');
const {
    cityMap,
    offerCatalogServices,
    coreServices,
    buildCatalogOffer
} = require('./data');
const { stripHtml, toCity } = require('./html-utils');

function getAreaServedEntity(city) {
    const normalizedName = String(city.name || '').toLowerCase();
    const isSyntheticArea = normalizedName === 'milano nord' || normalizedName === 'milano ovest';
    const entity = {
        "@type": isSyntheticArea ? "AdministrativeArea" : "City",
        "name": city.name
    };

    if (!isSyntheticArea && city.wikipedia) {
        entity.sameAs = city.wikipedia;
    }

    // CAP ufficiale del comune (Place.address): segnale geo esplicito per i motori.
    // Escluso per le aree sintetiche (Milano Nord/Ovest) che non hanno un CAP proprio.
    if (!isSyntheticArea && city.cap) {
        entity.address = {
            "@type": "PostalAddress",
            "addressLocality": city.name,
            "postalCode": city.cap,
            "addressCountry": "IT"
        };
    }

    return entity;
}

function buildCoverageScopes(agenziaCities, realizzazioneCities, serviceCoverageCities) {
    return [
        {
            key: 'agenzia',
            label: 'Agenzia web',
            count: agenziaCities.length,
            helper: 'comuni con pagina dedicata',
            description: 'Consulenza digitale completa: sito, identità visiva, presenza locale e social per PMI e professionisti.',
            href: '/agenzia-web/'
        },
        {
            key: 'realizzazione',
            label: 'Realizzazione siti web',
            count: realizzazioneCities.length,
            helper: 'comuni con pagina dedicata',
            description: 'Siti su misura scritti da zero, senza WordPress e senza template, con struttura SEO e velocità curate dall’inizio.',
            href: '/realizzazione-siti-web/'
        },
        {
            key: 'extended',
            label: 'Servizi specifici',
            count: serviceCoverageCities.length,
            helper: 'comuni coperti per servizio',
            description: 'E-commerce, SEO locale, grafica, social e campagne: ogni servizio ha i comuni in cui lo seguiamo più spesso.',
            href: '/zone-servite/'
        }
    ];
}

function generateSchemas(city, pageType, resolvedFaqs) {
    const slug = pageType === 'agenzia'
        ? `agenzia-web-${city.slug}.html`
        : `realizzazione-siti-web-${city.slug}.html`;
    const canonical = `${SITE}/${slug}`;
    const isAgenziaPage = pageType === 'agenzia';
    const breadcrumbLabel = isAgenziaPage
        ? `Agenzia Web ${city.name}`
        : `Realizzazione Siti Web ${toCity(city.name)}`;
    const hubCrumb = isAgenziaPage
        ? { name: 'Agenzia Web', item: `${SITE}/agenzia-web/` }
        : { name: 'Siti Web per Comuni', item: `${SITE}/realizzazione-siti-web/` };
    const webPageDescription = isAgenziaPage
        ? `WebNovis è l'agenzia web per ${city.name} e hinterland milanese. Siti 100% custom, graphic design, social media. Sede a Rho, ${city.distanzaSede} da ${city.name}.`
        : `Realizzazione siti web ${toCity(city.name)} per PMI e professionisti: landing page, siti vetrina ed e-commerce custom con SEO tecnica integrata e gestione diretta da Rho (${city.distanzaSede}).`;
    const offerCatalogName = isAgenziaPage
        ? `Servizi Web ${toCity(city.name)}`
        : `Servizi di Realizzazione Siti Web ${toCity(city.name)}`;
    const serviceName = isAgenziaPage
        ? `Sviluppo Siti Web ${toCity(city.name)}`
        : `Realizzazione Siti Web ${toCity(city.name)}`;
    const serviceDescription = isAgenziaPage
        ? `Realizzazione siti web 100% custom per aziende di ${city.name} e comuni limitrofi.`
        : `Realizzazione siti web 100% custom per aziende e professionisti di ${city.name}, con landing page, siti vetrina ed e-commerce orientati ai contatti.`;

    // Build areaServed from focal city + nearCities
    const primaryAreaServed = getAreaServedEntity(city);
    const nearCityObjects = (city.nearCities || []).map(ncSlug => {
        const nc = cityMap.get(ncSlug);
        if (!nc) return { "@type": "City", "name": ncSlug };
        const obj = { "@type": "City", "name": nc.name };
        if (nc.wikipedia) obj.sameAs = nc.wikipedia;
        return obj;
    });
    const areaServedObjects = [
        primaryAreaServed,
        ...nearCityObjects,
        { "@type": "AdministrativeArea", "name": "Hinterland milanese" },
        { "@type": "AdministrativeArea", "name": "Città Metropolitana di Milano" }
    ];

    const schemas = [
        // BreadcrumbList (3 levels: Home → Hub → City)
        {
            "@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/" },
                { "@type": "ListItem", "position": 2, "name": hubCrumb.name, "item": hubCrumb.item },
                { "@type": "ListItem", "position": 3, "name": breadcrumbLabel, "item": canonical }
            ]
        },
        // Commercial landing WebPage
        {
            "@context": "https://schema.org", "@type": "WebPage",
            "@id": canonical,
            "name": breadcrumbLabel + " — WebNovis",
            "description": webPageDescription,
            "url": canonical,
            "inLanguage": "it",
            "isPartOf": { "@id": SITE + "/#website" },
            "about": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "datePublished": FIRST_DEPLOY_DATE,
            "dateModified": PAGE_DATE_ISO_TOKEN
        },
        // Service
        {
            "@context": "https://schema.org", "@type": "Service",
            "@id": canonical + "#service",
            "serviceType": isAgenziaPage ? "Sviluppo Siti Web" : "Realizzazione Siti Web",
            "name": serviceName,
            "description": serviceDescription,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": areaServedObjects.slice(0, 7),
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": offerCatalogName,
                "itemListElement": offerCatalogServices.map((service) => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": `${service.shortName} ${toCity(city.name)}`,
                        "url": SITE + service.url
                    }
                }))
            },
            "offers": ['landing-page', 'sito-vetrina', 'ecommerce'].map(buildCatalogOffer)
        },
        ...coreServices.map((service) => ({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": canonical + `#service-${service.slug}`,
            "serviceType": service.name,
            "name": `${service.shortName} ${toCity(city.name)}`,
            "description": `${service.shortDesc} Per aziende e professionisti di ${city.name}, con gestione diretta da Rho (${city.distanzaSede}).`,
            "provider": { "@id": SINGLETON_LOCAL_BUSINESS_ID },
            "areaServed": primaryAreaServed,
            "url": SITE + service.url,
            "offers": {
                "@type": "Offer",
                "price": String(service.priceFrom),
                "priceCurrency": "EUR",
                "url": SITE + service.url
            }
        }))
    ];

    // FAQPage schema (only if FAQs exist)
    if (resolvedFaqs.length > 0) {
        schemas.push({
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": resolvedFaqs.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": stripHtml(f.a) }
            }))
        });
    }

    return schemas;
}

module.exports = {
    getAreaServedEntity,
    buildCoverageScopes,
    generateSchemas
};
