const fs = require('fs');
const c = fs.readFileSync('contatti.html', 'utf8');

// Find CSS link
const cssIdx = c.indexOf('style.min.css');
if (cssIdx > -1) {
    fs.writeFileSync('contatti-css-link.txt', c.substring(cssIdx - 50, cssIdx + 100), 'utf8');
    console.log('Found CSS link');
}

// Also check if custom-options has visibility:hidden in the minified CSS
const minCss = fs.readFileSync('css/style.min.css', 'utf8');
const customOptionsIdx = minCss.indexOf('custom-options');
if (customOptionsIdx > -1) {
    fs.writeFileSync('custom-options-css.txt', minCss.substring(customOptionsIdx, customOptionsIdx + 400), 'utf8');
    console.log('Found custom-options in style.min.css');
} else {
    console.log('custom-options NOT in style.min.css!');
}
