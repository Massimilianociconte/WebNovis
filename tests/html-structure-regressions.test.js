const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('parse5');

const ROOT = path.resolve(__dirname, '..');
const { applySeoHtmlTransforms } = require('../config/seo-html-transforms');
const { collectExpectedPublicHtml } = require('../scripts/public-artifact');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function visit(node, callback, ancestors = []) {
  if (node && node.tagName) callback(node, ancestors);
  for (const child of node.childNodes || []) {
    visit(child, callback, node && node.tagName ? [...ancestors, node] : ancestors);
  }
}

function getAttribute(node, name) {
  return (node.attrs || []).find((attribute) => attribute.name === name)?.value || '';
}

function findElements(root, predicate) {
  const matches = [];
  visit(root, (node, ancestors) => {
    if (predicate(node, ancestors)) matches.push(node);
  });
  return matches;
}

function hasClass(node, className) {
  return getAttribute(node, 'class').split(/\s+/).includes(className);
}

function auditPublicHtml() {
  const failures = [];
  const files = collectExpectedPublicHtml(ROOT);

  assert.equal(files.length, 1148, 'the complete public HTML inventory must remain explicit');

  for (const relativePath of files) {
    const html = readText(relativePath);
    const document = parse(html.replace(/^\uFEFF/, ''), { sourceCodeLocationInfo: true });
    const doctypes = (document.childNodes || []).filter((node) => node.nodeName === '#documentType');
    const htmlElements = (document.childNodes || []).filter((node) => node.tagName === 'html');
    const headElements = findElements(document, (node) => node.tagName === 'head');
    const bodyElements = findElements(document, (node) => node.tagName === 'body');

    if (!/^\uFEFF?\s*<!doctype html>/i.test(html)) failures.push(`${relativePath}: missing leading HTML doctype`);
    if (doctypes.length !== 1) failures.push(`${relativePath}: expected one parsed doctype, got ${doctypes.length}`);
    if (htmlElements.length !== 1) failures.push(`${relativePath}: expected one html element, got ${htmlElements.length}`);
    if (headElements.length !== 1) failures.push(`${relativePath}: expected one head element, got ${headElements.length}`);
    if (bodyElements.length !== 1) failures.push(`${relativePath}: expected one body element, got ${bodyElements.length}`);
    if (headElements.length !== 1 || bodyElements.length !== 1) continue;

    const head = headElements[0];
    const requiredHeadElements = [
      ['title', (node) => node.tagName === 'title'],
      ['viewport', (node) => node.tagName === 'meta' && getAttribute(node, 'name').toLowerCase() === 'viewport'],
      ['description', (node) => node.tagName === 'meta' && getAttribute(node, 'name').toLowerCase() === 'description'],
      ['robots', (node) => node.tagName === 'meta' && getAttribute(node, 'name').toLowerCase() === 'robots'],
      ['canonical', (node) => node.tagName === 'link' && getAttribute(node, 'rel').toLowerCase() === 'canonical']
    ];
    for (const [label, predicate] of requiredHeadElements) {
      const count = findElements(head, predicate).length;
      if (count !== 1) failures.push(`${relativePath}: expected one ${label} in head, got ${count}`);
    }

    const robots = findElements(
      head,
      (node) => node.tagName === 'meta' && getAttribute(node, 'name').toLowerCase() === 'robots'
    );
    const isIndexable = robots.length === 1 && !/\bnoindex\b/i.test(getAttribute(robots[0], 'content'));
    const hreflangLinks = findElements(head, (node) =>
      node.tagName === 'link' && Boolean(getAttribute(node, 'hreflang'))
    );
    if (isIndexable) {
      if (hreflangLinks.length !== 1) {
        failures.push(`${relativePath}: indexable page must have exactly one hreflang, got ${hreflangLinks.length}`);
      } else {
        if (getAttribute(hreflangLinks[0], 'hreflang') !== 'it-IT') {
          failures.push(`${relativePath}: hreflang must be it-IT`);
        }
        const canonical = findElements(
          head,
          (node) => node.tagName === 'link' && getAttribute(node, 'rel').toLowerCase() === 'canonical'
        );
        if (canonical.length === 1 && getAttribute(hreflangLinks[0], 'href') !== getAttribute(canonical[0], 'href')) {
          failures.push(`${relativePath}: hreflang must match the declared canonical`);
        }
      }
    } else if (hreflangLinks.length !== 0) {
      failures.push(`${relativePath}: noindex page must not expose hreflang`);
    }

    const allElements = findElements(document, () => true);
    const skipLinks = allElements.filter((node) => node.tagName === 'a' && hasClass(node, 'skip-link'));
    for (const skipLink of skipLinks) {
      const href = getAttribute(skipLink, 'href');
      if (!href.startsWith('#') || href.length === 1) {
        failures.push(`${relativePath}: skip link must use a local fragment target`);
        continue;
      }
      const targetId = decodeURIComponent(href.slice(1));
      const targets = allElements.filter((node) => getAttribute(node, 'id') === targetId);
      if (targets.length !== 1) {
        failures.push(`${relativePath}: skip target #${targetId} count is ${targets.length}, expected 1`);
      }
    }

    const once = applySeoHtmlTransforms(html, relativePath);
    const twice = applySeoHtmlTransforms(once, relativePath);
    if (twice !== once) failures.push(`${relativePath}: global HTML transform is not idempotent`);
  }

  assert.deepEqual(failures, [], `public HTML structural failures:\n${failures.slice(0, 80).join('\n')}`);
}

function assertAuthoritativeLandmarksAndHeadings() {
  const portfolio = parse(readText('src/html/portfolio.html'));
  const portfolioMain = findElements(portfolio, (node) => node.tagName === 'main');
  assert.equal(portfolioMain.length, 1, 'portfolio source must have exactly one main landmark');
  assert.equal(getAttribute(portfolioMain[0], 'id'), 'main-content', 'portfolio main must be the skip target');

  const contacts = parse(readText('src/html/contatti.html'));
  const contactCardHeads = findElements(contacts, (node, ancestors) =>
    node.tagName === 'h2' && ancestors.some((ancestor) => hasClass(ancestor, 'contatti-card-head'))
  );
  const contactCardH3 = findElements(contacts, (node, ancestors) =>
    node.tagName === 'h3' && ancestors.some((ancestor) => hasClass(ancestor, 'contatti-card-head'))
  );
  assert.equal(contactCardHeads.length, 4, 'contact information cards must continue H1 with H2 headings');
  assert.equal(contactCardH3.length, 0, 'contact information cards must not jump from H1 to H3');
}

auditPublicHtml();
assertAuthoritativeLandmarksAndHeadings();
console.log('HTML structure, hreflang, landmark and skip-link regressions passed.');
