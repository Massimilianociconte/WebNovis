---
inclusion: always
---

# WebNovis Design System - Regole di Design All'Avanguardia

## 🎨 Brand Identity

WebNovis è un'agenzia digitale premium. Il design deve comunicare:
- **Lusso moderno** - Eleganza senza essere pomposo
- **Innovazione** - All'avanguardia ma accessibile
- **Professionalità** - Affidabile e competente
- **Creatività** - Unico e memorabile

---

## 🎨 1. Token Definitions - Palette Colori

### Colori Primari
```css
:root {
    /* Oro Premium - Colore principale */
    --primary: #b8860b;           /* Oro scuro elegante */
    --primary-dark: #8b6914;      /* Oro bronzo */
    --primary-light: #daa520;     /* Oro chiaro */
    --primary-glow: rgba(184, 134, 11, 0.3);
    
    /* Bordeaux Accent - Colore secondario */
    --secondary: #8b1538;         /* Rosso bordeaux profondo */
    --secondary-light: #a91d47;   /* Bordeaux chiaro */
    --secondary-glow: rgba(139, 21, 56, 0.3);
    
    /* Accent */
    --accent: #cd853f;            /* Oro rosa */
    --accent-light: #deb887;      /* Beige dorato */
}
```

### Colori Neutri
```css
:root {
    /* Dark Mode Base */
    --dark: #0a0a0a;              /* Nero profondo */
    --dark-light: #141414;        /* Nero carbone */
    --dark-medium: #1a1a1a;       /* Grigio scurissimo */
    --dark-surface: #222222;      /* Superficie card */
    
    /* Grigi */
    --gray-900: #1a1a1a;
    --gray-800: #2d2d2d;
    --gray-700: #404040;
    --gray-600: #525252;
    --gray-500: #6b6b6b;
    --gray-400: #8a8a8a;
    --gray-300: #a3a3a3;
    --gray-200: #c4c4c4;
    --gray-100: #e5e5e5;
    
    /* Testo */
    --text-primary: #faf8f3;      /* Bianco caldo */
    --text-secondary: #c4b5a0;    /* Beige chiaro */
    --text-muted: #8a8a8a;        /* Grigio medio */
}
```

### Gradienti Premium
```css
:root {
    /* Gradienti Hero */
    --gradient-gold: linear-gradient(135deg, #b8860b 0%, #daa520 50%, #cd853f 100%);
    --gradient-luxury: linear-gradient(135deg, #b8860b 0%, #8b1538 100%);
    --gradient-dark: linear-gradient(180deg, #0a0a0a 0%, #141414 100%);
    --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    
    /* Gradienti Testo */
    --gradient-text: linear-gradient(90deg, #daa520 0%, #b8860b 50%, #cd853f 100%);
    
    /* Glow Effects */
    --glow-gold: 0 0 40px rgba(184, 134, 11, 0.4);
    --glow-bordeaux: 0 0 40px rgba(139, 21, 56, 0.4);
}
```

---

## 📐 2. Typography System

### Font Stack
```css
:root {
    /* Font Families */
    --font-display: 'Clash Display', 'Inter', sans-serif;  /* Titoli hero */
    --font-heading: 'Inter', -apple-system, sans-serif;    /* Sottotitoli */
    --font-body: 'Inter', -apple-system, sans-serif;       /* Corpo testo */
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* Codice */
}
```

### Scale Tipografica (Fluid Typography)
```css
:root {
    /* Mobile First - Scale up con clamp() */
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
    --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1rem + 0.6vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
    --text-3xl: clamp(1.875rem, 1.5rem + 2vw, 2.5rem);
    --text-4xl: clamp(2.25rem, 1.8rem + 2.5vw, 3.5rem);
    --text-5xl: clamp(3rem, 2rem + 4vw, 5rem);
    --text-6xl: clamp(3.75rem, 2.5rem + 5vw, 6rem);
    
    /* Line Heights */
    --leading-none: 1;
    --leading-tight: 1.1;
    --leading-snug: 1.25;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    
    /* Letter Spacing */
    --tracking-tighter: -0.05em;
    --tracking-tight: -0.025em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    --tracking-widest: 0.1em;
}
```

---

## 📏 3. Spacing System (8px Grid)

```css
:root {
    /* Base: 8px grid system */
    --space-0: 0;
    --space-1: 0.25rem;   /* 4px */
    --space-2: 0.5rem;    /* 8px */
    --space-3: 0.75rem;   /* 12px */
    --space-4: 1rem;      /* 16px */
    --space-5: 1.25rem;   /* 20px */
    --space-6: 1.5rem;    /* 24px */
    --space-8: 2rem;      /* 32px */
    --space-10: 2.5rem;   /* 40px */
    --space-12: 3rem;     /* 48px */
    --space-16: 4rem;     /* 64px */
    --space-20: 5rem;     /* 80px */
    --space-24: 6rem;     /* 96px */
    --space-32: 8rem;     /* 128px */
    
    /* Section Spacing */
    --section-sm: clamp(3rem, 5vw, 5rem);
    --section-md: clamp(5rem, 8vw, 8rem);
    --section-lg: clamp(6rem, 10vw, 10rem);
}
```

---

## 🔲 4. Border Radius & Shadows

```css
:root {
    /* Border Radius */
    --radius-none: 0;
    --radius-sm: 0.25rem;    /* 4px */
    --radius-md: 0.5rem;     /* 8px */
    --radius-lg: 0.75rem;    /* 12px */
    --radius-xl: 1rem;       /* 16px */
    --radius-2xl: 1.5rem;    /* 24px */
    --radius-3xl: 2rem;      /* 32px */
    --radius-full: 9999px;
    
    /* Shadows - Layered for depth */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 
                 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 
                 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 
                 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
    
    /* Glow Shadows */
    --shadow-glow-gold: 0 0 30px rgba(184, 134, 11, 0.3),
                        0 0 60px rgba(184, 134, 11, 0.1);
    --shadow-glow-bordeaux: 0 0 30px rgba(139, 21, 56, 0.3),
                            0 0 60px rgba(139, 21, 56, 0.1);
}
```

---

## 🎭 5. Animation & Motion

```css
:root {
    /* Durations */
    --duration-instant: 50ms;
    --duration-fast: 150ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
    --duration-slower: 700ms;
    
    /* Easings - Premium feel */
    --ease-linear: linear;
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    --ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
    --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
    
    /* Spring Animation */
    --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

### Animazioni Standard
```css
/* Fade In Up - Per elementi che entrano */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scale In - Per modali e popup */
@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Shimmer - Per loading states */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* Float - Per elementi decorativi */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Glow Pulse - Per CTA */
@keyframes glowPulse {
    0%, 100% { box-shadow: var(--shadow-glow-gold); }
    50% { box-shadow: 0 0 50px rgba(184, 134, 11, 0.5); }
}
```

---

## 📱 6. Responsive Breakpoints

```css
:root {
    /* Breakpoints */
    --bp-xs: 320px;
    --bp-sm: 480px;
    --bp-md: 768px;
    --bp-lg: 1024px;
    --bp-xl: 1280px;
    --bp-2xl: 1536px;
}

/* Media Query Mixins (use in CSS) */
/* Mobile First Approach */
/* @media (min-width: 480px) { } - Small */
/* @media (min-width: 768px) { } - Medium */
/* @media (min-width: 1024px) { } - Large */
/* @media (min-width: 1280px) { } - XL */
/* @media (min-width: 1536px) { } - 2XL */
```

---

## 🧩 7. Component Patterns

### Buttons
```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-sm);
    font-weight: 600;
    letter-spacing: var(--tracking-wide);
    text-transform: uppercase;
    border-radius: var(--radius-lg);
    border: none;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-smooth);
}

.btn-primary {
    background: var(--gradient-gold);
    color: var(--dark);
    box-shadow: var(--shadow-glow-gold);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 50px rgba(184, 134, 11, 0.5);
}

.btn-outline {
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
}

.btn-outline:hover {
    background: var(--primary);
    color: var(--dark);
}
```

### Cards - Glassmorphism
```css
.card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    transition: all var(--duration-normal) var(--ease-smooth);
}

.card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(184, 134, 11, 0.3);
    transform: translateY(-5px);
    box-shadow: var(--shadow-xl);
}
```

### Input Fields
```css
.input {
    width: 100%;
    padding: var(--space-4) var(--space-5);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    color: var(--text-primary);
    font-size: var(--text-base);
    transition: all var(--duration-fast) var(--ease-smooth);
}

.input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-glow);
}

.input::placeholder {
    color: var(--text-muted);
}
```

---

## 🖼️ 8. Asset Management

### Immagini
- Cartella: `/Img/`
- Formati: WebP preferito, PNG fallback
- Lazy loading: `loading="lazy"` su tutte le immagini below-the-fold
- Aspect ratio: Usare `aspect-ratio` CSS per prevenire layout shift

### Icone
- Sistema: SVG inline per performance
- Dimensioni standard: 16px, 20px, 24px, 32px
- Colore: `currentColor` per ereditare dal parent

---

## 📐 9. Layout Grid

```css
.container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-4);
}

@media (min-width: 768px) {
    .container {
        padding: 0 var(--space-8);
    }
}

@media (min-width: 1280px) {
    .container {
        padding: 0 var(--space-12);
    }
}

/* Grid System */
.grid {
    display: grid;
    gap: var(--space-6);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
    .grid-2, .grid-3, .grid-4 {
        grid-template-columns: 1fr;
    }
}
```

---

## ✨ 10. Effetti Speciali Premium

### Gradient Text
```css
.gradient-text {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Glass Effect
```css
.glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Noise Texture Overlay
```css
.noise::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
}
```

### Hover Glow Effect
```css
.hover-glow {
    position: relative;
}

.hover-glow::after {
    content: '';
    position: absolute;
    inset: -2px;
    background: var(--gradient-gold);
    border-radius: inherit;
    opacity: 0;
    z-index: -1;
    filter: blur(15px);
    transition: opacity var(--duration-normal) var(--ease-smooth);
}

.hover-glow:hover::after {
    opacity: 0.5;
}
```

---

## 📋 Checklist Design Review

Prima di ogni commit, verificare:

- [ ] Colori rispettano la palette definita
- [ ] Typography usa le variabili fluid
- [ ] Spacing segue il grid 8px
- [ ] Animazioni usano le durations/easings standard
- [ ] Componenti sono responsive (mobile-first)
- [ ] Contrasto accessibile (WCAG AA minimo)
- [ ] Hover states presenti su elementi interattivi
- [ ] Focus states visibili per accessibilità
- [ ] Immagini hanno lazy loading
- [ ] SVG usano currentColor

---

**Ultimo aggiornamento**: Dicembre 2024
**Versione**: 2.0 - Design System All'Avanguardia
