#!/usr/bin/env node
/**
 * audit-indexable-geo.js — Audit pagina-per-pagina delle GEO indexable.
 *
 * Valuta intent, on-page SEO, local proof, internal linking e qualità contenuto
 * per ogni path in ALL_INDEXABLE_GEO_PATHS.
 *
 * Uso:
 *   node scripts/audit-indexable-geo.js
 *   node scripts/audit-indexable-geo.js --json
 *   npm run audit:geo
 */

const fs = require('fs');
const path = require('path');
const {
  ALL_INDEXABLE_GEO_PATHS,
  TIER1_INDEXABLE_GEO_PATHS,
  TIER2_INDEXABLE_GEO_PATHS,
  DATA_VALIDATED_INDEXABLE_GEO_PATHS
} = require('../config/pseo-governance');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.webnovis.com';
const AS_JSON = process.argv.includes('--json');
const OUT_MD = path.join(ROOT, 'reports/seo/geo-indexable-audit.md');
const OUT_JSON = path.join(ROOT, 'reports/seo/geo-indexable-audit.json');

const INTENT_MAP = {
  'agenzia-web': {
    intent: 'commercial-brand-local',
    primaryQuery: 'agenzia web {city} / web agency {city}',
    role: 'Hub brand locale: chi siamo in zona, servizi, trust, CTA preventivo'
  },
  'realizzazione-siti-web': {
    intent: 'commercial-transactional',
    primaryQuery: 'realizzazione siti web {city} / creazione sito web {city}',
    role: 'Pagina revenue siti: prezzi, processo, deliverable, casi, CTA'
  },
  'seo-locale': {
    intent: 'commercial-investigational',
    primaryQuery: 'SEO locale {city} / SEO Google Maps {city}',
    role: 'Servizio SEO locale: Maps, NAP, pagine locali, reporting'
  },
  ecommerce: {
    intent: 'commercial-transactional',
    primaryQuery: 'ecommerce {city} / negozio online {city}',
    role: 'Revenue e-commerce: piattaforma, costi, UX vendita'
  },
  'landing-page': {
    intent: 'commercial-transactional',
    primaryQuery: 'landing page {city}',
    role: 'Landing ad alta conversione per ads/campagne'
  },
  'sito-vetrina': {
    intent: 'commercial-transactional',
    primaryQuery: 'sito vetrina {city}',
    role: 'Sito multi-pagina PMI / professionisti'
  },
  'social-media': {
    intent: 'commercial-service',
    primaryQuery: 'social media {city} / gestione social {city}',
    role: 'Creatività + ads social (non gestione account full-time se non offerto)'
  },
  'email-marketing': {
    intent: 'commercial-service',
    primaryQuery: 'email marketing {city}',
    role: 'Newsletter, automazioni, lead nurturing'
  },
  'google-ads': {
    intent: 'commercial-service',
    primaryQuery: 'Google Ads {city}',
    role: 'Campagne search/paid locali'
  },
  'graphic-design': {
    intent: 'commercial-service',
    primaryQuery: 'graphic design {city} / logo {city}',
    role: 'Logo, brand identity, materiali'
  }
};

function tierOf(p) {
  if (TIER1_INDEXABLE_GEO_PATHS.has(p)) return 'T1';
  if (TIER2_INDEXABLE_GEO_PATHS.has(p)) return 'T2';
  if (DATA_VALIDATED_INDEXABLE_GEO_PATHS.has(p)) return 'DV';
  return '?';
}

function parseServiceCity(pathname) {
  const base = pathname.replace(/^\//, '').replace(/\.html$/, '');
  const services = Object.keys(INTENT_MAP).sort((a, b) => b.length - a.length);
  for (const s of services) {
    if (base.startsWith(s + '-')) {
      return { service: s, citySlug: base.slice(s.length + 1) };
    }
  }
  return { service: 'unknown', citySlug: base };
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(html, pathname) {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd >= 0 ? html.slice(0, headEnd) : html.slice(0, 12000);
  const title = (head.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
  const robots =
    (head.match(/name=["']robots["'][^>]*content=["']([^"']+)/i) ||
      head.match(/content=["']([^"']+)["'][^>]*name=["']robots["']/i) ||
      [])[1] || '';
  const canonical =
    (head.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i) ||
      head.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) ||
      [])[1] || '';
  const desc =
    (head.match(/name=["']description["'][^>]*content=["']([^"']*)/i) ||
      head.match(/content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      [])[1] || '';
  const h1 = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const text = stripTags(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const schemas = [...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map((m) => m[1]);
  const schemaSet = [...new Set(schemas)];

  const hasAnswerCapsule = /answer-capsule/i.test(html);
  const hasSpeakable = /Speakable/i.test(html);
  const hasFaq = /FAQPage|"@type"\s*:\s*"FAQPage"/i.test(html);
  const hasService = schemaSet.includes('Service');
  const hasLocalBusiness = schemaSet.includes('LocalBusiness') || schemaSet.includes('ProfessionalService');
  const hasAggregateRating = schemaSet.includes('AggregateRating');
  const hasCity = schemaSet.includes('City') || /"@type"\s*:\s*"City"/i.test(html);

  // Local proof heuristics
  const hasNap =
    /Via\s+S\.?\s*Giorgio/i.test(html) &&
    (/380\s*264\s*7367|3802647367|\+39/.test(html) || /hello@webnovis\.com/i.test(html));
  const hasPrice = /€\s*\d|da\s*€|\beuro\b/i.test(html);
  const hasCta = /preventivo|contatt|richiedi/i.test(html);
  const hasCaseOrProof =
    /case\s*stud|portfolio|client[ei]|testimonianz|recension|Trustpilot|Google Business|progetto/i.test(
      html
    );
  const hasNearCities = /comuni limitrofi|città vicine|zone vicine|vicino a|hinterland/i.test(html);

  // Internal links
  const hrefs = [...html.matchAll(/href=["']([^"'#?]+)["']/gi)].map((m) => m[1]);
  const internal = hrefs
    .map((h) => {
      if (h.startsWith('http') && !h.includes('webnovis.com')) return null;
      let p = h.replace(SITE, '').replace(/^\.\//, '');
      if (p.startsWith('../')) {
        // rough normalize for root geo pages
        p = p.replace(/^(\.\.\/)+/, '/');
      }
      if (!p.startsWith('/') && !p.includes('/')) p = '/' + p;
      return p.split('#')[0];
    })
    .filter(Boolean);

  const linksToHubs = {
    agenziaHub: internal.some((u) => u.includes('/agenzia-web') && !u.match(/agenzia-web-[a-z]/)),
    realizzazioneHub: internal.some((u) => u.includes('/realizzazione-siti-web') && !u.match(/realizzazione-siti-web-[a-z]/)),
    zoneServite: internal.some((u) => u.includes('zone-servite')),
    servizi: internal.some((u) => u.includes('/servizi') || u.includes('servizi/')),
    preventivo: internal.some((u) => u.includes('preventivo')),
    contatti: internal.some((u) => u.includes('contatti')),
    sameServiceOtherCity: 0,
    sameCityOtherService: 0
  };

  const { service, citySlug } = parseServiceCity(pathname);
  for (const u of internal) {
    if (u.includes(service + '-') && !u.includes(citySlug) && u.endsWith('.html')) {
      linksToHubs.sameServiceOtherCity++;
    }
    if (u.includes(citySlug) && !u.includes(service) && /-(arese|rho|milano|bollate)/.test(u) === false) {
      // count other service same city: pattern /{service}-{city}.html
      if (new RegExp(`/${citySlug}\\.html$`).test(u) || u.endsWith(`-${citySlug}.html`)) {
        linksToHubs.sameCityOtherService++;
      }
    }
    if (u.endsWith(`-${citySlug}.html`) && !u.includes(`/${service}-`) && !u.endsWith(`/${service}-${citySlug}.html`)) {
      linksToHubs.sameCityOtherService++;
    }
  }

  // City mention density
  const cityNameGuess = citySlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const cityMentions = (text.match(new RegExp(cityNameGuess.replace(/\s+/g, '\\s+'), 'gi')) || []).length;
  // also count slug-like
  const cityMentions2 = (text.match(new RegExp(citySlug.replace(/-/g, '[\\s-]'), 'gi')) || []).length;
  const cityHits = Math.max(cityMentions, cityMentions2);

  const issues = [];
  const wins = [];

  if (/noindex/i.test(robots)) issues.push('CRITICO: robots noindex su pagina allowlist indexable');
  else wins.push('robots index');

  const expectedCan = SITE + pathname;
  if (canonical !== expectedCan) issues.push(`canonical mismatch: ${canonical || '(mancante)'}`);
  else wins.push('canonical self');

  if (!title) issues.push('title mancante');
  else if (title.length > 65) issues.push(`title lungo (${title.length} char)`);
  else if (title.length < 30) issues.push(`title corto (${title.length} char)`);
  else wins.push('title length OK');

  if (!desc) issues.push('meta description mancante');
  else if (desc.length > 165) issues.push(`meta description lunga (${desc.length})`);
  else if (desc.length < 70) issues.push(`meta description corta (${desc.length})`);
  else wins.push('meta description OK');

  if (!h1) issues.push('H1 mancante');
  else if (h1.length > 90) issues.push(`H1 molto lungo (${h1.length} char)`);
  else wins.push('H1 presente');

  if (words < 600) issues.push(`contenuto sottile (${words} parole)`);
  else if (words < 900) issues.push(`contenuto borderline (${words} parole)`);
  else wins.push(`word count ${words}`);

  if (cityHits < 3) issues.push(`menzioni città basse (${cityHits})`);
  else wins.push(`city mentions ${cityHits}`);

  if (!hasFaq) issues.push('manca FAQPage schema');
  else wins.push('FAQPage');

  if (!hasService) issues.push('manca Service schema');
  else wins.push('Service schema');

  if (hasLocalBusiness) {
    // warning for non-sede cities
    if (citySlug !== 'rho') {
      issues.push('WARN: LocalBusiness su città senza sede fisica (preferire Service+areaServed)');
    } else {
      wins.push('LocalBusiness sede');
    }
  }

  if (hasAggregateRating && citySlug !== 'rho') {
    issues.push('WARN: AggregateRating fuori dalla sede — rischio review schema');
  }

  if (!hasAnswerCapsule) issues.push('manca answer-capsule (GEO)');
  else wins.push('answer-capsule');

  if (!hasSpeakable && tierOf(pathname) === 'T1') issues.push('Tier1 senza Speakable');
  else if (hasSpeakable) wins.push('Speakable');

  if (!hasNap) issues.push('NAP/sede poco espliciti');
  else wins.push('NAP');

  if (!hasPrice) issues.push('nessun segnale prezzo');
  else wins.push('prezzi');

  if (!hasCta) issues.push('CTA debole');
  else wins.push('CTA');

  if (!hasCaseOrProof) issues.push('poca social proof / casi');
  else wins.push('proof signals');

  if (!linksToHubs.preventivo && !linksToHubs.contatti) issues.push('manca link preventivo/contatti');
  if (!linksToHubs.servizi && !linksToHubs.agenziaHub && !linksToHubs.realizzazioneHub) {
    issues.push('internal linking hub debole');
  }

  // City in title/h1
  const cityInTitle = new RegExp(cityNameGuess.split(' ')[0], 'i').test(title);
  const cityInH1 = new RegExp(cityNameGuess.split(' ')[0], 'i').test(h1);
  if (!cityInTitle) issues.push('città assente o debole nel title');
  if (!cityInH1) issues.push('città assente o debole nell\'H1');

  // Score 0-100
  let score = 100;
  for (const issue of issues) {
    if (issue.startsWith('CRITICO')) score -= 30;
    else if (issue.startsWith('WARN')) score -= 5;
    else if (/sottile|borderline|canonical|noindex|H1 mancante|title mancante/.test(issue)) score -= 12;
    else score -= 4;
  }
  score = Math.max(0, Math.min(100, score));

  let priority = 'P3';
  if (score < 55 || issues.some((i) => i.startsWith('CRITICO'))) priority = 'P0';
  else if (score < 70 || tierOf(pathname) === 'T1') priority = tierOf(pathname) === 'T1' && score >= 70 ? 'P1' : 'P1';
  else if (score < 82) priority = 'P2';

  // T1 always at least P1 for content upgrade
  if (tierOf(pathname) === 'T1' && priority === 'P3') priority = 'P1';

  return {
    path: pathname,
    file: pathname.replace(/^\//, ''),
    tier: tierOf(pathname),
    service,
    citySlug,
    intent: INTENT_MAP[service] || { intent: 'unknown', primaryQuery: '', role: '' },
    score,
    priority,
    title,
    titleLen: title.length,
    description: desc,
    descLen: desc.length,
    h1,
    robots,
    canonical,
    words,
    cityHits,
    schemas: schemaSet,
    flags: {
      hasAnswerCapsule,
      hasSpeakable,
      hasFaq,
      hasService,
      hasLocalBusiness,
      hasAggregateRating,
      hasNap,
      hasPrice,
      hasCta,
      hasCaseOrProof,
      hasNearCities,
      cityInTitle,
      cityInH1
    },
    links: linksToHubs,
    issues,
    wins
  };
}

function recommendations(row) {
  const recs = [];
  const q = (row.intent.primaryQuery || '').replace('{city}', row.citySlug.replace(/-/g, ' '));

  if (row.tier === 'T1') {
    recs.push(`Upgrade competitivo su query "${q}": sezione settori locali, 1 caso/testimonianza, tabella prezzi, FAQ uniche.`);
  }
  if (row.issues.some((i) => /LocalBusiness/.test(i))) {
    recs.push('Schema: una sola entità LocalBusiness (Rho); sulle altre città usare Service + areaServed City.');
  }
  if (row.issues.some((i) => /answer-capsule|Speakable/.test(i))) {
    recs.push('Aggiungere answer-capsule (40–60 parole) + SpeakableSpecification per GEO/LLM.');
  }
  if (row.issues.some((i) => /proof|social proof/.test(i))) {
    recs.push('Inserire blocco local proof: distanze da sede, settori serviti, recensione o case study.');
  }
  if (row.issues.some((i) => /title lungo/.test(i))) {
    recs.push('Accorciare title a ≤60–65 caratteri con keyword primaria + città + brand.');
  }
  if (row.issues.some((i) => /internal linking|preventivo/.test(i))) {
    recs.push('Rafforzare link a hub (/agenzia-web/ o /realizzazione-siti-web/), preventivo e 2–3 città vicine same-service.');
  }
  if (row.service === 'agenzia-web' && row.citySlug === 'rho') {
    recs.push('Chiarire ruolo vs homepage: homepage = brand/ecosistema; questa = web agency Rho commerciale.');
  }
  if (row.service === 'realizzazione-siti-web' && row.citySlug === 'rho') {
    recs.push('Pagina revenue core: costi da €1.200, processo 5 fasi, esempi Rho/Milano Ovest, link da blog "quanto costa un sito".');
  }
  if (!recs.length) {
    recs.push('Mantenere: monitorare GSC impression/posizione; arricchire solo con proof locale reale.');
  }
  return recs;
}

function main() {
  const rows = [];
  for (const pathname of [...ALL_INDEXABLE_GEO_PATHS].sort()) {
    const file = pathname.replace(/^\//, '');
    const abs = path.join(ROOT, file);
    if (!fs.existsSync(abs)) {
      rows.push({
        path: pathname,
        file,
        tier: tierOf(pathname),
        score: 0,
        priority: 'P0',
        issues: ['FILE MANCANTE'],
        wins: [],
        recommendations: ['Generare la pagina o rimuovere dall\'allowlist']
      });
      continue;
    }
    const html = fs.readFileSync(abs, 'utf8');
    const row = extract(html, pathname);
    row.recommendations = recommendations(row);
    rows.push(row);
  }

  rows.sort((a, b) => a.score - b.score || a.path.localeCompare(b.path));

  const byTier = { T1: 0, T2: 0, DV: 0, '?': 0 };
  const byPriority = { P0: 0, P1: 0, P2: 0, P3: 0 };
  let sum = 0;
  for (const r of rows) {
    byTier[r.tier] = (byTier[r.tier] || 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    sum += r.score || 0;
  }
  const avg = rows.length ? Math.round(sum / rows.length) : 0;

  // Cluster intent conflicts (same city, overlapping commercial intents)
  const byCity = {};
  for (const r of rows) {
    if (!r.citySlug) continue;
    byCity[r.citySlug] = byCity[r.citySlug] || [];
    byCity[r.citySlug].push(r.service);
  }
  const denseCities = Object.entries(byCity)
    .filter(([, services]) => services.length >= 4)
    .sort((a, b) => b[1].length - a[1].length);

  const md = [];
  md.push('# Audit GEO indexable — WebNovis');
  md.push('');
  md.push(`Generato: ${new Date().toISOString()}`);
  md.push('');
  md.push('## Sintesi');
  md.push('');
  md.push(`| Metrica | Valore |`);
  md.push(`|---|---:|`);
  md.push(`| Pagine audit | ${rows.length} |`);
  md.push(`| Score medio | ${avg}/100 |`);
  md.push(`| Tier 1 / 2 / Data-validated | ${byTier.T1} / ${byTier.T2} / ${byTier.DV} |`);
  md.push(`| Priorità P0 / P1 / P2 / P3 | ${byPriority.P0} / ${byPriority.P1} / ${byPriority.P2} / ${byPriority.P3} |`);
  md.push('');
  md.push('### Città con più landing indexable (rischio cannibalizzazione)');
  md.push('');
  for (const [city, services] of denseCities.slice(0, 12)) {
    md.push(`- **${city}** (${services.length}): ${services.join(', ')}`);
  }
  md.push('');
  md.push('## Legenda score');
  md.push('');
  md.push('- **90–100**: pronta a competere, solo proof/CTR');
  md.push('- **75–89**: solida, manca 1–2 elementi GEO/local proof');
  md.push('- **60–74**: template-like o gap schema/link — upgrade prima di spingere link');
  md.push('- **<60**: non competitiva o errore tecnico');
  md.push('');
  md.push('## Top priorità (score più basso)');
  md.push('');
  md.push('| Pri | Score | Tier | URL | Issue principali |');
  md.push('|---|---:|---|---|---|');
  for (const r of rows.slice(0, 25)) {
    const topIssues = (r.issues || []).slice(0, 3).join('; ').replace(/\|/g, '/');
    md.push(`| ${r.priority} | ${r.score} | ${r.tier} | \`${r.path}\` | ${topIssues || '—'} |`);
  }
  md.push('');
  md.push('## Dettaglio pagina per pagina');
  md.push('');

  for (const r of rows) {
    const intent = r.intent || {};
    md.push(`### \`${r.path}\` — ${r.tier} · score ${r.score} · ${r.priority}`);
    md.push('');
    md.push(`- **Intent**: ${intent.intent || 'n/a'} — query: _${(intent.primaryQuery || '').replace('{city}', (r.citySlug || '').replace(/-/g, ' '))}_`);
    md.push(`- **Ruolo**: ${intent.role || 'n/a'}`);
    md.push(`- **Title** (${r.titleLen || 0}): ${r.title || '—'}`);
    md.push(`- **H1**: ${r.h1 || '—'}`);
    md.push(`- **Words**: ${r.words || 0} · **City hits**: ${r.cityHits || 0}`);
    md.push(`- **Schema**: ${(r.schemas || []).join(', ') || '—'}`);
    md.push(
      `- **GEO flags**: capsule=${r.flags?.hasAnswerCapsule ? '✓' : '✗'} speakable=${r.flags?.hasSpeakable ? '✓' : '✗'} FAQ=${r.flags?.hasFaq ? '✓' : '✗'} NAP=${r.flags?.hasNap ? '✓' : '✗'} price=${r.flags?.hasPrice ? '✓' : '✗'} proof=${r.flags?.hasCaseOrProof ? '✓' : '✗'}`
    );
    md.push(`- **Internal**: preventivo/contatti=${r.links?.preventivo || r.links?.contatti ? '✓' : '✗'} hub servizi=${r.links?.servizi ? '✓' : '✗'} same-service altre città=${r.links?.sameServiceOtherCity || 0}`);
    if (r.issues?.length) {
      md.push(`- **Issue**:`);
      for (const i of r.issues) md.push(`  - ${i}`);
    }
    md.push(`- **Azioni consigliate**:`);
    for (const rec of r.recommendations || []) md.push(`  1. ${rec}`);
    md.push('');
  }

  md.push('## Matrice intent consigliata (anti-cannibalizzazione)');
  md.push('');
  md.push('| Città | URL primaria brand | URL primaria siti | URL primaria SEO | Altre indexable |');
  md.push('|---|---|---|---|---|');
  const cities = [...new Set(rows.map((r) => r.citySlug).filter(Boolean))].sort();
  for (const city of cities) {
    const set = rows.filter((r) => r.citySlug === city);
    const brand = set.find((r) => r.service === 'agenzia-web');
    const siti = set.find((r) => r.service === 'realizzazione-siti-web');
    const seo = set.find((r) => r.service === 'seo-locale');
    const others = set
      .filter((r) => !['agenzia-web', 'realizzazione-siti-web', 'seo-locale'].includes(r.service))
      .map((r) => r.service)
      .join(', ');
    md.push(
      `| ${city} | ${brand ? '✓' : '—'} | ${siti ? '✓' : '—'} | ${seo ? '✓' : '—'} | ${others || '—'} |`
    );
  }
  md.push('');
  md.push('## Next steps operativi');
  md.push('');
  md.push('1. Sistemare tutte le P0 (file mancanti / noindex accidentali / canonical rotti).');
  md.push('2. Upgrade contenuto su tutte le **Tier 1** sotto score 85.');
  md.push('3. Per città dense (Milano, Rho, e multi-service): definire 1 primary URL per intent e far linkare le secondarie verso di essa.');
  md.push('4. Estendere answer-capsule + Speakable a tutto il T1 e alle DV con impression GSC.');
  md.push('5. Rimuovere o non spingere AggregateRating fuori da review verificabili.');
  md.push('');

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md.join('\n'), 'utf8');
  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify({ generated: new Date().toISOString(), avgScore: avg, byTier, byPriority, rows }, null, 2),
    'utf8'
  );

  if (AS_JSON) {
    console.log(JSON.stringify({ avgScore: avg, byTier, byPriority, count: rows.length, worst: rows.slice(0, 10) }, null, 2));
  } else {
    console.log(`✅ GEO audit: ${rows.length} pages, avg score ${avg}/100`);
    console.log(`   P0=${byPriority.P0} P1=${byPriority.P1} P2=${byPriority.P2} P3=${byPriority.P3}`);
    console.log(`   → ${path.relative(ROOT, OUT_MD)}`);
    console.log(`   → ${path.relative(ROOT, OUT_JSON)}`);
    console.log('Worst 8:');
    for (const r of rows.slice(0, 8)) {
      console.log(`   ${r.score} ${r.priority} ${r.tier} ${r.path} — ${(r.issues || [])[0] || 'ok'}`);
    }
  }
}

main();
