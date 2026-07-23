const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { ROOT_DIR } = require('../config/publish-targets');

const PUBLIC_HTML_ROOT_FILES = new Set([
  'cookie-policy.html',
  'privacy-policy.html',
  'termini-condizioni.html'
]);

const PUBLIC_TECHNICAL_FILES = new Set([
  '.nojekyll',
  'CNAME',
  '_redirects',
  'ai.txt',
  'favicon.ico',
  'manifest.json',
  'robots.txt',
  'webnovis-ai-data.json'
]);

const PUBLIC_MEDIA_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp'
]);

const PUBLIC_FONT_EXTENSIONS = new Set(['.otf', '.ttf', '.woff', '.woff2']);

const FORBIDDEN_PUBLIC_PREFIXES = [
  '.git/',
  '.github/',
  '.claude/',
  '.kiro/',
  'config/',
  'data/',
  'docs/',
  'node_modules/',
  'reports/',
  'scripts/',
  'src/',
  'templates/',
  'test-SEO/',
  'tests/'
];

const FORBIDDEN_PUBLIC_BASENAMES = new Set([
  '.assetsignore',
  'ai-config.js',
  'build-search-index.js',
  'build.js',
  'generate-sitemap.js',
  'newsletter-engine.js',
  'newsletter-template.html',
  'package-lock.json',
  'package.json',
  'pnpm-lock.yaml',
  'search-ai-engine.js',
  'search-ai-index.json',
  'server.js',
  'wrangler.jsonc'
]);

const DYNAMIC_RUNTIME_DEPENDENCIES = Object.freeze({
  'js/noncritical-loader.min.js': [
    'js/chat.min.js',
    'js/cursor.min.js',
    'js/globe.min.js',
    'js/text-effects.min.js'
  ],
  'js/search.min.js': ['search-index.json'],
  'js/web-vitals-reporter.min.js': ['js/web-vitals.iife.js']
});

const PUBLIC_SENTINELS = [
  '.nojekyll',
  '404.html',
  'CNAME',
  'Img/favicon-512.png',
  'Img/favicon.png',
  'Img/webnovis-logo-bianco.webp',
  '_headers',
  '_redirects',
  'ai.txt',
  'blog/index.html',
  'css/revolution.min.css',
  'css/search.min.css',
  'css/style.min.css',
  'favicon.ico',
  'fonts/grift-black.ttf',
  'grazie.html',
  'index.html',
  'js/chat.min.js',
  'js/cursor.min.js',
  'js/footer-widgets-loader.min.js',
  'js/globe.min.js',
  'js/main.min.js',
  'js/noncritical-loader.min.js',
  'js/search.min.js',
  'js/text-effects.min.js',
  'js/web-vitals-reporter.min.js',
  'js/web-vitals.iife.js',
  'llms-full.txt',
  'llms.txt',
  'manifest.json',
  'robots.txt',
  'search-index.json',
  'sitemap.xml',
  'webnovis-ai-data.json'
];

function normalizePath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
}

function isWithin(parentPath, candidatePath) {
  const relative = path.relative(path.resolve(parentPath), path.resolve(candidatePath));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function assertNoSymlinkTarget(targetPath) {
  let current = path.resolve(targetPath);
  const existing = [];
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  existing.push(current);
  for (const entry of existing) {
    if (fs.lstatSync(entry).isSymbolicLink()) {
      throw new Error(`Refusing symlink-backed publish target: ${targetPath}`);
    }
  }
  if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isSymbolicLink()) {
    throw new Error(`Refusing symlink publish target: ${targetPath}`);
  }
}

function assertSafePublishTarget(targetPath, options = {}) {
  const resolved = path.resolve(targetPath || '');
  const filesystemRoot = path.parse(resolved).root;
  const homeDir = path.resolve(os.homedir());
  const sourceRoot = path.resolve(ROOT_DIR);
  const canonicalDist = path.join(sourceRoot, 'dist');
  const basename = path.basename(resolved);
  const isStaging = path.dirname(resolved) === sourceRoot && /^\.dist\.__staging__-[a-z0-9-]+$/i.test(basename);
  const isTemporary = isWithin(os.tmpdir(), resolved) && /^webnovis-public-artifact-[a-z0-9-]+$/i.test(basename);

  if (resolved === filesystemRoot) {
    throw new Error(`Refusing filesystem root as publish target: ${resolved}`);
  }
  if (resolved === homeDir) {
    throw new Error(`Refusing user home as publish target: ${resolved}`);
  }
  if (resolved === sourceRoot) {
    throw new Error(`Refusing source root as publish target: ${resolved}`);
  }

  const allowed = resolved === canonicalDist
    || (options.allowStaging === true && isStaging)
    || (options.allowTemporary === true && isTemporary);
  if (!allowed) {
    throw new Error(`Refusing non-dedicated publish target: ${resolved}`);
  }

  assertNoSymlinkTarget(resolved);
  return resolved;
}

function walkFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const files = [];
  const stack = [path.resolve(rootDir)];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        throw new Error(`Symlinks are not allowed in the public artifact: ${absolute}`);
      }
      if (entry.isDirectory()) {
        stack.push(absolute);
      } else if (entry.isFile()) {
        files.push(normalizePath(path.relative(rootDir, absolute)));
      }
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function buildArtifactManifest(rootDir) {
  return walkFiles(rootDir).map((relativePath) => ({
    path: relativePath,
    sha256: sha256File(path.join(rootDir, relativePath)),
    bytes: fs.statSync(path.join(rootDir, relativePath)).size
  }));
}

function isForbiddenPublicPath(relativePath) {
  const normalized = normalizePath(relativePath);
  const basename = path.posix.basename(normalized);
  if (FORBIDDEN_PUBLIC_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return true;
  if (FORBIDDEN_PUBLIC_BASENAMES.has(basename)) return true;
  if (/^\.env(?:\.|$)/i.test(basename)) return true;
  if (/\.(?:key|log|map|p12|pem|pfx|py)$/i.test(basename)) return true;
  return false;
}

function listHtmlFiles(rootDir) {
  return walkFiles(rootDir).filter((relativePath) => relativePath.endsWith('.html'));
}

function listHtmlUnder(sourceRoot, relativeDir) {
  const absoluteDir = path.join(sourceRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];
  return listHtmlFiles(absoluteDir).map((relativePath) =>
    normalizePath(path.posix.join(normalizePath(relativeDir), relativePath))
  );
}

function collectExpectedPublicHtml(sourceRoot = ROOT_DIR) {
  const expected = new Set();

  for (const relativePath of listHtmlUnder(sourceRoot, 'src/html')) {
    expected.add(relativePath.replace(/^src\/html\//, ''));
  }
  for (const relativePath of listHtmlUnder(sourceRoot, 'blog')) expected.add(relativePath);
  for (const relativePath of listHtmlUnder(sourceRoot, 'portfolio')) expected.add(relativePath);
  for (const filename of PUBLIC_HTML_ROOT_FILES) {
    if (fs.existsSync(path.join(sourceRoot, filename))) expected.add(filename);
  }

  const serviceSlugs = new Set(
    JSON.parse(fs.readFileSync(path.join(sourceRoot, 'data', 'services.json'), 'utf8'))
      .services
      .map((service) => service.slug)
  );
  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const isGeneratedGeo = entry.name.startsWith('agenzia-web-')
      || entry.name.startsWith('realizzazione-siti-web-')
      || [...serviceSlugs].some((slug) => entry.name.startsWith(`${slug}-`));
    if (isGeneratedGeo) expected.add(entry.name);
  }

  for (const hubDir of ['agenzia-web', 'realizzazione-siti-web', 'zone-servite']) {
    expected.add(`${hubDir}/index.html`);
  }

  return [...expected].sort((a, b) => a.localeCompare(b));
}

function urlPathToHtmlFile(urlValue) {
  const url = new URL(urlValue, 'https://www.webnovis.com');
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') return 'index.html';
  if (pathname.endsWith('/')) return normalizePath(`${pathname.slice(1)}index.html`);
  return normalizePath(pathname.slice(1));
}

module.exports = {
  DYNAMIC_RUNTIME_DEPENDENCIES,
  FORBIDDEN_PUBLIC_BASENAMES,
  FORBIDDEN_PUBLIC_PREFIXES,
  PUBLIC_FONT_EXTENSIONS,
  PUBLIC_HTML_ROOT_FILES,
  PUBLIC_MEDIA_EXTENSIONS,
  PUBLIC_SENTINELS,
  PUBLIC_TECHNICAL_FILES,
  assertSafePublishTarget,
  buildArtifactManifest,
  collectExpectedPublicHtml,
  isForbiddenPublicPath,
  listHtmlFiles,
  normalizePath,
  urlPathToHtmlFile,
  walkFiles
};
