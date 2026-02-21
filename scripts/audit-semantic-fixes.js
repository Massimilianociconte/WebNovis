/**
 * Audit Semantic Fixes — FASE 1-3
 * Applies structural HTML improvements to index.html
 * Run: node scripts/audit-semantic-fixes.js
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');
let changeLog = [];

function replace(old, newStr, label) {
    if (!html.includes(old)) {
        console.error(`❌ NOT FOUND: ${label}`);
        console.error(`   Looking for: ${old.substring(0, 80)}...`);
        return false;
    }
    html = html.replace(old, newStr);
    changeLog.push(`✅ ${label}`);
    return true;
}

// ============================================================
// TASK A1: Wrap <nav> in <header>
// ============================================================
replace(
    '</a> <nav class="nav" id="nav">',
    '</a> <header role="banner"> <nav class="nav" id="nav">',
    'A1a: Added <header> before <nav>'
);

replace(
    '</nav> <div class="search-overlay"',
    '</nav> </header> <div class="search-overlay"',
    'A1b: Closed </header> after </nav>'
);

// ============================================================
// TASK A2: Convert div-based grids to semantic lists
// ============================================================

// 2a: Tech grid → <ul> with <li> items
replace(
    '<div class="tech-grid">',
    '<ul class="tech-grid" role="list">',
    'A2a: tech-grid div→ul'
);

// Replace each tech-item div with li
let techItemCount = 0;
while (html.includes('<div class="tech-item">')) {
    html = html.replace('<div class="tech-item">', '<li class="tech-item">');
    techItemCount++;
}
// Close the tech-items: find the pattern </div> </div> before </ul>
// Each tech-item has: <li class="tech-item"> <div class="tech-icon">SVG</div> <div class="tech-name">NAME</div> </div>
// The last </div> of each item needs to become </li>
// Since tech-item was <div> with 2 child divs, the structure is:
// <div class="tech-item"> <div class="tech-icon">...</div> <div class="tech-name">...</div> </div>
// Now: <li class="tech-item"> <div class="tech-icon">...</div> <div class="tech-name">...</div> </div>
// We need the closing </div> to be </li>

// Find the tech-grid section and replace closing tags
const techGridStart = html.indexOf('<ul class="tech-grid"');
const techGridSection = html.indexOf('</section>', techGridStart);
let techSegment = html.substring(techGridStart, techGridSection);

// Replace closing </div> for each tech-item (the ones after tech-name)
// Pattern: </div> </div> where first </div> closes tech-name, second closes tech-item
// After our change, second should be </li>
techSegment = techSegment.replace(/<\/div> <\/div> <li class="tech-item">/g, '</div> </li> <li class="tech-item">');
// Last tech-item closing before </ul>
techSegment = techSegment.replace(/<\/div> <\/div> <\/div> <\/div> <\/section>/g, '</div> </li> </ul> </div> </section>');
// Actually let me be more careful. Let me replace the closing of tech-grid
// The structure after opening <ul> is: <li>..innerDivs..</div>(this is the old closing div of tech-item) repeated
// I need to change each tech-item's closing </div> to </li>
// Since tech-item has 2 inner divs (tech-icon, tech-name), the 3rd </div> after each <li class="tech-item"> is the one to replace

// Let me do this differently - replace the entire closing pattern
// After the last tech-name </div>, there's a </div> that was tech-item, then </div> for tech-grid, then </div> for container
// With our changes: </div>(tech-name) </div>(was tech-item, should be </li>) </ul>(was tech-grid div) </div>(container)
html = html.substring(0, techGridStart) + techSegment + html.substring(techGridSection);

// Actually, let me take a simpler approach - use a regex to fix tech-item closings
// Each tech-item pattern: <li class="tech-item"> <div class="tech-icon">...</div> <div class="tech-name">...</div> </div>
// The last </div> should be </li>
// Match: </div> <div class="tech-name">CONTENT</div> </div>
// The final </div> in each tech-item block needs to become </li>

// Let's count the structure. After <li class="tech-item">, there are exactly 2 child divs, so 2 closing </div>s for children + 1 closing for the item itself
// The item's closing </div> (3rd one after <li>) needs to be </li>

// Simpler: replace the known end pattern of the tech grid
replace(
    '</div> </div> </div> </div> </section> <section class="reveal faq-section">',
    '</div> </li> </ul> </div> </section> <section class="reveal faq-section">',
    'A2a-close: Fixed tech-grid closing tags'
);

// Fix intermediate tech-item closings
// Pattern between items: </div> </div> <li  → should be </div> </li> <li
let fixCount = 0;
while (html.includes('</div> </div> <li class="tech-item">')) {
    html = html.replace('</div> </div> <li class="tech-item">', '</div> </li> <li class="tech-item">');
    fixCount++;
}
if (fixCount > 0) changeLog.push(`✅ A2a-items: Fixed ${fixCount} tech-item closing tags`);

// 2b: Process timeline steps → <ol>
replace(
    '<div class="process-timeline" id="processTimeline">',
    '<ol class="process-timeline" id="processTimeline" role="list">',
    'A2b: process-timeline div→ol'
);

// Each process-step div → li
let procCount = 0;
while (html.includes('<div class="process-step">')) {
    html = html.replace('<div class="process-step">', '<li class="process-step">');
    procCount++;
}
if (procCount > 0) changeLog.push(`✅ A2b-items: Converted ${procCount} process-step divs to li`);

// Fix closing tags for process steps
// Each step: <li class="process-step"> <div class="process-step-number">01</div> <div class="process-step-icon">...</div> <div class="process-step-title">...</div> <div class="process-step-desc">...</div> </div>
// Last </div> should be </li>
// Between steps: </div> <li → </li> <li
let procFixCount = 0;
while (html.includes('</div> <li class="process-step">')) {
    html = html.replace('</div> <li class="process-step">', '</li> <li class="process-step">');
    procFixCount++;
}
if (procFixCount > 0) changeLog.push(`✅ A2b-close: Fixed ${procFixCount} process-step closing tags`);

// Close the last process step and the ol
// Pattern: ...last step desc...</div> </div> </div> </div> </section>
// After the last process-step's last child div closes, next </div> was the step itself (→</li>), then </div> was timeline (→</ol>)
replace(
    '</div> </div> </div> </section> <section class="reveal features-section">',
    '</div> </li> </ol> </div> </section> <section class="reveal features-section">',
    'A2b-end: Fixed process-timeline closing'
);

// 2c: Features grid → <ul>
replace(
    '<div class="features-grid">',
    '<ul class="features-grid" role="list">',
    'A2c: features-grid div→ul'
);

// Each feature-card-nc div → li
let featCount = 0;
while (html.includes('<div class="feature-card-nc">')) {
    html = html.replace('<div class="feature-card-nc">', '<li class="feature-card-nc">');
    featCount++;
}
if (featCount > 0) changeLog.push(`✅ A2c-items: Converted ${featCount} feature-card-nc divs to li`);

// Fix closing between feature cards
let featFixCount = 0;
while (html.includes('</div> <li class="feature-card-nc">')) {
    html = html.replace('</div> <li class="feature-card-nc">', '</li> <li class="feature-card-nc">');
    featFixCount++;
}
if (featFixCount > 0) changeLog.push(`✅ A2c-close: Fixed ${featFixCount} feature-card closings`);

// Close last feature card + features-grid
replace(
    '</div> </div> </div> </section> <section class="brxe-section"',
    '</div> </li> </ul> </div> </section> <section class="brxe-section"',
    'A2c-end: Fixed features-grid closing'
);

// 2d: CLG steps → <ol>
replace(
    '<div class="clg-steps">',
    '<ol class="clg-steps" role="list">',
    'A2d: clg-steps div→ol'
);

// Each clg-step div → li
let clgCount = 0;
while (html.includes('<div class="clg-step">')) {
    html = html.replace('<div class="clg-step">', '<li class="clg-step">');
    clgCount++;
}
if (clgCount > 0) changeLog.push(`✅ A2d-items: Converted ${clgCount} clg-step divs to li`);

// Fix closings between clg-step items
let clgFixCount = 0;
while (html.includes('</div> <li class="clg-step">')) {
    html = html.replace('</div> <li class="clg-step">', '</li> <li class="clg-step">');
    clgFixCount++;
}
if (clgFixCount > 0) changeLog.push(`✅ A2d-close: Fixed ${clgFixCount} clg-step closings`);

// Close last clg-step + ol
replace(
    '</span></div> <div class="clg-actions">',
    '</span></li> </ol> <div class="clg-actions">',
    'A2d-end: Fixed clg-steps closing'
);

// ============================================================
// TASK A3: Add <time> tags
// ============================================================
replace(
    '<span id="copyrightYear">2026</span>',
    '<time datetime="2026" id="copyrightYear">2026</time>',
    'A3a: Copyright year wrapped in <time>'
);

replace(
    '"datePublished": "2025-01-01"',
    '"datePublished": "2025-01-01"',
    'A3-note: JSON-LD dates already machine-readable (no HTML change needed)'
);

// Add time to the process section delivery times
replace(
    'Tempi medi: 2&ndash;4 settimane per landing page e siti vetrina, 4&ndash;6 settimane per e-commerce',
    'Tempi medi: <time datetime="P2W/P4W">2–4 settimane</time> per landing page e siti vetrina, <time datetime="P4W/P6W">4–6 settimane</time> per e-commerce',
    'A3b: Delivery times wrapped in <time>'
);

// ============================================================
// TASK A7: Convert images to <figure>/<figcaption>
// ============================================================

// The portfolio/testimonial author avatars are small UI elements - not worth converting.
// Focus on the design-pattern-showcase and service visuals that benefit from figcaption.

// Service visual - code window (web section) → figure
replace(
    '<div class="visual-card floating-3d"> <div class="holographic-overlay"></div> <div class="code-window">',
    '<figure class="visual-card floating-3d" role="img" aria-label="Anteprima codice WebNovis.jsx"> <div class="holographic-overlay"></div> <div class="code-window">',
    'A7a: Code window visual-card div→figure'
);

// Close the code-window figure
replace(
    '</div> </div> </div> </div> <div class="service-content"> <span class="service-tag">01',
    '</div> </div> <figcaption class="sr-only">Simulazione di codice React sviluppato da Web Novis per siti web custom</figcaption> </figure> </div> <div class="service-content"> <span class="service-tag">01',
    'A7a-close: Added figcaption to code window'
);

// Design pattern showcase → figure
replace(
    '<div class="visual-card floating-3d"> <div class="holographic-overlay"></div> <div class="design-pattern-showcase">',
    '<figure class="visual-card floating-3d" role="img" aria-label="Pattern di design e branding"> <div class="holographic-overlay"></div> <div class="design-pattern-showcase">',
    'A7b: Design pattern visual-card div→figure'
);

replace(
    '</div> </div> </div> </div> <div class="section-cta">',
    '</div> </div> <figcaption class="sr-only">Esempio di pattern design e identità visiva creati da Web Novis</figcaption> </figure> </div> <div class="section-cta">',
    'A7b-close: Added figcaption to design pattern'
);

// Social mockup phone → figure
replace(
    '<div class="visual-card"> <div class="social-mockup"> <div class="mockup-phone">',
    '<figure class="visual-card" role="group" aria-label="Simulatore feed Instagram Web Novis"> <div class="social-mockup"> <div class="mockup-phone">',
    'A7c: Social mockup visual-card div→figure'
);

// Close the social mockup figure - find the closing pattern
replace(
    '</div> </div> </div> </div> </div> <div class="service-content"> <span class="service-tag">03',
    '</div> </div> </div> <figcaption class="sr-only">Simulazione del feed Instagram di Web Novis con esempi di post social media</figcaption> </figure> </div> <div class="service-content"> <span class="service-tag">03',
    'A7c-close: Added figcaption to social mockup'
);

// ============================================================
// TASK A4: Inject semantic synonyms
// ============================================================

// Add "siti aziendali" in the web service description
replace(
    'Creiamo siti web professionali che uniscono estetica e funzionalità.',
    'Creiamo siti web professionali e siti aziendali che uniscono estetica e funzionalità.',
    'A4a: Added "siti aziendali" to web service description'
);

// Add "negozi online" near e-commerce in service features
replace(
    '<span>E-commerce scalabili e sicuri</span>',
    '<span>E-commerce e negozi online scalabili e sicuri</span>',
    'A4b: Added "negozi online" to e-commerce feature'
);

// ============================================================
// AHREFS FIX 1: Expand itemprop description
// ============================================================
replace(
    '<meta content="Agenzia digitale completa: sviluppo web, grafica, branding e social media marketing." name="description">',
    '<meta content="Agenzia digitale completa a Milano e Rho: sviluppo siti web custom, e-commerce, graphic design, brand identity e social media marketing. Preventivo gratuito, codice 100% proprietario." itemprop="description">',
    'AH1: Expanded itemprop description (84→155 chars) + fixed duplicate name=description to itemprop'
);

// ============================================================
// AHREFS FIX 2: DesignRush widget - add aria-hidden to container
// ============================================================
replace(
    '<div aria-label="DesignRush agency reviews section" data-agency-id="110524" data-designrush-widget data-style="light">',
    '<div aria-label="DesignRush agency reviews section" data-agency-id="110524" data-designrush-widget data-style="light" role="img" aria-hidden="true">',
    'AH2: Added role=img + aria-hidden to DesignRush widget (third-party SVGs with empty alt)'
);

// ============================================================
// Write result
// ============================================================
fs.writeFileSync(filePath, html, 'utf8');

console.log('\n=== AUDIT SEMANTIC FIXES APPLIED ===\n');
changeLog.forEach(c => console.log(c));
console.log(`\nTotal changes: ${changeLog.length}`);
console.log('\nNext step: run "node build.js" to regenerate minified assets');
