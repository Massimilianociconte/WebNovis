/**
 * Redirect-shadowing regressions.
 *
 * On Cloudflare Workers, _redirects rules take precedence over static files
 * (no shadowing). A wildcard 301 (e.g. `/ecommerce-*`) therefore hijacks every
 * PUBLISHED page it matches unless an explicit `PATH PATH 200` exception
 * precedes it. This silently turned ~80 indexable pages into 301s.
 *
 * Invariant: every sitemap URL must first-match a 200 (rewrite) or no rule
 * (static serve) — never a wildcard 3xx.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function parseRedirects(text) {
  const rules = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;
    rules.push({
      src: parts[0],
      code: parts[2] || '200',
      // Cloudflare splat: greedy, crosses `/`. Anchor full-path match.
      re: new RegExp(`^${parts[0].split('*').map(escapeRegExp).join('.*')}$`)
    });
  }
  return rules;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstMatch(rules, urlPath) {
  for (const rule of rules) {
    if (rule.re.test(urlPath)) return rule;
  }
  return null;
}

function main() {
  const redirects = parseRedirects(
    fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8')
  );
  assert.ok(redirects.length > 10, 'expected a populated _redirects file');

  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 100, 'expected a populated sitemap.xml');

  const shadowed = [];
  for (const loc of locs) {
    const urlPath = decodeURIComponent(new URL(loc).pathname);
    const hit = firstMatch(redirects, urlPath);
    if (hit && hit.src.includes('*') && /^30[1278]$/.test(hit.code)) {
      shadowed.push(`${urlPath} -> wildcard ${hit.src} (${hit.code})`);
    }
  }
  assert.deepEqual(
    shadowed,
    [],
    `sitemap URLs hijacked by wildcard redirects:\n${shadowed.slice(0, 20).join('\n')}`
  );

  // Every 200 self-exception must point at a real tracked file (no dead rules).
  const tracked = new Set(
    require('child_process')
      .execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' })
      .split('\0')
      .filter(Boolean)
  );
  const dead = [];
  for (const line of fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split(/\r?\n/)) {
    const m = line.trim().match(/^(\/\S+) \1 200$/);
    if (m && !tracked.has(m[1].slice(1))) dead.push(m[1]);
  }
  assert.deepEqual(dead, [], `dead 200 exceptions (file not tracked): ${dead.join(', ')}`);

  console.log(`Redirect shadowing checks passed (${locs.length} sitemap URLs, no wildcard hijack).`);
}

try {
  main();
} catch (error) {
  console.error('Redirect shadowing regression checks failed:', error.message);
  process.exit(1);
}
