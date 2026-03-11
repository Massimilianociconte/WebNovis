const assert = require('node:assert/strict');

const {
  articles,
  buildArticleHTML
} = require('../blog/build-articles');

function buildFooterHeadingRegex(label) {
  return new RegExp(`<strong[^>]*class="footer-heading"[^>]*>${label}<\\/strong>`);
}

function main() {
  const sampleArticle = articles[0];
  const html = buildArticleHTML(sampleArticle, sampleArticle.content, { skipFinalCta: true });

  assert.ok(!html.includes('height="auto"'), 'Blog article template must not emit height="auto" in footer badges');
  assert.ok(
    !html.includes('<strong class="footer-heading" role="heading" aria-level="3"></strong>'),
    'Blog article template must not emit empty footer headings'
  );
  assert.match(html, buildFooterHeadingRegex('Servizi'));
  assert.match(html, buildFooterHeadingRegex('Azienda'));
  assert.match(html, buildFooterHeadingRegex('Zone Servite'));
  assert.match(html, buildFooterHeadingRegex('Legale'));
  assert.ok(html.includes('class="footer-grid"'), 'Blog article footer should use the shared footer grid layout');
  assert.ok(html.includes('class="footer-badges"'), 'Blog article footer should render the shared footer badges row');
  assert.ok(html.includes('class="footer-social-icons"'), 'Blog article footer should expose the shared social icon cluster');
  assert.ok(
    html.includes('fetchpriority="low"') && html.includes('loading="lazy"'),
    'Footer badges should use low-priority lazy loading'
  );
}

try {
  main();
  console.log('Image/template regression checks passed.');
} catch (error) {
  console.error('Image/template regression checks failed:', error.message);
  process.exit(1);
}
