#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const { buildStaticHeadersFile } = require('../config/security-headers');
const { ROOT_DIR, getPublishDir, getReportDir } = require('../config/publish-targets');
const {
  DYNAMIC_RUNTIME_DEPENDENCIES,
  PUBLIC_SENTINELS,
  buildArtifactManifest,
  collectExpectedPublicHtml,
  isForbiddenPublicPath,
  listHtmlFiles,
  normalizePath,
  urlPathToHtmlFile,
  walkFiles
} = require('./public-artifact');

const SITE_ORIGINS = new Set(['https://webnovis.com', 'https://www.webnovis.com']);
const RUNTIME_EXTENSIONS = new Set([
  '.avif', '.css', '.gif', '.ico', '.jpeg', '.jpg', '.js', '.json',
  '.otf', '.png', '.svg', '.ttf', '.webp', '.woff', '.woff2'
]);

function parseSitemapLocations(xml) {
  return [...String(xml || '').matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replace(/&amp;/g, '&').trim())
    .filter((value) => value.startsWith('https://www.webnovis.com'))
    .sort((a, b) => a.localeCompare(b));
}

function setDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter((entry) => !rightSet.has(entry));
}

function decodeHtmlAttribute(value) {
  return String(value || '').replace(/&amp;/g, '&').trim();
}

function resolvePublicReference(rawReference, sourceRelativePath) {
  const reference = decodeHtmlAttribute(rawReference).split('#')[0].split('?')[0];
  if (!reference || /^(?:data:|mailto:|tel:|javascript:|blob:|#)/i.test(reference)) return null;

  let resolved;
  try {
    const sourceUrl = new URL(`/${normalizePath(sourceRelativePath)}`, 'https://www.webnovis.com');
    resolved = new URL(reference, sourceUrl);
  } catch (_) {
    return null;
  }
  if (!SITE_ORIGINS.has(resolved.origin)) return null;
  return decodeURIComponent(resolved.pathname).replace(/^\/+/, '');
}

function collectHtmlRuntimeReferences(html, sourceRelativePath) {
  const references = new Set();
  const domHtml = String(html || '')
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '');
  const attributePattern = /\b(?:href|poster|src)=["']([^"']+)["']/gi;
  for (const match of domHtml.matchAll(attributePattern)) {
    const resolved = resolvePublicReference(match[1], sourceRelativePath);
    if (resolved) references.add(resolved);
  }
  const srcsetPattern = /\bsrcset=["']([^"']+)["']/gi;
  for (const match of domHtml.matchAll(srcsetPattern)) {
    for (const candidate of match[1].split(',')) {
      const resolved = resolvePublicReference(candidate.trim().split(/\s+/)[0], sourceRelativePath);
      if (resolved) references.add(resolved);
    }
  }
  return [...references];
}

function collectCssRuntimeReferences(css, sourceRelativePath) {
  const references = new Set();
  for (const match of String(css || '').matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
    const resolved = resolvePublicReference(match[2], sourceRelativePath);
    if (resolved) references.add(resolved);
  }
  return [...references];
}

function collectJsRuntimeReferences(js, sourceRelativePath) {
  const references = new Set();
  const patterns = [
    /\b(?:fetch|import)\(\s*(['"`])([^'"`$]+)\1/gi,
    /\bnew\s+(?:Worker|SharedWorker|URL)\(\s*(['"`])([^'"`$]+)\1/gi,
    /\b(?:href|src)\s*=\s*(['"`])([^'"`$]+)\1/gi
  ];
  for (const pattern of patterns) {
    for (const match of String(js || '').matchAll(pattern)) {
      const resolved = resolvePublicReference(match[2], sourceRelativePath);
      if (resolved) references.add(resolved);
    }
  }
  return [...references];
}

function shouldResolveRuntimeReference(reference) {
  if (!reference) return false;
  const extension = path.posix.extname(reference).toLowerCase();
  return RUNTIME_EXTENSIONS.has(extension);
}

function verifyRuntimeClosure(publishRoot, allFiles) {
  const fileSet = new Set(allFiles);
  const missing = [];
  for (const relativePath of allFiles) {
    if (!relativePath.endsWith('.html') && !relativePath.endsWith('.css')) continue;
    let content = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
    if (relativePath.endsWith('.html')) {
      content = content
        .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '')
        .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '');
    }
    const references = relativePath.endsWith('.html')
      ? collectHtmlRuntimeReferences(content, relativePath)
      : collectCssRuntimeReferences(content, relativePath);
    for (const reference of references) {
      if (!shouldResolveRuntimeReference(reference)) continue;
      if (!fileSet.has(normalizePath(reference))) {
        missing.push(`${relativePath} -> ${reference}`);
      }
    }
  }
  return [...new Set(missing)].sort((a, b) => a.localeCompare(b));
}

function verifyJsRuntimeClosure(publishRoot, allFiles) {
  const fileSet = new Set(allFiles);
  const missing = [];
  for (const relativePath of allFiles.filter((entry) => entry.endsWith('.js'))) {
    const content = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
    for (const reference of collectJsRuntimeReferences(content, relativePath)) {
      if (!shouldResolveRuntimeReference(reference)) continue;
      if (!fileSet.has(normalizePath(reference))) {
        missing.push(`${relativePath} -> ${reference}`);
      }
    }
  }
  return [...new Set(missing)].sort((a, b) => a.localeCompare(b));
}

function verifyManifestRuntimeClosure(publishRoot, fileSet) {
  const errors = [];
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(path.join(publishRoot, 'manifest.json'), 'utf8'));
  } catch (error) {
    return [`manifest.json is unreadable: ${error.message}`];
  }

  const startUrl = resolvePublicReference(manifest.start_url || '/', 'manifest.json');
  const startFile = startUrl === ''
    ? 'index.html'
    : (startUrl.endsWith('/') ? `${startUrl}index.html` : startUrl);
  if (!fileSet.has(normalizePath(startFile))) {
    errors.push(`manifest.json start_url requires missing ${startFile}`);
  }

  for (const icon of Array.isArray(manifest.icons) ? manifest.icons : []) {
    const iconPath = resolvePublicReference(icon && icon.src, 'manifest.json');
    if (iconPath && !fileSet.has(normalizePath(iconPath))) {
      errors.push(`manifest.json icon requires missing ${iconPath}`);
    }
  }
  return errors;
}

function scanSecretLikeContent(publishRoot, allFiles) {
  const findings = [];
  const patterns = [
    ['private-key', /-----BEGIN (?:EC |OPENSSH |RSA )?PRIVATE KEY-----/],
    ['openai-token', /\bsk-[A-Za-z0-9_-]{24,}\b/],
    ['github-token', /\bgh[oprsu]_[A-Za-z0-9]{30,}\b/],
    ['github-fine-grained-token', /\bgithub_pat_[A-Za-z0-9_]{20,}\b/],
    ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/],
    ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/],
    ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/]
  ];
  const textExtensions = new Set(['', '.css', '.html', '.js', '.json', '.svg', '.txt', '.xml']);
  for (const relativePath of allFiles) {
    if (!textExtensions.has(path.extname(relativePath).toLowerCase())) continue;
    const content = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
    for (const [label, pattern] of patterns) {
      if (pattern.test(content)) findings.push(`${relativePath}: ${label}`);
    }
  }
  return findings;
}

function collectReferencedStaticAssets(publishRoot, allFiles) {
  const referenced = new Set();
  const textExtensions = new Set(['.css', '.html', '.js', '.json', '.txt', '.xml']);
  const referencePattern = /(?:Img|fonts)\/[A-Za-z0-9_./&-]+\.(?:avif|gif|ico|jpeg|jpg|otf|png|svg|ttf|webp|woff|woff2)/gi;
  for (const relativePath of allFiles) {
    if (!textExtensions.has(path.extname(relativePath).toLowerCase())) continue;
    let content = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
    if (relativePath.endsWith('.html')) {
      content = content
        .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '')
        .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '');
    }
    for (const match of content.matchAll(referencePattern)) {
      referenced.add(normalizePath(match[0].replace(/&amp;/g, '&')));
    }
  }
  return referenced;
}

function verifyDynamicRuntimeDependencies(publishRoot, fileSet) {
  const errors = [];
  for (const [producer, dependencies] of Object.entries(DYNAMIC_RUNTIME_DEPENDENCIES)) {
    if (!fileSet.has(producer)) {
      errors.push(`Missing dynamic dependency producer: ${producer}`);
      continue;
    }
    const producerContent = fs.readFileSync(path.join(publishRoot, producer), 'utf8');
    for (const dependency of dependencies) {
      if (!fileSet.has(dependency)) {
        errors.push(`${producer} dynamically requires missing ${dependency}`);
        continue;
      }
      if (!producerContent.includes(path.posix.basename(dependency))) {
        errors.push(`${producer} policy declares ${dependency}, but the loader no longer references it`);
      }
    }
  }
  return errors;
}

function assertArtifact(options = {}) {
  const publishRoot = path.resolve(options.publishRoot || getPublishDir());
  const sourceRoot = path.resolve(options.sourceRoot || ROOT_DIR);
  const reportRoot = path.resolve(options.reportRoot || getReportDir());
  const errors = [];
  const allFiles = walkFiles(publishRoot);
  const fileSet = new Set(allFiles);

  for (const sentinel of PUBLIC_SENTINELS) {
    if (!fileSet.has(sentinel)) errors.push(`Missing required public sentinel: ${sentinel}`);
  }

  const forbidden = allFiles.filter(isForbiddenPublicPath);
  if (forbidden.length > 0) {
    errors.push(`Forbidden public paths: ${forbidden.join(', ')}`);
  }

  const expectedHtml = collectExpectedPublicHtml(sourceRoot);
  const actualHtml = listHtmlFiles(publishRoot);
  const missingHtml = setDifference(expectedHtml, actualHtml);
  const extraHtml = setDifference(actualHtml, expectedHtml);
  if (missingHtml.length > 0) errors.push(`Missing declared HTML (${missingHtml.length}): ${missingHtml.join(', ')}`);
  if (extraHtml.length > 0) errors.push(`Undeclared HTML (${extraHtml.length}): ${extraHtml.join(', ')}`);

  const sourceSitemapPath = path.join(sourceRoot, 'sitemap.xml');
  const builtSitemapPath = path.join(publishRoot, 'sitemap.xml');
  const sourceLocations = parseSitemapLocations(fs.readFileSync(sourceSitemapPath, 'utf8'));
  const builtLocations = parseSitemapLocations(fs.readFileSync(builtSitemapPath, 'utf8'));
  const missingLocations = setDifference(sourceLocations, builtLocations);
  const extraLocations = setDifference(builtLocations, sourceLocations);
  if (missingLocations.length > 0) {
    errors.push(`Built sitemap misses ${missingLocations.length} source URL(s): ${missingLocations.join(', ')}`);
  }
  if (extraLocations.length > 0) {
    errors.push(`Built sitemap adds ${extraLocations.length} URL(s): ${extraLocations.join(', ')}`);
  }

  const missingSitemapFiles = builtLocations
    .map(urlPathToHtmlFile)
    .filter((relativePath) => !fileSet.has(relativePath));
  if (missingSitemapFiles.length > 0) {
    errors.push(`Sitemap URL(s) without physical HTML: ${missingSitemapFiles.join(', ')}`);
  }

  const noindexInSitemap = builtLocations.filter((location) => {
    const relativePath = urlPathToHtmlFile(location);
    const html = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
    const head = html.split(/<\/head>/i)[0];
    return /<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)/i.test(head);
  });
  if (noindexInSitemap.length > 0) {
    errors.push(`Noindex URL(s) in sitemap: ${noindexInSitemap.join(', ')}`);
  }

  const searchIndex = JSON.parse(fs.readFileSync(path.join(publishRoot, 'search-index.json'), 'utf8'));
  const searchUrls = searchIndex.map((entry) => new URL(entry.url, 'https://www.webnovis.com').toString())
    .sort((a, b) => a.localeCompare(b));
  const missingSearchUrls = setDifference(builtLocations, searchUrls);
  const extraSearchUrls = setDifference(searchUrls, builtLocations);
  if (missingSearchUrls.length > 0 || extraSearchUrls.length > 0) {
    errors.push(
      `Search index/sitemap mismatch (missing=${missingSearchUrls.length}, extra=${extraSearchUrls.length})`
    );
  }

  const closureMissing = verifyRuntimeClosure(publishRoot, allFiles);
  if (closureMissing.length > 0) {
    errors.push(`Missing runtime references (${closureMissing.length}): ${closureMissing.slice(0, 40).join(', ')}`);
  }

  const jsClosureMissing = verifyJsRuntimeClosure(publishRoot, allFiles);
  if (jsClosureMissing.length > 0) {
    errors.push(`Missing JS runtime references (${jsClosureMissing.length}): ${jsClosureMissing.slice(0, 40).join(', ')}`);
  }

  const dynamicClosureErrors = verifyDynamicRuntimeDependencies(publishRoot, fileSet);
  if (dynamicClosureErrors.length > 0) {
    errors.push(`Dynamic runtime closure failed: ${dynamicClosureErrors.join(', ')}`);
  }

  const manifestClosureErrors = verifyManifestRuntimeClosure(publishRoot, fileSet);
  if (manifestClosureErrors.length > 0) {
    errors.push(`Web app manifest closure failed: ${manifestClosureErrors.join(', ')}`);
  }

  const referencedStaticAssets = collectReferencedStaticAssets(publishRoot, allFiles);
  const publishedStaticAssets = allFiles.filter((relativePath) =>
    relativePath.startsWith('Img/') || relativePath.startsWith('fonts/')
  );
  const missingReferencedStaticAssets = [...referencedStaticAssets].filter((relativePath) =>
    !fileSet.has(relativePath)
  );
  if (missingReferencedStaticAssets.length > 0) {
    errors.push(
      `Referenced media/font files missing from public artifact (${missingReferencedStaticAssets.length}): `
      + missingReferencedStaticAssets.slice(0, 40).join(', ')
    );
  }
  const unreferencedStaticAssets = publishedStaticAssets.filter((relativePath) =>
    !referencedStaticAssets.has(relativePath)
  );
  if (unreferencedStaticAssets.length > 0) {
    errors.push(
      `Unreferenced media/font files in public artifact (${unreferencedStaticAssets.length}): `
      + unreferencedStaticAssets.slice(0, 40).join(', ')
    );
  }

  const secretLike = scanSecretLikeContent(publishRoot, allFiles);
  if (secretLike.length > 0) errors.push(`Secret-like content found: ${secretLike.join(', ')}`);

  const builtHeaders = fs.readFileSync(path.join(publishRoot, '_headers'), 'utf8');
  const expectedHeaders = buildStaticHeadersFile();
  if (builtHeaders !== expectedHeaders) errors.push('_headers is not synchronized with config/security-headers.js');
  if (/\/(?:css|js|Img|fonts)\/\*[\s\S]{0,100}\bimmutable\b/i.test(builtHeaders)) {
    errors.push('Stable asset paths must not use immutable caching');
  }
  if (!/frame-ancestors 'none'/i.test(builtHeaders)) {
    errors.push("CSP must align X-Frame-Options DENY with frame-ancestors 'none'");
  }

  const homepage = fs.readFileSync(path.join(publishRoot, 'index.html'), 'utf8');
  if (!/class="hero-lcp-img"[^>]*fetchpriority="high"|fetchpriority="high"[^>]*class="hero-lcp-img"/i.test(homepage)) {
    errors.push('Published homepage must retain the high-priority real LCP image');
  }
  if (/class="logo-image"[^>]*fetchpriority="high"/i.test(homepage.slice(0, 25000))) {
    errors.push('Published navigation logo must not compete with the hero LCP image');
  }

  if (errors.length > 0) {
    const error = new Error(`Public artifact validation failed:\n- ${errors.join('\n- ')}`);
    error.validationErrors = errors;
    throw error;
  }

  const manifest = buildArtifactManifest(publishRoot);
  fs.mkdirSync(reportRoot, { recursive: true });
  const report = {
    schemaVersion: 1,
    sourceSitemapUrlCount: sourceLocations.length,
    builtSitemapUrlCount: builtLocations.length,
    htmlFileCount: actualHtml.length,
    fileCount: allFiles.length,
    noindexHtmlCount: actualHtml.filter((relativePath) => {
      const html = fs.readFileSync(path.join(publishRoot, relativePath), 'utf8');
      return /<meta\b(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)/i.test(
        html.split(/<\/head>/i)[0]
      );
    }).length,
    referencedStaticAssetCount: publishedStaticAssets.length,
    manifest
  };
  fs.writeFileSync(
    path.join(reportRoot, 'public-artifact-manifest.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8'
  );
  return report;
}

function main() {
  const report = assertArtifact();
  console.log(
    `✅ Public artifact verified: ${report.fileCount} files, ${report.htmlFileCount} HTML, `
    + `${report.builtSitemapUrlCount} sitemap URLs, ${report.noindexHtmlCount} noindex HTML.`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  assertArtifact,
  collectReferencedStaticAssets,
  collectCssRuntimeReferences,
  collectHtmlRuntimeReferences,
  collectJsRuntimeReferences,
  parseSitemapLocations,
  resolvePublicReference,
  scanSecretLikeContent,
  verifyDynamicRuntimeDependencies,
  verifyJsRuntimeClosure,
  verifyManifestRuntimeClosure,
  verifyRuntimeClosure
};
