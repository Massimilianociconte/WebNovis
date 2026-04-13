const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports', 'seo');
const REPORT_JSON = path.join(REPORT_DIR, 'geo-duplicate-report.json');
const REPORT_MD = path.join(REPORT_DIR, 'geo-duplicate-report.md');

const FAMILY_PATTERNS = [
  { family: 'agenzia-web', regex: /^agenzia-web-(.+)\.html$/ },
  { family: 'realizzazione-siti-web', regex: /^realizzazione-siti-web-(.+)\.html$/ },
  { family: 'consulenze', regex: /^consulenze-(.+)\.html$/ },
  { family: 'consulenza-digitale', regex: /^consulenza-digitale-(.+)\.html$/ },
  { family: 'manutenzione-sito', regex: /^manutenzione-sito-(.+)\.html$/ },
  { family: 'copywriting', regex: /^copywriting-(.+)\.html$/ },
  { family: 'seo-locale', regex: /^seo-locale-(.+)\.html$/ },
  { family: 'social-media', regex: /^social-media-(.+)\.html$/ },
  { family: 'restyling-sito-web', regex: /^restyling-sito-web-(.+)\.html$/ },
  { family: 'landing-page', regex: /^landing-page-(.+)\.html$/ },
  { family: 'sito-vetrina', regex: /^sito-vetrina-(.+)\.html$/ },
  { family: 'ecommerce', regex: /^ecommerce-(.+)\.html$/ },
  { family: 'web-app', regex: /^web-app-(.+)\.html$/ },
  { family: 'sviluppo-app-mobile', regex: /^sviluppo-app-mobile-(.+)\.html$/ },
  { family: 'email-marketing', regex: /^email-marketing-(.+)\.html$/ },
  { family: 'google-ads', regex: /^google-ads-(.+)\.html$/ },
  { family: 'graphic-design', regex: /^graphic-design-(.+)\.html$/ },
  { family: 'fotografia-aziendale', regex: /^fotografia-aziendale-(.+)\.html$/ },
  { family: 'automazione-business', regex: /^automazione-business-(.+)\.html$/ },
  { family: 'accessibilita', regex: /^accessibilita-(.+)\.html$/ }
];

function inferFamily(file) {
  for (const pattern of FAMILY_PATTERNS) {
    const match = file.match(pattern.regex);
    if (match) {
      return { family: pattern.family, citySlug: match[1] };
    }
  }
  return null;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMainText(html) {
  const mainMatch = String(html || '').match(/<main[\s\S]*?<\/main>/i);
  return stripHtml(mainMatch ? mainMatch[0] : html);
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[“”"'`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildNgramVector(text, size = 3) {
  const tokens = normalizeText(text).split(' ').filter(Boolean);
  const vector = new Map();
  for (let i = 0; i <= tokens.length - size; i += 1) {
    const gram = tokens.slice(i, i + size).join(' ');
    vector.set(gram, (vector.get(gram) || 0) + 1);
  }
  return vector;
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const value of vecA.values()) magA += value * value;
  for (const value of vecB.values()) magB += value * value;
  for (const [term, valueA] of vecA.entries()) {
    const valueB = vecB.get(term);
    if (valueB) dot += valueA * valueB;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function getSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 80);
}

function collectGeoPages() {
  return fs.readdirSync(ROOT)
    .filter((file) => file.endsWith('.html'))
    .map((file) => {
      const meta = inferFamily(file);
      if (!meta) return null;
      const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
      const mainText = extractMainText(html);
      return {
        file,
        family: meta.family,
        citySlug: meta.citySlug,
        wordCount: mainText.split(/\s+/).filter(Boolean).length,
        text: mainText,
        vector: buildNgramVector(mainText),
        sentences: getSentences(mainText)
      };
    })
    .filter(Boolean);
}

function buildPairwiseSimilarities(pages) {
  const allPairs = [];
  const sameCityPairs = [];
  const sameFamilyPairs = [];

  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      const a = pages[i];
      const b = pages[j];
      const similarity = cosineSimilarity(a.vector, b.vector);
      const pair = {
        a: a.file,
        b: b.file,
        cityRelationship: a.citySlug === b.citySlug ? 'same-city' : 'different-city',
        familyRelationship: a.family === b.family ? 'same-family' : 'cross-family',
        similarity: Number(similarity.toFixed(4))
      };

      allPairs.push(pair);
      if (pair.cityRelationship === 'same-city') sameCityPairs.push(pair);
      if (pair.familyRelationship === 'same-family') sameFamilyPairs.push(pair);
    }
  }

  const sortBySimilarity = (left, right) => right.similarity - left.similarity;
  allPairs.sort(sortBySimilarity);
  sameCityPairs.sort(sortBySimilarity);
  sameFamilyPairs.sort(sortBySimilarity);

  return {
    topOverall: allPairs.slice(0, 50),
    topSameCity: sameCityPairs.slice(0, 50),
    topSameFamily: sameFamilyPairs.slice(0, 50)
  };
}

function buildRepeatedSentenceReport(pages) {
  const sentenceIndex = new Map();

  for (const page of pages) {
    for (const sentence of new Set(page.sentences)) {
      const normalized = normalizeText(sentence);
      if (!normalized) continue;
      if (!sentenceIndex.has(normalized)) {
        sentenceIndex.set(normalized, { sentence, files: [] });
      }
      sentenceIndex.get(normalized).files.push(page.file);
    }
  }

  return [...sentenceIndex.values()]
    .filter((entry) => entry.files.length >= 5)
    .map((entry) => ({
      sentence: entry.sentence,
      count: entry.files.length,
      files: entry.files.sort()
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 50);
}

function groupByFamily(pages) {
  const byFamily = new Map();
  for (const page of pages) {
    if (!byFamily.has(page.family)) byFamily.set(page.family, []);
    byFamily.get(page.family).push(page);
  }

  return [...byFamily.entries()]
    .map(([family, familyPages]) => ({
      family,
      pages: familyPages.length,
      avgWords: Math.round(
        familyPages.reduce((sum, page) => sum + page.wordCount, 0) / familyPages.length
      )
    }))
    .sort((left, right) => right.pages - left.pages);
}

function toMarkdown(report) {
  const lines = [];
  lines.push('# Geo Duplicate Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Corpus');
  lines.push('');
  lines.push(`- Pages analyzed: ${report.summary.totalPages}`);
  lines.push(`- Families analyzed: ${report.summary.totalFamilies}`);
  lines.push('');
  lines.push('## Families');
  lines.push('');
  for (const family of report.families) {
    lines.push(`- ${family.family}: ${family.pages} pages, avg ${family.avgWords} words`);
  }
  lines.push('');
  lines.push('## Top Same-City Similarities');
  lines.push('');
  for (const pair of report.similarity.topSameCity.slice(0, 15)) {
    lines.push(`- ${pair.similarity}: ${pair.a} <-> ${pair.b}`);
  }
  lines.push('');
  lines.push('## Top Same-Family Similarities');
  lines.push('');
  for (const pair of report.similarity.topSameFamily.slice(0, 15)) {
    lines.push(`- ${pair.similarity}: ${pair.a} <-> ${pair.b}`);
  }
  lines.push('');
  lines.push('## Repeated Blocks (Sentence-Level)');
  lines.push('');
  for (const entry of report.repeatedSentences.slice(0, 10)) {
    lines.push(`- ${entry.count} pages: ${entry.sentence}`);
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  const pages = collectGeoPages();
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalPages: pages.length,
      totalFamilies: new Set(pages.map((page) => page.family)).size
    },
    families: groupByFamily(pages),
    similarity: buildPairwiseSimilarities(pages),
    repeatedSentences: buildRepeatedSentenceReport(pages)
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(REPORT_MD, toMarkdown(report), 'utf8');

  console.log(`Geo duplicate report written to ${path.relative(ROOT, REPORT_JSON)}`);
  console.log(`Markdown summary written to ${path.relative(ROOT, REPORT_MD)}`);
  console.log(`Pages analyzed: ${report.summary.totalPages}`);
  console.log(`Top same-city similarity: ${report.similarity.topSameCity[0]?.similarity ?? 'n/a'}`);
}

main();
