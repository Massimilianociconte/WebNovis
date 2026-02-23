const fs = require('fs');

const newLinks = [
    '<a href="realizzazione-siti-web-rho.html" title="Siti Web a Rho">Siti Web Rho</a>',
    '<a href="realizzazione-siti-web-arese.html" title="Siti Web ad Arese">Siti Web Arese</a>',
    '<a href="realizzazione-siti-web-pero.html" title="Siti Web a Pero">Siti Web Pero</a>',
    '<a href="realizzazione-siti-web-lainate.html" title="Siti Web a Lainate">Siti Web Lainate</a>',
    '<a href="realizzazione-siti-web-cornaredo.html" title="Siti Web a Cornaredo">Siti Web Cornaredo</a>',
    '<a href="realizzazione-siti-web-settimo-milanese.html" title="Siti Web a Settimo Milanese">Siti Web Settimo M.</a>',
    '<a href="agenzia-web-rho.html" title="Agenzia Web a Rho">Agenzie Web Rho</a>',
    '<a href="agenzia-web-milano.html" title="Agenzia Web a Milano">Agenzie Web Milano</a>'
].join('\n');

const replacement = `<div class="footer-column">\n<h3>Località</h3>\n${newLinks}\n</div>`;
const pattern = /<div class="footer-column">\s*\n?\s*<h3>Località<\/h3>[\s\S]*?<\/div>/;

const files = [
    'agenzie-web-rho.html',
    'agenzie-web-arese.html',
    'agenzie-web-lainate.html',
    'agenzie-web-garbagnate.html',
    'agenzie-web-milano.html'
];

for (const f of files) {
    try {
        let html = fs.readFileSync(f, 'utf8');
        if (pattern.test(html)) {
            html = html.replace(pattern, replacement);
            fs.writeFileSync(f, html, 'utf8');
            console.log('Updated: ' + f);
        } else {
            console.log('Pattern not found: ' + f);
        }
    } catch (e) {
        console.log('Skip: ' + f + ' (' + e.message.split('\n')[0] + ')');
    }
}
console.log('Done!');
