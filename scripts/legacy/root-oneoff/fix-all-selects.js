const fs = require('fs');
const path = require('path');

// ===== Fix contatti.html =====
let contatti = fs.readFileSync('contatti.html', 'utf8');

// Find the native select in contatti.html
const idx = contatti.indexOf('<select id="contact-service"');
if (idx > -1) {
    const endIdx = contatti.indexOf('</select>', idx) + 9;
    const oldSelect = contatti.substring(idx, endIdx);
    console.log('Found native select in contatti.html at:', idx);
    console.log('Old select snippet:', oldSelect.substring(0, 100));
    
    const customSelect = `<div class="custom-select-wrapper" id="customSelect-contact-service"><input type="hidden" name="service" id="contact-service"><div class="custom-select-trigger" tabindex="0"><span class="custom-select-text">Servizio di interesse</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div><div class="custom-options"><div class="custom-option" data-value="Sviluppo Sito Web">Sviluppo Sito Web</div><div class="custom-option" data-value="E-commerce">E-commerce</div><div class="custom-option" data-value="Graphic Design / Logo">Graphic Design / Logo</div><div class="custom-option" data-value="Brand Identity">Brand Identity</div><div class="custom-option" data-value="Social Media Marketing">Social Media Marketing</div><div class="custom-option" data-value="SEO">SEO</div><div class="custom-option" data-value="Consulenza Digitale">Consulenza Digitale</div><div class="custom-option" data-value="Altro">Altro</div></div></div>`;
    
    contatti = contatti.substring(0, idx) + customSelect + contatti.substring(endIdx);
    fs.writeFileSync('contatti.html', contatti, 'utf8');
    console.log('contatti.html updated successfully');
} else {
    console.log('No native select found in contatti.html (may already be custom)');
}

// ===== Remove duplicate CSS from preventivo.html =====
let preventivo = fs.readFileSync('preventivo.html', 'utf8');

// Remove the inline custom-select CSS block (it's now in style.css globally)
const cssStart = preventivo.indexOf('/* Custom Select */');
const cssEnd = preventivo.indexOf('.form-group.is-invalid .custom-select-trigger { border-color: #ef4444; }');
if (cssStart > -1 && cssEnd > -1) {
    const fullCssEnd = cssEnd + '.form-group.is-invalid .custom-select-trigger { border-color: #ef4444; }'.length;
    const removed = preventivo.substring(cssStart, fullCssEnd);
    preventivo = preventivo.substring(0, cssStart) + preventivo.substring(fullCssEnd);
    fs.writeFileSync('preventivo.html', preventivo, 'utf8');
    console.log('Removed duplicate inline CSS from preventivo.html, length:', removed.length);
} else {
    console.log('CSS markers not found in preventivo.html, cssStart:', cssStart, 'cssEnd:', cssEnd);
}

// ===== Verify =====
const prevCheck = fs.readFileSync('preventivo.html', 'utf8');
const contCheck = fs.readFileSync('contatti.html', 'utf8');
console.log('\n--- Verification ---');
console.log('preventivo.html has custom-select-wrapper in body:', prevCheck.indexOf('class="custom-select-wrapper"') > prevCheck.indexOf('<body'));
console.log('contatti.html has custom-select-wrapper:', contCheck.includes('custom-select-wrapper'));
console.log('contatti.html still has native select:', contCheck.includes('<select id="contact-service"'));
