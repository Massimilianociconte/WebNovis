function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function hasKeyword(value, keywords) {
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(keyword));
}

function isWhitelistedNoLoadingImage(image = {}) {
  const src = normalizeText(image.src);
  const className = normalizeText(image.className);
  const alt = normalizeText(image.alt);

  if (!src) return false;

  if (hasKeyword(className, ['logo-image', 'hero-image', 'featured-image', 'lcp'])) {
    return true;
  }

  if (hasKeyword(alt, ['logo', 'hero'])) {
    return true;
  }

  if (hasKeyword(src, ['logo', 'hero', 'cover'])) {
    return true;
  }

  return false;
}

function extractAttribute(attributes, name) {
  const match = attributes.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function normalizeImageLoadingInHtml(html) {
  return html.replace(/<img\b([^>]*)>/gi, (fullMatch, attributes) => {
    if (/\bloading=/i.test(attributes)) return fullMatch;

    const image = {
      src: extractAttribute(attributes, 'src'),
      className: extractAttribute(attributes, 'class'),
      alt: extractAttribute(attributes, 'alt')
    };

    if (isWhitelistedNoLoadingImage(image)) {
      return fullMatch;
    }

    return `<img${attributes} loading="lazy">`;
  });
}

module.exports = {
  isWhitelistedNoLoadingImage,
  normalizeImageLoadingInHtml
};