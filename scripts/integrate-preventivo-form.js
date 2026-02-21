const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../preventivo.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update form tag
content = content.replace(
    '<form action="https://api.web3forms.com/submit" id="preventivoForm" method="POST">',
    '<form class="contact-form" action="https://api.web3forms.com/submit" id="contactForm" method="POST">'
);

// 2. Add terms error message if not present
const checkboxSection = `
                    <div class="form-checkboxes">
                        <label class="form-checkbox" id="termsCheckboxLabel">
                            <input name="terms_accepted" type="checkbox" value="yes" id="termsCheckbox" required>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Accetto i <a href="/termini-condizioni.html" target="_blank" rel="noopener noreferrer">Termini e Condizioni</a> e l'<a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a> *</span>
                        </label>
                        <div class="terms-error-message" id="termsErrorMessage" style="display:none; color:#ef4444; font-size:0.8rem; margin-top:-0.5rem; margin-bottom:0.75rem;">Devi accettare i termini per continuare</div>
                        <label class="form-checkbox">
                            <input name="newsletter_consent" type="checkbox" value="yes" id="newsletterCheckbox">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">Desidero iscrivermi alla newsletter per ricevere aggiornamenti e consigli di marketing digitale</span>
                        </label>
                    </div>`;

// Replace old checkboxes with new ones that include the error message
content = content.replace(/<div class="form-checkboxes">[\s\S]*?<\/div>/, checkboxSection.trim());

// 3. Remove the redundant inline script for replyto sync
const inlineScript = `<script>
        (function(){
            var emailField = document.getElementById('prev-email');
            var replyTo = document.getElementById('replytoInput');
            if(emailField && replyTo){
                emailField.addEventListener('input', function(){
                    replyTo.value = emailField.value;
                });
            }
        })();
    </script>`;
// The script might be slightly minified since we ran build.js. Let's use a regex to remove it
content = content.replace(/<script>\s*\(function\(\)\{[\s\S]*?replyTo\.value[^<]*<\/script>/, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed form integration in preventivo.html');
