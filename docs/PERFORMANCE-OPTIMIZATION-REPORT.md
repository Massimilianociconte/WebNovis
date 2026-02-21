# WebNovis — Report di Ottimizzazione Performance Frontend

> **Stack analizzato:** HTML5 + CSS3 (minificati via Lightning CSS/CleanCSS) + Vanilla JS (minificato via Terser) + Node.js/Express backend  
> **Vincoli:** Nessun cambio di design/UX. Nessun framework. Solo ottimizzazione in-place.  
> **Data analisi:** 19/02/2026

---

## 1. Ottimizzazione del Critical Rendering Path (CRP) e HTML

### 1.1 Problema: Script di terze parti render-blocking nel `<head>`

**Stato attuale** — `index.html` righe 9–65 contengono tre blocchi di script inline sincroni (GA4, Clarity, Meta Pixel) prima di qualsiasi `<link rel="stylesheet">`. Sebbene GA4 carichi il tag esterno con `async`, i tre `<script>` inline bloccano il parser HTML per tutta la loro durata di esecuzione. Il browser engine (Blink/WebKit) non può iniziare il CSSOM fino a quando il parser non supera questi blocchi.

**Perché è critico** — Ogni ms speso a eseguire JS sincrono nel `<head>` ritarda il First Contentful Paint (FCP). Il parser HTML è single-threaded: fino a quando uno `<script>` inline non termina, nessun nodo DOM successivo viene creato.

**Soluzione — Spostare tutta l'analytics a fine `<body>`, prima dei JS applicativi:**

```html
<!-- PRIMA (head, riga 9) — BLOCCA il parser -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-BPMBY6RTKP"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  // ... 25 righe di logica consent ...
</script>

<!-- DOPO (fine body, prima di main.min.js) — NON blocca il CRP -->
<script>
  // Stub minimo nel <head> — 3 righe, ~100 bytes
  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  window.gtag=gtag;
  window.__gaConfigured=false;
</script>

<!-- ... tutto il DOM ... -->

<!-- Fine <body>: bootstrap completo analytics -->
<script>
  (function(){
    var c=localStorage.getItem('cookie_consent')==='accepted';
    window['ga-disable-G-BPMBY6RTKP']=!c;
    gtag('consent','default',{
      analytics_storage:c?'granted':'denied',
      ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'
    });
    if(c){gtag('js',new Date());gtag('config','G-BPMBY6RTKP',{anonymize_ip:true});window.__gaConfigured=true;}

    // Clarity
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script","vjbr983er7");
    try{if(c)clarity("consent")}catch(e){}

    // Meta Pixel
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('consent','revoke');fbq('init','1405109048327436');
    if(c){fbq('consent','grant');fbq('track','PageView');}

    // GA4 script tag — ultima cosa
    var g=document.createElement('script');
    g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id=G-BPMBY6RTKP';
    document.head.appendChild(g);
  })();
</script>
<script src="js/main.min.js" defer></script>
```

**Impatto stimato:** FCP migliorato di **100–300ms** (dipende dalla latenza di `clarity.ms` e `fbevents.js` che ora non bloccano il parser).

---

### 1.2 Resource Hints: `preconnect`, `dns-prefetch`, `preload`

**Stato attuale** — Presenti `preconnect` per Google Fonts e `preload` per `sfondo.webp`. Mancanti: tutti i domini di terze parti che richiedono handshake TLS.

**Aggiungere nel `<head>`, subito dopo `<meta viewport>`:**

```html
<!-- DNS prefetch per domini terzi (costo ~0, risparmio ~50-100ms per dominio) -->
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.clarity.ms">
<link rel="dns-prefetch" href="https://connect.facebook.net">
<link rel="dns-prefetch" href="https://widget.trustpilot.com">
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">

<!-- Preconnect per risorse critiche (handshake TLS completo, usare con parsimonia) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Perché `dns-prefetch` e non `preconnect` per analytics:** `preconnect` apre una connessione TCP+TLS completa e occupa un socket. Per risorse non-critiche (analytics, widget), `dns-prefetch` è sufficiente — risolve solo il DNS (~20-50ms di risparmio) senza sprecare connessioni.

---

### 1.3 Ordine ottimale dei tag nel `<head>`

Il browser engine processa il `<head>` sequenzialmente. L'ordine ideale massimizza la parallelizzazione:

```
1. <meta charset>          ← deve essere nei primi 1024 bytes
2. <meta viewport>         ← essenziale per layout mobile
3. gtag() stub (3 righe)   ← se necessario prima del DOM
4. <link rel="preconnect"> ← avvia handshake TLS il prima possibile
5. <link rel="dns-prefetch">
6. <link rel="preload"> per LCP asset (sfondo.webp, font critico)
7. <title> + <meta description>
8. <link rel="stylesheet"> per CSS critico (style.min.css, revolution.min.css)
9. CSS non critico con media="print" onload trick
10. <link rel="canonical"> e meta SEO
11. <link rel="manifest"> e favicon
12. Open Graph / Twitter meta
```

**Attuale violazione:** I meta OG/Twitter (righe 94-114) sono prima dei CSS (riga 117). Non causano un blocco rendering diretto, ma il `<link rel="preload" as="image" href="sfondo.webp">` a riga 116 viene scoperto tardi dal preload scanner perché preceduto da ~50 righe di meta tags. Spostarlo subito dopo `<meta viewport>` lo rende visibile al preload scanner **~20-40ms prima**.

---

### 1.4 Riduzione della profondità DOM

**Stato attuale** — La homepage ha ~1810 righe HTML. Ogni nodo DOM costa memoria (~1.5KB/nodo) e rallenta le query `querySelectorAll`. I JSON-LD (6 blocchi, ~340 righe) sono legittimi e non impattano il rendering, ma il DOM interattivo va tenuto sotto controllo.

**Regola:** Target < 1500 nodi DOM totali, profondità massima < 32 livelli. Verificare con:

```js
console.log('DOM nodes:', document.querySelectorAll('*').length);
console.log('Max depth:', (function d(el,l){var m=l;el.children&&Array.from(el.children).forEach(c=>{m=Math.max(m,d(c,l+1))});return m})(document.body,0));
```

---

## 2. Estrema Ottimizzazione CSS

### 2.1 Critical CSS Inline vs. CSS Asincrono

**Stato attuale — Analisi dei file caricati:**

| File | Metodo di caricamento | Render-blocking? |
|---|---|---|
| `style.min.css?v=1.6` | `<link rel="stylesheet">` | **SÌ** |
| `revolution.min.css?v=1.4` | `<link rel="stylesheet">` | **SÌ** |
| `leviathan-inspired.min.css?v=1.3` | `media="print" onload` | No ✓ |
| `social-feed-modern.min.css?v=1.4` | `media="print" onload` | No ✓ |
| `weby-mobile-fix.min.css?v=1.3` | `media="print" onload` | No ✓ |
| `nicole-inspired.min.css?v=1.3` | `<link rel="stylesheet">` | **SÌ** |
| `search.min.css?v=2.0` | `media="print" onload` | No ✓ |
| Google Fonts | `media="print" onload` | No ✓ |

**Problema critico:** `nicole-inspired.min.css` è caricato in modo sincrono (riga 127) ma contiene stili per componenti below-the-fold (marquee, feature cards, testimonials). Ogni CSS sincrono blocca il rendering finché non è scaricato + parsato.

**Fix:**

```html
<!-- PRIMA -->
<link rel="stylesheet" href="css/nicole-inspired.min.css?v=1.3">

<!-- DOPO -->
<link rel="stylesheet" href="css/nicole-inspired.min.css?v=1.3" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="css/nicole-inspired.min.css?v=1.3"></noscript>
```

Il critical CSS anti-FOUC per `.highlight-gold` e `.marquee-*` è **già inline** in `style.css` (righe 37-52) — quindi il deferral è sicuro.

---

### 2.2 Generazione Automatica di Critical CSS

**Concetto:** Estrarre solo le regole CSS necessarie per il viewport iniziale (above-the-fold) e inlinarle nel `<head>`. Il resto viene caricato in modo asincrono.

**Implementazione con Node.js (senza dipendenze esterne pesanti):**

```js
// In build.js, aggiungere dopo la minificazione CSS:
const { execSync } = require('child_process');

// Opzione 1: Usare penthouse (npm install penthouse --save-dev)
const penthouse = require('penthouse');

async function generateCriticalCss(htmlFile, cssFile) {
    const critical = await penthouse({
        url: `file://${path.resolve(htmlFile)}`,
        css: path.resolve(cssFile),
        width: 1300,
        height: 900,
        // Include anche mobile viewport
        forceInclude: [
            /\.nav/, /\.hero/, /\.cookie-banner/, /\.search/,
            /\.marquee/, /\.highlight-gold/, /:root/
        ]
    });
    return critical;
}
```

**Alternativa zero-dependency:** Se non si vuole aggiungere `penthouse` (richiede Puppeteer), si può fare un'estrazione manuale basata su selettori noti:

```js
// In build.js: estrai regole che matchano selettori critici
function extractCriticalRules(cssContent, criticalSelectors) {
    const rules = [];
    const regex = /([^{}]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;
    while ((match = regex.exec(cssContent)) !== null) {
        const selector = match[1].trim();
        if (criticalSelectors.some(s => selector.includes(s))) {
            rules.push(match[0]);
        }
    }
    return rules.join('\n');
}

const CRITICAL_SELECTORS = [
    ':root', 'body', '.nav', '.hero', '.logo', '.container',
    '.gradient-text', '.highlight-gold', '.btn', '.cookie-banner',
    '.search-wrapper', '.search-bar', '.marquee'
];
```

---

### 2.3 Evitare Layout Thrashing e Forced Reflows

**Problema nel codice attuale** — `main.js` riga 653-657 (social feed):

```js
// MALE: lettura forzata dentro un loop
posts.forEach(post => {
    originalHeight += post.offsetHeight;           // FORCED REFLOW
    const style = window.getComputedStyle(post);   // FORCED STYLE RECALC
    originalHeight += parseInt(style.marginBottom) || 0;
});
```

Ogni `offsetHeight` e `getComputedStyle` dentro un loop forza il browser a eseguire un layout sincrono. Con N post, sono N reflow consecutivi.

**Fix — Batch reads:**

```js
// BENE: leggere tutte le altezze in un singolo batch
const heights = posts.map(post => post.offsetHeight);
const margins = posts.map(post => 
    parseInt(getComputedStyle(post).marginBottom) || 0
);
let originalHeight = 0;
for (let i = 0; i < posts.length; i++) {
    originalHeight += heights[i] + margins[i];
}
```

**Regola generale (V8/Blink):** Separare sempre le letture DOM dalle scritture DOM. Una singola lettura dopo una scrittura invalida la layout cache e forza un "forced synchronous layout" (~2-10ms per occorrenza).

---

### 2.4 Ottimizzazione dei Selettori CSS

I selettori CSS vengono matchati da **destra a sinistra** dal browser engine. Evitare:

```css
/* MALE: il browser prima trova TUTTI i <span>, poi filtra per genitore */
.marquee-content .marquee-item span.marquee-dot { ... }

/* BENE: selettore diretto — match immediato */
.marquee-dot { ... }
```

**Stato attuale:** Il CSS di WebNovis usa già selettori relativamente piatti (`.marquee-dot`, `.nav-link`, `.btn-primary`). Mantenere questa pratica. Evitare selettori con più di 3 livelli di nesting.

---

### 2.5 Preferire `transform` e `opacity` per animazioni

**Motivo a livello di engine:** `transform` e `opacity` sono le uniche proprietà che il compositor thread di Blink/WebKit può animare **senza coinvolgere il main thread**. Questo significa:
- Nessun reflow (layout)
- Nessun repaint
- Animazione a 60fps anche con main thread occupato

**Stato attuale — Violazione in `main.js` riga 559:**

```js
// MALE: .style.width forza repaint ad ogni scroll event
progressBar.style.width = scrolled + '%';
```

**Fix con `transform: scaleX()`:**

```js
// BENE: solo composite — nessun layout/paint
progressBar.style.transform = `scaleX(${scrolled / 100})`;
// CSS necessario: transform-origin: left; will-change: transform;
```

**Altre violazioni simili:**

| Riga | Codice | Proprietà | Fix |
|------|--------|-----------|-----|
| 198 | `card.style.transform = ...` | `transform` | ✓ Già corretto |
| 305 | `ctx.fillStyle = ...` | Canvas | ✓ OK (canvas non causa reflow) |
| 570 | `card.style.transform + card.style.opacity` | Entrambi | ✓ Corretto |
| 614 | `card.style.transform = ...` | `transform` | ✓ Corretto |

---

### 2.6 Uso strategico di `will-change` e `contain`

```css
/* Elementi che vengono animati frequentemente — promuovili a layer GPU */
.gradient-orb { will-change: transform; }
.scroll-progress { will-change: transform; transform-origin: left; }
.mf-cursor { will-change: transform; }
.mf-cursor-inner { will-change: transform; }

/* Contenimento layout — impedisce che il reflow di un elemento
   si propaghi all'intero DOM */
.feed-post { contain: layout style; }
.triade-card { contain: layout style paint; }
.testimonial-card { contain: layout style; }
```

**Perché funziona:** `will-change: transform` forza il browser a creare un layer compositor dedicato per quell'elemento. Le animazioni su quel layer avvengono nella GPU senza coinvolgere il main thread. Usare con parsimonia (ogni layer consuma ~VRAM della dimensione dell'elemento).

`contain: layout` dice al browser che il layout interno dell'elemento non influenza il layout esterno, permettendo ottimizzazioni di invalidazione locale.

---

## 3. JavaScript Vanilla ad Alte Prestazioni

### 3.1 Consolidamento degli Scroll Event Listeners

**Problema critico** — `main.js` registra **6 listener `scroll` separati** sul `window`:

1. **Riga 27** — Nav scroll effect (`classList.add/remove`)  
2. **Riga 157** — Parallax orbs + background color (rAF-gated)  
3. **Riga 255** — highlightNav (debounced 100ms)  
4. **Riga 533** — Back to top (raw `classList`)  
5. **Riga 555** — Scroll progress bar (`style.width`)  
6. Più `text-effects.js` riga 59 — Text reveal (rAF-gated, passive)

Ogni listener ha overhead: il browser deve invocare ciascuno ad ogni frame di scroll. Anche se individualmente leggeri, 6 callback = 6 invocazioni del garbage collector per i closure.

**Fix — Unified Scroll Controller:**

```js
// Un solo listener, un solo rAF gate, tutte le logiche inside
(function() {
    var ticking = false;

    function onScrollFrame() {
        var scrollY = window.pageYOffset;
        var docH = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // 1. Nav effect
        if (nav) {
            var shouldScroll = scrollY > 100;
            if (shouldScroll && !nav.classList.contains('scrolled')) nav.classList.add('scrolled');
            else if (!shouldScroll && nav.classList.contains('scrolled')) nav.classList.remove('scrolled');
        }

        // 2. Back to top
        if (backToTop) {
            var shouldShow = scrollY > 500;
            if (shouldShow && !backToTop.classList.contains('visible')) backToTop.classList.add('visible');
            else if (!shouldShow && backToTop.classList.contains('visible')) backToTop.classList.remove('visible');
        }

        // 3. Scroll progress (transform-based)
        if (progressBar && docH > 0) {
            progressBar.style.transform = 'scaleX(' + (scrollY / docH) + ')';
        }

        // 4. Parallax orbs (solo homepage, solo desktop)
        if (isHomepage && !isMobile) {
            for (var i = 0; i < gradientOrbs.length; i++) {
                var speed = 0.5 + (i * 0.2);
                gradientOrbs[i].style.transform = 'translateY(' + (scrollY * speed) + 'px)';
            }
        }

        // 5. Active nav highlight (leggero, integrato)
        highlightNav(scrollY);

        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(onScrollFrame);
            ticking = true;
        }
    }, { passive: true });
})();
```

**Impatto:** Da 6 listener a 1. Da 6 rAF potenzialmente sovrapposti a 1 singolo frame callback. Risparmio stimato: **~2-4ms per frame di scroll** su mobile.

---

### 3.2 Event Delegation

**Stato attuale** — `main.js` righe 362-377 e 383-411 attaccano listener `mousemove`/`mouseleave` individuali a ogni `.magnetic` e `.floating-3d` element.

```js
// MALE: N listener per N elementi
magneticElements.forEach(element => {
    element.addEventListener('mousemove', (e) => { ... });
    element.addEventListener('mouseleave', () => { ... });
});
```

**Fix — Delegazione al parent:**

```js
// BENE: 2 listener totali, indipendentemente da quanti elementi ci sono
document.addEventListener('mousemove', function(e) {
    var magnetic = e.target.closest('.magnetic');
    if (!magnetic) return;

    var rect = magnetic.getBoundingClientRect();
    var x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    var y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    magnetic.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1.05)';
});

document.addEventListener('mouseleave', function(e) {
    var magnetic = e.target.closest('.magnetic');
    if (magnetic) magnetic.style.transform = '';
}, true); // useCapture per catturare leave su discendenti
```

**Perché funziona:** Event delegation sfrutta il bubbling del DOM. Un singolo listener sul documento gestisce qualsiasi numero di elementi, risparmiando memoria e setup time.

---

### 3.3 Debouncing e Throttling

**Stato attuale** — Il `debounce` è definito (riga 241) e usato solo per `highlightNav`. Ma il problema è che viene usato `debounce` dove servirebbe `throttle`:

- **Debounce:** esegue la funzione solo dopo che gli eventi smettono di arrivare per N ms. Ideale per: resize, input text search.
- **Throttle:** esegue la funzione al massimo una volta ogni N ms. Ideale per: scroll, mousemove.

```js
function throttle(fn, limit) {
    var last = 0;
    var raf = 0;
    return function() {
        var now = performance.now();
        if (now - last >= limit) {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

// Uso corretto:
window.addEventListener('resize', throttle(resizeCanvas, 150));
// Lo scroll è già gestito dal rAF gate nel controller unificato
```

---

### 3.4 Ottimizzazione del Particle System (O(n²) → O(n))

**Stato attuale** — `main.js` righe 328-344: il controllo delle connessioni tra particelle è O(n²):

```js
// O(n²) — con 100 particelle = 4950 confronti per frame!
for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
        // calcolo distanza e draw line
    }
}
```

**Fix 1 — Spatial Hash Grid (O(n) amortizzato):**

```js
// Dividere il canvas in celle di dimensione connectionDistance
var CELL_SIZE = connectionDistance;
var grid = {};

function getCellKey(x, y) {
    return ((x / CELL_SIZE) | 0) + ',' + ((y / CELL_SIZE) | 0);
}

function updateGrid() {
    grid = {};
    for (var i = 0; i < particles.length; i++) {
        var key = getCellKey(particles[i].x, particles[i].y);
        if (!grid[key]) grid[key] = [];
        grid[key].push(i);
    }
}

function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
        var cx = (particles[i].x / CELL_SIZE) | 0;
        var cy = (particles[i].y / CELL_SIZE) | 0;
        // Controlla solo le 9 celle adiacenti
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                var key = (cx + dx) + ',' + (cy + dy);
                var cell = grid[key];
                if (!cell) continue;
                for (var k = 0; k < cell.length; k++) {
                    var j = cell[k];
                    if (j <= i) continue;
                    // calcolo distanza solo tra particelle nella stessa area
                }
            }
        }
    }
}
```

**Fix 2 — Più semplice: ridurre il check a ogni 2 frame:**

```js
var frameCount = 0;
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    // Connessioni solo ogni 2° frame — impercettibile visivamente
    if (++frameCount % 2 === 0 && !isMobile) {
        drawConnections();
    }

    if (canvasVisible) requestAnimationFrame(animateParticles);
}
```

---

### 3.5 Eliminazione del Mousemove Listener Globale

**Problema grave** — `main.js` riga 605: un `document.addEventListener('mousemove', ...)` permanente che anima floating cards e gradient orbs ad ogni movimento del mouse. Questo listener è **sempre attivo**, anche quando l'utente è a fondo pagina e gli orbs non sono visibili.

```js
// MALE: fires su OGNI mousemove, anche fuori dalla hero section
document.addEventListener('mousemove', (e) => {
    floatingCardsParallax.forEach((card, index) => { ... });
    orbsParallax.forEach((orb, index) => { ... });
});
```

**Fix — Attivare solo quando gli elementi sono in viewport:**

```js
var mouseParallaxActive = false;

var parallaxObserver = new IntersectionObserver(function(entries) {
    mouseParallaxActive = entries.some(function(e) { return e.isIntersecting; });
});

// Osserva solo le sezioni che contengono gli orbs
var heroSection = document.querySelector('.hero');
if (heroSection) parallaxObserver.observe(heroSection);

document.addEventListener('mousemove', function(e) {
    if (!mouseParallaxActive) return; // early exit — costo ~0
    var mx = e.clientX / window.innerWidth - 0.5;
    var my = e.clientY / window.innerHeight - 0.5;
    // ... parallax logic
}, { passive: true });
```

**Impatto:** Elimina 100+ inutili esecuzioni di parallax per secondo quando l'utente non è nella hero section.

---

### 3.6 `cursor.js` — Render Loop Permanente

**Stato attuale** — `cursor.js` riga 151: `requestAnimationFrame(render)` crea un loop infinito che ricalcola la posizione del cursore custom a 60fps, anche quando il mouse è fermo.

**Fix — Idle detection:**

```js
var isIdle = false;
var idleTimer;

document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (isIdle) { isIdle = false; requestAnimationFrame(render); }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function() { isIdle = true; }, 100);
});

function render() {
    if (isIdle) return; // stop loop quando il mouse è fermo
    // ... spring physics ...

    // Ferma anche se la velocità è praticamente zero
    var speed = Math.sqrt(velX * velX + velY * velY);
    if (speed < 0.05 && Math.abs(scaleX - 1) < 0.01) {
        isIdle = true;
        return;
    }

    requestAnimationFrame(render);
}
```

**Impatto:** Da ~16.67ms di CPU per frame costante a 0ms quando il mouse è fermo. Su laptop, questo riduce significativamente il consumo di batteria.

---

### 3.7 Uso di `DocumentFragment` per Batch DOM Insertion

**Stato attuale** — `text-effects.js` riga 16-22:

```js
// MALE: N appendChild = N reflow potenziali
words.map(function(word) {
    var span = document.createElement('span');
    span.className = 'text-reveal-word';
    span.textContent = word + ' ';
    paragraph.appendChild(span);  // REFLOW per ogni append
    return span;
});
```

**Fix:**

```js
var fragment = document.createDocumentFragment();
var wordSpans = words.map(function(word) {
    var span = document.createElement('span');
    span.className = 'text-reveal-word';
    span.textContent = word + ' ';
    fragment.appendChild(span);  // Nessun reflow — fragment è off-DOM
    return span;
});
paragraph.appendChild(fragment);  // UN SINGOLO reflow
```

**Perché:** Un `DocumentFragment` è un nodo DOM "virtuale" che non fa parte del documento. Aggiungere figli a un fragment non causa reflow. Solo l'`appendChild` finale del fragment al DOM reale causa un singolo reflow.

---

### 3.8 Consolidamento degli IntersectionObservers

**Stato attuale** — `main.js` crea almeno **7 IntersectionObserver distinti**:
1. `revealObserver` (riga 13) — reveal + stagger
2. `observer` (riga 137) — is-visible
3. `canvasObserver` (riga 271) — particle canvas
4. `restartObserver` (riga 353) — canvas restart
5. `codeObserver` (riga 457) — code typing
6. `numberObserver` (riga 516) — counter animation
7. `sectionObserver` (riga 629) — fadeInUp
8. `testimonialObserver` (riga 585) — testimonial rotation

Ogni IO ha un suo thread di monitoraggio. Con 8 observer, il browser mantiene 8 monitoraggi paralleli.

**Fix — Consolidare in 2-3 observer con un dispatcher:**

```js
// Observer unico per "entra in viewport → fai qualcosa una volta"
var onceObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var action = el.dataset.ioAction;

        if (action === 'reveal') el.classList.add('active');
        else if (action === 'visible') el.classList.add('is-visible');
        else if (action === 'counter') animateCounter(el);
        else if (action === 'fadeup') el.style.animation = 'fadeInUp 1s ease forwards';
        else if (action === 'code') el.style.animation = 'typing 2s steps(30) forwards, blink 0.75s step-end infinite';

        onceObserver.unobserve(el); // fire-once
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Registrazione unificata
document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el) {
    el.dataset.ioAction = 'reveal'; onceObserver.observe(el);
});
document.querySelectorAll('.triade-card, .service-section, .cta-section').forEach(function(el) {
    el.dataset.ioAction = 'visible'; onceObserver.observe(el);
});
// ... etc
```

---

### 3.9 Web Workers per Calcoli Pesanti

**Applicazione concreta nel progetto:** La logica di particle connection (O(n²)) può essere offloadata su un Worker. Il main thread invia le posizioni delle particelle, il Worker calcola le coppie connesse, il main thread le disegna.

```js
// particles-worker.js
self.onmessage = function(e) {
    var particles = e.data.particles;
    var maxDist = e.data.maxDist;
    var connections = [];
    var maxDistSq = maxDist * maxDist;

    for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
            var dx = particles[i].x - particles[j].x;
            var dy = particles[i].y - particles[j].y;
            var distSq = dx * dx + dy * dy;
            if (distSq < maxDistSq) {
                connections.push(i, j, 1 - Math.sqrt(distSq) / maxDist);
            }
        }
    }
    self.postMessage(connections);
};

// main thread
var worker = new Worker('js/particles-worker.js');
worker.onmessage = function(e) {
    var conn = e.data;
    // Disegna le connessioni — solo operazioni canvas, nessun calcolo
    for (var k = 0; k < conn.length; k += 3) {
        ctx.strokeStyle = 'rgba(91,106,174,' + (0.2 * conn[k+2]) + ')';
        ctx.beginPath();
        ctx.moveTo(particles[conn[k]].x, particles[conn[k]].y);
        ctx.lineTo(particles[conn[k+1]].x, particles[conn[k+1]].y);
        ctx.stroke();
    }
};
```

**Nota:** Valutare se la complessità aggiunta vale il beneficio. Con 100 particelle e il fix del frame-skip (sezione 3.4 Fix 2), il costo è già <1ms/frame. Il Web Worker diventa utile solo se si aumentano le particelle a >500.

---

### 3.10 Eliminazione di `setInterval` per Animazioni

**Stato attuale** — `main.js` riga 588: `setInterval(rotateTestimonials, 5000)` e riga 704: `setInterval` per stat animation.

**Problema:** `setInterval` non rispetta il ciclo del compositor. Se il tab è in background, `setInterval` continua a eseguire (Chrome lo throttla a 1/min, ma non lo ferma).

**Fix per le testimonials:** Già parzialmente risolto con IO (pausa quando fuori viewport). Ma usare `setTimeout` ricorsivo è più sicuro:

```js
function scheduleRotation() {
    testimonialTimer = setTimeout(function() {
        rotateTestimonials();
        scheduleRotation();
    }, 5000);
}

// Start/stop con IntersectionObserver (già presente)
if (entries[0].isIntersecting) scheduleRotation();
else clearTimeout(testimonialTimer);
```

**Per i feed stats (riga 698-724):** Le animazioni dei counter del social feed usano `setInterval` con `clearInterval` dopo 100 iterazioni — accettabile ma migliorabile con un timeout ricorsivo come sopra.

---

### 3.11 `defer` vs `async` vs `type="module"`

**Stato attuale dei script a fine body:**

| Script | Attributo | Esecuzione |
|--------|-----------|------------|
| `main.min.js` | `defer` | Dopo parse, in ordine ✓ |
| `chat.min.js` | `defer` | Dopo parse, in ordine ✓ |
| `globe.min.js` | `type="module"` | Deferred automaticamente, ma crea un module scope separato |
| `text-effects.min.js` | `defer` | Dopo parse, in ordine ✓ |
| `cursor.min.js` | `defer` | Dopo parse, in ordine ✓ |
| `search.min.js` | `defer` | Dopo parse, in ordine ✓ |
| `web-vitals-reporter.js` | `defer` | ✓ Ma carica anche da unpkg CDN |
| `agency-reviews.js` (DesignRush) | `defer` | ✓ |

**Osservazione:** `globe.min.js` usa `type="module"`. I module scripts sono sempre deferred, ma il browser li tratta diversamente dai `defer` scripts: non garantiscono ordine relativo con i `defer` scripts. Se `globe.min.js` dipende da variabili di `main.min.js`, potrebbe rompere.

**Raccomandazione:** Se `globe.min.js` non usa `import/export`, convertirlo a `defer`:

```html
<script src="js/globe.min.js" defer></script>
```

---

## 4. Ottimizzazione degli Asset e Rete

### 4.1 Compressione Brotli/Gzip via Express.js

**Problema critico** — `server.js` non ha alcun middleware di compressione. Ogni response HTML/CSS/JS viene servita uncompressed.

**Fix:**

```bash
npm install compression --save
```

```js
// server.js — aggiungere PRIMA di qualsiasi app.use per routes
const compression = require('compression');

app.use(compression({
    level: 6,               // Buon bilanciamento velocità/ratio
    threshold: 1024,         // Non comprimere file < 1KB
    filter: (req, res) => {
        // Comprimi solo tipi testuali
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));
```

**Impatto stimato:**

| Asset | Dimensione raw | Gzip (~) | Brotli (~) |
|-------|---------------|----------|------------|
| HTML homepage | ~80KB | ~18KB | ~15KB |
| style.min.css | ~25KB | ~5KB | ~4KB |
| main.min.js | ~20KB | ~6KB | ~5KB |

**Per Brotli (migliore compressione, +20% rispetto a Gzip):**

```bash
npm install shrink-ray-current --save
```

```js
const shrinkRay = require('shrink-ray-current');
app.use(shrinkRay()); // Supporta Brotli + Gzip con content negotiation automatico
```

**Nota per GitHub Pages:** Se il frontend è servito da GitHub Pages (non da Express), la compressione è gestita automaticamente dalla CDN GitHub/Fastly con Brotli. Il `compression` middleware serve solo per il server Express (chatbot API, server.js).

---

### 4.2 Cache-Control Strategy

**Stato attuale — Già buono:**
- Asset statici (`/css/*`, `/js/*`, `/Img/*`, `/fonts/*`): `max-age=365d, immutable` ✓
- HTML: `max-age=300, stale-while-revalidate=3600` ✓
- Cache-busting via `?v=` query params ✓

**Miglioramenti:**

1. **Aggiungere `ETag` per le API:**

```js
// Per /api/health e endpoints statici
app.get('/api/health', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache',
        'ETag': '"v1-healthy"'
    });
    res.status(200).json({ status: 'ok' });
});
```

2. **Service Worker per offline-first (opzionale):**

Per un'agenzia web, un basic Service Worker che cache le pagine visitate migliora i repeat visits drammaticamente:

```js
// sw.js (da creare in root)
var CACHE = 'webnovis-v1';
var PRECACHE = ['/', '/css/style.min.css', '/css/revolution.min.css', '/js/main.min.js'];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(PRECACHE); }));
});

self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then(function(r) {
            return r || fetch(e.request).then(function(res) {
                var clone = res.clone();
                caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
                return res;
            });
        })
    );
});
```

---

### 4.3 Gestione Immagini

**Stato attuale:**
- LCP image (`sfondo.webp`) ha `<link rel="preload">` ✓
- Logo usa `fetchpriority="high"` e dimensioni esplicite (`width="150" height="40"`) ✓
- Immagini portfolio in `.webp` ✓

**Miglioramenti:**

1. **Aggiungere `loading="lazy"` a TUTTE le immagini below-the-fold:**

```html
<!-- Immagini nella hero: NO lazy (above the fold) -->
<img src="Img/webnovis-logo-bianco.png" width="150" height="40" fetchpriority="high">

<!-- Immagini sotto la hero: SÌ lazy -->
<img src="Img/portfolio-card.webp" loading="lazy" decoding="async" width="400" height="300">
```

2. **`decoding="async"` su tutte le immagini non-LCP:**

```html
<img src="..." loading="lazy" decoding="async">
```

`decoding="async"` dice al browser di decodificare l'immagine off-main-thread, evitando jank durante lo scroll.

3. **Responsive images con `srcset` per le immagini portfolio:**

```html
<img 
    src="Img/portfolio/aether-digital-mockup-400.webp"
    srcset="Img/portfolio/aether-digital-mockup-400.webp 400w,
            Img/portfolio/aether-digital-mockup-800.webp 800w"
    sizes="(max-width: 768px) 100vw, 400px"
    loading="lazy"
    decoding="async"
    width="400" height="300"
    alt="Aether Digital mockup">
```

4. **Dimensioni esplicite (`width`/`height`) su OGNI `<img>`** — previene CLS (layout shift). Il browser riserva lo spazio prima che l'immagine carichi.

---

### 4.4 Font Loading Strategy

**Stato attuale — Buono:**
- Google Fonts caricati con `media="print" onload` trick ✓
- Font fallback metrics definiti (`Inter-fallback`, `Syne-fallback`) ✓
- Custom font `Grift` con `font-display: swap` ✓

**Miglioramento — Preload del font più critico:**

Il font che impatta di più LCP è quello usato nel titolo hero (`Syne` bold). Aggiungere preload per il file woff2 specifico:

```html
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uQ6OQy6z.woff2">
```

**Come trovare l'URL esatto:** Aprire il Google Fonts CSS URL nel browser, cercare il `@font-face` per `Syne` weight 700 e copiare l'URL del `src`.

**Nota:** Aggiungere `crossorigin` è obbligatorio per i font — senza di esso, il browser scarica il font due volte.

---

### 4.5 Riduzione Third-Party Scripts

**Inventario attuale delle risorse terze parti (per pagina homepage):**

| Script | Tipo | Impatto FCP | Soluzione |
|--------|------|-------------|-----------|
| gtag.js | Analytics | Medio | Spostare a fine body ✓ (sezione 1.1) |
| clarity.ms | Analytics | Medio | Spostare a fine body ✓ |
| fbevents.js | Tracking | Medio | Spostare a fine body ✓ |
| tp.widget.bootstrap.min.js (Trustpilot) | Widget | Alto | Caricare on-demand (sotto) |
| fonts.googleapis.com | Font | Basso (già async) | ✓ |
| web-vitals CDN (unpkg) | Monitoring | Basso (defer) | Self-host (sotto) |
| agency-reviews.js (DesignRush) | Widget | Basso (defer) | ✓ |
| fuse.min.js (jsdelivr) | Search | Basso (lazy) | ✓ |

**Fix per Trustpilot widget — Lazy load on intersection:**

```html
<!-- PRIMA (head, riga 144) — scaricato SUBITO, anche se il widget è in fondo pagina -->
<script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>

<!-- DOPO — caricato solo quando la sezione testimonials entra in viewport -->
<!-- Rimuovere il tag <script> dalla <head> e aggiungere in JS: -->
```

```js
// In main.js, dopo la sezione testimonials
var tpLoaded = false;
var tpSection = document.querySelector('.trustpilot-widget');
if (tpSection) {
    var tpObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting && !tpLoaded) {
            tpLoaded = true;
            var s = document.createElement('script');
            s.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
            s.async = true;
            document.body.appendChild(s);
            tpObserver.disconnect();
        }
    }, { rootMargin: '200px' }); // Carica 200px prima che sia visibile
    tpObserver.observe(tpSection);
}
```

**Fix per web-vitals — Self-hosting:**

Attualmente `web-vitals-reporter.js` carica la libreria da unpkg CDN. Self-hosting elimina un DNS lookup + handshake TLS.

```bash
npm install web-vitals --save-dev
```

Poi nel build step, copiare `node_modules/web-vitals/dist/web-vitals.iife.js` in `js/` e modificare il reporter:

```js
// PRIMA
script.src = 'https://unpkg.com/web-vitals@4/dist/web-vitals.iife.js';

// DOPO
script.src = '/js/web-vitals.iife.js';
```

---

## 5. Strumenti di Build Node.js — Automazione Performance

### 5.1 Minificazione HTML

**Stato attuale** — `build.js` minifica solo CSS e JS. L'HTML viene servito con commenti, indentazione e spazi bianchi.

**Aggiungere al build step:**

```bash
npm install html-minifier-terser --save-dev
```

```js
// Da aggiungere in build.js
const { minify: minifyHtml } = require('html-minifier-terser');

const HTML_MINIFY_OPTIONS = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,        // Minifica CSS inline
    minifyJS: true,         // Minifica JS inline (analytics nel head!)
    collapseBooleanAttributes: true,
    sortAttributes: true,
    sortClassName: true
};

async function minifyHtmlFiles(htmlFiles) {
    for (const file of htmlFiles) {
        const absPath = path.resolve(PROJECT_ROOT, file);
        const source = fs.readFileSync(absPath, 'utf8');
        const originalSize = Buffer.byteLength(source, 'utf8');

        try {
            const minified = await minifyHtml(source, HTML_MINIFY_OPTIONS);
            fs.writeFileSync(absPath, minified, 'utf8');
            const minifiedSize = Buffer.byteLength(minified, 'utf8');
            const { saved, percent } = getSavings(originalSize, minifiedSize);
            log('OK', `HTML ${file} (${formatBytes(originalSize)} -> ${formatBytes(minifiedSize)}, -${percent}%)`);
        } catch (err) {
            log('ERR', `HTML minify failed for ${file}: ${err.message}`);
        }
    }
}

// In build(): aggiungere dopo CSS/JS minification
// await minifyHtmlFiles(htmlFiles);
```

**Impatto stimato:** La homepage ha ~1810 righe. Con commenti, indentazione e JSON-LD, la minificazione HTML risparmia tipicamente **15-25%** della dimensione.

**Attenzione:** Se usi questa tecnica, devi lavorare sempre su file source e generare file minificati come output (oppure avere un sistema di "source → dist"). Attualmente il build script sovrascrive i file minificati CSS/JS ma lascia intatto l'HTML source. Decidere se:
- (a) Minificare l'HTML in-place (rischio: perdi la formattazione originale)
- (b) Creare una directory `dist/` con le versioni pronte per il deploy

---

### 5.2 Automazione Completa della Build Pipeline

**Aggiungere a `package.json`:**

```json
{
  "scripts": {
    "build": "node build.js",
    "build:critical": "node scripts/extract-critical-css.js",
    "build:images": "node scripts/optimize-images.js",
    "build:all": "npm run build && npm run build:critical && npm run build:images",
    "lighthouse": "npx lighthouse https://www.webnovis.com --output=json --output-path=./docs/lighthouse-report.json"
  }
}
```

---

### 5.3 Ottimizzazione Immagini Automatizzata

`sharp` è già in `devDependencies`. Creare uno script dedicato:

```js
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMG_DIR = path.resolve(__dirname, '..', 'Img');
const QUALITY = { webp: 80, avif: 65, png: { quality: 85, compressionLevel: 9 } };

async function optimizeImages() {
    const files = fs.readdirSync(IMG_DIR, { recursive: true });

    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

        const inputPath = path.join(IMG_DIR, file);
        const stat = fs.statSync(inputPath);
        if (stat.isDirectory()) continue;

        const baseName = path.basename(file, ext);
        const dirName = path.dirname(file);
        const outDir = path.join(IMG_DIR, dirName);

        // Genera WebP se non esiste
        const webpPath = path.join(outDir, baseName + '.webp');
        if (!fs.existsSync(webpPath)) {
            await sharp(inputPath)
                .webp({ quality: QUALITY.webp })
                .toFile(webpPath);
            console.log(`✓ ${file} → WebP`);
        }

        // Genera AVIF (20-30% più leggero di WebP, supporto: Chrome 85+, Firefox 93+)
        const avifPath = path.join(outDir, baseName + '.avif');
        if (!fs.existsSync(avifPath)) {
            await sharp(inputPath)
                .avif({ quality: QUALITY.avif })
                .toFile(avifPath);
            console.log(`✓ ${file} → AVIF`);
        }
    }
}

optimizeImages().then(() => console.log('Done'));
```

Poi usare `<picture>` per servire il formato migliore:

```html
<picture>
    <source srcset="Img/portfolio/aether-400.avif" type="image/avif">
    <source srcset="Img/portfolio/aether-400.webp" type="image/webp">
    <img src="Img/portfolio/aether-400.png" loading="lazy" decoding="async" width="400" height="300" alt="...">
</picture>
```

---

### 5.4 Terser — Ottimizzazioni Aggiuntive

**Stato attuale** — Buona configurazione. Miglioramenti marginali:

```js
// build.js — aggiornare terserOptions
terserOptions: {
    compress: {
        drop_console: true,
        drop_debugger: true,
        dead_code: true,
        unused: true,
        passes: 3,              // Aumentare a 3 per ulteriore tree-shaking
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        pure_getters: true,     // Assume getter puri (safe per Vanilla JS)
        unsafe_math: true,      // Ottimizza Math.floor(x) → x|0
        unsafe_arrows: true,    // Converti arrows a functions (minore gzip)
        toplevel: true,         // Se i file sono IIFE o module — safe dead code elim
        global_defs: {
            DEBUG: false,
            __MOBILE__: false    // Utile per eliminare codice mobile-only dal bundle desktop
        }
    },
    mangle: {
        toplevel: false,
        properties: {
            regex: /^_/          // Mangle solo proprietà che iniziano con _
        }
    }
}
```

**Nota su `toplevel: true`:** Attivare solo se i file JS usano pattern IIFE o module. `main.js` attualmente definisce variabili nel scope globale (`const isTouchDevice = ...`), quindi `toplevel: true` potrebbe rompere cose se queste variabili sono referenziate da altri file. Verificare che ogni file sia self-contained.

---

### 5.5 Bundle Splitting (Manuale, Senza Bundler)

**Concetto:** `main.js` (1765 righe) contiene logica che serve solo alla homepage (particles, social feed, testimonials, counters) e logica globale (nav, cookie, form). Splitting riduce il payload per le pagine interne.

**Strategia:**

```
js/core.js          → nav, cookie, smooth scroll, form, newsletter (tutte le pagine)
js/homepage.js      → particles, parallax, social feed, counters, testimonials (solo index.html)
js/cursor.js        → cursore custom (già separato ✓)
js/text-effects.js  → text reveal, morphing (già separato ✓)
js/chat.js          → chatbot (già separato ✓)
js/search.js        → search (già separato ✓)
```

```html
<!-- Tutte le pagine -->
<script src="js/core.min.js" defer></script>

<!-- Solo homepage -->
<script src="js/homepage.min.js" defer></script>
```

**Impatto:** Le pagine interne (portfolio, servizi, blog) scaricano ~50% meno JS.

---

## Riepilogo Priorità di Implementazione

| # | Azione | Impatto CWV | Effort | Priorità |
|---|--------|-------------|--------|----------|
| 1 | Spostare analytics a fine body | FCP -100-300ms | Basso | **P0** |
| 2 | `nicole-inspired.css` → async | FCP -50-100ms | Minimo | **P0** |
| 3 | Aggiungere `compression` a Express | TTFB -200ms, LCP -400ms | Minimo | **P0** |
| 4 | Consolidare scroll listeners (6→1) | INP migliorato | Medio | **P1** |
| 5 | Lazy-load Trustpilot widget | FCP -100ms, LCP -50ms | Basso | **P1** |
| 6 | `cursor.js` idle detection | Battery, INP | Basso | **P1** |
| 7 | Mousemove parallax → viewport-gated | INP, CPU | Basso | **P1** |
| 8 | Scroll progress bar → `transform: scaleX` | CLS, INP | Minimo | **P1** |
| 9 | DocumentFragment per text-effects | INP on navigate | Minimo | **P2** |
| 10 | Consolidare IntersectionObservers | Memory, INP | Medio | **P2** |
| 11 | HTML minification nel build | Transfer size -15% | Basso | **P2** |
| 12 | Bundle splitting main.js | Transfer size -50% (inner pages) | Medio | **P2** |
| 13 | Self-host web-vitals | 1 meno dominio terzo | Minimo | **P2** |
| 14 | Particle system optimization | CPU -30% | Medio | **P3** |
| 15 | AVIF generation + `<picture>` | LCP -100ms | Medio | **P3** |
| 16 | Service Worker | Repeat visits instant | Alto | **P3** |
| 17 | Critical CSS extraction | FCP -50ms | Alto | **P3** |
| 18 | `dns-prefetch` per domini terzi | FCP -20-50ms | Minimo | **P1** |

---

*Report generato su analisi diretta del codice sorgente WebNovis. Ogni raccomandazione è stata verificata contro il codebase attuale e rispetta i vincoli di stack (Vanilla JS, nessun framework, nessun cambio di design).*
