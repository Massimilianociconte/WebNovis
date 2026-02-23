/**
 * WebNovis — Multi-City Landing Page Generator v2
 * Generates geo-specific "realizzazione siti web" landing pages from the Rho template.
 * Each city gets its own unique images and localized content.
 * Usage: node scripts/generate-city-pages.js
 */
const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'realizzazione-siti-web-rho.html'), 'utf8');

const cities = [
    {
        slug: 'arese',
        name: 'Arese',
        cap: '20020',
        lat: '45.5509',
        lng: '9.0772',
        wikipedia: 'https://it.wikipedia.org/wiki/Arese',
        // City-specific images
        img1: { file: 'arese-commercial', alt: 'Distretto commerciale moderno di Arese con attività locali' },
        img2: { file: 'arese-workspace', alt: 'Workspace di design digitale per la creazione di siti web ad Arese' },
        intro: 'Arese, nota per il centro commerciale Il Centro e per la storica sede Alfa Romeo, è un punto di riferimento economico dell\'hinterland nord-ovest milanese. Le sue attività commerciali, studi professionali e PMI del settore automotive e servizi trovano in un sito web professionale lo strumento ideale per intercettare clienti nella zona di Milano Ovest.',
        contesto: 'Con la sua vicinanza strategica a <strong>Milano</strong>, <strong>Rho</strong> e al polo fieristico, Arese rappresenta un mercato con bassa concorrenza digitale e alta domanda di servizi web professionali. Le attività locali che investono oggi in un sito ottimizzato possono conquistare posizioni su Google che i competitor non stanno ancora presidiando.',
        limitrofi: 'Arese, Rho, Lainate, Garbagnate Milanese, Bollate, Baranzate, Novate Milanese, Cesate e tutta la Città Metropolitana di Milano'
    },
    {
        slug: 'cornaredo',
        name: 'Cornaredo',
        cap: '20010',
        lat: '45.4978',
        lng: '9.0400',
        wikipedia: 'https://it.wikipedia.org/wiki/Cornaredo',
        img1: { file: 'cornaredo-town', alt: 'Centro storico di Cornaredo con le sue attività locali' },
        img2: { file: 'cornaredo-seo', alt: 'Dashboard SEO e analytics per il posizionamento delle aziende di Cornaredo' },
        intro: 'Cornaredo è un comune dell\'hinterland milanese con un forte tessuto di piccole imprese, artigiani e professionisti. La sua collocazione tra Milano Ovest e la direttrice autostradale A4/A8 lo rende un nodo strategico per attività che servono il territorio circostante, dall\'edilizia ai servizi alla persona.',
        contesto: 'Le aziende di Cornaredo operano in un mercato locale dove la <strong>visibilità online</strong> fa la differenza. Un sito web professionale, veloce e ottimizzato per le ricerche geolocalizzate permette di intercettare clienti che cercano servizi nelle zone di Cornaredo, Bareggio, Settimo Milanese e Milano Ovest.',
        limitrofi: 'Cornaredo, Settimo Milanese, Bareggio, Cusago, Pero, Rho, Milano Ovest e tutta la Città Metropolitana di Milano'
    },
    {
        slug: 'settimo-milanese',
        name: 'Settimo Milanese',
        cap: '20019',
        lat: '45.4752',
        lng: '9.0563',
        wikipedia: 'https://it.wikipedia.org/wiki/Settimo_Milanese',
        img1: { file: 'settimo-skyline', alt: 'Panorama di Settimo Milanese con lo skyline di Milano sullo sfondo' },
        img2: { file: 'settimo-devices', alt: 'Sito web responsive visualizzato su laptop, tablet e smartphone per aziende di Settimo Milanese' },
        intro: 'Settimo Milanese è un comune dinamico alle porte di Milano, caratterizzato da un mix di attività artigianali, studi professionali con competenze specialistiche e PMI del settore terziario. La sua posizione lungo la direttrice Milano-Magenta lo rende facilmente accessibile sia dal capoluogo che dall\'hinterland occidentale.',
        contesto: 'Per le attività di Settimo Milanese, essere visibili online nelle <strong>ricerche geolocalizzate</strong> significa intercettare residenti e lavoratori che cercano servizi nella zona. Un sito web progettato con SEO locale integrata può generare contatti qualificati dal territorio, trasformando la prossimità geografica in un vantaggio competitivo.',
        limitrofi: 'Settimo Milanese, Cornaredo, Cusago, Trezzano sul Naviglio, Cesano Boscone, Pero, Rho e tutta la Città Metropolitana di Milano'
    },
    {
        slug: 'lainate',
        name: 'Lainate',
        cap: '20020',
        lat: '45.5711',
        lng: '9.0247',
        wikipedia: 'https://it.wikipedia.org/wiki/Lainate',
        img1: { file: 'lainate-villa', alt: 'Vista di Villa Litta e del patrimonio storico-culturale di Lainate' },
        img2: { file: 'lainate-growth', alt: 'Visualizzazione della crescita digitale per le aziende di Lainate' },
        intro: 'Lainate è un comune con una forte vocazione imprenditoriale, noto per la storica Villa Litta e per un tessuto produttivo che spazia dall\'industria ai servizi. La sua posizione lungo la A8 Milano-Varese lo collega rapidamente sia a Milano che all\'altomilanese, rendendolo un punto strategico per aziende che operano su scala locale e regionale.',
        contesto: 'Il mercato digitale di Lainate presenta <strong>opportunità significative</strong>: molte attività locali non hanno ancora un sito web moderno o utilizzano soluzioni obsolete. Investire in un sito professionale con SEO locale permette di emergere nelle ricerche della zona e di attrarre clienti da Lainate, Arese, Rho e i comuni della direttrice autostradale.',
        limitrofi: 'Lainate, Arese, Rho, Garbagnate Milanese, Nerviano, Pogliano Milanese, Parabiago e tutta la Città Metropolitana di Milano'
    },
    {
        slug: 'pero',
        name: 'Pero',
        cap: '20016',
        lat: '45.5089',
        lng: '9.0899',
        wikipedia: 'https://it.wikipedia.org/wiki/Pero_(Italia)',
        // Pero uses the Fiera/ecosystem images since Pero hosts Fiera Milano
        img1: { file: 'rho-fiera-milano', alt: 'Il polo fieristico di Fiera Milano tra Pero e Rho' },
        img2: { file: 'rho-digital-ecosystem', alt: 'Ecosistema digitale integrato per le aziende dell\'area Fiera di Pero' },
        intro: 'Pero è il comune che ospita parte del <strong>complesso Fiera Milano</strong> e l\'area ex-Expo, rendendolo uno dei poli economici più strategici dell\'hinterland milanese. Aziende del settore fieristico, hotellerie, logistica, ristorazione e servizi B2B trovano in Pero un\'ubicazione ideale per operare a livello nazionale e internazionale.',
        contesto: 'La vicinanza al <strong>polo fieristico</strong> genera un flusso costante di visitatori e professionisti che cercano servizi locali online. Un sito web ottimizzato per le ricerche degli utenti in transito e dei residenti permette alle attività di Pero di catturare domanda sia locale che internazionale — un vantaggio che pochi competitor stanno sfruttando.',
        limitrofi: 'Pero, Rho, Milano, Settimo Milanese, Cornaredo, Baranzate, Bollate e tutta la Città Metropolitana di Milano'
    }
];

function generatePage(city) {
    let page = TEMPLATE;

    // ══ REPLACEMENTS — city name ══
    const replacements = [
        // Title and meta
        [/Creazione Siti Web a Rho \| Web Agency Locale — WebNovis/g, `Creazione Siti Web a ${city.name} | Web Agency Locale — WebNovis`],
        [/realizzazione siti web a Rho/gi, `realizzazione siti web a ${city.name}`],
        [/creazione di siti web a Rho/gi, `creazione di siti web a ${city.name}`],
        [/realizzazione-siti-web-rho\.html/g, `realizzazione-siti-web-${city.slug}.html`],

        // Meta description
        [/Cerchi un partner per la creazione di siti web a Rho\?[^"]+/,
            `Cerchi un partner per la creazione di siti web a ${city.name}? WebNovis realizza siti professionali, veloci e ottimizzati SEO per aziende e professionisti di ${city.name} e hinterland milanese. Preventivo gratuito in 24h →`],

        // Keywords
        [/realizzazione siti web rho, creazione siti web rho, siti web rho, web agency rho, siti internet rho, agenzia web rho, sviluppo siti web rho, siti web professionali rho Milano/,
            `realizzazione siti web ${city.slug.replace(/-/g, ' ')}, creazione siti web ${city.name.toLowerCase()}, siti web ${city.name.toLowerCase()}, web agency ${city.name.toLowerCase()}, siti internet ${city.name.toLowerCase()}, agenzia web ${city.name.toLowerCase()}, sviluppo siti web ${city.name.toLowerCase()}, siti web professionali ${city.name.toLowerCase()} Milano`],

        // OG tags
        [/Creazione Siti Web a Rho — Web Agency Locale per PMI e Professionisti/g,
            `Creazione Siti Web a ${city.name} — Web Agency Locale per PMI e Professionisti`],
        [/WebNovis realizza siti web professionali a Rho: codice 100% custom, SEO integrata, design premium\. Il partner digitale dell'hinterland milanese\./g,
            `WebNovis realizza siti web professionali a ${city.name}: codice 100% custom, SEO integrata, design premium. Il partner digitale dell'hinterland milanese.`],
        [/WebNovis realizza siti web professionali a Rho: codice 100% custom, SEO integrata, design premium\. Partner digitale dell'hinterland milanese\./g,
            `WebNovis realizza siti web professionali a ${city.name}: codice 100% custom, SEO integrata, design premium. Partner digitale dell'hinterland milanese.`],
        [/Siti professionali, veloci e ottimizzati SEO per aziende di Rho e hinterland milanese/,
            `Siti professionali, veloci e ottimizzati SEO per aziende di ${city.name} e hinterland milanese`],

        // Breadcrumb
        [/Realizzazione Siti Web a Rho<\/span>/g, `Realizzazione Siti Web a ${city.name}</span>`],
        [/"name": "Realizzazione Siti Web a Rho"/g, `"name": "Realizzazione Siti Web a ${city.name}"`],

        // Hero
        [/Web Agency Rho — Aggiornato 2026/, `Web Agency ${city.name} — Aggiornato 2026`],
        [/Realizzazione Siti Web a Rho — Il Tuo Partner Digitale Locale/,
            `Realizzazione Siti Web a ${city.name} — Il Tuo Partner Digitale Locale`],
        [/Cerchi una <strong>web agency a Rho<\/strong> per creare un sito web professionale[^<]+/,
            `Cerchi una <strong>web agency a ${city.name}</strong> per creare un sito web professionale che porti risultati concreti? WebNovis è il partner digitale dell'hinterland milanese: sviluppiamo siti su misura con <strong>codice 100% custom</strong>, design premium e SEO locale integrata. Dal brief alla messa online, un unico interlocutore dedicato.`],
        [/Rho, Milano \(MI\) 20017/, `${city.name}, Milano (MI) ${city.cap}`],

        // Schema LocalBusiness
        [/"WebNovis — Web Agency Rho"/g, `"WebNovis — Web Agency ${city.name}"`],
        [/"Web Novis Rho"/g, `"Web Novis ${city.name}"`],
        [/Web agency a Rho specializzata/g, `Web agency a ${city.name} specializzata`],
        [/"postalCode": "20017"/g, `"postalCode": "${city.cap}"`],
        [/"latitude": "45\.5299"/g, `"latitude": "${city.lat}"`],
        [/"longitude": "9\.0393"/g, `"longitude": "${city.lng}"`],
        [/Via\+S\.\+Giorgio\+2%2C\+20017\+Rho\+MI/g, `Via+S.+Giorgio+2%2C+${city.cap}+${city.name.replace(/ /g, '+')}+MI`],
        [/"Servizi Realizzazione Siti Web Rho"/, `"Servizi Realizzazione Siti Web ${city.name}"`],
        [/Sito Web Vetrina a Rho/g, `Sito Web Vetrina a ${city.name}`],
        [/E-Commerce a Rho/g, `E-Commerce a ${city.name}`],
        [/Landing Page a Rho/g, `Landing Page a ${city.name}`],
        [/Graphic Design Rho/g, `Graphic Design ${city.name}`],
        [/Social Media Marketing Rho/g, `Social Media Marketing ${city.name}`],

        // Content sections
        [/Perché la tua azienda a Rho/g, `Perché la tua azienda a ${city.name}`],
        [/per aziende di Rho/g, `per aziende di ${city.name}`],
        [/I nostri servizi di creazione siti web a Rho/g, `I nostri servizi di creazione siti web a ${city.name}`],
        [/della tua azienda a Rho/g, `della tua azienda a ${city.name}`],
        [/Perché scegliere WebNovis come web agency a Rho/g, `Perché scegliere WebNovis come web agency a ${city.name}`],
        [/Realizziamo siti web per aziende di Rho e dell'hinterland/g, `Realizziamo siti web per aziende di ${city.name} e dell'hinterland`],
        [/Quanto costa realizzare un sito web a Rho/g, `Quanto costa realizzare un sito web a ${city.name}`],
        [/Domande Frequenti — Realizzazione Siti Web a Rho/g, `Domande Frequenti — Realizzazione Siti Web a ${city.name}`],
        [/il sito web che la tua azienda a Rho merita/g, `il sito web che la tua azienda a ${city.name} merita`],
        [/la tua azienda a Rho o in videochiamata/g, `la tua azienda a ${city.name} o in videochiamata`],
        [/ricerche locali di Rho/g, `ricerche locali di ${city.name}`],
        [/del territorio rhodense/g, `del territorio di ${city.name}`],
        [/Ogni progetto di realizzazione siti web a Rho/g, `Ogni progetto di realizzazione siti web a ${city.name}`],
        [/per un'azienda di Rho"/g, `per un'azienda di ${city.name}"`],
    ];

    for (const [pattern, replacement] of replacements) {
        page = page.replace(pattern, replacement);
    }

    // ══ REPLACE images with city-specific ones ══
    // Image 1: float-right in section 1
    page = page.replace(
        /Img\/rho-fiera-milano-sm\.webp 320w, Img\/rho-fiera-milano\.webp 600w/,
        `Img/${city.img1.file}-sm.webp 320w, Img/${city.img1.file}.webp 600w`
    );
    page = page.replace(
        /src="Img\/rho-fiera-milano\.png" alt="[^"]+"/,
        `src="Img/${city.img1.file}.png" alt="${city.img1.alt}"`
    );

    // Image 2: center after services grid
    page = page.replace(
        /Img\/rho-digital-ecosystem-sm\.webp 320w, Img\/rho-digital-ecosystem\.webp 600w/,
        `Img/${city.img2.file}-sm.webp 320w, Img/${city.img2.file}.webp 600w`
    );
    page = page.replace(
        /src="Img\/rho-digital-ecosystem\.png" alt="[^"]+"/,
        `src="Img/${city.img2.file}.png" alt="${city.img2.alt}"`
    );

    // Image 3: center after method steps — use img2 alt variant (keeps rho-web-design-studio for all since it's generic studio shot)
    // We keep this one shared since it's a generic "studio" shot that works for all cities

    // ══ REPLACE the market intro section ══
    page = page.replace(
        /Rho non è un comune qualsiasi dell'hinterland milanese[\s\S]*?ROI più misurabile che puoi fare\.\s*<\/p>/,
        `${city.intro}</p>
                <p>${city.contesto}</p>
                <p>La differenza tra un sito che "c'è" e un sito che <strong>lavora per te 24/7</strong> sta nella qualità dell'agenzia che lo realizza: strategia, codice, design e SEO devono essere eccellenti, non "sufficienti".</p>`
    );

    // ══ REPLACE areas served ══
    page = page.replace(
        /I comuni che serviamo includono:[\s\S]*?<strong>Città Metropolitana di Milano<\/strong>\./,
        `I comuni che serviamo includono: <strong>${city.limitrofi.replace(/, /g, '</strong>, <strong>')}</strong>.`
    );

    return page;
}

// ══ MAIN ══
console.log('[INFO] Generating city-specific landing pages (v2 — unique images)...\n');

for (const city of cities) {
    const filename = `realizzazione-siti-web-${city.slug}.html`;
    const page = generatePage(city);
    fs.writeFileSync(path.join(__dirname, '..', filename), page, 'utf8');
    console.log(`  ✓ ${filename} (${(Buffer.byteLength(page) / 1024).toFixed(0)} KB) — images: ${city.img1.file}, ${city.img2.file}`);
}

console.log(`\n[DONE] Generated ${cities.length} pages with unique images per city.`);
