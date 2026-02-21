const fs = require('fs');
let c = fs.readFileSync('preventivo.html', 'utf8');

// Find position of service select
let idx1 = c.indexOf('<select name="service"');
console.log('Service select at:', idx1);

// Find position of timeline select  
let idx2 = c.indexOf('<select name="timeline"');
console.log('Timeline select at:', idx2);

// Find position of custom-select-wrapper
let idx3 = c.indexOf('custom-select-wrapper');
console.log('custom-select-wrapper at:', idx3);

// If native select exists, show it
if (idx1 > -1) {
    console.log('\n--- NATIVE SELECT FOUND ---');
    console.log(c.substring(idx1, idx1 + 300));
}

// If custom exists, show it
if (idx3 > -1) {
    console.log('\n--- CUSTOM SELECT FOUND ---');
    console.log(c.substring(idx3, idx3 + 300));
}

// If native exists but custom doesn't, we have a problem
if (idx1 > -1 && idx3 === -1) {
    console.log('\nERROR: Native select exists but custom not found!');
}

// If both exist, that's also weird
if (idx1 > -1 && idx3 > -1) {
    console.log('\nWARNING: Both native and custom found!');
}
