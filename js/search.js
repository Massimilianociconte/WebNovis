/**
 * WebNovis Intelligent Search System
 * - Fuse.js fuzzy local search (< 50ms, debounce 150ms)
 * - Smart answer synthesis grounded on the local site index
 * - Optional remote AI enrichment via server proxy (< 2s)
 * - Keyboard accessible (Tab, Enter, Esc, arrows, Ctrl+K)
 * - Progressive enhancement (local first, AI enrichment)
 * - API key NEVER in frontend — AI calls proxied through /api/search-ai
 */
(function () {
  'use strict';

  // ─── Config ──────────────────────────────────────────────────────────────────
  var IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  var DEBOUNCE_MS = 150;
  var MIN_QUERY_LEN = 2;
  var AI_WORD_THRESHOLD = 5;
  var AI_CHAR_THRESHOLD = 26;
  var STRONG_LOCAL_SCORE_THRESHOLD = 0.12;
  var WEAK_LOCAL_SCORE_THRESHOLD = 0.23;
  var MAX_LOCAL_RESULTS = 8;
  var ENABLE_REMOTE_AI = window.WEBNOVIS_ENABLE_REMOTE_SEARCH_AI === true || IS_LOCAL;
  var SEARCH_API_BASE = window.WEBNOVIS_SEARCH_API_BASE || (IS_LOCAL ? 'http://localhost:3000' : 'https://webnovis-chat.onrender.com');
  var AI_ENDPOINT = SEARCH_API_BASE + '/api/search-ai';
  var FUSE_CDN = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';
  var LOCAL_AI_STOP_WORDS = {
    a: true, ad: true, ai: true, al: true, alla: true, allo: true, all: true, anche: true, che: true, chi: true,
    ci: true, con: true, da: true, dal: true, dalla: true, dei: true, del: true, della: true, delle: true,
    di: true, e: true, ed: true, gli: true, ha: true, i: true, il: true, in: true, la: true, le: true,
    lo: true, ma: true, mi: true, nel: true, nella: true, nelle: true, non: true, o: true, per: true,
    piu: true, puo: true, se: true, si: true, sul: true, sulla: true, tra: true, un: true, una: true,
    uno: true, webnovis: true, web: true, www: true
  };

  // ─── State ───────────────────────────────────────────────────────────────────
  var searchIndex = null;
  var semanticIndex = null;
  var fuse = null;
  var fuseReady = false;
  var selectedIdx = -1;
  var debounceTimer = null;
  var aiAbort = null;
  var aiDisabledUntil = 0;

  // ─── DOM cache (lazy) ────────────────────────────────────────────────────────
  var el = {};
  var elM = {}; // mobile modal elements

  function getEl() {
    if (el.wrapper) return el;
    el = {
      wrapper: document.getElementById('searchWrapper'),
      bar: document.getElementById('searchBar'),
      input: document.getElementById('searchInput'),
      results: document.getElementById('searchResults'),
      clear: document.getElementById('searchClear'),
      overlay: document.getElementById('searchOverlay'),
      mobileBtn: document.getElementById('searchMobileToggle')
    };
    return el;
  }

  function getElM() {
    if (elM.modal) return elM;
    elM = {
      modal: document.getElementById('searchModal'),
      bar: document.getElementById('searchBarMobile'),
      input: document.getElementById('searchInputMobile'),
      results: document.getElementById('searchResultsMobile'),
      clear: document.getElementById('searchClearMobile'),
      closeBtn: document.getElementById('searchModalClose'),
      overlay: document.getElementById('searchOverlay'),
      mobileBtn: document.getElementById('searchMobileToggle')
    };
    return elM;
  }

  // ─── Utility ─────────────────────────────────────────────────────────────────
  function debounce(fn, ms) {
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function escHTML(s) {
    if (!s) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderAiAnswer(text) {
    if (!text) return '';
    function formatInline(line) {
      return escHTML(line)
        .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="search-ai-link">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    var normalized = String(text)
      .replace(/\r\n?/g, '\n')
      .replace(/([1-9])️⃣/g, '$1. ')
      .trim();

    if (!normalized) return '';

    var blocks = normalized
      .split(/\n{2,}/)
      .map(function (block) { return block.trim(); })
      .filter(Boolean);

    return blocks.map(function (block) {
      var lines = block
        .split('\n')
        .map(function (line) { return line.trim(); })
        .filter(Boolean);

      if (!lines.length) return '';

      var ordered = lines.every(function (line) { return /^\d+\.\s+/.test(line); });
      var unordered = lines.every(function (line) { return /^(?:[-*•])\s+/.test(line); });

      if (ordered || unordered) {
        var tag = ordered ? 'ol' : 'ul';
        var pattern = ordered ? /^\d+\.\s+/ : /^(?:[-*•])\s+/;
        var items = lines.map(function (line) {
          return '<li>' + formatInline(line.replace(pattern, '')) + '</li>';
        }).join('');
        return '<' + tag + ' class="search-ai-list">' + items + '</' + tag + '>';
      }

      return '<p>' + lines.map(formatInline).join('<br>') + '</p>';
    }).join('');
  }

  function highlight(text, query) {
    if (!text || !query) return escHTML(text || '');
    var safe = escHTML(text);
    var words = query.trim().split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!words.length) return safe;
    var pattern = words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
    return safe.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
  }

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\be[\s-]?commerce\b/g, 'ecommerce')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-/.]+/g, ' ')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenize(value) {
    return normalizeText(value)
      .split(/\s+/)
      .filter(function (token) {
        return token.length >= 3 && !LOCAL_AI_STOP_WORDS[token];
      })
      .filter(function (token, index, arr) {
        return arr.indexOf(token) === index;
      });
  }

  function safeText(text, maxLength) {
    var clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!maxLength || clean.length <= maxLength) return clean;
    var slice = clean.slice(0, maxLength);
    var boundary = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf(' '));
    return (boundary > Math.floor(maxLength * 0.6) ? slice.slice(0, boundary) : slice).trim();
  }

  function normalizePath(value) {
    var raw = String(value || '/').split('#')[0].split('?')[0].trim();
    if (!raw) return '/';
    var withSlash = raw.charAt(0) === '/' ? raw : '/' + raw;
    if (withSlash.length > 1 && withSlash.charAt(withSlash.length - 1) === '/') {
      return withSlash.slice(0, -1);
    }
    return withSlash;
  }

  function inferIntent(query) {
    var queryNorm = normalizeText(query);
    if (/(prezz|cost|preventiv|budget|quotazion|quanto costa)/.test(queryNorm)) return 'pricing';
    if (/(contatt|email|telefono|whatsapp|parlare|chiamare)/.test(queryNorm)) return 'contact';
    if (/(portfolio|progett|case study|lavori|esempi)/.test(queryNorm)) return 'portfolio';
    if (/(chi siamo|agenzia|team|azienda|storia)/.test(queryNorm)) return 'about';
    if (/(blog|guida|articolo|come fare|cos e|cose|differenza)/.test(queryNorm)) return 'informational';
    if (/(rho|milano|monza|bollate|arese|bresso|buccinasco|legnano|comune|zona|vicino)/.test(queryNorm)) return 'local';
    return 'general';
  }

  function stripSiteSuffix(title) {
    return safeText(title, 90)
      .replace(/\s*[|].*$/, '')
      .replace(/\s*[—-]\s*Web\s*Novis.*$/i, '')
      .trim();
  }

  function toLocalSuggestion(item) {
    if (typeof item.relevance === 'number') {
      return {
        title: safeText(item.title, 100),
        url: item.url,
        relevance: Math.max(0.35, Math.min(0.99, item.relevance))
      };
    }
    var score = typeof item.score === 'number' ? item.score : 0.22;
    return {
      title: safeText(item.title, 100),
      url: item.url,
      relevance: Math.max(0.35, Math.min(0.99, 1 - score))
    };
  }

  function buildRelatedQueries(query, docs) {
    var queryNorm = normalizeText(query);
    var seen = {};
    var related = [];

    docs.slice(0, 5).forEach(function (doc) {
      var clean = stripSiteSuffix(doc.title);
      var key = normalizeText(clean);
      if (!clean || !key || key === queryNorm || seen[key]) return;
      seen[key] = true;
      related.push(clean);
    });

    return related.slice(0, 4);
  }

  function sameSection(urlA, urlB) {
    function firstSegment(value) {
      return normalizePath(value).split('/').filter(Boolean)[0] || '';
    }
    return firstSegment(urlA) && firstSegment(urlA) === firstSegment(urlB);
  }

  function buildSemanticIndex() {
    if (semanticIndex) return semanticIndex;
    semanticIndex = (searchIndex || []).map(function (doc) {
      var url = String(doc.url || '/').trim() || '/';
      var headings = Array.isArray(doc.headings) ? doc.headings.slice(0, 8) : [];
      return {
        id: doc.id,
        url: url,
        type: String(doc.type || 'page'),
        title: safeText(doc.title, 160),
        description: safeText(doc.description, 260),
        keywords: safeText(doc.keywords, 220),
        headings: headings,
        content: safeText(doc.content, 900),
        indexable: doc.indexable !== false,
        _urlNorm: normalizeText(url.replace(/[/.]+/g, ' ')),
        _titleNorm: normalizeText(doc.title),
        _descriptionNorm: normalizeText(doc.description),
        _headingsNorm: normalizeText(headings.join(' ')),
        _contentNorm: normalizeText(doc.content),
        _urlTokens: tokenize(url.replace(/[/.]+/g, ' ')),
        _titleTokens: tokenize(doc.title),
        _descriptionTokens: tokenize(doc.description),
        _keywordTokens: tokenize(doc.keywords),
        _headingTokens: tokenize(headings.join(' '))
      };
    });
    return semanticIndex;
  }

  function hasToken(list, token) {
    return Array.isArray(list) && list.indexOf(token) !== -1;
  }

  function scoreSemanticDoc(doc, queryNorm, queryTokens, intent, currentPage, localBoosts) {
    var score = 0;
    var haystack = doc._titleNorm + ' ' + doc._descriptionNorm + ' ' + doc._contentNorm;

    if (!queryNorm) return 0;

    if (doc._titleNorm.indexOf(queryNorm) !== -1) score += 22;
    if (doc._urlNorm.indexOf(queryNorm) !== -1) score += 24;
    if (doc._descriptionNorm.indexOf(queryNorm) !== -1) score += 12;
    if (doc._headingsNorm.indexOf(queryNorm) !== -1) score += 10;
    if (doc._contentNorm.indexOf(queryNorm) !== -1) score += 6;

    queryTokens.forEach(function (token) {
      if (hasToken(doc._titleTokens, token)) score += 7;
      if (hasToken(doc._urlTokens, token)) score += 6;
      if (hasToken(doc._keywordTokens, token)) score += 5;
      if (hasToken(doc._headingTokens, token)) score += 4;
      if (hasToken(doc._descriptionTokens, token)) score += 3;
      if (doc._contentNorm.indexOf(token) !== -1) score += 1;
    });

    if (intent === 'pricing' && /(quanto costa|prezzo|costo|budget|preventiv)/.test(haystack)) score += 9;
    if (intent === 'contact' && doc.url === '/contatti.html') score += 14;
    if (intent === 'portfolio' && (doc.type === 'portfolio' || doc.url === '/portfolio.html')) score += 10;
    if (intent === 'about' && doc.url === '/chi-siamo.html') score += 10;
    if (intent === 'informational' && (doc.type === 'articolo' || doc.url === '/blog/')) score += 6;
    if (intent === 'local' && doc.type === 'locale') score += 8;

    if (currentPage && sameSection(doc.url, currentPage)) score += 2;
    if (doc.type === 'servizio' || doc.type === 'locale') score += 1;
    if (doc.indexable === false) score *= 0.45;
    if (localBoosts && localBoosts[normalizePath(doc.url)]) score += localBoosts[normalizePath(doc.url)];

    return score;
  }

  function semanticLocalSearch(query, currentPage, localResults, limit) {
    var queryNorm = normalizeText(query);
    var queryTokens = tokenize(query);
    var intent = inferIntent(queryNorm);
    var localBoosts = {};
    var ranked;

    (localResults || []).forEach(function (item, index) {
      localBoosts[normalizePath(item.url)] = Math.max(1.5, (MAX_LOCAL_RESULTS - index) * 0.65);
    });

    ranked = buildSemanticIndex().map(function (doc) {
      var rankScore = scoreSemanticDoc(doc, queryNorm, queryTokens, intent, currentPage, localBoosts);
      return {
        id: doc.id,
        url: normalizePath(doc.url),
        type: doc.type,
        title: doc.title,
        description: doc.description,
        keywords: doc.keywords,
        headings: doc.headings,
        content: doc.content,
        indexable: doc.indexable,
        rankScore: rankScore
      };
    }).filter(function (doc) {
      return doc.rankScore > 0 && doc.indexable !== false;
    }).sort(function (a, b) {
      return b.rankScore - a.rankScore || a.url.localeCompare(b.url);
    });

    if (!ranked.length) return [];

    var topScore = Math.max(ranked[0].rankScore || 1, 1);
    return ranked.slice(0, limit || 5).map(function (doc) {
      var item = Object.assign({}, doc);
      item.relevance = Math.max(0.35, Math.min(0.99, item.rankScore / topScore));
      return item;
    });
  }

  function rerankLocalResults(query, localResults) {
    var intent = inferIntent(query);
    var tokens = tokenize(query);

    return (localResults || []).map(function (item) {
      var bonus = 0;
      var titleNorm = normalizeText(item.title);
      var descNorm = normalizeText(item.description);
      var urlNorm = normalizeText(item.url);
      var haystack = titleNorm + ' ' + descNorm + ' ' + urlNorm;

      if (intent === 'pricing' && /(quanto costa|prezzo|costo|budget|preventiv)/.test(haystack)) bonus += 0.08;
      if (intent === 'contact' && item.url === '/contatti.html') bonus += 0.12;
      if (intent === 'portfolio' && (item.type === 'portfolio' || item.url === '/portfolio.html')) bonus += 0.08;
      if (intent === 'about' && item.url === '/chi-siamo.html') bonus += 0.08;
      if (intent === 'informational' && item.type === 'articolo') bonus += 0.05;
      if (intent === 'local' && item.type === 'locale') bonus += 0.06;

      tokens.forEach(function (token) {
        if (titleNorm.indexOf(token) !== -1) bonus += 0.015;
        if (urlNorm.indexOf(token) !== -1) bonus += 0.01;
      });

      return {
        item: item,
        adjustedScore: Math.max(0, (typeof item.score === 'number' ? item.score : 0.32) - bonus)
      };
    }).sort(function (a, b) {
      return a.adjustedScore - b.adjustedScore;
    }).map(function (entry) {
      var cloned = Object.assign({}, entry.item);
      cloned.score = entry.adjustedScore;
      return cloned;
    });
  }

  function buildLocalAiResponse(query, localResults, currentPage) {
    var semanticRanked = semanticLocalSearch(query, currentPage, localResults, 5);
    var ranked = semanticRanked.length ? semanticRanked.slice(0, 3) : rerankLocalResults(query, localResults).slice(0, 3);
    if (!ranked.length) return null;

    var intent = inferIntent(query);
    var suggestions = ranked.map(toLocalSuggestion);
    var primary = suggestions[0];
    var secondary = suggestions[1];
    var primaryTitle = stripSiteSuffix(primary.title);
    var secondaryTitle = secondary ? stripSiteSuffix(secondary.title) : '';
    var answer = '';

    if (intent === 'contact') {
      answer = 'Per contattare WebNovis ti conviene partire da [Contatti](/contatti.html) e, se vuoi arrivare già con i dettagli giusti, aprire anche [Preventivo](/preventivo.html).';
    } else if (intent === 'portfolio') {
      answer = secondary
        ? 'Per vedere esempi concreti ti consiglio di partire da [' + primaryTitle + '](' + primary.url + ') e poi aprire [' + secondaryTitle + '](' + secondary.url + ').'
        : 'La pagina più pertinente per esempi e progetti è [' + primaryTitle + '](' + primary.url + ').';
    } else if (intent === 'pricing') {
      answer = secondary
        ? 'Per costi, range e preventivi ti conviene partire da [' + primaryTitle + '](' + primary.url + ') e poi confrontare [' + secondaryTitle + '](' + secondary.url + ').'
        : 'Per costi e preventivi la pagina più utile è [' + primaryTitle + '](' + primary.url + ').';
    } else if (intent === 'local') {
      answer = secondary
        ? 'Per una risposta affidabile sulla tua zona, inizia da [' + primaryTitle + '](' + primary.url + ') e poi guarda anche [' + secondaryTitle + '](' + secondary.url + ').'
        : 'La pagina locale più pertinente per questa ricerca è [' + primaryTitle + '](' + primary.url + ').';
    } else if (intent === 'informational') {
      answer = secondary
        ? 'Ho trovato due risorse molto pertinenti: [' + primaryTitle + '](' + primary.url + ') e [' + secondaryTitle + '](' + secondary.url + ').'
        : 'La guida più pertinente per questa ricerca è [' + primaryTitle + '](' + primary.url + ').';
    } else {
      answer = secondary
        ? 'Le pagine più pertinenti per questa ricerca sono [' + primaryTitle + '](' + primary.url + ') e [' + secondaryTitle + '](' + secondary.url + ').'
        : 'La pagina più pertinente per questa ricerca è [' + primaryTitle + '](' + primary.url + ').';
    }

    return {
      answer: safeText(answer, 520),
      suggestedPages: suggestions,
      relatedQueries: buildRelatedQueries(query, ranked)
    };
  }

  function canUseRemoteAi() {
    return ENABLE_REMOTE_AI && Date.now() >= aiDisabledUntil;
  }

  var TYPE_ICONS = {
    page: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    servizio: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    articolo: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/></svg>',
    portfolio: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2h10"/><path d="M5 6h14"/><rect width="18" height="12" x="3" y="10" rx="2"/></svg>',
    locale: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>',
    hub: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M3 12h18"/><circle cx="12" cy="12" r="9"/></svg>',
    legale: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 7v6c0 5 3.4 7.74 8 8 4.6-.26 8-3 8-8V7l-8-4Z"/><path d="m9.5 12 1.7 1.7 3.8-3.8"/></svg>'
  };
  var FALLBACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  var AI_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
  var NO_RESULTS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  var TYPE_LABELS = { page: 'Pagina', servizio: 'Servizio', articolo: 'Blog', portfolio: 'Portfolio', locale: 'Locale', hub: 'Hub', legale: 'Legale' };

  function typeIcon(t) { return TYPE_ICONS[t] || FALLBACK_ICON; }
  function typeLabel(t) { return TYPE_LABELS[t] || 'Pagina'; }

  // ─── Fuse.js loader ──────────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.Fuse) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Script load failed: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function loadIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    return fetch('/search-index.json')
      .then(function (r) {
        if (!r.ok) throw new Error('Index fetch failed');
        return r.json();
      })
      .then(function (data) {
        searchIndex = data;
        semanticIndex = null;
        return data;
      });
  }

  function initFuse() {
    if (fuse) return Promise.resolve(fuse);
    return Promise.all([loadScript(FUSE_CDN), loadIndex()])
      .then(function () {
        fuse = new window.Fuse(searchIndex, {
          keys: [
            { name: 'title', weight: 0.32 },
            { name: 'description', weight: 0.2 },
            { name: 'keywords', weight: 0.18 },
            { name: 'headings', weight: 0.12 },
            { name: 'url', weight: 0.12 },
            { name: 'content', weight: 0.06 }
          ],
          threshold: 0.32,
          distance: 200,
          includeScore: true,
          includeMatches: true,
          minMatchCharLength: 2,
          ignoreLocation: true
        });
        fuseReady = true;
        return fuse;
      });
  }

  // ─── Local search ────────────────────────────────────────────────────────────
  function searchLocal(query) {
    return initFuse()
      .then(function () {
        var results = fuse.search(query);
        return results.slice(0, MAX_LOCAL_RESULTS).map(function (r) {
          var item = Object.assign({}, r.item);
          item.score = r.score;
          item.source = 'local';
          return item;
        });
      })
      .catch(function () { return []; });
  }

  // ─── AI search (background) ──────────────────────────────────────────────────
  function searchAI(query, localResults, currentPage) {
    var localAiResponse = buildLocalAiResponse(query, localResults, currentPage);
    if (!canUseRemoteAi()) {
      return Promise.resolve(localAiResponse);
    }

    if (aiAbort) aiAbort.abort();
    aiAbort = new AbortController();

    return fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, currentPage: currentPage || window.location.pathname }),
      signal: aiAbort.signal
    })
      .then(function (r) {
        if (r.ok) return r.json();
        if (r.status === 503) {
          aiDisabledUntil = Date.now() + (5 * 60 * 1000);
        }
        return localAiResponse;
      })
      .catch(function () { return localAiResponse; });
  }

  function getTopLocalScore(localResults) {
    if (!localResults || !localResults.length) return 1;
    return typeof localResults[0].score === 'number' ? localResults[0].score : 1;
  }

  function shouldRunAiSearch(query, localResults) {
    var trimmed = (query || '').trim();
    if (!trimmed) return false;

    var wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    var charCount = trimmed.length;
    var looksConversational = /[?]/.test(trimmed) || /^(come|quale|quali|quanto|posso|vorrei|cerco|mi serve|ho bisogno|chi|dove|perche|perché)\b/i.test(trimmed);

    if (!localResults || !localResults.length) return wordCount >= 3 || charCount >= 18 || looksConversational;

    var topScore = getTopLocalScore(localResults);
    var hasStrongLocalMatch = localResults.length >= 3 && topScore <= STRONG_LOCAL_SCORE_THRESHOLD;

    if (wordCount <= 3 && hasStrongLocalMatch) return false;
    if (wordCount >= 6 || charCount >= 32 || looksConversational) return true;
    if (wordCount >= AI_WORD_THRESHOLD || charCount >= AI_CHAR_THRESHOLD) {
      return topScore > STRONG_LOCAL_SCORE_THRESHOLD || localResults.length < 3;
    }

    return topScore > WEAK_LOCAL_SCORE_THRESHOLD;
  }

  // ─── Render (target-aware) ───────────────────────────────────────────────────
  function renderResultsTo(resultsEl, inputEl, local, ai, query, selIdx) {
    if (!resultsEl) return;
    var html = '';

    if (local.length) {
      html += '<div class="search-results-section">';
      html += '<div class="search-results-label">Risultati</div>';
      local.forEach(function (item, i) {
        html += '<a href="' + escHTML(item.url) + '" class="search-result-item' + (i === selIdx ? ' selected' : '') + '" role="option" data-index="' + i + '" aria-selected="' + (i === selIdx) + '">' +
          '<span class="search-result-icon">' + typeIcon(item.type) + '</span>' +
          '<div class="search-result-content">' +
          '<div class="search-result-title">' + highlight(item.title, query) + '</div>' +
          '<div class="search-result-desc">' + highlight(item.description, query) + '</div>' +
          '</div>' +
          '<span class="search-result-type">' + escHTML(typeLabel(item.type)) + '</span>' +
          '</a>';
      });
      html += '</div>';
    }

    if (ai && ai.answer) {
      html += '<div class="search-results-section search-ai-section">';
      html += '<div class="search-results-label"><span class="search-ai-badge">AI</span> Risposta intelligente</div>';
      html += '<div class="search-ai-answer">' + renderAiAnswer(ai.answer) + '</div>';
      if (ai.suggestedPages && ai.suggestedPages.length) {
        ai.suggestedPages.forEach(function (p) {
          html += '<a href="' + escHTML(p.url) + '" class="search-result-item search-ai-suggestion">' +
            '<span class="search-result-icon">' + AI_ICON + '</span>' +
            '<div class="search-result-content"><div class="search-result-title">' + escHTML(p.title) + '</div></div>' +
            '<span class="search-result-relevance">' + Math.round((p.relevance || 0) * 100) + '%</span>' +
            '</a>';
        });
      }
      if (ai.relatedQueries && ai.relatedQueries.length) {
        html += '<div class="search-related">';
        ai.relatedQueries.forEach(function (q) {
          html += '<button class="search-related-tag" data-query="' + escHTML(q) + '">' + escHTML(q) + '</button>';
        });
        html += '</div>';
      }
      html += '</div>';
    }

    if (!local.length && !ai) {
      html += '<div class="search-no-results">' +
        '<div class="search-no-results-icon">' + NO_RESULTS_ICON + '</div>' +
        '<div class="search-no-results-text">Nessun risultato per "<strong>' + escHTML(query) + '</strong>"</div>' +
        '<div class="search-no-results-hint">Prova con termini diversi o <a href="/contatti.html">contattaci</a></div>' +
        '</div>';
    }

    html += '<div class="search-footer">' +
      '<span><kbd>↑↓</kbd> Naviga</span>' +
      '<span><kbd>↵</kbd> Apri</span>' +
      '<span><kbd>Esc</kbd> Chiudi</span>' +
      '</div>';

    resultsEl.innerHTML = html;
    resultsEl.classList.add('visible');

    resultsEl.querySelectorAll('.search-related-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (inputEl) inputEl.value = btn.dataset.query;
        handleSearchTo(resultsEl, inputEl, btn.dataset.query);
      });
    });
  }

  // Desktop wrappers
  function renderResults(local, ai, query) {
    var e = getEl();
    renderResultsTo(e.results, e.input, local, ai, query, selectedIdx);
  }

  // ─── Incremental AI append (avoids full re-render flicker) ─────────────────
  function buildAiSectionHTML(ai, inputEl) {
    var html = '<div class="search-results-section search-ai-section">';
    html += '<div class="search-results-label"><span class="search-ai-badge">AI</span> Risposta intelligente</div>';
    html += '<div class="search-ai-answer">' + renderAiAnswer(ai.answer) + '</div>';
    if (ai.suggestedPages && ai.suggestedPages.length) {
      ai.suggestedPages.forEach(function (p) {
        html += '<a href="' + escHTML(p.url) + '" class="search-result-item search-ai-suggestion">' +
          '<span class="search-result-icon">' + AI_ICON + '</span>' +
          '<div class="search-result-content"><div class="search-result-title">' + escHTML(p.title) + '</div></div>' +
          '<span class="search-result-relevance">' + Math.round((p.relevance || 0) * 100) + '%</span>' +
          '</a>';
      });
    }
    if (ai.relatedQueries && ai.relatedQueries.length) {
      html += '<div class="search-related">';
      ai.relatedQueries.forEach(function (q) {
        html += '<button class="search-related-tag" data-query="' + escHTML(q) + '">' + escHTML(q) + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function appendAiSectionTo(resultsEl, inputEl, ai) {
    if (!resultsEl || !ai || !ai.answer) return;
    // Remove loading indicator
    var loader = resultsEl.querySelector('.search-ai-loading');
    if (loader) loader.remove();
    // Don't duplicate
    var existing = resultsEl.querySelector('.search-ai-section');
    if (existing) existing.remove();
    // Build AI section as DOM fragment
    var temp = document.createElement('div');
    temp.innerHTML = buildAiSectionHTML(ai, inputEl);
    var aiSection = temp.firstElementChild;
    // Insert before footer if present
    var footer = resultsEl.querySelector('.search-footer');
    if (footer) resultsEl.insertBefore(aiSection, footer);
    else resultsEl.appendChild(aiSection);
    // Bind related query buttons
    aiSection.querySelectorAll('.search-related-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (inputEl) inputEl.value = btn.dataset.query;
        handleSearchTo(resultsEl, inputEl, btn.dataset.query);
      });
    });
  }

  function showAiLoadingTo(resultsEl) {
    if (!resultsEl) return;
    var existing = resultsEl.querySelector('.search-ai-section');
    if (existing) return;
    var existingLoader = resultsEl.querySelector('.search-ai-loading');
    if (existingLoader) return;
    var loader = document.createElement('div');
    loader.className = 'search-ai-loading';
    loader.innerHTML = '<span class="search-ai-loading-dot"></span><span class="search-ai-loading-dot"></span><span class="search-ai-loading-dot"></span><span class="search-ai-loading-text">Ricerca AI...</span>';
    var footer = resultsEl.querySelector('.search-footer');
    if (footer) resultsEl.insertBefore(loader, footer);
    else resultsEl.appendChild(loader);
  }

  function showAiLoading() { showAiLoadingTo(getEl().results); }

  function showLoadingTo(resultsEl) {
    if (!resultsEl) return;
    resultsEl.innerHTML = '<div class="search-loading">' +
      '<div class="search-loading-shimmer"></div>' +
      '<div class="search-loading-shimmer"></div>' +
      '<div class="search-loading-shimmer"></div>' +
      '</div>';
    resultsEl.classList.add('visible');
  }

  function showLoading() { showLoadingTo(getEl().results); }

  function hideResultsOf(resultsEl) {
    if (resultsEl) resultsEl.classList.remove('visible');
  }

  function hideResults() {
    hideResultsOf(getEl().results);
    selectedIdx = -1;
  }

  // ─── Generic search handler (target-aware) ───────────────────────────────────
  function handleSearchTo(resultsEl, inputEl, query) {
    if (!query || query.length < MIN_QUERY_LEN) {
      hideResultsOf(resultsEl);
      return;
    }
    if (!fuseReady) showLoadingTo(resultsEl);
    var currentQuery = query;
    searchLocal(query).then(function (localResults) {
      if (!inputEl || inputEl.value.trim() !== currentQuery) return;
      renderResultsTo(resultsEl, inputEl, localResults, null, query, -1);
      if (shouldRunAiSearch(query, localResults)) {
        if (canUseRemoteAi()) showAiLoadingTo(resultsEl);
        searchAI(query, localResults, window.location.pathname).then(function (aiResult) {
          if (!inputEl || inputEl.value.trim() !== currentQuery) return;
          if (aiResult) appendAiSectionTo(resultsEl, inputEl, aiResult);
        });
      }
    });
  }

  // ─── Main search handler ─────────────────────────────────────────────────────
  function handleSearch(query) {
    var e = getEl();
    if (!query || query.length < MIN_QUERY_LEN) {
      hideResults();
      if (e.clear) e.clear.classList.remove('visible');
      return;
    }
    if (e.clear) e.clear.classList.add('visible');

    if (!fuseReady) showLoading();

    var currentQuery = query;

    searchLocal(query).then(function (localResults) {
      if (e.input.value.trim() !== currentQuery) return;
      selectedIdx = -1;
      renderResults(localResults, null, query);

      // AI search only when local confidence is weak or the query is genuinely complex
      if (shouldRunAiSearch(query, localResults)) {
        if (canUseRemoteAi()) showAiLoading();
        searchAI(query, localResults, window.location.pathname).then(function (aiResult) {
          if (e.input.value.trim() !== currentQuery) return;
          if (aiResult) {
            appendAiSectionTo(e.results, e.input, aiResult);
          }
        });
      }
    });
  }

  var debouncedSearch = debounce(handleSearch, DEBOUNCE_MS);

  // ─── Keyboard navigation ─────────────────────────────────────────────────────
  function handleKeydown(evt) {
    var e = getEl();
    if (!e.results || !e.results.classList.contains('visible')) return;

    var items = e.results.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (evt.key === 'ArrowDown') {
      evt.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      updateSelection(items);
    } else if (evt.key === 'ArrowUp') {
      evt.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, -1);
      updateSelection(items);
    } else if (evt.key === 'Enter' && selectedIdx >= 0) {
      evt.preventDefault();
      var sel = items[selectedIdx];
      if (sel && sel.href) window.location.href = sel.href;
    } else if (evt.key === 'Escape') {
      hideResults();
      e.input.blur();
      closeMobile();
    }
  }

  function updateSelection(items) {
    items.forEach(function (item, i) {
      item.classList.toggle('selected', i === selectedIdx);
      item.setAttribute('aria-selected', String(i === selectedIdx));
    });
    if (selectedIdx >= 0 && items[selectedIdx]) {
      items[selectedIdx].scrollIntoView({ block: 'nearest' });
    }
  }

  // ─── Mobile modal search ─────────────────────────────────────────────────────
  var selectedIdxM = -1;
  var debounceTimerM = null;

  function debounceM(fn, ms) {
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(debounceTimerM);
      debounceTimerM = setTimeout(function () { fn.apply(ctx, args); }, ms);
    };
  }

  function openModal() {
    var m = getElM();
    if (!m.modal) return;
    m.modal.classList.add('open');
    if (m.overlay) m.overlay.classList.add('visible');
    if (m.mobileBtn) m.mobileBtn.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Delay focus slightly so the CSS transition has started (avoids iOS keyboard jump)
    setTimeout(function () {
      if (m.input) {
        m.input.focus();
        m.input.setAttribute('aria-expanded', 'true');
      }
    }, 80);
  }

  function closeModal() {
    var m = getElM();
    if (!m.modal) return;
    m.modal.classList.remove('open');
    if (m.overlay) m.overlay.classList.remove('visible');
    if (m.mobileBtn) m.mobileBtn.classList.remove('active');
    document.body.style.overflow = '';
    if (m.input) {
      m.input.value = '';
      m.input.setAttribute('aria-expanded', 'false');
    }
    if (m.clear) m.clear.classList.remove('visible');
    if (m.bar) m.bar.classList.remove('focused');
    hideResultsOf(m.results);
    selectedIdxM = -1;
  }

  // Keep old names as aliases so Ctrl+K still works
  function openMobile() { openModal(); }
  function closeMobile() { closeModal(); }

  // ─── Init ────────────────────────────────────────────────────────────────────
  function init() {
    var e = getEl();
    if (!e.input) return;

    // Input handler
    e.input.addEventListener('input', function (evt) {
      debouncedSearch(evt.target.value.trim());
    });

    // Keyboard nav
    e.input.addEventListener('keydown', handleKeydown);

    // Focus glow
    e.input.addEventListener('focus', function () {
      e.bar.classList.add('focused');
      if (e.input.value.length >= MIN_QUERY_LEN) {
        handleSearch(e.input.value.trim());
      }
    });

    // Click outside → close
    document.addEventListener('click', function (evt) {
      if (e.wrapper && !e.wrapper.contains(evt.target) &&
        (!e.mobileBtn || !e.mobileBtn.contains(evt.target))) {
        hideResults();
        e.bar.classList.remove('focused');
      }
    });

    // Clear button
    if (e.clear) {
      e.clear.addEventListener('click', function () {
        e.input.value = '';
        e.clear.classList.remove('visible');
        hideResults();
        e.input.focus();
      });
    }

    // Overlay close (desktop only — mobile handled in initMobile)
    if (e.overlay && window.innerWidth > 768) {
      e.overlay.addEventListener('click', closeMobile);
    }

    // Ctrl+K / Cmd+K global shortcut
    document.addEventListener('keydown', function (evt) {
      if ((evt.ctrlKey || evt.metaKey) && evt.key === 'k') {
        evt.preventDefault();
        if (window.innerWidth <= 768) {
          openMobile();
        } else {
          e.input.focus();
        }
      }
    });

    // Preload Fuse.js on first hover/touch (background)
    var preloaded = false;
    function preload() {
      if (preloaded) return;
      preloaded = true;
      initFuse().catch(function () { /* silent */ });
    }
    document.addEventListener('mouseover', preload, { once: true });
    document.addEventListener('touchstart', preload, { once: true });

    initMobile();
  }

  // ─── Mobile modal init ───────────────────────────────────────────────────────
  function initMobile() {
    var m = getElM();
    if (!m.modal) return;

    var debouncedMobile = debounceM(function (q) {
      handleSearchTo(m.results, m.input, q);
      if (m.clear) m.clear.classList.toggle('visible', q.length > 0);
    }, DEBOUNCE_MS);

    // Input
    if (m.input) {
      m.input.addEventListener('input', function () {
        var q = m.input.value.trim();
        debouncedMobile(q);
        if (m.bar) m.bar.classList.add('focused');
      });

      m.input.addEventListener('focus', function () {
        if (m.bar) m.bar.classList.add('focused');
        var q = m.input.value.trim();
        if (q.length >= MIN_QUERY_LEN) handleSearchTo(m.results, m.input, q);
      });

      m.input.addEventListener('blur', function () {
        if (m.bar) m.bar.classList.remove('focused');
      });

      // Keyboard: Esc closes modal, Enter navigates selected
      m.input.addEventListener('keydown', function (evt) {
        if (evt.key === 'Escape') {
          evt.preventDefault();
          closeModal();
        } else if (evt.key === 'Enter') {
          var items = m.results ? m.results.querySelectorAll('.search-result-item') : [];
          if (selectedIdxM >= 0 && items[selectedIdxM] && items[selectedIdxM].href) {
            evt.preventDefault();
            window.location.href = items[selectedIdxM].href;
          }
        } else if (evt.key === 'ArrowDown' || evt.key === 'ArrowUp') {
          evt.preventDefault();
          var its = m.results ? m.results.querySelectorAll('.search-result-item') : [];
          if (!its.length) return;
          if (evt.key === 'ArrowDown') selectedIdxM = Math.min(selectedIdxM + 1, its.length - 1);
          else selectedIdxM = Math.max(selectedIdxM - 1, -1);
          its.forEach(function (it, i) {
            it.classList.toggle('selected', i === selectedIdxM);
            it.setAttribute('aria-selected', String(i === selectedIdxM));
          });
          if (selectedIdxM >= 0 && its[selectedIdxM]) its[selectedIdxM].scrollIntoView({ block: 'nearest' });
        }
      });
    }

    // Clear button
    if (m.clear) {
      m.clear.addEventListener('click', function () {
        if (m.input) { m.input.value = ''; m.input.focus(); }
        m.clear.classList.remove('visible');
        hideResultsOf(m.results);
        selectedIdxM = -1;
      });
    }

    // Close button
    if (m.closeBtn) {
      m.closeBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        closeModal();
      });
    }

    // Overlay tap closes modal
    if (m.overlay) {
      m.overlay.addEventListener('click', closeModal);
    }

    // Mobile toggle button
    if (m.mobileBtn) {
      m.mobileBtn.addEventListener('click', function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        openModal();
      });
    }
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
