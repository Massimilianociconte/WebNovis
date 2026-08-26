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
