// ===== WEBNOVIS REVOLUTION JS =====

// Cursor Glow Effect
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}

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
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    const isExpanded = navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isExpanded);
});

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll con Lenis per fluidità estrema
// Nota: Lenis deve essere caricato via CDN nel file HTML prima di questo script
let lenis;

if (typeof Lenis !== 'undefined') {
    console.log('🚀 Initializing Lenis Smooth Scroll');
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Integrazione con i link di ancoraggio
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                // Chiudi menu mobile se aperto
                const navMenu = document.getElementById('navMenu');
                const navToggle = document.getElementById('navToggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }

                // Scroll con Lenis
                lenis.scrollTo(target, {
                    offset: -80,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
} else {
    // Fallback smooth scroll nativo se Lenis non carica
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Chiudi menu mobile
                const navMenu = document.getElementById('navMenu');
                const navToggle = document.getElementById('navToggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }

                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
const animatedElements = document.querySelectorAll('.triade-card, .service-section, .cta-section');
animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// Parallax effect for gradient orbs - OPTIMIZED using requestAnimationFrame
let isScrolling = false;

window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const orbs = document.querySelectorAll('.gradient-orb');
            
            orbs.forEach((orb, index) => {
                const speed = 0.5 + (index * 0.2);
                orb.style.transform = `translateY(${scrolled * speed}px)`;
            });
            
            // Also handle background color change here to avoid multiple listeners
            const bodySections = document.querySelectorAll('section');
            const body = document.body;
            let newBackground = '';
            
            // Batch READS
            bodySections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // Check if section is in the middle of the viewport
                if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                    const sectionClass = section.className;
                    if (sectionClass.includes('hero')) {
                        newBackground = 'var(--dark)';
                    } else if (sectionClass.includes('triade')) {
                        newBackground = 'linear-gradient(180deg, var(--dark) 0%, var(--dark-light) 100%)';
                    }
                }
            });

            // Single WRITE
            if (newBackground) {
                 body.style.background = newBackground;
            }

            isScrolling = false;
        });
        isScrolling = true;
    }
});

// Form submission handler - Rimosso, gestito più avanti con validazione avanzata

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

// Cursor trail effect (optional - for extra wow factor)
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Custom cursor rimosso per migliore usabilità

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');

const highlightNav = () => {
    const scrollY = window.pageYOffset;
    let activeId = '';

    // Batch READS
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            activeId = section.getAttribute('id');
        }
    });

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

window.addEventListener('scroll', highlightNav);

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
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

// Apply debounce to scroll-heavy functions
const debouncedHighlight = debounce(highlightNav, 100);
window.addEventListener('scroll', debouncedHighlight);


// ===== EFFETTI CLAMOROSI AVANZATI =====

// Particle System nel Canvas
const canvas = document.getElementById('particlesCanvas');

if (canvas) {
    const ctx = canvas.getContext('2d');

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
            ctx.fillStyle = `rgba(184, 134, 11, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Connetti particelle vicine
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.strokeStyle = `rgba(184, 134, 11, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
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

// Custom Cursor Rimosso - Usa cursore di sistema per migliore usabilità

// Effetto 3D Tilt sulle Visual Cards
const visualCards = document.querySelectorAll('.floating-3d');

visualCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Scroll Reveal Avanzato con Stagger (usa il revealObserver già definito sopra)
document.querySelectorAll('.triade-card, .service-section, .stat-item').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Parallax Avanzato Multi-Layer
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Parallax per gli orbs
    const orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach((orb, index) => {
        const speed = 0.3 + (index * 0.15);
        orb.style.transform = `translateY(${scrolled * speed}px) scale(${1 + scrolled * 0.0001})`;
    });

    // Parallax per le floating cards
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        const speed = 0.2 + (index * 0.1);
        card.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Effetto Ripple sui Click - Oro/Bordeaux
document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(184, 134, 11, 0.6) 0%, rgba(139, 21, 56, 0.3) 50%, transparent 70%);
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

// Custom smooth scroll rimosso a favore di Lenis/Nativo per evitare conflitti
/*
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const targetPosition = target.offsetTop - 80;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 1000;
            let start = null;

            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = easeInOutCubic(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function easeInOutCubic(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }

            requestAnimationFrame(animation);
        }
    });
});
*/

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

// Performance Monitor (opzionale - per debug)
let fps = 0;
let lastTime = performance.now();

function measureFPS() {
    const currentTime = performance.now();
    fps = Math.round(1000 / (currentTime - lastTime));
    lastTime = currentTime;

    // Log FPS ogni 2 secondi (solo in development)
    // console.log('FPS:', fps);

    requestAnimationFrame(measureFPS);
}

// measureFPS(); // Decommentare per monitorare le performance

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

// Prevenzione del Right Click (opzionale - per protezione)
// document.addEventListener('contextmenu', (e) => e.preventDefault());

// Easter Egg: Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);

    if (konamiCode.join('') === konamiSequence.join('')) {
        document.body.style.animation = 'rainbowBackground 2s ease infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Aggiungi animazione rainbow
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbowBackground {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

console.log('%c🚀 WebNovis - Powered by Innovation', 'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cCreated with ❤️ and cutting-edge technology', 'font-size: 12px; color: #64748b;');


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

// Back to Top Button
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Scroll Progress Bar
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
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

// Auto-rotate every 5 seconds
if (testimonialCards.length > 0) {
    setInterval(rotateTestimonials, 5000);
}

// Parallax Effect on Mouse Move
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    // Parallax for floating cards
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        const speed = (index + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        card.style.transform = `translate(${x}px, ${y}px)`;
    });

    // Parallax for gradient orbs
    const orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        orb.style.transform = `translate(${x}px, ${y}px)`;
    });
});

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
    console.log('🔄 Initializing social feed...');
    
    // Detect if mobile
    const isMobileDevice = window.innerWidth <= 768 || 'ontouchstart' in window;

    // Wait for DOM to be fully loaded
    setTimeout(() => {
        // Clone all posts to create seamless loop (only on desktop)
        const posts = Array.from(socialFeedScroll.children);
        console.log(`📝 Found ${posts.length} posts`);

        // Calculate original content height
        let originalHeight = 0;
        posts.forEach(post => {
            originalHeight += post.offsetHeight;
            const style = window.getComputedStyle(post);
            originalHeight += parseInt(style.marginBottom) || 0;
        });

        // Only enable auto-scroll on desktop
        if (!isMobileDevice) {
            const clonedPosts = posts.map(post => post.cloneNode(true));
            clonedPosts.forEach(clone => {
                socialFeedScroll.appendChild(clone);
            });

            let scrollPosition = 0;
            let isScrolling = true;
            let scrollSpeed = 0.5;

            console.log(`📏 Original height: ${originalHeight}px`);

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
            console.log('✅ Desktop auto-scroll started!');

            // Pause on hover (desktop only)
            socialFeedScroll.addEventListener('mouseenter', () => {
                isScrolling = false;
            });

            socialFeedScroll.addEventListener('mouseleave', () => {
                isScrolling = true;
            });
        } else {
            // Mobile: no auto-scroll, user controls scrolling
            console.log('📱 Mobile detected - manual scroll only');
        }
    }, 100);

    // Animate stats counters
    const feedStats = document.querySelectorAll('.feed-stats span');
    feedStats.forEach((stat, index) => {
        setInterval(() => {
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

// Enhanced Form Validation with Visual Feedback
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    const inputs = contactForm.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.transition = 'transform 0.3s ease';
        });

        input.addEventListener('blur', function () {
            this.parentElement.style.transform = 'scale(1)';

            // Validation feedback
            if (this.value.trim() !== '') {
                this.style.borderColor = 'rgba(20, 184, 166, 0.5)';
            } else if (this.hasAttribute('required')) {
                this.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }
        });

        input.addEventListener('input', function () {
            if (this.value.trim() !== '') {
                this.style.borderColor = 'rgba(184, 134, 11, 0.5)';
            }
        });
    });

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form values
        const nameInput = contactForm.querySelector('input[placeholder="Nome"]');
        const emailInput = contactForm.querySelector('input[placeholder="Email"]');
        const companyInput = contactForm.querySelector('input[placeholder="Azienda"]');
        const messageInput = contactForm.querySelector('textarea');

        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const company = companyInput ? companyInput.value : '';
        const message = messageInput ? messageInput.value : '';

        // Construct mailto link
        const subject = `Nuovo Contatto dal Sito: ${name}`;
        const body = `Nome: ${name}%0D%0AEmail: ${email}%0D%0AAzienda: ${company}%0D%0A%0D%0AMessaggio:%0D%0A${message}`;

        // Open default mail client
        window.location.href = `mailto:webnovis.info@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

        // Success animation
        const button = contactForm.querySelector('button[type="submit"]');
        button.innerHTML = '<span>✓ Inviato!</span>';
        button.style.background = 'linear-gradient(135deg, #14b8a6, #10b981)';

        setTimeout(() => {
            button.innerHTML = '<span>Invia Messaggio</span>';
            button.style.background = '';
            contactForm.reset();
        }, 3000);
    });
}

// Keyboard Navigation Enhancement
document.addEventListener('keydown', (e) => {
    // Press 'H' to go to home
    if (e.key === 'h' || e.key === 'H') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Press 'C' to go to contact
    if (e.key === 'c' || e.key === 'C') {
        const contactSection = document.getElementById('contatti');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Dynamic Background Color Change on Scroll - RIMOSSO (Integrato sopra per performance)
/*
const bodySections = document.querySelectorAll('section');
const body = document.body;

const colorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionClass = entry.target.className;

            if (sectionClass.includes('hero')) {
                body.style.background = 'var(--dark)';
            } else if (sectionClass.includes('triade')) {
                body.style.background = 'linear-gradient(180deg, var(--dark) 0%, var(--dark-light) 100%)';
            }
        }
    });
}, { threshold: 0.5 });

bodySections.forEach(section => colorObserver.observe(section));
*/

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

const typeCode = () => {
    const codeContent = document.getElementById('codeContent');
    const typingArea = codeContent?.querySelector('.code-typing-area');
    const cursor = codeContent?.querySelector('.code-cursor');

    if (!typingArea || isTyping) return;

    isTyping = true;

    const typeCharacter = () => {
        if (codeIndex < codeToType.length) {
            const char = codeToType[codeIndex];

            // Aggiungi il carattere
            const currentText = typingArea.innerHTML;

            if (char === '\n') {
                typingArea.innerHTML = currentText + '\n';
                lineNumber++;
            } else {
                // Colora la sintassi
                const coloredChar = colorSyntax(char, codeToType.substring(0, codeIndex));
                typingArea.innerHTML = currentText + coloredChar;
            }

            codeIndex++;

            // Velocità variabile per effetto più realistico
            const speed = char === '\n' ? 100 : (Math.random() * 50 + 30);

            // Scroll automatico
            if (codeContent) {
                codeContent.scrollTop = codeContent.scrollHeight;
            }

            setTimeout(typeCharacter, speed);
        } else {
            // Finito di scrivere, rimuovi il cursore dopo un po'
            setTimeout(() => {
                if (cursor) cursor.style.display = 'none';
            }, 1000);

            // Ricomincia dopo una pausa breve - FIX: loop più veloce
            setTimeout(() => {
                codeIndex = 0;
                lineNumber = 1;
                typingArea.innerHTML = '';
                if (cursor) cursor.style.display = 'inline-block';
                isTyping = false;
                // Riavvia l'animazione
                setTimeout(() => typeCharacter(), 100);
            }, 2000); // Ridotto da 5000ms a 2000ms
        }
    };

    typeCharacter();
};

// Funzione per colorare la sintassi
const colorSyntax = (char, previousText) => {
    const lastWord = previousText.split(/[\s\n(){}<>[\];,.]/).pop() + char;

    // Keywords
    const keywords = ['import', 'from', 'function', 'return', 'const', 'let', 'var', 'export', 'default', 'className', 'key'];
    // Componenti React
    const components = ['React', 'Performance', 'SEO', 'Design', 'ServiceCard'];
    // Valori
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

// Avvia l'effetto quando la sezione diventa visibile
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

// Preload Critical Resources
const preloadResources = () => {
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
    });
};

preloadResources();

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// Analytics Event Tracking
const trackEvent = (category, action, label) => {
    console.log('Event:', category, action, label);
    // Integrate with your analytics platform here
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
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

console.log('%c✨ WebNovis - Il Miglior Sito Mai Creato ✨', 'font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #6366f1, #ec4899, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 20px;');
console.log('%c🚀 Performance Optimized | 🎨 Stunning Design | 💎 Premium Interactions', 'font-size: 14px; color: #64748b; font-style: italic;');
console.log('%cKeyboard Shortcuts: H = Home | C = Contact', 'font-size: 12px; color: #6366f1;');


// ===== CHAT POPUP FUNCTIONALITY =====
// Moved to js/chat.js to avoid code duplication and improve performance
