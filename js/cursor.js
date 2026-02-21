/* ===== CUSTOM CURSOR — Non-Newtonian Fluid ===== */
(function () {
    'use strict';

    var hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!hasHover) return;

    /* --- Physics Config --- */
    var SPRING = 0.13;            /* spring stiffness (position follow) */
    var DAMPING = 0.72;           /* velocity damping (0 = no damp, 1 = full) */
    var STRETCH_FACTOR = 0.05;    /* how much the blob stretches with velocity */
    var STRETCH_MAX = 0.48;       /* max stretch ratio */
    var SHAPE_SPRING = 0.20;      /* how fast shape returns to circle */
    var SHAPE_DAMP_MIN = 0.42;    /* shape damping at rest (fast, elegant settle) */
    var SHAPE_DAMP_MAX = 0.62;    /* shape damping in motion (playful stretch) */
    var ANGLE_LERP = 0.18;        /* rotation smoothing — responsive direction */
    var MAGNETIC_STRENGTH = 0.35;
    var MAGNETIC_DISTANCE = 120;

    /* --- State --- */
    var mouseX = 0, mouseY = 0;
    var posX = 0, posY = 0;
    var velX = 0, velY = 0;
    var scaleX = 1, scaleY = 1;
    var scaleVelX = 0, scaleVelY = 0;
    var angle = 0;
    var isHidden = true;
    var firstMove = true;
    var magnetTarget = null;
    var isIdle = true;
    var idleTimer;

    /* --- Create DOM --- */
    var el = document.createElement('div');
    el.className = 'mf-cursor';
    el.style.opacity = '0';
    var inner = document.createElement('div');
    inner.className = 'mf-cursor-inner';
    el.appendChild(inner);
    document.body.appendChild(el);

    /* --- Events --- */
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (firstMove) { posX = mouseX; posY = mouseY; firstMove = false; }
        if (isHidden) { isHidden = false; el.style.opacity = '1'; }
        if (isIdle) { isIdle = false; requestAnimationFrame(render); }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function() { /* let render loop detect idle via velocity */ }, 150);
    });

    document.addEventListener('mouseleave', function () {
        isHidden = true; el.style.opacity = '0';
    });

    document.addEventListener('mouseenter', function () {
        isHidden = false; el.style.opacity = '1';
    });

    document.addEventListener('mousedown', function () {
        el.classList.add('mf-cursor-click');
    });
    document.addEventListener('mouseup', function () {
        el.classList.remove('mf-cursor-click');
    });

    /* --- Hover / Magnetic detection --- */
    var hoverSel = 'a, button, .btn, .nav-link, .nav-cta, .triade-card, .feature-card-nc, .faq-question, .filter-tab, .testimonial-card, input, textarea, select, [data-cursor-hover]';
    var magnetSel = '.btn, .nav-cta, .nb-arrow-button-v5, [data-cursor-magnetic]';

    document.addEventListener('mouseover', function (e) {
        if (e.target.closest(hoverSel)) el.classList.add('mf-cursor-hover');
        var m = e.target.closest(magnetSel);
        if (m) magnetTarget = m;
    });
    document.addEventListener('mouseout', function (e) {
        if (e.target.closest(hoverSel)) el.classList.remove('mf-cursor-hover');
        if (e.target.closest(magnetSel)) magnetTarget = null;
    });

    /* --- Helpers --- */
    function lerpAngle(a, b, t) {
        var d = b - a;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        return a + d * t;
    }

    /* --- Render loop: spring physics + fluid deformation --- */
    function render() {
        var tx = mouseX, ty = mouseY;

        /* Magnetic pull */
        if (magnetTarget) {
            var r = magnetTarget.getBoundingClientRect();
            var cx = r.left + r.width / 2;
            var cy = r.top + r.height / 2;
            var dx = mouseX - cx, dy = mouseY - cy;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MAGNETIC_DISTANCE) {
                var pull = (1 - dist / MAGNETIC_DISTANCE) * MAGNETIC_STRENGTH;
                tx -= dx * pull;
                ty -= dy * pull;
            }
        }

        /* Spring-based position (allows overshoot = rebound) */
        var ax = (tx - posX) * SPRING;
        var ay = (ty - posY) * SPRING;
        velX += ax;
        velY += ay;
        velX *= DAMPING;
        velY *= DAMPING;
        posX += velX;
        posY += velY;

        /* Velocity magnitude */
        var speed = Math.sqrt(velX * velX + velY * velY);

        /* Fluid stretch: elongate along movement direction */
        var stretch = Math.min(speed * STRETCH_FACTOR, STRETCH_MAX);
        var targetSX = 1 + stretch;
        var targetSY = 1 / targetSX;   /* preserve area: scaleX * scaleY ≈ 1 */

        /* Adaptive damping: playful while moving, quick elegant settle on stop */
        var speedNorm = Math.min(speed / 4, 1);
        var shapeDamp = SHAPE_DAMP_MIN + (SHAPE_DAMP_MAX - SHAPE_DAMP_MIN) * speedNorm;

        /* Spring the shape toward target stretch */
        var shapeFX = (targetSX - scaleX) * SHAPE_SPRING;
        var shapeFY = (targetSY - scaleY) * SHAPE_SPRING;
        scaleVelX += shapeFX;
        scaleVelY += shapeFY;
        scaleVelX *= shapeDamp;
        scaleVelY *= shapeDamp;
        scaleX += scaleVelX;
        scaleY += scaleVelY;

        /* Smooth rotation toward velocity direction */
        if (speed > 0.8) {
            var targetAngle = Math.atan2(velY, velX);
            angle = lerpAngle(angle, targetAngle, ANGLE_LERP);
        }

        var deg = angle * (180 / Math.PI);

        /* Apply transforms */
        el.style.transform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
        inner.style.transform =
            'rotate(' + deg + 'deg) ' +
            'scaleX(' + scaleX.toFixed(4) + ') ' +
            'scaleY(' + scaleY.toFixed(4) + ') ' +
            'rotate(' + (-deg) + 'deg)';

        /* Idle detection: stop loop when cursor has settled */
        if (speed < 0.05 && Math.abs(scaleX - 1) < 0.005 && Math.abs(scaleY - 1) < 0.005) {
            isIdle = true;
            return;
        }

        requestAnimationFrame(render);
    }

    /* Initial render starts on first mousemove via isIdle check */
})();
