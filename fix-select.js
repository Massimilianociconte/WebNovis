const fs = require('fs');
let c = fs.readFileSync('preventivo.html', 'utf8');

// The file has both native select and custom select.
// I need to remove the native <select> tags while keeping the custom divs.

// Pattern to match the entire select element with all its content
// This is the service select
const serviceSelectPattern = /<select[^>]*name="service"[^>]*>.*?<\/select>/;
const timelineSelectPattern = /<select[^>]*name="timeline"[^>]*>.*?<\/select>/;

// Check if patterns exist
const hasServiceSelect = serviceSelectPattern.test(c);
const hasTimelineSelect = timelineSelectPattern.test(c);

console.log('Has service select:', hasServiceSelect);
console.log('Has timeline select:', hasTimelineSelect);

// Remove them if they exist
if (hasServiceSelect) {
    c = c.replace(serviceSelectPattern, '');
    console.log('Removed service select');
}

if (hasTimelineSelect) {
    c = c.replace(timelineSelectPattern, '');
    console.log('Removed timeline select');
}

// Check if custom select exists
const hasCustom = c.includes('custom-select-wrapper');
console.log('Has custom select:', hasCustom);

if (hasCustom && (!hasServiceSelect || !hasTimelineSelect)) {
    console.log('Native selects removed, custom select preserved');
    fs.writeFileSync('preventivo.html', c, 'utf8');
    console.log('File updated successfully');
} else if (!hasCustom) {
    console.log('ERROR: Custom select not found!');
} else {
    console.log('WARNING: Could not remove all native selects');
}
