/* ===== TEXT EFFECTS — Vanilla JS implementations ===== */

/* ---------- 1. TEXT REVEAL (scroll-linked word opacity) ---------- */
function initTextReveal() {
    const wrapper = document.querySelector('.text-reveal-wrapper');
    if (!wrapper) return;

    const paragraph = wrapper.querySelector('.text-reveal-text');
    if (!paragraph) return;

    /* Split text content into word spans — using DocumentFragment for single reflow */
    const text = paragraph.textContent.trim();
    const words = text.split(/\s+/);
    paragraph.innerHTML = '';

    var fragment = document.createDocumentFragment();
    const wordSpans = words.map(function (word) {
        var span = document.createElement('span');
        span.className = 'text-reveal-word';
        span.textContent = word + ' ';
        fragment.appendChild(span);
        return span;
    });
    paragraph.appendChild(fragment);

    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const minOpacity = isMobileViewport ? 0.58 : 0.52;
    let isRevealActive = false;

    /* Scroll handler — maps scroll progress to per-word opacity.
     * Starts revealing when section is 40% into the viewport (not at the very top). */
    function updateReveal() {
        var rect = wrapper.getBoundingClientRect();
        var scrollable = rect.height - window.innerHeight;

        var progress;
        if (scrollable <= 0) {
            /* Fallback for short wrappers: use viewport-relative position */
            var viewH = window.innerHeight;
            progress = Math.max(0, Math.min(1, (viewH * 0.6 - rect.top) / (viewH * 0.8)));
        } else {
            /* Offset: begin reveal when wrapper top reaches 20% from viewport top.
             * This is a middle ground — not too early, not too late. */
            var offset = window.innerHeight * 0.2;
            progress = Math.max(0, Math.min(1, (offset - rect.top) / scrollable));
        }

        wordSpans.forEach(function (span, i) {
            var start = i / wordSpans.length;
            var wordP = Math.max(0, Math.min(1, (progress - start) * wordSpans.length));
            span.style.opacity = minOpacity + wordP * (1 - minOpacity);
        });
    }

    var ticking = false;
    function onScroll() {
        if (!isRevealActive) return;
        if (!ticking) {
            requestAnimationFrame(function () {
                updateReveal();
                ticking = false;
            });
            ticking = true;
        }
    }

    const revealObserver = new IntersectionObserver(function(entries) {
        isRevealActive = !!entries[0] && entries[0].isIntersecting;
        if (isRevealActive) onScroll();
    }, {
        threshold: 0,
        rootMargin: '220px 0px 220px 0px'
    });
    revealObserver.observe(wrapper);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    isRevealActive = true;
    updateReveal();
}

/* ---------- 2. MORPHING TEXT (cycling blur transition) ---------- */
function initMorphingText() {
    var container = document.querySelector('.morphing-text-container');
    if (!container) return;

    var texts;
    try { texts = JSON.parse(container.getAttribute('data-texts')); }
    catch (e) { return; }
    if (!texts || texts.length < 2) return;

    var currentIndex = 0;

    /* Hidden element to measure text widths accurately */
    var measurer = document.createElement('span');
    measurer.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;';
    measurer.className = 'morph-text';
    container.appendChild(measurer);

    function measureText(str) {
        measurer.textContent = str;
        return measurer.offsetWidth;
    }

    function getStableWidth() {
        var maxWidth = 0;
        for (var i = 0; i < texts.length; i++) {
            maxWidth = Math.max(maxWidth, measureText(texts[i]));
        }
        return maxWidth;
    }

    /* Create two overlapping elements for cross-fade morph */
    var elA = document.createElement('span');
    var elB = document.createElement('span');
    elA.className = 'morph-text morph-active';
    elB.className = 'morph-text';
    elA.textContent = texts[0];
    elB.textContent = texts[1];
    container.appendChild(elA);
    container.appendChild(elB);

    /* Stabilize width once to avoid CLS while words rotate */
    var stableWidth = getStableWidth();
    if (stableWidth > 0) {
        container.style.width = stableWidth + 'px';
        container.style.minWidth = stableWidth + 'px';
    }

    function morphNext() {
        currentIndex = (currentIndex + 1) % texts.length;
        var nextIndex = (currentIndex + 1) % texts.length;

        var active = container.querySelector('.morph-active');
        var inactive = (active === elA) ? elB : elA;

        inactive.textContent = texts[currentIndex];

        active.classList.add('morph-exit');
        active.classList.remove('morph-active');

        inactive.classList.add('morph-active');
        inactive.classList.remove('morph-exit');

        setTimeout(function () {
            active.classList.remove('morph-exit');
            active.textContent = texts[nextIndex];
        }, 900);
    }

    var morphTimer = null;
    var lowPriorityMode = window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches;

    function startMorphing() {
        if (morphTimer || texts.length < 2) return;
        morphTimer = setInterval(morphNext, lowPriorityMode ? 3600 : 3000);
    }

    function stopMorphing() {
        if (!morphTimer) return;
        clearInterval(morphTimer);
        morphTimer = null;
    }

    if (lowPriorityMode) {
        window.addEventListener('load', function() {
            setTimeout(startMorphing, 1400);
        }, { once: true });
    } else {
        startMorphing();
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) stopMorphing();
        else startMorphing();
    });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', function () {
    initTextReveal();
    initMorphingText();
});
