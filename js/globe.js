// ===== COBE GLOBE - WebNovis Contact Section =====
// Vanilla JS implementation using cobe library via CDN (lazy initialized)

(function setupGlobe() {
    const canvas = document.getElementById('cobeGlobe');
    if (!canvas) return;

    const isMobileGlobe = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let hasStarted = false;
    let globe = null;
    let visibilityObserver = null;
    let width = 0;
    let phi = 0;
    let resizeRaf = 0;

    function computeWidth() {
        const wrapper = canvas.parentElement;
        const nextWidth = wrapper ? wrapper.clientWidth : canvas.clientWidth;
        width = nextWidth > 0 ? nextWidth : 280;
    }

    function onResize() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(computeWidth);
    }

    async function initGlobe() {
        if (hasStarted) return;
        hasStarted = true;

        computeWidth();

        let createGlobe;
        try {
            const module = await import('https://esm.sh/cobe@0.6.3');
            createGlobe = module.default;
        } catch (e) {
            hasStarted = false;
            console.warn('Globe: cobe library failed to load', e);
            return;
        }

        const deviceRatio = isMobileGlobe ? 1.5 : 2;
        const mapSamples = isMobileGlobe ? 22000 : 36000;
        const spinSpeed = prefersReducedMotion ? 0.0015 : 0.003;

        globe = createGlobe(canvas, {
            devicePixelRatio: deviceRatio,
            width: width * deviceRatio,
            height: width * deviceRatio,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 3,
            mapSamples: mapSamples,
            mapBrightness: 2.5,
            baseColor: [0.08, 0.33, 0.78],
            markerColor: [0.36, 0.42, 0.68],
            glowColor: [0.04, 0.19, 0.47],
            markers: [],
            onRender: (state) => {
                state.phi = phi;
                phi += spinSpeed;
                state.width = width * deviceRatio;
                state.height = width * deviceRatio;
            },
        });

        window.addEventListener('resize', onResize, { passive: true });

        visibilityObserver = new IntersectionObserver((entries) => {
            const visible = entries.some((entry) => entry.isIntersecting);
            if (globe && typeof globe.toggle === 'function') {
                globe.toggle(visible);
            }
        }, { threshold: 0.1 });
        visibilityObserver.observe(canvas);

        window.addEventListener('beforeunload', () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            window.removeEventListener('resize', onResize);
            if (visibilityObserver) visibilityObserver.disconnect();
            if (globe) globe.destroy();
        });
    }

    const initObserver = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        initObserver.disconnect();

        if (isMobileGlobe) {
            setTimeout(() => {
                if (!document.hidden) initGlobe();
            }, 450);
            return;
        }

        initGlobe();
    }, {
        threshold: 0.01,
        rootMargin: '280px 0px 280px 0px'
    });

    initObserver.observe(canvas);
})();
