(function initFooterWidgetsLoader() {
    var loadedDesignRush = false;
    var loadedTrustpilot = false;
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
        if (!hasFooterWidgets()) return;
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

    window.addEventListener('pointerdown', loadWidgets, { once: true, passive: true });
    window.addEventListener('keydown', loadWidgets, { once: true });
    window.addEventListener('scroll', loadWidgets, { once: true, passive: true });

    if (!setupIntersectionTrigger()) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(function () {
                setTimeout(loadWidgets, 2200);
            }, { timeout: 4200 });
        } else {
            setTimeout(loadWidgets, 3500);
        }
    }
})();