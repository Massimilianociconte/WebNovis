/**
 * WebNovis — City Data Expander
 *
 * Adds new cities to data/cities.json from a compact definition list.
 * Each new city gets: coordinates, population, province, wikipedia link,
 * distance from Rho (calculated via Haversine), generation flags, 
 * nearCities (auto-calculated from proximity), and basic localContext.
 *
 * Usage: node scripts/expand-cities.js
 *
 * This script is idempotent — running it multiple times won't create duplicates.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CITIES_PATH = path.join(ROOT, 'data', 'cities.json');
const SEDE = { lat: 45.5299, lng: 9.0393 };

// ─── Haversine distance ───────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDriveMinutes(km) {
    // Average 30-40 km/h in hinterland milanese traffic
    return Math.round(km * 2.2);
}

// ─── New cities to add (compact format) ───────────────────────────────────────
// Only cities within ~25km of Rho that have real search volume for local services
const NEW_CITIES = [
    // Nord-Ovest Milano (within 15km)
    { slug: 'pogliano-milanese', name: 'Pogliano Milanese', cap: '20010', lat: 45.5375, lng: 8.9947, pop: 8500, highlights: ['Zona industriale attiva', 'Vicinanza a Rho e Nerviano'], sectors: ['manifatturiero', 'logistica', 'artigianato'] },
    { slug: 'cesate', name: 'Cesate', cap: '20031', lat: 45.5939, lng: 9.0847, pop: 14000, highlights: ['Parco delle Groane', 'Stazione S2 Passante Milano'], sectors: ['commercio', 'servizi', 'residenziale'] },
    { slug: 'senago', name: 'Senago', cap: '20030', lat: 45.5753, lng: 9.1281, pop: 22000, highlights: ['Villa Sioli Legnani', 'Zona industriale nord'], sectors: ['industria', 'commercio', 'artigianato', 'servizi'] },
    { slug: 'novate-milanese', name: 'Novate Milanese', cap: '20026', lat: 45.5317, lng: 9.1389, pop: 21000, highlights: ['Confine con Milano Comasina', 'Linea M3 nelle vicinanze'], sectors: ['terziario', 'commercio', 'logistica', 'servizi'] },
    { slug: 'paderno-dugnano', name: 'Paderno Dugnano', cap: '20037', lat: 45.5697, lng: 9.1650, pop: 47000, highlights: ['Centro commerciale Brianza', 'Zona industriale Palazzolo'], sectors: ['industria', 'commercio', 'servizi', 'ristorazione'] },
    { slug: 'arluno', name: 'Arluno', cap: '20010', lat: 45.5053, lng: 8.9486, pop: 12000, highlights: ['Direttrice Milano-Magenta', 'Tessuto agricolo e artigianale'], sectors: ['agricoltura', 'artigianato', 'piccole imprese', 'commercio'] },
    { slug: 'parabiago', name: 'Parabiago', cap: '20015', lat: 45.5586, lng: 8.9511, pop: 28000, highlights: ['Distretto calzaturiero storico', 'Villa Corvini'], sectors: ['calzaturiero', 'manifatturiero', 'commercio', 'artigianato'] },

    // Sud-Ovest Milano (within 20km)
    { slug: 'bareggio', name: 'Bareggio', cap: '20010', lat: 45.4756, lng: 9.0025, pop: 17500, highlights: ['Villa Trivulzio', 'Posizione tra Milano e Abbiategrasso'], sectors: ['servizi', 'commercio', 'artigianato', 'logistica'] },
    { slug: 'cusago', name: 'Cusago', cap: '20090', lat: 45.4486, lng: 9.0319, pop: 4000, highlights: ['Castello Visconteo', 'Comune residenziale di pregio'], sectors: ['servizi', 'professionisti', 'ristorazione'] },
    { slug: 'trezzano-sul-naviglio', name: 'Trezzano sul Naviglio', cap: '20090', lat: 45.4228, lng: 9.0647, pop: 22000, highlights: ['Naviglio Grande', 'Centro commerciale Bonola nelle vicinanze'], sectors: ['industria', 'commercio', 'servizi', 'ristorazione'] },
    { slug: 'cesano-boscone', name: 'Cesano Boscone', cap: '20090', lat: 45.4328, lng: 9.0944, pop: 24000, highlights: ['Confine con Milano Baggio', 'Area residenziale in crescita'], sectors: ['servizi', 'commercio', 'professionisti', 'ristorazione'] },
    { slug: 'buccinasco', name: 'Buccinasco', cap: '20090', lat: 45.4192, lng: 9.1072, pop: 27000, highlights: ['Naviglio Pavese', 'Area residenziale sud Milano'], sectors: ['commercio', 'servizi', 'ristorazione', 'professionisti'] },

    // Nord Milano (within 20km)
    { slug: 'cormano', name: 'Cormano', cap: '20032', lat: 45.5483, lng: 9.1639, pop: 20000, highlights: ['Must — Museo del Territorio', 'Confine con Bresso e Milano'], sectors: ['terziario', 'commercio', 'industria leggera'] },
    { slug: 'bresso', name: 'Bresso', cap: '20091', lat: 45.5414, lng: 9.1833, pop: 27000, highlights: ['Parco Nord Milano', 'Stazione M1 nelle vicinanze'], sectors: ['commercio', 'servizi', 'terziario', 'ristorazione'] },
    { slug: 'cinisello-balsamo', name: 'Cinisello Balsamo', cap: '20092', lat: 45.5575, lng: 9.2103, pop: 76000, highlights: ['Centro culturale Il Pertini', 'Hub commerciale nord Milano'], sectors: ['industria', 'commercio', 'servizi', 'tech'] },
    { slug: 'sesto-san-giovanni', name: 'Sesto San Giovanni', cap: '20099', lat: 45.5347, lng: 9.2292, pop: 82000, highlights: ['Ex area Falck — riqualificazione urbana', 'Stazione M1 Sesto', 'MIL — Made in Lambrate'], sectors: ['tech', 'industria', 'startup', 'servizi', 'commercio'] },

    // Ovest Milano (within 20km)
    { slug: 'magenta', name: 'Magenta', cap: '20013', lat: 45.4642, lng: 8.8833, pop: 24000, highlights: ['Storica Battaglia di Magenta', 'Ospedale Fornaroli', 'Direttrice Milano-Novara'], sectors: ['sanitario', 'commercio', 'servizi', 'agricoltura'] },
    { slug: 'legnano', name: 'Legnano', cap: '20025', lat: 45.5958, lng: 8.9139, pop: 61000, highlights: ['Palio di Legnano', 'Distretto industriale storico', 'Centro città vivace'], sectors: ['industria', 'tessile', 'meccanico', 'commercio', 'ristorazione'] },
    { slug: 'castellanza', name: 'Castellanza', cap: '21053', lat: 45.6100, lng: 8.8981, pop: 14500, highlights: ['Università LIUC', 'Polo universitario e imprenditoriale'], sectors: ['formazione', 'tech', 'servizi', 'commercio'] },
    { slug: 'saronno', name: 'Saronno', cap: '21047', lat: 45.6256, lng: 9.0331, pop: 40000, highlights: ['Santuario della Beata Vergine dei Miracoli', 'Nodo ferroviario FNM/RFI', 'Distretto dolciario (Amaretti)'], sectors: ['dolciario', 'meccanico', 'commercio', 'servizi', 'trasporti'] },

    // Milano zone (quartieri con identità forte)
    { slug: 'milano-ovest', name: 'Milano Ovest', cap: '20151', lat: 45.4772, lng: 9.1356, pop: 200000, highlights: ['QT8', 'San Siro', 'Fiera Citylife', 'De Angeli'], sectors: ['moda', 'design', 'startup', 'ristorazione', 'commercio'] },
    { slug: 'milano-nord', name: 'Milano Nord', cap: '20161', lat: 45.5100, lng: 9.1800, pop: 180000, highlights: ['Bicocca', 'Niguarda', 'Comasina', 'Affori'], sectors: ['università', 'sanitario', 'tech', 'servizi', 'commercio'] },

    // Comuni medi nel raggio operativo
    { slug: 'solaro', name: 'Solaro', cap: '20033', lat: 45.6167, lng: 9.0806, pop: 14500, highlights: ['Parco delle Groane', 'Comune residenziale tranquillo'], sectors: ['servizi', 'commercio', 'artigianato'] },
    { slug: 'cerro-maggiore', name: 'Cerro Maggiore', cap: '20023', lat: 45.5903, lng: 8.9500, pop: 15000, highlights: ['Tessuto manifatturiero', 'Vicinanza a Legnano'], sectors: ['manifatturiero', 'commercio', 'artigianato'] },
    { slug: 'rescaldina', name: 'Rescaldina', cap: '20027', lat: 45.6197, lng: 8.9511, pop: 14500, highlights: ['Nodo ferroviario FNM', 'Area residenziale in crescita'], sectors: ['servizi', 'commercio', 'professionisti'] },
    { slug: 'origgio', name: 'Origgio', cap: '21040', lat: 45.5956, lng: 9.0194, pop: 8000, highlights: ['Zona industriale est', 'Vicinanza a Saronno e Lainate'], sectors: ['logistica', 'industria', 'servizi'] },
    { slug: 'caronno-pertusella', name: 'Caronno Pertusella', cap: '21042', lat: 45.5958, lng: 9.0500, pop: 18000, highlights: ['Stazione FNM Saronno Sud', 'Tessuto PMI consolidato'], sectors: ['PMI', 'commercio', 'artigianato', 'servizi'] },
    { slug: 'limbiate', name: 'Limbiate', cap: '20812', lat: 45.5950, lng: 9.1286, pop: 36000, highlights: ['Villa Mella', 'Ospedale G. Salvini distaccamento'], sectors: ['servizi', 'commercio', 'industria leggera', 'sanitario'] },

    // Comuni sud hinterland
    { slug: 'corsico', name: 'Corsico', cap: '20094', lat: 45.4319, lng: 9.1133, pop: 35000, highlights: ['Naviglio Grande', 'Zona industriale storica', 'Confine con Milano Giambellino'], sectors: ['industria', 'commercio', 'servizi', 'ristorazione'] },
    { slug: 'assago', name: 'Assago', cap: '20057', lat: 45.4056, lng: 9.1389, pop: 10000, highlights: ['Milanofiori — polo business e commerciale', 'Forum di Assago'], sectors: ['business', 'commercio', 'eventi', 'servizi'] },
    { slug: 'rozzano', name: 'Rozzano', cap: '20089', lat: 45.3847, lng: 9.1558, pop: 43000, highlights: ['Humanitas Research Hospital', 'Centro commerciale Fiordaliso'], sectors: ['sanitario', 'commercio', 'servizi', 'logistica'] },

    // Comuni est strategici
    { slug: 'monza', name: 'Monza', cap: '20900', lat: 45.5845, lng: 9.2744, pop: 124000, highlights: ['Autodromo Nazionale', 'Villa Reale e Parco', 'Capoluogo Brianza'], sectors: ['manifatturiero', 'finanziario', 'commercio', 'servizi', 'turismo'] },
    { slug: 'cologno-monzese', name: 'Cologno Monzese', cap: '20093', lat: 45.5303, lng: 9.2792, pop: 48000, highlights: ['Studi Mediaset', 'Linea M2 Cologno', 'Hub media'], sectors: ['media', 'servizi', 'commercio', 'terziario'] }
];

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
    const data = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf8'));
    const existingSlugs = new Set(data.cities.map(c => c.slug));
    let added = 0;

    for (const nc of NEW_CITIES) {
        if (existingSlugs.has(nc.slug)) {
            console.log(`  ⏭ ${nc.slug} — already exists`);
            continue;
        }

        const distKm = haversineKm(SEDE.lat, SEDE.lng, nc.lat, nc.lng);
        const driveMin = estimateDriveMinutes(distKm);

        const city = {
            slug: nc.slug,
            name: nc.name,
            cap: nc.cap,
            lat: nc.lat,
            lng: nc.lng,
            population: nc.pop,
            province: nc.cap.startsWith('2') && nc.cap.length === 5 ? 'MI' : (nc.cap.startsWith('21') ? 'VA' : 'MB'),
            wikipedia: `https://it.wikipedia.org/wiki/${nc.name.replace(/ /g, '_')}`,
            distanzaSede: `${driveMin} min`,
            distanzaSedeKm: Math.round(distKm),
            isSede: false,
            generate: {
                agenzia: true,
                realizzazione: distKm <= 15 // Only generate "realizzazione" for cities within 15km
            },
            nearCities: [], // Will be auto-calculated below
            localContext: {
                highlights: nc.highlights || [],
                tessutoEconomico: `${nc.name} è un comune di ${nc.pop ? nc.pop.toLocaleString('it-IT') + ' abitanti' : 'medie dimensioni'} nell'hinterland milanese${distKm <= 10 ? ', a pochi minuti dalla nostra sede di Rho' : ''}. ${nc.highlights ? nc.highlights[0] + '.' : ''}`,
                settoriChiave: nc.sectors || [],
                opportunitaDigitale: `Le attività di ${nc.name} operano in un mercato locale dove la visibilità digitale fa la differenza. Un sito web professionale con SEO locale integrata permette di intercettare clienti che cercano servizi nella zona.`
            },
            images: {
                img1: { file: 'rho-fiera-milano', alt: `Area metropolitana milanese — ${nc.name} e hinterland` },
                img2: { file: 'rho-digital-ecosystem', alt: `Soluzioni digitali per le imprese di ${nc.name}` }
            },
            faqs: {
                agenzia: [
                    { q: `Quanto costa un sito web a ${nc.name}?`, a: `Landing Page da <strong>€500</strong>, Sito Vetrina da <strong>€1.200</strong>, E-Commerce da <strong>€3.500</strong>. Preventivo gratuito entro 24 ore.` },
                    { q: `Dove si trova WebNovis rispetto a ${nc.name}?`, a: `La nostra sede è a Rho, Via S. Giorgio 2 — ${driveMin} minuti in auto da ${nc.name}. Incontriamo i clienti in azienda o in videochiamata.` },
                    { q: `Servite anche i comuni vicini a ${nc.name}?`, a: `Sì. Serviamo ${nc.name} e tutti i comuni dell'hinterland milanese, inclusa la Città Metropolitana di Milano.` },
                    { q: `Usate WordPress?`, a: `No. Solo codice 100% custom — HTML5, CSS3, JavaScript. Performance, sicurezza e SEO nativi.` },
                    { q: `Quanto tempo per un sito?`, a: `Landing Page: 5-7 giorni. Sito Vetrina: 2-3 settimane. E-Commerce: 4-8 settimane.` },
                    { q: `Supporto post-lancio?`, a: `30 giorni di supporto gratuito. Manutenzione da €59/mese.` }
                ],
                realizzazione: [
                    { q: `Quanto costa realizzare un sito web a ${nc.name}?`, a: `Landing Page da <strong>€500</strong>, Sito Vetrina da <strong>€1.200</strong>, E-Commerce custom da <strong>€3.500</strong>. Preventivo gratuito entro 24 ore.` },
                    { q: `WebNovis è vicina a ${nc.name}?`, a: `Sì, ${driveMin} minuti dalla nostra sede a Rho. Incontri in azienda o videochiamata.` },
                    { q: `Fate siti per il settore ${nc.sectors?.[0] || 'locale'}?`, a: `Sì. Codice 100% custom con SEO locale integrata, ideale per ${nc.sectors?.slice(0, 2).join(' e ') || 'attività locali'} di ${nc.name}.` },
                    { q: `SEO locale inclusa?`, a: `Sì. Posizionamento per ricerche geolocalizzate del territorio di ${nc.name}.` },
                    { q: `Servizi integrati?`, a: `Sì. Web + graphic design (logo da €400) + social media (da €300/mese).` }
                ]
            }
        };

        data.cities.push(city);
        existingSlugs.add(nc.slug);
        added++;
        console.log(`  ✅ ${nc.slug} (${nc.pop?.toLocaleString('it-IT') || '?'} ab., ${driveMin} min, ${Math.round(distKm)} km)`);
    }

    // Auto-calculate nearCities for ALL cities based on proximity
    console.log('\n  Calculating nearCities for all cities...');
    for (const city of data.cities) {
        const nearest = data.cities
            .filter(c => c.slug !== city.slug)
            .map(c => ({ slug: c.slug, dist: haversineKm(city.lat, city.lng, c.lat, c.lng) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 6)
            .map(c => c.slug);
        city.nearCities = nearest;
    }

    // Update metadata
    data._meta.version = '2.0.0';
    data._meta.lastUpdated = new Date().toISOString().split('T')[0];

    // Write
    fs.writeFileSync(CITIES_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n  Total cities: ${data.cities.length} | Added: ${added}`);
    console.log(`  Saved to: data/cities.json`);
}

main();
