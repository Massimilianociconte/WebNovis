const fs = require('fs');
const path = require('path');

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HTTP_URL_PATTERN = /^https:\/\/[^\s]+$/i;
const CUSTOM_BLOCK_REGEX = /<!-- CUSTOM:([a-z0-9-]+):START -->([\s\S]*?)<!-- CUSTOM:\1:END -->/gi;
const TIER1_EDITORIAL_BLOCK_REGEX = /<!-- TIER1-EDITORIAL:([a-z0-9-]+):START -->([\s\S]*?)<!-- TIER1-EDITORIAL:\1:END -->/gi;

const CLAIM_BEARING_CUSTOM_BLOCK_NAMES = new Set([
  'geo-positioning',
  'geo-market-context',
  'geo-proof',
  'tier1',
  'local-proof'
]);

const UNSUPPORTED_GENERATED_CLAIM_PATTERNS = [
  { id: 'guarantee', pattern: /\b(?:garant(?:iamo|isce|ito|ita|iti|ite)|garanzia di risultato|risultati? garantiti?)\b/i },
  { id: 'rank-promise', pattern: /\b(?:prime?\s+3|primi\s+3|top\s*3|prima pagina|posizion(?:are|amento)[^.!?]{0,45}(?:entro|garant))\b/i },
  { id: 'percentage-outcome', pattern: /(?:\+\s*)?\d{1,3}(?:[.,]\d+)?\s*%/i },
  { id: 'roi-timeline', pattern: /\bROI\b[^.!?]{0,90}\bentro\b/i },
  { id: 'growth-outcome', pattern: /\b(?:aument|increment|cresc|fatturato|traffico|conversion)[^.!?]{0,60}(?:del|di|\+)\s*\d/i },
  { id: 'fixed-response-or-delivery', pattern: /\b(?:risposta|assistenza|consegna|produzione|realizzazione|pronto|completat[oa])[^.!?]{0,55}\bentro\s+\d/i },
  { id: 'universal-performance', pattern: /\b(?:Lighthouse\s*(?:95|100|95\s*[-–]\s*100)|zero\s+vulnerabilit|uptime\s+(?:garantito\s+)?(?:del\s+)?99)/i }
];

const UNSUPPORTED_PUBLISHED_CLAIM_PATTERNS = [
  {
    id: 'universal-lighthouse-score',
    pattern: /\bLighthouse\s*(?:95\+|95\s*[-–]\s*100|95\s*(?:a|o)\s*100)\b/i
  },
  {
    id: 'fixed-two-hour-response',
    pattern: /\b(?:rispost[ae]|rispondiamo)[^.!?]{0,80}\b(?:garantit[ae]?[^.!?]{0,30})?entro\s+(?:2|due)\s+ore\b/i
  },
  {
    id: 'founder-every-project',
    pattern: /\b(?:il\s+)?fondatore\b[^.!?]{0,100}\b(?:segue|seguir[àa]|dedicat|direttamente|personalmente)[^.!?]{0,60}\b(?:ogni\s+)?progett/i
  },
  {
    id: 'absolute-vulnerability-claim',
    pattern: /\b(?:zero|nessun[aoe]?)\s+vulnerabilit(?:à|a)/i
  },
  {
    id: 'fixed-free-support-period',
    pattern: /\b30\s+giorni\s+di\s+supporto(?:\s+(?:gratuito|incluso|gratis))?\b/i
  },
  {
    id: 'fixed-24-hour-commercial-sla',
    pattern: /\b(?:preventiv\w*|rispost\w*|propost\w*|rispond\w*|analisi\s+personalizzata|report\s+dettagliato|(?:ri)?contatt\w*)[^.!?]{0,110}\b(?:entro|in)\s+24\s*(?:ore|h)\b/i
  },
  {
    id: 'universal-core-web-vitals-threshold',
    pattern: /\b(?:LCP\s*(?:<|&lt;)\s*2[.,]5\s*s?|INP\s*(?:<|&lt;)\s*200\s*ms?|CLS\s*(?:<|&lt;)\s*0[.,]1)\b/i
  },
  {
    id: 'fixed-delivery-promise',
    pattern: /\b(?:tempi\s+certi|consegna\s+garantita|data\s+di\s+consegna\s+garantita)\b/i
  }
];

const FIXED_DELIVERY_ESTIMATE_PATTERNS = [
  /\b(?:Landing\s+Page|Sito\s+Vetrina|E-?Commerce)\s*:\s*\d+(?:\s*[-–]\s*\d+)?\s*(?:giorni|settimane|mesi)\b/i,
  /\b(?:Briefing(?:\s+e\s+Analisi)?|Wireframe(?:\s+e\s+Design)?|Sviluppo\s+Custom|Test\s+e\s+Revisione)\s*\(\s*\d+(?:\s*[-–]\s*\d+)?\s*giorni\s*\)/i
];

const QUALIFIED_ESTIMATE_PATTERN = /\b(?:indicativ[ioe]|stima|dipend\w*|preventiv\w*\s+conferm|proposta\s+conferm|da\s+confermare)\b/i;

function normalizeSources(source) {
  const values = Array.isArray(source) ? source : typeof source === 'string' ? [source] : [];
  return values.map((value) => String(value).trim()).filter(Boolean);
}

function hasApprovedProvenance(block) {
  const meta = block && typeof block === 'object' ? block._meta : null;
  if (!meta || meta.publicationStatus !== 'approved') return false;

  const sources = normalizeSources(meta.source);
  if (sources.length === 0 || !sources.every((source) => HTTP_URL_PATTERN.test(source))) return false;
  if (!ISO_DATE_PATTERN.test(String(meta.verifiedAt || ''))) return false;
  if (!String(meta.approvedBy || '').trim()) return false;
  return true;
}

function readApprovedContentBlock(filePath) {
  try {
    const block = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!hasApprovedProvenance(block)) return null;
    if (findUnsupportedGeneratedClaims(block).length > 0) return null;
    if (findUnsupportedPublishedClaims(JSON.stringify(block)).length > 0) return null;
    return block;
  } catch (_) {
    return null;
  }
}

function loadApprovedContentBlocks(directory, { includeTier1 = true } = {}) {
  const approved = new Map();
  if (!fs.existsSync(directory)) return approved;

  for (const file of fs.readdirSync(directory).filter((entry) => entry.endsWith('.json')).sort()) {
    if (!includeTier1 && file.startsWith('tier1-')) continue;
    const block = readApprovedContentBlock(path.join(directory, file));
    if (block) approved.set(file.replace(/\.json$/, ''), block);
  }
  return approved;
}

function collectStrings(value, currentPath = '$', entries = []) {
  if (typeof value === 'string') {
    entries.push({ path: currentPath, value });
    return entries;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${currentPath}[${index}]`, entries));
    return entries;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === '_meta') continue;
      collectStrings(item, `${currentPath}.${key}`, entries);
    }
  }
  return entries;
}

function findUnsupportedGeneratedClaims(block) {
  const findings = [];
  for (const entry of collectStrings(block)) {
    for (const rule of UNSUPPORTED_GENERATED_CLAIM_PATTERNS) {
      if (!rule.pattern.test(entry.value)) continue;
      findings.push({
        id: rule.id,
        path: entry.path,
        excerpt: entry.value.replace(/\s+/g, ' ').trim().slice(0, 240)
      });
    }
  }
  return findings;
}

function normalizePublishedText(value) {
  return String(value || '')
    .replace(
      /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
      (fullMatch, attributes, content) => /\btype=["']application\/ld\+json["']/i.test(attributes) ? ` ${content} ` : ' '
    )
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function findUnsupportedPublishedClaims(value) {
  const text = normalizePublishedText(value);
  const findings = [];

  for (const rule of UNSUPPORTED_PUBLISHED_CLAIM_PATTERNS) {
    const match = text.match(rule.pattern);
    if (!match) continue;
    const index = match.index || 0;
    findings.push({
      id: rule.id,
      excerpt: text.slice(Math.max(0, index - 80), index + match[0].length + 120)
    });
  }

  for (const pattern of FIXED_DELIVERY_ESTIMATE_PATTERNS) {
    const match = text.match(pattern);
    if (!match) continue;
    const index = match.index || 0;
    const context = text.slice(Math.max(0, index - 220), index + match[0].length + 220);
    if (QUALIFIED_ESTIMATE_PATTERN.test(context)) continue;
    findings.push({
      id: 'unqualified-fixed-delivery-estimate',
      excerpt: context
    });
    break;
  }

  return findings;
}

function extractCustomBlocks(html = '') {
  const blocks = new Map();
  for (const match of String(html).matchAll(CUSTOM_BLOCK_REGEX)) {
    blocks.set(match[1].toLowerCase(), match[2]);
  }
  return blocks;
}

function preserveGovernedCustomBlocks(existingHtml, nextHtml, { approvedClaimBlocks = [] } = {}) {
  const existingBlocks = extractCustomBlocks(existingHtml);
  if (existingBlocks.size === 0) return nextHtml;

  const approved = new Set(
    Array.from(approvedClaimBlocks, (name) => String(name).toLowerCase())
  );

  return String(nextHtml).replace(CUSTOM_BLOCK_REGEX, (fullMatch, blockName) => {
    const normalizedName = String(blockName).toLowerCase();
    const preservedContent = existingBlocks.get(normalizedName);
    if (preservedContent == null) return fullMatch;

    if (CLAIM_BEARING_CUSTOM_BLOCK_NAMES.has(normalizedName) && !approved.has(normalizedName)) {
      return fullMatch;
    }

    return `<!-- CUSTOM:${blockName}:START -->${preservedContent}<!-- CUSTOM:${blockName}:END -->`;
  });
}

function stripUnapprovedTier1EditorialBlocks(html, { approvedBlockKeys = [] } = {}) {
  const approved = new Set(
    Array.from(approvedBlockKeys, (key) => String(key).toLowerCase())
  );

  return String(html || '').replace(
    TIER1_EDITORIAL_BLOCK_REGEX,
    (fullMatch, blockKey) => approved.has(String(blockKey).toLowerCase()) ? fullMatch : ''
  );
}

module.exports = {
  CLAIM_BEARING_CUSTOM_BLOCK_NAMES,
  UNSUPPORTED_GENERATED_CLAIM_PATTERNS,
  UNSUPPORTED_PUBLISHED_CLAIM_PATTERNS,
  findUnsupportedGeneratedClaims,
  findUnsupportedPublishedClaims,
  hasApprovedProvenance,
  loadApprovedContentBlocks,
  preserveGovernedCustomBlocks,
  readApprovedContentBlock,
  stripUnapprovedTier1EditorialBlocks
};
