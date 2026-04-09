const fs = require('fs');
const path = require('path');

const SEARCH_INDEX_FILES = ['search-ai-index.json', 'search-index.json'];

const STOP_WORDS = new Set([
  'a', 'ad', 'ai', 'al', 'alla', 'allo', 'all', 'anche', 'che', 'chi', 'ci', 'con',
  'da', 'dal', 'dalla', 'dei', 'del', 'della', 'delle', 'di', 'e', 'ed', 'gli',
  'ha', 'i', 'il', 'in', 'la', 'le', 'lo', 'ma', 'mi', 'nel', 'nella', 'nelle',
  'non', 'o', 'per', 'piu', 'puo', 'se', 'si', 'sul', 'sulla', 'tra', 'un', 'una',
  'uno', 'webnovis', 'web', 'www'
]);

function normalizeWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeText(value) {
  return normalizeWhitespace(
    String(value || '')
      .toLowerCase()
      .replace(/\be[\s-]?commerce\b/g, 'ecommerce')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-/.]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
  );
}

function tokenize(value) {
  return [...new Set(
    normalizeText(value)
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))
  )];
}

function safeText(value, maxLength) {
  const text = normalizeWhitespace(value);
  if (!maxLength || text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const boundary = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf(' '));
  return (boundary > Math.floor(maxLength * 0.6) ? slice.slice(0, boundary) : slice).trim();
}

function normalizePath(value) {
  const raw = String(value || '/').split('#')[0].split('?')[0].trim();
  if (!raw) return '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
  return withSlash;
}

function inferIntent(queryNorm) {
  if (/(prezz|cost|preventiv|budget|quotazion|quanto costa)/.test(queryNorm)) return 'pricing';
  if (/(contatt|email|telefono|whatsapp|parlare|chiamare)/.test(queryNorm)) return 'contact';
  if (/(portfolio|progett|case study|lavori|esempi)/.test(queryNorm)) return 'portfolio';
  if (/(chi siamo|agenzia|team|azienda|storia)/.test(queryNorm)) return 'about';
  if (/(blog|guida|articolo|come fare|cos e|cose|differenza)/.test(queryNorm)) return 'informational';
  if (/(rho|milano|monza|bollate|arese|bresso|buccinasco|legnano|comune|zona|vicino)/.test(queryNorm)) return 'local';
  return 'general';
}

function sameSection(urlA, urlB) {
  const firstSegment = (value) => normalizePath(value).split('/').filter(Boolean)[0] || '';
  return firstSegment(urlA) && firstSegment(urlA) === firstSegment(urlB);
}

function loadCorpus(rootDir) {
  for (const fileName of SEARCH_INDEX_FILES) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(raw)) continue;

      return raw.map((doc) => {
        const title = safeText(doc.title, 160);
        const description = safeText(doc.description, 260);
        const content = safeText(doc.content, 900);
        const keywords = safeText(doc.keywords, 220);
        const headings = Array.isArray(doc.headings)
          ? doc.headings.map((item) => safeText(item, 120)).filter(Boolean).slice(0, 8)
          : [];
        const url = String(doc.url || '/').trim() || '/';
        const normalizedUrl = normalizePath(url);

        return {
          url,
          type: String(doc.type || 'page'),
          title,
          description,
          content,
          keywords,
          headings,
          indexable: doc.indexable !== false,
          _urlNorm: normalizeText(normalizedUrl.replace(/[/.]+/g, ' ')),
          _titleNorm: normalizeText(title),
          _descriptionNorm: normalizeText(description),
          _contentNorm: normalizeText(content),
          _headingNorm: normalizeText(headings.join(' ')),
          _urlTokens: new Set(tokenize(normalizedUrl.replace(/[/.]+/g, ' '))),
          _titleTokens: new Set(tokenize(title)),
          _descriptionTokens: new Set(tokenize(description)),
          _headingTokens: new Set(tokenize(headings.join(' '))),
          _keywordTokens: new Set(tokenize(keywords))
        };
      });
    } catch (_) {
      // Try the next file.
    }
  }

  return [];
}

function toSuggestion(doc, topScore) {
  const safeTop = Math.max(topScore || doc.score || 1, 1);
  return {
    title: safeText(doc.title, 100),
    url: doc.url,
    relevance: Math.max(0.25, Math.min(0.99, (doc.score || 0) / safeTop))
  };
}

function buildRelatedQueries(query, docs) {
  const normalizedQuery = normalizeText(query);
  const seen = new Set();
  const related = [];

  docs.slice(0, 5).forEach((doc) => {
    const clean = safeText(doc.title, 72)
      .replace(/\s*[|].*$/, '')
      .replace(/\s*[—-]\s*Web\s*Novis.*$/i, '')
      .trim();
    if (!clean) return;

    const key = normalizeText(clean);
    if (!key || key === normalizedQuery || seen.has(key)) return;
    seen.add(key);
    related.push(clean);
  });

  return related.slice(0, 4);
}

function scoreDocument(doc, queryNorm, queryTokens, intent, currentPage) {
  let score = 0;

  if (!queryNorm) return 0;

  if (doc._titleNorm.includes(queryNorm)) score += 22;
  if (doc._urlNorm.includes(queryNorm)) score += 24;
  if (doc._descriptionNorm.includes(queryNorm)) score += 12;
  if (doc._headingNorm.includes(queryNorm)) score += 10;
  if (doc._contentNorm.includes(queryNorm)) score += 6;

  queryTokens.forEach((token) => {
    if (doc._titleTokens.has(token)) score += 7;
    if (doc._urlTokens.has(token)) score += 6;
    if (doc._keywordTokens.has(token)) score += 5;
    if (doc._headingTokens.has(token)) score += 4;
    if (doc._descriptionTokens.has(token)) score += 3;
    if (doc._contentNorm.includes(token)) score += 1;
  });

  if (intent === 'pricing' && /(quanto costa|prezzo|costo|budget|preventiv)/.test(`${doc._titleNorm} ${doc._descriptionNorm}`)) {
    score += 9;
  }
  if (intent === 'contact' && doc.url === '/contatti.html') score += 14;
  if (intent === 'portfolio' && (doc.type === 'portfolio' || doc.url === '/portfolio.html')) score += 10;
  if (intent === 'about' && doc.url === '/chi-siamo.html') score += 10;
  if (intent === 'informational' && (doc.type === 'articolo' || doc.url === '/blog/')) score += 6;
  if (intent === 'local' && doc.type === 'locale') score += 8;

  if (currentPage && sameSection(doc.url, currentPage)) score += 2;
  if (doc.type === 'servizio' || doc.type === 'locale') score += 1;
  if (doc.indexable === false) score *= 0.45;

  return score;
}

function createSearchAiEngine({ rootDir }) {
  const corpus = loadCorpus(rootDir);
  const indexableUrlMap = new Map(
    corpus
      .filter((doc) => doc.indexable !== false)
      .map((doc) => [normalizePath(doc.url), doc.url])
  );
  const indexableUrlSet = new Set(indexableUrlMap.values());

  function search(query, currentPage, limit = 8) {
    const queryNorm = normalizeText(query);
    const queryTokens = tokenize(query);
    const intent = inferIntent(queryNorm);

    const ranked = corpus
      .map((doc) => ({
        ...doc,
        score: scoreDocument(doc, queryNorm, queryTokens, intent, currentPage)
      }))
      .filter((doc) => doc.score > 0)
      .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));

    if (!ranked.length) return [];

    const topScore = ranked[0].score;
    return ranked.slice(0, limit).map((doc) => ({
      ...doc,
      relevance: Math.max(0.25, Math.min(0.99, doc.score / Math.max(topScore, 1)))
    }));
  }

  function buildPrompt(query, currentPage, retrievedDocs) {
    const safeDocs = retrievedDocs.filter((doc) => doc.indexable !== false).slice(0, 6);
    const docsForPrompt = safeDocs.length ? safeDocs : retrievedDocs.slice(0, 4);

    const contextBlock = docsForPrompt.map((doc, index) => {
      const headingLine = doc.headings && doc.headings.length
        ? `Headings: ${doc.headings.slice(0, 3).join(' | ')}`
        : '';
      return [
        `${index + 1}. ${doc.title}`,
        `URL: ${doc.url}`,
        `Tipo: ${doc.type}`,
        `Descrizione: ${doc.description || 'n/d'}`,
        headingLine,
        `Snippet: ${safeText(doc.content, 280)}`
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    const systemInstruction = [
      "Sei l'assistente di ricerca del sito WebNovis (https://www.webnovis.com).",
      "Rispondi SOLO con JSON valido.",
      'Formato obbligatorio:',
      '{"answer":"Risposta completa in 2-4 frasi max 520 caratteri con link inline [testo](url)","suggestedPages":[{"title":"Titolo","url":"/percorso.html","relevance":0.95}],"relatedQueries":["correlata 1","correlata 2"]}',
      'Usa SOLO URL presenti nel contesto fornito.',
      'Non inventare pagine, prezzi, citta, servizi o policy non presenti nel contesto.',
      'Quando la query e commerciale, privilegia pagine servizio/locali pertinenti prima di homepage o blog.',
      'Se la query e informativa, privilegia guide o articoli gia presenti nel contesto.',
      'Nessun testo fuori dal JSON.'
    ].join('\n');

    const userPrompt = [
      `Query utente: "${safeText(query, 300)}"`,
      `Pagina corrente: ${normalizePath(currentPage || '/')}`,
      '',
      'Contesto indicizzato rilevante:',
      contextBlock || 'Nessun contesto specifico disponibile.'
    ].join('\n');

    return { systemInstruction, userPrompt };
  }

  function buildFallbackResponse(query, retrievedDocs) {
    const relevantDocs = retrievedDocs
      .filter((doc) => doc.indexable !== false)
      .slice(0, 3);

    if (!relevantDocs.length) {
      return { answer: '', suggestedPages: [], relatedQueries: [] };
    }

    const intent = inferIntent(normalizeText(query));
    const topScore = relevantDocs[0].score || 1;
    const suggestions = relevantDocs.map((doc) => toSuggestion(doc, topScore));
    const primary = suggestions[0];
    const secondary = suggestions[1];

    let answer = '';

    if (intent === 'contact') {
      answer = 'Per contattare WebNovis ti conviene aprire [Contatti](/contatti.html) e, se vuoi arrivare gia con le informazioni giuste, [Preventivo](/preventivo.html).';
    } else if (intent === 'portfolio') {
      answer = secondary
        ? `Per vedere esempi concreti parti da [${primary.title}](${primary.url}) e poi apri [${secondary.title}](${secondary.url}).`
        : `La pagina piu pertinente per vedere esempi e [${primary.title}](${primary.url}).`;
    } else if (intent === 'pricing') {
      answer = secondary
        ? `Per costi, range e preventivi ti conviene partire da [${primary.title}](${primary.url}) e [${secondary.title}](${secondary.url}).`
        : `Per costi e preventivi la pagina piu utile e [${primary.title}](${primary.url}).`;
    } else if (intent === 'local') {
      answer = secondary
        ? `Per una risposta affidabile sulla tua zona, inizia da [${primary.title}](${primary.url}) e poi guarda [${secondary.title}](${secondary.url}).`
        : `La pagina locale piu pertinente e [${primary.title}](${primary.url}).`;
    } else {
      answer = secondary
        ? `Ho trovato due pagine molto pertinenti: [${primary.title}](${primary.url}) e [${secondary.title}](${secondary.url}).`
        : `La pagina piu pertinente e [${primary.title}](${primary.url}).`;
    }

    return {
      answer,
      suggestedPages: suggestions,
      relatedQueries: buildRelatedQueries(query, relevantDocs)
    };
  }

  function sanitizeResult(result, retrievedDocs, query) {
    const fallback = buildFallbackResponse(query, retrievedDocs);
    const allowedUrlMap = new Map(
      (retrievedDocs.length ? retrievedDocs : corpus)
        .filter((doc) => doc.indexable !== false)
        .map((doc) => [normalizePath(doc.url), doc.url])
    );

    const dedupUrls = new Set();
    const suggestedPages = (Array.isArray(result.suggestedPages) ? result.suggestedPages : [])
      .map((page) => ({
        title: safeText(page.title, 100),
        url: normalizePath(page.url || '/'),
        relevance: Math.min(0.99, Math.max(0, parseFloat(page.relevance) || 0))
      }))
      .filter((page) => allowedUrlMap.has(page.url) && !dedupUrls.has(page.url))
      .map((page) => ({
        ...page,
        url: allowedUrlMap.get(page.url) || indexableUrlMap.get(page.url) || page.url
      }))
      .filter((page) => {
        dedupUrls.add(page.url);
        return true;
      })
      .slice(0, 5);

    const answer = safeText(result.answer, 600) || fallback.answer;
    const relatedQueries = [...new Set(
      (Array.isArray(result.relatedQueries) ? result.relatedQueries : [])
        .map((item) => safeText(item, 80))
        .filter(Boolean)
    )].slice(0, 4);

    return {
      answer,
      suggestedPages: suggestedPages.length ? suggestedPages : fallback.suggestedPages,
      relatedQueries: relatedQueries.length ? relatedQueries : fallback.relatedQueries
    };
  }

  function buildChatGroundingContext(query, currentPage) {
    const retrievedDocs = search(query, currentPage, 3).filter((doc) => doc.indexable !== false).slice(0, 3);
    if (!retrievedDocs.length) return '';

    return retrievedDocs.map((doc, index) => [
      `${index + 1}. ${doc.title}`,
      `URL: ${doc.url}`,
      `Tipo: ${doc.type}`,
      `Descrizione: ${safeText(doc.description || doc.content, 180)}`
    ].join('\n')).join('\n\n');
  }

  function getCacheKey(normalizedQuery, currentPage) {
    return `${normalizeWhitespace(normalizedQuery)}::${normalizePath(currentPage || '/')}`;
  }

  return {
    corpusSize: corpus.length,
    indexableUrlSet,
    search,
    buildPrompt,
    buildFallbackResponse,
    sanitizeResult,
    buildChatGroundingContext,
    getCacheKey
  };
}

module.exports = {
  createSearchAiEngine,
  normalizePath,
  normalizeText
};
