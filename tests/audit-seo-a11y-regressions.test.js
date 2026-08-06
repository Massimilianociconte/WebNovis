const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const SRC_PAGES = [
  'index.html', 'chi-siamo.html', 'come-lavoriamo.html', 'contatti.html',
  'grazie.html', 'partner.html', 'portfolio.html', 'preventivo.html', '404.html'
];

function main() {
  const failures = [];

  // C1: no inline Clarity/Meta Pixel snippets in any HTML source or built page
  // (the consent-gated loader lives only in js/main.js)
  for (const rel of SRC_PAGES) {
    for (const file of [`src/html/${rel}`, rel]) {
      const html = read(file);
      if (/clarity\.ms\/tag/.test(html)) failures.push(`${file}: inline Clarity snippet present (C1)`);
      if (/fbevents\.js/.test(html)) failures.push(`${file}: inline Meta Pixel snippet present (C1)`);
    }
  }

  // A1: no above-root relative script paths; site-config must be deferred
  for (const rel of SRC_PAGES) {
    const html = read(`src/html/${rel}`);
    if (/<script[^>]+src="(?:\.\.\/){2,}js\//.test(html)) {
      failures.push(`src/html/${rel}: above-root ../../js script path (A1)`);
    }
    for (const m of html.matchAll(/<script[^>]+src="[^"]*site-config\.js"[^>]*>/g)) {
      if (!/\bdefer\b/.test(m[0])) failures.push(`src/html/${rel}: site-config.js without defer (A1)`);
    }
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'src/html/servizi'))) {
    if (!f.endsWith('.html')) continue;
    const html = read(`src/html/servizi/${f}`);
    if (/<script[^>]+src="(?:\.\.\/){2,}js\//.test(html)) {
      failures.push(`src/html/servizi/${f}: above-root ../../../js script path (A1)`);
    }
  }

  // A3: FAQ buttons carry state + controls, panels carry matching ids
  {
    const html = read('src/html/index.html');
    const buttons = [...html.matchAll(/<button class="faq-question"[^>]*>/g)].map((m) => m[0]);
    assert.equal(buttons.length, 9, 'expected 9 FAQ buttons on homepage');
    buttons.forEach((btn, i) => {
      if (!/aria-expanded="false"/.test(btn)) failures.push(`FAQ button #${i + 1}: missing aria-expanded="false" (A3)`);
      const ctl = (btn.match(/aria-controls="([^"]+)"/) || [])[1];
      if (!ctl) failures.push(`FAQ button #${i + 1}: missing aria-controls (A3)`);
      else if (!new RegExp(`<div class="faq-answer" id="${ctl}"`).test(html)) {
        failures.push(`FAQ button #${i + 1}: aria-controls target #${ctl} not found (A3)`);
      }
    });
  }

  // M1: every async (media=print) CSS/font href appears inside a <noscript> fallback
  for (const rel of SRC_PAGES) {
    const html = read(`src/html/${rel}`);
    const asyncHrefs = [...html.matchAll(/<link href="([^"]+)" rel="stylesheet" media="print"/g)].map((m) => m[1]);
    if (asyncHrefs.length === 0) continue;
    const noscripts = [...html.matchAll(/<noscript>([\s\S]*?)<\/noscript>/g)].map((m) => m[1]).join(' ');
    for (const href of asyncHrefs) {
      if (!noscripts.includes(href)) failures.push(`src/html/${rel}: noscript missing fallback for ${href} (M1)`);
    }
  }

  // M4: no SearchAction anywhere (no server-side ?s= results page exists)
  for (const rel of SRC_PAGES) {
    if (/"@type"\s*:\s*"SearchAction"/.test(read(`src/html/${rel}`))) {
      failures.push(`src/html/${rel}: SearchAction JSON-LD present (M4)`);
    }
  }

  // M5: --gray must reach WCAG AA (>= 4.5:1) on #0a0a0a
  {
    const css = read('css/style.css');
    const hex = (css.match(/--gray:\s*(#[0-9a-fA-F]{6})/) || [])[1];
    assert.ok(hex, '--gray variable not found');
    const lum = (h) => {
      const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    const contrast = (lum(hex) + 0.05) / (lum('#0a0a0a') + 0.05);
    if (contrast < 4.5) failures.push(`--gray ${hex} contrast ${contrast.toFixed(2)}:1 < 4.5:1 (M5)`);
  }

  // B4: no single-item BreadcrumbList on the homepage
  if (/BreadcrumbList/.test(read('src/html/index.html'))) {
    failures.push('src/html/index.html: BreadcrumbList on home (B4)');
  }

  // B6: search inputs must declare type="search"
  {
    const html = read('src/html/index.html');
    for (const m of html.matchAll(/<input[^>]*id="searchInput(?:Mobile)?"[^>]*>/g)) {
      if (!/type="search"/.test(m[0])) failures.push(`search input missing type="search" (B6): ${m[0].slice(0, 80)}`);
    }
  }

  // B8: portfolio fonts use display=optional (consistent with index)
  {
    const html = read('src/html/portfolio.html');
    if (/fonts\.googleapis\.com\/css2[^"]*display=swap/.test(html)) {
      failures.push('src/html/portfolio.html: fonts use display=swap (B8)');
    }
  }

  // B9: budget radios wrapped in fieldset + legend
  {
    const html = read('src/html/preventivo.html');
    if (!/<fieldset class="form-group full-width budget-fieldset">\s*<legend>Budget indicativo<\/legend>/.test(html)) {
      failures.push('preventivo.html: budget radios not in fieldset/legend (B9)');
    }
  }

  // B1: feed avatars decorative (alt="") and lazy
  {
    const html = read('src/html/index.html');
    for (const m of html.matchAll(/<img[^>]*class="avatar-img"[^>]*>/g)) {
      if (!/alt=""/.test(m[0])) failures.push('avatar-img without alt="" (B1)');
      if (!/loading="lazy"/.test(m[0])) failures.push('avatar-img without loading="lazy" (B1)');
    }
  }

  // M2: portfolio nicole-inspired must use the async pattern
  {
    const html = read('src/html/portfolio.html');
    if (/<link href="css\/nicole-inspired\.min\.css[^"]*" rel="stylesheet">/.test(html)) {
      failures.push('portfolio.html: nicole-inspired render-blocking (M2)');
    }
  }

  // B3: known og:image URLs must carry width/height (checked on built+normalized root files)
  {
    const KNOWN = {
      'https://www.webnovis.com/Img/og-image-social-graph.jpeg': ['1600', '840'],
      'https://www.webnovis.com/Img/blog-cat-web.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-seo.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-marketing.png': ['800', '450'],
      'https://www.webnovis.com/Img/blog-cat-social.png': ['800', '450']
    };
    for (const rel of ['index.html', 'contatti.html', 'realizzazione-siti-web-arese.html']) {
      const html = read(rel);
      for (const [url, [w, h]] of Object.entries(KNOWN)) {
        if (!html.includes(url)) continue;
        if (!html.includes(`property="og:image:width" content="${w}"`) && !html.includes(`content="${w}" property="og:image:width"`)) {
          failures.push(`${rel}: missing og:image:width=${w} (B3)`);
        }
        if (!html.includes(`property="og:image:height" content="${h}"`) && !html.includes(`content="${h}" property="og:image:height"`)) {
          failures.push(`${rel}: missing og:image:height=${h} (B3)`);
        }
      }
    }
  }

  assert.deepEqual(failures, [], `audit regressions:\n${failures.join('\n')}`);
}

try {
  main();
  console.log('Audit SEO/a11y regression checks passed.');
} catch (error) {
  console.error('Audit SEO/a11y regression checks failed:', error.message);
  process.exit(1);
}
