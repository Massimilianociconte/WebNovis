/**
 * Public presence policy for WebNovis.
 *
 * WebNovis operates from the Rho / Milan-west area but does not have a
 * walk-in office or showroom. A private street address must never be
 * published as a business premises. Founder names stay unpublished until
 * a fiscal/legal framing exists.
 */
const { ENTITY_FACTS } = require('./entity-facts');

const PRESENCE_POLICY = Object.freeze({
  hasWalkInOffice: false,
  hasPublicStreetAddress: false,
  hasPublicPersonNames: false,
  baseCity: 'Rho',
  baseArea: 'hinterland ovest di Milano',
  publicLocalityLine: 'Rho (MI), Italia',
  publicPresenceSummary:
    'WebNovis opera da Rho e dall\'hinterland ovest di Milano. Lavoriamo da remoto e presso il cliente; non abbiamo uno showroom o un ufficio aperto al pubblico.',
  forbiddenStreetPatterns: Object.freeze([
    /Via\s+S\.?\s*Giorgio/i,
    /Via\s+San\s+Giorgio/i
  ]),
  forbiddenPersonPatterns: Object.freeze([
    /\bMassimiliano\b/i
  ]),
  forbiddenOfficeClaimPatterns: Object.freeze([
    /\bshowroom\b/i,
    /\bsede aperta al pubblico\b/i,
    /\bincontri in sede\b/i,
    /\bpresso la nostra sede\b/i,
    /\bci trovi a Rho in Via\b/i
  ])
});

const STREET_REPLACEMENTS = Object.freeze([
  [/Via\s+S\.?\s*Giorgio,?\s*2(?:\s*[—–-]\s*)?/gi, ''],
  [/Via\s+San\s+Giorgio,?\s*2(?:\s*[—–-]\s*)?/gi, ''],
  [/Sede:\s*Via\s+S\.?\s*Giorgio[^.<]*/gi, 'Base: Rho (MI)'],
  [/con sede in Via\s+S\.?\s*Giorgio[^.<,]*/gi, 'con base a Rho'],
  [/sede in Via\s+S\.?\s*Giorgio[^.<,]*/gi, 'base a Rho']
]);

function containsForbiddenStreet(value) {
  return PRESENCE_POLICY.forbiddenStreetPatterns.some((pattern) => pattern.test(String(value || '')));
}

function containsForbiddenPersonName(value) {
  return PRESENCE_POLICY.forbiddenPersonPatterns.some((pattern) => pattern.test(String(value || '')));
}

function formatPublicLocality() {
  const address = ENTITY_FACTS.address || {};
  const city = address.addressLocality || PRESENCE_POLICY.baseCity;
  const region = address.addressRegion ? ` (${address.addressRegion})` : '';
  const country = address.addressCountry === 'IT' ? ', Italia' : '';
  return `${city}${region}${country}`;
}

function stripStreetFromText(value) {
  let text = String(value || '');
  for (const [pattern, replacement] of STREET_REPLACEMENTS) {
    text = text.replace(pattern, replacement);
  }
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim();
}

function stripStreetFromTitle(title) {
  return stripStreetFromText(title)
    .replace(/\s*\|\s*WebNovis.*$/i, (suffix) => suffix)
    .replace(/\s{2,}/g, ' ')
    .trim();
}

module.exports = {
  PRESENCE_POLICY,
  containsForbiddenStreet,
  containsForbiddenPersonName,
  formatPublicLocality,
  stripStreetFromText,
  stripStreetFromTitle
};
