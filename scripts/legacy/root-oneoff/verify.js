const fs = require('fs');
let c = fs.readFileSync('preventivo.html', 'utf8');

// Find and extract context around both patterns
const idxSelect = c.indexOf('<select name="service"');
const idxCustom = c.indexOf('custom-select-wrapper');

console.log('<select name="service"> at:', idxSelect);
console.log('custom-select-wrapper at:', idxCustom);

if (idxSelect > -1 && idxCustom > -1) {
    console.log('\nBoth exist! The native select was NOT removed properly.');
    console.log('\n--- Native select snippet ---');
    console.log(c.substring(idxSelect, idxSelect + 200));
    console.log('\n--- Custom select snippet ---');
    console.log(c.substring(idxCustom, idxCustom + 200));
} else if (idxSelect > -1) {
    console.log('\nOnly native select exists - custom not added');
} else if (idxCustom > -1) {
    console.log('\nOnly custom select exists - this is correct!');
} else {
    console.log('\nNeither found - something is wrong');
}
