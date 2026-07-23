const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const {
  hasApprovedProvenance,
  loadApprovedContentBlocks,
  findUnsupportedGeneratedClaims,
  preserveGovernedCustomBlocks,
  stripUnapprovedTier1EditorialBlocks
} = require(path.join(ROOT, 'config', 'content-claim-governance.js'));

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function main() {
  const contentBlocksDir = path.join(ROOT, 'data', 'content-blocks');
  const approvedBlocks = loadApprovedContentBlocks(contentBlocksDir);
  assert.equal(
    approvedBlocks.size,
    0,
    'legacy content blocks without source, verifiedAt and approvedBy must not be publishable'
  );

  assert.equal(
    hasApprovedProvenance({
      _meta: {
        publicationStatus: 'approved',
        source: ['https://www.comune.rho.mi.it/'],
        verifiedAt: '2026-07-23',
        approvedBy: 'WebNovis Editorial Team'
      }
    }),
    true,
    'a block with explicit source, verification date and editorial approval must pass the provenance gate'
  );
  assert.equal(
    hasApprovedProvenance({ _meta: { publicationStatus: 'draft', source: [], verifiedAt: null, approvedBy: null } }),
    false,
    'AI drafts must not become publishable without human verification and approval'
  );

  const riskyDraft = {
    localMarketAnalysis: 'Garantiamo le prime 3 posizioni e un aumento del traffico del 30% entro 6 mesi.'
  };
  assert.ok(
    findUnsupportedGeneratedClaims(riskyDraft).length >= 2,
    'claim governance must detect unsupported guarantees, rankings, percentages and outcome timelines'
  );

  const dirtyGeneratedHtml = [
    '<!-- CUSTOM:geo-market-context:START -->Dato AI legacy non verificato: +37%.<!-- CUSTOM:geo-market-context:END -->',
    '<!-- CUSTOM:geo-proof:START -->Risultato garantito.<!-- CUSTOM:geo-proof:END -->',
    '<!-- CUSTOM:visual-note:START -->Markup manuale privo di claim.<!-- CUSTOM:visual-note:END -->'
  ].join('');
  const cleanNextHtml = [
    '<!-- CUSTOM:geo-market-context:START -->Contesto prudente da dati governati.<!-- CUSTOM:geo-market-context:END -->',
    '<!-- CUSTOM:geo-proof:START --><!-- CUSTOM:geo-proof:END -->',
    '<!-- CUSTOM:visual-note:START -->Default visuale.<!-- CUSTOM:visual-note:END -->'
  ].join('');
  const governedHtml = preserveGovernedCustomBlocks(dirtyGeneratedHtml, cleanNextHtml);
  assert.ok(
    governedHtml.includes('Contesto prudente da dati governati.') &&
      !governedHtml.includes('+37%') &&
      !governedHtml.includes('Risultato garantito.'),
    'a regeneration over dirty output must not preserve legacy claim-bearing custom blocks'
  );
  assert.ok(
    governedHtml.includes('Markup manuale privo di claim.'),
    'non-claim custom markup must remain preservable across regeneration'
  );

  const legacyTier1 = '<main><!-- TIER1-EDITORIAL:rho-agenzia-web:START --><p>Unverified claim</p><!-- TIER1-EDITORIAL:rho-agenzia-web:END --></main>';
  assert.equal(
    stripUnapprovedTier1EditorialBlocks(legacyTier1),
    '<main></main>',
    'legacy Tier 1 editorial output must be removed without approved provenance'
  );
  assert.equal(
    stripUnapprovedTier1EditorialBlocks(legacyTier1, { approvedBlockKeys: ['rho-agenzia-web'] }),
    legacyTier1,
    'an explicitly approved Tier 1 block key may be retained'
  );

  const legacyArese = JSON.parse(readText('data/content-blocks/arese.json'));
  const areseOutput = readText('agenzia-web-arese.html');
  assert.ok(
    !areseOutput.includes(legacyArese.localMarketAnalysis),
    'generated Arese output must not retain the unapproved legacy market-analysis block'
  );
  const legacyRho = JSON.parse(readText('data/content-blocks/tier1-rho-agenzia-web.json'));
  const rhoOutput = readText('agenzia-web-rho.html');
  assert.ok(
    !rhoOutput.includes(legacyRho.body[0]),
    'the hand-crafted Rho output must not retain an unapproved legacy Tier 1 block'
  );
  assert.match(
    areseOutput,
    /Graphic Design<\/td>[\s\S]{0,240}>€250<\/td>/,
    'generated GEO comparison prices must come from data/services.json'
  );
  assert.ok(
    !areseOutput.includes('Tempi garantiti per contratto'),
    'generated GEO pages must not publish an unsupported delivery guarantee'
  );

  const aiGenerator = readText('scripts/generate-ai-content.js');
  assert.ok(
    aiGenerator.includes("publicationStatus: 'draft'") &&
      aiGenerator.includes('verifiedAt: null') &&
      aiGenerator.includes('approvedBy: null'),
    'AI content generation must persist non-publishable provenance metadata by default'
  );
  assert.ok(
    !aiGenerator.includes('Le risposte alle FAQ devono contenere almeno 1 dato numerico ciascuna') &&
      !aiGenerator.includes('almeno 2 dati statistici concreti'),
    'AI prompts must not force unsupported numeric or statistical claims'
  );

  const partitaIvaArticle = readText('blog/partita-iva-ecommerce.html');
  assert.ok(
    partitaIvaArticle.includes('https://www.agenziaentrate.gov.it/portale/schede/istanze/aa9_11-apertura-variazione-chiusura-pf/quando-utilizzare-imprese'),
    'blog/partita-iva-ecommerce.html must cite the Agenzia delle Entrate guidance for opening a partita IVA'
  );
  assert.ok(
    partitaIvaArticle.includes('https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2025.02.gestione-artigiani-e-commercianti-contributi-per-il-2025.html'),
    'blog/partita-iva-ecommerce.html must cite the INPS guidance for artigiani e commercianti contributions'
  );

  const accessibilityArticle = readText('blog/obblighi-legge-accessibilita-siti.html');
  assert.ok(
    accessibilityArticle.includes('https://www.agid.gov.it/it/design-servizi/accessibilita'),
    'blog/obblighi-legge-accessibilita-siti.html must cite the AGID accessibility guidance'
  );
  assert.ok(
    accessibilityArticle.includes('https://digital-strategy.ec.europa.eu/en/policies/web-accessibility'),
    'blog/obblighi-legge-accessibilita-siti.html must cite the European Commission accessibility policy page'
  );

  const gscGuideArticle = readText('blog/google-search-console-guida.html');
  assert.ok(
    gscGuideArticle.includes('https://developers.google.com/search/docs/monitor-debug/search-console-start'),
    'blog/google-search-console-guida.html must cite the Search Console onboarding documentation'
  );
  assert.ok(
    gscGuideArticle.includes('https://support.google.com/webmasters/answer/7042828?hl=it'),
    'blog/google-search-console-guida.html must cite the Search Console performance metrics documentation'
  );
  assert.ok(
    gscGuideArticle.includes('https://support.google.com/webmasters/answer/9012289?hl=it'),
    'blog/google-search-console-guida.html must cite the URL Inspection documentation'
  );
}

try {
  main();
  console.log('Priority content regression checks passed.');
} catch (error) {
  console.error('Priority content regression checks failed:', error.message);
  process.exit(1);
}
