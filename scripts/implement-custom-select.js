const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../preventivo.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. CSS per Custom Select
const customSelectCss = `
        /* Custom Select */
        .custom-select-wrapper {
            position: relative;
            width: 100%;
        }
        .custom-select-trigger {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding: .75rem 1rem;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 10px;
            color: var(--gray-light);
            font-family: var(--font-body);
            font-size: .95rem;
            cursor: pointer;
            transition: border-color .3s, background .3s;
        }
        .custom-select-trigger.has-value {
            color: var(--white);
        }
        .custom-select-trigger:focus,
        .custom-select-wrapper.open .custom-select-trigger {
            outline: none;
            border-color: var(--primary-light);
            background: rgba(255,255,255,.06);
        }
        .custom-select-trigger svg {
            width: 16px;
            height: 16px;
            color: var(--primary-light);
            transition: transform .3s;
        }
        .custom-select-wrapper.open .custom-select-trigger svg {
            transform: rotate(180deg);
        }
        .custom-options {
            position: absolute;
            top: calc(100% + 5px);
            left: 0;
            right: 0;
            background: #111;
            border: 1px solid rgba(255,255,255,.1);
            border-radius: 10px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 10px 25px rgba(0,0,0,.5);
            z-index: 100;
            max-height: 250px;
            overflow-y: auto;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all .3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .custom-select-wrapper.open .custom-options {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .custom-option {
            padding: .75rem 1rem;
            color: var(--gray-light);
            font-size: .95rem;
            cursor: pointer;
            transition: background .2s, color .2s;
            border-bottom: 1px solid rgba(255,255,255,.03);
        }
        .custom-option:last-child {
            border-bottom: none;
        }
        .custom-option:hover, .custom-option.selected {
            background: rgba(91,106,174,.15);
            color: var(--white);
        }
        
        /* Scrollbar custom per options */
        .custom-options::-webkit-scrollbar { width: 6px; }
        .custom-options::-webkit-scrollbar-track { background: rgba(0,0,0,.2); border-radius: 10px; }
        .custom-options::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 10px; }
        .custom-options::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.3); }
        
        /* Modifica allo stile per integrare l'invalid state nativo se richiesto */
        .form-group.is-invalid .custom-select-trigger { border-color: #ef4444; }`;

// Rimuovo il vecchio stile select se c'è (è quello che abbiamo messo prima)
const oldSelectCssRegex = /\.form-group select \{[\s\S]*?\}\s*\.form-group select:invalid \{[\s\S]*?\}/g;
if (oldSelectCssRegex.test(content)) {
    content = content.replace(oldSelectCssRegex, customSelectCss);
} else {
    // Altrimenti lo inserisco prima della chiusura style
    content = content.replace('</style>', customSelectCss + '\n    </style>');
}

// Rimuovi anche i vecchi select styles dal replace precedente che forse non ha matchato bene
content = content.replace(/\.form-group select \{[\s\S]*?color-scheme: dark;[\s\S]*?\}/g, '');
content = content.replace(/\.form-group select option \{[\s\S]*?\}/g, '');
content = content.replace(/\.form-group select:invalid \{[\s\S]*?\}/g, '');

// 2. Sostituisco i <select> con il markup Custom
const select1Regex = /<select name="service" id="prev-service".*?>[\s\S]*?<\/select>/;
const customSelect1 = `
                            <div class="custom-select-wrapper" id="customSelect-service">
                                <input type="hidden" name="service" id="prev-service" required>
                                <div class="custom-select-trigger" tabindex="0">
                                    <span class="custom-select-text">Seleziona un servizio</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                                <div class="custom-options">
                                    <div class="custom-option" data-value="Sito Vetrina">Sito Vetrina (da €1.200)</div>
                                    <div class="custom-option" data-value="E-commerce">E-commerce (da €3.500)</div>
                                    <div class="custom-option" data-value="Landing Page">Landing Page (da €500)</div>
                                    <div class="custom-option" data-value="Graphic Design / Logo">Graphic Design / Logo</div>
                                    <div class="custom-option" data-value="Brand Identity">Brand Identity Completa</div>
                                    <div class="custom-option" data-value="Social Media Marketing">Social Media Marketing</div>
                                    <div class="custom-option" data-value="Restyling Sito Esistente">Restyling Sito Esistente</div>
                                    <div class="custom-option" data-value="Consulenza Digitale">Consulenza Digitale</div>
                                    <div class="custom-option" data-value="Pacchetto Completo">Pacchetto Completo (Web + Grafica + Social)</div>
                                </div>
                            </div>`;

content = content.replace(select1Regex, customSelect1);

const select2Regex = /<select name="timeline" id="prev-timeline".*?>[\s\S]*?<\/select>/;
const customSelect2 = `
                            <div class="custom-select-wrapper" id="customSelect-timeline">
                                <input type="hidden" name="timeline" id="prev-timeline">
                                <div class="custom-select-trigger" tabindex="0">
                                    <span class="custom-select-text">Quando vorresti partire?</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                                <div class="custom-options">
                                    <div class="custom-option" data-value="Urgente (entro 2 settimane)">Urgente (entro 2 settimane)</div>
                                    <div class="custom-option" data-value="Entro 1 mese">Entro 1 mese</div>
                                    <div class="custom-option" data-value="Entro 2-3 mesi">Entro 2-3 mesi</div>
                                    <div class="custom-option" data-value="Nessuna fretta">Nessuna fretta, sto valutando</div>
                                </div>
                            </div>`;

content = content.replace(select2Regex, customSelect2);

// 3. Aggiungo lo script JS prima del JSON-LD breadcrumb per far funzionare il custom select
const jsLogic = `
    <!-- Logic Custom Select -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const customSelects = document.querySelectorAll('.custom-select-wrapper');
            
            customSelects.forEach(wrapper => {
                const trigger = wrapper.querySelector('.custom-select-trigger');
                const text = wrapper.querySelector('.custom-select-text');
                const options = wrapper.querySelectorAll('.custom-option');
                const hiddenInput = wrapper.querySelector('input[type="hidden"]');
                const placeholderText = text.innerText;
                
                // Open/close dropdown
                trigger.addEventListener('click', function(e) {
                    // Close other open selects
                    customSelects.forEach(w => {
                        if (w !== wrapper) w.classList.remove('open');
                    });
                    
                    wrapper.classList.toggle('open');
                });
                
                // Selection logic
                options.forEach(option => {
                    option.addEventListener('click', function() {
                        const value = this.getAttribute('data-value');
                        const label = this.innerText;
                        
                        // Update UI
                        text.innerText = label;
                        trigger.classList.add('has-value');
                        
                        // Highlight selected
                        options.forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        
                        // Update hidden input and trigger event for main.js validation
                        hiddenInput.value = value;
                        wrapper.classList.remove('open');
                        
                        // Remove invalid class if present from form-group parent
                        const formGroup = wrapper.closest('.form-group');
                        if (formGroup) formGroup.classList.remove('is-invalid');
                        
                        // Dispatch custom event to notify main.js if needed
                        const event = new Event('input', { bubbles: true });
                        hiddenInput.dispatchEvent(event);
                    });
                });
            });
            
            // Close dropdowns clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.custom-select-wrapper')) {
                    customSelects.forEach(wrapper => wrapper.classList.remove('open'));
                }
            });
        });
    </script>
`;

if (!content.includes('<!-- Logic Custom Select -->')) {
    content = content.replace('<!-- JSON-LD: BreadcrumbList -->', jsLogic + '\n    <!-- JSON-LD: BreadcrumbList -->');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Custom selects implemented in preventivo.html');
