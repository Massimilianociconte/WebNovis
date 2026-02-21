const fs = require('fs');
const path = require('path');

// Check the script loading order in come-lavoriamo.html
const content = fs.readFileSync(path.join(__dirname, '../come-lavoriamo.html'), 'utf8');

console.log('=== Script loading order in come-lavoriamo.html ===');
const scriptMatches = content.match(/<script[^>]*>.*?<\/script>/gs) || [];
scriptMatches.forEach((script, i) => {
    const isInline = !script.includes('src=');
    const srcMatch = script.match(/src="([^"]+)"/);
    const src = srcMatch ? srcMatch[1] : 'inline';
    const deferMatch = script.includes('defer');
    console.log(`${i + 1}. ${src} ${deferMatch ? '(defer)' : ''} ${isInline ? '(inline)' : ''}`);
});

// Check for any missing elements that main.js might reference
console.log('\n=== Checking for specific elements main.js might need ===');
const checks = [
    { name: 'nav element', selector: '<nav' },
    { name: 'nav-toggle button', selector: 'class="nav-toggle"' },
    { name: 'navMenu', selector: 'id="navMenu"' },
    { name: 'searchWrapper', selector: 'id="searchWrapper"' },
    { name: 'searchInput', selector: 'id="searchInput"' },
    { name: 'searchMobileToggle', selector: 'id="searchMobileToggle"' },
    { name: 'searchClear', selector: 'id="searchClear"' },
    { name: 'cookie banner', selector: 'cookie-banner' },
    { name: 'cookie accept', selector: 'cookie-accept' },
    { name: 'cookie reject', selector: 'cookie-reject' }
];

for (const check of checks) {
    const found = content.includes(check.selector);
    console.log(`${check.name}: ${found ? '✓' : '✗'}`);
}

// Let's also check if there are any duplicate IDs or malformed elements
console.log('\n=== Checking for potential issues ===');
const navToggleCount = (content.match(/class="nav-toggle"/g) || []).length;
const navMenuCount = (content.match(/id="navMenu"/g) || []).length;
console.log('nav-toggle occurrences:', navToggleCount);
console.log('navMenu occurrences:', navMenuCount);

// Check for any malformed HTML around the nav
const navStart = content.indexOf('<nav');
const navEnd = content.indexOf('</nav>', navStart);
if (navStart !== -1 && navEnd !== -1) {
    const navSection = content.substring(navStart, navEnd + 7);
    console.log('\n=== Nav section excerpt ===');
    console.log(navSection.substring(0, 300) + '...');
}
