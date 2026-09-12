const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.claude', 'reports', 'tests'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

function main() {
  const files = walk(ROOT);

  // 1. Nunjucks vive solo nei build script geo: mai runtime, mai worker, mai client.
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (rel.endsWith('.min.js')) continue; // vendored bundles (cobe, fuse): testo, non template engine
    const src = fs.readFileSync(file, 'utf8');
    if (!/nunjucks/i.test(src)) continue;
    // Nunjucks solo build-time (scripts/): mai server runtime, worker o client.
    const inScripts = rel === 'server.js' ? false : rel.startsWith(`scripts${path.sep}`);
    assert.ok(inScripts, `nunjucks must only live in build scripts (found in ${rel})`);
    // 2. Nessun input HTTP raggiunge mai il render.
    assert.ok(
      !/req\.(query|body|params)/.test(src),
      `nunjucks render files must never touch req.* (found in ${rel})`
    );
    assert.ok(
      !/renderString.*req|req.*renderString/.test(src),
      `no dynamic renderString with request input (in ${rel})`
    );
  }

  // 3. Sorgenti contenuto build-time senza markup attivo.
  const contentDirs = ['data/content-blocks', 'data/geo-editorial'].map((d) => path.join(ROOT, d));
  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith('.json')) continue;
      const raw = fs.readFileSync(path.join(dir, entry), 'utf8');
      assert.ok(!/<script/i.test(raw), `content source must not contain <script (${entry})`);
      assert.ok(!/<iframe/i.test(raw), `content source must not contain <iframe (${entry})`);
      assert.ok(!/javascript:/i.test(raw), `content source must not contain javascript: (${entry})`);
      assert.ok(!/\son\w+\s*=/i.test(raw), `content source must not contain event handlers (${entry})`);
    }
  }

  // 4. autoescape:false resta una scelta esplicita e recensita (non silenziosa).
  const dataGeo = fs.readFileSync(path.join(ROOT, 'scripts', 'geo', 'data.js'), 'utf8');
  assert.ok(dataGeo.includes('autoescape'), 'geo data.js must declare its autoescape policy explicitly');
}

try {
  main();
  console.log('Template safety regression checks passed.');
} catch (error) {
  console.error('Template safety regression failures:');
  console.error(error.message);
  process.exit(1);
}
