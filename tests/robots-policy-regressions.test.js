const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const robots = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');

function parseGroups(source) {
  const groups = [];
  let current = null;
  let hasRules = false;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) {
      if (current && hasRules) {
        current = null;
        hasRules = false;
      }
      continue;
    }
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') {
      if (!current || hasRules) {
        current = { agents: [], rules: [] };
        groups.push(current);
        hasRules = false;
      }
      current.agents.push(value.toLowerCase());
      continue;
    }
    if (!current || !['allow', 'disallow'].includes(field)) continue;
    current.rules.push({ type: field, pattern: value });
    hasRules = true;
  }
  return groups;
}

function ruleMatches(pattern, urlPath) {
  if (!pattern) return false;
  const endAnchored = pattern.endsWith('$');
  const rawPattern = endAnchored ? pattern.slice(0, -1) : pattern;
  const escaped = rawPattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}${endAnchored ? '$' : ''}`).test(urlPath);
}

function isAllowed(userAgent, urlPath) {
  const ua = userAgent.toLowerCase();
  const groups = parseGroups(robots);
  const candidates = [];

  for (const group of groups) {
    for (const token of group.agents) {
      if (token === '*' || ua.includes(token)) {
        candidates.push({ tokenLength: token === '*' ? 0 : token.length, group });
      }
    }
  }

  const longest = Math.max(...candidates.map((candidate) => candidate.tokenLength));
  const selected = candidates
    .filter((candidate) => candidate.tokenLength === longest)
    .map((candidate) => candidate.group);
  const matchingRules = selected
    .flatMap((group) => group.rules)
    .filter((rule) => ruleMatches(rule.pattern, urlPath));

  if (!matchingRules.length) return true;
  const maxLength = Math.max(...matchingRules.map((rule) => rule.pattern.replace(/\*|\$/g, '').length));
  const strongest = matchingRules.filter(
    (rule) => rule.pattern.replace(/\*|\$/g, '').length === maxLength
  );
  return strongest.some((rule) => rule.type === 'allow');
}

const legitimateAgents = [
  'Googlebot/2.1',
  'GPTBot/1.0',
  'OAI-SearchBot/1.0',
  'PerplexityBot/1.0',
  'ClaudeBot/1.0'
];
const publicPaths = [
  '/',
  '/blog/index.html',
  '/servizi/sviluppo-web.html',
  '/css/style.min.css',
  '/llms.txt'
];
const toolingPaths = [
  '/.github/workflows/lighthouse-ci.yml',
  '/.superpowers/sdd/task-5-analysis.md',
  '/config/pseo-governance.js',
  '/data/services.json',
  '/reports/seo/audit.md',
  '/scripts/generate-all-geo.js',
  '/src/html/index.html',
  '/templates/geo-page.njk',
  '/tests/seo-regressions.test.js',
  '/blog/auto-writer.js',
  '/build.js',
  '/package.json',
  '/server.js'
];

for (const agent of legitimateAgents) {
  for (const urlPath of publicPaths) {
    assert.equal(isAllowed(agent, urlPath), true, `${agent} must be allowed to crawl ${urlPath}`);
  }
  for (const urlPath of toolingPaths) {
    assert.equal(isAllowed(agent, urlPath), false, `${agent} must not crawl tooling path ${urlPath}`);
  }
}

for (const aggressiveAgent of ['MJ12bot', 'DotBot', 'BLEXBot']) {
  assert.equal(isAllowed(aggressiveAgent, '/'), false, `${aggressiveAgent} must remain blocked`);
  assert.equal(isAllowed(aggressiveAgent, '/blog/index.html'), false, `${aggressiveAgent} must remain blocked`);
}

assert.match(
  robots,
  /crawl preferences only/i,
  'robots.txt must state that it is not an access-control or security boundary'
);

console.log('Robots effective-policy regressions passed.');
