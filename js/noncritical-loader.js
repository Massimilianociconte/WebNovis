(function () {
    'use strict';

    var currentScript = document.currentScript;
    var baseUrl = currentScript && currentScript.src
        ? new URL('.', currentScript.src).href
        : new URL('js/', window.location.href).href;
    var loadedScripts = new Set();

    function resolveAsset(name) {
        return new URL(name, baseUrl).href;
    }

    function loadScript(name, options) {
        var settings = options || {};
        if (loadedScripts.has(name)) return Promise.resolve();
        loadedScripts.add(name);

        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = resolveAsset(name);
            if (settings.module) {
                script.type = 'module';
            } else {
                script.defer = true;
            }
            script.onload = function () { resolve(); };
            script.onerror = function (error) {
                loadedScripts.delete(name);
                reject(error);
            };
            (document.body || document.head || document.documentElement).appendChild(script);
        });
    }

    function runOnce(fn) {
        var hasRun = false;
        return function () {
            if (hasRun) return;
            hasRun = true;
            fn();
        };
    }

    function scheduleIdle(callback, timeout) {
        var maxWait = timeout || 3000;
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(function () {
                callback();
            }, { timeout: maxWait });
            return;
        }
        setTimeout(callback, Math.min(maxWait, 1800));
    }

    function whenElementNearViewport(element, callback, rootMargin) {
        if (!element) return;
        if (!('IntersectionObserver' in window)) {
            scheduleIdle(callback, 2500);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            if (!entries.some(function (entry) { return entry.isIntersecting; })) return;
            observer.disconnect();
            callback();
        }, {
            threshold: 0,
            rootMargin: rootMargin || '240px 0px 240px 0px'
        });

        observer.observe(element);
    }

    var loadCursor = runOnce(function () {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        loadScript('cursor.min.js').catch(function () {});
    });

    window.addEventListener('mousemove', loadCursor, { passive: true, once: true });
    window.addEventListener('pointerdown', loadCursor, { passive: true, once: true });
    scheduleIdle(loadCursor, 4500);

    var loadChat = runOnce(function () {
        if (!document.getElementById('chatButton') && !document.querySelector('.weby-chat-container')) return;
        loadScript('chat.min.js').catch(function () {});
    });

    window.addEventListener('pointerdown', loadChat, { passive: true, once: true });
    window.addEventListener('keydown', loadChat, { once: true });
    window.addEventListener('scroll', loadChat, { passive: true, once: true });
    scheduleIdle(loadChat, 5500);

    var textEffectsTarget = document.querySelector('.text-reveal-wrapper, .morphing-text-container');
    var loadTextEffects = runOnce(function () {
        if (!textEffectsTarget) return;
        loadScript('text-effects.min.js').catch(function () {});
    });
    whenElementNearViewport(textEffectsTarget, loadTextEffects, '260px 0px 260px 0px');
    scheduleIdle(loadTextEffects, 3200);

    var globeTarget = document.getElementById('cobeGlobe');
    var loadGlobe = runOnce(function () {
        if (!globeTarget) return;
        loadScript('globe.min.js', { module: true }).catch(function () {});
    });
    whenElementNearViewport(globeTarget, loadGlobe, '320px 0px 320px 0px');
    scheduleIdle(loadGlobe, 4200);
})();
