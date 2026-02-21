const fs = require('fs');
let c = fs.readFileSync('preventivo.html', 'utf8');

// Replace service select - using regex to handle any whitespace
const serviceRegex = /<select[^>]*name="service"[^>]*>.*?<\/select>/;
const serviceCustom = `<div class="custom-select-wrapper" id="customSelect-service"><input type="hidden" name="service" id="prev-service" required><div class="custom-select-trigger" tabindex="0"><span class="custom-select-text">Seleziona un servizio</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div><div class="custom-options"><div class="custom-option" data-value="Sito Vetrina">Sito Vetrina (da €1.200)</div><div class="custom-option" data-value="E-commerce">E-commerce (da €3.500)</div><div class="custom-option" data-value="Landing Page">Landing Page (da €500)</div><div class="custom-option" data-value="Graphic Design / Logo">Graphic Design / Logo</div><div class="custom-option" data-value="Brand Identity">Brand Identity Completa</div><div class="custom-option" data-value="Social Media Marketing">Social Media Marketing</div><div class="custom-option" data-value="Restyling Sito Esistente">Restyling Sito Esistente</div><div class="custom-option" data-value="Consulenza Digitale">Consulenza Digitale</div><div class="custom-option" data-value="Pacchetto Completo">Pacchetto Completo (Web + Grafica + Social)</div></div></div>`;

const timelineRegex = /<select[^>]*name="timeline"[^>]*>.*?<\/select>/;
const timelineCustom = `<div class="custom-select-wrapper" id="customSelect-timeline"><input type="hidden" name="timeline" id="prev-timeline"><div class="custom-select-trigger" tabindex="0"><span class="custom-select-text">Quando vorresti partire?</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div><div class="custom-options"><div class="custom-option" data-value="Urgente (entro 2 settimane)">Urgente (entro 2 settimane)</div><div class="custom-option" data-value="Entro 1 mese">Entro 1 mese</div><div class="custom-option" data-value="Entro 2-3 mesi">Entro 2-3 mesi</div><div class="custom-option" data-value="Nessuna fretta">Nessuna fretta, sto valutando</div></div></div>`;

// Test if patterns match
console.log('Service regex matches:', serviceRegex.test(c));
console.log('Timeline regex matches:', timelineRegex.test(c));

// Replace
let newContent = c.replace(serviceRegex, serviceCustom);
newContent = newContent.replace(timelineRegex, timelineCustom);

// Check if replacement happened
if (newContent !== c) {
    fs.writeFileSync('preventivo.html', newContent, 'utf8');
    console.log('SUCCESS: Native selects replaced with custom ones');
    
    // Verify
    const stillHasSelect = /<select[^>]*name="(service|timeline)"/.test(newContent);
    const hasCustom = newContent.includes('custom-select-wrapper');
    console.log('Still has native selects:', stillHasSelect);
    console.log('Has custom selects:', hasCustom);
} else {
    console.log('No changes made - patterns did not match');
}
