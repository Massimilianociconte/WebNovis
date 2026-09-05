(function initFooterWidgetsLoader() {
    var loadedDesignRush = false;
    var widgetsRequested = false;
    var designRushSrc = 'https://www.designrush.com/topbest/js/widgets/agency-reviews.js';

    // Trustpilot non passa piu da qui: il badge e statico in footer
    // (config/site-footer.js, zero richieste esterne). Il bootstrap esterno
    // falliva spesso al load (HAR 2026-09-05: 8x status 0).

    function hasFooterWidgets() {
        return !!document.querySelector('[data-designrush-widget]');
    }

    function loadScript(src, onLoad) {
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
            if (typeof onLoad === 'function') onLoad();
            return;
        }

        var script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        if (typeof onLoad === 'function') {
            script.addEventListener('load', onLoad, { once: true });
        }
        document.body.appendChild(script);
    }

    function loadDesignRush() {
        if (loadedDesignRush || !document.querySelector('[data-designrush-widget]')) return;
        loadedDesignRush = true;
        loadScript(designRushSrc);
    }

    function loadWidgets() {
        if (widgetsRequested || !hasFooterWidgets()) return;
        widgetsRequested = true;
        loadDesignRush();
    }

    function setupIntersectionTrigger() {
        if (!('IntersectionObserver' in window)) return false;

        var candidates = document.querySelectorAll('.footer-reviews-badges, .footer-badges, [data-designrush-widget]');
        if (!candidates.length) return false;

        var observer = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) {
                observer.disconnect();
                loadWidgets();
            }
        }, { rootMargin: '200px 0px' });

        candidates.forEach(function (element) {
            observer.observe(element);
        });

        return true;
    }

    if (!setupIntersectionTrigger()) {
        if ('requestIdleCallback' in window) {
            window.addEventListener('load', function () {
                requestIdleCallback(function () {
                    setTimeout(loadWidgets, 7000);
                }, { timeout: 9000 });
            }, { once: true });
        } else {
            window.addEventListener('load', function () {
                setTimeout(loadWidgets, 8000);
            }, { once: true });
        }
    }
})();

(function initPreferredSourceWidget() {
    'use strict';
    // CTA leggera: nessun JS esterno, nessuna rete, nessun bundle.
    // Il link statico e gia nel footer (config/site-footer.js). Qui solo dedup + tracking.
    var DEEPLINK_URL = 'https://www.google.com/preferences/source?q=www.webnovis.com';

    function dedupe() {
        // Schema voluto: max 1 CTA articolo (top) + 1 CTA footer. Rimuove solo dal 3o in poi.
        var nodes = document.querySelectorAll('.wn-preferred-source');
        for (var i = 2; i < nodes.length; i++) {
            if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
        }
        // Rimuove eventuali duplicati dell'ipertesto dentro lo stesso blocco
        var wrap = document.querySelector('.wn-preferred-source');
        if (!wrap) return;
        var links = wrap.querySelectorAll('a[href*="preferences/source"]');
        for (var j = 1; j < links.length; j++) {
            if (links[j] && links[j].parentNode) links[j].parentNode.removeChild(links[j]);
        }
    }

    function ensureStatic() {
        if (document.querySelector('.wn-preferred-source')) {
            dedupe();
            return;
        }
        var anchor = document.querySelector('[data-preferred-source]') || document.querySelector('.footer-brand') || document.querySelector('.footer');
        if (!anchor) return;
        var wrap = document.createElement('div');
        wrap.className = 'wn-preferred-source';
        wrap.setAttribute('data-preferred-source', '');
        var label = document.createElement('p');
        label.className = 'wn-ps-label';
        label.textContent = 'Aggiungi WebNovis alle fonti preferite su Google, per vedere pi\u00f9 spesso WebNovis nei tuoi risultati di ricerca.';
        var link = document.createElement('a');
        link.className = 'wn-ps-link';
        link.href = DEEPLINK_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Aggiungi WebNovis alle fonti preferite';
        wrap.appendChild(label);
        wrap.appendChild(link);
        anchor.appendChild(wrap);
    }

    function setup() {
        ensureStatic();
        var wrap = document.querySelector('.wn-preferred-source');
        if (wrap) {
            wrap.addEventListener('click', function () {
                try {
                    (window.dataLayer = window.dataLayer || []).push({ event: 'preferred_source_click' });
                } catch (e) {}
            }, true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
        setup();
    }
})();
