(function initDesignRushLazyLoader() {
    var loaded = false;
    var src = 'https://www.designrush.com/topbest/js/widgets/agency-reviews.js';

    function loadWidget() {
        if (loaded) return;
        loaded = true;

        var script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        document.body.appendChild(script);
    }

    window.addEventListener('pointerdown', loadWidget, { once: true, passive: true });
    window.addEventListener('keydown', loadWidget, { once: true });
    window.addEventListener('scroll', loadWidget, { once: true, passive: true });

    if ('requestIdleCallback' in window) {
        requestIdleCallback(function () {
            setTimeout(loadWidget, 2200);
        }, { timeout: 4200 });
    } else {
        setTimeout(loadWidget, 3500);
    }
})();
