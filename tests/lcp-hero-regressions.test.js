/**
 * Guards against mobile Lighthouse NO_LCP on the homepage hero.
 *
 * Root cause class (2026-07): hero text/container started at opacity:0
 * (fadeInUp backwards / heroStaggerIn + blur) while the hero visual was only
 * a CSS background-image — Chrome often recorded FCP but no LCP candidate.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function main() {
  const css = read('css/style.css');
  const minCss = read('css/style.min.css');
  const index = read('index.html');
  const srcIndex = read('src/html/index.html');

  // Extract .hero-title rule body (first occurrence)
  const titleRule = css.match(/\.hero-title\s*\{([^}]+)\}/);
  assert.ok(titleRule, 'css must define .hero-title');
  assert.ok(
    !/animation\s*:\s*[^;]*fadeInUp/i.test(titleRule[1]),
    '.hero-title must not animate with fadeInUp (opacity 0 first paint)'
  );
  assert.ok(/opacity\s*:\s*1/i.test(titleRule[1]), '.hero-title must force opacity:1');

  const contentRule = css.match(/\.hero-content\s*\{([^}]+)\}/);
  assert.ok(contentRule, 'css must define .hero-content');
  assert.ok(
    !/heroStaggerIn/i.test(contentRule[1]),
    '.hero-content must not use heroStaggerIn'
  );
  assert.ok(/opacity\s*:\s*1/i.test(contentRule[1]), '.hero-content must force opacity:1');

  // Mobile block must not reintroduce stagger on content
  assert.ok(
    !/\.hero-content\s*\{\s*animation\s*:\s*heroStaggerIn/i.test(css),
    'mobile .hero-content must not re-enable heroStaggerIn'
  );

  // Published + source homepage must expose a real LCP <img>
  for (const [label, html] of [
    ['index.html', index],
    ['src/html/index.html', srcIndex]
  ]) {
    assert.ok(html.includes('hero-lcp-img'), `${label} must include .hero-lcp-img`);
    assert.ok(
      /class="hero-lcp-img"[^>]*fetchpriority="high"/i.test(html) ||
        /fetchpriority="high"[^>]*class="hero-lcp-img"/i.test(html),
      `${label} LCP img must use fetchpriority=high`
    );
  }

  // Minified CSS must ship the LCP img rules
  assert.ok(minCss.includes('hero-lcp-img'), 'style.min.css must include hero-lcp-img rules');

  // Competing high-priority logo on first paint is discouraged
  const headSlice = index.slice(0, 25000);
  assert.ok(
    !/class="logo-image"[^>]*fetchpriority="high"/i.test(headSlice),
    'nav logo must not use fetchpriority=high (competes with hero LCP)'
  );

  console.log('LCP hero regression checks passed.');
}

main();
