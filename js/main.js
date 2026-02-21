// ===== WEBNOVIS REVOLUTION JS =====

// Mobile/Touch detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let isMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Custom cursor is now handled by cursor.js

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// Navigation scroll effect
const nav = document.getElementById('nav');

// Nav scroll effect is handled by the unified scroll controller below

// Mobile menu toggle with body scroll lock
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
let scrollPosition = 0;

// Forward-declared as no-ops; overridden inside the if(navMenu && navToggle) block below
function openMobileMenu() {}
function closeMobileMenu() {}
const navLinks = document.querySelectorAll('.nav-link');

if (navMenu && navToggle) {
    const closeButton = document.createElement('button');
    closeButton.className = 'nav-menu-close';
    closeButton.innerHTML = '✕';
    closeButton.setAttribute('aria-label', 'Chiudi menu');
    navMenu.insertBefore(closeButton, navMenu.firstChild);

    openMobileMenu = function() {
        scrollPosition = window.pageYOffset;
        navMenu.classList.add('active');
        navToggle.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
        document.body.style.top = `-${scrollPosition}px`;
    };

    closeMobileMenu = function() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.top = '';
        window.scrollTo(0, scrollPosition);
        requestAnimationFrame(function() {
            document.documentElement.style.scrollBehavior = '';
        });
        // Delay removing menu-open so .nav doesn't snap back to pill
        // while the nav-menu is still sliding out (0.5s transform)
        setTimeout(function() {
            document.body.classList.remove('menu-open');
        }, 500);
    };

    navToggle.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    closeButton.addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
}

// Smooth scroll - use native on mobile for better performance
// Native smooth scroll (fallback / mobile)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            // Close mobile menu if open
            closeMobileMenu();

            // Use scrollIntoView for better mobile support
            const navHeight = 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: isMobile ? 'auto' : 'smooth'
            });

            // On mobile, use instant scroll then slight delay for visual feedback
            if (isMobile) {
                setTimeout(() => {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'auto'
                    });
                }, 50);
            }
        }
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, observerOptions);

// Observe all sections and cards (initial hidden state is in CSS — no inline styles)
const animatedElements = document.querySelectorAll('.triade-card, .service-section, .cta-section');
animatedElements.forEach(el => {
    observer.observe(el);
});

// ===== UNIFIED SCROLL CONTROLLER =====
// Consolidates all scroll listeners into one rAF-gated, passive handler
const gradientOrbs = document.querySelectorAll('.gradient-orb');
const allSections = document.querySelectorAll('section');
const isHomepage = !document.querySelector('.portfolio-hero');

(function() {
    var scrollTicking = false;

    function onScrollFrame() {
        var scrollY = window.pageYOffset;
        var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // 1. Nav scrolled class
        if (nav) {
            var shouldScroll = scrollY > 100;
            if (shouldScroll && !nav.classList.contains('scrolled')) nav.classList.add('scrolled');
            else if (!shouldScroll && nav.classList.contains('scrolled')) nav.classList.remove('scrolled');
        }

        // 2. Parallax orbs (desktop + homepage only)
        if (!isMobile) {
            for (var i = 0; i < gradientOrbs.length; i++) {
                var speed = 0.5 + (i * 0.2);
                gradientOrbs[i].style.transform = 'translateY(' + (scrollY * speed) + 'px)';
            }
        }

        // 3. Background color change (homepage only)
        if (isHomepage) {
            var newBackground = '';
            for (var s = 0; s < allSections.length; s++) {
                var rect = allSections[s].getBoundingClientRect();
                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                    var cls = allSections[s].className;
                    if (cls.indexOf('hero') !== -1) newBackground = 'var(--dark)';
                    else if (cls.indexOf('triade') !== -1) newBackground = 'linear-gradient(180deg, var(--dark) 0%, var(--dark-light) 100%)';
                }
            }
            if (newBackground) document.body.style.background = newBackground;
        }

        // 4. Back to top button
        var btt = document.getElementById('backToTop');
        if (btt) {
            var show = scrollY > 500;
            if (show && !btt.classList.contains('visible')) btt.classList.add('visible');
            else if (!show && btt.classList.contains('visible')) btt.classList.remove('visible');
        }

        // 5. Scroll progress bar (transform-based — no repaint)
        var pb = document.querySelector('.scroll-progress');
        if (pb && docH > 0) {
            pb.style.transform = 'scaleX(' + (scrollY / docH) + ')';
        }

        // 6. WhatsApp float
        var wa = document.getElementById('whatsappFloat');
        if (wa) {
            if (scrollY > 300) {
                wa.style.opacity = '1';
                wa.style.transform = 'translateY(0)';
            } else {
                wa.style.opacity = '0';
                wa.style.transform = 'translateY(20px)';
            }
        }

        // 7. Active nav highlight
        highlightNav();

        scrollTicking = false;
    }

    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(onScrollFrame);
            scrollTicking = true;
        }
    }, { passive: true });
})();

// Add hover effect to triade cards
const triadeCards = document.querySelectorAll('.triade-card');
triadeCards.forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');

// Cache section geometry to avoid forced reflow on every scroll frame
var sectionCache = [];
var sectionCacheDirty = true;

function buildSectionCache() {
    sectionCache = [];
    sections.forEach(function(section) {
        sectionCache.push({
            id: section.getAttribute('id'),
            top: section.offsetTop - 100,
            bottom: section.offsetTop - 100 + section.offsetHeight
        });
    });
    sectionCacheDirty = false;
}

window.addEventListener('resize', function() { sectionCacheDirty = true; });
window.addEventListener('load', function() { sectionCacheDirty = true; });

const highlightNav = () => {
    if (sectionCacheDirty) buildSectionCache();
    const scrollY = window.pageYOffset;
    let activeId = '';

    // Pure reads from cache — no layout forced
    for (var i = 0; i < sectionCache.length; i++) {
        if (scrollY > sectionCache[i].top && scrollY <= sectionCache[i].bottom) {
            activeId = sectionCache[i].id;
        }
    }

    // Batch WRITES
    if (activeId) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + activeId) {
                if (!link.classList.contains('active')) link.classList.add('active');
            } else {
                if (link.classList.contains('active')) link.classList.remove('active');
            }
        });
    }
};

// Page loaded — ensure visibility (CSS handles fade-in via .page-loaded class)
window.addEventListener('load', () => {
    document.body.classList.add('page-loaded');
});

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// highlightNav is now called from the unified scroll controller above


// ===== EFFETTI CLAMOROSI AVANZATI =====

// Particle System nel Canvas - OPTIMIZED FOR MOBILE
const canvas = document.getElementById('particlesCanvas');

// Skip particles on mobile or if reduced motion is preferred
if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const particleCount = isMobile ? 30 : 100;
    const connectionDistance = isMobile ? 60 : 100;
    let canvasVisible = true;

    // Stop animation when canvas is not visible
    const canvasObserver = new IntersectionObserver((entries) => {
        canvasVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    canvasObserver.observe(canvas);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }

        draw() {
            ctx.fillStyle = `rgba(91, 106, 174, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    var particleFrameCount = 0;

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var pi = 0; pi < particles.length; pi++) {
            particles[pi].update();
            particles[pi].draw();
        }

        // Connetti particelle vicine — frame-skip: draw connections every 2nd frame
        if (++particleFrameCount % 2 === 0 && (!isMobile || window.innerWidth > 480)) {
            const maxDistSq = connectionDistance * connectionDistance;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;

                    if (distSq < maxDistSq) {
                        const distance = Math.sqrt(distSq);
                        ctx.strokeStyle = `rgba(91, 106, 174, ${0.2 * (1 - distance / connectionDistance)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        if (canvasVisible) requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Re-start animation when canvas becomes visible again
    const restartObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && canvasVisible) animateParticles();
    }, { threshold: 0 });
    restartObserver.observe(canvas);
}

// Effetto Magnetico sulle Card
const magneticElements = document.querySelectorAll('.magnetic');

magneticElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const moveX = x * 0.15;
        const moveY = y * 0.15;

        element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    });

    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0) scale(1)';
    });
});

// Effetto 3D Tilt sulle Visual Cards (desktop only)
const visualCards = document.querySelectorAll('.floating-3d');

if (!isTouchDevice) {
    visualCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
} else {
    // Touch device: add subtle tap feedback instead of continuous tilt
    visualCards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.classList.add('touch-active');
        });
        card.addEventListener('touchend', () => {
            setTimeout(() => card.classList.remove('touch-active'), 300);
        });
    });
}

// Scroll Reveal Avanzato con Stagger (usa il revealObserver già definito sopra)
document.querySelectorAll('.triade-card, .service-section, .stat-item').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Effetto Ripple sui Click - Solo su .btn
document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn')) return;
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(91, 106, 174, 0.6) 0%, rgba(58, 71, 133, 0.3) 50%, transparent 70%);
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%) scale(0);
        animation: rippleEffect 0.6s ease-out forwards;
    `;

    document.body.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
});

// Aggiungi keyframe per ripple
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        to {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Effetto Typing per il Code Window
const codeLines = document.querySelectorAll('.code-line');
const codeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'typing 2s steps(30) forwards, blink 0.75s step-end infinite';
        }
    });
}, { threshold: 0.5 });

codeLines.forEach(line => {
    codeObserver.observe(line);
});

// Lazy Loading per le immagini (se aggiunte in futuro)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}


// Easter Egg and decorative console.logs removed for production performance


// ===== STUNNING INTERACTIONS =====

// Counter Animation for Numbers
const numberItems = document.querySelectorAll('.number-item');

const animateCounter = (element) => {
    const target = parseInt(element.dataset.count);
    const valueElement = element.querySelector('.number-value');
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            valueElement.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            valueElement.textContent = target;
        }
    };

    updateCounter();
};

const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            numberObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

numberItems.forEach(item => numberObserver.observe(item));

// Floating Action Button - Removed (now using chat button)

// Back to Top Button — visibility handled by unified scroll controller
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Scroll Progress Bar — scroll update handled by unified controller (transform-based)
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.transformOrigin = 'left';
    progressBar.style.willChange = 'transform';
    progressBar.style.transform = 'scaleX(0)';
    document.body.appendChild(progressBar);
};

createScrollProgress();

// Enhanced Testimonials Slider with Auto-rotate
const testimonialCards = document.querySelectorAll('.testimonial-card');
let currentTestimonial = 0;

const rotateTestimonials = () => {
    testimonialCards.forEach((card, index) => {
        card.style.transform = index === currentTestimonial
            ? 'scale(1.05) translateY(-10px)'
            : 'scale(1) translateY(0)';
        card.style.opacity = index === currentTestimonial ? '1' : '0.7';
    });

    currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
};

// Auto-rotate every 5 seconds (with IntersectionObserver to pause when hidden)
if (testimonialCards.length > 0) {
    let testimonialInterval;
    const testimonialsSection = document.querySelector('.testimonials-section');
    
    if (testimonialsSection) {
        const testimonialObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!testimonialInterval) {
                    testimonialInterval = setInterval(rotateTestimonials, 5000);
                }
            } else {
                clearInterval(testimonialInterval);
                testimonialInterval = null;
            }
        });
        testimonialObserver.observe(testimonialsSection);
    } else {
        setInterval(rotateTestimonials, 5000);
    }
}

// Parallax Effect on Mouse Move — viewport-gated (only active when hero is visible)
const floatingCardsParallax = document.querySelectorAll('.floating-card');
const orbsParallax = document.querySelectorAll('.gradient-orb');

(function() {
    var mouseParallaxActive = false;
    var heroSection = document.querySelector('.hero');
    if (heroSection) {
        var parallaxVisObserver = new IntersectionObserver(function(entries) {
            mouseParallaxActive = entries[0].isIntersecting;
        }, { threshold: 0 });
        parallaxVisObserver.observe(heroSection);
    }

    document.addEventListener('mousemove', function(e) {
        if (!mouseParallaxActive || isMobile) return;
        var mx = e.clientX / window.innerWidth;
        var my = e.clientY / window.innerHeight;

        for (var i = 0; i < floatingCardsParallax.length; i++) {
            var speed = (i + 1) * 10;
            floatingCardsParallax[i].style.transform = 'translate(' + ((mx - 0.5) * speed) + 'px,' + ((my - 0.5) * speed) + 'px)';
        }

        for (var j = 0; j < orbsParallax.length; j++) {
            var sp = (j + 1) * 20;
            orbsParallax[j].style.transform = 'translate(' + ((mx - 0.5) * sp) + 'px,' + ((my - 0.5) * sp) + 'px)';
        }
    }, { passive: true });
})();

// Smooth Reveal for Sections
const revealSections = document.querySelectorAll('.service-section, .testimonials-section, .tech-stack-section');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 1s ease forwards';
        }
    });
}, { threshold: 0.2 });

revealSections.forEach(section => sectionObserver.observe(section));

// Modern Social Feed with Seamless Infinite Scroll
const socialFeedScroll = document.getElementById('socialFeedScroll');
if (socialFeedScroll) {

    // Detect if mobile
    const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;

    // Wait for DOM to be fully loaded
    setTimeout(() => {
        // Clone feed posts to create seamless loop (only on desktop)
        const posts = Array.from(socialFeedScroll.querySelectorAll('.feed-post'));

        // Calculate original content height — batch reads to avoid layout thrashing
        var heights = posts.map(function(p) { return p.offsetHeight; });
        var margins = posts.map(function(p) { return parseInt(getComputedStyle(p).marginBottom) || 0; });
        let originalHeight = 0;
        for (var hi = 0; hi < posts.length; hi++) { originalHeight += heights[hi] + margins[hi]; }

        // Only enable auto-scroll on desktop
        if (!isMobileDevice) {
            const clonedPosts = posts.map(post => post.cloneNode(true));
            clonedPosts.forEach(clone => {
                socialFeedScroll.appendChild(clone);
            });

            let scrollPosition = 0;
            let isScrolling = true;
            let scrollSpeed = 0.5;


            // Auto scroll function with seamless loop
            function autoScroll() {
                if (isScrolling) {
                    scrollPosition += scrollSpeed;
                    if (scrollPosition >= originalHeight) {
                        scrollPosition = 0;
                    }
                    socialFeedScroll.scrollTop = scrollPosition;
                }
                requestAnimationFrame(autoScroll);
            }

            autoScroll();

            // Pause on hover (desktop only)
            socialFeedScroll.addEventListener('mouseenter', () => {
                isScrolling = false;
            });

            socialFeedScroll.addEventListener('mouseleave', () => {
                isScrolling = true;
            });
        } else {
            // Mobile: no auto-scroll, user controls scrolling
        }
    }, 100);

    // Animate stats counters (with limits to avoid infinite growth)
    const feedStats = document.querySelectorAll('.feed-stats span');
    feedStats.forEach((stat, index) => {
        let iterations = 0;
        const maxIterations = 100; // Stop after ~5 minutes to prevent absurd numbers

        const statInterval = setInterval(() => {
            if (iterations++ > maxIterations) {
                clearInterval(statInterval);
                return;
            }
            
            const currentText = stat.textContent;
            const match = currentText.match(/[\d.]+K?/);
            if (match) {
                let value = parseFloat(match[0].replace('K', ''));
                const isK = match[0].includes('K');

                if (isK) {
                    value += 0.1;
                    stat.textContent = stat.textContent.replace(/[\d.]+K/, value.toFixed(1) + 'K');
                } else {
                    value += Math.floor(Math.random() * 3) + 1;
                    stat.textContent = stat.textContent.replace(/\d+/, value);
                }
            }
        }, 3000 + (index * 1000));
    });

    // Add click effect to stats
    feedStats.forEach(stat => {
        stat.addEventListener('click', () => {
            stat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
            }, 200);
        });
    });
}

// Interactive Tech Stack Items
const techItems = document.querySelectorAll('.tech-item');

techItems.forEach(item => {
    item.addEventListener('mouseenter', function () {
        const icon = this.querySelector('.tech-icon');
        icon.style.transform = 'scale(1.3) rotate(360deg)';
        icon.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    });

    item.addEventListener('mouseleave', function () {
        const icon = this.querySelector('.tech-icon');
        icon.style.transform = 'scale(1) rotate(0deg)';
    });
});

// Brevo Newsletter Helper — centralizzato per widget e form contatto
// Deduplicazione automatica lato server (Brevo updateEnabled: true)
async function subscribeToNewsletter(email, name, source) {
    try {
        const response = await fetch('/api/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email.trim().toLowerCase(),
                name: name || '',
                source: source || 'website'
            })
        });
        const data = await response.json();
        return { success: data.success || false, duplicate: data.duplicate || false };
    } catch (err) {
        console.warn('Newsletter subscription failed:', err.message);
        return { success: false };
    }
}

// Enhanced Form Validation with Visual Feedback
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    // Sync user email → hidden replyto field so Web3Forms sets correct Reply-To
    const emailInput = contactForm.querySelector('input[name="email"]');
    const replytoInput = contactForm.querySelector('input[name="replyto"]');
    if (emailInput && replytoInput) {
        emailInput.addEventListener('input', () => { replytoInput.value = emailInput.value; });
    }

    const fields = contactForm.querySelectorAll('.form-group input, .form-group textarea, .form-group select');
    const requiredFields = contactForm.querySelectorAll('.form-group [required]');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const termsCheckbox = contactForm.querySelector('#termsCheckbox');
    const termsLabel = contactForm.querySelector('#termsCheckboxLabel');
    const termsErrorMessage = contactForm.querySelector('#termsErrorMessage');

    const setFieldState = (field, isValid, showError = true) => {
        const group = field.closest('.form-group');
        if (!group) return;

        if (isValid) {
            group.classList.remove('is-invalid');
        } else if (showError) {
            group.classList.add('is-invalid');
        }
    };

    const validateField = (field, showError = true) => {
        const value = field.value.trim();
        const isValid = field.type === 'email'
            ? (value !== '' && field.checkValidity())
            : value !== '';

        setFieldState(field, isValid, showError);
        return isValid;
    };

    const setTermsState = (isValid, showError = true) => {
        if (!termsLabel) return;

        if (isValid) {
            termsLabel.classList.remove('error');
            if (termsErrorMessage) termsErrorMessage.classList.remove('visible');
        } else if (showError) {
            termsLabel.classList.add('error');
            if (termsErrorMessage) termsErrorMessage.classList.add('visible');
        }
    };

    const validateTerms = (showError = true) => {
        if (!termsCheckbox) return true;
        const isValid = termsCheckbox.checked;
        setTermsState(isValid, showError);
        return isValid;
    };

    const validateForm = (showErrors = true) => {
        let isValid = true;

        requiredFields.forEach(field => {
            if (!validateField(field, showErrors)) {
                isValid = false;
            }
        });

        if (!validateTerms(showErrors)) {
            isValid = false;
        }

        return isValid;
    };

    const updateSubmitState = () => {
        if (!submitButton) return;
        submitButton.disabled = !validateForm(false);
    };

    const clearValidationState = () => {
        contactForm.querySelectorAll('.form-group.is-invalid').forEach(group => {
            group.classList.remove('is-invalid');
        });
        setTermsState(true, false);
    };

    fields.forEach(field => {
        field.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        field.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';

            if (this.hasAttribute('required')) {
                validateField(this, true);
            }

            updateSubmitState();
        });

        const liveEvent = field.tagName === 'SELECT' ? 'change' : 'input';
        field.addEventListener(liveEvent, function () {
            if (this.hasAttribute('required')) {
                const group = this.closest('.form-group');
                const showError = !!(group && group.classList.contains('is-invalid'));
                validateField(this, showError);
            }

            updateSubmitState();
        });
    });

    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', function () {
            validateTerms(true);
            updateSubmitState();
        });
    }

    updateSubmitState();

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm(true)) {
            const firstInvalidField = contactForm.querySelector('.form-group.is-invalid input, .form-group.is-invalid textarea, .form-group.is-invalid select');
            if (firstInvalidField) {
                firstInvalidField.focus();
            } else if (termsLabel) {
                termsLabel.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            updateSubmitState();
            return;
        }

        const button = contactForm.querySelector('button[type="submit"]');
        const resultDiv = contactForm.querySelector('#formResult');
        const originalHTML = button.innerHTML;

        // Disable button and show loading
        button.disabled = true;
        button.innerHTML = '<span>Invio in corso...</span>';

        try {
            const formData = new FormData(contactForm);

            // Safety-net: ensure replyto mirrors the user's email at submit time
            const emailVal = contactForm.querySelector('input[name="email"]');
            if (emailVal && emailVal.value) formData.set('replyto', emailVal.value);

            // Ensure multistep selections are explicitly included in the email
            const goalEl = document.getElementById('goalInput');
            const budgetEl = document.getElementById('budgetInput');
            if (goalEl && goalEl.value) {
                formData.set('obiettivo', goalEl.value);
                formData.set('subject', 'Nuovo messaggio — ' + goalEl.value);
            }
            if (budgetEl && budgetEl.value) {
                formData.set('budget', budgetEl.value);
            }

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Meta Pixel: Lead conversion event
                trackMetaEvent('Lead', { content_name: 'Contact Form' });

                // Se il checkbox newsletter è selezionato, iscrivi a Brevo
                const newsletterBox = document.getElementById('newsletterCheckbox');
                if (newsletterBox && newsletterBox.checked) {
                    const email = contactForm.querySelector('input[name="email"]');
                    const name = contactForm.querySelector('input[name="name"]');
                    subscribeToNewsletter(
                        email ? email.value : '',
                        name ? name.value : '',
                        'contact-form'
                    );
                }

                // Success
                button.innerHTML = '<span>✓ Messaggio Inviato!</span>';
                button.style.background = 'linear-gradient(135deg, #14b8a6, #10b981)';
                if (resultDiv) {
                    resultDiv.style.display = 'block';
                    resultDiv.style.background = 'rgba(20, 184, 166, 0.1)';
                    resultDiv.style.color = '#14b8a6';
                    resultDiv.textContent = newsletterBox && newsletterBox.checked
                        ? 'Grazie! Ti risponderemo al più presto. Iscrizione alla newsletter confermata!'
                        : 'Grazie! Ti risponderemo al più presto.';
                }
                contactForm.reset();
                clearValidationState();
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.style.background = '';
                    if (resultDiv) resultDiv.style.display = 'none';
                    updateSubmitState();
                }, 4000);
            } else {
                throw new Error(data.message || 'Errore nell\'invio');
            }
        } catch (error) {
            button.innerHTML = originalHTML;
            updateSubmitState();
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.style.background = 'rgba(239, 68, 68, 0.1)';
                resultDiv.style.color = '#ef4444';
                resultDiv.textContent = 'Errore nell\'invio. Riprova o scrivici a hello@webnovis.com';
                setTimeout(() => { resultDiv.style.display = 'none'; }, 5000);
            }
        }
    });
}

// Text Typing Effect for Hero
const createTypingEffect = (element, text, speed = 100) => {
    let i = 0;
    element.textContent = '';

    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };

    type();
};

// Magnetic Button Effect
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translate(0, 0)';
    });
});

// Intersection Observer for Stagger Animation
const staggerElements = document.querySelectorAll('.service-features li');

const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.5 });

staggerElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    staggerObserver.observe(el);
});

// ===== EFFETTO MACCHINA DA SCRIVERE PER CODICE - RIDOTTO =====
(function() {
    const codeToType = `import React from 'react';
import { Performance, SEO } from '@webnovis/core';

function WebNovis() {
  return (
    <div className="website">
      <Performance level="ultra" />
      <SEO optimized={true} />
      <header className="hero">
        <h1>Il Tuo Brand</h1>
      </header>
    </div>
  );
}`;

    let codeIndex = 0;
    let lineNumber = 1;
    let isTyping = false;

    const colorSyntax = (char, previousText) => {
        const lastWord = previousText.split(/[\s\n(){}<>[\];,.]/).pop() + char;

        const keywords = ['import', 'from', 'function', 'return', 'const', 'let', 'var', 'export', 'default', 'className', 'key'];
        const components = ['React', 'Performance', 'SEO', 'Design', 'ServiceCard'];
        const values = ['true', 'false', 'null', 'undefined'];

        if (keywords.some(kw => lastWord.includes(kw))) {
            return `<span style="color: #ec4899">${char}</span>`;
        } else if (components.some(comp => lastWord.includes(comp))) {
            return `<span style="color: #14b8a6">${char}</span>`;
        } else if (values.some(val => lastWord.includes(val))) {
            return `<span style="color: #f59e0b">${char}</span>`;
        } else if (char === '"' || char === "'" || char === '`') {
            return `<span style="color: #10b981">${char}</span>`;
        } else if (char === '{' || char === '}' || char === '(' || char === ')' || char === '[' || char === ']') {
            return `<span style="color: #818cf8">${char}</span>`;
        } else if (char === '/' && previousText.slice(-1) === '/') {
            return `<span style="color: #64748b">${char}</span>`;
        }

        return char;
    };

    const typeCode = () => {
        const codeContent = document.getElementById('codeContent');
        const typingArea = codeContent?.querySelector('.code-typing-area');
        const cursor = codeContent?.querySelector('.code-cursor');

        if (!typingArea || isTyping) return;

        isTyping = true;

        const typeCharacter = () => {
            if (codeIndex < codeToType.length) {
                const char = codeToType[codeIndex];

                const currentText = typingArea.innerHTML;

                if (char === '\n') {
                    typingArea.innerHTML = currentText + '\n';
                    lineNumber++;
                } else {
                    const coloredChar = colorSyntax(char, codeToType.substring(0, codeIndex));
                    typingArea.innerHTML = currentText + coloredChar;
                }

                codeIndex++;

                const speed = char === '\n' ? 100 : (Math.random() * 50 + 30);

                if (codeContent) {
                    codeContent.scrollTop = codeContent.scrollHeight;
                }

                setTimeout(typeCharacter, speed);
            } else {
                setTimeout(() => {
                    if (cursor) cursor.style.display = 'none';
                }, 1000);

                setTimeout(() => {
                    codeIndex = 0;
                    lineNumber = 1;
                    typingArea.innerHTML = '';
                    if (cursor) cursor.style.display = 'inline-block';
                    isTyping = false;
                    setTimeout(() => typeCharacter(), 100);
                }, 2000);
            }
        };

        typeCharacter();
    };

    const codeWindowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isTyping) {
                setTimeout(() => {
                    typeCode();
                }, 500);
                codeWindowObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const codeWindow = document.getElementById('codeContent');
    if (codeWindow) {
        codeWindowObserver.observe(codeWindow);
    }
})();

// Sound Effects (Optional - uncomment to enable)
/*
const createSound = (frequency, duration) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
};

// Add sound to button clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        createSound(800, 0.1);
    });
});
*/

// Performance Monitoring
let lastFrameTime = performance.now();
let currentFps = 60;

const monitorPerformance = () => {
    const currentTime = performance.now();
    const delta = currentTime - lastFrameTime;
    currentFps = Math.round(1000 / delta);
    lastFrameTime = currentTime;

    // Log performance warnings
    if (currentFps < 30) {
        console.warn('Low FPS detected:', currentFps);
    }

    requestAnimationFrame(monitorPerformance);
};

// monitorPerformance(); // Uncomment to enable performance monitoring

// NOTE: Critical image preloading should be done via <link rel="preload"> in HTML <head>,
// not at JS runtime (too late). Removed JS-based preloadResources() — use HTML preload hints instead.

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

const GA_MEASUREMENT_ID = 'G-BPMBY6RTKP';

const hasAnalyticsConsent = () => {
    try {
        return localStorage.getItem('cookie_consent') === 'accepted';
    } catch (err) {
        return false;
    }
};

const enableAnalyticsTracking = () => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

    // GA4: update consent + load script if not yet loaded
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted'
        });

        if (!window.__gaConfigured) {
            var gs = document.createElement('script');
            gs.async = true;
            gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
            document.head.appendChild(gs);
            window.gtag('js', new Date());
            window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
            window.__gaConfigured = true;
        }

        // Flush pending AI referral event (detected before consent was given)
        if (window.__pendingAiReferral) {
            window.gtag('event', 'ai_referral', {
                event_category: 'AI Traffic',
                event_label: window.__pendingAiReferral,
                non_interaction: false
            });
            window.__pendingAiReferral = null;
        }
    }

    // Clarity: bootstrap + grant consent (script loads only now)
    if (typeof window.clarity !== 'function') {
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, 'clarity', 'script', 'vjbr983er7');
    }
    if (typeof window.clarity === 'function') {
        window.clarity('consent');
    }

    // Meta Pixel: bootstrap + grant consent (script loads only now)
    if (typeof window.fbq !== 'function') {
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', '1405109048327436');
    }
    if (typeof window.fbq === 'function') {
        window.fbq('consent', 'grant');
        window.fbq('track', 'PageView');
    }
};

const disableAnalyticsTracking = () => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
    }

    if (typeof window.clarity === 'function') {
        window.clarity('consent', false);
    }

    if (typeof window.fbq === 'function') {
        window.fbq('consent', 'revoke');
    }
};

// Analytics Event Tracking
const trackEvent = (category, action, label) => {
    if (hasAnalyticsConsent() && typeof window.gtag === 'function') {
        window.gtag('event', action, { 'event_category': category, 'event_label': label });
    }
};

// Meta Pixel Event Tracking (consent-gated)
const trackMetaEvent = (eventName, params) => {
    if (hasAnalyticsConsent() && typeof window.fbq === 'function') {
        if (params) {
            window.fbq('track', eventName, params);
        } else {
            window.fbq('track', eventName);
        }
    }
};

// Track button clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        trackEvent('Button', 'Click', button.textContent.trim());
    });
});

// Track section views
const trackSectionView = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            trackEvent('Section', 'View', entry.target.id || entry.target.className);
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => trackSectionView.observe(section));



// ===== NICOLE CURIONI INSPIRED INTERACTIONS =====

// 1. Hero Rotating Words
const rotatingWords = document.querySelectorAll('.hero-rotating-word');
if (rotatingWords.length > 0) {
    let currentWordIndex = 0;
    const rotatingWrapper = rotatingWords[0].closest('.hero-rotating-wrapper');

    const updateWrapperWidth = (wordEl) => {
        if (!rotatingWrapper) return;
        const measured = wordEl.scrollWidth || wordEl.offsetWidth;
        if (measured > 0) rotatingWrapper.style.width = (measured + 12) + 'px';
    };

    updateWrapperWidth(rotatingWords[currentWordIndex]);

    setInterval(() => {
        const currentWord = rotatingWords[currentWordIndex];
        currentWord.classList.remove('active');
        currentWord.classList.add('exit-up');

        setTimeout(() => {
            currentWord.classList.remove('exit-up');
        }, 500);

        currentWordIndex = (currentWordIndex + 1) % rotatingWords.length;
        const nextWord = rotatingWords[currentWordIndex];
        nextWord.classList.add('active');
        updateWrapperWidth(nextWord);
    }, 2500);
}

// 2. Animated Counters (NC Style)
const counterValues = document.querySelectorAll('.counter-value');

const animateCounterNC = (element) => {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easedProgress * target);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    requestAnimationFrame(updateCounter);
};

const counterObserverNC = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counterEl = entry.target.querySelector('.counter-value');
            if (counterEl) {
                animateCounterNC(counterEl);
            }
            counterObserverNC.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-item').forEach(item => {
    counterObserverNC.observe(item);
});

// 3. Process Timeline Stagger Reveal
const processSteps = document.querySelectorAll('.process-step');
const processObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll('.process-step');
            steps.forEach((step, index) => {
                setTimeout(() => {
                    step.classList.add('revealed');
                }, index * 200);
            });
            processObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const processTimeline = document.getElementById('processTimeline');
if (processTimeline) {
    processObserver.observe(processTimeline);
}

// 4. FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const btn = otherItem.querySelector('.faq-question');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            question.setAttribute('aria-expanded', !isActive);
        });
    }
});

// 5. Newsletter Form Handler (Widget homepage + Brevo sync)
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const button = newsletterForm.querySelector('button');
        if (!emailInput || !emailInput.value) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Invio...';

        try {
            // 1. Invia notifica via Web3Forms (email di notifica)
            const formData = new FormData(newsletterForm);
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                // 2. Iscrivi a Brevo (lista newsletter centralizzata)
                subscribeToNewsletter(emailInput.value, '', 'newsletter-widget');

                button.textContent = '✓ Iscritto!';
                button.style.background = 'linear-gradient(135deg, #14b8a6, #10b981)';
                emailInput.value = '';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                    button.disabled = false;
                }, 3000);
            } else {
                throw new Error(data.message || 'Errore');
            }
        } catch (error) {
            button.textContent = 'Errore, riprova';
            button.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    });
}

// 6. WhatsApp Button — visibility handled by unified scroll controller
const whatsappFloat = document.getElementById('whatsappFloat');

if (whatsappFloat) {
    whatsappFloat.style.opacity = '0';
    whatsappFloat.style.transform = 'translateY(20px)';
    whatsappFloat.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
}

// 7. Observe new sections for reveal animations
const ncSections = document.querySelectorAll('.process-section, .features-section, .faq-section, .newsletter-section, .counters-section');
ncSections.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// 8. Feature Cards hover effects
const featureCardsNC = document.querySelectorAll('.feature-card-nc');
featureCardsNC.forEach(card => {
    card.classList.add('reveal');
    revealObserver.observe(card);
});

// ===== COOKIE CONSENT BANNER =====
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');
const storedCookieConsent = (() => {
    try {
        return localStorage.getItem('cookie_consent');
    } catch (err) {
        return null;
    }
})();

if (storedCookieConsent === 'accepted') {
    enableAnalyticsTracking();
} else {
    disableAnalyticsTracking();
}

if (cookieBanner) {
    if (!storedCookieConsent) {
        // Show banner after short delay (CSS hides it via transform by default)
        setTimeout(() => cookieBanner.classList.add('visible'), 800);

        const dismissBanner = (choice) => {
            try {
                localStorage.setItem('cookie_consent', choice);
            } catch (err) {
                // Ignore storage errors (private mode / browser policy)
            }

            if (choice === 'accepted') {
                enableAnalyticsTracking();
            } else {
                disableAnalyticsTracking();
            }

            cookieBanner.classList.remove('visible');
            cookieBanner.style.display = 'none';
        };

        cookieAccept?.addEventListener('click', () => dismissBanner('accepted'));
        cookieReject?.addEventListener('click', () => dismissBanner('rejected'));
    } else {
        // Already consented — hide permanently via display:none
        cookieBanner.style.display = 'none';
    }
}

// ===== B. MULTI-STEP CONTACT FORM =====
const multistepForm = document.querySelector('.multistep-form');

if (multistepForm) {
    const steps = multistepForm.querySelectorAll('.ms-step');
    const dots = multistepForm.querySelectorAll('.ms-step-dot');
    const progressFill = document.getElementById('msProgressFill');
    let currentStep = 1;

    // Service pricing tiers (from site pricing: Sito €1.200, E-Commerce €3.500, Branding €400-€1.500, Social €300-€1.200/mo, Restyling ~€1.200)
    const servicePricingTiers = {
        'Sito Web':        [1500, 3000, 5000],
        'E-Commerce':      [4000, 7000, 12000],
        'Branding / Logo': [800, 1500, 3000],
        'Social Media':    [500, 1000, 2000],
        'Restyling Sito':  [1500, 3000, 5000],
        'Altro':           [1000, 3000, 5000]
    };

    // Lucide SVG icons for budget tiers
    const budgetIcons = {
        sprout: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>',
        rocket: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
        zap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
        trophy: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
        circleHelp: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>'
    };

    const fmtEuro = (val) => '€' + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const roundTo500 = (val) => Math.round(val / 500) * 500;

    const computeBudgetTiers = (selectedGoals) => {
        if (!selectedGoals || selectedGoals.length === 0) {
            return [
                { value: '< €1.000', label: 'Meno di €1.000', icon: 'sprout' },
                { value: '€1.000 - €3.000', label: '€1.000 — €3.000', icon: 'rocket' },
                { value: '€3.000 - €5.000', label: '€3.000 — €5.000', icon: 'zap' },
                { value: '> €5.000', label: 'Oltre €5.000', icon: 'trophy' },
                { value: 'Da definire', label: 'Da definire', icon: 'circleHelp' }
            ];
        }

        let t1 = 0, t2 = 0, t3 = 0;
        selectedGoals.forEach(goal => {
            const tiers = servicePricingTiers[goal] || servicePricingTiers['Altro'];
            t1 += tiers[0];
            t2 += tiers[1];
            t3 += tiers[2];
        });

        t1 = roundTo500(t1);
        t2 = roundTo500(t2);
        t3 = roundTo500(t3);

        return [
            { value: '< ' + fmtEuro(t1), label: 'Meno di ' + fmtEuro(t1), icon: 'sprout' },
            { value: fmtEuro(t1) + ' - ' + fmtEuro(t2), label: fmtEuro(t1) + ' — ' + fmtEuro(t2), icon: 'rocket' },
            { value: fmtEuro(t2) + ' - ' + fmtEuro(t3), label: fmtEuro(t2) + ' — ' + fmtEuro(t3), icon: 'zap' },
            { value: '> ' + fmtEuro(t3), label: 'Oltre ' + fmtEuro(t3), icon: 'trophy' },
            { value: 'Da definire', label: 'Da definire', icon: 'circleHelp' }
        ];
    };

    const renderBudgetOptions = (container, tiers) => {
        container.innerHTML = tiers.map(tier =>
            '<button type="button" class="ms-option" data-value="' + tier.value + '">' +
            budgetIcons[tier.icon] + '<span>' + tier.label + '</span></button>'
        ).join('');
    };

    const goToStep = (stepNum) => {
        // Hide current step
        steps.forEach(s => s.classList.remove('active'));
        dots.forEach(d => {
            const dStep = parseInt(d.dataset.step);
            d.classList.remove('active');
            if (dStep < stepNum) d.classList.add('completed');
            else d.classList.remove('completed');
            if (dStep === stepNum) d.classList.add('active');
        });

        // Show target step
        const targetStep = multistepForm.querySelector(`.ms-step[data-step="${stepNum}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
            // Re-trigger animation
            targetStep.style.animation = 'none';
            targetStep.offsetHeight; // reflow
            targetStep.style.animation = '';
        }

        // Update progress bar
        if (progressFill) {
            progressFill.style.width = ((stepNum / 3) * 100) + '%';
        }

        currentStep = stepNum;

        // Scroll form into view
        multistepForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // Step 1: Goal options (multi-select)
    const goalOptions = document.getElementById('goalOptions');
    const goalInput = document.getElementById('goalInput');
    const msNext1 = document.getElementById('msNext1');

    if (goalOptions) {
        goalOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.ms-option');
            if (!option) return;
            option.classList.toggle('selected');

            // Update hidden input
            const selected = goalOptions.querySelectorAll('.ms-option.selected');
            const values = Array.from(selected).map(o => o.dataset.value);
            if (goalInput) goalInput.value = values.join(', ');
            if (msNext1) msNext1.disabled = values.length === 0;
        });
    }

    // Step 2: Budget options (single-select, event delegation)
    const budgetOptions = document.getElementById('budgetOptions');
    const budgetInput = document.getElementById('budgetInput');
    const msNext2 = document.getElementById('msNext2');

    if (budgetOptions) {
        budgetOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.ms-option');
            if (!option) return;

            budgetOptions.querySelectorAll('.ms-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');

            if (budgetInput) budgetInput.value = option.dataset.value;
            if (msNext2) msNext2.disabled = false;
        });
    }

    // Next/Prev buttons
    multistepForm.addEventListener('click', (e) => {
        const nextBtn = e.target.closest('.ms-next');
        const prevBtn = e.target.closest('.ms-prev');

        if (nextBtn && !nextBtn.disabled) {
            // Regenerate budget options when moving from step 1 to step 2
            if (currentStep === 1 && budgetOptions && goalOptions) {
                const selected = goalOptions.querySelectorAll('.ms-option.selected');
                const goals = Array.from(selected).map(o => o.dataset.value);
                const tiers = computeBudgetTiers(goals);
                renderBudgetOptions(budgetOptions, tiers);
                if (budgetInput) budgetInput.value = '';
                if (msNext2) msNext2.disabled = true;
            }
            goToStep(currentStep + 1);
        }
        if (prevBtn) {
            goToStep(currentStep - 1);
        }
    });
}

// ===== C. SCROLLYTELLING — Animated SVG line on process timeline =====
const processLineGlow = document.getElementById('processLineGlow');
const processLineDot = document.getElementById('processLineDot');
const processLineSvg = document.getElementById('processLineSvg');

if (processLineGlow && processLineDot && processLineSvg && !isMobile) {
    const lineLength = 1000; // viewBox width
    processLineGlow.style.strokeDasharray = lineLength;
    processLineGlow.style.strokeDashoffset = lineLength;

    const animateProcessLine = () => {
        const svgRect = processLineSvg.getBoundingClientRect();
        const viewportH = window.innerHeight;

        // Calculate progress: 0 when top of SVG enters viewport, 1 when bottom leaves
        const start = svgRect.top - viewportH * 0.7;
        const end = svgRect.bottom - viewportH * 0.3;
        const range = end - start;

        if (range <= 0) return;

        let progress = -start / range;
        progress = Math.max(0, Math.min(1, progress));

        // Animate line draw
        const offset = lineLength * (1 - progress);
        processLineGlow.style.strokeDashoffset = offset;

        // Move dot along line
        const dotX = progress * lineLength;
        processLineDot.setAttribute('cx', dotX);
        processLineDot.classList.toggle('visible', progress > 0.02 && progress < 0.98);
    };

    window.addEventListener('scroll', function() {
        requestAnimationFrame(animateProcessLine);
    }, { passive: true });

    // Initial call
    animateProcessLine();
}

// ===== TRUSTPILOT WIDGET — Lazy-loaded when testimonials section enters viewport =====
(function() {
    var tpLoaded = false;
    var tpTarget = document.querySelector('.trustpilot-widget') || document.querySelector('.testimonials-section');
    if (tpTarget) {
        var tpObserver = new IntersectionObserver(function(entries) {
            if (entries[0].isIntersecting && !tpLoaded) {
                tpLoaded = true;
                var s = document.createElement('script');
                s.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
                s.async = true;
                s.onload = function() {
                    if (window.Trustpilot) {
                        var widgets = document.querySelectorAll('.trustpilot-widget');
                        for (var i = 0; i < widgets.length; i++) {
                            window.Trustpilot.loadFromElement(widgets[i], true);
                        }
                    }
                };
                document.body.appendChild(s);
                tpObserver.disconnect();
            }
        }, { rootMargin: '200px' });
        tpObserver.observe(tpTarget);
    }
})();

// ===== AI REFERRAL DETECTION =====
(function() {
    const AI_REFERRERS = [
        'chat.openai.com', 'chatgpt.com',
        'perplexity.ai',
        'claude.ai', 'anthropic.com',
        'bing.com/chat', 'copilot.microsoft.com',
        'you.com', 'phind.com',
        'gemini.google.com', 'bard.google.com'
    ];
    const ref = document.referrer;
    if (!ref) return;
    const aiSource = AI_REFERRERS.find(r => ref.includes(r));
    if (!aiSource) return;

    // Send immediately if GA4 already configured (returning visitor with consent)
    if (typeof window.gtag === 'function' && window.__gaConfigured) {
        window.gtag('event', 'ai_referral', {
            event_category: 'AI Traffic',
            event_label: aiSource,
            non_interaction: false
        });
    } else {
        // Queue: will be flushed inside enableAnalyticsTracking() on consent
        window.__pendingAiReferral = aiSource;
    }
})();

// ===== CUSTOM SELECT =====
(function() {
    const customSelects = document.querySelectorAll('.custom-select-wrapper');
    if (!customSelects.length) return;

    customSelects.forEach(wrapper => {
        const trigger = wrapper.querySelector('.custom-select-trigger');
        const textEl = wrapper.querySelector('.custom-select-text');
        const options = wrapper.querySelectorAll('.custom-option');
        const hiddenInput = wrapper.querySelector('input[type="hidden"]');
        if (!trigger || !textEl || !hiddenInput) return;

        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            customSelects.forEach(w => { if (w !== wrapper) w.classList.remove('open'); });
            wrapper.classList.toggle('open');
        });

        options.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const value = this.getAttribute('data-value');
                textEl.textContent = this.textContent;
                trigger.classList.add('has-value');
                options.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                hiddenInput.value = value;
                wrapper.classList.remove('open');
                const formGroup = wrapper.closest('.form-group');
                if (formGroup) formGroup.classList.remove('is-invalid');
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
            });
        });
    });

    document.addEventListener('click', function() {
        customSelects.forEach(w => w.classList.remove('open'));
    });
})();

// ===== CHAT POPUP FUNCTIONALITY =====
// Moved to js/chat.js to avoid code duplication and improve performance
