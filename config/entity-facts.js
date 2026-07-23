const ENTITY_FACTS = Object.freeze({
  name: 'WebNovis',
  alternateName: 'Web Novis',
  siteUrl: 'https://www.webnovis.com',
  organizationId: 'https://www.webnovis.com/#organization',
  localBusinessId: 'https://www.webnovis.com/#localbusiness',
  editorialTeamId: 'https://www.webnovis.com/#author-webnovis-editorial-team',
  editorialTeamName: 'WebNovis Editorial Team',
  email: 'hello@webnovis.com',
  phoneDisplay: '+39 380 264 7367',
  phoneE164: '+393802647367',
  reviewActionUrl: 'https://g.page/r/CRblKdK0GGO_EBM/review',
  address: Object.freeze({
    streetAddress: 'Via S. Giorgio, 2',
    postalCode: '20017',
    addressLocality: 'Rho',
    addressRegion: 'MI',
    addressCountry: 'IT'
  }),
  publicProfiles: Object.freeze([
    'https://www.instagram.com/web.novis',
    'https://www.facebook.com/share/1C7hNnkqEU/',
    'https://it.trustpilot.com/review/webnovis.com',
    'https://www.designrush.com/agency/profile/web-novis',
    'https://www.goodfirms.co/company/web-novis'
  ])
});

const FORBIDDEN_ENTITY_URLS = Object.freeze([
  'https://www.wikidata.org/wiki/Q138340285',
  'https://www.linkedin.com/company/webnovis',
  'https://www.cylex-italia.it/rho/web-novis-16332263.html',
  'https://www.cylex-italia.it/rho/web-novis-16332431.html'
]);

const FORBIDDEN_ENTITY_URL_SET = new Set(FORBIDDEN_ENTITY_URLS);

function normalizeTypes(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function isBareEntityReference(entity) {
  return entity &&
    typeof entity === 'object' &&
    !Array.isArray(entity) &&
    Object.keys(entity).every((key) => key === '@id');
}

function isWebNovisEntity(entity) {
  if (!entity || typeof entity !== 'object') return false;
  const id = String(entity['@id'] || '');
  const compactName = String(entity.name || '').replace(/\s+/g, '').toLowerCase();
  if (id === ENTITY_FACTS.editorialTeamId || entity.name === ENTITY_FACTS.editorialTeamName) return false;
  const types = normalizeTypes(entity['@type']);
  const isLocalBusinessType = types.some((type) =>
    ['LocalBusiness', 'ProfessionalService'].includes(type)
  );
  const isBusinessType = types.some((type) =>
    ['Organization', 'LocalBusiness', 'ProfessionalService'].includes(type)
  );
  return id === ENTITY_FACTS.organizationId ||
    id === ENTITY_FACTS.localBusinessId ||
    (isLocalBusinessType && id.startsWith(`${ENTITY_FACTS.siteUrl}/`)) ||
    (isBusinessType && compactName.startsWith('webnovis'));
}

function normalizeSameAs(value) {
  if (Array.isArray(value)) {
    return value.filter((entry) =>
      typeof entry !== 'string' ||
      (!FORBIDDEN_ENTITY_URL_SET.has(entry) &&
        entry !== ENTITY_FACTS.organizationId &&
        entry !== ENTITY_FACTS.localBusinessId)
    );
  }
  if (typeof value === 'string' &&
      (FORBIDDEN_ENTITY_URL_SET.has(value) ||
        value === ENTITY_FACTS.organizationId ||
        value === ENTITY_FACTS.localBusinessId)) return undefined;
  return value;
}

function normalizeEntityObject(value) {
  if (Array.isArray(value)) {
    value.forEach(normalizeEntityObject);
    return value;
  }
  if (!value || typeof value !== 'object') return value;

  for (const nested of Object.values(value)) normalizeEntityObject(nested);

  if (Object.prototype.hasOwnProperty.call(value, 'sameAs')) {
    const normalizedSameAs = normalizeSameAs(value.sameAs);
    if (normalizedSameAs === undefined || (Array.isArray(normalizedSameAs) && normalizedSameAs.length === 0)) {
      delete value.sameAs;
    } else {
      value.sameAs = normalizedSameAs;
    }
  }

  const types = normalizeTypes(value['@type']);
  if (types.includes('Person') && value.name === ENTITY_FACTS.editorialTeamName) {
    value['@type'] = 'Organization';
    value['@id'] = ENTITY_FACTS.editorialTeamId;
    value.name = ENTITY_FACTS.editorialTeamName;
    value.parentOrganization = { '@id': ENTITY_FACTS.organizationId };
    delete value.jobTitle;
    delete value.memberOf;
    delete value.worksFor;
  }

  if (isWebNovisEntity(value) && !isBareEntityReference(value)) {
    const types = normalizeTypes(value['@type']);
    if (types.some((type) => ['LocalBusiness', 'ProfessionalService'].includes(type))) {
      value['@id'] = ENTITY_FACTS.localBusinessId;
    } else if (types.includes('Organization')) {
      value['@id'] = ENTITY_FACTS.organizationId;
    }
    value.name = ENTITY_FACTS.name;
    if (!value.alternateName) value.alternateName = ENTITY_FACTS.alternateName;
    delete value.openingHours;
    delete value.openingHoursSpecification;
  }

  return value;
}

function normalizeEntityJsonLd(html) {
  return String(html).replace(
    /<script\b([^>]*\btype=["']application\/ld\+json["'][^>]*)>\s*([\s\S]*?)\s*<\/script>/gi,
    (fullMatch, attributes, json) => {
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (_) {
        return fullMatch;
      }
      const before = JSON.stringify(parsed);
      normalizeEntityObject(parsed);
      const after = JSON.stringify(parsed);
      return before === after
        ? fullMatch
        : `<script${attributes}>${after}</script>`;
    }
  );
}

module.exports = {
  ENTITY_FACTS,
  FORBIDDEN_ENTITY_URLS,
  normalizeEntityJsonLd,
  normalizeEntityObject
};
