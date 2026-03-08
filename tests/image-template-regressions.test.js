const assert = require('node:assert/strict');

const {
  articles,
  buildArticleHTML
} = require('../blog/build-articles');

function main() {
  const sampleArticle = articles[0];
  const html = buildArticleHTML(sampleArticle, sampleArticle.content, { skipFinalCta: true });

  assert.ok(!html.includes('height="auto"'), 'Blog article template must not emit height="auto" in footer badges');
  assert.ok(
    !html.includes('<strong class="footer-heading" role="heading" aria-level="3"></strong>'),
    'Blog article template must not emit empty footer headings'
  );
  assert.match(html, /<strong class="footer-heading" role="heading" aria-level="3">Servizi<\/strong>/);
  assert.match(html, /<strong class="footer-heading" role="heading" aria-level="3">Azienda<\/strong>/);
  assert.match(html, /<strong class="footer-heading" role="heading" aria-level="3">Legale<\/strong>/);
  assert.match(html, /<strong class="footer-heading" role="heading" aria-level="3">Social<\/strong>/);
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
