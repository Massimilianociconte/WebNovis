const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../preventivo.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Checkboxes markup
const oldCheckboxes = `
                    <div class="form-checkboxes">
                        <label class="form-checkbox">
                            <input type="checkbox" name="terms_accepted" value="yes" required>
                            <span>Accetto i <a href="/termini-condizioni.html" target="_blank" rel="noopener noreferrer">Termini e Condizioni</a> e l'<a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a> *</span>
                        </label>
                        <label class="form-checkbox">
                            <input type="checkbox" name="newsletter_consent" value="yes">
                            <span>Desidero ricevere aggiornamenti e consigli di marketing digitale via newsletter</span>
                        </label>
                    </div>`;

const newCheckboxes = `
                    <div class="form-checkboxes">
                        <label class="form-checkbox" id="termsCheckboxLabel">
                            <input name="terms_accepted" type="checkbox" value="yes" id="termsCheckbox" required>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Accetto i <a href="/termini-condizioni.html" target="_blank" rel="noopener noreferrer">Termini e Condizioni</a> e l'<a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a> *</span>
                        </label>
                        <label class="form-checkbox">
                            <input name="newsletter_consent" type="checkbox" value="yes" id="newsletterCheckbox">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Desidero iscrivermi alla newsletter per ricevere aggiornamenti e consigli di marketing digitale</span>
                        </label>
                    </div>`;

content = content.replace(oldCheckboxes.trim(), newCheckboxes.trim());

// 2. Fix the CSS for the checkboxes (which was inline in preventivo.html but actually exists globally in style.css or needs to be copied)
const oldCheckboxCSS = `
        /* Checkboxes */
        .form-checkboxes {
            margin-top: 1rem;
        }
        .form-checkbox {
            display: flex;
            align-items: flex-start;
            gap: .6rem;
            margin-bottom: .75rem;
            cursor: pointer;
            font-size: .85rem;
            color: var(--gray-light);
            line-height: 1.5;
        }
        .form-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            min-width: 18px;
            accent-color: var(--primary);
            margin-top: 2px;
        }
        .form-checkbox a {
            color: var(--primary-light);
            text-decoration: underline;
        }`;

// Instead of inline, we'll let the global CSS handle .form-checkbox (it's in style.css for contatti.html)
// Just remove the inline checkbox CSS to avoid conflicts with global styles
content = content.replace(oldCheckboxCSS, '');

// 3. Fix the Select dropdown contrast
// Instead of styling options, we style the select to have a dark background when opened (or use a wrapper)
// The simplest, most cross-browser friendly way is forcing standard select with standard dark theme colors.
const oldSelectCSS = `
        .form-group select option {
            background: #1a1a1a;
            color: #faf8f3;
        }`;

const newSelectCSS = `
        .form-group select {
            color-scheme: dark; /* Force dark dropdowns in modern browsers */
        }
        .form-group select option {
            background-color: #121212;
            color: #ffffff;
            padding: 10px;
        }
        .form-group select:invalid {
            color: var(--gray-light);
        }`;

content = content.replace(oldSelectCSS, newSelectCSS);

// Make sure the placeholder options are disabled so `:invalid` works
content = content.replace(
    '<select name="service" id="prev-service" required>',
    '<select name="service" id="prev-service" required class="select-placeholder">'
);
content = content.replace(
    '<select name="timeline" id="prev-timeline">',
    '<select name="timeline" id="prev-timeline" class="select-placeholder">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed form inputs in preventivo.html');
