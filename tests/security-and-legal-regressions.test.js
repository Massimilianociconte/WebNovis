const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { buildStaticHeadersFile } = require(path.join(ROOT, 'config', 'security-headers.js'));

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}


async function assertServerUsesSharedSecurityConfig() {
  const serverSource = readText('server.js');
  assert.ok(
    serverSource.includes("const { SECURITY_HEADERS, getAllowedCorsOrigins } = require('./config/security-headers');"),
    'server.js must import the shared security config'
  );
  assert.ok(
    serverSource.includes('const allowedCorsOrigins = getAllowedCorsOrigins(process.env);'),
    'server.js must derive allowed CORS origins from the shared helper'
  );
  assert.ok(
    serverSource.includes('res.set(SECURITY_HEADERS);'),
    'server.js must apply the shared security headers middleware'
  );
  assert.ok(
    !serverSource.includes('buildCspWithNonce') && !serverSource.includes('res.locals.cspNonce'),
    'server.js must not advertise a nonce CSP unless nonce attributes are injected into every executable script'
  );
}

async function main() {
  const envExample = readText('.env.example');
  assert.match(
    envExample,
    /^CORS_ORIGINS=/m,
    '.env.example must document CORS_ORIGINS for runtime CORS configuration'
  );

  const generatedHeaders = buildStaticHeadersFile().trim();
  const committedHeaders = readText('_headers').trim();
  assert.equal(committedHeaders, generatedHeaders, '_headers must stay synced with shared security config');

  const legalPages = [
    'privacy-policy.html',
    'cookie-policy.html',
    'termini-condizioni.html'
  ];

  for (const file of legalPages) {
    const html = readText(file);
    assert.ok(
      html.includes('<main class="legal-content" id="main-content">'),
      `${file} must expose #main-content so the skip link has a valid target`
    );
    assert.match(
      html,
      /"@type":"WebPage"/,
      `${file} must include WebPage structured data`
    );
    assert.ok(
      !html.includes('height="auto" src="Img/designrush-badge.png"'),
      `${file} must not use height="auto" on the DesignRush badge`
    );
  }

  for (const file of ['index.html', 'src/html/index.html']) {
    const html = readText(file);
    assert.ok(
      !/"openingHours(?:Specification)?"\s*:/.test(html),
      `${file} must not expose unverified business hours in structured data`
    );
    assert.ok(
      !html.includes('https://www.wikidata.org/wiki/Q138340285') &&
        !html.includes('https://www.linkedin.com/company/webnovis') &&
        !html.includes('cylex-italia.it/rho/web-novis-16332'),
      `${file} must not expose known obsolete or false entity references`
    );
  }

  const publicHtmlFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.git', '.claude', 'dist', 'docs', 'reports', 'templates'].includes(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fullPath);
      else if (entry.isFile() && entry.name.endsWith('.html')) publicHtmlFiles.push(fullPath);
    }
  }
  walk(ROOT);
  const ratingBadges = [];
  for (const filePath of publicHtmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8');
    if (/href=["']https:\/\/g\.page\/r\/CRblKdK0GGO_EBM\/review["'][\s\S]{0,1800}(?:★★★★★|review-badge-stars)/i.test(html)) {
      ratingBadges.push(path.relative(ROOT, filePath));
    }
  }
  assert.deepEqual(
    ratingBadges,
    [],
    `Google review actions must not display an unverified star value: ${ratingBadges.slice(0, 20).join(', ')}`
  );

  for (const sourceFile of ['config/site-footer.js', 'scripts/standardize-all.js']) {
    const source = readText(sourceFile);
    assert.ok(
      !source.includes('review-badge-stars') && !source.includes('★★★★★'),
      `${sourceFile} must not regenerate a static Google star value`
    );
  }
  await assertServerUsesSharedSecurityConfig();


  console.log('Security/legal regression checks passed.');
}

main().catch(error => {
  console.error('Security/legal regression checks failed:', error.message);
  process.exit(1);
});
