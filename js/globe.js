// ===== COBE GLOBE - WebNovis Contact Section =====
// Vanilla JS implementation using cobe library via CDN

(async function initGlobe() {
    const canvas = document.getElementById('cobeGlobe');
    if (!canvas) return;

    // Dynamically import cobe from CDN
    let createGlobe;
    try {
        const module = await import('https://esm.sh/cobe@0.6.3');
        createGlobe = module.default;
    } catch (e) {
        console.warn('Globe: cobe library failed to load', e);
        return;
    }

    let phi = 0;
    let width = 0;

    const onResize = () => {
        // Match the wrapper size
        const wrapper = canvas.parentElement;
        if (wrapper) {
            width = wrapper.offsetWidth;
        } else {
            width = canvas.offsetWidth;
        }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 3,
        mapSamples: 36000,
        mapBrightness: 2.5,
        baseColor: [0.08, 0.33, 0.78],
        markerColor: [0.36, 0.42, 0.68],
        glowColor: [0.04, 0.19, 0.47],
        markers: [],
        onRender: (state) => {
            state.phi = phi;
            phi += 0.003;

            state.width = width * 2;
            state.height = width * 2;
        },
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        globe.destroy();
    });

    // Pause animation when not visible (performance)
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    globe.toggle(true);
                } else {
                    globe.toggle(false);
                }
            });
        },
        { threshold: 0.1 }
    );
    observer.observe(canvas);
})();
