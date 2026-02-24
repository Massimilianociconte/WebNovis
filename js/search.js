/**
 * WebNovis Intelligent Search System
 * - Fuse.js fuzzy local search (< 50ms, debounce 150ms)
 * - AI-powered semantic search via server proxy (< 2s)
 * - Keyboard accessible (Tab, Enter, Esc, arrows, Ctrl+K)
 * - Progressive enhancement (local first, AI enrichment)
 * - API key NEVER in frontend — AI calls proxied through /api/search-ai
 */
(function () {
  'use strict';

  // ─── Config ──────────────────────────────────────────────────────────────────
  var DEBOUNCE_MS = 150;
  var MIN_QUERY_LEN = 2;
  var AI_WORD_THRESHOLD = 4;
  var MAX_LOCAL_RESULTS = 8;
  var AI_ENDPOINT = '/api/search-ai';
  var FUSE_CDN = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';

  // ─── State ───────────────────────────────────────────────────────────────────
  var searchIndex = null;
  var fuse = null;
  var fuseReady = false;
  var selectedIdx = -1;
  var debounceTimer = null;
  var aiAbort = null;

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
    // Escape HTML first, then convert [text](url) markdown links to <a> tags
    var safe = escHTML(text);
    return safe.replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, '<a href="$2" class="search-ai-link">$1</a>');
  }

  function highlight(text, query) {
    if (!text || !query) return escHTML(text || '');
    var safe = escHTML(text);
    var words = query.trim().split(/\s+/).filter(function (w) { return w.length > 1; });
    if (!words.length) return safe;
    var pattern = words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|');
    return safe.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
  }

  var TYPE_ICONS = {
    page: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    servizio: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    articolo: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/></svg>',
    portfolio: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2h10"/><path d="M5 6h14"/><rect width="18" height="12" x="3" y="10" rx="2"/></svg>'
  };
  var FALLBACK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  var AI_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
  var NO_RESULTS_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m13.5 8.5-5 5"/><path d="m8.5 8.5 5 5"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
  var TYPE_LABELS = { page: 'Pagina', servizio: 'Servizio', articolo: 'Blog', portfolio: 'Portfolio' };

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
      .then(function (data) { searchIndex = data; return data; });
  }

  function initFuse() {
    if (fuse) return Promise.resolve(fuse);
    return Promise.all([loadScript(FUSE_CDN), loadIndex()])
      .then(function () {
        fuse = new window.Fuse(searchIndex, {
          keys: [
            { name: 'title', weight: 0.35 },
            { name: 'description', weight: 0.25 },
            { name: 'keywords', weight: 0.15 },
            { name: 'headings', weight: 0.15 },
            { name: 'content', weight: 0.1 }
          ],
          threshold: 0.35,
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
  function searchAI(query) {
    if (aiAbort) aiAbort.abort();
    aiAbort = new AbortController();

    return fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, currentPage: window.location.pathname }),
      signal: aiAbort.signal
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
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

  function showAiLoadingTo(resultsEl) {
    if (!resultsEl) return;
    var existing = resultsEl.querySelector('.search-ai-section');
    if (existing) return;
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
      var wordCount = query.trim().split(/\s+/).length;
      if (wordCount >= AI_WORD_THRESHOLD || localResults.length === 0) {
        showAiLoadingTo(resultsEl);
        searchAI(query).then(function (aiResult) {
          if (!inputEl || inputEl.value.trim() !== currentQuery) return;
          if (aiResult) renderResultsTo(resultsEl, inputEl, localResults, aiResult, query, -1);
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

      // AI search for longer queries or no results
      var wordCount = query.trim().split(/\s+/).length;
      if (wordCount >= AI_WORD_THRESHOLD || localResults.length === 0) {
        showAiLoading();
        searchAI(query).then(function (aiResult) {
          if (e.input.value.trim() !== currentQuery) return;
          if (aiResult) {
            renderResults(localResults, aiResult, query);
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
