(function initFooterWidgetsLoader() {
    var loadedDesignRush = false;
    var loadedTrustpilot = false;
    var widgetsRequested = false;
    var designRushSrc = 'https://www.designrush.com/topbest/js/widgets/agency-reviews.js';
    var trustpilotSrc = 'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

    function hasFooterWidgets() {
        return !!document.querySelector('.trustpilot-widget, [data-designrush-widget]');
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

    function loadTrustpilot() {
        if (loadedTrustpilot || !document.querySelector('.trustpilot-widget')) return;
        loadedTrustpilot = true;
        loadScript(trustpilotSrc, function () {
            if (window.Trustpilot && typeof window.Trustpilot.loadFromElement === 'function') {
                document.querySelectorAll('.trustpilot-widget').forEach(function (element) {
                    window.Trustpilot.loadFromElement(element, true);
                });
            }
        });
    }

    function loadWidgets() {
        if (widgetsRequested || !hasFooterWidgets()) return;
        widgetsRequested = true;
        loadDesignRush();
        loadTrustpilot();
    }

    function setupIntersectionTrigger() {
        if (!('IntersectionObserver' in window)) return false;

        var candidates = document.querySelectorAll('.footer-reviews-badges, .footer-badges, .trustpilot-widget, [data-designrush-widget]');
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

    var PUBLISHER_LIB_SRC = 'https://news.google.com/swg/js/v1/publisher.js';
    var DEEPLINK_URL = 'https://www.google.com/preferences/source?q=www.webnovis.com';
    var BUTTON_THEME = 'dark';
    var RENDER_TIMEOUT_MS = 6000;

    function isTargetPage() {
        if (document.querySelector('[data-preferred-source]')) return true;
        var path = window.location.pathname;
        if (path === '/' || path === '/index.html') return true;
        if (path === '/blog' || path === '/blog/' || path === '/blog/index.html') return true;
        if (path.indexOf('/blog/') === 0) return true;
        return false;
    }

    function track(eventName) {
        try {
            (window.dataLayer = window.dataLayer || []).push({ event: eventName });
        } catch (error) {
            return;
        }
    }

    function injectStyles() {
        if (document.getElementById('wn-preferred-source-style')) return;
        var style = document.createElement('style');
        style.id = 'wn-preferred-source-style';
        style.textContent = [
            '.wn-preferred-source{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);max-width:320px}',
            '.wn-ps-label{margin:0 0 10px;font-size:.8rem;line-height:1.45;color:rgba(255,255,255,.62)}',
            '.wn-ps-fallback{display:inline-block;margin-top:8px;font-size:.8rem;color:var(--primary-light);text-decoration:underline}',
            '.wn-ps-fallback:hover{color:#b0b3ff}',
            '.wn-preferred-source iframe,.wn-preferred-source [google-add-preferred-source-btn]{max-width:100%}'
        ].join('');
        document.head.appendChild(style);
    }

    function mountWidget() {
        if (document.querySelector('.wn-preferred-source')) return true;
        var placeholder = document.querySelector('[data-preferred-source]');
        var anchor = placeholder || document.querySelector('.footer-brand') || document.querySelector('.footer');
        if (!anchor) return false;

        injectStyles();

        var wrap = document.createElement('div');
        wrap.className = 'wn-preferred-source';

        var label = document.createElement('p');
        label.className = 'wn-ps-label';
        label.textContent = 'Scegli WebNovis come fonte preferita su Google';

        var btnHost = document.createElement('div');
        btnHost.setAttribute('google-add-preferred-source-btn', '');
        btnHost.setAttribute('data-theme', BUTTON_THEME);

        var fallback = document.createElement('a');
        fallback.className = 'wn-ps-fallback';
        fallback.href = DEEPLINK_URL;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = 'Aggiungi WebNovis alle fonti preferite';
        fallback.hidden = true;

        wrap.appendChild(label);
        wrap.appendChild(btnHost);
        wrap.appendChild(fallback);
        anchor.appendChild(wrap);

        wrap.addEventListener('click', function () {
            track('preferred_source_click');
        }, true);

        var publisherLibRequested = false;
        function loadPublisherLib() {
            if (publisherLibRequested) return;
            publisherLibRequested = true;
            var libScript = document.createElement('script');
            libScript.src = PUBLISHER_LIB_SRC;
            libScript.async = true;
            libScript.addEventListener('error', function () {
                fallback.hidden = false;
            }, { once: true });
            document.head.appendChild(libScript);
            window.setTimeout(function () {
                if (!btnHost.firstElementChild) fallback.hidden = false;
            }, RENDER_TIMEOUT_MS);
        }

        if ('IntersectionObserver' in window) {
            var seen = false;
            var io = new IntersectionObserver(function (entries) {
                if (seen || !entries.some(function (entry) { return entry.isIntersecting; })) return;
                seen = true;
                io.disconnect();
                loadPublisherLib();
                track('preferred_source_impression');
            }, { rootMargin: '100px 0px' });
            io.observe(wrap);
        } else {
            loadPublisherLib();
        }

        return true;
    }

    function setup() {
        if (!isTargetPage()) return;
        if (mountWidget()) return;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', mountWidget, { once: true });
        } else if ('requestIdleCallback' in window) {
            requestIdleCallback(mountWidget, { timeout: 3000 });
        } else {
            window.setTimeout(mountWidget, 1200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup, { once: true });
    } else {
        setup();
    }
})();
